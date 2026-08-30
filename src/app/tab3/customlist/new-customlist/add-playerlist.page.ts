import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ModalController, RangeCustomEvent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-addplayerlist',
  templateUrl: './add-playerlist.page.html',
  styleUrls: ['./add-playerlist.page.scss'],
})
export class AddPlayerListPage {

  name:any;
  desc:any;

  sys_poem_list:any[] = [
    {name:'地铁',path:"assets/syspoemlist/地铁.json",image:"https://reddah.blob.core.windows.net/msjjimg/cao3.jpg",},
    {name:'小学必背', path:"assets/syspoemlist/小学必背.json", image:"https://reddah.blob.core.windows.net/msjjimg/redbsj.jpg", },
    {name:'毛主席诗词', path:"assets/syspoemlist/毛主席诗词.json", image:"https://reddah.blob.core.windows.net/msjjpoet/毛泽东.jpeg",},
  ];

  constructor(
    public data: DataService,
    public ui:UiService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute
  ) { }

  id:any;
  customData:any;
  async ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    //console.log("willenter:"+this.id)
    this.customData = this.data.collectList.filter(
      (e:any)=>e.group==='customlist'&&e.data['id']==this.id)[0];

    await Promise.all(this.sys_poem_list.map(async (systemList:any) => {
      try{
        const response = await fetch(systemList.path);
        if(!response.ok){
          throw new Error(`Unable to load system poem list: ${response.status}`);
        }
        systemList.data = await response.json();
      }catch(error){
        console.error('System poem list preview load failed', error);
      }
    }));
    
    if(this.id)
    {
      //console.log(this.customData)
    }
  }

  confirm(){
    this.data.addcustomlist(this.name, this.desc);
    this.modalController.dismiss();
  }

  cancel(){
    this.modalController.dismiss();
  }

  async importSystemPoemList(systemList:any){
    try{
      const response = await fetch(systemList.path);
      if(!response.ok){
        throw new Error(`Unable to load system poem list: ${response.status}`);
      }

      const importedList = await response.json();
      if(!Array.isArray(importedList?.list)){
        throw new Error('Invalid system poem list');
      }

      this.data.addcustomlist(importedList.name || systemList.name, importedList.desc || '');
      const newCustomList = this.data.collectList[this.data.collectList.length - 1]?.data;
      if(!newCustomList){
        throw new Error('Unable to create custom poem list');
      }

      this.data.savecustomlist({
        ...importedList,
        id: newCustomList.id,
        name: importedList.name || systemList.name,
        desc: importedList.desc || '',
        image: Array.isArray(importedList.image) ? importedList.image : [],
        list: importedList.list
      });
      await this.ui.toast('bottom', '已添加到诗单列表');
      await this.modalController.dismiss();
    }catch(error){
      console.error('System poem list import failed', error);
      await this.ui.toast('bottom', '导入诗单失败');
    }
  }

}
