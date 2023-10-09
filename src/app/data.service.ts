import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Group, Song } from './app.component';

import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';

import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';
import { UiService } from './ui.service';
import { catchError, tap } from 'rxjs';



//import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
//import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
/*
Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
*/


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

  //开关
  showSubscription = false;


  currentArticle:any;

  searchTopicData:any;
  currentTopicId = 0;
  topicListData:any;
  currentListId = 0;
  currentAuthor = "";
  currentViewType = ViewType.Author;
  currentImage = "";

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

    //诗经楚辞
    this.getObjects(`assets/db/诗经/shijing.json`,"诗经");
    this.getObjects(`assets/db/楚辞/chuci.json`,"楚辞");

    //建安
    this.getObjects(`assets/db/曹操诗集/caocao.json`,"曹操");

    //蒙学
    this.getMXObjects(`assets/db/蒙学/guwenguanzhi.json`);
    this.getMXObjects(`assets/db/蒙学/tangshisanbaishou.json`);

    //全唐诗
    for(let i=0;i<=57;i++){
      this.getObjects(`assets/db/全唐诗/poet.tang.${i*1000+""}.json`,"唐诗");
    }
    this.getObjects(`assets/db/全唐诗/唐诗三百首.json`,"唐诗三百首");
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

    /*
    this.http.get<any>('https://reddah.blob.core.windows.net/cache/202385.json').subscribe(result=>{
      
      this.azureData = result;
      if(result.Content!=null){
        this.azureData.images = result.Content.split('$$$');
      }
    });*/

    this.jsonDataLoaded = true;
  }

  getData(json:any){
    return this.http.get<any>(json);
  }

  getRandom(min:number, max:number){
    return Math.floor(Math.random() * max) + min;
  }

  hotData:any;
  classicData:any;
  timelineData:any;
  pickData:any;
  //careful with JsonData
  jsonData:any;
  azureData:any;
  async loadData(){

    let n = this.getRandom(1,2);
    this.http.get<any>(`/assets/json/${n}.json`).subscribe(result=>{
      this.jsonData = result;
    });

    this.http.get<any>('/assets/json/pick.json').subscribe(result=>{
      this.pickData = result;
    });

    this.http.get<any>('/assets/json/timeline.json').subscribe(result=>{
      this.timelineData = result;
    });

    this.http.get<any>('/assets/topic/hot.json').subscribe(result=>{
      this.hotData = [];
      for (let i = 0; i < result.length; i += 4) {
        const subArray = result.slice(i, i + 4);
        console.log(subArray)
        this.hotData.push(subArray);
      }
    });
    this.http.get<any>('/assets/topic/classic.json').subscribe(result=>{
      this.classicData = [];
      for (let i = 0; i < result.length; i += 4) {
        const subArray = result.slice(i, i + 4);
        console.log(subArray)
        this.classicData.push(subArray);
      }
    });
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

  constructor(
    private storage: Storage,
    private http: HttpClient,

    private ui: UiService,
    platform: Platform,
    private router: Router,
    
  ){
    this.platform = platform;
  }

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
  /*--common end----*/



  /*--play queue start--*/
  audio:any;

  duration:any;
  currentTime:any;
  

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
      this.qlyric = this.historyToday[0].text;
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
    this.qlyric = this.historyToday[this.currentTodayTextIndex].text;
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
    this.qlyric = this.historyToday[this.currentTodayTextIndex].text;
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
  qlyric = ["","","","",""];
  lrc:any;
  displaySongName = "";
  currenttitle = "";
  currentauthor = "";
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


  playPrevious(song:any){
    if(this.audio){
      this.audio.pause();
      this.lrc.pause();
    }
    if(song==null){
      song = this.queueData[0];
    }
    let newIndex = song.id-2<0 ? this.queueData.length-1: song.id-2;
    let nextSong = this.queueData[newIndex];
    song.selected = false;
    this.playSelected(nextSong);
  }

  playNext(song:any){
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

    this.qlyric = ["","","","",""];
    this.setAudio(song);

    this.displaySongName = song.desc;
    this.updateSongSelection(song);
    
  }

  togglePlay(){
    this.isPlaying = !this.isPlaying;
    if(this.audio){
      if(this.isPlaying){
        this.audio.play();
        this.lrc.play(this.audio.currentTime * 1000);
      }
      else{
        this.audio.pause();
        this.lrc.pause();
      }
    }
    
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

  currentSong:any;
  setAudio(song:any){
    
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
    this.get(this.LocalTargetKey).then((value:any)=>{
      this.targetData = JSON.parse(value);
      this.get(this.LocalGroupKey).then((value:any)=>{
        this.group = JSON.parse(value);

        //first time install
        if(this.targetData==null||this.targetData.length==0){
          this.initData();
        }

        this.globalCurrentTargetGroup = this.group[0];
        //this.save();
      });
    });

    this.get(this.LocalQueueKey).then((value:any)=>{
      this.queueData = JSON.parse(value);
    })
  }
  
  /*--mix end----*/


  initData(){
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
  }



  slidesJsonData:any;
  /*template start*/
  async getSlides(id:any){
    let json = `assets/template/${id}.json`;
    console.log(json)
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














  goToAuthor(author:any){
    this.currentViewType = ViewType.Author;
    this.currentAuthor = author;
    this.router.navigate(['/tabs/tab4/poet'], {
      queryParams: {
      }
    });
  }
}
