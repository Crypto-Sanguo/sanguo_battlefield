const {ccclass, property} = cc._decorator;

@ccclass
export default class StatusText extends cc.Component {

  start() {
  }

  setContent(content: cc.String) {
    this.getComponent(cc.Label).string = content;
  }
}
