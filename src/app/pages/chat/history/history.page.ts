import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  constructor(
    public ui: UiService,
    public data: DataService,
    public router:  Router,
  ) { }

  ngOnInit() {
    this.data.loadAIChatHistory();
  }

  GetHistoryByTime(){
    return this.data.aiChatHistory.sort((a:any, b:any) => {
      return b.update - a.update;
    });
  }

  delHistory(data:any){
    this.data.delAIChatHistory(data);
  }


  

  viewChat(chatId:any){
    this.router.navigate(['/chat'], {
      queryParams: {chatid:chatId}
    });
  }

  create(){
    this.router.navigate(['/chat'], {
      queryParams: {}
    });
  }

}
