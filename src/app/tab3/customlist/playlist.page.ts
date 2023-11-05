import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

import { AddPlayerListPage } from './new-customlist/add-playerlist.page'

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
})
export class PlayListPage {

  //自定义诗单 max=100
  constructor(
    public data:DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) {}

  ionViewWillEnter() {
    this.data.updateLocalData('customlist');
    this.onSearchChanged();
  }

  searchResult:any;
  searchResultCount=0;
  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
  }
  onSearchChanged(){
    let key = "";
    if(this.searchText!=null){
      key = this.searchText.trim();
    }
    
    this.searchResult = this.data.localJsonData.filter((e:any)=>
      (e.data.name).indexOf(key)>=0
    );
    this.searchResultCount = this.searchResult.length;
    
    this.displayResult = [];
    this.generateItems();
  }
  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,100))
    );
  }





  async createPlayList() {
    const modal = await this.modalController.create({
        component: AddPlayerListPage,
        componentProps: {
        },
        //cssClass: 'modal-fullscreen',
        //keyboardClose: true,
        showBackdrop: true,
        breakpoints: [0, 0.5, 1],
        initialBreakpoint: 0.5,
        //enterAnimation: this.enterAnimation,
        //leaveAnimation: this.leaveAnimation,
        //presentingElement: await this.modalController.getTop(),
        //presentingElement: this.presentingElement
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
    }
    this.data.updateLocalData('customlist');
  }

}
