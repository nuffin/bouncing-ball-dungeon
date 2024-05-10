import { Node, instantiate } from "cc";

import {
  DEFAULT_MAP_AREA_COLUMNS,
  DEFAULT_MAP_AREA_ROWS,
  GameLayers,
  MAP_SPOT_SIZE,
  MapObjectCategory,
} from "../constants/common";
import { Stone } from "../map/stone";
import { MapObject } from "../map/object";
import { Monster } from "../map/monster";
import { Treasure } from "../map/treasure";

export class MapObjectInfo {
  readonly id: number;
  column: number;
  row: number;
  category: MapObjectCategory;
  node: Node | null = null;

  constructor(column: number, row: number, category: MapObjectCategory, node: Node = null) {
    this.id = Math.floor(Math.random() * 10000000000);
    this.column = column;
    this.row = row;
    this.category = category;
    this.node = node;
  }
}

export class MapArea {
  playground: any = null;
  // dungeon: Node | null = null;

  columns: number = DEFAULT_MAP_AREA_COLUMNS;
  rows: number = DEFAULT_MAP_AREA_ROWS;
  objectCount: number = 0;

  /** map area position, center area as [0, 0] */
  areaX: number = 0;
  areaY: number = 0;

  map: MapObjectInfo[][];
  stones: MapObjectInfo[];
  objects: MapObjectInfo[];

  private _width: number = 0;
  private _height: number = 0;
  private _centerX: number = 0;
  private _centerY: number = 0;
  private _mapTop: number = 0;
  private _mapRight: number = 0;
  private _mapBottom: number = 0;
  private _mapLeft: number = 0;

  public get width() {
    return this._width;
  }

  public get height() {
    return this._height;
  }

  public get centerX() {
    return this._centerX;
  }

  public get centerY() {
    return this._centerY;
  }

  constructor(
    playground: any,
    columns: number = DEFAULT_MAP_AREA_COLUMNS,
    rows: number = DEFAULT_MAP_AREA_ROWS,
    areaX: number = 0,
    areaY: number = 0,
  ) {
    this.playground = playground;
    const dungeonPrefab = this.playground?.dungeonPrefab;
    // this.dungeon = dungeonPrefab ?  instantiate(dungeonPrefab) : null;
    this.columns = columns;
    this.rows = rows;
    this.objectCount = Math.floor((this.columns + this.rows) / 4);
    this.areaX = areaX;
    this.areaY = areaY;
    this.map = [];
    this.stones = [];
    this.objects = [];

    this._width = this.columns * MAP_SPOT_SIZE;
    this._height = this.rows * MAP_SPOT_SIZE;
    this._centerX = this.areaX * this._width;
    this._centerY = this.areaY * this._height;
    this._mapTop = this._centerY + Math.floor(this._height / 2);
    this._mapRight = this._centerX + Math.floor(this._width / 2);
    this._mapBottom = this._centerY - Math.floor(this._height / 2);
    this._mapLeft = this._centerX - Math.floor(this._width / 2);

    // if (this.dungeon) {
    //   this.dungeon.setPosition(this._centerX, this._centerY, 0);
    // }
  }

  get isVisible() {
    const camera = this.playground?.camera;
    console.log(`MapArea::isVisible: camera=`, camera);
    if (camera) {
      const cameraPos = camera.node.getPosition();
      const verticalInRange = Math.abs(cameraPos.y - this.centerY) < this._height;
      const horizontalInRange = Math.abs(cameraPos.x - this.centerX) < this._width;
      // const visibleTop = cameraPos.y + MAP_SPOT_SIZE * 6;
      // const visibleRight = cameraPos.x + MAP_SPOT_SIZE * 6;
      // const visibleBottom = cameraPos.y - MAP_SPOT_SIZE * 6;
      // const visibleLeft = cameraPos.x - MAP_SPOT_SIZE * 6;
      // console.log(`MapArea::isVisible: visibleTop=${visibleTop}, visibleRight=${visibleRight}, visibleBottom=${visibleBottom}, visibleLeft=${visibleLeft}`);
      // console.log(`MapArea::isVisible: this._mapTop=${this._mapTop}, this._mapRight=${this._mapRight}, this._mapBottom=${this._mapBottom}, this._mapLeft=${this._mapLeft}`);
      // const verticalInRange = this._mapTop > visibleBottom && this._mapTop < visibleTop
      //   || this._mapBottom > visibleBottom && this._mapBottom < visibleTop;
      // const horizontalInRange = this._mapRight > visibleLeft && this._mapRight < visibleRight
      //   || this._mapLeft > visibleLeft && this._mapLeft < visibleRight;
      return  verticalInRange && horizontalInRange;
    }
    return false;
  }

  init() {
    this.map = [];
    this.generateMap();
    this.generateMapObjects(this.objectCount);
  }

  reset() {
    this.map = [];
    this.resetStones();
    this.resetObjects();
  }

  resetStones() {
    this.stones.map((item) => {
        this.map[item.column][item.row].category = MapObjectCategory.MOC_NONE;
        this.playground.dungeon.removeChild(item.node);
    });
    this.stones = [];
    this.generateMap();
  }

  resetObjects() {
    this.objects.map((item) => this.playground.dungeon.removeChild(item.node));
    this.objects = [];
    this.generateMapObjects(this.objectCount);
  }

  generateMap() {
    if (!this.playground) {
      return;
    }

    const playerC = this.playground.playerCtrl.currentC;
    const playerR = this.playground.playerCtrl.currentR;

    const mapGeoOriginX = this._centerX - Math.floor(this.columns / 2) * MAP_SPOT_SIZE;
    const mapGeoOriginY = this._centerY - Math.floor(this.rows / 2) * MAP_SPOT_SIZE;

    for (let i = 0; i < this.columns; ++i) {
      this.map[i] = [];
      for (let j = 0; j < this.rows; ++j) {
        if (i === playerC && j === playerR) {
          /** start position */
          this.map[i][j] = new MapObjectInfo(i, j, MapObjectCategory.MOC_NONE, null);
        } else {
          const type = Math.floor(Math.random() * 2);
          const mapObject = new MapObjectInfo(i, j, type === 0 ?  MapObjectCategory.MOC_NONE : MapObjectCategory.MOC_STONE, null);
          this.map[i][j] = mapObject;
          if (type !== 0) {
            const stone = instantiate(this.playground.stonePrefab);
            stone.getComponent(Stone).init(this.areaX, this.areaY, i, j, false);
            stone.layer = GameLayers.BASE;
            stone.setPosition(
              mapGeoOriginX + i * MAP_SPOT_SIZE,
              mapGeoOriginY + j * MAP_SPOT_SIZE,
            0);
            this.playground.dungeon.addChild(stone);
            mapObject.node = stone;
            this.stones.push(mapObject);
          }
        }
      }
    }
  }

  generateMonster(column: number, row: number, x: number, y: number) {
    if (!this.playground) {
      return;
    }
    // console.log(`MapArea::generateMonster: enter. this.monstersData=`, this.playground.monstersData);
    const monsterTypeIndex = Math.floor(Math.random() * this.playground.monstersData.length);
    // const monsterType = MonsterTypes[monsterTypeIndex];
    const monsterData = this.playground.monstersData[monsterTypeIndex]; //.find((item: any) => item.type === monsterType);
    const node = instantiate(this.playground.monsterPrefab);
    const monster = node.getComponent(Monster);
    if (monster) {
      monster.init(this.objects.length, monsterData);
      // console.log(`MapArea::generateMapObjects: monster=`, monster);
      node.layer = GameLayers.BASE;
      this.playground.dungeon.addChild(node);
      const mapObject = new MapObjectInfo(column, row, MapObjectCategory.MOC_MONSTER, node);
      this.map[column][row] = mapObject;
      this.objects.push(mapObject);
      node.setPosition(x, y, 0);
    }
  }

  generateTreasure(column: number, row: number, x: number, y: number) {
    if (!this.playground) {
      return;
    }
    // console.log(`MapArea::generateTreasure: enter. this.treasuresData=`, this.playground.treasuresData);
    const treasureTypeIndex = Math.floor(Math.random() * this.playground.treasuresData.length);
    // const treasureType = TreasureTypes[treasureTypeIndex];
    const treasureData = this.playground.treasuresData[treasureTypeIndex]; // .find((item: any) => item.type === treasureType);
    const node = instantiate(this.playground.treasurePrefab);
    const treasure = node.getComponent(Treasure);
    if (treasure) {
      treasure.init(this.objects.length, treasureData);
      // console.log(`MapArea::generateMapObjects: treasure=`, treasure);
      node.layer = GameLayers.BASE;
      this.playground.dungeon.addChild(node);
      const mapObject = new MapObjectInfo(column, row, MapObjectCategory.MOC_TREASURE, node);
      this.map[column][row] = mapObject;
      this.objects.push(mapObject);
      node.setPosition(x, y, 0);
    }
  }

  generateMapObjects(count: number) {
    // console.log(`MapArea::generateMapObjects: enter. this.objects.length=${this.objects.length}, this.objectCount=${this.objectCount}, count=${count}`);
    if (!this.playground) {
      return;
    }
    count = Math.min(count, this.objectCount - this.objects.length);
    // console.log(`MapArea::generateMapObjects: enter. count=${count}`);
    const getEmptySpot = () => {
      const playerC = this.playground.playerCtrl?.currentC;
      const playerR = this.playground.playerCtrl?.currentR;

      const emptySpots = this.map
        .map((row, i) => row
          .map((spot, j) => (spot.category === MapObjectCategory.MOC_NONE && i !== playerC && j !== playerR ? { i, j } : undefined))
          .filter((x) => !!x))
        .reduce((acc, val) => acc.concat(val), []);
      if (emptySpots.length > 0) {
        const x = Math.floor(Math.random() * emptySpots.length);
        return emptySpots[x];
      } else {
        return undefined;
      }
    };

    const mapGeoOriginX = this._centerX - Math.floor(this.columns / 2) * MAP_SPOT_SIZE;
    const mapGeoOriginY = this._centerY - Math.floor(this.rows / 2) * MAP_SPOT_SIZE;

    for (let n = 0; n < count; ++n) {
      const monsterTile = getEmptySpot();
      if (monsterTile) {
        const { i, j } = monsterTile;
        const type = Math.floor(Math.random() * 2);
        const x = mapGeoOriginX + i * MAP_SPOT_SIZE;
        const y = mapGeoOriginY + j * MAP_SPOT_SIZE;
        if (type === 0) {
          this.generateMonster(i, j, x, y);
        } else {
          this.generateTreasure(i, j, x, y);
        }
      }
    }
  }

  removeMapObject(nodeInfo: any) {
    this.playground.dungeon.removeChild(nodeInfo.node);
    this.objects = this.objects.filter((item) => item.node !== nodeInfo.node);
    this.map[nodeInfo.column][nodeInfo.row].category = MapObjectCategory.MOC_NONE;
  }
}
