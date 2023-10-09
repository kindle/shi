import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TopicPageRoutingModule } from './topic-routing.module';

import { TopicPage } from './topic.page';
import { HotComponentModule } from 'src/app/components/hot/hot.module';
import { BigComponentModule } from 'src/app/components/big/big.module';
import { TileComponentModule } from 'src/app/components/tile/tile.module';
import { TextComponentModule } from 'src/app/components/text/text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopicPageRoutingModule,
    HotComponentModule,
    BigComponentModule,
    TileComponentModule,
    TextComponentModule
  ],
  declarations: [TopicPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TopicPageModule {}
