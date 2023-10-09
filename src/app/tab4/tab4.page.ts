import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ModalEventService } from '../modal-event.service';
import { UiService } from '../ui.service';

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
    private modalEventService: ModalEventService,
  ) { 
    this.showSubscription = this.data.showSubscription;
    this.localJsonData = this.data.JsonData;
  }

  showSubscription = true;
  closeSub(){
    this.showSubscription = false;
  }

  async ionViewDidEnter(){
    if(this.data.searchTopicData==null){
      //load topics
      this.data.getData(`/assets/topic/search-topic.json`).subscribe(data=>{
        this.data.searchTopicData = data;
      });

      //load all the lists
      this.data.getData(`/assets/topic/list-normal.json`).subscribe(data=>{
        //经典传统 诗单
        this.data.topicListData = data;
        this.data.getData(`/assets/topic/list-idea.json`).subscribe(ideaData=>{
          //自定义花样诗单 id 1000 开头
          this.data.topicListData =this.data.topicListData.concat(ideaData);
          this.data.getData(`/assets/topic/list-holiday.json`).subscribe(holidayData=>{
            //自定义节日诗单 id 2000 开头
            this.data.topicListData =this.data.topicListData.concat(holidayData);
            this.data.getData(`/assets/topic/list-food.json`).subscribe(foodData=>{
              this.data.topicListData =this.data.topicListData.concat(foodData);
            });
          });
        });
      });

    }
  }

  goToTopic(topicid:any){
    this.data.currentTopicId = topicid;
    this.router.navigate(['/tabs/tab4/topic'], {
      queryParams: {
        id:topicid
      }
    });
  }

  onScroll(event:any){
    this.currentLpId=0;
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
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onLoseFocus(){
    if(this.searchText==null||this.searchText==""){
      this.showFilter = false;
    }
  }
  onSearchCancel(){
    this.showFilter = false;
    this.displayResult = [];
  }
  onSearchChanged(){
    let key = "";
    if(this.searchText!=null){
      key = this.searchText.trim();
    }

    if(key=="")
    {
      this.displayResult = [];
      return;
    }

    this.searchResult = this.localJsonData.filter((e:any)=>
      (e.text).indexOf(key)>=0
    );
    this.searchResultCount = this.searchResult.length;
    
    this.displayResult = [];
    this.generateItems();
  }
  displayResult:any = [];
  isAuthor = false;
  private generateItems() {
    //check if keyword is author
    let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name==this.searchText)
    if(foundAuthor.length===1){
      this.isAuthor = true;
    }
    else{
      this.isAuthor = false;
    }
    //get search result
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,10))
    );
  }



  play(poem:any){
    this.data.qlyric = poem.paragraphs;
    this.data.currenttitle = poem.title;
    this.data.currentauthor = poem.author;

    this.modalEventService.openModal();
  }

}
