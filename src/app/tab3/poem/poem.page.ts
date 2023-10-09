import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-poem',
  templateUrl: './poem.page.html',
  styleUrls: ['./poem.page.scss'],
})
export class PoemPage implements OnInit {

  constructor(
    public data: DataService,
  ) { }

  ngOnInit() {
  }

}
