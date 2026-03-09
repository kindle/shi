import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[shi-note]'
})
export class ShiNoteDirective implements OnInit, OnChanges, AfterViewInit {
  @Input('shi-note') content: string = '';

  constructor(private el: ElementRef) { }

  ngOnInit() {
    // Moved to AfterViewInit to ensure text content is available
  }

  ngAfterViewInit() {
      this.updateContent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && !changes['content'].isFirstChange()) {
        this.updateContent();
    }
  }

  private updateContent() {
    // If input is provided, use it. Otherwise use element text content.
    let text = this.content || '';
    
    // Check if input is empty string (attribute usage <div shi-note>...</div>)
    if (!text && this.el.nativeElement) {
        // Use text content if no input string provided
        text = this.el.nativeElement.textContent;
    }

    if (text) {
      // Basic encoding/decoding if needed, but innerHTML assignment should handle special chars if parsed correctly
      // But textContent might include newlines which we want to keep if formatted but regex runs on string
      const parsed = this.parseTags(text);
      if (parsed !== text) {
          this.el.nativeElement.innerHTML = parsed;
      }
    }
  }


  private parseTags(text: string): string {
    if (!text) return '';
    
    // Handle newlines first? 
    // If text has \n, we might want <br> or wrap in divs.
    // The original logic in NotesPage wrapped paragraphs in divs.
    // Here we are inside a host element (e.g. div).
    // If the text has newlines, we should probably respect them.
    // But let's stick to the core parsing of [t:...] first.
    
    // Expected format: [t:text|l:2|c:red|s:a]
    let parsed = text.replace(/\[t:(.*?)\|l:(.*?)\|c:(.*?)\|s:(.*?)\]/g, (match, t, l, c, s) => {
      const lines = parseInt(l) || 1;
      let style = '';
      if (lines > 1) {
          const chars = t.length;
          const perLine = Math.ceil(chars / lines);
          style = `width:${perLine}em;`; 
      }
      return `<span class="note color-${c} size-${s} lines-${l}" data-c="${c}" data-s="${s}" data-l="${l}"><span class="note-text" style="${style}">${t}</span></span>`;
    });

    // Simple newline handling if not wrapped in tags?
    // parsed = parsed.replace(/\n/g, '<br>'); // Optional
    
    return parsed;
  }
}
