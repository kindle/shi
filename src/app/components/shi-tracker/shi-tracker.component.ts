import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

interface TrackerCell {
  date: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-shi-tracker',
  templateUrl: './shi-tracker.component.html',
  styleUrls: ['./shi-tracker.component.scss'],
})
export class ShiTrackerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() year: number = 2026;
  @Input() showActivity: boolean = true;
  
  weeks: TrackerCell[][] = [];
  months: { name: string, index: number }[] = [];
  availableYears: number[] = [];
  
  // 7 rows for days of the week (Sun to Sat)
  daysOfWeek = this.dataService.currentLocale=='zh-CN'?
  ['日', '一', '二', '三', '四', '五', '六']:
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  displayDays = [false, true, false, true, false, true, false]; // Show labels for Mon, Wed, Fri
  
  totalContributions: number = 0;
  private trackerSub: Subscription | undefined;

  constructor(
    public dataService: DataService, 
    private router:  Router,
    public ui: UiService,
  ) { }

  ngOnInit() {
    this.trackerSub = this.dataService.trackerSubject.subscribe(() => {
      this.extractYears();
      this.generateGrid();
      this.resetActivityFeed();
    });
  }

  ngOnDestroy() {
    if (this.trackerSub) {
      this.trackerSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['year']) {
      this.generateGrid();
    }
  }

  extractYears() {
    // Extract unique years from tracker data
    const trackerData: any[] = this.dataService.tracker;
    const years = new Set<number>(trackerData.map((d: any) => parseInt(d.date.substring(0, 4))));
    // Ensure current input year is in the list if not present
    years.add(this.year);
    this.availableYears = Array.from(years).sort((a: number, b: number) => b - a);
  }

  onYearChange(event: any) {
    this.year = event.detail.value;
    this.generateGrid();
    this.resetActivityFeed();
  }

  generateGrid() {
    const startDate = new Date(this.year, 0, 1);
    const endDate = new Date(this.year, 11, 31);
    
    // Determine the starting day of the week (0=Sun, 6=Sat)
    const startDay = startDate.getDay(); 
    
    // Create an array mapping date string to value
    const dataMap = new Map<string, number>();
    const trackerData: any[] = this.dataService.tracker;
    
    const todayStr = this.formatDate(new Date());
    
    this.totalContributions = 0;
    trackerData.forEach((item: any) => {
      dataMap.set(item.date, item.value);
      if (parseInt(item.date.substring(0, 4)) === this.year && item.date <= todayStr) {
        this.totalContributions += item.value;
      }
    });

    this.weeks = [];
    let currentWeek: TrackerCell[] = [];
    
    // Pad the first week if the year doesn't start on Sunday
    for (let i = 0; i < startDay; i++) {
        currentWeek.push({ date: '', value: -1, color: 'transparent' });
    }

    const loopDate = new Date(startDate);
    while (loopDate <= endDate) {
        if (currentWeek.length === 7) {
            this.weeks.push(currentWeek);
            currentWeek = [];
        }

        const dateStr = this.formatDate(loopDate);
        const value = dataMap.get(dateStr) || 0;
        currentWeek.push({
            date: dateStr,
            value: value,
            color: this.getColor(value)
        });

        loopDate.setDate(loopDate.getDate() + 1);
    }

    // Fill the last week
    while (currentWeek.length < 7) {
        currentWeek.push({ date: '', value: -1, color: 'transparent' });
    }
    this.weeks.push(currentWeek);

    // Calculate month labels positions
    this.months = [];
    const monthNames = 
    this.dataService.currentLocale=='zh-CN'?
    ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']:
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Simple month positioning: find the first week that has a day in the month
    for(let m = 0; m < 12; m++) {
        // Find first occurrence of this month in the weeks
        for(let w = 0; w < this.weeks.length; w++) {
             const hasDayInMonth = this.weeks[w].some(cell => {
                 if(!cell.date) return false;
                 return new Date(cell.date).getMonth() === m;
             });
             
             // Check if this month is already added to avoid duplicates if a week spans two months, 
             // typically we label the month when significant portion or start of month appears.
             // Github logic: label appears roughly above the first week containing the 1st of the month?
             // Or simplified: Just place it.
             
             // Let's check specifically for the first day of month or first appearance
             const firstDayOfMonth = this.weeks[w].find(cell => cell.date && new Date(cell.date).getMonth() === m && new Date(cell.date).getDate() <= 7);
             if (firstDayOfMonth && !this.months.find(mo => mo.name === monthNames[m])) {
                 this.months.push({ name: monthNames[m], index: w });
             }
        }
    }
  }

  getColor(value: number): string {
    if (value < 1) return 'rgb(240,242,245)';
    if (value < 5) return 'rgb(155, 201, 255)';
    if (value < 10) return 'rgb(99, 172, 255)';
    if (value < 20) return 'rgb(56, 128, 255)';
    if (value >= 20) return 'rgb(30, 70, 150)';
    return 'rgb(240,242,245)';
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  // Transpose weeks to rows for display if needed, but flex/grid column is easier.
  // GitHub uses column-major order (weeks are cols).
  // So we render a flex container of columns (weeks), each column has 7 cells.


  activityFeed: { monthName: string, year: number, count: number }[] = [];
  searchDate: Date | null = null;

  resetActivityFeed() {
    this.activityFeed = [];
    // Start searching from the end of the selected year
    // If selected year is current year, start from today
    // If selected year is past, start from Dec 31
    const now = new Date();
    if (this.year === now.getFullYear()) {
      this.searchDate = now;
    } else {
      this.searchDate = new Date(this.year, 11, 31);
    }
    
    // Load the first active month
    this.loadMoreActivity();
  }

  loadMoreActivity() {
    if (!this.searchDate) return;

    let found = false;
    let loopCount = 0;
    
    // Check if there is any data before current search date
    // If we can't find anything in the past, searchDate should become null
    
    // We search month by month backwards
    while (!found && loopCount < 120) { // Search up to 10 years back
      const y = this.searchDate.getFullYear();
      const m = this.searchDate.getMonth();

      const count = this.getMonthlyCount(y, m);
      if (count > 0) {
        const monthNames = this.dataService.currentLocale === 'zh-CN' ?
          ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'] :
          ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.activityFeed.push({
          monthName: monthNames[m],
          year: y,
          count: count
        });
        found = true;
      }

      // Move to previous month for next iteration
      this.searchDate.setDate(1); 
      this.searchDate.setMonth(this.searchDate.getMonth() - 1);
      
      loopCount++;
    }

    // After adding a month, check if there is ANY more data in the past
    // If not, set searchDate to null to hide the button
    if (!this.hasMoreDataBefore(this.searchDate)) {
      this.searchDate = null;
    }
  }

  hasMoreDataBefore(date: Date): boolean {
    if (!date) return false;
    
    // Using string comparison for simplicity 'YYYY-MM-DD'
    // Create a boundary date string for the 1st day of the next month to check
    // Wait, we want to check if there is any data BEFORE or ON the given date (which is end of prev month kind of)
    
    // Actually, simple check: iterate all tracker data, parse date, if any date is BEFORE (year < y OR (year=y AND month<=m))
    // We already moved searchDate to the previous month at the end of loadMoreActivity loop
    // So we just check if any tracker date is earlier or equal to searchDate's month end?
    // Actually simpler: check if any tracker item has date <= searchDate
    
    // searchDate is currently set to the 1st of the month we are ABOUT to check next
    // so we look for any data with date < (1st of searchDate's month + 1 month)?
    // No, searchDate is already set to the previous month.
    // e.g. We just showed Dec 2025. searchDate became Nov 1, 2025.
    // We want to know if there is any data in Nov 2025 or before.
    // So check if any tracker date <= last day of Nov 2025?
    // Data is stored as 'YYYY-MM-DD'.
    
    // Let's just convert searchDate to YYYY-MM
    // And check if there is any record that is <= that month
    
    // However, exact date calculation might be safer.
    // Let's check if there is any record with date < (searchDate's next month start)
    
    const checkDate = new Date(date.getFullYear(), date.getMonth() + 1, 1); // 1st of next month of current searchDate
    // So if searchDate is Nov 1, checkDate is Dec 1. We want records < Dec 1.
    // Wait, if searchDate is Nov 1, we are about to look at Nov.
    // We want to know if there is anything left to find starting from Nov 1 downwards.
    
    const trackerData: any[] = this.dataService.tracker;
    const checkTs = checkDate.getTime();
    
    return trackerData.some((item: any) => {
      const parts = item.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.getTime() < checkTs;
    });
  }

  getMonthlyCount(year: number, month: number): number {
    let count = 0;
    const trackerData: any[] = this.dataService.tracker;
    trackerData.forEach((item: any) => {
      const d = new Date(item.date);
      // Note: item.date is 'YYYY-MM-DD', new Date() works but be careful of timezone if not UTC
      // Better to split string
      const parts = item.date.split('-');
      const iYear = parseInt(parts[0]);
      const iMonth = parseInt(parts[1]) - 1; // 0-based
      
      if (iYear === year && iMonth === month) {
        count += item.value;
      }
    });
    return count;
  }

  details(){

  }
}

