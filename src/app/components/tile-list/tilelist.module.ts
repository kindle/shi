import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TileListComponent } from './tilelist.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [ 
    CommonModule, 
    FormsModule, 
    IonicModule,
    LazyLoadImageModule,
  ],
  declarations: [TileListComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  exports: [TileListComponent]
})
export class TileListComponentModule {}
