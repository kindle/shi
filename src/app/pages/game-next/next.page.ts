import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-game-next',
  templateUrl: './next.page.html',
  styleUrls: ['./next.page.scss'],
})
export class NextPage {

  id:any;

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
  ) { 
    
  }

  localGameData:any = [];
  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    //console.log(this.id)
    this.localGameData = this.data.gameNextData
      .filter((g:any)=>g.id==this.id)[0];
      
    this.localGameData.list.forEach((j:any) => {
      j.display = false;
    });
    
  }

  show(s:any){
    s.display = true;
  }

}
