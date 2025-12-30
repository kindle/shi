import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-big',
  templateUrl: './big.component.html',
  styleUrls: ['./big.component.scss'],
})
export class BigComponent {

  @Input() source?: any;

  constructor(
    public data: DataService,
    public ui: UiService,
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
