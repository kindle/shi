import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-triangle',
  templateUrl: './card-triangle.component.html',
  styleUrls: ['./card-triangle.component.scss'],
})
export class CardTriangleComponent implements AfterViewInit, OnDestroy {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  constructor(
    public data : DataService,
    public ui: UiService,
    private zone: NgZone,
    private host: ElementRef<HTMLElement>,
  ) { }

  // simplex-noise.js (MIT license, Jonas Wagner) - adapted to TypeScript
  private SimplexNoise = class SimplexNoise {
    private p: Uint8Array;
    private perm: Uint8Array;
    private permMod12: Uint8Array;

    private static readonly F2 = 0.5 * (Math.sqrt(3) - 1);
    private static readonly G2 = (3 - Math.sqrt(3)) / 6;
    private static readonly F3 = 1 / 3;
    private static readonly G3 = 1 / 6;
    private static readonly F4 = (Math.sqrt(5) - 1) / 4;
    private static readonly G4 = (5 - Math.sqrt(5)) / 20;

    private static readonly grad3 = new Float32Array([
      1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
      1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
      0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
    ]);

    private static readonly grad4 = new Float32Array([
      0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
      0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
      1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
      -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
      1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
      -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
      1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
      -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0,
    ]);

    constructor(randomFn?: () => number) {
      const random = randomFn ?? Math.random;
      this.p = new Uint8Array(256);
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);

      for (let i = 0; i < 256; i++) {
        this.p[i] = Math.floor(256 * random());
      }
      for (let i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    noise2D(xin: number, yin: number): number {
      const grad3 = SimplexNoise.grad3;
      const perm = this.perm;
      const permMod12 = this.permMod12;

      let n0 = 0, n1 = 0, n2 = 0;
      const s = (xin + yin) * SimplexNoise.F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * SimplexNoise.G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;

      let i1: number;
      let j1: number;
      if (x0 > y0) {
        i1 = 1; j1 = 0;
      } else {
        i1 = 0; j1 = 1;
      }

      const x1 = x0 - i1 + SimplexNoise.G2;
      const y1 = y0 - j1 + SimplexNoise.G2;
      const x2 = x0 - 1 + 2 * SimplexNoise.G2;
      const y2 = y0 - 1 + 2 * SimplexNoise.G2;

      const ii = i & 255;
      const jj = j & 255;

      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        const gi0 = 3 * permMod12[ii + perm[jj]];
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
      }

      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        const gi1 = 3 * permMod12[ii + i1 + perm[jj + j1]];
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }

      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        const gi2 = 3 * permMod12[ii + 1 + perm[jj + 1]];
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }

      return 70 * (n0 + n1 + n2);
    }
  };

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private simplex: any;

  private w = 0;
  private h = 0;
  private cx = 0;
  private cy = 0;
  private count = 0;
  private xoff = 0;
  private xinc = 0.05;
  private yoff = 0;
  private yinc = 0.003;
  private goff = 0;
  private ginc = 0.003;
  private y = 0;
  private length = 0;
  private amp = 40;

  private resizeHandler?: () => void;
  private animationFrameId?: number;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.setupWaveCanvas();
    });
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private setupWaveCanvas(): void {
    const native = this.host.nativeElement;
    const canvas = native.querySelector('canvas');
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.simplex = new this.SimplexNoise();

    this.resizeHandler = this.resetWave.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    this.resetWave();
    this.loopWave();
  }

  private resetWave(): void {
    if (!this.canvas) {
      return;
    }

    const bounds = this.canvas.getBoundingClientRect();
    this.w = bounds.width || window.innerWidth;
    this.h = bounds.height || window.innerHeight;

    this.cx = this.w / 2;
    this.cy = this.h / 2;

    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.count = Math.floor(this.w / 50);
    this.xoff = 0;
    this.xinc = 0.05;
    this.yoff = 0;
    this.yinc = 0.003;
    this.goff = 0;
    this.ginc = 0.003;
    this.y = this.h * 0.66;
    this.length = this.w + 10;
    this.amp = 40;
  }

  private drawWave(): void {
    if (!this.ctx || !this.simplex) {
      return;
    }

    const ctx = this.ctx;
    const simplex = this.simplex;

    ctx.beginPath();
    const sway = simplex.noise2D(this.goff, 0) * this.amp;

    this.xoff = 0;
    for (let i = 0; i <= this.count; i++) {
      this.xoff += this.xinc;
      const x = this.cx - this.length / 2 + (this.length / this.count) * i;
      const y = this.y + simplex.noise2D(this.xoff, this.yoff) * this.amp + sway;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineTo(this.w, this.h);
    ctx.lineTo(0, this.h);
    ctx.closePath();
    ctx.fillStyle = 'hsla(210, 90%, 50%, 0.2)';
    ctx.fill();
  }

  private loopWave(): void {
    this.animationFrameId = requestAnimationFrame(() => this.loopWave());

    if (!this.ctx) {
      return;
    }

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawWave();
    this.drawWave();
    this.drawWave();
    this.drawWave();

    this.yoff += this.yinc;
    this.goff += this.ginc;
  }

}
