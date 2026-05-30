import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { PickPage } from './pick.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyLoadImageModule,
  ],
  declarations: [PickPage],
  exports: [PickPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PickPageModule {}