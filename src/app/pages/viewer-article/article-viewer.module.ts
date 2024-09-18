import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArticleViewerPageRoutingModule } from './article-viewer-routing.module';

import { ArticleViewerPage } from './article-viewer.page';
import { HotComponentModule } from '../../components/hot/hot.module';
import { TileComponentModule } from '../../components/tile/tile.module';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CardMoonComponentModule } from 'src/app/components/card-moon/card-moon.module';
import { CardBalloonComponentModule } from 'src/app/components/card-balloon/card-balloon.module';
import { CardPathComponentModule } from 'src/app/components/card-path/card-path.module';
import { CardWaveComponentModule } from 'src/app/components/card-wave/card-wave.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArticleViewerPageRoutingModule,
    HotComponentModule,
    TileComponentModule,
    TextComponentModule,
    ButtonEndComponentModule,
    LazyLoadImageModule,
    CardMoonComponentModule,
    CardBalloonComponentModule,
    CardPathComponentModule,
    CardWaveComponentModule,
    
  ],
  declarations: [ArticleViewerPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArticleViewerPageModule {}
