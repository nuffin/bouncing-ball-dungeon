import { _decorator, Animation, Component, EventKeyboard, Input, KeyCode, Node, Vec3, input, macro } from "cc";
const { ccclass, property } = _decorator;

import {
  DEFAULT_PLAYER_HEALTH_POINT,
  MAP_SPOT_SIZE,
  MoveDirection,
} from "../constants/common";
import { MapObject } from "../map/object";

interface PlayerProps {
  isPlayer: boolean;
  defaultLevelSteps: number;
  startX: number;
  startY: number;
  startZ: number;
  x: number;
  y: number;
  z: number;
}

@ccclass("PlayerControl")
export class PlayerControl extends Component {
  private _isPlayer: boolean = false;

  private _pace: number = 1;
  private _paceFactor: number = 1;
  private _direction: number = 0;
  private _isMoving: boolean = false;

  private _currentMoveSpeed: number = 0;
  private _currentMoveTime: number = 0;
  private _moveTime: number = 0.1;

  /** position in map */
  private _startX: number = 0;
  private _startY: number = 0;
  private _startZ: number = 0;
  private _currentX: number = 0;
  private _currentY: number = 0;
  private _currentZ: number = 0;

  private _startPos: Vec3 = new Vec3(0, 0, 0);
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  private _currentPos: Vec3 = new Vec3(0, 0, 0);
  private _targetPos: Vec3 = new Vec3(0, 0, 0);

  private _inputActive: boolean = false;

  /** game info */
  private _level: number = 1;
  private _defaultLevelSteps: number = 0;
  private _levelSteps: number = 0;

  private _isDead: boolean = false;
  private _hitPoint: number = DEFAULT_PLAYER_HEALTH_POINT;
  private _maxHitPoint: number = DEFAULT_PLAYER_HEALTH_POINT;
  private _hitPointHealingSteps: number = 0;
  private _dizzySteps: number = 0;
  private _movedSteps: number = 0;
  private _totalMovedSteps: number = 0;
  private _score: number = 0;

  private _hitPointTimer: number = 0;

  @property(Animation)
  public bodyAnim: Animation = null;

  public get isPlayer() {
    return this._isPlayer;
  }

  public get isMoving() {
    return this._isMoving;
  }

  public get startX() {
    return this._startX;
  }

  public get startY() {
    return this._startY;
  }

  public get startZ() {
    return this._startZ;
  }

  public get currentX() {
    return this._currentX;
  }

  public get currentY() {
    return this._currentY;
  }

  public get currentZ() {
    return this._currentZ;
  }

  public get inputActive() {
    return this._inputActive;
  }

  public get level() {
    return this._level;
  }

  public get levelSteps() {
    return this._levelSteps;
  }

  public get isDead() {
    return this._isDead;
  }

  public get hitPoint() {
    return this._hitPoint;
  }

  public get maxHitPoint() {
    return this._maxHitPoint;
  }

  public get hitPointHealingSteps() {
    return this._hitPointHealingSteps;
  }

  public get dizzySteps() {
    return this._dizzySteps;
  }

  public get movedSteps() {
    return this._movedSteps;
  }

  public get totalMovedSteps() {
    return this._totalMovedSteps;
  }

  public get score() {
    return this._score;
  }

  /** computed properties */

  public get isDizzy() {
    return this._dizzySteps > 0;
  }

  public get pace() {
    const pace = this.isDizzy ?  1 : this._pace;
    return pace;
  }

  start() {
    this.bodyAnim.on(Animation.EventType.FINISHED, this.moveEnd, this);
  }

  update(deltaTime: number) {
    if (this._isMoving) {
      this._currentMoveTime += deltaTime;
      if (this._currentMoveTime > this._moveTime) {
        this.node.setPosition(this._targetPos);
        this._isMoving = false;
        // this.onOnceMoveEnd();
      } else {
        this.node.getPosition(this._currentPos);
        switch (this._direction) {
          case MoveDirection.UP:
            this._deltaPos.y = this._currentMoveSpeed * deltaTime;
            break;
          case MoveDirection.DOWN:
            this._deltaPos.y = -this._currentMoveSpeed * deltaTime;
            break;
          case MoveDirection.LEFT:
            this._deltaPos.x = -this._currentMoveSpeed * deltaTime;
            break;
          case MoveDirection.RIGHT:
            this._deltaPos.x = this._currentMoveSpeed * deltaTime;
            break;
        }
        Vec3.add(this._currentPos, this._currentPos, this._deltaPos);
        this.node.setPosition(this._currentPos);
      }
    }
  }

  init(props: PlayerProps) {
    console.log(`PlayerControl::init: enter. props=`, props);
    this._isPlayer = props.isPlayer;
    this._defaultLevelSteps = props.defaultLevelSteps;
    this._startX = props.startX;
    this._startY = props.startY;
    this._startZ = props.startZ;
    this._startPos = new Vec3(MAP_SPOT_SIZE * this._startX, MAP_SPOT_SIZE * this._startY, MAP_SPOT_SIZE * this._startZ);

    this._levelSteps = this._defaultLevelSteps;

    this.reset();
  }

  reset() {
    this._currentX = this._startX;
    this._currentY = this._startY;
    this._currentZ = this._startZ;

    this._currentPos = new Vec3(this._startPos);
    this.node.setPosition(this._currentPos);

    this._pace = 1;
    this._paceFactor = 1;

    this._level = 0;
    this._levelSteps = this._defaultLevelSteps;
    this._isDead = false;
    this._hitPoint = DEFAULT_PLAYER_HEALTH_POINT;
    this._maxHitPoint = DEFAULT_PLAYER_HEALTH_POINT;
    this._hitPointHealingSteps = 0;
    this._movedSteps = 0;
    this._totalMovedSteps = 0;
    this._score = 0;
    this.setInputActive(true);
  }


  /** interaction */

  setInputActive(active: boolean) {
    console.log(`PlayerControl::setInputActive: active=${active}`);
    this._inputActive = active;
    if (active) {
      input.on(Input.EventType.KEY_DOWN, this.onKeyPressed, this);
      input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    } else {
      input.off(Input.EventType.KEY_DOWN, this.onKeyPressed, this);
      input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    this.onAccelerate(false);
  }

  onAccelerate(value: boolean) {
    this._pace = value ?  2 : 1;
  }

  onUp() {
    this.move(MoveDirection.UP);
  }

  onDown() {
    this.move(MoveDirection.DOWN);
  }

  onLeft() {
    this.move(MoveDirection.LEFT);
  }

  onRight() {
    this.move(MoveDirection.RIGHT);
  }

  onKeyPressed(event: EventKeyboard) {
    // console.log(`PlayerControl::onKeyPressed: keyCode=${event.keyCode}, event=`, event);
    if (this._isDead) {
      return;
    }
    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.ARROW_UP:
        this.onUp();
        break;
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        this.onDown();
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        this.onLeft();
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        this.onRight();
        break;
      case KeyCode.SHIFT_LEFT:
      case KeyCode.SHIFT_RIGHT:
        this.onAccelerate(true);
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    // console.log(`PlayerControl::onKeyUp: keyCode=${event.keyCode}, event=`, event);
    if (this._isDead) {
      return;
    }
    switch (event.keyCode) {
      case KeyCode.SHIFT_LEFT:
      case KeyCode.SHIFT_RIGHT:
        this.onAccelerate(false);
        break;
    }
  }

  move(direction: number) {
    if (this._isMoving || this._isDead) {
      return;
    }
    this._direction = direction;
    const pace = this.pace * this._paceFactor;
    this.node.emit("move", { direction, pace });
  }

  moveTo(x: number, y: number, z: number, deltaMapX: number, deltaMapY: number, deltaMapZ: number) {
    console.log(`PlayerControl::moveTo:`, {x, y, z}, `. this._currentX=${this._currentX}, this._currentY=${this._currentY}, this._currentPos=${this._currentPos}, this._pace=${this._pace}`);

    this.stopHitPointTimer();

    this._isMoving = true;
    this._currentMoveTime = 0;

    const clipName = "normal";
    if (this.bodyAnim) {
      const speed =  this.isDizzy ?  0.5 : 1;
      const state = this.bodyAnim.getState(clipName);
      state.speed = speed;
      this._moveTime = state.duration / speed;
    } else {
      this._moveTime = 1;
    }

    this._currentMoveSpeed = (this.pace * MAP_SPOT_SIZE) / this._moveTime;
    this.node.getPosition(this._currentPos);
    const deltaPos = new Vec3(deltaMapX, deltaMapY, deltaMapZ);
    Vec3.add(this._targetPos, this._currentPos, deltaPos);
    console.log(`PlayerControl::moveTo: deltaPos=${deltaPos}, this._currentPos=${this._currentPos}, this._targetPos=${this._targetPos}`);
    this._currentX = x;
    this._currentY = y;
    this._currentZ = z;

    this._deltaPos = new Vec3(0, 0, 0);

    if (this.bodyAnim) {
      this.bodyAnim.play(clipName);
    }

    console.log(`PlayerControl::moveTo: leave. this._currentX=${this._currentX}, this._currentY=${this._currentY}`);
  }

  moveEnd() {
    console.log(`PlayerControl::moveEnd: enter`);
    this.startHitPointTimer();
    this._isMoving = false;
    this._movedSteps += 1;
    this._totalMovedSteps += 1;
    this.node.emit("moveEnd");
  }

  /** game logic */

  dead() {
    console.log(`PlayerControl::dead: enter`);
    this._isDead = true;
    this.stopHitPointTimer();
    this.setInputActive(false);
    this.node.emit("dead");
  }

  checkDead() {
    if (this._hitPoint <= 0) {
      this._hitPoint = 0;
      this.dead();
    }
  }

  healing(hitPoint: number) {
    this._hitPoint += hitPoint;
    if (this._hitPoint > this._maxHitPoint) {
      this._hitPoint = this._maxHitPoint;
    }
  }

  autoHealing() {
    if (this._hitPoint < this._maxHitPoint) {
      if (this._hitPointHealingSteps < 5) {
        ++this._hitPointHealingSteps;
      }
      if (this._hitPointHealingSteps == 5) {
        this._hitPointHealingSteps = 0;
        this.healing(1);
      }
    }
  }

  scoreUp(score: number, bonus: number = 0) {
    this._score += score + bonus;
  }

  levelUp(levelSteps?: number) {
    this._level += 1;
    this._levelSteps = levelSteps ?? this._levelSteps * this._level * this._level;
    this._movedSteps = 0;
  }

  startHitPointTimer() {
    if (this._hitPointTimer) {
      return;
    }
    this._hitPointTimer = setInterval(() => {
      this._hitPoint -= 1;
      // if (this._level === 0) {
      //   this.notificationBarCtrl.fadeIn(`停止不动，体力会降低的哦~`, NotificationLevel.Warning);
      // }
      if (this._hitPoint < 0) {
        this._hitPoint = 0;
      }
      // this.updateBoardDisplay();
      if (this._hitPoint <= 0) {
        this.stopHitPointTimer();
      }
      this.node.emit("idle");
      this.checkDead();
    }, 2000);
  }

  stopHitPointTimer() {
    if (this._hitPointTimer) {
      clearInterval(this._hitPointTimer);
      this._hitPointTimer = 0;
    }
  }

  onMeetMapObject(hitPoint: number, maxHitPoint: number, dizzySteps: number) {
    console.log(`PlayerControl::onMeetMapObject: hitPoint=${hitPoint}, maxHitPoint=${maxHitPoint}, dizzySteps=${dizzySteps}, this.hitPoint=${this.hitPoint}`);
    if (this._isDead) {
      return;
    }
    hitPoint = hitPoint > 0 ?  Math.min(hitPoint, this._maxHitPoint - this._hitPoint) : Math.max(hitPoint, -this._hitPoint);
    maxHitPoint = maxHitPoint || 0;
    dizzySteps = dizzySteps || (this.isDizzy ?  -1 : 0);
    const damage = this._hitPoint > 0 ?  this._hitPoint : 0;
    this._maxHitPoint += maxHitPoint;
    this._hitPoint += hitPoint;
    this._dizzySteps += dizzySteps;
    if (this._dizzySteps < 0) {
      this._dizzySteps = 0;
    }
    this.checkDead();
    return {
      damage,
      hitPoint,
      maxHitPoint,
      dizzySteps,
    };
  }
}
