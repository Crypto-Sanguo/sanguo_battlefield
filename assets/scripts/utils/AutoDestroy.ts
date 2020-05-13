const {ccclass, property} = cc._decorator;

@ccclass
export default class AutoDestroy extends cc.Component {

    @property
    life: float = 1f;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
      setTimeout(() => {
        this.node.destroy();
      }, this.life * 1000);
    }

    // update (dt) {}
}
