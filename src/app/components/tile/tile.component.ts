import { Component, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
})
export class TileComponent implements AfterViewInit, OnDestroy {

  @Input() name?: string;
  @Input() arrow?: boolean;
  @Input() source?: any;

  private observer?: IntersectionObserver;
  private fallbackImageBySlideKey = new Map<string, string>();

  constructor(
    public ui: UiService,
    public data: DataService,
    private router: Router,
    private el: ElementRef
  ){}

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add('in-view');
          this.observer?.disconnect();
        }
      });
    }, { threshold: 0.1 });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  search(key:any){
    this.router.navigate(['/tabs/tab3'], {
      queryParams: {
        text:key,
        type:'tag'
      }
    });
  }

  getDefaultImage(s: any, i: number): string {
    const key = `${i}-${s?.src || s?.image || s?.text || s?.sub || ''}`;

    if (!this.fallbackImageBySlideKey.has(key)) {
      this.fallbackImageBySlideKey.set(key, this.data.getRandomTabNoBgImage());
    }

    return this.fallbackImageBySlideKey.get(key) || 'assets/img/tab1-nobg.png';
  }

}
