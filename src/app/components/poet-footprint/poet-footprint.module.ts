import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoetFootprintComponent } from './poet-footprint.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [PoetFootprintComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [PoetFootprintComponent],
})
export class PoetFootprintComponentModule {}
