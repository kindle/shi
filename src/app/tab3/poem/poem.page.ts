import { Component } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-poem',
  templateUrl: './poem.page.html',
  styleUrls: ['./poem.page.scss'],
})
export class PoemPage{

  constructor(
    public data: DataService,
    public ui: UiService
  ) { }
}
