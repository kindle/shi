import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';
import { DataService } from 'src/app/services/data.service';
import * as L from 'leaflet';

interface LifeItem {
  year: number;
  reign?: string;
  old?: number;
  location?: string;
  latlng?: string;
  event?: string;
}

interface AuthorInfo {
  name?: string;
  life?: LifeItem[];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements AfterViewInit, OnDestroy {

  private readonly visitedMarkerColor = '#1d4ed8';
  private readonly currentMarkerColor = '#dc2626';
  private readonly defaultZoomLevel = 5;
  private allowZoomLevelChange = false;

  @ViewChild('lifeMap', { static: false }) lifeMapRef?: ElementRef<HTMLDivElement>;

  author = '';
  authorInfo?: AuthorInfo;
  lifeItems: LifeItem[] = [];

  selectedYear = 0;
  selectedLife?: LifeItem;
  minYear = 0;
  maxYear = 0;
  private currentLifeIndex = -1;

  private map?: L.Map;
  private routeLine?: L.LayerGroup;
  private markerLayer?: L.LayerGroup;
  private currentLeafletMarker?: L.CircleMarker;
  private lifeLoadAttempts = 0;
  private lifeLoadTimer?: ReturnType<typeof setTimeout>;

  readonly formatRangePin = (value: number): string => {
    if (Number.isNaN(value)) {
      return '';
    }

    return `${Math.trunc(value)}`;
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    public data: DataService,
    public ui: UiService,
  ) {}

  ionViewWillEnter() {
    this.author = this.activatedRoute.snapshot.queryParamMap.get('author')
      || this.activatedRoute.snapshot.paramMap.get('author')
      || '';

    this.lifeLoadAttempts = 0;
    this.tryLoadAuthorLife();
  }

  ngAfterViewInit() {
    this.initMap();
    this.updateMapForCurrentYear();
  }

  ngOnDestroy() {
    if (this.lifeLoadTimer) {
      clearTimeout(this.lifeLoadTimer);
      this.lifeLoadTimer = undefined;
    }
    this.destroyMap();
  }

  private tryLoadAuthorLife() {
    const loaded = this.loadAuthorLife();
    if (loaded) {
      return;
    }

    if (this.lifeLoadAttempts >= 20) {
      return;
    }

    this.lifeLoadAttempts += 1;
    this.lifeLoadTimer = setTimeout(() => {
      this.tryLoadAuthorLife();
    }, 200);
  }

  private loadAuthorLife(): boolean {
    const foundAuthor = this.data.authorJsonData.find((p: any) => p.name === this.author);
    this.authorInfo = foundAuthor;

    const life = Array.isArray(foundAuthor?.life) ? foundAuthor.life : [];
    this.lifeItems = life
      .map((item: any) => ({
        year: Number(item?.year),
        reign: item?.reign,
        old: item?.old,
        location: item?.location,
        latlng: item?.latlng,
        event: item?.event,
      }))
      .filter((item: LifeItem) => !Number.isNaN(item.year) && !!item.latlng)
      .sort((a: LifeItem, b: LifeItem) => a.year - b.year);

    if (this.lifeItems.length > 0) {
      this.minYear = this.lifeItems[0].year;
      this.maxYear = this.lifeItems[this.lifeItems.length - 1].year;
      this.currentLifeIndex = 0;
      this.selectedYear = this.minYear;
      this.selectedLife = this.lifeItems[0];
    } else {
      this.minYear = 0;
      this.maxYear = 0;
      this.currentLifeIndex = -1;
      this.selectedYear = 0;
      this.selectedLife = undefined;
    }

    this.updateMapForCurrentYear();
    return this.lifeItems.length > 0;
  }

  private initMap() {
    this.initLeafletMap();
  }

  private initLeafletMap() {
    if (this.map || !this.lifeMapRef?.nativeElement) {
      return;
    }

    this.map = L.map(this.lifeMapRef.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    });

    const localTileLayer = L.tileLayer('/assets/map/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    });

    localTileLayer.on('tileerror', (event: L.TileErrorEvent) => {
      const tile = event.tile as HTMLImageElement;
      const coords = event.coords;

      if (!tile || !coords || tile.dataset['remoteFallback'] === '1') {
        return;
      }

      tile.dataset['remoteFallback'] = '1';
      tile.src = `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
    });

    localTileLayer.addTo(this.map);

    this.map.setView([35, 104], this.defaultZoomLevel);

    setTimeout(() => {
      this.map?.invalidateSize();
      this.updateMapForCurrentYear();
    }, 0);
  }

  private destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.routeLine = undefined;
    this.markerLayer = undefined;
    this.currentLeafletMarker = undefined;
  }

  onYearChanged(event: CustomEvent) {
    const yearValue = Number(event.detail?.value);
    if (Number.isNaN(yearValue)) {
      return;
    }

    this.selectedYear = yearValue;
    this.currentLifeIndex = this.getNearestLifeIndexByYear(yearValue);
    this.updateMapForCurrentYear();
  }

  goToPreviousYear() {
    if (this.currentLifeIndex <= 0) {
      return;
    }

    this.currentLifeIndex -= 1;
    this.selectedYear = this.lifeItems[this.currentLifeIndex].year;
    this.updateMapForCurrentYear();
  }

  goToNextYear() {
    if (this.currentLifeIndex < 0 || this.currentLifeIndex >= this.lifeItems.length - 1) {
      return;
    }

    this.currentLifeIndex += 1;
    this.selectedYear = this.lifeItems[this.currentLifeIndex].year;
    this.updateMapForCurrentYear();
  }

  private updateMapForCurrentYear() {
    if (!this.map || this.lifeItems.length === 0) {
      return;
    }

    let currentLife: LifeItem | undefined;
    if (this.currentLifeIndex >= 0 && this.currentLifeIndex < this.lifeItems.length) {
      currentLife = this.lifeItems[this.currentLifeIndex];
    } else {
      this.currentLifeIndex = this.getNearestLifeIndexByYear(this.selectedYear);
      currentLife = this.currentLifeIndex >= 0 ? this.lifeItems[this.currentLifeIndex] : undefined;
    }

    if (!currentLife) {
      return;
    }

    this.selectedLife = currentLife;
    this.selectedYear = currentLife.year;

    const visibleLifeItems = this.getVisibleLifeItems(currentLife.year);
    const visiblePoints = visibleLifeItems
      .map((item: LifeItem) => ({
        item,
        point: this.parseLatlng(item.latlng || ''),
      }))
      .filter((entry): entry is { item: LifeItem; point: { lat: number; lng: number } } => !!entry.point);

    if (visiblePoints.length === 0) {
      return;
    }

    this.renderVisibleMarkers(visiblePoints, currentLife);
    this.renderRouteLine(visiblePoints);
    this.fitMapToVisiblePoints(visiblePoints);
  }

  private getVisibleLifeItems(currentYear: number): LifeItem[] {
    return this.lifeItems.filter((item: LifeItem) => item.year <= currentYear);
  }

  private renderVisibleMarkers(
    visiblePoints: Array<{ item: LifeItem; point: { lat: number; lng: number } }>,
    currentLife: LifeItem,
  ) {
    if (!this.map) {
      return;
    }

    if (this.markerLayer) {
      this.map.removeLayer(this.markerLayer);
    }

    this.markerLayer = L.layerGroup();
    const currentEntry = visiblePoints.find(({ item }) => item === currentLife);

    visiblePoints.forEach(({ item, point }) => {
      const isCurrent = item === currentLife;
      if (isCurrent) {
        return;
      }

      const marker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
        color: this.visitedMarkerColor,
        fillColor: this.visitedMarkerColor,
        fillOpacity: 0.9,
            weight: 2,
          });

      marker.bindPopup(this.buildLifePopup(item), {
        maxWidth: 320,
        autoPan: true,
      });

      marker.addTo(this.markerLayer as L.LayerGroup);

    });

    this.markerLayer.addTo(this.map);
    this.renderCurrentLeafletMarker(currentEntry);
  }

  private renderCurrentLeafletMarker(
    currentEntry?: { item: LifeItem; point: { lat: number; lng: number } },
  ) {
    if (!this.map || !currentEntry) {
      return;
    }

    if (!this.currentLeafletMarker) {
      this.currentLeafletMarker = L.circleMarker([currentEntry.point.lat, currentEntry.point.lng], {
        radius: 8,
        color: this.currentMarkerColor,
        fillColor: this.currentMarkerColor,
        fillOpacity: 0.95,
        weight: 3,
      }).addTo(this.map);
    } else {
      this.currentLeafletMarker.setLatLng([currentEntry.point.lat, currentEntry.point.lng]);
    }

    this.currentLeafletMarker
      .bindPopup(this.buildLifePopup(currentEntry.item), {
        maxWidth: 320,
        autoPan: true,
      })
      .openPopup();
  }

  private renderRouteLine(visiblePoints: Array<{ item: LifeItem; point: { lat: number; lng: number } }>) {
    if (!this.map) {
      return;
    }

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = undefined;
    }

    if (visiblePoints.length < 2) {
      return;
    }

    this.routeLine = L.layerGroup();

    this.buildRouteSegments(visiblePoints).forEach((segment) => {
      L.polyline(segment, {
        color: '#4f9bff',
        weight: 3,
        opacity: 0.9,
        dashArray: '8 10',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(this.routeLine as L.LayerGroup);
    });

    this.routeLine.addTo(this.map);
  }

  private buildRouteSegments(
    visiblePoints: Array<{ item: LifeItem; point: { lat: number; lng: number } }>,
  ): L.LatLngTuple[][] {
    const segments: L.LatLngTuple[][] = [];
    const pairCounts = new Map<string, number>();

    for (let index = 1; index < visiblePoints.length; index += 1) {
      const start = visiblePoints[index - 1].point;
      const end = visiblePoints[index].point;

      if (this.isSamePoint(start, end)) {
        continue;
      }

      const pairKey = this.getPairKey(start, end);
      const occurrence = (pairCounts.get(pairKey) || 0) + 1;
      pairCounts.set(pairKey, occurrence);

      segments.push(this.buildSegmentPath(start, end, occurrence));
    }

    return segments;
  }

  private buildSegmentPath(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    occurrence: number,
  ): L.LatLngTuple[] {
    if (occurrence === 1) {
      return [
        [start.lat, start.lng],
        [end.lat, end.lng],
      ];
    }

    const startTuple: L.LatLngTuple = [start.lat, start.lng];
    const endTuple: L.LatLngTuple = [end.lat, end.lng];
    const midpointLat = (start.lat + end.lat) / 2;
    const midpointLng = (start.lng + end.lng) / 2;
    const deltaLat = end.lat - start.lat;
    const deltaLng = end.lng - start.lng;
    const distance = Math.sqrt((deltaLat * deltaLat) + (deltaLng * deltaLng));

    if (!distance) {
      return [startTuple, endTuple];
    }

    const normalizedDirection = this.comparePoints(start, end) <= 0 ? 1 : -1;
    const alternatingSide = occurrence % 2 === 0 ? 1 : -1;
    const offsetStrength = Math.ceil((occurrence - 1) / 2);
    const curvature = Math.min(distance * (0.12 + (offsetStrength * 0.08)), distance * 0.35);
    const offsetLat = (-deltaLng / distance) * curvature * alternatingSide * normalizedDirection;
    const offsetLng = (deltaLat / distance) * curvature * alternatingSide * normalizedDirection;
    const controlPoint = {
      lat: midpointLat + offsetLat,
      lng: midpointLng + offsetLng,
    };

    return this.createQuadraticCurvePoints(start, controlPoint, end, 16);
  }

  private createQuadraticCurvePoints(
    start: { lat: number; lng: number },
    control: { lat: number; lng: number },
    end: { lat: number; lng: number },
    steps: number,
  ): L.LatLngTuple[] {
    const points: L.LatLngTuple[] = [];

    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const inverseT = 1 - t;
      const lat = (inverseT * inverseT * start.lat)
        + (2 * inverseT * t * control.lat)
        + (t * t * end.lat);
      const lng = (inverseT * inverseT * start.lng)
        + (2 * inverseT * t * control.lng)
        + (t * t * end.lng);

      points.push([lat, lng]);
    }

    return points;
  }

  private getPairKey(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
  ): string {
    return this.comparePoints(start, end) <= 0
      ? `${start.lat},${start.lng}|${end.lat},${end.lng}`
      : `${end.lat},${end.lng}|${start.lat},${start.lng}`;
  }

  private comparePoints(
    first: { lat: number; lng: number },
    second: { lat: number; lng: number },
  ): number {
    if (first.lat !== second.lat) {
      return first.lat - second.lat;
    }

    return first.lng - second.lng;
  }

  private isSamePoint(
    first: { lat: number; lng: number },
    second: { lat: number; lng: number },
  ): boolean {
    return first.lat === second.lat && first.lng === second.lng;
  }

  private fitMapToVisiblePoints(visiblePoints: Array<{ item: LifeItem; point: { lat: number; lng: number } }>) {
    if (!this.map) {
      return;
    }

    this.map.once('moveend', () => {
      console.log('[MapLeaflet] Current zoom level:', this.map?.getZoom());
    });

    if (!this.allowZoomLevelChange) {
      if (visiblePoints.length === 1) {
        const [{ point }] = visiblePoints;
        this.map.setView([point.lat, point.lng], this.defaultZoomLevel, { animate: true });
        return;
      }

      const bounds = L.latLngBounds(
        visiblePoints.map(({ point }) => [point.lat, point.lng] as L.LatLngTuple),
      );
      const center = bounds.getCenter();

      this.map.setView([center.lat, center.lng], this.defaultZoomLevel, { animate: true });
      return;
    }

    if (visiblePoints.length === 1) {
      const [{ point }] = visiblePoints;
      this.map.setView([point.lat, point.lng], 7, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(
      visiblePoints.map(({ point }) => [point.lat, point.lng] as L.LatLngTuple),
    );

    this.map.fitBounds(bounds, {
      paddingTopLeft: [24, 150],
      paddingBottomRight: [24, 220],
      maxZoom: 7,
      animate: true,
    });
  }

  private getNearestLifeByYear(year: number): LifeItem | undefined {
    return this.lifeItems.reduce((nearest: LifeItem | undefined, item: LifeItem) => {
      if (!nearest) {
        return item;
      }

      const currentDelta = Math.abs(item.year - year);
      const nearestDelta = Math.abs(nearest.year - year);

      if (currentDelta < nearestDelta) {
        return item;
      }

      if (currentDelta === nearestDelta && item.year < nearest.year) {
        return item;
      }

      return nearest;
    }, undefined);
  }

  private parseLatlng(latlng: string): { lat: number; lng: number } | undefined {
    const [lngRaw, latRaw] = latlng.split(',');
    const lng = Number((lngRaw || '').trim());
    const lat = Number((latRaw || '').trim());

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return undefined;
    }

    return { lat, lng };
  }

  private buildLifePopup(item: LifeItem): string {
    const age = item.old != null ? `（${item.old}岁）` : '';
    const reign = item.reign || '';
    const location = item.location || '';
    const event = item.event || '';
    const yearLabel = this.formatDisplayYear(item.year);

    return `
      <div style="line-height:1.45;min-width:220px;">
        <div style="font-weight:700;margin-bottom:4px;">${location}</div>
        <div><b>年份</b>: ${yearLabel}${age}</div>
        <div><b>年号</b>: ${reign}</div>
        <div><b>事件</b>: ${event}</div>
      </div>
    `;
  }

  formatDisplayYear(yearValue: number): string {
    if (Number.isNaN(yearValue)) {
      return '';
    }

    const yearText = `${yearValue}`;
    const [yearPart, monthPart] = yearText.split('.');

    if (!monthPart) {
      return `公元${yearPart}年`;
    }

    const month = Number(monthPart);
    if (Number.isNaN(month) || month <= 0) {
      return `公元${yearPart}年`;
    }

    return `公元${yearPart}年${month}月`;
  }

  get selectedYearLabel(): string {
    if (this.selectedLife) {
      return this.formatDisplayYear(this.selectedLife.year);
    }
    return this.formatDisplayYear(this.selectedYear);
  }

  get authorAvatarUrl(): string {
    const authorName = (this.author || '').trim();
    if (!authorName) {
      return 'assets/img/default.jpg';
    }

    return `https://reddah.blob.core.windows.net/msjjpoet/${authorName}.jpeg`;
  }

  get selectedAgeLabel(): string {
    if (this.selectedLife?.old != null && !Number.isNaN(Number(this.selectedLife.old))) {
      return `${this.selectedLife.old}岁`;
    }

    return '年龄未知';
  }

  get canGoPrevious(): boolean {
    return this.currentLifeIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentLifeIndex >= 0 && this.currentLifeIndex < this.lifeItems.length - 1;
  }

  get hasLifeData(): boolean {
    return this.lifeItems.length > 0;
  }

  private getNearestLifeIndexByYear(year: number): number {
    if (this.lifeItems.length === 0) {
      return -1;
    }

    let nearestIndex = 0;
    let nearestDelta = Math.abs(this.lifeItems[0].year - year);

    for (let index = 1; index < this.lifeItems.length; index += 1) {
      const item = this.lifeItems[index];
      const delta = Math.abs(item.year - year);

      if (delta < nearestDelta) {
        nearestIndex = index;
        nearestDelta = delta;
        continue;
      }

      if (delta === nearestDelta && item.year < this.lifeItems[nearestIndex].year) {
        nearestIndex = index;
      }
    }

    return nearestIndex;
  }

  openExternalMap() {
    if (this.selectedLife?.latlng) {
      const point = this.parseLatlng(this.selectedLife.latlng);
      if (point) {
        window.open(`https://maps.google.com/?q=${point.lat},${point.lng}`, '_blank');
        return;
      }
    }

    const locationText = this.author || 'China';
    window.open(`https://maps.google.com/?q=${encodeURIComponent(locationText)}`, '_blank');
  }
}
