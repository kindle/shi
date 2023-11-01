import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPlayerListPage } from './add-playerlist.page';

const routes: Routes = [
  {
    path: '',
    component: AddPlayerListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPlayerListPageRoutingModule {}
