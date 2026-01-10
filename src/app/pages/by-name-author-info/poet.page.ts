import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { DataService, ViewType } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-poet',
  templateUrl: './poet.page.html',
  styleUrls: ['./poet.page.scss'],
})
export class PoetPage {

  localJsonData:any;
  author:any;
  authorData:any;

  hotPoemByAuthor:any = [];
  getHotData(){
    this.hotPoemByAuthor = [];
    let result = this.localJsonData.filter((p:any)=>p.audio!=null);
    
    for (let i = 0; i < result.length; i += 4) {
      const subArray = result.slice(i, i + 4);
      this.hotPoemByAuthor.push(subArray);
    }
  }

  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}


  ionViewWillEnter() {
    //this.defaultBgHeight = "350px";
    this.author = this.activatedRoute.snapshot.paramMap.get('author');
    this.localJsonData = this.data.JsonData
      .filter((shici:any)=>shici.author===this.author);
    let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name===this.author);
    if(foundAuthor.length>=1)
      this.authorData = foundAuthor[0];


    this.onSearchChanged();

    this.getHotData();
  }

  getUrl(){
    return `https://reddah.blob.core.windows.net/msjjpoet/${this.author}.jpeg`
  }






  @ViewChild('pageTop') pageTop: IonContent | any;
  searchResult:any;
  searchResultCount=0;
  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
  }
  onSearchChanged(){
    let key = "";
    if(this.searchText!=null){
      key = this.searchText.trim();
    }

    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');

    if(key.length==0){
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(key)>=0
      );
    }
    else{
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(keys[0])>=0
      );
      if(keys.length>1){
        this.searchResult = this.searchResult.filter((e:any)=>
          (e.text).indexOf(keys[1])>=0
        );
        // console.log(this.searchResult);
        if(keys.length>2){
          this.searchResult = this.searchResult.filter((e:any)=>
            (e.text).indexOf(keys[2])>=0
          );

          if(keys.length>3){
            this.searchResult = this.searchResult.filter((e:any)=>
              (e.text).indexOf(keys[3])>=0
            );
            
            if(keys.length>4){
              this.searchResult = this.searchResult.filter((e:any)=>
                (e.text).indexOf(keys[4])>=0
              );
            }
          }
        }
      }
    }
    this.searchResultCount = this.searchResult.length;
// console.log(this.searchResultCount);
    this.displayResult = [];
    this.generateItems();
    //this.pageTop.scrollToTop();
  }


  
  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,100))
    );
  }

  onIonInfinite(ev:any) {
    this.generateItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 200);
  }



  defaultBgHeight:string|any;
  min_height:any = "350px";
  onScroll(event:any){
    let offset = event.detail.scrollTop;

    if(offset<=0){
      this.defaultBgHeight = (this.min_height.replace("px","") - offset)+"px";
    }else{
      this.defaultBgHeight = this.min_height;
    }

    //bug fix for navigating back from other pages
    this.cdRef.detectChanges();
  }
}
