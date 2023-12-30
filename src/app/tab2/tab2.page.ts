import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  searchTopicData:any;
  localFunData:any;
  localScrollData:any;
  
  constructor(
    public data : DataService,
    public ui: UiService,
  ) {
    this.data.currentTopicId = 200;
    this.searchTopicData = this.data.tab2BrowseTopicData
      .filter((d:any)=>d.id==this.data.currentTopicId)[0];

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
}
