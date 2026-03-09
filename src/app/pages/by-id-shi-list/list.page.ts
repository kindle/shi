import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { ActivatedRoute } from '@angular/router';
import { ScrollDetail } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage {

  localList:any;
  searchText:any="";
  showFilter = false;

  isSearchbarVisible = true;
  lastScrollTop = 0;

  handleScroll(ev: CustomEvent<ScrollDetail>) {
    const scrollTop = ev.detail.scrollTop;
    
    // Only trigger if we've scrolled a bit to avoid jitter at the top
    if (scrollTop < 0) return;

    if (scrollTop > this.lastScrollTop && scrollTop > 10) {
      // Scrolling down and past the initial header area
      this.isSearchbarVisible = false;
    } else if (scrollTop < this.lastScrollTop) {
      // Scrolling up
      this.isSearchbarVisible = true;
    }
    
    this.lastScrollTop = scrollTop;
  }

  onSearchFocus(){
    this.showFilter = true;
  }
  onSearchCancel(){
    this.showFilter = false;
    this.localList = this.listdata.list;
  }
  onClearMic(){
    if(this.searchText.trim()=="")
    {
      this.showFilter = false;
    }
  }
  onLoseFocus(){
    if(this.searchText.trim()=="")
    {
      this.showFilter = false;
    }
  }
  onSearchChanged(){
    let key = this.searchText.trim();
    /*
    if(key==""){
      this.localList = this.listdata.list;
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample).indexOf(key)>=0
      );
    }*/

    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');

    if(key.length==0){
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(key)>=0
      );
    }
    else{
      this.localList = this.listdata.list.filter((e:any)=>
        (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(key[0])>=0
      );
      if(keys.length>1){
        this.localList = this.localList.filter((e:any)=>
          (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[1])>=0
        );
        if(keys.length>2){
          this.localList = this.localList.filter((e:any)=>
            (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[2])>=0
          );

          if(keys.length>3){
            this.localList = this.localList.filter((e:any)=>
              (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[3])>=0
            );
            
            if(keys.length>4){
              this.localList = this.localList.filter((e:any)=>
                (e.title+e.author+e.sample+(e.paragraphs?e.paragraphs.join('_'): '')).indexOf(keys[4])>=0
              );
            }
          }
        }
      }
    }
  }

  listdata:any;
  poets:any;
  guesslikelist:any=[];

  constructor(
    public data: DataService,
    public ui: UiService,
    private activatedRoute: ActivatedRoute,
  ) { }

  id:any;
  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.listdata = this.data.poemListData.filter((e:any)=>e.id==this.id)[0];
    //console.log(this.data.poemListData)
    this.localList = this.listdata.list;
    if(this.listdata.guesslike){
      this.guesslikelist = this.listdata.guesslike.map((gid:any)=>
        this.data.poemListData.filter((e:any)=>e.id==gid)[0]
      );
      //console.log(this.guesslikelist)
    }
    // Convert to Set to remove duplicates
    const authorSet = new Set(this.listdata.list.map((item:any) => item.author)); 
    // Convert back to an array
    this.poets = [...authorSet]; 
    //update audio info.
    this.CheckIsPlayList();

    this.data.addTracker({name:"ReadList", data:{id:this.id}});
    //console.log(this.listdata);
  }

  noAudio:any = true;
  CheckIsPlayList(){
    this.localList.forEach((poem:any) => {
      let fullData = this.data.JsonData.filter((j:any)=>j.id===poem.id)[0];
      if(fullData.audio!=null){
        poem.audio = fullData.audio;
        this.noAudio = false;
      }
    });
  }

  shareArticle(){
    const bgUrl = this.listdata.image;
    
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
        ctx.fillStyle = this.listdata.color ? this.listdata.color : this.data.getbgcolor();
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

        
        const bigTitle = this.listdata.name || this.listdata.sub;
        const smallTitle = this.listdata.name ? this.listdata.sub : "";

        // Draw Small Title
        if (smallTitle) {
          const smallFontSize = Math.floor(canvas.width / 25);
          ctx.font = `bold ${smallFontSize}px Arial`;
          ctx.lineWidth = 3;
          this.wrapText(ctx, smallTitle, x, y, maxWidth, smallFontSize * 1.4);
          const lines = this.getLines(ctx, smallTitle, maxWidth);
          y += lines.length * (smallFontSize * 1.4) + 20;
        }

        // Draw Big Title
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
