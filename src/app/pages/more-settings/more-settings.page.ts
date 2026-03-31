import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Data } from '@angular/router';
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
    public data: DataService

  ) { }

  ngOnInit() {
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
    const reader = new FileReader();
    reader.onload = async () => {
      const text = (reader.result || '') as string;
      await this.data.importLocalDataBackupFromJson(text);
    };
    reader.readAsText(file, 'utf-8');
  }

}
