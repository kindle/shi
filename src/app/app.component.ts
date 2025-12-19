import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { Storage } from '@ionic/storage-angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { DataService } from './services/data.service';
import { NavController, Platform } from '@ionic/angular';
import { UiService } from './services/ui.service';
register();

// Add these enums if not already imported from a library
enum Style {
  Dark = 'DARK',
  Light = 'LIGHT'
}

enum Animation {
  None = 'NONE'
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private ui: UiService,
    private data: DataService,
    private storage: Storage,
    private navController: NavController,
    private platform: Platform,
  ) {
    this.platform.ready().then(() => {
      if (this.ui.isAndroid) {
        // translucent background, dark icons
        //this.ui.setStatusBar(Style.Light, Animation.None, '#80ffffff'); 
        // white background, light icons
        this.ui.setStatusBar(Style.Light, Animation.None, '#ffffff'); 
      } else if (this.ui.isIos) {
        // white background, light icons
        this.ui.setStatusBar(Style.Light, Animation.None, '#ffffff'); 
      }
    });
  }

  async ngOnInit() {
    SplashScreen.show({
      showDuration: 3000,
      autoHide: true,
    });

    await this.storage.create().then(()=>{
      this.data.init();
    }).finally(()=>{
      this.data.loadLocale();
    });

    
    this.data.loadFontSizeZoomLevel();

    this.data.loadAIChatHistory();
    this.data.loadMyLikeArticles();

    if(this.ui.isIos)
    {
      await this.loadVisitedTab();
    }
    //test
    //this.data.gototesturl();
  }

  async loadVisitedTab(){
    const lastVisitedTab = await this.storage.get(this.data.LOCALSTORAGE_LAST_VISIT_TAB);
    const cleanTabIdentifier = lastVisitedTab.replace(/"/g, '');
    if (lastVisitedTab) {
      this.navController.navigateRoot(`/tabs/${cleanTabIdentifier}`);
    } else {
      this.navController.navigateRoot('/tabs/tab1');
    }
  }
}

export class Song{
  constructor(
    id:number,
    groupId:number,
    name:string,
  ){
    this.id = id;
    this.groupId = groupId;
    this.name = name;
  }

  id:number;
  groupId:number;
  name:string;

  desc:string|any;
  mediaUrl:string|any;
  lyricUrl:string|any;
  lyricText:string|any;
  img:string|any;
  file:string|any;

  selected:boolean|any;

  create:number|any;
}

export class Group{
  constructor(
    id:number,
    name:string,
  ){
    this.id = id;
    this.name = name;
  }
  id:Number;
  name:string;

  img:string|any;


  icon:string|any;
  cover:string|any;
  count:number|any;

  color:string|any;
  src:string|any;
}