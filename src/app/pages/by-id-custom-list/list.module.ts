import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { AuthorComponentModule } from 'src/app/components/author/author.module';
import { TextComponentModule } from 'src/app/components/text/text.module';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPageRoutingModule,
    AuthorComponentModule,
    TextComponentModule,
    SharedSwiperTouchModule,
    LazyLoadImageModule,
  ],
  declarations: [ListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListPageModule {}
