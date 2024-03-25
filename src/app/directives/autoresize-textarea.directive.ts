import { Directive, HostListener, ElementRef, Input } from "@angular/core";

@Directive({
    selector: "ion-textarea[autoresize]" 
})
export class AutoresizeDirective {
    @HostListener('input', ['$event.target'])
    onInput(textArea: HTMLTextAreaElement): void {
        this.adjust();
    }

    @HostListener('click', ['$event.target'])
    onFocus(textArea: HTMLTextAreaElement): void {
        this.adjust();
    }

    @HostListener('ionChange', ['$event.target'])
    change(textArea: HTMLTextAreaElement): void {
        this.adjust();
    }

    @Input('autoresize') maxHeight: number|any;
    
    constructor(public element: ElementRef) {}
    
    ngOnInit(): void {
        this.adjust();
    }

    adjust(): void {
        //let rootElement = this.element.nativeElement.shadowRoot; 
        let rootElement = this.element.nativeElement;
        if(rootElement){
            let ta = rootElement.querySelector("textarea"), newHeight;
            if (ta) {
                ta.style.overflow = "hidden";
                ta.style.height = "auto";
                if (this.maxHeight) {
                    newHeight = Math.min(ta.scrollHeight, this.maxHeight);
                } 
                else 
                {
                    newHeight = ta.scrollHeight;
                }
                ta.style.height = newHeight + "px";
            }
        }
    }

}