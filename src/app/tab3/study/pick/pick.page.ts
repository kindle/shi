import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-pick',
  templateUrl: './pick.page.html',
  styleUrls: ['./pick.page.scss'],
})
export class PickPage {
  lastUpdatedCustomList: any[] = [];
  searchResult: any[] = [];
  displayResult: any[] = [];
  searchResultCount = 0;
  searchText: any;
  showFilter = false;

  constructor(
    public data: DataService,
    public ui: UiService,
    private modalController: ModalController,
  ) {}

  ionViewWillEnter() {
    this.data.updateLocalData('customlist');
    this.onSearchChanged();

    const lastUpdated = this.data.GetLastUpdatedCustomList();
    this.lastUpdatedCustomList = lastUpdated ? [lastUpdated] : [];
  }

  onSearchFocus() {
    this.showFilter = true;
  }

  onSearchCancel() {
    this.showFilter = false;
  }

  onSearchChanged() {
    const key = this.searchText != null ? this.searchText.trim() : '';
    const source = Array.isArray(this.data.localJsonData) ? this.data.localJsonData : [];

    this.searchResult = source.filter((item: any) =>
      `${item?.data?.name || ''}${item?.data?.desc || ''}${JSON.stringify(item?.data?.image || '')}`.indexOf(key) >= 0
    );
    this.searchResultCount = this.searchResult.length;
    this.displayResult = [];
    this.generateItems();
  }

  private generateItems() {
    this.displayResult = this.displayResult.concat(
      this.searchResult.splice(0, Math.min(this.searchResultCount, 100))
    );
  }

  cancel() {
    this.modalController.dismiss();
  }

  isAdded(like: any): boolean {
    return this.data.isStudyPlanAdded(like?.data?.id);
  }

  pickPlan(like: any) {
    const added = this.data.addStudyPlanFromCustomList(like);
    if (added) {
      this.modalController.dismiss({ added: true }, 'confirm');
    }
  }
}