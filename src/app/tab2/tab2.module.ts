import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { HotComponentModule } from '../components/hot/hot.module';
import { StationComponentModule } from '../components/big-station/station.module';
import { TileComponentModule } from '../components/tile/tile.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab2PageRoutingModule,
    HotComponentModule,
    StationComponentModule,
    TileComponentModule,
  ],
  declarations: [Tab2Page],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2PageModule {}
