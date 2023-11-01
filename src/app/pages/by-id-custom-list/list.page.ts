import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, IonItemSliding, NavController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private actionSheet: ActionSheetController,
  ) { }

  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
    this.localList = this.listdata.list;
  }
  onSearchChanged(){
    console.log('onsearch changed')
    let key = this.searchText.trim();
    if(key==""){
      this.localList = this.listdata.list;
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample).indexOf(key)>=0
      );
    }
  }

  listdata:any;
  poets:any;


  id:any;
  customData:any;
  ionViewWillEnter() {
    this.updateRemoteDataTolocal();
  }

  singleImage:any;
  updateRemoteDataTolocal(){
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.customData = this.data.collectList.filter(
      (e:any)=>e.group==='customlist'&&e.data['id']==this.id)[0];
    this.listdata = JSON.parse(JSON.stringify(this.customData.data));
    this.localList = JSON.parse(JSON.stringify(this.listdata.list));
    
    if(this.localList.length>0&&this.localList.length<4){
      this.singleImage = `/assets/img/poet/${this.localList[0].author}.jpeg`;
    }
  }

  isEdit = false;
  edit(){
    this.isEdit = true;
  }
  cancel(){
    this.updateRemoteDataTolocal();
    this.isEdit = false;
  }
  save(){
    this.data.savecustomlist(this.listdata);
    //update remote with locallist
    this.data.updatecustomelist(this.customData.data.id, this.localList);
    this.isEdit = false;
  }
  
  openSlidingItem(itemSliding: IonItemSliding, data:any) {
    if(itemSliding){
      itemSliding.open('end')
    }
  }

  delfromcustomlist(data:any){
    //delete local
    for(let i=0;i<this.localList.length;i++){
      if(this.localList[i].id===data.id){
        this.localList.splice(i,1);
        break;
      }
    }
        
    //delete remote
    //this.data.delcustomelistitem(this.customData.data.id, data.id);
  }

}
