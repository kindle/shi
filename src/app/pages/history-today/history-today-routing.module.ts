import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HistoryTodayPage } from './history-today.page';

const routes: Routes = [
  {
    path: '',
    component: HistoryTodayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistoryTodayPageRoutingModule {}
