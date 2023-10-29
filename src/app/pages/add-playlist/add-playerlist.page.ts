import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ModalController, RangeCustomEvent } from '@ionic/angular';

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
    private modal: ModalController,
  ) { }

  confirm(){

  }

  cancel(){
    this.modal.dismiss();
  }

}
