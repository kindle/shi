import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab3Page } from './tab3.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
  },
  {
    path: 'playlist',
    loadChildren: () => import('./playlist/playlist.module').then( m => m.PlayListPageModule)
  },
  {
    path: 'author',
    loadChildren: () => import('./author/author.module').then( m => m.AuthorPageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'poem',
    loadChildren: () => import('./poem/poem.module').then( m => m.PoemPageModule)
  },
  {
    path: 'tag',
    loadChildren: () => import('./tag/tag.module').then( m => m.TagPageModule)
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
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}
