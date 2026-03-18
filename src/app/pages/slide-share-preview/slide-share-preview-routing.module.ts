import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SlideSharePreviewPage } from './slide-share-preview.page';

const routes: Routes = [
  {
    path: '',
    component: SlideSharePreviewPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SlideSharePreviewPageRoutingModule {}
