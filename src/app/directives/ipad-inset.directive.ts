import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[ipadInset]',
})
export class IpadInsetDirective {
  private enabled = false;
  private insetSize = '20px';

  @Input()
  set ipadInset(value: boolean | string | null | undefined) {
    this.enabled = value !== false && value !== 'false' && value != null;
  }

  @Input()
  set ipadInsetSize(value: string | null | undefined) {
    this.insetSize = value || '20px';
  }

  @HostBinding('style.margin-left')
  get marginLeft(): string | null {
    return this.enabled ? this.insetSize : null;
  }

  @HostBinding('style.padding-right')
  get paddingRight(): string | null {
    return this.enabled ? this.insetSize : null;
  }
}