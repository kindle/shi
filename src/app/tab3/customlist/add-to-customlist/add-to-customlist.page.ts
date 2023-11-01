import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ModalController, RangeCustomEvent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-to-customlist',
  templateUrl: './add-to-customlist.page.html',
  styleUrls: ['./add-to-customlist.page.scss'],
})
export class AddToCustomListPage {

  name:any;
  desc:any;

  constructor(
    public data: DataService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute
  ) { }

  lastUpdatedCustomList:any = [];
  ionViewWillEnter() { 
    this.data.updateLocalData('customlist');
    let temp = this.data.GetLastUpdatedCustomList();
    if(temp!=null){
      this.lastUpdatedCustomList.push(temp);
    }
  }

  cancel(){
    this.modalController.dismiss();
  }

  createPlayList(){}

  addtocustomlist(data:any){
    this.data.addtocustomlist(data);
    this.modalController.dismiss();
  }

}
