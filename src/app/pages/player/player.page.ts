import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ItemReorderEventDetail, ModalController, RangeCustomEvent, IonContent, IonPopover } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';
import { Router } from '@angular/router';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import type { PluginListenerHandle } from '@capacitor/core';

import { register } from 'swiper/element/bundle';
import { ShiNoteEditorComponent } from 'src/app/directives/shi-note-editor.component';
import { ShiNoteService } from 'src/app/services/shi-note.service';
register();

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  @ViewChild(IonContent) content: IonContent | undefined;
  @ViewChild('swiperplayer', { static: false }) swiperRef: ElementRef | undefined;
  @ViewChildren(ShiNoteEditorComponent) noteEditors!: QueryList<ShiNoteEditorComponent>;
  @ViewChild(ShiNoteEditorComponent) noteEditorComponent!: ShiNoteEditorComponent;
  @Input() fromArticle: boolean = false;
  curSlide = "todo";
  keyboardOffset = 0;
  private keyboardListeners: Promise<PluginListenerHandle>[] = [];
  private visualViewportHandler?: () => void;

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
    private router: Router,
    private noteService: ShiNoteService
  ) { }

  ionViewWillEnter() {
    if(this.fromArticle){
      this.ui.showStatusBar();
    }
  }

  ionViewWillLeave() {
    if(this.fromArticle){
      this.ui.hideStatusBar();
    }
  }

  ngOnInit() {
    document.body.classList.add('player-open');
    if(!this.data.isPlaying){
      this.data.setAudio();
    }
    this.bindKeyboardListeners();
    this.noteService.activeEditor$.subscribe(editor => {
       if(editor){
         this.onInlineEditorActive(editor);
       }
    });
  }
  ngOnDestroy() {
    document.body.classList.remove('player-open');
    this.keyboardListeners.forEach(async (listenerPromise) => {
      const listener = await listenerPromise;
      listener.remove();
    });
    if (this.visualViewportHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.visualViewportHandler);
      window.visualViewport.removeEventListener('scroll', this.visualViewportHandler);
    }
  }

  private bindKeyboardListeners() {
    const updateOffset = (info?: KeyboardInfo) => {
      const viewportOffset = this.getVisualViewportOffset();
      if (window.visualViewport) {
        this.keyboardOffset = viewportOffset;
        return;
      }

      this.keyboardOffset = info?.keyboardHeight ?? 0;
    };

    this.visualViewportHandler = () => updateOffset();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.visualViewportHandler);
      window.visualViewport.addEventListener('scroll', this.visualViewportHandler);
      updateOffset();
    }

    this.keyboardListeners = [
      Keyboard.addListener('keyboardWillShow', updateOffset),
      Keyboard.addListener('keyboardDidShow', updateOffset),
      Keyboard.addListener('keyboardWillHide', () => updateOffset()),
      Keyboard.addListener('keyboardDidHide', () => updateOffset()),
    ];
  }

  private getVisualViewportOffset() {
    const viewport = window.visualViewport;
    if (!viewport) {
      return 0;
    }

    return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
  }

  currentIndex:any;
  pressTimer: any;
  longPressTriggered = false;
  isPopoverOpen = false;
  popoverEvent: any;
  menuText = '';

  startPress(i: number, ev: any, text: string) {
    //if (text.length <= 16) return;
    this.longPressTriggered = false;
    this.pressTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.popoverEvent = ev;
      this.menuText = text;
      this.isPopoverOpen = true;
    }, 500);
  }

  endPress() {
    clearTimeout(this.pressTimer);
  }

  menuSearch() {
    this.data.search(this.menuText);
    this.isPopoverOpen = false;
  }

  menuShare() {
    this.data.shareText(this.data.currentPoem.author + '·《' + this.data.currentPoem.title + '》', this.menuText);
    this.isPopoverOpen = false;
  }

  select(i:any, ev?: any){
    if (this.longPressTriggered) {
      this.longPressTriggered = false;
      return;
    }
    const selection = window.getSelection();
    if(selection && selection.toString().length > 0){
      return;
    }

    if(this.currentIndex === i){
      const paragraphCacheId = this.data.currentPoem.id + '_paragraph_' + i;
      const editor = this.noteEditors.find(e => e.cacheid === paragraphCacheId);
      if(editor){
        editor.activateEdit(ev);
        return;
      }
    }
    this.onContainerClick();
    this.currentIndex = i;
    this.authorSelected = false;
  }
  authorSelected= false;
  selectAuthor(ev?: any){
    const selection = window.getSelection();
    if(selection && selection.toString().length > 0){
      return;
    }

    if(this.authorSelected){
      const authorCacheId = this.data.currentPoem.id + '_author';
      const editor = this.noteEditors.find(e => e.cacheid === authorCacheId);
      if(editor){
        editor.activateEdit(ev);
        return;
      }
    }
    this.onContainerClick();
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
    this.dragWhere = true;
    this.data.dragWhere =true;
    //this.data.audio.pause();
    //this.data.lrc.pause();
    
    //this.data.isPlaying = false;
  }

  onDragEnd(ev: Event) {
    this.dragWhere = false;
    
    // Force blocking updates immediately on drop to ensure stability during seek
    // This protects against race conditions even if onDragStart didn't fire correctly
    this.data.dragWhere = true;

    const value = (ev as RangeCustomEvent).detail.value;
    // console.log("DragEnd Value:", value, "Duration:", this.data.duration);

    if (typeof value === 'number' && !isNaN(value)) {
      this.data.currentTime = value;
      
      if(this.data.audio){
        let seekTime = value;
        // Ensure within bounds if duration is valid
        if (this.data.duration > 0 && seekTime > this.data.duration) {
            seekTime = this.data.duration;
        }
        if (seekTime < 0) seekTime = 0;

        this.data.audio.currentTime = seekTime;

        this.data.audio.play().catch((e:any) => console.error("Play error:", e));
        this.data.isPlaying = true;
      }
    }
    
    // Add substantial delay before resuming time updates to allow audio seek to stabilize
    setTimeout(() => {
      this.data.dragWhere =false;
    }, 500);
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
  

  async notes(){
    await this.modalController.dismiss();
    this.router.navigate(['/notes']);
  }

  edit = false;
  changeEdit(){
    this.edit = !this.edit; 
    if(!this.edit){
      this.showNoteToolbar = false;
    } else {
      setTimeout(()=>{
        if(this.noteEditorComponent){
          this.noteEditorComponent.setFocus();
        }
      },200);
    }
  }

  showNoteToolbar = false;
  // Note properties (synced with active editor)
  currentNoteColor = 'red';
  currentNoteSize = 'a';
  currentNoteLines = 1;


  // Active inline editor reference
  activeInlineEditor: ShiNoteEditorComponent | null = null;


  // Hook for main editor to clear inline active state
  onInlineEditorActive(editor: ShiNoteEditorComponent) {
      this.activeInlineEditor = editor;
      this.showNoteToolbar = true;
      if(this.data.isPlaying){
        this.data.execPause();
      }
      // Sync toolbar state
      this.currentNoteColor = editor.currentNoteColor;
      this.currentNoteSize = editor.currentNoteSize;
      this.currentNoteLines = editor.currentNoteLines;
  }

  clear(){
    console.log('clear selection');
    this.currentIndex = null;
    this.authorSelected = false;
    this.showNoteToolbar = false;
  }

  onContainerClick() {
    this.currentIndex = null;
    this.authorSelected = false;
    this.showNoteToolbar = false;
    this.noteService.setActive(null);
    if (this.activeInlineEditor) {
        this.activeInlineEditor.canEdit = false;
        this.activeInlineEditor = null;
    }
  }

  setNormal() {
    if (this.activeInlineEditor) {
        this.activeInlineEditor.setNormal();
    }
  }

  setNote() {
    if (this.activeInlineEditor) {
        this.activeInlineEditor.setNote();
    }
  }

  setOriginal() {
    if (this.activeInlineEditor) {
        this.activeInlineEditor.setOriginal();
        this.currentNoteColor = this.activeInlineEditor.currentNoteColor;
        this.currentNoteSize = this.activeInlineEditor.currentNoteSize;
        this.currentNoteLines = this.activeInlineEditor.currentNoteLines;
    }
  }

  toggleColor() {
      if (this.activeInlineEditor) {
          this.activeInlineEditor.toggleColor();
          this.currentNoteColor = this.activeInlineEditor.currentNoteColor;
      }
  }

  toggleSize() {
      if (this.activeInlineEditor) {
          this.activeInlineEditor.toggleSize();
          this.currentNoteSize = this.activeInlineEditor.currentNoteSize;
      }
  }

  GetSizeText(size: string){
    switch(size){
      case 'a':
        return this.ui.instant('Note.SizeSmall');//<!--小-->;
      case 'b':
        return this.ui.instant('Note.SizeMedium');//<!--中-->;
      case 'c':
        return this.ui.instant('Note.SizeLarge');//<!--大-->;
      default:
        return this.ui.instant('Note.SizeSmall');//<!--小-->;
    }
  }

  toggleLines() {
      if (this.activeInlineEditor) {
          this.activeInlineEditor.toggleLines();
          this.currentNoteLines = this.activeInlineEditor.currentNoteLines;
      }
  }

  GetCacheById(id:any){
    return localStorage.getItem(id);
  }
}
