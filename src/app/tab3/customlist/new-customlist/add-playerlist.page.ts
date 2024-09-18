import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ModalController, RangeCustomEvent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-addplayerlist',
  templateUrl: './add-playerlist.page.html',
  styleUrls: ['./add-playerlist.page.scss'],
})
export class AddPlayerListPage {

  name:any;
  desc:any;

  constructor(
    public data: DataService,
    public ui:UiService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute
  ) { }

  id:any;
  customData:any;
  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    //console.log("willenter:"+this.id)
    this.customData = this.data.collectList.filter(
      (e:any)=>e.group==='customlist'&&e.data['id']==this.id)[0];
    
    if(this.id)
    {
      //console.log(this.customData)
    }
  }

  confirm(){
    this.data.addcustomlist(this.name, this.desc);
    this.modalController.dismiss();
  }

  cancel(){
    this.modalController.dismiss();
  }

}
