import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationComponent } from './station.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [StationComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [StationComponent]
})
export class StationComponentModule {}
