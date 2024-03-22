import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchToCustomListPage } from './search-to-customlist.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyLoadImageModule,
  ],
  declarations: [SearchToCustomListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchToCustomListPageModule {}
