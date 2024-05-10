import { _decorator, Color, Component, Label, Node, Sprite, UIOpacity, Widget } from "cc";
const { ccclass, property } = _decorator;

export enum NotificationLevel {
    None = 0,
    Error,
    Warning,
    Luck,
    Notice,
}

type ColorSpec = {
    color: Color,
    bgColor: Color,
};

const ErrorColor = new Color(255, 255, 64, 255);
const ErrorBgColor = new Color(255, 64, 64, 255);

const WarningColor = new Color(64, 64, 64, 255);
const WarningBgColor = new Color(255, 255, 64, 255);

const LuckColor = new Color(64, 64, 64, 255);
const LuckBgColor = new Color(64, 255, 64, 255);

const NoticeColor = new Color(64, 64, 64, 255);
const NoticeBgColor = new Color(240, 240, 240, 255);

const NotificationColorSpecs: { [key in NotificationLevel]: ColorSpec } = {
    [NotificationLevel.None]: {
        color: new Color(255, 255, 255, 255),
        bgColor: new Color(255, 255, 255, 255),
    },
    [NotificationLevel.Error]: {
        color: ErrorColor,
        bgColor: ErrorBgColor,
    },
    [NotificationLevel.Warning]: {
        color: WarningColor,
        bgColor: WarningBgColor,
    },
    [NotificationLevel.Luck]: {
        color: LuckColor,
        bgColor: LuckBgColor,
    },
    [NotificationLevel.Notice]: {
        color: NoticeColor,
        bgColor: NoticeBgColor,
    },
};

@ccclass("NotificationBarControl")
export class NotificationBarControl extends Component {
  private _onShow: boolean = false;

  @property(Widget)
  public notificationBar: Widget | null = null;
  @property(Sprite)
  public content: Sprite | null = null;
  @property({ type: Label })
  public label: Label | null = null;
  @property(UIOpacity)
  public opacity: UIOpacity | null = null;

  start() {}

  update(deltaTime: number) {}

  fadeIn(content: string, level: NotificationLevel = NotificationLevel.Notice) {
    if (level === NotificationLevel.None) {
        return;
    }
    if (this._onShow) {
        return;
    }
    this.show(content, level);
    let opacity = 0;
    const showTimer = setInterval(() => {
      opacity += 4;
      if (opacity > 255) {
        opacity = 255;
        clearInterval(showTimer);
      }
      this.opacity.opacity = opacity;
    });

    setTimeout(() => {
      this.fadeOut();
    }, 2000);
  }

  fadeOut() {
    let opacity = 255;
    const hideTimer = setInterval(() => {
      opacity -= 4;
      if (opacity <= 0) {
        opacity = 0;
        clearInterval(hideTimer);
        this.hide();
      }
      this.opacity.opacity = opacity;
    }, 10);
  }

  show(content: string, level: NotificationLevel = NotificationLevel.Notice) {
    console.log(`NotificationBar::show: content=${content}, level=${level}`);
    this._onShow = true;
    this.label.string = content;
    const colorSpec = NotificationColorSpecs[level];
    console.log(`NotificationBar::show: colorSpec=`, colorSpec);
    this.label.color = colorSpec.color;
    this.content.color = colorSpec.bgColor;
    this.node.active = true;
    this.opacity.opacity = 255;
  }

  hide() {
    this.opacity.opacity = 0;
    this.node.active = false;
    this._onShow = false;
  }
}
