import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UiService } from '../../../services/ui.service';
import { DataService } from '../../../services/data.service';
import * as CryptoJS from 'crypto-js';
import RecorderManager from '../../../../assets/kdxf/index.umd.js'
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-game-audio',
  templateUrl: './game-audio.page.html',
  styleUrls: ['./game-audio.page.scss'],
})
export class GameAudioPage implements OnInit {

  APPID = "61a935ce";
  API_SECRET = "NzU3YTcwMmY2MjY2YTk3ODlkOWUwMzA4";
  API_KEY = "badf591733e29baea5b3e030519f3d74";

  btnStatus = "UNDEFINED"; // "UNDEFINED" "CONNECTING" "OPEN" "CLOSING" "CLOSED"
  
  recorder:any = new RecorderManager("../../../assets/kdxf");

  iatWS:any;
  resultText = "";
  resultTextTemp = "";
  countdownInterval:any;

  btnControlInnerText = "";
  resultInnerText = "";

  constructor(
    public ui: UiService,
    public data: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _renderer2: Renderer2,
    private navController: NavController,
    @Inject(DOCUMENT) private _document: Document,
  ) {}

  AnswerTimeLimit = 15; //规定秒数内作答，否则挑战失败
  AnswerCountDownText = "";
  AnswerCountdownInterval:any;

  id:any;
  localGameData:any = [];
  ionViewWillEnter() {
    this.id  = this.activatedRoute.snapshot.queryParams["id"];
    
    this.localGameData = this.data.gameNextData
      .filter((g:any)=>g.id==this.id)[0];
      
    //test
    //this.data.pass(this.localGameData, 10);

    this.localGameData.list.forEach((j:any) => {
      j.display = false;
    });

    let poem = this.localGameData.list[0];
    let currentFullPoet = poem.sample;
    this.currentExpectedAnswer = currentFullPoet.split('，')[1];

    //let name = currentFullPoet.split('，')[0];
    //this.read(name);
    this.readmp3(poem);

    this.start();
  }

  goLevels(){
    //this.navController.back();
    // this.router.navigate(['/tabs/tab5/level'], {
    //   queryParams: {
    //     level: this.id,
    //     random: this.data.getRandom(0,100)
    //   }
    // });
    this.router.navigate(['/tabs/tab5/level'], {
      queryParams: {
        level: this.id,
        random: this.data.getRandom(0,100)
      }
    });
  }

  ionViewWillLeave() {
    this.recorder.stop();
    this.audio.pause();
  }

  show(s:any){
    s.display = true;
  }

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  currentExpectedAnswer = "";
  currentSlideIndex = 0;
  onSlideChange(event:any){
    //console.log('changed.')
    //console.log(event)
    this.currentSlideIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
    //console.log(this.currentSlideIndex);
    //console.log(this.localGameData)

    let poem = this.localGameData.list[this.currentSlideIndex];
    let currentFullPoet = poem.sample;
    this.currentExpectedAnswer = currentFullPoet.split('，')[1];
    //console.log(this.currentExpectedAnswer)

    //let name = currentFullPoet.split('，')[0];
    //this.read(name);
    this.readmp3(poem);

    this.resultInnerText = "";
  }

  yourPassCount = 0;
  checkAnswer(str:any){
    str.replace(/[，。 ]/g, '');
    if(str.indexOf(this.currentExpectedAnswer)>=0)
    {
        //this.ui.toast("top","答对了！！")
        //console.log(this.localGameData.list[this.currentSlideIndex])
        this.localGameData.list[this.currentSlideIndex].display = true;

        setTimeout(()=>{this.swiperRef?.nativeElement.swiper.slideNext();},250)
        
        //renew AnswerCountDown
        this.AnswerSeconds = this.AnswerTimeLimit;

        this.yourPassCount ++;
        if(this.yourPassCount == this.localGameData.list.length){
          this.pass(this.localGameData, 60-this.countdownseconds);
          //close all
          this.recorder.stop();
          setTimeout(()=>{this.ui.goback()},3000)
        }
    }
    else{
        //this.ui.toast("top","答错了")
    }
  }

  audio = new Audio();
  pass(task:any, yourseconds:any){
    this.data.pass(task, yourseconds);
    //this.addScriptByUrl("/assets/js/pass.js");
    this.audio.src = `/assets/music/wow.mp3`;
    this.audio.play();
  }

  read(name:any){
    //this.audio.src = `/assets/game/${name}.mp3`;
    //this.audio.play();
  }

  readmp3(askPoem:any){
    //console.log('start readmp3')
    //console.log(askPoem)
    let orgPeom = this.data.JsonData.filter((shici:any)=>shici.id===askPoem.id)[0];
    if(orgPeom!=null&&orgPeom.audio){
      //console.log(orgPeom)
      //let mp3src = `https://reddah.blob.core.windows.net/msjjmp3/${orgPeom.audio}`;//url path
      let mp3src = `/assets/game/${orgPeom.audio}`;//url path
      let startseconds = askPoem.start; //start seconds
      let howlong = askPoem.end-askPoem.start; //how many seconds to play
      this.audio.src = mp3src;
      this.audio.currentTime = startseconds;
      this.audio.play();
      setTimeout(() => {
        this.audio.pause();
      }, howlong*1000);
    }
  }

  cut(str:any,n:any){
    if(n>3)
      return str.substring(0,2) + "..."
    else
      return str;
  }

  addScriptByUrl(src:any){
    let key = "Reddah_Pass_js";

    let s = this._renderer2.createElement('script');
    s.type = "text/javascript";
    s.src = src;
    s.id = key;
    
    this._renderer2.appendChild(
    this._document.body.getElementsByTagName("app-game-audio")[0], s);

  }

  ngOnInit() {
    this.initRecorderManager();
  }

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
      clearInterval(this.AnswerCountdownInterval);
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
    this.btnControlInnerText = `总计时（${60-this.countdownseconds}s）`;//录音中
    this.countdownInterval = setInterval(() => {
      this.countdownseconds = this.countdownseconds - 1;
      if (this.countdownseconds <= 0) {
        clearInterval(this.countdownInterval);
        this.recorder.stop();
      } else {
        this.btnControlInnerText = `总计时（${60-this.countdownseconds}s）`;//录音中
      }
    }, 1000);
  }

  AnswerSeconds = 0;
  answercountdown() {
    this.AnswerSeconds = this.AnswerTimeLimit;
    this.AnswerCountdownInterval = setInterval(() => {
      this.AnswerSeconds = this.AnswerSeconds - 1;
      if (this.AnswerSeconds <= 0) {
        clearInterval(this.AnswerCountdownInterval);
        this.recorder.stop();
      } else {
        
      }
    }, 1000);
  }

  changeBtnStatus(status:any) {
    //console.log('change status:'+status);
    this.btnStatus = status;
    if (status === "CONNECTING") {
      this.btnControlInnerText = "准备" //"建立连接中";
      this.resultInnerText = "";
      this.resultText = "";
      this.resultTextTemp = "";
    } else if (status === "OPEN") {
      this.countdown();
      this.answercountdown();
    } else if (status === "CLOSING") {
      this.btnControlInnerText = "关闭中"//"关闭连接中";
    } else if (status === "CLOSED") {
      this.btnControlInnerText = ""//"开始录音";
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
      //  this.resultTextTemp || this.resultText || "";

      if(str!="")
        this.yourLastAnswer = str;
      this.resultInnerText = this.yourLastAnswer.replace(/[，。]/g, '');
      this.checkAnswer(str);
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

  









}

