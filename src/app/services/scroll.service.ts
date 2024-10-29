import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private scrollToTopSubject = new Subject<void>();

  scrollToTop$ = this.scrollToTopSubject.asObservable();

  triggerScrollToTop() {
    this.scrollToTopSubject.next();
  }
}