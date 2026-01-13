import { Component, OnInit } from '@angular/core';
import { Data } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-more-settings',
  templateUrl: './more-settings.page.html',
  styleUrls: ['./more-settings.page.scss'],
})
export class MoreSettingsPage implements OnInit {

  constructor(
    public ui: UiService,
    public data: DataService

  ) { }

  ngOnInit() {
  }

  mathfloor(n:any){
    return Math.floor(n);
  }

}
