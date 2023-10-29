import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlayerPage } from 'src/app/pages/player/player.page';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-poem',
  templateUrl: './poem.page.html',
  styleUrls: ['./poem.page.scss'],
})
export class PoemPage{

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
    private cdRef: ChangeDetectorRef
  ) { }


  localJsonData:any;
  ionViewWillEnter() {
    this.localJsonData = this.data.collectList
      .filter(l=>l.group=='poem');
    
  }

  localPlayObj(poem:any){
    if(poem){
      this.data.currentPoem = poem;
      this.openPlayer();
    }
  }

  async openPlayer(){
    console.log('openplayer...')
    const modal = await this.modalController.create({
        component: PlayerPage,
        componentProps: {
        },
        cssClass: 'modal-fullscreen',
        keyboardClose: true,
        showBackdrop: true,
        breakpoints: [0, 0.5, 1],
        initialBreakpoint: 0.5,
        //enterAnimation: this.enterAnimation,
        //leaveAnimation: this.leaveAnimation,
        presentingElement: await this.modalController.getTop(),
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();
console.log("role:"+role)
    if (role === 'confirm'||role === 'backdrop') {
      console.log('detect changes...')
      this.cdRef.detectChanges();
    }
  }
}
