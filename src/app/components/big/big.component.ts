import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/services/data.service';

@Component({
  selector: 'app-big',
  templateUrl: './big.component.html',
  styleUrls: ['./big.component.scss'],
})
export class BigComponent {

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
