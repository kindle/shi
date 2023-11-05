import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-poem',
  templateUrl: './poem.page.html',
  styleUrls: ['./poem.page.scss'],
})
export class PoemPage{

  //收藏诗词 max=1000
  constructor(
    public data: DataService,
    public ui: UiService
  ) { }

  ionViewWillEnter() {
    this.data.updateLocalData('poem');
    this.onSearchChanged();
  }

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
    
    this.searchResult = this.data.localJsonData.filter((e:any)=>
      (e.data.author+e.data.title+e.data.paragraphs.join('')).indexOf(key)>=0
    );
    this.searchResultCount = this.searchResult.length;
    
    this.displayResult = [];
    this.generateItems();
  }
  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,1000))
    );
  }

}
