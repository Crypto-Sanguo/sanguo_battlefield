const {ccclass, property} = cc._decorator;

import Bar from "Bar";
import Effect from "Effect";
import SkillText from "SkillText";
import Unit from "Unit";


@ccclass
export default class BattleManager extends cc.Component {

  @property({
    type: cc.Node
  })
  public canvas: cc.Node = null;

  private enemyPositions: cc.Node[] = [];
  private playerPositions: cc.Node[] = [];

  @property({
    type: [cc.Node]
  })
  public enemyExtendedPositions: cc.Node[] = [];

  @property({
    type: [cc.Node]
  })
  public playerExtendedPositions: cc.Node[] = [];

  @property({
    type: [cc.Node]
  })
  public enemyBasicPositions: cc.Node[] = [];

  @property({
    type: [cc.Node]
  })
  public playerBasicPositions: cc.Node[] = [];

  @property({
    type: cc.Prefab
  })
  public barPrefab: cc.Prefab = null;

  @property({
    type: cc.Prefab
  })
  public unitPrefab: cc.Prefab = null;

  @property({
    type: [cc.Prefab]
  })
  public effects: cc.Prefab[] = [];

  @property({
    type: [cc.Prefab]
  })
  public hits: cc.Prefab[] = [];

  @property({
    type: [cc.String]
  })
  public skills: cc.String[] = [];

  @property({
    type: cc.Node
  })
  public skillText: cc.Node = null;

  private players: cc.Node[] = [];
  private enemies: cc.Node[] = [];

  private playerUnitIds: number[] = [];
  private enemyUnitIds: number[] = [];

  private playerBars: cc.Node[] = [];
  private enemyBars: cc.Node[] = [];

  private index2HpMax = {};

  private isBattleOver = false;

  private onFinish: function = null;

  private UNIT_ID_TO_RESOURCE = {
    1: 'heroes/guanyu',
    2: 'heroes/zhangfei',
    3: 'heroes/dianwei',
    4: 'heroes/xiahoudun',
    5: 'heroes/taishici',
    6: 'heroes/sunjian',
    7: 'heroes/ganning',
    8: 'heroes/jianyong',
    9: 'heroes/xunyu',
    10: 'heroes/guojia',
    11: 'heroes/chengong',
    12: 'heroes/chengzhiyuan',
    13: 'heroes/zhaohong',
    14: 'heroes/dengmao',
    15: 'heroes/zhangliang',
    16: 'heroes/zhangbao',
    17: 'heroes/zhangjiao',
    18: 'heroes/huangjinzei',
    19: 'heroes/liubei',
    20: 'heroes/caocao',
    21: 'heroes/lvbu',
    22: 'heroes/hanbing',
    23: 'heroes/huaxiong',
    24: 'heroes/lijue',
    25: 'heroes/guosi',
    26: 'heroes/jiaxu',
    27: 'heroes/dongzhuo',
    28: 'heroes/xuchu',
    29: 'heroes/zhaoyun',
    30: 'heroes/sunshangxiang',
    31: 'heroes/zhouyu',
    32: 'heroes/xuhuang',
    33: 'heroes/diaochan',
    34: 'heroes/yuanshaojun',
    35: 'heroes/tianfeng',
    36: 'heroes/yanliang',
    37: 'heroes/wenchou',
    38: 'heroes/chunyuqiong',
    39: 'heroes/yuanshao',
    40: 'heroes/xiaoqiao',
    41: 'heroes/daqiao',
    42: 'heroes/zhenji',
    43: 'heroes/caoren',
    44: 'heroes/lidian',
    45: 'heroes/lejin',
    46: 'heroes/xiahouyuan',
    47: 'heroes/yujin',
    48: 'heroes/zhangxiu',
    49: 'heroes/zhangliao',
    50: 'heroes/machao'
  };

  private willSkip = false;

  start() {
    window['battlefield'] = {
      loadBattleField:
          (hpArray, levelArray, unitIdArray, itemIdArray) =>
              this.loadBattleField(hpArray, levelArray, unitIdArray, itemIdArray),
      loadBattleRecords:
          (didWin, isMyTurnArray, myIndexArray, enemyIndexArray, skillArray, valueArray, onFinish) =>
              this.loadBattleRecords(didWin, isMyTurnArray, myIndexArray, enemyIndexArray, skillArray, valueArray, onFinish)
    };
  }

  onDestroy() {
  }

  update (dt) {
  }

  update (dt) {
  }

  loadBattleField(hpRArray: number[], hpArray: number[], levelArray: number[], unitIdArray: number[], itemIdArray: number[]) {
    if (unitIdArray.length == 6) {
      this.playerPositions = this.playerBasicPositions;
      this.enemyPositions = this.enemyBasicPositions;
    } else {
      this.playerPositions = this.playerExtendedPositions;
      this.enemyPositions = this.enemyExtendedPositions;
    }

    const n = unitIdArray.length / 2;
    this.loadUnits(unitIdArray.slice(0, n), unitIdArray.slice(n));

    this.index2HpMax = {};

    for (let i = 0; i < hpArray.length; ++i) {
      this.index2HpMax[i] = hpArray[i];

      if (i < n) {
        if (this.enemyBars[i]) {
          this.enemyBars[i].getComponent(Bar).setValueWithoutAnimation(hpRArray[i]/hpArray[i]);
        }
      } else {
        if (this.playerBars[i - n]) {
          this.playerBars[i - n].getComponent(Bar).setValueWithoutAnimation(hpRArray[i]/hpArray[i]);
        }
      }
    }
  }

  loadBattleRecords(didWin: boolean, isMyTurnArray: boolean[], myIndexArray: number[], enemyIndexArray: number[], skillArray: number[], valueArray: number[][], onFinish: function) {
    this.onFinish = onFinish;

    (async () => {
      for (let i = 0; i < isMyTurnArray.length; ++i) {
        if (this.willSkip) {
          break;
        }

        await this.applySkill(isMyTurnArray[i], myIndexArray[i], enemyIndexArray[i], skillArray[i], valueArray[i]);
      }

      if (this.onFinish) {
        this.onFinish();
      }
    }) ();
  }

  skip() {
    this.willSkip = true;
  }

  loadUnits(enemyUnitIds: number[], playerUnitIds: number[]) {
    this.enemyUnitIds = enemyUnitIds;
    this.playerUnitIds = playerUnitIds;

    this.enemies = [];
    this.players = [];

    this.enemyBars = [];
    this.playerBars = [];

    enemyUnitIds.map((unitId, i) => {
      if (unitId == 0) {
        this.enemies.push(null);
        this.enemyBars.push(null);
        return;
      }

      const unit = cc.instantiate(this.unitPrefab);
      unit.parent = this.enemyPositions[i].parent;
      unit.setPosition(this.enemyPositions[i].getPosition());
      if (enemyUnitIds.length == 6) {
        unit.setScale(cc.v2(0.7, 0.7));
      }
      unit.getComponent(Unit).loadResource(this.UNIT_ID_TO_RESOURCE[unitId]);
      unit.getComponent(Unit).setEnemy();
      this.enemies.push(unit);

      const bar = cc.instantiate(this.barPrefab);
      unit.getComponent(Unit).attachToMe(bar);
      bar.setPosition(cc.v2(0, -110));
      this.enemyBars.push(bar);
    });

    playerUnitIds.map((unitId, i) => {
      if (unitId == 0) {
        this.players.push(null);
        this.playerBars.push(null);
        return;
      }

      const unit = cc.instantiate(this.unitPrefab);
      unit.parent = this.playerPositions[i].parent;
      unit.setPosition(this.playerPositions[i].getPosition());
      if (playerUnitIds.length == 6) {
        unit.setScale(cc.v2(0.7, 0.7));
      }
      unit.getComponent(Unit).loadResource(this.UNIT_ID_TO_RESOURCE[unitId]);
      this.players.push(unit);

      const bar = cc.instantiate(this.barPrefab);
      unit.getComponent(Unit).attachToMe(bar);
      bar.setPosition(cc.v2(0, -110));
      this.playerBars.push(bar);
    });
  }

  async applySkill(isPlayer: boolean, playerIndex: number, enemyIndex: number, skill: number, value: number[]) {
    let fromUnit;
    let toUnit;

    if (isPlayer) {
      fromUnit = this.players[playerIndex];
      toUnit = this.enemies[enemyIndex];
    } else {
      fromUnit = this.enemies[enemyIndex];
      toUnit = this.players[playerIndex];
    }

    fromUnit.getComponent(Unit).setStatus(1, false);  // Automatically remove stunned effects.

    if (skill != 0) {
      fromUnit.getComponent(cc.Animation).play("status_00");
      await this.waitFor(0.5);

      this.skillText.getComponent(SkillText).play(skill);
      await this.waitFor(0.5);
    }

    if (([0, 1, 2, 3, 4, 5, 7, 16, 17, 20, 21, 28, 30, 32, 33, 36, 39, 50]).indexOf(skill) >= 0) {
      await this.playSkillEffect(fromUnit, toUnit);

      if (value.length == 1) {


        const hp = value[0];
        const hpMax = this.index2HpMax[isPlayer ? enemyIndex : this.enemyPositions.length + playerIndex];
        const hpValue = hp / hpMax;

        if (isPlayer && this.enemyBars[enemyIndex].getComponent(Bar).isSameValue(hpValue) && this.enemyUnitIds[enemyIndex] == 19 ||
            !isPlayer && this.playerBars[playerIndex].getComponent(Bar).isSameValue(hpValue) && this.playerUnitIds[playerIndex] == 19) {
          // Liu Bei.
          toUnit.getComponent(cc.Animation).play("status_00");
          await this.waitFor(0.5);

          this.skillText.getComponent(SkillText).play(19);
          await this.waitFor(0.5);

          await this.playHitEffect([toUnit]);
        } else {
          await this.playHitEffect([toUnit]);

          if (skill == 21) {
            // Lv Bu.

            // Show half of the damage.
            if (isPlayer) {
              const oldValue = this.enemyBars[enemyIndex].getComponent(Bar).getOldValue();
              this.enemyBars[enemyIndex].getComponent(Bar).setValue((oldValue + hpValue) / 2);
            } else {
              const oldValue = this.playerBars[playerIndex].getComponent(Bar).getOldValue();
              this.playerBars[playerIndex].getComponent(Bar).setValue((oldValue + hpValue) / 2);
            }

            await this.waitFor(0.5);
            await this.playSkillEffect(fromUnit, toUnit);
            await this.playHitEffect([toUnit]);
          }
        }

        if (isPlayer) {
          this.enemyBars[enemyIndex].getComponent(Bar).setValue(hpValue);

          if (hpValue == 0 && this.enemyUnitIds[enemyIndex] != 20) {
            toUnit.getComponent(Unit).killMe();
            delete this.enemies[enemyIndex];
          }

          if (skill == 20) {
            fromUnit.getComponent(Unit).killMe();
            delete this.players[playerIndex];
          }
        } else {
          this.playerBars[playerIndex].getComponent(Bar).setValue(hpValue);

          if (hpValue == 0 && this.playerUnitIds[playerIndex] != 20) {
            toUnit.getComponent(Unit).killMe();
            delete this.players[playerIndex];
          }

          if (skill == 20) {
            fromUnit.getComponent(Unit).killMe();
            delete this.enemies[enemyIndex];
          }
        }

        if (hpValue > 0) {
          if (skill == 5 || skill == 17 || skill == 28 || skill == 39) {
            // Stun.
            await toUnit.getComponent(Unit).setStatus(1, true);
          }
        }
      } else if (value.length > 1) {
        const hpValueArray = [];
        const targetUnitArray = [];

        for (let i = 0; i < value.length; ++i) {
          const hp = value[i];
          const hpMax = this.index2HpMax[isPlayer ? i : this.enemyPositions.length + i];
          const hpValue = hp / hpMax;

          // Liu Bei.
          if (isPlayer && this.enemies[i] && this.enemyBars[i].getComponent(Bar).isSameValue(hpValue) && this.enemyUnitIds[i] == 19) {
            this.enemies[i].getComponent(cc.Animation).play("status_00");
            await this.waitFor(0.5);

            this.skillText.getComponent(SkillText).play(20);
            await this.waitFor(0.5);
          } else if (!isPlayer && this.players[i] && this.playerBars[i].getComponent(Bar).isSameValue(hpValue) && this.playerUnitIds[i] == 19) {
            this.players[i].getComponent(cc.Animation).play("status_00");
            await this.waitFor(0.5);

            this.skillText.getComponent(SkillText).play(20);
            await this.waitFor(0.5);
          }

          targetUnitArray.push(isPlayer ? this.enemies[i] : this.players[i]);
          hpValueArray.push(hpValue);
        }

        await this.playHitEffect(targetUnitArray);

        for (let i = 0; i < value.length; ++i) {
          const hpValue = hpValueArray[i];

          if (isPlayer) {
            if (!this.enemies[i]) {
              continue;
            }

            this.enemyBars[i].getComponent(Bar).setValue(hpValue);

            if (hpValue == 0 && this.enemyUnitIds[i] != 20) {
              this.enemies[i].getComponent(Unit).killMe();
              delete this.enemies[i];
            }

            if (skill == 20) {
              fromUnit.getComponent(Unit).killMe();
              delete this.players[playerIndex];
            }
          } else {
            if (!this.players[i]) {
              continue;
            }
            this.playerBars[i].getComponent(Bar).setValue(hpValue);

            if (hpValue == 0 && this.playerUnitIds[i] != 20) {
              this.players[i].getComponent(Unit).killMe();
              delete this.players[i];
            }

            if (skill == 20) {
              fromUnit.getComponent(Unit).killMe();
              delete this.enemies[enemyIndex];
            }
          }
        }

        const all = [];
        for (let i = 0; i < value.length; ++i) {
          const hpValue = hpValueArray[i];

          if (hpValue > 0) {
            if (skill == 33) {
              // Stun.
              if (isPlayer) {
                all.push(this.enemies[i].getComponent(Unit).setStatus(1, true));
              } else {
                all.push(this.players[i].getComponent(Unit).setStatus(1, true));
              }
            }
          }
        }

        await Promise.all(all);
      }
    } else if (skill == 6) {
      await fromUnit.getComponent(Unit).showText("+敏捷");
    } else if (skill == 29) {
      await fromUnit.getComponent(Unit).showText("+防御");
    } else if (skill == 8) {
      await toUnit.getComponent(Unit).showText("-防御");
    } else if (skill == 9) {
      await toUnit.getComponent(Unit).showText("-敏捷");
    } else if (skill == 10 || skill == 12 || skill == 13 || skill == 15 || skill == 42 || skill == 37) {
      const hpMax = this.index2HpMax[isPlayer ? this.enemyPositions.length + enemyIndex : playerIndex];
      if (isPlayer) {
        this.playerBars[enemyIndex].getComponent(Bar).setValue(value[0] / hpMax);
        this.players[enemyIndex].getComponent(Unit).showText("治疗");
      } else {
        this.enemyBars[playerIndex].getComponent(Bar).setValue(value[0] / hpMax);
        this.enemies[playerIndex].getComponent(Unit).showText("治疗");
      }
    } else if (skill == 11) {
      const allTasks = [];
      if (isPlayer) {
        for (let i = 0; i < this.players.length; ++i) {
          if (this.players[i]) {
            allTasks.push(this.players[i].getComponent(Unit).showText("+敏捷"));
          }
        }
      } else {
        for (let i = 0; i < this.enemies.length; ++i) {
          if (this.enemies[i]) {
            allTasks.push(this.enemies[i].getComponent(Unit).showText("+敏捷"));
          }
        }
      }

      await Promise.all(allTasks);
    } else if (skill == 14) {
      // Stun all opponents.
      const allTasks = [];

      for (let i = 0; i < this.enemies.length; ++i) {
        if (isPlayer && this.enemies[i]) {
          allTasks.push(this.players[i].getComponent(Unit).setStatus(1, true));
        } else if (!isPlayer && this.players[i]) {
          allTasks.push(this.players[i].getComponent(Unit).setStatus(1, true));
        }
      }

      await Promise.all(allTasks);
    } else if (skill == 31) {
      // Zhou Yu
      toUnit.getComponent(Unit).setFire();
      toUnit.fire = value[0];  // This is a hack.
    } else if (skill == 40) {
      // Xiao Qiao 
      for (let i = 0; i < value.length; ++i) {
        if (value[i] <= 0) continue;

        if (isPlayer) {
          const hpMax = this.index2HpMax[this.enemyPositions.length + i];
          this.playerBars[i].getComponent(Bar).setValue(value[i] / hpMax);
          this.players[i].getComponent(Unit).showText("治疗");
        } else {
          const hpMax = this.index2HpMax[i];
          this.enemyBars[i].getComponent(Bar).setValue(value[i] / hpMax);
          this.enemies[i].getComponent(Unit).showText("治疗");
        }
      }
    } else if (skill == 41) {
      // Da Qiao
      const allTasks = [];
      if (isPlayer) {
        for (let i = 0; i < this.players.length; ++i) {
          if (this.players[i]) {
            allTasks.push(this.players[i].getComponent(Unit).showText("+攻击"));
          }
        }
      } else {
        for (let i = 0; i < this.enemies.length; ++i) {
          if (this.enemies[i]) {
            allTasks.push(this.enemies[i].getComponent(Unit).showText("+攻击"));
          }
        }
      }

      await Promise.all(allTasks);
    }

    if (fromUnit.fire > 0) {
      fromUnit.getComponent(Unit).showText("灼伤");
      await this.waitFor(0.5);
      const r = Math.min(0.2, 0.05 * fromUnit.fire);

      if (isPlayer) {
        const oldValue = this.playerBars[playerIndex].getComponent(Bar).getOldValue();
        const newValue = Math.max(0, oldValue - 1 * r);
        this.playerBars[playerIndex].getComponent(Bar).setValue(newValue);
        if (newValue == 0) {
          fromUnit.getComponent(Unit).killMe();
          delete this.players[playerIndex];
        }
      } else {
        const oldValue = this.enemyBars[enemyIndex].getComponent(Bar).getOldValue();
        const newValue = Math.max(0, oldValue - r);
        this.enemyBars[enemyIndex].getComponent(Bar).setValue(newValue);
        if (newValue == 0) {
          fromUnit.getComponent(Unit).killMe();
          delete this.enemies[enemyIndex];
        }
      }
    }

    await this.waitFor(1);
  }

  async playSkillEffect(fromUnit: cc.Node, toUnit: cc.Node) {
    const fromPos = fromUnit.parent.convertToWorldSpaceAR(fromUnit.position);

    const array = this.skills[0].split(",");
    const clipName = array[0];
    const effectPrefab = this.effects[array[1] * 1];
    const duration = array[3] * 1;

    fromUnit.getComponent(cc.Animation).play(clipName);

    await this.waitFor(duration);

    if (toUnit && toUnit.parent) {
      const effect = cc.instantiate(effectPrefab);
      effect.parent = this.node.parent;
      effect.setPosition(fromPos);

      if (effect.getComponent(Effect)) {
        const toPos = toUnit.parent.convertToWorldSpaceAR(toUnit.position);
        effect.getComponent(Effect).fly(fromPos, toPos, t1);
      }
    }
  }

  async playHitEffect(toUnitArray: cc.Node[]) {
    const array = this.skills[0].split(",");
    const hitPrefab = this.hits[array[2] * 1];
    const duration = array[4] * 1;

    await this.waitFor(duration);

    for (let i = 0; i < toUnitArray.length; ++i) {
      if (!toUnitArray[i] || !toUnitArray[i].parent) continue;

      const toPos = toUnitArray[i].parent.convertToWorldSpaceAR(toUnitArray[i].position);
      toUnitArray[i].getComponent(cc.Animation).play("unit_hit_00");

      const hit = cc.instantiate(hitPrefab);
      hit.parent = this.node.parent;
      hit.setPosition(toPos);
    }
  }

  waitFor(duration: number) {
    return new Promise((resolve, reject) => {
      this.scheduleOnce(() => {
        resolve();
      }, duration);
    };
  }
}