import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { DailyForecast, HourlyForecast, WeatherKit } from '@sprintwerk/capacitor-weatherkit';
import { UiService } from 'src/app/services/ui.service';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';

type RainLevel = 'light' | 'moderate' | 'heavy' | 'storm' | 'extreme';
type WeatherDataSource = 'apple' | 'fallback-api' | 'local-sim';

interface RainPoint {
  hour: number;
  intensity: number;
  level: RainLevel;
}

interface RainGridPoint {
  lat: number;
  lng: number;
  values: number[];
}

interface OpenMeteoHourly {
  precipitation?: number[];
}

interface OpenMeteoForecastResponse {
  hourly?: OpenMeteoHourly;
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.page.html',
  styleUrls: ['./weather.page.scss'],
})
export class WeatherPage implements AfterViewInit, OnDestroy {
  private readonly defaultLatitude = 39.9042;
  private readonly defaultLongitude = 116.4074;
  private readonly defaultZoomLevel = 6;
  private readonly minZoomLevel = 2;
  private readonly maxZoomLevel = 6;

  @ViewChild('weatherMap', { static: false }) weatherMapRef?: ElementRef<HTMLDivElement>;

  latitude = this.defaultLatitude;
  longitude = this.defaultLongitude;
  zoomLevel = this.defaultZoomLevel;
  locationLabel = 'Beijing';

  private map?: L.Map;
  private marker?: L.CircleMarker;
  private rainLayer?: L.GridLayer;
  private readonly isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  private readonly weatherApiBaseUrl = environment.weatherApiBaseUrl || 'https://api.open-meteo.com';
  private readonly timelineRequestHours = 48;
  private readonly timelinePastHours = 1;
  private rainGridPoints: RainGridPoint[] = [];
  private rainDataCenterLat = this.defaultLatitude;
  private rainDataCenterLng = this.defaultLongitude;
  private lastFetchedZoom = this.defaultZoomLevel;
  private centerSeries: number[] = [];
  private isLoadingRainForecast = false;
  private hasLoadedRainForecast = false;

  selectedHourOffset = 0;
  readonly minHourOffset = -1;
  readonly maxHourOffset = 48;
  rainTimeline: RainPoint[] = [];
  quickTimeline: RainPoint[] = [];
  dataSource: WeatherDataSource = 'local-sim';

  readonly rainLegend = [
    { label: '小雨', color: '#84cc16' },
    { label: '中雨', color: '#166534' },
    { label: '大雨', color: '#facc15' },
    { label: '暴雨', color: '#ef4444' },
    { label: '特大暴雨', color: '#7f1d1d' },
  ];

  get dataSourceLabel(): string {
    if (this.dataSource === 'apple') {
      return 'Apple WeatherKit';
    }

    if (this.dataSource === 'fallback-api') {
      return 'Fallback API';
    }

    return 'Local Simulation';
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private http: HttpClient,
    public ui: UiService,
  ) {}

  ionViewWillEnter() {
    if (this.ui.isIos) {
      this.ui.hideStatusBar();
    }
    this.resolveLocation();
    void this.loadRealRainForecast();
    this.updateMap();
  }

  ionViewWillLeave() {
    if (this.ui.isIos) {
      this.ui.showStatusBar();
    }
  }

  ngAfterViewInit() {
    this.initMap();
    void this.loadRealRainForecast();
    this.updateMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  goBack() {
    this.location.back();
  }

  private resolveLocation() {
    let latInput = '';
    let lngInput = '';
    let zoomInput = '';
    let locationInput = '';

    if (typeof window !== 'undefined') {
      const browserUrl = new URL(window.location.href);
      const pathParts = browserUrl.pathname.split('/').filter(Boolean);
      const weatherPathIndex = pathParts.lastIndexOf('weather');

      if (weatherPathIndex >= 0 && pathParts.length >= weatherPathIndex + 3) {
        latInput = pathParts[weatherPathIndex + 1] || '';
        lngInput = pathParts[weatherPathIndex + 2] || '';
        zoomInput = pathParts[weatherPathIndex + 3] || '';
      }

      latInput = browserUrl.searchParams.get('lat')
        || browserUrl.searchParams.get('latitude')
        || latInput;
      lngInput = browserUrl.searchParams.get('lng')
        || browserUrl.searchParams.get('longitude')
        || lngInput;
      zoomInput = browserUrl.searchParams.get('zoom')
        || browserUrl.searchParams.get('z')
        || zoomInput;
      locationInput = browserUrl.searchParams.get('location') || '';
    }

    if (!latInput || !lngInput) {
      const queryParams = this.activatedRoute.snapshot.queryParamMap;
      const routeParams = this.activatedRoute.snapshot.paramMap;

      latInput = latInput
        || queryParams.get('lat')
        || queryParams.get('latitude')
        || routeParams.get('lat')
        || '';
      lngInput = lngInput
        || queryParams.get('lng')
        || queryParams.get('longitude')
        || routeParams.get('lng')
        || '';
      zoomInput = zoomInput
        || queryParams.get('zoom')
        || queryParams.get('z')
        || routeParams.get('zoom')
        || '';
      locationInput = locationInput || queryParams.get('location') || '';
    }

    const nextLat = this.parseNumberInput(latInput);
    const nextLng = this.parseNumberInput(lngInput);
    const nextZoom = this.parseNumberInput(zoomInput);

    this.zoomLevel = nextZoom != null
      ? this.clampZoom(nextZoom)
      : this.defaultZoomLevel;

    if (nextLat != null && nextLng != null) {
      this.latitude = nextLat;
      this.longitude = nextLng;
      this.locationLabel = locationInput || `${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`;
      return;
    }

    this.latitude = this.defaultLatitude;
    this.longitude = this.defaultLongitude;
    this.zoomLevel = this.defaultZoomLevel;
    this.locationLabel = 'Beijing';
  }

  private initMap() {
    if (this.map || !this.weatherMapRef?.nativeElement) {
      return;
    }

    this.map = L.map(this.weatherMapRef.nativeElement, {
      zoomControl: false,
      attributionControl: true,
      minZoom: this.minZoomLevel,
      maxZoom: this.maxZoomLevel,
    });

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    const localTileLayer = L.tileLayer('/assets/map/{z}/{x}/{y}.png', {
      maxZoom: this.maxZoomLevel,
      attribution: '&copy; OpenStreetMap contributors',
    });

    localTileLayer.addTo(this.map);
    this.initRainLayer();
    this.map.on('moveend zoomend', () => {
      void this.handleViewportChanged();
    });

    setTimeout(() => {
      this.map?.invalidateSize();
      this.updateMap();
    }, 0);
  }

  private updateMap() {
    if (!this.map) {
      return;
    }

    this.map.setView([this.latitude, this.longitude], this.zoomLevel, { animate: true });

    this.updateRainLayer();

    if (!this.marker) {
      this.marker = L.circleMarker([this.latitude, this.longitude], {
        radius: 8,
        color: '#dc2626',
        fillColor: '#dc2626',
        fillOpacity: 0.95,
        weight: 3,
      }).addTo(this.map);
    } else {
      this.marker.setLatLng([this.latitude, this.longitude]);
    }

    this.marker
      .bindPopup(`${this.locationLabel}<br/>Lat ${this.latitude.toFixed(4)}, Lng ${this.longitude.toFixed(4)}`)
      .openPopup();
  }

  onTimelineInput(event: Event) {
    const customEvent = event as CustomEvent<{ value: number }>;
    const rawValue = customEvent?.detail?.value;
    if (!Number.isFinite(rawValue)) {
      return;
    }

    const next = Math.round(rawValue);
    this.selectedHourOffset = Math.min(this.maxHourOffset, Math.max(this.minHourOffset, next));
    this.updateRainLayer();
  }

  get selectedHourLabel(): string {
    if (this.selectedHourOffset < 0) {
      return `${this.selectedHourOffset}h`;
    }

    if (this.selectedHourOffset > 0) {
      return `+${this.selectedHourOffset}h`;
    }

    return 'Now';
  }

  trackRainPoint(_index: number, point: RainPoint): number {
    return point.hour;
  }

  private buildTimeline() {
    const points: RainPoint[] = [];

    for (let hour = this.minHourOffset; hour <= this.maxHourOffset; hour += 1) {
      const intensity = this.getIntensityForHour(hour);
      points.push({
        hour,
        intensity,
        level: this.resolveRainLevel(intensity),
      });
    }

    this.rainTimeline = points;
    this.quickTimeline = points.filter((point) => point.hour >= -1 && point.hour <= 4);
  }

  private initRainLayer() {
    if (!this.map || this.rainLayer) {
      return;
    }

    const gridLayer = L.gridLayer({
      pane: 'overlayPane',
      tileSize: 256,
      updateWhenIdle: false,
      opacity: 0.78,
      zIndex: 350,
    });

    (gridLayer as L.GridLayer & { createTile: (coords: L.Coords) => HTMLElement }).createTile = (coords: L.Coords) => {
      const canvas = L.DomUtil.create('canvas', 'rain-tile') as HTMLCanvasElement;
      const tileSize = gridLayer.getTileSize();

      canvas.width = tileSize.x;
      canvas.height = tileSize.y;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return canvas;
      }

      this.drawRainTile(ctx, coords, tileSize.x, tileSize.y);
      return canvas;
    };

    this.rainLayer = gridLayer;
    this.rainLayer.addTo(this.map);
  }

  private updateRainLayer() {
    if (!this.map) {
      return;
    }

    if (!this.rainLayer) {
      this.initRainLayer();
      return;
    }

    this.rainLayer.redraw();
  }

  private drawRainTile(ctx: CanvasRenderingContext2D, coords: L.Coords, width: number, height: number) {
    const zoom = this.map?.getZoom() ?? this.zoomLevel;
    const step = this.getTileSamplingStep(zoom);

    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const worldX = (coords.x * width + px) / (256 * (2 ** coords.z));
        const worldY = (coords.y * height + py) / (256 * (2 ** coords.z));

        const lng = worldX * 360 - 180;
        const n = Math.PI - 2 * Math.PI * worldY;
        const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

        const intensity = this.estimateRealGridIntensity(lng, lat, this.selectedHourOffset);
        const color = this.resolveRainColor(intensity);

        if (!color) {
          continue;
        }

        ctx.fillStyle = color;
        ctx.fillRect(px, py, step, step);
      }
    }
  }

  private async loadRealRainForecast(force = false, centerLat = this.latitude, centerLng = this.longitude) {
    if (this.isLoadingRainForecast) {
      return;
    }

    if (this.hasLoadedRainForecast && !force) {
      return;
    }

    this.rainDataCenterLat = centerLat;
    this.rainDataCenterLng = centerLng;
    this.isLoadingRainForecast = true;

    try {
      if (this.isNativeIOS) {
        await this.fetchWeatherKitGridForecast(centerLat, centerLng);
        this.dataSource = 'apple';
      } else {
        await this.fetchOpenMeteoGridForecast(centerLat, centerLng);
        this.dataSource = 'fallback-api';
      }
      this.hasLoadedRainForecast = true;
      this.lastFetchedZoom = this.zoomLevel;
    } catch (_error) {
      try {
        await this.fetchOpenMeteoGridForecast(centerLat, centerLng);
        this.dataSource = 'fallback-api';
        this.hasLoadedRainForecast = true;
        this.lastFetchedZoom = this.zoomLevel;
      } catch (_fallbackError) {
        this.rainGridPoints = [];
        this.centerSeries = [];
        this.dataSource = 'local-sim';
      }
    } finally {
      this.buildTimeline();
      this.updateRainLayer();
      this.isLoadingRainForecast = false;
    }
  }

  private async fetchWeatherKitGridForecast(centerLat: number, centerLng: number) {
    const points = this.buildRainGridPoints(centerLat, centerLng);

    const gridSeries = await Promise.all(points.map(async (point) => {
      const values = await this.fetchPointPrecipitationByWeatherKit(point.lat, point.lng);
      return {
        lat: point.lat,
        lng: point.lng,
        values,
      };
    }));

    this.rainGridPoints = gridSeries;
    const centerPoint = gridSeries[Math.floor(gridSeries.length / 2)];
    this.centerSeries = centerPoint?.values || [];
  }

  private async fetchOpenMeteoGridForecast(centerLat: number, centerLng: number) {
    const points = this.buildRainGridPoints(centerLat, centerLng);

    const gridSeries = await Promise.all(points.map(async (point) => {
      const values = await this.fetchPointPrecipitation(point.lat, point.lng);
      return {
        lat: point.lat,
        lng: point.lng,
        values,
      };
    }));

    this.rainGridPoints = gridSeries;
    const centerPoint = gridSeries[Math.floor(gridSeries.length / 2)];
    this.centerSeries = centerPoint?.values || [];
  }

  private buildRainGridPoints(centerLat: number, centerLng: number): Array<{ lat: number; lng: number }> {
    const halfCount = 2;
    const latStep = 0.35;
    const lngStep = 0.45;
    const points: Array<{ lat: number; lng: number }> = [];

    for (let y = -halfCount; y <= halfCount; y += 1) {
      for (let x = -halfCount; x <= halfCount; x += 1) {
        points.push({
          lat: centerLat + y * latStep,
          lng: centerLng + x * lngStep,
        });
      }
    }

    return points;
  }

  private async fetchPointPrecipitationByWeatherKit(lat: number, lng: number): Promise<number[]> {
    const roundedLat = Number(lat.toFixed(4));
    const roundedLng = Number(lng.toFixed(4));
    const hourly = await WeatherKit.getHourlyForecast({ latitude: roundedLat, longitude: roundedLng });
    const hourlyForecast = Array.isArray(hourly?.forecast) ? hourly.forecast : [];

    if (hourlyForecast.length) {
      const hourlySeries = hourlyForecast.map((item) => this.extractHourlyForecastRainMm(item));
      return this.normalizeSeries(hourlySeries);
    }

    const [daily, current] = await Promise.all([
      WeatherKit.getDailyForecast({ latitude: roundedLat, longitude: roundedLng }),
      WeatherKit.getCurrentWeather({ latitude: roundedLat, longitude: roundedLng }),
    ]);

    const forecast = Array.isArray(daily?.forecast) ? daily.forecast : [];
    const currentRainMm = this.pluginIntensityToMmHour(current?.precipitationIntensity || 0);
    const series = this.expandDailyForecastToHourlySeries(forecast, currentRainMm);
    return this.normalizeSeries(series);
  }

  private extractHourlyForecastRainMm(hourly: HourlyForecast): number {
    const byTypeTotal = hourly?.precipitationAmountByType?.total ?? NaN;
    if (Number.isFinite(byTypeTotal) && byTypeTotal > 0) {
      return byTypeTotal;
    }

    const intensityValue = Number.isFinite(hourly?.precipitationIntensity)
      ? Number(hourly.precipitationIntensity)
      : 0;
    const intensityMm = this.pluginIntensityToMmHour(intensityValue);

    const chance = Number.isFinite(hourly?.precipitationChance)
      ? Math.max(0, Math.min(1, Number(hourly.precipitationChance)))
      : 0;

    return Math.max(intensityMm, chance * 1.6);
  }

  private expandDailyForecastToHourlySeries(forecast: DailyForecast[], currentRainMm: number): number[] {
    const targetLength = this.maxHourOffset - this.minHourOffset + 1;
    const series: number[] = [];
    const now = new Date();
    const currentDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    for (let hour = this.minHourOffset; hour <= this.maxHourOffset; hour += 1) {
      const timestamp = now.getTime() + (hour * 3600 * 1000);
      const date = new Date(timestamp);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayIndex = Math.floor((dayStart - currentDayStart) / (24 * 3600 * 1000));
      const mappedDayIndex = Math.max(0, Math.min(forecast.length - 1, dayIndex));
      const dayForecast = forecast[mappedDayIndex];
      const hourOfDay = date.getHours();

      const estimated = this.estimateRainMmPerHour(dayForecast, hourOfDay, currentRainMm);
      series.push(estimated);
    }

    return series.slice(0, targetLength);
  }

  private estimateRainMmPerHour(dayForecast: DailyForecast | undefined, hourOfDay: number, currentRainMm: number): number {
    if (!dayForecast) {
      return currentRainMm;
    }

    const chance = Math.max(0, Math.min(1, dayForecast.precipitationChance || 0));
    const dailyTotal = Math.max(0, dayForecast.precipitationAmountByType?.total || 0);

    const isDaytime = hourOfDay >= 6 && hourOfDay < 18;
    const dayPartTotal = isDaytime
      ? dayForecast.daytimeForecast?.precipitationAmountByType?.total
      : dayForecast.overnightForecast?.precipitationAmountByType?.total;
    const dayPartChance = isDaytime
      ? dayForecast.daytimeForecast?.precipitationChance
      : dayForecast.overnightForecast?.precipitationChance;

    const sourceTotal = Number.isFinite(dayPartTotal) ? Number(dayPartTotal) : dailyTotal;
    const sourceChance = Number.isFinite(dayPartChance) ? Number(dayPartChance) : chance;
    const bucketHours = Number.isFinite(dayPartTotal) ? 12 : 24;

    let mmPerHour = Math.max(0, sourceTotal / bucketHours);
    mmPerHour *= 0.35 + (Math.max(0, Math.min(1, sourceChance)) * 0.65);

    if (mmPerHour <= 0 && sourceChance > 0.75) {
      return 0.2;
    }

    return mmPerHour;
  }

  private pluginIntensityToMmHour(value: number): number {
    const intensity = Math.max(0, value || 0);

    // Plugin describes m/s; some providers expose already-normalized values.
    if (intensity <= 5) {
      return intensity;
    }

    return Math.min(120, intensity * 0.4);
  }

  private async fetchPointPrecipitation(lat: number, lng: number): Promise<number[]> {
    const roundedLat = Number(lat.toFixed(4));
    const roundedLng = Number(lng.toFixed(4));
    const query = [
      `latitude=${encodeURIComponent(String(roundedLat))}`,
      `longitude=${encodeURIComponent(String(roundedLng))}`,
      'hourly=precipitation',
      `past_hours=${this.timelinePastHours}`,
      `forecast_hours=${this.timelineRequestHours}`,
      'timezone=auto',
    ].join('&');

    const url = `${this.weatherApiBaseUrl}/v1/forecast?${query}`;
    const response = await this.http.get<OpenMeteoForecastResponse>(url).toPromise();
    const precipitation = response?.hourly?.precipitation || [];

    if (!precipitation.length) {
      return this.createFallbackSeries();
    }

    return this.normalizeSeries(precipitation);
  }

  private normalizeSeries(values: number[]): number[] {
    const targetLength = this.maxHourOffset - this.minHourOffset + 1;
    const normalized = values.slice(0, targetLength);

    while (normalized.length < targetLength) {
      const fill = normalized.length ? normalized[normalized.length - 1] : 0;
      normalized.push(fill);
    }

    return normalized;
  }

  private createFallbackSeries(): number[] {
    const fallback: number[] = [];
    for (let hour = this.minHourOffset; hour <= this.maxHourOffset; hour += 1) {
      fallback.push(this.sampleRainIntensity(this.longitude, this.latitude, hour));
    }
    return fallback;
  }

  private getIntensityForHour(hourOffset: number): number {
    if (!this.centerSeries.length) {
      return this.sampleRainIntensity(this.longitude, this.latitude, hourOffset);
    }

    const index = Math.max(0, Math.min(this.centerSeries.length - 1, hourOffset - this.minHourOffset));
    const mm = this.centerSeries[index] || 0;
    return this.precipitationMmToIntensity(mm);
  }

  private estimateRealGridIntensity(lng: number, lat: number, hourOffset: number): number {
    if (!this.rainGridPoints.length) {
      return this.sampleRainIntensity(lng, lat, hourOffset);
    }

    const index = Math.max(0, Math.min(this.centerSeries.length - 1, hourOffset - this.minHourOffset));
    let weighted = 0;
    let weightTotal = 0;

    const zoom = this.map?.getZoom() ?? this.zoomLevel;
    const minDistance = Math.max(0.03, 0.18 - (zoom * 0.02));

    for (const point of this.rainGridPoints) {
      const dx = lng - point.lng;
      const dy = lat - point.lat;
      const distance = Math.sqrt((dx * dx) + (dy * dy));
      const weight = 1 / Math.max(distance, minDistance);
      const mm = point.values[index] || 0;
      weighted += this.precipitationMmToIntensity(mm) * weight;
      weightTotal += weight;
    }

    if (!weightTotal) {
      return this.sampleRainIntensity(lng, lat, hourOffset);
    }

    return weighted / weightTotal;
  }

  private precipitationMmToIntensity(mm: number): number {
    // Convert mm/h to a 0-110 visual scale used by the existing legend thresholds.
    const value = Math.max(0, mm);
    if (value <= 0.2) {
      return value * 20;
    }

    if (value <= 2) {
      return 4 + (value - 0.2) * 12;
    }

    if (value <= 8) {
      return 25 + (value - 2) * 7;
    }

    if (value <= 20) {
      return 67 + (value - 8) * 2;
    }

    return Math.min(110, 91 + (value - 20) * 1.5);
  }

  private sampleRainIntensity(lng: number, lat: number, hourOffset: number): number {
    const x = (lng + 180) / 360;
    const y = (lat + 90) / 180;
    const t = hourOffset / 48;

    const primaryBand = 0.5 + 0.5 * Math.sin((x * 14.7 + y * 8.3) * Math.PI + t * 9.2);
    const secondaryBand = 0.5 + 0.5 * Math.cos((x * 20.3 - y * 11.8) * Math.PI - t * 7.4);
    const cellNoise = this.hashNoise(x * 183.3 + t * 5.1, y * 241.7 - t * 3.8);
    const stormNoise = this.hashNoise(x * 322.1 - t * 8.2, y * 127.4 + t * 6.7);
    const locationBoost = Math.max(0, 1 - this.distanceFactor(lng, lat, this.rainDataCenterLng, this.rainDataCenterLat));

    const composite = (primaryBand * 0.45)
      + (secondaryBand * 0.25)
      + (cellNoise * 0.2)
      + (stormNoise * 0.1);

    const intensity = (composite * 95) + (locationBoost * 28);
    return Math.max(0, Math.min(110, intensity));
  }

  private hashNoise(x: number, y: number): number {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }

  private distanceFactor(lngA: number, latA: number, lngB: number, latB: number): number {
    const dx = (lngA - lngB) / 16;
    const dy = (latA - latB) / 10;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private async handleViewportChanged() {
    if (!this.map) {
      return;
    }

    const center = this.map.getCenter();
    const nextZoom = this.map.getZoom();

    this.zoomLevel = this.clampZoom(nextZoom);
    this.latitude = center.lat;
    this.longitude = center.lng;
    this.locationLabel = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;

    const moved = this.distanceFactor(center.lng, center.lat, this.rainDataCenterLng, this.rainDataCenterLat);
    const zoomChanged = Math.abs(this.zoomLevel - this.lastFetchedZoom) >= 1;
    const shouldRefetch = !this.hasLoadedRainForecast || moved > 0.12 || zoomChanged;

    if (shouldRefetch) {
      await this.loadRealRainForecast(true, center.lat, center.lng);
      return;
    }

    this.updateRainLayer();
  }

  private getTileSamplingStep(zoom: number): number {
    return Math.max(2, 8 - Math.round(zoom));
  }

  private resolveRainColor(intensity: number): string {
    if (intensity < 4) {
      return '';
    }

    if (intensity < 20) {
      return 'rgba(132, 204, 22, 0.48)';
    }

    if (intensity < 45) {
      return 'rgba(22, 101, 52, 0.58)';
    }

    if (intensity < 70) {
      return 'rgba(250, 204, 21, 0.62)';
    }

    if (intensity < 90) {
      return 'rgba(239, 68, 68, 0.68)';
    }

    return 'rgba(127, 29, 29, 0.72)';
  }

  private resolveRainLevel(intensity: number): RainLevel {
    if (intensity < 20) {
      return 'light';
    }

    if (intensity < 45) {
      return 'moderate';
    }

    if (intensity < 70) {
      return 'heavy';
    }

    if (intensity < 90) {
      return 'storm';
    }

    return 'extreme';
  }

  private clampZoom(value: number): number {
    if (value < this.minZoomLevel) {
      return this.minZoomLevel;
    }

    if (value > this.maxZoomLevel) {
      return this.maxZoomLevel;
    }

    return value;
  }

  private parseNumberInput(value: string): number | undefined {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
