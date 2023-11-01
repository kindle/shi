import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
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
    private activatedRoute: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    let topicId = this.activatedRoute.snapshot.paramMap.get('id');
    this.searchTopicData = this.data.searchTopicData
      .filter((d:any)=>d.id==topicId)[0];
  }
}

