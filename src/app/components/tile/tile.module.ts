import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TileComponent } from './tile.component';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SfComponentModule } from '../sf/sf.module';

@NgModule({
  imports: [ 
    CommonModule, 
    FormsModule, 
    IonicModule, 
    SharedSwiperTouchModule,
    LazyLoadImageModule,
    SfComponentModule
  ],
  declarations: [TileComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [TileComponent]
})
export class TileComponentModule {}
