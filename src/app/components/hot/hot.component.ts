import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { ModalEventService } from 'src/app/modal-event.service';

@Component({
  selector: 'app-hot',
  templateUrl: './hot.component.html',
  styleUrls: ['./hot.component.scss'],
})
export class HotComponent {

  @Input() name?: string;
  @Input() source?: any;

  constructor(
    public data: DataService,
    private modalEventService: ModalEventService,
  ){}

  play(p:any){
    let poem = this.data.JsonData
      .filter((shici:any)=>
        shici.id===p.pid
      )[0];
    
    this.data.qlyric = poem.paragraphs;
    this.data.currenttitle = poem.title;
    this.data.currentauthor = poem.author;

    this.modalEventService.openModal();
  }
}
