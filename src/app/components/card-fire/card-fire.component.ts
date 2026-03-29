import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-fire',
  templateUrl: './card-fire.component.html',
  styleUrls: ['./card-fire.component.scss'],
})
export class CardFireComponent  implements OnInit {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  ngOnInit() {
  }
}