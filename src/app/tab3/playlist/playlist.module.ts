import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayListPageRoutingModule } from './playlist-routing.module';

import { PlayListPage } from './playlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlayListPageRoutingModule
  ],
  declarations: [PlayListPage]
})
export class PlayListPageModule {}
