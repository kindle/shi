import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { Storage } from '@ionic/storage-angular';
import { DataService } from './services/data.service';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private data: DataService,
    private storage: Storage,
  ) {
    
  }

  async ngOnInit() {
    //init localstorage
    this.storage.create().then(()=>{
      //load local storage groups/targets
      //calculate targets days/target count in groups
      this.data.init();
    }).finally(()=>{
      //load likes after local storage db is created.
      this.data.loadlikes();
      //load poem play history
      this.data.loadPlayHistory();
      //load ep play history
      this.data.loadRecentPlayedEP();
      //load play style
      this.data.loadPlayStyle();
    });
    //move it to tab1, as it's very slow when starts up
    await this.data.loadJsonData();

    this.data.loadArticleJsonData();

    this.data.getSubscriptionImage();
  }
}

export class Song{
  constructor(
    id:number,
    groupId:number,
    name:string,
  ){
    this.id = id;
    this.groupId = groupId;
    this.name = name;
  }

  id:number;
  groupId:number;
  name:string;

  desc:string|any;
  mediaUrl:string|any;
  lyricUrl:string|any;
  lyricText:string|any;
  img:string|any;
  file:string|any;

  selected:boolean|any;

  create:number|any;
}

export class Group{
  constructor(
    id:number,
    name:string,
  ){
    this.id = id;
    this.name = name;
  }
  id:Number;
  name:string;

  img:string|any;


  icon:string|any;
  cover:string|any;
  count:number|any;

  color:string|any;
  src:string|any;
}