import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'slide',
    loadChildren: () => import('./pages/slide/slide.module').then( m => m.SlidePageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./pages/image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'article-viewer',
    loadChildren: () => import('./pages/article-viewer/article-viewer.module').then( m => m.ArticleViewerPageModule)
  },
  {
    path: 'player',
    loadChildren: () => import('./pages/player/player.module').then( m => m.PlayerPageModule)
  },
  {
    path: 'addplayerlist',
    loadChildren: () => import('./pages/add-playlist/add-playerlist.module').then( m => m.AddPlayerListPageModule)
  },
  {
    path: 'tab5',
    loadChildren: () => import('./tab5/tab5.module').then( m => m.Tab5PageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
