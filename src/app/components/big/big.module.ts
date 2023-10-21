import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BigComponent } from './big.component';
import { SharedSwiperTouchModule } from 'src/app/shared-modules/shared-swiper-touch.module';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, SharedSwiperTouchModule],
  declarations: [BigComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [BigComponent]
})
export class BigComponentModule {}
