import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  localJsonData:any;
  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
  ) { 
    this.showSubscription = this.data.showSubscription;
    this.localJsonData = this.data.JsonData;
  }

  showSubscription = true;
  closeSub(){
    this.showSubscription = false;
  }

  async ionViewDidEnter(){
    //loaded in Component.app
    /*
    if(this.data.searchTopicData==null){
      //load topics
      this.data.getData(`/assets/topic/search-topic.json`).subscribe(data=>{
        this.data.searchTopicData = data;
      });
    }*/
  }


  async ngOnInit() {
    /****test code*****/
    var arrayObj=Array.from(this.data.tagsStat);
    //按照value值降序排序
    arrayObj.sort(function(a,b){return a[1]-b[1]});
    for (var [key, value] of arrayObj) 
    {
        console.log(key + ' = ' + value);
    }
    /****test code*****/
  }

  testReset(){
    this.data.queueData = this.data.targetData;
    this.data.save();
  }



  currentLpId=0;
  pressed(topicid:any){
    this.currentLpId = topicid;
  }
  onScroll(event:any){
    this.currentLpId=0;
  }
  active(topicid:any){
  }
  released(topicid:any){
    this.currentLpId = 0;
  }
  ionViewWillLeave() {
    this.currentLpId = 0;
  }
  ionViewWillEnter() {
    this.currentLpId = 0;
  }










  searchResult:any;
  searchResultCount=0;
  localList:any;
  
  onSearchFocus(){
    this.data.showFilter = true;
  }
  onLoseFocus(){
    if(this.data.searchText==null||this.data.searchText==""){
      this.data.showFilter = false;
    }
  }
  
  onSearchChanged(){
    let key = "";
    if(this.data.searchText!=null){
      key = this.data.searchText.trim();
    }

    if(key=="")
    {
      this.data.displayResult = [];
      return;
    }

    this.searchResult = this.localJsonData.filter((e:any)=>
      (e.text).indexOf(key)>=0
      //&&e.audio
    );
    this.searchResultCount = this.searchResult.length;
    
    this.data.displayResult = [];
    this.generateItems();
  }
  
  isAuthor = false;
  private generateItems() {
    //check if keyword is author
    let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name==this.data.searchText)
    if(foundAuthor.length===1){
      this.isAuthor = true;
    }
    else{
      this.isAuthor = false;
    }
    //get search result
    this.data.displayResult = this.data.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,30))
    );
    //console.log(this.data.displayResult)
  }


  getHighlight(p:any){
    let result = "";
    p.paragraphs.forEach((s:any) => {
      if(s.indexOf(this.data.searchText)>-1)
      {
        result = s;
      }
    });
    if(result===""){
      result = p.paragraphs[0];
    }
    p.sample = this.data.searchText;
    return result.replace(this.data.searchText,"<b>"+this.data.searchText+"</b>");

  }

}
