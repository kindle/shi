import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompassPage } from './compass.page';

const routes: Routes = [
  {
    path: '',
    component: CompassPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompassPageRoutingModule {}