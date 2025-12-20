import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
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
  },
  {
    path: 'me',
    loadChildren: () => import('../me/me.module').then( m => m.MePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('../tab3/dahui/list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'level',
    loadChildren: () => import('../tab3/dahui/level/level.module').then( m => m.LevelPageModule)
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
  },
  {
    path: 'gamenext/:id',
    loadChildren: () => import('../pages/game-next/next.module').then( m => m.NextPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
