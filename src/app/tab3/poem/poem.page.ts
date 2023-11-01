import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlayerPage } from 'src/app/pages/player/player.page';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-poem',
  templateUrl: './poem.page.html',
  styleUrls: ['./poem.page.scss'],
})
export class PoemPage{

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
    private cdRef: ChangeDetectorRef
  ) { }

  ionViewWillEnter() {
    this.data.updateLocalData('poem');
  }
}
