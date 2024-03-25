import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TutorialPageRoutingModule } from './tutorial-routing.module';

import { TutorialPage } from './tutorial.page';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TutorialPageRoutingModule,
    SharedSwiperTouchModule,
  ],
  declarations: [TutorialPage],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export class TutorialPageModule {}
