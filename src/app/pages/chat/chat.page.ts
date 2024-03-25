import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { GoogleGenerativeAI } from "@google/generative-ai"
//import * as bing from "bing-chat"
import { IonContent } from '@ionic/angular';
import { UiService } from '../../services/ui.service';

/*
declare module '@baiducloud/qianfan' {  
  const content: any;  
  export = content;  
}*/

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  myImage = "assets/img/default.jpg";
  mysticPhoto = "assets/img/501.jpeg";

  userName: string|any;

  constructor(
    public router:  Router,
    public data: DataService,
    private activatedRoute: ActivatedRoute,
    public ui: UiService,
  ) { }

  ngOnInit() {
    this.generateChat();

    
    
  }

  close(){}

  async checkIsToday(date:any){
    let cur = new Date(date);
    return cur.getDate()==new Date().getDate();
  }

  @ViewChild('pageTop') pageTop: IonContent|any;
  message:string = ''
  messages: object[]|any;
  writing = 0;

  addMessage(msg:any){
    let maxId = Math.max.apply(null,this.messages.map((item:any)=>item["Id"]).filter((m:any)=>m!=null));
    msg.Id = maxId+1;

    if(msg.CreatedOn==null){
        msg.CreatedOn = Date.now();
    }
    
    this.messages.push(msg);
    //this.localStorageService.store(`Reddah_Mystic_Chat_${this.userName}`, this.messages);

    if(this.pageTop.scrollToBottom){
        this.pageTop.scrollToBottom(0);
    }
    setTimeout(()=>{
        if(this.pageTop.scrollToBottom){
            this.pageTop.scrollToBottom(0);
        }
    },1000)
}

  generateChat(){
    let continueFlag = true;
    if(this.messages==null||this.messages.length==0){
        this.messages = [];
        setTimeout(()=>{
            this.addMessage({
                Content: "Hello, what can i assit for you?",//this.reddah.instant("Mystic.Welcome"), 
                UserName: 'AI小喵', 
                Type:0,
                Id:0,
            });
        },1000)
    }
    else
    {
        
    }

    return continueFlag;
    
  }

  lastInputText:any;
  async generateReactiveChat(inputText:any){
      if(this.generateChat())
      {
          this.writing = 1;

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
          });
          
      }
      else{
          this.lastInputText = inputText;
      }
  }

  async ionViewDidEnter(){
    let input_text = this.activatedRoute.snapshot.queryParams["text"];
    console.log("input p:"+input_text)
  }


  getArray(n:any){
    if(n==null||n<0)
        n=0;
    return new Array(n);
}

  //google api
  async genContent(input_text:any){
    let key = "AIzaSyCL1sWW2QLLGf8n4ipkv_cZIr-mB76mOyM";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(input_text);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text;
  }

  //baidu api
  /*
  async genContent_baidu(input_text:any){
    const client = new Q.ChatCompletion({ 
      QIANFAN_AK: 'Sf2Yz2LppSliczFaWe95JHS9', 
      QIANFAN_SK: 'WMs6WMgR67Be09MoT08dsZHkNstykCVW' 
    });

    const response = await client.chat({
        messages: [
            {
                role: "user",
                content: "今天深圳天气",
            },
        ],
    }, "ERNIE-Bot-turbo");

    const text = response.text();
    console.log(text);
    return text;
  }

  //bing api
  async genContent(input_text:any){
    const api = new bing.BingChat({
      cookie: ""
    })
  
    const response = await api.sendMessage('Hello World!')
    const text = response.text;
    console.log(text);
    return text;
  }
  */


  async genSession(input_text:any){
    let key = "AIzaSyCL1sWW2QLLGf8n4ipkv_cZIr-mB76mOyM";
    const genAI = new GoogleGenerativeAI(key);

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const chat = model.startChat(this.messages);
    const response = (await chat.sendMessage(input_text)).response;
    const text = response.text();
    console.log(text);
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
    
    /*
    this.reddah.addComments(
        this.selectedArticleId, 
        this.selectedCommentId, 
        this.newChatComment.value,
        uid
        )
    .subscribe(result => 
    {
        if(result.Success==0)
        { 
            this.reloadComments.emit();
            this.showFacePanel = false;
            this.showFunctionPanel = false;
        }
        else{
            alert(result.Message);
        }
    });*/

    setTimeout(() => {
        this.newChatComment.setFocus();
    }, 1000);
    
    
}


}
