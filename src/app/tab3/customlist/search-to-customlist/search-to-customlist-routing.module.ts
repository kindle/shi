import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchToCustomListPage } from './search-to-customlist.page';

const routes: Routes = [
  {
    path: '',
    component: SearchToCustomListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchToCustomListPageRoutingModule {}
