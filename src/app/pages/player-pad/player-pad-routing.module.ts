import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerPadPage } from './player-pad.page';

const routes: Routes = [
  {
    path: '',
    component: PlayerPadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerPadPageRoutingModule {}
