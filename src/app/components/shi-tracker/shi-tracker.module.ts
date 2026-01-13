import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ShiTrackerComponent } from './shi-tracker.component';

@NgModule({
  declarations: [ShiTrackerComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [ShiTrackerComponent]
})
export class ShiTrackerModule { }
