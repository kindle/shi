import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { IonItemSliding, ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { SearchToCustomListPage } from 'src/app/tab3/customlist/search-to-customlist/search-to-customlist.page';
import { EventService } from '../../services/event.service';
import { Swiper } from 'swiper';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  private readonly pageSize = 100;

  sysImages = [
    "https://reddah.blob.core.windows.net/msjjimg/bird.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/cao3.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/money.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/redbsj.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/road.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/海钓.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/man-3915438_1280.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/lotus-1205631_1280.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/swan-4013225_1280.jpg",
    "https://reddah.blob.core.windows.net/msjjimg/chalk-4829602_1280.jpg"
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
      //console.log('use org logic')
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
  visibleLocalList:any[] = [];
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
    let key = (this.searchText || '').trim();
    /*if(key==""){
      this.localList = this.listdata.list;
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample).indexOf(key)>=0
      );
    }*/
    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');

    if(key.length==0){
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample+e.paragraphs.join('_')).indexOf(key)>=0
      );
      //console.log(this.localList)
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample+e.paragraphs.join('_')).indexOf(key[0])>=0
      );
      if(keys.length>1){
        this.localList = this.localList.filter((e:any)=>
          (e.title+e.author+e.sample+e.paragraphs.join('_')).indexOf(keys[1])>=0
        );
        if(keys.length>2){
          this.localList = this.localList.filter((e:any)=>
            (e.title+e.author+e.sample+e.paragraphs.join('_')).indexOf(keys[2])>=0
          );

          if(keys.length>3){
            this.localList = this.localList.filter((e:any)=>
              (e.title+e.author+e.sample+e.paragraphs.join('_')).indexOf(keys[3])>=0
            );
            
            if(keys.length>4){
              this.localList = this.localList.filter((e:any)=>
                (e.title+e.author+e.sample+e.paragraphs.join('_')).indexOf(keys[4])>=0
              );
            }
          }
        }
      }
    }

    this.resetVisibleLocalList();
  }

  listdata:any;
  poets:any;


  id:any;
  customData:any;
  listActualLength:any=0;
  private poemAudioMap = new Map<any, any>();
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
    this.ensurePoemAudioMap();
    this.noAudio = true;

    this.localList = this.localList.map((poem:any) => {
      const audio = poem.audio ?? this.poemAudioMap.get(poem.id) ?? null;
      if(audio){
        this.noAudio = false;
      }

      return {
        ...poem,
        audio,
        previewText: this.data.shownosample(poem)
      };
    });

    this.resetVisibleLocalList();
  }

  singleImage:any;
  updateRemoteDataTolocal(){
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.customData = this.data.collectList.filter(
      (e:any)=>e.group==='customlist'&&e.data['id']==this.id)[0];
    const sourceData = this.customData?.data ?? {};
    const sourceList = Array.isArray(sourceData.list) ? sourceData.list : [];

    this.listdata = {
      ...sourceData,
      image: Array.isArray(sourceData.image) ? [...sourceData.image] : [],
      list: sourceList
    };
    this.localList = sourceList.map((poem:any) => ({
      ...poem,
      previewText: this.data.showsample(poem)
    }));
    this.listActualLength = this.localList.length;
    this.resetVisibleLocalList();
    
    if(this.localList.length>0&&this.localList.length<4){
      this.singleImage = `https://reddah.blob.core.windows.net/msjjpoet/${this.localList[0].author}.jpeg`;
    }
  }

  private ensurePoemAudioMap(){
    if(this.poemAudioMap.size > 0){
      return;
    }

    this.data.JsonData.forEach((poem:any) => {
      if(poem?.id != null && poem.audio != null){
        this.poemAudioMap.set(poem.id, poem.audio);
      }
    });
  }

  private resetVisibleLocalList(){
    this.visibleLocalList = this.localList.slice(0, this.pageSize);
  }

  loadMoreLocalList(event:any){
    const nextCount = Math.min(this.visibleLocalList.length + this.pageSize, this.localList.length);
    this.visibleLocalList = this.localList.slice(0, nextCount);
    event.target.complete();

    if(this.visibleLocalList.length >= this.localList.length){
      event.target.disabled = true;
    }
  }

  trackByPoem(_:number, poem:any){
    return poem?.id ?? `${poem?.author}_${poem?.title}`;
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
        cid: this.id
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

  async share(){
    if(!this.listdata){
      return;
    }

    const fileName = `${this.getExportFileName(this.listdata.name)}.json`;
    const content = JSON.stringify(this.listdata, null, 2);

    try{
      if(Capacitor.getPlatform() === 'web'){
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        await this.ui.toast('bottom', '导出成功');
        return;
      }

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      await Share.share({
        title: this.listdata.name,
        text: fileName,
        files: [savedFile.uri],
        dialogTitle: this.ui.instant('Action.Share')
      });
    }catch(error){
      console.error('Custom poem list export failed', error);
      await this.ui.toast('bottom', '导出失败');
    }
  }

  private getExportFileName(name:any){
    const safeName = String(name || 'poem_list')
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim();
    return safeName || 'poem_list';
  }

}
