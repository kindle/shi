import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Song } from '../app.component';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { UiService } from '../services/ui.service';
import { ScrollService } from '../services/scroll.service';
import { Subscription } from 'rxjs';
import { ConvertService } from '../services/convert.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  readonly currentDateTitle = this.formatCurrentDate();
  get reversedPlayHistory(): any[] {
    return [...(this.data.playHistory || [])].reverse();
  }

  private formatCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  }

  constructor(
    public ui: UiService,
    public router:  Router,
    public data: DataService,
    private activatedRoute: ActivatedRoute,
    private scrollService: ScrollService,
    public convertService: ConvertService
  ) {}

  @ViewChild(IonContent, { static: false }) content: IonContent|any;
  private scrollSubscription: Subscription|any;
  ngOnInit(){
    this.scrollSubscription = this.scrollService.scrollToTop$.subscribe(() => {
      if (this.content) {
        this.content.scrollToTop(300);
      }
    });
  }
  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  async ionViewDidEnter(){
    
    //if(this.data.articleDataLoaded===false){
    //  await this.data.loadJsonData();
    //}
    //else{

    //console.log("total poems:"+this.data.JsonData.length)

      let ptype = this.activatedRoute.snapshot.queryParams["type"];
      let text = this.activatedRoute.snapshot.queryParams["text"];
      if(ptype=='tag'){
        this.TagSearch(text);
      }
      else{
        this.searchKeywordModel = text;
        this.onSearchchange();
      }

      this.data.loadAllLibraryCount();
      
  }

  add(){
    this.router.navigate(['/song'], {}); 
  }

  edit(song:Song){
    this.router.navigate(['/song'], {
      queryParams: {tid:song.id}
    });
  }

  navigationOpt = {
    //el: ".swiper-pagination",
    clickable: true,
  };


  @ViewChild('pageTop') pageTop: IonContent | any;
  
  keywordPlaceholder = "苏轼";
  @ViewChild('searchKeyword') searchKeyword:any;
  searchKeywordModel="";



  search(){
    //console.log(this.searchKeywordModel)
  }

  TimelineSearch(key:string){
    this.searchKeywordModel = key;
    this.onSearchchange("author");
  }

  TagSearch(key:string){
    this.searchKeywordModel = key;
    this.onSearchchange("tag");
  }

  searchResult:any =[];
  searchResultCount =0;
  showTimeline(){
    return this.displayResult.length==0;
  }

  handleChange(){
    //console.log('handle...')
  }

  //source is from timeline, the value is author, search by auther name
  //other source, search by text, full search
  async onSearchchange(source:string=""){
    //console.log('on search change')
    if(this.searchKeywordModel!=null)
      this.searchKeywordModel = this.searchKeywordModel.trim();

    if(this.searchKeywordModel==null||this.searchKeywordModel.length==0)
    {
        this.displayResult = [];
        return;
    }

    if(source == 'author'){
      this.searchResult = this.data.JsonData
      .filter((ci:any)=>
        ci.author.indexOf(this.searchKeywordModel)>=0
      );
    }
    else if(source == 'tag'){
      this.searchResult = this.data.JsonData
      .filter((ci:any)=>
        ci.tags&&ci.tags.join(',').indexOf(this.searchKeywordModel)>=0
      );
    }else{
      this.searchResult = this.data.JsonData
      .filter((ci:any)=>
        ci.text.indexOf(this.searchKeywordModel)>=0
      );
      //去重
      this.searchResult = this.searchResult.filter((x:any, index:any ,self:any)=>{
        var arrids:any = []
        var arrnames:any = []
        this.searchResult.forEach((item:any,i:any) => {
          arrids.push(item.author)
          arrnames.push(item.name)
        })  
        var judgeOne = arrids.indexOf(x.author) === index
        var judgeTwo = arrnames.indexOf(x.name) === index  
        return judgeOne || judgeTwo
      });
    }

    this.searchResultCount = this.searchResult.length;

    this.displayResult = [];
    this.generateItems();
    this.pageTop.scrollToTop();
  }


  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,10))
    );
  }

  onIonInfinite(ev:any) {
    this.generateItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 200);
  }
  
  goToPlayList(){
    this.router.navigate(['/tabs/tab3/customlist'], {
      queryParams: {
      }
    });
  }

  goToList(){
    this.router.navigate(['/tabs/tab3/list'], {
      queryParams: {
      }
    });
  }

  goToAuthor(){
    this.router.navigate(['/tabs/tab3/author'], {
      queryParams: {
      }
    });
  }

  goToPoem(){
    this.router.navigate(['/tabs/tab3/poem'], {
      queryParams: {
      }
    });
  }

  goToTag(){
    this.router.navigate(['/tabs/tab3/tag'], {
      queryParams: {
      }
    });
  }

  goToArticle(){
    this.router.navigate(['/tabs/tab3/article'], {
      queryParams: {
      }
    });
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

  topics = [
    {id:4,text:"Lib.Poems",count:"poemcount",color:"rgb(215,86,137)",light:"rgb(215,86,137,60%)"},//诗词
    {id:1,text:"Lib.Poemlists",count:"poemlistcount",color:"rgb(231,112,103)",light:"rgb(231,112,103,60%)"},//诗单列表
    {id:2,text:"Lib.Poets",count:"poetcount",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},//诗人
    {id:3,text:"Lib.Albums",count:"albumcount",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},//专辑
    {id:6,text:"Lib.Articles",count:"articleCount",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},//文章
    {id:5,text:"Lib.Topics",count:"topiccount",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},//主题
  ];

  goToTopic(topicId:any){
    switch(topicId){
      case 1:
        this.goToPlayList();
        break;
      case 2:
        this.goToAuthor();
        break;
      case 3:
        this.goToList();
        break;
      case 4:
        this.goToPoem();
        break;
      case 5:
        this.goToTag();
        break;
      case 6:
        this.goToArticle();
        break;
    }
  }



  chat(){
    this.router.navigate(['/chat'], {
      queryParams: {
      }
    });
  }

  goToTool(toolId:any){
    //if(toolId === 'video-to-audio'){
      this.convertService.selectVideoAndConvert();
    //}
  }

  play(poem:any){
    this.data.playobj(poem, true);
  }

}
