import { Injectable } from '@angular/core';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { Animation, StatusBar, Style } from '@capacitor/status-bar';
//import { Filesystem, Directory } from '@capacitor/filesystem';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Capacitor } from '@capacitor/core';
import { Location } from '@angular/common'
import { AnimationController, ModalController } from '@ionic/angular';
import { ImageViewerPage } from 'src/app/pages/viewer-image/image-viewer.page';
import { PlayerPage } from '../pages/player/player.page';
import { PlayerPadPage } from '../pages/player-pad/player-pad.page';

import domtoimage from 'dom-to-image';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  isIos = false;
  isAndroid = false;

  isiphone = false;
  isipad = false;
  
  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private platform: Platform,
    private socialSharing: SocialSharing,

    private animationCtrl: AnimationController,
    private modalController: ModalController,
    private location: Location,
    private navController: NavController,
    private router: Router
  ) { 
    if(this.platform.is('ios')){
      this.isIos =true;
      if(this.platform.is('iphone')){
        this.isiphone = true;
      }
      if(this.platform.is('ipad')){
        this.isipad = true;
      }
    }
    if(this.platform.is('android')){
      this.isAndroid =true;
      if(this.platform.is('tablet')){
        this.isipad = true;
      }
    }
  }

  setStatusBar(style: Style,animation: Animation,color: string) {
    if(Capacitor.isNativePlatform()) {
      //Style.Dark white text
      //Style.Light black text
      StatusBar.setStyle({ style: style });
      StatusBar.setBackgroundColor({color:color});

      if(this.platform.is('ios')){
        //Animation.Fade|Animation.Slide|Animation.None
        StatusBar.show({animation: animation});
      }
      
      if(this.platform.is('android')){
        //android only
        StatusBar.setOverlaysWebView({ overlay: false });
      }
    }
  }

  hideStatusBar(){
    if(Capacitor.isNativePlatform()) {
      if(this.platform.is('ios')){
        StatusBar.hide();
      }
      
      if(this.platform.is('android')){
          //android only
          StatusBar.setOverlaysWebView({ overlay: true });
          StatusBar.setBackgroundColor({color: '#00000000'});
      }
      
    }
  }

  showStatusBar(){
    if(Capacitor.isNativePlatform()) {
      StatusBar.show();

      if(this.platform.is('android')){
          //android only
          StatusBar.setOverlaysWebView({ overlay: false });
          StatusBar.setBackgroundColor({color: '#ffffff'});
      }
    }
  }


  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(50)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  async imageviewer(url:any) {
      const modal = await this.modalController.create({
          component: ImageViewerPage,
          componentProps: {
              url:url
          },
          cssClass: 'modal-fullscreen',
          keyboardClose: true,
          showBackdrop: true,
          enterAnimation: this.enterAnimation,
          leaveAnimation: this.leaveAnimation,
          presentingElement: await this.modalController.getTop(),
      });

      return await modal.present();
  }

  PoemPlayer:any;
  async player(poem:any, fromArticle:boolean=false) {
      //const modal = await this.modalController.create({
      this.PoemPlayer = await this.modalController.create({
          component: this.isipad?PlayerPadPage:PlayerPage,
          componentProps: {fromArticle:fromArticle},
          cssClass: 'modal-fullscreen',
          keyboardClose: true,
          showBackdrop: true,
          breakpoints: [0, 1],//this.isipad?[0, 1]:[0, 0.5, 1],
          initialBreakpoint: 1,//this.isipad?1:0.5,
          //initialBreakpoint: poem.audio?1:0.5,
          //breakpoints: [0, 1],
          //initialBreakpoint: 1,
          //enterAnimation: this.enterAnimation,
          //leaveAnimation: this.leaveAnimation,
          presentingElement: await this.modalController.getTop(),
      });

      /*if(this.isiphone){
        this.hideStatusBar();
        this.PoemPlayer.onDidDismiss().then(()=>{
          this.showStatusBar();
        });
      }*/

      return await this.PoemPlayer.present();
  }


  async toast(position: 'top' | 'middle' | 'bottom',msg:string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      //position: position,
      position: 'bottom',
      cssClass: 'custom-bottom-toast',
      icon: 'checkmark-circle',
      //color: 'primary'
    });

    await toast.present();
  }

  async confirm(header:any, message:any, action:any){
    const alert = await this.alertController.create({
        header: header,//this.reddah.instant("Confirm.Title")
        message: message,
        buttons: [
        {
            text: "取消",
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {}
        }, 
        {
            text: "确定",
            handler: () => {
                action();
            }
        }]
    });

    await alert.present().then(()=>{
    
    });;
  }

  share(base64ImageData:any, 
    subject:any = "Subject", 
    message:any = "Share", 
    url:any = "reddah.com"){
    this.socialSharing.share(message, subject, base64ImageData, url);
  }

  share1(message:any, subject:any, base64ImageData:any, url:any){
    this.socialSharing.share(message, subject, base64ImageData, url);
  }

  share2(){
    
  }

  saveShareImage(dataUrl:any){
    /*
    if (this.platform.is('mobile')) {
        let date = new Date(),
        time = date.getTime(),
        fileName = time + ".png";


        Filesystem.writeFile({
          path: fileName,
          data: dataUrl,
          directory: Directory.Documents,
        });
        
    } else {
        // Fallback for Desktop
        var data = dataUrl.split(',')[1];
        let blob = this.b64toBlob(data, 'image.webp');

        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'canvasimage.webp';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    */
  }

  private b64toBlob(b64Data:any, contentType:any) 
  {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }


  goback(){
    if(this.platform.is('android')){
      if (window.history.length > 1) {
        this.location.back();
      } else {
        this.router.navigate(['/tabs/home']);
      }
    }
    else{
      this.navController.pop();
    }
  }

  localeData:any;
  loadTranslate(locale:any){
      this.http.get<any>(`assets/i18n/${locale}.json`)
      .subscribe((res:any) =>{
          this.localeData=this.flatten(res);
      }, (error:any) =>{
          console.log(error);
      });
  }

  instant(key:any){
      if(this.localeData)
          return this.localeData[key];
      return key;
  }

  flatten (obj:any, prefix:any = [], current:any = {}) {
      if (typeof (obj) === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          this.flatten(obj[key], prefix.concat(key), current)
        })
      } else {
        current[prefix.join('.')] = obj
      }
    
      return current
  }



  selectText() 
  {
    const text = window.getSelection();
    if(text){
      if (text.toString().length > 0) {
        const selectedText = text.toString();
        const tempInput = document.createElement("textarea");
        tempInput.style.position = "absolute";
        tempInput.style.left = "-1000px";
        tempInput.style.top = "-1000px";
        tempInput.value = selectedText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        // Optionally, you can notify the user that text has been copied
        // Example: alert("Text copied to clipboard: " + selectedText);
      }
    }
  }



  checkIsToday(date:any){
    let cur = new Date(date);
    return cur.getDate()==new Date().getDate();
  }

  daysBetween(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
  }
  getDisplayDateName(date:any){
    let cur = new Date(date);
    let days = this.daysBetween(new Date(), cur);
    if(days==0)
      return this.instant("AI.Today"); //"今天"
    else if(days==1)
      return this.instant("AI.Yesterday");//"昨天"
    else
      return days +" "+ this.instant("AI.DaysAgo");//"天前"
  }






  
}
