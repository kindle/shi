import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddToCustomListPage } from './add-to-customlist.page';

const routes: Routes = [
  {
    path: '',
    component: AddToCustomListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddToCustomListPageRoutingModule {}
