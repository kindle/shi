import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RangeCustomEvent } from '@ionic/core';

import { DataService } from '../data.service';
import { UiService } from '../ui.service';

import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import * as download from 'downloadjs'

import { Solar } from 'lunar-typescript';
import { ModalEventService } from '../modal-event.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('modal') modal: any; 
  async openModal() {
    await this.modal.present();
  }

  constructor(
    private router: Router,
    public data: DataService,
    public ui: UiService,
    private modalEventService: ModalEventService,
    private modalController: ModalController,
  ) {

    this.modalEventService.modalOpen$.subscribe(() => {
      this.openModal();
    });

    this.data.initTodayText();
    
    
    var solar = Solar.fromYmd(2023,9,23);
    console.log(solar.getLunar().getJieQi());
    console.log(solar.getLunar().getAnimal());
    console.log(solar.getLunar().getOtherFestivals());
    console.log(solar.getLunar().toFullString());
    /*
    this.data.getCachedJsonFromAzure().then(data=>{
      if(data){
        this.ui.toast('top','successfull read blob')
        console.log("bailin test azuree string")
        console.log(data);
        console.log("bailin test azuree json")
        //const articles = JSON.parse(data+"");
        
        //console.log(data);
        
      }
    }).catch(e=>{
      console.log(e)
    })
    */
    

    
/*
    this.data.getAudioFromAzure().then(data=>{
      if(data){
        console.log("bailin test azuree string")
        console.log(data);
        console.log("bailin test azuree json")
        //const articles = JSON.parse(data+"");
        
        
      }
    })
    */
  }
  

  goPlay(){
    this.router.navigate(['/play'], {
      queryParams: {
        key:""
      }
    });
  }

  download(){
    const historyBlock:any = document.getElementById("TodaysCard");
    htmlToImage.toPng(historyBlock)
    .then(function (dataUrl) {
      download(dataUrl, 'shi.png');
    });
  }

  share(){
    const historyBlock:any = document.getElementById("TodaysCard");
    /*
    const options = { 
      background: "white", 
      width: historyBlock.clientWidth, 
      height: historyBlock.clientHeight 
    };*/
    
    htmlToImage.toPng(historyBlock).then((hisDataUrl:any) => {
      this.ui.share(hisDataUrl);
    });
  }

  prev(){
    this.data.prevTodayText();
  }

  next(){
    this.data.nextTodayText();
  }

  isFirstPlaying(){}
  isLastPlaying(){}

  
  lastIndex: number = 0;
  

  ionViewDidLeave()
  {
  }

  curTab = 0;
  goTab(id:any){
    this.curSub=0;
    this.curTab=id;
    this.router.navigate(['/tabs/tab'+id], {
      queryParams: {
      }
    });
  }
  isSelected(id:any){
    if(id==this.curTab)
      return true
    return false;
  }

  curSub = 0;
  goSub(id:any){
    this.curTab=0;
    this.curSub=id;
    let name = "";
    switch(id){
      case 1: name="list";break;
      case 2: name="author";break;
      case 3: name="poem";break;
      case 4: name="tag";break;
    }
    this.router.navigate(['/tabs/tab3/'+name], {
      queryParams: {
      }
    });
  }
  isSubSelected(id:any){
    if(id==this.curSub)
      return true
    return false;
  }
  




}
