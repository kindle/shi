import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShufaPageRoutingModule } from './shufa-routing.module';

import { ShufaPage } from './shufa.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { SfComponentModule } from 'src/app/components/sf/sf.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShufaPageRoutingModule,
    LazyLoadImageModule,
    ButtonEndComponentModule,
    SfComponentModule,
  ],
  declarations: [ShufaPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShufaPageModule {}
