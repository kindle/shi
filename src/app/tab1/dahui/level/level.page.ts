import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-level',
  templateUrl: './level.page.html',
  styleUrls: ['./level.page.scss'],
})
export class LevelPage implements OnInit {

  constructor(
    private router: Router,
    public ui: UiService,
    public data: DataService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.data.currentTasks = [];
  }

  levelId = 0;
  async ionViewDidEnter(){
    this.levelId = this.activatedRoute.snapshot.queryParams["level"];
    this.data.currentTasks = this.data.getLevelTasks(this.levelId);
    this.data.updateCurrentTasks();
  }

  realGoTask(task:any){
    this.router.navigate(['game-dahui'], {
      queryParams: {
        id:task.id
      }
    });
  }
  async goTask(task:any){
    //console.log('goTask')
    //console.log(task)
    if(task.unlock===true){
      this.realGoTask(task);
    }
    else{
      if(task.index>0&&task.index<this.data.currentTasks.length){
        if(this.data.currentTasks[task.index-1].unlock==true){
          let price = await this.data.buyPrice();
          let myCoins = await this.data.getMyCoins();
          if(myCoins>=price){ 
            const alert = await this.alertController.create({
                header: this.ui.instant("Game.ConfirmTitle"),
                message: this.ui.instant("Game.CoinsToUnlock").replace("{0}",price),
                buttons: [
                {
                    text: this.ui.instant("Game.ConfirmCancel"),
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {}
                }, 
                {
                    text: this.ui.instant("Game.ConfirmYes"),
                    handler: () => {
                        this.data.buyTask(task);
                        this.realGoTask(task);
                    }
                }]
            });
  
            await alert.present().then(()=>{});
          }
          else{     
            const alert = await this.alertController.create({
                header: this.ui.instant("Game.ConfirmTitle"),
                message: this.ui.instant("Game.NotEnoughCoins").replace("{0}",price),
                buttons: [
                {
                    text: 'OK',
                    role: 'ok',
                    cssClass: 'secondary',
                    handler: () => {}
                }]
            });
  
            await alert.present().then(()=>{});      
          }
        }
      }
    }
  }
}
