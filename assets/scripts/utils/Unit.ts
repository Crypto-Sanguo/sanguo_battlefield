const {ccclass, property} = cc._decorator;

import StatusText from "StatusText";

@ccclass
export default class Unit extends cc.Component {

  @property({
    type: cc.Sprite
  })
  public sprite: cc.Sprite = null;

  @property({
    type: cc.Prefab
  })
  public tombstonePrefab: cc.Prefab = null;

  @property({
    type: cc.Prefab
  })
  public stunnedPrefab: cc.Prefab = null;

  @property({
    type: cc.Prefab
  })
  public firePrefab: cc.Prefab = null;

  @property({
    type: cc.Prefab
  })
  public statusTextPrefab: cc.Prefab = null;

  private effect: cc.Node;
  private fireEffect: cc.Node;

  private currentStatus: number = 0;

  public fire: number = false;  // Used as a marker.

  start() {
//    window.test = () => {
//      cc.loader.loadRes('tombstone', cc.SpriteFrame, (err,spriteFrame) => {  
//        this.sprite.spriteFrame=spriteFrame;
//      });
//    };
//    this.scheduleOnce(() => this.killMe(), 2000);
  }

  update (dt) {
  }

  setEnemy() {
//    this.node.angle = 180;
//    this.sprite.node.angle =180;
//    this.sprite.node.scaleY = -1;
  }

  loadResource(resource: cc.String) {
    cc.loader.loadRes(resource, cc.SpriteFrame, (err,spriteFrame) => {  
      this.sprite.spriteFrame=spriteFrame;
    });
  }

  attachToMe(node: cc.Node) {
    node.parent = this.sprite.node;
  }

  killMe() {
    if (this.effect) {
      this.effect.destroy();
    }

    if (this.fireEffect) {
      this.fireEffect.destroy();
    }

    const anim = this.getComponent(cc.Animation);
    const animState = anim.getAnimationState('death');

    anim.on('finished', (event, target) => {
      if (target == animState) {
        const tombstone = cc.instantiate(this.tombstonePrefab);
        tombstone.parent = this.node.parent;
        tombstone.setPosition(this.node.getPosition());

        this.node.destroy();
      }
    });

    anim.play("death");
  }

  async setStatus(status: number, on: boolean) {
    if (!on) {
      if (this.currentStatus == status) {
        if (this.effect) {
          this.effect.destroy();
          this.effect = null;
          this.currentStatus = 0;
        }
      }

      return;
    }

    if (status == 1) {
      // Stunned.

      if (this.effect) {
        this.effect.destroy();
      }

      this.effect = cc.instantiate(this.stunnedPrefab);
      this.effect.parent = this.node.parent;
      this.effect.setPosition(this.node.getPosition());
      this.currentStatus = 1;

      await this.waitFor(0.5);
    }
  }

  async setFire() {
    if (this.fireEffect) return;

    this.fireEffect = cc.instantiate(this.firePrefab);
    this.fireEffect.parent = this.node.parent;
    this.fireEffect.setPosition(this.node.getPosition());
    await this.waitFor(0.5);
  }

  async showText(content: cc.String) {
    const statusText = cc.instantiate(this.statusTextPrefab);
    statusText.parent = this.node.parent;
    statusText.setPosition(this.node.getPosition());
    statusText.getComponent(StatusText).setContent(content);

    await this.waitFor(1);
  }

  waitFor(duration: number) {
    return new Promise((resolve, reject) => {
      this.scheduleOnce(() => {
        resolve();
      }, duration);
    };
  }
}