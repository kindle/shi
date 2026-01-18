import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { DataService } from 'src/app/services/data.service';
import { GestureController, AnimationController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ShiTrackerComponent } from 'src/app/components/shi-tracker/shi-tracker.component';

@Component({
  selector: 'app-tracker-detail',
  templateUrl: './tracker-detail.page.html',
  styleUrls: ['./tracker-detail.page.scss'],
})
export class TrackerDetailPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('calendarContainer', { read: ElementRef }) calendarContainer: ElementRef | undefined;
  @ViewChild(ShiTrackerComponent) shiTracker: ShiTrackerComponent | undefined;

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendarDays: any[] = [];
  currentViewDate: Date = new Date();
  today: Date = new Date();
  
  // Display properties
  displayMonth: string = '';
  displayYear: number = 0;

  isModalOpen = false;
  selectedDateDetails: any[] = [];
  selectedDateStr: string = '';

  private trackerSub: Subscription | undefined;

  constructor(
    public ui: UiService,
    public dataService: DataService,
    private gestureCtrl: GestureController,
    private animationCtrl: AnimationController
  ) { }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl.create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl.create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '1', transform: 'scale(1)' }
      ]);

    return this.animationCtrl.create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  }

  ngOnInit() {
    this.trackerSub = this.dataService.trackerSubject.subscribe(() => {
      this.generateCalendar();
    });
    // this.resetMonth(); // generateCalendar calls implicitly via subscription? 
    // If subscription fires immediately (BehaviorSubject), it will call generateCalendar.
    // But let's call resetMonth to init dates correctly initially if subject is delayed or empty.
    this.resetMonth();
  }

  ngOnDestroy() {
    if (this.trackerSub) {
      this.trackerSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.initSwipeGesture();
  }

  initSwipeGesture() {
    if (this.calendarContainer) {
      const gesture = this.gestureCtrl.create({
        el: this.calendarContainer.nativeElement,
        gestureName: 'swipe',
        onEnd: ev => {
          if (ev.deltaX > 50) {
            this.prevMonth();
          } else if (ev.deltaX < -50) {
            this.nextMonth();
          }
        }
      });
      gesture.enable(true);
    }
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();
    
    this.displayYear = year;
    this.displayMonth = this.getMonthName(month);

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDayOfMonth.getDay(); 
    // Convert Sunday=0 to Monday=0, Sunday=6
    // JS: Sun=0, Mon=1...Sat=6
    // We want Mon=0, ... Sun=6
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // We need 6 rows * 7 cols = 42 cells
    // Calculate start date for the grid
    const startDate = new Date(year, month, 1);
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === month;
        const isToday = this.isSameDay(date, this.today);
        const isFuture = date > this.today; // Strictly future dates
        const dateStr = this.formatDate(date);
        const trackerValue = this.getTrackerValue(dateStr);

        this.calendarDays.push({
            date: date,
            day: date.getDate(),
            isCurrentMonth: isCurrentMonth,
            isToday: isToday,
            isFuture: isFuture,
            trackerValue: trackerValue,
            color: this.getColor(trackerValue),
            bgColor: trackerValue > 0 ? 'rgb(240, 242, 245)' : 'transparent'
        });
    }
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getTrackerValue(dateStr: string): number {
    const item = this.dataService.tracker.find((t: any) => t.date === dateStr);
    return item ? item.value : 0;
  }

  getColor(value: number): string {
    if (value < 1) return 'rgb(240,242,245)';
    if (value < 5) return 'rgb(155, 201, 255)';
    if (value < 10) return 'rgb(99, 172, 255)';
    if (value < 20) return 'rgb(56, 128, 255)';
    if (value >= 20) return 'rgb(30, 70, 150)';
    return 'rgb(240,242,245)'; // Default
  }

  getMonthName(monthIndex: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  }

  prevMonth() {
    this.currentViewDate.setMonth(this.currentViewDate.getMonth() - 1);
    this.currentViewDate = new Date(this.currentViewDate); // Trigger change detection
    this.generateCalendar();
  }

  nextMonth() {
    // Check if next month is in the future relative to today's month
    const nextMonthDate = new Date(this.currentViewDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    
    // We can view current month, but not future months? 
    // "when it' in current month, you can't swipe it to future month to the right"
    // So if currentViewDate is same month as today, we cannot go next.
    if (this.currentViewDate.getFullYear() === this.today.getFullYear() && 
        this.currentViewDate.getMonth() === this.today.getMonth()) {
        return;
    }
    
    this.currentViewDate.setMonth(this.currentViewDate.getMonth() + 1);
    this.currentViewDate = new Date(this.currentViewDate);
    this.generateCalendar();
  }

  onMonthSelected(event: {year: number, month: number}) {
    // Check if selected month is in the future relative to today
    const selectedDate = new Date(event.year, event.month, 1);
    const now = new Date();
    // Allow seeing current month or past months. 
    // Future months might not be relevant but no harm if handled by generateCalendar correctly (it just shows empty future days).
    
    this.currentViewDate = selectedDate;
    this.generateCalendar();
    
    // Scroll to calendar container
    if (this.calendarContainer) {
       this.calendarContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  resetMonth() {
    this.currentViewDate = new Date();
    this.generateCalendar();
  }
  
  canGoNext(): boolean {
      return !(this.currentViewDate.getFullYear() === this.today.getFullYear() && 
               this.currentViewDate.getMonth() === this.today.getMonth());
  }

  openDetails(day: any) {
    if (day.trackerValue <= 0) return;

    this.selectedDateStr = day.date.toLocaleDateString();
    const dateStr = this.formatDate(day.date);
    const trackerItem = this.dataService.tracker.find((t: any) => t.date === dateStr);
    
    if (trackerItem && trackerItem.details) {
      this.selectedDateDetails = trackerItem.details.map((d: any) => {
        let displayTime = '';
        if (d.time) {
          const date = new Date(d.time);
          displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        let content = d.content;
        if (d.name === 'ReadList') {
          const list = this.dataService.poemListData.find((e: any) => e.id == d.content);
          if (list) {
            content = list.name;
          }
        }
        if (d.name === 'ReadArticle') {
          const article = this.dataService.articleData.find((a: any) => a.id == d.content);
          if (article) {
            content = article.big_title;
          }
        }
        if (d.name === 'ReadPoem') {
          const poem = this.dataService.JsonData.find((p: any) => p.id == d.content);
          if (poem) {
            content = poem.title + " " + poem.author;
          }
        }

        return {
          ...d,
          content: content,
          displayTime: displayTime
        };
      });
      // Sort by time descending
      this.selectedDateDetails.sort((a: any, b: any) => {
         return new Date(b.time).getTime() - new Date(a.time).getTime();
      });
    } else {
      this.selectedDateDetails = [];
    }

    this.isModalOpen = true;
  }
}
