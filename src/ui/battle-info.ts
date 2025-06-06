import type { EnemyPokemon, default as Pokemon } from "../field/pokemon";
import { getLevelTotalExp, getLevelRelExp } from "../data/exp";
import { getLocalizedSpriteKey, fixedInt } from "#app/utils/common";
import { addTextObject, TextStyle } from "./text";
import { getGenderSymbol, getGenderColor, Gender } from "../data/gender";
import { StatusEffect } from "#enums/status-effect";
import { globalScene } from "#app/global-scene";
import { getTypeRgb } from "#app/data/type";
import { PokemonType } from "#enums/pokemon-type";
import { getVariantTint } from "#app/sprites/variant";
import { Stat } from "#enums/stat";
import BattleFlyout from "./battle-flyout";
import { WindowVariant, addWindow } from "./ui-theme";
import i18next from "i18next";
import { ExpGainsSpeed } from "#app/enums/exp-gains-speed";

export default class BattleInfo extends Phaser.GameObjects.Container {
  public static readonly EXP_GAINS_DURATION_BASE = 1650;

  private baseY: number;

  private player: boolean;
  private mini: boolean;
  private boss: boolean;
  private bossSegments: number;
  private offset: boolean;
  private lastName: string | null;
  private lastTeraType: PokemonType;
  private lastStatus: StatusEffect;
  private lastHp: number;
  private lastMaxHp: number;
  private lastHpFrame: string | null;
  private lastExp: number;
  private lastLevelExp: number;
  private lastLevel: number;
  private lastLevelCapped: boolean;
  private lastStats: string;

  private box: Phaser.GameObjects.Sprite;
  private nameText: Phaser.GameObjects.Text;
  private genderText: Phaser.GameObjects.Text;
  private ownedIcon: Phaser.GameObjects.Sprite;
  private championRibbon: Phaser.GameObjects.Sprite;
  private teraIcon: Phaser.GameObjects.Sprite;
  private shinyIcon: Phaser.GameObjects.Sprite;
  private fusionShinyIcon: Phaser.GameObjects.Sprite;
  private splicedIcon: Phaser.GameObjects.Sprite;
  private statusIndicator: Phaser.GameObjects.Sprite;
  private levelContainer: Phaser.GameObjects.Container;
  private hpBar: Phaser.GameObjects.Image;
  private hpBarSegmentDividers: Phaser.GameObjects.Rectangle[];
  private levelNumbersContainer: Phaser.GameObjects.Container;
  private hpNumbersContainer: Phaser.GameObjects.Container;
  private type1Icon: Phaser.GameObjects.Sprite;
  private type2Icon: Phaser.GameObjects.Sprite;
  private type3Icon: Phaser.GameObjects.Sprite;
  private expBar: Phaser.GameObjects.Image;

  // #region Type effectiveness hint objects
  private effectivenessContainer: Phaser.GameObjects.Container;
  private effectivenessWindow: Phaser.GameObjects.NineSlice;
  private effectivenessText: Phaser.GameObjects.Text;
  private currentEffectiveness?: string;
  // #endregion

  public expMaskRect: Phaser.GameObjects.Graphics;

  private statsContainer: Phaser.GameObjects.Container;
  private statsBox: Phaser.GameObjects.Sprite;
  private statValuesContainer: Phaser.GameObjects.Container;
  private statNumbers: Phaser.GameObjects.Sprite[];

  public flyoutMenu?: BattleFlyout;

  private statOrder: Stat[];
  private readonly statOrderPlayer = [Stat.HP, Stat.ATK, Stat.DEF, Stat.SPATK, Stat.SPDEF, Stat.ACC, Stat.EVA, Stat.SPD];
  private readonly statOrderEnemy = [Stat.HP, Stat.ATK, Stat.DEF, Stat.SPATK, Stat.SPDEF, Stat.ACC, Stat.EVA, Stat.SPD];

  constructor(x: number, y: number, player: boolean) {
    super(globalScene, x, y);
    this.baseY = y;
    this.player = player;
    this.mini = !player;
    this.boss = false;
    this.offset = false;
    this.lastName = null;
    this.lastTeraType = PokemonType.UNKNOWN;
    this.lastStatus = StatusEffect.NONE;
    this.lastHp = -1;
    this.lastMaxHp = -1;
    this.lastHpFrame = null;
    this.lastExp = -1;
    this.lastLevelExp = -1;
    this.lastLevel = -1;

    // Initially invisible and shown via Pokemon.showInfo
    this.setVisible(false);

    this.box = globalScene.add.sprite(0, 0, this.getTextureName());
    this.box.setName("box");
    this.box.setOrigin(1, 0.5);
    this.add(this.box);

    this.nameText = addTextObject(player ? -115 : -124, player ? -15.2 : -11.2, "", TextStyle.BATTLE_INFO);
    this.nameText.setName("text_name");
    this.nameText.setOrigin(0, 0);
    this.add(this.nameText);

    this.genderText = addTextObject(0, 0, "", TextStyle.BATTLE_INFO);
    this.genderText.setName("text_gender");
    this.genderText.setOrigin(0, 0);
    this.genderText.setPositionRelative(this.nameText, 0, 2);
    this.add(this.genderText);

    if (!this.player) {
      this.ownedIcon = globalScene.add.sprite(0, 0, "icon_owned");
      this.ownedIcon.setName("icon_owned");
      this.ownedIcon.setVisible(false);
      this.ownedIcon.setOrigin(0, 0);
      this.ownedIcon.setPositionRelative(this.nameText, 0, 11.75);
      this.add(this.ownedIcon);

      this.championRibbon = globalScene.add.sprite(0, 0, "champion_ribbon");
      this.championRibbon.setName("icon_champion_ribbon");
      this.championRibbon.setVisible(false);
      this.championRibbon.setOrigin(0, 0);
      this.championRibbon.setPositionRelative(this.nameText, 8, 11.75);
      this.add(this.championRibbon);
    }

    this.teraIcon = globalScene.add.sprite(0, 0, "icon_tera");
    this.teraIcon.setName("icon_tera");
    this.teraIcon.setVisible(false);
    this.teraIcon.setOrigin(0, 0);
    this.teraIcon.setScale(0.5);
    this.teraIcon.setPositionRelative(this.nameText, 0, 2);
    this.teraIcon.setInteractive(new Phaser.Geom.Rectangle(0, 0, 12, 15), Phaser.Geom.Rectangle.Contains);
    this.add(this.teraIcon);

    this.shinyIcon = globalScene.add.sprite(0, 0, "shiny_star");
    this.shinyIcon.setName("icon_shiny");
    this.shinyIcon.setVisible(false);
    this.shinyIcon.setOrigin(0, 0);
    this.shinyIcon.setScale(0.5);
    this.shinyIcon.setPositionRelative(this.nameText, 0, 2);
    this.shinyIcon.setInteractive(new Phaser.Geom.Rectangle(0, 0, 12, 15), Phaser.Geom.Rectangle.Contains);
    this.add(this.shinyIcon);

    this.fusionShinyIcon = globalScene.add.sprite(0, 0, "shiny_star_2");
    this.fusionShinyIcon.setName("icon_fusion_shiny");
    this.fusionShinyIcon.setVisible(false);
    this.fusionShinyIcon.setOrigin(0, 0);
    this.fusionShinyIcon.setScale(0.5);
    this.fusionShinyIcon.setPosition(this.shinyIcon.x, this.shinyIcon.y);
    this.add(this.fusionShinyIcon);

    this.splicedIcon = globalScene.add.sprite(0, 0, "icon_spliced");
    this.splicedIcon.setName("icon_spliced");
    this.splicedIcon.setVisible(false);
    this.splicedIcon.setOrigin(0, 0);
    this.splicedIcon.setScale(0.5);
    this.splicedIcon.setPositionRelative(this.nameText, 0, 2);
    this.splicedIcon.setInteractive(new Phaser.Geom.Rectangle(0, 0, 12, 15), Phaser.Geom.Rectangle.Contains);
    this.add(this.splicedIcon);

    this.statusIndicator = globalScene.add.sprite(0, 0, getLocalizedSpriteKey("statuses"));
    this.statusIndicator.setName("icon_status");
    this.statusIndicator.setVisible(false);
    this.statusIndicator.setOrigin(0, 0);
    this.statusIndicator.setPositionRelative(this.nameText, 0, 11.5);
    this.add(this.statusIndicator);

    this.levelContainer = globalScene.add.container(player ? -41 : -50, player ? -10 : -5);
    this.levelContainer.setName("container_level");
    this.add(this.levelContainer);

    const levelOverlay = globalScene.add.image(0, 0, "overlay_lv");
    this.levelContainer.add(levelOverlay);

    this.hpBar = globalScene.add.image(player ? -61 : -71, player ? -1 : 4.5, "overlay_hp");
    this.hpBar.setName("hp_bar");
    this.hpBar.setOrigin(0);
    this.add(this.hpBar);

    this.hpBarSegmentDividers = [];

    this.levelNumbersContainer = globalScene.add.container(9.5, globalScene.uiTheme ? 0 : -0.5);
    this.levelNumbersContainer.setName("container_level");
    this.levelContainer.add(this.levelNumbersContainer);

    if (this.player) {
      this.hpNumbersContainer = globalScene.add.container(-15, 10);
      this.hpNumbersContainer.setName("container_hp");
      this.add(this.hpNumbersContainer);

      const expBar = globalScene.add.image(-98, 18, "overlay_exp");
      expBar.setName("overlay_exp");
      expBar.setOrigin(0);
      this.add(expBar);

      const expMaskRect = globalScene.make.graphics({});
      expMaskRect.setScale(6);
      expMaskRect.fillStyle(0xffffff);
      expMaskRect.beginPath();
      expMaskRect.fillRect(127, 126, 85, 2);

      const expMask = expMaskRect.createGeometryMask();

      expBar.setMask(expMask);

      this.expBar = expBar;
      this.expMaskRect = expMaskRect;
    }

    this.statsContainer = globalScene.add.container(0, 0);
    this.statsContainer.setName("container_stats");
    this.statsContainer.setAlpha(0);
    this.add(this.statsContainer);

    this.statsBox = globalScene.add.sprite(0, 0, `${this.getTextureName()}_stats`);
    this.statsBox.setName("box_stats");
    this.statsBox.setOrigin(1, 0.5);
    this.statsContainer.add(this.statsBox);

    const statLabels: Phaser.GameObjects.Sprite[] = [];
    this.statNumbers = [];

    this.statValuesContainer = globalScene.add.container(0, 0);
    this.statsContainer.add(this.statValuesContainer);

    // this gives us a different starting location from the left of the label and padding between stats for a player vs enemy
    // since the player won't have HP to show, it doesn't need to change from the current version
 const startingX = -this.statsBox.width + 5; // 统一起始位置
const paddingX = 4;                         // 统一间距
const statOverflow = 1;                    // 统一换列逻辑


this.statOrder = this.statOrderEnemy;

this.statOrder.map((s, i) => {
  const statX =
    i > statOverflow
      ? this.statNumbers[Math.max(i - 2, 0)].x + this.statNumbers[Math.max(i - 2, 0)].width + paddingX
      : startingX;

  const baseY = -this.statsBox.height / 2 + 4;
  let statY: number;

  statY = baseY + (i % 2 === 0 ? 10 : 0);

  const statLabel = globalScene.add.sprite(statX, statY, "pbinfo_stat", Stat[s]);
  statLabel.setName("icon_stat_label_" + i.toString());
  statLabel.setOrigin(0, 0);
  statLabels.push(statLabel);
  this.statValuesContainer.add(statLabel);

  const statNumber = globalScene.add.sprite(
    statX + statLabel.width,
    statY,
    "pbinfo_stat_numbers",
    "3" // 默认帧，可根据 s 设置不同默认值
  );
  statNumber.setName("icon_stat_number_" + i.toString());
  statNumber.setOrigin(0, 0);
  this.statNumbers.push(statNumber);
  this.statValuesContainer.add(statNumber);
});

    if (!this.player) {
      this.flyoutMenu = new BattleFlyout(this.player);
      this.add(this.flyoutMenu);

      this.moveBelow<Phaser.GameObjects.GameObject>(this.flyoutMenu, this.box);
    }

    this.type1Icon = globalScene.add.sprite(
      player ? -142 : -16,
      player ? -14 : -16,
      `pbinfo_${player ? "player" : "enemy"}_type1`,
    );
    this.type1Icon.setName("icon_type_1");
    this.type1Icon.setOrigin(0, 0); 
    this.type1Icon.setScale(0.25);
    this.add(this.type1Icon);

    this.type2Icon = globalScene.add.sprite(
      player ? -142 : -16,
      player ? -2 :-4,
      `pbinfo_${player ? "player" : "enemy"}_type2`,
    );
    this.type2Icon.setName("icon_type_2");
    this.type2Icon.setOrigin(0, 0);  
    this.type2Icon.setScale(0.25);
    this.add(this.type2Icon);

    this.type3Icon = globalScene.add.sprite(
      player ? -154 : 0,
      player ? -17 : -15.5,
      `pbinfo_${player ? "player" : "enemy"}_type`,
    );
    this.type3Icon.setName("icon_type_3");
    this.type3Icon.setOrigin(0, 0);
    this.add(this.type3Icon);

    if (!this.player) {
      this.effectivenessContainer = globalScene.add.container(0, 0);
      this.effectivenessContainer.setPositionRelative(this.type1Icon, 22, 4);
      this.effectivenessContainer.setVisible(false);
      this.add(this.effectivenessContainer);

      this.effectivenessText = addTextObject(5, 4.5, "", TextStyle.BATTLE_INFO);
      this.effectivenessWindow = addWindow(0, 0, 0, 20, undefined, false, undefined, undefined, WindowVariant.XTHIN);

      this.effectivenessContainer.add(this.effectivenessWindow);
      this.effectivenessContainer.add(this.effectivenessText);
    }
  }

  getStatsValueContainer(): Phaser.GameObjects.Container {
    return this.statValuesContainer;
  }

  initInfo(pokemon: Pokemon) {
    this.updateNameText(pokemon);
    const nameTextWidth = this.nameText.displayWidth;

    this.name = pokemon.getNameToRender();
    this.box.name = pokemon.getNameToRender();

    this.flyoutMenu?.initInfo(pokemon);

    this.genderText.setText(getGenderSymbol(pokemon.gender));
    this.genderText.setColor(getGenderColor(pokemon.gender));
    this.genderText.setPositionRelative(this.nameText, nameTextWidth, 0);

    this.lastTeraType = pokemon.getTeraType();

    this.teraIcon.setPositionRelative(this.nameText, nameTextWidth + this.genderText.displayWidth + 1, 2);
    this.teraIcon.setVisible(pokemon.isTerastallized);
    this.teraIcon.on("pointerover", () => {
      if (pokemon.isTerastallized) {
        globalScene.ui.showTooltip(
          "",
          i18next.t("fightUiHandler:teraHover", {
            type: i18next.t(`pokemonInfo:Type.${PokemonType[this.lastTeraType]}`),
          }),
        );
      }
    });
    this.teraIcon.on("pointerout", () => globalScene.ui.hideTooltip());

    const isFusion = pokemon.isFusion(true);

    this.splicedIcon.setPositionRelative(
      this.nameText,
      nameTextWidth + this.genderText.displayWidth + 1 + (this.teraIcon.visible ? this.teraIcon.displayWidth + 1 : 0),
      2.5,
    );
    this.splicedIcon.setVisible(isFusion);
    if (this.splicedIcon.visible) {
      this.splicedIcon.on("pointerover", () =>
        globalScene.ui.showTooltip(
          "",
          `${pokemon.species.getName(pokemon.formIndex)}/${pokemon.fusionSpecies?.getName(pokemon.fusionFormIndex)}`,
        ),
      );
      this.splicedIcon.on("pointerout", () => globalScene.ui.hideTooltip());
    }

    const doubleShiny = isFusion && pokemon.shiny && pokemon.fusionShiny;
    const baseVariant = !doubleShiny ? pokemon.getVariant(true) : pokemon.variant;

    this.shinyIcon.setPositionRelative(
      this.nameText,
      nameTextWidth +
        this.genderText.displayWidth +
        1 +
        (this.teraIcon.visible ? this.teraIcon.displayWidth + 1 : 0) +
        (this.splicedIcon.visible ? this.splicedIcon.displayWidth + 1 : 0),
      2.5,
    );
    this.shinyIcon.setTexture(`shiny_star${doubleShiny ? "_1" : ""}`);
    this.shinyIcon.setVisible(pokemon.isShiny());
    this.shinyIcon.setTint(getVariantTint(baseVariant));
    if (this.shinyIcon.visible) {
      const shinyDescriptor =
        doubleShiny || baseVariant
          ? `${baseVariant === 2 ? i18next.t("common:epicShiny") : baseVariant === 1 ? i18next.t("common:rareShiny") : i18next.t("common:commonShiny")}${doubleShiny ? `/${pokemon.fusionVariant === 2 ? i18next.t("common:epicShiny") : pokemon.fusionVariant === 1 ? i18next.t("common:rareShiny") : i18next.t("common:commonShiny")}` : ""}`
          : "";
      this.shinyIcon.on("pointerover", () =>
        globalScene.ui.showTooltip(
          "",
          `${i18next.t("common:shinyOnHover")}${shinyDescriptor ? ` (${shinyDescriptor})` : ""}`,
        ),
      );
      this.shinyIcon.on("pointerout", () => globalScene.ui.hideTooltip());
    }

    this.fusionShinyIcon.setPosition(this.shinyIcon.x, this.shinyIcon.y);
    this.fusionShinyIcon.setVisible(doubleShiny);
    if (isFusion) {
      this.fusionShinyIcon.setTint(getVariantTint(pokemon.fusionVariant));
    }

    if (!this.player) {
      if (this.nameText.visible) {
        this.nameText.on("pointerover", () =>
          globalScene.ui.showTooltip(
            "",
            i18next.t("battleInfo:generation", {
              generation: i18next.t(`starterSelectUiHandler:gen${pokemon.species.generation}`),
            }),
          ),
        );
        this.nameText.on("pointerout", () => globalScene.ui.hideTooltip());
      }

      const dexEntry = globalScene.gameData.dexData[pokemon.species.speciesId];
      this.ownedIcon.setVisible(!!dexEntry.caughtAttr);
      const opponentPokemonDexAttr = pokemon.getDexAttr();
      if (globalScene.gameMode.isClassic) {
        if (
          globalScene.gameData.starterData[pokemon.species.getRootSpeciesId()].classicWinCount > 0 &&
          globalScene.gameData.starterData[pokemon.species.getRootSpeciesId(true)].classicWinCount > 0
        ) {
          this.championRibbon.setVisible(true);
        }
      }

      // Check if Player owns all genders and forms of the Pokemon
      const missingDexAttrs = (dexEntry.caughtAttr & opponentPokemonDexAttr) < opponentPokemonDexAttr;

      const ownedAbilityAttrs = globalScene.gameData.starterData[pokemon.species.getRootSpeciesId()].abilityAttr;

      // Check if the player owns ability for the root form
      const playerOwnsThisAbility = pokemon.checkIfPlayerHasAbilityOfStarter(ownedAbilityAttrs);

      if (missingDexAttrs || !playerOwnsThisAbility) {
        this.ownedIcon.setTint(0x808080);
      }

      if (this.boss) {
        this.updateBossSegmentDividers(pokemon as EnemyPokemon);
      }
    }

    this.hpBar.setScale(pokemon.getHpRatio(true), 1);
    this.lastHpFrame = this.hpBar.scaleX > 0.5 ? "high" : this.hpBar.scaleX > 0.25 ? "medium" : "low";
    this.hpBar.setFrame(this.lastHpFrame);
    if (this.player) {
      this.setHpNumbers(pokemon.hp, pokemon.getMaxHp());
    }
    this.lastHp = pokemon.hp;
    this.lastMaxHp = pokemon.getMaxHp();

    this.setLevel(pokemon.level);
    this.lastLevel = pokemon.level;

    this.shinyIcon.setVisible(pokemon.isShiny());

    const types = pokemon.getTypes(true, false, undefined, true);
    this.type1Icon.setTexture(`pbinfo_${this.player ? "player" : "enemy"}_type${types.length > 1 ? "1" : ""}`);
    this.type1Icon.setFrame(PokemonType[types[0]].toLowerCase());
    this.type2Icon.setVisible(types.length > 1);
    this.type3Icon.setVisible(types.length > 2);
    if (types.length > 1) {
      this.type2Icon.setFrame(PokemonType[types[1]].toLowerCase());
    }
    if (types.length > 2) {
      this.type3Icon.setFrame(PokemonType[types[2]].toLowerCase());
    }

    if (this.player) {
      this.expMaskRect.x = (pokemon.levelExp / getLevelTotalExp(pokemon.level, pokemon.species.growthRate)) * 510;
      this.lastExp = pokemon.exp;
      this.lastLevelExp = pokemon.levelExp;

      this.statValuesContainer.setPosition(8, 7);
    }

    const stats = this.statOrder.map(() => 0);

    this.lastStats = stats.join("");
    this.updateStats(stats);
  }

  getTextureName(): string {
    return `pbinfo_${this.player ? "player" : "enemy"}${!this.player && this.boss ? "_boss" : this.mini ? "_mini" : ""}`;
  }

  setMini(mini: boolean): void {
    if (this.mini === mini) {
      return;
    }

    this.mini = mini;

    this.box.setTexture(this.getTextureName());
    this.statsBox.setTexture(`${this.getTextureName()}_stats`);

    if (this.player) {
      this.y -= 12 * (mini ? 1 : -1);
      this.baseY = this.y;
    }

    const offsetElements = [
      this.nameText,
      this.genderText,
      this.teraIcon,
      this.splicedIcon,
      this.shinyIcon,
      this.statusIndicator,
      this.levelContainer,
    ];
    offsetElements.forEach(el => (el.y += 1.5 * (mini ? -1 : 1)));

    [this.type1Icon, this.type2Icon, this.type3Icon].forEach(el => {
      el.x += 4 * (mini ? 1 : -1);
      el.y += -8 * (mini ? 1 : -1);
    });

    this.statValuesContainer.x += 2 * (mini ? 1 : -1);
    this.statValuesContainer.y += -7 * (mini ? 1 : -1);

    const toggledElements = [this.hpNumbersContainer, this.expBar];
    toggledElements.forEach(el => el.setVisible(!mini));
  }

  toggleStats(visible: boolean): void {
    globalScene.tweens.add({
      targets: this.statsContainer,
      duration: fixedInt(125),
      ease: "Sine.easeInOut",
      alpha: visible ? 1 : 0,
    });
  }

  updateBossSegments(pokemon: EnemyPokemon): void {
    const boss = !!pokemon.bossSegments;

    if (boss !== this.boss) {
      this.boss = boss;

      [
        this.nameText,
        this.genderText,
        this.teraIcon,
        this.splicedIcon,
        this.shinyIcon,
        this.ownedIcon,
        this.championRibbon,
        this.statusIndicator,
        this.statValuesContainer,
      ].map(e => (e.x += 48 * (boss ? -1 : 1)));
      this.hpBar.x += 38 * (boss ? -1 : 1);
      this.hpBar.y += 2 * (this.boss ? -1 : 1);
      this.levelContainer.x += 2 * (boss ? -1 : 1);
      this.hpBar.setTexture(`overlay_hp${boss ? "_boss" : ""}`);
      this.box.setTexture(this.getTextureName());
      this.statsBox.setTexture(`${this.getTextureName()}_stats`);
    }

    this.bossSegments = boss ? pokemon.bossSegments : 0;
    this.updateBossSegmentDividers(pokemon);
  }

  updateBossSegmentDividers(pokemon: EnemyPokemon): void {
    while (this.hpBarSegmentDividers.length) {
      this.hpBarSegmentDividers.pop()?.destroy();
    }

    if (this.boss && this.bossSegments > 1) {
      const uiTheme = globalScene.uiTheme;
      const maxHp = pokemon.getMaxHp();
      for (let s = 1; s < this.bossSegments; s++) {
        const dividerX = (Math.round((maxHp / this.bossSegments) * s) / maxHp) * this.hpBar.width;
        const divider = globalScene.add.rectangle(
          0,
          0,
          1,
          this.hpBar.height - (uiTheme ? 0 : 1),
          pokemon.bossSegmentIndex >= s ? 0xffffff : 0x404040,
        );
        divider.setOrigin(0.5, 0);
        divider.setName("hpBar_divider_" + s.toString());
        this.add(divider);
        this.moveBelow(divider as Phaser.GameObjects.GameObject, this.statsContainer);

        divider.setPositionRelative(this.hpBar, dividerX, uiTheme ? 0 : 1);
        this.hpBarSegmentDividers.push(divider);
      }
    }
  }

  setOffset(offset: boolean): void {
    if (this.offset === offset) {
      return;
    }

    this.offset = offset;

    this.x += 10 * (this.offset === this.player ? 1 : -1);
    this.y += 27 * (this.offset ? 1 : -1);
    this.baseY = this.y;
  }

  updateInfo(pokemon: Pokemon, instant?: boolean): Promise<void> {
    return new Promise(resolve => {
      if (!globalScene) {
        return resolve();
      }

      const gender = pokemon.summonData.illusion?.gender ?? pokemon.gender;

      this.genderText.setText(getGenderSymbol(gender));
      this.genderText.setColor(getGenderColor(gender));

      const nameUpdated = this.lastName !== pokemon.getNameToRender();

      if (nameUpdated) {
        this.updateNameText(pokemon);
        this.genderText.setPositionRelative(this.nameText, this.nameText.displayWidth, 0);
      }

      const teraType = pokemon.isTerastallized ? pokemon.getTeraType() : PokemonType.UNKNOWN;
      const teraTypeUpdated = this.lastTeraType !== teraType;

      if (teraTypeUpdated) {
        this.teraIcon.setVisible(teraType !== PokemonType.UNKNOWN);
        this.teraIcon.setPositionRelative(
          this.nameText,
          this.nameText.displayWidth + this.genderText.displayWidth + 1,
          2,
        );
        this.teraIcon.setTintFill(Phaser.Display.Color.GetColor(...getTypeRgb(teraType)));
        this.lastTeraType = teraType;
      }

      const isFusion = pokemon.isFusion(true);

      if (nameUpdated || teraTypeUpdated) {
        this.splicedIcon.setVisible(isFusion);

        this.teraIcon.setPositionRelative(
          this.nameText,
          this.nameText.displayWidth + this.genderText.displayWidth + 1,
          2,
        );
        this.splicedIcon.setPositionRelative(
          this.nameText,
          this.nameText.displayWidth +
            this.genderText.displayWidth +
            1 +
            (this.teraIcon.visible ? this.teraIcon.displayWidth + 1 : 0),
          1.5,
        );
        this.shinyIcon.setPositionRelative(
          this.nameText,
          this.nameText.displayWidth +
            this.genderText.displayWidth +
            1 +
            (this.teraIcon.visible ? this.teraIcon.displayWidth + 1 : 0) +
            (this.splicedIcon.visible ? this.splicedIcon.displayWidth + 1 : 0),
          2.5,
        );
      }

      if (this.lastStatus !== (pokemon.status?.effect || StatusEffect.NONE)) {
        this.lastStatus = pokemon.status?.effect || StatusEffect.NONE;

        if (this.lastStatus !== StatusEffect.NONE) {
          this.statusIndicator.setFrame(StatusEffect[this.lastStatus].toLowerCase());
        }

        const offsetX = !this.player ? (this.ownedIcon.visible ? 8 : 0) + (this.championRibbon.visible ? 8 : 0) : 0;
        this.statusIndicator.setPositionRelative(this.nameText, offsetX, 11.5);

        this.statusIndicator.setVisible(!!this.lastStatus);
      }
      const types = pokemon.getTypes(true, false, undefined, true);
      this.type1Icon.setTexture(`pbinfo_${this.player ? "player" : "enemy"}_type${types.length > 1 ? "1" : ""}`);
      this.type1Icon.setFrame(PokemonType[types[0]].toLowerCase());
      this.type2Icon.setVisible(types.length > 1);
      this.type3Icon.setVisible(types.length > 2);
      if (types.length > 1) {
        this.type2Icon.setFrame(PokemonType[types[1]].toLowerCase());
      }
      if (types.length > 2) {
        this.type3Icon.setFrame(PokemonType[types[2]].toLowerCase());
      }

      const updateHpFrame = () => {
        const hpFrame = this.hpBar.scaleX > 0.5 ? "high" : this.hpBar.scaleX > 0.25 ? "medium" : "low";
        if (hpFrame !== this.lastHpFrame) {
          this.hpBar.setFrame(hpFrame);
          this.lastHpFrame = hpFrame;
        }
      };

      const updatePokemonHp = () => {
        let duration = !instant ? Phaser.Math.Clamp(Math.abs(this.lastHp - pokemon.hp) * 5, 250, 5000) : 0;
        const speed = globalScene.hpBarSpeed;
        if (speed) {
          duration = speed >= 3 ? 0 : duration / Math.pow(2, speed);
        }
        globalScene.tweens.add({
          targets: this.hpBar,
          ease: "Sine.easeOut",
          scaleX: pokemon.getHpRatio(true),
          duration: duration,
          onUpdate: () => {
            if (this.player && (this.lastHp !== pokemon.hp)) {
              const tweenHp = Math.ceil(this.hpBar.scaleX * pokemon.getMaxHp());
              this.setHpNumbers(tweenHp, pokemon.getMaxHp());
              this.lastHp = tweenHp;
            }
	    this.setHpNumbers(pokemon.hp, pokemon.getMaxHp());
            updateHpFrame();

          },
          onComplete: () => {
            this.setHpNumbers(pokemon.hp, pokemon.getMaxHp());
            updateHpFrame();
            // If, after tweening, the hp is different from the original (due to rounding), force the hp number display
            // to update to the correct value.
            if (this.player && (this.lastHp !== pokemon.hp)) {
              this.setHpNumbers(pokemon.hp, pokemon.getMaxHp());
              this.lastHp = pokemon.hp;
            }
            resolve();
          },
        });
        if (!this.player) {
          this.lastHp = pokemon.hp;
        }
        this.lastMaxHp = pokemon.getMaxHp();
      };

      if (this.player) {
        const isLevelCapped = pokemon.level >= globalScene.getMaxExpLevel();

        if (this.lastExp !== pokemon.exp || this.lastLevel !== pokemon.level) {
          const originalResolve = resolve;
          const durationMultipler = Math.max(
            Phaser.Tweens.Builders.GetEaseFunction("Cubic.easeIn")(
              1 - Math.min(pokemon.level - this.lastLevel, 10) / 10,
            ),
            0.1,
          );
          resolve = () => this.updatePokemonExp(pokemon, false, durationMultipler).then(() => originalResolve());
        } else if (isLevelCapped !== this.lastLevelCapped) {
          this.setLevel(pokemon.level);
        }

        this.lastLevelCapped = isLevelCapped;
      }

      if (this.lastHp !== pokemon.hp || this.lastMaxHp !== pokemon.getMaxHp()) {
        return updatePokemonHp();
      }
      if (!this.player && this.lastLevel !== pokemon.level) {
        this.setLevel(pokemon.level);
        this.lastLevel = pokemon.level;
      }

      const stats = pokemon.getStatStages();
      const statsStr = stats.join("");

      if (this.lastStats !== statsStr) {
        this.updateStats(stats);
        this.lastStats = statsStr;
      }

      this.shinyIcon.setVisible(pokemon.isShiny(true));

      const doubleShiny = isFusion && pokemon.shiny && pokemon.fusionShiny;
      const baseVariant = !doubleShiny ? pokemon.getVariant(true) : pokemon.variant;
      this.shinyIcon.setTint(getVariantTint(baseVariant));

      this.fusionShinyIcon.setVisible(doubleShiny);
      if (isFusion) {
        this.fusionShinyIcon.setTint(getVariantTint(pokemon.fusionVariant));
      }
      this.fusionShinyIcon.setPosition(this.shinyIcon.x, this.shinyIcon.y);

      resolve();
    });
  }

  updateNameText(pokemon: Pokemon): void {
    let displayName = pokemon.getNameToRender().replace(/[♂♀]/g, "");
    let nameTextWidth: number;

    const nameSizeTest = addTextObject(0, 0, displayName, TextStyle.BATTLE_INFO);
    nameTextWidth = nameSizeTest.displayWidth;

    const gender = pokemon.summonData.illusion?.gender ?? pokemon.gender;
    while (
      nameTextWidth >
      (this.player || !this.boss ? 60 : 98) -
        ((gender !== Gender.GENDERLESS ? 6 : 0) +
          (pokemon.fusionSpecies ? 8 : 0) +
          (pokemon.isShiny() ? 8 : 0) +
          (Math.min(pokemon.level.toString().length, 3) - 3) * 8)
    ) {
      displayName = `${displayName.slice(0, displayName.endsWith(".") ? -2 : -1).trimEnd()}.`;
      nameSizeTest.setText(displayName);
      nameTextWidth = nameSizeTest.displayWidth;
    }

    nameSizeTest.destroy();

    this.nameText.setText(displayName);
    this.lastName = pokemon.getNameToRender();

    if (this.nameText.visible) {
      this.nameText.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.nameText.width, this.nameText.height),
        Phaser.Geom.Rectangle.Contains,
      );
    }
  }

  updatePokemonExp(pokemon: Pokemon, instant?: boolean, levelDurationMultiplier = 1): Promise<void> {
    return new Promise(resolve => {
      const levelUp = this.lastLevel < pokemon.level;
      const relLevelExp = getLevelRelExp(this.lastLevel + 1, pokemon.species.growthRate);
      const levelExp = levelUp ? relLevelExp : pokemon.levelExp;
      let ratio = relLevelExp ? levelExp / relLevelExp : 0;
      if (this.lastLevel >= globalScene.getMaxExpLevel(true)) {
        if (levelUp) {
          ratio = 1;
        } else {
          ratio = 0;
        }
        instant = true;
      }
      const durationMultiplier = Phaser.Tweens.Builders.GetEaseFunction("Sine.easeIn")(
        1 - Math.max(this.lastLevel - 100, 0) / 150,
      );
      let duration =
        this.visible && !instant
          ? ((levelExp - this.lastLevelExp) / relLevelExp) *
            BattleInfo.EXP_GAINS_DURATION_BASE *
            durationMultiplier *
            levelDurationMultiplier
          : 0;
      const speed = globalScene.expGainsSpeed;
      if (speed && speed >= ExpGainsSpeed.DEFAULT) {
        duration = speed >= ExpGainsSpeed.SKIP ? ExpGainsSpeed.DEFAULT : duration / Math.pow(2, speed);
      }
      if (ratio === 1) {
        this.lastLevelExp = 0;
        this.lastLevel++;
      } else {
        this.lastExp = pokemon.exp;
        this.lastLevelExp = pokemon.levelExp;
      }
      if (duration) {
        globalScene.playSound("se/exp");
      }
      globalScene.tweens.add({
        targets: this.expMaskRect,
        ease: "Sine.easeIn",
        x: ratio * 510,
        duration: duration,
        onComplete: () => {
          if (!globalScene) {
            return resolve();
          }
          if (duration) {
            globalScene.sound.stopByKey("se/exp");
          }
          if (ratio === 1) {
            globalScene.playSound("se/level_up");
            this.setLevel(this.lastLevel);
            globalScene.time.delayedCall(500 * levelDurationMultiplier, () => {
              this.expMaskRect.x = 0;
              this.updateInfo(pokemon, instant).then(() => resolve());
            });
            return;
          }
          resolve();
        },
      });
    });
  }

  setLevel(level: number): void {
    const isCapped = level >= globalScene.getMaxExpLevel();
    this.levelNumbersContainer.removeAll(true);
    const levelStr = level.toString();
    for (let i = 0; i < levelStr.length; i++) {
      this.levelNumbersContainer.add(
        globalScene.add.image(i * 8, 0, `numbers${isCapped && this.player ? "_red" : ""}`, levelStr[i]),
      );
    }
    this.levelContainer.setX((this.player ? -41 : -50) - 8 * Math.max(levelStr.length - 3, 0));
  }

  setHpNumbers(hp: number, maxHp: number): void {
    if (!this.player || !globalScene) {
      return;
    }
    this.hpNumbersContainer.removeAll(true);
    const hpStr = hp.toString();
    const maxHpStr = maxHp.toString();
    let offset = 0;
    for (let i = maxHpStr.length - 1; i >= 0; i--) {
      this.hpNumbersContainer.add(globalScene.add.image(offset++ * -8, 0, "numbers", maxHpStr[i]));
    }
    this.hpNumbersContainer.add(globalScene.add.image(offset++ * -8, 0, "numbers", "/"));
    for (let i = hpStr.length - 1; i >= 0; i--) {
      this.hpNumbersContainer.add(globalScene.add.image(offset++ * -8, 0, "numbers", hpStr[i]));
    }
  }

  updateStats(stats: number[]): void {
    this.statOrder.map((s, i) => {
        this.statNumbers[i].setFrame(stats[s].toString());
    });
  }

  /**
   * Request the flyoutMenu to toggle if available and hides or shows the effectiveness window where necessary
   */
  toggleFlyout(visible: boolean): void {
    this.flyoutMenu?.toggleFlyout(visible);

    if (visible) {
      this.effectivenessContainer?.setVisible(false);
    } else {
      this.updateEffectiveness(this.currentEffectiveness);
    }
  }

  /**
   * Show or hide the type effectiveness multiplier window
   * Passing undefined will hide the window
   */
  updateEffectiveness(effectiveness?: string) {
    if (this.player) {
      return;
    }
    this.currentEffectiveness = effectiveness;

    if (!globalScene.typeHints || effectiveness === undefined || this.flyoutMenu?.flyoutVisible) {
      this.effectivenessContainer.setVisible(false);
      return;
    }

    this.effectivenessText.setText(effectiveness);
    this.effectivenessWindow.width = 10 + this.effectivenessText.displayWidth;
    this.effectivenessContainer.setVisible(true);
  }

  getBaseY(): number {
    return this.baseY;
  }

  resetY(): void {
    this.y = this.baseY;
  }
}

export class PlayerBattleInfo extends BattleInfo {
  constructor() {
    super(Math.floor(globalScene.game.canvas.width / 6) - 10, -72, true);
  }
}

export class EnemyBattleInfo extends BattleInfo {
  constructor() {
    super(140, -141, false);
  }

  setMini(_mini: boolean): void {} // Always mini
}
