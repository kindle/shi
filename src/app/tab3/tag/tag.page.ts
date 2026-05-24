import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.page.html',
  styleUrls: ['./tag.page.scss'],
})
export class TagPage {

  constructor(
    public data:DataService,
    public ui: UiService
  ) { }

  ionViewWillEnter() {
    this.data.updateLocalData('taglist');
    this.onSearchChanged();
    //console.log(this.displayResult)
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
    this.searchResult = this.data.localJsonData.filter((e:any)=> {
      const searchText = [e.data?.alias, e.data?.text, e.data?.name, e.data?.tag]
        .filter((value:any) => value != null)
        .join('');
      return searchText.indexOf(key) >= 0;
    });
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
