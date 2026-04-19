import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import * as L from 'leaflet';

interface LifeItem {
  year: number;
  reign?: string;
  old?: number;
  location?: string;
  latlng?: string;
  event?: string;
  poem?: PoemItem;
}

interface PoemItem {
  id: string;
  author: string;
  title: string;
  sample: string;
  note: string;
}

interface AuthorInfo {
  name?: string;
  life?: LifeItem[];
}

@Component({
  selector: 'app-poet-footprint',
  templateUrl: './poet-footprint.component.html',
  styleUrls: ['./poet-footprint.component.scss'],
})
export class PoetFootprintComponent implements AfterViewInit, OnDestroy {
  @Input() author = '';
  @Output() footprintClicked = new EventEmitter<void>();
  @ViewChild('footprintMap', { static: false }) footprintMapRef?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;
  private routeLine?: L.LayerGroup;

  constructor(private data: DataService) {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  onFootprintClick() {
    this.footprintClicked.emit();
  }

  private initMap() {
    if (this.map || !this.footprintMapRef?.nativeElement) {
      return;
    }

    this.map = L.map(this.footprintMapRef.nativeElement, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      dragging: false,
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
    this.map.setView([35, 104], 6);

    setTimeout(() => {
      this.map?.invalidateSize();
      this.loadAndRenderAuthorFootprints();
    }, 0);
  }

  private destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.markerLayer = undefined;
    this.routeLine = undefined;
  }

  private loadAndRenderAuthorFootprints() {
    if (!this.author) {
      return;
    }

    const foundAuthor = this.data.authorJsonData.find((p: any) => p.name === this.author);
    if (!foundAuthor) {
      return;
    }

    const life = Array.isArray(foundAuthor?.life) ? foundAuthor.life : [];
    const lifeItems: LifeItem[] = life
      .map((item: any) => ({
        year: Number(item?.year),
        reign: item?.reign,
        old: item?.old,
        location: item?.location,
        latlng: item?.latlng,
        event: item?.event,
        poem: item?.poem,
      }))
      .filter((item: LifeItem) => !Number.isNaN(item.year) && !!item.latlng)
      .sort((a: LifeItem, b: LifeItem) => a.year - b.year);

    if (lifeItems.length === 0) {
      return;
    }

    // Show all locations
    const visiblePoints = lifeItems
      .map((item: LifeItem) => ({
        item,
        point: this.parseLatlng(item.latlng || ''),
      }))
      .filter((entry): entry is { item: LifeItem; point: { lat: number; lng: number } } => !!entry.point);

    if (visiblePoints.length === 0) {
      return;
    }

    this.renderAllMarkers(visiblePoints);
    this.renderRouteLine(visiblePoints);
    
    // Ensure map is sized correctly before fitting bounds
    setTimeout(() => {
      this.map?.invalidateSize();
      this.fitMapToVisiblePoints(visiblePoints);
    }, 50);
  }

  private renderAllMarkers(
    visiblePoints: Array<{ item: LifeItem; point: { lat: number; lng: number } }>,
  ) {
    if (!this.map) {
      return;
    }

    if (this.markerLayer) {
      this.map.removeLayer(this.markerLayer);
    }

    this.markerLayer = L.layerGroup();

    visiblePoints.forEach(({ item, point }) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 6,
        color: '#1d4ed8',
        fillColor: '#1d4ed8',
        fillOpacity: 0.8,
        weight: 2,
      });

      marker.bindPopup(this.buildLifePopup(item), {
        maxWidth: 280,
        autoPan: true,
      });

      marker.addTo(this.markerLayer as L.LayerGroup);
    });

    this.markerLayer.addTo(this.map);
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

    const segments = this.buildRouteSegments(visiblePoints);
    segments.forEach((segment) => {
      L.polyline(segment, {
        color: '#4f9bff',
        weight: 2,
        opacity: 0.8,
        dashArray: '6 8',
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

    return this.createQuadraticCurvePoints(start, controlPoint, end, 12);
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

    if (visiblePoints.length === 1) {
      const [{ point }] = visiblePoints;
      this.map.setView([point.lat, point.lng], 8, { animate: true });
      return;
    }

    const bounds = L.latLngBounds(
      visiblePoints.map(({ point }) => [point.lat, point.lng] as L.LatLngTuple),
    );

    this.map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 8,
      animate: true,
    });
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
      <div style="line-height:1.4;font-size:13px;min-width:200px;">
        <div style="font-weight:700;margin-bottom:3px;">${location}</div>
        <div><b>年份</b>: ${yearLabel}${age}</div>
        <div><b>年号</b>: ${reign}</div>
        <div><b>事件</b>: ${event}</div>
      </div>
    `;
  }

  private formatDisplayYear(yearValue: number): string {
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
}
