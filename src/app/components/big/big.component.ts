import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ViewType } from 'src/app/data.service';

@Component({
  selector: 'app-big',
  templateUrl: './big.component.html',
  styleUrls: ['./big.component.scss'],
})
export class BigComponent {

  @Input() source?: any;

  constructor(
    public data: DataService,
    private router: Router,
  ){}


  search(key:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:key,
        type:'tag'
      }
    });
  }

  //by tag or by id
  goToListBy(big:any){
    if(big.id){//有id诗单
      this.data.currentListId = big.id;
      this.router.navigate(['/tabs/tab4/list'], {
        queryParams: {}
      });
    }
    else{//tag诗单
      this.data.currentViewType = ViewType.Tag;
      this.data.currentAuthor = big.text;
      this.data.currentImage = big.src;
      this.router.navigate(['/tabs/tab4/poet'], {
        queryParams: {
        }
      });
    }
  }

  @ViewChild('bigswiper') swiperRef: ElementRef | undefined;
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
