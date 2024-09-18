import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent {

  @Input() nofold?: boolean;
  @Input() name?: string;
  @Input() text?: string;
  
  @Input() max: number = 100;
  fold:boolean = true;

  constructor(
    public ui: UiService,
    public data: DataService,
  ){}

  short(){
    if(this.nofold)
      return this.text;
    
    if(this.fold)
      return this.text?.substring(0,this.max);
    return this.text;
  }

  unfold(){
    this.fold = false;
  }
}
