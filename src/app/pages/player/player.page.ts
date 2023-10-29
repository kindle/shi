import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ModalController, RangeCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  constructor(
    public data: DataService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  bigimg = false;
  toggleView(){
    this.bigimg = !this.bigimg;
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
    this.dragWhere =true;
    //this.data.audio.pause();
    //this.data.lrc.pause();
    
    this.data.isPlaying = false;
  }

  onDragEnd(ev: Event) {
    this.dragWhere =false;
    this.data.currentTime = (ev as RangeCustomEvent).detail.value;
    //this.data.leftTime = this.data.duration - this.data.currentTime;
    //console.log(this.currentTime);
    
    if(this.data.audio){
      this.data.audio.currentTime = this.data.currentTime;

      this.data.audio.play();
      this.data.currentPoem.paragraphs = ["","","","",""];
      this.data.lrc.play(this.data.audio.currentTime * 1000);
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

}
