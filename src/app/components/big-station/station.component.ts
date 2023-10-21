import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/data.service';

@Component({
  selector: 'app-station',
  templateUrl: './station.component.html',
  styleUrls: ['./station.component.scss'],
})
export class StationComponent {


  

  @Input() source?: any;

  constructor(
    public data: DataService,
    private router: Router,
  ){}


  search(key:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:key,
        type:'tag'
      }
    });
  }

  //by tag or by id
  goToListBy(big:any){
    if(big.id){//有id诗单
      this.data.currentListId = big.id;
      this.router.navigate(['/tabs/tab4/list'], {
        queryParams: {}
      });
    }
    else{//tag诗单
      this.data.currentViewType = ViewType.Tag;
      this.data.currentAuthor = big.text;
      this.data.currentImage = big.src;
      this.router.navigate(['/tabs/tab4/poet'], {
        queryParams: {
        }
      });
    }
  }
}
