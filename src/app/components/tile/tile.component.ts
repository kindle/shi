import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/data.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
})
export class TileComponent {

  @Input() name?: string;
  @Input() arrow?: boolean;
  @Input() source?: any;

  constructor(
    public data: DataService,
    private router: Router,
  ){
  }


  search(key:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:key,
        type:'tag'
      }
    });
  }

  
  goToList(listid:any){
    this.data.currentListId = listid;
    this.router.navigate(['/tabs/tab4/list'], {
      queryParams: {}
    });
  }

  //by tag or by id
  goToListBy(tile:any){
    if(tile.id){//有id诗单
      this.data.currentListId = tile.id;
      this.router.navigate(['/tabs/tab4/list'], {
        queryParams: {}
      });
    }
    else{//tag诗单
      this.data.currentViewType = ViewType.Tag;
      this.data.currentAuthor = tile.text;
      this.data.currentImage = tile.src;
      this.router.navigate(['/tabs/tab4/poet'], {
        queryParams: {
        }
      });
    }
  }
}
