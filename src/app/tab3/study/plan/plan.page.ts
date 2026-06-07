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
  selectedTab: 'plan' | 'playlist' | 'completed' = 'plan';
  readonly wheelItemHeight = 48;
  readonly wheelPaddingItems = 1;
  dailyPoemOptions: number[] = [];
  completionDayOptions: number[] = [];

  selectedDailyPoems: number;
  selectedCompletionDays: number;

  private dailyWheel?: ElementRef<HTMLElement>;
  private daysWheel?: ElementRef<HTMLElement>;

  @ViewChild('dailyWheel')
  set dailyWheelRef(element: ElementRef<HTMLElement> | undefined) {
    this.dailyWheel = element;
    this.tryRestoreWheelSelection('auto');
  }

  @ViewChild('daysWheel')
  set daysWheelRef(element: ElementRef<HTMLElement> | undefined) {
    this.daysWheel = element;
    this.tryRestoreWheelSelection('auto');
  }

  private dailyWheelTimer?: ReturnType<typeof setTimeout>;
  private daysWheelTimer?: ReturnType<typeof setTimeout>;
  private suppressDailyWheelScroll = false;
  private suppressDaysWheelScroll = false;
  private pendingWheelRestore = false;

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) {
    this.selectedDailyPoems = this.data.currentStudyPlan?.num || this.data.studyPlan.dailyPoems;
    this.selectedCompletionDays = this.data.currentStudyPlan?.days || this.data.studyPlan.completionDays;
    this.refreshPlanControls();
  }

  get totalPoems(): number {
    return this.data.studyPlan.totalPoems;
  }

  get studiedPoems(): number {
    return this.data.studyPlan.studiedPoems;
  }

  ngAfterViewInit() {
    this.queueWheelRestore('auto');
  }

  ionViewWillEnter() {
    this.refreshPlanControls();
  }

  selectTab(tab: 'plan' | 'playlist' | 'completed') {
    this.selectedTab = tab;

    if (tab === 'plan') {
      this.queueWheelRestore('auto');
    }
  }

  get remainingPoems(): number {
    return this.totalPoems - this.studiedPoems;
  }

  get summarySubtitle(): string {
    return `每天${this.selectedDailyPoems}句，剩余${this.selectedCompletionDays}天`;
  }

  getPlanSubtitle(plan: StudyPlanItem): string {
    return `每天${plan.num}句，剩余${plan.days}天`;
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
    this.scrollWheelToValue('daily', this.selectedDailyPoems);
    this.scrollWheelToValue('days', this.selectedCompletionDays);
  }

  private applyPlanFromCompletionDays(value: number) {
    const resolvedDailyPoems = this.calculateDailyFromDays(value);

    this.selectedDailyPoems = resolvedDailyPoems;
    this.selectedCompletionDays = this.calculateDaysFromDaily(resolvedDailyPoems);
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
    const currentPlan = this.data.currentStudyPlan;
    if (!currentPlan) {
      return;
    }

    this.ui.confirm('重置学习计划', `确定重置“${currentPlan.title}”吗？学习进度会清零。`, () => {
      const reset = this.data.resetCurrentStudyPlan();
      if (!reset) {
        return;
      }

      this.refreshPlanControls();
      this.ui.toast('top', '已重置当前学习计划');
    });
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
    this.ui.confirm('删除诗单', `确定删除“${plan.title}”吗？`, () => {
      const removed = this.data.removeStudyPlan(plan.cid);
      if (!removed) {
        return;
      }

      this.ui.toast('top', '已删除诗单');
    });
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

  savePlan() {
    this.data.updateStudyPlan({
      dailyPoems: this.selectedDailyPoems,
      completionDays: this.selectedCompletionDays,
    });
    this.ui.goback();
  }

  private refreshPlanControls() {
    const currentPlan = this.data.currentStudyPlan;
    const preferredDailyPoems = currentPlan?.num || this.data.studyPlan.dailyPoems;
    const preferredCompletionDays = this.calculateDaysFromDaily(preferredDailyPoems);

    this.dailyPoemOptions = this.includeOption(
      this.buildDailyPoemOptions(),
      preferredDailyPoems,
      Math.max(this.totalPoems, 1)
    );
    this.completionDayOptions = this.includeOption(
      this.buildCompletionDayOptions(),
      preferredCompletionDays,
      Math.max(preferredCompletionDays, 1)
    );

    const maxDailyPoems = this.dailyPoemOptions[this.dailyPoemOptions.length - 1] ?? 1;
    this.selectedDailyPoems = Math.max(1, Math.min(preferredDailyPoems, maxDailyPoems));
    if (!this.dailyPoemOptions.includes(this.selectedDailyPoems)) {
      this.selectedDailyPoems = this.resolveClosestOption(this.selectedDailyPoems, this.dailyPoemOptions);
    }

    this.selectedCompletionDays = Math.max(1, preferredCompletionDays);
    if (!this.completionDayOptions.includes(this.selectedCompletionDays)) {
      this.selectedCompletionDays = this.resolveClosestOption(this.selectedCompletionDays, this.completionDayOptions);
    }

    this.queueWheelRestore('auto');
  }

  private queueWheelRestore(behavior: ScrollBehavior = 'auto') {
    this.pendingWheelRestore = true;
    this.suppressDailyWheelScroll = true;
    this.suppressDaysWheelScroll = true;

    setTimeout(() => {
      this.tryRestoreWheelSelection(behavior);
    });
  }

  private tryRestoreWheelSelection(behavior: ScrollBehavior = 'auto') {
    if (!this.pendingWheelRestore || this.selectedTab !== 'plan') {
      return;
    }

    if (!this.dailyWheel?.nativeElement || !this.daysWheel?.nativeElement) {
      return;
    }

    this.pendingWheelRestore = false;
    this.scrollWheelToValue('daily', this.selectedDailyPoems, behavior);
    this.scrollWheelToValue('days', this.selectedCompletionDays, behavior);
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

  private includeOption(options: number[], value: number, maxValue: number): number[] {
    const normalizedValue = Math.max(1, Math.min(value || 1, Math.max(maxValue, 1)));

    if (options.includes(normalizedValue)) {
      return options;
    }

    return [...options, normalizedValue].sort((left, right) => left - right);
  }

  private resolveClosestOption(value: number, options: number[]): number {
    if (options.length === 0) {
      return 1;
    }

    return options.reduce((closest, current) => {
      return Math.abs(current - value) < Math.abs(closest - value) ? current : closest;
    }, options[0]);
  }

  private calculateDaysFromDaily(dailyPoems: number): number {
    return Math.ceil(this.totalPoems / dailyPoems);
  }

  private calculateDailyFromDays(days: number): number {
    const matchedOption = this.dailyPoemOptions.find((value) => this.calculateDaysFromDaily(value) === days);

    if (matchedOption) {
      return matchedOption;
    }

    const persistedDailyPoems = this.data.currentStudyPlan?.num || this.selectedDailyPoems || this.data.studyPlan.dailyPoems;
    return this.resolveClosestOption(
      Math.max(1, Math.min(persistedDailyPoems, Math.max(this.totalPoems, 1))),
      this.dailyPoemOptions
    );
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