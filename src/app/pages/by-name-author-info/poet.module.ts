import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoetPageRoutingModule } from './poet-routing.module';

import { PoetPage } from './poet.page';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoetPageRoutingModule,
    TextComponentModule,
    ButtonEndComponentModule
  ],
  declarations: [PoetPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PoetPageModule {}
