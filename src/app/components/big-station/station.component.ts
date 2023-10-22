import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/services/data.service';

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

}
