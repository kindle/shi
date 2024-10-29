import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TextZoomerPageRoutingModule } from './textzoomer-routing.module';

import { TextZoomerPage } from './textzoomer.page';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextZoomerPageRoutingModule,
    ButtonEndComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [TextZoomerPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TextZoomerPageModule {}
