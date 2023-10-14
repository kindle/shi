import { Component } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  constructor(
    public data:DataService,
    public ui: UiService
  ) { }

}
