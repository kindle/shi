import { Component, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
})
export class AuthorComponent implements AfterViewInit, OnDestroy {

  @Input() name?: string;
  @Input() source?: any;
  @Input() relation?: any;

  private observer?: IntersectionObserver;

  constructor(
    public data: DataService,
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

    this.observer?.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
