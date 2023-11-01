import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab4Page } from './tab4.page';

const routes: Routes = [
  {
    path: '',
    component: Tab4Page
  },
  {
    path: 'list/:id',
    loadChildren: () => import('../pages/by-id-shi-list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'topic/:id',
    loadChildren: () => import('../pages/viewer-topic/topic.module').then( m => m.TopicPageModule)
  },
  {
    path: 'poet/:author',
    loadChildren: () => import('../pages/by-name-author-info/poet.module').then( m => m.PoetPageModule)
  },
  {
    path: 'tag/:tag',
    loadChildren: () => import('../pages/by-tag-shi-list/tag.module').then( m => m.TagPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab4PageRoutingModule {}
