import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-hot',
  templateUrl: './hot.component.html',
  styleUrls: ['./hot.component.scss'],
})
export class HotComponent {

  @Input() name?: string;
  @Input() source?: any;

  constructor(
    public data: DataService,
  ){}

}
