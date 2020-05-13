const {ccclass, property} = cc._decorator;

@ccclass
export default class Effect extends cc.Component {

  _from: cc.Point = null;
  _to: cc.Point = null;
  _life: float = 0f;
  _t: float = 0f;


  start() {
  }

  update (dt) {
    if (this._from == null || this._life <= 0) {
      return;
    }

    this._t -= dt;

    if (this._t <= 0) {
      this.node.destroy();
    } else {
      const r = this._t / this._life;
      const x = this._from.x * r + this._to.x * (1 - r);
      const y = this._from.y * r + this._to.y * (1 - r);

      this.node.setPosition(cc.v2(x, y));
    }
  }

  fly(from: cc.Point, to: cc.Point, life: float) {
    this._from = from;
    this._to = to;
    this._life = life;
    this._t = life;
  }
}
