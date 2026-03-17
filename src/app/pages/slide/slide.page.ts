import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('slideSwiper') slideSwiper?: ElementRef;
  private slideChangeHandlerAttached = false;

  cs:any = null;

  slideAutoplay = {
    delay: 5000,
    disableOnInteraction: true,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    public data: DataService,
    private navCtrl: NavController,
    private router: Router,
    public ui: UiService,
    private ngZone: NgZone,

  ) { }

  ngOnInit(){}

  goback(){
    this.navCtrl.back();
  }

  audio:any;
  id:any = null;
  slidesJsonData:any;
  ionViewWillEnter() {
    const routeId = this.activatedRoute.snapshot.queryParams['id'];
    if (routeId !== undefined && routeId !== null && routeId !== '') {
      this.id = routeId;
    }

    // When navigating back from nested routes, query params may be absent.
    // Reuse already loaded data instead of resetting cs to null.
    if (!this.id && this.slidesJsonData?.slides?.length) {
      this.cs = this.cs || this.slidesJsonData.slides[0];
      this.startSlideAutoplay();
      return;
    }

    if (!this.id) {
      return;
    }

    this.data.getSlides(this.id).then(data=>{
      if (!data || !data.slides || data.slides.length === 0) {
        return;
      }

      this.slidesJsonData = data;
      this.cs = this.slidesJsonData.slides[0];
      this.slideChangeHandlerAttached = false;
      this.startSlideAutoplay();

      this.audio = new Audio(this.slidesJsonData.music);
      this.audio.loop = true;
      this.audio.play();
    });
    
  }

  ionViewDidEnter() {
    if (!this.cs && this.slidesJsonData?.slides?.length) {
      this.cs = this.slidesJsonData.slides[0];
    }
    this.startSlideAutoplay();
  }

  ionViewWillLeave(){
    this.audio?.pause();
  }

  stopSlideAutoplay() {
    this.slideSwiper?.nativeElement?.swiper?.autoplay?.stop();
  }

  private startSlideAutoplay() {
    this.ensureAutoplayStarted();
  }

  private ensureAutoplayStarted(retry: number = 0) {
    const swiper = this.slideSwiper?.nativeElement?.swiper;
    const slideCount = this.slidesJsonData?.slides?.length || 0;

    if (!swiper || !swiper.autoplay || !swiper.initialized) {
      if (retry < 10) {
        setTimeout(() => this.ensureAutoplayStarted(retry + 1), 120);
      }
      return;
    }

    this.attachSlideChangeHandler(swiper);
    this.updateCurrentSlide();

    // No visible auto movement when only one slide exists.
    if (slideCount <= 1) {
      return;
    }

    swiper.update?.();
    swiper.autoplay.stop();
    swiper.autoplay.start();
  }

  private attachSlideChangeHandler(swiper: any) {
    if (this.slideChangeHandlerAttached) {
      return;
    }

    swiper.on('slideChange', () => {
      this.updateCurrentSlide();
    });
    this.slideChangeHandlerAttached = true;
  }

  private updateCurrentSlide() {
    const slides = this.slidesJsonData?.slides || [];
    const swiper = this.slideSwiper?.nativeElement?.swiper;

    if (!swiper || slides.length === 0) {
      return;
    }

    const rawIndex = typeof swiper.realIndex === 'number'
      ? swiper.realIndex
      : swiper.activeIndex;
    const safeIndex = ((rawIndex % slides.length) + slides.length) % slides.length;

    this.ngZone.run(() => {
      this.cs = slides[safeIndex];
      console.log(this.cs)
    });
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
