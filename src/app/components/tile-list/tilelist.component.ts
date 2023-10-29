import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-tile-list',
  templateUrl: './tilelist.component.html',
  styleUrls: ['./tilelist.component.scss'],
})
export class TileListComponent {

  @Input() name?: string;
  @Input() arrow?: boolean;
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

}
