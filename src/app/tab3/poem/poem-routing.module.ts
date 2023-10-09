import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoemPage } from './poem.page';

const routes: Routes = [
  {
    path: '',
    component: PoemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PoemPageRoutingModule {}
