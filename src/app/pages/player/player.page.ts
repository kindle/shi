import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ItemReorderEventDetail, ModalController, RangeCustomEvent, IonContent } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';

import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  @ViewChild(IonContent) content: IonContent | undefined;
  @ViewChild('swiperplayer', { static: false }) swiperRef: ElementRef | undefined;
  curSlide = "todo";

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    document.body.classList.add('player-open');
    if(!this.data.isPlaying){
      this.data.setAudio();
    }
  }
  ngOnDestroy() {
    document.body.classList.remove('player-open');
  }

  currentIndex:any;
  select(i:any){
    this.currentIndex = i;
    this.authorSelected = false;
  }
  authorSelected= false;
  selectAuthor(){
    this.authorSelected = true;
    this.currentIndex = null;
  }

  test(ev: Event){
    let draggingValue = (ev as RangeCustomEvent).detail.value;
    //console.log(draggingValue)
    this.dragvalue = draggingValue;
  }

  dragvalue : any;
  dragWhere=false;
  onChange(ev: Event){
    let draggingValue = (ev as RangeCustomEvent).detail.value;
    //console.log(draggingValue)
    this.dragvalue = draggingValue;
  }
  onDragStart(ev: Event) {
    this.data.dragWhere =true;
    //this.data.audio.pause();
    //this.data.lrc.pause();
    
    //this.data.isPlaying = false;
  }

  onDragEnd(ev: Event) {
    this.data.dragWhere =false;
    this.data.currentTime = (ev as RangeCustomEvent).detail.value;
    //this.data.leftTime = this.data.duration - this.data.currentTime;
    //console.log(this.currentTime);
    
    if(this.data.audio){
      this.data.audio.currentTime = this.data.currentTime;

      this.data.audio.play();
      //this.data.currentPoem.paragraphs = ["","","","",""];
      //this.data.lrc.play(this.data.audio.currentTime * 1000);
      this.data.isPlaying = true;
    }
    
  }
  
  formatTime(seconds=0) {
    let minutes = Math.floor(seconds / 60);
    if(Number.isNaN(minutes)){
      minutes = 0;
    }
    let str_minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);

    if(Number.isNaN(seconds)){
      seconds = 0;
    }
    
    let strseconds:any = "";
    strseconds = (seconds >= 10) ? seconds : "0" + seconds;
    return str_minutes + ":" + strseconds;
  }

  checkAuthor(author:any){
    this.modalController.dismiss();
    this.data.goToAuthor(author);
  }

  unlikelist(p:any,group:any){
    this.data.unlikelist(p,group);
    this.modalController.dismiss();

  }

  getHighlight(text:any){
    if(this.data.currentPoem.sample.split(/[，|、|。]/).some((t:any)=>text.indexOf(t)>-1))
    {
      return "<b>"+text+"</b>"
    }
    return text;
  }












  bigimg = false;
  showText = true;
  text(){
    if(this.showText == true){
      this.bigimg = !this.bigimg;
    }
    else
    {
      this.showText = true;
      this.showHistory = false;
      this.showPlaylist = false;
      this.bigimg = false;
    }
  }


  showHistory = false;
  history(){
    //this.showHistory = !this.showHistory;
    if(this.showHistory==true){
      //console.log('init swiper change...')
      //console.log(this.swiperRef)
      this.swiperRef?.nativeElement.swiper.on('slideChange', () => {
        //console.log('on slide change$$$')
        const activeIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
        //console.log('Active Index changed:', activeIndex);
      });
    }
    this.showText = false;
    this.showHistory = true;
    this.showPlaylist = false;
    //this.bigimg = false;
  }
  showPlaylist = false;

  goToHistoryEnd(){
    let attempts = 0;
    const interval = setInterval(() => {
      const element = document.getElementById('playlist-top');
      if(element){
        const slide = element.closest('swiper-slide');
        if (slide && (slide.scrollHeight > slide.clientHeight)) {
          const slideRect = slide.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const offset = elementRect.top - slideRect.top + slide.scrollTop - 60;
          slide.scrollTo({ top: offset, behavior: 'smooth' });
          clearInterval(interval);
        } else if (this.content) {
          this.content.scrollToPoint(0, element.offsetTop - 60, 0);
          clearInterval(interval);
        }
      }
      attempts++;
      if(attempts > 50){
        clearInterval(interval);
      }
    }, 100);
  }

  playlist(){
    if(this.showPlaylist==false)
    {
      this.showText = false;
      this.bigimg = false;
      this.showPlaylist = true;
      setTimeout(()=>{
        this.goToHistoryEnd();
      }, 200);
    }
    else
    {
      this.showText = true;
      this.showHistory = false;
      this.showPlaylist = false;
      this.bigimg = true;
    }
  }

  play(poem:any){
    this.data.playobj(poem, false);
    this.showText = true;
    this.showHistory = false;
    this.showPlaylist = false;
    this.bigimg = false;
  }
  


  handleReorder1(ev: CustomEvent<ItemReorderEventDetail>) {
    // Filter the list to match what is visible in the view
    const visibleItems = this.data.toPlayList.filter((p: any) => 
      this.data.isRepeat == 1 || this.data.isRepeat == 2 || (this.data.currentPoem && p.audio && p.id !== this.data.currentPoem.id)
    );

    // Perform the reorder on the visible items
    const newVisibleItems = ev.detail.complete(visibleItems);

    // Merge the reordered visible items back into the original list
    let visibleIndex = 0;
    this.data.toPlayList = this.data.toPlayList.map((p: any) => {
      const isVisible = this.data.isRepeat == 1 || this.data.isRepeat == 2 || (this.data.currentPoem && p.audio && p.id !== this.data.currentPoem.id);
      if (isVisible) {
        return newVisibleItems[visibleIndex++];
      } else {
        return p;
      }
    });
  }

  handleReorder2(ev: CustomEvent<ItemReorderEventDetail>) {
    // Filter the list to match what is visible in the view
    const visibleItems = this.data.additionalList.filter((p: any) => 
      this.data.isRepeat == 1 || this.data.isRepeat == 2 || (this.data.currentPoem && p.audio && p.id !== this.data.currentPoem.id)
    );

    // Perform the reorder on the visible items
    const newVisibleItems = ev.detail.complete(visibleItems);

    // Merge the reordered visible items back into the original list
    let visibleIndex = 0;
    this.data.additionalList = this.data.additionalList.map((p: any) => {
      const isVisible = this.data.isRepeat == 1 || this.data.isRepeat == 2 || (this.data.currentPoem && p.audio && p.id !== this.data.currentPoem.id);
      if (isVisible) {
        return newVisibleItems[visibleIndex++];
      } else {
        return p;
      }
    });
  }
  

  shuffle(){
    this.data.togglePlayListRandomly();
    this.data.savePlayStyle();
    this.data.isRepeat = 0;
    this.data.updateInfiniteHint();
  }
  repeat(){
    //0 normal play
    //1 cycle play
    //2 single play

    if(this.data.isRepeat===1){
      this.data.isRepeat = 2;
    }
    else if(this.data.isRepeat===2 || this.data.isRepeat===true){
      this.data.isRepeat = 0;
    }
    else{
      this.data.isRepeat = 1;
    }

    if(this.data.isRepeat!==0){
      this.data.isInfinite = false;
    }
    this.data.savePlayStyle();
    this.data.isShuffle = false;
  }
  infinite(){
    this.data.isInfinite = !this.data.isInfinite;
    if(this.data.isInfinite===true)
    {
      this.data.isRepeat = 0;
      //when infinite is on
      this.data.checkAndLoadAdditionalList();
    }
    this.data.updateInfiniteHint();
    this.data.savePlayStyle();

  }
  

}
