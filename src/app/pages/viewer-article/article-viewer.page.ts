import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';
import { UiService } from 'src/app/services/ui.service';
import domtoimage from 'dom-to-image';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.page.html',
  styleUrls: ['./article-viewer.page.scss'],
})
export class ArticleViewerPage {
  @ViewChild('printArticleViewer', { read: ElementRef }) printArticleViewer: ElementRef | undefined;

  localFunData:any;
  constructor(
    public data: DataService,
    public ui: UiService,
    private location: Location,
    private cdRef: ChangeDetectorRef,
    private router: Router,
  ) {
    this.localFunData = this.data.getFunData('article_'+data.currentArticle.big_title);
    console.log(this.localFunData)
    //console.log(this.data.currentArticle)
    //data.clearFunDataCache();
    this.data.addTracker({name:"ReadArticle", data:{id:this.data.currentArticle.id}});
  }

  gridopt={
    rows: 3,
    fill: "row"
  }
  autoplayopt={
    delay: 0,
    disableOnInteraction: true,
  }

  goback(){
   this.location.back();
  }

  ionViewWillEnter() {
    this.ui.hideStatusBar();
    this.defaultBgHeight = this.data.currentArticle.min_height;
  }

  ionViewWillLeave() {
    this.ui.showStatusBar();
  }

  hiddenThumbnails = new Set();
  onImageError(item: any) {
    //this.hiddenThumbnails.add(item.author);  
  }
  isThumbnailHidden(itemId: any): boolean {
    return this.hiddenThumbnails.has(itemId);
  }

  defaultBgHeight:string|any;
  onScroll(event:any){
    if(this.data.currentArticle.template == 'text'||
    this.data.currentArticle.template == 'group'){
      let offset = event.detail.scrollTop;

      if(offset<=0){
        this.defaultBgHeight = (this.data.currentArticle.min_height.replace("px","") - offset)+"px";
      }else{
        this.defaultBgHeight = this.data.currentArticle.min_height;
      }

      //bug fix for navigating back from other pages
      this.cdRef.detectChanges();
    }

    this.onScrollFloatingDiv(event);
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


  shareArticle(){
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
      const footerHeight = bgImg.width * 0.2; // Footer height is 20% of image width
      canvas.width = bgImg.width;
      canvas.height = bgImg.height + footerHeight;
      const ctx = canvas.getContext("2d");
      
      if(ctx){
        // Draw Background Image
        ctx.drawImage(bgImg, 0, 0);

        // Draw Footer Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, bgImg.height, canvas.width, footerHeight);

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
        ctx.drawImage(iconImg, padding, bgImg.height + padding + (usefulFooterHeight - iconH)/2, iconW, iconH);

        // Draw QR Code (Right)
        const qrRatio = qrImg.width / qrImg.height;
        let qrW = usefulFooterHeight * qrRatio;
        let qrH = usefulFooterHeight;
        if(qrW > usefulFooterHeight) {
            qrW = usefulFooterHeight;
            qrH = usefulFooterHeight / qrRatio;
        }
        ctx.drawImage(qrImg, canvas.width - qrW - padding, bgImg.height + padding + (usefulFooterHeight - qrH)/2, qrW, qrH);

        // Draw Text (Center Left)
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        
        const textStartX = padding + iconW + padding; // specific padding logic
        const textCenterY = bgImg.height + footerHeight / 2;

        const titleFontSize = Math.floor(footerHeight * 0.3);
        ctx.font = `bold ${titleFontSize}px Arial`;
        ctx.fillText('名诗佳句', textStartX, textCenterY - titleFontSize * 0.6);

        const subTitleFontSize = Math.floor(footerHeight * 0.2);
        ctx.font = `normal ${subTitleFontSize}px Arial`;
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
          ctx.font = `bold ${smallFontSize}px Arial`;
          ctx.lineWidth = 3;
          this.wrapText(ctx, this.data.currentArticle.small_title, x, y, maxWidth, smallFontSize * 1.4);
          const lines = this.getLines(ctx, this.data.currentArticle.small_title, maxWidth);
          y += lines.length * (smallFontSize * 1.4) + 20;
        }

        // Draw Big Title
        const bigFontSize = Math.floor(canvas.width / 15);
        ctx.font = `bold ${bigFontSize}px Arial`;
        ctx.lineWidth = 5;
        this.wrapText(ctx, this.data.currentArticle.big_title, x, y, maxWidth, bigFontSize * 1.4);

        try {
          const dataUrl = canvas.toDataURL("image/png");

          if(this.data.isHybrid()){
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            const fileName = this.data.currentArticle.big_title+" "
              + this.data.currentArticle.small_title+" "
              + ".png";
              //+ new Date().getTime() + '.png';
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
    const words = text.split(''); // Split by char for better CJK support
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + word).width;
        if (width < maxWidth) {
            currentLine += word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
  }


  share(poem?: any){
    if(poem)//share poem
    {
      this.data.shareText(
        poem.author + "《" + poem.title + "》",
        this.data.showsample(poem),
        '',
        'https://reddah.blob.core.windows.net/msjjimg/' + this.data.currentArticle.bg_image
      );
    }
    else //share article
    {
      this.router.navigate(['/slide-share-preview']);
    }
  }
}
