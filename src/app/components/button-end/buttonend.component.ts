import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';
import { AddToCustomListPage } from 'src/app/tab3/customlist/add-to-customlist/add-to-customlist.page';

@Component({
  selector: 'app-button-end',
  templateUrl: './buttonend.component.html',
  styleUrls: ['./buttonend.component.scss'],
})
export class ButtonEndComponent {

  @Input() p: any;

  @Input() page: string|any;

  uuid:any;
  constructor(
    public data: DataService,
    public ui: UiService,
    private router: Router,
    private modalController: ModalController
  ){
    this.uuid = this.data.generate_uuid();
    //console.log('button-end:'+this.uuid)
  }

  async addToCustomList(p:any){
    //console.log(p)
    this.data.collectCustom(p);
    
    const modal = await this.modalController.create({
        component: AddToCustomListPage,
        componentProps: {
        },
        //cssClass: 'modal-fullscreen',
        //keyboardClose: true,
        showBackdrop: true,
        breakpoints: [0, 0.5, 0.75, 1],
        initialBreakpoint: 0.75,
        //enterAnimation: this.enterAnimation,
        //leaveAnimation: this.leaveAnimation,
        //presentingElement: await this.modalController.getTop(),
        //presentingElement: this.presentingElement
    });
    await modal.present();
  }

  checkAuthor(author:any){
    this.modalController.getTop().then((result:any)=>{
      if(result){
        this.modalController.dismiss();
      }
    });
      
    this.data.goToAuthor(author);
  }

  interpret(poem:any){
    //close it if player is open
    if(this.ui.PoemPlayer){
      this.ui.PoemPlayer.dismiss();
    }

    let input_text = this.data.currentLocale == 'zh-CN' ?
        "请赏析一下"+poem.author+"的这首诗：":
        `Please explain and analyze the following poem by ${poem.author}: `;
    input_text += (poem.sample?poem.sample:poem.paragraphs[0]);
    this.router.navigate(['/chat'], {
      queryParams: {
        text:input_text
      }
    });
  }
    
  share(){
    this.data.share1('camera1')
    /*
    const historyBlock:any = document.getElementById("sharetest");
    
    const options = { 
      background: "white", 
      width: historyBlock.clientWidth, 
      height: historyBlock.clientHeight 
    };

    domtoimage.toPng(historyBlock, options).then((file) => {
      this.ui.share(file);
    });*/

  }
}
