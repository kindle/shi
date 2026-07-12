import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

interface RoadEntity {
  id: number;
  type: 'traffic' | 'construction';
  x: number;
  y: number;
  width: number;
  height: number;
  speedFactor: number;
  color?: string;
  laneTarget?: number;
  laneChangeCooldown?: number;
}

@Component({
  selector: 'app-roadfighter',
  templateUrl: './roadfighter.page.html',
  styleUrls: ['./roadfighter.page.scss'],
})
export class RoadfighterPage implements OnInit, OnDestroy {
  gameState: 'ready' | 'running' | 'won' | 'lost' = 'ready';
  statusMessage = '按开始按钮，冲刺终点。';

  readonly finishDistance = 3600;
  readonly maxFuel = 100;

  fuel = this.maxFuel;
  distance = 0;
  score = 0;
  speed = 42;

  playerX = 0;
  readonly playerY = 88;
  readonly playerWidth = 0.34;
  readonly playerHeight = 8.5;

  entities: RoadEntity[] = [];
  roadOffset = 0;

  leftPressed = false;
  rightPressed = false;

  skidActive = false;
  skidDirection: -1 | 1 = 1;
  skidTimer = 0;
  rescueProgress = 0;
  rescueDirection: -1 | 1 = -1;

  private gameLoopId: ReturnType<typeof setInterval> | null = null;
  private spawnTimer = 0;
  private elapsedSeconds = 0;
  private nextEntityId = 1;

  private readonly lanes = [-0.62, -0.2, 0.2, 0.62];

  ngOnInit() {
    this.resetGame();
  }

  ngOnDestroy() {
    this.stopLoop();
  }

  ionViewWillLeave() {
    this.stopLoop();
  }

  startGame() {
    this.resetGame();
    this.gameState = 'running';
    this.statusMessage = '油量有限，注意诡异变道与施工障碍。';
    this.startLoop();
  }

  resetGame() {
    this.stopLoop();
    this.gameState = 'ready';
    this.statusMessage = '按开始按钮，冲刺终点。';

    this.fuel = this.maxFuel;
    this.distance = 0;
    this.score = 0;
    this.speed = 42;
    this.playerX = 0;

    this.entities = [];
    this.roadOffset = 0;
    this.spawnTimer = 0;
    this.elapsedSeconds = 0;

    this.skidActive = false;
    this.skidTimer = 0;
    this.rescueProgress = 0;
    this.rescueDirection = -1;
  }

  moveLeft(down: boolean) {
    this.leftPressed = down;
  }

  moveRight(down: boolean) {
    this.rightPressed = down;
  }

  onRoadTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const inLeft = touch.clientX < window.innerWidth / 2;
    this.leftPressed = inLeft;
    this.rightPressed = !inLeft;
  }

  onRoadTouchEnd() {
    this.leftPressed = false;
    this.rightPressed = false;
  }

  trackByEntity(_: number, entity: RoadEntity) {
    return entity.id;
  }

  getEntityClass(entity: RoadEntity) {
    return {
      traffic: entity.type === 'traffic',
      construction: entity.type === 'construction',
      skidding: this.skidActive,
    };
  }

  private startLoop() {
    if (this.gameLoopId) {
      return;
    }

    const dt = 1 / 30;
    this.gameLoopId = setInterval(() => {
      this.update(dt);
    }, dt * 1000);
  }

  private stopLoop() {
    if (!this.gameLoopId) {
      return;
    }
    clearInterval(this.gameLoopId);
    this.gameLoopId = null;
  }

  private update(dt: number) {
    if (this.gameState !== 'running') {
      return;
    }

    this.elapsedSeconds += dt;
    this.speed = Math.min(62, 42 + this.elapsedSeconds * 0.8);
    this.roadOffset = (this.roadOffset + this.speed * dt * 1.2) % 100;

    this.updateSteering(dt);
    this.updateSkid(dt);
    this.updateFuelAndDistance(dt);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnEntity();
      this.spawnTimer = this.randomBetween(0.45, 1.05);
    }

    this.updateEntities(dt);
    this.checkCollisions();
    this.cleanupEntities();

    if (this.distance >= this.finishDistance) {
      this.winGame();
      return;
    }

    if (this.fuel <= 0) {
      this.loseGame('汽油耗尽，离终点还差一点。');
    }
  }

  private updateSteering(dt: number) {
    const steerSpeed = this.skidActive ? 0.45 : 1.35;
    if (this.leftPressed) {
      this.playerX -= steerSpeed * dt;
    }
    if (this.rightPressed) {
      this.playerX += steerSpeed * dt;
    }

    if (this.playerX < -0.96 || this.playerX > 0.96) {
      this.loseGame('你冲出公路，比赛结束。');
      return;
    }

    this.playerX = Math.max(-0.9, Math.min(0.9, this.playerX));
  }

  private updateSkid(dt: number) {
    if (!this.skidActive) {
      return;
    }

    this.skidTimer -= dt;
    this.playerX += this.skidDirection * dt * 0.75;

    const correctPressed =
      (this.rescueDirection === -1 && this.leftPressed) ||
      (this.rescueDirection === 1 && this.rightPressed);

    if (correctPressed) {
      this.rescueProgress += dt;
      if (this.rescueProgress >= 0.4) {
        this.skidActive = false;
        this.rescueProgress = 0;
        this.fuel = Math.min(this.maxFuel, this.fuel + 7);
        this.score += 120;
        this.statusMessage = '救车成功，高手操作 +120';
      }
    }

    if (this.skidTimer <= 0) {
      this.loseGame('侧滑失控，车辆撞毁。');
    }
  }

  private updateFuelAndDistance(dt: number) {
    const fuelDrain = 3.4 + this.speed * 0.045;
    this.fuel = Math.max(0, this.fuel - fuelDrain * dt);

    const advance = this.speed * 3.1 * dt;
    this.distance = Math.min(this.finishDistance, this.distance + advance);
    this.score += Math.floor(advance * 0.8);
  }

  private spawnEntity() {
    const makeConstruction = Math.random() < 0.24;
    const lane = this.lanes[Math.floor(Math.random() * this.lanes.length)];

    if (makeConstruction) {
      this.entities.push({
        id: this.nextEntityId++,
        type: 'construction',
        x: lane,
        y: -12,
        width: 0.42,
        height: 9,
        speedFactor: this.randomBetween(0.55, 0.75),
      });
      return;
    }

    const colors = ['#f8e45c', '#54d1ff', '#ffffff', '#65ff8d'];
    this.entities.push({
      id: this.nextEntityId++,
      type: 'traffic',
      x: lane,
      y: -12,
      width: 0.34,
      height: 8.5,
      speedFactor: this.randomBetween(0.78, 1.1),
      color: colors[Math.floor(Math.random() * colors.length)],
      laneTarget: lane,
      laneChangeCooldown: this.randomBetween(0.7, 1.8),
    });
  }

  private updateEntities(dt: number) {
    for (const entity of this.entities) {
      entity.y += this.speed * entity.speedFactor * dt;

      if (entity.type === 'traffic') {
        const target = entity.laneTarget ?? entity.x;
        entity.x += (target - entity.x) * dt * 3.4;

        entity.laneChangeCooldown = (entity.laneChangeCooldown ?? 0) - dt;
        if ((entity.laneChangeCooldown ?? 0) <= 0) {
          const currentIndex = this.closestLaneIndex(entity.x);
          const shift = Math.random() < 0.5 ? -1 : 1;
          const nextIndex = Math.max(0, Math.min(this.lanes.length - 1, currentIndex + shift));
          entity.laneTarget = this.lanes[nextIndex];
          entity.laneChangeCooldown = this.randomBetween(0.7, 1.8);
        }
      }
    }
  }

  private checkCollisions() {
    for (const entity of this.entities) {
      if (!this.hitTest(entity)) {
        continue;
      }

      if (entity.type === 'construction') {
        this.loseGame('撞上施工障碍，车辆报废。');
        return;
      }

      this.entities = this.entities.filter((item) => item.id !== entity.id);
      this.score = Math.max(0, this.score - 180);

      if (!this.skidActive) {
        this.triggerSkid();
      } else {
        this.loseGame('连续碰撞，赛车失去控制。');
      }
      return;
    }
  }

  private cleanupEntities() {
    this.entities = this.entities.filter((entity) => entity.y < 120);
  }

  private triggerSkid() {
    this.skidActive = true;
    this.skidDirection = Math.random() < 0.5 ? -1 : 1;
    this.skidTimer = 1.4;
    this.rescueProgress = 0;
    this.rescueDirection = this.skidDirection === -1 ? 1 : -1;
    this.statusMessage = this.rescueDirection === -1
      ? '车辆右甩，立刻向左修正方向。'
      : '车辆左甩，立刻向右修正方向。';
  }

  private hitTest(entity: RoadEntity) {
    const overlapX = Math.abs(this.playerX - entity.x) * 2 < (this.playerWidth + entity.width) * 0.92;
    const overlapY = Math.abs(this.playerY - entity.y) < (this.playerHeight + entity.height) * 0.48;
    return overlapX && overlapY;
  }

  private closestLaneIndex(x: number) {
    let index = 0;
    let minDist = Number.MAX_VALUE;
    for (let i = 0; i < this.lanes.length; i++) {
      const distance = Math.abs(x - this.lanes[i]);
      if (distance < minDist) {
        minDist = distance;
        index = i;
      }
    }
    return index;
  }

  private winGame() {
    this.gameState = 'won';
    this.statusMessage = '冲线成功，红色跑车安全到达终点。';
    this.stopLoop();
  }

  private loseGame(message: string) {
    this.gameState = 'lost';
    this.statusMessage = message;
    this.stopLoop();
  }

  private randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      this.leftPressed = true;
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      this.rightPressed = true;
      event.preventDefault();
      return;
    }

    if (event.key === ' ' && this.gameState !== 'running') {
      this.startGame();
      event.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyup(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      this.leftPressed = false;
      return;
    }

    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      this.rightPressed = false;
    }
  }
}
