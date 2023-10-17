import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { DataService, ViewType } from 'src/app/data.service';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-poet',
  templateUrl: './poet.page.html',
  styleUrls: ['./poet.page.scss'],
})
export class PoetPage {

  localJsonData:any;
  author:any;
  authorData:any;

  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
  ) { 
    
  }


  ionViewWillEnter() {
    this.author = this.data.currentAuthor;
    if(this.data.currentViewType == ViewType.Author){
      this.localJsonData = this.data.JsonData
        .filter((shici:any)=>shici.author===this.author);
      let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name===this.author);
      if(foundAuthor.length===1)
        this.authorData = foundAuthor[0];
    }else if(this.data.currentViewType == ViewType.Tag){
      console.log(this.author)
      this.localJsonData = this.data.JsonData
        .filter((shici:any)=>shici.tags.join("").indexOf(this.author)>=0);
      //note: tags is array
    }

    this.onSearchChanged();
  }

  getUrl(){
    if(this.data.currentViewType == ViewType.Author){
      return `/assets/img/poet/${this.author}.jpeg`
    }
    else if(this.data.currentViewType == ViewType.Tag){
      return this.data.currentImage;
    }
    else
    {
      return "";
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
