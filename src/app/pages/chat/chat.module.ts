import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SharedSwiperTouchModule } from 'src/app/modules/shared-swiper-touch.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    LazyLoadImageModule,
    SharedSwiperTouchModule,
  ],
  declarations: [
    ChatPage,
  ]
})
export class ChatPageModule {}
