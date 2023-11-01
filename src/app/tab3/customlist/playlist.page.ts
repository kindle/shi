import { ChangeDetectorRef, Component } from '@angular/core';
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

  constructor(
    public data:DataService,
    public ui: UiService,
    private modalController: ModalController,
    private cdRef: ChangeDetectorRef
  ) {
    this.data.updateLocalData('customlist');
   }

  ionViewWillEnter() {
    //there's no will enter in modal
    //this.data.updateLocalData('customlist');
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
