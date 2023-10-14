import { Component, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { IonModal } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {


  musicStations = [
    //{alias:"唐诗三百首",text:"唐诗三百首",color:"rgb(215,86,137)",light:"rgb(215,86,137,60%)"},
    //{alias:"宋词三百首",text:"宋词三百首",color:"rgb(231,112,103)",light:"rgb(231,112,103,60%)"},
    {src:"assets/img/smart.jpg", alias:"山水",text:"山水",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},
    {src:"assets/img/smart.jpg", alias:"田园",text:"田园",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/smart.jpg", alias:"送别",text:"送别",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {src:"assets/img/smart.jpg", alias:"爱情",text:"爱情",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {src:"assets/img/smart.jpg", alias:"边塞",text:"边塞",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {src:"assets/img/smart.jpg", alias:"爱国",text:"爱国",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/smart.jpg", alias:"悼亡",text:"悼亡",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {src:"assets/img/smart.jpg", alias:"闺怨",text:"闺怨",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {src:"assets/img/smart.jpg", alias:"思乡",text:"思乡",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {src:"assets/img/smart.jpg", alias:"哲理",text:"哲理",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},
    {src:"assets/img/smart.jpg", alias:"怀古",text:"怀古",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/smart.jpg", alias:"羁旅",text:"羁旅",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {src:"assets/img/smart.jpg", alias:"咏物",text:"咏物",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {src:"assets/img/smart.jpg", alias:"励志",text:"励志",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {src:"assets/img/smart.jpg", alias:"讽刺",text:"讽刺",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {src:"assets/img/smart.jpg", alias:"赞美",text:"赞美",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    //{alias:"节气",text:"节气",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    //{alias:"赠答",text:"赠答",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
  ];
/*
  lakeStations = [
    {alias:"西湖",text:"西湖",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {alias:"洞庭湖",text:"洞庭湖",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {alias:"太湖",text:"太湖",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {alias:"长江",text:"长江",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {alias:"黄河",text:"黄河",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {alias:"钱塘江",text:"钱塘江",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
  ];
  */
/*
  hillStations = [
    {alias:"庐山",text:"庐山",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {alias:"衡山",text:"衡山",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},
    {alias:"泰山",text:"泰山",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    {alias:"华山",text:"华山",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {alias:"终南山",text:"终南山",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {alias:"九华山",text:"九华山",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {alias:"峨眉山",text:"峨眉山",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
  ];
  */
/*
  locationStations = [
    {alias:"岳阳楼",text:"岳阳楼",color:"rgb(255,222,194)",light:"rgb(255,222,194,60%)"},
    {alias:"滕王阁",text:"滕王阁",color:"rgb(205,238,240)",light:"rgb(205,238,240,60%)"},
    {alias:"黄鹤楼",text:"黄鹤楼",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
  ];
  */
/*
  thoughtStations = [
    {alias:"忧国忧民",text:"忧国忧民",color:"rgb(255,230,151)",light:"rgb(255,230,151,60%)"},
    {alias:"咏史怀古",text:"咏史怀古",color:"rgb(215,86,137)",light:"rgb(215,86,137,60%)"},
    {alias:"怀才不遇",text:"怀才不遇",color:"rgb(231,112,103)",light:"rgb(231,112,103,60%)"},
    {alias:"壮志未酬",text:"壮志未酬",color:"rgb(113,203,212)",light:"rgb(113,203,212,60%)"},
    {alias:"吊古伤今",text:"吊古伤今",color:"rgb(240,209,246)",light:"rgb(240,209,246,60%)"},
    
  ];
  */



  recentStations = [
    {src:"url('/assets/img/p1.jpg')",text:"我的跑步歌单",color:"rgb(247,54,65)"},
    {src:"url('/assets/img/p2.jpg')",text:"中文歌单",color:"rgb(119,117,118)"},
    {src:"url('/assets/img/p3.jpg')",text:"英文歌单",color:"rgb(73,71,64)"},
    {src:"url('/assets/img/p4.jpg')",text:"骑车",color:"rgb(138,132,124)"},
  ];

  styleStations = [
    {src:"url('/assets/img/p1.jpg')",text:"美到窒息的小众诗词，99%的人没读过",color:"rgb(66,81,181)"},
    {src:"url('/assets/img/p2.jpg')",text:"踩点 | 因为一句诗，想去一座城",color:"rgb(121,196,131)"},
    //{src:"url('/assets/img/p1.jpg')",text:"踩点|前方高能 让你欲罢不能的BGM",color:"rgb(66,81,181)"},
    //{src:"url('/assets/img/p2.jpg')",text:"英文跑步歌单，节奏感十足，来燃烧你的卡路里",color:"rgb(121,196,131)"},
    {src:"url('/assets/img/p3.jpg')",text:"快乐的歌，听起来很happy",color:"rgb(98,166,243)"},
    {src:"url('/assets/img/p4.jpg')",text:"热血BGM战斗开始",color:"rgb(232,188,78)"},

    {src:"url('/assets/img/p1.jpg')",text:"史诗级大气磅礴震撼心灵",color:"rgb(255,230,151)"},
    {src:"url('/assets/img/p2.jpg')",text:"欲罢不能的电音旋律",color:"rgb(255,222,194)"},
    {src:"url('/assets/img/p3.jpg')",text:"史诗背景般震撼、震爆低音炮",color:"rgb(205,238,240)"},
    {src:"url('/assets/img/p4.jpg')",text:"洗脑多巴胺，奇奇怪怪又可可爱爱",color:"rgb(240,209,246)"},
  ];

  lakeStations = [
    {src:"url('/assets/img/na.jpg')",text:"西湖",color:"rgb(121,196,131)"},
    {src:"url('/assets/img/na.jpg')",text:"洞庭湖",color:"rgb(98,166,243)"},
    {src:"url('/assets/img/na.jpg')",text:"太湖",color:"rgb(232,188,78)"},

    {src:"url('/assets/img/na.jpg')",text:"长江",color:"rgb(255,230,151)"},
    {src:"url('/assets/img/na.jpg')",text:"黄河",color:"rgb(255,222,194)"},
    {src:"url('/assets/img/na.jpg')",text:"钱塘江",color:"rgb(205,238,240)"},
  ];

  hillStations = [
    {src:"url('/assets/img/na.jpg')",text:"庐山",color:"rgb(255,230,151)"},
    {src:"url('/assets/img/na.jpg')",text:"衡山",color:"rgb(255,222,194)"},
    {src:"url('/assets/img/na.jpg')",text:"泰山",color:"rgb(205,238,240)"},
    {src:"url('/assets/img/na.jpg')",text:"华山",color:"rgb(240,209,246)"},
    {src:"url('/assets/img/na.jpg')",text:"终南山",color:"rgb(66,81,181)"},
    {src:"url('/assets/img/na.jpg')",text:"九华山",color:"rgb(121,196,131)"},
    {src:"url('/assets/img/na.jpg')",text:"峨眉山",color:"rgb(66,81,181)"},
  ];

  thoughtStations = [
    {src:"url('/assets/img/na.jpg')",text:"忧国忧民",color:"rgb(240,209,246)"},
    {src:"url('/assets/img/na.jpg')",text:"咏史怀古",color:"rgb(66,81,181)"},
    {src:"url('/assets/img/na.jpg')",text:"怀才不遇",color:"rgb(121,196,131)"},
    {src:"url('/assets/img/na.jpg')",text:"壮志未酬",color:"rgb(66,81,181)"},
    {src:"url('/assets/img/na.jpg')",text:"吊古伤今",color:"rgb(121,196,131)"},
  ];

  stations = [
    {name:"明星诗单", data: this.styleStations},
    {name:"热门诗单", data: this.lakeStations},
    {name:"流行诗单", data: this.hillStations},
    {name:"经典诗单", data: this.thoughtStations},
  ]

  search(key:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:key,
        type:'tag'
      }
    });
  }


  hotData:any;
  constructor(
    public data : DataService,
    private router: Router,
  ) {

  }


  goStyleStations(){

  }


  @ViewChild('modal', { static: true }) modal: IonModal|any;
  closeModal() {
    this.modal.dismiss();
  }
}
