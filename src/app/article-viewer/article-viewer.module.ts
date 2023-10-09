import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArticleViewerPageRoutingModule } from './article-viewer-routing.module';

import { ArticleViewerPage } from './article-viewer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArticleViewerPageRoutingModule
  ],
  declarations: [ArticleViewerPage]
})
export class ArticleViewerPageModule {}
