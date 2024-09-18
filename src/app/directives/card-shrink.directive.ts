import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[card-shrink]',
})
export class CardShrinkDirective {
  @HostBinding('class.shrink-card') isCardPressed = false;

  @HostListener('press')
  onPress(): void {
    this.isCardPressed = true;
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isCardPressed = false;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent): void {
    this.isCardPressed = true;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    this.isCardPressed = false;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent): void {
    this.isCardPressed = false;
  }

  @HostListener('mousedown')
  onMouseDown(): void {
    this.isCardPressed = true;
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.isCardPressed = false;
  }
}
