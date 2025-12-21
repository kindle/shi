import { Component, Input, AfterViewInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-card-wave',
  templateUrl: './card-wave.component.html',
  styleUrls: ['./card-wave.component.scss'],
})
export class CardWaveComponent implements AfterViewInit {

  @Input() source?: any;
  @Input() sub?: any;
  @Input() title?: any;
  @Input() viewer?: any = false;

  constructor(
    public data : DataService,
    public ui: UiService,
  ) { }

  ngAfterViewInit() {
    let curves = new Curves();
    curves.init(document.getElementById(this.source+"_wave"));
    curves.startRender();
  }
}

class Curves
{
    private raf_ID = 0;

    private canvas:any = document.createElement('canvas');
    private ctx:any = this.canvas.getContext('2d');

    private width = window.innerWidth;
    private height = window.innerHeight;

    private colors = [
        '#e67e22', '#d35400', '#e74c3c', '#c0392b', '#f39c12', '#d35400'
    ];
    private position = {
        x: 0,
        y: this.height / 2
    };
    private shapes = this.generateShapes(6, this.height / 2, this.width / 20);

    public constructor() {
        
    }

    public startRender = ()=>{
        this.render();
    }

    public stopRender = ()=>{
        window.cancelAnimationFrame(this.raf_ID);
    }

    public generateShapes(num:any, yCenter:any, spacing:any) {
        var shapes = [];
        for (var i = 0; i < num; i += 1) {
            var points = [];
            var offset = 0;
            for (var x = 0; x <= this.width + this.width / 4; x += spacing) {
                var angle = Math.random() * 360;
                if (i === 0) offset = 20 + Math.random() * 40 - 50;
                if (i === 1) offset = 80 + Math.random() * 60 - 50;
                if (i === 2) offset = 110 + Math.random() * 80 - 50;
                if (i === 3) offset = 150 + Math.random() * 100 - 50;
                if (i === 4) offset = 200 + Math.random() * 130 - 50;
                if (i === 5) offset = 250 + Math.random() * 170 - 50;
                offset -= x / 20;
                var point = {
                    x: x,
                    y: yCenter + offset + 10 + Math.random() * 20,
                    oldY: yCenter + offset,
                    angle: angle,
                    speed: 0.025
                };
                points.push(point);
            }
            var shape = new Shape(points, this.colors[i]);
            shapes.push(shape);
        }
        //console.log(shapes)
        return shapes;
    }

    public init = (parent:any)=> {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.top = "-250px";
        this.canvas.style.left = "0";
        this.canvas.style.position = "absolute"
        parent.appendChild(this.canvas);
        this.ctx.fillStyle = '#111';
        this.startRender();
        window.onresize = ()=> {
            this.resize();
        };
    }

    public render = ()=> {
        this.raf_ID = window.requestAnimationFrame(this.render);
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.shapes.forEach((shape:any)=> {
            shape.render(this.ctx, this.width, this.height);
        });
    }

    public resize = () => {
        this.canvas.width = this.width = window.innerWidth;
        this.canvas.height = this.height = window.innerHeight;
    }
}

class Shape
{
    private points:any;
    private color:any;

    public constructor(points:any, color:any) {
        this.points = points;
        this.color = color;
    }

    public render = (ctx:any, width:any, height:any)=> {
        var self = this;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        this.points.forEach((point:any, i:any)=> {
            ctx.beginPath();
            ctx.font = '14px Arial';
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        });
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        this.points.forEach((point:any, i:any)=> {
            point.y = point.oldY + Math.sin(point.angle) * 35;
            point.angle += point.speed;
            var nextPoint = self.points[i + 1];
            if (nextPoint) {
                var ctrlPoint = {
                    x: (point.x + nextPoint.x) / 2,
                    y: (point.y + nextPoint.y) / 2
                };
                ctx.quadraticCurveTo(point.x, point.y, ctrlPoint.x, ctrlPoint.y);
            }
        });
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();

        ctx.restore();
    };
}

