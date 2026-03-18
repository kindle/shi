import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { NavController } from '@ionic/angular';
import { UiService } from '../../services/ui.service';

import domtoimage from 'dom-to-image';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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

  cs:any = null;

  slideAutoplay = {
    delay: 5000,
    disableOnInteraction: false,
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

    const routeId = this.activatedRoute.snapshot.queryParams['id'];
    if (routeId !== undefined && routeId !== null && routeId !== '') {
      this.id = routeId;
    }
    //console.log('SlidePage ionViewWillEnter:'+this.id);

    if (this.loadedSlideId === this.id && this.slidesJsonData?.slides?.length) {
      this.restoreCurrentSlideFromIndex();
      this.startSlideAutoplay();
      return;
    }

    // When navigating back from nested routes, query params may be absent.
    // Reuse already loaded data instead of resetting cs to null.
    if (!this.id && this.slidesJsonData?.slides?.length) {
      this.restoreCurrentSlideFromIndex();
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
      //console.log('Slides data loaded for id:', this.id);

      this.ngZone.run(() => {
        this.slidesJsonData = data;
        this.loadedSlideId = this.id;
        this.currentSlideIndex = 0;
        this.cs = this.slidesJsonData.slides[0];
        console.log('Initial slide set. Starting autoplay.');
        console.log(this.cs);
        this.userPausedAutoplay = false;
        this.startSlideAutoplay();

        this.audio = new Audio(this.slidesJsonData.music);
        this.audio.loop = true;
        this.audio.play();
      });
    });
    
  }

  ionViewDidEnter() {
    //console.log('SlidePage ionViewDidEnter');
    if (!this.cs && this.slidesJsonData?.slides?.length) {
      this.cs = this.slidesJsonData.slides[0];
    }
    this.startSlideAutoplay();
  }

  ionViewWillLeave(){
    this.ui.showStatusBar();
    //console.log('SlidePage ionViewWillLeave');
    this.audio?.pause();
    this.slideSwiper?.nativeElement?.swiper?.autoplay?.stop();
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

    const rawIndex = typeof swiper.realIndex === 'number'
      ? swiper.realIndex
      : swiper.activeIndex;
    const safeIndex = ((rawIndex % slides.length) + slides.length) % slides.length;

    this.ngZone.run(() => {
      this.currentSlideIndex = safeIndex;
      this.cs = slides[safeIndex];
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
    console.log(this.cs);
    this.data.currentArticle = {
      big_title: this.cs.title.join("\n"),
      bg_image: '定格秋天.jpg',
      small_title: this.cs.sub,
      min_height: "400px",
      template: "slide"
    };
    const currentFontFamilyName = this.data.getCurrentFontFamilyName();

    const bgUrl = 'https://reddah.blob.core.windows.net/msjjimg/' + this.data.currentArticle.bg_image;
    
    const loadImage = (src: string, isCors = false) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        if(isCors) img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });
    };

    Promise.all([
      loadImage(bgUrl, true),
      loadImage('assets/icon/favicon.png'),
      loadImage('assets/icon/shi-qr.png')
    ]).then(async ([bgImg, iconImg, qrImg]) => {
      const canvas = document.createElement("canvas");
      const canvasWidth = bgImg.width;
      const targetHeight = Math.round(canvasWidth * 5 / 4); // Keep final image near 4:5 aspect ratio
      const footerHeight = Math.round(canvasWidth * 0.2);
      const mainHeight = Math.max(1, targetHeight - footerHeight);
      canvas.width = canvasWidth;
      canvas.height = mainHeight + footerHeight;
      const ctx = canvas.getContext("2d");
      
      if(ctx){
        // Draw background using cover strategy to avoid very tall/narrow outputs.
        const bgScale = Math.max(canvas.width / bgImg.width, mainHeight / bgImg.height);
        const bgDrawWidth = bgImg.width * bgScale;
        const bgDrawHeight = bgImg.height * bgScale;
        const bgOffsetX = (canvas.width - bgDrawWidth) / 2;
        const bgOffsetY = (mainHeight - bgDrawHeight) / 2;
        ctx.drawImage(bgImg, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);

        // Draw Footer Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, mainHeight, canvas.width, footerHeight);

        // Footer Settings
        const padding = footerHeight * 0.1;
        const usefulFooterHeight = footerHeight - 2 * padding;
        
        // Draw Icon (Left)
        // Check aspect ratio to fit within square
        const iconRatio = iconImg.width / iconImg.height;
        let iconW = usefulFooterHeight * iconRatio;
        let iconH = usefulFooterHeight;
        if(iconW > usefulFooterHeight) {
            iconW = usefulFooterHeight;
            iconH = usefulFooterHeight / iconRatio;
        }
        ctx.drawImage(iconImg, padding, mainHeight + padding + (usefulFooterHeight - iconH)/2, iconW, iconH);

        // Draw QR Code (Right)
        const qrRatio = qrImg.width / qrImg.height;
        let qrW = usefulFooterHeight * qrRatio;
        let qrH = usefulFooterHeight;
        if(qrW > usefulFooterHeight) {
            qrW = usefulFooterHeight;
            qrH = usefulFooterHeight / qrRatio;
        }
        ctx.drawImage(qrImg, canvas.width - qrW - padding, mainHeight + padding + (usefulFooterHeight - qrH)/2, qrW, qrH);

        // Draw Text (Center Left)
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        
        const textStartX = padding + iconW + padding; // specific padding logic
        const textCenterY = mainHeight + footerHeight / 2;

        const titleFontSize = Math.floor(footerHeight * 0.3);
        ctx.font = `bold ${titleFontSize}px "${currentFontFamilyName}", sans-serif`;
        ctx.fillText('名诗佳句', textStartX, textCenterY - titleFontSize * 0.6);

        const subTitleFontSize = Math.floor(footerHeight * 0.2);
        ctx.font = `normal ${subTitleFontSize}px "${currentFontFamilyName}", sans-serif`;
        ctx.fillStyle = "#666666";
        ctx.fillText('长按识别二维码免费获取', textStartX, textCenterY + subTitleFontSize * 0.8);

        // --- Original Content Drawing Over Background Image ---
        // Restore context settings for article text if needed
        // Since we are drawing on top of bgImg, we use same coords as before
        
        // Common settings for article text
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";

        const x = 40;
        let y = 40;
        const maxWidth = canvas.width * 0.5; // Use 50% width to keep left and avoid center

        // Draw Small Title
        if (this.data.currentArticle.small_title) {
          const smallFontSize = Math.floor(canvas.width / 25);
          ctx.font = `bold ${smallFontSize}px "${currentFontFamilyName}", sans-serif`;
          ctx.lineWidth = 3;
          const smallTitleText = this.data.currentArticle.small_title;
          ctx.strokeText(smallTitleText, x, y);
          ctx.fillText(smallTitleText, x, y);
          y += smallFontSize * 1.4 + 20;
        }

        // Draw Big Title
        const bigFontSize = Math.floor(canvas.width / 15);
        ctx.font = `bold ${bigFontSize}px "${currentFontFamilyName}", sans-serif`;
        ctx.lineWidth = 5;
        const bigTitleLines = Array.isArray(this.cs?.title)
          ? this.cs.title
          : [this.data.currentArticle.big_title];
        const bigTitleLineHeight = bigFontSize * 1.4;

        for (const line of bigTitleLines) {
          const text = `${line ?? ''}`.trim();
          if (!text) {
            continue;
          }
          ctx.strokeText(text, x, y);
          ctx.fillText(text, x, y);
          y += bigTitleLineHeight;
        }

        try {
          const dataUrl = canvas.toDataURL("image/png");

          if(this.data.isHybrid()){
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            // const fileName = this.data.currentArticle.big_title+" "
            //   + this.data.currentArticle.small_title+" "
            //   + ".png";
              //+ new Date().getTime() + '.png';
            const fileName = this.data.currentArticle.small_title + ".png";//ios share preview title on the right, left is image.
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Cache
            });
            await Share.share({
              title: this.data.currentArticle.big_title,
              text: this.data.currentArticle.small_title,
              files: [savedFile.uri],
              dialogTitle: this.data.currentArticle.big_title
            });
          }
          else{
            this.ui.share(
              dataUrl, 
              this.data.currentArticle.big_title, 
              this.data.currentArticle.small_title, 
              'https://reddah.com'
            );
          }

        } catch (e) {
          console.error("Canvas taint or error", e);
        }
      }
    }).catch(err => {
        console.error("Failed to load images for sharing", err);
    });
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
