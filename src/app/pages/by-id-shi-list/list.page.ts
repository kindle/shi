import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { ScrollDetail } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  localList:any;
  searchText:any="";
  showFilter = false;

  isSearchbarVisible = true;
  lastScrollTop = 0;

  handleScroll(ev: CustomEvent<ScrollDetail>) {
    const scrollTop = ev.detail.scrollTop;
    
    // Only trigger if we've scrolled a bit to avoid jitter at the top
    if (scrollTop < 0) return;

    if (scrollTop > this.lastScrollTop && scrollTop > 10) {
      // Scrolling down and past the initial header area
      this.isSearchbarVisible = false;
    } else if (scrollTop < this.lastScrollTop) {
      // Scrolling up
      this.isSearchbarVisible = true;
    }
    
    this.lastScrollTop = scrollTop;
  }

  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
    this.localList = this.listdata.list;
  }
  onClearMic(){
    if(this.searchText.trim()=="")
    {
      this.showFilter = false;
    }
  }
  onLoseFocus(){
    if(this.searchText.trim()=="")
    {
      this.showFilter = false;
    }
  }
  onSearchChanged(){
    let key = this.searchText.trim();
    /*
    if(key==""){
      this.localList = this.listdata.list;
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample).indexOf(key)>=0
      );
    }*/

    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');

    if(key.length==0){
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(key)>=0
      );
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(key[0])>=0
      );
      if(keys.length>1){
        this.localList = this.localList.filter((e:any)=>
          (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[1])>=0
        );
        if(keys.length>2){
          this.localList = this.localList.filter((e:any)=>
            (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[2])>=0
          );

          if(keys.length>3){
            this.localList = this.localList.filter((e:any)=>
              (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[3])>=0
            );
            
            if(keys.length>4){
              this.localList = this.localList.filter((e:any)=>
                (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[4])>=0
              );
            }
          }
        }
      }
    }
  }

  listdata:any;
  poets:any;
  guesslikelist:any=[];

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
  ) { }

  id:any;

  private buildSolarTermList(desc:any[] = []) {
    return desc
      .filter((item:any) => item?.type !== 'list' && item?.type !== 'text')
      .map(({ type, paragraphs, solarterm, ...item }: any) => ({
        ...item,
        sample: item.sample || (Array.isArray(paragraphs) ? paragraphs[0] : ''),
        note: item.note || '',
      }));
  }

  private async waitForJsonDataLoaded(intervalMs:number = 100): Promise<void> {
    while (this.data.articleDataLoaded == false) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  async ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.listdata = this.data.poemListData.filter((e:any)=>e.id==this.id)[0];

    //console.log('listdata:', this.listdata);
    if(this.id>=2001&&this.id<=2024)//24节气list
    {
      await this.waitForJsonDataLoaded();
      this.listdata.list = this.data.get24TermPoemsByName(this.listdata.sub);
      // console.log('load listdata.list')
      // console.log(this.listdata.list)
    }
    //print 24节气list for test 
    // if(this.listdata.id>=2001&&this.listdata.id<=2024)//24节气list
    // {
    //   const my24list = this.buildSolarTermList(
    //     //this.data.getSolarTermPoem(this.listdata.sub,'').desc
    //     this.data.getSolarTermPoem('春分','').desc
    //   );

    //   console.log('my24list:', my24list);
    // }


    
    
    //console.log(this.listdata)
    this.localList = this.listdata.list;
    if(this.listdata.guesslike){
      this.guesslikelist = this.listdata.guesslike.map((gid:any)=>
        this.data.poemListData.filter((e:any)=>e.id==gid)[0]
      );
      //console.log(this.guesslikelist)
    }
    // Convert to Set to remove duplicates
    const authorSet = new Set(this.listdata.list.map((item:any) => item.author)); 
    // Convert back to an array
    this.poets = [...authorSet]; 
    //update audio info.
    this.CheckIsPlayList();

    this.data.addTracker({name:"ReadList", data:{id:this.id}});
    //console.log(this.listdata);
  }

  noAudio:any = true;
  CheckIsPlayList(){
    this.localList.forEach((poem:any) => {
      let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
      if(fullData&&fullData.audio!=null){
        poem.audio = fullData.audio;
        this.noAudio = false;
      }
    });
  }

  share(poem?: any){
    //console.log(this.listdata.image)
    if(poem)//share poem
    {
      this.data.shareText(
        poem.author + "《" + poem.title + "》",
        this.data.showsample(poem),
        '',
        this.listdata.image
      );
    }
  }

  goToTag(tag:any){
    this.data.currentItem = {
      src: this.listdata.image,
      display: 'cover',
      text: tag,
      desc: '',
      color: this.listdata.color
    }
    this.data.goToTag(tag);
  }
  
}
