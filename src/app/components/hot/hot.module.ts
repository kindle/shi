import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HotComponent } from './hot.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [HotComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [HotComponent]
})
export class HotComponentModule {}
