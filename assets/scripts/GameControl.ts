import { _decorator, Animation, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameControl')
export class GameControl extends Component {
    @property({ type: Node })
    public playerOnStart: Node | null = null;

    start() {
        this.playerOnStart?.getComponent(Animation)?.play("player-on-start");
    }

    update(deltaTime: number) {

    }

    onStartButtonTap() {
        director.loadScene("scenes/scene");
    }
}


