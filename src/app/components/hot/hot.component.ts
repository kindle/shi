import { AfterViewInit, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-hot',
  templateUrl: './hot.component.html',
  styleUrls: ['./hot.component.scss'],
})
export class HotComponent {

  @ViewChild('hotSwiper')
  hotSwiper?: ElementRef;

  @Input() name?: string;
  @Input() source?: any;
  @Input() audio?: string;
  @Input() hideAuthor?: boolean;

  currentSlideIndex = 0;

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

}
