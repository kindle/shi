import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[ion-card-shrink]',
})
export class CardAnimationDirective {
  @HostBinding('class.shrink-card') isCardPressed = false;

  @HostListener('press') onCardPress() {
    this.isCardPressed = true;
    console.log('pressed')
  }

  @HostListener('pressup') onCardRelease() {
    this.isCardPressed = false;
    console.log('press up')
  }
}
