import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayerPageRoutingModule } from './player-routing.module';

import { PlayerPage } from './player.page';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlayerPageRoutingModule,
    ButtonEndComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [PlayerPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlayerPageModule {}
