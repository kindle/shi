import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScreenSaverPageRoutingModule } from './screen-saver-routing.module';

import { ScreenSaverPage } from './screen-saver.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScreenSaverPageRoutingModule
  ],
  declarations: [ScreenSaverPage]
})
export class ScreenSaverPageModule {}
