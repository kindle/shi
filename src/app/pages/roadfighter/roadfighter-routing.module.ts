import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoadfighterPage } from './roadfighter.page';

const routes: Routes = [
  {
    path: '',
    component: RoadfighterPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoadfighterPageRoutingModule {}
