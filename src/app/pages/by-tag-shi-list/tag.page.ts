import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

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


  ionViewWillEnter() {
    this.tag = this.activatedRoute.snapshot.paramMap.get('tag');
    //by tag
    //this.localJsonData = this.data.JsonData
    //  .filter((shici:any)=>shici.tags.join("").indexOf(this.tag)>=0);
    //by text: more than tag
    this.localJsonData = this.data.JsonData
      .filter((shici:any)=>shici.text.indexOf(this.tag)>=0);
    //note: tags is array
    //console.log(this.localJsonData)
    this.onSearchChanged();
  }

  getUrl(){
    return this.data.currentItem.src;
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

    this.searchResult = this.localJsonData.filter((e:any)=>
      (e.text).indexOf(key)>=0
    );
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
