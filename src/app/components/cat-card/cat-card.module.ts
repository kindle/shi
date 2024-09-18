import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CatCardComponent } from './cat-card.component';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';
import { ButtonEndComponentModule } from '../button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [ 
    CommonModule,
    FormsModule, 
    IonicModule, 
    SharedSwiperTouchModule, 
    ButtonEndComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [CatCardComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [CatCardComponent]
})
export class CatCardComponentModule {}
