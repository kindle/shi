import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.page.html',
  styleUrls: ['./tag.page.scss'],
})
export class TagPage {

  localJsonData:any;
  tag:any;
  authorData:any;

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
  ) { 
    
  }


  displayName:any;
  async ionViewWillEnter() {
    this.tag = this.activatedRoute.snapshot.paramMap.get('tag');
    if(this.data.currentItem){
      this.displayName = 
        this.data.currentItem.name?this.data.currentItem.name:
        (this.data.currentItem.text?
          this.data.currentItem.text:this.tag);
    }
    else{
      this.displayName = this.tag;
    }
    const tags = (this.tag || '')
      .split('|')
      .map((value:string) => value.trim())
      .filter((value:string) => value.length > 0);
    //by tag
    //this.localJsonData = this.data.JsonData
    //  .filter((shici:any)=>shici.tags.join("").indexOf(this.tag)>=0);
    //by text: more than tag
    await this.waitForJsonDataLoaded();

    this.localJsonData = this.data.JsonData
      .filter((shici:any)=>tags.every((tag:string) => shici.text.indexOf(tag)>=0));
    //note: tags is array
    //console.log(this.localJsonData)
    this.onSearchChanged();
  }


  private async waitForJsonDataLoaded(intervalMs:number = 100): Promise<void> {
    while (this.data.articleDataLoaded == false) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
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
        (e.text).indexOf(key)>-1
      );
    }
    else{
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(keys[0])>-1
      );
      if(keys.length>1){
        this.searchResult = this.searchResult.filter((e:any)=>
          (e.text).indexOf(keys[1])>-1
        );
        if(keys.length>2){
          this.searchResult = this.searchResult.filter((e:any)=>
            (e.text).indexOf(keys[2])>-1
          );

          if(keys.length>3){
            this.searchResult = this.searchResult.filter((e:any)=>
              (e.text).indexOf(keys[3])>-1
            );
            
            if(keys.length>4){
              this.searchResult = this.searchResult.filter((e:any)=>
                (e.text).indexOf(keys[4])>-1
              );
            }
          }
        }
      }
    }
    this.searchResultCount = this.searchResult.length;
    
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

}
