import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UiService } from '../ui.service';
import { Style, Animation } from '@capacitor/status-bar';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
})
export class ImageViewerPage implements OnInit {

  @Input() url:any;
  
  constructor(
    private modalController: ModalController,
    private ui: UiService,
  ) { }

  ngOnInit() {
  }

  close(){
    this.modalController.dismiss();
  }

  imageClick(event:any){
    event.stopPropagation();
  }

  ionViewWillEnter() {
    this.ui.hideStatusBar();
  }

  ionViewWillLeave() {
    this.ui.showStatusBar();
  }

}
