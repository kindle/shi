import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { LevelCardComponentModule } from 'src/app/components/level-card/level-card.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPageRoutingModule,
    LevelCardComponentModule,
    LazyLoadImageModule,
  ],
  declarations: [ListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListPageModule {}
