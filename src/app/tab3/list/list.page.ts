import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  constructor(
    public data:DataService,
    public ui: UiService
  ) { }

  ionViewWillEnter() {
    this.data.updateLocalData('idlist');
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
    //console.log(this.data.localJsonData)
    this.searchResult = this.data.localJsonData.filter((e:any)=>
      (e.data.name+e.data.desc+e.data.image).indexOf(key)>=0
    );
    this.searchResultCount = this.searchResult.length;
    
    this.displayResult = [];
    this.generateItems();
  }
  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,100))
    );
  }

}
