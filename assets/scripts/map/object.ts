import { _decorator, Color, Component, Label, Node, Sprite } from "cc";
const { ccclass, property } = _decorator;

import { MapObjectCategory } from "../constants/common";
import { MapObjectType, MapObjectDict } from "../constants/object";
import { MapObjectData } from "../model/object";

@ccclass("MapObject")
export class MapObject extends Component {
  protected __id: number = 0;
  protected _category: number = MapObjectCategory.MOC_NONE;
  protected _type: number = MapObjectType.None;
  protected _hitPoint: number = 0;
  private _maxHitPoint: number = 0;
  protected _dizzySteps: number = 0;
  protected _x: number = 0;
  protected _y: number = 0;

  @property({ type: Label })
  public label: Label | null = null;

  @property({ type: Sprite })
  public icon: Sprite | null = null;

  constructor() {
    super();
    this.__id = Math.floor(Math.random() * 10000000000);
  }

  get category() {
    return this._category;
  }

  get id() {
    return this.__id;
  }

  get type() {
    return this._type;
  }

  get hitPoint() {
    return this._hitPoint;
  }

  get maxHitPoint() {
    return this._maxHitPoint;
  }

  get dizzySteps() {
    return this._dizzySteps;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get labelString() {
    return `${this.x}:${this.y}`;
  }

  start() {}

  update(deltaTime: number) {}

  init(data: MapObjectData, x: number, y: number, showLabel: boolean = false) {
    console.log(`MapObject::init: enter. data=`, data, `, x=${x}, y=${y}, showLabel=${showLabel}`)
    this._type = data.type;
    if (data) {
      const props = MapObjectDict[this.type] || {};
      if (data.hitPoint === 0) {
        data.hitPoint = props.hitPoint;
      }
      this._hitPoint = data.hitPoint;
      const maxHitPoint = data.maxHitPoint || props.maxHitPoint || 0;
      this._maxHitPoint = Number(maxHitPoint);
      this._dizzySteps = data.dizzySteps;
      this.icon.spriteFrame = data.iconSF;
      if (data.useCustomIconColor && data.iconColor) {
        this.icon.color = data.iconColor;
      } else if (props.color) {
        this.icon.color = new Color(props.color[0], props.color[1], props.color[2], props.color[3]);
      }
    }
    this._x = x;
    this._y = y;
    if (showLabel) {
      this.showLabel();
    }
  }

  showLabel() {
    if (this.label) {
      this.label.node.active = true;
    }
    this.updateLabel();
  }

  updateLabel() {
    /** should be implemented in inherited class */
  }
}
