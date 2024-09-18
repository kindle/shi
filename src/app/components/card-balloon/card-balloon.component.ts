import { Component, Input, AfterViewInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-balloon',
  templateUrl: './card-balloon.component.html',
  styleUrls: ['./card-balloon.component.scss'],
})
export class CardBalloonComponent implements AfterViewInit {

  @Input() source?: any;
  @Input() sub?: any;
  @Input() title?: any;

  constructor(
    public data : DataService,
    public ui: UiService,
  ) { }

  ngAfterViewInit() {
    this.setup();
  }

  canvas:any;
  ctx:any;
  frames = 0;
  requestId:any = null;
  rad = (Math.PI / 180);
  kappa = 0.5522847498;

  x:any
  y:any

  bc:any
  bCtx:any;

  cw:any;
  cx:any;
  ch:any;
  cy:any;

  balloons:any = [];

  Draw() {
      this.updateBallons(this.bCtx);

      this.ctx.clearRect(0, 0, this.cw, this.ch);
      var img = this.bc;
      this.ctx.drawImage(img, 0, 0);

      this.requestId = window.requestAnimationFrame(()=>{this.Draw()});
  }

  setup() {
      this.canvas = document.getElementById(this.source+"_balloon");
      this.ctx = this.canvas.getContext("2d");
      this.bc = document.createElement("canvas");
      this.bCtx = this.bc.getContext("2d");
      this.cw = this.canvas.width = this.bc.width = window.innerWidth;
      this.cx = this.cw / 2;
      this.ch = this.canvas.height = this.bc.height = window.innerHeight + 100;
      this.cy = this.ch;

      this.bCtx.strokeStyle = "#abcdef";
      this.bCtx.lineWidth = 1;

      if (this.requestId) {
          window.cancelAnimationFrame(this.requestId);
          this.requestId = null;
      }
      this.cw = this.canvas.width = this.bc.width = window.innerWidth;
      this.cx = this.cw / 2;
      this.ch = this.canvas.height = this.bc.height = window.innerHeight + 100;
      this.cy = this.ch;
      this.bCtx.strokeStyle = "#abcdef";
      this.bCtx.lineWidth = 1;
      this.Draw();
  }

  max = 5;
  updateBallons(ctx:any) {
      this.frames += 1;
      if (this.frames % this.max == 0 && this.balloons.length < this.max) {
          let balloon = new Balloon(this.cw, this.ch);
          this.balloons.push(balloon);
      }
      ctx.clearRect(0, 0, this.cw, this.ch);

      for (let i = 0; i < this.balloons.length; i++) {
          let b = this.balloons[i];
          if (b.y > -b.a) {
              b.y -= b.speed
          } else {
              b.y = parseInt(this.ch + b.r + b.R);
          }

          var p = this.thread(b, ctx);
          b.cx = p.x;
          b.cy = p.y - b.R;
          ctx.fillStyle = this.Grd(p.x, p.y, b.r, b.hue)
          this.drawBalloon(b, ctx);
      }
  }

  drawBalloon(b:any, ctx:any) {
      var or = b.r * this.kappa; // offset

      var p1 = {
          x: b.cx - b.r,
          y: b.cy
      }
      var pc11 = {
          x: p1.x,
          y: p1.y + or
      }
      var pc12 = {
          x: p1.x,
          y: p1.y - or
      }

      var p2 = {
          x: b.cx,
          y: b.cy - b.r
      }
      var pc21 = {
          x: b.cx - or,
          y: p2.y
      }
      var pc22 = {
          x: b.cx + or,
          y: p2.y
      }

      var p3 = {
          x: b.cx + b.r,
          y: b.cy
      }
      var pc31 = {
          x: p3.x,
          y: p3.y - or
      }
      var pc32 = {
          x: p3.x,
          y: p3.y + or
      }

      var p4 = {
          x: b.cx,
          y: b.cy + b.R
      };
      var pc41 = {
          x: p4.x + or,
          y: p4.y
      }
      var pc42 = {
          x: p4.x - or,
          y: p4.y
      }

      var t1 = {
          x: p4.x + .2 * b.r * Math.cos(70 * this.rad),
          y: p4.y + .2 * b.r * Math.sin(70 * this.rad)
      }
      var t2 = {
          x: p4.x + .2 * b.r * Math.cos(110 * this.rad),
          y: p4.y + .2 * b.r * Math.sin(110 * this.rad)
      }

      //balloon
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.bezierCurveTo(pc42.x, pc42.y, pc11.x, pc11.y, p1.x, p1.y);
      ctx.bezierCurveTo(pc12.x, pc12.y, pc21.x, pc21.y, p2.x, p2.y);
      ctx.bezierCurveTo(pc22.x, pc22.y, pc31.x, pc31.y, p3.x, p3.y);
      ctx.bezierCurveTo(pc32.x, pc32.y, pc41.x, pc41.y, p4.x, p4.y);
      //knot
      ctx.lineTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.closePath();
      ctx.fill();
  }

  thread(b:any, ctx:any) {
      this.ctx.beginPath();

      for (var i = b.a; i > 0; i -= 1) {
          var t = i * this.rad;
          this.x = b.x + b.pm * 50 * Math.cos(b.k * t - this.frames * this.rad)
          this.y = b.y + b.pm * 25 * Math.sin(b.k * t - this.frames * this.rad) + 50 * t
          ctx.lineTo(this.x, this.y)
      }
      this.ctx.stroke();
      return {
          x: this.x,
          y: this.y
      }
  }

  Grd(x:any, y:any, r:any, hue:any) {
      let grd = this.ctx.createRadialGradient(x - .5 * r, y - 1.7 * r, 0, x - .5 * r, y - 1.7 * r, r);
      grd.addColorStop(0, 'hsla(' + hue + ',100%,65%,.95)');
      grd.addColorStop(0.4, 'hsla(' + hue + ',100%,45%,.85)');
      grd.addColorStop(1, 'hsla(' + hue + ',100%,25%,.80)');
      return grd;
  }

  
  
}

class Balloon{
  private r:any;
  private R:any;
  private x:any;
  private y:any;
  private a:any;
  private pm:any;
  private speed:any;
  private k:any;
  private hue:any;

  public constructor(cw:any, ch:any) {
    this.r = this.randomIntFromInterval(20, 70);
    this.R = 1.4 * this.r;
    this.x = this.randomIntFromInterval(this.r, cw - this.r);
    this.y = ch + 2 * this.r;
    this.a = this.r * 4.5;
    this.pm = Math.random() < 0.5 ? -1 : 1;
    this.speed = this.randomIntFromInterval(1.5, 4);
    this.k = this.speed / 5;
    this.hue = this.pm > 0 ? "210" : "10";
  }

  public randomIntFromInterval = (mn:any, mx:any)=> {
    return ~~(Math.random() * (mx - mn + 1) + mn);
  }
}

