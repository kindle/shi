import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { UiService } from '../services/ui.service';
import * as CryptoJS from 'crypto-js';
import RecorderManager from '../../assets/kdxf/index.umd.js'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScrollService } from '../services/scroll.service';
import { Subscription } from 'rxjs';
import { IonContent, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  localJsonData:any;
  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private scrollService: ScrollService,
    private actionSheetController: ActionSheetController
  ) { 
    this.showSubscription = this.data.showSubscription;
    this.localJsonData = this.data.JsonData;
  }

  showSubscription = true;
  closeSub(){
    this.showSubscription = false;
  }

  async ionViewDidEnter(){
    //loaded in Component.app
    /*
    if(this.data.searchTopicData==null){
      //load topics
      this.data.getData(`/assets/topic/search-topic.json`).subscribe(data=>{
        this.data.searchTopicData = data;
      });
    }*/
  }

  @ViewChild(IonContent, { static: false }) content: IonContent|any;
  private scrollSubscription: Subscription|any;
  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  async ngOnInit() {
    this.scrollSubscription = this.scrollService.scrollToTop$.subscribe(() => {
      if (this.content) {
        this.content.scrollToTop(300);
      }
    });

    /****test code*****/
    var arrayObj=Array.from(this.data.tagsStat);
    //按照value值降序排序
    if(this.data.TestMode){
      arrayObj.sort(function(a,b){return a[1]-b[1]});
      for (var [key, value] of arrayObj) 
      {
          //console.log(key + ' = ' + value);
      }
    }
    /****test code*****/
    this.initRecorderManager();
  }

  testReset(){
    this.data.queueData = this.data.targetData;
    this.data.save();
  }



  currentLpId=0;
  pressed(topicid:any){
    this.currentLpId = topicid;
  }
  isSearchSaved = false;
  onScroll(event:any){
    this.currentLpId=0;
    if(!this.isSearchSaved && this.data.searchText!=null && this.data.searchText!="" && this.data.searchText!=this.ui.instant('Search.Tab4')){
      this.data.saveSearchHistory(this.data.searchText.trim());
      this.isSearchSaved = true;
    }
  }
  active(topicid:any){
  }
  released(topicid:any){
    this.currentLpId = 0;
  }
  ionViewWillLeave() {
    this.currentLpId = 0;

    this.recorder.stop();
  }
  ionViewWillEnter() {
    this.currentLpId = 0;
  }







  /****start listening */
  APPID = "61a935ce";
  API_SECRET = "NzU3YTcwMmY2MjY2YTk3ODlkOWUwMzA4";
  API_KEY = "badf591733e29baea5b3e030519f3d74";

  btnStatus = "UNDEFINED"; // "UNDEFINED" "CONNECTING" "OPEN" "CLOSING" "CLOSED"
  
  recorder:any = new RecorderManager("../../../assets/kdxf");

  iatWS:any;
  resultText = "";
  resultTextTemp = "";
  countdownInterval:any;

  //btnControlInnerText = "";
  resultInnerText = "";

  initRecorderManager(){
    //console.log('init recorder manager')
    this.recorder.onStart = () => {
      //console.log('recorder onstart')
      this.changeBtnStatus("OPEN");
    }
    this.recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }:any) => {
      //console.log('recorder onFrameRecorded')
      if (this.iatWS.readyState === this.iatWS.OPEN) {
        this.iatWS.send(
          JSON.stringify({
            data: {
              status: isLastFrame ? 2 : 1,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: this.toBase64(frameBuffer),
            },
          }) 
        );
        if (isLastFrame) {
          this.changeBtnStatus("CLOSING");
        }
      }
    };
    this.recorder.onStop = () => {
      //console.log('recorder onStop')
      clearInterval(this.countdownInterval);
      //clearInterval(this.AnswerCountdownInterval);
    };
  }


  start(){
    //console.log('click start button')
    if (this.btnStatus === "UNDEFINED" || this.btnStatus === "CLOSED") {
      this.connectWebSocket();
    } else if (this.btnStatus === "CONNECTING" || this.btnStatus === "OPEN") {
      // 结束录音
      this.recorder.stop();
    }
  }

  /**
   * 获取websocket url
   * 该接口需要后端提供，这里为了方便前端处理
   */
  getWebSocketUrl() {
    // 请求地址根据语种不同变化
    var url = "wss://iat-api.xfyun.cn/v2/iat";
    var host = "iat-api.xfyun.cn";
    var apiKey = this.API_KEY;
    var apiSecret = this.API_SECRET;
    var date = new Date().toUTCString();
    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    return url;
  }

  toBase64(buffer:any) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  countdownseconds = 60
  countdown() {
    this.countdownseconds = 60;
    //this.btnControlInnerText = `总计时（${60-this.countdownseconds}s）`;//录音中
    this.countdownInterval = setInterval(() => {
      this.countdownseconds = this.countdownseconds - 1;
      if (this.countdownseconds <= 0) {
        clearInterval(this.countdownInterval);
        this.recorder.stop();
      } else {
        //this.btnControlInnerText = `总计时（${60-this.countdownseconds}s）`;//录音中
      }
    }, 1000);
  }

  AnswerTimeLimit = 5;

  changeBtnStatus(status:any) {
    //console.log('change status:'+status);
    this.btnStatus = status;
    if (status === "CONNECTING") {
      //this.btnControlInnerText = "准备" //"建立连接中";
      this.resultInnerText = "";
      this.resultText = "";
      this.resultTextTemp = "";
    } else if (status === "OPEN") {
      this.countdown();
      //this.answercountdown();
    } else if (status === "CLOSING") {
      //this.btnControlInnerText = "关闭中"//"关闭连接中";
    } else if (status === "CLOSED") {
      //this.btnControlInnerText = ""//"开始录音";
    }
  }

  yourLastAnswer = "";
  renderResult(resultData:any) {
    //console.log('resultdata:')
    //console.log(resultData)
    // 识别结束
    let articleData = JSON.parse(resultData);
    if (articleData.data && articleData.data.result) {
      let data = articleData.data.result;
      let str = "";
      let ws = data.ws;
      for (let i = 0; i < ws.length; i++) {
        str = str + ws[i].cw[0].w;
      }
      // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
      // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
      if (data.pgs) {
        if (data.pgs === "apd") {
          // 将resultTextTemp同步给resultText
          this.resultText = this.resultTextTemp;
        }
        // 将结果存储在resultTextTemp中
        this.resultTextTemp = this.resultText + str;
      } else {
        this.resultText = this.resultText + str;
      }
      //this.resultInnerText =
      this.data.searchText = 
        this.resultTextTemp || this.resultText || "";

      if(str!="")
        //this.yourLastAnswer = str;
      //update search keyword
      this.data.searchText = this.data.searchText.replace(/[，。]/g, ' ');
      //start search
      this.onSearchChanged();
      //一句就停
      this.recorder.stop();
      //this.checkAnswer(str);
    }
    if (articleData.code === 0 && articleData.data.status === 2) {
      this.iatWS.close();
    }
    if (articleData.code !== 0) {
      this.iatWS.close();
      console.error(articleData);
    }
  }

  connectWebSocket() {
    //console.log('connectWebSocket')
    const websocketUrl = this.getWebSocketUrl();
    if ("WebSocket" in window) {
      this.iatWS = new WebSocket(websocketUrl);
    } else if ("MozWebSocket" in window) {
      //iatWS = new MozWebSocket(websocketUrl);
    } else {
      alert("浏览器不支持WebSocket");
      return;
    }
    this.changeBtnStatus("CONNECTING");
    this.iatWS.onopen = (e:any) => {
      //console.log('iatWS on open')
      //开始录音
      this.recorder.start({
        sampleRate: 16000,
        frameSize: 1280,
        arrayBufferType: "short16"
      });
      var params = {
        common: {
          app_id: this.APPID,
        },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          vad_eos: this.AnswerTimeLimit*1000, //5秒没声音自动断开
          dwa: "wpgs",
        },
        data: {
          status: 0,
          format: "audio/L16;rate=16000",
          encoding: "raw",
        },
      };
      let msg = JSON.stringify(params);
      //console.log(msg)
      this.iatWS.send(msg);
      //console.log('limit')
    };
    this.iatWS.onmessage = (e:any) => {
      //console.log('iatWS on message')
      this.renderResult(e.data);
    };
    this.iatWS.onerror = (e:any) => {
      //console.log('iatWS on error')
      console.error(e);
      this.recorder.stop();
      this.changeBtnStatus("CLOSED");
    };
    this.iatWS.onclose = (e:any) => {
      //console.log('iatWS on close')
      this.recorder.stop();
      this.changeBtnStatus("CLOSED");
    };
  }

  isListening=false;
  startListening(){
    if(this.isListening)
      return;

    this.isListening = true;
    this.start();
  }
  stopListening(){
    if(!this.isListening)
      return;

    this.isListening = false;
    this.recorder.stop();
  }
  /****stop listening */

  searchResult:any;
  searchResultCount=0;
  localList:any;
  
  clearIcon = "mic";
  isCancelling = false;
  onClearMic(){
    if(this.isCancelling) return;
    //from cancel icon in the input
    //console.log('clear mic clicked')
    this.startListening();
  }
  onCancel(){
    this.isCancelling = true;
    setTimeout(() => {
      this.isCancelling = false;
    }, 500);
    //from cancel text
    //console.log('cancel text clicked')
    this.stopListening();
    this.data.onSearchCancel();
  }
  onLoseFocus(){
    this.stopListening();

    if(!this.isSearchSaved && this.data.searchText!=null && this.data.searchText!="" && this.data.searchText!=this.ui.instant('Search.Tab4')){
      this.data.saveSearchHistory(this.data.searchText.trim());
      this.isSearchSaved = true;
    }

    if(this.data.searchText=="")
      this.data.searchText = this.ui.instant('Search.Tab4');
    
    if (this.isActionSheetOpen) {
      return;
    }

    if(this.data.searchText==null||
      this.data.searchText==""||
      this.data.searchText==this.ui.instant('Search.Tab4')){
      this.data.showFilter = false;
    }
  }
  onSearchFocus(){
    if(this.data.searchText==this.ui.instant('Search.Tab4')){
      this.data.searchText = "";
      this.onSearchChanged();
    }
    this.data.showFilter = true;
  }
  isHistoryExpanded = false;
  
  getHistory() {
    return this.data.searchHistory.slice().reverse();
  }

  toggleHistory(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.isHistoryExpanded = !this.isHistoryExpanded;
  }

  isActionSheetOpen = false;
  async presentClearHistoryActionSheet(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.isActionSheetOpen = true;
    const actionSheet = await this.actionSheetController.create({
      header: '清除搜索？',
      buttons: [
        {
          text: '清除搜索',
          role: 'destructive',
          handler: () => {
            this.data.clearSearchHistory();
          }
        },
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();
    actionSheet.onDidDismiss().then(() => {
      this.isActionSheetOpen = false;
    });
  }

  setOldSearch(key:any){
    this.data.searchText = key;
    console.log('set old search:'+key)
    this.onSearchChanged();
  }
  onSearchChanged(){
    this.isSearchSaved = false;
    let key = "";
    if(this.data.searchText!=null){
      key = this.data.searchText.trim();
    }

    if(key=="")
    {
      this.data.displayResult = [];
      return;
    }

    //this.data.saveSearchHistory(key);

    //最多支持5个关键字 空格分隔 缩小查询范围
    let keys = key.split(' ');
    
    if(key.length==0){
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(key)>-1
        //&&e.audio
      );
    }
    else{
      this.searchResult = this.localJsonData.filter((e:any)=>
        (e.text).indexOf(keys[0])>-1
      );
    }

    if(keys.length>1){
        this.searchResult = this.searchResult.filter((e:any)=>
          (e.text).indexOf(keys[1])>-1
        );
        if(keys.length>2){
          this.searchResult = this.searchResult.filter((e:any)=>
            (e.text).indexOf(keys[2])>-1
          );

          if(keys.length>3){
            this.searchResult = this.searchResult.filter((e:any)=>
              (e.text).indexOf(keys[3])>-1
            );
            
            if(keys.length>4){
              this.searchResult = this.searchResult.filter((e:any)=>
                (e.text).indexOf(keys[4])>-1
              );
            }
          }
        }
    }
    
    this.searchResultCount = this.searchResult.length;
    
    this.data.displayResult = [];
    this.generateItems();
  }
  
  isAuthor = false;
  private generateItems() {
    //check if keyword is author
    let foundAuthor = this.data.authorJsonData.filter((p:any)=>p.name==this.data.searchText)
    if(foundAuthor.length===1){
      this.isAuthor = true;
    }
    else{
      this.isAuthor = false;
    }
    //get search result
    this.data.displayResult = this.data.displayResult.concat(
      this.searchResult.splice(0,Math.min(this.searchResultCount,30))
    );
    //console.log(this.data.displayResult)
  }


  getHighlight(p:any): SafeHtml{
    let result = "";
    p.paragraphs.forEach((s:any) => {
      if(s.indexOf(this.data.searchText)>-1)
      {
        result = s;
      }
    });
    if(result===""){
      result = p.paragraphs[0]?.substring(0,50);
    }
    else{
      result = result?.substring(0,50);
    }
    p.sample = this.data.searchText;
    
    //return result.replace(this.data.searchText,"<b>"+this.data.searchText+"</b>");
    return this.sanitizer.bypassSecurityTrustHtml(
      result.replace(this.data.searchText,"<b class='highlight' style='background-color:yellow !important'>"+this.data.searchText+"</b>")
    );

  }



  chat(){
    this.router.navigate(['/chat'], {
      queryParams: {
      }
    });
  }

}
