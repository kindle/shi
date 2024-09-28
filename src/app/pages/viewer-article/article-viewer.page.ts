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
  }

}
