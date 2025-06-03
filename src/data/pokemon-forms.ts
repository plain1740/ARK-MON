import { PokemonFormChangeItemModifier } from "../modifier/modifier";
import type Pokemon from "../field/pokemon";
import { StatusEffect } from "#enums/status-effect";
import { allMoves } from "./moves/move";
import { MoveCategory } from "#enums/MoveCategory";
import type { Constructor, nil } from "#app/utils/common";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import type { TimeOfDay } from "#enums/time-of-day";
import { getPokemonNameWithAffix } from "#app/messages";
import i18next from "i18next";
import { WeatherType } from "#enums/weather-type";
import { Challenges } from "#app/enums/challenges";
import { SpeciesFormKey } from "#enums/species-form-key";
import { globalScene } from "#app/global-scene";

export enum FormChangeItem {
  NONE,

  ABOMASITE,
  ABSOLITE,
  AERODACTYLITE,
  AGGRONITE,
  ALAKAZITE,
  ALTARIANITE,
  AMPHAROSITE,
  AUDINITE,
  BANETTITE,
  BEEDRILLITE,
  BLASTOISINITE,
  BLAZIKENITE,
  CAMERUPTITE,
  CHARIZARDITE_X,
  CHARIZARDITE_Y,
  DIANCITE,
  GALLADITE,
  GARCHOMPITE,
  GARDEVOIRITE,
  GENGARITE,
  GLALITITE,
  GYARADOSITE,
  HERACRONITE,
  HOUNDOOMINITE,
  KANGASKHANITE,
  LATIASITE,
  LATIOSITE,
  LOPUNNITE,
  LUCARIONITE,
  MANECTITE,
  MAWILITE,
  MEDICHAMITE,
  METAGROSSITE,
  MEWTWONITE_X,
  MEWTWONITE_Y,
  PIDGEOTITE,
  PINSIRITE,
  RAYQUAZITE,
  SABLENITE,
  SALAMENCITE,
  SCEPTILITE,
  SCIZORITE,
  SHARPEDONITE,
  SLOWBRONITE,
  STEELIXITE,
  SWAMPERTITE,
  TYRANITARITE,
  VENUSAURITE,

  BLUE_ORB = 50,
  RED_ORB,
  ADAMANT_CRYSTAL,
  LUSTROUS_GLOBE,
  GRISEOUS_CORE,
  REVEAL_GLASS,
  MAX_MUSHROOMS,
  DARK_STONE,
  LIGHT_STONE,
  PRISON_BOTTLE,
  RUSTED_SWORD,
  RUSTED_SHIELD,
  ICY_REINS_OF_UNITY,
  SHADOW_REINS_OF_UNITY,
  ULTRANECROZIUM_Z,

  SHARP_METEORITE = 100,
  HARD_METEORITE,
  SMOOTH_METEORITE,
  GRACIDEA,
  SHOCK_DRIVE,
  BURN_DRIVE,
  CHILL_DRIVE,
  DOUSE_DRIVE,
  N_SOLARIZER,
  N_LUNARIZER,
  WELLSPRING_MASK,
  HEARTHFLAME_MASK,
  CORNERSTONE_MASK,
  FIST_PLATE,
  SKY_PLATE,
  TOXIC_PLATE,
  EARTH_PLATE,
  STONE_PLATE,
  INSECT_PLATE,
  SPOOKY_PLATE,
  IRON_PLATE,
  FLAME_PLATE,
  SPLASH_PLATE,
  MEADOW_PLATE,
  ZAP_PLATE,
  MIND_PLATE,
  ICICLE_PLATE,
  DRACO_PLATE,
  DREAD_PLATE,
  PIXIE_PLATE,
  BLANK_PLATE, // TODO: Find a potential use for this
  LEGEND_PLATE, // TODO: Find a potential use for this
  FIGHTING_MEMORY,
  FLYING_MEMORY,
  POISON_MEMORY,
  GROUND_MEMORY,
  ROCK_MEMORY,
  BUG_MEMORY,
  GHOST_MEMORY,
  STEEL_MEMORY,
  FIRE_MEMORY,
  WATER_MEMORY,
  GRASS_MEMORY,
  ELECTRIC_MEMORY,
  PSYCHIC_MEMORY,
  ICE_MEMORY,
  DRAGON_MEMORY,
  DARK_MEMORY,
  FAIRY_MEMORY,
  NORMAL_MEMORY, // TODO: Find a potential use for this
}

export type SpeciesFormChangeConditionPredicate = (p: Pokemon) => boolean;
export type SpeciesFormChangeConditionEnforceFunc = (p: Pokemon) => void;

export class SpeciesFormChange {
  public speciesId: Species;
  public preFormKey: string;
  public formKey: string;
  public trigger: SpeciesFormChangeTrigger;
  public quiet: boolean;
  public readonly conditions: SpeciesFormChangeCondition[];

  constructor(
    speciesId: Species,
    preFormKey: string,
    evoFormKey: string,
    trigger: SpeciesFormChangeTrigger,
    quiet = false,
    ...conditions: SpeciesFormChangeCondition[]
  ) {
    this.speciesId = speciesId;
    this.preFormKey = preFormKey;
    this.formKey = evoFormKey;
    this.trigger = trigger;
    this.quiet = quiet;
    this.conditions = conditions;
  }

  canChange(pokemon: Pokemon): boolean {
    if (pokemon.species.speciesId !== this.speciesId) {
      return false;
    }

    if (!pokemon.species.forms.length) {
      return false;
    }

    const formKeys = pokemon.species.forms.map(f => f.formKey);
    if (formKeys[pokemon.formIndex] !== this.preFormKey) {
      return false;
    }

    if (formKeys[pokemon.formIndex] === this.formKey) {
      return false;
    }

    for (const condition of this.conditions) {
      if (!condition.predicate(pokemon)) {
        return false;
      }
    }

    if (!this.trigger.canChange(pokemon)) {
      return false;
    }

    return true;
  }

  findTrigger(triggerType: Constructor<SpeciesFormChangeTrigger>): SpeciesFormChangeTrigger | nil {
    if (!this.trigger.hasTriggerType(triggerType)) {
      return null;
    }

    const trigger = this.trigger;

    if (trigger instanceof SpeciesFormChangeCompoundTrigger) {
      return trigger.triggers.find(t => t.hasTriggerType(triggerType));
    }

    return trigger;
  }
}

export class SpeciesFormChangeCondition {
  public predicate: SpeciesFormChangeConditionPredicate;
  public enforceFunc: SpeciesFormChangeConditionEnforceFunc | nil;

  constructor(predicate: SpeciesFormChangeConditionPredicate, enforceFunc?: SpeciesFormChangeConditionEnforceFunc) {
    this.predicate = predicate;
    this.enforceFunc = enforceFunc;
  }
}

export abstract class SpeciesFormChangeTrigger {
  public description = "";

  canChange(_pokemon: Pokemon): boolean {
    return true;
  }

  hasTriggerType(triggerType: Constructor<SpeciesFormChangeTrigger>): boolean {
    return this instanceof triggerType;
  }
}

export class SpeciesFormChangeManualTrigger extends SpeciesFormChangeTrigger {}

export class SpeciesFormChangeAbilityTrigger extends SpeciesFormChangeTrigger {
  public description: string = i18next.t("pokemonEvolutions:Forms.ability");
}

export class SpeciesFormChangeCompoundTrigger {
  public description = "";
  public triggers: SpeciesFormChangeTrigger[];

  constructor(...triggers: SpeciesFormChangeTrigger[]) {
    this.triggers = triggers;
    this.description = this.triggers
      .filter(trigger => trigger?.description?.length > 0)
      .map(trigger => trigger.description)
      .join(", ");
  }

  canChange(pokemon: Pokemon): boolean {
    for (const trigger of this.triggers) {
      if (!trigger.canChange(pokemon)) {
        return false;
      }
    }

    return true;
  }

  hasTriggerType(triggerType: Constructor<SpeciesFormChangeTrigger>): boolean {
    return !!this.triggers.find(t => t.hasTriggerType(triggerType));
  }
}

export class SpeciesFormChangeItemTrigger extends SpeciesFormChangeTrigger {
  public item: FormChangeItem;
  public active: boolean;

  constructor(item: FormChangeItem, active = true) {
    super();
    this.item = item;
    this.active = active;
    this.description = this.active
      ? i18next.t("pokemonEvolutions:Forms.item", {
          item: i18next.t(`modifierType:FormChangeItem.${FormChangeItem[this.item]}`),
        })
      : i18next.t("pokemonEvolutions:Forms.deactivateItem", {
          item: i18next.t(`modifierType:FormChangeItem.${FormChangeItem[this.item]}`),
        });
  }

  canChange(pokemon: Pokemon): boolean {
    return !!globalScene.findModifier(
      m =>
        m instanceof PokemonFormChangeItemModifier &&
        m.pokemonId === pokemon.id &&
        m.formChangeItem === this.item &&
        m.active === this.active,
    );
  }
}

export class SpeciesFormChangeTimeOfDayTrigger extends SpeciesFormChangeTrigger {
  public timesOfDay: TimeOfDay[];

  constructor(...timesOfDay: TimeOfDay[]) {
    super();
    this.timesOfDay = timesOfDay;
    this.description = i18next.t("pokemonEvolutions:Forms.timeOfDay");
  }

  canChange(_pokemon: Pokemon): boolean {
    return this.timesOfDay.indexOf(globalScene.arena.getTimeOfDay()) > -1;
  }
}

export class SpeciesFormChangeActiveTrigger extends SpeciesFormChangeTrigger {
  public active: boolean;

  constructor(active = false) {
    super();
    this.active = active;
    this.description = this.active
      ? i18next.t("pokemonEvolutions:Forms.enter")
      : i18next.t("pokemonEvolutions:Forms.leave");
  }

  canChange(pokemon: Pokemon): boolean {
    return pokemon.isActive(true) === this.active;
  }
}

export class SpeciesFormChangeStatusEffectTrigger extends SpeciesFormChangeTrigger {
  public statusEffects: StatusEffect[];
  public invert: boolean;

  constructor(statusEffects: StatusEffect | StatusEffect[], invert = false) {
    super();
    if (!Array.isArray(statusEffects)) {
      statusEffects = [statusEffects];
    }
    this.statusEffects = statusEffects;
    this.invert = invert;
    this.description = i18next.t("pokemonEvolutions:Forms.statusEffect");
  }

  canChange(pokemon: Pokemon): boolean {
    return this.statusEffects.indexOf(pokemon.status?.effect || StatusEffect.NONE) > -1 !== this.invert;
  }
}

export class SpeciesFormChangeMoveLearnedTrigger extends SpeciesFormChangeTrigger {
  public move: Moves;
  public known: boolean;

  constructor(move: Moves, known = true) {
    super();
    this.move = move;
    this.known = known;
    const moveKey = Moves[this.move]
      .split("_")
      .filter(f => f)
      .map((f, i) => (i ? `${f[0]}${f.slice(1).toLowerCase()}` : f.toLowerCase()))
      .join("") as unknown as string;
    this.description = known
      ? i18next.t("pokemonEvolutions:Forms.moveLearned", {
          move: i18next.t(`move:${moveKey}.name`),
        })
      : i18next.t("pokemonEvolutions:Forms.moveForgotten", {
          move: i18next.t(`move:${moveKey}.name`),
        });
  }

  canChange(pokemon: Pokemon): boolean {
    return !!pokemon.moveset.filter(m => m.moveId === this.move).length === this.known;
  }
}

export abstract class SpeciesFormChangeMoveTrigger extends SpeciesFormChangeTrigger {
  public movePredicate: (m: Moves) => boolean;
  public used: boolean;

  constructor(move: Moves | ((m: Moves) => boolean), used = true) {
    super();
    this.movePredicate = typeof move === "function" ? move : (m: Moves) => m === move;
    this.used = used;
  }
}

export class SpeciesFormChangePreMoveTrigger extends SpeciesFormChangeMoveTrigger {
  description = i18next.t("pokemonEvolutions:Forms.preMove");

  canChange(pokemon: Pokemon): boolean {
    const command = globalScene.currentBattle.turnCommands[pokemon.getBattlerIndex()];
    return !!command?.move && this.movePredicate(command.move.move) === this.used;
  }
}

export class SpeciesFormChangePostMoveTrigger extends SpeciesFormChangeMoveTrigger {
  description = i18next.t("pokemonEvolutions:Forms.postMove");

  canChange(pokemon: Pokemon): boolean {
    return (
      pokemon.summonData && !!pokemon.getLastXMoves(1).filter(m => this.movePredicate(m.move)).length === this.used
    );
  }
}

export class MeloettaFormChangePostMoveTrigger extends SpeciesFormChangePostMoveTrigger {
  override canChange(pokemon: Pokemon): boolean {
    if (globalScene.gameMode.hasChallenge(Challenges.SINGLE_TYPE)) {
      return false;
    }
    // Meloetta will not transform if it has the ability Sheer Force when using Relic Song
    if (pokemon.hasAbility(Abilities.SHEER_FORCE)) {
      return false;
    }
    return super.canChange(pokemon);
  }
}

export class SpeciesDefaultFormMatchTrigger extends SpeciesFormChangeTrigger {
  private formKey: string;

  constructor(formKey: string) {
    super();
    this.formKey = formKey;
    this.description = "";
  }

  canChange(pokemon: Pokemon): boolean {
    return (
      this.formKey ===
      pokemon.species.forms[globalScene.getSpeciesFormIndex(pokemon.species, pokemon.gender, pokemon.getNature(), true)]
        .formKey
    );
  }
}

/**
 * Class used for triggering form changes based on the user's Tera type.
 * Used by Ogerpon and Terapagos.
 * @extends SpeciesFormChangeTrigger
 */
export class SpeciesFormChangeTeraTrigger extends SpeciesFormChangeTrigger {
  description = i18next.t("pokemonEvolutions:Forms.tera");
}

/**
 * Class used for triggering form changes based on the user's lapsed Tera type.
 * Used by Ogerpon and Terapagos.
 * @extends SpeciesFormChangeTrigger
 */
export class SpeciesFormChangeLapseTeraTrigger extends SpeciesFormChangeTrigger {
  description = i18next.t("pokemonEvolutions:Forms.teraLapse");
}

/**
 * Class used for triggering form changes based on weather.
 * Used by Castform and Cherrim.
 * @extends SpeciesFormChangeTrigger
 */
export class SpeciesFormChangeWeatherTrigger extends SpeciesFormChangeTrigger {
  /** The ability that  triggers the form change */
  public ability: Abilities;
  /** The list of weathers that trigger the form change */
  public weathers: WeatherType[];

  constructor(ability: Abilities, weathers: WeatherType[]) {
    super();
    this.ability = ability;
    this.weathers = weathers;
    this.description = i18next.t("pokemonEvolutions:Forms.weather");
  }

  /**
   * Checks if the Pokemon has the required ability and is in the correct weather while
   * the weather or ability is also not suppressed.
   * @param {Pokemon} pokemon the pokemon that is trying to do the form change
   * @returns `true` if the Pokemon can change forms, `false` otherwise
   */
  canChange(pokemon: Pokemon): boolean {
    const currentWeather = globalScene.arena.weather?.weatherType ?? WeatherType.NONE;
    const isWeatherSuppressed = globalScene.arena.weather?.isEffectSuppressed();
    const isAbilitySuppressed = pokemon.summonData.abilitySuppressed;

    return (
      !isAbilitySuppressed &&
      !isWeatherSuppressed &&
      pokemon.hasAbility(this.ability) &&
      this.weathers.includes(currentWeather)
    );
  }
}

/**
 * Class used for reverting to the original form when the weather runs out
 * or when the user loses the ability/is suppressed.
 * Used by Castform and Cherrim.
 * @extends SpeciesFormChangeTrigger
 */
export class SpeciesFormChangeRevertWeatherFormTrigger extends SpeciesFormChangeTrigger {
  /** The ability that triggers the form change*/
  public ability: Abilities;
  /** The list of weathers that will also trigger a form change to original form */
  public weathers: WeatherType[];

  constructor(ability: Abilities, weathers: WeatherType[]) {
    super();
    this.ability = ability;
    this.weathers = weathers;
    this.description = i18next.t("pokemonEvolutions:Forms.weatherRevert");
  }

  /**
   * Checks if the Pokemon has the required ability and the weather is one that will revert
   * the Pokemon to its original form or the weather or ability is suppressed
   * @param {Pokemon} pokemon the pokemon that is trying to do the form change
   * @returns `true` if the Pokemon will revert to its original form, `false` otherwise
   */
  canChange(pokemon: Pokemon): boolean {
    if (pokemon.hasAbility(this.ability, false, true)) {
      const currentWeather = globalScene.arena.weather?.weatherType ?? WeatherType.NONE;
      const isWeatherSuppressed = globalScene.arena.weather?.isEffectSuppressed();
      const isAbilitySuppressed = pokemon.summonData.abilitySuppressed;
      const summonDataAbility = pokemon.summonData.ability;
      const isAbilityChanged = summonDataAbility !== this.ability && summonDataAbility !== Abilities.NONE;

      if (this.weathers.includes(currentWeather) || isWeatherSuppressed || isAbilitySuppressed || isAbilityChanged) {
        return true;
      }
    }
    return false;
  }
}

export function getSpeciesFormChangeMessage(pokemon: Pokemon, formChange: SpeciesFormChange, preName: string): string {
  const isMega = formChange.formKey.indexOf(SpeciesFormKey.MEGA) > -1;
  const isGmax = formChange.formKey.indexOf(SpeciesFormKey.GIGANTAMAX) > -1;
  const isEmax = formChange.formKey.indexOf(SpeciesFormKey.ETERNAMAX) > -1;
  const isRevert = !isMega && formChange.formKey === pokemon.species.forms[0].formKey;
  if (isMega) {
    return i18next.t("battlePokemonForm:megaChange", {
      preName,
      pokemonName: pokemon.name,
    });
  }
  if (isGmax) {
    return i18next.t("battlePokemonForm:gigantamaxChange", {
      preName,
      pokemonName: pokemon.name,
    });
  }
  if (isEmax) {
    return i18next.t("battlePokemonForm:eternamaxChange", {
      preName,
      pokemonName: pokemon.name,
    });
  }
  if (isRevert) {
    return i18next.t("battlePokemonForm:revertChange", {
      pokemonName: getPokemonNameWithAffix(pokemon),
    });
  }
  if (pokemon.getAbility().id === Abilities.DISGUISE) {
    return i18next.t("battlePokemonForm:disguiseChange");
  }
  return i18next.t("battlePokemonForm:formChange", { preName });
}

/**
 * Gives a condition for form changing checking if a species is registered as caught in the player's dex data.
 * Used for fusion forms such as Kyurem and Necrozma.
 * @param species {@linkcode Species}
 * @returns A {@linkcode SpeciesFormChangeCondition} checking if that species is registered as caught
 */
function getSpeciesDependentFormChangeCondition(species: Species): SpeciesFormChangeCondition {
  return new SpeciesFormChangeCondition(_p => !!globalScene.gameData.dexData[species].caughtAttr);
}

interface PokemonFormChanges {
  [key: string]: SpeciesFormChange[];
}

// biome-ignore format: manually formatted
export const pokemonFormChanges: PokemonFormChanges = {
  };

export function initPokemonForms() {
  const formChangeKeys = Object.keys(pokemonFormChanges);
  for (const pk of formChangeKeys) {
    const formChanges = pokemonFormChanges[pk];
    const newFormChanges: SpeciesFormChange[] = [];
    for (const fc of formChanges) {
      const itemTrigger = fc.findTrigger(SpeciesFormChangeItemTrigger) as SpeciesFormChangeItemTrigger;
      if (itemTrigger && !formChanges.find(c => fc.formKey === c.preFormKey && fc.preFormKey === c.formKey)) {
        newFormChanges.push(
          new SpeciesFormChange(
            fc.speciesId,
            fc.formKey,
            fc.preFormKey,
            new SpeciesFormChangeItemTrigger(itemTrigger.item, false),
          ),
        );
      }
    }
    formChanges.push(...newFormChanges);
  }
}
