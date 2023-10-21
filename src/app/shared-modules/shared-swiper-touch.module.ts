import { NgModule } from '@angular/core';
import { SwiperTouchDirective } from '../directives/swiper-touch.directive';

@NgModule({
  declarations: [SwiperTouchDirective],
  exports: [SwiperTouchDirective],
})
export class SharedSwiperTouchModule { }
