import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { SharedCardShrinkModule } from '../modules/shared-card-shrink.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CardPathComponentModule } from '../components/card-path/card-path.module';
import { CardBalloonComponentModule } from '../components/card-balloon/card-balloon.module';
import { CardWaveComponentModule } from '../components/card-wave/card-wave.module';
import { CardMoonComponentModule } from '../components/card-moon/card-moon.module';
import { DogCardComponentModule } from '../components/dog-card/dog-card.module';
import { AsciiCardComponentModule } from '../components/ascii-card/ascii-card.module';
import { CatCardComponentModule } from '../components/cat-card/cat-card.module';

import { HotComponentModule } from '../components/hot/hot.module';
import { BigComponentModule } from '../components/big/big.module';
import { TileComponentModule } from '../components/tile/tile.module';
import { TextComponentModule } from '../components/text/text.module';
import { StarCardComponentModule } from '../components/star-card/star-card.module';
import { TreeCardComponentModule } from '../components/tree-card/tree-card.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SharedCardShrinkModule,
    LazyLoadImageModule,
    CardPathComponentModule,
    CardBalloonComponentModule,
    CardWaveComponentModule,
    CardMoonComponentModule,
    DogCardComponentModule,
    CatCardComponentModule,
    AsciiCardComponentModule,

    HotComponentModule,
    BigComponentModule,
    TileComponentModule,
    TextComponentModule,
    StarCardComponentModule,
    TreeCardComponentModule,
  ],
  declarations: [
    Tab1Page
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab1PageModule {}
