import { Layers } from "cc";

export enum GameLayers {
  BACKGROUND = Layers.Enum.GIZMOS,
  BASE = Layers.Enum.UI_3D,
  FOREGROUND = Layers.Enum.SCENE_GIZMO,
}

export enum MoveDirection {
  NONE = 0,
  UP,
  RIGHT,
  DOWN,
  LEFT,
}

export enum MapObjectCategory {
  MOC_RANDOM = -1,
  MOC_NONE = 0,
  MOC_PLAYER,
  MOC_STONE,
  MOC_MONSTER,
  MOC_TREASURE,
  MOC_DIZZY_OBJECT, // pseudo type
  // MOC_OBJECT,
};

export const MAP_SPOT_SIZE = 128;

export const DEFAULT_MAP_AREA_COLUMNS = 16;
export const DEFAULT_MAP_AREA_ROWS = 16;

export const DEFAULT_PLAYER_HEALTH_POINT = 10;
export const PLAYER_LEVEL_UP_HEALING = 5;
