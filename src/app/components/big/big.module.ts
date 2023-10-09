import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BigComponent } from './big.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [BigComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [BigComponent]
})
export class BigComponentModule {}
