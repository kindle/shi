import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';
import { UiService } from 'src/app/services/ui.service';
import domtoimage from 'dom-to-image';

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
    private cdRef: ChangeDetectorRef
  ) {
    this.localFunData = this.data.getFunData('article_'+data.currentArticle.big_title);
    //console.log(data.currentArticle)
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
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = bgUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if(ctx){
        ctx.drawImage(img, 0, 0);

        // Common settings
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
          // Estimate height used by small title to push big title down
          // Simple estimation: count lines
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
          this.ui.share(
            dataUrl, 
            this.data.currentArticle.big_title, 
            this.data.currentArticle.small_title, 
            'https://reddah.com'
          );
        } catch (e) {
          console.error("Canvas taint or error", e);
        }
      }
    };
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
}
