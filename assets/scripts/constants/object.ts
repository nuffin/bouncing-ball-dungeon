export enum MapObjectType {
  None = 0,

  Player,  /** common.MapObjectType.MOC_PLAYER */
  Stone,    /** common.MapObjectType.MOC_STONE */

  /** monsters */
  DefaultMonster = 3000,
  Snake,
  Ghost,

  /** treasures */
  DefaultTreasure = 4000,
  Gold,
  Silver,
  HealingPotion,
  StunPotion,
  SomePotion,       /** position */
}

export const MonsterTypes: MapObjectType[] = [
  // MapObjectType.DefaultMonster,
  MapObjectType.Snake,
  MapObjectType.Ghost,
];

export const TreasureTypes: MapObjectType[] = [
  // MapObjectType.DefaultTreasure,
  MapObjectType.Gold,
  MapObjectType.Silver,
  MapObjectType.HealingPotion,
  MapObjectType.StunPotion,
];

export interface MapObjectProps {
  name: string;
  type: MapObjectType;
  color?: number[];
  hitPoint?: number;
  [prop: string]: string | number | (string | number)[];
}

export type MapObjectDictType = { [key in MapObjectType]: MapObjectProps };

export const MapObjectDict: Partial<MapObjectDictType> = {
  [MapObjectType.None]: {
    name: "None",
    type: MapObjectType.None,
    hitPoint: 0,
  },

  /** Treasures */
  [MapObjectType.DefaultTreasure]: {
    name: "Default Treasure",
    type: MapObjectType.DefaultTreasure,
    hitPoint: 0,
  },
  [MapObjectType.Gold]: {
    name: "Gold",
    type: MapObjectType.Gold,
    hitPoint: 0,
    maxHitPoint: 5,
  },
  [MapObjectType.Silver]: {
    name: "Silver",
    type: MapObjectType.Silver,
    hitPoint: 0,
    maxHitPoint: 2,
  },
  [MapObjectType.HealingPotion]: {
    name: "Healing Potion",
    type: MapObjectType.HealingPotion,
    hitPoint: 10,
  },
  [MapObjectType.StunPotion]: {
    name: "Stun Potion",
    type: MapObjectType.StunPotion,
    hitPoint: -5,
  },
  [MapObjectType.SomePotion]: {
    name: "Some Potion",
    type: MapObjectType.StunPotion,
    hitPoint: 5,
  },

  /** Monsters */
  [MapObjectType.DefaultMonster]: {
    name: "Default Monster",
    type: MapObjectType.DefaultMonster,
    hitPoint: 0,
  },
  [MapObjectType.Snake]: {
    name: "Snake",
    type: MapObjectType.Snake,
    hitPoint: 3,
  },
  [MapObjectType.Ghost]: {
    name: "Ghost",
    type: MapObjectType.Ghost,
    color: [255, 255, 255, 255],
    hitPoint: 5,
  },
};
