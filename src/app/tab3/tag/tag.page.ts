import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

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

  localJsonData:any;
  ionViewWillEnter() {
    this.localJsonData = this.data.collectList
      .filter(l=>l.group=='taglist');
    console.log(this.localJsonData)
  }

}
