import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;

  setLocale(locale:any){
    this.data.saveLocale(locale);
    this.ui.loadTranslate(locale);
  }

  constructor(
    public ui: UiService,
    public data: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    const id = this.route.snapshot.queryParams['id'];
    if (id && this.swiperRef?.nativeElement.swiper) {
      this.swiperRef.nativeElement.swiper.slideTo(id - 1, 0);
    }
  }

  home(){
    this.ui.goback();

    // this.router.navigate(['/'], {
    //   queryParams: {}
    // });
  }

}
