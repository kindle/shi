import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-hot',
  templateUrl: './hot.component.html',
  styleUrls: ['./hot.component.scss'],
})
export class HotComponent {

  @Input() name?: string;
  @Input() source?: any;
  @Input() audio?: string;
  @Input() hideAuthor?: boolean;

  constructor(
    public data: DataService,
    public ui: UiService,
  ){
  }

}
