import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab5Page } from './tab5.page';

const routes: Routes = [
  {
    path: '',
    component: Tab5Page
  },
  {
    path: 'list/:id',
    loadChildren: () => import('../pages/list-by-id/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'topic/:id',
    loadChildren: () => import('../pages/topic/topic.module').then( m => m.TopicPageModule)
  },
  {
    path: 'poet/:author',
    loadChildren: () => import('../pages/list-by-poet/poet.module').then( m => m.PoetPageModule)
  },
  {
    path: 'tag/:tag',
    loadChildren: () => import('../pages/list-by-tag/tag.module').then( m => m.TagPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab5PageRoutingModule {}
