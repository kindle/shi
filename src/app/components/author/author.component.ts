import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

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
}
