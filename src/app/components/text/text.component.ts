import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnChanges {

  @Input() nofold?: boolean;
  @Input() name?: string;
  @Input() text?: string;
  @Input() texts?: string[];
  
  @Input() max: number = 100;
  fold:boolean = true;

  constructor(
    public ui: UiService,
    public data: DataService,
  ){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['texts']) {
      this.applyRandomText();
    }
  }

  private applyRandomText(): void {
    if (!this.texts || this.texts.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.texts.length);
    this.text = this.texts[randomIndex];
    this.fold = true;
  }

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
