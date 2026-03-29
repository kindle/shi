import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-car',
  templateUrl: './card-car.component.html',
  styleUrls: ['./card-car.component.scss'],
})
export class CardCarComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvasHost', { static: true })
  private canvasHost?: ElementRef<HTMLDivElement>;

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  private readonly starCount = 1000;
  private readonly speedFactor = 2;
  private animationFrameId = 0;
  private resizeObserver?: ResizeObserver;
  private readonly handleWindowResize = (): void => {
    this.resize();
  };
  private hostWidth = 0;
  private hostHeight = 0;
  private center: [number, number] = [0, 0];

  private trailCanvas?: HTMLCanvasElement;
  private glowCanvas?: HTMLCanvasElement;
  private trailContext?: CanvasRenderingContext2D;
  private glowContext?: CanvasRenderingContext2D;

  private positions = new Float32Array(0);
  private velocities = new Float32Array(0);
  private lifeSpans = new Float32Array(0);
  private hues = new Float32Array(0);

  constructor(
    public data : DataService,
    public ui: UiService,
    private zone: NgZone,
  ) { }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.setupCanvas();
      this.observeResize();
      window.addEventListener('resize', this.handleWindowResize);
      this.resize();
      this.createStars();
      this.draw();
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.handleWindowResize);

    if (this.glowCanvas?.parentElement) {
      this.glowCanvas.parentElement.removeChild(this.glowCanvas);
    }

    this.trailCanvas = undefined;
    this.glowCanvas = undefined;
    this.trailContext = undefined;
    this.glowContext = undefined;
  }

  private setupCanvas(): void {
    const host = this.canvasHost?.nativeElement;

    if (!host) {
      return;
    }

    this.trailCanvas = document.createElement('canvas');
    this.glowCanvas = document.createElement('canvas');
    this.trailContext = this.trailCanvas.getContext('2d') ?? undefined;
    this.glowContext = this.glowCanvas.getContext('2d') ?? undefined;

    if (!this.trailContext || !this.glowContext) {
      return;
    }

    this.glowCanvas.className = 'starfield-layer';
    host.appendChild(this.glowCanvas);
  }

  private observeResize(): void {
    const host = this.canvasHost?.nativeElement;

    if (!host || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    this.resizeObserver.observe(host);
  }

  private resize(): void {
    const host = this.canvasHost?.nativeElement;

    if (!host || !this.trailCanvas || !this.glowCanvas) {
      return;
    }

    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    if (width === this.hostWidth && height === this.hostHeight) {
      return;
    }

    this.hostWidth = width;
    this.hostHeight = height;

    this.trailCanvas.width = width;
    this.trailCanvas.height = height;
    this.glowCanvas.width = width;
    this.glowCanvas.height = height;

    this.center = [width * 0.5, height * 0.5];

    if (this.positions.length > 0) {
      this.createStars();
    }
  }

  private createStars(): void {
    this.positions = new Float32Array(this.starCount * 2);
    this.velocities = new Float32Array(this.starCount * 2);
    this.hues = new Float32Array(this.starCount);
    this.lifeSpans = new Float32Array(this.starCount * 2);

    for (let index = 0; index < this.starCount * 2; index += 2) {
      this.resetStar(index);
    }
  }

  private resetStar(index: number): void {
    const yIndex = index + 1;
    const radius = this.rand(Math.max(60, Math.min(this.hostWidth, this.hostHeight) * 0.18));
    const rotation = this.rand(Math.PI * 2);
    const cosRotation = Math.cos(rotation);
    const sinRotation = Math.sin(rotation);
    const x = this.center[0] + cosRotation * radius;
    const y = this.center[1] + sinRotation * radius;
    const velocity = this.randIn(0.15, 1.1) * this.speedFactor;
    const hue = this.rand(360);
    const timeToLive = this.randIn(20, 100);

    this.positions[index] = x;
    this.positions[yIndex] = y;
    this.velocities[index] = velocity * cosRotation;
    this.velocities[yIndex] = velocity * sinRotation;
    this.hues[index / 2] = hue;
    this.lifeSpans[index] = 0;
    this.lifeSpans[yIndex] = timeToLive;
  }

  private drawStar(index: number): void {
    if (!this.trailContext) {
      return;
    }

    const yIndex = index + 1;
    const x = this.positions[index];
    const y = this.positions[yIndex];
    let velocityX = this.velocities[index];
    let velocityY = this.velocities[yIndex];
    const targetX = x + velocityX;
    const targetY = y + velocityY;
    const hue = this.hues[index / 2];
    const life = this.lifeSpans[index];
    const timeToLive = this.lifeSpans[yIndex];
    const lineWidth = life / timeToLive;

    const acceleration = 1 + (1.15 - 1) * this.speedFactor;
    velocityX *= acceleration;
    velocityY *= acceleration;

    this.trailContext.save();
    this.trailContext.lineWidth = Math.max(0.5, lineWidth);
    this.trailContext.lineCap = 'round';
    this.trailContext.strokeStyle = `hsla(${hue}, 70%, 78%, 1)`;
    this.trailContext.beginPath();
    this.trailContext.moveTo(x, y);
    this.trailContext.lineTo(targetX, targetY);
    this.trailContext.stroke();
    this.trailContext.restore();

    this.positions[index] = targetX;
    this.positions[yIndex] = targetY;
    this.velocities[index] = velocityX;
    this.velocities[yIndex] = velocityY;
    this.lifeSpans[index] = life + 1;

    if (this.isOutOfBounds(targetX, targetY)) {
      this.resetStar(index);
    }
  }

  private draw = (): void => {
    if (!this.trailContext || !this.glowContext || !this.trailCanvas || !this.glowCanvas) {
      return;
    }

    this.trailContext.clearRect(0, 0, this.hostWidth, this.hostHeight);
    this.glowContext.clearRect(0, 0, this.hostWidth, this.hostHeight);

    this.glowContext.fillStyle = 'rgba(3, 8, 18, 0.42)';
    this.glowContext.fillRect(0, 0, this.hostWidth, this.hostHeight);

    for (let index = 0; index < this.starCount * 2; index += 2) {
      this.drawStar(index);
    }

    this.glowContext.save();
    this.glowContext.filter = 'blur(10px)';
    this.glowContext.drawImage(this.trailCanvas, 0, 0);
    this.glowContext.restore();

    this.glowContext.save();
    this.glowContext.globalCompositeOperation = 'lighter';
    this.glowContext.drawImage(this.trailCanvas, 0, 0);
    this.glowContext.restore();

    this.animationFrameId = window.requestAnimationFrame(this.draw);
  };

  private isOutOfBounds(x: number, y: number): boolean {
    return x < 0 || x > this.hostWidth || y < 0 || y > this.hostHeight;
  }

  private rand(max: number): number {
    return Math.random() * max;
  }

  private randIn(min: number, max: number): number {
    return this.rand(max - min) + min;
  }
}