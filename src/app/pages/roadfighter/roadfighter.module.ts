import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoadfighterPageRoutingModule } from './roadfighter-routing.module';
import { RoadfighterPage } from './roadfighter.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RoadfighterPageRoutingModule],
  declarations: [RoadfighterPage],
})
export class RoadfighterPageModule {}
