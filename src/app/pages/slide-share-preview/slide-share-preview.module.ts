import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SlideSharePreviewPageRoutingModule } from './slide-share-preview-routing.module';

import { SlideSharePreviewPage } from './slide-share-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SlideSharePreviewPageRoutingModule,
  ],
  declarations: [SlideSharePreviewPage],
})
export class SlideSharePreviewPageModule {}
