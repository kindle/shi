import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameAudioPage } from './game-audio.page';

const routes: Routes = [
  {
    path: '',
    component: GameAudioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameAudioPageRoutingModule {}

