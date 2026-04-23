import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-more-settings',
  templateUrl: './more-settings.page.html',
  styleUrls: ['./more-settings.page.scss'],
})
export class MoreSettingsPage implements OnInit {

  @ViewChild('importFileInput') importFileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public ui: UiService,
    public data: DataService,
    private ngZone: NgZone

  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    void this.data.checkRemoteFullDbVersionOnEnter();
  }

  mathfloor(n:any){
    return Math.floor(n);
  }

   async exportDataBackup(){
    await this.data.exportLocalDataBackup();
  }

  triggerImportFile(){
    if(this.importFileInput && this.importFileInput.nativeElement){
      this.importFileInput.nativeElement.value = '';
      this.importFileInput.nativeElement.click();
    }
  }

  onImportFileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    if(!input.files || input.files.length === 0){
      return;
    }
    const file = input.files[0];
    void this.importBackupFile(file);
  }

  private async importBackupFile(file: File){
    try{
      const text = await file.text();
      await this.ngZone.run(async () => {
        await this.data.importLocalDataBackupFromJson(text);
      });
    }catch(e){
      console.error('Import file read failed', e);
      await this.ngZone.run(async () => {
        this.ui.toast('bottom', '读取备份文件失败');
      });
    }
  }

  clearCache(){
    //this.ui.confirm('清除缓存', '确定要删除所有本地缓存数据吗？此操作不可恢复，应用将恢复到初始状态。', () => {
    this.ui.confirm(this.ui.instant('Settings.ClearCache'), this.ui.instant('Settings.ClearCacheMessage'), () => {
      this.onConfirmClearCache();
    });
  }

  private async onConfirmClearCache(){
    await this.data.clearLocalStorage();
    //this.ui.toast('bottom', '已清除缓存');
    this.ui.toast('bottom', this.ui.instant('Settings.ClearCacheSuccess'));
  }

}
