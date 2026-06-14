import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DataService, StudyPlanPoemItem } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

interface LearnOption {
  id: string;
  text: string;
  isCorrect: boolean;
  poem: any;
}

interface LearnQuestion {
  poem: StudyPlanPoemItem;
  firstHalf: string;
  secondHalf: string;
  options: LearnOption[];
}

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
})
export class LearnPage {
  readonly optionLabels = ['A', 'B', 'C', 'D'];
  readonly maxWrongAttempts = 3;
  readonly rightAnswerAudioSrc = 'assets/music/right.wav';
  readonly wrongAnswerAudioSrc = 'assets/music/wrong.wav';
  readonly feedbackSoundStorageKey = 'study_learn_feedback_sound_enabled';
  mode: 'learn' | 'review' = 'learn';
  showHintMeta = false;
  hintUsed = false;
  isFeedbackSoundEnabled = true;
  todayPoems: StudyPlanPoemItem[] = [];
  roundQueue: StudyPlanPoemItem[] = [];
  currentQuestion: LearnQuestion | null = null;
  currentQueueIndex = 0;
  answered = false;
  answerCorrect = false;
  selectedOptionId = '';
  sessionCompleted = false;
  loading = false;
  questionUnavailable = false;
  answerPendingReveal = false;
  attemptedWrongOptionIds: string[] = [];
  currentQuestionHadWrongAttempt = false;
  private answerRevealTimer?: ReturnType<typeof setTimeout>;
  private feedbackAudio?: HTMLAudioElement;

  ngOnDestroy() {
    this.clearAnswerRevealTimer();
    this.stopFeedbackAudio();
  }

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  async ionViewWillEnter() {
    this.mode = this.activatedRoute.snapshot.queryParamMap.get('mode') === 'review' ? 'review' : 'learn';
    this.loadFeedbackSoundPreference();
    await this.loadTodaySession();
  }

  get isReviewMode(): boolean {
    return this.mode === 'review';
  }

  get remainingCount(): number {
    return this.isReviewMode
      ? this.todayPoems.length
      : Math.max(this.todayPoems.length - this.todayPoems.filter((poem) => poem?.learned === true || poem?.wrong === true).length, 0);
  }

  get toolbarTitle(): string {
    return this.isReviewMode ? `待复习 ${this.remainingCount} 句` : `需学习 ${this.remainingCount} 句`;
  }

  get hasPlan(): boolean {
    return Boolean(this.data.currentStudyPlan);
  }

  get currentPoem(): any | null {
    return this.currentQuestion?.poem || null;
  }

  get detailParagraphs(): string[] {
    const paragraphs = this.currentPoem?.paragraphs;
    if (Array.isArray(paragraphs) && paragraphs.length > 0) {
      return paragraphs.filter((item:any) => `${item || ''}`.trim() !== '');
    }

    if (this.currentPoem?.sample) {
      return [`${this.currentPoem.sample}`];
    }

    return [];
  }

  get shouldShowQuestion(): boolean {
    return !this.loading && !this.sessionCompleted && Boolean(this.currentQuestion) && (!this.answered || this.answerPendingReveal);
  }

  get shouldShowDetail(): boolean {
    return !this.loading && !this.sessionCompleted && this.answered && Boolean(this.currentQuestion);
  }

  get shouldShowBottomActionBar(): boolean {
    return !this.loading && !this.sessionCompleted && Boolean(this.currentPoem);
  }

  get canGoNext(): boolean {
    return this.questionUnavailable || (this.answered && !this.answerPendingReveal);
  }

  get completionTitle(): string {
    if (this.isReviewMode) {
      return this.todayPoems.length > 0 ? '复习已完成' : '当前没有需要复习的诗词';
    }

    return this.todayPoems.length > 0 ? '今日学习计划完成' : '当前没有需要学习的诗词';
  }

  get nextActionLabel(): string {
    if (!this.currentQuestion) {
      return '下一题';
    }

    if (this.isReviewMode) {
      return this.currentQueueIndex + 1 < this.roundQueue.length ? '下一题' : '完成';
    }

    if (this.currentQueueIndex + 1 < this.roundQueue.length) {
      return '下一题';
    }

    const wrongQueue = this.todayPoems.filter((poem) => poem?.learned !== true && poem?.wrong === true);
    if (wrongQueue.length > 0) {
      return '下一题';
    }

    const unresolvedQueue = this.todayPoems.filter((poem) => poem?.learned !== true);
    return unresolvedQueue.length > 0 ? '下一题' : '完成';
  }

  async selectOption(option: LearnOption) {
    if (
      this.answered ||
      this.answerPendingReveal ||
      !this.currentQuestion ||
      this.attemptedWrongOptionIds.includes(option.id)
    ) {
      return;
    }

    if (this.isReviewMode) {
      await this.data.markTodayReviewCompleted(this.currentQuestion.poem);
    }

    if (!option.isCorrect) {
      this.playFeedbackSound(false);
      this.selectedOptionId = option.id;
      this.currentQuestionHadWrongAttempt = true;
      this.attemptedWrongOptionIds = [...this.attemptedWrongOptionIds, option.id];
      this.data.updateCurrentStudyPlanPoemProgress(this.currentQuestion.poem, {
        learned: false,
        wrong: true,
      });
      await this.refreshTodayPoems();

      if (this.attemptedWrongOptionIds.length >= this.maxWrongAttempts) {
        const correctOption = this.currentQuestion.options.find((item) => item.isCorrect);
        if (correctOption) {
          await this.revealResolvedAnswer(correctOption, false);
        }
      }

      return;
    }

    this.playFeedbackSound(true);
    await this.revealResolvedAnswer(option, !this.currentQuestionHadWrongAttempt);
  }

  async slashCurrentPoem() {
    if (!this.currentQuestion) {
      return;
    }

    if (this.isReviewMode) {
      await this.data.markTodayReviewCompleted(this.currentQuestion.poem);
    }

    this.data.updateCurrentStudyPlanPoemProgress(this.currentQuestion.poem, {
      learned: true,
      wrong: false,
      everwronged: this.isReviewMode ? false : undefined,
    });

    await this.gotoNextQuestion();
  }

  revealHintMeta() {
    if (this.hintUsed) {
      return;
    }

    this.showHintMeta = true;
    this.hintUsed = true;
  }

  onSpeakerClick() {
    this.isFeedbackSoundEnabled = !this.isFeedbackSoundEnabled;
    this.saveFeedbackSoundPreference();

    if (!this.isFeedbackSoundEnabled) {
      this.stopFeedbackAudio();
    }
  }

  async gotoNextQuestion() {
    await this.refreshTodayPoems();

    if (this.isReviewMode) {
      await this.gotoNextReviewQuestion();
      return;
    }

    if (this.currentQueueIndex + 1 < this.roundQueue.length) {
      this.currentQueueIndex += 1;
      this.prepareQuestion(this.roundQueue[this.currentQueueIndex]);
      return;
    }

    const nextQueue = this.getPendingStudyQueue();
    if (nextQueue.length > 0) {
      this.roundQueue = nextQueue;
      this.currentQueueIndex = 0;
      this.prepareQuestion(this.roundQueue[0]);
      return;
    }

    this.currentQuestion = null;
    this.sessionCompleted = true;
    this.answered = false;
    this.selectedOptionId = '';
    this.questionUnavailable = false;
    this.answerPendingReveal = false;
  }

  getOptionState(option: LearnOption): 'correct' | 'wrong' | 'muted' | '' {
    if (!this.answerPendingReveal && this.attemptedWrongOptionIds.includes(option.id)) {
      return 'wrong';
    }

    if (!this.answerPendingReveal) {
      return '';
    }

    if (option.isCorrect) {
      return 'correct';
    }

    if (this.attemptedWrongOptionIds.includes(option.id)) {
      return 'wrong';
    }

    return 'muted';
  }

  isOptionLocked(option: LearnOption): boolean {
    return this.answerPendingReveal || this.attemptedWrongOptionIds.includes(option.id);
  }

  shouldShowOptionMeta(option: LearnOption): boolean {
    return this.selectedOptionId === option.id || this.attemptedWrongOptionIds.includes(option.id);
  }

  getOptionPoem(option: LearnOption): any | null {
    return option?.poem || null;
  }

  goToPlan() {
    this.router.navigate(['/tabs/tab3/study/plan']);
  }

  close() {
    this.router.navigate(['/tabs/tab3']);
  }

  detailItems(value: any): string[] {
    if (Array.isArray(value)) {
      return value.filter((item) => `${item || ''}`.trim() !== '');
    }

    if (`${value || ''}`.trim() !== '') {
      return [`${value}`];
    }

    return [];
  }

  private async loadTodaySession() {
    this.loading = true;
    this.sessionCompleted = false;
    this.showHintMeta = false;
    this.hintUsed = false;
    this.currentQuestion = null;
    this.answered = false;
    this.selectedOptionId = '';
    this.questionUnavailable = false;
    this.answerPendingReveal = false;
    this.attemptedWrongOptionIds = [];
    this.currentQuestionHadWrongAttempt = false;
    this.clearAnswerRevealTimer();

    try {
      await this.refreshTodayPoems();

      const initialQueue = this.getInitialQueue();
      if (initialQueue.length === 0) {
        this.roundQueue = [];
        this.currentQuestion = null;
        this.sessionCompleted = true;
        return;
      }

      this.roundQueue = initialQueue;
      this.currentQueueIndex = 0;
      this.prepareQuestion(this.roundQueue[0]);
    } finally {
      this.loading = false;
    }
  }

  private async refreshTodayPoems() {
    const poems = this.isReviewMode
      ? this.data.getCurrentStudyReviewPoems()
      : await this.data.ensureTodayStudyPlanPoems();
    this.todayPoems = poems.map((poem) => this.data.getStudyPlanPoemDetail(poem));
  }

  private getInitialQueue(): StudyPlanPoemItem[] {
    if (this.isReviewMode) {
      return [...this.todayPoems];
    }

    return this.getPendingStudyQueue();
  }

  private getPendingStudyQueue(): StudyPlanPoemItem[] {
    const unattemptedQueue = this.todayPoems.filter((poem) => poem?.learned !== true && poem?.wrong !== true);
    const wrongQueue = this.todayPoems.filter((poem) => poem?.learned !== true && poem?.wrong === true);

    return [...unattemptedQueue, ...wrongQueue];
  }

  private async gotoNextReviewQuestion() {
    const nextQueue = [...this.todayPoems];
    this.roundQueue = nextQueue;

    if (nextQueue.length === 0) {
      this.currentQuestion = null;
      this.sessionCompleted = true;
      this.answered = false;
      this.selectedOptionId = '';
      this.questionUnavailable = false;
      this.answerPendingReveal = false;
      return;
    }

    const currentKey = this.currentQuestion ? this.getPoemKey(this.currentQuestion.poem) : '';
    const currentIndexInNextQueue = nextQueue.findIndex((poem) => this.getPoemKey(poem) === currentKey);

    if (currentIndexInNextQueue === -1) {
      this.currentQueueIndex = Math.min(this.currentQueueIndex, nextQueue.length - 1);
      this.prepareQuestion(nextQueue[this.currentQueueIndex]);
      return;
    }

    if (currentIndexInNextQueue + 1 < nextQueue.length) {
      this.currentQueueIndex = currentIndexInNextQueue + 1;
      this.prepareQuestion(nextQueue[this.currentQueueIndex]);
      return;
    }

    this.currentQuestion = null;
    this.sessionCompleted = true;
    this.answered = false;
    this.selectedOptionId = '';
    this.questionUnavailable = false;
    this.answerPendingReveal = false;
  }

  private getPoemKey(poem: StudyPlanPoemItem): string {
    if (poem?.id != null && poem?.id !== '') {
      return `id:${poem.id}`;
    }

    return `text:${poem?.author || ''}::${poem?.title || ''}::${poem?.sample || poem?.paragraphs?.[0] || ''}`;
  }

  private prepareQuestion(poem: any) {
    const question = this.buildQuestion(poem);
    if (!question) {
      this.currentQuestion = {
        poem,
        firstHalf: '',
        secondHalf: '',
        options: [],
      };
      this.questionUnavailable = true;
      this.answered = true;
      this.answerCorrect = false;
      this.selectedOptionId = '';
      this.answerPendingReveal = false;
      this.attemptedWrongOptionIds = [];
      this.currentQuestionHadWrongAttempt = false;
      this.showHintMeta = false;
      this.hintUsed = false;
      return;
    }

    this.clearAnswerRevealTimer();
    this.currentQuestion = question;
    this.sessionCompleted = false;
    this.questionUnavailable = false;
    this.answerPendingReveal = false;
    this.answered = false;
    this.answerCorrect = false;
    this.selectedOptionId = '';
    this.attemptedWrongOptionIds = [];
    this.currentQuestionHadWrongAttempt = false;
    this.showHintMeta = false;
    this.hintUsed = false;
  }

  private async revealResolvedAnswer(option: LearnOption, resolvedAsCorrect: boolean) {
    if (!this.currentQuestion) {
      return;
    }

    this.selectedOptionId = option.id;
    this.answerCorrect = resolvedAsCorrect;

    this.data.updateCurrentStudyPlanPoemProgress(this.currentQuestion.poem, resolvedAsCorrect
      ? { learned: true, wrong: false }
      : { learned: false, wrong: true });

    if (resolvedAsCorrect) {
      this.answerPendingReveal = true;
      this.clearAnswerRevealTimer();
      this.answerRevealTimer = setTimeout(() => {
        this.answerPendingReveal = false;
        this.answered = true;
      }, 520);
      return;
    }

    this.answerPendingReveal = true;

    await this.refreshTodayPoems();

    this.clearAnswerRevealTimer();
    this.answerRevealTimer = setTimeout(() => {
      this.answerPendingReveal = false;
      this.answered = true;
    }, 520);
  }

  private clearAnswerRevealTimer() {
    if (this.answerRevealTimer) {
      clearTimeout(this.answerRevealTimer);
      this.answerRevealTimer = undefined;
    }
  }

  private playFeedbackSound(isCorrect: boolean) {
    if (!this.isFeedbackSoundEnabled) {
      return;
    }

    const source = isCorrect ? this.rightAnswerAudioSrc : this.wrongAnswerAudioSrc;

    this.stopFeedbackAudio();
    this.feedbackAudio = new Audio(source);
    this.feedbackAudio.currentTime = 0;

    const playPromise = this.feedbackAudio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.warn('Failed to play learn feedback sound.', error);
      });
    }
  }

  private stopFeedbackAudio() {
    if (!this.feedbackAudio) {
      return;
    }

    this.feedbackAudio.pause();
    this.feedbackAudio.currentTime = 0;
    this.feedbackAudio.src = '';
    this.feedbackAudio = undefined;
  }

  private loadFeedbackSoundPreference() {
    if (typeof localStorage === 'undefined') {
      this.isFeedbackSoundEnabled = true;
      return;
    }

    const storedValue = localStorage.getItem(this.feedbackSoundStorageKey);
    this.isFeedbackSoundEnabled = storedValue === null ? true : storedValue === 'true';
  }

  private saveFeedbackSoundPreference() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.feedbackSoundStorageKey, `${this.isFeedbackSoundEnabled}`);
  }

  private buildQuestion(poem: any): LearnQuestion | null {
    const sentence = this.extractLearnSentence(poem);
    if (!sentence) {
      return null;
    }

    const options = this.buildOptions(poem, sentence.secondHalf);
    if (options.length < 4) {
      return null;
    }

    return {
      poem,
      firstHalf: sentence.firstHalf,
      secondHalf: sentence.secondHalf,
      options,
    };
  }

  private buildOptions(correctPoem: any, correctAnswer: string): LearnOption[] {
    const distractors: LearnOption[] = [];
    const usedTexts = new Set<string>([correctAnswer]);

    const candidates = this.shuffleArray(this.data.JsonData)
      .map((poem:any) => {
        const sentence = this.extractLearnSentence(poem);
        return sentence ? { poem, sentence } : null;
      })
      .filter((item): item is { poem: any; sentence: { firstHalf: string; secondHalf: string } } => Boolean(item))
      .filter((item) => item.sentence.secondHalf.length === correctAnswer.length)
      .filter((item) => `${item.poem?.id}` !== `${correctPoem?.id}`);

    for (const candidate of candidates) {
      const optionText = candidate.sentence.secondHalf;
      if (usedTexts.has(optionText)) {
        continue;
      }

      usedTexts.add(optionText);
      distractors.push({
        id: `option-${distractors.length + 1}`,
        text: optionText,
        isCorrect: false,
        poem: candidate.poem,
      });

      if (distractors.length === 3) {
        break;
      }
    }

    if (distractors.length < 3) {
      return [];
    }

    return this.shuffleArray([
      {
        id: 'option-correct',
        text: correctAnswer,
        isCorrect: true,
        poem: correctPoem,
      },
      ...distractors,
    ]);
  }

  private extractLearnSentence(poem: any): { firstHalf: string; secondHalf: string } | null {
    const paragraphList = Array.isArray(poem?.paragraphs) ? poem.paragraphs : [];

    for (const paragraph of paragraphList) {
      const sentence = this.splitSentence(paragraph);
      if (sentence) {
        return sentence;
      }
    }

    if (paragraphList.length >= 2) {
      const firstHalf = `${paragraphList[0] || ''}`.replace(/[。！？!?；;]/g, '').trim();
      const secondHalf = `${paragraphList[1] || ''}`.replace(/[。！？!?；;]/g, '').trim();
      if (firstHalf && secondHalf) {
        return { firstHalf, secondHalf };
      }
    }

    return this.splitSentence(poem?.sample);
  }

  private splitSentence(text: any): { firstHalf: string; secondHalf: string } | null {
    const normalized = `${text || ''}`.replace(/\s+/g, '').trim();
    if (!normalized) {
      return null;
    }

    const separators = ['，', ',', '、'];
    for (const separator of separators) {
      if (!normalized.includes(separator)) {
        continue;
      }

      const parts = normalized
        .split(separator)
        .map((item) => item.replace(/[。！？!?；;]/g, '').trim())
        .filter((item) => item !== '');

      if (parts.length >= 2) {
        return {
          firstHalf: parts[0],
          secondHalf: parts[1],
        };
      }
    }

    return null;
  }

  private shuffleArray<T>(items: T[]): T[] {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }

    return result;
  }
}