import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { UiService } from '../services/ui.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page  {

  searchTopicData:any;
  
  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) {
    this.data.currentTopicId = 199;
    this.searchTopicData = this.data.tab5RadioTopicData
      .filter((d:any)=>d.id==this.data.currentTopicId)[0];
    //this.searchTopicData = this.data.searchTopicData.filter((d:any)=>d.id==this.data.currentTopicId)[0];
  }

  goToList(listid:any){
    //this.data.currentListId = listid;
    this.router.navigate(['/tabs/tab4/list'], {
      queryParams: {}
    });
  }
}