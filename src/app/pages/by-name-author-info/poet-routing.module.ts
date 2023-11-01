import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoetPage } from './poet.page';

const routes: Routes = [
  {
    path: '',
    component: PoetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PoetPageRoutingModule {}
