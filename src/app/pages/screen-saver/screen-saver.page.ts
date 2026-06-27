import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';

interface ScreenSaverStream {
  id: number;
  text: string;
  repeatedText: string;
  rightPx: number;
  columnWidthPx: number;
  glyphSafeInsetPx: number;
  leftOffsetPx: number;
  zIndex: number;
  durationSec: number;
  delaySec: number;
  fontSizePx: number;
  color: string;
  opacity: number;
  letterSpacingPx: number;
}

interface ScreenSaverLineConfig {
  text: string;
  fontSizePx?: number;
  color?: string;
  opacity?: number;
  zIndex?: number;
  leftOffsetPx?: number;
  speedPxPerSec?: number;
}

@Component({
  selector: 'app-screen-saver',
  templateUrl: './screen-saver.page.html',
  styleUrls: ['./screen-saver.page.scss'],
})
export class ScreenSaverPage implements OnInit, OnDestroy {
  title = '';
  currentTime = '00:00:00';
  streams: ScreenSaverStream[] = [];
  private readonly backgroundMusicSrc = 'assets/music/slidebg4_mzd.mp3';

  private readonly fallbackTitle = '数风流人物 还看今朝';
  private readonly fallbackLineConfigs: ScreenSaverLineConfig[] = [
    { text: '要扫除一切害人虫 全无敌', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '一万年太久 只争朝夕', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '待到山花烂漫时 她在从中笑', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '萧瑟秋风今又是 换了人间', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '鹰击长空 鱼翔浅底 万类霜天竞自由', fontSizePx: 60, opacity: 0.8, zIndex: 1 },
    { text: '五帝三皇神圣事 骗了无涯过客', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '山下旌旗在望 山头鼓角相闻 敌军围困万千重 我自岿然不动', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '今日欢呼孙大圣 只缘妖雾又重来', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
    { text: '重上井冈山 久有凌云志', fontSizePx: 30, opacity: 0.8, zIndex: 0 },
  ];
  private sourceLineConfigs: ScreenSaverLineConfig[] = [];

  private timerId: ReturnType<typeof setInterval> | null = null;
  private resizeThrottleId: ReturnType<typeof setTimeout> | null = null;
  private backgroundAudio: HTMLAudioElement | null = null;

  constructor(
    private router: Router,
    private ui: UiService,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.ui.hideStatusBar();
    this.hydrateNavigationState();
    this.playBackgroundMusic();
    this.refreshClock();
    this.timerId = setInterval(() => {
      this.refreshClock();
    }, 1000);

    this.platform.resize.subscribe(() => {
      if (this.resizeThrottleId) {
        clearTimeout(this.resizeThrottleId);
      }

      this.resizeThrottleId = setTimeout(() => {
        this.buildStreams();
      }, 80);
    });
  }

  ionViewWillEnter() {
    this.ui.hideStatusBar();
    this.hydrateNavigationState();
    this.playBackgroundMusic();
  }

  ionViewDidEnter() {
    this.hydrateNavigationState();
    this.playBackgroundMusic();
  }

  ionViewWillLeave() {
    this.stopBackgroundMusic();
  }

  ngOnDestroy() {
    this.ui.showStatusBar();
    this.stopBackgroundMusic(true);

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.resizeThrottleId) {
      clearTimeout(this.resizeThrottleId);
      this.resizeThrottleId = null;
    }
  }

  private hydrateNavigationState() {
    const navState = this.router.getCurrentNavigation()?.extras?.state || history.state || {};
    this.title = this.normalizeTitle(navState.title);
    const lineConfigs = this.normalizeLineConfigs(navState.list);
    this.sourceLineConfigs = lineConfigs;

    this.streams = this.createStreams(lineConfigs);
  }

  private normalizeTitle(rawTitle: any): string {
    if (typeof rawTitle === 'string' && rawTitle.trim()) {
      return rawTitle.trim();
    }

    return this.fallbackTitle;
  }

  private normalizeLineConfigs(rawList: any): ScreenSaverLineConfig[] {
    const source = Array.isArray(rawList) ? rawList : [];
    const lineConfigs = source
      .map((item: any) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const normalizedText = this.normalizeTextSource(item.text);
          if (!normalizedText) {
            return null;
          }

          return {
            text: normalizedText,
            fontSizePx: this.parseFontSizePx(item.size),
            color: this.parseColor(item.color),
            opacity: this.parseOpacity(item.opacity),
            zIndex: this.parseZIndex(item.zindex ?? item.zIndex),
            leftOffsetPx: this.parseOffsetPx(item.left),
            speedPxPerSec: this.parseSpeed(item.speed),
          } as ScreenSaverLineConfig;
        }

        const normalizedText = this.normalizeTextSource(item);
        if (!normalizedText) {
          return null;
        }

        return { text: normalizedText } as ScreenSaverLineConfig;
      })
      .filter((line: ScreenSaverLineConfig | null): line is ScreenSaverLineConfig => !!line);

    return lineConfigs.length > 0
      ? lineConfigs
      : this.fallbackLineConfigs;
  }

  private createStreams(lineConfigs: ScreenSaverLineConfig[]): ScreenSaverStream[] {
    const viewportHeight = Math.max(window.innerHeight || 0, 700);
    const viewportWidth = Math.max(window.innerWidth || 0, 360);
    const count = Math.max(lineConfigs.length, 1);
    const streamAreaWidth = Math.max(Math.floor(viewportWidth * 0.5), 260);
    const laneWidth = Math.max(22, Math.floor(streamAreaWidth / count));
    const columnGapPx = 2;

    const prepared = lineConfigs.map((lineConfig, index) => {
      const line = lineConfig.text;
      const fontSizePx = lineConfig.fontSizePx !== undefined
        ? this.clampNumber(lineConfig.fontSizePx, 14, 180, 30)
        : 30;
      const color = lineConfig.color || '#ffffff';
      const opacity = lineConfig.opacity !== undefined
        ? this.clampNumber(lineConfig.opacity, 0.1, 1, 0.8)
        : 0.8;
      const leftOffsetPx = this.clampNumber(lineConfig.leftOffsetPx, -2000, 2000, 0);
      const speedPxPerSec = this.clampNumber(lineConfig.speedPxPerSec, 1, 240, 0);
      // Extra inset avoids glyph edge clipping on some iPad vertical-text rasterization paths.
      const glyphSafeInsetPx = Math.max(4, Math.ceil(fontSizePx * 0.12));
      const columnWidthPx = Math.max(laneWidth - 2, fontSizePx + glyphSafeInsetPx * 2 + 2);
      const durationSec = speedPxPerSec > 0
        ? this.computeDurationSecBySpeed(viewportHeight, speedPxPerSec)
        : this.randomInt(160, 368);
      const delaySec = -(durationSec * 0.5);

      return {
        id: index,
        text: line,
        repeatedText: this.buildRepeatedText(line, viewportHeight, fontSizePx),
        columnWidthPx,
        glyphSafeInsetPx,
        leftOffsetPx,
        zIndex: this.clampNumber(lineConfig.zIndex, 0, 9999, 0),
        durationSec,
        delaySec,
        fontSizePx,
        color,
        opacity,
        letterSpacingPx: this.randomInt(1, Math.max(2, Math.floor(fontSizePx * 0.2))),
      };
    });

    let rightCursor = 0;

    return prepared.map(item => {
      const stream: ScreenSaverStream = {
        ...item,
        rightPx: rightCursor + item.leftOffsetPx,
      };

      rightCursor += item.columnWidthPx + columnGapPx;
      return stream;
    });
  }

  private normalizeTextSource(rawText: any): string {
    if (Array.isArray(rawText)) {
      return rawText
        .map((part: any) => `${part ?? ''}`.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return `${rawText ?? ''}`.replace(/\s+/g, ' ').trim();
  }

  private parseFontSizePx(rawSize: any): number | undefined {
    if (rawSize === null || rawSize === undefined) {
      return undefined;
    }

    if (typeof rawSize === 'number' && Number.isFinite(rawSize)) {
      return rawSize;
    }

    if (typeof rawSize === 'string') {
      const parsed = parseFloat(rawSize);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  private parseOpacity(rawOpacity: any): number | undefined {
    if (rawOpacity === null || rawOpacity === undefined) {
      return undefined;
    }

    if (typeof rawOpacity === 'number' && Number.isFinite(rawOpacity)) {
      return rawOpacity;
    }

    if (typeof rawOpacity === 'string') {
      const parsed = parseFloat(rawOpacity);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  private parseColor(rawColor: any): string | undefined {
    if (typeof rawColor !== 'string') {
      return undefined;
    }

    const normalized = rawColor.trim();
    return normalized ? normalized : undefined;
  }

  private parseZIndex(rawZIndex: any): number | undefined {
    if (rawZIndex === null || rawZIndex === undefined) {
      return undefined;
    }

    if (typeof rawZIndex === 'number' && Number.isFinite(rawZIndex)) {
      return Math.round(rawZIndex);
    }

    if (typeof rawZIndex === 'string') {
      const parsed = parseFloat(rawZIndex);
      if (Number.isFinite(parsed)) {
        return Math.round(parsed);
      }
    }

    return undefined;
  }

  private parseOffsetPx(rawOffset: any): number | undefined {
    if (rawOffset === null || rawOffset === undefined) {
      return undefined;
    }

    if (typeof rawOffset === 'number' && Number.isFinite(rawOffset)) {
      return rawOffset;
    }

    if (typeof rawOffset === 'string') {
      const parsed = parseFloat(rawOffset);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  private parseSpeed(rawSpeed: any): number | undefined {
    if (rawSpeed === null || rawSpeed === undefined) {
      return undefined;
    }

    if (typeof rawSpeed === 'number' && Number.isFinite(rawSpeed)) {
      return rawSpeed;
    }

    if (typeof rawSpeed === 'string') {
      const parsed = parseFloat(rawSpeed);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  }

  private computeDurationSecBySpeed(viewportHeight: number, speedPxPerSec: number): number {
    // stream-fall moves from -100% to 100%, approximated as 2x viewport travel.
    const travelDistancePx = Math.max(600, viewportHeight * 2);
    const durationSec = travelDistancePx / speedPxPerSec;

    return this.clampNumber(durationSec, 8, 600, 160);
  }

  private clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
    if (value === undefined || !Number.isFinite(value)) {
      return fallback;
    }

    return Math.max(min, Math.min(max, value));
  }

  private buildRepeatedText(line: string, viewportHeight: number, fontSizePx: number): string {
    const compact = line.replace(/\s+/g, ' ').trim();
    if (!compact) {
      return '';
    }

    const charsPerScreen = Math.max(12, Math.ceil(viewportHeight / Math.max(18, fontSizePx * 1.18)) + 6);
    const charCount = compact.replace(/\s+/g, '').length;
    const repeats = Math.max(6, Math.ceil((charsPerScreen * 3) / Math.max(1, charCount)) + 6);

    return new Array(repeats).fill(compact).join(' ');
  }

  private refreshClock() {
    const now = new Date();
    const hh = `${now.getHours()}`.padStart(2, '0');
    const mm = `${now.getMinutes()}`.padStart(2, '0');
    const ss = `${now.getSeconds()}`.padStart(2, '0');
    this.currentTime = `${hh}:${mm}:${ss}`;
  }

  private playBackgroundMusic() {
    if (!this.backgroundAudio) {
      this.backgroundAudio = new Audio(this.backgroundMusicSrc);
      this.backgroundAudio.loop = true;
      this.backgroundAudio.preload = 'auto';
      this.backgroundAudio.volume = 0.5;
    }

    const playPromise = this.backgroundAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay may be blocked; keep page behavior normal.
      });
    }
  }

  private stopBackgroundMusic(release = false) {
    if (!this.backgroundAudio) {
      return;
    }

    this.backgroundAudio.pause();
    this.backgroundAudio.currentTime = 0;

    if (release) {
      this.backgroundAudio.src = '';
      this.backgroundAudio.load();
      this.backgroundAudio = null;
    }
  }

  private buildStreams() {
    const lineConfigs = this.sourceLineConfigs.length > 0
      ? this.sourceLineConfigs
      : this.fallbackLineConfigs;
    this.streams = this.createStreams(lineConfigs);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
