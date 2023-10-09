import { Component } from '@angular/core';
import { DataService } from '../../data.service';
import { ModalEventService } from 'src/app/modal-event.service';
import { UiService } from 'src/app/ui.service';

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
    private modalEventService: ModalEventService,
    public ui: UiService,
  ) { 
    this.listdata = this.data.topicListData.filter((e:any)=>e.id==this.data.currentListId)[0];
    this.localList = this.listdata.list;
    console.log(this.listdata)
    // Convert to Set to remove duplicates
    const authorSet = new Set(this.listdata.list.map((item:any) => item.author)); 
    // Convert back to an array
    this.poets = [...authorSet]; 
  }


  play(p:any){
    
    let poem = this.data.JsonData
      .filter((shici:any)=>
        shici.id===p.pid
      )[0];
    
    console.log(poem)
    this.data.qlyric = poem.paragraphs;

    this.data.currenttitle = poem.title;
    this.data.currentauthor = poem.author;



    this.modalEventService.openModal();
  }
  
}
