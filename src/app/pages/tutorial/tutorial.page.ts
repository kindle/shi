import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {

  setLocale(locale:any){
    this.data.saveLocale(locale);
    this.ui.loadTranslate(locale);
  }

  constructor(
    public ui: UiService,
    public data: DataService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  home(){
    this.router.navigate(['/'], {
      queryParams: {}
    });
  }

}
