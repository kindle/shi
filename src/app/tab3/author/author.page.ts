import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

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

  localJsonData:any;
  ionViewWillEnter() {
    this.localJsonData = this.data.collectList
      .filter(l=>l.group=='poetlist');
    
  }
}
