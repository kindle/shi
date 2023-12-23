import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  searchTopicData:any;
  localFunData:any;
  localScrollData:any;
  
  constructor(
    public data : DataService,
    public ui: UiService,
  ) {
    this.data.currentTopicId = 200;
    this.searchTopicData = this.data.tab2BrowseTopicData
      .filter((d:any)=>d.id==this.data.currentTopicId)[0];
    this.localFunData = this.data.getFunData('tab2_');
    this.localScrollData = this.data.getFunData('tab2_scroll_');
    console.log(this.localScrollData);
    console.log(this.searchTopicData.scroll)
    this.localScrollData.forEach((e:any) => {
      e.alias = e.sub;
      e.text = e.desc;
      e.desc = "";
      //e.desc = "desc:"+ (e.more.length>0?e.more:e.desc);
    });
  }
}
