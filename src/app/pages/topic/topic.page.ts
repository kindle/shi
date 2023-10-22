import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.page.html',
  styleUrls: ['./topic.page.scss'],
})
export class TopicPage {

  searchTopicData:any;
  
  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) {
    this.searchTopicData = this.data.searchTopicData.filter((d:any)=>d.id==this.data.currentTopicId)[0];
  }

  goToList(listid:any){
    //this.data.currentListId = listid;
    this.router.navigate(['/tabs/tab4/list'], {
      queryParams: {}
    });
  }

}

