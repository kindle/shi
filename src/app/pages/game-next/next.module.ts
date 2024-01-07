import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NextPageRoutingModule } from './next-routing.module';

import { NextPage } from './next.page';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NextPageRoutingModule,
    TextComponentModule,
    ButtonEndComponentModule,
    SharedSwiperTouchModule,
  ],
  declarations: [NextPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NextPageModule {}
