import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataService } from '../data.service';
import { AnimationController, GestureController, IonCard, IonModal, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { enterAnimation } from '../fade-animation';
import { UiService } from '../ui.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  goToArticle(item:any){
    this.data.currentArticle = item;
    
    this.router.navigate(['article-viewer'], {
      queryParams: {
      }
    });
    

    //modal
    //this.ui.articleviewer();
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

/*
  ngOnInit() {
    const enterAnimation = (baseEl: HTMLElement) => {
      const root:any = baseEl.shadowRoot;

      const backdropAnimation = this.animationCtrl
        .create()
        .addElement(root.querySelector('ion-backdrop'))
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

      const wrapperAnimation = this.animationCtrl
        .create()
        .addElement(root.querySelector('.modal-wrapper'))
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(0)' },
          { offset: 1, opacity: '0.99', transform: 'scale(1)' },
        ]);

      return this.animationCtrl
        .create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(500)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    const leaveAnimation = (baseEl: HTMLElement) => {
      return enterAnimation(baseEl).direction('reverse');
    };

    this.modal.enterAnimation = enterAnimation;
    this.modal.leaveAnimation = leaveAnimation;
  }
*/

  @ViewChild('card1', { read: ElementRef }) card: ElementRef<HTMLIonCardElement>|any;


  ngOnInit(){
    
  }

  cardAnimation:any;
  ionViewDidEnter(){
    this.searchKeywordModel="";
    /*
    let i=0;
    this.cardAnimation = setInterval( ()=> {
      i++;
      if(i%2==0){
        this.card.nativeElement.style.backgroundImage = "url('/assets/img/cardn1.jpg')";
      }
      else
      {
        this.card.nativeElement.style.backgroundImage = "url('/assets/img/cardn2.jpg')";
      }
    }, 500 );
    */
  }

  ionViewDidLeave(){
    clearInterval(this.cardAnimation);
  }

  /*learn from simon g*/
  @ViewChild('sgcard', { read: ElementRef }) sgcard: ElementRef<HTMLIonCardElement>|any;

  @ViewChildren(IonCard, { read: ElementRef }) cardElements: QueryList<ElementRef<HTMLIonCardElement>>|any;


  parent:any;
  pressAnimation(nativeElement:any){
    const cartAnimation = this.animationCtrl.create('cart-animation')
    .addElement(nativeElement)
    .keyframes([
      { offset: 0, transform: 'scale(1)' },
      { offset: 0.8, transform: 'scale(0.97)' },
    ]);

    this.parent = this.animationCtrl.create('parent')
      .duration(500)
      //.easing('ease-out')
      //.iterations(2)
      //.direction('alternate')
      .addAnimation([cartAnimation]);

    // Playing the parent starts both animations
    this.parent.play();
  }
  


  power = 0;
  longPressActive = false;

  longPress:any;
  ngAfterViewInit() {

/*
    for(let i=0;i<this.cardElements.length;i++){
      const longPressAll = this.gestureCtrl.create({
        el: this.cardElements.get(i).nativeElement,
        threshold: 0,
        gestureName: 'long-press',
        onStart: ev => {
        
          this.longPressActive = true;
          this.pressAnimation(this.cardElements.get(i).nativeElement);
        },
        onEnd: ev => {
          this.longPressActive = false;
        }
      }, true); // Passing true will run the gesture callback inside of NgZone!
  
      // Don't forget to enable!
      longPressAll.enable(true);
    }
    */
  }

  goSearch(text:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:text
      }
    });
  }
}
