import { Component, Input, AfterViewInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-path',
  templateUrl: './card-path.component.html',
  styleUrls: ['./card-path.component.scss'],
})
export class CardPathComponent  implements AfterViewInit {

  @Input() source?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  constructor(
    public data : DataService,
    public ui: UiService,
  ) { }

  ngAfterViewInit() {
    this.setup();
    window.requestAnimationFrame(()=>{this.draw()});
  }

  rand(max:any) {
    return Math.floor((max) * Math.random());
  }

  setup() {
      var x = Math.floor(window.innerWidth / 2);
      var y = Math.floor(window.innerHeight / 2);

      this.canvas = document.getElementById(this.source+"_path");

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineWidth = 3;

      for (var i = 0; i < 500; i++) {
          this.walkers.push(new Walker(x, y, this.colors[this.rand(3)]));
      }
  }

  draw() {
    //this.walkers.forEach(this.drawEach);
    this.walkers.forEach((walker:any) => {
      this.drawEach(walker);
    });
    window.requestAnimationFrame(()=>{this.draw()});
  }

  canvas:any;
  ctx:any;
  walkers:any = [];

  colors:any = [
      "rgba(255, 0, 126, .1)",
      "rgba(86, 180, 255, .1)",
      "rgba(255, 165, 20, .1)"
  ];

  drawEach(walker:any) {
      var x = walker.x,
          y = walker.y;

      switch (this.rand(4)) {
          case 0:
              if (walker.x < this.canvas.width) x += 5;
              break;

          case 1:
              if (walker.x > 0) x -= 5;
              break;

          case 2:
              if (walker.y < this.canvas.height) y += 5;
              break;

          case 3:
              if (walker.y > 0) y -= 5;
              break;
      }

      this.ctx.strokeStyle = walker.color;

      this.ctx.beginPath();
      this.ctx.moveTo(walker.x, walker.y);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      walker.update(x, y);
  }


  
}

class Walker{
  private x:any;
  private y:any;
  private color:any;

  public constructor(x:any, y:any, color:any) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  public update = (x:any, y:any)=> {
    this.x = x;
    this.y = y;
  }
}
