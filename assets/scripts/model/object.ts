import { _decorator, CCInteger, Color, Component, Label, Node, Prefab, SpriteFrame, instantiate } from "cc";
const { ccclass, property } = _decorator;

import { MapObjectCategory } from "../constants/common";
import { MapObjectType } from "../constants/object";


@ccclass("MapObjectData")
export class MapObjectData {
  @property
  category: MapObjectCategory = MapObjectCategory.MOC_NONE;
  @property
  type: MapObjectType = MapObjectType.None;
  @property(Prefab)
  prefab: Prefab | null = null;
  // @property
  // iconColor: number[] = [255, 255, 255, 0]; /** r, g, b, [a] */
  @property
  useCustomIconColor: boolean = false;
  @property(Color)
  iconColor: Color = new Color(255, 255, 255, 255);
  @property(SpriteFrame)
  iconSF: SpriteFrame | null = null;
  @property
  hitPoint: number = 0;
  @property
  public maxHitPoint: number = 0;
  @property
  dizzySteps: number = 0;
}
