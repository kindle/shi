import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { SharedCardShrinkModule } from '../modules/shared-card-shrink.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SharedCardShrinkModule,
  ],
  declarations: [
    Tab1Page
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1PageModule {}
