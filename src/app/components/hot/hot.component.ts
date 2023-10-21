import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-hot',
  templateUrl: './hot.component.html',
  styleUrls: ['./hot.component.scss'],
})
export class HotComponent {

  @Input() name?: string;
  @Input() source?: any;

  constructor(
    public data: DataService,
  ){}


  @ViewChild('hotswiper') swiperRef: ElementRef | undefined;
  startTouchX: number|any;
  startTouchY: number|any;
  ontouchstart(e:any){
    if(this.swiperRef){
      this.startTouchX = this.swiperRef.nativeElement.swiper.touches.startX;
      this.startTouchY = this.swiperRef.nativeElement.swiper.touches.startY;
    }
  }
  ontouchmove(e:any){
    if(this.swiperRef)
    {
      let etouches = this.swiperRef.nativeElement.swiper.touches;
      const dx = Math.abs(etouches.currentX - this.startTouchX);
      const dy = Math.abs(etouches.currentY - this.startTouchY);

      // Check if the swipe is more horizontal than vertical
      if (dx > dy) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
}
