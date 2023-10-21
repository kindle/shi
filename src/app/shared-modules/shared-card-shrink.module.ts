import { NgModule } from '@angular/core';
import { CardShrinkDirective } from '../directives/card-shrink.directive';

@NgModule({
  declarations: [CardShrinkDirective],
  exports: [CardShrinkDirective],
})
export class SharedCardShrinkModule { }
