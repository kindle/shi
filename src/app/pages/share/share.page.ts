import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { NavController } from '@ionic/angular';


import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.page.html',
  styleUrls: ['./share.page.scss'],
})
export class SharePage implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    public data: DataService,
    private navCtrl: NavController,
    private ui: UiService,
  ) { }

  ngOnInit() {
  }

  slideStyles = [
    {id:1,img:"1.jpg"},
    {id:2,img:"2.jpg"},
    {id:3,img:"3.jpg"},
    {id:4,img:"4.jpg"},
    {id:5,img:"5.jpg"},
    //{id:6,img:"6.jpg"},
    //{id:7,img:"7.jpg"},
    //{id:8,img:"8.jpg"},
    //{id:9,img:"9.jpg"},
  ]


  title:string|any;
  content:string|any;
  contentArray:[]|any;
  ending:string|any;

  ionViewWillEnter() {
    this.title = this.activatedRoute.snapshot.queryParams["title"];
    this.content = this.activatedRoute.snapshot.queryParams["content"];
    this.content = this.content.replace(/\n/g, "");
    this.content = this.content.replace(/。/g, " ").trim();
    this.content = this.content.replace(/，/g, " ").trim();
    this.contentArray = this.content.split(' ')
    
    this.ending = this.activatedRoute.snapshot.queryParams["ending"];
  }


  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;


  goToStyle(id: any){
   console.log(id)
   this.swiperRef?.nativeElement.slideTo(id-1,1000,false);
  }

  currentFont = "wenyuefangsong";

  share(){
    const activeIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
    const styleIndex = activeIndex+1;
    const historyBlock:any = document.getElementById("print-wrapper-prview"+styleIndex);
    
    const options = { 
      background: "white", 
      width: historyBlock.clientWidth, 
      height: historyBlock.clientHeight 
    };
    /*
    domtoimage.toPng(historyBlock, options).then((hisDataUrl) => {
      
      this.ui.share(hisDataUrl);
    });*/
  }

}
