import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[swiper-touch]'
})
export class SwiperTouchDirective {
  constructor(private el: ElementRef) {}

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent): void {
    const swiper = this.el.nativeElement.swiper;
    if (swiper) {
      swiper.startTouchX = swiper.touches.startX;
      swiper.startTouchY = swiper.touches.startY;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    const swiper = this.el.nativeElement.swiper;
    if (swiper) {
      const etouches = swiper.touches;
      const dx = Math.abs(etouches.currentX - swiper.startTouchX);
      const dy = Math.abs(etouches.currentY - swiper.startTouchY);

      // Check if the swipe is more horizontal than vertical
      if (dx > dy) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
}
