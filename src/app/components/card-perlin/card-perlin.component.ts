import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

type Rgb = {
  r: number;
  g: number;
  b: number;
};

class SimplexNoise3D {
  private readonly grad3: number[][] = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];

  private readonly p: number[] = new Array(256);
  private readonly perm: number[] = new Array(512);

  constructor(seed: number) {
    const random = this.createSeededRandom(seed);

    for (let i = 0; i < 256; i += 1) {
      this.p[i] = i;
    }

    for (let i = 255; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const temp = this.p[i];
      this.p[i] = this.p[j];
      this.p[j] = temp;
    }

    for (let i = 0; i < 512; i += 1) {
      this.perm[i] = this.p[i & 255];
    }
  }

  simplex3(xin: number, yin: number, zin: number): number {
    const f3 = 1 / 3;
    const g3 = 1 / 6;

    const s = (xin + yin + zin) * f3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);

    const t = (i + j + k) * g3;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const z0 = zin - (k - t);

    let i1 = 0;
    let j1 = 0;
    let k1 = 0;
    let i2 = 0;
    let j2 = 0;
    let k2 = 0;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else if (y0 < z0) {
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else if (x0 < z0) {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    }

    const x1 = x0 - i1 + g3;
    const y1 = y0 - j1 + g3;
    const z1 = z0 - k1 + g3;

    const x2 = x0 - i2 + 2 * g3;
    const y2 = y0 - j2 + 2 * g3;
    const z2 = z0 - k2 + 2 * g3;

    const x3 = x0 - 1 + 3 * g3;
    const y3 = y0 - 1 + 3 * g3;
    const z3 = z0 - 1 + 3 * g3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
    const gi1 =
      this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
    const gi2 =
      this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
    const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;

    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let n3 = 0;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      t3 *= t3;
      n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
    }

    return 32 * (n0 + n1 + n2 + n3);
  }

  private dot(gradient: number[], x: number, y: number, z: number): number {
    return gradient[0] * x + gradient[1] * y + gradient[2] * z;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}

@Component({
  selector: 'app-card-perlin',
  templateUrl: './card-perlin.component.html',
  styleUrls: ['./card-perlin.component.scss'],
})
export class CardPerlinComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  @ViewChild('display', { static: true })
  private displayRef!: ElementRef<HTMLDivElement>;

  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  isFull = false;

  private context: CanvasRenderingContext2D | null = null;
  private imageData: ImageData | null = null;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private size = { x: 1, y: 1 };
  private res = 1;
  private w = 1;
  private h = 1;
  private calcw = 1;
  private calch = 1;

  private readonly startTime = Date.now();
  private readonly noise = new SimplexNoise3D(8);

  constructor(
    public data : DataService,
    public ui: UiService,
  ) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d');
    if (!this.context) {
      return;
    }

    this.setSize();
    this.updateData();
    this.observeResize();
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener('resize', this.onWindowResize);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  toggleExpand(): void {
    this.isFull = !this.isFull;

    window.setTimeout(() => {
      this.setSize();
      this.updateData();
    }, 700);
  }

  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', this.onWindowResize);
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.setSize();
      this.updateData();
    });

    this.resizeObserver.observe(this.displayRef.nativeElement);
  }

  private readonly onWindowResize = (): void => {
    this.setSize();
    this.updateData();
  };

  private setSize(): void {
    const display = this.displayRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    const width = Math.max(1, Math.floor(display.clientWidth));
    const height = Math.max(1, Math.floor(display.clientHeight));

    this.size = { x: width, y: height };
    this.res = 1;
    this.w = Math.ceil(this.size.x / this.res);
    this.h = Math.ceil(this.size.y / this.res);
    this.calch = this.h * 1.5;
    this.calcw = this.w * 1.5;

    canvas.width = this.size.x;
    canvas.height = this.size.y;
  }

  private updateData(): void {
    if (!this.context) {
      return;
    }

    this.imageData = this.context.createImageData(this.size.x, this.size.y);
  }

  private draw = (): void => {
    if (!this.context || !this.imageData) {
      return;
    }

    const currentTime = (Date.now() - this.startTime) / 10000;
    const color: Rgb = { r: 0, g: 0, b: 0 };

    for (let y = 0; y < this.size.y; y += 1) {
      for (let x = 0; x < this.size.x; x += 1) {
        const index = (x + y * this.size.x) * 4;
        const r = this.noise.simplex3(
          (currentTime + x) / this.calcw,
          currentTime + y / this.calch,
          currentTime,
        );

        if (r >= -2 && r < -0.6) {
          color.r = 234;
          color.g = 242;
          color.b = 227;
        } else if (r >= -0.6 && r < -0.2) {
          color.r = 97;
          color.g = 232;
          color.b = 225;
        } else if (r >= -0.2 && r < 0.2) {
          color.r = 242;
          color.g = 87;
          color.b = 87;
        } else if (r >= 0.2 && r < 0.6) {
          color.r = 242;
          color.g = 232;
          color.b = 99;
        } else if (r >= 0.6 && r <= 2) {
          color.r = 242;
          color.g = 205;
          color.b = 96;
        } else {
          color.r = 127;
          color.g = 127;
          color.b = 127;
        }

        this.imageData.data[index] = color.r;
        this.imageData.data[index + 1] = color.g;
        this.imageData.data[index + 2] = color.b;
        this.imageData.data[index + 3] = 255;
      }
    }

    this.context.putImageData(this.imageData, 0, 0);
    this.animationFrameId = window.requestAnimationFrame(this.draw);
  };
}