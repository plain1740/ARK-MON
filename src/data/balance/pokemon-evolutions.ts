import { globalScene } from "#app/global-scene";
import { Gender } from "#app/data/gender";
import { PokeballType } from "#enums/pokeball";
import type Pokemon from "#app/field/pokemon";
import { PokemonType } from "#enums/pokemon-type";
import { randSeedInt } from "#app/utils/common";
import { WeatherType } from "#enums/weather-type";
import { Nature } from "#enums/nature";
import { Biome } from "#enums/biome";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { TimeOfDay } from "#enums/time-of-day";
import { DamageMoneyRewardModifier, ExtraModifierModifier, MoneyMultiplierModifier, TempExtraModifierModifier } from "#app/modifier/modifier";
import { SpeciesFormKey } from "#enums/species-form-key";
import { speciesStarterCosts } from "./starters";
import i18next from "i18next";
import { initI18n } from "#app/plugins/i18n";


export enum SpeciesWildEvolutionDelay {
  NONE,
  SHORT,
  MEDIUM,
  LONG,
  VERY_LONG,
  NEVER
}

export enum EvolutionItem {
  NONE,

  LINKING_CORD,
  SUN_STONE,
  MOON_STONE,
  LEAF_STONE,
  FIRE_STONE,
  WATER_STONE,
  THUNDER_STONE,
  ICE_STONE,
  DUSK_STONE,
  DAWN_STONE,
  SHINY_STONE,
  CRACKED_POT,
  SWEET_APPLE,
  TART_APPLE,
  STRAWBERRY_SWEET,
  UNREMARKABLE_TEACUP,
  UPGRADE,
  DUBIOUS_DISC,
  DRAGON_SCALE,
  PRISM_SCALE,
  RAZOR_CLAW,
  RAZOR_FANG,
  REAPER_CLOTH,
  ELECTIRIZER,
  MAGMARIZER,
  PROTECTOR,
  SACHET,
  WHIPPED_DREAM,
  SYRUPY_APPLE,
  CHIPPED_POT,
  GALARICA_CUFF,
  GALARICA_WREATH,
  AUSPICIOUS_ARMOR,
  MALICIOUS_ARMOR,
  MASTERPIECE_TEACUP,
  SUN_FLUTE,
  MOON_FLUTE,

  BLACK_AUGURITE = 51,
  PEAT_BLOCK,
  METAL_ALLOY,
  SCROLL_OF_DARKNESS,
  SCROLL_OF_WATERS,
  LEADERS_CREST
}

/**
 * Pokemon Evolution tuple type consisting of:
 * @property 0 {@linkcode Species} The species of the Pokemon.
 * @property 1 {@linkcode number} The level at which the Pokemon evolves.
 */
export type EvolutionLevel = [species: Species, level: number];

export type EvolutionConditionPredicate = (p: Pokemon) => boolean;
export type EvolutionConditionEnforceFunc = (p: Pokemon) => void;

export class SpeciesFormEvolution {
  public speciesId: Species;
  public preFormKey: string | null;
  public evoFormKey: string | null;
  public level: number;
  public item: EvolutionItem | null;
  public condition: SpeciesEvolutionCondition | null;
  public wildDelay: SpeciesWildEvolutionDelay;
  public description = "";

  constructor(speciesId: Species, preFormKey: string | null, evoFormKey: string | null, level: number, item: EvolutionItem | null, condition: SpeciesEvolutionCondition | null, wildDelay?: SpeciesWildEvolutionDelay) {
    if (!i18next.isInitialized) {
      initI18n();
    }
    this.speciesId = speciesId;
    this.preFormKey = preFormKey;
    this.evoFormKey = evoFormKey;
    this.level = level;
    this.item = item || EvolutionItem.NONE;
    this.condition = condition;
    this.wildDelay = wildDelay ?? SpeciesWildEvolutionDelay.NONE;

    const strings: string[] = [];
    if (this.level > 1) {
      strings.push(i18next.t("pokemonEvolutions:level") + ` ${this.level}`);
    }
    if (this.item) {
      const itemDescription = i18next.t(`modifierType:EvolutionItem.${EvolutionItem[this.item].toUpperCase()}`);
      const rarity = this.item > 50 ? i18next.t("pokemonEvolutions:ULTRA") : i18next.t("pokemonEvolutions:GREAT");
      strings.push(i18next.t("pokemonEvolutions:using") + itemDescription + ` (${rarity})`);
    }
    if (this.condition) {
      strings.push(this.condition.description);
    }
    this.description = strings
      .filter(str => str !== "")
      .map((str, index) => index > 0 ? str[0].toLowerCase() + str.slice(1) : str)
      .join(i18next.t("pokemonEvolutions:connector"));
  }
}

export class SpeciesEvolution extends SpeciesFormEvolution {
  constructor(speciesId: Species, level: number, item: EvolutionItem | null, condition: SpeciesEvolutionCondition | null, wildDelay?: SpeciesWildEvolutionDelay) {
    super(speciesId, null, null, level, item, condition, wildDelay);
  }
}

export class FusionSpeciesFormEvolution extends SpeciesFormEvolution {
  public primarySpeciesId: Species;

  constructor(primarySpeciesId: Species, evolution: SpeciesFormEvolution) {
    super(evolution.speciesId, evolution.preFormKey, evolution.evoFormKey, evolution.level, evolution.item, evolution.condition, evolution.wildDelay);

    this.primarySpeciesId = primarySpeciesId;
  }
}

export class SpeciesEvolutionCondition {
  public predicate: EvolutionConditionPredicate;
  public enforceFunc?: EvolutionConditionEnforceFunc;
  public description: string;

  constructor(predicate: EvolutionConditionPredicate, enforceFunc?: EvolutionConditionEnforceFunc) {
    this.predicate = predicate;
    this.enforceFunc = enforceFunc;
    this.description = "";
  }
}

class GenderEvolutionCondition extends SpeciesEvolutionCondition {
  public gender: Gender;
  constructor(gender: Gender) {
    super(p => p.gender === gender, p => p.gender = gender);
    this.gender = gender;
    this.description = i18next.t("pokemonEvolutions:gender", { gender: i18next.t(`pokemonEvolutions:${Gender[gender]}`) });
  }
}

class TimeOfDayEvolutionCondition extends SpeciesEvolutionCondition {
  public timesOfDay: TimeOfDay[];
  constructor(tod: "day" | "night") {
    if (tod === "day") {
      super(() => globalScene.arena.getTimeOfDay() === TimeOfDay.DAWN || globalScene.arena.getTimeOfDay() === TimeOfDay.DAY);
      this.timesOfDay = [ TimeOfDay.DAWN, TimeOfDay.DAY ];
    } else if (tod === "night") {
      super(() => globalScene.arena.getTimeOfDay() === TimeOfDay.DUSK || globalScene.arena.getTimeOfDay() === TimeOfDay.NIGHT);
      this.timesOfDay = [ TimeOfDay.DUSK, TimeOfDay.NIGHT ];
    } else {
      super(() => false);
      this.timesOfDay = [];
    }
    this.description = i18next.t("pokemonEvolutions:timeOfDay", { tod: i18next.t(`pokemonEvolutions:${tod}`) });
  }
}

class MoveEvolutionCondition extends SpeciesEvolutionCondition {
  public move: Moves;
  constructor(move: Moves) {
    super(p => p.moveset.filter(m => m.moveId === move).length > 0);
    this.move = move;
    const moveKey = Moves[this.move].split("_").filter(f => f).map((f, i) => i ? `${f[0]}${f.slice(1).toLowerCase()}` : f.toLowerCase()).join("");
    this.description = i18next.t("pokemonEvolutions:move", { move: i18next.t(`move:${moveKey}.name`) });
  }
}

class FriendshipEvolutionCondition extends SpeciesEvolutionCondition {
  public amount: number;
  constructor(amount: number) {
    super(p => p.friendship >= amount);
    this.amount = amount;
    this.description = i18next.t("pokemonEvolutions:friendship");
  }
}

class FriendshipTimeOfDayEvolutionCondition extends SpeciesEvolutionCondition {
  public amount: number;
  public timesOfDay: TimeOfDay[];
  constructor(amount: number, tod: "day" | "night") {
    if (tod === "day") {
      super(p => p.friendship >= amount && (globalScene.arena.getTimeOfDay() === TimeOfDay.DAWN || globalScene.arena.getTimeOfDay() === TimeOfDay.DAY));
      this.timesOfDay = [ TimeOfDay.DAWN, TimeOfDay.DAY ];
    } else if (tod === "night") {
      super(p => p.friendship >= amount && (globalScene.arena.getTimeOfDay() === TimeOfDay.DUSK || globalScene.arena.getTimeOfDay() === TimeOfDay.NIGHT));
      this.timesOfDay = [ TimeOfDay.DUSK, TimeOfDay.NIGHT ];
    } else {
      super(_p => false);
      this.timesOfDay = [];
    }
    this.amount = amount;
    this.description = i18next.t("pokemonEvolutions:friendshipTimeOfDay", { tod: i18next.t(`pokemonEvolutions:${tod}`) });
  }
}

class FriendshipMoveTypeEvolutionCondition extends SpeciesEvolutionCondition {
  public amount: number;
  public type: PokemonType;
  constructor(amount: number, type: PokemonType) {
    super(p => p.friendship >= amount && !!p.getMoveset().find(m => m?.getMove().type === type));
    this.amount = amount;
    this.type = type;
    this.description = i18next.t("pokemonEvolutions:friendshipMoveType", { type: i18next.t(`pokemonInfo:Type.${PokemonType[this.type]}`) });
  }
}

class ShedinjaEvolutionCondition extends SpeciesEvolutionCondition {
  constructor() {
    super(() => globalScene.getPlayerParty().length < 6 && globalScene.pokeballCounts[PokeballType.POKEBALL] > 0);
    this.description = i18next.t("pokemonEvolutions:shedinja");
  }
}

class PartyTypeEvolutionCondition extends SpeciesEvolutionCondition {
  public type: PokemonType;
  constructor(type: PokemonType) {
    super(() => !!globalScene.getPlayerParty().find(p => p.getTypes(false, false, true).indexOf(type) > -1));
    this.type = type;
    this.description = i18next.t("pokemonEvolutions:partyType", { type: i18next.t(`pokemonInfo:Type.${PokemonType[this.type]}`) });
  }
}

class CaughtEvolutionCondition extends SpeciesEvolutionCondition {
  public species: Species;
  constructor(species: Species) {
    super(() => !!globalScene.gameData.dexData[species].caughtAttr);
    this.species = species;
    this.description = i18next.t("pokemonEvolutions:caught", { species: i18next.t(`pokemon:${Species[this.species].toLowerCase()}`) });
  }
}

class WeatherEvolutionCondition extends SpeciesEvolutionCondition {
  public weatherTypes: WeatherType[];
  constructor(weatherTypes: WeatherType[]) {
    super(() => weatherTypes.indexOf(globalScene.arena.weather?.weatherType || WeatherType.NONE) > -1);
    this.weatherTypes = weatherTypes;
    this.description = i18next.t("pokemonEvolutions:weather");
  }
}

class MoveTypeEvolutionCondition extends SpeciesEvolutionCondition {
  public type: PokemonType;
  constructor(type: PokemonType) {
    super(p => p.moveset.filter(m => m?.getMove().type === type).length > 0);
    this.type = type;
    this.description = i18next.t("pokemonEvolutions:moveType", { type: i18next.t(`pokemonInfo:Type.${PokemonType[this.type]}`) });
  }
}

class TreasureEvolutionCondition extends SpeciesEvolutionCondition {
  constructor() {
    super(p => p.evoCounter
      + p.getHeldItems().filter(m => m instanceof DamageMoneyRewardModifier).length
      + globalScene.findModifiers(m => m instanceof MoneyMultiplierModifier
        || m instanceof ExtraModifierModifier || m instanceof TempExtraModifierModifier).length > 9);
    this.description = i18next.t("pokemonEvolutions:treasure");
  }
}

class TyrogueEvolutionCondition extends SpeciesEvolutionCondition {
  public move: Moves;
  constructor(move: Moves) {
    super(p =>
      p.getMoveset(true).find(m => m && [ Moves.LOW_SWEEP, Moves.MACH_PUNCH, Moves.RAPID_SPIN ].includes(m.moveId))?.moveId === move);
    this.move = move;
    const moveKey = Moves[this.move].split("_").filter(f => f).map((f, i) => i ? `${f[0]}${f.slice(1).toLowerCase()}` : f.toLowerCase()).join("");
    this.description = i18next.t("pokemonEvolutions:move", { move: i18next.t(`move:${moveKey}.name`) });
  }
}

class NatureEvolutionCondition extends SpeciesEvolutionCondition {
  public natures: Nature[];
  constructor(natures: Nature[]) {
    super(p => natures.indexOf(p.getNature()) > -1);
    this.natures = natures;
    this.description = i18next.t("pokemonEvolutions:nature");
  }
}

class MoveTimeOfDayEvolutionCondition extends SpeciesEvolutionCondition {
  public move: Moves;
  public timesOfDay: TimeOfDay[];
  constructor(move: Moves, tod: "day" | "night") {
    if (tod === "day") {
      super(p => p.moveset.filter(m => m.moveId === move).length > 0 && (globalScene.arena.getTimeOfDay() === TimeOfDay.DAWN || globalScene.arena.getTimeOfDay() === TimeOfDay.DAY));
      this.move = move;
      this.timesOfDay = [ TimeOfDay.DAWN, TimeOfDay.DAY ];
    } else if (tod === "night") {
      super(p => p.moveset.filter(m => m.moveId === move).length > 0 && (globalScene.arena.getTimeOfDay() === TimeOfDay.DUSK || globalScene.arena.getTimeOfDay() === TimeOfDay.NIGHT));
      this.move = move;
      this.timesOfDay = [ TimeOfDay.DUSK, TimeOfDay.NIGHT ];
    } else {
      super(() => false);
      this.timesOfDay = [];
    }
    const moveKey = Moves[this.move].split("_").filter(f => f).map((f, i) => i ? `${f[0]}${f.slice(1).toLowerCase()}` : f.toLowerCase()).join("");
    this.description = i18next.t("pokemonEvolutions:moveTimeOfDay", { move: i18next.t(`move:${moveKey}.name`), tod: i18next.t(`pokemonEvolutions:${tod}`) });
  }
}

class BiomeEvolutionCondition extends SpeciesEvolutionCondition {
  public biomes: Biome[];
  constructor(biomes: Biome[]) {
    super(() => biomes.filter(b => b === globalScene.arena.biomeType).length > 0);
    this.biomes = biomes;
    this.description = i18next.t("pokemonEvolutions:biome");
  }
}

class DunsparceEvolutionCondition extends SpeciesEvolutionCondition {
  constructor() {
    super(p => {
      let ret = false;
      if (p.moveset.filter(m => m.moveId === Moves.HYPER_DRILL).length > 0) {
        globalScene.executeWithSeedOffset(() => ret = !randSeedInt(4), p.id);
      }
      return ret;
    });
    const moveKey = Moves[Moves.HYPER_DRILL].split("_").filter(f => f).map((f, i) => i ? `${f[0]}${f.slice(1).toLowerCase()}` : f.toLowerCase()).join("");
    this.description = i18next.t("pokemonEvolutions:move", { move: i18next.t(`move:${moveKey}.name`) });
  }
}

class TandemausEvolutionCondition extends SpeciesEvolutionCondition {
  constructor() {
    super(p => {
      let ret = false;
      globalScene.executeWithSeedOffset(() => ret = !randSeedInt(4), p.id);
      return ret;
    });
  }
}

interface PokemonEvolutions {
  [key: string]: SpeciesFormEvolution[]
}

export const pokemonEvolutions: PokemonEvolutions = {
 [Species.ARK_P8]: [
  new SpeciesEvolution(Species.ARK_P8_1, 11, null, null)
],
[Species.ARK_P9]: [
  new SpeciesEvolution(Species.ARK_P9_1, 11, null, null)
],
[Species.ARK_P10]: [
  new SpeciesEvolution(Species.ARK_P10_1, 7, null, null)
],
[Species.ARK_P11]: [
  new SpeciesEvolution(Species.ARK_P11_1, 8, null, null)
],
[Species.ARK_P12]: [
  new SpeciesEvolution(Species.ARK_P12_1, 12, null, null)
],
[Species.ARK_P13]: [
  new SpeciesEvolution(Species.ARK_P13_1, 9, null, null)
],
[Species.ARK_P14]: [
  new SpeciesEvolution(Species.ARK_P14_1, 13, null, null)
],
[Species.ARK_P15]: [
  new SpeciesEvolution(Species.ARK_P15_1, 7, null, null)
],
[Species.ARK_P16]: [
  new SpeciesEvolution(Species.ARK_P16_1, 9, null, null)
],
[Species.ARK_P17]: [
  new SpeciesEvolution(Species.ARK_P17_1, 8, null, null)
],
[Species.ARK_P18]: [
  new SpeciesEvolution(Species.ARK_P18_1, 13, null, null)
],
[Species.ARK_P19]: [
  new SpeciesEvolution(Species.ARK_P19_1, 9, null, null)
],
[Species.ARK_P20]: [
  new SpeciesEvolution(Species.ARK_P20_1, 13, null, null)
],
[Species.ARK_P21]: [
  new SpeciesEvolution(Species.ARK_P21_1, 12, null, null),
  new SpeciesEvolution(Species.ARK_P21_2, 28, null, null)
],
[Species.ARK_P22]: [
  new SpeciesEvolution(Species.ARK_P22_1, 12, null, null),
  new SpeciesEvolution(Species.ARK_P22_2, 29, null, null)
],
[Species.ARK_P23]: [
  new SpeciesEvolution(Species.ARK_P23_1, 15, null, null),
  new SpeciesEvolution(Species.ARK_P23_2, 24, null, null)
],
[Species.ARK_P24]: [
  new SpeciesEvolution(Species.ARK_P24_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P24_2, 27, null, null)
],
[Species.ARK_P25]: [
  new SpeciesEvolution(Species.ARK_P25_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P25_2, 27, null, null)
],
[Species.ARK_P26]: [
  new SpeciesEvolution(Species.ARK_P26_1, 14, null, null),
  new SpeciesEvolution(Species.ARK_P26_2, 23, null, null)
],
[Species.ARK_P27]: [
  new SpeciesEvolution(Species.ARK_P27_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P27_2, 25, null, null)
],
[Species.ARK_P28]: [
  new SpeciesEvolution(Species.ARK_P28_1, 13, null, null),
  new SpeciesEvolution(Species.ARK_P28_2, 21, null, null)
],
[Species.ARK_P29]: [
  new SpeciesEvolution(Species.ARK_P29_1, 14, null, null),
  new SpeciesEvolution(Species.ARK_P29_2, 26, null, null)
],
[Species.ARK_P30]: [
  new SpeciesEvolution(Species.ARK_P30_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P30_2, 22, null, null)
],
[Species.ARK_P31]: [
  new SpeciesEvolution(Species.ARK_P31_1, 12, null, null),
  new SpeciesEvolution(Species.ARK_P31_2, 21, null, null)
],
[Species.ARK_P32]: [
  new SpeciesEvolution(Species.ARK_P32_1, 13, null, null),
  new SpeciesEvolution(Species.ARK_P32_2, 21, null, null)
],
[Species.ARK_P33]: [
  new SpeciesEvolution(Species.ARK_P33_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P33_2, 23, null, null)
],
[Species.ARK_P34]: [
  new SpeciesEvolution(Species.ARK_P34_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P34_2, 19, null, null)
],
[Species.ARK_P35]: [
  new SpeciesEvolution(Species.ARK_P35_1, 15, null, null),
  new SpeciesEvolution(Species.ARK_P35_2, 23, null, null)
],
[Species.ARK_P36]: [
  new SpeciesEvolution(Species.ARK_P36_1, 12, null, null),
  new SpeciesEvolution(Species.ARK_P36_2, 24, null, null)
],
[Species.ARK_P37]: [
  new SpeciesEvolution(Species.ARK_P37_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P37_2, 21, null, null)
],
[Species.ARK_P38]: [
  new SpeciesEvolution(Species.ARK_P38_1, 12, null, null),
  new SpeciesEvolution(Species.ARK_P38_2, 21, null, null)
],
[Species.ARK_P39]: [
  new SpeciesEvolution(Species.ARK_P39_1, 15, null, null),
  new SpeciesEvolution(Species.ARK_P39_2, 26, null, null)
],
[Species.ARK_P40]: [
  new SpeciesEvolution(Species.ARK_P40_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P40_2, 23, null, null)
],
[Species.ARK_P41]: [
  new SpeciesEvolution(Species.ARK_P41_1, 15, null, null),
  new SpeciesEvolution(Species.ARK_P41_2, 29, null, null)
],
[Species.ARK_P42]: [
  new SpeciesEvolution(Species.ARK_P42_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P42_2, 23, null, null)
],
[Species.ARK_P43]: [
  new SpeciesEvolution(Species.ARK_P43_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P43_2, 25, null, null)
],
[Species.ARK_P44]: [
  new SpeciesEvolution(Species.ARK_P44_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P44_2, 29, null, null)
],
[Species.ARK_P45]: [
  new SpeciesEvolution(Species.ARK_P45_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P45_2, 36, null, null)
],
[Species.ARK_P46]: [
  new SpeciesEvolution(Species.ARK_P46_1, 19, null, null),
  new SpeciesEvolution(Species.ARK_P46_2, 30, null, null)
],
[Species.ARK_P47]: [
  new SpeciesEvolution(Species.ARK_P47_1, 20, null, null),
  new SpeciesEvolution(Species.ARK_P47_2, 27, null, null)
],
[Species.ARK_P48]: [
  new SpeciesEvolution(Species.ARK_P48_1, 22, null, null),
  new SpeciesEvolution(Species.ARK_P48_2, 35, null, null)
],
[Species.ARK_P49]: [
  new SpeciesEvolution(Species.ARK_P49_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P49_2, 31, null, null)
],
[Species.ARK_P50]: [
  new SpeciesEvolution(Species.ARK_P50_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P50_2, 35, null, null)
],
[Species.ARK_P51]: [
  new SpeciesEvolution(Species.ARK_P51_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P51_2, 30, null, null)
],
[Species.ARK_P52]: [
  new SpeciesEvolution(Species.ARK_P52_1, 20, null, null),
  new SpeciesEvolution(Species.ARK_P52_2, 30, null, null)
],
[Species.ARK_P53]: [
  new SpeciesEvolution(Species.ARK_P53_1, 21, null, null),
  new SpeciesEvolution(Species.ARK_P53_2, 30, null, null)
],
[Species.ARK_P54]: [
  new SpeciesEvolution(Species.ARK_P54_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P54_2, 29, null, null)
],
[Species.ARK_P55]: [
  new SpeciesEvolution(Species.ARK_P55_1, 17, null, null),
  new SpeciesEvolution(Species.ARK_P55_2, 28, null, null)
],
[Species.ARK_P56]: [
  new SpeciesEvolution(Species.ARK_P56_1, 20, null, null),
  new SpeciesEvolution(Species.ARK_P56_2, 35, null, null)
],
[Species.ARK_P57]: [
  new SpeciesEvolution(Species.ARK_P57_1, 19, null, null),
  new SpeciesEvolution(Species.ARK_P57_2, 31, null, null)
],
[Species.ARK_P58]: [
  new SpeciesEvolution(Species.ARK_P58_1, 19, null, null),
  new SpeciesEvolution(Species.ARK_P58_2, 30, null, null)
],
[Species.ARK_P59]: [
  new SpeciesEvolution(Species.ARK_P59_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P59_2, 37, null, null)
],
[Species.ARK_P60]: [
  new SpeciesEvolution(Species.ARK_P60_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P60_2, 37, null, null)
],
[Species.ARK_P61]: [
  new SpeciesEvolution(Species.ARK_P61_1, 22, null, null),
  new SpeciesEvolution(Species.ARK_P61_2, 37, null, null)
],
[Species.ARK_P62]: [
  new SpeciesEvolution(Species.ARK_P62_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P62_2, 36, null, null)
],
[Species.ARK_P63]: [
  new SpeciesEvolution(Species.ARK_P63_1, 19, null, null),
  new SpeciesEvolution(Species.ARK_P63_2, 32, null, null)
],
[Species.ARK_P64]: [
  new SpeciesEvolution(Species.ARK_P64_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P64_2, 33, null, null)
],
[Species.ARK_P65]: [
  new SpeciesEvolution(Species.ARK_P65_1, 20, null, null),
  new SpeciesEvolution(Species.ARK_P65_2, 35, null, null)
],
[Species.ARK_P66]: [
  new SpeciesEvolution(Species.ARK_P66_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P66_2, 33, null, null)
],
[Species.ARK_P67]: [
  new SpeciesEvolution(Species.ARK_P67_1, 18, null, null),
  new SpeciesEvolution(Species.ARK_P67_2, 27, null, null)
],
[Species.ARK_P68]: [
  new SpeciesEvolution(Species.ARK_P68_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P68_2, 37, null, null)
],
[Species.ARK_P69]: [
  new SpeciesEvolution(Species.ARK_P69_1, 19, null, null),
  new SpeciesEvolution(Species.ARK_P69_2, 36, null, null)
],
[Species.ARK_P70]: [
  new SpeciesEvolution(Species.ARK_P70_1, 22, null, null),
  new SpeciesEvolution(Species.ARK_P70_2, 29, null, null)
],
[Species.ARK_P71]: [
  new SpeciesEvolution(Species.ARK_P71_1, 21, null, null),
  new SpeciesEvolution(Species.ARK_P71_2, 36, null, null)
],
[Species.ARK_P72]: [
  new SpeciesEvolution(Species.ARK_P72_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P72_2, 41, null, null)
],
[Species.ARK_P73]: [
  new SpeciesEvolution(Species.ARK_P73_1, 26, null, null),
  new SpeciesEvolution(Species.ARK_P73_2, 50, null, null)
],
[Species.ARK_P74]: [
  new SpeciesEvolution(Species.ARK_P74_1, 24, null, null),
  new SpeciesEvolution(Species.ARK_P74_2, 44, null, null)
],
[Species.ARK_P75]: [
  new SpeciesEvolution(Species.ARK_P75_1, 28, null, null),
  new SpeciesEvolution(Species.ARK_P75_2, 50, null, null)
],
[Species.ARK_P76]: [
  new SpeciesEvolution(Species.ARK_P76_1, 24, null, null),
  new SpeciesEvolution(Species.ARK_P76_2, 43, null, null)
],
[Species.ARK_P77]: [
  new SpeciesEvolution(Species.ARK_P77_1, 24, null, null),
  new SpeciesEvolution(Species.ARK_P77_2, 50, null, null)
],
[Species.ARK_P78]: [
  new SpeciesEvolution(Species.ARK_P78_1, 28, null, null),
  new SpeciesEvolution(Species.ARK_P78_2, 40, null, null)
],
[Species.ARK_P79]: [
  new SpeciesEvolution(Species.ARK_P79_1, 25, null, null),
  new SpeciesEvolution(Species.ARK_P79_2, 50, null, null)
],
[Species.ARK_P80]: [
  new SpeciesEvolution(Species.ARK_P80_1, 28, null, null),
  new SpeciesEvolution(Species.ARK_P80_2, 47, null, null)
],
[Species.ARK_P81]: [
  new SpeciesEvolution(Species.ARK_P81_1, 23, null, null),
  new SpeciesEvolution(Species.ARK_P81_2, 50, null, null)
],
};

interface PokemonPrevolutions {
  [key: string]: Species
}

export const pokemonPrevolutions: PokemonPrevolutions = {};

export function initPokemonPrevolutions(): void {
  const megaFormKeys = [ SpeciesFormKey.MEGA, "", SpeciesFormKey.MEGA_X, "", SpeciesFormKey.MEGA_Y ].map(sfk => sfk as string);
  const prevolutionKeys = Object.keys(pokemonEvolutions);
  prevolutionKeys.forEach(pk => {
    const evolutions = pokemonEvolutions[pk];
    for (const ev of evolutions) {
      if (ev.evoFormKey && megaFormKeys.indexOf(ev.evoFormKey) > -1) {
        continue;
      }
      pokemonPrevolutions[ev.speciesId] = Number.parseInt(pk) as Species;
    }
  });
}


// TODO: This may cause funny business for double starters such as Pichu/Pikachu
export const pokemonStarters: PokemonPrevolutions = {};

export function initPokemonStarters(): void {
  const starterKeys = Object.keys(pokemonPrevolutions);
  starterKeys.forEach(pk => {
    const prevolution = pokemonPrevolutions[pk];
    if (speciesStarterCosts.hasOwnProperty(prevolution)) {
      pokemonStarters[pk] = prevolution;
    } else {
      pokemonStarters[pk] = pokemonPrevolutions[prevolution];
    }
  });
}
