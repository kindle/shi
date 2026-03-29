import { Component, ElementRef, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-butterfuly',
  templateUrl: './card-butterfuly.component.html',
  styleUrls: ['./card-butterfuly.component.scss'],
})
export class CardButterfulyComponent {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  constructor(
    public data: DataService,
    public ui: UiService,
    private host: ElementRef<HTMLElement>,
  ) {}
}