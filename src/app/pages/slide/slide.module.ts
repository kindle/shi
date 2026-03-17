import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SlidePageRoutingModule } from './slide-routing.module';

import { SlidePage } from './slide.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SlidePageRoutingModule,
    LazyLoadImageModule,
    ButtonEndComponentModule,
  ],
  declarations: [SlidePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SlidePageModule {}
