import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TextZoomerPage } from './textzoomer.page';

const routes: Routes = [
  {
    path: '',
    component: TextZoomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextZoomerPageRoutingModule {}
