import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, StudyPlanItem } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { PickPage } from '../pick/pick.page';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.page.html',
  styleUrls: ['./plan.page.scss'],
})
export class PlanPage {
  selectedTab: 'plan' | 'playlist' = 'plan';
  readonly wheelItemHeight = 48;
  readonly wheelPaddingItems = 1;
  dailyPoemOptions: number[] = [];
  completionDayOptions: number[] = [];

  selectedDailyPoems: number;
  selectedCompletionDays: number;

  @ViewChild('dailyWheel') dailyWheel?: ElementRef<HTMLElement>;
  @ViewChild('daysWheel') daysWheel?: ElementRef<HTMLElement>;

  private dailyWheelTimer?: ReturnType<typeof setTimeout>;
  private daysWheelTimer?: ReturnType<typeof setTimeout>;
  private suppressDailyWheelScroll = false;
  private suppressDaysWheelScroll = false;

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) {
    this.selectedDailyPoems = this.data.studyPlan.dailyPoems;
    this.selectedCompletionDays = this.calculateDaysFromDaily(this.selectedDailyPoems);
    this.refreshPlanControls();
  }

  get totalPoems(): number {
    return this.data.studyPlan.totalPoems;
  }

  get studiedPoems(): number {
    return this.data.studyPlan.studiedPoems;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollWheelToValue('daily', this.selectedDailyPoems, 'auto');
      this.scrollWheelToValue('days', this.selectedCompletionDays, 'auto');
    });
  }

  selectTab(tab: 'plan' | 'playlist') {
    this.selectedTab = tab;
  }

  get remainingPoems(): number {
    return this.totalPoems - this.studiedPoems;
  }

  get summarySubtitle(): string {
    return `每日${this.selectedDailyPoems}首，剩余${this.selectedCompletionDays}天`;
  }

  get completionDateLabel(): string {
    const completionDate = new Date();
    completionDate.setHours(0, 0, 0, 0);
    completionDate.setDate(completionDate.getDate() + Math.max(this.selectedCompletionDays - 1, 0));

    return this.formatDate(completionDate);
  }

  get estimatedDailyTimeLabel(): string {
    return this.formatDuration(this.estimateMinutesForDailyPoems(this.selectedDailyPoems));
  }

  get dailyStudyDescription(): string {
    return `按当前计划每日背诵 ${this.selectedDailyPoems} 首诗词。`;
  }

  get completionDescription(): string {
    return `预计 ${this.selectedCompletionDays} 天完成当前诗单。`;
  }

  get orderedStudyPlans(): StudyPlanItem[] {
    return [...this.data.StudyPlans].sort((left, right) => Number(Boolean(right.current)) - Number(Boolean(left.current)));
  }

  selectDailyPoems(value: number) {
    this.applyPlanFromDaily(value);
  }

  selectCompletionDays(value: number) {
    this.applyPlanFromCompletionDays(value);
  }

  private applyPlanFromDaily(value: number) {
    this.selectedDailyPoems = value;
    this.selectedCompletionDays = this.calculateDaysFromDaily(value);
    this.syncStudyPlan();
    this.scrollWheelToValue('daily', this.selectedDailyPoems);
    this.scrollWheelToValue('days', this.selectedCompletionDays);
  }

  private applyPlanFromCompletionDays(value: number) {
    const resolvedDailyPoems = this.calculateDailyFromDays(value);

    this.selectedDailyPoems = resolvedDailyPoems;
    this.selectedCompletionDays = this.calculateDaysFromDaily(resolvedDailyPoems);
    this.syncStudyPlan();
    this.scrollWheelToValue('daily', this.selectedDailyPoems);
    this.scrollWheelToValue('days', this.selectedCompletionDays);
  }

  onDailyWheelScroll(event: Event) {
    if (this.suppressDailyWheelScroll) {
      return;
    }

    if (this.dailyWheelTimer) {
      clearTimeout(this.dailyWheelTimer);
    }

    const target = event.target as HTMLElement;
    this.dailyWheelTimer = setTimeout(() => {
      const value = this.resolveWheelValue(target.scrollTop, this.dailyPoemOptions);
      this.selectDailyPoems(value);
    }, 80);
  }

  onDaysWheelScroll(event: Event) {
    if (this.suppressDaysWheelScroll) {
      return;
    }

    if (this.daysWheelTimer) {
      clearTimeout(this.daysWheelTimer);
    }

    const target = event.target as HTMLElement;
    this.daysWheelTimer = setTimeout(() => {
      const value = this.resolveWheelValue(target.scrollTop, this.completionDayOptions);
      this.selectCompletionDays(value);
    }, 80);
  }

  resetPlan() {
    this.selectDailyPoems(10);
  }

  selectStudyPlan(plan: StudyPlanItem) {
    const changed = this.data.setCurrentStudyPlan(plan.cid);
    if (!changed) {
      return;
    }

    this.refreshPlanControls();
    this.ui.toast('top', '已切换当前诗单');
  }

  deleteStudyPlan(plan: StudyPlanItem, event: Event) {
    event.stopPropagation();
    const removed = this.data.removeStudyPlan(plan.cid);
    if (!removed) {
      return;
    }

    this.ui.toast('top', '已删除诗单');
  }

  async addStudyPlan() {
    const modal = await this.modalController.create({
      component: PickPage,
      componentProps: {},
      showBackdrop: true,
      breakpoints: [0, 0.5, 0.75, 1],
      initialBreakpoint: 0.75,
    });

    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.refreshPlanControls();
    }
  }

  private syncStudyPlan() {
    this.data.updateStudyPlan({
      dailyPoems: this.selectedDailyPoems,
      completionDays: this.selectedCompletionDays,
    });
  }

  private refreshPlanControls() {
    this.dailyPoemOptions = this.buildDailyPoemOptions();
    this.completionDayOptions = this.buildCompletionDayOptions();

    const maxDailyPoems = this.dailyPoemOptions[this.dailyPoemOptions.length - 1] ?? 1;
    this.selectedDailyPoems = Math.min(this.data.studyPlan.dailyPoems, maxDailyPoems);
    if (!this.dailyPoemOptions.includes(this.selectedDailyPoems)) {
      this.selectedDailyPoems = this.dailyPoemOptions[0] ?? 1;
    }

    this.selectedCompletionDays = this.calculateDaysFromDaily(this.selectedDailyPoems);
    this.syncStudyPlan();

    setTimeout(() => {
      this.scrollWheelToValue('daily', this.selectedDailyPoems, 'auto');
      this.scrollWheelToValue('days', this.selectedCompletionDays, 'auto');
    });
  }

  private buildDailyPoemOptions(): number[] {
    const options: number[] = [];

    if (this.totalPoems <= 0) {
      return [1];
    }

    for (let value = 5; value < Math.min(100, this.totalPoems); value += 5) {
      options.push(value);
    }

    if (this.totalPoems >= 100) {
      options.push(100);
      for (let value = 125; value <= Math.min(400, this.totalPoems); value += 25) {
        options.push(value);
      }
    }

    if (this.totalPoems > 400) {
      for (let value = 450; value <= this.totalPoems; value += 50) {
        if (value < this.totalPoems) {
          options.push(value);
        }
      }
    }

    const roundedTail = Math.floor(this.totalPoems / 25) * 25;
    if (roundedTail > 400 && roundedTail < this.totalPoems && !options.includes(roundedTail)) {
      options.push(roundedTail);
    }

    if (!options.includes(this.totalPoems)) {
      options.push(this.totalPoems);
    }

    return options.sort((left, right) => left - right);
  }

  private buildCompletionDayOptions(): number[] {
    const daySet = new Set<number>();

    this.dailyPoemOptions.forEach((value) => {
      daySet.add(this.calculateDaysFromDaily(value));
    });

    return Array.from(daySet).sort((left, right) => left - right);
  }

  private calculateDaysFromDaily(dailyPoems: number): number {
    return Math.ceil(this.totalPoems / dailyPoems);
  }

  private calculateDailyFromDays(days: number): number {
    const matchedOption = this.dailyPoemOptions.find((value) => this.calculateDaysFromDaily(value) === days);

    return matchedOption ?? this.totalPoems;
  }

  private estimateMinutesForDailyPoems(dailyPoems: number): number {
    const exactMinutes = new Map<number, number>([
      [5, 3],
      [10, 5],
      [15, 7],
      [20, 9],
      [25, 11],
      [30, 13],
      [80, 34],
      [90, 38],
    ]);

    if (exactMinutes.has(dailyPoems)) {
      return exactMinutes.get(dailyPoems) as number;
    }

    const anchors = Array.from(exactMinutes.entries()).sort((left, right) => left[0] - right[0]);

    for (let index = 0; index < anchors.length - 1; index += 1) {
      const [startDaily, startMinutes] = anchors[index];
      const [endDaily, endMinutes] = anchors[index + 1];

      if (dailyPoems > startDaily && dailyPoems < endDaily) {
        const ratio = (dailyPoems - startDaily) / (endDaily - startDaily);
        return Math.round(startMinutes + ratio * (endMinutes - startMinutes));
      }
    }

    return Math.round(dailyPoems * 0.42);
  }

  private formatDuration(totalMinutes: number): string {
    if (totalMinutes < 60) {
      return `预计每天${totalMinutes}分钟`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
      return `预计每天${hours}小时`;
    }

    return `预计每天${hours}小时${minutes}分钟`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}年${month}月${day}日`;
  }

  private resolveWheelValue(scrollTop: number, options: number[]): number {
    const index = Math.max(
      0,
      Math.min(options.length - 1, Math.round(scrollTop / this.wheelItemHeight))
    );

    return options[index];
  }

  private scrollWheelToValue(
    type: 'daily' | 'days',
    value: number,
    behavior: ScrollBehavior = 'smooth'
  ) {
    const options = type === 'daily' ? this.dailyPoemOptions : this.completionDayOptions;
    const element = type === 'daily' ? this.dailyWheel?.nativeElement : this.daysWheel?.nativeElement;
    const index = options.indexOf(value);

    if (!element || index < 0) {
      return;
    }

    if (type === 'daily') {
      this.suppressDailyWheelScroll = true;
    } else {
      this.suppressDaysWheelScroll = true;
    }

    element.scrollTo({
      top: index * this.wheelItemHeight,
      behavior,
    });

    setTimeout(() => {
      if (type === 'daily') {
        this.suppressDailyWheelScroll = false;
      } else {
        this.suppressDaysWheelScroll = false;
      }
    }, behavior === 'smooth' ? 220 : 0);
  }
}