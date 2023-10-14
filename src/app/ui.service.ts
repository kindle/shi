import { Injectable } from '@angular/core';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { Animation, StatusBar, Style } from '@capacitor/status-bar';
//import { Filesystem, Directory } from '@capacitor/filesystem';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Capacitor } from '@capacitor/core';
import { Location } from '@angular/common'
import { AnimationController, ModalController } from '@ionic/angular';
import { ImageViewerPage } from 'src/app/image-viewer/image-viewer.page';
import { PlayerPage } from './player/player.page';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  isIos = false;
  isAndroid = false;

  isiphone = false;
  isipad = false;
  
  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private platform: Platform,
    private socialSharing: SocialSharing,

    private animationCtrl: AnimationController,
    private modalController: ModalController,
    private location: Location
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
        //StatusBar.setOverlaysWebView({ overlay: true });
      }
    }
  }

  hideStatusBar(){
    if(Capacitor.isNativePlatform()) {
      StatusBar.hide();
    }
  }

  showStatusBar(){
    if(Capacitor.isNativePlatform()) {
      StatusBar.show();
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

  async player() {
      const modal = await this.modalController.create({
          component: PlayerPage,
          componentProps: {
          },
          cssClass: 'modal-fullscreen',
          keyboardClose: true,
          showBackdrop: true,
          breakpoints: [0, 0.5, 1],
          initialBreakpoint: 0.5,
          //enterAnimation: this.enterAnimation,
          //leaveAnimation: this.leaveAnimation,
          presentingElement: await this.modalController.getTop(),
      });

      return await modal.present();
  }


  async toast(position: 'top' | 'middle' | 'bottom',msg:string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: position,
      cssClass: 'custom-toast',
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

  share(base64ImageData:any){
    this.socialSharing.share(undefined, "share", base64ImageData, undefined);
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
    this.location.back();
  }

}
