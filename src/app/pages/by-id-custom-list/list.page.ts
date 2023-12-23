import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { IonItemSliding, ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { SearchToCustomListPage } from 'src/app/tab3/customlist/search-to-customlist/search-to-customlist.page';
import { EventService } from '../../services/event.service';
import { Swiper } from 'swiper';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  sysImages = [
    "assets/img/bird.jpg",
    "assets/img/cao3.jpg",
    "assets/img/money.jpg",
    "assets/img/redbsj.jpg",
    "assets/img/road.jpg",
    "assets/img/海钓.jpg",
    "assets/img/man-3915438_1280.jpg",
    "assets/img/lotus-1205631_1280.jpg",
    "assets/img/swan-4013225_1280.jpg",
    "assets/img/chalk-4829602_1280.jpg"
  ];

  @ViewChild('swiperpickimg')
  swiperRef: ElementRef | undefined;

/*
  navigationOpt = {
    //el: ".swiper-pagination",
    clickable: true,
  };
  */

  mySwiper:any;
  selectcustomimage(){
    setTimeout(()=>{
      let index = this.sysImages.findIndex((str:any)=>str==this.listdata.customimage);
        
      this.swiperRef?.nativeElement.swiper.on('slideChange', () => {
        const activeIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
        //console.log('Active Index changed:', activeIndex);
      });
      this.swiperRef?.nativeElement.swiper.update();
      this.swiperRef?.nativeElement.swiper.slideTo(index+1, 1000, false);

    },100);
  }

  updatecustomimage(){
    const activeIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
    
    if(activeIndex==0){
      //photo 
      console.log('use org logic')
    }
    else{
      let sysimgpath = this.sysImages[activeIndex-1];
      this.listdata.customimage = sysimgpath;
    }
  }


  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private eventService: EventService
  ) {
      this.eventService.myEvent.subscribe((data) => {
        //console.log(data)
        this.updateRemoteDataTolocal();
        this.updateIsPlayListFlag();
      });
  }

  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
    this.updateRemoteDataTolocal();
  }
  onSearchChanged(){
    //console.log('onsearch changed')
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
  listActualLength:any=0;
  ionViewWillEnter() {
    this.updateRemoteDataTolocal();
    this.updateIsPlayListFlag();
  }

  private updateIsPlayListFlag(){
    //update audio info.
    this.CheckIsPlayList();
  }

  noAudio:any = true;
  CheckIsPlayList(){
    this.localList.forEach((poem:any) => {
      let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
      if(fullData.audio!=null){
        poem.audio = fullData.audio;
        this.noAudio = false;
      }
    });
  }

  singleImage:any;
  updateRemoteDataTolocal(){
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.customData = this.data.collectList.filter(
      (e:any)=>e.group==='customlist'&&e.data['id']==this.id)[0];
    this.listdata = JSON.parse(JSON.stringify(this.customData.data));
    this.localList = JSON.parse(JSON.stringify(this.listdata.list));
    this.listActualLength = this.localList.length;
    
    if(this.localList.length>0&&this.localList.length<4){
      this.singleImage = `/assets/img/poet/${this.localList[0].author}.jpeg`;
    }
  }

  isEdit = false;
  edit(){
    this.isEdit = true;
    this.selectcustomimage();
  }
  cancel(){
    this.updateRemoteDataTolocal();
    this.isEdit = false;
  }
  save(){
    this.updatecustomimage();
    this.data.savecustomlist(this.listdata);
    //update remote with locallist
    this.data.updatecustomelist(this.customData.data.id, this.localList);
    this.isEdit = false;

    this.updateIsPlayListFlag();
  }
  
  openSlidingItem(itemSliding: IonItemSliding, data:any) {
    if(itemSliding){
      itemSliding.open('end')
    }
  }

  delfromcustomlist(data:any){
    //delete local
    for(let i=0;i<this.localList.length;i++){
      if(this.localList[i].id===data.id||
        (this.localList[i].title===data.title
          )){
        this.localList.splice(i,1);
        break;
      }
    }
        
    //delete remote
    //this.data.delcustomelistitem(this.customData.data.id, data.id);
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    //console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    this.localList = ev.detail.complete(this.localList);
  }

  async addsearchtolist(enableEdit:any=false){
    if(enableEdit===true){
      this.isEdit= true;
    }
    this.data.currentCollectLike = this.customData;

//console.log(this.customData.data.name)
    const modal = await this.modalController.create({
      component: SearchToCustomListPage,
      componentProps: {
        //name: this.customData.data.name
      },
      //cssClass: 'modal-fullscreen',
      //keyboardClose: true,
      showBackdrop: true,
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
      //enterAnimation: this.enterAnimation,
      //leaveAnimation: this.leaveAnimation,
      //presentingElement: await this.modalController.getTop(),
      //presentingElement: this.presentingElement
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();
  if (role === 'confirm') {
  }
  }

  test(){}

}
