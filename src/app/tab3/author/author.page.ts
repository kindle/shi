import { Component } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.page.html',
  styleUrls: ['./author.page.scss'],
})
export class AuthorPage {

  constructor(
    public data: DataService,
    public ui: UiService,
  ) { }
}
