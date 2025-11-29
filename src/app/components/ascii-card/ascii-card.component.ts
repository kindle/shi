import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-ascii-card',
  templateUrl: './ascii-card.component.html',
  styleUrls: ['./ascii-card.component.scss'],
})
export class AsciiCardComponent implements OnInit {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;

  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  loonglist(){
    this.router.navigate(['/history-today'], {});
  }

  async ngOnInit(){
    
  }

    
}
