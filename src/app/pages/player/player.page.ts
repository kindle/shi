import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ItemReorderEventDetail, ModalController, RangeCustomEvent } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';

import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

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
  playlist(){
    if(this.showPlaylist==false)
    {
      this.showText = false;
      this.bigimg = false;
      this.showPlaylist = true;
    }
    else
    {
      this.bigimg = !this.bigimg;
    }
  }

  play(poem:any){
    this.data.playobj(poem, false);
    this.showText = true;
    this.showHistory = false;
    this.showPlaylist = false;
    this.bigimg = false;
  }
  


  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    //console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    this.data.toPlayList = ev.detail.complete(this.data.toPlayList);
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
