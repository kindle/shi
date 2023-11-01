import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArticleViewerPageRoutingModule } from './article-viewer-routing.module';

import { ArticleViewerPage } from './article-viewer.page';
import { HotComponentModule } from '../../components/hot/hot.module';
import { TileComponentModule } from '../../components/tile/tile.module';
import { TextComponentModule } from 'src/app/components/text/text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArticleViewerPageRoutingModule,
    HotComponentModule,
    TileComponentModule,
    TextComponentModule,
  ],
  declarations: [ArticleViewerPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArticleViewerPageModule {}
