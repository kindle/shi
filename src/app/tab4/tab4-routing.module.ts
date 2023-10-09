import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab4Page } from './tab4.page';

const routes: Routes = [
  {
    path: '',
    component: Tab4Page
  },
  {
    path: 'list',
    loadChildren: () => import('./list-by-id/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'topic',
    loadChildren: () => import('./topic/topic.module').then( m => m.TopicPageModule)
  },
  {
    path: 'poet',
    loadChildren: () => import('./list-by-poet-tag/poet.module').then( m => m.PoetPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab4PageRoutingModule {}
