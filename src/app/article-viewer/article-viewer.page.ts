import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Location } from '@angular/common';
import { UiService } from 'src/app/ui.service';

@Component({
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.page.html',
  styleUrls: ['./article-viewer.page.scss'],
})
export class ArticleViewerPage {
  constructor(
    public data: DataService,
    private ui: UiService,
    private location: Location,
    private cdRef: ChangeDetectorRef
  ) {}

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


  defaultBgHeight:string|any;
  onScroll(event:any){
    if(this.data.currentArticle.template == 'text'){
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
