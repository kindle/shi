import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ItemReorderEventDetail, ModalController, RangeCustomEvent } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';

import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-textzoomer',
  templateUrl: './textzoomer.page.html',
  styleUrls: ['./textzoomer.page.scss'],
})
export class TextZoomerPage implements OnInit {

  @ViewChild('swiperplayer', { static: false }) swiperRef: ElementRef | undefined;
  curSlide = "todo";

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    
  }

  pinFormatter(value: number) {
    return `${parseInt(value*100+"")}%`;
  }

  onIonChange(ev: Event) {
    let newZoomLevel = (ev as RangeCustomEvent).detail.value;
    //console.log('ionChange emitted value:', newZoomLevel);
    this.data.setFontSizeZoomLevel(newZoomLevel);
  }

}
