import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-sub-title',
  templateUrl: './sub-title.component.html',
})
export class SubTitleComponent {
  @Input() name?: string;

  constructor(public data: DataService) {}
}