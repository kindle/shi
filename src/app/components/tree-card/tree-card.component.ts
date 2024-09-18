import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-tree-card',
  templateUrl: './tree-card.component.html',
  styleUrls: ['./tree-card.component.scss'],
})
export class TreeCardComponent  implements OnInit {

  @Input() section?: any;
  @Input() sub?: any;
  @Input() title?: any;

  constructor(
    public data : DataService,
    public ui: UiService,
    private router: Router,
  ) { }

  

  loonglist(){
    this.router.navigate(['/tabs/tab5/list'], {
    });
  }

  game(id:any){
    // this.router.navigate([`/tabs/tab1/game-audio/${id}`], {
    //   queryParams: {
    //   }
    // });
    this.router.navigate(['game-audio'], {
      queryParams: {
        id:id
      }
    });
  }

  canvas:any;
  ctx:any;
  WIDTH:any;
  HEIGHT:any;
  mouseMoving = false;
  mouseMoveChecker:any;
  mouseX:any;
  mouseY:any;
  stars:any = []
  initStarsPopulation = 80;
  dots:any = [];
  dotsMinDist = 2
  maxDistFromCursor = 50;

  

  ngOnInit(): void {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.setCanvasSize();
    this.init();
  }

  setCanvasSize() {
      this.WIDTH = document.documentElement.clientWidth;
      this.HEIGHT = document.documentElement.clientHeight;

      this.canvas.setAttribute("width", this.WIDTH);
      this.canvas.setAttribute("height", this.HEIGHT);
  }

  init() {
      this.ctx.strokeStyle = "white";
      this.ctx.shadowColor = "white";
      for (var i = 0; i < this.initStarsPopulation; i++) {
          this.stars[i] = new Star(
            i, 
            Math.floor(Math.random() * this.WIDTH), 
            Math.floor(Math.random() * this.HEIGHT), 
            this.ctx,
            this.HEIGHT,
            this.stars
          );
          //stars[i].draw();
      }
      this.ctx.shadowBlur = 0;
      this.animate();
  }

  animate() {
      this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

      for (var i in this.stars) {
          this.stars[i].move();
      }
      for (var i in this.dots) {
          this.dots[i].move();
      }
      
      window.requestAnimationFrame(()=>{this.animate()});
  }

  
  degToRad(deg:any) {
      return deg * (Math.PI / 180);
  }
}

class Star{
  private id: any;
  private x:any;
  private y:any;
  private r:any;
  private color:any;
  private ctx:any;
  private HEIGHT: any;
  private stars:any;

  public constructor(id:any, x:any, y:any, ctx:any, HEIGHT:any, stars:any) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.HEIGHT = HEIGHT;
    this.stars = stars;
    this.r = Math.floor(Math.random() * 2) + 1;
    var alpha = (Math.floor(Math.random() * 10) + 1) / 10 / 2;
    this.color = "rgba(255,255,255," + alpha + ")";
  }

  public draw(): void {
    this.ctx.fillStyle = this.color;
    this.ctx.shadowBlur = this.r * 2;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    this.ctx.closePath();
    this.ctx.fill();
  }

  public move = (): void => {
    this.y -= .15;
    if (this.y <= -10) this.y = this.HEIGHT + 10;
    this.draw();
  }

  public die = (): void => {
      this.stars[this.id] = null;
      delete this.stars[this.id];
  }
}