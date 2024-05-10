import { _decorator, AudioClip, AudioSource, Component, Input, Node, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

import { GameDataStore } from "./GameDataStore";

@ccclass("BGMControl")
export class BGMControl extends Component {
  private _gameData: GameDataStore | null = null;
  private _muted: boolean = false;
  private _bgmClipIndex = 0;


    // @property({ type: AudioClip })
  // public bgm: AudioClip | null = null;

  @property({ type: SpriteFrame })
  public soundOnSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public soundOffSpriteFrame: SpriteFrame | null = null;

  @property({ type: Sprite })
  public muteControl: Sprite | null = null;

  @property({ type: Sprite })
  public nextControl: Sprite | null = null;

  @property([AudioClip])
  public bgmClips: AudioClip[] = [];

  @property({ type: AudioSource })
  public bgmSource: AudioSource | null = null;

  start() {
    this._gameData = GameDataStore.instance;
    this._gameData.load();

    this._muted = this._gameData.settings.muted;
    this._bgmClipIndex = this._gameData.settings.bgmIndex || 0;

    this.muteControl.node.on(Input.EventType.TOUCH_END, this.onMuteTap, this);
    if (this.muteControl) {
      this.muteControl.spriteFrame = this.soundOffSpriteFrame;
    }
    this.nextControl.node.on(Input.EventType.TOUCH_END, this.onNextTap, this);
    this.bgmSource.clip = this.bgmClips[this._bgmClipIndex];
    this.bgmSource.loop = true;
    if (this._muted) {
      this.bgmSource.pause();
    } else {
      this.bgmSource.play();
    }
  }

  update(deltaTime: number) {}

  onNextTap() {
    if (this._bgmClipIndex < this.bgmClips.length - 1) {
      this._bgmClipIndex++;
    } else {
      this._bgmClipIndex = 0;
    }
    this.bgmSource.stop();
    this.bgmSource.clip = this.bgmClips[this._bgmClipIndex];
    this.bgmSource.play();

    this._gameData.settings.bgmIndex = this._bgmClipIndex;
    this._gameData.save();
  }

  onMuteTap() {
    if (this.bgmSource.playing) {
      this.bgmSource.pause();
      if (this.muteControl) {
        this.muteControl.spriteFrame = this.soundOnSpriteFrame;
      }
      this._muted = true;
    } else {
      this.bgmSource.play();
      if (this.muteControl) {
        this.muteControl.spriteFrame = this.soundOffSpriteFrame;
      }
      this._muted = false;
    }
    this._gameData.settings.muted = this._muted;
    this._gameData.save();
  }
}
