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

//import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
//import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerPage } from '../pages/player/player.page';
import { EventService } from './event.service';
/*
Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
*/

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
//import { Preferences } from '@capacitor/preferences';


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
      this.showSubscription = true;
      this.disableRandomFunData = true;
      this.disableRandomArticleData = true;
    }else{
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
  jsonDataLoaded = false;

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

    //诗经楚辞
    this.getObjects(`assets/db/诗经/shijing.json`,"诗经");
    this.getObjects(`assets/db/楚辞/chuci.json`,"楚辞");

    //建安
    this.getObjects(`assets/db/曹操诗集/caocao.json`,"曹操");

    //其他补录
    this.getObjects(`assets/db/others/others.json`,"");

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

    /*
    this.http.get<any>('https://reddah.blob.core.windows.net/cache/202385.json').subscribe(result=>{
      
      this.azureData = result;
      if(result.Content!=null){
        this.azureData.images = result.Content.split('$$$');
      }
    });*/

    //load 诗单
    this.loadPoemList();

    this.jsonDataLoaded = true;
  }

  loadPoemList(){
    const jsonFiles = [
      `/assets/topic/list-fun.json`,
      `/assets/topic/list-audio.json`,
      //`/assets/topic/list-holiday.json`,
      //`/assets/topic/list-food.json`
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
    console.log("this.disableRandomFunData:"+this.disableRandomFunData)
    console.log(this.funData)
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


  classicData:any;
  timelineData:any;
  pickData:any;
  //careful with JsonData
  jsonData:any;
  azureData:any;
  async loadArticleJsonData(){
    this.http.get<any>('/assets/json/pick.json').subscribe(result=>{
      this.pickData = result;
    });
    this.http.get<any>('/assets/json/timeline.json').subscribe(result=>{
      this.timelineData = result;
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

    

    this.http.get<any>(`/assets/topic/article.json`).subscribe(result=>{
      //把article.json放入jsonData作为开卷有益文章展示
      this.jsonData = result;
      //把list-fun.json等放入jsonData做为开卷有益文章展示
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
        this.jsonData.push({
          template:"text",
          min_height:"380px",
          bg_image:fun.image.replace("/assets/img/",""),
          title_color:fun.color?fun.color:"white",
          small_title:fun.sub,
          big_title:fun.desc,
          desc:[{
            "type":"text", 
            "value":fun.more?fun.more:fun.desc,
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

      //把jsonData文章随机排序，取前5个文章+1group+1vote展示
      this.jsonData = this.getArticleData("article");
    });

  }
  
  getArticleData(nameSeed:any){
    let myDate = new Date();
    let hourSeed = myDate.getHours();
    //let hourSeed = myDate.getMinutes();
    let seed = nameSeed+hourSeed;
    //console.log(""+seed)
    //console.log(this.funDataMap)

    if(this.disableRandomArticleData){
      return this.jsonData;
    }

    if(!this.funDataMap.has(seed)){
      //console.log('not find article'+this.jsonData.length)
      let tempdata = this.setRandomArticles(this.jsonData);
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
    //get 5 fun articles
    temp = temp.concat(this.getRandomArray(data.filter((d:any)=>d.template==='text'), 5));
    
    //get 1 group/wall/scroll
    temp = temp.concat(this.getRandomArray(data.filter(
      (d:any)=>d.template==='group'
      //||d.template==='wall'
      ||d.template==='scroll'
      ), 1));
    
    //get 1 vote article
    temp = temp.concat(this.getRandomArray(data.filter((d:any)=>d.template==='vote'), 1));

    //get 二十四节气诗单
    console.log('test:///')
    let today = new Date();
    console.log(today.getFullYear()+""+today.getMonth()+""+today.getDay())
    let solar = Solar.fromYmd(today.getFullYear(),today.getMonth(),today.getDay());
    //let solar = Solar.fromYmd(2023,9,23);
    let solarTermName = solar.getLunar().getJieQi();//example: "夏至";
    console.log("today节气："+solarTermName)
    if(!this.disableRandomFunData&&solarTermName.length>0)
    {
      temp = temp.concat(this.getSolarTermPoem(solarTermName));
    }

    //test
    if(this.TestMode)
    {
      for (let [key, value] of this.solarTermMap) {
        console.log(key, value);
        temp = temp.concat(this.getSolarTermPoem(key));
      }
    }
   
    return temp;
  }

  solarTermMap:any = new Map([
    ["立春",{image:"bird.jpg", title:"", desc:""}],
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
    ["小寒",{image:"24大寒.jpg", title:"", desc:""}],
    ["大寒",{image:"ice-570500_1280.jpg", title:"", desc:""}],
  ]);

  getSolarTermPoem(solarTermName:any){
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
      small_title:solarTermName,
      big_title:solarTermInfo.title,
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
          console.log(error);
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
          console.log(error);
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
    //console.log("data init:"+this.jsonData.length)
  }



  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;


  /*--common start----*/
  get(key: string){
    /*
    const value = async () => {
      const { value } = await Preferences.get({ key: key });
    };
    const { value } = await Preferences.get({ key: key });
    return value;*/
    return this.storage.get(key);
  }

  set(key: string, value:any){
    this.storage.set(key, value);

    /*
    Preferences.set({
      key: key,
      value: value
      //value: JSON.stringify(this.photos),
    });*/
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
    return this.http.get<any>(`assets/daily/json/${month}.json`).pipe().toPromise();
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
  setAudio(){
    if(!this.currentPoem.audio){
      return;
    }

    this.audio.src = `/assets/mp3/${this.currentPoem.audio}`;
    
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
  playList(list:any, name:any){
    this.orgToPlayList = list.filter((l:any)=>l.audio!=null)
    this.toPlayList = this.orgToPlayList;
    this.toPlayListName = name;
    if(this.toPlayList.length>0){
      let first = this.toPlayList[0];
      this.playbyid(first.id, first.sample);
    }
    this.isShuffle = false;
    this.savePlayStyle();
  }
  playListRandomly(list:any, name:any){
    this.orgToPlayList = list.filter((l:any)=>l.audio!=null);
    let randomToPlaylist = this.shuffleArray(this.orgToPlayList);
    
    this.toPlayList = randomToPlaylist;
    this.toPlayListName = name;
    if(this.toPlayList.length>0){
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
      this.playList(this.orgToPlayList, this.toPlayListName);
    }
  }




  findPrev(){
    for(let i=0;i<this.toPlayList.length;i++){
      console.log(this.toPlayList[i])
      console.log(this.currentPoem)
      if(this.toPlayList[i].id===this.currentPoem.id
      ||
        (this.toPlayList[i].title===this.currentPoem.title&&
        this.toPlayList[i].author===this.currentPoem.author)
      ){
          if(i==0){
            if(this.isInfinite===true){
              return this.toPlayList[this.toPlayList.length-1];
            }else{
              return null;
            }
          }
          return this.toPlayList[i-1];
      }
    }
    return null;
  }
  playPrev(){
    let prevPoem:any = this.findPrev();

    if(prevPoem!=null){
      this.playbyid(prevPoem.id, prevPoem.sample, false);
    }
  }
  findNext(){
    let currentIndex = -1;
    for(let i=0;i<this.toPlayList.length;i++){
      if(this.toPlayList[i].id===this.currentPoem.id
      ||
        (this.toPlayList[i].title===this.currentPoem.title&&
        this.toPlayList[i].author===this.currentPoem.author)
      ){
          currentIndex = i;
      }
    }

    if(currentIndex===-1){
      console.log('sth. went wrong, could not find the current poem index...')
      return null;
    }
    
    if(this.isRepeat===true){
      return this.toPlayList[currentIndex];
    }
    
    if(this.isInfinite===true)
    {
      if(currentIndex===this.toPlayList.length-1){
        return this.toPlayList[0];
      }
      else{
        return this.toPlayList[currentIndex+1];
      }
    }
    else{
      if(currentIndex===this.toPlayList.length-1){
        return null;
      }
      else{
        return this.toPlayList[currentIndex+1];
      }
    }
    
    return null;
  }
  
  playNext(){
    let nextPoem = this.findNext();

    if(nextPoem!=null){
      this.playbyid(nextPoem.id, nextPoem.sample, false);
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
    {name:"musical-notes-outline"},
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
    {name:"musical-notes-outline"},
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
    //load ep play history
    this.loadRecentPlayedEP();
    //load play style
    this.loadPlayStyle();
    
    //tab4 订阅随机图片
    this.getSubscriptionImage();
  }
  
  /*--mix end----*/


  initData(){
    /*
    //reset groups
    this.group = [
      {id:0, name: "我的跑步歌单", img:"", icon:"bag-outline", cover:"cover1", count:0, color:"rgb(247,54,65)", src:"url('/assets/img/p1.jpg')"},
      {id:1, name: "中文歌单", img:"", icon:"barbell-outline", cover:"cover2", count:0, color:"rgb(119,117,118)", src:"url('/assets/img/p2.jpg')"},
      {id:2, name: "英文歌单", img:"", icon:"fitness-outline", cover:"cover3", count:0, color:"rgb(73,71,64)", src:"url('/assets/img/p3.jpg')"},
      {id:3, name: "骑车", img:"", icon:"diamond-outline", cover:"cover1", count:0, color:"rgb(138,132,124)", src:"url('/assets/img/p4.jpg')"},
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












  getRandomArray(arr:any,n:any){
    if(!arr || arr.length==0)
      return arr;
    
    let localArr = JSON.parse(JSON.stringify(arr));
    let resultArr = [];
    for(let i=0;i<n;i++){
      let randomIndex = this.getRandom(0, localArr.length-1);
      resultArr.push(localArr[randomIndex]);
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
    console.log(id)
    //tab3
    this.navCtrl.navigateForward(`/tabs/tab3/customlist/${id}`);
  }
  //by tag or by id
  goToListBy(item:any){
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
  goToTopic(id:any){
    this.navCtrl.navigateForward(`/tabs/${this.currentTab}/topic/${id}`);
  }

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
      poem.sample = sample;
      //if 有mp3, do not show modal, play directly
      this.playobj(poem, poem.audio?false:true);
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
      this.currentPoem = poem;
      if(poem.audio){
        this.setAudio();
      }else{
        this.execPause();
        if(pop){
          this.ui.player(this.currentPoem);
        }
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
    if(this.playHistory.length>0){
      let lastPlay = this.playHistory[this.playHistory.length-1];
      if(lastPlay.id == poem.id||
        (lastPlay.title==poem.title&&lastPlay.author==poem.author))
      {
        return;
      }
    }
    
    this.playHistory.push(poem);
    if(this.playHistory.length>20){
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
      console.log(findItem[0])
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
    
    this.ui.toast("top", "已添加到诗词库")
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
      text = "类型"
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
    console.log(role)
    //如果tab3 新建list打开的，点了从诗词库删除，关闭modal
    //如果tab3 查看诗词打开的，点了从诗词库删除，关闭modal
    console.log(group)
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

  localJsonData:any;
  updateLocalData(group:any){
    this.localJsonData = this.recentCollection()
      .filter((l:any)=>l.group==group);
    console.log(this.localJsonData)
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
      console.log('did not find the poet data by id:'+p.id)
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
        let image = `/assets/img/poet/${like.data.list[0].author}.jpeg`;
        like.data.image.push(image);
      }else if(like.data.list.length>=4){
        /*for(let i=0;i<4;i++){
          let image = `/assets/img/poet/${like.data.list[i].author}.jpeg`;
          like.data.image.push(image);
        }*/
        let maxNumber = 4;
        let curNumber = 0;
        for(let k=0;k<like.data.list.length;k++){
          let image = `/assets/img/poet/${like.data.list[k].author}.jpeg`;
          
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
      this.ui.toast("top", "已添加到诗词列表")
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
          let image = `/assets/img/poet/${this.collectList[i].data.list[0].author}.jpeg`;
          this.collectList[i].data.image = [image];
        }else if(this.collectList[i].data.list.length>=4){
          this.collectList[i].data.image = [];
          /*for(let k=0;k<4;k++){
            let image = `/assets/img/poet/${this.collectList[i].data.list[k].author}.jpeg`;
            this.collectList[i].data.image.push(image);
          }*/
          let maxNumber = 4;
          let curNumber = 0;
          for(let k=0;k<this.collectList[i].data.list.length;k++){
            let image = `assets/img/poet/${this.collectList[i].data.list[k].author}.jpeg`;
            
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
}
