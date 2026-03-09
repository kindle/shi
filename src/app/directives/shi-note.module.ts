import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ShiNoteDirective } from './shi-note.directive';
import { ShiNoteEditorComponent } from './shi-note-editor.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [ShiNoteDirective, ShiNoteEditorComponent],
  exports: [ShiNoteDirective, ShiNoteEditorComponent]
})
export class ShiNoteModule {}