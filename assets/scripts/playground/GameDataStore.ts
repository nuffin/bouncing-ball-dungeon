import { sys } from "cc";

export class GameDataStore {
  private static _instance: GameDataStore = null;

  public player: any = {};
  public settings: any = {};

  protected constructor() {
  }

  public static get instance() {
    if (!GameDataStore._instance) {
      GameDataStore._instance = new GameDataStore();
      GameDataStore._instance.load();
    }
    return GameDataStore._instance;
  }

  public static load() {
    const instance = GameDataStore.instance;
    return instance;
  }

  public static save() {
    const instance = GameDataStore.instance;
    instance.save();
  }

  load() {
    const gameDataString = sys.localStorage.getItem("game");
    if (gameDataString) {
      const GameDataStore = JSON.parse(gameDataString);
      this.player = GameDataStore.player;
      this.settings = GameDataStore.settings;
    }
  }

  save() {
    const gameDataString = JSON.stringify({
        player: this.player,
        settings: this.settings,
      });
      sys.localStorage.setItem("game", gameDataString);
  };
}
