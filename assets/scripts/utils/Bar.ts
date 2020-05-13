const {ccclass, property} = cc._decorator;

@ccclass
export default class Bar extends cc.Component {

  @property({
    type: cc.Sprite
  })
  public red: cc.Sprite = null;

  @property({
    type: cc.Mask
  })
  public redMask: cc.Mask = null;

  @property({
    type: cc.Sprite
  })
  public green: cc.Sprite = null;

  @property({
    type: cc.Mask
  })
  public greenMask: cc.Mask = null;

  private t: number = 0;
  private oldOffset: number = 0;
  private offset: number = 0;
  private finished: boolean = false;
  private oldValue: number = 1;

  private duration = 0.3;

  start() {
  }

  update(dt) {
    if (this.finished) return;

    this.t += dt;

    if (this.t >= this.duration) {
      this.red.node.setPosition(-160 + this.offset, 0);
      this.redMask.node.setPosition(160 - this.offset, 0);
      this.greenMask.node.setPosition(- this.offset, 0);
      this.green.node.setPosition(this.offset, 0);

      this.finished = true;
    } else {
      const r = this.t / this.duration;
      this.redMask.node.setPosition(160 - this.offset * r - this.oldOffset * (1 - r), 0);
      this.red.node.setPosition(-160 + this.offset * r + this.oldOffset * (1 - r), 0);
      this.greenMask.node.setPosition(- this.offset * r - this.oldOffset * (1 - r), 0);
      this.green.node.setPosition(this.offset * r + this.oldOffset * (1 - r), 0);
    }
  }

  setValue(value:number) {
    if (value < 0 || value > 1) return;

    this.oldOffset = this.offset;
    this.offset = (1 - value) * 160;
    this.t = 0;
    this.finished = false;
    this.oldValue = value;
  }

  isSameValue(value:number): boolean {
    return Math.abs(this.oldValue - value) < 0.001;
  }

  getOldValue(): number {
    return this.oldValue;
  }

  setValueWithoutAnimation(value:number) {
    if (value < 0 || value > 1) return;

    this.offset = (1 - value) * 160;

    this.red.node.setPosition(-160 + this.offset, 0);
    this.redMask.node.setPosition(160 - this.offset, 0);
    this.greenMask.node.setPosition(- this.offset, 0);
    this.green.node.setPosition(this.offset, 0);

    this.finished = true;
    this.oldValue = value;
  }
}
