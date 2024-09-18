import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-level-card',
  templateUrl: './level-card.component.html',
  styleUrls: ['./level-card.component.scss'],
})
export class LevelCardComponent implements OnInit {

  @Input() id?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() position?: any;
  @Input() color?: any;
  @Input() img?: any;
  @Input() limit?: any;
  
  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  async ngOnInit() {}

  loonglevel(){
    if(this.data.maxLevelUnlocked>=this.id){
      this.router.navigate(['game-kao-level'], {
        queryParams: {
          level: this.id
        }
      });
    }
  }

}
