import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackerDetailPageRoutingModule } from './tracker-detail-routing.module';

import { TrackerDetailPage } from './tracker-detail.page';
import { ShiTrackerModule } from 'src/app/components/shi-tracker/shi-tracker.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackerDetailPageRoutingModule,
    ShiTrackerModule,
  ],
  declarations: [TrackerDetailPage]
})
export class TrackerDetailPageModule {}
