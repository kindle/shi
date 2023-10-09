import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthorComponent } from './author.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [AuthorComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [AuthorComponent]
})
export class AuthorComponentModule {}
