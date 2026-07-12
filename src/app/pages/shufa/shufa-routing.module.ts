import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShufaPage } from './shufa.page';

const routes: Routes = [
  {
    path: '',
    component: ShufaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShufaPageRoutingModule {}
