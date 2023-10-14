import { Component } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.page.html',
  styleUrls: ['./tag.page.scss'],
})
export class TagPage {

  constructor(
    public data:DataService,
    public ui: UiService
  ) { }

}
