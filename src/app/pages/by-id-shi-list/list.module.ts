import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { AuthorComponentModule } from 'src/app/components/author/author.module';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { ButtonEndComponentModule } from 'src/app/components/button-end/buttonend.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { TileComponentModule } from 'src/app/components/tile/tile.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TileComponentModule,
    ListPageRoutingModule,
    AuthorComponentModule,
    TextComponentModule,
    ButtonEndComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [ListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListPageModule {}
