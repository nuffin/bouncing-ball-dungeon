import { _decorator, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

import { MapObjectData } from "../model/object";
import { MapObject } from "./object";

@ccclass("Stone")
export class Stone extends MapObject {
  start() {}

  update(deltaTime: number) {}

  init(data: MapObjectData, x: number, y: number, showLabel: boolean = false) {
    // console.log(`Stone::init: enter. column: ${column}, row: ${row}`);
    super.init(data, x, y, showLabel);
  }

  updateLabel() {
    // console.log(`Stone::updateLabel: enter. this.label=`, this.label, `, this.labelString: ${this.labelString}`)
    if (this.label) {
      const label = this.label.getComponent("cc.Label") as Label | null;
      if (label) {
          label.string = this.labelString;
      }
    }
  }
}
