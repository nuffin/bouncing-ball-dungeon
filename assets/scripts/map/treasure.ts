import { _decorator, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

import { MapObjectType, MapObjectDict } from "../constants/object";
import { TreasureData } from "../model/treasure";
import { MapObject } from "./object";

@ccclass("Treasure")
export class Treasure extends MapObject {
  get labelString() {
    const la = [
      `${this.hitPoint}`,
      `${this.maxHitPoint}`,
    ];
    if (this.dizzySteps > 0) {
      la.push(`${this.dizzySteps}`);
    }
    return la.join(" / ");
  }

  start() {}

  update(deltaTime: number) {}

  init(data: TreasureData, x: number, y: number, showLabel: boolean = false) {
    // console.log(`Treasure::init: enter. index=${index}, data=`, data);
    super.init(data, x, y, showLabel);
  }

  updateLabel() {
    // console.log(`Treasure::updateLabel: enter. this.label=`, this.label, `, this.labelString: ${this.labelString}`)
    if (this.label) {
      const label = this.label.getComponent("cc.Label") as Label | null;
      if (label) {
        label.string = this.labelString;
      }
    }
  }
}