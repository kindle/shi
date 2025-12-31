import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayerPadPageRoutingModule } from './player-pad-routing.module';

import { PlayerPadPage } from './player-pad.page';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlayerPadPageRoutingModule,
    ButtonEndComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [PlayerPadPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PlayerPadPageModule {}
