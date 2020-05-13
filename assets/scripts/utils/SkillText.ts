const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillText extends cc.Component {

  private SKILL_ARRAY = {
    1: '青龙偃月',
    2: '断桥之怒',
    3: '狂暴之刃',
    4: '噬目一击',
    5: '贯手着棼',
    6: '惊涛骇浪',
    7: '临危不惧',
    8: '左右逢源',
    9: '坚壁清野',
    10: '运筹帷幄',
    11: '激流勇进',
    12: '视死如归',
    13: '神兵天降',
    14: '十月围城',
    15: '苍天已死',
    16: '黄天当立',
    17: '天下大吉',
    19: '以德服人',
    20: '宿命之刃',
    21: '辕门射戟',
    28: '赤膊上阵',
    29: '单骑救主',
    30: '命运之弩',
    31: '火烧赤壁',
    32: '长驱直入',
    33: '闭月羞花',
    36: '勇冠三军',
    37: '一夫当关',
    39: '神鬼出击',
    40: '甜蜜恋风',
    41: '一笑倾城',
    42: '洛神之歌',
    50: '西凉之刃'
  };

  start() {
  }

  play(skill: number) {
    this.getComponent(cc.Label).string = this.SKILL_ARRAY[skill] || "";

    this.getComponent(cc.Animation).play("skill_text");
  }
}