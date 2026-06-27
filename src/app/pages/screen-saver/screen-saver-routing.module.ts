import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScreenSaverPage } from './screen-saver.page';

const routes: Routes = [
  {
    path: '',
    component: ScreenSaverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScreenSaverPageRoutingModule {}
