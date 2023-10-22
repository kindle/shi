import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent {

  @Input() name?: string;
  @Input() text?: string;

  constructor(
    public data: DataService,
    private router: Router,
  ){}
}
