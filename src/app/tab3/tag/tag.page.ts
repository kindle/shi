import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.page.html',
  styleUrls: ['./tag.page.scss'],
})
export class TagPage implements OnInit {

  constructor(
    public data:DataService,
  ) { }

  ngOnInit() {
  }

}
