import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

interface WavesOptions {
  resize: boolean;
  rotation: number;
  waves: number;
  width: number;
  hue: [number, number];
  amplitude: number;
  background: boolean;
  preload: boolean;
  speed: [number, number];
  debug: boolean;
  fps: boolean;
}

interface WaveLineData {
  angle: [number, number, number, number];
  color: string;
}

class FpsStats {
  private data: number[] = [];
  private last?: number;

  private time(): number {
    return (performance || Date).now();
  }

  log(): number {
    if (!this.last) {
      this.last = this.time();
      return 0;
    }

    const now = this.time();
    const delta = now - this.last;
    this.last = now;

    this.data.push(delta);
    if (this.data.length > 10) {
      this.data.shift();
    }

    return delta;
  }

  fps(): number {
    if (!this.data.length) {
      return 0;
    }
    const total = this.data.reduce((sum, item) => sum + item, 0);
    return Math.round(1000 / (total / this.data.length));
  }
}

class WaveLine {
  angle: [number, number, number, number];
  color: string;

  constructor(wave: Wave, color: string) {
    const angle = wave.angle;
    const speed = wave.speed;

    this.angle = [
      Math.sin((angle[0] += speed[0])),
      Math.sin((angle[1] += speed[1])),
      Math.sin((angle[2] += speed[2])),
      Math.sin((angle[3] += speed[3])),
    ];

    this.color = color;
  }
}

class Wave {
  private static readonly PI2 = 2 * Math.PI;

  readonly lines: WaveLineData[] = [];
  readonly angle: [number, number, number, number];
  readonly speed: [number, number, number, number];

  constructor(private readonly waves: WavesEngine) {
    const speed = waves.options.speed;

    this.angle = [
      WavesEngine.rnd(Wave.PI2),
      WavesEngine.rnd(Wave.PI2),
      WavesEngine.rnd(Wave.PI2),
      WavesEngine.rnd(Wave.PI2),
    ];

    this.speed = [
      WavesEngine.rnd(speed[0], speed[1]) * WavesEngine.rndSign(),
      WavesEngine.rnd(speed[0], speed[1]) * WavesEngine.rndSign(),
      WavesEngine.rnd(speed[0], speed[1]) * WavesEngine.rndSign(),
      WavesEngine.rnd(speed[0], speed[1]) * WavesEngine.rndSign(),
    ];
  }

  update(): void {
    this.lines.push(new WaveLine(this, this.waves.color));
    if (this.lines.length > this.waves.options.width) {
      this.lines.shift();
    }
  }

  draw(): void {
    const ctx = this.waves.ctx;
    const radius = this.waves.radius;
    const radius3 = radius / 3;
    const x = this.waves.centerX;
    const y = this.waves.centerY;
    const rotation = WavesEngine.dtr(this.waves.options.rotation);
    const amplitude = this.waves.options.amplitude;
    const debug = this.waves.options.debug;

    this.lines.forEach((line, index) => {
      if (debug && index > 0) {
        return;
      }

      const angle = line.angle;

      const x1 = x - radius * Math.cos(angle[0] * amplitude + rotation);
      const y1 = y - radius * Math.sin(angle[0] * amplitude + rotation);
      const x2 = x + radius * Math.cos(angle[3] * amplitude + rotation);
      const y2 = y + radius * Math.sin(angle[3] * amplitude + rotation);
      const cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2);
      const cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2);
      const cpx2 = x + radius3 * Math.cos(angle[2] * amplitude * 2);
      const cpy2 = y + radius3 * Math.sin(angle[2] * amplitude * 2);

      ctx.strokeStyle = debug ? '#fff' : line.color;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      ctx.stroke();

      if (debug) {
        ctx.strokeStyle = '#fff';
        ctx.globalAlpha = 0.3;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cpx1, cpy1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(cpx2, cpy2);
        ctx.stroke();

        ctx.globalAlpha = 1;
      }
    });
  }
}

class WavesEngine {
  static readonly PI = Math.PI;
  static readonly PI2 = 2 * Math.PI;

  static dtr(deg: number): number {
    return deg * WavesEngine.PI / 180;
  }

  static rnd(a: number, b?: number): number {
    if (b === undefined) {
      return Math.random() * a;
    }
    return a + Math.random() * (b - a);
  }

  static rndSign(): 1 | -1 {
    return Math.random() > 0.5 ? 1 : -1;
  }

  options: WavesOptions;
  waves: Wave[] = [];
  color = 'rgba(128,128,128,0.1)';

  width = 0;
  height = 0;
  radius = 0;
  centerX = 0;
  centerY = 0;

  private hue = 0;
  private hueFw = true;
  private scale = 1;
  private stats = new FpsStats();
  private rafId?: number;
  private resizeListener?: () => void;

  constructor(private readonly holder: HTMLElement, options?: Partial<WavesOptions>) {
    this.options = {
      resize: false,
      rotation: 45,
      waves: 5,
      width: 100,
      hue: [11, 14],
      amplitude: 0.5,
      background: true,
      preload: true,
      speed: [0.004, 0.008],
      debug: false,
      fps: false,
      ...(options || {}),
    };

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context is not available');
    }
    this.ctx = ctx;

    this.holder.appendChild(this.canvas);
    this.hue = this.options.hue[0];

    this.resize();
    this.init(this.options.preload);

    if (this.options.resize) {
      this.resizeListener = () => this.resize();
      window.addEventListener('resize', this.resizeListener, false);
    }
  }

  readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  readonly ctx: CanvasRenderingContext2D;

  private init(preload: boolean): void {
    for (let i = 0; i < this.options.waves; i++) {
      this.waves[i] = new Wave(this);
    }

    if (preload) {
      this.preload();
    }
  }

  private preload(): void {
    for (let i = 0; i < this.options.waves; i++) {
      this.updateColor();
      for (let j = 0; j < this.options.width; j++) {
        this.waves[i].update();
      }
    }
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private background(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(1, this.color);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private updateColor(): void {
    this.hue += this.hueFw ? 0.01 : -0.01;

    if (this.hue > this.options.hue[1] && this.hueFw) {
      this.hue = this.options.hue[1];
      this.hueFw = false;
    } else if (this.hue < this.options.hue[0] && !this.hueFw) {
      this.hue = this.options.hue[0];
      this.hueFw = true;
    }

    const a = Math.floor(127 * Math.sin(0.3 * this.hue + 0) + 128);
    const b = Math.floor(127 * Math.sin(0.3 * this.hue + 2) + 128);
    const c = Math.floor(127 * Math.sin(0.3 * this.hue + 4) + 128);

    this.color = `rgba(${a},${b},${c}, 0.1)`;
  }

  private render(): void {
    this.updateColor();
    this.clear();

    if (this.options.debug) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#f00';
      this.ctx.arc(this.centerX, this.centerY, this.radius, 0, WavesEngine.PI2);
      this.ctx.stroke();
    }

    if (this.options.background) {
      this.background();
    }

    this.waves.forEach((wave) => {
      wave.update();
      wave.draw();
    });
  }

  animate(): void {
    this.render();

    if (this.options.fps) {
      this.stats.log();
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(`${this.stats.fps()} FPS`, 10, 22);
    }

    this.rafId = window.requestAnimationFrame(() => this.animate());
  }

  resize(): void {
    const width = this.holder.offsetWidth;
    const height = this.holder.offsetHeight;
    this.scale = window.devicePixelRatio || 1;
    this.width = width * this.scale;
    this.height = height * this.scale;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.radius = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  destroy(): void {
    if (this.rafId !== undefined) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener, false);
      this.resizeListener = undefined;
    }

    if (this.canvas.parentElement === this.holder) {
      this.holder.removeChild(this.canvas);
    }
  }
}

@Component({
  selector: 'app-card-silk',
  templateUrl: './card-silk.component.html',
  styleUrls: ['./card-silk.component.scss'],
})
export class CardSilkComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  @ViewChild('holder', { static: true }) holderRef?: ElementRef<HTMLElement>;

  private waves?: WavesEngine;

  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (!this.holderRef?.nativeElement) {
      return;
    }

    this.waves = new WavesEngine(this.holderRef.nativeElement, {
      fps: false,
      waves: 3,
      width: 200,
      resize: true,
    });

    this.waves.animate();
  }

  ngOnDestroy(): void {
    this.waves?.destroy();
  }
}
