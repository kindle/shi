import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

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

  localJsonData:any;
  ionViewWillEnter() {
    this.localJsonData = this.data.collectList
      .filter(l=>l.group=='idlist');
    
  }

}
