import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataService } from '../services/data.service';
import { AnimationController, GestureController, IonCard, IonModal, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { enterAnimation } from '../animations/fade-animation';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  gridopt={
    rows: 3,
    fill: "row"
  }
  gridopt1={
    rows: 1,
    fill: "row"
  }
  autoplayopt={
    delay: 0,
    disableOnInteraction: true,
  }
  goToArticle(item:any){
    this.navCtrl.setDirection('forward', true, 'forward', enterAnimation);

    if(item.items){
      //update audio info..
      item.items.forEach((poem:any) => {
        let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
        
        if(fullData&&fullData.audio){
          poem.audio = fullData.audio;
        }
      });
    }
    if(item.desc){
      //update audio info..
      item.desc.filter((i:any)=>i.type=='poem').forEach((poem:any) => {
        let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
        if(fullData&&fullData.audio!=null){
          poem.audio = fullData.audio;
        }
      });
    }
    this.data.currentArticle = item;
    this.router.navigate(['article-viewer'], {
      queryParams: {
      }
    });
  }
  



  //@ViewChild('modal') modal: IonModal|any;
  @ViewChildren('modal') modalList: QueryList<any> | undefined;
  closeModal(i:any) {
    this.modalList?.forEach(item=>{
      item.dismiss();
    })
  }

  

  constructor(
    private animationCtrl: AnimationController,
    private router: Router,
    private el: ElementRef, 
    private gestureCtrl: GestureController,
    private navCtrl: NavController,
    public data:DataService,
    private ui: UiService,
  ) {

     
  }


  goStyleStations(){

  }



  holder = ["长恨此身非我有","白发三千丈","莫愁前路无知己","白云千载空悠悠"];
  placeholder="";
  @ViewChild('searchKeyword') searchKeyword:any;
  searchKeywordModel="";
  search(){
    if(this.searchKeywordModel.length>0)
      this.goSearch(this.searchKeywordModel);
  }


  goTemplateSlide(id:any){

    if(id.length==0)
    {
      return;
    }
    
    if(id%2==0)
    {
      //fade animation
      this.navCtrl.setDirection('forward', true, 'forward', enterAnimation);
    }
    this.router.navigate(['/slide'], {
      queryParams: {
        id:id
      }
    });
  }

  ngOnInit(){
  }


  ionViewWillEnter(){
    this.autoSwipers.forEach((swiper:any) => {
      swiper.nativeElement.swiper.autoplay.start();
    });
  }


  //can not add lifecycle ionViewDidEnter event in directive.
  @ViewChildren("autoswiper") autoSwipers: any;
  ionViewDidEnter(){
    this.searchKeywordModel="";

    this.autoSwipers.forEach((swiper:any) => {
      swiper.nativeElement.swiper.autoplay.start();
    });
    
    
  }

  ionViewDidLeave(){
  }

  ngAfterViewInit() {
  }

  goSearch(text:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:text
      }
    });
  }

  goAuthorDirect(author:any){
    this.data.goToAuthor(author);
  }

  stopBubble(event:any){
    event.stopPropagation();
    event.preventDefault();
  }
}
