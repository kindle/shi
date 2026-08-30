import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { IonicModule } from '@ionic/angular';

import { AddPlayerListPage } from './add-playerlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LazyLoadImageModule,
    IonicModule
  ],
  declarations: [AddPlayerListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddPlayerListPageModule {}
