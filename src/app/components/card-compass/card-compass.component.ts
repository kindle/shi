import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Solar } from 'lunar-typescript';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

type RotatingRingKey = 'solarTerms' | 'constellations';

interface RotatingRingState {
  autoSpeed: number;
  autoRotationFrame: number | null;
  lastAutoRotationTimestamp: number | null;
  restartAutoRotationTimer: ReturnType<typeof setTimeout> | null;
  isDragging: boolean;
  previousDragAngle: number;
  dragRotationTotal: number;
  dragClickStep: number;
}

interface ConstellationSketchPoint {
  x: number;
  y: number;
}

interface ConstellationSketchLink {
  from: number;
  to: number;
}

interface ConstellationSketch {
  points: ConstellationSketchPoint[];
  links: ConstellationSketchLink[];
}

interface ConstellationSketchNote {
  name: string;
  traditionalForm: string;
  note: string;
}

interface FourSymbolLabel {
  name: string;
  angle: number;
  className: string;
}

interface Term24Selection {
  name: string;
  title: string;
  image: string;
  index: number;
  angle: number;
  distance: number;
}

interface SolarTermDebugInfo {
  image?: string;
  title?: string;
}

interface Star28DebugInfo {
  image?: string;
  short?: string;
  title?: string;
  desc?: string;
}

interface Star28Selection {
  name: string;
  short: string;
  title: string;
  desc: string;
  image: string;
  index: number;
  angle: number;
  distance: number;
}

type BrowserAudioContext = AudioContext & {
  createGain: () => GainNode;
};

@Component({
  selector: 'app-card-compass',
  templateUrl: './card-compass.component.html',
  styleUrls: ['./card-compass.component.scss'],
})
export class CardCompassComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() viewer: boolean | string | null = null;
  @HostBinding('style.--compass-tab-bar-inset') compassTabBarInset = '0px';

  @HostBinding('class.viewer')
  get isViewerClass(): boolean {
    return this.isViewer;
  }

  fourSymbolFollowConstellations = true;
  showConstellationDebugPanel = true;
  solarTermsRotation = 0;
  constellationsRotation = 0;
  readonly term24mapping: Record<string, number> = {
    立春: 2001,
    雨水: 2002,
    惊蛰: 2003,
    春分: 2004,
    清明: 2005,
    谷雨: 2006,
    立夏: 2007,
    小满: 2008,
    芒种: 2009,
    夏至: 2010,
    小暑: 2011,
    大暑: 2012,
    立秋: 2013,
    处暑: 2014,
    白露: 2015,
    秋分: 2016,
    寒露: 2017,
    霜降: 2018,
    立冬: 2019,
    小雪: 2020,
    大雪: 2021,
    冬至: 2022,
    小寒: 2023,
    大寒: 2024,
  };

  private readonly rotatingRingAutoRestartDelay = 10000;
  private readonly dragClickDegrees = 5;
  private audioContext: BrowserAudioContext | null = null;
  private readonly rotatingRings: Record<RotatingRingKey, RotatingRingState> = {
    solarTerms: {
      autoSpeed: 360 / 120000,
      autoRotationFrame: null,
      lastAutoRotationTimestamp: null,
      restartAutoRotationTimer: null,
      isDragging: false,
      previousDragAngle: 0,
      dragRotationTotal: 0,
      dragClickStep: 0,
    },
    constellations: {
      autoSpeed: -360 / 120000,
      autoRotationFrame: null,
      lastAutoRotationTimestamp: null,
      restartAutoRotationTimer: null,
      isDragging: false,
      previousDragAngle: 0,
      dragRotationTotal: 0,
      dragClickStep: 0,
    },
  };
  private resizeFrame: number | null = null;

  solarTerms = [
    '春分',
    '清明',
    '谷雨',
    '立夏',
    '小满',
    '芒种',
    '夏至',
    '小暑',
    '大暑',
    '立秋',
    '处暑',
    '白露',
    '秋分',
    '寒露',
    '霜降',
    '立冬',
    '小雪',
    '大雪',
    '冬至',
    '小寒',
    '大寒',
    '立春',
    '雨水',
    '惊蛰',
  ];
  constellations = [
    '角',
    '亢',
    '氐',
    '房',
    '心',
    '尾',
    '箕',
    '斗',
    '牛',
    '女',
    '虚',
    '危',
    '室',
    '壁',
    '奎',
    '娄',
    '胃',
    '昴',
    '毕',
    '觜',
    '参',
    '井',
    '鬼',
    '柳',
    '星',
    '张',
    '翼',
    '轸',
  ];
  constellationSketches: ConstellationSketch[] = [
    { points: [{ x: 24, y: 34 }, { x: 56, y: 18 }], links: [{ from: 0, to: 1 }] },
    { points: [{ x: 12, y: 18 }, { x: 28, y: 24 }, { x: 46, y: 22 }, { x: 66, y: 30 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }] },
    { points: [{ x: 18, y: 34 }, { x: 30, y: 24 }, { x: 48, y: 20 }, { x: 62, y: 30 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 3 }] },
    { points: [{ x: 20, y: 18 }, { x: 50, y: 18 }, { x: 54, y: 34 }, { x: 16, y: 34 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 }] },
    { points: [{ x: 22, y: 32 }, { x: 40, y: 20 }, { x: 58, y: 32 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }] },
    { points: [{ x: 12, y: 18 }, { x: 22, y: 20 }, { x: 32, y: 25 }, { x: 42, y: 31 }, { x: 54, y: 36 }, { x: 66, y: 41 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }] },
    { points: [{ x: 18, y: 22 }, { x: 46, y: 18 }, { x: 60, y: 30 }, { x: 24, y: 34 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }] },
    { points: [{ x: 14, y: 18 }, { x: 26, y: 14 }, { x: 38, y: 20 }, { x: 50, y: 28 }, { x: 62, y: 36 }, { x: 70, y: 44 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }] },
    { points: [{ x: 16, y: 34 }, { x: 28, y: 18 }, { x: 40, y: 34 }, { x: 52, y: 18 }, { x: 64, y: 34 }, { x: 72, y: 22 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 3, to: 5 }] },
    { points: [{ x: 18, y: 24 }, { x: 46, y: 18 }, { x: 58, y: 30 }, { x: 28, y: 36 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }] },
    { points: [{ x: 28, y: 26 }, { x: 52, y: 26 }], links: [{ from: 0, to: 1 }] },
    { points: [{ x: 22, y: 34 }, { x: 40, y: 18 }, { x: 58, y: 34 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }] },
    { points: [{ x: 28, y: 20 }, { x: 52, y: 20 }], links: [{ from: 0, to: 1 }] },
    { points: [{ x: 28, y: 34 }, { x: 52, y: 34 }], links: [{ from: 0, to: 1 }] },
    { points: [{ x: 14, y: 34 }, { x: 24, y: 18 }, { x: 42, y: 16 }, { x: 60, y: 22 }, { x: 66, y: 36 }, { x: 32, y: 40 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 }] },
    { points: [{ x: 24, y: 34 }, { x: 40, y: 16 }, { x: 56, y: 34 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }] },
    { points: [{ x: 24, y: 32 }, { x: 40, y: 18 }, { x: 56, y: 32 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }] },
    { points: [{ x: 34, y: 16 }, { x: 48, y: 18 }, { x: 24, y: 28 }, { x: 40, y: 26 }, { x: 56, y: 28 }, { x: 32, y: 40 }, { x: 48, y: 40 }], links: [{ from: 0, to: 3 }, { from: 1, to: 3 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 3, to: 5 }, { from: 3, to: 6 }] },
    { points: [{ x: 16, y: 16 }, { x: 30, y: 14 }, { x: 46, y: 14 }, { x: 62, y: 16 }, { x: 20, y: 38 }, { x: 34, y: 40 }, { x: 50, y: 40 }, { x: 64, y: 38 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 0, to: 4 }, { from: 1, to: 5 }, { from: 2, to: 6 }, { from: 3, to: 7 }, { from: 1, to: 4 }, { from: 2, to: 7 }] },
    { points: [{ x: 24, y: 34 }, { x: 40, y: 14 }, { x: 56, y: 34 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }] },
    { points: [{ x: 20, y: 14 }, { x: 60, y: 14 }, { x: 16, y: 42 }, { x: 64, y: 42 }, { x: 28, y: 24 }, { x: 40, y: 28 }, { x: 52, y: 24 }], links: [{ from: 0, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 1 }, { from: 4, to: 2 }, { from: 6, to: 3 }] },
    { points: [{ x: 24, y: 14 }, { x: 40, y: 14 }, { x: 56, y: 14 }, { x: 24, y: 28 }, { x: 40, y: 28 }, { x: 56, y: 28 }, { x: 24, y: 42 }, { x: 40, y: 42 }, { x: 56, y: 42 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 0, to: 3 }, { from: 3, to: 6 }, { from: 1, to: 4 }, { from: 4, to: 7 }, { from: 2, to: 5 }, { from: 5, to: 8 }] },
    { points: [{ x: 40, y: 12 }, { x: 58, y: 28 }, { x: 40, y: 44 }, { x: 22, y: 28 }, { x: 40, y: 28 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 }, { from: 0, to: 4 }, { from: 2, to: 4 }] },
    { points: [{ x: 12, y: 18 }, { x: 22, y: 20 }, { x: 32, y: 24 }, { x: 42, y: 29 }, { x: 52, y: 34 }, { x: 62, y: 37 }, { x: 70, y: 35 }, { x: 74, y: 28 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 7 }] },
    { points: [{ x: 24, y: 30 }, { x: 40, y: 22 }, { x: 56, y: 30 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }] },
    { points: [{ x: 14, y: 36 }, { x: 22, y: 20 }, { x: 36, y: 14 }, { x: 52, y: 16 }, { x: 66, y: 24 }, { x: 62, y: 40 }, { x: 28, y: 30 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 1, to: 6 }, { from: 6, to: 4 }] },
    { points: [{ x: 10, y: 20 }, { x: 22, y: 12 }, { x: 34, y: 22 }, { x: 40, y: 30 }, { x: 46, y: 22 }, { x: 58, y: 12 }, { x: 70, y: 20 }, { x: 28, y: 38 }, { x: 52, y: 38 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 2, to: 7 }, { from: 4, to: 8 }, { from: 7, to: 8 }] },
    { points: [{ x: 20, y: 18 }, { x: 54, y: 16 }, { x: 60, y: 34 }, { x: 26, y: 38 }], links: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 0 }] },
  ];
  constellationSketchNotes: ConstellationSketchNote[] = [
    { name: '角', traditionalForm: '双角双点', note: '按角宿双角意象压缩为 2 点斜线。' },
    { name: '亢', traditionalForm: '颈项折线', note: '保留 4 点浅折线，避免误画成团簇。' },
    { name: '氐', traditionalForm: '小勺斗', note: '用 4 点分叉骨架表达氐宿主形。' },
    { name: '房', traditionalForm: '四边房框', note: '用闭合四边形表示天驷房宿。' },
    { name: '心', traditionalForm: '三星短折', note: '保留心宿三星的紧凑识别。' },
    { name: '尾', traditionalForm: '弯尾长链', note: '压缩为 6 点尾链，维持尾部延展感。' },
    { name: '箕', traditionalForm: '开口簸箕', note: '用 4 点开口形避免画成普通四边框。' },
    { name: '斗', traditionalForm: '南斗勺形', note: '保留 6 点斗勺主形。' },
    { name: '牛', traditionalForm: '牛角双折', note: '以双角起伏骨架表达牛宿。' },
    { name: '女', traditionalForm: '倾斜簸箕', note: '保留 4 点斜簸箕轮廓。' },
    { name: '虚', traditionalForm: '双点并列', note: '采用极简 2 点表示虚宿主星。' },
    { name: '危', traditionalForm: '屋顶三角', note: '用 3 点尖顶形保持高辨识。' },
    { name: '室', traditionalForm: '双点门柱', note: '室宿以 2 点成对表达。' },
    { name: '壁', traditionalForm: '双点墙段', note: '壁宿与室宿分开，保留平行双点。' },
    { name: '奎', traditionalForm: '弯折长框', note: '将奎宿密星压缩为 6 点闭环。' },
    { name: '娄', traditionalForm: '三角骨架', note: '娄宿保留最稳定的三角主形。' },
    { name: '胃', traditionalForm: '小仓三角', note: '用 3 点浅三角表示胃宿。' },
    { name: '昴', traditionalForm: '团簇星群', note: '改成 7 点团簇，以中心辐射突出昴宿星团。' },
    { name: '毕', traditionalForm: '网状星网', note: '改成 8 点双排加斜连线，强化毕宿网感。' },
    { name: '觜', traditionalForm: '鼎足三角', note: '保持 3 点鼎足小三角。' },
    { name: '参', traditionalForm: '猎户式展开', note: '改成 7 点参宿骨架，突出腰带与四角展开。' },
    { name: '井', traditionalForm: '井字九点', note: '改成 9 点井格骨架，保留横竖井栏关系。' },
    { name: '鬼', traditionalForm: '鬼方带中枢', note: '改成方菱加中心枢点，更接近鬼宿方中有主的意象。' },
    { name: '柳', traditionalForm: '垂柳弯链', note: '补到 8 点弯链，保持柳叶下垂感。' },
    { name: '星', traditionalForm: '三星眼形', note: '采用紧凑三角骨架，不做过密处理。' },
    { name: '张', traditionalForm: '张弓带弦', note: '改成 7 点弓身加内弦结构，张弓辨识更明确。' },
    { name: '翼', traditionalForm: '双翼连身', note: '改成 9 点双翼加中段连接，左右翼面更完整。' },
    { name: '轸', traditionalForm: '车架四边', note: '保持轸宿车架式四边轮廓。' },
  ];
  constellationGroupClasses: string[] = this.constellations.map((_, index) => this.resolveConstellationGroupClass(index));
  fourSymbols: FourSymbolLabel[] = [
    { name: '青龙', angle: 45, className: 'group-qinglong' },
    { name: '玄武', angle: 135, className: 'group-xuanwu' },
    { name: '白虎', angle: 225, className: 'group-baihu' },
    { name: '朱雀', angle: 315, className: 'group-zhuque' },
  ];
  constellationGroupDividerAngles = [
    360 - 360 / (this.constellations.length * 2),
    90 - 360 / (this.constellations.length * 2),
    180 - 360 / (this.constellations.length * 2),
    270 - 360 / (this.constellations.length * 2),
  ];
  constellationDividers = [360 - 360 / 56, 90 - 360 / 56, 180 - 360 / 56, 270 - 360 / 56];
  bagua = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  degrees: number[] = [];
  monthDegrees: (string | null)[] = [];
  dayDegrees: (string | null)[] = [];
  term24Selected: Term24Selection[] = [];
  star28Selected: Star28Selection[] = [];
  currentSolarTerm = '';
  currentSolarTermConstellation = '';
  currentSolarTermBagua = '';
  currentFourSymbolIndex = 0;

  todayDate: string;
  todayGanzhi: string;
  private lastTermPanelActivationAt = 0;

  get isViewer(): boolean {
    return this.viewer !== false && this.viewer !== null && `${this.viewer}` !== 'false';
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private navCtrl: NavController,
    public data: DataService,
    public ui: UiService,
  ) {
    const today = new Date(2026, 5, 7);
    this.todayDate = today.toLocaleDateString('zh-CN');
    const lunar = Solar.fromDate(today).getLunar();
    this.todayGanzhi = `${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`;
  }

  async goToTerm(termName: string | undefined) {
    if (!termName) {
      return;
    }

    const termId = this.term24mapping[termName];

    if (!termId) {
      return;
    }

    await this.navCtrl.navigateForward(`/tabs/tab1/list/${termId}`);
  }

  async goToStar28(starName: string | undefined) {
    if (!starName) {
      return;
    }
    this.data.goTab4SearchByTag(starName);
  }

  async onTermPanelActivate(event: Event, termName: string | undefined) {
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();
    if (now - this.lastTermPanelActivationAt < 400) {
      return;
    }

    this.lastTermPanelActivationAt = now;
    this.stopRotatingRingAutoRotation('solarTerms');
    this.stopRotatingRingAutoRotation('constellations');
    this.clearRotatingRingAutoRestartTimer('solarTerms');
    this.clearRotatingRingAutoRestartTimer('constellations');

    await this.goToTerm(termName);
  }

  async onStar28PanelActivate(event: Event, starName: string | undefined) {
    event.preventDefault();
    event.stopPropagation();

    // const now = Date.now();
    // if (now - this.lastTermPanelActivationAt < 400) {
    //   return;
    // }

    // this.lastTermPanelActivationAt = now;
    // this.stopRotatingRingAutoRotation('solarTerms');
    // this.stopRotatingRingAutoRotation('constellations');
    // this.clearRotatingRingAutoRestartTimer('solarTerms');
    // this.clearRotatingRingAutoRestartTimer('constellations');

    await this.goToStar28(starName);
  }

  ngOnInit() {
    for (let i = 0; i < 360; i += 5) {
      this.degrees.push(i);
    }

    this.monthDegrees = new Array(360).fill(null);
    this.dayDegrees = new Array(360).fill(null);

    const today = new Date();
    const solar = Solar.fromYmd(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const lunar = solar.getLunar();

    const dayGanzhi = lunar.getDayInGanZhi();
    this.currentSolarTerm = lunar.getCurrentJieQi()?.getName() || lunar.getPrevJieQi()?.getName() || '';
    //console.log('当前节气：', this.currentSolarTerm);
    //console.log('lunar.getCurrentJieQi()?.getName()', lunar.getCurrentJieQi()?.getName());
    //console.log('lunar.getPrevJieQi()?.getName()', lunar.getPrevJieQi()?.getName());
    this.currentSolarTermConstellation = this.getConstellationForSolarTerm(this.currentSolarTerm);
    this.currentSolarTermBagua = this.getBaguaForSolarTerm(this.currentSolarTerm);
    this.currentFourSymbolIndex = this.getFourSymbolIndexForConstellation(this.currentSolarTermConstellation);

    for (let degree = 0; degree < 360; degree++) {
      const date = this.getDateForCompassDegree(today.getFullYear(), degree);
      this.monthDegrees[degree] = Solar.fromDate(date).getLunar().getMonthInGanZhi();
    }

    const todayDegree = this.getDegreeForDate(today);
    this.dayDegrees[todayDegree] = dayGanzhi;
    this.updateNearestSolarTerms();
    this.updateNearestConstellations();

    this.updateCompassTabBarInset();

    if (typeof window !== 'undefined' && !this.isViewer) {
      window.addEventListener('resize', this.updateCompassTabBarInset);
    }

    this.startRotatingRingAutoRotation('solarTerms');
    this.startRotatingRingAutoRotation('constellations');
  }

  ngAfterViewInit() {
    this.updateCompassTabBarInset();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined' && !this.isViewer) {
      window.removeEventListener('resize', this.updateCompassTabBarInset);
    }

    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }

    this.stopRotatingRingAutoRotation('solarTerms');
    this.stopRotatingRingAutoRotation('constellations');
    this.clearRotatingRingAutoRestartTimer('solarTerms');
    this.clearRotatingRingAutoRestartTimer('constellations');

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }

  onRotatingRingPointerDown(event: PointerEvent, ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];
    event.preventDefault();
    ring.isDragging = true;
    ring.previousDragAngle = this.getPointerAngle(event);
    ring.dragRotationTotal = 0;
    ring.dragClickStep = 0;
    this.stopRotatingRingAutoRotation(ringKey);
    this.clearRotatingRingAutoRestartTimer(ringKey);

    this.prepareGearClickAudio();

    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture(event.pointerId);
    target?.classList.add('dragging');
  }

  onRotatingRingPointerMove(event: PointerEvent, ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    if (!ring.isDragging) {
      return;
    }

    event.preventDefault();
    const currentAngle = this.getPointerAngle(event);
    const angleDelta = this.getShortestAngleDelta(currentAngle, ring.previousDragAngle);
    this.setRotatingRingRotation(ringKey, this.getRotatingRingRotation(ringKey) + angleDelta);

    this.playRotatingRingDragClicks(ring, angleDelta);

    ring.previousDragAngle = currentAngle;
  }

  onRotatingRingPointerEnd(event: PointerEvent, ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    if (!ring.isDragging) {
      return;
    }

    ring.isDragging = false;

    const target = event.currentTarget as HTMLElement | null;
    if (target?.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    target?.classList.remove('dragging');
    this.scheduleRotatingRingAutoRestart(ringKey);
  }

  getDateForCompassDegree(year: number, degree: number): Date {
    const springEquinox = new Date(year, 2, 20);
    const daysFromSpringEquinox = Math.round((degree / 360) * 365.25);
    const date = new Date(springEquinox);
    date.setDate(springEquinox.getDate() + daysFromSpringEquinox);
    return date;
  }

  getDegreeForDate(date: Date): number {
    const springEquinox = new Date(date.getFullYear(), 2, 20);
    const nextSpringEquinox = new Date(date.getFullYear() + 1, 2, 20);
    const compassStart = date < springEquinox ? new Date(date.getFullYear() - 1, 2, 20) : springEquinox;
    const compassEnd = date < springEquinox ? springEquinox : nextSpringEquinox;
    const diff = date.getTime() - compassStart.getTime();
    const yearLength = compassEnd.getTime() - compassStart.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfCompassYear = Math.floor(diff / oneDay);
    const compassYearDays = yearLength / oneDay;
    return Math.floor((dayOfCompassYear / compassYearDays) * 360);
  }

  getFourSymbolLabelTransform(angle: number): string {
    const staticCompensation = this.fourSymbolFollowConstellations ? -this.constellationsRotation : 0;
    return `translateY(calc(-1 * var(--constellation-map-radius) + 70px)) rotate(${(-1 * angle) + staticCompensation}deg)`;
  }

  private updateCompassTabBarInset = () => {
    if (this.isViewer || typeof window === 'undefined') {
      this.compassTabBarInset = '0px';
      return;
    }

    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
    }

    this.resizeFrame = requestAnimationFrame(() => {
      const content = this.elementRef.nativeElement.closest('ion-content');
      const tabBar = document.querySelector('ion-tab-bar');

      if (!content || !tabBar) {
        this.compassTabBarInset = '0px';
        this.resizeFrame = null;
        return;
      }

      const contentRect = content.getBoundingClientRect();
      const tabBarRect = tabBar.getBoundingClientRect();
      const overlap = Math.max(0, contentRect.bottom - tabBarRect.top);
      this.compassTabBarInset = `${Math.ceil(overlap)}px`;
      this.resizeFrame = null;
    });
  };

  private startRotatingRingAutoRotation(ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    if (typeof window === 'undefined' || ring.autoRotationFrame !== null || ring.isDragging) {
      return;
    }

    ring.lastAutoRotationTimestamp = null;
    ring.autoRotationFrame = requestAnimationFrame((timestamp) => this.runRotatingRingAutoRotation(timestamp, ringKey));
  }

  private stopRotatingRingAutoRotation(ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    if (ring.autoRotationFrame !== null) {
      cancelAnimationFrame(ring.autoRotationFrame);
      ring.autoRotationFrame = null;
    }

    ring.lastAutoRotationTimestamp = null;
  }

  private runRotatingRingAutoRotation(timestamp: number, ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    if (ring.isDragging) {
      ring.autoRotationFrame = null;
      ring.lastAutoRotationTimestamp = null;
      return;
    }

    if (ring.lastAutoRotationTimestamp !== null) {
      const elapsed = timestamp - ring.lastAutoRotationTimestamp;
      this.setRotatingRingRotation(ringKey, this.getRotatingRingRotation(ringKey) + elapsed * ring.autoSpeed);
    }

    ring.lastAutoRotationTimestamp = timestamp;
    ring.autoRotationFrame = requestAnimationFrame((nextTimestamp) => this.runRotatingRingAutoRotation(nextTimestamp, ringKey));
  }

  private scheduleRotatingRingAutoRestart(ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    this.clearRotatingRingAutoRestartTimer(ringKey);
    ring.restartAutoRotationTimer = setTimeout(() => {
      ring.restartAutoRotationTimer = null;
      this.startRotatingRingAutoRotation(ringKey);
    }, this.rotatingRingAutoRestartDelay);
  }

  private clearRotatingRingAutoRestartTimer(ringKey: RotatingRingKey) {
    const ring = this.rotatingRings[ringKey];

    if (ring.restartAutoRotationTimer !== null) {
      clearTimeout(ring.restartAutoRotationTimer);
      ring.restartAutoRotationTimer = null;
    }
  }

  private getRotatingRingRotation(ringKey: RotatingRingKey): number {
    return ringKey === 'solarTerms' ? this.solarTermsRotation : this.constellationsRotation;
  }

  private setRotatingRingRotation(ringKey: RotatingRingKey, rotation: number) {
    if (ringKey === 'solarTerms') {
      this.solarTermsRotation = this.normalizeRotation(rotation);
      this.updateNearestSolarTerms();
      return;
    }

    this.constellationsRotation = this.normalizeRotation(rotation);
    this.updateNearestConstellations();
  }

  private updateNearestSolarTerms() {
    const arrowAngle = 45;

    this.term24Selected = this.solarTerms
      .map((name, index) => {
        const angle = this.normalizeRotation(index * 15 + this.solarTermsRotation);
        const termInfo = this.data.solarTermMap.get(name) as SolarTermDebugInfo | undefined;

        return {
          name,
          title: termInfo?.title || name,
          image: this.getSolarTermImageUrl(termInfo?.image),
          index,
          angle,
          distance: Math.abs(this.getShortestAngleDelta(angle, arrowAngle)),
        };
      })
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 1);
  }

  private updateNearestConstellations() {
    const arrowAngle = 45;
    const constellationDegree = 360 / this.constellations.length;

    this.star28Selected = this.constellations
      .map((name, index) => {
        const angle = this.normalizeRotation(index * constellationDegree + this.constellationsRotation);
        const starInfo = this.data.star28Map.get(name) as Star28DebugInfo | undefined;

        return {
          name,
          short: starInfo?.short || name,
          title: starInfo?.title || name,
          desc: starInfo?.desc || '',
          image: this.getSolarTermImageUrl(starInfo?.image),
          index,
          angle,
          distance: Math.abs(this.getShortestAngleDelta(angle, arrowAngle)),
        };
      })
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 1);
  }

  private getSolarTermImageUrl(image?: string): string {
    if (!image) {
      return '';
    }

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('assets/')) {
      return image;
    }

    return `https://reddah.blob.core.windows.net/msjjimg/${image}`;
  }

  private getConstellationForSolarTerm(solarTerm: string): string {
    const solarTermIndex = this.solarTerms.indexOf(solarTerm);

    if (solarTermIndex < 0) {
      return '';
    }

    const solarTermDegree = solarTermIndex * 15;
    const constellationDegree = 360 / this.constellations.length;
    const constellationIndex = Math.round(solarTermDegree / constellationDegree) % this.constellations.length;
    return this.constellations[constellationIndex];
  }

  private getBaguaForSolarTerm(solarTerm: string): string {
    const solarTermIndex = this.solarTerms.indexOf(solarTerm);

    if (solarTermIndex < 0) {
      return '';
    }

    const solarTermDegree = solarTermIndex * 15;
    const baguaDegree = 360 / this.bagua.length;
    const baguaIndex = Math.round(solarTermDegree / baguaDegree) % this.bagua.length;
    return this.bagua[baguaIndex];
  }

  private resolveConstellationGroupClass(index: number): string {
    if (index < 7) {
      return 'group-qinglong';
    }

    if (index < 14) {
      return 'group-xuanwu';
    }

    if (index < 21) {
      return 'group-baihu';
    }

    return 'group-zhuque';
  }

  private getFourSymbolIndexForConstellation(constellation: string): number {
    const constellationIndex = this.constellations.indexOf(constellation);

    if (constellationIndex < 0) {
      return 0;
    }

    return Math.floor(constellationIndex / 7);
  }

  private prepareGearClickAudio() {
    if (typeof window === 'undefined') {
      return;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
  }

  private playRotatingRingDragClicks(ring: RotatingRingState, angleDelta: number) {
    if (angleDelta === 0 || !this.audioContext) {
      return;
    }

    ring.dragRotationTotal += Math.abs(angleDelta);
    const nextClickStep = Math.floor(ring.dragRotationTotal / this.dragClickDegrees);
    const clicksToPlay = Math.min(4, nextClickStep - ring.dragClickStep);

    if (clicksToPlay <= 0) {
      return;
    }

    const startTime = this.audioContext.currentTime;

    for (let index = 0; index < clicksToPlay; index++) {
      this.playGearClick(startTime + index * 0.018);
    }

    ring.dragClickStep = nextClickStep;
  }

  private playGearClick(startTime: number) {
    if (!this.audioContext) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    const stopTime = startTime + 0.035;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1200, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(420, stopTime);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, startTime);
    filter.Q.setValueAtTime(8, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(stopTime);
  }

  private getPointerAngle(event: PointerEvent): number {
    const compass = this.elementRef.nativeElement.querySelector('.compass');

    if (!compass) {
      return 0;
    }

    const compassRect = compass.getBoundingClientRect();
    const centerX = compassRect.left + compassRect.width / 2;
    const centerY = compassRect.top + compassRect.height / 2;
    return Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
  }

  private getShortestAngleDelta(currentAngle: number, previousAngle: number): number {
    let angleDelta = currentAngle - previousAngle;

    if (angleDelta > 180) {
      angleDelta -= 360;
    }

    if (angleDelta < -180) {
      angleDelta += 360;
    }

    return angleDelta;
  }

  private normalizeRotation(rotation: number): number {
    return ((rotation % 360) + 360) % 360;
  }
}