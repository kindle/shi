import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LevelCardComponent } from './level-card.component';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';
import { ButtonEndComponentModule } from '../button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SharedCardShrinkModule } from 'src/app/modules/shared-card-shrink.module';

@NgModule({
  imports: [ 
    CommonModule,
    FormsModule, 
    IonicModule, 
    SharedSwiperTouchModule, 
    ButtonEndComponentModule,
    LazyLoadImageModule,
    SharedCardShrinkModule,
  ],
  declarations: [LevelCardComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [LevelCardComponent]
})
export class LevelCardComponentModule {}
