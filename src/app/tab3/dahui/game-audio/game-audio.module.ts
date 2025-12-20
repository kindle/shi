import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GameAudioPageRoutingModule } from './game-audio-routing.module';

import { GameAudioPage } from './game-audio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameAudioPageRoutingModule
  ],
  declarations: [GameAudioPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GameAudioPageModule {}
