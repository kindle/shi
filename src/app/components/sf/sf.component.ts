import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

interface SfDictEntry {
  id: number;
  key: string;
  author: string;
}

interface SfGlyph {
  char: string;
  author?: string;
  imageSrc?: string;
}

interface SfBackgroundOption {
  id: string;
  label: string;
  image?: string;
}

const CHARS_PER_COLUMN = 5;
const HF_MIN_SLOTS = 18;

@Component({
  selector: 'app-sf',
  templateUrl: './sf.component.html',
  styleUrls: ['./sf.component.scss'],
})
export class SfComponent implements OnChanges, OnInit {
  @Input() content?: string;
  @Input() name?: string;
  @Input() bg?: number | string;
  @Input() tpl?: string;

  columns: SfGlyph[][] = [];
  backgroundOptions: SfBackgroundOption[] = [
    { id: 'back1', label: '', image: 'assets/shufa/bg/bg1.jpg' },
    { id: 'back2', label: '', image: 'assets/shufa/bg/bg2.jpg' },
    { id: 'back3', label: '', image: 'assets/shufa/bg/bg6.jpg' },
    { id: 'back4', label: '', image: 'assets/shufa/bg/bg9.jpg' },
    { id: 'back5', label: '', image: 'assets/shufa/bg/bg5.jpg' },
    { id: 'back6', label: '', image: 'assets/shufa/bg/bg15.jpg' },
    { id: 'back7', label: '' },
  ];
  selectedBackgroundId = 'back6';
  private dictByChar = new Map<string, SfDictEntry>();

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<SfDictEntry[]>('assets/shufa/dict.json').subscribe({
      next: (dict) => {
        this.dictByChar = new Map(dict.map((item) => [item.key, item]));
        this.updateColumns();
      },
      error: () => {
        this.dictByChar.clear();
        this.updateColumns();
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bg']) {
      this.applyBgInput();
    }

    if (!changes['content']) {
      return;
    }

    this.updateColumns();
  }

  setBackground(backgroundId: string): void {
    this.selectedBackgroundId = backgroundId;
  }

  isSelectedBackground(backgroundId: string): boolean {
    return this.selectedBackgroundId === backgroundId;
  }

  get selectedBackgroundImage(): string {
    const selected = this.backgroundOptions.find((item) => item.id === this.selectedBackgroundId);
    return selected?.image ? `url('${selected.image}')` : 'none';
  }

  get sideSealImageSrcs(): string[] {
    const chars = (this.name ?? '').replace(/\s+/g, '').split('');

    return chars
      .map((char) => this.dictByChar.get(char))
      .filter((item): item is SfDictEntry => !!item)
      .map((item) => `assets/shufa/zi/${item.id}.gif`);
  }

  get normalizedTpl(): 'sz' | 'hf' {
    return (this.tpl ?? '').toLowerCase() === 'hf' ? 'hf' : 'sz';
  }

  get isSzTemplate(): boolean {
    return this.normalizedTpl === 'sz';
  }

  get hfGlyphs(): SfGlyph[] {
    return this.columns.reduce((all, col) => all.concat(col), [] as SfGlyph[]);
  }

  get hfItemWidthPercent(): number {
    const count = this.hfGlyphs.length;

    if (!count) {
      return 100;
    }

    return 99.4 / Math.max(count, HF_MIN_SLOTS);
  }

  private buildGlyph(char: string): SfGlyph {
    const dictItem = this.dictByChar.get(char);

    if (!dictItem) {
      return { char };
    }

    const imageSrc = `assets/shufa/zi/${dictItem.id}.gif`;

    return {
      char,
      author: dictItem.author,
      imageSrc,
    };
  }

  private applyBgInput(): void {
    const value = Number(this.bg);

    if (!Number.isInteger(value) || value < 1 || value > 7) {
      return;
    }

    this.selectedBackgroundId = `back${value}`;
  }

  private updateColumns(): void {
    const chars = (this.content ?? '').replace(/\s+/g, '').split('');
    const glyphs = chars.map((char) => this.buildGlyph(char));
    this.columns = this.chunk(glyphs, CHARS_PER_COLUMN);
  }

  private chunk<T>(arr: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
