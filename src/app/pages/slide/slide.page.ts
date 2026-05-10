import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { NavController } from '@ionic/angular';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.page.html',
  styleUrls: ['./slide.page.scss'],
})
export class SlidePage implements OnInit {

  @ViewChild('slideSwiperArticle') slideSwiper?: ElementRef;
  private attachedSwiper: any = null;
  private userPausedAutoplay = false;
  private loadedSlideId: any = null;
  private currentSlideIndex = 0;
  private routeSub: Subscription | null = null;

  cs:any = null;

  slideAutoplay = {
    delay: 5000,
    disableOnInteraction: true,
  };

  get canLoop(): boolean {
    return (this.slidesJsonData?.slides?.length || 0) > 1;
  }

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
    this.ui.hideStatusBar();

    // Clean up if re-entering
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }

    this.routeSub = this.activatedRoute.queryParams.subscribe(params => {
      const routeId = params['id'];
      if (routeId !== undefined && routeId !== null && routeId !== '') {
        this.id = routeId;
        this.loadSlidesData();
      } else {
        // If query params are missing but we have cached data, reuse it
        if (this.slidesJsonData?.slides?.length) {
          this.restoreCurrentSlideFromIndex();
          this.startSlideAutoplay();
        }
      }
    });
  }

  loadSlidesData() {
    //console.log('SlidePage ionViewWillEnter:'+this.id);

    if (this.loadedSlideId === this.id && this.slidesJsonData?.slides?.length) {
      this.restoreCurrentSlideFromIndex();
      this.startSlideAutoplay();
      return;
    }

    this.data.getSlides(this.id).then(data=>{
      //console.log(data);
      if (!data || !data.slides || data.slides.length === 0) {
        return;
      }
      //console.log('Slides data loaded for id:', this.id);

      this.ngZone.run(() => {
        this.slidesJsonData = data;
        this.loadedSlideId = this.id;
        this.currentSlideIndex = 0;
        this.cs = this.slidesJsonData.slides[0];
        //console.log('Initial slide set. Starting autoplay.');
        //console.log(this.cs);
        this.userPausedAutoplay = false;
        this.startSlideAutoplay();

        this.audio = new Audio(this.slidesJsonData.music);
        this.audio.loop = true;
        this.audio.play();
      });
    }).catch(err => {
      console.error('Error loading slides:', err);
    });
  }

  ionViewDidEnter() {
    if (!this.cs && this.slidesJsonData?.slides?.length) {
      this.ngZone.run(() => {
        this.cs = this.slidesJsonData.slides[0];
      });
    }
    this.startSlideAutoplay();
  }

  ionViewWillLeave(){
    this.ui.showStatusBar();
    //console.log('SlidePage ionViewWillLeave');
    this.audio?.pause();
    this.slideSwiper?.nativeElement?.swiper?.autoplay?.stop();
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  stopSlideAutoplay() {
    this.userPausedAutoplay = true;
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
    this.restoreCurrentSlideOnSwiper(swiper);
    this.updateCurrentSlide();

    // No visible auto movement when only one slide exists or user paused autoplay.
    if (slideCount <= 1 || this.userPausedAutoplay) {
      swiper.autoplay.stop();
      return;
    }

    swiper.update?.();
    swiper.autoplay.stop();
    swiper.autoplay.start();
  }

  private attachSlideChangeHandler(swiper: any) {
    if (this.attachedSwiper === swiper) {
      return;
    }

    swiper.on('slideChange', () => {
      this.updateCurrentSlide();
    });
    this.attachedSwiper = swiper;
  }

  private updateCurrentSlide() {
    const slides = this.slidesJsonData?.slides || [];
    const swiper = this.slideSwiper?.nativeElement?.swiper;

    if (!swiper || slides.length === 0) {
      return;
    }

    let rawIndex = 0;
    if (typeof swiper.realIndex === 'number') {
        rawIndex = swiper.realIndex;
    } else if (typeof swiper.activeIndex === 'number') {
        rawIndex = swiper.activeIndex;
    }
    
    const safeIndex = ((rawIndex % slides.length) + slides.length) % slides.length;

    this.ngZone.run(() => {
      this.currentSlideIndex = safeIndex;
      const newSlide = slides[safeIndex];
      if (newSlide) {
        this.cs = newSlide;
      } else if (!this.cs && slides.length > 0) {
        // Fallback if safeIndex points to nothing but we have slides
        this.cs = slides[0];
      }
    });
  }

  private restoreCurrentSlideFromIndex() {
    const slides = this.slidesJsonData?.slides || [];
    if (slides.length === 0) {
      return;
    }

    const safeIndex = ((this.currentSlideIndex % slides.length) + slides.length) % slides.length;
    this.cs = slides[safeIndex];
  }

  private restoreCurrentSlideOnSwiper(swiper: any) {
    const slides = this.slidesJsonData?.slides || [];
    if (!swiper || slides.length === 0) {
      return;
    }

    const safeIndex = ((this.currentSlideIndex % slides.length) + slides.length) % slides.length;
    if (this.canLoop && typeof swiper.slideToLoop === 'function') {
      swiper.slideToLoop(safeIndex, 0, false);
    } else if (typeof swiper.slideTo === 'function') {
      swiper.slideTo(safeIndex, 0, false);
    }
  }


  
  translateY = 0; // Amount to move the div down
  MaxOpacity = 0.9
  opacity = this.MaxOpacity; // Initial opacity value
  lastScrollTop = 0;
  items = Array(100).fill(0).map((_, i) => `Item ${i + 1}`);

  onScrollFloatingDiv(event: any) {
    const scrollTop = event.detail.scrollTop<0?0:event.detail.scrollTop;
    const scrollDiff = scrollTop - this.lastScrollTop;

    // Adjust translateY and opacity based on scroll down
    if (scrollDiff > 0) {
      // User is scrolling down
      this.translateY = Math.min(100, this.translateY + scrollDiff); // Move down with a max limit of 100px
      this.opacity = Math.max(0, 1 - this.translateY / 100); // Gradually fade out, minimum opacity of 0
    } else {
      // User is scrolling up
      this.translateY = Math.max(0, this.translateY + scrollDiff); // Move up with a minimum of 0px
      this.opacity = Math.min(1, this.MaxOpacity - this.translateY / 100); // Gradually fade in, maximum opacity of 1
    }

    this.lastScrollTop = scrollTop;
  }

  share(){
    if (!this.cs) {
      console.warn('share blocked: current slide is not ready yet');
      return;
    }

    this.stopSlideAutoplay();
    const bigTitleLines = Array.isArray(this.cs?.title)
      ? this.cs.title
      : [`${this.cs?.title ?? ''}`];

    this.data.currentArticle = {
      small_title: this.cs.sub,
      big_title: bigTitleLines.join("\n"),
      big_title_lines: bigTitleLines,
      bg_image: this.slidesJsonData.bg_image,//'定格秋天.jpg',
      //min_height: "400px",
      //template: "slide"
    };
    //console.log(this.data.currentArticle)
    this.router.navigate(['/slide-share-preview']);
  }

  wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const lines = this.getLines(ctx, text, maxWidth);
    for (let i = 0; i < lines.length; i++) {
      ctx.strokeText(lines[i], x, y);
      ctx.fillText(lines[i], x, y);
      y += lineHeight;
    }
  }

  getLines(ctx: any, text: string, maxWidth: number) {
    if (!text) {
      return [];
    }

    const punctuationBreakChars = new Set(['，', '。', ',']);
    const lines: string[] = [];
    let currentLine = '';

    for (const char of text) {
      if (char === '\n') {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = '';
        continue;
      }

      if (char === ' ') {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = '';
        continue;
      }

      const candidateLine = currentLine + char;
      if (currentLine && ctx.measureText(candidateLine).width > maxWidth && !punctuationBreakChars.has(char)) {
        lines.push(currentLine.trim());
        currentLine = char;
      } else {
        currentLine = candidateLine;
      }

      if (punctuationBreakChars.has(char) && currentLine.trim()) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  }

}
