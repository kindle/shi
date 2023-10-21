import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthorComponent } from './author.component';
import { SharedSwiperTouchModule } from 'src/app/shared-modules/shared-swiper-touch.module';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, SharedSwiperTouchModule],
  declarations: [AuthorComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [AuthorComponent]
})
export class AuthorComponentModule {}
