import { Component, OnInit, ViewChild } from '@angular/core';
import { Animation, Style } from '@capacitor/status-bar';
import { DataService } from '../../services/data.service';
import { UiService } from '../../services/ui.service';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-history-today',
  templateUrl: './history-today.page.html',
  styleUrls: ['./history-today.page.scss'],
})
export class HistoryTodayPage implements OnInit {

  todayCard;

  constructor(
    private data: DataService,
    public ui: UiService,
  ) { 
    let eventDate = this.data.getLocalISOString(new Date());
    this.todayCard = Array.from(eventDate.split('T')[0]);

  }

  ngOnInit() {
  }

  historyToday:any;
  ionViewWillEnter() {
    this.ui.setStatusBar(Style.Light,Animation.Slide,"#ffffff");

    let month = this.todayCard[5]+this.todayCard[6];//e.g.:"01"
    let date = month+this.todayCard[8]+this.todayCard[9];//e.g.:"0101"

    //test
    //month="12"
    //date="1204"

    this.data.getTodayHistory(month).then((result) => {
      this.historyToday=result.filter((r:any)=>r.key==date)
        .sort((a:any,b:any)=> {
          const yearA = parseInt(a.year);
          const yearB = parseInt(b.year);
          return yearB - yearA;
        });
    });
  }


  share(){
    const historyBlock:any = document.getElementById("print-wrapper-history");
    const todayBlock:any = document.getElementById("print-wrapper-today");
    
    // Capture History Block
    const historyOptions = { 
      background: "white", 
      width: historyBlock.clientWidth, 
      height: historyBlock.clientHeight 
    };

    // Capture Today Block
    // Use history block width to match width
    const todayOptions = { 
        bgcolor: "white", 
        width: historyBlock.clientWidth, // Match history width
        height: todayBlock.clientHeight,
        style: {
            'background-color': 'white',
            'margin': '0',
            'border-radius': '0',
            'width': '100%',
            'justify-content': 'center' // Ensure content centers
        }
    };
    
    Promise.all([
      domtoimage.toPng(todayBlock, todayOptions),
      domtoimage.toPng(historyBlock, historyOptions)
    ]).then(([todayDataUrl, hisDataUrl]) => {
      
      var todayImage = new Image();
      todayImage.src = todayDataUrl;

      var hisImage = new Image();
      hisImage.src = hisDataUrl;

      // Ensure both images are loaded before initializing canvas
      let loadedCount = 0;
      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
           // Pass both images and their dimensions to initCanvas
           // Height is sum of both + maybe some spacing. Width is max of both.
           const totalWidth = Math.max(todayOptions.width, historyOptions.width);
           const totalHeight = todayOptions.height + historyOptions.height;
           
           this.initCanvas(todayImage, hisImage, totalWidth, totalHeight, todayOptions, historyOptions);
        }
      };

      todayImage.onload = onImageLoad;
      hisImage.onload = onImageLoad;
    });

  }

  initCanvas(todayImg:any, hisImg:any, totalWidth:any, totalHeight:any, todayOptions:any, hisOptions:any){
    let canvas = document.createElement("canvas");
    canvas.width=totalWidth+20;
    //20 margin
    //50 header text
    //120 footer
    canvas.height=totalHeight+20+50+120 + 20; // +20 spacing between blocks
  
    let bgImage = new Image();
    bgImage.src = './assets/viewer-bg.jpg';
    let ctx:any = canvas.getContext('2d');

    bgImage.onload = () => {
      ctx.drawImage(bgImage,0,0, totalWidth+20, canvas.height);
      
      // Draw Today Block (Centered)
      // Calculate x offset to center the image if it's smaller than totalWidth
      const todayX = 10 + (totalWidth - todayOptions.width) / 2;
      ctx.drawImage(todayImg, todayX, 10+50, todayOptions.width, todayOptions.height);
      
      // Draw History Block under Today Block with 20px spacing
      // Assuming history block is the wider one or same width, but let's center it too just in case
      const hisX = 10 + (totalWidth - hisOptions.width) / 2;
      ctx.drawImage(hisImg, hisX, 10+50+todayOptions.height+20, hisOptions.width, hisOptions.height);

      // ctx.font = "30px Arial";
      // ctx.fillStyle = "#B08950";
      ctx.textAlign = "center";
      ctx.font = 'Bold 30px Sans-Serif';
      // ctx.strokeText(
      //   "名诗佳句·Apppoetry",
      //   //this.ui.instant('History.Title'),//'历史上的今天', 
      //   canvas.width/2, 40);
      // ctx.fillText(
      //   "名诗佳句·Apppoetry",
      //   //this.ui.instant('History.Title'), //"历史上的今天", 
      //   canvas.width/2, 40);
      ctx.fillStyle = "#333333";
      ctx.fillText(
        "名诗佳句·Appoetry",
        canvas.width/2, 40); 

      const footerY = canvas.height - 120; // Correct footer position

      // Load Icon
      const iconImg = new Image();
      iconImg.src = 'assets/icon/favicon.png';
      iconImg.onload = () => {
        // Draw Icon (Left)
        // Adjust size/position as needed. Assuming 80x80 for icon
        ctx.drawImage(iconImg, 20, footerY + 20, 80, 80);

        // Load QR Code
        const qrImg = new Image();
        qrImg.src = 'assets/icon/shi-qr.png';
        qrImg.onload = () => {
           // Draw QR Code (Right)
           // Assuming 80x80 for QR
           ctx.drawImage(qrImg, canvas.width - 100, footerY + 20, 80, 80);

           // Draw Text (Middle)
           ctx.textAlign = "left";
           
           // First line: 名诗佳句
           ctx.font = "Bold 24px Arial";
           ctx.fillStyle = "#333333";
           ctx.fillText(this.ui.instant('Title.App'), 120, footerY + 55); 
           //ctx.fillText("名诗佳句·Appoetry", 120, footerY + 55); 
           // Or hardcoded: ctx.fillText("名诗佳句", 120, footerY + 55);

           // Second line: 长按识别二维码免费获取
           ctx.font = "16px Arial";
           ctx.fillStyle = "#666666";
           ctx.fillText("长按识别二维码免费获取", 120, footerY + 85);

           let dataUrl=canvas.toDataURL();
           console.log(dataUrl);
     
           var img1 = new Image();
           img1.src = dataUrl;
           //document.body.appendChild(img1);
     
           this.ui.share(
             dataUrl, 
             this.ui.instant('History.Title'), //'历史上的今天', 
             '看看历史上的今天发生了什么有趣的事情吧！', 
             'https://reddah.com');
        }
      }
    }

  }

}
