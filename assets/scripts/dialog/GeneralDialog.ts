import { _decorator, Animation, Button, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;

import { MessageType, MessageContent } from "../constants/messages";

export interface DialogProps {
  content?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onOpen?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

// const DEFAULT_SUCCESS_MESSAGE = "恭喜过关~";
// const DEFAULT_FAILED_MESSAGE = "非常可惜……失败了……\n再来一把！";
const DEFAULT_CONFIRM_BUTTON_TEXT = "继续";
const DEFAULT_CANCEL_BUTTON_TEXT = "取消";

@ccclass("GeneralDialog")
export class GeneralDialog extends Component {
  private _props: DialogProps = {} as DialogProps;
  @property({ type: Node })
  public mask: Node | null = null;
  @property({ type: Node })
  public successPrompt: Node | null = null;
  @property({ type: Node })
  public failedPrompt: Node | null = null;
  @property({ type: Button })
  public confirmButton: Button | null = null;
  @property({ type: Button })
  public cancelButton: Button | null = null;
  @property({ type: Animation })
  public shakeAnimation: Animation | null = null;

  start() {}

  update(deltaTime: number) {}

  onOpen() {
    if (this.mask) {
      this.mask.active = true;
    }
    this.node.active = true;
    if (this._props.onOpen) {
      this._props.onOpen();
    }
    const confirmButtonText = this._props.confirmButtonText || DEFAULT_CONFIRM_BUTTON_TEXT;
    {
      const labels = this.confirmButton.getComponentsInChildren(Label);
      if (labels[0]) {
        labels[0].string = confirmButtonText;
      }
    }
    const cancelButtonText = this._props.cancelButtonText || DEFAULT_CANCEL_BUTTON_TEXT;
    {
      const labels = this.cancelButton.getComponentsInChildren(Label);
      if (labels[0]) {
        labels[0].string = cancelButtonText;
      }
    }
  }

  onClose() {
    this.node.active = false;
    if (this.mask) {
      this.mask.active = false;
    }
    this.successPrompt.active = false;
    this.failedPrompt.active = false;
    if (this._props.onClose) {
      this._props.onClose();
    }
  }

  onConfirm() {
    console.log("GeneralDialog::onConfirm: enter");
    if (this._props.onConfirm) {
      this._props.onConfirm();
    }
    this.onClose();
  }

  onCancel() {
    console.log("GeneralDialog::onCancel: enter");
    if (this._props.onCancel) {
      this._props.onCancel();
    }
    this.onClose();
  }

  showSuccess(props: DialogProps = {} as DialogProps) {
    console.log("GeneralDialog::showSuccess. props=", props);
    this._props = props;
    this.onOpen();
    if (this.successPrompt) {
      this.successPrompt.active = true;
      const successMessage = props.content || MessageContent[MessageType.SUCCESS];
      const labels = this.successPrompt.getComponentsInChildren(Label);
      if (labels[0]) {
        labels[0].string = successMessage;
      }
    }
  }

  showFailed(props: DialogProps = {} as DialogProps) {
    console.log("GeneralDialog::showSuccess. props=", props);
    this._props = props;
    this.onOpen();
    if (this.failedPrompt) {
      this.failedPrompt.active = true;
      const failedMessage = props.content || MessageContent[MessageType.FAILED];
      const labels = this.failedPrompt.getComponentsInChildren(Label);
      if (labels[0]) {
        labels[0].string = failedMessage;
      }
    }
  }
}
