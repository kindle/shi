import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Tab5PageRoutingModule } from './tab5-routing.module';

import { Tab5Page } from './tab5.page';
import { HotComponentModule } from '../components/hot/hot.module';
import { BigComponentModule } from '../components/big/big.module';
import { TileComponentModule } from '../components/tile/tile.module';
import { TextComponentModule } from '../components/text/text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab5PageRoutingModule,
    HotComponentModule,
    BigComponentModule,
    TileComponentModule,
    TextComponentModule
  ],
  declarations: [Tab5Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab5PageModule {}
