import { ChargeAnim, MoveChargeAnim } from "../battle-anims";
import {
  CommandedTag,
  EncoreTag,
  GulpMissileTag,
  HelpingHandTag,
  SemiInvulnerableTag,
  ShellTrapTag,
  StockpilingTag,
  SubstituteTag,
  TrappedTag,
  TypeBoostTag,
} from "../battler-tags";
import { getPokemonNameWithAffix } from "../../messages";
import type { AttackMoveResult, TurnMove } from "../../field/pokemon";
import type Pokemon from "../../field/pokemon";
import {
  EnemyPokemon,
  FieldPosition,
  HitResult,
  MoveResult,
  PlayerPokemon,
  PokemonMove,
} from "../../field/pokemon";
import {
  getNonVolatileStatusEffects,
  getStatusEffectHealText,
  isNonVolatileStatusEffect,
} from "../status-effect";
import { getTypeDamageMultiplier } from "../type";
import { PokemonType } from "#enums/pokemon-type";
import { BooleanHolder, NumberHolder, isNullOrUndefined, toDmgValue, randSeedItem, randSeedInt, getEnumValues, toReadableString, type Constructor } from "#app/utils/common";
import { WeatherType } from "#enums/weather-type";
import type { ArenaTrapTag } from "../arena-tag";
import { ArenaTagSide, WeakenMoveTypeTag } from "../arena-tag";
import {
  AllyMoveCategoryPowerBoostAbAttr,
  applyAbAttrs,
  applyPostAttackAbAttrs,
  applyPostItemLostAbAttrs,
  applyPreAttackAbAttrs,
  applyPreDefendAbAttrs,
  BlockItemTheftAbAttr,
  BlockNonDirectDamageAbAttr,
  BlockOneHitKOAbAttr,
  BlockRecoilDamageAttr,
  ChangeMovePriorityAbAttr,
  ConfusionOnStatusEffectAbAttr,
  FieldMoveTypePowerBoostAbAttr,
  FieldPreventExplosiveMovesAbAttr,
  ForceSwitchOutImmunityAbAttr,
  HealFromBerryUseAbAttr,
  IgnoreContactAbAttr,
  IgnoreMoveEffectsAbAttr,
  IgnoreProtectOnContactAbAttr,
  InfiltratorAbAttr,
  MaxMultiHitAbAttr,
  MoveAbilityBypassAbAttr,
  MoveEffectChanceMultiplierAbAttr,
  MoveTypeChangeAbAttr,
  PostDamageForceSwitchAbAttr,
  PostItemLostAbAttr,
  ReflectStatusMoveAbAttr,
  ReverseDrainAbAttr,
  UserFieldMoveTypePowerBoostAbAttr,
  VariableMovePowerAbAttr,
  WonderSkinAbAttr,
} from "../abilities/ability";
import { allAbilities } from "../data-lists";
import {
  AttackTypeBoosterModifier,
  BerryModifier,
  PokemonHeldItemModifier,
  PokemonMoveAccuracyBoosterModifier,
  PokemonMultiHitModifier,
  PreserveBerryModifier,
} from "../../modifier/modifier";
import type { BattlerIndex } from "../../battle";
import { BattleType } from "#enums/battle-type";
import { TerrainType } from "../terrain";
import { ModifierPoolType } from "#app/modifier/modifier-type";
import { Command } from "../../ui/command-ui-handler";
import i18next from "i18next";
import type { Localizable } from "#app/interfaces/locales";
import { getBerryEffectFunc } from "../berry";
import { Abilities } from "#enums/abilities";
import { ArenaTagType } from "#enums/arena-tag-type";
import { BattlerTagType } from "#enums/battler-tag-type";
import { Biome } from "#enums/biome";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { MoveUsedEvent } from "#app/events/battle-scene";
import {
  BATTLE_STATS,
  type BattleStat,
  type EffectiveStat,
  getStatKey,
  Stat,
} from "#app/enums/stat";
import { BattleEndPhase } from "#app/phases/battle-end-phase";
import { MoveEndPhase } from "#app/phases/move-end-phase";
import { MovePhase } from "#app/phases/move-phase";
import { NewBattlePhase } from "#app/phases/new-battle-phase";
import { PokemonHealPhase } from "#app/phases/pokemon-heal-phase";
import { StatStageChangePhase } from "#app/phases/stat-stage-change-phase";
import { SwitchPhase } from "#app/phases/switch-phase";
import { SwitchSummonPhase } from "#app/phases/switch-summon-phase";
import { SpeciesFormChangeRevertWeatherFormTrigger } from "../pokemon-forms";
import type { GameMode } from "#app/game-mode";
import { applyChallenges, ChallengeType } from "../challenge";
import { SwitchType } from "#enums/switch-type";
import { StatusEffect } from "#enums/status-effect";
import { globalScene } from "#app/global-scene";
import { RevivalBlessingPhase } from "#app/phases/revival-blessing-phase";
import { LoadMoveAnimPhase } from "#app/phases/load-move-anim-phase";
import { PokemonTransformPhase } from "#app/phases/pokemon-transform-phase";
import { MoveAnimPhase } from "#app/phases/move-anim-phase";
import { loggedInUser } from "#app/account";
import { MoveCategory } from "#enums/MoveCategory";
import { MoveTarget } from "#enums/MoveTarget";
import { MoveFlags } from "#enums/MoveFlags";
import { MoveEffectTrigger } from "#enums/MoveEffectTrigger";
import { MultiHitType } from "#enums/MultiHitType";
import { invalidAssistMoves, invalidCopycatMoves, invalidMetronomeMoves, invalidMirrorMoveMoves, invalidSleepTalkMoves } from "./invalid-moves";
import { SelectBiomePhase } from "#app/phases/select-biome-phase";

type MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) => boolean;
type UserMoveConditionFunc = (user: Pokemon, move: Move) => boolean;

export default class Move implements Localizable {
  public id: Moves;
  public name: string;
  private _type: PokemonType;
  private _category: MoveCategory;
  public moveTarget: MoveTarget;
  public power: number;
  public accuracy: number;
  public pp: number;
  public effect: string;
  /** The chance of a move's secondary effects activating */
  public chance: number;
  public priority: number;
  public generation: number;
  public attrs: MoveAttr[] = [];
  private conditions: MoveCondition[] = [];
  /** The move's {@linkcode MoveFlags} */
  private flags: number = 0;
  private nameAppend: string = "";

  constructor(id: Moves, type: PokemonType, category: MoveCategory, defaultMoveTarget: MoveTarget, power: number, accuracy: number, pp: number, chance: number, priority: number, generation: number) {
    this.id = id;
    this._type = type;
    this._category = category;
    this.moveTarget = defaultMoveTarget;
    this.power = power;
    this.accuracy = accuracy;
    this.pp = pp;
    this.chance = chance;
    this.priority = priority;
    this.generation = generation;

    if (defaultMoveTarget === MoveTarget.USER) {
      this.setFlag(MoveFlags.IGNORE_PROTECT, true);
    }
    if (category === MoveCategory.PHYSICAL) {
      this.setFlag(MoveFlags.MAKES_CONTACT, true);
    }

    this.localize();
  }

  get type() {
    return this._type;
  }
  get category() {
    return this._category;
  }

  localize(): void {
    const i18nKey = Moves[this.id].split("_").filter(f => f).map((f, i) => i ? `${f[0]}${f.slice(1).toLowerCase()}` : f.toLowerCase()).join("") as unknown as string;

    this.name = this.id ? `${i18next.t(`move:${i18nKey}.name`)}${this.nameAppend}` : "";
    this.effect = this.id ? `${i18next.t(`move:${i18nKey}.effect`)}${this.nameAppend}` : "";
  }

  /**
   * Get all move attributes that match `attrType`
   * @param attrType any attribute that extends {@linkcode MoveAttr}
   * @returns Array of attributes that match `attrType`, Empty Array if none match.
   */
  getAttrs<T extends MoveAttr>(attrType: Constructor<T>): T[] {
    return this.attrs.filter((a): a is T => a instanceof attrType);
  }

  /**
   * Check if a move has an attribute that matches `attrType`
   * @param attrType any attribute that extends {@linkcode MoveAttr}
   * @returns true if the move has attribute `attrType`
   */
  hasAttr<T extends MoveAttr>(attrType: Constructor<T>): boolean {
    return this.attrs.some((attr) => attr instanceof attrType);
  }

  /**
   * Takes as input a boolean function and returns the first MoveAttr in attrs that matches true
   * @param attrPredicate
   * @returns the first {@linkcode MoveAttr} element in attrs that makes the input function return true
   */
  findAttr(attrPredicate: (attr: MoveAttr) => boolean): MoveAttr {
    return this.attrs.find(attrPredicate)!; // TODO: is the bang correct?
  }

  /**
   * Adds a new MoveAttr to the move (appends to the attr array)
   * if the MoveAttr also comes with a condition, also adds that to the conditions array: {@linkcode MoveCondition}
   * @param AttrType {@linkcode MoveAttr} the constructor of a MoveAttr class
   * @param args the args needed to instantiate a the given class
   * @returns the called object {@linkcode Move}
   */
  attr<T extends Constructor<MoveAttr>>(AttrType: T, ...args: ConstructorParameters<T>): this {
    const attr = new AttrType(...args);
    this.attrs.push(attr);
    let attrCondition = attr.getCondition();
    if (attrCondition) {
      if (typeof attrCondition === "function") {
        attrCondition = new MoveCondition(attrCondition);
      }
      this.conditions.push(attrCondition);
    }

    return this;
  }

  /**
   * Adds a new MoveAttr to the move (appends to the attr array)
   * if the MoveAttr also comes with a condition, also adds that to the conditions array: {@linkcode MoveCondition}
   * Almost identical to {@link attr}, except you are passing in a MoveAttr object, instead of a constructor and it's arguments
   * @param attrAdd {@linkcode MoveAttr} the attribute to add
   * @returns the called object {@linkcode Move}
   */
  addAttr(attrAdd: MoveAttr): this {
    this.attrs.push(attrAdd);
    let attrCondition = attrAdd.getCondition();
    if (attrCondition) {
      if (typeof attrCondition === "function") {
        attrCondition = new MoveCondition(attrCondition);
      }
      this.conditions.push(attrCondition);
    }

    return this;
  }

  /**
   * Sets the move target of this move
   * @param moveTarget {@linkcode MoveTarget} the move target to set
   * @returns the called object {@linkcode Move}
   */
  target(moveTarget: MoveTarget): this {
    this.moveTarget = moveTarget;
    return this;
  }

  /**
   * Getter function that returns if this Move has a MoveFlag
   * @param flag {@linkcode MoveFlags} to check
   * @returns boolean
   */
  hasFlag(flag: MoveFlags): boolean {
    // internally it is taking the bitwise AND (MoveFlags are represented as bit-shifts) and returning False if result is 0 and true otherwise
    return !!(this.flags & flag);
  }

  /**
   * Getter function that returns if the move hits multiple targets
   * @returns boolean
   */
  isMultiTarget(): boolean {
    switch (this.moveTarget) {
      case MoveTarget.ALL_OTHERS:
      case MoveTarget.ALL_NEAR_OTHERS:
      case MoveTarget.ALL_NEAR_ENEMIES:
      case MoveTarget.ALL_ENEMIES:
      case MoveTarget.USER_AND_ALLIES:
      case MoveTarget.ALL:
      case MoveTarget.USER_SIDE:
      case MoveTarget.ENEMY_SIDE:
      case MoveTarget.BOTH_SIDES:
        return true;
    }
    return false;
  }

  /**
   * Getter function that returns if the move targets the user or its ally
   * @returns boolean
   */
  isAllyTarget(): boolean {
    switch (this.moveTarget) {
      case MoveTarget.USER:
      case MoveTarget.NEAR_ALLY:
      case MoveTarget.ALLY:
      case MoveTarget.USER_OR_NEAR_ALLY:
      case MoveTarget.USER_AND_ALLIES:
      case MoveTarget.USER_SIDE:
        return true;
    }
    return false;
  }

  isChargingMove(): this is ChargingMove {
    return false;
  }

  /**
   * Checks if the move is immune to certain types.
   * Currently looks at cases of Grass types with powder moves and Dark types with moves affected by Prankster.
   * @param {Pokemon} user the source of this move
   * @param {Pokemon} target the target of this move
   * @param {PokemonType} type the type of the move's target
   * @returns boolean
   */
  isTypeImmune(user: Pokemon, target: Pokemon, type: PokemonType): boolean {
    if (this.moveTarget === MoveTarget.USER) {
      return false;
    }

    switch (type) {
      case PokemonType.GRASS:
        if (this.hasFlag(MoveFlags.POWDER_MOVE)) {
          return true;
        }
        break;
      case PokemonType.DARK:
        if (user.hasAbility(Abilities.PRANKSTER) && this.category === MoveCategory.STATUS && (user.isPlayer() !== target.isPlayer())) {
          return true;
        }
        break;
    }
    return false;
  }

  /**
   * Checks if the move would hit its target's Substitute instead of the target itself.
   * @param user The {@linkcode Pokemon} using this move
   * @param target The {@linkcode Pokemon} targeted by this move
   * @returns `true` if the move can bypass the target's Substitute; `false` otherwise.
   */
  hitsSubstitute(user: Pokemon, target?: Pokemon): boolean {
    if ([ MoveTarget.USER, MoveTarget.USER_SIDE, MoveTarget.ENEMY_SIDE, MoveTarget.BOTH_SIDES ].includes(this.moveTarget)
        || !target?.getTag(BattlerTagType.SUBSTITUTE)) {
      return false;
    }

    const bypassed = new BooleanHolder(false);
    // TODO: Allow this to be simulated
    applyAbAttrs(InfiltratorAbAttr, user, null, false, bypassed);

    return !bypassed.value
        && !this.hasFlag(MoveFlags.SOUND_BASED)
        && !this.hasFlag(MoveFlags.IGNORE_SUBSTITUTE);
  }

  /**
   * Adds a move condition to the move
   * @param condition {@linkcode MoveCondition} or {@linkcode MoveConditionFunc}, appends to conditions array a new MoveCondition object
   * @returns the called object {@linkcode Move}
   */
  condition(condition: MoveCondition | MoveConditionFunc): this {
    if (typeof condition === "function") {
      condition = new MoveCondition(condition as MoveConditionFunc);
    }
    this.conditions.push(condition);

    return this;
  }

  /**
   * Internal dev flag for documenting edge cases. When using this, please document the known edge case.
   * @returns the called object {@linkcode Move}
   */
  edgeCase(): this {
    return this;
  }

  /**
   * Marks the move as "partial": appends texts to the move name
   * @returns the called object {@linkcode Move}
   */
  partial(): this {
    this.nameAppend += " (P)";
    return this;
  }

  /**
   * Marks the move as "unimplemented": appends texts to the move name
   * @returns the called object {@linkcode Move}
   */
  unimplemented(): this {
    this.nameAppend += " (N)";
    return this;
  }

  /**
   * Sets the flags of the move
   * @param flag {@linkcode MoveFlags}
   * @param on a boolean, if True, then "ORs" the flag onto existing ones, if False then "XORs" the flag onto existing ones
   */
  private setFlag(flag: MoveFlags, on: boolean): void {
    // bitwise OR and bitwise XOR respectively
    if (on) {
      this.flags |= flag;
    } else {
      this.flags ^= flag;
    }
  }

  /**
   * Sets the {@linkcode MoveFlags.MAKES_CONTACT} flag for the calling Move
   * @param setFlag Default `true`, set to `false` if the move doesn't make contact
   * @see {@linkcode Abilities.STATIC}
   * @returns The {@linkcode Move} that called this function
   */
  makesContact(setFlag: boolean = true): this {
    this.setFlag(MoveFlags.MAKES_CONTACT, setFlag);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.IGNORE_PROTECT} flag for the calling Move
   * @see {@linkcode Moves.CURSE}
   * @returns The {@linkcode Move} that called this function
   */
  ignoresProtect(): this {
    this.setFlag(MoveFlags.IGNORE_PROTECT, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.SOUND_BASED} flag for the calling Move
   * @see {@linkcode Moves.UPROAR}
   * @returns The {@linkcode Move} that called this function
   */
  soundBased(): this {
    this.setFlag(MoveFlags.SOUND_BASED, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.HIDE_USER} flag for the calling Move
   * @see {@linkcode Moves.TELEPORT}
   * @returns The {@linkcode Move} that called this function
   */
  hidesUser(): this {
    this.setFlag(MoveFlags.HIDE_USER, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.HIDE_TARGET} flag for the calling Move
   * @see {@linkcode Moves.WHIRLWIND}
   * @returns The {@linkcode Move} that called this function
   */
  hidesTarget(): this {
    this.setFlag(MoveFlags.HIDE_TARGET, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.BITING_MOVE} flag for the calling Move
   * @see {@linkcode Moves.BITE}
   * @returns The {@linkcode Move} that called this function
   */
  bitingMove(): this {
    this.setFlag(MoveFlags.BITING_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.PULSE_MOVE} flag for the calling Move
   * @see {@linkcode Moves.WATER_PULSE}
   * @returns The {@linkcode Move} that called this function
   */
  pulseMove(): this {
    this.setFlag(MoveFlags.PULSE_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.PUNCHING_MOVE} flag for the calling Move
   * @see {@linkcode Moves.DRAIN_PUNCH}
   * @returns The {@linkcode Move} that called this function
   */
  punchingMove(): this {
    this.setFlag(MoveFlags.PUNCHING_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.SLICING_MOVE} flag for the calling Move
   * @see {@linkcode Moves.X_SCISSOR}
   * @returns The {@linkcode Move} that called this function
   */
  slicingMove(): this {
    this.setFlag(MoveFlags.SLICING_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.RECKLESS_MOVE} flag for the calling Move
   * @see {@linkcode Abilities.RECKLESS}
   * @returns The {@linkcode Move} that called this function
   */
  recklessMove(): this {
    this.setFlag(MoveFlags.RECKLESS_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.BALLBOMB_MOVE} flag for the calling Move
   * @see {@linkcode Moves.ELECTRO_BALL}
   * @returns The {@linkcode Move} that called this function
   */
  ballBombMove(): this {
    this.setFlag(MoveFlags.BALLBOMB_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.POWDER_MOVE} flag for the calling Move
   * @see {@linkcode Moves.STUN_SPORE}
   * @returns The {@linkcode Move} that called this function
   */
  powderMove(): this {
    this.setFlag(MoveFlags.POWDER_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.DANCE_MOVE} flag for the calling Move
   * @see {@linkcode Moves.PETAL_DANCE}
   * @returns The {@linkcode Move} that called this function
   */
  danceMove(): this {
    this.setFlag(MoveFlags.DANCE_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.WIND_MOVE} flag for the calling Move
   * @see {@linkcode Moves.HURRICANE}
   * @returns The {@linkcode Move} that called this function
   */
  windMove(): this {
    this.setFlag(MoveFlags.WIND_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.TRIAGE_MOVE} flag for the calling Move
   * @see {@linkcode Moves.ABSORB}
   * @returns The {@linkcode Move} that called this function
   */
  triageMove(): this {
    this.setFlag(MoveFlags.TRIAGE_MOVE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.IGNORE_ABILITIES} flag for the calling Move
   * @see {@linkcode Moves.SUNSTEEL_STRIKE}
   * @returns The {@linkcode Move} that called this function
   */
  ignoresAbilities(): this {
    this.setFlag(MoveFlags.IGNORE_ABILITIES, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.CHECK_ALL_HITS} flag for the calling Move
   * @see {@linkcode Moves.TRIPLE_AXEL}
   * @returns The {@linkcode Move} that called this function
   */
  checkAllHits(): this {
    this.setFlag(MoveFlags.CHECK_ALL_HITS, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.IGNORE_SUBSTITUTE} flag for the calling Move
   * @see {@linkcode Moves.WHIRLWIND}
   * @returns The {@linkcode Move} that called this function
   */
  ignoresSubstitute(): this {
    this.setFlag(MoveFlags.IGNORE_SUBSTITUTE, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.REDIRECT_COUNTER} flag for the calling Move
   * @see {@linkcode Moves.METAL_BURST}
   * @returns The {@linkcode Move} that called this function
   */
  redirectCounter(): this {
    this.setFlag(MoveFlags.REDIRECT_COUNTER, true);
    return this;
  }

  /**
   * Sets the {@linkcode MoveFlags.REFLECTABLE} flag for the calling Move
   * @see {@linkcode Moves.ATTRACT}
   * @returns The {@linkcode Move} that called this function
   */
  reflectable(): this {
    this.setFlag(MoveFlags.REFLECTABLE, true);
    return this;
  }

  /**
   * Checks if the move flag applies to the pokemon(s) using/receiving the move
   *
   * This method will take the `user`'s ability into account when reporting flags, e.g.
   * calling this method for {@linkcode MoveFlags.MAKES_CONTACT | MAKES_CONTACT}
   * will return `false` if the user has a {@linkcode Abilities.LONG_REACH} that is not being suppressed.
   *
   * **Note:** This method only checks if the move should have effectively have the flag applied to its use.
   * It does *not* check whether the flag will trigger related effects.
   * For example using this method to check {@linkcode MoveFlags.WIND_MOVE}
   * will not consider {@linkcode Abilities.WIND_RIDER | Wind Rider }.
   *
   * To simply check whether the move has a flag, use {@linkcode hasFlag}.
   * @param flag {@linkcode MoveFlags} MoveFlag to check on user and/or target
   * @param user {@linkcode Pokemon} the Pokemon using the move
   * @param target {@linkcode Pokemon} the Pokemon receiving the move
   * @param isFollowUp (defaults to `false`) `true` if the move was used as a follow up
   * @returns boolean
   * @see {@linkcode hasFlag}
   */
  doesFlagEffectApply({ flag, user, target, isFollowUp = false }: {
    flag: MoveFlags;
    user: Pokemon;
    target?: Pokemon;
    isFollowUp?: boolean;
  }): boolean {
    // special cases below, eg: if the move flag is MAKES_CONTACT, and the user pokemon has an ability that ignores contact (like "Long Reach"), then overrides and move does not make contact
    switch (flag) {
      case MoveFlags.MAKES_CONTACT:
        if (user.hasAbilityWithAttr(IgnoreContactAbAttr) || this.hitsSubstitute(user, target)) {
          return false;
        }
        break;
      case MoveFlags.IGNORE_ABILITIES:
        if (user.hasAbilityWithAttr(MoveAbilityBypassAbAttr)) {
          const abilityEffectsIgnored = new BooleanHolder(false);
          applyAbAttrs(MoveAbilityBypassAbAttr, user, abilityEffectsIgnored, false, this);
          if (abilityEffectsIgnored.value) {
            return true;
          }
          // Sunsteel strike, Moongeist beam, and photon geyser will not ignore abilities if invoked
          // by another move, such as via metronome.
        }
        return this.hasFlag(MoveFlags.IGNORE_ABILITIES) && !isFollowUp;
      case MoveFlags.IGNORE_PROTECT:
        if (user.hasAbilityWithAttr(IgnoreProtectOnContactAbAttr)
          && this.doesFlagEffectApply({ flag: MoveFlags.MAKES_CONTACT, user })) {
          return true;
        }
        break;
      case MoveFlags.REFLECTABLE:
        // If the target is not semi-invulnerable and either has magic coat active or an unignored magic bounce ability
        if (
          target?.getTag(SemiInvulnerableTag) ||
          !(target?.getTag(BattlerTagType.MAGIC_COAT) ||
            (!this.doesFlagEffectApply({ flag: MoveFlags.IGNORE_ABILITIES, user, target }) &&
              target?.hasAbilityWithAttr(ReflectStatusMoveAbAttr)))
        ) {
          return false;
        }
        break;
    }

    return !!(this.flags & flag);
  }

  /**
   * Applies each {@linkcode MoveCondition} function of this move to the params, determines if the move can be used prior to calling each attribute's apply()
   * @param user {@linkcode Pokemon} to apply conditions to
   * @param target {@linkcode Pokemon} to apply conditions to
   * @param move {@linkcode Move} to apply conditions to
   * @returns boolean: false if any of the apply()'s return false, else true
   */
  applyConditions(user: Pokemon, target: Pokemon, move: Move): boolean {
    for (const condition of this.conditions) {
      if (!condition.apply(user, target, move)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sees if a move has a custom failure text (by looking at each {@linkcode MoveAttr} of this move)
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @returns string of the custom failure text, or `null` if it uses the default text ("But it failed!")
   */
  getFailedText(user: Pokemon, target: Pokemon, move: Move): string | undefined {
    for (const attr of this.attrs) {
      const failedText = attr.getFailedText(user, target, move);
      if (failedText) {
        return failedText;
      }
    }
  }

  /**
   * Calculates the userBenefitScore across all the attributes and conditions
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} receiving the move
   * @param move {@linkcode Move} using the move
   * @returns integer representing the total benefitScore
   */
  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    let score = 0;

    for (const attr of this.attrs) {
      score += attr.getUserBenefitScore(user, target, move);
    }

    for (const condition of this.conditions) {
      score += condition.getUserBenefitScore(user, target, move);
    }

    return score;
  }

  /**
   * Calculates the targetBenefitScore across all the attributes
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} receiving the move
   * @param move {@linkcode Move} using the move
   * @returns integer representing the total benefitScore
   */
  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    let score = 0;

    if (target.getAlly()?.getTag(BattlerTagType.COMMANDED)?.getSourcePokemon() === target) {
      return 20 * (target.isPlayer() === user.isPlayer() ? -1 : 1); // always -20 with how the AI handles this score
    }

    for (const attr of this.attrs) {
      // conditionals to check if the move is self targeting (if so then you are applying the move to yourself, not the target)
      score += attr.getTargetBenefitScore(user, !attr.selfTarget ? target : user, move) * (target !== user && attr.selfTarget ? -1 : 1);
    }

    return score;
  }

  /**
   * Calculates the accuracy of a move in battle based on various conditions and attributes.
   *
   * @param user {@linkcode Pokemon} The Pokémon using the move.
   * @param target {@linkcode Pokemon} The Pokémon being targeted by the move.
   * @returns The calculated accuracy of the move.
   */
  calculateBattleAccuracy(user: Pokemon, target: Pokemon, simulated: boolean = false) {
    const moveAccuracy = new NumberHolder(this.accuracy);

    applyMoveAttrs(VariableAccuracyAttr, user, target, this, moveAccuracy);
    applyPreDefendAbAttrs(WonderSkinAbAttr, target, user, this, { value: false }, simulated, moveAccuracy);

    if (moveAccuracy.value === -1) {
      return moveAccuracy.value;
    }

    const isOhko = this.hasAttr(OneHitKOAccuracyAttr);

    if (!isOhko) {
      globalScene.applyModifiers(PokemonMoveAccuracyBoosterModifier, user.isPlayer(), user, moveAccuracy);
    }

    if (globalScene.arena.weather?.weatherType === WeatherType.FOG) {
      /**
       *  The 0.9 multiplier is PokeRogue-only implementation, Bulbapedia uses 3/5
       *  See Fog {@link https://bulbapedia.bulbagarden.net/wiki/Fog}
       */
      moveAccuracy.value = Math.floor(moveAccuracy.value * 0.9);
    }

    if (!isOhko && globalScene.arena.getTag(ArenaTagType.GRAVITY)) {
      moveAccuracy.value = Math.floor(moveAccuracy.value * 1.67);
    }

    return moveAccuracy.value;
  }

  /**
   * Calculates the power of a move in battle based on various conditions and attributes.
   *
   * @param source {@linkcode Pokemon} The Pokémon using the move.
   * @param target {@linkcode Pokemon} The Pokémon being targeted by the move.
   * @returns The calculated power of the move.
   */
  calculateBattlePower(source: Pokemon, target: Pokemon, simulated: boolean = false): number {
    if (this.category === MoveCategory.STATUS) {
      return 0;
    }

    const power = new NumberHolder(this.power);
    const typeChangeMovePowerMultiplier = new NumberHolder(1);
    const typeChangeHolder = new NumberHolder(this.type);

    applyPreAttackAbAttrs(MoveTypeChangeAbAttr, source, target, this, true, typeChangeHolder, typeChangeMovePowerMultiplier);

    const sourceTeraType = source.getTeraType();
    if (source.isTerastallized && sourceTeraType === this.type && power.value < 60 && this.priority <= 0 && !this.hasAttr(MultiHitAttr) && !globalScene.findModifier(m => m instanceof PokemonMultiHitModifier && m.pokemonId === source.id)) {
      power.value = 60;
    }

    applyPreAttackAbAttrs(VariableMovePowerAbAttr, source, target, this, simulated, power);
    const ally = source.getAlly();
    if (!isNullOrUndefined(ally)) {
      applyPreAttackAbAttrs(AllyMoveCategoryPowerBoostAbAttr, ally, target, this, simulated, power);
    }

    const fieldAuras = new Set(
      globalScene.getField(true)
        .map((p) => p.getAbilityAttrs(FieldMoveTypePowerBoostAbAttr).filter(attr => {
          const condition = attr.getCondition();
          return (!condition || condition(p));
        }) as FieldMoveTypePowerBoostAbAttr[])
        .flat(),
    );
    for (const aura of fieldAuras) {
      aura.applyPreAttack(source, null, simulated, target, this, [ power ]);
    }

    const alliedField: Pokemon[] = source instanceof PlayerPokemon ? globalScene.getPlayerField() : globalScene.getEnemyField();
    alliedField.forEach(p => applyPreAttackAbAttrs(UserFieldMoveTypePowerBoostAbAttr, p, target, this, simulated, power));

    power.value *= typeChangeMovePowerMultiplier.value;

    const typeBoost = source.findTag(t => t instanceof TypeBoostTag && t.boostedType === typeChangeHolder.value) as TypeBoostTag;
    if (typeBoost) {
      power.value *= typeBoost.boostValue;
    }

    applyMoveAttrs(VariablePowerAttr, source, target, this, power);

    if (!this.hasAttr(TypelessAttr)) {
      globalScene.arena.applyTags(WeakenMoveTypeTag, simulated, typeChangeHolder.value, power);
      globalScene.applyModifiers(AttackTypeBoosterModifier, source.isPlayer(), source, typeChangeHolder.value, power);
    }

    if (source.getTag(HelpingHandTag)) {
      power.value *= 1.5;
    }

    return power.value;
  }

  getPriority(user: Pokemon, simulated: boolean = true) {
    const priority = new NumberHolder(this.priority);

    applyMoveAttrs(IncrementMovePriorityAttr, user, null, this, priority);
    applyAbAttrs(ChangeMovePriorityAbAttr, user, null, simulated, this, priority);

    return priority.value;
  }

  /**
   * Calculate the [Expected Power](https://en.wikipedia.org/wiki/Expected_value) per turn
   * of this move, taking into account multi hit moves, accuracy, and the number of turns it
   * takes to execute.
   *
   * Does not (yet) consider the current field effects or the user's abilities.
   */
  calculateEffectivePower(): number {
    let effectivePower: number;
    // Triple axel and triple kick are easier to special case.
    if (this.id === Moves.TRIPLE_AXEL) {
      effectivePower = 94.14;
    } else if (this.id === Moves.TRIPLE_KICK) {
      effectivePower = 47.07;
    } else {
      const multiHitAttr = this.getAttrs(MultiHitAttr)[0];
      if (multiHitAttr) {
        effectivePower = multiHitAttr.calculateExpectedHitCount(this) * this.power;
      } else {
        effectivePower = this.power * (this.accuracy === -1 ? 1 : this.accuracy / 100);
      }
    }
    /** The number of turns the user must commit to for this move's damage */
    let numTurns = 1;

    // These are intentionally not else-if statements even though there are no
    // pokemon moves that have more than one of these attributes. This allows
    // the function to future proof new moves / custom move behaviors.
    if (this.hasAttr(DelayedAttackAttr)) {
      numTurns += 2;
    }
    if (this.hasAttr(RechargeAttr)) {
      numTurns += 1;
    }
    if (this.isChargingMove()) {
      numTurns += 1;
    }
    return effectivePower / numTurns;
  }

  /**
   * Returns `true` if this move can be given additional strikes
   * by enhancing effects.
   * Currently used for {@link https://bulbapedia.bulbagarden.net/wiki/Parental_Bond_(Ability) | Parental Bond}
   * and {@linkcode PokemonMultiHitModifier | Multi-Lens}.
   * @param user The {@linkcode Pokemon} using the move
   * @param restrictSpread `true` if the enhancing effect
   * should not affect multi-target moves (default `false`)
   */
  canBeMultiStrikeEnhanced(user: Pokemon, restrictSpread: boolean = false): boolean {
    // Multi-strike enhancers...

    // ...cannot enhance moves that hit multiple targets
    const { targets, multiple } = getMoveTargets(user, this.id);
    const isMultiTarget = multiple && targets.length > 1;

    // ...cannot enhance multi-hit or sacrificial moves
    const exceptAttrs: Constructor<MoveAttr>[] = [
      MultiHitAttr,
      SacrificialAttr,
      SacrificialAttrOnHit
    ];

    // ...and cannot enhance these specific moves
    const exceptMoves: Moves[] = [
      Moves.FLING,
      Moves.UPROAR,
      Moves.ROLLOUT,
      Moves.ICE_BALL,
      Moves.ENDEAVOR
    ];

    // ...and cannot enhance Pollen Puff when targeting an ally.
    const ally = user.getAlly();
    const exceptPollenPuffAlly: boolean = this.id === Moves.POLLEN_PUFF && !isNullOrUndefined(ally) && targets.includes(ally.getBattlerIndex())

    return (!restrictSpread || !isMultiTarget)
      && !this.isChargingMove()
      && !exceptAttrs.some(attr => this.hasAttr(attr))
      && !exceptMoves.some(id => this.id === id)
      && !exceptPollenPuffAlly
      && this.category !== MoveCategory.STATUS;
  }
}

export class AttackMove extends Move {
  constructor(id: Moves, type: PokemonType, category: MoveCategory, power: number, accuracy: number, pp: number, chance: number, priority: number, generation: number) {
    super(id, type, category, MoveTarget.NEAR_OTHER, power, accuracy, pp, chance, priority, generation);

    /**
     * {@link https://bulbapedia.bulbagarden.net/wiki/Freeze_(status_condition)}
     * > All damaging Fire-type moves can now thaw a frozen target, regardless of whether or not they have a chance to burn;
     */
    if (this.type === PokemonType.FIRE) {
      this.addAttr(new HealStatusEffectAttr(false, StatusEffect.FREEZE));
    }
  }

  /**
   * Compute the benefit score of this move based on the offensive stat used and the move's power.
   * @param user The Pokemon using the move
   * @param target The Pokemon targeted by the move
   * @param move The move being used
   * @returns The benefit score of using this move
   */
  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    // TODO: Properly handle foul play, body press, and opponent stat stages.
    const ret = super.getTargetBenefitScore(user, target, move);
    let attackScore = 0;

    const effectiveness = target.getAttackTypeEffectiveness(this.type, user, undefined, undefined, this);
    attackScore = Math.pow(effectiveness - 1, 2) * (effectiveness < 1 ? -2 : 2);
    const [ thisStat, offStat ]: EffectiveStat[] = this.category === MoveCategory.PHYSICAL ? [ Stat.ATK, Stat.SPATK ] : [ Stat.SPATK, Stat.ATK ];
    const statHolder = new NumberHolder(user.getEffectiveStat(thisStat, target));
    const offStatValue = user.getEffectiveStat(offStat, target);
    applyMoveAttrs(VariableAtkAttr, user, target, move, statHolder);
    const statRatio = offStatValue / statHolder.value;
    if (statRatio <= 0.75) {
      attackScore *= 2;
    } else if (statRatio <= 0.875) {
      attackScore *= 1.5;
    }

    const power = new NumberHolder(this.calculateEffectivePower());
    applyMoveAttrs(VariablePowerAttr, user, target, move, power);

    attackScore += Math.floor(power.value / 5);

    return ret - attackScore;
  }
}

export class StatusMove extends Move {
  constructor(id: Moves, type: PokemonType, accuracy: number, pp: number, chance: number, priority: number, generation: number) {
    super(id, type, MoveCategory.STATUS, MoveTarget.NEAR_OTHER, -1, accuracy, pp, chance, priority, generation);
  }
}

export class SelfStatusMove extends Move {
  constructor(id: Moves, type: PokemonType, accuracy: number, pp: number, chance: number, priority: number, generation: number) {
    super(id, type, MoveCategory.STATUS, MoveTarget.USER, -1, accuracy, pp, chance, priority, generation);
  }
}

type SubMove = new (...args: any[]) => Move;

function ChargeMove<TBase extends SubMove>(Base: TBase) {
  return class extends Base {
    /** The animation to play during the move's charging phase */
    public readonly chargeAnim: ChargeAnim = ChargeAnim[`${Moves[this.id]}_CHARGING`];
    /** The message to show during the move's charging phase */
    private _chargeText: string;

    /** Move attributes that apply during the move's charging phase */
    public chargeAttrs: MoveAttr[] = [];

    override isChargingMove(): this is ChargingMove {
      return true;
    }

    /**
     * Sets the text to be displayed during this move's charging phase.
     * References to the user Pokemon should be written as "{USER}", and
     * references to the target Pokemon should be written as "{TARGET}".
     * @param chargeText the text to set
     * @returns this {@linkcode Move} (for chaining API purposes)
     */
    chargeText(chargeText: string): this {
      this._chargeText = chargeText;
      return this;
    }

    /**
     * Queues the charge text to display to the player
     * @param user the {@linkcode Pokemon} using this move
     * @param target the {@linkcode Pokemon} targeted by this move (optional)
     */
    showChargeText(user: Pokemon, target?: Pokemon): void {
      globalScene.queueMessage(this._chargeText
        .replace("{USER}", getPokemonNameWithAffix(user))
        .replace("{TARGET}", getPokemonNameWithAffix(target))
      );
    }

    /**
     * Gets all charge attributes of the given attribute type.
     * @param attrType any attribute that extends {@linkcode MoveAttr}
     * @returns Array of attributes that match `attrType`, or an empty array if
     * no matches are found.
     */
    getChargeAttrs<T extends MoveAttr>(attrType: Constructor<T>): T[] {
      return this.chargeAttrs.filter((attr): attr is T => attr instanceof attrType);
    }

    /**
     * Checks if this move has an attribute of the given type.
     * @param attrType any attribute that extends {@linkcode MoveAttr}
     * @returns `true` if a matching attribute is found; `false` otherwise
     */
    hasChargeAttr<T extends MoveAttr>(attrType: Constructor<T>): boolean {
      return this.chargeAttrs.some((attr) => attr instanceof attrType);
    }

    /**
     * Adds an attribute to this move to be applied during the move's charging phase
     * @param ChargeAttrType the type of {@linkcode MoveAttr} being added
     * @param args the parameters to construct the given {@linkcode MoveAttr} with
     * @returns this {@linkcode Move} (for chaining API purposes)
     */
    chargeAttr<T extends Constructor<MoveAttr>>(ChargeAttrType: T, ...args: ConstructorParameters<T>): this {
      const chargeAttr = new ChargeAttrType(...args);
      this.chargeAttrs.push(chargeAttr);

      return this;
    }
  };
}

export class ChargingAttackMove extends ChargeMove(AttackMove) {}
export class ChargingSelfStatusMove extends ChargeMove(SelfStatusMove) {}

export type ChargingMove = ChargingAttackMove | ChargingSelfStatusMove;

/**
 * Base class defining all {@linkcode Move} Attributes
 * @abstract
 * @see {@linkcode apply}
 */
export abstract class MoveAttr {
  /** Should this {@linkcode Move} target the user? */
  public selfTarget: boolean;

  constructor(selfTarget: boolean = false) {
    this.selfTarget = selfTarget;
  }

  /**
   * Applies move attributes
   * @see {@linkcode applyMoveAttrsInternal}
   * @virtual
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args Set of unique arguments needed by this attribute
   * @returns true if application of the ability succeeds
   */
  apply(user: Pokemon | null, target: Pokemon | null, move: Move, args: any[]): boolean {
    return true;
  }

  /**
   * @virtual
   * @returns the {@linkcode MoveCondition} or {@linkcode MoveConditionFunc} for this {@linkcode Move}
   */
  getCondition(): MoveCondition | MoveConditionFunc | null {
    return null;
  }

  /**
   * @virtual
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @returns the string representing failure of this {@linkcode Move}
   */
  getFailedText(user: Pokemon, target: Pokemon, move: Move): string | undefined {
    return;
  }

  /**
   * Used by the Enemy AI to rank an attack based on a given user
   * @see {@linkcode EnemyPokemon.getNextMove}
   * @virtual
   */
  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return 0;
  }

  /**
   * Used by the Enemy AI to rank an attack based on a given target
   * @see {@linkcode EnemyPokemon.getNextMove}
   * @virtual
   */
  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return 0;
  }
}

interface MoveEffectAttrOptions {
  /**
   * Defines when this effect should trigger in the move's effect order
   * @see {@linkcode MoveEffectPhase}
   */
  trigger?: MoveEffectTrigger;
  /** Should this effect only apply on the first hit? */
  firstHitOnly?: boolean;
  /** Should this effect only apply on the last hit? */
  lastHitOnly?: boolean;
  /** Should this effect only apply on the first target hit? */
  firstTargetOnly?: boolean;
  /** Overrides the secondary effect chance for this attr if set. */
  effectChanceOverride?: number;
}

/** Base class defining all Move Effect Attributes
 * @extends MoveAttr
 * @see {@linkcode apply}
 */
export class MoveEffectAttr extends MoveAttr {
  /**
   * A container for this attribute's optional parameters
   * @see {@linkcode MoveEffectAttrOptions} for supported params.
   */
  protected options?: MoveEffectAttrOptions;

  constructor(selfTarget?: boolean, options?: MoveEffectAttrOptions) {
    super(selfTarget);
    this.options = options;
  }

  /**
   * Defines when this effect should trigger in the move's effect order.
   * @default MoveEffectTrigger.POST_APPLY
   * @see {@linkcode MoveEffectTrigger}
   */
  public get trigger () {
    return this.options?.trigger ?? MoveEffectTrigger.POST_APPLY;
  }

  /**
   * `true` if this effect should only trigger on the first hit of
   * multi-hit moves.
   * @default false
   */
  public get firstHitOnly () {
    return this.options?.firstHitOnly ?? false;
  }

  /**
   * `true` if this effect should only trigger on the last hit of
   * multi-hit moves.
   * @default false
   */
  public get lastHitOnly () {
    return this.options?.lastHitOnly ?? false;
  }

  /**
   * `true` if this effect should apply only upon hitting a target
   * for the first time when targeting multiple {@linkcode Pokemon}.
   * @default false
   */
  public get firstTargetOnly () {
    return this.options?.firstTargetOnly ?? false;
  }

  /**
   * If defined, overrides the move's base chance for this
   * secondary effect to trigger.
   */
  public get effectChanceOverride () {
    return this.options?.effectChanceOverride;
  }

  /**
   * Determines whether the {@linkcode Move}'s effects are valid to {@linkcode apply}
   * @virtual
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args Set of unique arguments needed by this attribute
   * @returns true if basic application of the ability attribute should be possible
   */
  canApply(user: Pokemon, target: Pokemon, move: Move, args?: any[]) {
    return !! (this.selfTarget ? user.hp && !user.getTag(BattlerTagType.FRENZY) : target.hp)
           && (this.selfTarget || !target.getTag(BattlerTagType.PROTECTED) ||
                move.doesFlagEffectApply({ flag: MoveFlags.IGNORE_PROTECT, user, target }));
  }

  /** Applies move effects so long as they are able based on {@linkcode canApply} */
  apply(user: Pokemon, target: Pokemon, move: Move, args?: any[]): boolean {
    return this.canApply(user, target, move, args);
  }

  /**
   * Gets the used move's additional effect chance.
   * Chance is modified by {@linkcode MoveEffectChanceMultiplierAbAttr} and {@linkcode IgnoreMoveEffectsAbAttr}.
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon | Target} of this move
   * @param move {@linkcode Move} being used
   * @param selfEffect `true` if move targets user.
   * @returns Move effect chance value.
   */
  getMoveChance(user: Pokemon, target: Pokemon, move: Move, selfEffect?: Boolean, showAbility?: Boolean): number {
    const moveChance = new NumberHolder(this.effectChanceOverride ?? move.chance);

    applyAbAttrs(MoveEffectChanceMultiplierAbAttr, user, null, !showAbility, moveChance, move);

    if ((!move.hasAttr(FlinchAttr) || moveChance.value <= move.chance) && !move.hasAttr(SecretPowerAttr)) {
      const userSide = user.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY;
      globalScene.arena.applyTagsForSide(ArenaTagType.WATER_FIRE_PLEDGE, userSide, false, moveChance);
    }

    if (!selfEffect) {
      applyPreDefendAbAttrs(IgnoreMoveEffectsAbAttr, target, user, null, null, !showAbility, moveChance);
    }
    return moveChance.value;
  }
}

/**
 * Base class defining all Move Header attributes.
 * Move Header effects apply at the beginning of a turn before any moves are resolved.
 * They can be used to apply effects to the field (e.g. queueing a message) or to the user
 * (e.g. adding a battler tag).
 */
export class MoveHeaderAttr extends MoveAttr {
  constructor() {
    super(true);
  }
}

/**
 * Header attribute to queue a message at the beginning of a turn.
 * @see {@link MoveHeaderAttr}
 */
export class MessageHeaderAttr extends MoveHeaderAttr {
  private message: string | ((user: Pokemon, move: Move) => string);

  constructor(message: string | ((user: Pokemon, move: Move) => string)) {
    super();
    this.message = message;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const message = typeof this.message === "string"
      ? this.message
      : this.message(user, move);

    if (message) {
      globalScene.queueMessage(message);
      return true;
    }
    return false;
  }
}

/**
 * Header attribute to add a battler tag to the user at the beginning of a turn.
 * @see {@linkcode MoveHeaderAttr}
 */
export class AddBattlerTagHeaderAttr extends MoveHeaderAttr {
  private tagType: BattlerTagType;

  constructor(tagType: BattlerTagType) {
    super();
    this.tagType = tagType;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    user.addTag(this.tagType);
    return true;
  }
}

/**
 * Header attribute to implement the "charge phase" of Beak Blast at the
 * beginning of a turn.
 * @see {@link https://bulbapedia.bulbagarden.net/wiki/Beak_Blast_(move) | Beak Blast}
 * @see {@linkcode BeakBlastChargingTag}
 */
export class BeakBlastHeaderAttr extends AddBattlerTagHeaderAttr {
  /** Required to initialize Beak Blast's charge animation correctly */
  public chargeAnim = ChargeAnim.BEAK_BLAST_CHARGING;

  constructor() {
    super(BattlerTagType.BEAK_BLAST_CHARGING);
  }
}

export class PreMoveMessageAttr extends MoveAttr {
  private message: string | ((user: Pokemon, target: Pokemon, move: Move) => string);

  constructor(message: string | ((user: Pokemon, target: Pokemon, move: Move) => string)) {
    super();
    this.message = message;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const message = typeof this.message === "string"
      ? this.message as string
      : this.message(user, target, move);
    if (message) {
      globalScene.queueMessage(message, 500);
      return true;
    }
    return false;
  }
}

/**
 * Attribute for moves that can be conditionally interrupted to be considered to
 * have failed before their "useMove" message is displayed. Currently used by
 * Focus Punch.
 * @extends MoveAttr
 */
export class PreUseInterruptAttr extends MoveAttr {
  protected message?: string | ((user: Pokemon, target: Pokemon, move: Move) => string);
  protected overridesFailedMessage: boolean;
  protected conditionFunc: MoveConditionFunc;

  /**
   * Create a new MoveInterruptedMessageAttr.
   * @param message The message to display when the move is interrupted, or a function that formats the message based on the user, target, and move.
   */
  constructor(message?: string | ((user: Pokemon, target: Pokemon, move: Move) => string), conditionFunc?: MoveConditionFunc) {
    super();
    this.message = message;
    this.conditionFunc = conditionFunc ?? (() => true);
  }

  /**
   * Message to display when a move is interrupted.
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   */
  override apply(user: Pokemon, target: Pokemon, move: Move): boolean {
    return this.conditionFunc(user, target, move);
  }

  /**
   * Message to display when a move is interrupted.
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   */
  override getFailedText(user: Pokemon, target: Pokemon, move: Move): string | undefined {
    if (this.message && this.conditionFunc(user, target, move)) {
      const message =
        typeof this.message === "string"
          ? (this.message as string)
          : this.message(user, target, move);
      return message;
    }
  }
}

/**
 * Attribute for Status moves that take attack type effectiveness
 * into consideration (i.e. {@linkcode https://bulbapedia.bulbagarden.net/wiki/Thunder_Wave_(move) | Thunder Wave})
 * @extends MoveAttr
 */
export class RespectAttackTypeImmunityAttr extends MoveAttr { }

export class IgnoreOpponentStatStagesAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as BooleanHolder).value = true;

    return true;
  }
}

export class HighCritAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value++;

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return 3;
  }
}

export class CritOnlyAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as BooleanHolder).value = true;

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return 5;
  }
}

export class FixedDamageAttr extends MoveAttr {
  private damage: number;

  constructor(damage: number) {
    super();

    this.damage = damage;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = this.getDamage(user, target, move);

    return true;
  }

  getDamage(user: Pokemon, target: Pokemon, move: Move): number {
    return this.damage;
  }
}

export class UserHpDamageAttr extends FixedDamageAttr {
  constructor() {
    super(0);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = user.hp;

    return true;
  }
}

export class TargetHalfHpDamageAttr extends FixedDamageAttr {
  /**
   * The initial amount of hp the target had before the first hit.
   * Used for calculating multi lens damage.
   */
  private initialHp: number;
  constructor() {
    super(0);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // first, determine if the hit is coming from multi lens or not
    const lensCount = user.getHeldItems().find(i => i instanceof PokemonMultiHitModifier)?.getStackCount() ?? 0;
    if (lensCount <= 0) {
      // no multi lenses; we can just halve the target's hp and call it a day
      (args[0] as NumberHolder).value = toDmgValue(target.hp / 2);
      return true;
    }

    // figure out what hit # we're on
    switch (user.turnData.hitCount - user.turnData.hitsLeft) {
      case 0:
        // first hit of move; update initialHp tracker
        this.initialHp = target.hp;
      default:
        // multi lens added hit; use initialHp tracker to ensure correct damage
        (args[0] as NumberHolder).value = toDmgValue(this.initialHp / 2);
        return true;
      case lensCount + 1:
        // parental bond added hit; calc damage as normal
        (args[0] as NumberHolder).value = toDmgValue(target.hp / 2);
        return true;
    }
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return target.getHpRatio() > 0.5 ? Math.floor(((target.getHpRatio() - 0.5) * -24) + 4) : -20;
  }
}

export class MatchHpAttr extends FixedDamageAttr {
  constructor() {
    super(0);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = target.hp - user.hp;

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => user.hp <= target.hp;
  }

  // TODO
  /*getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return 0;
  }*/
}

type MoveFilter = (move: Move) => boolean;

export class CounterDamageAttr extends FixedDamageAttr {
  private moveFilter: MoveFilter;
  private multiplier: number;

  constructor(moveFilter: MoveFilter, multiplier: number) {
    super(0);

    this.moveFilter = moveFilter;
    this.multiplier = multiplier;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const damage = user.turnData.attacksReceived.filter(ar => this.moveFilter(allMoves[ar.move])).reduce((total: number, ar: AttackMoveResult) => total + ar.damage, 0);
    (args[0] as NumberHolder).value = toDmgValue(damage * this.multiplier);

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => !!user.turnData.attacksReceived.filter(ar => this.moveFilter(allMoves[ar.move])).length;
  }
}

export class LevelDamageAttr extends FixedDamageAttr {
  constructor() {
    super(0);
  }

  getDamage(user: Pokemon, target: Pokemon, move: Move): number {
    return user.level;
  }
}

export class RandomLevelDamageAttr extends FixedDamageAttr {
  constructor() {
    super(0);
  }

  getDamage(user: Pokemon, target: Pokemon, move: Move): number {
    return toDmgValue(user.level * (user.randSeedIntRange(50, 150) * 0.01));
  }
}

export class ModifiedDamageAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const initialDamage = args[0] as NumberHolder;
    initialDamage.value = this.getModifiedDamage(user, target, move, initialDamage.value);

    return true;
  }

  getModifiedDamage(user: Pokemon, target: Pokemon, move: Move, damage: number): number {
    return damage;
  }
}

export class SurviveDamageAttr extends ModifiedDamageAttr {
  getModifiedDamage(user: Pokemon, target: Pokemon, move: Move, damage: number): number {
    return Math.min(damage, target.hp - 1);
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return target.hp > 1 ? 0 : -20;
  }
}

export class SplashAttr extends MoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    globalScene.queueMessage(i18next.t("moveTriggers:splash"));
    return true;
  }
}

export class CelebrateAttr extends MoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    globalScene.queueMessage(i18next.t("moveTriggers:celebrate", { playerName: loggedInUser?.username }));
    return true;
  }
}

export class RecoilAttr extends MoveEffectAttr {
  private useHp: boolean;
  private damageRatio: number;
  private unblockable: boolean;

  constructor(useHp: boolean = false, damageRatio: number = 0.25, unblockable: boolean = false) {
    super(true, { lastHitOnly: true });

    this.useHp = useHp;
    this.damageRatio = damageRatio;
    this.unblockable = unblockable;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const cancelled = new BooleanHolder(false);
    if (!this.unblockable) {
      applyAbAttrs(BlockRecoilDamageAttr, user, cancelled);
      applyAbAttrs(BlockNonDirectDamageAbAttr, user, cancelled);
    }

    if (cancelled.value) {
      return false;
    }

    // Chloroblast and Struggle should not deal recoil damage if the move was not successful
    if (this.useHp && [ MoveResult.FAIL, MoveResult.MISS ].includes(user.getLastXMoves(1)[0]?.result ?? MoveResult.FAIL)) {
      return false;
    }

    const damageValue = (!this.useHp ? user.turnData.totalDamageDealt : user.getMaxHp()) * this.damageRatio;
    const minValue = user.turnData.totalDamageDealt ? 1 : 0;
    const recoilDamage = toDmgValue(damageValue, minValue);
    if (!recoilDamage) {
      return false;
    }

    if (cancelled.value) {
      return false;
    }

    user.damageAndUpdate(recoilDamage, { result: HitResult.INDIRECT, ignoreSegments: true });
    globalScene.queueMessage(i18next.t("moveTriggers:hitWithRecoil", { pokemonName: getPokemonNameWithAffix(user) }));
    user.turnData.damageTaken += recoilDamage;

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return Math.floor((move.power / 5) / -4);
  }
}


/**
 * Attribute used for moves which self KO the user regardless if the move hits a target
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 **/
export class SacrificialAttr extends MoveEffectAttr {
  constructor() {
    super(true, { trigger: MoveEffectTrigger.POST_TARGET });
  }

  /**
   * Deals damage to the user equal to their current hp
   * @param user {@linkcode Pokemon} that used the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   **/
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    user.damageAndUpdate(user.hp, { result: HitResult.INDIRECT, ignoreSegments: true });
	  user.turnData.damageTaken += user.hp;

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    if (user.isBoss()) {
      return -20;
    }
    return Math.ceil(((1 - user.getHpRatio()) * 10 - 10) * (target.getAttackTypeEffectiveness(move.type, user) - 0.5));
  }
}

/**
 * Attribute used for moves which self KO the user but only if the move hits a target
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 **/
export class SacrificialAttrOnHit extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  /**
   * Deals damage to the user equal to their current hp if the move lands
   * @param user {@linkcode Pokemon} that used the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   **/
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // If the move fails to hit a target, then the user does not faint and the function returns false
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    user.damageAndUpdate(user.hp, { result: HitResult.INDIRECT, ignoreSegments: true });
    user.turnData.damageTaken += user.hp;

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    if (user.isBoss()) {
      return -20;
    }
    return Math.ceil(((1 - user.getHpRatio()) * 10 - 10) * (target.getAttackTypeEffectiveness(move.type, user) - 0.5));
  }
}

/**
 * Attribute used for moves which cut the user's Max HP in half.
 * Triggers using {@linkcode MoveEffectTrigger.POST_TARGET}.
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class HalfSacrificialAttr extends MoveEffectAttr {
  constructor() {
    super(true, { trigger: MoveEffectTrigger.POST_TARGET });
  }

  /**
   * Cut's the user's Max HP in half and displays the appropriate recoil message
   * @param user {@linkcode Pokemon} that used the move
   * @param target N/A
   * @param move {@linkcode Move} with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const cancelled = new BooleanHolder(false);
    // Check to see if the Pokemon has an ability that blocks non-direct damage
    applyAbAttrs(BlockNonDirectDamageAbAttr, user, cancelled);
    if (!cancelled.value) {
      user.damageAndUpdate(toDmgValue(user.getMaxHp() / 2), { result: HitResult.INDIRECT, ignoreSegments: true });
      globalScene.queueMessage(i18next.t("moveTriggers:cutHpPowerUpMove", { pokemonName: getPokemonNameWithAffix(user) })); // Queue recoil message
    }
    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    if (user.isBoss()) {
      return -10;
    }
    return Math.ceil(((1 - user.getHpRatio() / 2) * 10 - 10) * (target.getAttackTypeEffectiveness(move.type, user) - 0.5));
  }
}

/**
 * Attribute to put in a {@link https://bulbapedia.bulbagarden.net/wiki/Substitute_(doll) | Substitute Doll} for the user.
 */
export class AddSubstituteAttr extends MoveEffectAttr {
  /** The ratio of the user's max HP that is required to apply this effect */
  private hpCost: number;
  /** Whether the damage taken should be rounded up (Shed Tail rounds up) */
  private roundUp: boolean;

  constructor(hpCost: number, roundUp: boolean) {
    super(true);

    this.hpCost = hpCost;
    this.roundUp = roundUp;
  }

  /**
   * Removes 1/4 of the user's maximum HP (rounded down) to create a substitute for the user
   * @param user - The {@linkcode Pokemon} that used the move.
   * @param target - n/a
   * @param move - The {@linkcode Move} with this attribute.
   * @param args - n/a
   * @returns `true` if the attribute successfully applies, `false` otherwise
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const damageTaken = this.roundUp ? Math.ceil(user.getMaxHp() * this.hpCost) : Math.floor(user.getMaxHp() * this.hpCost);
    user.damageAndUpdate(damageTaken, { result: HitResult.INDIRECT, ignoreSegments: true, ignoreFaintPhase: true });
    user.addTag(BattlerTagType.SUBSTITUTE, 0, move.id, user.id);
    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    if (user.isBoss()) {
      return -10;
    }
    return 5;
  }

  getCondition(): MoveConditionFunc {
    return (user, _target, _move) => !user.getTag(SubstituteTag) && user.hp > (this.roundUp ? Math.ceil(user.getMaxHp() * this.hpCost) : Math.floor(user.getMaxHp() * this.hpCost)) && user.getMaxHp() > 1;
  }

  /**
   * Get the substitute-specific failure message if one should be displayed.
   * @param user - The pokemon using the move.
   * @returns The substitute-specific failure message if the conditions apply, otherwise `undefined`
   */
  getFailedText(user: Pokemon, _target: Pokemon, _move: Move): string | undefined {
    if (user.getTag(SubstituteTag)) {
      return i18next.t("moveTriggers:substituteOnOverlap", { pokemonName: getPokemonNameWithAffix(user) });
    } else if (user.hp <= Math.floor(user.getMaxHp() / 4) || user.getMaxHp() === 1) {
      return i18next.t("moveTriggers:substituteNotEnoughHp");
    }
  }
}




/**
 * 单纯损失HP的技能属性类，仅按比例扣除使用者的HP，不附加任何状态（如替身）。
 */
export class LoseHpNoSubstituteAttr extends MoveEffectAttr {
  /** 扣除的最大HP比例 */
  private hpCost: number;
  /** 是否向上取整 */
  private roundUp: boolean;

  /**
   * 构造函数
   * @param hpCost - 扣除的最大HP比例
   * @param roundUp - 是否向上取整
   */
  constructor(hpCost: number, roundUp: boolean) {
    super(true);
    this.hpCost = hpCost;
    this.roundUp = roundUp;
  }

  /**
   * 扣除HP但不添加任何状态。
   * @returns 应用成功返回 true
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const damageTaken = this.roundUp
      ? Math.ceil(user.getMaxHp() * this.hpCost)
      : Math.floor(user.getMaxHp() * this.hpCost);

    user.damageAndUpdate(damageTaken, {
      result: HitResult.INDIRECT,
      ignoreSegments: true,
      ignoreFaintPhase: true
    });

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return -5; // 一般AI避免自残行为
  }

  getCondition(): MoveConditionFunc {
    return (user, _target, _move) =>
      user.hp > (this.roundUp
        ? Math.ceil(user.getMaxHp() * this.hpCost)
        : Math.floor(user.getMaxHp() * this.hpCost));
  }

  getFailedText(user: Pokemon, _target: Pokemon, _move: Move): string | undefined {
    const hpNeeded = this.roundUp
      ? Math.ceil(user.getMaxHp() * this.hpCost)
      : Math.floor(user.getMaxHp() * this.hpCost);
    if (user.hp <= hpNeeded) {
      return i18next.t("moveTriggers:substituteNotEnoughHp"); // 可复用原翻译字符串
    }
  }
}
/**
 * Heals the user or target by {@linkcode healRatio} depending on the value of {@linkcode selfTarget}
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class HealAttr extends MoveEffectAttr {
  /** The percentage of {@linkcode Stat.HP} to heal */
  private healRatio: number;
  /** Should an animation be shown? */
  private showAnim: boolean;

  constructor(healRatio?: number, showAnim?: boolean, selfTarget?: boolean) {
    super(selfTarget === undefined || selfTarget);

    this.healRatio = healRatio || 1;
    this.showAnim = !!showAnim;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    this.addHealPhase(this.selfTarget ? user : target, this.healRatio);
    return true;
  }

  /**
   * Creates a new {@linkcode PokemonHealPhase}.
   * This heals the target and shows the appropriate message.
   */
  addHealPhase(target: Pokemon, healRatio: number) {
    globalScene.unshiftPhase(new PokemonHealPhase(target.getBattlerIndex(),
      toDmgValue(target.getMaxHp() * healRatio), i18next.t("moveTriggers:healHp", { pokemonName: getPokemonNameWithAffix(target) }), true, !this.showAnim));
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const score = ((1 - (this.selfTarget ? user : target).getHpRatio()) * 20) - this.healRatio * 10;
    return Math.round(score / (1 - this.healRatio / 2));
  }
}

/**
 * Cures the user's party of non-volatile status conditions, ie. Heal Bell, Aromatherapy
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */




export class PartyStatusCureAttr extends MoveEffectAttr {
  /** Message to display after using move */
  private message: string | null;
  /** Skips mons with this ability, ie. Soundproof */
  private abilityCondition: Abilities;

  constructor(message: string | null, abilityCondition: Abilities) {
    super();

    this.message = message;
    this.abilityCondition = abilityCondition;
  }

  //The same as MoveEffectAttr.canApply, except it doesn't check for the target's HP.
  canApply(user: Pokemon, target: Pokemon, move: Move, args: any[]) {
    const isTargetValid =
      (this.selfTarget && user.hp && !user.getTag(BattlerTagType.FRENZY)) ||
      (!this.selfTarget && (!target.getTag(BattlerTagType.PROTECTED) || move.hasFlag(MoveFlags.IGNORE_PROTECT)));
    return !!isTargetValid;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!this.canApply(user, target, move, args)) {
      return false;
    }
    const partyPokemon = user.isPlayer() ? globalScene.getPlayerParty() : globalScene.getEnemyParty();
    partyPokemon.forEach(p => this.cureStatus(p, user.id));

    if (this.message) {
      globalScene.queueMessage(this.message);
    }

    return true;
  }

  /**
   * Tries to cure the status of the given {@linkcode Pokemon}
   * @param pokemon The {@linkcode Pokemon} to cure.
   * @param userId The ID of the (move) {@linkcode Pokemon | user}.
   */
  public cureStatus(pokemon: Pokemon, userId: number) {
    if (!pokemon.isOnField() || pokemon.id === userId) { // user always cures its own status, regardless of ability
      pokemon.resetStatus(false);
      pokemon.updateInfo();
    } else if (!pokemon.hasAbility(this.abilityCondition)) {
      pokemon.resetStatus();
      pokemon.updateInfo();
    } else {
      // TODO: Ability displays should be handled by the ability
      globalScene.queueAbilityDisplay(pokemon, pokemon.getPassiveAbility()?.id === this.abilityCondition, true);
      globalScene.queueAbilityDisplay(pokemon, pokemon.getPassiveAbility()?.id === this.abilityCondition, false);
    }
  }
}

/**
 * Applies damage to the target's ally equal to 1/16 of that ally's max HP.
 * @extends MoveEffectAttr
 */
export class FlameBurstAttr extends MoveEffectAttr {
  constructor() {
    /**
     * This is self-targeted to bypass immunity to target-facing secondary
     * effects when the target has an active Substitute doll.
     * TODO: Find a more intuitive way to implement Substitute bypassing.
     */
    super(true);
  }
  /**
   * @param user - n/a
   * @param target - The target Pokémon.
   * @param move - n/a
   * @param args - n/a
   * @returns A boolean indicating whether the effect was successfully applied.
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const targetAlly = target.getAlly();
    const cancelled = new BooleanHolder(false);

    if (!isNullOrUndefined(targetAlly)) {
      applyAbAttrs(BlockNonDirectDamageAbAttr, targetAlly, cancelled);
    }

    if (cancelled.value || !targetAlly || targetAlly.switchOutStatus) {
      return false;
    }

    targetAlly.damageAndUpdate(Math.max(1, Math.floor(1 / 16 * targetAlly.getMaxHp())), { result: HitResult.INDIRECT });
    return true;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return !isNullOrUndefined(target.getAlly()) ? -5 : 0;
  }
}

export class SacrificialFullRestoreAttr extends SacrificialAttr {
  protected restorePP: boolean;
  protected moveMessage: string;

  constructor(restorePP: boolean, moveMessage: string) {
    super();

    this.restorePP = restorePP;
    this.moveMessage = moveMessage;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    // We don't know which party member will be chosen, so pick the highest max HP in the party
    const party = user.isPlayer() ? globalScene.getPlayerParty() : globalScene.getEnemyParty();
    const maxPartyMemberHp = party.map(p => p.getMaxHp()).reduce((maxHp: number, hp: number) => Math.max(hp, maxHp), 0);

    globalScene.pushPhase(
      new PokemonHealPhase(
        user.getBattlerIndex(),
        maxPartyMemberHp,
        i18next.t(this.moveMessage, { pokemonName: getPokemonNameWithAffix(user) }),
        true,
        false,
        false,
        true,
        false,
        this.restorePP),
      true);

    return true;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return -20;
  }

  getCondition(): MoveConditionFunc {
    return (user, _target, _move) => globalScene.getPlayerParty().filter(p => p.isActive()).length > globalScene.currentBattle.getBattlerCount();
  }
}

/**
 * Attribute used for moves which ignore type-based debuffs from weather, namely Hydro Steam.
 * Called during damage calculation after getting said debuff from getAttackTypeMultiplier in the Pokemon class.
 * @extends MoveAttr
 * @see {@linkcode apply}
 */
export class IgnoreWeatherTypeDebuffAttr extends MoveAttr {
  /** The {@linkcode WeatherType} this move ignores */
  public weather: WeatherType;

  constructor(weather: WeatherType) {
    super();
    this.weather = weather;
  }
  /**
   * Changes the type-based weather modifier if this move's power would be reduced by it
   * @param user {@linkcode Pokemon} that used the move
   * @param target N/A
   * @param move {@linkcode Move} with this attribute
   * @param args [0] {@linkcode NumberHolder} for arenaAttackTypeMultiplier
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const weatherModifier = args[0] as NumberHolder;
    //If the type-based attack power modifier due to weather (e.g. Water moves in Sun) is below 1, set it to 1
    if (globalScene.arena.weather?.weatherType === this.weather) {
      weatherModifier.value = Math.max(weatherModifier.value, 1);
    }
    return true;
  }
}

export abstract class WeatherHealAttr extends HealAttr {
  constructor() {
    super(0.5);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    let healRatio = 0.5;
    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      const weatherType = globalScene.arena.weather?.weatherType || WeatherType.NONE;
      healRatio = this.getWeatherHealRatio(weatherType);
    }
    this.addHealPhase(user, healRatio);
    return true;
  }

  abstract getWeatherHealRatio(weatherType: WeatherType): number;
}

export class PlantHealAttr extends WeatherHealAttr {
  getWeatherHealRatio(weatherType: WeatherType): number {
    switch (weatherType) {
      case WeatherType.SUNNY:
      case WeatherType.HARSH_SUN:
        return 2 / 3;
      case WeatherType.RAIN:
      case WeatherType.SANDSTORM:
      case WeatherType.HAIL:
      case WeatherType.SNOW:
      case WeatherType.HEAVY_RAIN:
        return 0.25;
      default:
        return 0.5;
    }
  }
}

export class SandHealAttr extends WeatherHealAttr {
  getWeatherHealRatio(weatherType: WeatherType): number {
    switch (weatherType) {
      case WeatherType.SANDSTORM:
        return 2 / 3;
      default:
        return 0.5;
    }
  }
}

/**
 * Heals the target or the user by either {@linkcode normalHealRatio} or {@linkcode boostedHealRatio}
 * depending on the evaluation of {@linkcode condition}
 * @extends HealAttr
 * @see {@linkcode apply}
 */
export class BoostHealAttr extends HealAttr {
  /** Healing received when {@linkcode condition} is false */
  private normalHealRatio: number;
  /** Healing received when {@linkcode condition} is true */
  private boostedHealRatio: number;
  /** The lambda expression to check against when boosting the healing value */
  private condition?: MoveConditionFunc;

  constructor(normalHealRatio: number = 0.5, boostedHealRatio: number = 2 / 3, showAnim?: boolean, selfTarget?: boolean, condition?: MoveConditionFunc) {
    super(normalHealRatio, showAnim, selfTarget);
    this.normalHealRatio = normalHealRatio;
    this.boostedHealRatio = boostedHealRatio;
    this.condition = condition;
  }

  /**
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args N/A
   * @returns true if the move was successful
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const healRatio: number = (this.condition ? this.condition(user, target, move) : false) ? this.boostedHealRatio : this.normalHealRatio;
    this.addHealPhase(target, healRatio);
    return true;
  }
}

/**
 * Heals the target only if it is the ally
 * @extends HealAttr
 * @see {@linkcode apply}
 */
export class HealOnAllyAttr extends HealAttr {
  /**
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.getAlly() === target) {
      super.apply(user, target, move, args);
      return true;
    }

    return false;
  }
}

/**
 * Heals user as a side effect of a move that hits a target.
 * Healing is based on {@linkcode healRatio} * the amount of damage dealt or a stat of the target.
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 * @see {@linkcode getUserBenefitScore}
 */
export class HitHealAttr extends MoveEffectAttr {
  private healRatio: number;
  private healStat: EffectiveStat | null;

  constructor(healRatio?: number | null, healStat?: EffectiveStat) {
    super(true);

    this.healRatio = healRatio ?? 0.5;
    this.healStat = healStat ?? null;
  }
  /**
   * Heals the user the determined amount and possibly displays a message about regaining health.
   * If the target has the {@linkcode ReverseDrainAbAttr}, all healing is instead converted
   * to damage to the user.
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @param args N/A
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    let healAmount = 0;
    let message = "";
    const reverseDrain = target.hasAbilityWithAttr(ReverseDrainAbAttr, false);
    if (this.healStat !== null) {
      // Strength Sap formula
      healAmount = target.getEffectiveStat(this.healStat);
      message = i18next.t("battle:drainMessage", { pokemonName: getPokemonNameWithAffix(target) });
    } else {
      // Default healing formula used by draining moves like Absorb, Draining Kiss, Bitter Blade, etc.
      healAmount = toDmgValue(user.turnData.singleHitDamageDealt * this.healRatio);
      message = i18next.t("battle:regainHealth", { pokemonName: getPokemonNameWithAffix(user) });
    }
    if (reverseDrain) {
      if (user.hasAbilityWithAttr(BlockNonDirectDamageAbAttr)) {
        healAmount = 0;
        message = "";
      } else {
        user.turnData.damageTaken += healAmount;
        healAmount = healAmount * -1;
        message = "";
      }
    }
    globalScene.unshiftPhase(new PokemonHealPhase(user.getBattlerIndex(), healAmount, message, false, true));
    return true;
  }

  /**
   * Used by the Enemy AI to rank an attack based on a given user
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @returns an integer. Higher means enemy is more likely to use that move.
   */
  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    if (this.healStat) {
      const healAmount = target.getEffectiveStat(this.healStat);
      return Math.floor(Math.max(0, (Math.min(1, (healAmount + user.hp) / user.getMaxHp() - 0.33))) / user.getHpRatio());
    }
    return Math.floor(Math.max((1 - user.getHpRatio()) - 0.33, 0) * (move.power / 4));
  }
}

/**
 * Attribute used for moves that change priority in a turn given a condition,
 * e.g. Grassy Glide
 * Called when move order is calculated in {@linkcode TurnStartPhase}.
 * @extends MoveAttr
 * @see {@linkcode apply}
 */
export class IncrementMovePriorityAttr extends MoveAttr {
  /** The condition for a move's priority being incremented */
  private moveIncrementFunc: (pokemon: Pokemon, target:Pokemon, move: Move) => boolean;
  /** The amount to increment priority by, if condition passes. */
  private increaseAmount: number;

  constructor(moveIncrementFunc: (pokemon: Pokemon, target:Pokemon, move: Move) => boolean, increaseAmount = 1) {
    super();

    this.moveIncrementFunc = moveIncrementFunc;
    this.increaseAmount = increaseAmount;
  }

  /**
   * Increments move priority by set amount if condition passes
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @param args [0] {@linkcode NumberHolder} for move priority.
   * @returns true if function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!this.moveIncrementFunc(user, target, move)) {
      return false;
    }

    (args[0] as NumberHolder).value += this.increaseAmount;
    return true;
  }
}

/**
 * Attribute used for attack moves that hit multiple times per use, e.g. Bullet Seed.
 *
 * Applied at the beginning of {@linkcode MoveEffectPhase}.
 *
 * @extends MoveAttr
 * @see {@linkcode apply}
 */
export class MultiHitAttr extends MoveAttr {
  /** This move's intrinsic multi-hit type. It should never be modified. */
  private readonly intrinsicMultiHitType: MultiHitType;
  /** This move's current multi-hit type. It may be temporarily modified by abilities (e.g., Battle Bond). */
  private multiHitType: MultiHitType;

  constructor(multiHitType?: MultiHitType) {
    super();

    this.intrinsicMultiHitType = multiHitType !== undefined ? multiHitType : MultiHitType._2_TO_5;
    this.multiHitType = this.intrinsicMultiHitType;
  }

  // Currently used by `battle_bond.test.ts`
  getMultiHitType(): MultiHitType {
    return this.multiHitType;
  }

  /**
   * Set the hit count of an attack based on this attribute instance's {@linkcode MultiHitType}.
   * If the target has an immunity to this attack's types, the hit count will always be 1.
   *
   * @param user {@linkcode Pokemon} that used the attack
   * @param target {@linkcode Pokemon} targeted by the attack
   * @param move {@linkcode Move} being used
   * @param args [0] {@linkcode NumberHolder} storing the hit count of the attack
   * @returns True
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const hitType = new NumberHolder(this.intrinsicMultiHitType);
    applyMoveAttrs(ChangeMultiHitTypeAttr, user, target, move, hitType);
    this.multiHitType = hitType.value;

    (args[0] as NumberHolder).value = this.getHitCount(user, target);
    return true;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return -5;
  }

  /**
   * Calculate the number of hits that an attack should have given this attribute's
   * {@linkcode MultiHitType}.
   *
   * @param user {@linkcode Pokemon} using the attack
   * @param target {@linkcode Pokemon} targeted by the attack
   * @returns The number of hits this attack should deal
   */
  getHitCount(user: Pokemon, target: Pokemon): number {
    switch (this.multiHitType) {
      case MultiHitType._2_TO_5:
      {
        const rand = user.randSeedInt(20);
        const hitValue = new NumberHolder(rand);
        applyAbAttrs(MaxMultiHitAbAttr, user, null, false, hitValue);
        if (hitValue.value >= 13) {
          return 2;
        } else if (hitValue.value >= 6) {
          return 3;
        } else if (hitValue.value >= 3) {
          return 4;
        } else {
          return 5;
        }
      }
      case MultiHitType._2:
        return 2;
      case MultiHitType._3:
        return 3;
      case MultiHitType._10:
        return 10;
      case MultiHitType.BEAT_UP:
        const party = user.isPlayer() ? globalScene.getPlayerParty() : globalScene.getEnemyParty();
        // No status means the ally pokemon can contribute to Beat Up
        return party.reduce((total, pokemon) => {
          return total + (pokemon.id === user.id ? 1 : pokemon?.status && pokemon.status.effect !== StatusEffect.NONE ? 0 : 1);
        }, 0);
    }
  }

  /**
   * Calculate the expected number of hits given this attribute's {@linkcode MultiHitType},
   * the move's accuracy, and a number of situational parameters.
   *
   * @param move - The move that this attribtue is applied to
   * @param partySize - The size of the user's party, used for {@linkcode Moves.BEAT_UP | Beat Up} (default: `1`)
   * @param maxMultiHit - Whether the move should always hit the maximum number of times, e.g. due to {@linkcode Abilities.SKILL_LINK | Skill Link} (default: `false`)
   * @param ignoreAcc - `true` if the move should ignore accuracy checks, e.g. due to  {@linkcode Abilities.NO_GUARD | No Guard} (default: `false`)
   */
  calculateExpectedHitCount(move: Move, { ignoreAcc = false, maxMultiHit = false, partySize = 1 }: {ignoreAcc?: boolean, maxMultiHit?: boolean, partySize?: number} = {}): number {
    let expectedHits: number;
    switch (this.multiHitType) {
      case MultiHitType._2_TO_5:
        expectedHits = maxMultiHit ? 5 : 3.1;
        break;
      case MultiHitType._2:
        expectedHits = 2;
        break;
      case MultiHitType._3:
        expectedHits = 3;
        break;
      case MultiHitType._5:
        expectedHits = 5;
        break;
      case MultiHitType._10:
        expectedHits = 10;
        break;
      case MultiHitType.BEAT_UP:
        // Estimate that half of the party can contribute to beat up.
        expectedHits = Math.max(1, partySize / 2);
        break;
    }
    if (ignoreAcc || move.accuracy === -1) {
      return expectedHits;
    }
    const acc = move.accuracy / 100;
    if (move.hasFlag(MoveFlags.CHECK_ALL_HITS) && !maxMultiHit) {
      // N.B. No moves should be the _2_TO_5 variant and have the CHECK_ALL_HITS flag.
      return acc * (1 - Math.pow(acc, expectedHits)) / (1 - acc);
    }
    return expectedHits *= acc;
  }
}

export class ChangeMultiHitTypeAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    //const hitType = args[0] as Utils.NumberHolder;
    return false;
  }
}

export class WaterShurikenMultiHitTypeAttr extends ChangeMultiHitTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.species.speciesId === Species.GRENINJA && user.hasAbility(Abilities.BATTLE_BOND) && user.formIndex === 2) {
      (args[0] as NumberHolder).value = MultiHitType._3;
      return true;
    }
    return false;
  }
}

export class StatusEffectAttr extends MoveEffectAttr {
  public effect: StatusEffect;
  public turnsRemaining?: number;
  public overrideStatus: boolean = false;

  constructor(effect: StatusEffect, selfTarget?: boolean, turnsRemaining?: number, overrideStatus: boolean = false) {
    super(selfTarget);

    this.effect = effect;
    this.turnsRemaining = turnsRemaining;
    this.overrideStatus = overrideStatus;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveChance = this.getMoveChance(user, target, move, this.selfTarget, true);
    const statusCheck = moveChance < 0 || moveChance === 100 || user.randSeedInt(100) < moveChance;
    const quiet = move.category !== MoveCategory.STATUS;
    if (statusCheck) {
      const pokemon = this.selfTarget ? user : target;
      if (user !== target && move.category === MoveCategory.STATUS && !target.canSetStatus(this.effect, quiet, false, user, true)) {
        return false;
      }
      if (((!pokemon.status || this.overrideStatus) || (pokemon.status.effect === this.effect && moveChance < 0))
        && pokemon.trySetStatus(this.effect, true, user, this.turnsRemaining, null, this.overrideStatus, quiet)) {
        applyPostAttackAbAttrs(ConfusionOnStatusEffectAbAttr, user, target, move, null, false, this.effect);
        return true;
      }
    }
    return false;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const moveChance = this.getMoveChance(user, target, move, this.selfTarget, false);
    const score = (moveChance < 0) ? -10 : Math.floor(moveChance * -0.1);
    const pokemon = this.selfTarget ? user : target;

    return !pokemon.status && pokemon.canSetStatus(this.effect, true, false, user) ? score : 0;
  }
}

export class MultiStatusEffectAttr extends StatusEffectAttr {
  public effects: StatusEffect[];

  constructor(effects: StatusEffect[], selfTarget?: boolean, turnsRemaining?: number, overrideStatus?: boolean) {
    super(effects[0], selfTarget, turnsRemaining, overrideStatus);
    this.effects = effects;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    this.effect = randSeedItem(this.effects);
    const result = super.apply(user, target, move, args);
    return result;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const moveChance = this.getMoveChance(user, target, move, this.selfTarget, false);
    const score = (moveChance < 0) ? -10 : Math.floor(moveChance * -0.1);
    const pokemon = this.selfTarget ? user : target;

    return !pokemon.status && pokemon.canSetStatus(this.effect, true, false, user) ? score : 0;
  }
}

export class PsychoShiftEffectAttr extends MoveEffectAttr {
  constructor() {
    super(false);
  }

  /**
   * Applies the effect of Psycho Shift to its target
   * Psycho Shift takes the user's status effect and passes it onto the target. The user is then healed after the move has been successfully executed.
   * @returns `true` if Psycho Shift's effect is able to be applied to the target
   */
  apply(user: Pokemon, target: Pokemon, _move: Move, _args: any[]): boolean {
    const statusToApply: StatusEffect | undefined = user.status?.effect ?? (user.hasAbility(Abilities.COMATOSE) ? StatusEffect.SLEEP : undefined);

    if (target.status) {
      return false;
    } else {
      const canSetStatus = target.canSetStatus(statusToApply, true, false, user);
      const trySetStatus = canSetStatus ? target.trySetStatus(statusToApply, true, user) : false;

      if (trySetStatus && user.status) {
        // PsychoShiftTag is added to the user if move succeeds so that the user is healed of its status effect after its move
        user.addTag(BattlerTagType.PSYCHO_SHIFT);
      }

      return trySetStatus;
    }
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return !target.status && target.canSetStatus(user.status?.effect, true, false, user) ? -10 : 0;
  }
}

/**
 * Attribute to steal items upon this move's use.
 * Used for {@linkcode Moves.THIEF} and {@linkcode Moves.COVET}.
 */
export class StealHeldItemChanceAttr extends MoveEffectAttr {
  private chance: number;

  constructor(chance: number) {
    super(false);
    this.chance = chance;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const rand = Phaser.Math.RND.realInRange(0, 1);
    if (rand >= this.chance) {
      return false;
    }

    const heldItems = this.getTargetHeldItems(target).filter((i) => i.isTransferable);
    if (!heldItems.length) {
      return false;
    }

    const poolType = target.isPlayer() ? ModifierPoolType.PLAYER : target.hasTrainer() ? ModifierPoolType.TRAINER : ModifierPoolType.WILD;
    const highestItemTier = heldItems.map((m) => m.type.getOrInferTier(poolType)).reduce((highestTier, tier) => Math.max(tier!, highestTier), 0); // TODO: is the bang after tier correct?
    const tierHeldItems = heldItems.filter((m) => m.type.getOrInferTier(poolType) === highestItemTier);
    const stolenItem = tierHeldItems[user.randSeedInt(tierHeldItems.length)];
    if (!globalScene.tryTransferHeldItemModifier(stolenItem, user, false)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:stoleItem", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target), itemName: stolenItem.type.name }));
    return true;
  }

  getTargetHeldItems(target: Pokemon): PokemonHeldItemModifier[] {
    return globalScene.findModifiers(m => m instanceof PokemonHeldItemModifier
      && m.pokemonId === target.id, target.isPlayer()) as PokemonHeldItemModifier[];
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const heldItems = this.getTargetHeldItems(target);
    return heldItems.length ? 5 : 0;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const heldItems = this.getTargetHeldItems(target);
    return heldItems.length ? -5 : 0;
  }
}

/**
 * Removes a random held item (or berry) from target.
 * Used for Incinerate and Knock Off.
 * Not Implemented Cases: (Same applies for Thief)
 * "If the user faints due to the target's Ability (Rough Skin or Iron Barbs) or held Rocky Helmet, it cannot remove the target's held item."
 * "If the Pokémon is knocked out by the attack, Sticky Hold does not protect the held item.""
 */
export class RemoveHeldItemAttr extends MoveEffectAttr {

  /** Optional restriction for item pool to berries only; i.e. Incinerate */
  private berriesOnly: boolean;

  constructor(berriesOnly: boolean = false) {
    super(false);
    this.berriesOnly = berriesOnly;
  }

  /**
   * Attempt to permanently remove a held
   * @param user - The {@linkcode Pokemon} that used the move
   * @param target - The {@linkcode Pokemon} targeted by the move
   * @param move - N/A
   * @param args N/A
   * @returns `true` if an item was able to be removed
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!this.berriesOnly && target.isPlayer()) { // "Wild Pokemon cannot knock off Player Pokemon's held items" (See Bulbapedia)
      return false;
    }

    // Check for abilities that block item theft
    // TODO: This should not trigger if the target would faint beforehand
    const cancelled = new BooleanHolder(false);
    applyAbAttrs(BlockItemTheftAbAttr, target, cancelled);

    if (cancelled.value) {
      return false;
    }

    // Considers entire transferrable item pool by default (Knock Off).
    // Otherwise only consider berries (Incinerate).
    let heldItems = this.getTargetHeldItems(target).filter(i => i.isTransferable);

    if (this.berriesOnly) {
      heldItems = heldItems.filter(m => m instanceof BerryModifier && m.pokemonId === target.id, target.isPlayer());
    }

    if (!heldItems.length) {
      return false;
    }

    const removedItem = heldItems[user.randSeedInt(heldItems.length)];

    // Decrease item amount and update icon
    target.loseHeldItem(removedItem);
    globalScene.updateModifiers(target.isPlayer());

    if (this.berriesOnly) {
      globalScene.queueMessage(i18next.t("moveTriggers:incineratedItem", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target), itemName: removedItem.type.name }));
    } else {
      globalScene.queueMessage(i18next.t("moveTriggers:knockedOffItem", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target), itemName: removedItem.type.name }));
    }

    return true;
  }

  getTargetHeldItems(target: Pokemon): PokemonHeldItemModifier[] {
    return globalScene.findModifiers(m => m instanceof PokemonHeldItemModifier
      && m.pokemonId === target.id, target.isPlayer()) as PokemonHeldItemModifier[];
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const heldItems = this.getTargetHeldItems(target);
    return heldItems.length ? 5 : 0;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const heldItems = this.getTargetHeldItems(target);
    return heldItems.length ? -5 : 0;
  }
}

/**
 * Attribute that causes targets of the move to eat a berry. Used for Teatime, Stuff Cheeks
 */
export class EatBerryAttr extends MoveEffectAttr {
  protected chosenBerry: BerryModifier;
  constructor(selfTarget: boolean) {
    super(selfTarget);
  }

  /**
   * Causes the target to eat a berry.
   * @param user The {@linkcode Pokemon} Pokemon that used the move
   * @param target The {@linkcode Pokemon} Pokemon that will eat the berry
   * @param move The {@linkcode Move} being used
   * @param args Unused
   * @returns `true` if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const pokemon = this.selfTarget ? user : target;

    const heldBerries = this.getTargetHeldBerries(pokemon);
    if (heldBerries.length <= 0) {
      return false;
    }

    // pick a random berry to gobble and check if we preserve it
    this.chosenBerry = heldBerries[user.randSeedInt(heldBerries.length)];
    const preserve = new BooleanHolder(false);
    // check for berry pouch preservation
    globalScene.applyModifiers(PreserveBerryModifier, pokemon.isPlayer(), pokemon, preserve);
    if (!preserve.value) {
      this.reduceBerryModifier(pokemon);
    }

    // Don't update harvest for berries preserved via Berry pouch (no item dupes lol)
    this.eatBerry(target, undefined, !preserve.value);

    return true;
  }

  getTargetHeldBerries(target: Pokemon): BerryModifier[] {
    return globalScene.findModifiers(m => m instanceof BerryModifier
      && (m as BerryModifier).pokemonId === target.id, target.isPlayer()) as BerryModifier[];
  }

  reduceBerryModifier(target: Pokemon) {
    if (this.chosenBerry) {
      target.loseHeldItem(this.chosenBerry);
    }
    globalScene.updateModifiers(target.isPlayer());
  }


  /**
   * Internal function to apply berry effects.
   *
   * @param consumer - The {@linkcode Pokemon} eating the berry; assumed to also be owner if `berryOwner` is omitted
   * @param berryOwner - The {@linkcode Pokemon} whose berry is being eaten; defaults to `consumer` if not specified.
   * @param updateHarvest - Whether to prevent harvest from tracking berries;
   * defaults to whether `consumer` equals `berryOwner` (i.e. consuming own berry).
   */
   protected eatBerry(consumer: Pokemon, berryOwner: Pokemon = consumer, updateHarvest = consumer === berryOwner) {
     // consumer eats berry, owner triggers unburden and similar effects
    getBerryEffectFunc(this.chosenBerry.berryType)(consumer);
    applyPostItemLostAbAttrs(PostItemLostAbAttr, berryOwner, false);
    applyAbAttrs(HealFromBerryUseAbAttr, consumer, new BooleanHolder(false));
    consumer.recordEatenBerry(this.chosenBerry.berryType, updateHarvest);
  }
}

/**
 * Attribute used for moves that steal and eat a random berry from the target.
 * Used for {@linkcode Moves.PLUCK} & {@linkcode Moves.BUG_BITE}.
 */
export class StealEatBerryAttr extends EatBerryAttr {
  constructor() {
    super(false);
  }

  /**
   * User steals a random berry from the target and then eats it.
   * @param user - The {@linkcode Pokemon} using the move; will eat the stolen berry
   * @param target - The {@linkcode Pokemon} having its berry stolen
   * @param move - The {@linkcode Move} being used
   * @param args N/A
   * @returns `true` if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // check for abilities that block item theft
    const cancelled = new BooleanHolder(false);
    applyAbAttrs(BlockItemTheftAbAttr, target, cancelled);
    if (cancelled.value === true) {
      return false;
    }

    // check if the target even _has_ a berry in the first place
    // TODO: Check on cart if Pluck displays messages when used against sticky hold mons w/o berries
    const heldBerries = this.getTargetHeldBerries(target);
    if (heldBerries.length <= 0) {
      return false;
    }

    // pick a random berry and eat it
    this.chosenBerry = heldBerries[user.randSeedInt(heldBerries.length)];
    applyPostItemLostAbAttrs(PostItemLostAbAttr, target, false);
    const message = i18next.t("battle:stealEatBerry", { pokemonName: user.name, targetName: target.name, berryName: this.chosenBerry.type.name });
    globalScene.queueMessage(message);
    this.reduceBerryModifier(target);
    this.eatBerry(user, target);

    return true;
  }
}

/**
 * Move attribute that signals that the move should cure a status effect
 * @extends MoveEffectAttr
 * @see {@linkcode apply()}
 */
export class HealStatusEffectAttr extends MoveEffectAttr {
  /** List of Status Effects to cure */
  private effects: StatusEffect[];

  /**
   * @param selfTarget - Whether this move targets the user
   * @param effects - status effect or list of status effects to cure
   */
  constructor(selfTarget: boolean, effects: StatusEffect | StatusEffect[]) {
    super(selfTarget, { lastHitOnly: true });
    this.effects = [ effects ].flat(1);
  }

  /**
   * @param user {@linkcode Pokemon} source of the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move the {@linkcode Move} being used
   * @returns true if the status is cured
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    // Special edge case for shield dust blocking Sparkling Aria curing burn
    const moveTargets = getMoveTargets(user, move.id);
    if (target.hasAbilityWithAttr(IgnoreMoveEffectsAbAttr) && move.id === Moves.SPARKLING_ARIA && moveTargets.targets.length === 1) {
      return false;
    }

    const pokemon = this.selfTarget ? user : target;
    if (pokemon.status && this.effects.includes(pokemon.status.effect)) {
      globalScene.queueMessage(getStatusEffectHealText(pokemon.status.effect, getPokemonNameWithAffix(pokemon)));
      pokemon.resetStatus();
      pokemon.updateInfo();

      return true;
    }

    return false;
  }

  isOfEffect(effect: StatusEffect): boolean {
    return this.effects.includes(effect);
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return user.status ? 10 : 0;
  }
}

export class BypassSleepAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.status?.effect === StatusEffect.SLEEP) {
      user.addTag(BattlerTagType.BYPASS_SLEEP, 1, move.id, user.id);
      return true;
    }

    return false;
  }

  /**
   * Returns arbitrarily high score when Pokemon is asleep, otherwise shouldn't be used
   * @param user
   * @param target
   * @param move
   */
  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return user.status && user.status.effect === StatusEffect.SLEEP ? 200 : -10;
  }
}

/**
 * Attribute used for moves that bypass the burn damage reduction of physical moves, currently only facade
 * Called during damage calculation
 * @extends MoveAttr
 * @see {@linkcode apply}
 */
export class BypassBurnDamageReductionAttr extends MoveAttr {
  /** Prevents the move's damage from being reduced by burn
   * @param user N/A
   * @param target N/A
   * @param move {@linkcode Move} with this attribute
   * @param args [0] {@linkcode BooleanHolder} for burnDamageReductionCancelled
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as BooleanHolder).value = true;

    return true;
  }
}

export class WeatherChangeAttr extends MoveEffectAttr {
  private weatherType: WeatherType;

  constructor(weatherType: WeatherType) {
    super();

    this.weatherType = weatherType;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return globalScene.arena.trySetWeather(this.weatherType, user);
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => !globalScene.arena.weather || (globalScene.arena.weather.weatherType !== this.weatherType && !globalScene.arena.weather.isImmutable());
  }
}

export class ClearWeatherAttr extends MoveEffectAttr {
  private weatherType: WeatherType;

  constructor(weatherType: WeatherType) {
    super();

    this.weatherType = weatherType;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (globalScene.arena.weather?.weatherType === this.weatherType) {
      return globalScene.arena.trySetWeather(WeatherType.NONE, user);
    }

    return false;
  }
}

export class TerrainChangeAttr extends MoveEffectAttr {
  private terrainType: TerrainType;

  constructor(terrainType: TerrainType) {
    super();

    this.terrainType = terrainType;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return globalScene.arena.trySetTerrain(this.terrainType, true, user);
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => !globalScene.arena.terrain || (globalScene.arena.terrain.terrainType !== this.terrainType);
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    // TODO: Expand on this
    return globalScene.arena.terrain ? 0 : 6;
  }
}

export class ClearTerrainAttr extends MoveEffectAttr {
  constructor() {
    super();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return globalScene.arena.trySetTerrain(TerrainType.NONE, true, user);
  }
}

export class OneHitKOAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (target.isBossImmune()) {
      return false;
    }

    (args[0] as BooleanHolder).value = true;

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const cancelled = new BooleanHolder(false);
      applyAbAttrs(BlockOneHitKOAbAttr, target, cancelled);
      return !cancelled.value && user.level >= target.level;
    };
  }
}

/**
 * Attribute that allows charge moves to resolve in 1 turn under a given condition.
 * Should only be used for {@linkcode ChargingMove | ChargingMoves} as a `chargeAttr`.
 * @extends MoveAttr
 */
export class InstantChargeAttr extends MoveAttr {
  /** The condition in which the move with this attribute instantly charges */
  protected readonly condition: UserMoveConditionFunc;

  constructor(condition: UserMoveConditionFunc) {
    super(true);
    this.condition = condition;
  }

  /**
   * Flags the move with this attribute as instantly charged if this attribute's condition is met.
   * @param user the {@linkcode Pokemon} using the move
   * @param target n/a
   * @param move the {@linkcode Move} associated with this attribute
   * @param args
   *  - `[0]` a {@linkcode BooleanHolder | BooleanHolder} for the "instant charge" flag
   * @returns `true` if the instant charge condition is met; `false` otherwise.
   */
  override apply(user: Pokemon, target: Pokemon | null, move: Move, args: any[]): boolean {
    const instantCharge = args[0];
    if (!(instantCharge instanceof BooleanHolder)) {
      return false;
    }

    if (this.condition(user, move)) {
      instantCharge.value = true;
      return true;
    }
    return false;
  }
}

/**
 * Attribute that allows charge moves to resolve in 1 turn while specific {@linkcode WeatherType | Weather}
 * is active. Should only be used for {@linkcode ChargingMove | ChargingMoves} as a `chargeAttr`.
 * @extends InstantChargeAttr
 */
export class WeatherInstantChargeAttr extends InstantChargeAttr {
  constructor(weatherTypes: WeatherType[]) {
    super((user, move) => {
      const currentWeather = globalScene.arena.weather;

      if (isNullOrUndefined(currentWeather?.weatherType)) {
        return false;
      } else {
        return !currentWeather?.isEffectSuppressed()
          && weatherTypes.includes(currentWeather?.weatherType);
      }
    });
  }
}

export class OverrideMoveEffectAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return true;
  }
}

/**
 * Attack Move that doesn't hit the turn it is played and doesn't allow for multiple
 * uses on the same target. Examples are Future Sight or Doom Desire.
 * @extends OverrideMoveEffectAttr
 * @param tagType The {@linkcode ArenaTagType} that will be placed on the field when the move is used
 * @param chargeAnim The {@linkcode ChargeAnim | Charging Animation} used for the move
 * @param chargeText The text to display when the move is used
 */
export class DelayedAttackAttr extends OverrideMoveEffectAttr {
  public tagType: ArenaTagType;
  public chargeAnim: ChargeAnim;
  private chargeText: string;

  constructor(tagType: ArenaTagType, chargeAnim: ChargeAnim, chargeText: string) {
    super();

    this.tagType = tagType;
    this.chargeAnim = chargeAnim;
    this.chargeText = chargeText;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // Edge case for the move applied on a pokemon that has fainted
    if (!target) {
      return true;
    }

    const overridden = args[0] as BooleanHolder;
    const virtual = args[1] as boolean;

    if (!virtual) {
      overridden.value = true;
      globalScene.unshiftPhase(new MoveAnimPhase(new MoveChargeAnim(this.chargeAnim, move.id, user)));
      globalScene.queueMessage(this.chargeText.replace("{TARGET}", getPokemonNameWithAffix(target)).replace("{USER}", getPokemonNameWithAffix(user)));
      user.pushMoveHistory({ move: move.id, targets: [ target.getBattlerIndex() ], result: MoveResult.OTHER });
      const side = target.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY;
      globalScene.arena.addTag(this.tagType, 3, move.id, user.id, side, false, target.getBattlerIndex());
    } else {
      globalScene.queueMessage(i18next.t("moveTriggers:tookMoveAttack", { pokemonName: getPokemonNameWithAffix(globalScene.getPokemonById(target.id) ?? undefined), moveName: move.name }));
    }

    return true;
  }
}

/**
 * Attribute that cancels the associated move's effects when set to be combined with the user's ally's
 * subsequent move this turn. Used for Grass Pledge, Water Pledge, and Fire Pledge.
 * @extends OverrideMoveEffectAttr
 */
export class AwaitCombinedPledgeAttr extends OverrideMoveEffectAttr {
  constructor() {
    super(true);
  }
  /**
   * If the user's ally is set to use a different move with this attribute,
   * defer this move's effects for a combined move on the ally's turn.
   * @param user the {@linkcode Pokemon} using this move
   * @param target n/a
   * @param move the {@linkcode Move} being used
   * @param args
   * - [0] a {@linkcode BooleanHolder} indicating whether the move's base
   * effects should be overridden this turn.
   * @returns `true` if base move effects were overridden; `false` otherwise
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.turnData.combiningPledge) {
      // "The two moves have become one!\nIt's a combined move!"
      globalScene.queueMessage(i18next.t("moveTriggers:combiningPledge"));
      return false;
    }

    const overridden = args[0] as BooleanHolder;

    const allyMovePhase = globalScene.findPhase<MovePhase>((phase) => phase instanceof MovePhase && phase.pokemon.isPlayer() === user.isPlayer());
    if (allyMovePhase) {
      const allyMove = allyMovePhase.move.getMove();
      if (allyMove !== move && allyMove.hasAttr(AwaitCombinedPledgeAttr)) {
        [ user, allyMovePhase.pokemon ].forEach((p) => p.turnData.combiningPledge = move.id);

        // "{userPokemonName} is waiting for {allyPokemonName}'s move..."
        globalScene.queueMessage(i18next.t("moveTriggers:awaitingPledge", {
          userPokemonName: getPokemonNameWithAffix(user),
          allyPokemonName: getPokemonNameWithAffix(allyMovePhase.pokemon)
        }));

        // Move the ally's MovePhase (if needed) so that the ally moves next
        const allyMovePhaseIndex = globalScene.phaseQueue.indexOf(allyMovePhase);
        const firstMovePhaseIndex = globalScene.phaseQueue.findIndex((phase) => phase instanceof MovePhase);
        if (allyMovePhaseIndex !== firstMovePhaseIndex) {
          globalScene.prependToPhase(globalScene.phaseQueue.splice(allyMovePhaseIndex, 1)[0], MovePhase);
        }

        overridden.value = true;
        return true;
      }
    }
    return false;
  }
}

/**
 * Set of optional parameters that may be applied to stat stage changing effects
 * @extends MoveEffectAttrOptions
 * @see {@linkcode StatStageChangeAttr}
 */
interface StatStageChangeAttrOptions extends MoveEffectAttrOptions {
  /** If defined, needs to be met in order for the stat change to apply */
  condition?: MoveConditionFunc,
  /** `true` to display a message */
  showMessage?: boolean
}

/**
 * Attribute used for moves that change stat stages
 *
 * @param stats {@linkcode BattleStat} Array of stat(s) to change
 * @param stages How many stages to change the stat(s) by, [-6, 6]
 * @param selfTarget `true` if the move is self-targetting
 * @param options {@linkcode StatStageChangeAttrOptions} Container for any optional parameters for this attribute.
 *
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class StatStageChangeAttr extends MoveEffectAttr {
  public stats: BattleStat[];
  public stages: number;
  /**
   * Container for optional parameters to this attribute.
   * @see {@linkcode StatStageChangeAttrOptions} for available optional params
   */
  protected override options?: StatStageChangeAttrOptions;

  constructor(stats: BattleStat[], stages: number, selfTarget?: boolean, options?: StatStageChangeAttrOptions) {
    super(selfTarget, options);
    this.stats = stats;
    this.stages = stages;
    this.options = options;
  }

  /**
   * The condition required for the stat stage change to apply.
   * Defaults to `null` (i.e. no condition required).
   */
  private get condition () {
    return this.options?.condition ?? null;
  }

  /**
   * `true` to display a message for the stat change.
   * @default true
   */
  private get showMessage () {
    return this.options?.showMessage ?? true;
  }

  /**
   * Attempts to change stats of the user or target (depending on value of selfTarget) if conditions are met
   * @param user {@linkcode Pokemon} the user of the move
   * @param target {@linkcode Pokemon} the target of the move
   * @param move {@linkcode Move} the move
   * @param args unused
   * @returns whether stat stages were changed
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args?: any[]): boolean {
    if (!super.apply(user, target, move, args) || (this.condition && !this.condition(user, target, move))) {
      return false;
    }

    const moveChance = this.getMoveChance(user, target, move, this.selfTarget, true);
    if (moveChance < 0 || moveChance === 100 || user.randSeedInt(100) < moveChance) {
      const stages = this.getLevels(user);
      globalScene.unshiftPhase(new StatStageChangePhase((this.selfTarget ? user : target).getBattlerIndex(), this.selfTarget, this.stats, stages, this.showMessage));
      return true;
    }

    return false;
  }

  getLevels(_user: Pokemon): number {
    return this.stages;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    let ret = 0;
    const moveLevels = this.getLevels(user);
    for (const stat of this.stats) {
      let levels = moveLevels;
      const statStage = target.getStatStage(stat);
      if (levels > 0) {
        levels = Math.min(statStage + levels, 6) - statStage;
      } else {
        levels = Math.max(statStage + levels, -6) - statStage;
      }
      let noEffect = false;
      switch (stat) {
        case Stat.ATK:
          if (this.selfTarget) {
            noEffect = !user.getMoveset().find(m => m instanceof AttackMove && m.category === MoveCategory.PHYSICAL);
          }
          break;
        case Stat.DEF:
          if (!this.selfTarget) {
            noEffect = !user.getMoveset().find(m => m instanceof AttackMove && m.category === MoveCategory.PHYSICAL);
          }
          break;
        case Stat.SPATK:
          if (this.selfTarget) {
            noEffect = !user.getMoveset().find(m => m instanceof AttackMove && m.category === MoveCategory.SPECIAL);
          }
          break;
        case Stat.SPDEF:
          if (!this.selfTarget) {
            noEffect = !user.getMoveset().find(m => m instanceof AttackMove && m.category === MoveCategory.SPECIAL);
          }
          break;
      }
      if (noEffect) {
        continue;
      }
      ret += (levels * 4) + (levels > 0 ? -2 : 2);
    }
    return ret;
  }
}

/**
 * Attribute used to determine the Biome/Terrain-based secondary effect of Secret Power
 */
export class SecretPowerAttr extends MoveEffectAttr {
  constructor() {
    super(false);
  }

  /**
   * Used to apply the secondary effect to the target Pokemon
   * @returns `true` if a secondary effect is successfully applied
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args?: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }
    let secondaryEffect: MoveEffectAttr;
    const terrain = globalScene.arena.getTerrainType();
    if (terrain !== TerrainType.NONE) {
      secondaryEffect = this.determineTerrainEffect(terrain);
    } else {
      const biome = globalScene.arena.biomeType;
      secondaryEffect = this.determineBiomeEffect(biome);
    }
    return secondaryEffect.apply(user, target, move, []);
  }

  /**
   * Determines the secondary effect based on terrain.
   * Takes precedence over biome-based effects.
   * ```
   * Electric Terrain | Paralysis
   * Misty Terrain    | SpAtk -1
   * Grassy Terrain   | Sleep
   * Psychic Terrain  | Speed -1
   * ```
   * @param terrain - {@linkcode TerrainType} The current terrain
   * @returns the chosen secondary effect {@linkcode MoveEffectAttr}
   */
  private determineTerrainEffect(terrain: TerrainType): MoveEffectAttr {
    let secondaryEffect: MoveEffectAttr;
    switch (terrain) {
      case TerrainType.ELECTRIC:
      default:
        secondaryEffect = new StatusEffectAttr(StatusEffect.PARALYSIS, false);
        break;
      case TerrainType.MISTY:
        secondaryEffect = new StatStageChangeAttr([ Stat.SPATK ], -1, false);
        break;
      case TerrainType.GRASSY:
        secondaryEffect = new StatusEffectAttr(StatusEffect.SLEEP, false);
        break;
      case TerrainType.PSYCHIC:
        secondaryEffect = new StatStageChangeAttr([ Stat.SPD ], -1, false);
        break;
    }
    return secondaryEffect;
  }

  /**
   * Determines the secondary effect based on biome
   * ```
   * Town, Metropolis, Slum, Dojo, Laboratory, Power Plant + Default | Paralysis
   * Plains, Grass, Tall Grass, Forest, Jungle, Meadow               | Sleep
   * Swamp, Mountain, Temple, Ruins                                  | Speed -1
   * Ice Cave, Snowy Forest                                          | Freeze
   * Volcano                                                         | Burn
   * Fairy Cave                                                      | SpAtk -1
   * Desert, Construction Site, Beach, Island, Badlands              | Accuracy -1
   * Sea, Lake, Seabed                                               | Atk -1
   * Cave, Wasteland, Graveyard, Abyss, Space                        | Flinch
   * End                                                             | Def -1
   * ```
   * @param biome - The current {@linkcode Biome} the battle is set in
   * @returns the chosen secondary effect {@linkcode MoveEffectAttr}
   */
  private determineBiomeEffect(biome: Biome): MoveEffectAttr {
    let secondaryEffect: MoveEffectAttr;
    switch (biome) {
      case Biome.PLAINS:
      case Biome.GRASS:
      case Biome.TALL_GRASS:
      case Biome.FOREST:
      case Biome.JUNGLE:
      case Biome.MEADOW:
        secondaryEffect = new StatusEffectAttr(StatusEffect.SLEEP, false);
        break;
      case Biome.SWAMP:
      case Biome.MOUNTAIN:
      case Biome.TEMPLE:
      case Biome.RUINS:
        secondaryEffect = new StatStageChangeAttr([ Stat.SPD ], -1, false);
        break;
      case Biome.ICE_CAVE:
      case Biome.SNOWY_FOREST:
        secondaryEffect = new StatusEffectAttr(StatusEffect.FREEZE, false);
        break;
      case Biome.VOLCANO:
        secondaryEffect = new StatusEffectAttr(StatusEffect.BURN, false);
        break;
      case Biome.FAIRY_CAVE:
        secondaryEffect = new StatStageChangeAttr([ Stat.SPATK ], -1, false);
        break;
      case Biome.DESERT:
      case Biome.CONSTRUCTION_SITE:
      case Biome.BEACH:
      case Biome.ISLAND:
      case Biome.BADLANDS:
        secondaryEffect = new StatStageChangeAttr([ Stat.ACC ], -1, false);
        break;
      case Biome.SEA:
      case Biome.LAKE:
      case Biome.SEABED:
        secondaryEffect = new StatStageChangeAttr([ Stat.ATK ], -1, false);
        break;
      case Biome.CAVE:
      case Biome.WASTELAND:
      case Biome.GRAVEYARD:
      case Biome.ABYSS:
      case Biome.SPACE:
        secondaryEffect = new AddBattlerTagAttr(BattlerTagType.FLINCHED, false, true);
        break;
      case Biome.END:
        secondaryEffect = new StatStageChangeAttr([ Stat.DEF ], -1, false);
        break;
      case Biome.TOWN:
      case Biome.METROPOLIS:
      case Biome.SLUM:
      case Biome.DOJO:
      case Biome.FACTORY:
      case Biome.LABORATORY:
      case Biome.POWER_PLANT:
      default:
        secondaryEffect = new StatusEffectAttr(StatusEffect.PARALYSIS, false);
        break;
    }
    return secondaryEffect;
  }
}

export class PostVictoryStatStageChangeAttr extends MoveAttr {
  private stats: BattleStat[];
  private stages: number;
  private condition?: MoveConditionFunc;
  private showMessage: boolean;

  constructor(stats: BattleStat[], stages: number, selfTarget?: boolean, condition?: MoveConditionFunc, showMessage: boolean = true, firstHitOnly: boolean = false) {
    super();
    this.stats = stats;
    this.stages = stages;
    this.condition = condition;
    this.showMessage = showMessage;
  }
  applyPostVictory(user: Pokemon, target: Pokemon, move: Move): void {
    if (this.condition && !this.condition(user, target, move)) {
      return;
    }
    const statChangeAttr = new StatStageChangeAttr(this.stats, this.stages, this.showMessage);
    statChangeAttr.apply(user, target, move);
  }
}

export class AcupressureStatStageChangeAttr extends MoveEffectAttr {
  constructor() {
    super();
  }

  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const randStats = BATTLE_STATS.filter((s) => target.getStatStage(s) < 6);
    if (randStats.length > 0) {
      const boostStat = [ randStats[user.randSeedInt(randStats.length)] ];
      globalScene.unshiftPhase(new StatStageChangePhase(target.getBattlerIndex(), this.selfTarget, boostStat, 2));
      return true;
    }
    return false;
  }
}

export class GrowthStatStageChangeAttr extends StatStageChangeAttr {
  constructor() {
    super([Stat.HP,Stat.ATK, Stat.SPATK], 1, true);
  }

  getLevels(user: Pokemon): number {
    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      const weatherType = globalScene.arena.weather?.weatherType;
      if (weatherType === WeatherType.SUNNY || weatherType === WeatherType.HARSH_SUN) {
        return this.stages + 1;
      }
    }
    return this.stages;
  }
}

export class CutHpStatStageBoostAttr extends StatStageChangeAttr {
  private cutRatio: number;
  private messageCallback: ((user: Pokemon) => void) | undefined;

  constructor(stat: BattleStat[], levels: number, cutRatio: number, messageCallback?: ((user: Pokemon) => void) | undefined) {
    super(stat, levels, true);

    this.cutRatio = cutRatio;
    this.messageCallback = messageCallback;
  }
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    user.damageAndUpdate(toDmgValue(user.getMaxHp() / this.cutRatio), { result: HitResult.INDIRECT });
    user.updateInfo();
    const ret = super.apply(user, target, move, args);
    if (this.messageCallback) {
      this.messageCallback(user);
    }
    return ret;
  }

  getCondition(): MoveConditionFunc {
    return (user, _target, _move) => user.getHpRatio() > 1 / this.cutRatio && this.stats.some(s => user.getStatStage(s) < 6);
  }
}

/**
 * Attribute implementing the stat boosting effect of {@link https://bulbapedia.bulbagarden.net/wiki/Order_Up_(move) | Order Up}.
 * If the user has a Pokemon with {@link https://bulbapedia.bulbagarden.net/wiki/Commander_(Ability) | Commander} in their mouth,
 * one of the user's stats are increased by 1 stage, depending on the "commanding" Pokemon's form. This effect does not respect
 * effect chance, but Order Up itself may be boosted by Sheer Force.
 */
export class OrderUpStatBoostAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  override apply(user: Pokemon, target: Pokemon, move: Move, args?: any[]): boolean {
    const commandedTag = user.getTag(CommandedTag);
    if (!commandedTag) {
      return false;
    }

    let increasedStat: EffectiveStat = Stat.ATK;
    switch (commandedTag.tatsugiriFormKey) {
      case "curly":
        increasedStat = Stat.ATK;
        break;
      case "droopy":
        increasedStat = Stat.DEF;
        break;
      case "stretchy":
        increasedStat = Stat.SPD;
        break;
    }

    globalScene.unshiftPhase(new StatStageChangePhase(user.getBattlerIndex(), this.selfTarget, [ increasedStat ], 1));
    return true;
  }
}

export class CopyStatsAttr extends MoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    // Copy all stat stages
    for (const s of BATTLE_STATS) {
      user.setStatStage(s, target.getStatStage(s));
    }

    if (target.getTag(BattlerTagType.CRIT_BOOST)) {
      user.addTag(BattlerTagType.CRIT_BOOST, 0, move.id);
    } else {
      user.removeTag(BattlerTagType.CRIT_BOOST);
    }
    target.updateInfo();
    user.updateInfo();
    globalScene.queueMessage(i18next.t("moveTriggers:copiedStatChanges", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target) }));

    return true;
  }
}

export class InvertStatsAttr extends MoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    for (const s of BATTLE_STATS) {
      target.setStatStage(s, -target.getStatStage(s));
    }

    target.updateInfo();
    user.updateInfo();

    globalScene.queueMessage(i18next.t("moveTriggers:invertStats", { pokemonName: getPokemonNameWithAffix(target) }));

    return true;
  }
}

export class ResetStatsAttr extends MoveEffectAttr {
  private targetAllPokemon: boolean;
  constructor(targetAllPokemon: boolean) {
    super();
    this.targetAllPokemon = targetAllPokemon;
  }

  override apply(_user: Pokemon, target: Pokemon, _move: Move, _args: any[]): boolean {
    if (this.targetAllPokemon) {
      // Target all pokemon on the field when Freezy Frost or Haze are used
      const activePokemon = globalScene.getField(true);
      activePokemon.forEach((p) => this.resetStats(p));
      globalScene.queueMessage(i18next.t("moveTriggers:statEliminated"));
    } else { // Affects only the single target when Clear Smog is used
      this.resetStats(target);
      globalScene.queueMessage(i18next.t("moveTriggers:resetStats", { pokemonName: getPokemonNameWithAffix(target) }));
    }
    return true;
  }

  private resetStats(pokemon: Pokemon): void {
    for (const s of BATTLE_STATS) {
      pokemon.setStatStage(s, 0);
    }
    pokemon.updateInfo();
  }
}

/**
 * Attribute used for status moves, specifically Heart, Guard, and Power Swap,
 * that swaps the user's and target's corresponding stat stages.
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class SwapStatStagesAttr extends MoveEffectAttr {
  /** The stat stages to be swapped between the user and the target */
  private stats: readonly BattleStat[];

  constructor(stats: readonly BattleStat[]) {
    super();

    this.stats = stats;
  }

  /**
   * For all {@linkcode stats}, swaps the user's and target's corresponding stat
   * stage.
   * @param user the {@linkcode Pokemon} that used the move
   * @param target the {@linkcode Pokemon} that the move was used on
   * @param move N/A
   * @param args N/A
   * @returns true if attribute application succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any []): boolean {
    if (super.apply(user, target, move, args)) {
      for (const s of this.stats) {
        const temp = user.getStatStage(s);
        user.setStatStage(s, target.getStatStage(s));
        target.setStatStage(s, temp);
      }

      target.updateInfo();
      user.updateInfo();

      if (this.stats.length === 7) {
        globalScene.queueMessage(i18next.t("moveTriggers:switchedStatChanges", { pokemonName: getPokemonNameWithAffix(user) }));
      } else if (this.stats.length === 2) {
        globalScene.queueMessage(i18next.t("moveTriggers:switchedTwoStatChanges", {
          pokemonName: getPokemonNameWithAffix(user),
          firstStat: i18next.t(getStatKey(this.stats[0])),
          secondStat: i18next.t(getStatKey(this.stats[1]))
        }));
      }
      return true;
    }
    return false;
  }
}

export class HpSplitAttr extends MoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const hpValue = Math.floor((target.hp + user.hp) / 2);
    [ user, target ].forEach((p) => {
      if (p.hp < hpValue) {
        const healing = p.heal(hpValue - p.hp);
        if (healing) {
          globalScene.damageNumberHandler.add(p, healing, HitResult.HEAL);
        }
      } else if (p.hp > hpValue) {
        const damage = p.damage(p.hp - hpValue, true);
        if (damage) {
          globalScene.damageNumberHandler.add(p, damage);
        }
      }
      p.updateInfo();
    });

    return true;
  }
}

export class VariablePowerAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    //const power = args[0] as Utils.NumberHolder;
    return false;
  }
}

export class LessPPMorePowerAttr extends VariablePowerAttr {
  /**
   * Power up moves when less PP user has
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @param args [0] {@linkcode NumberHolder} of power
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const ppMax = move.pp;
    const ppUsed = user.moveset.find((m) => m.moveId === move.id)?.ppUsed ?? 0;

    let ppRemains = ppMax - ppUsed;
    /** Reduce to 0 to avoid negative numbers if user has 1PP before attack and target has Ability.PRESSURE */
    if (ppRemains < 0) {
      ppRemains = 0;
    }

    const power = args[0] as NumberHolder;

    switch (ppRemains) {
      case 0:
        power.value = 200;
        break;
      case 1:
        power.value = 80;
        break;
      case 2:
        power.value = 60;
        break;
      case 3:
        power.value = 50;
        break;
      default:
        power.value = 40;
        break;
    }
    return true;
  }
}

export class MovePowerMultiplierAttr extends VariablePowerAttr {
  private powerMultiplierFunc: (user: Pokemon, target: Pokemon, move: Move) => number;

  constructor(powerMultiplier: (user: Pokemon, target: Pokemon, move: Move) => number) {
    super();

    this.powerMultiplierFunc = powerMultiplier;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;
    power.value *= this.powerMultiplierFunc(user, target, move);

    return true;
  }
}

/**
 * Helper function to calculate the the base power of an ally's hit when using Beat Up.
 * @param user The Pokemon that used Beat Up.
 * @param allyIndex The party position of the ally contributing to Beat Up.
 * @returns The base power of the Beat Up hit.
 */
const beatUpFunc = (user: Pokemon, allyIndex: number): number => {
  const party = user.isPlayer() ? globalScene.getPlayerParty() : globalScene.getEnemyParty();

  for (let i = allyIndex; i < party.length; i++) {
    const pokemon = party[i];

    // The user contributes to Beat Up regardless of status condition.
    // Allies can contribute only if they do not have a non-volatile status condition.
    if (pokemon.id !== user.id && pokemon?.status && pokemon.status.effect !== StatusEffect.NONE) {
      continue;
    }
    return (pokemon.species.getBaseStat(Stat.ATK) / 10) + 5;
  }
  return 0;
};

export class BeatUpAttr extends VariablePowerAttr {

  /**
   * Gets the next party member to contribute to a Beat Up hit, and calculates the base power for it.
   * @param user Pokemon that used the move
   * @param _target N/A
   * @param _move Move with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;

    const party = user.isPlayer() ? globalScene.getPlayerParty() : globalScene.getEnemyParty();
    const allyCount = party.filter(pokemon => {
      return pokemon.id === user.id || !pokemon.status?.effect;
    }).length;
    const allyIndex = (user.turnData.hitCount - user.turnData.hitsLeft) % allyCount;
    power.value = beatUpFunc(user, allyIndex);
    return true;
  }
}

const doublePowerChanceMessageFunc = (user: Pokemon, target: Pokemon, move: Move) => {
  let message: string = "";
  globalScene.executeWithSeedOffset(() => {
    const rand = randSeedInt(100);
    if (rand < move.chance) {
      message = i18next.t("moveTriggers:goingAllOutForAttack", { pokemonName: getPokemonNameWithAffix(user) });
    }
  }, globalScene.currentBattle.turn << 6, globalScene.waveSeed);
  return message;
};

export class DoublePowerChanceAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    let rand: number;
    globalScene.executeWithSeedOffset(() => rand = randSeedInt(100), globalScene.currentBattle.turn << 6, globalScene.waveSeed);
    if (rand! < move.chance) {
      const power = args[0] as NumberHolder;
      power.value *= 2;
      return true;
    }

    return false;
  }
}

export abstract class ConsecutiveUsePowerMultiplierAttr extends MovePowerMultiplierAttr {
  constructor(limit: number, resetOnFail: boolean, resetOnLimit?: boolean, ...comboMoves: Moves[]) {
    super((user: Pokemon, target: Pokemon, move: Move): number => {
      const moveHistory = user.getLastXMoves(limit + 1).slice(1);

      let count = 0;
      let turnMove: TurnMove | undefined;

      while (
        (
          (turnMove = moveHistory.shift())?.move === move.id
          || (comboMoves.length && comboMoves.includes(turnMove?.move ?? Moves.NONE))
        )
        && (!resetOnFail || turnMove?.result === MoveResult.SUCCESS)
      ) {
        if (count < (limit - 1)) {
          count++;
        } else if (resetOnLimit) {
          count = 0;
        } else {
          break;
        }
      }

      return this.getMultiplier(count);
    });
  }

  abstract getMultiplier(count: number): number;
}

export class ConsecutiveUseDoublePowerAttr extends ConsecutiveUsePowerMultiplierAttr {
  getMultiplier(count: number): number {
    return Math.pow(2, count);
  }
}

export class ConsecutiveUseMultiBasePowerAttr extends ConsecutiveUsePowerMultiplierAttr {
  getMultiplier(count: number): number {
    return (count + 1);
  }
}

export class WeightPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;

    const targetWeight = target.getWeight();
    const weightThresholds = [ 10, 25, 50, 100, 200 ];

    let w = 0;
    while (targetWeight >= weightThresholds[w]) {
      if (++w === weightThresholds.length) {
        break;
      }
    }

    power.value = (w + 1) * 20;

    return true;
  }
}

/**
 * Attribute used for Electro Ball move.
 * @extends VariablePowerAttr
 * @see {@linkcode apply}
 **/
export class ElectroBallPowerAttr extends VariablePowerAttr {
  /**
   * Move that deals more damage the faster {@linkcode Stat.SPD}
   * the user is compared to the target.
   * @param user Pokemon that used the move
   * @param target The target of the move
   * @param move Move with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;

    const statRatio = target.getEffectiveStat(Stat.SPD) / user.getEffectiveStat(Stat.SPD);
    const statThresholds = [ 0.25, 1 / 3, 0.5, 1, -1 ];
    const statThresholdPowers = [ 150, 120, 80, 60, 40 ];

    let w = 0;
    while (w < statThresholds.length - 1 && statRatio > statThresholds[w]) {
      if (++w === statThresholds.length) {
        break;
      }
    }

    power.value = statThresholdPowers[w];
    return true;
  }
}


/**
 * Attribute used for Gyro Ball move.
 * @extends VariablePowerAttr
 * @see {@linkcode apply}
 **/
export class GyroBallPowerAttr extends VariablePowerAttr {
  /**
   * Move that deals more damage the slower {@linkcode Stat.SPD}
   * the user is compared to the target.
   * @param user Pokemon that used the move
   * @param target The target of the move
   * @param move Move with this attribute
   * @param args N/A
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;
    const userSpeed = user.getEffectiveStat(Stat.SPD);
    if (userSpeed < 1) {
      // Gen 6+ always have 1 base power
      power.value = 1;
      return true;
    }

    power.value = Math.floor(Math.min(150, 25 * target.getEffectiveStat(Stat.SPD) / userSpeed + 1));
    return true;
  }
}

export class LowHpPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;
    const hpRatio = user.getHpRatio();

    switch (true) {
      case (hpRatio < 0.0417):
        power.value = 200;
        break;
      case (hpRatio < 0.1042):
        power.value = 150;
        break;
      case (hpRatio < 0.2083):
        power.value = 100;
        break;
      case (hpRatio < 0.3542):
        power.value = 80;
        break;
      case (hpRatio < 0.6875):
        power.value = 40;
        break;
      default:
        power.value = 20;
        break;
    }

    return true;
  }
}

export class CompareWeightPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;
    const userWeight = user.getWeight();
    const targetWeight = target.getWeight();

    if (!userWeight || userWeight === 0) {
      return false;
    }

    const relativeWeight = (targetWeight / userWeight) * 100;

    switch (true) {
      case (relativeWeight < 20.01):
        power.value = 120;
        break;
      case (relativeWeight < 25.01):
        power.value = 100;
        break;
      case (relativeWeight < 33.35):
        power.value = 80;
        break;
      case (relativeWeight < 50.01):
        power.value = 60;
        break;
      default:
        power.value = 40;
        break;
    }

    return true;
  }
}

export class HpPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = toDmgValue(150 * user.getHpRatio());

    return true;
  }
}

/**
 * Attribute used for moves whose base power scales with the opponent's HP
 * Used for Crush Grip, Wring Out, and Hard Press
 * maxBasePower 100 for Hard Press, 120 for others
 */
export class OpponentHighHpPowerAttr extends VariablePowerAttr {
  maxBasePower: number;

  constructor(maxBasePower: number) {
    super();
    this.maxBasePower = maxBasePower;
  }

  /**
   * Changes the base power of the move to be the target's HP ratio times the maxBasePower with a min value of 1
   * @param user n/a
   * @param target the Pokemon being attacked
   * @param move n/a
   * @param args holds the base power of the move at args[0]
   * @returns true
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = toDmgValue(this.maxBasePower * target.getHpRatio());

    return true;
  }
}

export class FirstAttackDoublePowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    console.log(target.getLastXMoves(1), globalScene.currentBattle.turn);
    if (!target.getLastXMoves(1).find(m => m.turn === globalScene.currentBattle.turn)) {
      (args[0] as NumberHolder).value *= 2;
      return true;
    }

    return false;
  }
}


export class TurnDamagedDoublePowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.turnData.attacksReceived.find(r => r.damage && r.sourceId === target.id)) {
      (args[0] as NumberHolder).value *= 2;
      return true;
    }

    return false;
  }
}

const magnitudeMessageFunc = (user: Pokemon, target: Pokemon, move: Move) => {
  let message: string;
  globalScene.executeWithSeedOffset(() => {
    const magnitudeThresholds = [ 5, 15, 35, 65, 75, 95 ];

    const rand = randSeedInt(100);

    let m = 0;
    for (; m < magnitudeThresholds.length; m++) {
      if (rand < magnitudeThresholds[m]) {
        break;
      }
    }

    message = i18next.t("moveTriggers:magnitudeMessage", { magnitude: m + 4 });
  }, globalScene.currentBattle.turn << 6, globalScene.waveSeed);
  return message!;
};

export class MagnitudePowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;

    const magnitudeThresholds = [ 5, 15, 35, 65, 75, 95 ];
    const magnitudePowers = [ 10, 30, 50, 70, 90, 100, 110, 150 ];

    let rand: number;

    globalScene.executeWithSeedOffset(() => rand = randSeedInt(100), globalScene.currentBattle.turn << 6, globalScene.waveSeed);

    let m = 0;
    for (; m < magnitudeThresholds.length; m++) {
      if (rand! < magnitudeThresholds[m]) {
        break;
      }
    }

    power.value = magnitudePowers[m];

    return true;
  }
}

export class AntiSunlightPowerDecreaseAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      const power = args[0] as NumberHolder;
      const weatherType = globalScene.arena.weather?.weatherType || WeatherType.NONE;
      switch (weatherType) {
        case WeatherType.RAIN:
        case WeatherType.SANDSTORM:
        case WeatherType.HAIL:
        case WeatherType.SNOW:
        case WeatherType.HEAVY_RAIN:
          power.value *= 0.5;
          return true;
      }
    }

    return false;
  }
}

export class FriendshipPowerAttr extends VariablePowerAttr {
  private invert: boolean;

  constructor(invert?: boolean) {
    super();

    this.invert = !!invert;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;

    const friendshipPower = Math.floor(Math.min(user instanceof PlayerPokemon ? user.friendship : user.species.baseFriendship, 255) / 2.5);
    power.value = Math.max(!this.invert ? friendshipPower : 102 - friendshipPower, 1);

    return true;
  }
}

/**
 * This Attribute calculates the current power of {@linkcode Moves.RAGE_FIST}.
 * The counter for power calculation does not reset on every wave but on every new arena encounter.
 * Self-inflicted confusion damage and hits taken by a Subsitute are ignored.
 */
export class RageFistPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    /* Reasons this works correctly:
     * Confusion calls user.damageAndUpdate() directly (no counter increment),
     * Substitute hits call user.damageAndUpdate() with a damage value of 0, also causing
      no counter increment
    */
    const hitCount = user.battleData.hitCount;
    const basePower: NumberHolder = args[0];

    basePower.value = 50 * (1 + Math.min(hitCount, 6));
    return true;
  }

}

/**
 * Tallies the number of positive stages for a given {@linkcode Pokemon}.
 * @param pokemon The {@linkcode Pokemon} that is being used to calculate the count of positive stats
 * @returns the amount of positive stats
 */
const countPositiveStatStages = (pokemon: Pokemon): number => {
  return pokemon.getStatStages().reduce((total, stat) => (stat && stat > 0) ? total + stat : total, 0);
};

/**
 * Attribute that increases power based on the amount of positive stat stage increases.
 */
export class PositiveStatStagePowerAttr extends VariablePowerAttr {

  /**
   * @param {Pokemon} user The pokemon that is being used to calculate the amount of positive stats
   * @param {Pokemon} target N/A
   * @param {Move} move N/A
   * @param {any[]} args The argument for VariablePowerAttr, accumulates and sets the amount of power multiplied by stats
   * @returns {boolean} Returns true if attribute is applied
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const positiveStatStages: number = countPositiveStatStages(user);

    (args[0] as NumberHolder).value += positiveStatStages * 20;
    return true;
  }
}

/**
 * Punishment normally has a base power of 60,
 * but gains 20 power for every increased stat stage the target has,
 * up to a maximum of 200 base power in total.
 */
export class PunishmentPowerAttr extends VariablePowerAttr {
  private PUNISHMENT_MIN_BASE_POWER = 60;
  private PUNISHMENT_MAX_BASE_POWER = 200;

  /**
     * @param {Pokemon} user N/A
     * @param {Pokemon} target The pokemon that the move is being used against, as well as calculating the stats for the min/max base power
     * @param {Move} move N/A
     * @param {any[]} args The value that is being changed due to VariablePowerAttr
     * @returns Returns true if attribute is applied
     */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const positiveStatStages: number = countPositiveStatStages(target);
    (args[0] as NumberHolder).value = Math.min(
      this.PUNISHMENT_MAX_BASE_POWER,
      this.PUNISHMENT_MIN_BASE_POWER + positiveStatStages * 20
    );
    return true;
  }
}

export class PresentPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    /**
     * If this move is multi-hit, and this attribute is applied to any hit
     * other than the first, this move cannot result in a heal.
     */
    const firstHit = (user.turnData.hitCount === user.turnData.hitsLeft);

    const powerSeed = randSeedInt(firstHit ? 100 : 80);
    if (powerSeed <= 40) {
      (args[0] as NumberHolder).value = 40;
    } else if (40 < powerSeed && powerSeed <= 70) {
      (args[0] as NumberHolder).value = 80;
    } else if (70 < powerSeed && powerSeed <= 80) {
      (args[0] as NumberHolder).value = 120;
    } else if (80 < powerSeed && powerSeed <= 100) {
      // If this move is multi-hit, disable all other hits
      user.turnData.hitCount = 1;
      user.turnData.hitsLeft = 1;
      globalScene.unshiftPhase(new PokemonHealPhase(target.getBattlerIndex(),
        toDmgValue(target.getMaxHp() / 4), i18next.t("moveTriggers:regainedHealth", { pokemonName: getPokemonNameWithAffix(target) }), true));
    }

    return true;
  }
}

export class WaterShurikenPowerAttr extends VariablePowerAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.species.speciesId === Species.GRENINJA && user.hasAbility(Abilities.BATTLE_BOND) && user.formIndex === 2) {
      (args[0] as NumberHolder).value = 20;
      return true;
    }
    return false;
  }
}

/**
 * Attribute used to calculate the power of attacks that scale with Stockpile stacks (i.e. Spit Up).
 */
export class SpitUpPowerAttr extends VariablePowerAttr {
  private multiplier: number = 0;

  constructor(multiplier: number) {
    super();
    this.multiplier = multiplier;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const stockpilingTag = user.getTag(StockpilingTag);

    if (stockpilingTag && stockpilingTag.stockpiledCount > 0) {
      const power = args[0] as NumberHolder;
      power.value = this.multiplier * stockpilingTag.stockpiledCount;
      return true;
    }

    return false;
  }
}

/**
 * Attribute used to apply Swallow's healing, which scales with Stockpile stacks.
 * Does NOT remove stockpiled stacks.
 */
export class SwallowHealAttr extends HealAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const stockpilingTag = user.getTag(StockpilingTag);

    if (stockpilingTag && stockpilingTag.stockpiledCount > 0) {
      const stockpiled = stockpilingTag.stockpiledCount;
      let healRatio: number;

      if (stockpiled === 1) {
        healRatio = 0.25;
      } else if (stockpiled === 2) {
        healRatio = 0.50;
      } else { // stockpiled >= 3
        healRatio = 1.00;
      }

      if (healRatio) {
        this.addHealPhase(user, healRatio);
        return true;
      }
    }

    return false;
  }
}

const hasStockpileStacksCondition: MoveConditionFunc = (user) => {
  const hasStockpilingTag = user.getTag(StockpilingTag);
  return !!hasStockpilingTag && hasStockpilingTag.stockpiledCount > 0;
};

/**
 * Attribute used for multi-hit moves that increase power in increments of the
 * move's base power for each hit, namely Triple Kick and Triple Axel.
 * @extends VariablePowerAttr
 * @see {@linkcode apply}
 */
export class MultiHitPowerIncrementAttr extends VariablePowerAttr {
  /** The max number of base power increments allowed for this move */
  private maxHits: number;

  constructor(maxHits: number) {
    super();

    this.maxHits = maxHits;
  }

  /**
   * Increases power of move in increments of the base power for the amount of times
   * the move hit. In the case that the move is extended, it will circle back to the
   * original base power of the move after incrementing past the maximum amount of
   * hits.
   * @param user {@linkcode Pokemon} that used the move
   * @param target {@linkcode Pokemon} that the move was used on
   * @param move {@linkcode Move} with this attribute
   * @param args [0] {@linkcode NumberHolder} for final calculated power of move
   * @returns true if attribute application succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const hitsTotal = user.turnData.hitCount - Math.max(user.turnData.hitsLeft, 0);
    const power = args[0] as NumberHolder;

    power.value = move.power * (1 + hitsTotal % this.maxHits);

    return true;
  }
}

/**
 * Attribute used for moves that double in power if the given move immediately
 * preceded the move applying the attribute, namely Fusion Flare and
 * Fusion Bolt.
 * @extends VariablePowerAttr
 * @see {@linkcode apply}
 */
export class LastMoveDoublePowerAttr extends VariablePowerAttr {
  /** The move that must precede the current move */
  private move: Moves;

  constructor(move: Moves) {
    super();

    this.move = move;
  }

  /**
   * Doubles power of move if the given move is found to precede the current
   * move with no other moves being executed in between, only ignoring failed
   * moves if any.
   * @param user {@linkcode Pokemon} that used the move
   * @param target N/A
   * @param move N/A
   * @param args [0] {@linkcode NumberHolder} that holds the resulting power of the move
   * @returns true if attribute application succeeds, false otherwise
   */
  apply(user: Pokemon, _target: Pokemon, _move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;
    const enemy = user.getOpponent(0);
    const pokemonActed: Pokemon[] = [];

    if (enemy?.turnData.acted) {
      pokemonActed.push(enemy);
    }

    if (globalScene.currentBattle.double) {
      const userAlly = user.getAlly();
      const enemyAlly = enemy?.getAlly();

      if (userAlly?.turnData.acted) {
        pokemonActed.push(userAlly);
      }
      if (enemyAlly?.turnData.acted) {
        pokemonActed.push(enemyAlly);
      }
    }

    pokemonActed.sort((a, b) => b.turnData.order - a.turnData.order);

    for (const p of pokemonActed) {
      const [ lastMove ] = p.getLastXMoves(1);
      if (lastMove.result !== MoveResult.FAIL) {
        if ((lastMove.result === MoveResult.SUCCESS) && (lastMove.move === this.move)) {
          power.value *= 2;
          return true;
        } else {
          break;
        }
      }
    }

    return false;
  }
}

/**
 * Changes a Pledge move's power to 150 when combined with another unique Pledge
 * move from an ally.
 */
export class CombinedPledgePowerAttr extends VariablePowerAttr {
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0];
    if (!(power instanceof NumberHolder)) {
      return false;
    }
    const combinedPledgeMove = user.turnData.combiningPledge;

    if (combinedPledgeMove && combinedPledgeMove !== move.id) {
      power.value *= 150 / 80;
      return true;
    }
    return false;
  }
}

/**
 * Applies STAB to the given Pledge move if the move is part of a combined attack.
 */
export class CombinedPledgeStabBoostAttr extends MoveAttr {
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const stabMultiplier = args[0];
    if (!(stabMultiplier instanceof NumberHolder)) {
      return false;
    }
    const combinedPledgeMove = user.turnData.combiningPledge;

    if (combinedPledgeMove && combinedPledgeMove !== move.id) {
      stabMultiplier.value = 1.5;
      return true;
    }
    return false;
  }
}

/**
 * Variable Power attribute for {@link https://bulbapedia.bulbagarden.net/wiki/Round_(move) | Round}.
 * Doubles power if another Pokemon has previously selected Round this turn.
 * @extends VariablePowerAttr
 */
export class RoundPowerAttr extends VariablePowerAttr {
  override apply(user: Pokemon, target: Pokemon, move: Move, args: [NumberHolder]): boolean {
    const power = args[0];

    if (user.turnData.joinedRound) {
      power.value *= 2;
      return true;
    }
    return false;
  }
}

/**
 * Attribute for the "combo" effect of {@link https://bulbapedia.bulbagarden.net/wiki/Round_(move) | Round}.
 * Preempts the next move in the turn order with the first instance of any Pokemon
 * using Round. Also marks the Pokemon using the cued Round to double the move's power.
 * @extends MoveEffectAttr
 * @see {@linkcode RoundPowerAttr}
 */
export class CueNextRoundAttr extends MoveEffectAttr {
  constructor() {
    super(true, { lastHitOnly: true });
  }

  override apply(user: Pokemon, target: Pokemon, move: Move, args?: any[]): boolean {
    const nextRoundPhase = globalScene.findPhase<MovePhase>(phase =>
      phase instanceof MovePhase && phase.move.moveId === Moves.ROUND
    );

    if (!nextRoundPhase) {
      return false;
    }

    // Update the phase queue so that the next Pokemon using Round moves next
    const nextRoundIndex = globalScene.phaseQueue.indexOf(nextRoundPhase);
    const nextMoveIndex = globalScene.phaseQueue.findIndex(phase => phase instanceof MovePhase);
    if (nextRoundIndex !== nextMoveIndex) {
      globalScene.prependToPhase(globalScene.phaseQueue.splice(nextRoundIndex, 1)[0], MovePhase);
    }

    // Mark the corresponding Pokemon as having "joined the Round" (for doubling power later)
    nextRoundPhase.pokemon.turnData.joinedRound = true;
    return true;
  }
}

/**
 * Attribute that changes stat stages before the damage is calculated
 */
export class StatChangeBeforeDmgCalcAttr extends MoveAttr {
  /**
   * Applies Stat Changes before damage is calculated
   *
   * @param user {@linkcode Pokemon} that called {@linkcode move}
   * @param target {@linkcode Pokemon} that is the target of {@linkcode move}
   * @param move {@linkcode Move} called by {@linkcode user}
   * @param args N/A
   *
   * @returns true if stat stages where correctly applied
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return false;
  }
}

/**
 * Steals the postitive Stat stages of the target before damage calculation so stat changes
 * apply to damage calculation (e.g. {@linkcode Moves.SPECTRAL_THIEF})
 * {@link https://bulbapedia.bulbagarden.net/wiki/Spectral_Thief_(move) | Spectral Thief}
 */
export class SpectralThiefAttr extends StatChangeBeforeDmgCalcAttr {
  /**
   * steals max amount of positive stats of the target while not exceeding the limit of max 6 stat stages
   *
   * @param user {@linkcode Pokemon} that called {@linkcode move}
   * @param target {@linkcode Pokemon} that is the target of {@linkcode move}
   * @param move {@linkcode Move} called by {@linkcode user}
   * @param args N/A
   *
   * @returns true if stat stages where correctly stolen
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    /**
     * Copy all positive stat stages to user and reduce copied stat stages on target.
     */
    for (const s of BATTLE_STATS) {
      const statStageValueTarget = target.getStatStage(s);
      const statStageValueUser = user.getStatStage(s);

      if (statStageValueTarget > 0) {
        /**
         * Only value of up to 6 can be stolen (stat stages don't exceed 6)
         */
        const availableToSteal = Math.min(statStageValueTarget, 6 - statStageValueUser);

        globalScene.unshiftPhase(new StatStageChangePhase(user.getBattlerIndex(), this.selfTarget, [ s ], availableToSteal));
        target.setStatStage(s, statStageValueTarget - availableToSteal);
      }
    }

    target.updateInfo();
    user.updateInfo();
    globalScene.queueMessage(i18next.t("moveTriggers:stealPositiveStats", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target) }));

    return true;
  }

}

export class VariableAtkAttr extends MoveAttr {
  constructor() {
    super();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    //const atk = args[0] as Utils.NumberHolder;
    return false;
  }
}

export class TargetAtkUserAtkAttr extends VariableAtkAttr {
  constructor() {
    super();
  }
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = target.getEffectiveStat(Stat.ATK, target);
    return true;
  }
}

export class DefAtkAttr extends VariableAtkAttr {
  constructor() {
    super();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = user.getEffectiveStat(Stat.DEF, target);
    return true;
  }
}

export class VariableDefAttr extends MoveAttr {
  constructor() {
    super();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    //const def = args[0] as Utils.NumberHolder;
    return false;
  }
}

export class DefDefAttr extends VariableDefAttr {
  constructor() {
    super();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    (args[0] as NumberHolder).value = target.getEffectiveStat(Stat.DEF, user);
    return true;
  }
}

export class VariableAccuracyAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    //const accuracy = args[0] as Utils.NumberHolder;
    return false;
  }
}

/**
 * Attribute used for Thunder and Hurricane that sets accuracy to 50 in sun and never miss in rain
 */
export class ThunderAccuracyAttr extends VariableAccuracyAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      const accuracy = args[0] as NumberHolder;
      const weatherType = globalScene.arena.weather?.weatherType || WeatherType.NONE;
      switch (weatherType) {
        case WeatherType.SUNNY:
        case WeatherType.HARSH_SUN:
          accuracy.value = 50;
          return true;
        case WeatherType.RAIN:
        case WeatherType.HEAVY_RAIN:
          accuracy.value = -1;
          return true;
      }
    }

    return false;
  }
}

/**
 * Attribute used for Bleakwind Storm, Wildbolt Storm, and Sandsear Storm that sets accuracy to never
 * miss in rain
 * Springtide Storm does NOT have this property
 */
export class StormAccuracyAttr extends VariableAccuracyAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      const accuracy = args[0] as NumberHolder;
      const weatherType = globalScene.arena.weather?.weatherType || WeatherType.NONE;
      switch (weatherType) {
        case WeatherType.RAIN:
        case WeatherType.HEAVY_RAIN:
          accuracy.value = -1;
          return true;
      }
    }

    return false;
  }
}

/**
 * Attribute used for moves which never miss
 * against Pokemon with the {@linkcode BattlerTagType.MINIMIZED}
 * @extends VariableAccuracyAttr
 * @see {@linkcode apply}
 */
export class AlwaysHitMinimizeAttr extends VariableAccuracyAttr {
  /**
   * @see {@linkcode apply}
   * @param user N/A
   * @param target {@linkcode Pokemon} target of the move
   * @param move N/A
   * @param args [0] Accuracy of the move to be modified
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (target.getTag(BattlerTagType.MINIMIZED)) {
      const accuracy = args[0] as NumberHolder;
      accuracy.value = -1;

      return true;
    }

    return false;
  }
}

export class ToxicAccuracyAttr extends VariableAccuracyAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.isOfType(PokemonType.POISON)) {
      const accuracy = args[0] as NumberHolder;
      accuracy.value = -1;
      return true;
    }

    return false;
  }
}

export class BlizzardAccuracyAttr extends VariableAccuracyAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      const accuracy = args[0] as NumberHolder;
      const weatherType = globalScene.arena.weather?.weatherType || WeatherType.NONE;
      if (weatherType === WeatherType.HAIL || weatherType === WeatherType.SNOW) {
        accuracy.value = -1;
        return true;
      }
    }

    return false;
  }
}

export class VariableMoveCategoryAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return false;
  }
}

export class PhotonGeyserCategoryAttr extends VariableMoveCategoryAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const category = (args[0] as NumberHolder);

    if (user.getEffectiveStat(Stat.ATK, target, move) > user.getEffectiveStat(Stat.SPATK, target, move)) {
      category.value = MoveCategory.PHYSICAL;
      return true;
    }

    return false;
  }
}

/**
 * Attribute used for tera moves that change category based on the user's Atk and SpAtk stats
 * Note: Currently, `getEffectiveStat` does not ignore all abilities that affect stats except those
 * with the attribute of `StatMultiplierAbAttr`
 * TODO: Remove the `.partial()` tag from Tera Blast and Tera Starstorm when the above issue is resolved
 * @extends VariableMoveCategoryAttr
 */
export class TeraMoveCategoryAttr extends VariableMoveCategoryAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const category = (args[0] as NumberHolder);

    if (user.isTerastallized && user.getEffectiveStat(Stat.ATK, target, move, true, true, false, false, true) >
    user.getEffectiveStat(Stat.SPATK, target, move, true, true, false, false, true)) {
      category.value = MoveCategory.PHYSICAL;
      return true;
    }

    return false;
  }
}

/**
 * Increases the power of Tera Blast if the user is Terastallized into Stellar type
 * @extends VariablePowerAttr
 */
export class TeraBlastPowerAttr extends VariablePowerAttr {
  /**
   * Sets Tera Blast's power to 100 if the user is terastallized with
   * the Stellar tera type.
   * @param user {@linkcode Pokemon} the Pokemon using this move
   * @param target n/a
   * @param move {@linkcode Move} the Move with this attribute (i.e. Tera Blast)
   * @param args
   *   - [0] {@linkcode NumberHolder} the applied move's power, factoring in
   *       previously applied power modifiers.
   * @returns
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const power = args[0] as NumberHolder;
    if (user.isTerastallized && user.getTeraType() === PokemonType.STELLAR) {
      power.value = 100;
      return true;
    }

    return false;
  }
}

/**
 * Change the move category to status when used on the ally
 * @extends VariableMoveCategoryAttr
 * @see {@linkcode apply}
 */
export class StatusCategoryOnAllyAttr extends VariableMoveCategoryAttr {
  /**
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args [0] {@linkcode NumberHolder} The category of the move
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const category = (args[0] as NumberHolder);

    if (user.getAlly() === target) {
      category.value = MoveCategory.STATUS;
      return true;
    }

    return false;
  }
}

export class ShellSideArmCategoryAttr extends VariableMoveCategoryAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const category = (args[0] as NumberHolder);

    const predictedPhysDmg = target.getBaseDamage({source: user, move, moveCategory: MoveCategory.PHYSICAL, ignoreAbility: true, ignoreSourceAbility: true, ignoreAllyAbility: true, ignoreSourceAllyAbility: true, simulated: true});
    const predictedSpecDmg = target.getBaseDamage({source: user, move, moveCategory: MoveCategory.SPECIAL, ignoreAbility: true, ignoreSourceAbility: true, ignoreAllyAbility: true, ignoreSourceAllyAbility: true, simulated: true});

    if (predictedPhysDmg > predictedSpecDmg) {
      category.value = MoveCategory.PHYSICAL;
      return true;
    } else if (predictedPhysDmg === predictedSpecDmg && user.randSeedInt(2) === 0) {
      category.value = MoveCategory.PHYSICAL;
      return true;
    }
    return false;
  }
}

export class VariableMoveTypeAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return false;
  }
}

export class FormChangeItemTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if ([ user.species.speciesId, user.fusionSpecies?.speciesId ].includes(Species.ARCEUS) || [ user.species.speciesId, user.fusionSpecies?.speciesId ].includes(Species.SILVALLY)) {
      const form = user.species.speciesId === Species.ARCEUS || user.species.speciesId === Species.SILVALLY ? user.formIndex : user.fusionSpecies?.formIndex!;

      moveType.value = PokemonType[PokemonType[form]];
      return true;
    }

    // Force move to have its original typing if it changed
    if (moveType.value === move.type) {
      return false;
    }
    moveType.value = move.type
    return true;
  }
}

export class TechnoBlastTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if ([ user.species.speciesId, user.fusionSpecies?.speciesId ].includes(Species.GENESECT)) {
      const form = user.species.speciesId === Species.GENESECT ? user.formIndex : user.fusionSpecies?.formIndex;

      switch (form) {
        case 1: // Shock Drive
          moveType.value = PokemonType.ELECTRIC;
          break;
        case 2: // Burn Drive
          moveType.value = PokemonType.FIRE;
          break;
        case 3: // Chill Drive
          moveType.value = PokemonType.ICE;
          break;
        case 4: // Douse Drive
          moveType.value = PokemonType.WATER;
          break;
        default:
          moveType.value = PokemonType.NORMAL;
          break;
      }
      return true;
    }

    return false;
  }
}

export class AuraWheelTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if ([ user.species.speciesId, user.fusionSpecies?.speciesId ].includes(Species.MORPEKO)) {
      const form = user.species.speciesId === Species.MORPEKO ? user.formIndex : user.fusionSpecies?.formIndex;

      switch (form) {
        case 1: // Hangry Mode
          moveType.value = PokemonType.DARK;
          break;
        default: // Full Belly Mode
          moveType.value = PokemonType.ELECTRIC;
          break;
      }
      return true;
    }

    return false;
  }
}

export class RagingBullTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if ([ user.species.speciesId, user.fusionSpecies?.speciesId ].includes(Species.PALDEA_TAUROS)) {
      const form = user.species.speciesId === Species.PALDEA_TAUROS ? user.formIndex : user.fusionSpecies?.formIndex;

      switch (form) {
        case 1: // Blaze breed
          moveType.value = PokemonType.FIRE;
          break;
        case 2: // Aqua breed
          moveType.value = PokemonType.WATER;
          break;
        default:
          moveType.value = PokemonType.FIGHTING;
          break;
      }
      return true;
    }

    return false;
  }
}

export class IvyCudgelTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if ([ user.species.speciesId, user.fusionSpecies?.speciesId ].includes(Species.OGERPON)) {
      const form = user.species.speciesId === Species.OGERPON ? user.formIndex : user.fusionSpecies?.formIndex;

      switch (form) {
        case 1: // Wellspring Mask
        case 5: // Wellspring Mask Tera
          moveType.value = PokemonType.WATER;
          break;
        case 2: // Hearthflame Mask
        case 6: // Hearthflame Mask Tera
          moveType.value = PokemonType.FIRE;
          break;
        case 3: // Cornerstone Mask
        case 7: // Cornerstone Mask Tera
          moveType.value = PokemonType.ROCK;
          break;
        case 4: // Teal Mask Tera
        default:
          moveType.value = PokemonType.GRASS;
          break;
      }
      return true;
    }

    return false;
  }
}

export class WeatherBallTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if (!globalScene.arena.weather?.isEffectSuppressed()) {
      switch (globalScene.arena.weather?.weatherType) {
        case WeatherType.SUNNY:
        case WeatherType.HARSH_SUN:
          moveType.value = PokemonType.FIRE;
          break;
        case WeatherType.RAIN:
        case WeatherType.HEAVY_RAIN:
          moveType.value = PokemonType.WATER;
          break;
        case WeatherType.SANDSTORM:
          moveType.value = PokemonType.ROCK;
          break;
        case WeatherType.HAIL:
        case WeatherType.SNOW:
          moveType.value = PokemonType.ICE;
          break;
        default:
          if (moveType.value === move.type) {
            return false;
          }
          moveType.value = move.type;
          break;
      }
      return true;
    }

    return false;
  }
}

/**
 * Changes the move's type to match the current terrain.
 * Has no effect if the user is not grounded.
 * @extends VariableMoveTypeAttr
 * @see {@linkcode apply}
 */
export class TerrainPulseTypeAttr extends VariableMoveTypeAttr {
  /**
   * @param user {@linkcode Pokemon} using this move
   * @param target N/A
   * @param move N/A
   * @param args [0] {@linkcode NumberHolder} The move's type to be modified
   * @returns true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if (!user.isGrounded()) {
      return false;
    }

    const currentTerrain = globalScene.arena.getTerrainType();
    switch (currentTerrain) {
      case TerrainType.MISTY:
        moveType.value = PokemonType.FAIRY;
        break;
      case TerrainType.ELECTRIC:
        moveType.value = PokemonType.ELECTRIC;
        break;
      case TerrainType.GRASSY:
        moveType.value = PokemonType.GRASS;
        break;
      case TerrainType.PSYCHIC:
        moveType.value = PokemonType.PSYCHIC;
        break;
      default:
        if (moveType.value === move.type) {
          return false;
        }
        // force move to have its original typing if it was changed
        moveType.value = move.type;
        break;
    }
    return true;
  }
}

/**
 * Changes type based on the user's IVs
 * @extends VariableMoveTypeAttr
 */
export class HiddenPowerTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    const iv_val = Math.floor(((user.ivs[Stat.HP] & 1)
      + (user.ivs[Stat.ATK] & 1) * 2
      + (user.ivs[Stat.DEF] & 1) * 4
      + (user.ivs[Stat.SPD] & 1) * 8
      + (user.ivs[Stat.SPATK] & 1) * 16
      + (user.ivs[Stat.SPDEF] & 1) * 32) * 15 / 63);

    moveType.value = [
      PokemonType.FIGHTING, PokemonType.FLYING, PokemonType.POISON, PokemonType.GROUND,
      PokemonType.ROCK, PokemonType.BUG, PokemonType.GHOST, PokemonType.STEEL,
      PokemonType.FIRE, PokemonType.WATER, PokemonType.GRASS, PokemonType.ELECTRIC,
      PokemonType.PSYCHIC, PokemonType.ICE, PokemonType.DRAGON, PokemonType.DARK ][iv_val];

    return true;
  }
}

/**
 * Changes the type of Tera Blast to match the user's tera type
 * @extends VariableMoveTypeAttr
 */
export class TeraBlastTypeAttr extends VariableMoveTypeAttr {
  /**
   * @param user {@linkcode Pokemon} the user of the move
   * @param target {@linkcode Pokemon} N/A
   * @param move {@linkcode Move} the move with this attribute
   * @param args `[0]` the move's type to be modified
   * @returns `true` if the move's type was modified; `false` otherwise
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    if (user.isTerastallized) {
      moveType.value = user.getTeraType(); // changes move type to tera type
      return true;
    }

    return false;
  }
}

/**
 * Attribute used for Tera Starstorm that changes the move type to Stellar
 * @extends VariableMoveTypeAttr
 */
export class TeraStarstormTypeAttr extends VariableMoveTypeAttr {
  /**
   *
   * @param user the {@linkcode Pokemon} using the move
   * @param target n/a
   * @param move n/a
   * @param args[0] {@linkcode NumberHolder} the move type
   * @returns `true` if the move type is changed to {@linkcode PokemonType.STELLAR}, `false` otherwise
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (user.isTerastallized && user.hasSpecies(Species.TERAPAGOS)) {
      const moveType = args[0] as NumberHolder;

      moveType.value = PokemonType.STELLAR;
      return true;
    }
    return false;
  }
}

export class MatchUserTypeAttr extends VariableMoveTypeAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }
    const userTypes = user.getTypes(true);

    if (userTypes.includes(PokemonType.STELLAR)) { // will not change to stellar type
      const nonTeraTypes = user.getTypes();
      moveType.value = nonTeraTypes[0];
      return true;
    } else if (userTypes.length > 0) {
      moveType.value = userTypes[0];
      return true;
    } else {
      return false;
    }

  }
}

/**
 * Changes the type of a Pledge move based on the Pledge move combined with it.
 * @extends VariableMoveTypeAttr
 */
export class CombinedPledgeTypeAttr extends VariableMoveTypeAttr {
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveType = args[0];
    if (!(moveType instanceof NumberHolder)) {
      return false;
    }

    const combinedPledgeMove = user?.turnData?.combiningPledge;
    if (!combinedPledgeMove) {
      return false;
    }

    switch (move.id) {
      case Moves.FIRE_PLEDGE:
        if (combinedPledgeMove === Moves.WATER_PLEDGE) {
          moveType.value = PokemonType.WATER;
          return true;
        }
        return false;
      case Moves.WATER_PLEDGE:
        if (combinedPledgeMove === Moves.GRASS_PLEDGE) {
          moveType.value = PokemonType.GRASS;
          return true;
        }
        return false;
      case Moves.GRASS_PLEDGE:
        if (combinedPledgeMove === Moves.FIRE_PLEDGE) {
          moveType.value = PokemonType.FIRE;
          return true;
        }
        return false;
      default:
        return false;
    }
  }
}

export class VariableMoveTypeMultiplierAttr extends MoveAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return false;
  }
}

export class NeutralDamageAgainstFlyingTypeMultiplierAttr extends VariableMoveTypeMultiplierAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!target.getTag(BattlerTagType.IGNORE_FLYING)) {
      const multiplier = args[0] as NumberHolder;
      //When a flying type is hit, the first hit is always 1x multiplier.
      if (target.isOfType(PokemonType.FLYING)) {
        multiplier.value = 1;
      }
      return true;
    }

    return false;
  }
}

export class IceNoEffectTypeAttr extends VariableMoveTypeMultiplierAttr {
  /**
   * Checks to see if the Target is Ice-Type or not. If so, the move will have no effect.
   * @param user n/a
   * @param target The {@linkcode Pokemon} targeted by the move
   * @param move n/a
   * @param args `[0]` a {@linkcode NumberHolder | NumberHolder} containing a type effectiveness multiplier
   * @returns `true` if this Ice-type immunity applies; `false` otherwise
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const multiplier = args[0] as NumberHolder;
    if (target.isOfType(PokemonType.ICE)) {
      multiplier.value = 0;
      return true;
    }
    return false;
  }
}

export class FlyingTypeMultiplierAttr extends VariableMoveTypeMultiplierAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const multiplier = args[0] as NumberHolder;
    multiplier.value *= target.getAttackTypeEffectiveness(PokemonType.FLYING, user);
    return true;
  }
}

/**
 * Attribute for moves which have a custom type chart interaction.
 */
export class VariableMoveTypeChartAttr extends MoveAttr {
  /**
   * @param user {@linkcode Pokemon} using the move
   * @param target {@linkcode Pokemon} target of the move
   * @param move {@linkcode Move} with this attribute
   * @param args [0] {@linkcode NumberHolder} holding the type effectiveness
   * @param args [1] A single defensive type of the target
   *
   * @returns true if application of the attribute succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return false;
  }
}

/**
 * This class forces Freeze-Dry to be super effective against Water Type.
 */
export class FreezeDryAttr extends VariableMoveTypeChartAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const multiplier = args[0] as NumberHolder;
    const defType = args[1] as PokemonType;

    if (defType === PokemonType.WATER) {
      multiplier.value = 2;
      return true;
    } else {
      return false;
    }
  }
}

export class OneHitKOAccuracyAttr extends VariableAccuracyAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const accuracy = args[0] as NumberHolder;
    if (user.level < target.level) {
      accuracy.value = 0;
    } else {
      accuracy.value = Math.min(Math.max(30 + 100 * (1 - target.level / user.level), 0), 100);
    }
    return true;
  }
}

export class SheerColdAccuracyAttr extends OneHitKOAccuracyAttr {
  /**
   * Changes the normal One Hit KO Accuracy Attr to implement the Gen VII changes,
   * where if the user is Ice-Type, it has more accuracy.
   * @param {Pokemon} user Pokemon that is using the move; checks the Pokemon's level.
   * @param {Pokemon} target Pokemon that is receiving the move; checks the Pokemon's level.
   * @param {Move} move N/A
   * @param {any[]} args Uses the accuracy argument, allowing to change it from either 0 if it doesn't pass
   * the first if/else, or 30/20 depending on the type of the user Pokemon.
   * @returns Returns true if move is successful, false if misses.
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const accuracy = args[0] as NumberHolder;
    if (user.level < target.level) {
      accuracy.value = 0;
    } else {
      const baseAccuracy = user.isOfType(PokemonType.ICE) ? 30 : 20;
      accuracy.value = Math.min(Math.max(baseAccuracy + 100 * (1 - target.level / user.level), 0), 100);
    }
    return true;
  }
}

export class MissEffectAttr extends MoveAttr {
  private missEffectFunc: UserMoveConditionFunc;

  constructor(missEffectFunc: UserMoveConditionFunc) {
    super();

    this.missEffectFunc = missEffectFunc;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    this.missEffectFunc(user, move);
    return true;
  }
}

export class NoEffectAttr extends MoveAttr {
  private noEffectFunc: UserMoveConditionFunc;

  constructor(noEffectFunc: UserMoveConditionFunc) {
    super();

    this.noEffectFunc = noEffectFunc;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    this.noEffectFunc(user, move);
    return true;
  }
}

const crashDamageFunc = (user: Pokemon, move: Move) => {
  const cancelled = new BooleanHolder(false);
  applyAbAttrs(BlockNonDirectDamageAbAttr, user, cancelled);
  if (cancelled.value) {
    return false;
  }

  user.damageAndUpdate(toDmgValue(user.getMaxHp() / 2), { result: HitResult.INDIRECT });
  globalScene.queueMessage(i18next.t("moveTriggers:keptGoingAndCrashed", { pokemonName: getPokemonNameWithAffix(user) }));
  user.turnData.damageTaken += toDmgValue(user.getMaxHp() / 2);

  return true;
};

export class TypelessAttr extends MoveAttr { }
/**
* Attribute used for moves which ignore redirection effects, and always target their original target, i.e. Snipe Shot
* Bypasses Storm Drain, Follow Me, Ally Switch, and the like.
*/
export class BypassRedirectAttr extends MoveAttr {
  /** `true` if this move only bypasses redirection from Abilities */
  public readonly abilitiesOnly: boolean;

  constructor(abilitiesOnly: boolean = false) {
    super();
    this.abilitiesOnly = abilitiesOnly;
  }
}

export class FrenzyAttr extends MoveEffectAttr {
  constructor() {
    super(true, { lastHitOnly: true });
  }

  canApply(user: Pokemon, target: Pokemon, move: Move, args: any[]) {
    return !(this.selfTarget ? user : target).isFainted();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    if (!user.getTag(BattlerTagType.FRENZY) && !user.getMoveQueue().length) {
      const turnCount = user.randSeedIntRange(1, 2);
      new Array(turnCount).fill(null).map(() => user.getMoveQueue().push({ move: move.id, targets: [ target.getBattlerIndex() ], ignorePP: true }));
      user.addTag(BattlerTagType.FRENZY, turnCount, move.id, user.id);
    } else {
      applyMoveAttrs(AddBattlerTagAttr, user, target, move, args);
      user.lapseTag(BattlerTagType.FRENZY); // if FRENZY is already in effect (moveQueue.length > 0), lapse the tag
    }

    return true;
  }
}


export class EmberAttr extends MoveEffectAttr {
  constructor() {
    super(true, { lastHitOnly: true });
  }

  canApply(user: Pokemon, target: Pokemon, move: Move, args: any[]) {
    return !(this.selfTarget ? user : target).isFainted();
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    // 如果没有 Frenzy 标签并且没有技能排队
    if (!user.getTag(BattlerTagType.FRENZY) && !user.getMoveQueue().length) {
      const turnCount = user.randSeedIntRange(1, 2);
      // 使用户在接下来的回合中继续使用此技能
      new Array(turnCount).fill(null).map(() => user.getMoveQueue().push({ move: move.id, targets: [ target.getBattlerIndex() ], ignorePP: true }));
      // 添加 Frenzy 标签，表示狂暴状态
      user.addTag(BattlerTagType.FRENZY, turnCount, move.id, user.id);
    } else {
      // 如果已经处于 Frenzy 状态，执行常规效果并清除标签
      applyMoveAttrs(AddBattlerTagAttr, user, target, move, args);
      user.lapseTag(BattlerTagType.FRENZY); // 清除 Frenzy 标签
    }

    return true;
  }

  // 标签到期时触发死亡
  onTagExpire(user: Pokemon): void {
    // 如果用户未死亡，强制让用户死亡
    if (!user.isFainted()) {
      user.faint();
      globalScene.queueMessage(
        i18next.t("moveTriggers:faintByFrenzy", {
          pokemonName: getPokemonNameWithAffix(user)
        })
      );
    }
  }
}

export const frenzyMissFunc: UserMoveConditionFunc = (user: Pokemon, move: Move) => {
  while (user.getMoveQueue().length && user.getMoveQueue()[0].move === move.id) {
    user.getMoveQueue().shift();
  }
  user.removeTag(BattlerTagType.FRENZY); // FRENZY tag should be disrupted on miss/no effect

  return true;
};

/**
 * Attribute that grants {@link https://bulbapedia.bulbagarden.net/wiki/Semi-invulnerable_turn | semi-invulnerability} to the user during
 * the associated move's charging phase. Should only be used for {@linkcode ChargingMove | ChargingMoves} as a `chargeAttr`.
 * @extends MoveEffectAttr
 */
export class SemiInvulnerableAttr extends MoveEffectAttr {
  /** The type of {@linkcode SemiInvulnerableTag} to grant to the user */
  public tagType: BattlerTagType;

  constructor(tagType: BattlerTagType) {
    super(true);
    this.tagType = tagType;
  }

  /**
   * Grants a {@linkcode SemiInvulnerableTag} to the associated move's user.
   * @param user the {@linkcode Pokemon} using the move
   * @param target n/a
   * @param move the {@linkcode Move} being used
   * @param args n/a
   * @returns `true` if semi-invulnerability was successfully granted; `false` otherwise.
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args?: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    return user.addTag(this.tagType, 1, move.id, user.id);
  }
}

export class AddBattlerTagAttr extends MoveEffectAttr {
  public tagType: BattlerTagType;
  public turnCountMin: number;
  public turnCountMax: number;
  protected cancelOnFail: boolean;
  private failOnOverlap: boolean;

  constructor(tagType: BattlerTagType, selfTarget: boolean = false, failOnOverlap: boolean = false, turnCountMin: number = 0, turnCountMax?: number, lastHitOnly: boolean = false) {
    super(selfTarget, { lastHitOnly: lastHitOnly });

    this.tagType = tagType;
    this.turnCountMin = turnCountMin;
    this.turnCountMax = turnCountMax !== undefined ? turnCountMax : turnCountMin;
    this.failOnOverlap = !!failOnOverlap;
  }

  canApply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.canApply(user, target, move, args)) {
      return false;
    }
    return true;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const moveChance = this.getMoveChance(user, target, move, this.selfTarget, true);
    if (moveChance < 0 || moveChance === 100 || user.randSeedInt(100) < moveChance) {
      return (this.selfTarget ? user : target).addTag(this.tagType,  user.randSeedIntRange(this.turnCountMin, this.turnCountMax), move.id, user.id);
    }

    return false;
  }

  getCondition(): MoveConditionFunc | null {
    return this.failOnOverlap
      ? (user, target, move) => !(this.selfTarget ? user : target).getTag(this.tagType)
      : null;
  }

  getTagTargetBenefitScore(): number {
    switch (this.tagType) {
      case BattlerTagType.RECHARGING:
      case BattlerTagType.PERISH_SONG:
        return -16;
      case BattlerTagType.FLINCHED:
      case BattlerTagType.CONFUSED:
      case BattlerTagType.INFATUATED:
      case BattlerTagType.NIGHTMARE:
      case BattlerTagType.DROWSY:
      case BattlerTagType.DISABLED:
      case BattlerTagType.HEAL_BLOCK:
      case BattlerTagType.RECEIVE_DOUBLE_DAMAGE:
        return -5;
      case BattlerTagType.SEEDED:
      case BattlerTagType.SALT_CURED:
      case BattlerTagType.CURSED:
      case BattlerTagType.FRENZY:
      case BattlerTagType.TRAPPED:
      case BattlerTagType.BIND:
      case BattlerTagType.WRAP:
      case BattlerTagType.FIRE_SPIN:
      case BattlerTagType.WHIRLPOOL:
      case BattlerTagType.CLAMP:
      case BattlerTagType.SAND_TOMB:
      case BattlerTagType.MAGMA_STORM:
      case BattlerTagType.SNAP_TRAP:
      case BattlerTagType.THUNDER_CAGE:
      case BattlerTagType.INFESTATION:
        return -3;
      case BattlerTagType.ENCORE:
        return -2;
      case BattlerTagType.MINIMIZED:
      case BattlerTagType.ALWAYS_GET_HIT:
        return 0;
      case BattlerTagType.INGRAIN:
      case BattlerTagType.IGNORE_ACCURACY:
      case BattlerTagType.AQUA_RING:
      case BattlerTagType.MAGIC_COAT:
        return 3;
      case BattlerTagType.PROTECTED:
      case BattlerTagType.FLYING:
      case BattlerTagType.CRIT_BOOST:
      case BattlerTagType.ALWAYS_CRIT:
        return 5;
      default:
        console.warn(`BattlerTag ${BattlerTagType[this.tagType]} is missing a score!`);
        return 0;
    }
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    let moveChance = this.getMoveChance(user, target, move, this.selfTarget, false);
    if (moveChance < 0) {
      moveChance = 100;
    }
    return Math.floor(this.getTagTargetBenefitScore() * (moveChance / 100));
  }
}

/**
 * Adds a {@link https://bulbapedia.bulbagarden.net/wiki/Seeding | Seeding} effect to the target
 * as seen with Leech Seed and Sappy Seed.
 * @extends AddBattlerTagAttr
 */
export class LeechSeedAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.SEEDED);
  }
}

/**
 * Adds the appropriate battler tag for Smack Down and Thousand arrows
 * @extends AddBattlerTagAttr
 */
export class FallDownAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.IGNORE_FLYING, false, false, 1, 1, true);
  }

  /**
   * Adds Grounded Tag to the target and checks if fallDown message should be displayed
   * @param user the {@linkcode Pokemon} using the move
   * @param target the {@linkcode Pokemon} targeted by the move
   * @param move the {@linkcode Move} invoking this effect
   * @param args n/a
   * @returns `true` if the effect successfully applies; `false` otherwise
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!target.isGrounded()) {
      globalScene.queueMessage(i18next.t("moveTriggers:fallDown", { targetPokemonName: getPokemonNameWithAffix(target) }));
    }
    return super.apply(user, target, move, args);
  }
}

/**
 * Adds the appropriate battler tag for Gulp Missile when Surf or Dive is used.
 * @extends MoveEffectAttr
 */
export class GulpMissileTagAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  /**
   * Adds BattlerTagType from GulpMissileTag based on the Pokemon's HP ratio.
   * @param user The Pokemon using the move.
   * @param _target N/A
   * @param move The move being used.
   * @param _args N/A
   * @returns Whether the BattlerTag is applied.
   */
  apply(user: Pokemon, _target: Pokemon, move: Move, _args: any[]): boolean {
    if (!super.apply(user, _target, move, _args)) {
      return false;
    }

    if (user.hasAbility(Abilities.GULP_MISSILE) && user.species.speciesId === Species.CRAMORANT) {
      if (user.getHpRatio() >= .5) {
        user.addTag(BattlerTagType.GULP_MISSILE_ARROKUDA, 0, move.id);
      } else {
        user.addTag(BattlerTagType.GULP_MISSILE_PIKACHU, 0, move.id);
      }
      return true;
    }

    return false;
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const isCramorant = user.hasAbility(Abilities.GULP_MISSILE) && user.species.speciesId === Species.CRAMORANT;
    return isCramorant && !user.getTag(GulpMissileTag) ? 10 : 0;
  }
}

/**
 * Attribute to implement Jaw Lock's linked trapping effect between the user and target
 * @extends AddBattlerTagAttr
 */
export class JawLockAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.TRAPPED);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.canApply(user, target, move, args)) {
      return false;
    }

    // If either the user or the target already has the tag, do not apply
    if (user.getTag(TrappedTag) || target.getTag(TrappedTag)) {
      return false;
    }

    const moveChance = this.getMoveChance(user, target, move, this.selfTarget);
    if (moveChance < 0 || moveChance === 100 || user.randSeedInt(100) < moveChance) {
      /**
       * Add the tag to both the user and the target.
       * The target's tag source is considered to be the user and vice versa
       */
      return target.addTag(BattlerTagType.TRAPPED, 1, move.id, user.id)
          && user.addTag(BattlerTagType.TRAPPED, 1, move.id, target.id);
    }

    return false;
  }
}

export class CurseAttr extends MoveEffectAttr {

  apply(user: Pokemon, target: Pokemon, move:Move, args: any[]): boolean {
    if (user.getTypes(true).includes(PokemonType.GHOST)) {
      if (target.getTag(BattlerTagType.CURSED)) {
        globalScene.queueMessage(i18next.t("battle:attackFailed"));
        return false;
      }
      const curseRecoilDamage = Math.max(1, Math.floor(user.getMaxHp() / 2));
      user.damageAndUpdate(curseRecoilDamage, { result: HitResult.INDIRECT, ignoreSegments: true });
      globalScene.queueMessage(
        i18next.t("battlerTags:cursedOnAdd", {
          pokemonNameWithAffix: getPokemonNameWithAffix(user),
          pokemonName: getPokemonNameWithAffix(target)
        })
      );

      target.addTag(BattlerTagType.CURSED, 0, move.id, user.id);
      return true;
    } else {
      globalScene.unshiftPhase(new StatStageChangePhase(user.getBattlerIndex(), true, [ Stat.ATK, Stat.DEF ], 1));
      globalScene.unshiftPhase(new StatStageChangePhase(user.getBattlerIndex(), true, [ Stat.SPD ], -1));
      return true;
    }
  }
}

export class LapseBattlerTagAttr extends MoveEffectAttr {
  public tagTypes: BattlerTagType[];

  constructor(tagTypes: BattlerTagType[], selfTarget: boolean = false) {
    super(selfTarget);

    this.tagTypes = tagTypes;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    for (const tagType of this.tagTypes) {
      (this.selfTarget ? user : target).lapseTag(tagType);
    }

    return true;
  }
}

export class RemoveBattlerTagAttr extends MoveEffectAttr {
  public tagTypes: BattlerTagType[];

  constructor(tagTypes: BattlerTagType[], selfTarget: boolean = false) {
    super(selfTarget);

    this.tagTypes = tagTypes;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    for (const tagType of this.tagTypes) {
      (this.selfTarget ? user : target).removeTag(tagType);
    }

    return true;
  }
}

export class FlinchAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.FLINCHED, false);
  }
}

export class ConfuseAttr extends AddBattlerTagAttr {
  constructor(selfTarget?: boolean) {
    super(BattlerTagType.CONFUSED, selfTarget, false, 2, 5);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!this.selfTarget && target.isSafeguarded(user)) {
      if (move.category === MoveCategory.STATUS) {
        globalScene.queueMessage(i18next.t("moveTriggers:safeguard", { targetName: getPokemonNameWithAffix(target) }));
      }
      return false;
    }

    return super.apply(user, target, move, args);
  }
}

export class RechargeAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.RECHARGING, true, false, 1, 1, true);
  }
}

export class TrapAttr extends AddBattlerTagAttr {
  constructor(tagType: BattlerTagType) {
    super(tagType, false, false, 4, 5);
  }
}

export class ProtectAttr extends AddBattlerTagAttr {
  constructor(tagType: BattlerTagType = BattlerTagType.PROTECTED) {
    super(tagType, true);
  }

  getCondition(): MoveConditionFunc {
    return ((user, target, move): boolean => {
      let timesUsed = 0;
      const moveHistory = user.getLastXMoves();
      let turnMove: TurnMove | undefined;

      while (moveHistory.length) {
        turnMove = moveHistory.shift();
        if (!allMoves[turnMove?.move ?? Moves.NONE].hasAttr(ProtectAttr) || turnMove?.result !== MoveResult.SUCCESS) {
          break;
        }
        timesUsed++;
      }
      if (timesUsed) {
        return !user.randSeedInt(Math.pow(3, timesUsed));
      }
      return true;
    });
  }
}

export class IgnoreAccuracyAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.IGNORE_ACCURACY, true, false, 2);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:tookAimAtTarget", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target) }));

    return true;
  }
}

export class FaintCountdownAttr extends AddBattlerTagAttr {
  constructor() {
    super(BattlerTagType.PERISH_SONG, false, true, 4);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:faintCountdown", { pokemonName: getPokemonNameWithAffix(target), turnCount: this.turnCountMin - 1 }));

    return true;
  }
}

/**
 * Attribute to remove all Substitutes from the field.
 * @extends MoveEffectAttr
 * @see {@link https://bulbapedia.bulbagarden.net/wiki/Tidy_Up_(move) | Tidy Up}
 * @see {@linkcode SubstituteTag}
 */
export class RemoveAllSubstitutesAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  /**
   * Remove's the Substitute Doll effect from all active Pokemon on the field
   * @param user {@linkcode Pokemon} the Pokemon using this move
   * @param target n/a
   * @param move {@linkcode Move} the move applying this effect
   * @param args n/a
   * @returns `true` if the effect successfully applies
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.getField(true).forEach(pokemon =>
      pokemon.findAndRemoveTags(tag => tag.tagType === BattlerTagType.SUBSTITUTE));
    return true;
  }
}

/**
 * Attribute used when a move can deal damage to {@linkcode BattlerTagType}
 * Moves that always hit but do not deal double damage: Thunder, Fissure, Sky Uppercut,
 * Smack Down, Hurricane, Thousand Arrows
 * @extends MoveAttr
*/
export class HitsTagAttr extends MoveAttr {
  /** The {@linkcode BattlerTagType} this move hits */
  public tagType: BattlerTagType;
  /** Should this move deal double damage against {@linkcode HitsTagAttr.tagType}? */
  public doubleDamage: boolean;

  constructor(tagType: BattlerTagType, doubleDamage: boolean = false) {
    super();

    this.tagType = tagType;
    this.doubleDamage = !!doubleDamage;
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return target.getTag(this.tagType) ? this.doubleDamage ? 10 : 5 : 0;
  }
}

/**
 * Used for moves that will always hit for a given tag but also doubles damage.
 * Moves include: Gust, Stomp, Body Slam, Surf, Earthquake, Magnitude, Twister,
 * Whirlpool, Dragon Rush, Heat Crash, Steam Roller, Flying Press
 */
export class HitsTagForDoubleDamageAttr extends HitsTagAttr {
  constructor(tagType: BattlerTagType) {
    super(tagType, true);
  }
}

export class AddArenaTagAttr extends MoveEffectAttr {
  public tagType: ArenaTagType;
  public turnCount: number;
  private failOnOverlap: boolean;
  public selfSideTarget: boolean;

  constructor(tagType: ArenaTagType, turnCount?: number | null, failOnOverlap: boolean = false, selfSideTarget: boolean = false) {
    super(true);

    this.tagType = tagType;
    this.turnCount = turnCount!; // TODO: is the bang correct?
    this.failOnOverlap = failOnOverlap;
    this.selfSideTarget = selfSideTarget;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    if ((move.chance < 0 || move.chance === 100 || user.randSeedInt(100) < move.chance) && user.getLastXMoves(1)[0]?.result === MoveResult.SUCCESS) {
      const side = ((this.selfSideTarget ? user : target).isPlayer() !== (move.hasAttr(AddArenaTrapTagAttr) && target === user)) ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY;
      globalScene.arena.addTag(this.tagType, this.turnCount, move.id, user.id, side);
      return true;
    }

    return false;
  }

  getCondition(): MoveConditionFunc | null {
    return this.failOnOverlap
      ? (user, target, move) => !globalScene.arena.getTagOnSide(this.tagType, target.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY)
      : null;
  }
}

/**
 * Generic class for removing arena tags
 * @param tagTypes: The types of tags that can be removed
 * @param selfSideTarget: Is the user removing tags from its own side?
 */
export class RemoveArenaTagsAttr extends MoveEffectAttr {
  public tagTypes: ArenaTagType[];
  public selfSideTarget: boolean;

  constructor(tagTypes: ArenaTagType[], selfSideTarget: boolean) {
    super(true);

    this.tagTypes = tagTypes;
    this.selfSideTarget = selfSideTarget;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const side = (this.selfSideTarget ? user : target).isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY;

    for (const tagType of this.tagTypes) {
      globalScene.arena.removeTagOnSide(tagType, side);
    }

    return true;
  }
}

export class AddArenaTrapTagAttr extends AddArenaTagAttr {
  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const side = (this.selfSideTarget !== user.isPlayer()) ? ArenaTagSide.ENEMY : ArenaTagSide.PLAYER;
      const tag = globalScene.arena.getTagOnSide(this.tagType, side) as ArenaTrapTag;
      if (!tag) {
        return true;
      }
      return tag.layers < tag.maxLayers;
    };
  }
}

/**
 * Attribute used for Stone Axe and Ceaseless Edge.
 * Applies the given ArenaTrapTag when move is used.
 * @extends AddArenaTagAttr
 * @see {@linkcode apply}
 */
export class AddArenaTrapTagHitAttr extends AddArenaTagAttr {
  /**
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveChance = this.getMoveChance(user, target, move, this.selfTarget, true);
    const side = (this.selfSideTarget ? user : target).isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY;
    const tag = globalScene.arena.getTagOnSide(this.tagType, side) as ArenaTrapTag;
    if ((moveChance < 0 || moveChance === 100 || user.randSeedInt(100) < moveChance) && user.getLastXMoves(1)[0]?.result === MoveResult.SUCCESS) {
      globalScene.arena.addTag(this.tagType, 0, move.id, user.id, side);
      if (!tag) {
        return true;
      }
      return tag.layers < tag.maxLayers;
    }
    return false;
  }
}

export class RemoveArenaTrapAttr extends MoveEffectAttr {

  private targetBothSides: boolean;

  constructor(targetBothSides: boolean = false) {
    super(true, { trigger: MoveEffectTrigger.PRE_APPLY });
    this.targetBothSides = targetBothSides;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {

    if (!super.apply(user, target, move, args)) {
      return false;
    }

    if (this.targetBothSides) {
      globalScene.arena.removeTagOnSide(ArenaTagType.SPIKES, ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.TOXIC_SPIKES, ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.STEALTH_ROCK, ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.STICKY_WEB, ArenaTagSide.PLAYER);

      globalScene.arena.removeTagOnSide(ArenaTagType.SPIKES, ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.TOXIC_SPIKES, ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.STEALTH_ROCK, ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.STICKY_WEB, ArenaTagSide.ENEMY);
    } else {
      globalScene.arena.removeTagOnSide(ArenaTagType.SPIKES, target.isPlayer() ? ArenaTagSide.ENEMY : ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.TOXIC_SPIKES, target.isPlayer() ? ArenaTagSide.ENEMY : ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.STEALTH_ROCK, target.isPlayer() ? ArenaTagSide.ENEMY : ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.STICKY_WEB, target.isPlayer() ? ArenaTagSide.ENEMY : ArenaTagSide.PLAYER);
    }

    return true;
  }
}

export class RemoveScreensAttr extends MoveEffectAttr {

  private targetBothSides: boolean;

  constructor(targetBothSides: boolean = false) {
    super(true, { trigger: MoveEffectTrigger.PRE_APPLY });
    this.targetBothSides = targetBothSides;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {

    if (!super.apply(user, target, move, args)) {
      return false;
    }

    if (this.targetBothSides) {
      globalScene.arena.removeTagOnSide(ArenaTagType.REFLECT, ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.LIGHT_SCREEN, ArenaTagSide.PLAYER);
      globalScene.arena.removeTagOnSide(ArenaTagType.AURORA_VEIL, ArenaTagSide.PLAYER);

      globalScene.arena.removeTagOnSide(ArenaTagType.REFLECT, ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.LIGHT_SCREEN, ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.AURORA_VEIL, ArenaTagSide.ENEMY);
    } else {
      globalScene.arena.removeTagOnSide(ArenaTagType.REFLECT, target.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.LIGHT_SCREEN, target.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY);
      globalScene.arena.removeTagOnSide(ArenaTagType.AURORA_VEIL, target.isPlayer() ? ArenaTagSide.PLAYER : ArenaTagSide.ENEMY);
    }

    return true;

  }
}

/*Swaps arena effects between the player and enemy side
  * @extends MoveEffectAttr
  * @see {@linkcode apply}
*/
export class SwapArenaTagsAttr extends MoveEffectAttr {
  public SwapTags: ArenaTagType[];


  constructor(SwapTags: ArenaTagType[]) {
    super(true);
    this.SwapTags = SwapTags;
  }

  apply(user:Pokemon, target:Pokemon, move:Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const tagPlayerTemp = globalScene.arena.findTagsOnSide((t => this.SwapTags.includes(t.tagType)), ArenaTagSide.PLAYER);
    const tagEnemyTemp = globalScene.arena.findTagsOnSide((t => this.SwapTags.includes(t.tagType)), ArenaTagSide.ENEMY);


    if (tagPlayerTemp) {
      for (const swapTagsType of tagPlayerTemp) {
        globalScene.arena.removeTagOnSide(swapTagsType.tagType, ArenaTagSide.PLAYER, true);
        globalScene.arena.addTag(swapTagsType.tagType, swapTagsType.turnCount, swapTagsType.sourceMove, swapTagsType.sourceId!, ArenaTagSide.ENEMY, true); // TODO: is the bang correct?
      }
    }
    if (tagEnemyTemp) {
      for (const swapTagsType of tagEnemyTemp) {
        globalScene.arena.removeTagOnSide(swapTagsType.tagType, ArenaTagSide.ENEMY, true);
        globalScene.arena.addTag(swapTagsType.tagType, swapTagsType.turnCount, swapTagsType.sourceMove, swapTagsType.sourceId!, ArenaTagSide.PLAYER, true); // TODO: is the bang correct?
      }
    }


    globalScene.queueMessage(i18next.t("moveTriggers:swapArenaTags", { pokemonName: getPokemonNameWithAffix(user) }));
    return true;
  }
}

/**
 * Attribute that adds a secondary effect to the field when two unique Pledge moves
 * are combined. The effect added varies based on the two Pledge moves combined.
 */
export class AddPledgeEffectAttr extends AddArenaTagAttr {
  private readonly requiredPledge: Moves;

  constructor(tagType: ArenaTagType, requiredPledge: Moves, selfSideTarget: boolean = false) {
    super(tagType, 4, false, selfSideTarget);

    this.requiredPledge = requiredPledge;
  }

  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // TODO: add support for `HIT` effect triggering in AddArenaTagAttr to remove the need for this check
    if (user.getLastXMoves(1)[0]?.result !== MoveResult.SUCCESS) {
      return false;
    }

    if (user.turnData.combiningPledge === this.requiredPledge) {
      return super.apply(user, target, move, args);
    }
    return false;
  }
}

/**
 * Attribute used for Revival Blessing.
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class RevivalBlessingAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  /**
   *
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @param args N/A
   * @returns Promise, true if function succeeds.
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // If user is player, checks if the user has fainted pokemon
    if (user instanceof PlayerPokemon) {
      globalScene.unshiftPhase(new RevivalBlessingPhase(user));
      return true;
    } else if (user instanceof EnemyPokemon && user.hasTrainer() && globalScene.getEnemyParty().findIndex((p) => p.isFainted() && !p.isBoss()) > -1) {
      // If used by an enemy trainer with at least one fainted non-boss Pokemon, this
      // revives one of said Pokemon selected at random.
      const faintedPokemon = globalScene.getEnemyParty().filter((p) => p.isFainted() && !p.isBoss());
      const pokemon = faintedPokemon[user.randSeedInt(faintedPokemon.length)];
      const slotIndex = globalScene.getEnemyParty().findIndex((p) => pokemon.id === p.id);
      pokemon.resetStatus(true, false, false, true);
      pokemon.heal(Math.min(toDmgValue(0.5 * pokemon.getMaxHp()), pokemon.getMaxHp()));
      globalScene.queueMessage(i18next.t("moveTriggers:revivalBlessing", { pokemonName: getPokemonNameWithAffix(pokemon) }), 0, true);
      const allyPokemon = user.getAlly();
      if (globalScene.currentBattle.double && globalScene.getEnemyParty().length > 1 && !isNullOrUndefined(allyPokemon)) {
        // Handle cases where revived pokemon needs to get switched in on same turn
        if (allyPokemon.isFainted() || allyPokemon === pokemon) {
          // Enemy switch phase should be removed and replaced with the revived pkmn switching in
          globalScene.tryRemovePhase((phase: SwitchSummonPhase) => phase instanceof SwitchSummonPhase && phase.getPokemon() === pokemon);
          // If the pokemon being revived was alive earlier in the turn, cancel its move
          // (revived pokemon can't move in the turn they're brought back)
          globalScene.findPhase((phase: MovePhase) => phase.pokemon === pokemon)?.cancel();
          if (user.fieldPosition === FieldPosition.CENTER) {
            user.setFieldPosition(FieldPosition.LEFT);
          }
          globalScene.unshiftPhase(new SwitchSummonPhase(SwitchType.SWITCH, allyPokemon.getFieldIndex(), slotIndex, false, false));
        }
      }
      return true;
    }
    return false;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) =>
      (user instanceof PlayerPokemon && globalScene.getPlayerParty().some((p) => p.isFainted())) ||
      (user instanceof EnemyPokemon &&
        user.hasTrainer() &&
        globalScene.getEnemyParty().some((p) => p.isFainted() && !p.isBoss()));
  }

  override getUserBenefitScore(user: Pokemon, _target: Pokemon, _move: Move): number {
    if (user.hasTrainer() && globalScene.getEnemyParty().some((p) => p.isFainted() && !p.isBoss())) {
      return 20;
    }

    return -20;
  }
}


export class ForceSwitchOutAttr extends MoveEffectAttr {
  constructor(
    private selfSwitch: boolean = false,
    private switchType: SwitchType = SwitchType.SWITCH
  ) {
    super(false, { lastHitOnly: true });
  }

  isBatonPass() {
    return this.switchType === SwitchType.BATON_PASS;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // Check if the move category is not STATUS or if the switch out condition is not met
    if (!this.getSwitchOutCondition()(user, target, move)) {
      return false;
    }

    /** The {@linkcode Pokemon} to be switched out with this effect */
    const switchOutTarget = this.selfSwitch ? user : target;

    // If the switch-out target is a Dondozo with a Tatsugiri in its mouth
    // (e.g. when it uses Flip Turn), make it spit out the Tatsugiri before switching out.
    switchOutTarget.lapseTag(BattlerTagType.COMMANDED);

    if (switchOutTarget instanceof PlayerPokemon) {
      /**
      * Check if Wimp Out/Emergency Exit activates due to being hit by U-turn or Volt Switch
      * If it did, the user of U-turn or Volt Switch will not be switched out.
      */
      if (target.getAbility().hasAttr(PostDamageForceSwitchAbAttr)
        && [ Moves.U_TURN, Moves.VOLT_SWITCH, Moves.FLIP_TURN,Moves.ARK_115].includes(move.id)
      ) {
        if (this.hpDroppedBelowHalf(target)) {
          return false;
        }
      }

      // Find indices of off-field Pokemon that are eligible to be switched into
      const eligibleNewIndices: number[] = [];
      globalScene.getPlayerParty().forEach((pokemon, index) => {
        if (pokemon.isAllowedInBattle() && !pokemon.isOnField()) {
          eligibleNewIndices.push(index);
        }
      });

      if (eligibleNewIndices.length < 1) {
        return false;
      }

      if (switchOutTarget.hp > 0) {
        if (this.switchType === SwitchType.FORCE_SWITCH) {
          switchOutTarget.leaveField(true);
          const slotIndex = eligibleNewIndices[user.randSeedInt(eligibleNewIndices.length)];
          globalScene.prependToPhase(
            new SwitchSummonPhase(
              this.switchType,
              switchOutTarget.getFieldIndex(),
              slotIndex,
              false,
              true
            ),
            MoveEndPhase
          );
        } else {
          switchOutTarget.leaveField(this.switchType === SwitchType.SWITCH);
          globalScene.prependToPhase(
            new SwitchPhase(
              this.switchType,
              switchOutTarget.getFieldIndex(),
              true,
              true
            ),
            MoveEndPhase
          );
          return true;
        }
      }
      return false;
    } else if (globalScene.currentBattle.battleType !== BattleType.WILD) { // Switch out logic for enemy trainers
      // Find indices of off-field Pokemon that are eligible to be switched into
      const isPartnerTrainer = globalScene.currentBattle.trainer?.isPartner();
      const eligibleNewIndices: number[] = [];
      globalScene.getEnemyParty().forEach((pokemon, index) => {
        if (pokemon.isAllowedInBattle() && !pokemon.isOnField() && (!isPartnerTrainer || pokemon.trainerSlot === (switchOutTarget as EnemyPokemon).trainerSlot)) {
          eligibleNewIndices.push(index);
        }
      });

      if (eligibleNewIndices.length < 1) {
        return false;
      }

      if (switchOutTarget.hp > 0) {
        if (this.switchType === SwitchType.FORCE_SWITCH) {
          switchOutTarget.leaveField(true);
          const slotIndex = eligibleNewIndices[user.randSeedInt(eligibleNewIndices.length)];
          globalScene.prependToPhase(
            new SwitchSummonPhase(
              this.switchType,
              switchOutTarget.getFieldIndex(),
              slotIndex,
              false,
              false
            ),
            MoveEndPhase
          );
        } else {
          switchOutTarget.leaveField(this.switchType === SwitchType.SWITCH);
          globalScene.prependToPhase(
            new SwitchSummonPhase(
              this.switchType,
              switchOutTarget.getFieldIndex(),
              (globalScene.currentBattle.trainer ? globalScene.currentBattle.trainer.getNextSummonIndex((switchOutTarget as EnemyPokemon).trainerSlot) : 0),
              false,
              false
            ),
            MoveEndPhase
          );
        }
      }
    } else { // Switch out logic for wild pokemon
      /**
      * Check if Wimp Out/Emergency Exit activates due to being hit by U-turn or Volt Switch
      * If it did, the user of U-turn or Volt Switch will not be switched out.
      */
      if (target.getAbility().hasAttr(PostDamageForceSwitchAbAttr)
        && [ Moves.U_TURN, Moves.VOLT_SWITCH, Moves.FLIP_TURN,Moves.ARK_115 ].includes(move.id)
      ) {
        if (this.hpDroppedBelowHalf(target)) {
          return false;
        }
      }

      const allyPokemon = switchOutTarget.getAlly();

      if (switchOutTarget.hp > 0) {
        switchOutTarget.leaveField(false);
        globalScene.queueMessage(i18next.t("moveTriggers:fled", { pokemonName: getPokemonNameWithAffix(switchOutTarget) }), null, true, 500);

        // in double battles redirect potential moves off fled pokemon
        if (globalScene.currentBattle.double && !isNullOrUndefined(allyPokemon)) {
          globalScene.redirectPokemonMoves(switchOutTarget, allyPokemon);
        }
      }

      // clear out enemy held item modifiers of the switch out target
      globalScene.clearEnemyHeldItemModifiers(switchOutTarget);

      if (!allyPokemon?.isActive(true) && switchOutTarget.hp) {
          globalScene.pushPhase(new BattleEndPhase(false));

          if (globalScene.gameMode.hasRandomBiomes || globalScene.isNewBiome()) {
            globalScene.pushPhase(new SelectBiomePhase());
          }

          globalScene.pushPhase(new NewBattlePhase());
      }
    }

	  return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => (move.category !== MoveCategory.STATUS || this.getSwitchOutCondition()(user, target, move));
  }

  getFailedText(_user: Pokemon, target: Pokemon, _move: Move): string | undefined {
    const blockedByAbility = new BooleanHolder(false);
    applyAbAttrs(ForceSwitchOutImmunityAbAttr, target, blockedByAbility);
    if (blockedByAbility.value) {
      return i18next.t("moveTriggers:cannotBeSwitchedOut", { pokemonName: getPokemonNameWithAffix(target) });
    }
  }


  getSwitchOutCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const switchOutTarget = (this.selfSwitch ? user : target);
      const player = switchOutTarget instanceof PlayerPokemon;

      if (!this.selfSwitch) {
        // Dondozo with an allied Tatsugiri in its mouth cannot be forced out
        const commandedTag = switchOutTarget.getTag(BattlerTagType.COMMANDED);
        if (commandedTag?.getSourcePokemon()?.isActive(true)) {
          return false;
        }

        if (!player && globalScene.currentBattle.isBattleMysteryEncounter() && !globalScene.currentBattle.mysteryEncounter?.fleeAllowed) {
          // Don't allow wild opponents to be force switched during MEs with flee disabled
          return false;
        }

        const blockedByAbility = new BooleanHolder(false);
        applyAbAttrs(ForceSwitchOutImmunityAbAttr, target, blockedByAbility);
        if (blockedByAbility.value) {
          return false;
        }
      }


      if (!player && globalScene.currentBattle.battleType === BattleType.WILD) {
        // wild pokemon cannot switch out with baton pass.
        return !this.isBatonPass()
                && globalScene.currentBattle.waveIndex % 10 !== 0
                // Don't allow wild mons to flee with U-turn et al.
                && !(this.selfSwitch && MoveCategory.STATUS !== move.category);
      }

      const party = player ? globalScene.getPlayerParty() : globalScene.getEnemyParty();
      return party.filter(p => p.isAllowedInBattle() && !p.isOnField()
          && (player || (p as EnemyPokemon).trainerSlot === (switchOutTarget as EnemyPokemon).trainerSlot)).length > 0;
    };
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    if (!globalScene.getEnemyParty().find(p => p.isActive() && !p.isOnField())) {
      return -20;
    }
    let ret = this.selfSwitch ? Math.floor((1 - user.getHpRatio()) * 20) : super.getUserBenefitScore(user, target, move);
    if (this.selfSwitch && this.isBatonPass()) {
      const statStageTotal = user.getStatStages().reduce((s: number, total: number) => total += s, 0);
      ret = ret / 2 + (Phaser.Tweens.Builders.GetEaseFunction("Sine.easeOut")(Math.min(Math.abs(statStageTotal), 10) / 10) * (statStageTotal >= 0 ? 10 : -10));
    }
    return ret;
  }

  /**
  * Helper function to check if the Pokémon's health is below half after taking damage.
  * Used for an edge case interaction with Wimp Out/Emergency Exit.
  * If the Ability activates due to being hit by U-turn or Volt Switch, the user of that move will not be switched out.
  */
  hpDroppedBelowHalf(target: Pokemon): boolean {
    const pokemonHealth = target.hp;
    const maxPokemonHealth = target.getMaxHp();
    const damageTaken = target.turnData.damageTaken;
    const initialHealth = pokemonHealth + damageTaken;

    // Check if the Pokémon's health has dropped below half after the damage
    return initialHealth >= maxPokemonHealth / 2 && pokemonHealth < maxPokemonHealth / 2;
  }
}

export class ChillyReceptionAttr extends ForceSwitchOutAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    globalScene.arena.trySetWeather(WeatherType.SNOW, user);
    return super.apply(user, target, move, args);
  }

  getCondition(): MoveConditionFunc {
    // chilly reception move will go through if the weather is change-able to snow, or the user can switch out, else move will fail
    return (user, target, move) => globalScene.arena.weather?.weatherType !== WeatherType.SNOW || super.getSwitchOutCondition()(user, target, move);
  }
}
export class RemoveTypeAttr extends MoveEffectAttr {

  private removedType: PokemonType;
  private messageCallback: ((user: Pokemon) => void) | undefined;

  constructor(removedType: PokemonType, messageCallback?: (user: Pokemon) => void) {
    super(true, { trigger: MoveEffectTrigger.POST_TARGET });
    this.removedType = removedType;
    this.messageCallback = messageCallback;

  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    if (user.isTerastallized && user.getTeraType() === this.removedType) { // active tera types cannot be removed
      return false;
    }

    const userTypes = user.getTypes(true);
    const modifiedTypes = userTypes.filter(type => type !== this.removedType);
    if (modifiedTypes.length === 0) {
      modifiedTypes.push(PokemonType.UNKNOWN);
    }
    user.summonData.types = modifiedTypes;
    user.updateInfo();


    if (this.messageCallback) {
      this.messageCallback(user);
    }

    return true;
  }
}

export class CopyTypeAttr extends MoveEffectAttr {
  constructor() {
    super(false);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const targetTypes = target.getTypes(true);
    if (targetTypes.includes(PokemonType.UNKNOWN) && targetTypes.indexOf(PokemonType.UNKNOWN) > -1) {
      targetTypes[targetTypes.indexOf(PokemonType.UNKNOWN)] = PokemonType.NORMAL;
    }
    user.summonData.types = targetTypes;
    user.updateInfo();

    globalScene.queueMessage(i18next.t("moveTriggers:copyType", { pokemonName: getPokemonNameWithAffix(user), targetPokemonName: getPokemonNameWithAffix(target) }));

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => target.getTypes()[0] !== PokemonType.UNKNOWN || target.summonData.addedType !== null;
  }
}

export class CopyBiomeTypeAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const terrainType = globalScene.arena.getTerrainType();
    let typeChange: PokemonType;
    if (terrainType !== TerrainType.NONE) {
      typeChange = this.getTypeForTerrain(globalScene.arena.getTerrainType());
    } else {
      typeChange = this.getTypeForBiome(globalScene.arena.biomeType);
    }

    user.summonData.types = [ typeChange ];
    user.updateInfo();

    globalScene.queueMessage(i18next.t("moveTriggers:transformedIntoType", { pokemonName: getPokemonNameWithAffix(user), typeName: i18next.t(`pokemonInfo:Type.${PokemonType[typeChange]}`) }));

    return true;
  }

  /**
   * Retrieves a type from the current terrain
   * @param terrainType {@linkcode TerrainType}
   * @returns {@linkcode Type}
   */
  private getTypeForTerrain(terrainType: TerrainType): PokemonType {
    switch (terrainType) {
      case TerrainType.ELECTRIC:
        return PokemonType.ELECTRIC;
      case TerrainType.MISTY:
        return PokemonType.FAIRY;
      case TerrainType.GRASSY:
        return PokemonType.GRASS;
      case TerrainType.PSYCHIC:
        return PokemonType.PSYCHIC;
      case TerrainType.NONE:
      default:
        return PokemonType.UNKNOWN;
    }
  }

  /**
   * Retrieves a type from the current biome
   * @param biomeType {@linkcode Biome}
   * @returns {@linkcode Type}
   */
  private getTypeForBiome(biomeType: Biome): PokemonType {
    switch (biomeType) {
      case Biome.TOWN:
      case Biome.PLAINS:
      case Biome.METROPOLIS:
        return PokemonType.NORMAL;
      case Biome.GRASS:
      case Biome.TALL_GRASS:
        return PokemonType.GRASS;
      case Biome.FOREST:
      case Biome.JUNGLE:
        return PokemonType.BUG;
      case Biome.SLUM:
      case Biome.SWAMP:
        return PokemonType.POISON;
      case Biome.SEA:
      case Biome.BEACH:
      case Biome.LAKE:
      case Biome.SEABED:
        return PokemonType.WATER;
      case Biome.MOUNTAIN:
        return PokemonType.FLYING;
      case Biome.BADLANDS:
        return PokemonType.GROUND;
      case Biome.CAVE:
      case Biome.DESERT:
        return PokemonType.ROCK;
      case Biome.ICE_CAVE:
      case Biome.SNOWY_FOREST:
        return PokemonType.ICE;
      case Biome.MEADOW:
      case Biome.FAIRY_CAVE:
      case Biome.ISLAND:
        return PokemonType.FAIRY;
      case Biome.POWER_PLANT:
        return PokemonType.ELECTRIC;
      case Biome.VOLCANO:
        return PokemonType.FIRE;
      case Biome.GRAVEYARD:
      case Biome.TEMPLE:
        return PokemonType.GHOST;
      case Biome.DOJO:
      case Biome.CONSTRUCTION_SITE:
        return PokemonType.FIGHTING;
      case Biome.FACTORY:
      case Biome.LABORATORY:
        return PokemonType.STEEL;
      case Biome.RUINS:
      case Biome.SPACE:
        return PokemonType.PSYCHIC;
      case Biome.WASTELAND:
      case Biome.END:
        return PokemonType.DRAGON;
      case Biome.ABYSS:
        return PokemonType.DARK;
      default:
        return PokemonType.UNKNOWN;
    }
  }
}

export class ChangeTypeAttr extends MoveEffectAttr {
  private type: PokemonType;

  constructor(type: PokemonType) {
    super(false);

    this.type = type;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    target.summonData.types = [ this.type ];
    target.updateInfo();

    globalScene.queueMessage(i18next.t("moveTriggers:transformedIntoType", { pokemonName: getPokemonNameWithAffix(target), typeName: i18next.t(`pokemonInfo:Type.${PokemonType[this.type]}`) }));

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => !target.isTerastallized && !target.hasAbility(Abilities.MULTITYPE) && !target.hasAbility(Abilities.RKS_SYSTEM) && !(target.getTypes().length === 1 && target.getTypes()[0] === this.type);
  }
}

export class AddTypeAttr extends MoveEffectAttr {
  private type: PokemonType;

  constructor(type: PokemonType) {
    super(false);

    this.type = type;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    target.summonData.addedType = this.type;
    target.updateInfo();

    globalScene.queueMessage(i18next.t("moveTriggers:addType", { typeName: i18next.t(`pokemonInfo:Type.${PokemonType[this.type]}`), pokemonName: getPokemonNameWithAffix(target) }));

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => !target.isTerastallized && !target.getTypes().includes(this.type);
  }
}

export class FirstMoveTypeAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const firstMoveType = target.getMoveset()[0].getMove().type;
    user.summonData.types = [ firstMoveType ];
    globalScene.queueMessage(i18next.t("battle:transformedIntoType", { pokemonName: getPokemonNameWithAffix(user), type: i18next.t(`pokemonInfo:Type.${PokemonType[firstMoveType]}`) }));

    return true;
  }
}

/**
 * Attribute used to call a move.
 * Used by other move attributes: {@linkcode RandomMoveAttr}, {@linkcode RandomMovesetMoveAttr}, {@linkcode CopyMoveAttr}
 * @see {@linkcode apply} for move call
 * @extends OverrideMoveEffectAttr
 */
class CallMoveAttr extends OverrideMoveEffectAttr {
  protected invalidMoves: ReadonlySet<Moves>;
  protected hasTarget: boolean;
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const replaceMoveTarget = move.moveTarget === MoveTarget.NEAR_OTHER ? MoveTarget.NEAR_ENEMY : undefined;
    const moveTargets = getMoveTargets(user, move.id, replaceMoveTarget);
    if (moveTargets.targets.length === 0) {
      globalScene.queueMessage(i18next.t("battle:attackFailed"));
      console.log("CallMoveAttr failed due to no targets.");
      return false;
    }
    const targets = moveTargets.multiple || moveTargets.targets.length === 1
      ? moveTargets.targets
      : [ this.hasTarget ? target.getBattlerIndex() : moveTargets.targets[user.randSeedInt(moveTargets.targets.length)] ]; // account for Mirror Move having a target already
    user.getMoveQueue().push({ move: move.id, targets: targets, virtual: true, ignorePP: true });
    globalScene.unshiftPhase(new LoadMoveAnimPhase(move.id));
    globalScene.unshiftPhase(new MovePhase(user, targets, new PokemonMove(move.id, 0, 0, true), true, true));
    return true;
  }
}

/**
 * Attribute used to call a random move.
 * Used for {@linkcode Moves.METRONOME}
 * @see {@linkcode apply} for move selection and move call
 * @extends CallMoveAttr to call a selected move
 */
export class RandomMoveAttr extends CallMoveAttr {
  constructor(invalidMoves: ReadonlySet<Moves>) {
    super();
    this.invalidMoves = invalidMoves;
  }

  /**
   * This function exists solely to allow tests to override the randomly selected move by mocking this function.
   */
  public getMoveOverride(): Moves | null {
    return null;
  }

  /**
   * User calls a random moveId.
   *
   * Invalid moves are indicated by what is passed in to invalidMoves: {@linkcode invalidMetronomeMoves}
   * @param user Pokemon that used the move and will call a random move
   * @param target Pokemon that will be targeted by the random move (if single target)
   * @param move Move being used
   * @param args Unused
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const moveIds = getEnumValues(Moves).map(m => !this.invalidMoves.has(m) && !allMoves[m].name.endsWith(" (N)") ? m : Moves.NONE);
    let moveId: Moves = Moves.NONE;
    do {
      moveId = this.getMoveOverride() ?? moveIds[user.randSeedInt(moveIds.length)];
    }
    while (moveId === Moves.NONE);
    return super.apply(user, target, allMoves[moveId], args);
  }
}

/**
 * Attribute used to call a random move in the user or party's moveset.
 * Used for {@linkcode Moves.ASSIST} and {@linkcode Moves.SLEEP_TALK}
 *
 * Fails if the user has no callable moves.
 *
 * Invalid moves are indicated by what is passed in to invalidMoves: {@linkcode invalidAssistMoves} or {@linkcode invalidSleepTalkMoves}
 * @extends RandomMoveAttr to use the callMove function on a moveId
 * @see {@linkcode getCondition} for move selection
 */
export class RandomMovesetMoveAttr extends CallMoveAttr {
  private includeParty: boolean;
  private moveId: number;
  constructor(invalidMoves: ReadonlySet<Moves>, includeParty: boolean = false) {
    super();
    this.includeParty = includeParty;
    this.invalidMoves = invalidMoves;
  }

  /**
   * User calls a random moveId selected in {@linkcode getCondition}
   * @param user Pokemon that used the move and will call a random move
   * @param target Pokemon that will be targeted by the random move (if single target)
   * @param move Move being used
   * @param args Unused
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    return super.apply(user, target, allMoves[this.moveId], args);
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      // includeParty will be true for Assist, false for Sleep Talk
      let allies: Pokemon[];
      if (this.includeParty) {
        allies = user.isPlayer() ? globalScene.getPlayerParty().filter(p => p !== user) : globalScene.getEnemyParty().filter(p => p !== user);
      } else {
        allies = [ user ];
      }
      const partyMoveset = allies.map(p => p.moveset).flat();
      const moves = partyMoveset.filter(m => !this.invalidMoves.has(m!.moveId) && !m!.getMove().name.endsWith(" (N)"));
      if (moves.length === 0) {
        return false;
      }

      this.moveId = moves[user.randSeedInt(moves.length)]!.moveId;
      return true;
    };
  }
}

export class NaturePowerAttr extends OverrideMoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    let moveId;
    switch (globalScene.arena.getTerrainType()) {
    // this allows terrains to 'override' the biome move
      case TerrainType.NONE:
        switch (globalScene.arena.biomeType) {
          case Biome.TOWN:
            moveId = Moves.ROUND;
            break;
          case Biome.METROPOLIS:
            moveId = Moves.TRI_ATTACK;
            break;
          case Biome.SLUM:
            moveId = Moves.SLUDGE_BOMB;
            break;
          case Biome.PLAINS:
            moveId = Moves.SILVER_WIND;
            break;
          case Biome.GRASS:
            moveId = Moves.GRASS_KNOT;
            break;
          case Biome.TALL_GRASS:
            moveId = Moves.POLLEN_PUFF;
            break;
          case Biome.MEADOW:
            moveId = Moves.GIGA_DRAIN;
            break;
          case Biome.FOREST:
            moveId = Moves.BUG_BUZZ;
            break;
          case Biome.JUNGLE:
            moveId = Moves.LEAF_STORM;
            break;
          case Biome.SEA:
            moveId = Moves.HYDRO_PUMP;
            break;
          case Biome.SWAMP:
            moveId = Moves.MUD_BOMB;
            break;
          case Biome.BEACH:
            moveId = Moves.SCALD;
            break;
          case Biome.LAKE:
            moveId = Moves.BUBBLE_BEAM;
            break;
          case Biome.SEABED:
            moveId = Moves.BRINE;
            break;
          case Biome.ISLAND:
            moveId = Moves.LEAF_TORNADO;
            break;
          case Biome.MOUNTAIN:
            moveId = Moves.AIR_SLASH;
            break;
          case Biome.BADLANDS:
            moveId = Moves.EARTH_POWER;
            break;
          case Biome.DESERT:
            moveId = Moves.SCORCHING_SANDS;
            break;
          case Biome.WASTELAND:
            moveId = Moves.DRAGON_PULSE;
            break;
          case Biome.CONSTRUCTION_SITE:
            moveId = Moves.STEEL_BEAM;
            break;
          case Biome.CAVE:
            moveId = Moves.POWER_GEM;
            break;
          case Biome.ICE_CAVE:
            moveId = Moves.ICE_BEAM;
            break;
          case Biome.SNOWY_FOREST:
            moveId = Moves.FROST_BREATH;
            break;
          case Biome.VOLCANO:
            moveId = Moves.LAVA_PLUME;
            break;
          case Biome.GRAVEYARD:
            moveId = Moves.SHADOW_BALL;
            break;
          case Biome.RUINS:
            moveId = Moves.ANCIENT_POWER;
            break;
          case Biome.TEMPLE:
            moveId = Moves.EXTRASENSORY;
            break;
          case Biome.DOJO:
            moveId = Moves.FOCUS_BLAST;
            break;
          case Biome.FAIRY_CAVE:
            moveId = Moves.ALLURING_VOICE;
            break;
          case Biome.ABYSS:
            moveId = Moves.OMINOUS_WIND;
            break;
          case Biome.SPACE:
            moveId = Moves.DRACO_METEOR;
            break;
          case Biome.FACTORY:
            moveId = Moves.FLASH_CANNON;
            break;
          case Biome.LABORATORY:
            moveId = Moves.ZAP_CANNON;
            break;
          case Biome.POWER_PLANT:
            moveId = Moves.CHARGE_BEAM;
            break;
          case Biome.END:
            moveId = Moves.ETERNABEAM;
            break;
        }
        break;
      case TerrainType.MISTY:
        moveId = Moves.MOONBLAST;
        break;
      case TerrainType.ELECTRIC:
        moveId = Moves.THUNDERBOLT;
        break;
      case TerrainType.GRASSY:
        moveId = Moves.ENERGY_BALL;
        break;
      case TerrainType.PSYCHIC:
        moveId = Moves.PSYCHIC;
        break;
      default:
      // Just in case there's no match
        moveId = Moves.TRI_ATTACK;
        break;
    }

    user.getMoveQueue().push({ move: moveId, targets: [ target.getBattlerIndex() ], ignorePP: true });
    globalScene.unshiftPhase(new LoadMoveAnimPhase(moveId));
    globalScene.unshiftPhase(new MovePhase(user, [ target.getBattlerIndex() ], new PokemonMove(moveId, 0, 0, true), true));
    return true;
  }
}

/**
 * Attribute used to copy a previously-used move.
 * Used for {@linkcode Moves.COPYCAT} and {@linkcode Moves.MIRROR_MOVE}
 * @see {@linkcode apply} for move selection and move call
 * @extends CallMoveAttr to call a selected move
 */
export class CopyMoveAttr extends CallMoveAttr {
  private mirrorMove: boolean;
  constructor(mirrorMove: boolean, invalidMoves: ReadonlySet<Moves> = new Set()) {
    super();
    this.mirrorMove = mirrorMove;
    this.invalidMoves = invalidMoves;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    this.hasTarget = this.mirrorMove;
    const lastMove = this.mirrorMove ? target.getLastXMoves()[0].move : globalScene.currentBattle.lastMove;
    return super.apply(user, target, allMoves[lastMove], args);
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      if (this.mirrorMove) {
        const lastMove = target.getLastXMoves()[0]?.move;
        return !!lastMove && !this.invalidMoves.has(lastMove);
      } else {
        const lastMove = globalScene.currentBattle.lastMove;
        return lastMove !== undefined && !this.invalidMoves.has(lastMove);
      }
    };
  }
}

/**
 * Attribute used for moves that causes the target to repeat their last used move.
 *
 * Used for [Instruct](https://bulbapedia.bulbagarden.net/wiki/Instruct_(move)).
*/
export class RepeatMoveAttr extends MoveEffectAttr {
  constructor() {
    super(false, { trigger: MoveEffectTrigger.POST_APPLY }); // needed to ensure correct protect interaction
  }

  /**
   * Forces the target to re-use their last used move again
   *
   * @param user {@linkcode Pokemon} that used the attack
   * @param target {@linkcode Pokemon} targeted by the attack
   * @param move N/A
   * @param args N/A
   * @returns `true` if the move succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // get the last move used (excluding status based failures) as well as the corresponding moveset slot
    const lastMove = target.getLastXMoves(-1).find(m => m.move !== Moves.NONE)!;
    const movesetMove = target.getMoveset().find(m => m.moveId === lastMove.move)!;
    // If the last move used can hit more than one target or has variable targets,
    // re-compute the targets for the attack
    // (mainly for alternating double/single battle shenanigans)
    // Rampaging moves (e.g. Outrage) are not included due to being incompatible with Instruct
    // TODO: Fix this once dragon darts gets smart targeting
    let moveTargets = movesetMove.getMove().isMultiTarget() ? getMoveTargets(target, lastMove.move).targets : lastMove.targets;

    /** In the event the instructed move's only target is a fainted opponent, redirect it to an alive ally if possible
    Normally, all yet-unexecuted move phases would swap over when the enemy in question faints
    (see `redirectPokemonMoves` in `battle-scene.ts`),
    but since instruct adds a new move phase pre-emptively, we need to handle this interaction manually.
    */
    const firstTarget = globalScene.getField()[moveTargets[0]];
    if (globalScene.currentBattle.double && moveTargets.length === 1 && firstTarget.isFainted() && firstTarget !== target.getAlly()) {
      const ally = firstTarget.getAlly();
      if (!isNullOrUndefined(ally) && ally.isActive()) { // ally exists, is not dead and can sponge the blast
        moveTargets = [ ally.getBattlerIndex() ];
      }
    }

    globalScene.queueMessage(i18next.t("moveTriggers:instructingMove", {
      userPokemonName: getPokemonNameWithAffix(user),
      targetPokemonName: getPokemonNameWithAffix(target)
    }));
    target.getMoveQueue().unshift({ move: lastMove.move, targets: moveTargets, ignorePP: false });
    target.turnData.extraTurns++;
    globalScene.appendToPhase(new MovePhase(target, moveTargets, movesetMove), MoveEndPhase);
    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const lastMove = target.getLastXMoves(-1).find(m => m.move !== Moves.NONE);
      const movesetMove = target.getMoveset().find(m => m.moveId === lastMove?.move);
      const uninstructableMoves = [
        // Locking/Continually Executed moves
	 Moves.OUTRAGE,
        Moves.ARK_06,
       Moves.ARK_77,
  Moves.ARK_129,
        Moves.RAGING_FURY,
        Moves.ROLLOUT,
        Moves.PETAL_DANCE,
        Moves.THRASH,
        Moves.ICE_BALL,
        // Multi-turn Moves
        Moves.BIDE,
        Moves.SHELL_TRAP,
        Moves.BEAK_BLAST,
        Moves.FOCUS_PUNCH,
        // "First Turn Only" moves
	Moves.ARK_63,
	Moves.ARK_114,
        Moves.FAKE_OUT,
        Moves.FIRST_IMPRESSION,
        Moves.MAT_BLOCK,
        // Moves with a recharge turn
        Moves.HYPER_BEAM,
        Moves.ETERNABEAM,
        Moves.FRENZY_PLANT,
        Moves.BLAST_BURN,
        Moves.HYDRO_CANNON,
        Moves.GIGA_IMPACT,
        Moves.PRISMATIC_LASER,
        Moves.ROAR_OF_TIME,
        Moves.ROCK_WRECKER,
        Moves.METEOR_ASSAULT,
        // Charging & 2-turn moves
        Moves.DIG,
        Moves.FLY,
        Moves.BOUNCE,
        Moves.SHADOW_FORCE,
        Moves.PHANTOM_FORCE,
        Moves.DIVE,
        Moves.ELECTRO_SHOT,
        Moves.ICE_BURN,
        Moves.GEOMANCY,
        Moves.FREEZE_SHOCK,
        Moves.SKY_DROP,
        Moves.SKY_ATTACK,
        Moves.SKULL_BASH,
        Moves.SOLAR_BEAM,
        Moves.SOLAR_BLADE,
        Moves.METEOR_BEAM,
        // Other moves
        Moves.INSTRUCT,
        Moves.KINGS_SHIELD,
        Moves.SKETCH,
        Moves.TRANSFORM,
        Moves.MIMIC,
        Moves.STRUGGLE,
       Moves.ARK_151,
        // TODO: Add Max/G-Move blockage if or when they are implemented
      ];

      if (!lastMove?.move // no move to instruct
        || !movesetMove // called move not in target's moveset (forgetting the move, etc.)
        || movesetMove.ppUsed === movesetMove.getMovePp() // move out of pp
        || allMoves[lastMove.move].isChargingMove() // called move is a charging/recharging move
        || uninstructableMoves.includes(lastMove.move)) { // called move is in the banlist
        return false;
      }
      return true;
    };
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    // TODO: Make the AI actually use instruct
    /* Ideally, the AI would score instruct based on the scorings of the on-field pokemons'
    * last used moves at the time of using Instruct (by the time the instructor gets to act)
    * with respect to the user's side.
    * In 99.9% of cases, this would be the pokemon's ally (unless the target had last
    * used a move like Decorate on the user or its ally)
    */
    return 2;
  }
}

/**
 *  Attribute used for moves that reduce PP of the target's last used move.
 *  Used for Spite.
 */
export class ReducePpMoveAttr extends MoveEffectAttr {
  protected reduction: number;
  constructor(reduction: number) {
    super();
    this.reduction = reduction;
  }

  /**
   * Reduces the PP of the target's last-used move by an amount based on this attribute instance's {@linkcode reduction}.
   *
   * @param user {@linkcode Pokemon} that used the attack
   * @param target {@linkcode Pokemon} targeted by the attack
   * @param move N/A
   * @param args N/A
   * @returns `true`
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    // Null checks can be skipped due to condition function
    const lastMove = target.getLastXMoves()[0];
    const movesetMove = target.getMoveset().find(m => m.moveId === lastMove.move)!;
    const lastPpUsed = movesetMove.ppUsed;
    movesetMove.ppUsed = Math.min((lastPpUsed) + this.reduction, movesetMove.getMovePp());

    const message = i18next.t("battle:ppReduced", { targetName: getPokemonNameWithAffix(target), moveName: movesetMove.getName(), reduction: (movesetMove.ppUsed) - lastPpUsed });
    globalScene.eventTarget.dispatchEvent(new MoveUsedEvent(target.id, movesetMove.getMove(), movesetMove.ppUsed));
    globalScene.queueMessage(message);

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const lastMove = target.getLastXMoves()[0];
      if (lastMove) {
        const movesetMove = target.getMoveset().find(m => m.moveId === lastMove.move);
        return !!movesetMove?.getPpRatio();
      }
      return false;
    };
  }

  getTargetBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    const lastMove = target.getLastXMoves()[0];
    if (lastMove) {
      const movesetMove = target.getMoveset().find(m => m.moveId === lastMove.move);
      if (movesetMove) {
        const maxPp = movesetMove.getMovePp();
        const ppLeft = maxPp - movesetMove.ppUsed;
        const value = -(8 - Math.ceil(Math.min(maxPp, 30) / 5));
        if (ppLeft < 4) {
          return (value / 4) * ppLeft;
        }
        return value;
      }
    }

    return 0;
  }
}

/**
 *  Attribute used for moves that damage target, and then reduce PP of the target's last used move.
 *  Used for Eerie Spell.
 */
export class AttackReducePpMoveAttr extends ReducePpMoveAttr {
  constructor(reduction: number) {
    super(reduction);
  }

  /**
   * Checks if the target has used a move prior to the attack. PP-reduction is applied through the super class if so.
   *
   * @param user {@linkcode Pokemon} that used the attack
   * @param target {@linkcode Pokemon} targeted by the attack
   * @param move {@linkcode Move} being used
   * @param args N/A
   * @returns {boolean} true
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const lastMove = target.getLastXMoves().find(() => true);
    if (lastMove) {
      const movesetMove = target.getMoveset().find(m => m.moveId === lastMove.move);
      if (Boolean(movesetMove?.getPpRatio())) {
        super.apply(user, target, move, args);
      }
    }

    return true;
  }

  // Override condition function to always perform damage. Instead, perform pp-reduction condition check in apply function above
  getCondition(): MoveConditionFunc {
    return (user, target, move) => true;
  }
}

// TODO: Review this
const targetMoveCopiableCondition: MoveConditionFunc = (user, target, move) => {
  const targetMoves = target.getMoveHistory().filter(m => !m.virtual);
  if (!targetMoves.length) {
    return false;
  }

  const copiableMove = targetMoves[0];

  if (!copiableMove.move) {
    return false;
  }

  if (allMoves[copiableMove.move].isChargingMove() && copiableMove.result === MoveResult.OTHER) {
    return false;
  }

  // TODO: Add last turn of Bide

  return true;
};

export class MovesetCopyMoveAttr extends OverrideMoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const targetMoves = target.getMoveHistory().filter(m => !m.virtual);
    if (!targetMoves.length) {
      return false;
    }

    const copiedMove = allMoves[targetMoves[0].move];

    const thisMoveIndex = user.getMoveset().findIndex(m => m.moveId === move.id);

    if (thisMoveIndex === -1) {
      return false;
    }

    user.summonData.moveset = user.getMoveset().slice(0);
    user.summonData.moveset[thisMoveIndex] = new PokemonMove(copiedMove.id, 0, 0);

    globalScene.queueMessage(i18next.t("moveTriggers:copiedMove", { pokemonName: getPokemonNameWithAffix(user), moveName: copiedMove.name }));

    return true;
  }

  getCondition(): MoveConditionFunc {
    return targetMoveCopiableCondition;
  }
}

/**
 * Attribute for {@linkcode Moves.SKETCH} that causes the user to copy the opponent's last used move
 * This move copies the last used non-virtual move
 *  e.g. if Metronome is used, it copies Metronome itself, not the virtual move called by Metronome
 * Fails if the opponent has not yet used a move.
 * Fails if used on an uncopiable move, listed in unsketchableMoves in getCondition
 * Fails if the move is already in the user's moveset
 */
export class SketchAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }
  /**
   * User copies the opponent's last used move, if possible
   * @param {Pokemon} user Pokemon that used the move and will replace Sketch with the copied move
   * @param {Pokemon} target Pokemon that the user wants to copy a move from
   * @param {Move} move Move being used
   * @param {any[]} args Unused
   * @returns {boolean} true if the function succeeds, otherwise false
   */

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const targetMove = target.getLastXMoves(-1)
      .find(m => m.move !== Moves.NONE && m.move !== Moves.ARK_151 && !m.virtual);
    if (!targetMove) {
      return false;
    }

    const sketchedMove = allMoves[targetMove.move];
    const sketchIndex = user.getMoveset().findIndex(m => m.moveId === move.id);
    if (sketchIndex === -1) {
      return false;
    }

    user.setMove(sketchIndex, sketchedMove.id);

    globalScene.queueMessage(i18next.t("moveTriggers:sketchedMove", { pokemonName: getPokemonNameWithAffix(user), moveName: sketchedMove.name }));

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      if (!targetMoveCopiableCondition(user, target, move)) {
        return false;
      }

      const targetMove = target.getMoveHistory().filter(m => !m.virtual).at(-1);
      if (!targetMove) {
        return false;
      }

      const unsketchableMoves = [
        Moves.CHATTER,
        Moves.MIRROR_MOVE,
        Moves.SLEEP_TALK,
        Moves.STRUGGLE,
Moves.ARK_151,
        Moves.SKETCH,
        Moves.REVIVAL_BLESSING,
        Moves.TERA_STARSTORM,
        Moves.BREAKNECK_BLITZ__PHYSICAL,
        Moves.BREAKNECK_BLITZ__SPECIAL
      ];

      if (unsketchableMoves.includes(targetMove.move)) {
        return false;
      }

      if (user.getMoveset().find(m => m.moveId === targetMove.move)) {
        return false;
      }

      return true;
    };
  }
}

export class AbilityChangeAttr extends MoveEffectAttr {
  public ability: Abilities;

  constructor(ability: Abilities, selfTarget?: boolean) {
    super(selfTarget);

    this.ability = ability;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const moveTarget = this.selfTarget ? user : target;

    globalScene.triggerPokemonFormChange(moveTarget, SpeciesFormChangeRevertWeatherFormTrigger);
    if (moveTarget.breakIllusion()) {
      globalScene.queueMessage(i18next.t("abilityTriggers:illusionBreak", { pokemonName: getPokemonNameWithAffix(moveTarget) }));
    }
    globalScene.queueMessage(i18next.t("moveTriggers:acquiredAbility", { pokemonName: getPokemonNameWithAffix(moveTarget), abilityName: allAbilities[this.ability].name }));
    moveTarget.setTempAbility(allAbilities[this.ability]);
    globalScene.triggerPokemonFormChange(moveTarget, SpeciesFormChangeRevertWeatherFormTrigger);
    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => (this.selfTarget ? user : target).getAbility().isReplaceable && (this.selfTarget ? user : target).getAbility().id !== this.ability;
  }
}

export class AbilityCopyAttr extends MoveEffectAttr {
  public copyToPartner: boolean;

  constructor(copyToPartner: boolean = false) {
    super(false);

    this.copyToPartner = copyToPartner;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:copiedTargetAbility", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target), abilityName: allAbilities[target.getAbility().id].name }));

    user.setTempAbility(target.getAbility());
    const ally = user.getAlly();

    if (this.copyToPartner && globalScene.currentBattle?.double && !isNullOrUndefined(ally) && ally.hp) { // TODO is this the best way to check that the ally is active?
      globalScene.queueMessage(i18next.t("moveTriggers:copiedTargetAbility", { pokemonName: getPokemonNameWithAffix(ally), targetName: getPokemonNameWithAffix(target), abilityName: allAbilities[target.getAbility().id].name }));
      ally.setTempAbility(target.getAbility());
    }

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const ally = user.getAlly();
      let ret = target.getAbility().isCopiable && user.getAbility().isReplaceable;
      if (this.copyToPartner && globalScene.currentBattle?.double) {
        ret = ret && (!ally?.hp || ally?.getAbility().isReplaceable);
      } else {
        ret = ret && user.getAbility().id !== target.getAbility().id;
      }
      return ret;
    };
  }
}

export class AbilityGiveAttr extends MoveEffectAttr {
  public copyToPartner: boolean;

  constructor() {
    super(false);
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:acquiredAbility", { pokemonName: getPokemonNameWithAffix(target), abilityName: allAbilities[user.getAbility().id].name }));

    target.setTempAbility(user.getAbility());

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => user.getAbility().isCopiable && target.getAbility().isReplaceable && user.getAbility().id !== target.getAbility().id;
  }
}

export class SwitchAbilitiesAttr extends MoveEffectAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const tempAbility = user.getAbility();

    globalScene.queueMessage(i18next.t("moveTriggers:swappedAbilitiesWithTarget", { pokemonName: getPokemonNameWithAffix(user) }));

    user.setTempAbility(target.getAbility());
    target.setTempAbility(tempAbility);
    // Swaps Forecast/Flower Gift from Castform/Cherrim
    globalScene.arena.triggerWeatherBasedFormChangesToNormal();

    return true;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => [user, target].every(pkmn => pkmn.getAbility().isSwappable);
  }
}

/**
 * Attribute used for moves that suppress abilities like {@linkcode Moves.GASTRO_ACID}.
 * A suppressed ability cannot be activated.
 *
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 * @see {@linkcode getCondition}
 */
export class SuppressAbilitiesAttr extends MoveEffectAttr {
  /** Sets ability suppression for the target pokemon and displays a message. */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:suppressAbilities", { pokemonName: getPokemonNameWithAffix(target) }));

    target.suppressAbility();

    globalScene.arena.triggerWeatherBasedFormChangesToNormal();

    return true;
  }

  /** Causes the effect to fail when the target's ability is unsupressable or already suppressed. */
  getCondition(): MoveConditionFunc {
    return (user, target, move) => target.getAbility().isSuppressable && !target.summonData.abilitySuppressed;
  }
}

/**
 * Applies the effects of {@linkcode SuppressAbilitiesAttr} if the target has already moved this turn.
 * @extends MoveEffectAttr
 * @see {@linkcode Moves.CORE_ENFORCER} (the move which uses this effect)
 */
export class SuppressAbilitiesIfActedAttr extends MoveEffectAttr {
  /**
   * If the target has already acted this turn, apply a {@linkcode SuppressAbilitiesAttr} effect unless the
   * abillity cannot be suppressed. This is a secondary effect and has no bearing on the success or failure of the move.
   *
   * @returns True if the move occurred, otherwise false. Note that true will be returned even if the target has not
   * yet moved or if the suppression failed to apply.
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    if (target.turnData.acted) {
      const suppressAttr = new SuppressAbilitiesAttr();
      if (suppressAttr.getCondition()(user, target, move)) {
        suppressAttr.apply(user, target, move, args);
      }
    }

    return true;
  }
}

/**
 * Used by Transform
 */
export class TransformAttr extends MoveEffectAttr {
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.unshiftPhase(new PokemonTransformPhase(user.getBattlerIndex(), target.getBattlerIndex()));

    globalScene.queueMessage(i18next.t("moveTriggers:transformedIntoTarget", { pokemonName: getPokemonNameWithAffix(user), targetName: getPokemonNameWithAffix(target) }));

    return true;
  }
}

/**
 * Attribute used for status moves, namely Speed Swap,
 * that swaps the user's and target's corresponding stats.
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class SwapStatAttr extends MoveEffectAttr {
  /** The stat to be swapped between the user and the target */
  private stat: EffectiveStat;

  constructor(stat: EffectiveStat) {
    super();

    this.stat = stat;
  }

  /**
   * Swaps the user's and target's corresponding current
   * {@linkcode EffectiveStat | stat} values
   * @param user the {@linkcode Pokemon} that used the move
   * @param target the {@linkcode Pokemon} that the move was used on
   * @param move N/A
   * @param args N/A
   * @returns true if attribute application succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (super.apply(user, target, move, args)) {
      const temp = user.getStat(this.stat, false);
      user.setStat(this.stat, target.getStat(this.stat, false), false);
      target.setStat(this.stat, temp, false);

      globalScene.queueMessage(i18next.t("moveTriggers:switchedStat", {
        pokemonName: getPokemonNameWithAffix(user),
        stat: i18next.t(getStatKey(this.stat)),
      }));

      return true;
    }
    return false;
  }
}

/**
 * Attribute used to switch the user's own stats.
 * Used by Power Shift.
 * @extends MoveEffectAttr
 */
export class ShiftStatAttr extends MoveEffectAttr {
  private statToSwitch: EffectiveStat;
  private statToSwitchWith: EffectiveStat;

  constructor(statToSwitch: EffectiveStat, statToSwitchWith: EffectiveStat) {
    super();

    this.statToSwitch = statToSwitch;
    this.statToSwitchWith = statToSwitchWith;
  }

  /**
   * Switches the user's stats based on the {@linkcode statToSwitch} and {@linkcode statToSwitchWith} attributes.
   * @param {Pokemon} user the {@linkcode Pokemon} that used the move
   * @param target n/a
   * @param move n/a
   * @param args n/a
   * @returns whether the effect was applied
   */
  override apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const firstStat = user.getStat(this.statToSwitch, false);
    const secondStat = user.getStat(this.statToSwitchWith, false);

    user.setStat(this.statToSwitch, secondStat, false);
    user.setStat(this.statToSwitchWith, firstStat, false);

    globalScene.queueMessage(i18next.t("moveTriggers:shiftedStats", {
      pokemonName: getPokemonNameWithAffix(user),
      statToSwitch: i18next.t(getStatKey(this.statToSwitch)),
      statToSwitchWith: i18next.t(getStatKey(this.statToSwitchWith))
    }));

    return true;
  }

  /**
   * Encourages the user to use the move if the stat to switch with is greater than the stat to switch.
   * @param {Pokemon} user the {@linkcode Pokemon} that used the move
   * @param target n/a
   * @param move n/a
   * @returns number of points to add to the user's benefit score
   */
  override getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return user.getStat(this.statToSwitchWith, false) > user.getStat(this.statToSwitch, false) ? 10 : 0;
  }
}

/**
 * Attribute used for status moves, namely Power Split and Guard Split,
 * that take the average of a user's and target's corresponding
 * stats and assign that average back to each corresponding stat.
 * @extends MoveEffectAttr
 * @see {@linkcode apply}
 */
export class AverageStatsAttr extends MoveEffectAttr {
  /** The stats to be averaged individually between the user and the target */
  private stats: readonly EffectiveStat[];
  private msgKey: string;

  constructor(stats: readonly EffectiveStat[], msgKey: string) {
    super();

    this.stats = stats;
    this.msgKey = msgKey;
  }

  /**
   * Takes the average of the user's and target's corresponding {@linkcode stat}
   * values and sets those stats to the corresponding average for both
   * temporarily.
   * @param user the {@linkcode Pokemon} that used the move
   * @param target the {@linkcode Pokemon} that the move was used on
   * @param move N/A
   * @param args N/A
   * @returns true if attribute application succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (super.apply(user, target, move, args)) {
      for (const s of this.stats) {
        const avg = Math.floor((user.getStat(s, false) + target.getStat(s, false)) / 2);

        user.setStat(s, avg, false);
        target.setStat(s, avg, false);
      }

      globalScene.queueMessage(i18next.t(this.msgKey, { pokemonName: getPokemonNameWithAffix(user) }));

      return true;
    }
    return false;
  }
}

export class MoneyAttr extends MoveEffectAttr {
  constructor() {
    super(true, {firstHitOnly: true });
  }

  apply(user: Pokemon, target: Pokemon, move: Move): boolean {
    globalScene.currentBattle.moneyScattered += globalScene.getWaveMoneyAmount(0.2);
    globalScene.queueMessage(i18next.t("moveTriggers:coinsScatteredEverywhere"));
    return true;
  }
}

/**
 * Applies {@linkcode BattlerTagType.DESTINY_BOND} to the user.
 *
 * @extends MoveEffectAttr
 */
export class DestinyBondAttr extends MoveEffectAttr {
  constructor() {
    super(true, { trigger: MoveEffectTrigger.PRE_APPLY });
  }

  /**
   * Applies {@linkcode BattlerTagType.DESTINY_BOND} to the user.
   * @param user {@linkcode Pokemon} that is having the tag applied to.
   * @param target {@linkcode Pokemon} N/A
   * @param move {@linkcode Move} {@linkcode Move.DESTINY_BOND}
   * @param {any[]} args N/A
   * @returns true
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    globalScene.queueMessage(`${i18next.t("moveTriggers:tryingToTakeFoeDown", { pokemonName: getPokemonNameWithAffix(user) })}`);
    user.addTag(BattlerTagType.DESTINY_BOND, undefined, move.id, user.id);
    return true;
  }
}

/**
 * Attribute to apply a battler tag to the target if they have had their stats boosted this turn.
 * @extends AddBattlerTagAttr
 */
export class AddBattlerTagIfBoostedAttr extends AddBattlerTagAttr {
  constructor(tag: BattlerTagType) {
    super(tag, false, false, 2, 5);
  }

  /**
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @param {any[]} args N/A
   * @returns true
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (target.turnData.statStagesIncreased) {
      super.apply(user, target, move, args);
    }
    return true;
  }
}

/**
 * Attribute to apply a status effect to the target if they have had their stats boosted this turn.
 * @extends MoveEffectAttr
 */
export class StatusIfBoostedAttr extends MoveEffectAttr {
  public effect: StatusEffect;

  constructor(effect: StatusEffect) {
    super(true);
    this.effect = effect;
  }

  /**
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} N/A
   * @param {any[]} args N/A
   * @returns true
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (target.turnData.statStagesIncreased) {
      target.trySetStatus(this.effect, true, user);
    }
    return true;
  }
}

/**
 * Attribute to fail move usage unless all of the user's other moves have been used at least once.
 * Used by {@linkcode Moves.LAST_RESORT}.
 */
export class LastResortAttr extends MoveAttr {
  // TODO: Verify behavior as Bulbapedia page is _extremely_ poorly documented
  getCondition(): MoveConditionFunc {
    return (user: Pokemon, _target: Pokemon, move: Move) => {
      const movesInMoveset = new Set<Moves>(user.getMoveset().map(m => m.moveId));
      if (!movesInMoveset.delete(move.id) || !movesInMoveset.size) {
        return false; // Last resort fails if used when not in user's moveset or no other moves exist
      }

      const movesInHistory = new Set(
        user.getMoveHistory()
        .filter(m => !m.virtual) // TODO: Change to (m) => m < MoveUseType.INDIRECT after Dancer PR refactors virtual into enum
        .map(m => m.move)
      );

      // Since `Set.intersection()` is only present in ESNext, we have to coerce it to an array to check inclusion
      return [...movesInMoveset].every(m => movesInHistory.has(m))
    };
  }
}

export class VariableTargetAttr extends MoveAttr {
  private targetChangeFunc: (user: Pokemon, target: Pokemon, move: Move) => number;

  constructor(targetChange: (user: Pokemon, target: Pokemon, move: Move) => number) {
    super();

    this.targetChangeFunc = targetChange;
  }

  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const targetVal = args[0] as NumberHolder;
    targetVal.value = this.targetChangeFunc(user, target, move);
    return true;
  }
}

/**
 * Attribute for {@linkcode Moves.AFTER_YOU}
 *
 * [After You - Move | Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/After_You_(move))
 */
export class AfterYouAttr extends MoveEffectAttr {
  /**
   * Allows the target of this move to act right after the user.
   *
   * @param user {@linkcode Pokemon} that is using the move.
   * @param target {@linkcode Pokemon} that will move right after this move is used.
   * @param move {@linkcode Move} {@linkcode Moves.AFTER_YOU}
   * @param _args N/A
   * @returns true
   */
  override apply(user: Pokemon, target: Pokemon, _move: Move, _args: any[]): boolean {
    globalScene.queueMessage(i18next.t("moveTriggers:afterYou", { targetName: getPokemonNameWithAffix(target) }));

    //Will find next acting phase of the targeted pokémon, delete it and queue it next on successful delete.
    const nextAttackPhase = globalScene.findPhase<MovePhase>((phase) => phase.pokemon === target);
    if (nextAttackPhase && globalScene.tryRemovePhase((phase: MovePhase) => phase.pokemon === target)) {
      globalScene.prependToPhase(new MovePhase(target, [ ...nextAttackPhase.targets ], nextAttackPhase.move), MovePhase);
    }

    return true;
  }
}

/**
 * Move effect to force the target to move last, ignoring priority.
 * If applied to multiple targets, they move in speed order after all other moves.
 * @extends MoveEffectAttr
 */
export class ForceLastAttr extends MoveEffectAttr {
  /**
   * Forces the target of this move to move last.
   *
   * @param user {@linkcode Pokemon} that is using the move.
   * @param target {@linkcode Pokemon} that will be forced to move last.
   * @param move {@linkcode Move} {@linkcode Moves.QUASH}
   * @param _args N/A
   * @returns true
   */
  override apply(user: Pokemon, target: Pokemon, _move: Move, _args: any[]): boolean {
    globalScene.queueMessage(i18next.t("moveTriggers:forceLast", { targetPokemonName: getPokemonNameWithAffix(target) }));

    const targetMovePhase = globalScene.findPhase<MovePhase>((phase) => phase.pokemon === target);
    if (targetMovePhase && !targetMovePhase.isForcedLast() && globalScene.tryRemovePhase((phase: MovePhase) => phase.pokemon === target)) {
      // Finding the phase to insert the move in front of -
      // Either the end of the turn or in front of another, slower move which has also been forced last
      const prependPhase = globalScene.findPhase((phase) =>
        [ MovePhase, MoveEndPhase ].every(cls => !(phase instanceof cls))
        || (phase instanceof MovePhase) && phaseForcedSlower(phase, target, !!globalScene.arena.getTag(ArenaTagType.TRICK_ROOM))
      );
      if (prependPhase) {
        globalScene.phaseQueue.splice(
          globalScene.phaseQueue.indexOf(prependPhase),
          0,
          new MovePhase(target, [ ...targetMovePhase.targets ], targetMovePhase.move, false, false, false, true)
        );
      }
    }
    return true;
  }
}

/** Returns whether a {@linkcode MovePhase} has been forced last and the corresponding pokemon is slower than {@linkcode target} */
const phaseForcedSlower = (phase: MovePhase, target: Pokemon, trickRoom: boolean): boolean => {
  let slower: boolean;
  // quashed pokemon still have speed ties
  if (phase.pokemon.getEffectiveStat(Stat.SPD) === target.getEffectiveStat(Stat.SPD)) {
    slower = !!target.randSeedInt(2);
  } else {
    slower = !trickRoom ? phase.pokemon.getEffectiveStat(Stat.SPD) < target.getEffectiveStat(Stat.SPD) : phase.pokemon.getEffectiveStat(Stat.SPD) > target.getEffectiveStat(Stat.SPD);
  }
  return phase.isForcedLast() && slower;
};

const failOnGravityCondition: MoveConditionFunc = (user, target, move) => !globalScene.arena.getTag(ArenaTagType.GRAVITY);

const failOnBossCondition: MoveConditionFunc = (user, target, move) => !target.isBossImmune();

const failIfSingleBattle: MoveConditionFunc = (user, target, move) => globalScene.currentBattle.double;

const failIfDampCondition: MoveConditionFunc = (user, target, move) => {
  const cancelled = new BooleanHolder(false);
  globalScene.getField(true).map(p=>applyAbAttrs(FieldPreventExplosiveMovesAbAttr, p, cancelled));
  // Queue a message if an ability prevented usage of the move
  if (cancelled.value) {
    globalScene.queueMessage(i18next.t("moveTriggers:cannotUseMove", { pokemonName: getPokemonNameWithAffix(user), moveName: move.name }));
  }
  return !cancelled.value;
};

const userSleptOrComatoseCondition: MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) =>  user.status?.effect === StatusEffect.SLEEP || user.hasAbility(Abilities.COMATOSE);

const targetSleptOrComatoseCondition: MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) =>  target.status?.effect === StatusEffect.SLEEP || target.hasAbility(Abilities.COMATOSE);

const failIfLastCondition: MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) => globalScene.phaseQueue.find(phase => phase instanceof MovePhase) !== undefined;

const failIfLastInPartyCondition: MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) => {
  const party: Pokemon[] = user.isPlayer() ? globalScene.getPlayerParty() : globalScene.getEnemyParty();
  return party.some(pokemon => pokemon.isActive() && !pokemon.isOnField());
};

const failIfGhostTypeCondition: MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) => !target.isOfType(PokemonType.GHOST);

const failIfNoTargetHeldItemsCondition: MoveConditionFunc = (user: Pokemon, target: Pokemon, move: Move) => target.getHeldItems().filter(i => i.isTransferable)?.length > 0;

const attackedByItemMessageFunc = (user: Pokemon, target: Pokemon, move: Move) => {
  const heldItems = target.getHeldItems().filter(i => i.isTransferable);
  if (heldItems.length === 0) {
    return "";
  }
  const itemName = heldItems[0]?.type?.name ?? "item";
  const message: string = i18next.t("moveTriggers:attackedByItem", { pokemonName: getPokemonNameWithAffix(target), itemName: itemName });
  return message;
};

export type MoveAttrFilter = (attr: MoveAttr) => boolean;

function applyMoveAttrsInternal(
  attrFilter: MoveAttrFilter,
  user: Pokemon | null,
  target: Pokemon | null,
  move: Move,
  args: any[],
): void {
  move.attrs.filter((attr) => attrFilter(attr)).forEach((attr) => attr.apply(user, target, move, args));
}

function applyMoveChargeAttrsInternal(
  attrFilter: MoveAttrFilter,
  user: Pokemon | null,
  target: Pokemon | null,
  move: ChargingMove,
  args: any[],
): void {
  move.chargeAttrs.filter((attr) => attrFilter(attr)).forEach((attr) => attr.apply(user, target, move, args));
}

export function applyMoveAttrs(
  attrType: Constructor<MoveAttr>,
  user: Pokemon | null,
  target: Pokemon | null,
  move: Move,
  ...args: any[]
): void {
  applyMoveAttrsInternal((attr: MoveAttr) => attr instanceof attrType, user, target, move, args);
}

export function applyFilteredMoveAttrs(
  attrFilter: MoveAttrFilter,
  user: Pokemon,
  target: Pokemon | null,
  move: Move,
  ...args: any[]
): void {
  applyMoveAttrsInternal(attrFilter, user, target, move, args);
}

export function applyMoveChargeAttrs(
  attrType: Constructor<MoveAttr>,
  user: Pokemon | null,
  target: Pokemon | null,
  move: ChargingMove,
  ...args: any[]
): void {
  applyMoveChargeAttrsInternal((attr: MoveAttr) => attr instanceof attrType, user, target, move, args);
}

export class MoveCondition {
  protected func: MoveConditionFunc;

  constructor(func: MoveConditionFunc) {
    this.func = func;
  }

  apply(user: Pokemon, target: Pokemon, move: Move): boolean {
    return this.func(user, target, move);
  }

  getUserBenefitScore(user: Pokemon, target: Pokemon, move: Move): number {
    return 0;
  }
}

/**
 * Condition to allow a move's use only on the first turn this Pokemon is sent into battle
 * (or the start of a new wave, whichever comes first).
 */

export class FirstMoveCondition extends MoveCondition {
  constructor() {
    super((user, _target, _move) => user.tempSummonData.waveTurnCount === 1);
  }

  getUserBenefitScore(user: Pokemon, _target: Pokemon, _move: Move): number {
    return this.apply(user, _target, _move) ? 10 : -20;
  }
}

/**
 * Condition used by the move {@link https://bulbapedia.bulbagarden.net/wiki/Upper_Hand_(move) | Upper Hand}.
 * Moves with this condition are only successful when the target has selected
 * a high-priority attack (after factoring in priority-boosting effects) and
 * hasn't moved yet this turn.
 */
export class UpperHandCondition extends MoveCondition {
  constructor() {
    super((user, target, move) => {
      const targetCommand = globalScene.currentBattle.turnCommands[target.getBattlerIndex()];

      return !!targetCommand
        && targetCommand.command === Command.FIGHT
        && !target.turnData.acted
        && !!targetCommand.move?.move
        && allMoves[targetCommand.move.move].category !== MoveCategory.STATUS
        && allMoves[targetCommand.move.move].getPriority(target) > 0;
    });
  }
}

export class hitsSameTypeAttr extends VariableMoveTypeMultiplierAttr {
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    const multiplier = args[0] as NumberHolder;
    if (!user.getTypes().some(type => target.getTypes().includes(type))) {
      multiplier.value = 0;
      return true;
    }
    return false;
  }
}

/**
 * Attribute used for Conversion 2, to convert the user's type to a random type that resists the target's last used move.
 * Fails if the user already has ALL types that resist the target's last used move.
 * Fails if the opponent has not used a move yet
 * Fails if the type is unknown or stellar
 *
 * TODO:
 * If a move has its type changed (e.g. {@linkcode Moves.HIDDEN_POWER}), it will check the new type.
 */
export class ResistLastMoveTypeAttr extends MoveEffectAttr {
  constructor() {
    super(true);
  }
  /**
   * User changes its type to a random type that resists the target's last used move
   * @param {Pokemon} user Pokemon that used the move and will change types
   * @param {Pokemon} target Opposing pokemon that recently used a move
   * @param {Move} move Move being used
   * @param {any[]} args Unused
   * @returns {boolean} true if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    const [ targetMove ] = target.getLastXMoves(1); // target's most recent move
    if (!targetMove) {
      return false;
    }

    const moveData = allMoves[targetMove.move];
    if (moveData.type === PokemonType.STELLAR || moveData.type === PokemonType.UNKNOWN) {
      return false;
    }
    const userTypes = user.getTypes();
    const validTypes = this.getTypeResistances(globalScene.gameMode, moveData.type).filter(t => !userTypes.includes(t)); // valid types are ones that are not already the user's types
    if (!validTypes.length) {
      return false;
    }
    const type = validTypes[user.randSeedInt(validTypes.length)];
    user.summonData.types = [ type ];
    globalScene.queueMessage(i18next.t("battle:transformedIntoType", { pokemonName: getPokemonNameWithAffix(user), type: toReadableString(PokemonType[type]) }));
    user.updateInfo();

    return true;
  }

  /**
   * Retrieve the types resisting a given type. Used by Conversion 2
   * @returns An array populated with Types, or an empty array if no resistances exist (Unknown or Stellar type)
   */
  getTypeResistances(gameMode: GameMode, type: number): PokemonType[] {
    const typeResistances: PokemonType[] = [];

    for (let i = 0; i < Object.keys(PokemonType).length; i++) {
      const multiplier = new NumberHolder(1);
      multiplier.value = getTypeDamageMultiplier(type, i);
      applyChallenges(ChallengeType.TYPE_EFFECTIVENESS, multiplier);
      if (multiplier.value < 1) {
        typeResistances.push(i);
      }
    }

    return typeResistances;
  }

  getCondition(): MoveConditionFunc {
    return (user, target, move) => {
      const moveHistory = target.getLastXMoves();
      return moveHistory.length !== 0;
    };
  }
}

/**
 * Drops the target's immunity to types it is immune to
 * and makes its evasiveness be ignored during accuracy
 * checks. Used by: {@linkcode Moves.ODOR_SLEUTH | Odor Sleuth}, {@linkcode Moves.MIRACLE_EYE | Miracle Eye} and {@linkcode Moves.FORESIGHT | Foresight}
 *
 * @extends AddBattlerTagAttr
 * @see {@linkcode apply}
 */
export class ExposedMoveAttr extends AddBattlerTagAttr {
  constructor(tagType: BattlerTagType) {
    super(tagType, false, true);
  }

  /**
   * Applies {@linkcode ExposedTag} to the target.
   * @param user {@linkcode Pokemon} using this move
   * @param target {@linkcode Pokemon} target of this move
   * @param move {@linkcode Move} being used
   * @param args N/A
   * @returns `true` if the function succeeds
   */
  apply(user: Pokemon, target: Pokemon, move: Move, args: any[]): boolean {
    if (!super.apply(user, target, move, args)) {
      return false;
    }

    globalScene.queueMessage(i18next.t("moveTriggers:exposedMove", { pokemonName: getPokemonNameWithAffix(user), targetPokemonName: getPokemonNameWithAffix(target) }));

    return true;
  }
}


const unknownTypeCondition: MoveConditionFunc = (user, target, move) => !user.getTypes().includes(PokemonType.UNKNOWN);

export type MoveTargetSet = {
  targets: BattlerIndex[];
  multiple: boolean;
};

export function getMoveTargets(user: Pokemon, move: Moves, replaceTarget?: MoveTarget): MoveTargetSet {
  const variableTarget = new NumberHolder(0);
  user.getOpponents(false).forEach(p => applyMoveAttrs(VariableTargetAttr, user, p, allMoves[move], variableTarget));

  let moveTarget: MoveTarget | undefined;
  if (allMoves[move].hasAttr(VariableTargetAttr)) {
    moveTarget = variableTarget.value;
  } else if (replaceTarget !== undefined) {
    moveTarget = replaceTarget;
  } else if (move) {
    moveTarget = allMoves[move].moveTarget;
  } else if (move === undefined) {
    moveTarget = MoveTarget.NEAR_ENEMY;
  }
  const opponents = user.getOpponents(false);

  let set: Pokemon[] = [];
  let multiple = false;
  const ally: Pokemon | undefined = user.getAlly();

  switch (moveTarget) {
    case MoveTarget.USER:
    case MoveTarget.PARTY:
      set = [ user ];
      break;
    case MoveTarget.NEAR_OTHER:
    case MoveTarget.OTHER:
    case MoveTarget.ALL_NEAR_OTHERS:
    case MoveTarget.ALL_OTHERS:
      set = !isNullOrUndefined(ally) ? (opponents.concat([ ally ])) : opponents;
      multiple = moveTarget === MoveTarget.ALL_NEAR_OTHERS || moveTarget === MoveTarget.ALL_OTHERS;
      break;
    case MoveTarget.NEAR_ENEMY:
    case MoveTarget.ALL_NEAR_ENEMIES:
    case MoveTarget.ALL_ENEMIES:
    case MoveTarget.ENEMY_SIDE:
      set = opponents;
      multiple = moveTarget !== MoveTarget.NEAR_ENEMY;
      break;
    case MoveTarget.RANDOM_NEAR_ENEMY:
      set = [ opponents[user.randSeedInt(opponents.length)] ];
      break;
    case MoveTarget.ATTACKER:
      return { targets: [ -1 as BattlerIndex ], multiple: false };
    case MoveTarget.NEAR_ALLY:
    case MoveTarget.ALLY:
      set = !isNullOrUndefined(ally) ? [ ally ] : [];
      break;
    case MoveTarget.USER_OR_NEAR_ALLY:
    case MoveTarget.USER_AND_ALLIES:
    case MoveTarget.USER_SIDE:
      set = !isNullOrUndefined(ally) ? [ user, ally ] : [ user ];
      multiple = moveTarget !== MoveTarget.USER_OR_NEAR_ALLY;
      break;
    case MoveTarget.ALL:
    case MoveTarget.BOTH_SIDES:
      set = (!isNullOrUndefined(ally) ? [ user, ally ] : [ user ]).concat(opponents);
      multiple = true;
      break;
    case MoveTarget.CURSE:
      const extraTargets = !isNullOrUndefined(ally) ? [ ally ] : [];
      set = user.getTypes(true).includes(PokemonType.GHOST) ? (opponents.concat(extraTargets)) : [ user ];
      break;
  }

  return { targets: set.filter(p => p?.isActive(true)).map(p => p.getBattlerIndex()).filter(t => t !== undefined), multiple };
}

export const allMoves: Move[] = [
  new SelfStatusMove(Moves.NONE, PokemonType.NORMAL, MoveCategory.STATUS, -1, -1, 0, 1),
];

export const selfStatLowerMoves: Moves[] = [];

export function initMoves() {
  allMoves.push(
new AttackMove(Moves.ARK_01, PokemonType.A_NEUTRALIZE, MoveCategory.SPECIAL, 40, 100, 25, -1, 0, 1),
new AttackMove(Moves.ARK_02, PokemonType.A_NEUTRALIZE, MoveCategory.SPECIAL, 60, 100, 20, -1, 0, 1),
new AttackMove(Moves.ARK_03, PokemonType.A_NEUTRALIZE, MoveCategory.SPECIAL, 70, 100, 15, -1, 0, 1)
     .target(MoveTarget.ALL_NEAR_ENEMIES),
new AttackMove(Moves.ARK_04, PokemonType.A_NEUTRALIZE, MoveCategory.SPECIAL, 75, 100, 20, -1, 0, 1),
  
  new AttackMove(Moves.ARK_05, PokemonType.A_NEUTRALIZE, MoveCategory.SPECIAL, 100, 100, 10, -1, 0, 1)
       .attr(EmberAttr)
      .attr(FormChangeItemTypeAttr),

new AttackMove(Moves.ARK_06,PokemonType.A_NEUTRALIZE, MoveCategory.SPECIAL, 30, 100, 10, -1, 0, 1)
      .attr(FrenzyAttr)
      .attr(MissEffectAttr, frenzyMissFunc)
      .attr(NoEffectAttr, frenzyMissFunc)
      .target(MoveTarget.RANDOM_NEAR_ENEMY)
      .attr(MultiHitAttr),
new SelfStatusMove(Moves.ARK_07, PokemonType.A_NEUTRALIZE, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [ Stat.SPD ], 1, true),
new SelfStatusMove(Moves.ARK_08, PokemonType.A_NEUTRALIZE, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.SPD], 2, true),

new StatusMove(Moves.ARK_09, PokemonType.A_NEUTRALIZE, 55, 30, -1, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.SLEEP)
      .soundBased()
      .reflectable(),

new StatusMove(Moves.ARK_10, PokemonType.A_NEUTRALIZE, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [ Stat.ATK ], 2, false)
      .target(MoveTarget.NEAR_ALLY)
      .condition(failIfSingleBattle),
    new StatusMove(Moves.ARK_11, PokemonType.A_NEUTRALIZE, 55, 20, -1, 0, 1)
      .attr(ConfuseAttr)
      .soundBased()
      .reflectable(),

new AttackMove(Moves.ARK_12,PokemonType.A_HEALING, MoveCategory.SPECIAL, -60, 100, 25, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove(),
new AttackMove(Moves.ARK_13,PokemonType.A_HEALING, MoveCategory.PHYSICAL, -60, 100, 25, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove(),
new AttackMove(Moves.ARK_14,PokemonType.A_HEALING, MoveCategory.PHYSICAL, -150, 100, 25, -1, 1, 1)
 .target(MoveTarget.USER_AND_ALLIES)
   .triageMove(),
new AttackMove(Moves.ARK_15,PokemonType.A_HEALING, MoveCategory.SPECIAL, -180, 100, 25, -1, -1, 1)
 .target(MoveTarget.USER_AND_ALLIES)
   .triageMove(),
new SelfStatusMove(Moves.ARK_16, PokemonType.A_HEALING, -1, 15, -1, 0, 1)
.attr(AddBattlerTagAttr, BattlerTagType.AQUA_RING, true, true)
.target(MoveTarget.USER_AND_ALLIES)
   .triageMove(),
new SelfStatusMove(Moves.ARK_17, PokemonType.A_HEALING, -1, 15, -1, 0, 1)
.attr(AddBattlerTagAttr, BattlerTagType.AQUA_RING, true, true)
   .attr(HealAttr, 0.3)
   .triageMove(),
new SelfStatusMove(Moves.ARK_18, PokemonType.A_HEALING, -1, 5, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.ATK], 2)
 .target(MoveTarget.USER_AND_ALLIES)
  .attr(StatusEffectAttr, StatusEffect.TOXIC),
new SelfStatusMove(Moves.ARK_19, PokemonType.A_HEALING, -1, 15, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
  .attr(StatStageChangeAttr, [Stat.DEF], 2, true),
new SelfStatusMove(Moves.ARK_20, PokemonType.A_HEALING, -1, 15, -1, 0, 1)
      .attr(AddArenaTagAttr, ArenaTagType.REFLECT, 5, true)
      .target(MoveTarget.USER_SIDE),
new SelfStatusMove(Moves.ARK_21, PokemonType.A_HEALING, -1, 30, -1, 3, 1)
  .attr(StatStageChangeAttr, [Stat.SPDEF], 2, true)
 .target(MoveTarget.USER_OR_NEAR_ALLY),
new SelfStatusMove(Moves.ARK_22, PokemonType.A_HEALING, -1, 15, -1, 0, 1)
      .attr(AddArenaTagAttr, ArenaTagType.LIGHT_SCREEN, 5, true)
      .target(MoveTarget.USER_SIDE),
new AttackMove(Moves.ARK_23, PokemonType.SHOTGUN, MoveCategory.PHYSICAL, 40, 100, 35, -1, 0, 1),
new AttackMove(Moves.ARK_24, PokemonType.A_WATER, MoveCategory.SPECIAL, 40, 100, 35, -1, 0, 1),
new SelfStatusMove(Moves.ARK_25, PokemonType.A_WATER, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.EVA], 1)
.target(MoveTarget.USER_AND_ALLIES),
new AttackMove(Moves.ARK_26, PokemonType.FIST, MoveCategory.PHYSICAL, 30, 100, 15,100, 0, 1)
      .attr(StatStageChangeAttr, [ Stat.DEF ], -1),
new AttackMove(Moves.ARK_27, PokemonType.FIST, MoveCategory.PHYSICAL, 40, 100, 35, -1, 0, 1),
new AttackMove(Moves.ARK_28, PokemonType.FIST, MoveCategory.PHYSICAL, 60, 90, 10, -1, -6, 1)
      .attr(ForceSwitchOutAttr, false, SwitchType.FORCE_SWITCH)
      .hidesTarget(),
new AttackMove(Moves.ARK_29, PokemonType.FIST, MoveCategory.SPECIAL, 40, 100, 35, -1, 0, 1),
new AttackMove(Moves.ARK_30, PokemonType.FIST, MoveCategory.SPECIAL, 50, 100, 35, -1, 0, 1)
      .attr(HitHealAttr, 0.75)
      .makesContact()
      .triageMove(),
new AttackMove(Moves.ARK_31, PokemonType.FIST, MoveCategory.SPECIAL, 60, 100, 35, 50, 0, 1)
      .attr(StatStageChangeAttr, [ Stat.ATK ], -1)
            .makesContact(),
new AttackMove(Moves.ARK_32, PokemonType.FIST, MoveCategory.PHYSICAL, 120, 100, 15, -1, 0, 1)
      .attr(RecoilAttr, false, 0.33)
      .recklessMove(),
    new AttackMove(Moves.ARK_33, PokemonType.A_EXPLOSION, MoveCategory.SPECIAL, 200, 100, 5, -1, 0,1)
      .attr(SacrificialAttr)
      .target(MoveTarget.ALL_NEAR_OTHERS)
      .condition(failIfDampCondition)
      .makesContact(false),
new SelfStatusMove(Moves.ARK_34, PokemonType.FIST, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.SPATK, Stat.SPDEF], 1, true),
new SelfStatusMove(Moves.ARK_35, PokemonType.FIST, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.EVA], 2, true)
 .target(MoveTarget.USER_OR_NEAR_ALLY),
new AttackMove(Moves.ARK_36, PokemonType.LANCE, MoveCategory.PHYSICAL, 40, 100, 35, -1,0, 1),
new AttackMove(Moves.ARK_37, PokemonType.LANCE, MoveCategory.PHYSICAL, 60, 100, 25, 10, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.FREEZE),
new AttackMove(Moves.ARK_38, PokemonType.LANCE, MoveCategory.PHYSICAL, 90, 100, 15, 10, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.FREEZE),
new AttackMove(Moves.ARK_39, PokemonType.LANCE, MoveCategory.PHYSICAL, 100, 100, 35, -1, -1, 1),
    new StatusMove(Moves.ARK_40, PokemonType.LANCE, 100, 20, -1, 0, 1)
       .attr(StatStageChangeAttr, [Stat.DEF], 1)
.target(MoveTarget.USER_AND_ALLIES),
    new StatusMove(Moves.ARK_41, PokemonType.LANCE, 100, 20, -1, 0, 1)
       .attr(StatStageChangeAttr, [Stat.ATK], 1)
.target(MoveTarget.USER_AND_ALLIES),
new AttackMove(Moves.ARK_42, PokemonType.CANNON, MoveCategory.PHYSICAL, 40, 100, 25, 30, 0, 1)
	.attr(StatStageChangeAttr, [ Stat.DEF ], -1)
      .target(MoveTarget.ALL_NEAR_ENEMIES)
      .makesContact(false),
new AttackMove(Moves.ARK_43, PokemonType.CANNON, MoveCategory.PHYSICAL, 40, 100, 35, -1, 0, 1)
      .makesContact(false),
new AttackMove(Moves.ARK_44, PokemonType.CANNON, MoveCategory.PHYSICAL, 100, 100, 10, -1, 0, 1)
 .target(MoveTarget.ALL_NEAR_OTHERS)
      .makesContact(false),
    new AttackMove(Moves.ARK_45, PokemonType.CROSSBOW, MoveCategory.PHYSICAL, 25, 100, 25, -1, 0, 1)
      .attr(MultiHitAttr, MultiHitType._2)
.makesContact(false),
    new AttackMove(Moves.ARK_46, PokemonType.CROSSBOW, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1)
.makesContact(false),
    new AttackMove(Moves.ARK_47, PokemonType.CROSSBOW, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1)
      .attr(MultiHitAttr, MultiHitType._2)
.makesContact(false),
    new AttackMove(Moves.ARK_48, PokemonType.CROSSBOW, MoveCategory.PHYSICAL, 40, 100, 15, -1, 0, 1)
      .attr(MultiHitAttr, MultiHitType._2)
.attr(StatStageChangeAttr, [ Stat.EVA ], 1)
.makesContact(false),
    new AttackMove(Moves.ARK_49, PokemonType.CROSSBOW, MoveCategory.PHYSICAL, -1, 100, 5, -1, 0, 1)
      .attr(OpponentHighHpPowerAttr, 90)
.makesContact(false),
    new AttackMove(Moves.ARK_50, PokemonType.CROSSBOW, MoveCategory.PHYSICAL, -1, 90, 10, -1, 0, 1)
      .attr(TargetHalfHpDamageAttr)
.makesContact(false),

new AttackMove(Moves.ARK_51,PokemonType.A_FROZEN, MoveCategory.SPECIAL, 25, 100, 10, -1, 0, 2)
      .target(MoveTarget.RANDOM_NEAR_ENEMY)
      .attr(MultiHitAttr),
   new AttackMove(Moves.ARK_52, PokemonType.A_FROZEN, MoveCategory.SPECIAL, 40, 100, 25, 10, 0, 1)
 .attr(FlinchAttr),
   new AttackMove(Moves.ARK_53, PokemonType.A_FROZEN, MoveCategory.SPECIAL, 60, 100, 25, 20, 0, 1)
 .attr(FlinchAttr)
 .target(MoveTarget.ALL_NEAR_ENEMIES),
   new AttackMove(Moves.ARK_54, PokemonType.A_FROZEN, MoveCategory.SPECIAL, 80, 100, 25, 30, 0, 1)
 .attr(FlinchAttr)
 .target(MoveTarget.ALL_NEAR_ENEMIES),
new SelfStatusMove(Moves.ARK_55, PokemonType.A_FROZEN, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.SPATK], 2, true),
   new AttackMove(Moves.ARK_56, PokemonType.CHAINSAW, MoveCategory.PHYSICAL, 40, 100, 25, 10, 0, 1)
 .target(MoveTarget.ALL_ENEMIES),
    new SelfStatusMove(Moves.ARK_57, PokemonType.CHAINSAW, -1, 10, -1, 0, 2)
      .attr(ProtectAttr, BattlerTagType.ENDURING)
      .condition(failIfLastCondition),

    new SelfStatusMove(Moves.ARK_58, PokemonType.CHAINSAW, -1, 5, -1, 0, 2)
      .ignoresProtect()
      .attr(DestinyBondAttr)
      .condition((user, target, move) => {
        // Retrieves user's previous move, returns empty array if no moves have been used
        const lastTurnMove = user.getLastXMoves(1);
        // Checks last move and allows destiny bond to be used if:
        // - no previous moves have been made
        // - the previous move used was not destiny bond
        // - the previous move was unsuccessful
        return lastTurnMove.length === 0 || lastTurnMove[0].move !== move.id || lastTurnMove[0].result !== MoveResult.SUCCESS;
      }),


   new AttackMove(Moves.ARK_59, PokemonType.SCYTHE, MoveCategory.PHYSICAL, 40, 100, 25, 10, 0, 1)
      .attr(HitHealAttr, 0.5)
      .triageMove(),
   new AttackMove(Moves.ARK_60, PokemonType.A_LIGHTNING, MoveCategory.SPECIAL, 40, 100, 25, 10, 0, 1),
    new AttackMove(Moves.ARK_61, PokemonType.SWORD, MoveCategory.PHYSICAL, 20, 100, 35, -1, 0, 1)
      .attr(MultiHitAttr, MultiHitType._2),
    new AttackMove(Moves.ARK_62, PokemonType.SWORD, MoveCategory.PHYSICAL, 40, 100, 35, -1, 0, 1),
new AttackMove(Moves.ARK_63, PokemonType.SWORD, MoveCategory.PHYSICAL, 40, 100, 10, 100, 3, 1)
      .attr(FlinchAttr)
      .condition(new FirstMoveCondition()),


    new AttackMove(Moves.ARK_64, PokemonType.SWORD, MoveCategory.PHYSICAL, 40, 100, 15, -1, 0, 1)
.attr(CritOnlyAttr),
    new AttackMove(Moves.ARK_65, PokemonType.SWORD, MoveCategory.PHYSICAL, 60, 100, 25, -1, 0, 1),
    new AttackMove(Moves.ARK_66, PokemonType.SWORD, MoveCategory.SPECIAL, 80, 100, 15, -1, 0, 1)
 .makesContact()
 .target(MoveTarget.ALL_NEAR_ENEMIES),
    new AttackMove(Moves.ARK_67, PokemonType.SWORD, MoveCategory.PHYSICAL, 75, 100, 15, -1, 0, 1),
new AttackMove(Moves.ARK_68, PokemonType.SWORD, MoveCategory.PHYSICAL, 100, 100, 5, -1, 0, 1)
   .attr(StatStageChangeAttr, [ Stat.DEF, Stat.SPDEF ], -1, true)
 .target(MoveTarget.ALL_NEAR_ENEMIES),
new AttackMove(Moves.ARK_69, PokemonType.SWORD, MoveCategory.PHYSICAL, 120, 90, 5, -1, 0, 1)
   .attr(StatStageChangeAttr, [ Stat.DEF ], -2, true),
new SelfStatusMove(Moves.ARK_70, PokemonType.SWORD, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.ATK], 1, true),
new SelfStatusMove(Moves.ARK_71, PokemonType.SWORD, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.ATK, Stat.EVA], 1, true),
new SelfStatusMove(Moves.ARK_72, PokemonType.SWORD, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.ATK, Stat.SPD], 1, true)
 .target(MoveTarget.USER_OR_NEAR_ALLY),
new SelfStatusMove(Moves.ARK_73, PokemonType.SWORD, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.DEF], 1, true)
        .attr(HealAttr, 0.25)
      .triageMove(),
new AttackMove(Moves.ARK_74, PokemonType.A_FIRE, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1)
	.attr(StatStageChangeAttr, [ Stat.DEF ], -1)
 .makesContact(false),
new AttackMove(Moves.ARK_75, PokemonType.A_FIRE, MoveCategory.SPECIAL, 40, 100, 25, 10, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.BURN),
new AttackMove(Moves.ARK_76, PokemonType.A_FIRE, MoveCategory.SPECIAL, 100, 100, 15,-1, 0, 1)
 .target(MoveTarget.ALL_NEAR_ENEMIES)
       .attr(LoseHpNoSubstituteAttr, 0.25,false)
      .recklessMove(),
new AttackMove(Moves.ARK_77, PokemonType.A_FIRE, MoveCategory.SPECIAL, 120, 100, 10,-1, 0, 1)
 .target(MoveTarget.ALL_NEAR_ENEMIES)
      .attr(FrenzyAttr)
      .attr(MissEffectAttr, frenzyMissFunc)
      .attr(NoEffectAttr, frenzyMissFunc)
      .target(MoveTarget.RANDOM_NEAR_ENEMY),
    new AttackMove(Moves.ARK_78, PokemonType.A_FIRE, MoveCategory.SPECIAL, 150, 90, 5, -1, 0, 1)
      .attr(RechargeAttr),
new SelfStatusMove(Moves.ARK_79, PokemonType.A_FIRE, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.SPATK, Stat.SPD], 1, true),
new SelfStatusMove(Moves.ARK_80, PokemonType.A_FIRE, -1, 30, -1, 3, 1)
  .attr(StatStageChangeAttr, [Stat.SPDEF], -2 )
 .target(MoveTarget.OTHER),
    new AttackMove(Moves.ARK_81, PokemonType.BOOMERANG, MoveCategory.SPECIAL, 30, 100, 15, -1, 0, 1)
       .target(MoveTarget.ALL_NEAR_ENEMIES)
.attr(StatStageChangeAttr, [ Stat.SPD ], -1),
    new AttackMove(Moves.ARK_82, PokemonType.BOOMERANG, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1)
 .makesContact(false),
    new AttackMove(Moves.ARK_83, PokemonType.BOW, MoveCategory.PHYSICAL, 30, 100, 15, -1, 0, 1)
.attr(StatStageChangeAttr, [ Stat.DEF ], -1)
 .makesContact(false),
    new AttackMove(Moves.ARK_84, PokemonType.BOW, MoveCategory.PHYSICAL, 40, 90, 15, -1, 0, 1)
.attr(StatStageChangeAttr, [ Stat.DEF ], -1)
 .target(MoveTarget.ALL_NEAR_ENEMIES)
 .makesContact(false),
    new AttackMove(Moves.ARK_85, PokemonType.BOW, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1)
 .makesContact(false),
    new AttackMove(Moves.ARK_86, PokemonType.BOW, MoveCategory.PHYSICAL, 60, 100, 15, -1, 0, 1)
 .makesContact(false),
    new AttackMove(Moves.ARK_87, PokemonType.BOW, MoveCategory.PHYSICAL, 90, 100, 15, -1, 0, 1)
 .makesContact(false),
new SelfStatusMove(Moves.ARK_88, PokemonType.BOW, -1, 30, -1, 3, 1)
  .attr(StatStageChangeAttr, [Stat.ATK], 2, true)
  .attr(StatStageChangeAttr, [Stat.SPD], -1, true),
    new AttackMove(Moves.ARK_89, PokemonType.AXE, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1),
    new AttackMove(Moves.ARK_90, PokemonType.AXE, MoveCategory.PHYSICAL, 60, 100, 25, -1, 0, 1),
 new AttackMove(Moves.ARK_91, PokemonType.AXE, MoveCategory.PHYSICAL, 80, 100, 15, 30, 0, 1)
 .attr(FlinchAttr),
    new StatusMove(Moves.ARK_92, PokemonType.AXE, 100, 15, -1, 0, 1)
       .attr(StatStageChangeAttr, [Stat.ATK, Stat.DEF], 1)
.target(MoveTarget.USER_AND_ALLIES),
    new StatusMove(Moves.ARK_93, PokemonType.AXE, -1, 20, -1, -6, 1)
      .attr(ForceSwitchOutAttr, false, SwitchType.FORCE_SWITCH)
      .ignoresSubstitute()
      .hidesTarget(),
new SelfStatusMove(Moves.ARK_94, PokemonType.AXE, -1, 5, -1, 0, 1)
        .attr(HealAttr, 0.25)
      .triageMove()
.attr(ResetStatsAttr, true),
 new AttackMove(Moves.ARK_95, PokemonType.A_WIND, MoveCategory.SPECIAL, 60, 100, 15, -1, 0, 1)
 .target(MoveTarget.ALL_NEAR_ENEMIES)
.attr(StatStageChangeAttr, [ Stat.SPD ], -1)
 .attr(FlinchAttr),
 new AttackMove(Moves.ARK_96, PokemonType.A_WIND, MoveCategory.SPECIAL, 40, 100, 35, -1, 0, 1),
new SelfStatusMove(Moves.ARK_97, PokemonType.A_WIND, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.EVA], 2, true),
    new AttackMove(Moves.ARK_98, PokemonType.A_WIND, MoveCategory.SPECIAL, 35, 85, 15, -1, 0, 1)
      .attr(TrapAttr, BattlerTagType.SAND_TOMB)
      .makesContact(false),
 new AttackMove(Moves.ARK_99, PokemonType.SHIELD, MoveCategory.PHYSICAL, 40, 100, 35, -1,0, 1),
 new AttackMove(Moves.ARK_100, PokemonType.SHIELD, MoveCategory.PHYSICAL, -60, 100, 25, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove(),
 new AttackMove(Moves.ARK_101, PokemonType.SHIELD, MoveCategory.PHYSICAL, -60, 100, 15, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove()
.attr(StatStageChangeAttr, [ Stat.DEF ], 1),
 new AttackMove(Moves.ARK_102, PokemonType.SHIELD, MoveCategory.PHYSICAL, -80, 100, 25, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove(),
 new AttackMove(Moves.ARK_103, PokemonType.SHIELD, MoveCategory.PHYSICAL, 80, 100, 35, -1, 0, 1)
      .attr(DefAtkAttr),
    new SelfStatusMove(Moves.ARK_104, PokemonType.SHIELD, -1, 10, -1, 0, 1)
      .attr(HealAttr, 0.25)
      .triageMove(),
new SelfStatusMove(Moves.ARK_105, PokemonType.SHIELD, 100, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.DEF], 1, true),
    new SelfStatusMove(Moves.ARK_106, PokemonType.SHIELD, -1, 5, -1, 0, 1)
      .attr(HealAttr, 0.5)
      .triageMove(),
new SelfStatusMove(Moves.ARK_107, PokemonType.SHIELD, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.SPDEF], 2, true),
new SelfStatusMove(Moves.ARK_108, PokemonType.SHIELD, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.DEF], 2, true),
new SelfStatusMove(Moves.ARK_109, PokemonType.SHIELD, -1, 10, -1, 4, 1)
      .attr(ProtectAttr)
      .condition(failIfLastCondition),
new SelfStatusMove(Moves.ARK_110, PokemonType.SHIELD, -1, 30, -1, 3, 1)
  .attr(StatStageChangeAttr, [Stat.ATK, Stat.DEF], 1, true),
new SelfStatusMove(Moves.ARK_111, PokemonType.SHIELD, -1, 10, -1, 4, 1)
      .attr(ProtectAttr, BattlerTagType.SPIKY_SHIELD)
      .condition(failIfLastCondition),
new SelfStatusMove(Moves.ARK_112, PokemonType.SHIELD, -1, 10, -1, 5, 1)
  .attr(StatStageChangeAttr, [Stat.SPATK], 2, true),
 new AttackMove(Moves.ARK_113, PokemonType.DAGGER, MoveCategory.PHYSICAL, 40, 100, 35, -1, 0, 1),
new AttackMove(Moves.ARK_114, PokemonType.DAGGER, MoveCategory.PHYSICAL, 40, 100, 10, 100, 3, 1)
      .attr(FlinchAttr)
      .condition(new FirstMoveCondition()),
    new AttackMove(Moves.ARK_115, PokemonType.DAGGER, MoveCategory.PHYSICAL, 60, 100, 20, -1, 0, 1)
      .attr(ForceSwitchOutAttr, true),

    new AttackMove(Moves.ARK_116, PokemonType.DAGGER, MoveCategory.PHYSICAL, 70, 100, 5, -1, 1, 1)
      .condition((user, target, move) => {
        const turnCommand = globalScene.currentBattle.turnCommands[target.getBattlerIndex()];
        if (!turnCommand || !turnCommand.move) {
          return false;
        }
        return (turnCommand.command === Command.FIGHT && !target.turnData.acted && allMoves[turnCommand.move.move].category !== MoveCategory.STATUS);
      }),
    new StatusMove(Moves.ARK_117, PokemonType.A_DAGGER, 100, 20, -1, 0, 1)
       .attr(StatStageChangeAttr, [Stat.SPD,Stat.EVA], 1, true),
    new AttackMove(Moves.ARK_118, PokemonType.A_POISON, MoveCategory.SPECIAL, 40, 100, 25, -1, 0, 1),
    new AttackMove(Moves.ARK_119, PokemonType.A_POISON, MoveCategory.SPECIAL, 60, 100, 25, 10, 0, 1)
 .target(MoveTarget.ALL_NEAR_ENEMIES)
    .attr(StatusEffectAttr, StatusEffect.POISON),
    new StatusMove(Moves.ARK_120, PokemonType.A_POISON, 100, 20, -1, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.POISON)
      .attr(StatStageChangeAttr, [ Stat.SPD ], -1)
      .reflectable(),
    new AttackMove(Moves.ARK_121, PokemonType.A_POISON, MoveCategory.PHYSICAL, 90, 100, 15, 10, 0, 1)
    .attr(StatusEffectAttr, StatusEffect.POISON),
    new StatusMove(Moves.ARK_122, PokemonType.A_POISON, -1, 20, -1, 0, 4)
      .attr(AddArenaTrapTagAttr, ArenaTagType.TOXIC_SPIKES)
      .target(MoveTarget.ENEMY_SIDE)
      .reflectable(),
new SelfStatusMove(Moves.ARK_123, PokemonType.A_POISON, -1, 10, -1, 4, 1)
      .attr(ProtectAttr, BattlerTagType.SPIKY_SHIELD)
      .condition(failIfLastCondition),
  new AttackMove(Moves.ARK_124, PokemonType.HAMMER, MoveCategory.PHYSICAL, 40, 80, 15, -1,  -6,1)
      .attr(ForceSwitchOutAttr, false, SwitchType.FORCE_SWITCH)
      .hidesTarget(),
  new AttackMove(Moves.ARK_125, PokemonType.HAMMER, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1),
    new AttackMove(Moves.ARK_126, PokemonType.HAMMER, MoveCategory.PHYSICAL, 75, 100, 15, -1, -1, 1)
      .attr(HitHealAttr, 0.75)
      .triageMove(),
    new AttackMove(Moves.ARK_127, PokemonType.HAMMER, MoveCategory.PHYSICAL, 60, 100, 15, -1, 0, 1)
 .target(MoveTarget.ALL_NEAR_ENEMIES),
    new AttackMove(Moves.ARK_128, PokemonType.HAMMER, MoveCategory.PHYSICAL, 110, 70, 10, -1, -1, 1),
new AttackMove(Moves.ARK_129,PokemonType.MUSKET, MoveCategory.PHYSICAL, 20, 100, 10, -1, 0, 1)
      .attr(FrenzyAttr)
      .attr(MissEffectAttr, frenzyMissFunc)
      .attr(NoEffectAttr, frenzyMissFunc)
       .attr(MultiHitAttr, MultiHitType._5)
 .makesContact(false),
new AttackMove(Moves.ARK_130,PokemonType.MUSKET, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1)
      .target(MoveTarget.RANDOM_NEAR_ENEMY)
      .attr(MultiHitAttr)
 .makesContact(false),
new AttackMove(Moves.ARK_131,PokemonType.MUSKET, MoveCategory.PHYSICAL, 25, 100, 15, -1, 0, 1)
 .makesContact(false),
new SelfStatusMove(Moves.ARK_132, PokemonType.MUSKET, -1, 30, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.ATK, Stat.SPD], 1, true),
new AttackMove(Moves.ARK_133,PokemonType.A_ICE, MoveCategory.SPECIAL, 40, 100, 25, -1, 0, 1),
new SelfStatusMove(Moves.ARK_134, PokemonType.A_ICE, -1, 15, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.DEF, Stat.SPDEF], -1)
 .target(MoveTarget.ALL_ENEMIES),
new AttackMove(Moves.ARK_135,PokemonType.WHIP, MoveCategory.PHYSICAL, 40, 100, 25, -1, 0, 1),
    new StatusMove(Moves.ARK_136, PokemonType.WHIP, -1, 10, -1, 0, 8)
      .attr(StatStageChangeAttr, [ Stat.ATK, Stat.DEF ], 1)
      .target(MoveTarget.NEAR_ALLY)
      .condition(failIfSingleBattle),
new AttackMove(Moves.ARK_137, PokemonType.WHIP, MoveCategory.PHYSICAL, 40, 80, 15, -1, -6, 1)
      .attr(ForceSwitchOutAttr, false, SwitchType.FORCE_SWITCH)
      .hidesTarget(),
new AttackMove(Moves.ARK_138, PokemonType.WHIP, MoveCategory.PHYSICAL, 20, 60, 10, -1, -6, 1)
      .attr(ForceSwitchOutAttr, false, SwitchType.FORCE_SWITCH)
      .hidesTarget()
 .target(MoveTarget.ALL_NEAR_ENEMIES),
    new SelfStatusMove(Moves.ARK_139, PokemonType.WHIP, -1, 10, -1, 0, 1)
      .attr(AddSubstituteAttr, 0.25, false),
new AttackMove(Moves.ARK_140,PokemonType.A_EXPLOSION, MoveCategory.SPECIAL, 40, 100, 25, -1, 0, 1),

 new AttackMove(Moves.ARK_141, PokemonType.A_EXPLOSION, MoveCategory.PHYSICAL, 120, 100, 10, -1, 0, 1)
      .partial() // cannot be used on multiple Pokemon on the same side in a double battle, hits immediately when called by Metronome/etc, should not apply abilities or held items if user is off the field
      .ignoresProtect()
      .attr(DelayedAttackAttr, ArenaTagType.FUTURE_SIGHT, ChargeAnim.FUTURE_SIGHT_CHARGING, i18next.t("moveTriggers:foresawAnAttack", { pokemonName: "{USER}" })),
new AttackMove(Moves.ARK_142,PokemonType.A_DARK, MoveCategory.SPECIAL, 40, 100, 25, -1, 0, 1),
new AttackMove(Moves.ARK_143,PokemonType.A_DARK, MoveCategory.SPECIAL, 90, 100, 25, -1, 1, 1)
 .attr(LoseHpNoSubstituteAttr, 0.25, false),
    new StatusMove(Moves.ARK_144, PokemonType.A_NEUTRALIZE, 100, 30, -1, 0, 1)
      .attr(StatStageChangeAttr, [ Stat.DEF ], -1)
      .target(MoveTarget.ALL_NEAR_ENEMIES)
      .reflectable(),
    new StatusMove(Moves.ARK_145, PokemonType.A_NEUTRALIZE, 100, 30, -1, 0, 1)
      .attr(StatStageChangeAttr, [ Stat.DEF ], -1)
      .target(MoveTarget.ALL_NEAR_ENEMIES)
      .reflectable(),
    new StatusMove(Moves.ARK_146, PokemonType.A_NEUTRALIZE, 100, 40, -1, 0, 1)
      .attr(StatStageChangeAttr, [ Stat.ATK ], -1)
      .soundBased()
      .target(MoveTarget.ALL_NEAR_ENEMIES)
      .reflectable(),
    new StatusMove(Moves.ARK_147, PokemonType.A_NEUTRALIZE, 85, 40, -1, 0, 1)
      .attr(StatStageChangeAttr, [ Stat.DEF ], -2)
      .soundBased()
      .reflectable(),
    new StatusMove(Moves.ARK_148, PokemonType.A_NEUTRALIZE, 100, 30, -1, 0, 1)
      .attr(AddBattlerTagAttr, BattlerTagType.CRIT_BOOST, true, true),
    new StatusMove(Moves.ARK_149, PokemonType.A_NEUTRALIZE, 100, 30, -1, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.PARALYSIS)
      .reflectable(),
    new StatusMove(Moves.ARK_150, PokemonType.A_NEUTRALIZE, 75, 10, -1, 0, 1)
      .attr(StatusEffectAttr, StatusEffect.SLEEP)
      .reflectable(),
    new AttackMove(Moves.ARK_151, PokemonType.FIST, MoveCategory.PHYSICAL, 50, -1, 1, -1, 0, 1)
      .attr(RecoilAttr, true, 0.25, true)
      .attr(TypelessAttr)
      .target(MoveTarget.RANDOM_NEAR_ENEMY),
    new SelfStatusMove(Moves.ARK_152, PokemonType.SHIELD, -1, 20, -1, 0, 3)
      .attr(AddBattlerTagAttr, BattlerTagType.INGRAIN, true, true)
      .attr(AddBattlerTagAttr, BattlerTagType.IGNORE_FLYING, true, true)
      .attr(RemoveBattlerTagAttr, [ BattlerTagType.FLOATING ], true),
    new StatusMove(Moves.ARK_153, PokemonType.A_NEUTRALIZE, 100, 5, -1, 0, 2)
      .attr(AddBattlerTagAttr, BattlerTagType.ENCORE, false, true)
      .ignoresSubstitute()
      .condition((user, target, move) => new EncoreTag(user.id).canAdd(target))
      .reflectable(),
    new StatusMove(Moves.ARK_154, PokemonType.A_EXPLOSION, -1, 20, -1, 0, 4)
      .attr(AddArenaTrapTagAttr, ArenaTagType.STEALTH_ROCK)
      .target(MoveTarget.ENEMY_SIDE)
      .reflectable(),

new AttackMove(Moves.ARK_155, PokemonType.CHAINSAW, MoveCategory.PHYSICAL, 100, 100, 10, -1, 0, 1),

new AttackMove(Moves.ARK_156, PokemonType.A_HEALING, MoveCategory.SPECIAL,-30, 100, 15, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
.attr(MultiHitAttr, MultiHitType._2)
   .triageMove(),
new AttackMove(Moves.ARK_157, PokemonType.A_HEALING, MoveCategory.PHYSICAL, -80, 100, 15, -1, 0, 1)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove(),
new SelfStatusMove(Moves.ARK_158, PokemonType.CHAINSAW, -1, 15, -1, 0, 1)
  .attr(StatStageChangeAttr, [Stat.HP], 1, true),
new SelfStatusMove(Moves.ARK_159, PokemonType.A_HEALING, -1, 15, -1, 0, 1)
   .attr(HealAttr, 0.3)
 .target(MoveTarget.USER_OR_NEAR_ALLY)
   .triageMove(),

  );
  allMoves.map(m => {
    if (m.getAttrs(StatStageChangeAttr).some(a => a.selfTarget && a.stages < 0)) {
      selfStatLowerMoves.push(m.id);
    }
  });
}
