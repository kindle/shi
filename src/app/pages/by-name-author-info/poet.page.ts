import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonContent } from '@ionic/angular';
import { DataService, ViewType } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-poet',
  templateUrl: './poet.page.html',
  styleUrls: ['./poet.page.scss'],
})
export class PoetPage {

  localJsonData:any;
  author:any;
  authorData:any;

  hotPoemByAuthor:any = [];
  getHotData(){
    this.hotPoemByAuthor = [];
    let result = this.localJsonData.filter((p:any)=>p.audio!=null);
    
    for (let i = 0; i < result.length; i += 4) {
      const subArray = result.slice(i, i + 4);
      this.hotPoemByAuthor.push(subArray);
    }
  }

  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}


  ionViewWillEnter() {
    //this.defaultBgHeight = "350px";
    this.author = this.activatedRoute.snapshot.paramMap.get('author');
    this.localJsonData = this.data.JsonData
      .filter((shici:any)=>shici.author===this.author);
    let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name===this.author);
    if(foundAuthor.length>=1)
      this.authorData = foundAuthor[0];


    this.onSearchChanged();

    this.getHotData();
  }

  getUrl(){
    return `https://reddah.blob.core.windows.net/msjjpoet/${this.author}.jpeg`
  }

  getShareUrl(){
    return `https://reddah.blob.core.windows.net/msjjpoet/${this.author}.jpeg`
  }





  @ViewChild('pageTop') pageTop: IonContent | any;
  searchResult:any;
  searchResultCount=0;
  localList:any;
  searchText:any;
  showFilter = false;
  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
  }
  onSearchChanged(){
    let key = "";
    if(this.searchText!=null){
      key = this.searchText.trim();
    }

    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');

    if(key.length==0){
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(key)>=0
      );
    }
    else{
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(keys[0])>=0
      );
      if(keys.length>1){
        this.searchResult = this.searchResult.filter((e:any)=>
          (e.text).indexOf(keys[1])>=0
        );
        // console.log(this.searchResult);
        if(keys.length>2){
          this.searchResult = this.searchResult.filter((e:any)=>
            (e.text).indexOf(keys[2])>=0
          );

          if(keys.length>3){
            this.searchResult = this.searchResult.filter((e:any)=>
              (e.text).indexOf(keys[3])>=0
            );
            
            if(keys.length>4){
              this.searchResult = this.searchResult.filter((e:any)=>
                (e.text).indexOf(keys[4])>=0
              );
            }
          }
        }
      }
    }
    this.searchResultCount = this.searchResult.length;
// console.log(this.searchResultCount);
    this.displayResult = [];
    this.generateItems();
    //this.pageTop.scrollToTop();
  }


  
  displayResult:any = [];
  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,100))
    );
  }

  onIonInfinite(ev:any) {
    this.generateItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 200);
  }



  defaultBgHeight:string|any;
  min_height:any = "350px";
  onScroll(event:any){
    let offset = event.detail.scrollTop;

    if(offset<=0){
      this.defaultBgHeight = (this.min_height.replace("px","") - offset)+"px";
    }else{
      this.defaultBgHeight = this.min_height;
    }

    //bug fix for navigating back from other pages
    this.cdRef.detectChanges();
  }


  shareArticle(){
    const bgUrl = this.getUrl();
    
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
    ]).then(([bgImg, iconImg, qrImg]) => {
      const canvas = document.createElement("canvas");
      const footerHeight = bgImg.width * 0.2; // Footer height is 20% of image width
      canvas.width = bgImg.width;
      canvas.height = bgImg.height + footerHeight;
      const ctx = canvas.getContext("2d");
      
      if(ctx){
        // Draw Background Color
        ctx.fillStyle = this.data.getbgcolor();
        ctx.fillRect(0, 0, canvas.width, bgImg.height);

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

        // --- Content Drawing Over Background Image ---
        
        // Common settings for text
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";

        const x = 40;
        let y = 40;
        const maxWidth = canvas.width * 0.5; // Use 50% width

        const bigTitle = this.authorData ? this.authorData.name : this.author;
        const smallTitle = this.authorData ? this.authorData.desc : "";

        // Draw Big Title (Author Name)
        const bigFontSize = Math.floor(canvas.width / 15);
        ctx.font = `bold ${bigFontSize}px Arial`;
        ctx.lineWidth = 5;
        this.wrapText(ctx, bigTitle, x, y, maxWidth, bigFontSize * 1.4);

        try {
          const dataUrl = canvas.toDataURL("image/png");
          this.shareDataUrl(dataUrl, bigTitle, smallTitle);
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

  private async shareDataUrl(dataUrl: string, title: string, text: string) {
    if (this.data.isHybrid()) {
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const savedFile = await Filesystem.writeFile({
        path: `${title}.png`,
        data: base64Data,
        directory: Directory.Cache
      });
      await Share.share({
        title,
        text,
        files: [savedFile.uri],
        dialogTitle: title
      });
      return;
    }

    await Share.share({
      title,
      text,
      url: 'https://reddah.com',
      dialogTitle: title
    });
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
