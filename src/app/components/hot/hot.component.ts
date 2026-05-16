import { Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-hot',
  templateUrl: './hot.component.html',
  styleUrls: ['./hot.component.scss'],
})
export class HotComponent implements OnDestroy {

  @ViewChild('hotSwiper')
  hotSwiper?: ElementRef;

  @Input() name?: string;
  @Input() source?: any;
  @Input() audio?: string;
  @Input() hideAuthor?: boolean;

  currentSlideIndex = 0;
  private refreshFrameId?: number;
  private refreshTimeoutId?: ReturnType<typeof setTimeout>;
  private mutationObserver?: MutationObserver;

  constructor(
    public data: DataService,
    public ui: UiService,
    private ngZone: NgZone,
  ){
  }

  ngAfterViewInit() {
    queueMicrotask(() => {
      const swiper = this.hotSwiper?.nativeElement?.swiper;
      if (!swiper) {
        return;
      }

      swiper.on('slideChange', () => {
        const activeIndex = typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex || 0;
        this.ngZone.run(() => {
          this.currentSlideIndex = this.getSafeSlideIndex(activeIndex);
        });
      });

      this.currentSlideIndex = this.getSafeSlideIndex(swiper.activeIndex || 0);
      this.watchSwiperDomChanges();
      this.scheduleSwiperRefresh();
    });
  }

  goToSlide(index: number) {
    this.currentSlideIndex = this.getSafeSlideIndex(index);
    this.hotSwiper?.nativeElement?.swiper?.slideTo(index);
  }

  getBulletIndexes() {
    return Array.from({ length: this.source?.length || 0 }, (_, index) => index);
  }

  private getSafeSlideIndex(index: number) {
    const total = this.source?.length || 0;
    if (total === 0) {
      return 0;
    }

    return Math.max(0, Math.min(index, total - 1));
  }

  private watchSwiperDomChanges() {
    const swiperElement = this.hotSwiper?.nativeElement;
    if (!swiperElement || this.mutationObserver) {
      return;
    }

    this.mutationObserver = new MutationObserver(() => {
      this.scheduleSwiperRefresh();
    });

    this.mutationObserver.observe(swiperElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private scheduleSwiperRefresh() {
    if (this.refreshFrameId) {
      cancelAnimationFrame(this.refreshFrameId);
    }

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    const update = () => {
      const swiper = this.hotSwiper?.nativeElement?.swiper;
      if (!swiper) {
        return;
      }

      swiper.updateSize();
      swiper.updateSlides();
      swiper.updateProgress();
      swiper.updateSlidesClasses();
      swiper.update();
      this.currentSlideIndex = this.getSafeSlideIndex(swiper.activeIndex || 0);
    };

    this.refreshFrameId = requestAnimationFrame(() => {
      update();
      this.refreshTimeoutId = setTimeout(update, 60);
    });
  }

  ngOnDestroy() {
    if (this.refreshFrameId) {
      cancelAnimationFrame(this.refreshFrameId);
    }

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    this.mutationObserver?.disconnect();
  }

  share(poem?: any){
    if(poem) //share poem
    {
      this.data.shareText(
        poem.author + "《" + poem.title + "》",
        this.data.showsample(poem),
        '',
        'https://reddah.blob.core.windows.net/msjjpoet/' + poem.author +".jpeg"
      );
    }
  }

}
