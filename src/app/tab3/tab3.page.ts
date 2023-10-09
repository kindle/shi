import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { Song } from '../app.component';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(
    public router:  Router,
    public data: DataService,
    private activatedRoute: ActivatedRoute
  ) {}


  async ionViewDidEnter(){
    //if(this.data.jsonDataLoaded===false){
    //  await this.data.loadJsonData();
    //}
    //else{

    console.log("total poems:"+this.data.JsonData.length)

      let ptype = this.activatedRoute.snapshot.queryParams["type"];
      let text = this.activatedRoute.snapshot.queryParams["text"];
      if(ptype=='tag'){
        this.TagSearch(text);
      }
      else{
        this.searchKeywordModel = text;
        this.onSearchchange();
      }
      
    //}
  }

  add(){
    console.log('add')
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
    console.log(this.searchKeywordModel)
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
    console.log('handle...')
  }

  //source is from timeline, the value is author, search by auther name
  //other source, search by text, full search
  async onSearchchange(source:string=""){
    console.log('on search change')
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



//fake sample data
  musicStations = [
    //{alias:"唐诗三百首",text:"唐诗三百首",color:"rgb(215,86,137)",light:"rgb(215,86,137,60%)"},
    //{alias:"宋词三百首",text:"宋词三百首",color:"rgb(231,112,103)",light:"rgb(231,112,103,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"美到窒息的小众诗词，99%的人没读过",text:"山水",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"田园",text:"田园",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"送别",text:"送别",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"爱情",text:"爱情",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"边塞",text:"边塞",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"爱国",text:"爱国",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"悼亡",text:"悼亡",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"闺怨",text:"闺怨",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"思乡",text:"思乡",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"哲理",text:"哲理",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"怀古",text:"怀古",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"羁旅",text:"羁旅",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"咏物",text:"咏物",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"励志",text:"励志",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"讽刺",text:"讽刺",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/张大千荷花.jpg", alias:"赞美",text:"赞美",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    //{alias:"节气",text:"节气",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    //{alias:"赠答",text:"赠答",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
  ];
  

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
}
