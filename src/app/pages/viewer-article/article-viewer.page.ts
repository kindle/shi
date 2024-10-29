import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.page.html',
  styleUrls: ['./article-viewer.page.scss'],
})
export class ArticleViewerPage {
  localFunData:any;
  constructor(
    public data: DataService,
    public ui: UiService,
    private location: Location,
    private cdRef: ChangeDetectorRef
  ) {
    this.localFunData = this.data.getFunData('article_'+data.currentArticle.big_title);
    console.log(data.currentArticle)
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

}
