import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../data.service';
import { IonModal } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.page.html',
  styleUrls: ['./topic.page.scss'],
})
export class TopicPage implements OnInit {

  searchTopicData:any;
  
  constructor(
    public data : DataService,
    private router: Router,
  ) {
    console.log("tab4/topic:"+this.data.JsonData.length)
    this.searchTopicData = this.data.searchTopicData.filter((d:any)=>d.id==this.data.currentTopicId)[0];
  }

  /*
  recentStations = [
    {src:"/assets/img/p1.jpg",text:"我的跑步歌单",color:"rgb(247,54,65)"},
    {src:"/assets/img/p2.jpg",text:"中文歌单",color:"rgb(119,117,118)"},
    {src:"/assets/img/p3.jpg",text:"英文歌单",color:"rgb(73,71,64)"},
    {src:"/assets/img/p4.jpg",text:"骑车",color:"rgb(138,132,124)"},
  ];

  styleStations = [
    {src:"/assets/img/p1.jpg",text:"美到窒息的小众诗词，99%的人没读过",color:"rgb(66,81,181)", id:1},
    {src:"/assets/img/p2.jpg",text:"踩点 | 因为一句诗，想去一座城",color:"rgb(121,196,131)", id:2},
    //{src:"/assets/img/p1.jpg",text:"踩点|前方高能 让你欲罢不能的BGM",color:"rgb(66,81,181)"},
    //{src:"/assets/img/p2.jpg",text:"英文跑步歌单，节奏感十足，来燃烧你的卡路里",color:"rgb(121,196,131)"},
    {src:"/assets/img/p3.jpg",text:"快乐的歌，听起来很happy",color:"rgb(98,166,243)", id:3},
    {src:"/assets/img/p4.jpg",text:"热血BGM战斗开始",color:"rgb(232,188,78)", id:4},

    {src:"/assets/img/p1.jpg",text:"史诗级大气磅礴震撼心灵",color:"rgb(255,230,151)", id:5},
    {src:"/assets/img/p2.jpg",text:"欲罢不能的电音旋律",color:"rgb(255,222,194)", id:6},
    {src:"/assets/img/p3.jpg",text:"史诗背景般震撼、震爆低音炮",color:"rgb(205,238,240)", id:7},
    {src:"/assets/img/p4.jpg",text:"洗脑多巴胺，奇奇怪怪又可可爱爱",color:"rgb(240,209,246)", id:8},
  ];

  lakeStations = [
    {src:"/assets/img/齐白石虫1.jpg","display":"cover",text:"西湖",color:"rgb(121,196,131)"},
    {src:"/assets/img/齐白石虫2.jpg","display":"cover",text:"洞庭湖",color:"rgb(98,166,243)"},
    {src:"/assets/img/齐白石虫3.jpg","display":"cover",text:"太湖",color:"rgb(232,188,78)"},

    {src:"/assets/img/齐白石虫4.jpg","display":"cover",text:"长江",color:"rgb(255,230,151)"},
    {src:"/assets/img/齐白石虫1.jpg","display":"cover",text:"黄河",color:"rgb(255,222,194)"},
    {src:"/assets/img/齐白石虫2.jpg","display":"cover",text:"钱塘江",color:"rgb(205,238,240)"},
  ];

  hillStations = [
    {src:"/assets/img/齐白石1.jpg","display":"cover",text:"庐山",color:"rgb(255,230,151)"},
    {src:"/assets/img/齐白石2.jpg","display":"cover",text:"衡山",color:"rgb(255,222,194)"},
    {src:"/assets/img/齐白石3.jpg","display":"cover",text:"泰山",color:"rgb(205,238,240)"},
    {src:"/assets/img/齐白石4.jpg","display":"cover",text:"华山",color:"rgb(240,209,246)"},
    {src:"/assets/img/齐白石5.jpg","display":"cover",text:"终南山",color:"rgb(66,81,181)"},
    {src:"/assets/img/齐白石6.jpg","display":"cover",text:"九华山",color:"rgb(121,196,131)"},
    {src:"/assets/img/齐白石7.jpg","display":"cover",text:"峨眉山",color:"rgb(66,81,181)"},
  ];

  thoughtStations = [
    {src:"/assets/img/na.jpg",text:"忧国忧民",color:"rgb(240,209,246)"},
    {src:"/assets/img/na.jpg",text:"咏史怀古",color:"rgb(66,81,181)"},
    {src:"/assets/img/na.jpg",text:"怀才不遇",color:"rgb(121,196,131)"},
    {src:"/assets/img/na.jpg",text:"壮志未酬",color:"rgb(66,81,181)"},
    {src:"/assets/img/na.jpg",text:"吊古伤今",color:"rgb(121,196,131)"},
  ];

  stations = [
    {name:"明星诗单", data: this.styleStations},
    {name:"热门诗单", data: this.lakeStations},
    {name:"流行诗单", data: this.hillStations},
    {name:"经典诗单", data: this.thoughtStations},
  ]*/
  

  goToList(listid:any){
    this.data.currentListId = listid;
    this.router.navigate(['/tabs/tab4/list'], {
      queryParams: {}
    });
  }

  
  ngOnInit(): void {}

  @ViewChild('modal', { static: true }) modal: IonModal|any;
  closeModal() {
    this.modal.dismiss();
  }
}

