import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SfComponent } from './sf.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [SfComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [SfComponent]
})
export class SfComponentModule {}
