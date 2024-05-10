import {
  _decorator,
  CCInteger,
  Camera,
  Component,
  Label,
  Node,
  Prefab,
  instantiate,
  sys,
} from "cc";
const { ccclass, property } = _decorator;

import { GeneralDialog } from "../dialog/GeneralDialog";
import {
  DEFAULT_MAP_AREA_COLUMNS,
  DEFAULT_MAP_AREA_ROWS,
  MapObjectCategory,
  MoveDirection,
  MAP_SPOT_SIZE,
  PLAYER_LEVEL_UP_HEALING,
} from "../constants/common";
import {
  MapObjectType,
} from "../constants/object";
import { Monster } from "../map/monster";
import { MapObject } from "../map/object";
import { Stone } from "../map/stone";
import { Treasure } from "../map/treasure";
import { MapObjectData } from "../model/object";
import { MonsterData } from "../model/monster";
import { TreasureData } from "../model/treasure";
import { PlayerControl } from "../player/PlayerControl";

import { DirectionControl } from "./DirectionControl";
import { GameDataStore } from "./GameDataStore";
import { NotificationBarControl, NotificationLevel } from "./NotificationBarControl";

const Fibs = (() => {
  const fibs = [0, 1];
  for (let i = 2; i < 1000; i++) {
    fibs[i] = fibs[i - 1] + fibs[i - 2];
  }
  return fibs;
})();

const DEFAULT_TOTAL_STEPS = 10;

const MapObjectClassMap = {
  [MapObjectCategory.MOC_STONE]: Stone,
  [MapObjectCategory.MOC_MONSTER]: Monster,
  [MapObjectCategory.MOC_TREASURE]: Treasure,
  [MapObjectCategory.MOC_DIZZY_OBJECT]: MapObject,
};

class MapObjectInfo {
  readonly id: number;
  x: number;
  y: number;
  category: MapObjectCategory;
  node: Node | null = null;

  constructor(category: MapObjectCategory, x: number, y: number, node: Node = null) {
    this.id = Math.floor(Math.random() * 10000000000);
    this.x = x;
    this.y = y;
    this.category = category;
    this.node = node;
  }
}

type MapType = { [key: number]: { [key: number]: MapObjectInfo } };

interface MoveInfo {
  mapObjectInfo: MapObjectInfo;
  pace: number;
  damage: number;
  canMove: boolean;
  hitPoint: number;
  maxHitPoint: number;
  dizzySteps: number;
};

@ccclass("PlaygroundControl")
export class PlaygroundControl extends Component {
  /** game */
  private _gameData: GameDataStore = GameDataStore.instance;

  private _prefabMap: Partial<{ [key in MapObjectCategory]: Prefab }> = {};
  private _mapObjectTypeDataMap: Partial<{ [key in MapObjectCategory]: (MapObjectData | MonsterData | TreasureData)[] }> = {};

  private _totalSteps: number = DEFAULT_TOTAL_STEPS;

  /** map */
  private _columns: number = DEFAULT_MAP_AREA_COLUMNS;
  private _rows: number = DEFAULT_MAP_AREA_ROWS;

  private _map: MapType;
  private _stones: { [key: number]: MapObjectInfo } = {};  // index array
  private _objects: { [key: number]: MapObjectInfo } = {}; // index array
  private _emptySpots: { x: number, y: number }[] = [];

  private _playerMoves: MoveInfo[] = [];

  @property({ type: Camera })
  public camera: Camera | null = null;

  @property({ type: Prefab })
  public dungeonPrefab: Prefab | null = null;

  @property({ type: Node })
  public dungeon: Node | null = null;

  @property({ type: Label })
  public hitPointLabel: Label | null = null;

  @property({ type: Label })
  public jumpStepsLabel: Label | null = null;

  @property({ type: Label })
  public scoreLabel: Label | null = null;

  @property({ type: Label })
  public levelsLabel: Label | null = null;

  @property({ type: PlayerControl })
  public playerCtrl: PlayerControl | null = null;

  @property({ type: Prefab })
  public stonePrefab: Prefab | null = null;

  @property([MapObjectData])
  public stonesData: MapObjectData[] = [];

  @property({ type: Prefab })
  public monsterPrefab: Prefab | null = null;

  @property([MonsterData])
  public monstersData: MonsterData[] = [];

  @property({ type: Prefab })
  public treasurePrefab: Prefab | null = null;

  @property([TreasureData])
  public treasuresData: TreasureData[] = [];

  @property({ type: Prefab })
  public dizzyObjectPrefab: Prefab | null = null;

  @property([MapObjectData])
  public dizzyObjectsData: MapObjectData[] = [];

  @property({ type: CCInteger })
  public mapAreaColumns: number = DEFAULT_MAP_AREA_COLUMNS;

  @property({ type: CCInteger })
  public mapAreaRows: number = DEFAULT_MAP_AREA_ROWS;

  @property({ type: Node })
  public dialog: Node | null = null; // 开始的 UI

  @property({ type: GeneralDialog })
  public generalDialog: GeneralDialog | null = null;

  @property([DirectionControl])
  public directionControls: DirectionControl[] = [];

  @property(NotificationBarControl)
  public notificationBarCtrl: NotificationBarControl | null = null;

  get objectCount() {
    return Math.floor(this._emptySpots.length / 8); // Math.floor(Math.sqrt(this._columns * this._rows / 4));
  }

  start() {
    // //视图中canvas尺寸
    // console.log("canvas size:", view.getCanvasSize());
    // //视图中窗口可见区域尺寸
    // console.log("visible Size:", view.getVisibleSize());
    // //设计分辨率
    // console.log("DesignResolutionSize Size:", view.getDesignResolutionSize());
    // //屏幕尺寸 - deprecated, 屏幕实际尺寸，没什么用处（？）
    // console.log("frame size", view.getFrameSize());
    this._gameData = GameDataStore.instance;
    this._gameData.load();
    this._prefabMap[MapObjectCategory.MOC_STONE] = this.stonePrefab;
    this._prefabMap[MapObjectCategory.MOC_MONSTER] = this.monsterPrefab;
    this._prefabMap[MapObjectCategory.MOC_TREASURE] = this.treasurePrefab;
    this._prefabMap[MapObjectCategory.MOC_DIZZY_OBJECT] = this.dizzyObjectPrefab;
    this._mapObjectTypeDataMap[MapObjectCategory.MOC_STONE] = this.stonesData;
    this._mapObjectTypeDataMap[MapObjectCategory.MOC_MONSTER] = this.monstersData;
    this._mapObjectTypeDataMap[MapObjectCategory.MOC_TREASURE] = this.treasuresData;
    this._mapObjectTypeDataMap[MapObjectCategory.MOC_DIZZY_OBJECT] = this.dizzyObjectsData;
    this.init();
    this.playerCtrl?.node.on("move", this.onPlayerMove, this);
    this.playerCtrl?.node.on("moveEnd", this.onPlayerMoveEnd, this);
    this.playerCtrl?.node.on("idle", this.onPlayerIdle, this);
    this.playerCtrl?.node.on("dead", this.onPlayerDead, this);
  }

  update(deltaTime: number) {}

  init() {
    this.playerCtrl.init({
      isPlayer: true,
      defaultLevelSteps: this._totalSteps,
      startX: 0,
      startY: 0,
      startZ: 0,
      x: 0,
      y: 0,
      z: 0,
    });
    this.resetPlayer();
    this._map = {} as MapType;
    this._stones = {};
    this._objects = {};
    this._emptySpots = [];
    this._columns = this.mapAreaColumns;
    this._rows = this.mapAreaRows;
    this.generateNewbieMap();
  }

  reset() {
    this.resetPlayer();
    this.resetMap();
  }

  resetPlayer() {
    this.showNotification("请点击方向键控制角色移动~", NotificationLevel.Notice);
    this.playerCtrl.reset();
    this.updateBoardDisplay();
  }

  failed() {
    if (this.dialog) {
      this.generalDialog.showFailed({
        onConfirm: () => {
        },
        onClose: () => {
          this.reset();
        }
      });
    }
  }

  private _autoGenerateMapObjects() {
    // TODO
  }

  updateBoardDisplay() {
    if (this.hitPointLabel) {
      this.hitPointLabel.string = `体力: ${this.playerCtrl.hitPoint}/${this.playerCtrl.maxHitPoint}/${this.playerCtrl.dizzySteps}`;
    }
    if (this.jumpStepsLabel) {
      this.jumpStepsLabel.string = `跳动: ${this.playerCtrl.movedSteps}/${this.playerCtrl.levelSteps}`;
    }
    if (this.scoreLabel) {
      this.scoreLabel.string = `得分: ${this.playerCtrl.score}`;
    }
    if (this.levelsLabel) {
      this.levelsLabel.string = `过关: ${this.playerCtrl.level}`;
    }
  }

  /**
   * Player
   */

  showNotification(message: string, notificationLevel: NotificationLevel = NotificationLevel.Notice, needHide: boolean = false) {
    needHide = needHide || notificationLevel !== NotificationLevel.Notice;
    if (needHide) {
      this.notificationBarCtrl.hide();
    }
    this.notificationBarCtrl.fadeIn(message, notificationLevel);
  }

  showNewBieNotification(hitPoint: number, maxHitPoint: number, dizzySteps: number) {
    if (maxHitPoint > 0) {
      this.showNotification(`体力上限增加 ${maxHitPoint}~`, NotificationLevel.Luck);
    } else if (dizzySteps > 0) {
      this.showNotification(`眩晕 ${dizzySteps} 步！`, NotificationLevel.Warning);
    } else if (this.playerCtrl.isDizzy && dizzySteps < 0) {
      this.showNotification(`眩晕恢复 ${-dizzySteps} 步~`, NotificationLevel.Luck);
    } else if (hitPoint > 0) {
      this.notificationBarCtrl.fadeIn(`体力增加 ${hitPoint}`, NotificationLevel.Notice);
    } else if (hitPoint < 0) {
      this.showNotification(`受到攻击！体力减少 ${-hitPoint}`, NotificationLevel.Warning);
    }
  }

  updateHitPoint(hitPoint: number, maxHitPoint: number, dizzySteps: number) {
    const result = this.playerCtrl.onMeetMapObject(hitPoint, maxHitPoint, dizzySteps);
    hitPoint = result.hitPoint;
    maxHitPoint = result.maxHitPoint;
    dizzySteps = result.dizzySteps;
    this.updateBoardDisplay();
    if (this.playerCtrl.level < 3) {
      this.showNewBieNotification(hitPoint, maxHitPoint, dizzySteps);
    }
    return result;
  }

  updateScore(
    steps: number,
    bonus: number = 0,
  ) {
    this.playerCtrl.scoreUp(steps * 10, bonus); // TODO: 默认得分，待细化
    this.updateBoardDisplay();
  }

  beforeMoveToMapObject(mapObjectInfo: MapObjectInfo, pace: number) {
    const moveInfo = {
      mapObjectInfo,
      pace,
      damage: this.playerCtrl.hitPoint,
      canMove: mapObjectInfo?.category === MapObjectCategory.MOC_NONE,
      hitPoint: 0,
      maxHitPoint: 0,
      dizzySteps: 0,
    };
    if (!mapObjectInfo) {
      moveInfo.canMove = false;
      return moveInfo;
    }
    if (mapObjectInfo.category === MapObjectCategory.MOC_NONE) {
      return moveInfo;
    }
    const o = mapObjectInfo.node.getComponent(MapObject);
    if (o instanceof Treasure) {
      const treasure = o;
      moveInfo.canMove = true;
      moveInfo.hitPoint = treasure.hitPoint;
      moveInfo.maxHitPoint = treasure.maxHitPoint;
      moveInfo.dizzySteps = treasure.dizzySteps;
    } else if (o instanceof Monster) {
      const monster = o;
      moveInfo.canMove = this.playerCtrl.hitPoint >= monster.hitPoint;
      moveInfo.hitPoint = -monster.hitPoint;
      moveInfo.dizzySteps = monster.dizzySteps;
    }
    return moveInfo;
  }

  afterMoveToMapObject(moveInfo: MoveInfo) {
    console.log(`PlaygroundControl::afterMoveToMapObject: enter: moveInfo=`, moveInfo);
    const mapObjectInfo = moveInfo.mapObjectInfo;
    this.updateHitPoint(moveInfo.hitPoint, moveInfo.maxHitPoint, moveInfo.dizzySteps);
    if (mapObjectInfo.category === MapObjectCategory.MOC_NONE) {
      this.playerCtrl.autoHealing();
    } else if (mapObjectInfo.category === MapObjectCategory.MOC_MONSTER) {
      const monster = mapObjectInfo.node.getComponent(Monster);
      monster.attacked(moveInfo.damage);
      const movedSteps = monster.isDead ?  moveInfo.pace : 0;
      this.updateScore(movedSteps, moveInfo.damage * 10);
    } else if (mapObjectInfo.category === MapObjectCategory.MOC_TREASURE) {
      this.updateScore(moveInfo.pace);
    }
  }

  onPlayerMove(params: any) {
    if (this.playerCtrl.level === 0 && this.playerCtrl.movedSteps === 0) {
      this.showNotification("请注意你的体力和体力上限~");
    }
    const { direction, pace = 1 } = params;
    console.log(`PlaygroundControl::onPlayerMove: ${direction}, ${pace}`);
    let deltaX = 0;
    let deltaY = 0;
    let nextX = this.playerCtrl.currentX;
    let nextY = this.playerCtrl.currentY;
    switch (direction) {
      case MoveDirection.UP:
        nextY = nextY + pace;
        deltaY = MAP_SPOT_SIZE * pace;
        break;
      case MoveDirection.DOWN:
        nextY = nextY - pace;
        deltaY = -MAP_SPOT_SIZE * pace;
        break;
      case MoveDirection.LEFT:
        nextX = nextX - pace;
        deltaX = -MAP_SPOT_SIZE * pace;
        break;
      case MoveDirection.RIGHT:
        nextX = nextX + pace;
        deltaX = MAP_SPOT_SIZE * pace;
        break;
    }

    console.log(`PlaygroundControl::onPlayerMove: move to ${nextX}, ${nextY}, delta=`, { deltaX, deltaY}, `, this._map[${nextX}][${nextY}]=`, this._map[nextX][nextY]);
    const mapObjectInfo = this._map[nextX][nextY];
    if (!mapObjectInfo) {
      return;
    }
    const moveInfo = this.beforeMoveToMapObject(mapObjectInfo, pace);
    if (mapObjectInfo.category !== undefined) {
      if (mapObjectInfo.category === MapObjectCategory.MOC_NONE) {
        this.playerCtrl?.moveTo(nextX, nextY, 0, deltaX, deltaY, 0);
        this._playerMoves.push(moveInfo);
      } else if (mapObjectInfo.category === MapObjectCategory.MOC_MONSTER || mapObjectInfo.category === MapObjectCategory.MOC_TREASURE) {
        if (moveInfo.canMove) {
          this.playerCtrl?.moveTo(nextX, nextY, 0, deltaX, deltaY, 0);
          this._playerMoves.push(moveInfo);
        } else {
          this.afterMoveToMapObject(moveInfo);
        }
        if (sys.platform === 'WECHAT_GAME' && window['wx']?.vibrateLong) {
          window['wx'].vibrateShort();
        }
      }
    }
  }

  onPlayerMoveEnd(params: any) {
    const moveInfo = this._playerMoves.pop();
    const { pace, mapObjectInfo } = moveInfo;
    this.afterMoveToMapObject(moveInfo);
    if (mapObjectInfo.category === MapObjectCategory.MOC_MONSTER
        || mapObjectInfo.category === MapObjectCategory.MOC_TREASURE
      ) {
      this.removeMapObject(mapObjectInfo);
    }
    if (this.playerCtrl.movedSteps >= this.playerCtrl.levelSteps) {
      if (this.playerCtrl.level === 0) {
        if (this.dialog) {
          this.directionControls.map(item => item.showReleased());
          this.playerCtrl.setInputActive(false);
          this.playerCtrl.stopHitPointTimer();
          this.generalDialog.showSuccess({
            onConfirm: () => {
              this.resetMap(false);
              // this.expandMap();
            },
            onCancel: () => {
              // TODO: all monster move quickly, and potion laugh
            },
            onClose: () =>{
              this.playerCtrl.setInputActive(true);
            }
          });
        }
      }
      this.playerCtrl.healing(PLAYER_LEVEL_UP_HEALING);
      this.playerCtrl.levelUp(this._totalSteps);
      this._totalSteps = Fibs[this.playerCtrl.level + 1] * DEFAULT_TOTAL_STEPS;
      this.updateBoardDisplay();
    } else {
      if (this.playerCtrl.level > 0) {
        this.expandMap();
      }
    }
  }

  onPlayerIdle() {
    this.updateBoardDisplay();
    if (this.playerCtrl.level === 0) {
      this.notificationBarCtrl.fadeIn(`停止不动，体力会降低的哦~`, NotificationLevel.Warning);
    }
  }

  onPlayerDead() {
    this.failed();
  }

  /**
   *  Map
   */

  resetMap(useNewbieMap: boolean = true) {
    Object.keys(this._map).map((i) => {
      Object.keys(this._map[i]).map((j) => {
        const mapObjectInfo = this._map[i][j];
        if (mapObjectInfo.node) {
          this.dungeon.removeChild(mapObjectInfo.node);
        }
      });
    });
    this._map = {} as MapType;
    this._stones = {};
    this._objects = {};
    this._emptySpots = [];
    this._columns = this.mapAreaColumns;
    this._rows = this.mapAreaRows;

    if (useNewbieMap) {
      this.generateNewbieMap();
    } else {
      this.generateMap();
      this.generateMapObjects(this.objectCount);
    }
  }

  /**
   *
   * case 1: random + undefined: expand map to visible area
   * case 2: random + n: expand map n round randomly
   * case 3: !random + undefined: expand map to visible area and set to mapObjectType
   * case 3: !random + n: expand map n and set to mapObjectType
   */
  expandMap(mapObjectCategory: MapObjectCategory = MapObjectCategory.MOC_RANDOM, count?: number) {
    if (count === undefined) {
      const playerX = this.playerCtrl.currentX;
      const playerY = this.playerCtrl.currentY;
      const halfX = Math.floor(this._rows / 2);
      const halfY = Math.floor(this._columns / 2);
      console.log(`PlaygroundControl::expandMap: playerX=${playerX}, playerY=${playerY}, halfX=${halfX}, halfY=${halfY}`);

      if (halfX - Math.abs(playerX) < 7) {
        count = 7 - (halfX - Math.abs(playerX));
      } else if (halfY - Math.abs(playerY) < 10) {
        count = 10 - (halfY - Math.abs(playerY));
      } else {
        count = 0;
      }
    }
    console.log(`PlaygroundControl::expandMap: count=${count}`);
    if (count === undefined) {
      count;
    }
    if (count === 0) {
      return;
    }
    this._columns += count * 2;
    this._rows += count * 2;
    console.log(`PlaygroundControl::expandMap: this._columns=${this._columns}, this._rows=${this._rows}`);
    if (mapObjectCategory === MapObjectCategory.MOC_RANDOM) {
      this.generateMap();
      this.generateMapObjects(this.objectCount);
    } else {
      const halfX = Math.floor(this._rows / 2);
      const halfY = Math.floor(this._columns / 2);
      for (let x = -halfX; x <= halfX; ++x) {
        if (!this._map[x]) {
          this._map[x] = {};
        }
        for (let y = -halfY; y <= halfY; ++y) {
          if (mapObjectCategory === MapObjectCategory.MOC_DIZZY_OBJECT) {
            console.log(`PlaygroundControl::expandMap: x=${x}, y=${y}, this._map[x][y]=`, this._map[x][y]);
          }
          if (!this._map[x][y]) {
            this.generateMapObject(x, y, mapObjectCategory);
          }
        }
      }
    }
  }

  generateMapObjectByCategory(mapObjectCategory: MapObjectCategory, x: number, y: number, posX: number, posY: number, showLabel: boolean = true) {
    if (mapObjectCategory === MapObjectCategory.MOC_NONE) {
      this._map[x][y] = new MapObjectInfo(mapObjectCategory, x, y, null);
      this._emptySpots.push({x, y});
      return;
    }
    const mapObjectTypeData = this._mapObjectTypeDataMap[mapObjectCategory] || null;
    const dataIndex = Math.floor(Math.random() * mapObjectTypeData.length);
    const mapObjectData = mapObjectTypeData[dataIndex];
    const prefab = mapObjectData?.prefab || this._prefabMap[mapObjectCategory];
    if (!prefab || !mapObjectTypeData || mapObjectTypeData.length === 0) {
      return;
    }
    const node = instantiate(prefab);
    const objectClass = MapObjectClassMap[mapObjectData.category];
    const o = node.getComponent(objectClass) as typeof objectClass;
    if (o) {
      const mapObjectInfo = new MapObjectInfo(mapObjectData.category, x, y, node);
      o.init(mapObjectData, x, y, showLabel);
      this.dungeon.addChild(node);
      /** protection code, but it's possible hide bugs in generateMap() */
      // if (!this._map[x]) {
      //   this._map[x] = {};
      // }
      this._map[x][y] = mapObjectInfo;
      if (mapObjectData.category === MapObjectCategory.MOC_STONE) {
        this._stones[mapObjectInfo.id] = mapObjectInfo;
      } else if (mapObjectData.category === MapObjectCategory.MOC_MONSTER
          || mapObjectData.category === MapObjectCategory.MOC_TREASURE
          || mapObjectData.category === MapObjectCategory.MOC_DIZZY_OBJECT) {
        this._objects[mapObjectInfo.id] = mapObjectInfo;
      }
      node.setPosition(posX, posY, 0);
    }
  }

  generateMapObject(x: number, y: number, mapObjectCategory: MapObjectCategory = MapObjectCategory.MOC_RANDOM) {
    const posX = x * MAP_SPOT_SIZE;
    const posY = y * MAP_SPOT_SIZE;
    if (mapObjectCategory === MapObjectCategory.MOC_NONE
        || mapObjectCategory === MapObjectCategory.MOC_STONE
        || mapObjectCategory === MapObjectCategory.MOC_MONSTER
        || mapObjectCategory === MapObjectCategory.MOC_TREASURE
        || mapObjectCategory === MapObjectCategory.MOC_DIZZY_OBJECT) {
      const showLabel = mapObjectCategory !== MapObjectCategory.MOC_NONE && mapObjectCategory !== MapObjectCategory.MOC_STONE;
      this.generateMapObjectByCategory(mapObjectCategory, x, y, posX, posY, showLabel);
    }
  }

  generateNewbieMap() {
    this._columns = 1;
    this._rows = 1;
    this.expandMap(MapObjectCategory.MOC_NONE, 1);
    this.expandMap(MapObjectCategory.MOC_STONE, 1);
    this.expandMap(MapObjectCategory.MOC_TREASURE, 1);
    this.expandMap(MapObjectCategory.MOC_MONSTER, 1);
    this.expandMap(MapObjectCategory.MOC_DIZZY_OBJECT, 1);
  }

  generateMap(mapObjectCategory: MapObjectCategory = MapObjectCategory.MOC_RANDOM) {
    // console.log(`PlaygroundControl::generateMap: enter. mapObjectType=${mapObjectType}`);
    const playerX = this.playerCtrl.currentX;
    const playerY = this.playerCtrl.currentY;

    const halfX = Math.floor(this._rows / 2);
    const halfY = Math.floor(this._columns / 2);

    for (let x = -halfX; x <= halfX; ++x) {
      if (!this._map[x]) {
        this._map[x] = {};
      }
      for (let y = -halfY; y <= halfY; ++y) {
        if (!this._map[x][y]) {
          const objectType = (() => {
            if (x === 0 && y === 0 || x === playerX && y === playerY) {
              return MapObjectCategory.MOC_NONE;
            }
            if (mapObjectCategory === MapObjectCategory.MOC_RANDOM) {
              return Math.floor(Math.random() * 2) === 0 ?  MapObjectCategory.MOC_NONE : MapObjectCategory.MOC_STONE;
            }
            return mapObjectCategory;
          })();
          if (objectType === MapObjectCategory.MOC_NONE) {
            this._map[x][y] = new MapObjectInfo(MapObjectCategory.MOC_NONE, x, y, null);
            this._emptySpots.push({x, y});
          } else {
            this.generateMapObjectByCategory(MapObjectCategory.MOC_STONE, x, y, x * MAP_SPOT_SIZE, y * MAP_SPOT_SIZE, false);
          }
        }
      }
    }
  }

  generateMapObjects(count: number) {
    // console.log(`PlaygroundControl::generateMapObjects: enter.`,
    //   `count=${count},`,
    //   ` this._objects.length=${Object.keys(this._objects).length},`,
    //   ` this._emptySpots.length=${Object.keys(this._emptySpots).length}`,
    //   `, this._objects=`, this._objects,
    //   `, this._emptySpots=${this._emptySpots}`);
    count = Math.min(count, this.objectCount - Object.keys(this._objects).length);
    // console.log(`PlaygroundControl::generateMapObjects: count=${count}.`);
    if (count <= 0) {
      return;
    }

    const getEmptySpot = () => {
      const playerX = this.playerCtrl.currentX;
      const playerY = this.playerCtrl.currentY;

      while (this._emptySpots.length > 0) {
        const i = Math.floor(Math.random() * this._emptySpots.length);
        const result = this._emptySpots[i];
        if (result) {
          if (result.x === playerX && result.y === playerY) {
            continue;
          }
          this._emptySpots.splice(i, 1);
          return result;
        }
      }
      return undefined;
    };

    for (let n = 0; n < count; ++n) {
      const emptySpot = getEmptySpot();
      if (emptySpot) {
        const { x, y } = emptySpot;
        const posX = x * MAP_SPOT_SIZE;
        const posY = y * MAP_SPOT_SIZE;
        const type = Math.floor(Math.random() * 2);
        if (type === 0) {
          this.generateMapObjectByCategory(MapObjectCategory.MOC_MONSTER, x, y, posX, posY);
        } else {
          this.generateMapObjectByCategory(MapObjectCategory.MOC_TREASURE, x, y, posX, posY);
        }
      }
    }

    const dizzyObjectCount = Math.min(Math.floor(Math.random() * 4) + 1, this._emptySpots.length);
    for (let n = 0; n < dizzyObjectCount; ++n) {
      const emptySpot = getEmptySpot();
      if (emptySpot) {
        const { x, y } = emptySpot;
        const posX = x * MAP_SPOT_SIZE;
        const posY = y * MAP_SPOT_SIZE;
        this.generateMapObjectByCategory(MapObjectCategory.MOC_DIZZY_OBJECT, x, y, posX, posY);
      }
    }
  }

  removeMapObject(mapObjectInfo: MapObjectInfo) {
    this.dungeon.removeChild(mapObjectInfo.node);
    delete this._objects[mapObjectInfo.id];
    const {x, y} = mapObjectInfo;
    this._map[x][y].category = MapObjectCategory.MOC_NONE;
    this._map[x][y].node = null;
    this._emptySpots.push({x, y});
  }
}
