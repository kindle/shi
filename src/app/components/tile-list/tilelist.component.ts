import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-tile-list',
  templateUrl: './tilelist.component.html',
  styleUrls: ['./tilelist.component.scss'],
})
export class TileListComponent {

  @Input() name?: string;
  @Input() arrow?: boolean;
  @Input() source?: any;
  @Input() max?: number=999;

  get visibleSource(): any[] {
    if (!Array.isArray(this.source)) {
      return [];
    }

    const limit = Math.floor(Number(this.max));

    if (Number.isNaN(limit)) {
      return this.source;
    }

    return this.source.slice(0, Math.max(0, limit));
  }

  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
  ){}

  search(key:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:key,
        type:'tag'
      }
    });
  }
}
