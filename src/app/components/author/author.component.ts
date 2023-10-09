import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/data.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
})
export class AuthorComponent {

  @Input() name?: string;
  @Input() source?: any;

  constructor(
    public data: DataService,
    private router: Router,
  ){}

  goToAuthor(author:any){
    this.data.currentViewType = ViewType.Author;
    this.data.currentAuthor = author;
    this.router.navigate(['/tabs/tab4/poet'], {
      queryParams: {
      }
    });
  }
}
