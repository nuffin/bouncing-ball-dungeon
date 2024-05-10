import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { MapObjectDict } from "../constants/object";
import { MonsterData } from "../model/monster";
import { MapObject } from './object';

@ccclass("Monster")
export class Monster extends MapObject {
  private _isDead: boolean = false;

  get isDead() {
    return this._isDead;
  }

  get labelString() {
    const la = [
      `${this.hitPoint}`,
    ];
    if (this.dizzySteps > 0) {
      la.push(`${this.dizzySteps}`);
    }
    return la.join(" / ");
  }

  start() {
    this.showLabel();
  }

  update(deltaTime: number) {}

  init(data: MonsterData, x: number, y: number, showLabel: boolean = false) {
    // console.log(`Monster::init: enter. index=${index}, data=`, data);
    super.init(data, x, y, showLabel);
  }

  updateLabel() {
    // console.log(`Monster::updateLabel: enter. this.label=`, this.label, `, this.labelString: ${this.labelString}`)
    if (this.label) {
      const label = this.label.getComponent("cc.Label") as Label | null;
      if (label) {
        label.string = this.labelString;
      }
    }
  }

  attacked(value: number) {
    // console.log(`Monster ${this._index} attacked ${value}. this.hitPoint: ${this._hitPoint}`);
    this._hitPoint -= value;
    if (this._hitPoint < 0) {
      this._hitPoint = 0;
    }
    if (this._hitPoint <= 0) {
      this._isDead = true;
    }
    this.showLabel();
  }

}


