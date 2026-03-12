import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubTitleComponent } from './sub-title.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [SubTitleComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [SubTitleComponent]
})
export class SubTitleComponentModule {}