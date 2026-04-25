import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ShiNoteService } from '../services/shi-note.service';

@Component({
  selector: '[shi-note-editor]',
  exportAs: 'shiNoteEditor',
  template: `
    <!-- Hidden storage for original content -->
    <div #originalContent style="display: none;"><ng-content></ng-content></div>

    <ion-icon name="pencil-outline" 
              class="shi-note-edit-icon"
              style="margin-top:8px;"
              *ngIf="false&&!canEdit"
              (click)="toggleEdit($event)"></ion-icon>

    <!-- The editable content area -->
    <div #editor 
         class="shi-note-editable-area"
         [attr.contenteditable]="canEdit"
         style="outline: none; min-height: 1.25em;"
         (focus)="onFocus()"
         (blur)="onBlur()"
         (input)="onInput($event)"
         (mouseup)="checkSelection()" 
         (keyup)="checkSelection()" 
         (click)="checkSelection()" 
         (dblclick)="onDblClick($event)"
         (compositionstart)="onCompositionStart()"
         (compositionend)="onCompositionEnd($event)">
    </div>
  `,
  styles: [`
    [shi-note-editor] {
      position: relative;
    }
    .shi-note-editable-area {
        /* Inherit or set defaults */
        white-space: pre-wrap;
    }
    .shi-note-edit-icon {
        display: none;
        position: absolute;
        top: 2px; /* Slight adjustment */
        right: 20px;
        margin: 2px;
        z-index: 10;
        cursor: pointer;
        font-size: 1.25em; /* Match icon size likely */
    }
    .select-line .shi-note-edit-icon {
        display: block;
        right: 20px;
        position: absolute;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ShiNoteEditorComponent implements OnInit, AfterViewInit {
  @Input('shi-note-editor') initialContent: string = '';
  @Input() originalText: string = '';
  @Input() canEdit: boolean = false;
  @Input() cacheid: string = '';
  @Output() contentChange = new EventEmitter<string>();
  @Output() editorActive = new EventEmitter<ShiNoteEditorComponent>();

  @ViewChild('editor', { static: true }) editorRef!: ElementRef;
  @ViewChild('originalContent', { read: ElementRef, static: true }) originalContentRef!: ElementRef;

  // showToolbar = false; // logic moved to parent
  currentNoteColor = 'red';
  currentNoteSize = 'a';
  currentNoteLines = 1;
  private originalContent = '';

  storedRange: Range | null = null;
  isComposing = false;

  constructor(private hostEl: ElementRef, private noteService: ShiNoteService) {
      // Clear host contenteditable so only inner div is editable
      this.hostEl.nativeElement.contentEditable = 'false';
      this.hostEl.nativeElement.style.outline = 'none';
  }

  ngOnInit() {
      // Logic moved to ngAfterViewInit to handle content projection
  }

  ngAfterViewInit() {
      let contentToUse = this.initialContent;
      const projected = this.originalContentRef?.nativeElement?.textContent || '';

      if (this.originalText) {
        this.originalContent = this.originalText;
      } else if (projected.length > 0) {
        this.originalContent = projected;
      }
      
      // If no input bound, use projected content
      if (!contentToUse && this.originalContentRef) {
          // Use textContent to get the projected text
          if (projected && projected.trim().length > 0) {
               contentToUse = projected;
          }
      }

      if (!this.originalContent) {
        this.originalContent = contentToUse || '';
      }

      if (contentToUse) {
          this.editorRef.nativeElement.innerHTML = this.parseTags(contentToUse);
      }
  }

  onFocus() {
    if(!this.canEdit) return;
    this.editorActive.emit(this);
    this.noteService.setActive(this);
  }

  activateEdit(ev?: MouseEvent) {
    this.canEdit = true;
    if(ev) ev.stopPropagation();
    
    setTimeout(() => {
      this.setFocus();
      
      if (ev) {
        const clientX = ev.clientX;
        const clientY = ev.clientY;

        // Try to set caret at click position
        if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(clientX, clientY);
            if (range && this.editorRef.nativeElement.contains(range.startContainer)) {
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        } else if ((document as any).caretPositionFromPoint) {
            // Firefox fallback
            const range = (document as any).caretPositionFromPoint(clientX, clientY);
            if (range && this.editorRef.nativeElement.contains(range.offsetNode)) {
                const sel = window.getSelection();
                const r = document.createRange();
                r.setStart(range.offsetNode, range.offset);
                r.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(r);
            }
        }
      }
    }, 0);
  }

  onDblClick(ev: any) {
    // Only handle if not already editing
    if (!this.canEdit) {
      ev.stopPropagation();
      this.activateEdit(ev);
    }
  }

  toggleEdit(ev: Event) {
    ev.stopPropagation(); 
    this.canEdit = !this.canEdit;
    if (this.canEdit) {
      setTimeout(() => this.setFocus(), 0);
    } else {
        this.noteService.setActive(null);
    }
  }

  setFocus() {
    if(!this.canEdit) return;
    this.editorRef.nativeElement.focus();
    this.editorActive.emit(this);
    this.noteService.setActive(this);
  }
  
  onBlur() {
     // Optional: emit null? But blur happens before click on toolbar usually.
     // We rely on Page to handle state switching.
  }

  // --- Logic from NotesPage ---

  parseTags(text: string): string {
    return text.replace(/\[t:(.*?)\|l:(.*?)\|c:(.*?)\|s:(.*?)\]/g, (match, t, l, c, s) => {
      const lines = parseInt(l) || 1;
      let style = '';
      if (lines > 1) {
          const chars = t.length;
          const perLine = Math.ceil(chars / lines);
          style = `width:${perLine}em;`; 
      }
      return `<span class="note color-${c} size-${s} lines-${l}" data-c="${c}" data-s="${s}" data-l="${l}"><span class="note-text" style="${style}">${t}</span></span>`;
    });
  }

  onCompositionStart() {
    this.isComposing = true;
  }

  onCompositionEnd(event: any) {
    this.isComposing = false;
    setTimeout(() => {
        if (event.data) {
            this.checkAndApplyNote(event.data);
            this.updateBackgroundString();
        }
    }, 0);
  }

  onInput(event: any) {
    if(!this.canEdit) return;
    if (this.isComposing || event.inputType === 'insertFromComposition') {
      return;
    }
    if (event.inputType === 'insertText') {
        this.checkAndApplyNote(event.data);
    }
    this.updateBackgroundString();
  }

  checkSelection() {
    //if(!this.canEdit) return;
    this.editorActive.emit(this); // Ensure we are the active editor
    this.noteService.setActive(this);

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const editor = this.editorRef.nativeElement;

    if (editor.contains(range.commonAncestorContainer)) {
      this.storedRange = range.cloneRange();
      
      let noteNode = this.getParentNote(range.commonAncestorContainer);
      
      if (noteNode) {
        this.currentNoteColor = noteNode.dataset['c'] || 'red';
        this.currentNoteSize = noteNode.dataset['s'] || 'b';
        this.currentNoteLines = parseInt(noteNode.dataset['l'] || '1', 10);
      }
      // Emit state change if parent listens? 
      // For now, parent pulls state when needed via reference
    }
  }

  checkAndApplyNote(text: string | null) {
    if (!text) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const node = range.endContainer;
    const offset = range.endOffset;
    
    // Ensure selection is inside THIS editor
    if (!this.editorRef.nativeElement.contains(node)) return;
    
    if (this.getParentNote(node)) return;

    if (node.nodeType === Node.TEXT_NODE) {
        const start = offset - text.length;
        if (start >= 0) {
            const newRange = document.createRange();
            newRange.setStart(node, start);
            newRange.setEnd(node, offset);
            this.createNoteFromRange(newRange);
        }
    }
  }

  createNoteFromRange(range: Range) {
    if (range.collapsed) return;

    const selectedText = range.toString();
    const span = document.createElement('span');
    span.className = 'note';
    
    const inner = document.createElement('span');
    inner.className = 'note-text';
    inner.textContent = selectedText;
    span.appendChild(inner);

    this.updateNoteStyle(span);

    range.deleteContents();
    range.insertNode(span);
    
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(inner);
        newRange.collapse(false);
        selection.addRange(newRange);
        this.storedRange = newRange.cloneRange();
    }
  }

  getParentNote(node: Node | null): HTMLElement | null {
    while (node && node !== this.editorRef.nativeElement) {
      if (node && node.nodeName === 'SPAN' && (node as HTMLElement).classList.contains('note')) {
        return node as HTMLElement;
      }
      if (node) {
        node = node.parentNode;
      } else {
        return null;
      }
    }
    return null;
  }

  restoreSelection() {
      const selection = window.getSelection();
      if (selection && this.storedRange) {
          selection.removeAllRanges();
          selection.addRange(this.storedRange);
      }
  }

  setNormal() {
    this.restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // Ensure inside this editor
    if (!this.editorRef.nativeElement.contains(range.commonAncestorContainer)) return;

    let noteNode = this.getParentNote(range.commonAncestorContainer);

    if (noteNode) {
      const text = document.createTextNode(noteNode.textContent || '');
      noteNode.parentNode?.replaceChild(text, noteNode);
      this.updateBackgroundString();
      this.storedRange = null; 
    }
  }

  setNote() {
    this.restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    // Ensure inside this editor
    if (!this.editorRef.nativeElement.contains(range.commonAncestorContainer)) return;
    
    let noteNode = this.getParentNote(range.commonAncestorContainer);
    if (noteNode) {
      this.updateNoteStyle(noteNode);
      this.updateBackgroundString();
      return;
    }
    this.createNoteFromRange(range);
    this.updateBackgroundString();
  }

  setOriginal() {
    if (this.cacheid) {
      localStorage.removeItem(this.cacheid);
    }
    this.editorRef.nativeElement.innerHTML = this.parseTags(this.originalContent || '');
    this.currentNoteColor = 'red';
    this.currentNoteSize = 'a';
    this.currentNoteLines = 1;
    this.storedRange = null;
    this.contentChange.emit(this.originalContent || '');
  }

  updateNoteStyle(element: HTMLElement) {
      element.dataset['c'] = this.currentNoteColor;
      element.dataset['s'] = this.currentNoteSize;
      element.dataset['l'] = this.currentNoteLines.toString();
      
      element.classList.remove('color-red', 'color-blue', 'size-a', 'size-b', 'size-c', 'lines-1', 'lines-2');
      element.classList.add(`color-${this.currentNoteColor}`);
      element.classList.add(`size-${this.currentNoteSize}`);
      element.classList.add(`lines-${this.currentNoteLines}`);

      const inner = element.querySelector('.note-text') as HTMLElement;
      if (inner) {
          if (this.currentNoteLines > 1) {
              const text = inner.textContent || '';
              const perLine = Math.ceil(text.length / this.currentNoteLines);
              inner.style.width = `${perLine}em`;
          } else {
              inner.style.width = '';
          }
      }
  }

  toggleColor() {
      this.currentNoteColor = this.currentNoteColor === 'red' ? 'blue' : 'red';
      this.applyToSelection();
  }

  toggleSize() {
      if (this.currentNoteSize === 'a') this.currentNoteSize = 'b';
      else if (this.currentNoteSize === 'b') this.currentNoteSize = 'c';
      else this.currentNoteSize = 'a';
      this.applyToSelection();
  }

  toggleLines() {
      this.currentNoteLines = this.currentNoteLines === 1 ? 2 : 1;
      this.applyToSelection();
  }

  applyToSelection() {
      this.restoreSelection();
      if (!this.storedRange) return;
      
    let noteNode = this.getParentNote(this.storedRange.commonAncestorContainer);

    if (noteNode) {
        this.updateNoteStyle(noteNode);
        this.updateBackgroundString();
    } else if (this.storedRange && !this.storedRange.collapsed) {
        this.setNote(); 
    }
  }

  updateBackgroundString() {
    const editor = this.editorRef.nativeElement;
    if (!editor) return;
    
    let result = '';
    const parseNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === 'SPAN' && el.classList.contains('note')) {
                const text = el.textContent;
                const c = el.dataset['c'] || 'red';
                const s = el.dataset['s'] || 'a';
                const l = el.dataset['l'] || '1';
                result += `[t:${text}|l:${l}|c:${c}|s:${s}]`;
            } else if (el.tagName === 'BR') {
                result += '\n'; 
            } else if (el.tagName === 'DIV') {
                 if (result.length > 0 && !result.endsWith('\n')) result += '\n';
                 el.childNodes.forEach(child => parseNodes(child));
            } else {
                el.childNodes.forEach(child => parseNodes(child));
            }
        }
    };
    
    editor.childNodes.forEach((child: Node) => parseNodes(child));
    //save value to it.
    if (this.cacheid) {
        localStorage.setItem(this.cacheid, result);
    }
    //console.log('Background Text:', this.cacheid, result);
    //save value to it.


    this.contentChange.emit(result);
  }
}

