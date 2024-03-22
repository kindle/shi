import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { StationComponentModule } from '../components/big-station/station.module';
import { HotComponentModule } from '../components/hot/hot.module';
import { TileListComponentModule } from '../components/tile-list/tilelist.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab3PageRoutingModule,
    HotComponentModule,
    StationComponentModule,
    TileListComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [Tab3Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab3PageModule {}
