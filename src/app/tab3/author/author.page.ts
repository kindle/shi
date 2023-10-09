import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.page.html',
  styleUrls: ['./author.page.scss'],
})
export class AuthorPage implements OnInit {

  constructor(
    public data: DataService,
  ) { }

  ngOnInit() {
  }

}
