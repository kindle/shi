import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-moon',
  templateUrl: './card-moon.component.html',
  styleUrls: ['./card-moon.component.scss'],
})
export class CardMoonComponent  implements OnInit {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;

  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  ngOnInit() {
  }
}