import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MoreSettingsPage } from './more-settings.page';

const routes: Routes = [
  {
    path: '',
    component: MoreSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MoreSettingsPageRoutingModule {}
