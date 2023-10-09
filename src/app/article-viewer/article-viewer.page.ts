import { Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.page.html',
  styleUrls: ['./article-viewer.page.scss'],
})
export class ArticleViewerPage {
  item:any;
  constructor(
    public data: DataService,
    private modalController: ModalController,
    private ui: UiService,
    private elementRef: ElementRef, 
    private ngZone: NgZone,
    private location: Location
  ) { 
    this.item = this.data.currentArticle;
    this.defaultBgHeight = this.item.min_height;
  }

  goback(){
   this.location.back();
   //this.modalController.dismiss();
  }


  ionViewWillEnter() {
    this.ui.hideStatusBar();
  }

  ionViewWillLeave() {
    this.ui.showStatusBar();
  }

  defaultBgHeight:string;
  onScroll(event:any){
    let offset = event.detail.scrollTop;

    if(offset<=0){
      this.defaultBgHeight = (this.item.min_height.replace("px","") - offset)+"px";
    }else{
      this.defaultBgHeight = this.item.min_height;
    }
  }

}
