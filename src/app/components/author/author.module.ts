import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthorComponent } from './author.component';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [ 
    CommonModule, 
    FormsModule, 
    IonicModule, 
    SharedSwiperTouchModule,
    LazyLoadImageModule,
  ],
  declarations: [AuthorComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [AuthorComponent]
})
export class AuthorComponentModule {}
