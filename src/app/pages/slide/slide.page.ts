import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { NavController } from '@ionic/angular';
import { UiService } from '../../services/ui.service';

import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.page.html',
  styleUrls: ['./slide.page.scss'],
})
export class SlidePage implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private data: DataService,
    private navCtrl: NavController,
    private router: Router,
    private ui: UiService,

  ) { }

  ngOnInit(){}

  goback(){
    this.navCtrl.back();
  }

  audio:any;
  id=0;
  slidesJsonData:any;
  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.queryParams["id"];
    this.data.getSlides(this.id).then(data=>{
      this.slidesJsonData = data;
      this.audio = new Audio(this.slidesJsonData.music);
      this.audio.loop = true;
      this.audio.play();
    });
    
  }

  ionViewWillLeave(){
    this.audio.pause();
  }
/*
  share(s:any){
    this.router.navigate(['/share'], {
      queryParams: {
        title:"",
        content:s.title.join("\n"),
        ending:s.sub
      }
    });
  }
*/


  showShare(){

  }



}
