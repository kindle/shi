import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { IonicGestureConfig } from './utils/IonicGestureConfig';
import { EventService } from './services/event.service';
import { Media } from '@awesome-cordova-plugins/media/ngx'

import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CommonModule } from '@angular/common';
import { ScrollService } from './services/scroll.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({ mode: 'ios' }),
    AppRoutingModule, 
    HttpClientModule,
    IonicStorageModule.forRoot(),
    HammerModule,
    LazyLoadImageModule
  ],
  providers: 
  [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    SocialSharing,
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig },
    EventService,
    ScrollService,
    Media,
  ],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
