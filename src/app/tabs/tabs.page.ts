import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../services/data.service';
import { UiService } from '../services/ui.service';

import { Solar } from 'lunar-typescript';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  onTabChange(event: any){
    //const selectedTab = event.detail.tab;
    //console.log(event.tab);
    this.data.currentTab = event.tab;
  }

  constructor(
    private router: Router,
    public data: DataService,
    public ui: UiService,
  ) {

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
  
  next(){}
  
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
