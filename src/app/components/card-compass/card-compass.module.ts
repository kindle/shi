import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CardCompassComponent } from './card-compass.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [CardCompassComponent],
  exports: [CardCompassComponent],
})
export class CardCompassComponentModule {}