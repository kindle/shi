import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ShiNoteEditorComponent } from '../directives/shi-note-editor.component';

@Injectable({
  providedIn: 'root'
})
export class ShiNoteService {
  private activeEditorSubject = new Subject<ShiNoteEditorComponent | null>();
  activeEditor$ = this.activeEditorSubject.asObservable();

  setActive(editor: ShiNoteEditorComponent | null) {
    this.activeEditorSubject.next(editor);
  }
}
