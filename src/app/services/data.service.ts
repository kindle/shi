import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Group, Song } from '../app.component';

import { Storage } from '@ionic/storage-angular';
import { ActionSheetController, IonTabs, ModalController, NavController, Platform } from '@ionic/angular';

import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';
import { UiService } from './ui.service';
import { catchError, tap } from 'rxjs';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx'
import { Solar } from 'lunar-typescript';

import { Share } from '@capacitor/share';


import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from './event.service';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { TextZoomerPage } from '../pages/textzoomer/textzoomer.page';


export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export enum ViewType{
  Author=0,
  Tag,
  Id,
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  TestMode = false;

  gototesturl(){//'tabs/tab1/me'
    this.router.navigate(['tabs/tab1/list'], {
      queryParams: {}
    });
  }

  EnablePrivateMusic = false;
  
  //引导评分开关
  showRatingsAndReviews = true;
  //订阅广告开关
  showSubscription = false;
  //趣味诗单开关
  disableRandomFunData = false;
  //开卷有益开关
  disableRandomArticleData = false;

  constructor(
    private storage: Storage,
    private http: HttpClient,

    private ui: UiService,
    platform: Platform,
    private router: Router,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private eventService: EventService,
    private media: Media,
  ){
    this.platform = platform;
    this.audio = new Audio();

    if(this.TestMode === true){
      this.showRatingsAndReviews = true;
      this.showSubscription = true;
      this.disableRandomFunData = true;
      this.disableRandomArticleData = true;
    }else{
      this.showRatingsAndReviews = true;
      this.showSubscription = false;
      this.disableRandomFunData = false;
      this.disableRandomArticleData = false;
    }
  }

  subscriptionImage = "辣椒";
  getSubscriptionImage(){
    //let images = ["辣椒","water"]
    let images = ["water"]
    this.subscriptionImage = images[this.getRandom(0,images.length)];
  }

  currentArticle:any;

  searchTopicData:any;
  tab2BrowseTopicData:any;
  tab5RadioTopicData:any;
  currentTopicId = 0;
  poemListData:any=[];
  ////scurrentListId = 0;
  //currentAuthor = "";
  ////currentViewType = ViewType.Author;
  //currentImage = "";
  currentItem:any;

  authorJsonData:any = [];
  JsonData:any = [];
  articleDataLoaded = false;

  deepCopy(data:any){
    return JSON.parse(JSON.stringify(data))
  }
  async loadJsonData(){

    //authors
    this.http.get<any>(`assets/db/全唐诗/authors.song.json`).subscribe(result=>{
      this.authorJsonData = this.authorJsonData.concat(result);
    });
    this.http.get<any>(`assets/db/全唐诗/authors.tang.json`).subscribe(result=>{
      this.authorJsonData = this.authorJsonData.concat(result);
    });
    this.http.get<any>(`assets/db/others/authors.others.json`).subscribe(result=>{
      this.authorJsonData = this.authorJsonData.concat(result);
    });
    if(this.EnablePrivateMusic){
      this.http.get<any>(`assets/db/music/authors.music.json`).subscribe(result=>{
        this.authorJsonData = this.authorJsonData.concat(result);
      });
    }


    //诗经楚辞
    this.getObjects(`assets/db/诗经/shijing.json`,"诗经");
    this.getObjects(`assets/db/楚辞/chuci.json`,"楚辞");

    //建安
    this.getObjects(`assets/db/曹操诗集/caocao.json`,"曹操");

    //其他补录
    this.getObjects(`assets/db/others/others.json`,"");

    if(this.EnablePrivateMusic){
      this.getObjects(`assets/db/music/music.json`,"");
    }

    //蒙学
    //getMXObjects is 文章
    this.getMXObjects(`assets/db/蒙学/guwenguanzhi.json`);
    this.getMXObjects(`assets/db/蒙学/tangshisanbaishou.json`);

    //纳兰性德
    this.getObjects(`assets/db/nlxd/nlxd.json`,'纳兰性德');

    //全唐诗
    for(let i=0;i<=57;i++){
      this.getObjects(`assets/db/全唐诗/poet.tang.${i*1000+""}.json`,"唐诗");
    }
    for(let i=0;i<=254;i++){
      this.getObjects(`assets/db/全唐诗/poet.song.${i*1000+""}.json`,"宋诗");
    }

    //四书五经

    //宋词
    for(let i=0;i<=21;i++){
      this.getObjects(`assets/db/宋词/ci.song.${i*1000+""}.json`,"宋词");
    }
    this.getObjects(`assets/db/宋词/宋词三百首.json`,"宋词三百首");

    //水墨唐诗
    this.getObjects(`assets/db/水墨唐诗/shuimotangshi.json`,"水墨唐诗");

    //元曲
    this.getObjects(`assets/db/元曲/yuanqu.json`,"元曲");


    //论语
    this.getObjects(`assets/db/论语/lunyu.json`,"论语");
    this.getObjects(`assets/db/四书五经/mengzi.json`,"孟子");

    /*
    this.http.get<any>('https://reddah.blob.core.windows.net/cache/202385.json').subscribe(result=>{
      
      this.azureData = result;
      if(result.Content!=null){
        this.azureData.images = result.Content.split('$$$');
      }
    });*/

    //load 诗单
    this.loadPoemList();

    this.articleDataLoaded = true;
  }

  loadPoemList(){
    const jsonFiles = [
      `/assets/topic/list-fun.json`,
      `/assets/topic/list-audio.json`,
      `/assets/topic/list-holiday.json`,
      `/assets/topic/list-food.json`
      //24 节气
    ];

    this.loadNextJSON(jsonFiles, 0);
  }
  loadNextJSON(jsonFiles: string[], index: number): void {
    if (index < jsonFiles.length) {
      this.http.get<any>(jsonFiles[index]).subscribe(
        result => {
          this.poemListData = this.poemListData.concat(result); 
          this.loadNextJSON(jsonFiles, index + 1); 
        },
        error => {
          console.error('Error loading JSON file:'+jsonFiles[index], error);
        }
      );
    } else {
      //console.log('All JSON files loaded:', this.poemListData);
    }
  }

  getData(json:any){
    return this.http.get<any>(json);
  }

  getRandom(min:number, max:number){
    return Math.floor(Math.random() * max) + min;
  }

  hotData:any;
  funData:any;
  funDataMap = new Map();
  

  LOCALSTORAGE_HOURLY_FUN = "LOCALSTORAGE_HOURLY_FUN"
  async loadFunData(){
    this.get(this.LOCALSTORAGE_HOURLY_FUN).then((value)=>{
      if(value==null){
        this.funDataMap = new Map();
      }
      else{
        this.funDataMap = this.jsonStrToMap(value);
      }

      this.loadArticleJsonData();
    });
  }
  getFunData(nameSeed:any){
    //console.log("this.disableRandomFunData:"+this.disableRandomFunData)
    //console.log(this.funData)
    if(this.disableRandomFunData){//for test adding new poem list
      return this.funData;
    }
    let myDate = new Date();
    let hourSeed = myDate.getHours();
    let seed = nameSeed+hourSeed;
    //console.log(seed)
    if(!this.funDataMap.has(seed)){
      this.funDataMap.set(seed, this.getRandomArray(this.funData, 10));
      this.set(this.LOCALSTORAGE_HOURLY_FUN, this.mapToJsonStr(this.funDataMap));
    }

    return this.funDataMap.get(seed);
  }

  tab2LocalFunData:any = [];// this.data.getFunData('tab2_');
  tab2LocalScrollData:any = [];// this.data.getFunData('tab2_scroll_');

  jsonStrToMap(jsonStr:string){
    const jsonObj = JSON.parse(jsonStr)
    const map = new Map()
    for(const k of Object.keys(jsonObj)){
      map.set(k, jsonObj[k])
    }
    return map;
  }
  mapToJsonStr(newMap: Map<string, any>){
    const obj:any = {};
    newMap.forEach((v:any,k:any) => {
      obj[k]=v
    });
    const JsonStr = JSON.stringify(obj)
    return JsonStr

  }

  gameNextData:any=[];

  classicData:any;
  timelineData:any;
  pickData:any;
  //careful with JsonData
  articleData:any=[];
  azureData:any;
  async loadArticleJsonData(){
    this.http.get<any>('/assets/json/pick.json').subscribe(result=>{
      this.pickData = result;
    });
    this.http.get<any>('/assets/json/timeline.json').subscribe(result=>{
      this.timelineData = result;
    });

    this.http.get<any>('/assets/topic/game-next.json').subscribe(result=>{
      this.gameNextData = result;
      this.updateGameData();
    });

    //this.http.get<any>('/assets/topic/fun.json').subscribe(result=>{
    this.http.get<any>('/assets/topic/list-fun.json').subscribe(result=>{
      //给趣味诗单随机5个tile用的
      this.funData = result;

      this.tab2LocalFunData = this.getFunData('tab2_');
      this.tab2LocalScrollData = this.getFunData('tab2_scroll_');
      this.tab2LocalScrollData.forEach((e:any) => {
        e.alias = e.sub;
        //e.text = e.desc;
        //e.desc = "";
        //e.desc = "desc:"+ (e.more.length>0?e.more:e.desc);
      });
      /*
      this.funData.forEach((fun:any) => {
        let items = this.poemListData.filter((p:any)=>p.id === fun.id)
        if(items&&items[0]){
          let moreInfo = items[0];
          fun.image = moreInfo.image;
          fun.name = moreInfo.name;
          fun.sub  = moreInfo.sub;
          fun.more = moreInfo.more;
          fun.desc = moreInfo.desc;
        }
      });*/
      
      
    });
    this.http.get<any>('/assets/topic/hot.json').subscribe(result=>{
      result = this.getRandomArray(result, 16);
      this.hotData = [];
      for (let i = 0; i < result.length; i += 4) {
        const subArray = result.slice(i, i + 4);
        subArray.forEach((e:any) => {
          let poem = this.JsonData.filter((shici:any)=>shici.id===e.id)[0];
          //console.log(e.id)
          if(poem&&poem.audio){
            e.audio = poem.audio;
          }
        });
        //console.log('hot')
        //console.log(subArray)
        this.hotData.push(subArray);
      }
    });
    this.http.get<any>('/assets/topic/classic.json').subscribe(result=>{
      result = this.getRandomArray(result, 16);
      this.classicData = [];
      for (let i = 0; i < result.length; i += 4) {
        const subArray = result.slice(i, i + 4);
        subArray.forEach((e:any) => {
          let poem = this.JsonData.filter((shici:any)=>shici.id===e.id)[0];
          if(poem&&poem.audio){
            e.audio = poem.audio;
          }
        });
        this.classicData.push(subArray);
      }
    });

    this.refreshArticleData();
  }

  refreshArticleData(force:boolean=false){
    this.http.get<any>(`/assets/topic/article.json`).subscribe(result=>{
      //把article.json放入articleData作为开卷有益文章展示
      //article.json包括vote,group等文章
      this.articleData = result;
      //把list-fun.json,list-audio.json等放入articleData做为开卷有益文章展示
      //poemListData包括fun,audio,holiday,food
      this.poemListData.forEach((fun:any) => {
        let descArray:any = [];
        fun.list.forEach((p:any) => {
          descArray.push({
            "type":"poem", 
            "author":p.author, 
            "title":p.title, 
            "sample":p.sample, 
            "id":p.id
          })
        });
        this.articleData.push({
          template:"text",
          min_height:"380px",//if effect is there, remove image
          bg_image:fun.image.replace("https://reddah.blob.core.windows.net/msjjimg/",""),
          title_color:fun.color?fun.color:"white",
          small_title:fun.sub,
          id:fun.id,
          effect:fun.effect,
          //big_title:fun.desc,
          big_title:(fun.more.length==0||
            (fun.desc.length<fun.more.length&&fun.desc.length>0))?fun.desc:fun.more,
          desc:[{
            "type":"text", 
            //"value":fun.more?fun.more:fun.desc,
            "value":fun.desc?fun.desc:fun.more,
            "name":""
          }].concat(descArray).concat(
            [{
              "type":"list",
              "value":"",
              "name":"趣味诗单"
            }]
          ),
          link:"",
        })
      });

      if(force){
        let nameSeed = "article";
        let myDate = new Date();
        let dateSeed = (myDate.getMonth()+1)+"_"+myDate.getDay();
        let hourSeed = dateSeed+"_"+myDate.getHours();
        let seed = nameSeed+hourSeed;
  
        if(this.funDataMap.has(seed)){
          this.funDataMap.delete(seed);
          this.remove(this.LOCALSTORAGE_HOURLY_FUN);
        }
      }
      //把articleData文章随机排序，取前5个文章+1group+1vote展示
      this.articleData = this.getArticleData("article");
    });
  }

  getArticleData(nameSeed:any){
    let myDate = new Date();
    let dateSeed = (myDate.getMonth()+1)+"_"+myDate.getDay();
    let hourSeed = dateSeed+"_"+myDate.getHours();
    //let hourSeed = myDate.getMinutes();
    let seed = nameSeed+hourSeed;
    //console.log("seed:"+seed)
    //console.log(this.funDataMap)

    if(this.disableRandomArticleData){
      let tempdata = this.setRandomArticles(this.articleData);
      return this.articleData.concat(tempdata);
    }

    if(!this.funDataMap.has(seed)){
      //console.log('not find article'+this.articleData.length)
      let tempdata = this.setRandomArticles(this.articleData);
      //console.log(tempdata)
      this.funDataMap.set(seed, tempdata);
      this.set(this.LOCALSTORAGE_HOURLY_FUN, this.mapToJsonStr(this.funDataMap));
      //console.log(this.funDataMap)
    }
    else{
      //console.log('find article')
    }

    return this.funDataMap.get(seed);
  }

  setRandomArticles(data:any){

    let temp:any = [];
    //get 5 fun articles, 4 articles that have no effect, 1 have effect
    temp = temp.concat(this.getRandomArray(data.filter((d:any)=>d.template==='text'&&!d.effect), 1));
    temp = temp.concat(this.getRandomArray(data.filter((d:any)=>d.template==='text'&&d.effect), 1));
    
    //get 1 group/wall/scroll
    temp = temp.concat(this.getRandomArray(data.filter(
      (d:any)=>d.template==='group'
      //||d.template==='wall'
      ||d.template==='scroll'
      ), 1));
    
    //get 1 vote article
    temp = temp.concat(this.getRandomArray(data.filter((d:any)=>d.template==='vote'), 1));

    //get 二十四节气诗单
    //console.log('test:///')
    let today = new Date();
    //console.log(today.getFullYear()+""+(today.getMonth()+1)+""+today.getDate())
    let solar = Solar.fromYmd(today.getFullYear(),(today.getMonth()+1),today.getDate());
    //let solar = Solar.fromYmd(2023,9,23);
    let solarTermName = solar.getLunar().getJieQi();//example: "夏至";
    //console.log('更多信息')

    //console.log(solar.getLunar().getMonthInChinese())
    //console.log(solar.getLunar().getDayInChinese());
    let dateStrChinese = solar.getLunar().getMonthInChinese() + "月" + solar.getLunar().getDayInChinese();
    //console.log("today节气："+solarTermName)
    if(!this.disableRandomFunData&&solarTermName.length>0)
    {
      //temp = temp.concat(this.getSolarTermPoem(solarTermName));
      temp.unshift(this.getSolarTermPoem(solarTermName, dateStrChinese));
    }

    //test
    if(this.TestMode)
    {
      for (let [key, value] of this.solarTermMap) {
        //console.log(key, value);
        temp = temp.concat(this.getSolarTermPoem(key, "某月某日"));
      }
    }
   
    return temp;
  }

  solarTermMap:any = new Map([
    ["立春",{image:"bird.jpg", title:"忽对林亭雪，瑶华处处开", desc:"立春，为二十四节气之首。立，是“开始”之意；春，代表着温暖、生长。立春标志着万物闭藏的冬季已过去，开始进入风和日暖、万物生长的春季。在自然界，立春最显著的特点就是万物开始有复苏的迹象。"}],
    ["雨水",{image:"leaf-1001679_1280.jpg", title:"", desc:""}],
    ["惊蛰",{image:"bee-4913122_1280.jpg", title:"", desc:""}],
    ["春分",{image:"flowers-4917370_1280.jpg", title:"", desc:""}],
    ["清明",{image:"water-815271_1280.jpg", title:"清明时节雨纷纷，路上行人欲断魂", desc:"清明节气因为节令期间“气清景明、万物皆显”而得名。清明是反映自然界物候变化的节气，这个时节阳光明媚、草木萌动、百花盛开，自然界呈现一派生机勃勃的景象。"}],
    ["谷雨",{image:"ornamental-apple-tree-4162359_1280.jpg", title:"", desc:""}],
    ["立夏",{image:"corn-field-440338_1280.jpg", title:"", desc:""}],
    ["小满",{image:"wheat-865152_1280.jpg", title:"", desc:""}],
    ["芒种",{image:"rape-blossom-502973_1280.jpg", title:"", desc:""}],
    ["夏至",{image:"stonehenge-2326750_1280.jpg", title:"", desc:""}],
    ["小暑",{image:"lotus-7511897_1280.jpg", title:"", desc:""}],
    ["大暑",{image:"lotus-978659_1280.jpg", title:"", desc:""}],
    ["立秋",{image:"leaves-318743_1280.jpg", title:"", desc:""}],
    ["处暑",{image:"woman-1807533_1280.jpg", title:"", desc:""}],
    ["白露",{image:"raindrops-574971_1280.jpg", title:"", desc:""}],
    ["秋分",{image:"colorful-2609978_1280.jpg", title:"", desc:""}],
    ["寒露",{image:"flower-2438754_1280.jpg", title:"", desc:""}],
    ["霜降",{image:"cold-3967895_1280.jpg", title:"", desc:""}],
    ["立冬",{image:"snow-5910822_1280.jpg", title:"", desc:""}],
    ["小雪",{image:"aurora-1197753_1280.jpg", title:"", desc:""}],
    ["大雪",{image:"forest-2964073_1280.jpg", title:"", desc:""}],
    ["冬至",{image:"tree-2532679_1280.jpg", title:"", desc:""}],
    ["小寒",{image:"24小寒.jpg", title:"", desc:""}],
    ["大寒",{image:"ice-570500_1280.jpg", title:"", desc:""}],
  ]);

  getSolarTermPoem(solarTermName:any, dateStrChinese:any){
    let solarTermInfo = this.solarTermMap.get(solarTermName);

    
    //如果今天是二十四节气 +1
    let tempSolarTermPoems = this.JsonData.filter((j:any)=>
      j.text.indexOf(solarTermName)>-1&&
      j.id!=null).slice(0,50);
    let solarTermPoems:any = [];
    tempSolarTermPoems.forEach((p:any) => {
      solarTermPoems.push({
        "type":"poem", 
        "author":p.author, 
        "title":p.title, 
        "sample":"", 
        "solarterm":solarTermName,
        "paragraphs":p.paragraphs,
        "id":p.id
      })
    });
    let result = {
      template:"text",
      min_height:"380px",
      bg_image:solarTermInfo.image,
      title_color:"white",
      small_title:dateStrChinese,//solarTermInfo.title,
      big_title:"今日"+solarTermName,
      desc:[{
        "type":"text", 
        "value":solarTermInfo.desc?solarTermInfo.desc:
        (solarTermInfo.title?solarTermInfo.title:solarTermName),
        "name":""
      }].concat(solarTermPoems).concat(
        [{
          "type":"list",
          "value":"",
          "name":"趣味诗单"
        }]
      ),
      link:"",
    };
    return result;
  }


  tagsStat = new Map();
  getObjects(json:any, category:any){
    this.http.get<any>(json)
      .subscribe(result =>{
          this.importData(result, category);
      }, error =>{
          //console.log(error);
      });
  }

  //蒙学
  getMXObjects(json:any){
    this.http.get<any>(json)
      .subscribe(result =>{
        //result.title//唐诗三百首
        result.content.forEach((c:any)=>{
          //c.type//五言绝句
          this.importData(c.content, result.title);
        });
      }, error =>{
          //console.log(error);
      });
  }

  importData(result:any, category:any){
    result.forEach((element:any) => {
      if(element.title == null){
        element.title = element.rhythmic;
      }
      if(element.paragraphs == null){
        element.paragraphs = [];
      }
      if(element.tags == null){
        element.tags = [];
      }
      else{
        element.tags.forEach((tag:any) => {
          let count = this.tagsStat.get(tag);
          this.tagsStat.set(tag, count==null?1:count+1);
          //console.log(tag, count)
        });
      }
      element.type = category;
      element.text = 
          element.author + 
          element.title + 
          element.type +
          element.paragraphs.join('_') +
          element.tags.join('_');
    });
    this.JsonData = this.JsonData.concat(result);
    //console.log("data init:"+this.articleData.length)
  }



  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;


  /*--common start----*/
  get(key: string){
    return this.storage.get(key);
  }

  set(key: string, value:any){
    this.storage.set(key, value);
  }

  remove(key: string){
    this.storage.remove(key);
  }

  getNewId(arr: Array<any>){
    if(arr==null||arr.length==0)
      return 0;
    return Math.max(...arr.map(t=>t.id))+1;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array]; // Create a copy to avoid modifying the original array
  
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
  
    return shuffledArray;
  }
  /*--common end----*/



  /*--play queue start--*/
  audio:any;

  duration=0;
  currentTime:any;
  leftTime:any;
  

  getTodayHistory(month:any){
    return this.http.get<any>(`assets/history/zh/${month}.json`).pipe().toPromise();
  }

  

  currentTodayTextIndex = 0;
  initTodayText(){
    /*
    let eventDate = this.getLocalISOString(new Date());
    this.todayCard = Array.from(eventDate.split('T')[0]);

    let month = this.todayCard[5]+this.todayCard[6];//e.g.:"01"
    let date = month+this.todayCard[8]+this.todayCard[9];//e.g.:"0101"
    //test
    //month="12"
    //date="1204"
    this.getTodayHistory(month).then((result) => {
      this.historyToday=result.filter((r:any)=>r.key==date)
      //  .sort((a:any,b:any)=> a.type.localeCompare(b.type));
      
      //console.log(this.historyToday)
      let first = this.historyToday[0];
      this.displaySongName = this.historyToday[0].key;
      this.currentPoem.paragraphs = this.historyToday[0].text;
      this.todayImage = this.historyToday[0].image;
      this.currentTodayTextIndex = 0;
    });
    */
  }

  prevTodayText(){
    /*
    this.currentTodayTextIndex--;
    if(this.currentTodayTextIndex<0)
      this.currentTodayTextIndex = this.historyToday.length-1;

    let first = this.historyToday[this.currentTodayTextIndex];
    this.displaySongName = this.historyToday[this.currentTodayTextIndex].key;
    this.currentPoem.paragraphs = this.historyToday[this.currentTodayTextIndex].text;
    this.todayImage = this.historyToday[this.currentTodayTextIndex].image;
    */
  }
  nextTodayText(){
    /*
    this.currentTodayTextIndex++;
    if(this.currentTodayTextIndex>this.historyToday.length-1)
      this.currentTodayTextIndex = 0;

    let first = this.historyToday[this.currentTodayTextIndex];
    this.displaySongName = this.historyToday[this.currentTodayTextIndex].key;
    this.currentPoem.paragraphs = this.historyToday[this.currentTodayTextIndex].text;
    this.todayImage = this.historyToday[this.currentTodayTextIndex].image;
    */
  }

  todayImage:any;
  historyToday:any;
  todayCard:any;
  getLocalISOString(date:any){
    let year=date.getFullYear();
    if (year< 1900) year = year + 1900;
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let ms = date.getMilliseconds();

    let isoString=year + '-' + (month<10?'0':'') + month + 
    '-' +(day<10?'0':'') + day + 
    'T' + (hour<10?'0':'') + hour + 
    ':' + (minute<10?'0':'') + minute + 
    ':' + (second<10?'0':'') + second +
    '.' + (ms<10?'00':(ms<100?'0':'')) + ms +
    'Z';
    return isoString;
  }

  isPlaying=false;
  //currentPoem.paragraphs = ["","","","",""];
  lrc:any;
  displaySongName = "";
  //currenttitle = "";
  //currentauthor = "";
  queueData: Song[] = [];
  queuePush(song:Song){
    //delete if exist
    const queueIndex = this.queueData.findIndex((q) => q.id === song.id);
    if (queueIndex > -1) {
      this.queueData.splice(queueIndex, 1);
    }
    //push to first
    this.queueData.unshift(song);

    this.save();
  }
  updateSongSelection(song:any){
    this.queueData.forEach(s=>{
      if(s.id==song.id)
        s.selected = true;
      else
        s.selected=false
    });
  }


  

  


  playSelected(song:Song){
    /*if(this.isPlaying === true){
      this.audio.pause();
      this.lrc.pause();
      this.isPlaying = false;
    }*/

    if(this.audio){
      this.audio.pause();
    }


    this.queuePush(song);

    this.currentPoem.paragraphs = ["","","","",""];

    this.displaySongName = song.desc;
    this.updateSongSelection(song);
    
  }

  togglePlay(){
    this.isPlaying = !this.isPlaying;
    if(this.audio){
      if(this.isPlaying){
        this.execPlay();
        //this.lrc.play(this.audio.currentTime * 1000);
      }
      else{
        this.execPause();
        //this.lrc.pause();
      }
    }
  }
  execPlay(){
    this.isPlaying = true;
    this.audio.play();
  }
  execPause(){
    this.isPlaying = false;
    this.audio.pause();
  }


  /*
  The Fetch API provides an interface for fetching resources 
  (including across the network). 
  It is a more powerful and flexible 
  replacement for XMLHttpRequest.
  */
  loadLyric(name:any){
    let lrc = `/assets/songs/${name}.lrc`;
    return fetch(lrc);
  }

  dragWhere:any =false;
  currentSong:any;
  audioLoadedmetadataFn:any;
  audioTimeupdateFn:any;
  audioEndedFn:any;
  audioMedia:any;
  playbackRate = 1.0;
  togglePlaybackRate(){
    if(this.playbackRate === 1.0){
      this.playbackRate = 1.5;
    }else if(this.playbackRate === 1.5){
      this.playbackRate = 2.0;
    }else if(this.playbackRate === 2.0){
      this.playbackRate = 2.5;
    }else if(this.playbackRate === 2.5){
      this.playbackRate = 3.0;
    }else{
      this.playbackRate = 1.0;
    }
    this.audio.playbackRate = this.playbackRate;
  }

  setAudio(){
    if(!this.currentPoem.audio){
      return;
    }

    if(this.audioLoadedmetadataFn){
      this.audio.removeEventListener('loadedmetadata',this.audioLoadedmetadataFn);
    }
    if(this.audioTimeupdateFn){
      this.audio.removeEventListener('timeupdate',this.audioTimeupdateFn);
    }
    if(this.audioEndedFn){
      this.audio.removeEventListener('ended',this.audioEndedFn);
    }

    //this.audio.src = `/assets/mp3/${this.currentPoem.audio}`;
    this.audio.src = `https://reddah.blob.core.windows.net/msjjmp3/${this.currentPoem.audio}`;
    this.audio.playbackRate = this.playbackRate;
    
    /*
    const file: MediaObject = this.media.create(`/assets/mp3/${this.currentPoem.audio}`);
    const mediaMetadataOpt = {
      title: this.currentPoem.title,
      artist: this.currentPoem.author,
      album: 'Your Album Name',
      // ... other metadata properties you want to set
    };
    file.setMetaData(mediaMetadataOpt);
    //this.audioMedia.play();*/

    this.audioLoadedmetadataFn = () => {
      this.duration = this.audio.duration;
      this.isPlaying = true;
      this.audio.play();
    }
    this.audio.addEventListener('loadedmetadata', this.audioLoadedmetadataFn);

    this.audioTimeupdateFn = () => {
      //when dragging, do not update the progress bar.
      if(this.dragWhere===false){
        this.currentTime = this.audio.currentTime;
      }
    }
    this.audio.addEventListener('timeupdate', this.audioTimeupdateFn);

    this.audioEndedFn = () => {
      this.isPlaying = false;
      this.currentTime = 0;

      this.audio.removeEventListener('loadedmetadata',this.audioLoadedmetadataFn);
      this.audio.removeEventListener('timeupdate',this.audioTimeupdateFn);
      this.audio.removeEventListener('ended',this.audioEndedFn);
      
      this.playNext();

    }
    this.audio.addEventListener('ended',this.audioEndedFn);

  
  }





  toPlayList:any = [];
  additionalList:any = [];
  
  checkAndLoadAdditionalList(n:number=10){
    if(this.additionalList.length>=n) return;

    let audioPoems = this.JsonData.filter((p:any)=>p.audio);
    if(audioPoems.length===0) return;

    let countNeeded = n - this.additionalList.length;
    
    let candidates = audioPoems.filter((p:any)=>{
      let inAdditional = this.additionalList.some((a:any)=>a.id===p.id);
      let inToPlay = this.toPlayList.some((t:any)=>t.id===p.id);
      return !inAdditional && !inToPlay;
    });

    for(let i=0;i<countNeeded;i++){
      if(candidates.length===0) break;
      let randomIndex = Math.floor(Math.random()*candidates.length);
      this.additionalList.push(candidates[randomIndex]);
      candidates.splice(randomIndex,1);
    }
  }

  orgToPlayList:any = [];
  toPlayListName = "";
  //hot list click poem
  playListHot(list:any, poem:any, name:any){
    if(poem.audio){
      this.orgToPlayList = list.flat().filter((l:any)=>l.audio!=null);
      this.toPlayList = list.flat().filter((l:any)=>l.audio!=null);
      this.toPlayListName = name;
    }

    this.playbyid(poem.id, poem.sample);
  }
  //by-id-custom-list,by-id-shi-list click poem
  playListByPoem(list:any, poem:any, name:any){
    if(poem.audio){
      this.orgToPlayList = list.filter((l:any)=>l.audio!=null);
      this.toPlayList = list.filter((l:any)=>l.audio!=null);
      this.toPlayListName = name;
    }
    
    this.playbyid(poem.id, poem.sample);
  }
  //by-id-custom-list,by-id-shi-list,收藏诗词tab3/poem click button
  playList(list:any, name:any, isfromplaybutton:boolean=true){
    this.orgToPlayList = list.filter((l:any)=>l.audio!=null)
    this.toPlayList = this.orgToPlayList;
    this.toPlayListName = name;
    if(isfromplaybutton&&this.toPlayList.length>0){
      let first = this.toPlayList[0];
      this.playbyid(first.id, first.sample);
    }
    this.isShuffle = false;
    this.savePlayStyle();
  }
  playListRandomly(list:any, name:any, playAutomatically:boolean=false){
    this.orgToPlayList = list.filter((l:any)=>l.audio!=null);
    let randomToPlaylist = this.shuffleArray(this.orgToPlayList);
    
    this.toPlayList = randomToPlaylist;
    this.toPlayListName = name;
    
    if(playAutomatically&&this.toPlayList.length>0){
      let first = this.toPlayList[0];
      this.playbyid(first.id, first.sample);
    }
    
    this.isShuffle = true;
    this.savePlayStyle();
  }
  togglePlayListRandomly(){
    this.isShuffle = !this.isShuffle;
    if(this.isShuffle===true){
      this.playListRandomly(this.orgToPlayList, this.toPlayListName);
    }
    else {
      this.playList(this.orgToPlayList, this.toPlayListName, false);
    }
  }


  playPrev(){
    if(this.currentPoem){
      //remove current from history
      if(this.playHistory.length > 0){
          let last = this.playHistory[this.playHistory.length-1];
          if(last.id === this.currentPoem.id){
              this.playHistory.pop();
          }
      }

      let isInOrg = this.orgToPlayList.some((p:any)=>p.id===this.currentPoem.id);
      if(!isInOrg){
        this.isInfinite = true
        //move to additional list
        this.additionalList = this.additionalList.filter((p:any)=>p.id!==this.currentPoem.id);
        this.additionalList.unshift(this.currentPoem);
        
        //remove from toPlayList
        this.toPlayList = this.toPlayList.filter((p:any)=>p.id!==this.currentPoem.id);
      }
    }

    if(this.playHistory.length > 0){
      let prev = this.playHistory.pop();
      this.toPlayList.unshift(prev);
      this.playbyid(prev.id, prev.sample, false);
    }
  }
  findNext(){
    let currentIndex = -1;
    for(let i=0;i<this.toPlayList.length;i++)
    {
      if(this.toPlayList[i].id===this.currentPoem.id
      ||
        (this.toPlayList[i].title===this.currentPoem.title&&
        this.toPlayList[i].author===this.currentPoem.author)
      ){
          currentIndex = i;
      }
    }

    if(currentIndex===-1){
      //console.log('sth. went wrong, could not find the current poem index...')
      return null;
    }
    
    // 2: Single Play
    if(this.isRepeat===2 || this.isRepeat===true){
      return this.toPlayList[currentIndex];
    }
    
    // 1: Cycle Play
    if(this.isRepeat===1)
    {
      if(currentIndex===this.toPlayList.length-1)
      {
        return this.toPlayList[0];
      }
      else
      {
        return this.toPlayList[currentIndex+1];
      }
    }
    else//infinite 
    {
      if(currentIndex===this.toPlayList.length-1){
        return null;
      }
      else
      {
        return this.toPlayList[currentIndex+1];
      }
    }
    
    return null;
  }
  
  showInfiniteHint:any = false;
  updateInfiniteHint(){
    if(this.toPlayList.length==1&&this.isInfinite==false){
      this.showInfiniteHint = true;
    }
    else{
      this.showInfiniteHint = false;
    }
  }

  playNext(){
    let nextPoem = this.findNext();

    //remove current
    if(this.isRepeat==0 && this.currentPoem){
      this.toPlayList = this.toPlayList.filter((p:any)=>p.id!=this.currentPoem.id);
    }
    //update hint text
    this.updateInfiniteHint();

    if(nextPoem!=null)
    {
      this.playbyid(nextPoem.id, nextPoem.sample, false);
    }
    else
    {
      if(this.toPlayList.length==0 && this.isInfinite){
        if(this.additionalList.length>0)
        {
          let p = this.additionalList.shift();
          this.toPlayList.push(p);
          this.playbyid(p.id, p.sample, false);
          //when play next button
          this.checkAndLoadAdditionalList();
        }
      }
    }

    

    /*
    if(this.audio){
      this.audio.pause();
      this.lrc.pause();
    }
    if(song==null){
      song = this.queueData[0];
    }
    let newIndex = (song.id>this.queueData.length-1) ? 0: song.id;
    let nextSong = this.queueData[newIndex];
    song.selected = false;
    this.playSelected(nextSong);
    */
  }


  

  


  /*--play queue end--*/




  /*--target start----*/
  targetType=[{id:0, name:"目标"},{id:1, name:"已完成"}];

  targetData: Song[] = [];

  getTargets(groupId:any){
    return this.targetData.filter(t=>t.groupId==groupId);
  }

  getTarget(targetId:any){
    let result = this.targetData.filter(t=>t.id==targetId);

    return result.length>0?result[0]:null;
  }

  addTarget(groupId:number, name:string, mediaUrl:any, lyricUrl:any, lyricText:any, img:any, file:any){
    let newId = this.getNewId(this.targetData);
    let newTarget = {
      id:newId,
      groupId:groupId,
      name:name,
      desc:name,
      mediaUrl:mediaUrl,
      lyricUrl:lyricUrl,
      lyricText:lyricText,
      img:img,
      file:file,
      selected: false,
      create:new Date().getTime(),
    };
    this.targetData.push(newTarget);
    
    this.save();

  }

  updateTarget(target:Song){
    let obj = this.targetData.filter(t=>t.id==target.id);
    if(obj.length>0){
      let orgTarget = obj[0];
      orgTarget.groupId = target.groupId;
      orgTarget.name = target.name;
      orgTarget.mediaUrl = target.mediaUrl;
      orgTarget.lyricUrl = target.lyricUrl;
      orgTarget.lyricText = target.lyricText;
      orgTarget.img = target.img;
      orgTarget.file = target.file;
    }
    this.save();
  }

  deleteTarget(tid:number){
    const targetIndex = this.targetData.findIndex((t) => t.id === tid);

    if (targetIndex > -1) {
      this.targetData.splice(targetIndex, 1);
    }

    this.save()
  }
  /*---targetend----*/

  /*----group start--------------------------------------*/
  group:Group[] = [];


  icons=[
    {name:"calendar-outline"},
    {name:"briefcase-outline"},
    {name:"rocket-outline"},
    {name:"fitness-outline"},
    {name:"fast-food-outline"},
    {name:"calendar-number-outline"},

    {name:"star-outline"},
    {name:"earth-outline"},
    {name:"headset"},
    {name:"diamond-outline"},
    {name:"cash-outline"},
    {name:"tv-outline"},
  ];

  proicons=[
    {name:"calendar-outline"},
    {name:"briefcase-outline"},
    {name:"rocket-outline"},
    {name:"fitness-outline"},
    {name:"fast-food-outline"},
    {name:"calendar-number-outline"},

    {name:"star-outline"},
    {name:"earth-outline"},
    {name:"headset"},
    {name:"diamond-outline"},
    {name:"cash-outline"},
    {name:"tv-outline"},
  ];

  covers=[
    {name:"cover1"},
    {name:"cover2"},
    {name:"cover3"},
  ];

  procovers=[
    {name:"cover1"},
    {name:"cover2"},
    {name:"cover3"},
    {name:"cover1"},
    {name:"cover2"},
    {name:"cover3"},
  ];

  getGroup(groupId:number){
    let result = this.group.filter(g=>g.id==groupId);
    return result.length>0?result[0]:null;
  }

  addGroup(newGroup:Group){
    newGroup.id = this.getNewId(this.group);
    this.group.push(newGroup);
  }

  updateGroup(group:Group){
    let obj = this.group.filter(g=>g.id==group.id);
    if(obj.length>0){
      let orgGroup = obj[0];
      orgGroup.name = group.name;
      orgGroup.img = group.img;
      //orgGroup.cover = group.cover;
    }
  }

  //todo
  deleteGroup(gid:number){
    const groupIndex = this.group.findIndex((g) => g.id === gid);

    if (groupIndex > -1) {
      this.group.splice(groupIndex, 1);
      //this.calculate();
    }
  }

  //for create new target only
  globalCurrentTargetGroup:Group|any;
  /*---group end---------------------------------------*/


  /*--mix start----*/
  LocalTargetKey="local_targets_music_key";
  LocalGroupKey="local_groups_music_key";

  //play history list
  LocalQueueKey="local_queue_music_key";
  save(){
    this.set(this.LocalTargetKey, JSON.stringify(this.targetData));
    this.set(this.LocalGroupKey, JSON.stringify(this.group));

    this.set(this.LocalQueueKey, JSON.stringify(this.queueData));
  }
  init(){
    //诗词数据 很大
    this.loadJsonData();
    //
    this.loadTopicData();
    this.loadlikes();
    //load hourly fun data
    this.loadFunData();
    //load poem play history
    this.loadPlayHistory();
    this.loadSearchHistory();
    //load ep play history
    this.loadRecentPlayedEP();
    //load play style
    this.loadPlayStyle();
    
    //tab4 订阅随机图片
    this.getSubscriptionImage();

    this.initRatings();
    //console.log('load data completed')
  }
  
  /*--mix end----*/


  initData(){
    /*
    //reset groups
    this.group = [
      {id:0, name: "我的跑步歌单", img:"", icon:"bag-outline", cover:"cover1", count:0, color:"rgb(247,54,65)", src:"url('https://reddah.blob.core.windows.net/msjjimg/p1.jpg')"},
      {id:1, name: "中文歌单", img:"", icon:"barbell-outline", cover:"cover2", count:0, color:"rgb(119,117,118)", src:"url('https://reddah.blob.core.windows.net/msjjimg/p2.jpg')"},
      {id:2, name: "英文歌单", img:"", icon:"fitness-outline", cover:"cover3", count:0, color:"rgb(73,71,64)", src:"url('https://reddah.blob.core.windows.net/msjjimg/p3.jpg')"},
      {id:3, name: "骑车", img:"", icon:"diamond-outline", cover:"cover1", count:0, color:"rgb(138,132,124)", src:"url('https://reddah.blob.core.windows.net/msjjimg/p4.jpg')"},
    ];
    //reset targets
    let createTime = new Date().getTime();
    this.targetData =
    [
      {id:1, groupId:0, name:"其实都没有-杨宗纬", desc:"其实都没有-杨宗纬", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:2, groupId:0, name:"Skin - Rag", desc:"Skin - Rag", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:3, groupId:0, name:"Unstoppable - Sia", desc:"Unstoppable - Sia", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:4, groupId:0, name:"Natural - Imagine Dragon", desc:"Natural - Imagine Dragon", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:5, groupId:0, name:"Hawk Nelson - Sold Out", desc:"Sold Out - Hawk Nelson", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:6, groupId:0, name:"皇后大道东 - 罗大佑", desc:"皇后大道东 - 罗大佑", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:7, groupId:0, name:"除了爱你还能爱谁 - 动力火车", desc:"除了爱你还能爱谁 - 动力火车", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:8, groupId:1, name:"岁月无声 - Beyond", desc:"岁月无声 - Beyond", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:9, groupId:1, name:"月半小夜曲 - 陈乐基", desc:"月半小夜曲 - 陈乐基", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
      {id:10, groupId:1, name:"东京爱情故事", desc:"东京爱情故事", mediaUrl:"", lyricUrl:"", lyricText:"", img:"", file:"", selected: false, create:createTime },
    ];
    */
  }



  slidesJsonData:any;
  /*template start*/
  async getSlides(id:any){
    let json = `assets/template/${id}.json`;
    //console.log(json)
    /*
    this.http.get<any>(json)
      .subscribe(result =>{
          this.slidesJsonData = result;
      }, error =>{
          console.log(error);
      });
      */
     return this.http.get<any>(json).pipe().toPromise();
  }

  /*template end*/

  getbgcolor(){
    //make sure it's not blink
    return "rgb(98, 166, 243)";
    //return this.getRandomArray(this.colorList,1);
  }

  getRandomArray(arr:any,n:any){
    if(!arr || arr.length==0)
      return arr;
    
    let localArr = JSON.parse(JSON.stringify(arr));
    let resultArr = [];
    for(let i=0;i<n;i++){
      let randomIndex = this.getRandom(0, localArr.length-1);
      let item = localArr[randomIndex];
      if(item.color==null||item.color.length==0){
        item.color=this.getRandomColor();
      }
      resultArr.push(item);
      localArr.splice(randomIndex,1);
    }
    return resultArr;
  }

  getInt(value:any)
  {
    return Math.round(value)
  }


  LOCALSTORAGE_LAST_VISIT_TAB = "app_last_visit_tab";
  setLastVisitTab(tab:any){
    this.currentTab = tab;
    this.set(this.LOCALSTORAGE_LAST_VISIT_TAB, JSON.stringify(this.currentTab));
  }
  currentTab:any = null;
  goToAuthor(author:any){
    this.navCtrl.navigateForward(`/tabs/${this.currentTab}/poet/${author}`);
  }
  goToList(id:any){
    this.navCtrl.navigateForward(`/tabs/${this.currentTab}/list/${id}`);
  }
  goToPlayList(id:any){
    //console.log(id)
    //tab3
    this.navCtrl.navigateForward(`/tabs/tab3/customlist/${id}`);
  }
  //by tag or by id
  goToListBy(item:any){
    if(item.author!=null){
      this.goToAuthor(item.author)
    }
    else if(item.game!=null){//名句接龙
      this.navCtrl.navigateForward(`/tabs/${this.currentTab}/gamenext/${item.id}`);
    }
    else
    {
      this.saveRecentPlayedEP(item);
      if(item.id){//有id诗单
        this.goToList(item.id);
      }
      else{//tag诗单
        //this.currentAuthor = item.text;
        //this.currentImage = item.src;
        this.currentItem = item;
        this.navCtrl.navigateForward(`/tabs/${this.currentTab}/tag/${item.text}`);
      }
    }
  }
  goToTopic(id:any){
    this.navCtrl.navigateForward(`/tabs/${this.currentTab}/topic/${id}`);
  }
  goToSearch(){
    this.navCtrl.navigateForward(`/tabs/tab4`);
  }
  
  /**search history logic block start */
  LOCALSTORAGE_SEARCH_HIST = "search_keywords_history";
  searchHistory:any = [];
  async loadSearchHistory(){
    this.get(this.LOCALSTORAGE_SEARCH_HIST).then((value)=>{
      if(value==null)
        this.searchHistory = [];
      else{
        let history = JSON.parse(value);
        this.searchHistory = history.filter((s: string) => {
          // Filter out pure Pinyin (letters, spaces, apostrophes)
          if (/^[a-zA-Z\s']+$/.test(s)) return false;
          // Filter out mixed Chinese and letters (unfinished Pinyin input)
          if (/[\u4e00-\u9fa5]/.test(s) && /[a-zA-Z]/.test(s)) return false;
          return true;
        });
      }
    });
  }
  saveSearchHistory(key:any){
    // Filter out pure Pinyin (letters, spaces, apostrophes)
    if (/^[a-zA-Z\s']+$/.test(key)) return;
    // Filter out mixed Chinese and letters (unfinished Pinyin input)
    if (/[\u4e00-\u9fa5]/.test(key) && /[a-zA-Z]/.test(key)) return;

    this.searchHistory = this.searchHistory.filter((s:any)=>
      s !== key
    );
    
    this.searchHistory.push(key);
    if(this.searchHistory.length>100){
      this.searchHistory.shift();
    }
    this.set(this.LOCALSTORAGE_SEARCH_HIST, JSON.stringify(this.searchHistory));
  }
  clearSearchHistory(){
    this.searchHistory = [];
    this.set(this.LOCALSTORAGE_SEARCH_HIST, JSON.stringify(this.searchHistory));
  }
  /**search history logic block end */

  //tab4 related start
  searchText:any;
  showFilter = false;
  displayResult:any = [];
  onSearchCancel(){
    this.showFilter = false;
    this.displayResult = [];
    this.searchText = "";
    this.searchText = this.ui.instant('Search.Tab4');
  }
  //tab4 related end

  play(){
    if(this.currentPoem.paragraphs&&this.currentPoem.title&&this.currentPoem.author)
      this.ui.player(this.currentPoem);
  }
  
  playbyid(id:any=null, sample:any=null, pop:any=true){
    //console.log(id+sample)
    if(id){
      let poem = this.JsonData
        .filter((shici:any)=>
          shici.id===id
        )[0];
        //console.log(poem)

      //if(poem){
        poem.sample = sample;
        //if 有mp3, do not show modal, play directly
        //this.playobj(poem, poem.audio?false:true);
        //always pop
        this.playobj(poem, pop);
      //}
    }
  }


  currentPoem: any;
  playobj(poem:any, pop:any=true){
    if(poem){
      if(poem.id){
        poem = this.JsonData
        .filter((shici:any)=>
          shici.id===poem.id
        )[0];
      }
      
      if(!poem){
        //poem list has id, but poem has no id...
        //do nothing
        this.ui.toast('top','诗词ID没找到~')
        return;
      }

      this.currentPoem = poem;
      if(poem.audio){
        this.setAudio();
      }else{
        this.execPause();
        // if(pop){
        //   this.ui.player(this.currentPoem);
        // }
      }
      if(pop){
        this.ui.player(this.currentPoem);
      }
      this.savePlayHistory(this.currentPoem);
    }
  }

  LOCALSTORAGE_POEM_HIST = "poem_play_history";
  playHistory:any = [];
  async loadPlayHistory(){
    this.get(this.LOCALSTORAGE_POEM_HIST).then((value)=>{
      if(value==null)
        this.playHistory = [];
      else{
        this.playHistory = JSON.parse(value);
      }
    });
  }
  savePlayHistory(poem:any){
    this.playHistory = this.playHistory.filter((p:any)=>
      !((p.id == poem.id) || (p.title==poem.title&&p.author==poem.author))
    );
    
    this.playHistory.push(poem);
    if(this.playHistory.length>100){
      this.playHistory.shift();
    }
    this.set(this.LOCALSTORAGE_POEM_HIST, JSON.stringify(this.playHistory));
  }
  clearHistory(){
    this.playHistory = [];
    this.set(this.LOCALSTORAGE_POEM_HIST, JSON.stringify(this.playHistory));
  }
  




  collectList:any = [{group:"",data:null, lastupdate:Date.now()}];
  recentCollection(){
    let result = this.collectList.sort((a:any,b:any)=>{return b.lastupdate-a.lastupdate});
    //console.log(result)
    return result;
  }
  myList = [];
  
  async loadTopicData(){
    //load topics
    if(this.searchTopicData==null){
      this.getData(`/assets/topic/search-topic.json`).subscribe(data=>{
        //hide:true is for tab2 browse
        //console.log(data)
        this.searchTopicData = data.filter((d:any)=>d.hide!==true);
        this.tab2BrowseTopicData = data.filter((d:any)=>d.hide===true&&d.id==200);
        this.tab5RadioTopicData = data.filter((d:any)=>d.hide===true&&d.id==199);
      });
    }
  }

  LOCALSTORAGE_POEM_LIST = "shi_list";
  async loadlikes(){
    this.get(this.LOCALSTORAGE_POEM_LIST).then((value)=>{
      if(value==null)
        this.collectList = [];
      else{
        this.collectList = JSON.parse(value);
        this.loadAllLibraryCount();
      }
    });
  }

  getRandomColor(){
    let colors = [
      "rgb(113,203,212)",
      "rgb(240,209,246)",
      "rgb(255,230,151)",
      "rgb(255,222,194)",
      "rgb(205,238,240)",
      "rgb(240,209,246)",
      "rgb(255,230,151)",
      "rgb(255,222,194)",
      "rgb(205,238,240)",
      "rgb(113,203,212)",
      "rgb(240,209,246)",
      "rgb(255,230,151)",
      "rgb(255,222,194)",
      "rgb(205,238,240)",
      "rgb(240,209,246)",
      "rgb(255,230,151)"];
    let randomIndex = this.getRandom(0, colors.length-1);
    return colors[randomIndex];
  }

  generate_uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }

  addcustomlist(name:any, desc:any){
    if(name==null||name.trim()==""){
      name = "未命名诗单列表";
    }
    let id = this.generate_uuid();
    
    this.collectList.push({
      group:'customlist', 
      data:{id:id, name:name,desc:desc,color:this.getRandomColor(),list:[],image:[]}, 
      lastupdate: Date.now()
    });
    this.set(this.LOCALSTORAGE_POEM_LIST, JSON.stringify(this.collectList));
  }

  savecustomlist(data:any){
    let findItem = this.collectList.filter((c:any)=>c.group==='customlist'&&c.data['id']===data.id);
    if(findItem.length===1){
      //console.log(findItem[0])
      findItem[0].data = data;
      findItem[0].lastupdate = Date.now();
      this.set(this.LOCALSTORAGE_POEM_LIST, JSON.stringify(this.collectList));
    }

  }

  //group: idlist, taglist, poetlist, poem, customlist
  likelist(listdata:any, group:any){
    //in case it's brief data from json
    if(group==='poem'){
      let fullData = this.JsonData.filter((j:any)=>j.id===listdata.id);
      if(fullData.length===1){
        listdata = fullData[0];
      }
    }

    if(!this.isliked(listdata, group)){
      this.collectList.push({group:group, data:listdata, lastupdate: Date.now()});
      this.set(this.LOCALSTORAGE_POEM_LIST, JSON.stringify(this.collectList));
    }
    
    this.ui.toast("top", this.ui.instant("Message.LibAdded"))//"已添加到诗词库"
  }

  isliked(listdata:any, group:any){
    //in case it's brief data from json
    if(group==='poem'){
      let fullData = this.JsonData.filter((j:any)=>j.id===listdata.id);
      if(fullData.length===1){
        listdata = fullData[0];
      }
    }

    let allpoemlist = this.collectList.filter((l:any)=>l.group==group);
    let key = this.getKey(group);
    return allpoemlist.find((pl:any)=>pl.data?.[key]===listdata[key])
  }

  private getKey(group:any){
    let key = "id";
    if(group=='idlist'){
      key = "id";
    }
    else if(group=='taglist'){
      key = "text";
    }
    else if (group=='poetlist'){
      key = "name";
    }
    else if(group=='poem'){
      key = "id";
    }
    else if(group=='customlist'){
      key = "id";
    }
    return key;
  }

  async unlikelist(listdata:any, group:any){
    //in case it's brief data from json
    if(group==='poem'){
      let fullData = this.JsonData.filter((j:any)=>j.id===listdata.id);
      if(fullData.length===1){
        listdata = fullData[0];
      }
    }

    let text = "";
    if(group=='idlist')
      text = "诗单"
    else if(group=='taglist')
      text = "主题"
    else if(group=='poetlist')
      text = "诗人"
    else if(group=='poem')
      text = "诗词"
    else if(group=='customlist')
      text = "诗单列表"

    const actionSheet = await this.actionSheetController.create({
      header: `你确定要从诗词库删除这个${text}吗？`,
      buttons: [
        {
          text: `删除${text}`,
          role: 'destructive',
          handler: () => {
            if(this.isliked(listdata, group)){
              let key = this.getKey(group);
              for (let i = 0; i < this.collectList.length; i++) {
                let item = this.collectList[i];
                if (item.group===group && item.data?.[key] === listdata[key]) {
                  this.collectList.splice(i, 1);
                    break;
                }
              }
              this.set(this.LOCALSTORAGE_POEM_LIST, JSON.stringify(this.collectList));
            }
          }
        },
        {
          text: '取消',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });

    await actionSheet.present();
    const { data, role } = await actionSheet.onWillDismiss();
    //console.log(role)
    //如果tab3 新建list打开的，点了从诗词库删除，关闭modal
    //如果tab3 查看诗词打开的，点了从诗词库删除，关闭modal
    //console.log(group)
    if(group==='customlist'){
      this.updateLocalData(group);
      //role could be: cancel or destructive
      if(role=='destructive'){
        this.navCtrl.navigateForward(`/tabs/tab3/customlist`);
      }
    }
    else if(group==='poem'){
     //console.log('update local data when unlike list')
      this.eventService.triggerMyEvent({ someData: 'player click unlike list' });
      this.updateLocalData(group);
    }
  }

  //test method
  clearLocalStorage(){
    this.storage.clear();
  }

  poemlistcount:any=0;
  poetcount:any=0;
  albumcount:any=0;
  poemcount:any=0;
  topiccount:any=0;
  get articleCount(){
    return this.myLikeArticles.length;
  }

  loadAllLibraryCount(){
    this.updateLocalData('customlist');
    this.updateLocalData('poetlist');
    this.updateLocalData('idlist');
    this.updateLocalData('poem');
    this.updateLocalData('taglist');
  }
  localJsonData:any;
  updateLocalData(group:any){
    this.localJsonData = this.recentCollection()
      .filter((l:any)=>l.group==group);
    //console.log(this.localJsonData)
    switch(group){
      case 'customlist':
        this.poemlistcount = this.localJsonData.length;
        break;
      case 'poetlist':
        this.poetcount = this.localJsonData.length;
        break;
      case 'idlist':
        this.albumcount = this.localJsonData.length;
        break;
      case 'poem':
        this.poemcount = this.localJsonData.length;
        break;
      case 'taglist':
        this.topiccount = this.localJsonData.length;
        break;
    } 
  }

  currentCollectLike:any;
  currentCollectPoem:any;
  collectCustom(p:any){
    let fullData = this.JsonData.filter((j:any)=>j.id===p.id);
    if(fullData.length===1){
      this.currentCollectPoem = fullData[0];
    }
    else{
      this.currentCollectPoem = p;
      //console.log('did not find the poet data by id:'+p.id)
    }
  }
  addtocustomlist(like:any){
    if(this.currentCollectPoem){
      if(!like.data.list.find((d:any)=>d.id===this.currentCollectPoem.id)||
      this.currentCollectPoem.id==null
      )
      {
        like.data.list.push(this.currentCollectPoem);
      }

      like.lastupdate = Date.now();
      like.data.image = [];
      if(like.data.list.length>0&&like.data.list.length<4){
        let image = `https://reddah.blob.core.windows.net/msjjpoet/${like.data.list[0].author}.jpeg`;
        like.data.image.push(image);
      }else if(like.data.list.length>=4){
        /*for(let i=0;i<4;i++){
          let image = `https://reddah.blob.core.windows.net/msjjpoet/${like.data.list[i].author}.jpeg`;
          like.data.image.push(image);
        }*/
        let maxNumber = 4;
        let curNumber = 0;
        for(let k=0;k<like.data.list.length;k++){
          let image = `https://reddah.blob.core.windows.net/msjjpoet/${like.data.list[k].author}.jpeg`;
          
          if(!like.data.image.includes(image))
          {
            like.data.image.push(image);
            curNumber ++;
            if(curNumber ==maxNumber)
              break;
          }
        }
      }
      else{

      }
      this.set(this.LOCALSTORAGE_POEM_LIST, JSON.stringify(this.collectList));
      this.ui.toast("top", this.ui.instant("Message.PoemlistAdded"))//已添加到诗词列表
    }

  }
  GetLastUpdatedCustomList(){
    let result = this.collectList.filter((c:any)=>c.group==='customlist')
      .sort((a:any,b:any)=>{return b.lastupdate-a.lastupdate});

    if(result.length>0)
      return result[0];
    return null;
  }
  updatecustomelist(customlistid:any, localList:any){
    for(let i=0;i<this.collectList.length;i++){
      if(this.collectList[i].group==='customlist'&&
      this.collectList[i].data.id===customlistid){
        this.collectList[i].data.list = localList;
        //update image
        if(this.collectList[i].data.list.length>0&&this.collectList[i].data.list.length<4){
          let image = `https://reddah.blob.core.windows.net/msjjpoet/${this.collectList[i].data.list[0].author}.jpeg`;
          this.collectList[i].data.image = [image];
        }else if(this.collectList[i].data.list.length>=4){
          this.collectList[i].data.image = [];
          /*for(let k=0;k<4;k++){
            let image = `https://reddah.blob.core.windows.net/msjjpoet/${this.collectList[i].data.list[k].author}.jpeg`;
            this.collectList[i].data.image.push(image);
          }*/
          let maxNumber = 4;
          let curNumber = 0;
          for(let k=0;k<this.collectList[i].data.list.length;k++){
            let image = `https://reddah.blob.core.windows.net/msjjpoet/${this.collectList[i].data.list[k].author}.jpeg`;
            
            if(!this.collectList[i].data.image.includes(image))
            {
              this.collectList[i].data.image.push(image);
              curNumber ++;
              if(curNumber ==maxNumber)
                break;
            }
          }
        }else if(this.collectList[i].data.list.length==0){
          this.collectList[i].data.image = [];
        }
        break;
      }
    }
    
    this.set(this.LOCALSTORAGE_POEM_LIST, JSON.stringify(this.collectList));
  }





  isShuffle:any= false;
  isRepeat:any= false;
  isInfinite:any= false;
  LOCALSTORAGE_PLAY_STYLE = "poem_play_style";
  savePlayStyle(){
    let style = {shuffle:this.isShuffle, repeat:this.isRepeat, infinite: this.isInfinite};
    this.set(this.LOCALSTORAGE_PLAY_STYLE, JSON.stringify(style));
  }
  
  async loadPlayStyle(){
    this.get(this.LOCALSTORAGE_PLAY_STYLE).then((value)=>{
      if(value==null)
      {}
      else{
        let style = JSON.parse(value);
        this.isShuffle = style.shuffle;
        this.isRepeat = style.repeat;
        this.isInfinite = style.infinite;

        //when app initiates
        if(this.isInfinite){
          this.checkAndLoadAdditionalList();
        }
      }
    });
  }



  /* EP hisotry start */
  LOCALSTORAGE_EP_HIST = "ep_play_history";
  MAX_HIS_COUNT_EP:number = 20;
  playedEPHistory:any = [];
  async loadRecentPlayedEP(){
    this.get(this.LOCALSTORAGE_EP_HIST).then((value)=>{
      if(value==null)
        this.playedEPHistory = [];
      else{
        this.playedEPHistory = JSON.parse(value);
      }
    });
  }
  saveRecentPlayedEP(ep:any){
    
    if(this.playedEPHistory.length>0){
      let lastPlay = this.playedEPHistory[0];

      //console.log('lastplay')
      //console.log(lastPlay)

      if((lastPlay.id && lastPlay.id == ep.id)||lastPlay.text==ep.text)
      {
        
        
        return;
      }
    }
    //console.log(ep)
    this.playedEPHistory.unshift(ep);
    if(this.playedEPHistory.length>this.MAX_HIS_COUNT_EP){
      this.playedEPHistory.pop();
    }
    this.set(this.LOCALSTORAGE_EP_HIST, JSON.stringify(this.playedEPHistory));
  }
  clearRecentPlayedEP(){
    this.playedEPHistory = [];
    this.set(this.LOCALSTORAGE_EP_HIST, JSON.stringify(this.playedEPHistory));
  }
  /* EP hisotry start */




  /*custom image for custom list start */
  public async addNewToGallery(listdata:any, from:any) {
    let source = from=='camera'?CameraSource.Camera:CameraSource.Photos;
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: source,
      quality: 100
    });
  
    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    
    listdata.customimage = savedImageFile.webviewPath;
    //console.log(savedImageFile.webviewPath)
  }

/*
  public async loadSaved() {
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
  
    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data
        });
  
        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }
*/
  // Save picture to file on device
  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = Date.now() + '.jpeg';
    //const appIdentifier = 'com.reddah.shi';
    const savedFile = await Filesystem.writeFile({
      //path: appIdentifier+"/"+fileName,
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });
    //console.log("Directory.Cache"+Directory.Cache)

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        //webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        webviewPath: `data:image/jpeg;base64,${base64Data}`
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        //webviewPath: photo.webPath
        webviewPath: `data:image/jpeg;base64,${base64Data}`
      };
    }
  }

  private async readAsBase64(photo: Photo) {
    //console.log(photo)
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });
  
      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
  
      return await this.convertBlobToBase64(blob) as string;
    }
  }
  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
  /*custom image for custom list end */

  search(key:any){
    //console.log(key)
    Browser.open({ url: `http://www.bing.com/search?q=${key}` });
  } 

  async RatingsAndReviews() {
    this.closeRatings();
    let iosId = 6476442565;
    //let iosId = 1481532281;//reddah
    let storeAppURL = `itms-apps://itunes.apple.com/app/id${iosId}`;
    window.open(storeAppURL);
  }

  //日期个位是5的显示
  LOCALSTORAGE_RATINGS:any = "LOCALSTORAGE_RATINGS";
  initRatings(){
    let today = new Date();
    let todayNumber = today.getDate();
    if(todayNumber%5==0){
      this.storage.get(this.LOCALSTORAGE_RATINGS).then(data=>{
          if(data==null){
            this.showRatingsAndReviews = true;
          }
          else if(data==todayNumber){
            this.showRatingsAndReviews = false;
          }
          else{
            this.showRatingsAndReviews = true;
          }
      });
    }
    else{
      this.showRatingsAndReviews = false;
    }
  }
  closeRatings(){
    this.showRatingsAndReviews = false;
    let today = new Date();
    let todayNumber = today.getDate();
    this.set(this.LOCALSTORAGE_RATINGS, JSON.stringify(todayNumber));
  }


  async share(title:any, text:any, url:any, dialogTitle:any){
    //微信禁止此类分享
    await Share.share({
      title: title,//'See cool stuff',
      text: text, //'Really awesome thing you need to see right meow',
      url: url,//'http://ionicframework.com/',
      dialogTitle: dialogTitle, //'Share with buddies',
    });
  }


  public async share1(from:any) {
    let source = from=='camera'?CameraSource.Camera:CameraSource.Photos;
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: source,
      quality: 100
    });
    
    const base64Data = await this.readAsBase64(capturedPhoto);
    //console.log(base64Data)
    this.ui.share("data:image/jpeg;base64,"+base64Data);
    /*
    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    
    listdata.customimage = savedImageFile.webviewPath;
    //console.log(savedImageFile.webviewPath)
    */
  }





  /* Current Locale start */
  currentLocale = "zh-CN";
  LOCALSTORAGE_LOCALE = "msjj_locale";
  async loadLocale(){
    this.get(this.LOCALSTORAGE_LOCALE).then((value)=>{
      if(value==null){
        this.currentLocale = "zh-CN";
      }
      else{
        this.currentLocale = JSON.parse(value);
      }
      this.ui.loadTranslate(this.currentLocale);
    });
  }
  saveLocale(locale:any){
    this.currentLocale = locale;
    this.set(this.LOCALSTORAGE_LOCALE, JSON.stringify(this.currentLocale));
  }
  getCurrentLocale(){
    return this.currentLocale??"zh-CN";
  }
  /* Current Locale start */

  /*start save articles */
  LOCALSTORAGE_Like_Articles = "my_like_articles";
  myLikeArticles:any=[];
  async loadMyLikeArticles(){
    this.get(this.LOCALSTORAGE_Like_Articles).then((value)=>{
      if(value==null)
        this.myLikeArticles = [];
      else{
        this.myLikeArticles = JSON.parse(value);
      }
    });
  }
  getMyLikeArticleById(articleId:any){
    return this.myLikeArticles.filter((h:any)=>h.id==articleId)[0];
  }
  likeArticle(){
    this.saveMyLikeArticle(this.currentArticle);
  }
  unlikeArticle(){
    this.delMyLikeArticle(this.currentArticle);
  }
  isLikedArticle(){
    return this.myLikeArticles.filter((h:any)=>h.id==this.currentArticle.id).length>0;
  }
  saveMyLikeArticle(myLikeArticle:any){
    let result = this.myLikeArticles.filter((h:any)=>h.id==myLikeArticle.id)[0];
    if(result){
      //console.log('exists..')
    }else{
      this.myLikeArticles.unshift(myLikeArticle);
      //console.log('add new one...')
    }
    this.set(this.LOCALSTORAGE_Like_Articles, JSON.stringify(this.myLikeArticles));
    this.ui.toast("top", this.ui.instant("Message.LibAdded"))//"已添加到诗词库"
  }
  delMyLikeArticle(data:any){
    for(let i=0;i<this.myLikeArticles.length;i++){
      if(this.myLikeArticles[i].id===data.id){
        this.myLikeArticles.splice(i,1);
        break;
      }
    }
    this.set(this.LOCALSTORAGE_Like_Articles, JSON.stringify(this.myLikeArticles));
  }
  /*end save articles */


  /*start text font size zoom level */
  zoomLevel:number = 1;
  zoom(px:any){
    px = this.ui.isipad?px+10:px;
    return px*this.zoomLevel + 'px'
  }
  LOCALSTORAGE_Text_FontSize_Zoom_Level = "app_text_fontsize_zoom_level";
  setFontSizeZoomLevel(level:any=1){
    this.zoomLevel = level;
    this.set(this.LOCALSTORAGE_Text_FontSize_Zoom_Level, JSON.stringify(this.zoomLevel));
  }
  async loadFontSizeZoomLevel(){
    const zoomLevel = await this.storage.get(this.LOCALSTORAGE_Text_FontSize_Zoom_Level);
    if (zoomLevel) {
      this.zoomLevel = zoomLevel;
    } else {
      this.zoomLevel = 1;//default
    }
  }
  textZoomer:any;
  async textZoom() {
      this.textZoomer = await this.modalController.create({
          component: TextZoomerPage,
          componentProps: {},
          cssClass: 'modal-text-zoomer',
          keyboardClose: true,
          showBackdrop: true,
          breakpoints: [0, 0.2, 1],
          initialBreakpoint: 0.2,
          //initialBreakpoint: poem.audio?1:0.5,
          //breakpoints: [0, 1],
          //initialBreakpoint: 1,
          //enterAnimation: this.enterAnimation,
          //leaveAnimation: this.leaveAnimation,
          //presentingElement: await this.modalController.getTop(),
      });

      return await this.textZoomer.present();
  }
  /*end text font size zoom level */

  /*save chat history start*/
  LOCALSTORAGE_AI_CHAT_HIST = "ai_chat_history";
  aiChatHistory:any=[];
  async loadAIChatHistory(){
    this.get(this.LOCALSTORAGE_AI_CHAT_HIST).then((value)=>{
      if(value==null)
        this.aiChatHistory = [];
      else{
        this.aiChatHistory = JSON.parse(value);
        //console.log('load ai chat history')
        //console.log(this.aiChatHistory)
      }
    });
  }
  getChatHistoryById(chatId:any){
    return this.aiChatHistory.filter((h:any)=>h.id==chatId)[0];
  }
  saveAIChatHistory(chatHistory:any){
    //console.log('save ai chat history')
    //console.log(chatHistory)
    //console.log(this.aiChatHistory)
    let result = this.aiChatHistory.filter((h:any)=>h.id==chatHistory.id)[0];
    //console.log('result:')
    //console.log(result)
    if(result){
      let existingChat = result;
      existingChat.messages = chatHistory.messages;
      //console.log('exists..')
    }else{
      this.aiChatHistory.push(chatHistory);
      //console.log('add new one...')
    }
    this.set(this.LOCALSTORAGE_AI_CHAT_HIST, JSON.stringify(this.aiChatHistory));
  }
  delAIChatHistory(data:any){
    for(let i=0;i<this.aiChatHistory.length;i++){
      if(this.aiChatHistory[i].id===data.id){
        this.aiChatHistory.splice(i,1);
        break;
      }
    }
    this.set(this.LOCALSTORAGE_AI_CHAT_HIST, JSON.stringify(this.aiChatHistory));
  }
  clearAIChatHistory(){
    this.aiChatHistory = [];
    this.set(this.LOCALSTORAGE_AI_CHAT_HIST, JSON.stringify(this.aiChatHistory));
  }
  /*save chat history end*/

  goMe(){
    this.router.navigate(['tabs/tab1/me'], {
      queryParams: {}
    });
  }


  private setLocale(locale:any){
    this.saveLocale(locale);
    this.ui.loadTranslate(locale);
  }


  public get textActionSheetButtons() {
    return [
      {
        text: this.ui.instant('Tutorial.Language') 
          + ' (' + this.getCurrentLanguageName() + ')',
        role: 'destructive',
        handler: () => {
          this.presentLanguageActionSheet();
        }
      },
      {
        text: this.ui.instant('Action.FontSize') 
          + ' (' + Math.floor(this.zoomLevel * 100) + '%)',
        handler: () => {
          this.textZoom();
        }
      },
      {
        text: this.ui.instant('Action.Cancel'),
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ];
  }

  async presentLanguageActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.ui.instant('Tutorial.Language'),
      buttons: this.actionSheetButtons,
    });
    await actionSheet.present();
  }

  public languageList = [
    { code: 'zh-CN', text: '简体中文' },
    { code: 'zh-TW', text: '繁体中文' },
    { code: 'en-US', text: 'English' },
    { code: 'es-ES', text: 'Español' },
    { code: 'fr-FR', text: 'Français' },
    { code: 'ar-AE', text: 'العربية' },
    { code: 'ru-RU', text: 'Русский' },
    { code: 'pt-PT', text: 'Português' },
    { code: 'de-DE', text: 'Deutsch' },
    { code: 'ja-JP', text: '日本語' },
    { code: 'ko-KR', text: '한국어' },
    { code: 'el-GR', text: 'Ελληνικά' },
    { code: 'th-TH', text: 'ไทย' }
  ];

  public get actionSheetButtons() {
    return this.languageList.map(item => ({
      text: item.text,
      handler: () => {
        this.setLocale(item.code);
      }
    }));
  }

  public getCurrentLanguageName() {
    const lang = this.languageList.find(l => l.code === this.currentLocale);
    return lang ? lang.text : '简体中文';
  }



  /** game storage start */
  async retrieve(key: string){
    return this.storage.get(key);
  }
  async store(key: string, value:any){
    this.storage.set(key, value);
  }
  /** game storage end */
  /**games start */
  totalstars = 0;
  mystars = 0;
  levelTotalStars = [0,0,0,0];
  myLevelTotalStars = [0,0,0,0];
  myLevelStars:any = [];//120 levels
  maxLevelUnlocked = 1;
  mycoins = 0;
  currentTasks:any = [];
  levels:any = [];
  async updateGameData(){
    this.totalstars = await this.getTotalStars();//30*4=120
    this.mystars = await this.getAllMyStars();
    //console.log('max:'+this.maxLevelUnlocked)
    this.mycoins = await this.getMyCoins();

    for(let i=0;i<4;i++){
      this.myLevelTotalStars[i] = await this.getMyLevelStars(i+1);
      this.levelTotalStars[i] = await this.getLevelTotalStars(i+1)
    }
    this.maxLevelUnlocked = await this.getMaxLevelUnlocked();

    this.levels = [
      {id:1, name:"萌新", desc:"昨夜西风凋碧树，独上高楼，望尽天涯路", 
        position:"",   
        //position:"bottom", 
        limit:0,
        color:"deepskyblue", 
        //img:"/assets/img/IMG_3995.JPG"},
        img:"/assets/img/boy1.png"},
      {id:2, name:"探花", desc:"路漫漫其修远兮，吾将上下而求索", 
        position:"", 
        //position:"bottom", 
        limit:this.getUnlockStars(1),  //20,
        color:"orange", 
        //img:"/assets/img/IMG_4001.JPG"},
        img:"/assets/img/girl1.png"},
      {id:3, name:"榜眼", desc:"衣带渐宽终不悔，为伊消得人憔悴", 
        position:"", 
        //position:"right", 
        limit:this.getUnlockStars(2), //40
        color:"royalblue", 
        //img:"/assets/img/IMG_4004.JPG"},
        img:"/assets/img/boy2.png"},
      {id:4, name:"状元", desc:"纵里寻她千百度，蓦然回首，那人却在灯火阑珊处", 
        position:"", 
        limit:this.getUnlockStars(3), //60
        color:"coral", 
        //img:"/assets/img/IMG_4005.JPG"},
        img:"/assets/img/girl2.png"},
    ];
    //console.log(this.levels)

    this.updateCurrentTasks();
  }
  async updateCurrentTasks(){
    for(let i=0;i<this.currentTasks.length;i++){
      let t = this.currentTasks[i];
      t["mytime"] = await this.getMyTime(t.id);
      t["unlock"] = (i==0)||(t["mytime"]<=99998)||(i>0&&this.currentTasks[i-1]["mytime"]<=99998);
      t["index"] = i;
    }
  }
  async getTotalStars(){
    let n = this.gameNextData.length;
    let stars = 0;
    for(let i=0;i<n;i++){
        stars += 3;
    }
    return stars;
  }
  async getLevelTotalStars(levelId:any){
    let leveData = this.gameNextData.filter((g:any)=>g.level==levelId);
    let n = leveData.length;
    let stars = 0;
    for(let i=0;i<n;i++){
        stars += 3;
    }
    return stars;
  }

  levelThreshold = 0.5;
  async getMaxLevelUnlocked(){
    let allMyStars = await this.getAllMyStars();
    //console.log("allMyStars:"+allMyStars)
    //console.log("this.getUnlockStars(3):"+this.getUnlockStars(3))
    
    if(allMyStars>=this.getUnlockStars(3)){//60 total 90
        return 4;
    }else if(allMyStars>=this.getUnlockStars(2)){//40 total 60
        return 3;
    }else if(allMyStars>=this.getUnlockStars(1)){//20pass total30
        return 2;
    }

    return 1
  }
  getUnlockStars(levelId:any){
    let unlockStars = 0;
    let total=0;
    for(let i=0;i<levelId;i++){
      total+=this.levelTotalStars[i];
    }
    unlockStars = total*this.levelThreshold;
    return Math.floor(unlockStars);
  }
  async getAllMyStars(){
    let count = 0;
    let n = this.gameNextData.length;
    this.myLevelStars = new Array(n).fill(0);//[].constructor(n);
    
    for(let i=0;i<n;i++){
        let myStars = await this.retrieve(`TaskMyStars_${i+1}`);
        if(myStars!=null){
          let myStarsNumber = Number(myStars); 
          if (!isNaN(myStarsNumber)) {
              count += myStarsNumber;
              this.myLevelStars[i] = myStarsNumber;
          }
        }
    }

    return count;
  }
  async getMyStars(taskId:any){
    const myStars = await this.retrieve(`TaskMyStars_${taskId}`);
    if (myStars !== null) {
        let myStarsNumber = Number(myStars);
        if (!isNaN(myStarsNumber)) {
          if(myStarsNumber>0&&myStarsNumber<=3)
            return myStarsNumber;
        }
    }
    
    return 0;
  }
  async getMyLevelStars(levelId:any){
    let tasks = this.gameNextData.filter((g:any)=>g.level==levelId);
    let myLevelStars = 0;
    for(let i=0;i<tasks.length;i++){
      let taskId = tasks[i].id;
      const myStars = await this.retrieve(`TaskMyStars_${taskId}`);
      if (myStars !== null) {
          let myStarsNumber = Number(myStars);
          if (!isNaN(myStarsNumber)) {
            if(myStarsNumber>0&&myStarsNumber<=3)
              myLevelStars += myStarsNumber;
          }
      }
    }
    
    return myLevelStars;
  }
  async getMyTime(taskId:any){
    const myTime = await this.retrieve(`TaskTime_${taskId}`);
    if (myTime !== null) {
      let myTimeNumber = Number(myTime);
      if (!isNaN(myTimeNumber)) {
        if(myTimeNumber>0)
          return myTimeNumber;
      }
    }
    
    return 99999;
  }
  getLevelTasks(level:any){
    /*let tasks= [
      {id:1,name:"1n",desc:"1d", img:"/assets/img/IMG_4067.JPG"},
      {id:2,name:"2n",desc:"2d", img:"/assets/img/IMG_4052.JPG"},
      {id:3,name:"3n",desc:"3d", img:"/assets/img/IMG_4053.JPG"},
      {id:4,name:"4n",desc:"4d", img:"/assets/img/IMG_4051.JPG"},
      {id:5,name:"5n",desc:"5d", img:"/assets/img/IMG_4050.JPG"},
      {id:6,name:"6n",desc:"6d", img:"/assets/img/IMG_4049.JPG"},
      {id:7,name:"7n",desc:"3d", img:"/assets/img/IMG_4046.JPG"},
      {id:8,name:"8n",desc:"4d", img:"/assets/img/IMG_4007.JPG"},
      {id:9,name:"9n",desc:"5d", img:"/assets/img/IMG_4006.JPG"},
      {id:10,name:"10n",desc:"6d", img:"/assets/img/"}
    ]*/
    let tasks = this.gameNextData.filter((g:any)=>g.level==level);

    // tasks.forEach((t:any)=>{
    //   t.img = `https://reddah.blob.core.windows.net/msjjpoet/${t.more}.jpeg`;
    // })

    return tasks;
  }
  async pass(task:any, seconds:any){
    if(seconds>1&&seconds<99999){
      let oldTime = await this.getMyTime(task.id);
      if(oldTime!=null&&seconds<oldTime)
      {
          this.store(`TaskTime_${task.id}`, seconds);
          let mystar = 0;
          
          if(seconds<=task["seconds3star"]){
              mystar = 3;
              this.addMyCoints(5);
          }else if(seconds<=task["seconds2star"]){
              mystar = 2;
              this.addMyCoints(3);
          }else if(seconds<=task["seconds1star"]){
              mystar = 1;
              this.addMyCoints(2);
          }else{
              mystar = 0;
              this.addMyCoints(1);
          }
          this.store(`TaskMyStars_${task.id}`, mystar);
      }
    }
    this.updateGameData();
  }
  /**games end */

  /**points start */
  async getMyCoins(){
      let count = await this.retrieve(`Reddah_MyCoins`);
      if (count !== null) {
        let countNumber = Number(count);
        if (!isNaN(countNumber)) {
            return countNumber;
        }
      }
      return 0;
  }

  async addMyCoints(n:any){
      let current = await this.getMyCoins();
      this.store(`Reddah_MyCoins`, current+n);
      this.toast('+', n);
  }

  async subMyCoints(n:any){
      let current = await this.getMyCoins();
      this.store(`Reddah_MyCoins`, current-n);
      this.toast('-', n);
  }

  async toast(type:any, n:any) {
    this.ui.toast("top", `${this.ui.instant("Game.Coins")}: ${type}${n}`,);
  }

  async getBuyCount(){
      let count = await this.retrieve(`Reddah_BuyTimes`);
      if(count!=null){
          let countNumber = Number(count);
          if (!isNaN(countNumber)) {
              return countNumber;
          }
      }
      return 0;
  }

  async addBuyCount(){
      let count = await this.retrieve(`Reddah_BuyTimes`);
      if(count!=null){
        let countNumber = Number(count);
        if (!isNaN(countNumber)) {
          this.store(`Reddah_BuyTimes`, countNumber+1);
        }
      }
      else{
        this.store(`Reddah_BuyTimes`, 1);
      }
  }

  async buyPrice(){
      return 10 + await this.getBuyCount()*10;
  }

  async buyTask(task:any){
      this.set(`TaskTime_${task.id-1}`, 99998);
      this.set(`TaskMyStars_${task.id-1}`, 0);
      let price = 10 + await this.getBuyCount()*10;
      this.subMyCoints(price);
      this.addBuyCount();
  }
  /**points end */
}
