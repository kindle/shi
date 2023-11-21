import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Injectable()
export class EventService {
  public myEvent = new EventEmitter();

  constructor() { }

  triggerMyEvent(data: any) {
    this.myEvent.emit(data);
  }
}
