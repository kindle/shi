import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { AddToCustomListPage } from 'src/app/tab3/customlist/add-to-customlist/add-to-customlist.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {


  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
    this.localList = this.listdata.list;
  }
  onSearchChanged(){
    let key = this.searchText.trim();
    if(key==""){
      this.localList = this.listdata.list;
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample).indexOf(key)>=0
      );
    }
  }

  listdata:any;
  poets:any;

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
  ) { }

  id:any;
  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.listdata = this.data.poemListData.filter((e:any)=>e.id==this.id)[0];
    this.localList = this.listdata.list;
    // Convert to Set to remove duplicates
    const authorSet = new Set(this.listdata.list.map((item:any) => item.author)); 
    // Convert back to an array
    this.poets = [...authorSet]; 
  }

  

  
}
