import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-triangle',
  templateUrl: './card-triangle.component.html',
  styleUrls: ['./card-triangle.component.scss'],
})
export class CardTriangleComponent {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  constructor(
    public data : DataService,
    public ui: UiService,
    private zone: NgZone,
  ) { }

}
