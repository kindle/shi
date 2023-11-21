import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ModalController } from '@ionic/angular';
import { AddPlayerListPage } from '../new-customlist/add-playerlist.page';

@Component({
  selector: 'app-add-to-customlist',
  templateUrl: './add-to-customlist.page.html',
  styleUrls: ['./add-to-customlist.page.scss'],
})
export class AddToCustomListPage {

  name:any;
  desc:any;

  constructor(
    public data: DataService,
    private modalController: ModalController,
  ) { }

  lastUpdatedCustomList:any = [];
  ionViewWillEnter() {
    this.data.updateLocalData('customlist');
    this.onSearchChanged();

    let temp = this.data.GetLastUpdatedCustomList();
    if(temp!=null){
      this.lastUpdatedCustomList.push(temp);
    }
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
    //console.log(this.data.localJsonData)
    this.searchResult = this.data.localJsonData.filter((e:any)=>
      (e.data.name+e.data.desc+e.data.image).indexOf(key)>=0
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


  cancel(){
    this.modalController.dismiss();
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
    this.onSearchChanged();
  }

  addtocustomlist(data:any){
    this.data.addtocustomlist(data);
    this.modalController.dismiss();
  }

}
