import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LevelPageRoutingModule } from './level-routing.module';

import { LevelPage } from './level.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LevelPageRoutingModule,
    LazyLoadImageModule,
  ],
  declarations: [LevelPage]
})
export class LevelPageModule {}
