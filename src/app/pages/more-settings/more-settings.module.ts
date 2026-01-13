import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MoreSettingsPageRoutingModule } from './more-settings-routing.module';

import { MoreSettingsPage } from './more-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MoreSettingsPageRoutingModule
  ],
  declarations: [MoreSettingsPage]
})
export class MoreSettingsPageModule {}
