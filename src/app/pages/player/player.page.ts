import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ItemReorderEventDetail, ModalController, RangeCustomEvent } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    if(!this.data.isPlaying)
      this.data.setAudio();
  }

  currentIndex:any;
  select(i:any){
    this.currentIndex = i;
  }

  prev(){
    //this.data.prevTodayText();
  }

  next(){
    //this.data.nextTodayText();
  }

  isFirstPlaying(){}
  isLastPlaying(){}

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
    let str_minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    
    let strseconds = (seconds >= 10) ? seconds : "0" + seconds;
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
  toggleView(){
    this.showHistory = false;
    this.bigimg = !this.bigimg;
  }
  showHistory = false;
  history(){
    this.showHistory = !this.showHistory;
  }

  play(poem:any){
    this.data.playobj(poem, false);
    this.showHistory = false;
  }
  


  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    //console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    this.data.toPlayList = ev.detail.complete(this.data.toPlayList);
  }
  

  shuffle(){
    this.data.togglePlayListRandomly();
    this.data.savePlayStyle();
  }
  repeat(){
    this.data.isRepeat = !this.data.isRepeat;
    if(this.data.isRepeat===true){
      this.data.isInfinite = false;
    }
    this.data.savePlayStyle();
  }
  infinite(){
    this.data.isInfinite = !this.data.isInfinite;
    if(this.data.isInfinite===true)
    {
      this.data.isRepeat = false;
    }

    this.data.savePlayStyle();
  }

}
