import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ButtonEndComponent } from './buttonend.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [ButtonEndComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [ButtonEndComponent]
})
export class ButtonEndComponentModule {}
