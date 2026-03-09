import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ShiNoteEditorComponent } from '../../directives/shi-note-editor.component';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
})
export class NotesPage implements OnInit, AfterViewInit {
  @ViewChild('editor', { static: false }) editorRef!: ElementRef;

  poem: any;
  showToolbar = false;
  
  // Note properties (synced with active editor)
  currentNoteColor = 'red';
  currentNoteSize = 'a';
  currentNoteLines = 1;

  storedRange: Range | null = null;
  // Use selectionchange to track valid ranges before blur happens
  private selectionChangeListener: any;

  isComposing = false;
  
  // Active inline editor reference
  activeInlineEditor: ShiNoteEditorComponent | null = null;

  constructor(public data: DataService, private sanitizer: DomSanitizer) { }

  onInlineEditorActive(editor: ShiNoteEditorComponent) {
      this.activeInlineEditor = editor;
      this.showToolbar = true;
      // Sync toolbar state
      this.currentNoteColor = editor.currentNoteColor;
      this.currentNoteSize = editor.currentNoteSize;
      this.currentNoteLines = editor.currentNoteLines;
  }

  // Hook for main editor to clear inline active state
  onMainEditorFocus() {
      this.activeInlineEditor = null;
      // Potentially sync toolbar state back to defaults or main editor state
  }


  ngOnInit() {
    if (this.data.currentPoem) {
      this.poem = this.data.currentPoem;
    }
    
    // Global listener to capture selection state
    this.selectionChangeListener = () => this.checkSelection();
    document.addEventListener('selectionchange', this.selectionChangeListener);
  }

  ngOnDestroy() {
    if (this.selectionChangeListener) {
        document.removeEventListener('selectionchange', this.selectionChangeListener);
    }
  }

  ngAfterViewInit() {
    if (this.poem && this.editorRef) {
      // Initialize content
      // Wrap paragraphs in divs for better editing experience than <br>
      // Also parse custom tags [t:text...] to spans
      const paragraphs = this.poem.paragraphs || [];
      const htmlContent = paragraphs.map((p: string) => `<div>${this.parseTags(p)}</div>`).join('');
      this.editorRef.nativeElement.innerHTML = htmlContent || '<div>Start typing...</div>';
    }
  }

  parseTags(text: string): string {
    // Expected format: [t:text|l:2|c:red|s:a]
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

  checkSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Don't hide immediately if we just clicked toolbar (handled by button actions)
      // But if selection is truly gone, clear storedRange? No, keep last valid one for a bit?
      // Actually, if we click outside editor (e.g. toolbar), selection might be cleared or moved.
      // We rely on the fact that before blur, we had a valid range.
      return;
    }

    const range = selection.getRangeAt(0);
    const editor = this.editorRef.nativeElement;

    // Only update state if selection is inside editor
    if (editor.contains(range.commonAncestorContainer)) {
      this.storedRange = range.cloneRange();
      
      // Identify if we are inside a note
      let noteNode = this.getParentNote(range.commonAncestorContainer);
      
      if (noteNode) {
        this.showToolbar = true;
        // Extract current style
        this.currentNoteColor = noteNode.dataset['c'] || 'red';
        this.currentNoteSize = noteNode.dataset['s'] || 'b';
        this.currentNoteLines = parseInt(noteNode.dataset['l'] || '1', 10);
      } else if (!selection.isCollapsed) {
        // Selecting text, not inside note yet
        this.showToolbar = true;
        // Re-apply defaults for NEW notes if we moved from an existing note
        // or keep last used? Usually defaults reset.
        // The prompt implies: "by default ... if you click note ... changed to ... [t...]" which implies specific defaults
        // Let's ensure these defaults are robust
        // If user already changed settings, maybe keep them? 
        // For now, let's just show toolbar.
      } else {
        this.showToolbar = false;
      }
    } else {
        // Selection outside editor.
        // Don't hide toolbar if we are clicking ON it (which changes focus).
        // But how do we know? Focus event?
        // Let's leave showToolbar as is, until explicit action or editor blur that isn't toolbar.
    }
  }

  onCompositionStart() {
    this.isComposing = true;
  }

  onCompositionEnd(event: any) {
    this.isComposing = false;
    // Handle IME input here to ensure text is committed
    // Wait for DOM to update
    setTimeout(() => {
        if (event.data) {
            this.checkAndApplyNote(event.data);
            this.updateBackgroundString();
        }
    }, 0);
  }

  onInput(event: any) {
    // If we are composing (IME), skip normal input handling
    // or if it's insertFromComposition which is handled by onCompositionEnd
    if (this.isComposing || event.inputType === 'insertFromComposition') {
      return;
    }

    // Auto-convert typed text to Note if not already in one
    // Only for direct text input (non-IME)
    if (event.inputType === 'insertText') {
        this.checkAndApplyNote(event.data);
    }
    
    this.updateBackgroundString();
  }

  checkAndApplyNote(text: string | null) {
    if (!text) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const node = range.endContainer;
    const offset = range.endOffset;
    
    // Check if already in a note (or note text container)
    if (this.getParentNote(node)) return;

    // We are in Normal text. 
    // Select the just typed text
    if (node.nodeType === Node.TEXT_NODE) {
        const start = offset - text.length;
        if (start >= 0) {
            const newRange = document.createRange();
            newRange.setStart(node, start);
            newRange.setEnd(node, offset);
            
            // Create note directly from this range
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
    
    // Crucial: Move selection INTO the inner span so subsequent typing stays inside
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(inner);
        newRange.collapse(false); // Collapse to end
        selection.addRange(newRange);
        this.storedRange = newRange.cloneRange();
    }
  }

  getParentNote(node: Node | null): HTMLElement | null {
    while (node && node !== this.editorRef.nativeElement) {
      if (node.nodeName === 'SPAN' && (node as HTMLElement).classList.contains('note')) {
        return node as HTMLElement;
      }
      node = node.parentNode;
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
    if (this.activeInlineEditor) {
        this.activeInlineEditor.setNormal();
        return;
    }
    this.restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // Ensure we are in main editor
    if (this.editorRef && !this.editorRef.nativeElement.contains(range.commonAncestorContainer)) return;

    let noteNode = this.getParentNote(range.commonAncestorContainer);

    if (noteNode) {
      // Unwrap
      const text = document.createTextNode(noteNode.textContent || '');
      noteNode.parentNode?.replaceChild(text, noteNode);
      
      this.updateBackgroundString();
      // Update stored range to new text node?
      // It's tricky because DOM changed. Range is invalid.
      // Resetting storedRange might be safer.
      this.storedRange = null; 
      this.showToolbar = false; // Or check selection again
    }
  }

  setNote() {
    if (this.activeInlineEditor) {
        this.activeInlineEditor.setNote();
        return;
    }
    this.restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    // Ensure we are in main editor
    if (this.editorRef && !this.editorRef.nativeElement.contains(range.commonAncestorContainer)) return;
    
    // Check if already in a note
    let noteNode = this.getParentNote(range.commonAncestorContainer);
    if (noteNode) {
      // Just update attributes
      this.updateNoteStyle(noteNode);
      this.updateBackgroundString();
      return;
    }
    
    this.createNoteFromRange(range);
    this.updateBackgroundString();
  }
  
  toggleColor() {
      if (this.activeInlineEditor) {
          this.activeInlineEditor.toggleColor();
          this.currentNoteColor = this.activeInlineEditor.currentNoteColor;
          return;
      }
      this.currentNoteColor = this.currentNoteColor === 'red' ? 'blue' : 'red';
      this.applyToSelection();
  }

  toggleSize() {
      if (this.activeInlineEditor) {
          this.activeInlineEditor.toggleSize();
          this.currentNoteSize = this.activeInlineEditor.currentNoteSize;
          return;
      }
      if (this.currentNoteSize === 'a') this.currentNoteSize = 'b';
      else if (this.currentNoteSize === 'b') this.currentNoteSize = 'c';
      else this.currentNoteSize = 'a';
      this.applyToSelection();
  }

  toggleLines() {
      if (this.activeInlineEditor) {
          this.activeInlineEditor.toggleLines();
          this.currentNoteLines = this.activeInlineEditor.currentNoteLines;
          return;
      }
      this.currentNoteLines = this.currentNoteLines === 1 ? 2 : 1;
      this.applyToSelection();
  }

  applyToSelection() {
      this.restoreSelection();
      // Use storedRange for checking logic too
      if (!this.storedRange) return;
      
    let noteNode = this.getParentNote(this.storedRange ? this.storedRange.commonAncestorContainer : null);

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

    // Helper to escape special chars if needed | [ ]
    // But assuming simple text for now.
    
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
                const l = el.dataset['l'] || '2';
                // [t:text|l:2|c:red|s:a]
                result += `[t:${text}|l:${l}|c:${c}|s:${s}]`;
            } else if (el.tagName === 'BR') {
                result += '\n'; 
            } else if (el.tagName === 'DIV') {
                 // For editable divs, new lines are often new divs
                 if (result.length > 0 && !result.endsWith('\n')) result += '\n';
                 el.childNodes.forEach(child => parseNodes(child));
            } else {
                el.childNodes.forEach(child => parseNodes(child));
            }
        }
    };
    
    editor.childNodes.forEach((child: Node) => parseNodes(child));
    console.log('Background Text:', result);
    // Here you would save 'result' to your service or backend
    this.debugString = result;
  }

  debugString = '';
  debugHtml: SafeHtml = '';

  onDebugInput(event: any) {
    const value = event.target.value;
    this.debugString = value;
    const html = value ? this.parseTags(value) : '';
    // We already trust our own parseTags output
    this.debugHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  updateNoteStyle(element: HTMLElement) {
      element.dataset['c'] = this.currentNoteColor;
      element.dataset['s'] = this.currentNoteSize;
      element.dataset['l'] = this.currentNoteLines.toString();
      
      // Update classes for visual feedback
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

  edit = false;

  change() {
    this.edit = !this.edit;
  }
}

