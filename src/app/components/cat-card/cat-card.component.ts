import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-cat-card',
  templateUrl: './cat-card.component.html',
  styleUrls: ['./cat-card.component.scss'],
})
export class CatCardComponent implements OnInit {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;

  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  loonglist(){
    this.router.navigate(['/tabs/tab5/list'], {});
  }

  async ngOnInit(){
    
  }

    
}
