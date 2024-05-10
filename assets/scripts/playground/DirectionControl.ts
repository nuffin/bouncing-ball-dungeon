import {
  _decorator,
  Color,
  Component,
  EventKeyboard,
  Input,
  KeyCode,
  Node,
  Sprite,
  input,
} from 'cc';
const { ccclass, property } = _decorator;

import { PlayerControl } from "../player/PlayerControl";

enum Direction {
    None = 0,
    UP = 1,
    RIGHT = 2,
    LEFT = 3,
    DOWN = 4,
}

@ccclass("DirectionControl")
export class DirectionControl extends Component {
  private _sprite: Sprite | null = null;
  private _color: Color | null = null;
  @property
  public isShift: boolean = false;
  @property
  public direction: Direction = Direction.None;
  @property({ type: PlayerControl })
  public playerCtrl: PlayerControl | null = null; // 角色控制器

  start() {
    this._sprite = this.node.getComponent("cc.Sprite") as Sprite | null;
    this._color = new Color(this._sprite?.color);
    // console.log(`DirectionControl::start: enter. this.isShift=${this.isShift}, this.direction=${this.direction}, this._color=`, this._color);
    if (this.playerCtrl) {
      /** for pc */
      input.on(Input.EventType.KEY_DOWN, this.onKeyPressed, this);
      input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

      /** for pc */
      this.node.on(Input.EventType.MOUSE_DOWN, this.onPress, this);
      this.node.on(Input.EventType.MOUSE_UP, this.onRelease, this);
      /** for mobile */
      this.node.on(Input.EventType.TOUCH_START, this.onPress, this);
      this.node.on(Input.EventType.TOUCH_END, this.onRelease, this);
      this.node.on(Input.EventType.TOUCH_MOVE, this.onMove, this);
      this.node.on(Input.EventType.TOUCH_CANCEL, this.onCancel, this);
    }
  }

  update(deltaTime: number) {}

  onKeyPressed(event: EventKeyboard) {
    // console.log(`PlayerControl.onKeyPressed: keyCode=${event.keyCode}, event=`, event);
    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.ARROW_UP:
        if (this.direction === Direction.UP) {
          this.showPressed(true);
        }
        break;
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        if (this.direction === Direction.DOWN) {
          this.showPressed(true);
        }
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        if (this.direction === Direction.LEFT) {
          this.showPressed(true);
        }
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        if (this.direction === Direction.RIGHT) {
          this.showPressed(true);
        }
        break;
      case KeyCode.SHIFT_LEFT:
      case KeyCode.SHIFT_RIGHT:
        if (this.isShift) {
          this.showPressed();
        }
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    // console.log(`PlayerControl.onKeyUp: keyCode=${event.keyCode}, event=`, event);
    switch (event.keyCode) {
      case KeyCode.SHIFT_LEFT:
      case KeyCode.SHIFT_RIGHT:
        if (this.isShift) {
          this.showReleased();
        }
        break;
    }
  }

  showPressed(autoRelease: boolean = false) {
    if (this._sprite) {
      this._sprite.color = new Color("A0A0A080");
    }
    if (autoRelease) {
      setTimeout(() => {
        this.showReleased();
      }, 100);
    }
  }

  showReleased() {
    if (this._sprite && this._color) {
      this._sprite.color = this._color;
    }
  }

  onPress() {
    console.log(`DirectionControl::onPress: enter. this.isShift=${this.isShift}, this.direction=${this.direction}`);
    if (this.playerCtrl?.inputActive) {
      this.showPressed();
      if (!this.playerCtrl.isMoving && !this.playerCtrl.isMoving) {
        if (this.isShift) {
          this.playerCtrl.onAccelerate(true);
        } else {
          switch (this.direction) {
            case Direction.UP:
              this.playerCtrl.onUp();
              break;
            case Direction.RIGHT:
              this.playerCtrl.onRight();
              break;
            case Direction.LEFT:
              this.playerCtrl.onLeft();
              break;
            case Direction.DOWN:
              this.playerCtrl.onDown();
              break;
          }
          // setTimeout(() => {
          //   this.showReleased();
          // }, 500);
        }
      }
    }
  }

  onRelease() {
    console.log(`DirectionControl::onRelease: enter. this.isShift=${this.isShift}, this.direction=${this.direction}, this._color=`, this._color);
    if (this.playerCtrl?.inputActive) {
      this.showReleased();
      if (!this.playerCtrl.isMoving && !this.playerCtrl.isMoving) {
        if (this.isShift) {
          this.playerCtrl.onAccelerate(false);
        }
      }
    }
  }

  onMove(ev: any) {
    // console.log(`DirectionControl::onMove: enter. ev=`, ev);
  }

  onCancel(ev: any) {
    console.log(`DirectionControl::onCancel: enter. ev=`, ev);
    this.onRelease();
  }
}


