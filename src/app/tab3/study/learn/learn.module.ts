import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LearnPageRoutingModule } from './learn-routing.module';
import { LearnPage } from './learn.page';
import { DogCardComponentModule } from 'src/app/components/dog-card/dog-card.module';
import { TreeCardComponentModule } from 'src/app/components/tree-card/tree-card.module';
import { StarCardComponentModule } from 'src/app/components/star-card/star-card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LearnPageRoutingModule,
    DogCardComponentModule,
    TreeCardComponentModule,
    StarCardComponentModule,
  ],
  declarations: [LearnPage],
})
export class LearnPageModule {}