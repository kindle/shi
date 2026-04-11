import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoetPageRoutingModule } from './poet-routing.module';

import { PoetPage } from './poet.page';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { HotComponentModule } from 'src/app/components/hot/hot.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { AuthorComponentModule } from 'src/app/components/author/author.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PoetPageRoutingModule,
    AuthorComponentModule,
    TextComponentModule,
    ButtonEndComponentModule,
    HotComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [PoetPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PoetPageModule {}
