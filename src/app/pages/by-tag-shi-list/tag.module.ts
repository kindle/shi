import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TagPageRoutingModule } from './tag-routing.module';

import { TagPage } from './tag.page';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TagPageRoutingModule,
    TextComponentModule,
    ButtonEndComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [TagPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TagPageModule {}
