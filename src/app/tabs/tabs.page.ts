import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../services/data.service';
import { UiService } from '../services/ui.service';

import { Solar } from 'lunar-typescript';
import { Tab4Page } from '../tab4/tab4.page';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('tab4') tab4Instance: Tab4Page|any; 

  onTabChange(event: any){
    this.data.setLastVisitTab(event.tab);
  }
  
  private clickCount = 0;
  private clickTimer: any;
  onDblClick(){
    this.clickCount++;
    
    if (this.clickCount === 1) {
      this.clickTimer = setTimeout(() => {
        this.clickCount = 0;
      }, 300);
    } else if (this.clickCount === 2) {
      clearTimeout(this.clickTimer); 
      this.scrollToTop(); 
      this.clickCount = 0; 
    }
  }
  scrollToTop() {
    this.scrollService.triggerScrollToTop();
  }

  tab4Click(){
    //console.log('change tab ...')
    this.data.onSearchCancel();
  }

  constructor(
    private router: Router,
    public data: DataService,
    public ui: UiService,
    private scrollService: ScrollService,
  ) {

    this.data.initTodayText();
    
    
    var solar = Solar.fromYmd(2023,9,23);
    /*
    console.log('lunar 节气：')
    console.log(solar.getLunar().getJieQi());
    console.log(solar.getLunar().getAnimal());
    console.log(solar.getLunar().getOtherFestivals());
    console.log(solar.getLunar().toFullString());
    */
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
      case 0: name="customlist";break;
      case 1: name="list";break;
      case 2: name="author";break;
      case 3: name="poem";break;
      case 4: name="tag";break;
      case 5: name="article";break;
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
