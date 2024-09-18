import { Component, OnInit } from '@angular/core';
import { UiService } from '../services/ui.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-me',
  templateUrl: './me.page.html',
  styleUrls: ['./me.page.scss'],
})
export class MePage implements OnInit {

  constructor(
    public ui: UiService,
    public data:DataService,
  ) { }

  ngOnInit() {
  }

  goSettings(){
    
  }

}
