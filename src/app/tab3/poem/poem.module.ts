import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoemPageRoutingModule } from './poem-routing.module';

import { PoemPage } from './poem.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoemPageRoutingModule
  ],
  declarations: [PoemPage]
})
export class PoemPageModule {}
