import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { GoogleGenerativeAI } from "@google/generative-ai"
import { IonContent } from '@ionic/angular';
import { UiService } from '../../services/ui.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  myImage = "assets/img/default.jpg";
  mysticPhoto = "assets/img/faq.png";//"assets/img/501.jpeg";

  userName: string|any = "User";

  constructor(
    public router:  Router,
    public data: DataService,
    private activatedRoute: ActivatedRoute,
    public ui: UiService,
  ) { }

  ngOnInit() {}

  async ionViewDidEnter(){
    let input_text = this.activatedRoute.snapshot.queryParams["text"];
    let chatId = this.activatedRoute.snapshot.queryParams["chatid"];

    //诗词页面调用chat
    if(input_text!=null){
      //复用提问
      let existedQuestion = this.data.getChatHistoryById(input_text);
      if(existedQuestion==null){
        //first time question
        this.chatHistory.id = input_text;//this.data.generate_uuid();
        this.generateChatWithQuestion(input_text);
      }else{
        this.chatHistory = existedQuestion;
      }
    }
    else{
      //直接进chat
      if(chatId==null){
        //console.log('chatId is empty')
        this.chatHistory.id = this.data.generate_uuid();
      }
      else{
        this.chatHistory = this.data.getChatHistoryById(chatId);
      }
      this.generateChat();
    }
  }

  close(){}

  async checkIsToday(date:any){
    let cur = new Date(date);
    return cur.getDate()==new Date().getDate();
  }

  @ViewChild('pageTop') pageTop: IonContent|any;
  message:string = ''
  writing = 0; //0:可以提问 1:正在回答问题

  updateMessage(msg:any){
    let lastmsg = this.chatHistory.messages[this.chatHistory.messages.length - 1];
    lastmsg.Content = msg.Content;
    lastmsg.update = Date.now();
    if(msg.UserName=='Agent'){
      this.chatHistory.lasta = msg.Content;
    }
    else{
      this.chatHistory.lastq = msg.Content;
    }
    if(this.chatHistory.messages.length>1){
      //console.log('this.data.updateAIChatHistory')
      this.data.saveAIChatHistory(this.chatHistory);
    }
  }
  addMessage(msg:any){
    //console.log("msg:")
    ///console.log(msg)
    let maxId = Math.max.apply(null,this.chatHistory.messages.map((item:any)=>item["id"]).filter((m:any)=>m!=null));
    msg.Id = maxId+1;

    if(msg.CreatedOn==null){
        msg.CreatedOn = Date.now();
    }
    this.chatHistory.update = Date.now();
    
    this.chatHistory.messages.push(msg);
    if(msg.UserName=='Agent'){
      this.chatHistory.lasta = msg.Content;
    }
    else{
      this.chatHistory.lastq = msg.Content;
    }
    //this.localStorageService.store(`Reddah_Mystic_Chat_${this.userName}`, this.messages);

    if(this.pageTop.scrollToBottom){
        this.pageTop.scrollToBottom(0);
    }
    setTimeout(()=>{
        if(this.pageTop.scrollToBottom){
            this.pageTop.scrollToBottom(0);
        }
    },1000)

    if(this.chatHistory.messages.length>1){
      //console.log('this.data.saveAIChatHistory')
      this.data.saveAIChatHistory(this.chatHistory);
    }
  }

  chatHistory:any = {id:"",messages:[],update:Date.now(),lastq:"",lasta:""}
  generateChat(){
    let continueFlag = true;
    if(this.chatHistory.messages==null||this.chatHistory.messages.length==0){
        this.chatHistory.messages = [];
        setTimeout(()=>{
            this.addMessage({
                Content: this.ui.instant("AI.Hello"),//"Hello! How can I assist you today?"
                UserName: 'Agent', 
                Type:0,
                Id:0,
            });
        },100)
    }
    else
    { 
    }

    return continueFlag;
    
  }

  generateChatWithQuestion(question:any){
    if(this.chatHistory.messages==null||this.chatHistory.messages.length==0){
      this.chatHistory.messages = [];
      
      setTimeout(()=>{
        this.addMessage({
            Content: question,//"Hello! How can I assist you today?"
            UserName: 'User', 
            Type:0,
            Id:0,
        });

        this.writing = 1;
        //xunfei call
        this.xunfei_start(question);

      },1000);
    }
  }

  lastInputText:any;
  async generateReactiveChat(inputText:any){
      if(this.generateChat())
      {
          this.writing = 1;

          //xunfei call
          this.xunfei_start(inputText);


          //google call
          /*
          this.genContent(inputText).then((data:any)=>{
            this.addMessage({
              //Content: this.translate.instant("Common.Font1"), 
              Content: data, 
              UserName: 'Mystic', 
              Type:0,
            });
          }).catch(err=>{
            this.addMessage({
              //Content: this.translate.instant("Common.Font1"), 
              Content: "something went wrong, please retry"+err, 
              UserName: 'Mystic', 
              Type:0,
            });
          });*/
      }
      else{
          this.lastInputText = inputText;
      }
  }

  


  getArray(n:any){
    if(n==null||n<0)
        n=0;
    return new Array(n);
}

  //google api
  async genContent_Google(input_text:any){
    let key = "AIzaSyCL1sWW2QLLGf8n4ipkv_cZIr-mB76mOyM";

    /*
    try {
      const response = await generativeAI.someFunction();
      // Process successful response
    } catch (error) {
      console.error("API call failed:", error);
      // Display an error message to the user indicating the API might be unavailable in their region
    }
    */

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(input_text);
    const response = await result.response;
    const text = response.text();


    //console.log(text);
    return text;
  }

  async genContent(input_text:any){}

  async genSession(input_text:any){
    let key = "AIzaSyCL1sWW2QLLGf8n4ipkv_cZIr-mB76mOyM";
    const genAI = new GoogleGenerativeAI(key);

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const chat = model.startChat(this.chatHistory.messages);
    const response = (await chat.sendMessage(input_text)).response;
    const text = response.text();
    //console.log(text);
  }

  html(text:any){
    return text.replace(/\n/g, '<br>')
  }

  htmldecode(text:any){
    return text.replace(/&lt;br&gt;/g, '<br>');
  }












  commentContent:any;
  showFunctionPanel = false;
  async hide(){
    this.showFunctionPanel = false;
    this.showFacePanel = false;
  }

  showFacePanel = false;
  toggleFacePanel(){}


  //user input sth.
  async childLocalComments(event:any){
    this.addMessage({
        CreatedOn: Date.now(),
        Content: event.text, 
        UserName: this.userName, 
        Type: event.type
    });

    setTimeout(()=>{
        this.generateReactiveChat(event.text);
    },1000);
    
  }


  @ViewChild('newChatComment') newChatComment:any;
  async submit() {
    this.commentContent = "";
    let uid = "12345";//this.reddah.uuidv4();
    this.childLocalComments({
        id: 1,//this.selectedArticleId, 
        text: this.newChatComment.value.replace(/\n/g,"&lt;br&gt;"),
        type: 0,
        uid: uid,
    });

    //this.reloadComments.emit();
    this.showFacePanel = false;
    this.showFunctionPanel = false;
    

    setTimeout(() => {
        this.newChatComment.setFocus();
    }, 1000);
    
    
  }









  appId = '61a935ce';
  status = 'init';
  total_res = "";
  xunfei_start(input_msg:any) {
    this.total_res = ""; // 请空回答历史
    this.connectWebSocket(input_msg)
  }

  ttsWS:any;
  // 连接websocket
  connectWebSocket(input_msg:any) {
    this.setStatus('ttsing')
    return this.getWebsocketUrl().then((url:any) => {
        let ttsWS:any;
        if ('WebSocket' in window) {
            ttsWS = new WebSocket(url)
        } else if ('MozWebSocket' in window) {
            //ttsWS = new MozWebSocket(url)
        } else {
            alert('浏览器不支持WebSocket')
            return
        }
        this.ttsWS = ttsWS
        ttsWS.onopen = (e:any) => {
            this.webSocketSend(input_msg)
        }
        ttsWS.onmessage = (e:any) => {
            this.result(e.data)
        }
        ttsWS.onerror = (e:any) => {
            //clearTimeout(this.playTimeout)
            this.setStatus('error')
            alert('WebSocket报错，请f12查看详情')
            //console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
        }
        ttsWS.onclose = (e:any) => {
            //console.log(e)
            this.writing = 0;
        }
    })
  }
  // websocket发送数据
  webSocketSend(input_msg:any) {
    //console.log(modelDomain)
    var params = {
        "header": {
            "app_id": this.appId, "uid": "fd3f47e4-d"
        }, "parameter": {
            "chat": {
                //"domain": modelDomain, "temperature": 0.5, "max_tokens": 1024
                "domain": "generalv3.5", "temperature": 0.5, "max_tokens": 1024
            }
        }, "payload": {
            "message": {
              /*
                "text": [{
                    "role": "user", "content": "中国第一个皇帝是谁？"
                }, {
                    "role": "assistant", "content": "秦始皇"
                }, {
                    "role": "user", "content": "秦始皇修的长城吗"
                }, {
                    "role": "assistant", "content": "是的"
                }, {
                    "role": "user", "content": input_msg
                }]
                */
                "text": [{
                    "role": "user", "content": input_msg
                }]
            }
        }
    }
    //console.log(JSON.stringify(params))
    this.ttsWS.send(JSON.stringify(params))
  }
  // websocket接收数据的处理
  xunfei_msg:any;
  result(resultData:any) {
    let articleData = JSON.parse(resultData)
    if(this.total_res==""){
      this.xunfei_msg = {
        Content: this.total_res, 
        UserName: 'Agent', 
        Type:0,
      }
      this.addMessage(this.xunfei_msg);
    }
    
    //console.log(articleData)
    //console.log(articleData.payload)
    //console.log(articleData.payload.choices.text[0].content)
    
    this.total_res = this.total_res + articleData.payload.choices.text[0].content;
    //console.log(this.total_res)
    this.xunfei_msg.Content = this.total_res;
    this.updateMessage(this.xunfei_msg)

    setTimeout(() => {
      this.pageTop.scrollToBottom();
    }, 100);
    
    //$('#output_text').val(total_res)
    // console.log(resultData)
    // 提问失败
    if (articleData.header.code !== 0) {
        alert(`提问失败: ${articleData.header.code}:${articleData.header.message}`)
        console.error(`${articleData.header.code}:${articleData.header.message}`)
        this.addMessage({
          Content: `提问失败: ${articleData.header.code}:${articleData.header.message}`, 
          UserName: 'Agent', 
          Type:0,
        });
        return
    }
    if (articleData.header.code === 0 && articleData.header.status === 2) {
        this.ttsWS.close()
        //bigModel.setStatus("init")

        //update last message

        this.data.saveAIChatHistory(this.chatHistory);
    }
  }


  // 修改状态
  setStatus(status:any) {
    //this.onWillStatusChange && this.onWillStatusChange(this.status, status)
    this.status = status
  }
  getWebsocketUrl() {
    let httpUrl = new URL("https://spark-api.xf-yun.com/v3.5/chat");
    let modelDomain;
    
    switch (httpUrl.pathname) {
        case "/v1.1/chat":
            modelDomain = "general";
            break;
        case "/v2.1/chat":
            modelDomain = "generalv2";
            break;
        case "/v3.1/chat":
            modelDomain = "generalv3";
            break;
        case "/v3.5/chat":
            modelDomain = "generalv3.5";
            break;
    }

    return new Promise((resolve, reject) => {
        var apiKey = "badf591733e29baea5b3e030519f3d74";//API_KEY
        var apiSecret = "NzU3YTcwMmY2MjY2YTk3ODlkOWUwMzA4";//API_SECRET
        var url = 'wss://' + httpUrl.host + httpUrl.pathname
        //var url = 'wss://spark-api.xf-yun.com/v3.5/chat';

        var host = location.host
        var date = new Date().toUTCString()
        var algorithm = 'hmac-sha256'
        var headers = 'host date request-line'
        var signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${httpUrl.pathname} HTTP/1.1`
        var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
        var signature = CryptoJS.enc.Base64.stringify(signatureSha)
        var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        var authorization = btoa(authorizationOrigin)
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
        resolve(url)
    })
  }

  list(){
    this.router.navigate(['/history'], {
      queryParams: {}
    });
  }





}

