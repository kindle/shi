import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { UiService } from '../services/ui.service';
import { ScrollService } from '../services/scroll.service';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  searchTopicData:any;
  searchTopicDataAudio:any;
  localFunData:any;
  localScrollData:any;
  
  constructor(
    public data : DataService,
    public ui: UiService,
    private scrollService: ScrollService,
    private elementRef: ElementRef,
  ) {
    this.data.currentTopicId = 200;
    this.searchTopicData = this.data.tab2BrowseTopicData
      .filter((d:any)=>d.id==this.data.currentTopicId)[0];


    this.searchTopicDataAudio = this.data.tab5RadioTopicData
      .filter((d:any)=>d.id==199)[0];
    //regenerate top 5 big
    this.searchTopicDataAudio.scroll = this.data.getRandomArray(this.searchTopicDataAudio.scroll, 5);
    //regenerate top 5 latest albums
    //console.log(this.searchTopicData.list[0])
    this.searchTopicDataAudio.list[0].data = this.data.getRandomArray(this.searchTopicDataAudio.list[0].data, 5);



    /*
    打印classic.json  有audio的诗词
    console.log('test data:')
    let classic:any = [];
    let test = this.data.JsonData.filter((d:any)=>d.audio!=null);
    test.forEach((e:any) => {
      let sample = e.paragraphs[0];
      if(sample.charAt(sample.length-1)=='。'||sample.charAt(sample.length-1)=='，')
      {
        sample = sample.substring(0, sample.length - 1);
      }
      classic.push({
        "title":e.title,
        "author":e.author,
        "sample":sample,
        "id":e.id
      })
    });
    console.log(JSON.stringify(classic));
    //https://www.sojson.com/
    */

    /*
    //打印hot.json  没有audio的唐诗 宋词三百首
    console.log('test data:')
    let hotdata:any = [];
    let test = this.data.JsonData.filter((d:any)=>d.audio==null&&d.id!=null&&
    //  d.tags.includes('唐诗三百首'));
    d.tags.includes('宋词三百首'));
    test.forEach((e:any) => {
      let sample = e.paragraphs[0];
      if(sample.charAt(sample.length-1)=='。'||sample.charAt(sample.length-1)=='，')
      {
        sample = sample.substring(0, sample.length - 1);
      }
      hotdata.push({
        "title":e.title,
        "author":e.author,
        "sample":sample,
        "id":e.id
      })
    });
    console.log(JSON.stringify(hotdata));
    //https://www.sojson.com/
    */
  }

  @ViewChild(IonContent, { static: false }) content: IonContent|any;
  private scrollSubscription: Subscription|any;
  ngOnInit(){
    this.scrollSubscription = this.scrollService.scrollToTop$.subscribe(() => {
      if (this.content) {
        this.content.scrollToTop(300);
      }
    });
  }

  async scrollToIntroBottom(): Promise<void> {
    if (!this.content) {
      return;
    }

    await this.content.scrollToBottom(500);
  }

  ionViewDidEnter() {
    this.refreshSwipers();
  }

  private refreshSwipers() {
    const update = () => {
      const swiperElements = this.elementRef.nativeElement.querySelectorAll('swiper-container');
      swiperElements.forEach((swiperElement:any) => {
        const swiper = swiperElement.swiper;
        if (!swiper) {
          return;
        }

        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();
        swiper.update();
      });
    };

    requestAnimationFrame(() => {
      update();
      setTimeout(update, 60);
    });
  }

  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }
}
