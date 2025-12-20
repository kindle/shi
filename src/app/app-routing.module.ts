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
    loadChildren: () => import('./pages/viewer-image/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'article-viewer',
    loadChildren: () => import('./pages/viewer-article/article-viewer.module').then( m => m.ArticleViewerPageModule)
  },
  {
    path: 'player',
    loadChildren: () => import('./pages/player/player.module').then( m => m.PlayerPageModule)
  },
  {
    path: 'textzoom',
    loadChildren: () => import('./pages/textzoomer/textzoomer.module').then( m => m.TextZoomerPageModule)
  },
  {
    path: 'addplayerlist',
    loadChildren: () => import('./tab3/customlist/new-customlist/add-playerlist.module').then( m => m.AddPlayerListPageModule)
  },
  {
    path: 'addtocustomlist',
    loadChildren: () => import('./tab3/customlist/add-to-customlist/add-to-customlist.module').then( m => m.AddToCustomListPageModule)
  },
  {
    path: 'searchtocustomlist',
    loadChildren: () => import('./tab3/customlist/search-to-customlist/search-to-customlist.module').then( m => m.SearchToCustomListPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./pages/chat/history/history.module').then( m => m.HistoryPageModule)
  },
  {
    path: 'game-kao',
    loadChildren: () => import('./tab3/dahui/list/list.module').then( m => m.ListPageModule)
  },
  {
    path: 'game-kao-level',
    loadChildren: () => import('./tab3/dahui/level/level.module').then( m => m.LevelPageModule)
  },
  {
    path: 'game-dahui',
    loadChildren: () => import('./tab3/dahui/game-audio/game-audio.module').then( m => m.GameAudioPageModule)
  },
  {
    path: 'history-today',
    loadChildren: () => import('./pages/history-today/history-today.module').then( m => m.HistoryTodayPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
