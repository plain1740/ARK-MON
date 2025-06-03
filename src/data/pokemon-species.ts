import type { Localizable } from "#app/interfaces/locales";
import { Abilities } from "#enums/abilities";
import { PartyMemberStrength } from "#enums/party-member-strength";
import { Species } from "#enums/species";
import { QuantizerCelebi, argbFromRgba, rgbaFromArgb } from "@material/material-color-utilities";
import i18next from "i18next";
import type { AnySound } from "#app/battle-scene";
import { globalScene } from "#app/global-scene";
import type { GameMode } from "#app/game-mode";
import { DexAttr, type StarterMoveset } from "#app/system/game-data";
import { isNullOrUndefined, capitalizeString, randSeedInt, randSeedGauss, randSeedItem } from "#app/utils/common";
import { uncatchableSpecies } from "#app/data/balance/biomes";
import { speciesEggMoves } from "#app/data/balance/egg-moves";
import { GrowthRate } from "#app/data/exp";
import type { EvolutionLevel } from "#app/data/balance/pokemon-evolutions";
import {
  SpeciesWildEvolutionDelay,
  pokemonEvolutions,
  pokemonPrevolutions,
} from "#app/data/balance/pokemon-evolutions";
import { PokemonType } from "#enums/pokemon-type";
import type { LevelMoves } from "#app/data/balance/pokemon-level-moves";
import {
  pokemonFormLevelMoves,
  pokemonFormLevelMoves as pokemonSpeciesFormLevelMoves,
  pokemonSpeciesLevelMoves,
} from "#app/data/balance/pokemon-level-moves";
import type { Stat } from "#enums/stat";
import type { Variant, VariantSet } from "#app/sprites/variant";
import { populateVariantColorCache, variantColorCache, variantData } from "#app/sprites/variant";
import { speciesStarterCosts, POKERUS_STARTER_COUNT } from "#app/data/balance/starters";
import { SpeciesFormKey } from "#enums/species-form-key";
import { starterPassiveAbilities } from "#app/data/balance/passives";
import { loadPokemonVariantAssets } from "#app/sprites/pokemon-sprite";
import { hasExpSprite } from "#app/sprites/sprite-utils";
import { Gender } from "./gender";



export enum Region {
  NORMAL,
  ALOLA,
  GALAR,
  HISUI,
  PALDEA,
}

// TODO: this is horrible and will need to be removed once a refactor/cleanup of forms is executed.
export const normalForm: Species[] = [
  Species.PIKACHU,
  Species.RAICHU,
  Species.EEVEE,
  Species.JOLTEON,
  Species.FLAREON,
  Species.VAPOREON,
  Species.ESPEON,
  Species.UMBREON,
  Species.LEAFEON,
  Species.GLACEON,
  Species.SYLVEON,
  Species.PICHU,
  Species.ROTOM,
  Species.DIALGA,
  Species.PALKIA,
  Species.KYUREM,
  Species.GENESECT,
  Species.FROAKIE,
  Species.FROGADIER,
  Species.GRENINJA,
  Species.ROCKRUFF,
  Species.NECROZMA,
  Species.MAGEARNA,
  Species.MARSHADOW,
  Species.CRAMORANT,
  Species.ZARUDE,
  Species.CALYREX,
];

/**
 * Gets the {@linkcode PokemonSpecies} object associated with the {@linkcode Species} enum given
 * @param species The species to fetch
 * @returns The associated {@linkcode PokemonSpecies} object
 */
export function getPokemonSpecies(species: Species | Species[]): PokemonSpecies {
  // If a special pool (named trainers) is used here it CAN happen that they have a array as species (which means choose one of those two). So we catch that with this code block
  if (Array.isArray(species)) {
    // Pick a random species from the list
    species = species[Math.floor(Math.random() * species.length)];
  }
  if (species >= 2000) {
    return allSpecies.find(s => s.speciesId === species)!; // TODO: is this bang correct?
  }
  return allSpecies[species - 1];
}

export function getPokemonSpeciesForm(species: Species, formIndex: number): PokemonSpeciesForm {
  const retSpecies: PokemonSpecies =
    species >= 2000
      ? allSpecies.find(s => s.speciesId === species)! // TODO: is the bang correct?
      : allSpecies[species - 1];
  if (formIndex < retSpecies.forms?.length) {
    return retSpecies.forms[formIndex];
  }
  return retSpecies;
}

export function getFusedSpeciesName(speciesAName: string, speciesBName: string): string {
  const fragAPattern = /([a-z]{2}.*?[aeiou(?:y$)\-\']+)(.*?)$/i;
  const fragBPattern = /([a-z]{2}.*?[aeiou(?:y$)\-\'])(.*?)$/i;

  const [speciesAPrefixMatch, speciesBPrefixMatch] = [speciesAName, speciesBName].map(n => /^(?:[^ ]+) /.exec(n));
  const [speciesAPrefix, speciesBPrefix] = [speciesAPrefixMatch, speciesBPrefixMatch].map(m => (m ? m[0] : ""));

  if (speciesAPrefix) {
    speciesAName = speciesAName.slice(speciesAPrefix.length);
  }
  if (speciesBPrefix) {
    speciesBName = speciesBName.slice(speciesBPrefix.length);
  }

  const [speciesASuffixMatch, speciesBSuffixMatch] = [speciesAName, speciesBName].map(n => / (?:[^ ]+)$/.exec(n));
  const [speciesASuffix, speciesBSuffix] = [speciesASuffixMatch, speciesBSuffixMatch].map(m => (m ? m[0] : ""));

  if (speciesASuffix) {
    speciesAName = speciesAName.slice(0, -speciesASuffix.length);
  }
  if (speciesBSuffix) {
    speciesBName = speciesBName.slice(0, -speciesBSuffix.length);
  }

  const splitNameA = speciesAName.split(/ /g);
  const splitNameB = speciesBName.split(/ /g);

  const fragAMatch = fragAPattern.exec(speciesAName);
  const fragBMatch = fragBPattern.exec(speciesBName);

  let fragA: string;
  let fragB: string;

  fragA = splitNameA.length === 1 ? (fragAMatch ? fragAMatch[1] : speciesAName) : splitNameA[splitNameA.length - 1];

  if (splitNameB.length === 1) {
    if (fragBMatch) {
      const lastCharA = fragA.slice(fragA.length - 1);
      const prevCharB = fragBMatch[1].slice(fragBMatch.length - 1);
      fragB = (/[\-']/.test(prevCharB) ? prevCharB : "") + fragBMatch[2] || prevCharB;
      if (lastCharA === fragB[0]) {
        if (/[aiu]/.test(lastCharA)) {
          fragB = fragB.slice(1);
        } else {
          const newCharMatch = new RegExp(`[^${lastCharA}]`).exec(fragB);
          if (newCharMatch?.index !== undefined && newCharMatch.index > 0) {
            fragB = fragB.slice(newCharMatch.index);
          }
        }
      }
    } else {
      fragB = speciesBName;
    }
  } else {
    fragB = splitNameB[splitNameB.length - 1];
  }

  if (splitNameA.length > 1) {
    fragA = `${splitNameA.slice(0, splitNameA.length - 1).join(" ")} ${fragA}`;
  }

  fragB = `${fragB.slice(0, 1).toLowerCase()}${fragB.slice(1)}`;

  return `${speciesAPrefix || speciesBPrefix}${fragA}${fragB}${speciesBSuffix || speciesASuffix}`;
}

export type PokemonSpeciesFilter = (species: PokemonSpecies) => boolean;

export abstract class PokemonSpeciesForm {
  public speciesId: Species;
  protected _formIndex: number;
  protected _generation: number;
  readonly type1: PokemonType;
  readonly type2: PokemonType | null;
  readonly height: number;
  readonly weight: number;
  readonly ability1: Abilities;
  readonly ability2: Abilities;
  readonly abilityHidden: Abilities;
  readonly baseTotal: number;
  readonly baseStats: number[];
  readonly catchRate: number;
  readonly baseFriendship: number;
  readonly baseExp: number;
  readonly genderDiffs: boolean;
  readonly isStarterSelectable: boolean;

  constructor(
    type1: PokemonType,
    type2: PokemonType | null,
    height: number,
    weight: number,
    ability1: Abilities,
    ability2: Abilities,
    abilityHidden: Abilities,
    baseTotal: number,
    baseHp: number,
    baseAtk: number,
    baseDef: number,
    baseSpatk: number,
    baseSpdef: number,
    baseSpd: number,
    catchRate: number,
    baseFriendship: number,
    baseExp: number,
    genderDiffs: boolean,
    isStarterSelectable: boolean,
  ) {
    this.type1 = type1;
    this.type2 = type2;
    this.height = height;
    this.weight = weight;
    this.ability1 = ability1;
    this.ability2 = ability2 === Abilities.NONE ? ability1 : ability2;
    this.abilityHidden = abilityHidden;
    this.baseTotal = baseTotal;
    this.baseStats = [baseHp, baseAtk, baseDef, baseSpatk, baseSpdef, baseSpd];
    this.catchRate = catchRate;
    this.baseFriendship = baseFriendship;
    this.baseExp = baseExp;
    this.genderDiffs = genderDiffs;
    this.isStarterSelectable = isStarterSelectable;
  }

  /**
   * Method to get the root species id of a Pokemon.
   * Magmortar.getRootSpeciesId(true) => Magmar
   * Magmortar.getRootSpeciesId(false) => Magby
   * @param forStarter boolean to get the nonbaby form of a starter
   * @returns The species
   */
  getRootSpeciesId(forStarter = false): Species {
    let ret = this.speciesId;
    while (pokemonPrevolutions.hasOwnProperty(ret) && (!forStarter || !speciesStarterCosts.hasOwnProperty(ret))) {
      ret = pokemonPrevolutions[ret];
    }
    return ret;
  }

  get generation(): number {
    return this._generation;
  }

  set generation(generation: number) {
    this._generation = generation;
  }

  get formIndex(): number {
    return this._formIndex;
  }

  set formIndex(formIndex: number) {
    this._formIndex = formIndex;
  }

  isOfType(type: number): boolean {
    return this.type1 === type || (this.type2 !== null && this.type2 === type);
  }

  /**
   * Method to get the total number of abilities a Pokemon species has.
   * @returns Number of abilities
   */
  getAbilityCount(): number {
    return this.abilityHidden !== Abilities.NONE ? 3 : 2;
  }

  /**
   * Method to get the ability of a Pokemon species.
   * @param abilityIndex Which ability to get (should only be 0-2)
   * @returns The id of the Ability
   */
  getAbility(abilityIndex: number): Abilities {
    let ret: Abilities;
    if (abilityIndex === 0) {
      ret = this.ability1;
    } else if (abilityIndex === 1) {
      ret = this.ability2;
    } else {
      ret = this.abilityHidden;
    }
    return ret;
  }

  /**
   * Method to get the passive ability of a Pokemon species
   * @param formIndex The form index to use, defaults to form for this species instance
   * @returns The id of the ability
   */
  getPassiveAbility(formIndex?: number): Abilities {
    if (isNullOrUndefined(formIndex)) {
      formIndex = this.formIndex;
    }
    let starterSpeciesId = this.speciesId;
    while (
      !(starterSpeciesId in starterPassiveAbilities) ||
      !(formIndex in starterPassiveAbilities[starterSpeciesId])
    ) {
      if (pokemonPrevolutions.hasOwnProperty(starterSpeciesId)) {
        starterSpeciesId = pokemonPrevolutions[starterSpeciesId];
      } else {
        // If we've reached the base species and still haven't found a matching ability, use form 0 if possible
        if (0 in starterPassiveAbilities[starterSpeciesId]) {
          return starterPassiveAbilities[starterSpeciesId][0];
        }
        console.log("No passive ability found for %s, using run away", this.speciesId);
        return Abilities.RUN_AWAY;
      }
    }
    return starterPassiveAbilities[starterSpeciesId][formIndex];
  }

  getLevelMoves(): LevelMoves {
    if (
      pokemonSpeciesFormLevelMoves.hasOwnProperty(this.speciesId) &&
      pokemonSpeciesFormLevelMoves[this.speciesId].hasOwnProperty(this.formIndex)
    ) {
      return pokemonSpeciesFormLevelMoves[this.speciesId][this.formIndex].slice(0);
    }
    return pokemonSpeciesLevelMoves[this.speciesId].slice(0);
  }

  getRegion(): Region {
    return Math.floor(this.speciesId / 2000) as Region;
  }

  isObtainable(): boolean {
    return this.generation <= 9 || pokemonPrevolutions.hasOwnProperty(this.speciesId);
  }

  isCatchable(): boolean {
    return this.isObtainable() && uncatchableSpecies.indexOf(this.speciesId) === -1;
  }

  isRegional(): boolean {
    return this.getRegion() > Region.NORMAL;
  }

  isTrainerForbidden(): boolean {
    return [Species.ETERNAL_FLOETTE, Species.BLOODMOON_URSALUNA].includes(this.speciesId);
  }

  isRareRegional(): boolean {
    switch (this.getRegion()) {
      case Region.HISUI:
        return true;
    }

    return false;
  }

  /**
   * Gets the BST for the species
   * @returns The species' BST.
   */
  getBaseStatTotal(): number {
    return this.baseStats.reduce((i, n) => n + i);
  }

  /**
   * Gets the species' base stat amount for the given stat.
   * @param stat  The desired stat.
   * @returns The species' base stat amount.
   */
  getBaseStat(stat: Stat): number {
    return this.baseStats[stat];
  }

  getBaseExp(): number {
    let ret = this.baseExp;
    switch (this.getFormSpriteKey()) {
      case SpeciesFormKey.MEGA:
      case SpeciesFormKey.MEGA_X:
      case SpeciesFormKey.MEGA_Y:
      case SpeciesFormKey.PRIMAL:
      case SpeciesFormKey.GIGANTAMAX:
      case SpeciesFormKey.ETERNAMAX:
        ret *= 1.5;
        break;
    }
    return ret;
  }

  getSpriteAtlasPath(female: boolean, formIndex?: number, shiny?: boolean, variant?: number, back?: boolean,isin?: boolean): string {
    const spriteId = this.getSpriteId(female, formIndex, shiny, variant, back,isin).replace(/\_{2}/g, "/");
    return `${/_[1-3]$/.test(spriteId) ? "variant/" : ""}${spriteId}`;
  }

  getBaseSpriteKey(female: boolean, formIndex?: number): string {
    if (formIndex === undefined || this instanceof PokemonForm) {
      formIndex = this.formIndex;
    }

    const formSpriteKey = this.getFormSpriteKey(formIndex);
    const showGenderDiffs =
      this.genderDiffs &&
      female &&
      ![SpeciesFormKey.MEGA, SpeciesFormKey.GIGANTAMAX].includes(formSpriteKey as SpeciesFormKey);

    return `${showGenderDiffs ? "female__" : ""}${this.speciesId}${formSpriteKey ? `-${formSpriteKey}` : ""}`;
  }

  /** Compute the sprite ID of the pokemon form. */
  getSpriteId(female: boolean, formIndex?: number, shiny?: boolean, variant = 0, back = false,  isin=false): string {
    const baseSpriteKey = this.getBaseSpriteKey(female, formIndex);
    let config = variantData;
    `${back ? "back__" : ""}${baseSpriteKey}`.split("__").map(p => (config ? (config = config[p]) : null));
    const variantSet = config as VariantSet;

    return `${back ? "back__" : ""}${isin ? "in__" : ""}${shiny && (!variantSet || (!variant && !variantSet[variant || 0])) ? "shiny__" : ""}${baseSpriteKey}${shiny && variantSet && variantSet[variant] === 2 ? `_${variant + 1}` : ""}`;
  }

  getSpriteKey(female: boolean, formIndex?: number, shiny?: boolean, variant?: number, back?: boolean,isin?: boolean): string {
    return `pkmn__${this.getSpriteId(female, formIndex, shiny, variant, back, isin)}`;
  }

  abstract getFormSpriteKey(formIndex?: number): string;

  /**
   * Variant Data key/index is either species id or species id followed by -formkey
   * @param formIndex optional form index for pokemon with different forms
   * @returns species id if no additional forms, index with formkey if a pokemon with a form
   */
  getVariantDataIndex(formIndex?: number) {
    let formkey: string | null = null;
    let variantDataIndex: number | string = this.speciesId;
    const species = getPokemonSpecies(this.speciesId);
    if (species.forms.length > 0 && formIndex !== undefined) {
      formkey = species.forms[formIndex]?.getFormSpriteKey(formIndex);
      if (formkey) {
        variantDataIndex = `${this.speciesId}-${formkey}`;
      }
    }
    return variantDataIndex;
  }

  getIconAtlasKey(formIndex?: number, shiny?: boolean, variant?: number): string {
    const variantDataIndex = this.getVariantDataIndex(formIndex);
    const isVariant =
      shiny && variantData[variantDataIndex] && variant !== undefined && variantData[variantDataIndex][variant];
    return `pokemon_icons_${this.generation}${isVariant ? "v" : ""}`;
  }

  getIconId(female: boolean, formIndex?: number, shiny?: boolean, variant?: number): string {
    if (formIndex === undefined) {
      formIndex = this.formIndex;
    }

    const variantDataIndex = this.getVariantDataIndex(formIndex);

    let ret = this.speciesId.toString();

    const isVariant =
      shiny && variantData[variantDataIndex] && variant !== undefined && variantData[variantDataIndex][variant];

    if (shiny && !isVariant) {
      ret += "s";
    }

    switch (this.speciesId) {
      case Species.DODUO:
      case Species.DODRIO:
      case Species.MEGANIUM:
      case Species.TORCHIC:
      case Species.COMBUSKEN:
      case Species.BLAZIKEN:
      case Species.HIPPOPOTAS:
      case Species.HIPPOWDON:
      case Species.UNFEZANT:
      case Species.FRILLISH:
      case Species.JELLICENT:
      case Species.PYROAR:
        ret += female ? "-f" : "";
        break;
    }

    let formSpriteKey = this.getFormSpriteKey(formIndex);
    if (formSpriteKey) {
      switch (this.speciesId) {
        case Species.DUDUNSPARCE:
          break;
        case Species.ZACIAN:
        case Species.ZAMAZENTA:
          // biome-ignore lint/suspicious/noFallthroughSwitchClause: Falls through
          if (formSpriteKey.startsWith("behemoth")) {
            formSpriteKey = "crowned";
          }
        default:
          ret += `-${formSpriteKey}`;
          break;
      }
    }

    if (isVariant) {
      ret += `_${variant + 1}`;
    }

    return ret;
  }

  getCryKey(formIndex?: number): string {
    let speciesId = this.speciesId;
    if (this.speciesId > 2000) {
      switch (this.speciesId) {
        case Species.GALAR_SLOWPOKE:
          break;
        case Species.ETERNAL_FLOETTE:
          break;
        case Species.BLOODMOON_URSALUNA:
          break;
        default:
          speciesId = speciesId % 2000;
          break;
      }
    }
    let ret = speciesId.toString();
    const forms = getPokemonSpecies(speciesId).forms;
    if (forms.length) {
      if (formIndex !== undefined && formIndex >= forms.length) {
        console.warn(
          `Attempted accessing form with index ${formIndex} of species ${getPokemonSpecies(speciesId).getName()} with only ${forms.length || 0} forms`,
        );
        formIndex = Math.min(formIndex, forms.length - 1);
      }
      const formKey = forms[formIndex || 0].formKey;
      switch (formKey) {
        case SpeciesFormKey.MEGA:
        case SpeciesFormKey.MEGA_X:
        case SpeciesFormKey.MEGA_Y:
        case SpeciesFormKey.GIGANTAMAX:
        case SpeciesFormKey.GIGANTAMAX_SINGLE:
        case SpeciesFormKey.GIGANTAMAX_RAPID:
        case "white":
        case "black":
        case "therian":
        case "sky":
        case "gorging":
        case "gulping":
        case "no-ice":
        case "hangry":
        case "crowned":
        case "eternamax":
        case "four":
        case "droopy":
        case "stretchy":
        case "hero":
        case "roaming":
        case "complete":
        case "10-complete":
        case "10":
        case "10-pc":
        case "super":
        case "unbound":
        case "pau":
        case "pompom":
        case "sensu":
        case "dusk":
        case "midnight":
        case "school":
        case "dawn-wings":
        case "dusk-mane":
        case "ultra":
          ret += `-${formKey}`;
          break;
      }
    }
    return `cry/${ret}`;
  }

  validateStarterMoveset(moveset: StarterMoveset, eggMoves: number): boolean {
    const rootSpeciesId = this.getRootSpeciesId();
    for (const moveId of moveset) {
      if (speciesEggMoves.hasOwnProperty(rootSpeciesId)) {
        const eggMoveIndex = speciesEggMoves[rootSpeciesId].findIndex(m => m === moveId);
        if (eggMoveIndex > -1 && eggMoves & (1 << eggMoveIndex)) {
          continue;
        }
      }
      if (
        pokemonFormLevelMoves.hasOwnProperty(this.speciesId) &&
        pokemonFormLevelMoves[this.speciesId].hasOwnProperty(this.formIndex)
      ) {
        if (!pokemonFormLevelMoves[this.speciesId][this.formIndex].find(lm => lm[0] <= 5 && lm[1] === moveId)) {
          return false;
        }
      } else if (!pokemonSpeciesLevelMoves[this.speciesId].find(lm => lm[0] <= 5 && lm[1] === moveId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Load the variant colors for the species into the variant color cache
   *
   * @param spriteKey - The sprite key to use
   * @param female - Whether to load female instead of male
   * @param back - Whether the back sprite is being loaded
   *
   */
  async loadVariantColors(
    spriteKey: string,
    female: boolean,
    variant: Variant,
    back = false,
    formIndex?: number,
  ): Promise<void> {
    let baseSpriteKey = this.getBaseSpriteKey(female, formIndex);
    if (back) {
      baseSpriteKey = "back__" + baseSpriteKey;
    }

    if (variantColorCache.hasOwnProperty(baseSpriteKey)) {
      // Variant colors have already been loaded
      return;
    }

    const variantInfo = variantData[this.getVariantDataIndex(formIndex)];
    // Do nothing if there is no variant information or the variant does not have color replacements
    if (!variantInfo || variantInfo[variant] !== 1) {
      return;
    }

    await populateVariantColorCache(
      "pkmn__" + baseSpriteKey,
      globalScene.experimentalSprites && hasExpSprite(spriteKey),
      baseSpriteKey.replace("__", "/"),
    );
  }

  async loadAssets(
    female: boolean,
    formIndex?: number,
    shiny = false,
    variant?: Variant,
    startLoad = false,
    back = false
  ): Promise<void> {

    // We need to populate the color cache for this species' variant
    const spriteKey_isin = this.getSpriteKey(female, formIndex, shiny, variant, back,true);
    const spriteKey = this.getSpriteKey(female, formIndex, shiny, variant, back);

    globalScene.loadPokemonAtlas(spriteKey, this.getSpriteAtlasPath(female, formIndex, shiny, variant));
        globalScene.loadPokemonAtlas(spriteKey_isin, this.getSpriteAtlasPath(female, formIndex, shiny, variant,back,true));

    globalScene.load.audio(this.getCryKey(formIndex), `audio/${this.getCryKey(formIndex)}.m4a`);
    if (!isNullOrUndefined(variant)) {
      await this.loadVariantColors(spriteKey, female, variant, back, formIndex);
    }


    return new Promise<void>(resolve => {
      globalScene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        const originalWarn = console.warn;
        // Ignore warnings for missing frames, because there will be a lot
        console.warn = () => {};

	const frameNames = globalScene.anims.generateFrameNames(spriteKey, {
          zeroPad: 4,
          suffix: ".png",
          start: 1,
          end: 240,
        });
        const frameNames1 = globalScene.anims.generateFrameNames(spriteKey_isin, {
          zeroPad: 4,
          suffix: ".png",
          start: 1,
          end: 240,
        });
        console.warn = originalWarn;

        if (!globalScene.anims.exists(spriteKey_isin)) {
          globalScene.anims.create({
            key:  this.getSpriteKey(female, formIndex, shiny, variant, back,true),
            frames: frameNames1,
            frameRate: 10,
            repeat: 0,
          });
        } else {
          globalScene.anims.get(spriteKey).frameRate = 10;
        }

        if (!globalScene.anims.exists(spriteKey)) {
          globalScene.anims.create({
            key:  this.getSpriteKey(female, formIndex, shiny, variant, back),
            frames: frameNames,
            frameRate: 10,
            repeat: -1,
          });
        } else {
          globalScene.anims.get(spriteKey).frameRate = 10;
        }


        const spritePath = this.getSpriteAtlasPath(female, formIndex, shiny, variant, back)
          .replace("variant/", "")
          .replace(/_[1-3]$/, "");
        if (!isNullOrUndefined(variant)) {
          loadPokemonVariantAssets(spriteKey, spritePath, variant).then(() => resolve());
        }
      });
      if (startLoad) {
        if (!globalScene.load.isLoading()) {
          globalScene.load.start();
        }
      } else {
        resolve();
      }
    });
  }

  cry(soundConfig?: Phaser.Types.Sound.SoundConfig, ignorePlay?: boolean): AnySound {
    const cryKey = this.getCryKey(this.formIndex);
    let cry: AnySound | null = globalScene.sound.get(cryKey) as AnySound;
    if (cry?.pendingRemove) {
      cry = null;
    }
    cry = globalScene.playSound(cry ?? cryKey, soundConfig);
    if (ignorePlay) {
      cry.stop();
    }
    return cry;
  }

  generateCandyColors(): number[][] {
    const sourceTexture = globalScene.textures.get(this.getSpriteKey(false));

    const sourceFrame = sourceTexture.frames[sourceTexture.firstFrame];
    const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement;

    const canvas = document.createElement("canvas");

    const spriteColors: number[][] = [];

    const context = canvas.getContext("2d");
    const frame = sourceFrame;
    canvas.width = frame.width;
    canvas.height = frame.height;
    context?.drawImage(sourceImage, frame.cutX, frame.cutY, frame.width, frame.height, 0, 0, frame.width, frame.height);
    const imageData = context?.getImageData(frame.cutX, frame.cutY, frame.width, frame.height);
    const pixelData = imageData?.data;
    const pixelColors: number[] = [];

    if (pixelData?.length !== undefined) {
      for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3]) {
          const pixel = pixelData.slice(i, i + 4);
          const [r, g, b, a] = pixel;
          if (!spriteColors.find(c => c[0] === r && c[1] === g && c[2] === b)) {
            spriteColors.push([r, g, b, a]);
          }
        }
      }

      for (let i = 0; i < pixelData.length; i += 4) {
        const total = pixelData.slice(i, i + 3).reduce((total: number, value: number) => total + value, 0);
        if (!total) {
          continue;
        }
        pixelColors.push(
          argbFromRgba({
            r: pixelData[i],
            g: pixelData[i + 1],
            b: pixelData[i + 2],
            a: pixelData[i + 3],
          }),
        );
      }
    }

    let paletteColors: Map<number, number> = new Map();

    const originalRandom = Math.random;
    Math.random = Phaser.Math.RND.frac;

    globalScene.executeWithSeedOffset(
      () => {
        paletteColors = QuantizerCelebi.quantize(pixelColors, 2);
      },
      0,
      "This result should not vary",
    );

    Math.random = originalRandom;

    return Array.from(paletteColors.keys()).map(c => Object.values(rgbaFromArgb(c)) as number[]);
  }
}

export default class PokemonSpecies extends PokemonSpeciesForm implements Localizable {
  public name: string;
  readonly subLegendary: boolean;
  readonly legendary: boolean;
  readonly mythical: boolean;
  readonly species: string;
  readonly growthRate: GrowthRate;
  readonly malePercent: number | null;
  readonly genderDiffs: boolean;
  readonly canChangeForm: boolean;
  readonly forms: PokemonForm[];

  constructor(
    id: Species,
    generation: number,
    subLegendary: boolean,
    legendary: boolean,
    mythical: boolean,
    species: string,
    type1: PokemonType,
    type2: PokemonType | null,
    height: number,
    weight: number,
    ability1: Abilities,
    ability2: Abilities,
    abilityHidden: Abilities,
    baseTotal: number,
    baseHp: number,
    baseAtk: number,
    baseDef: number,
    baseSpatk: number,
    baseSpdef: number,
    baseSpd: number,
    catchRate: number,
    baseFriendship: number,
    baseExp: number,
    growthRate: GrowthRate,
    malePercent: number | null,
    genderDiffs: boolean,
    canChangeForm?: boolean,
    ...forms: PokemonForm[]
  ) {
    super(
      type1,
      type2,
      height,
      weight,
      ability1,
      ability2,
      abilityHidden,
      baseTotal,
      baseHp,
      baseAtk,
      baseDef,
      baseSpatk,
      baseSpdef,
      baseSpd,
      catchRate,
      baseFriendship,
      baseExp,
      genderDiffs,
      false,
    );
    this.speciesId = id;
    this.formIndex = 0;
    this.generation = generation;
    this.subLegendary = subLegendary;
    this.legendary = legendary;
    this.mythical = mythical;
    this.species = species;
    this.growthRate = growthRate;
    this.malePercent = malePercent;
    this.genderDiffs = genderDiffs;
    this.canChangeForm = !!canChangeForm;
    this.forms = forms;

    this.localize();

    forms.forEach((form, f) => {
      form.speciesId = id;
      form.formIndex = f;
      form.generation = generation;
    });
  }

  getName(formIndex?: number): string {
    if (formIndex !== undefined && this.forms.length) {
      const form = this.forms[formIndex];
      let key: string | null;
      switch (form.formKey) {
        case SpeciesFormKey.MEGA:
        case SpeciesFormKey.PRIMAL:
        case SpeciesFormKey.ETERNAMAX:
        case SpeciesFormKey.MEGA_X:
        case SpeciesFormKey.MEGA_Y:
          key = form.formKey;
          break;
        default:
          if (form.formKey.indexOf(SpeciesFormKey.GIGANTAMAX) > -1) {
            key = "gigantamax";
          } else {
            key = null;
          }
      }

      if (key) {
        return i18next.t(`battlePokemonForm:${key}`, {
          pokemonName: this.name,
        });
      }
    }
    return this.name;
  }

  /**
   * Pick and return a random {@linkcode Gender} for a {@linkcode Pokemon}.
   * @returns A randomly rolled gender based on this Species' {@linkcode malePercent}.
   */
  generateGender(): Gender {
    if (isNullOrUndefined(this.malePercent)) {
      return Gender.GENDERLESS;
    }

    if (Phaser.Math.RND.realInRange(0, 1) <= this.malePercent) {
      return Gender.MALE;
    }
    return Gender.FEMALE;
  }

  /**
   * Find the name of species with proper attachments for regionals and separate starter forms (Floette, Ursaluna)
   * @returns a string with the region name or other form name attached
   */
  getExpandedSpeciesName(): string {
    if (this.speciesId < 2000) {
      return this.name; // Other special cases could be put here too
    }
    // Everything beyond this point essentially follows the pattern of FORMNAME_SPECIES
    return i18next.t(`pokemonForm:appendForm.${Species[this.speciesId].split("_")[0]}`, { pokemonName: this.name });
  }

  /**
   * Find the form name for species with just one form (regional variants, Floette, Ursaluna)
   * @param formIndex The form index to check (defaults to 0)
   * @param append Whether to append the species name to the end (defaults to false)
   * @returns the pokemon-form locale key for the single form name ("Alolan Form", "Eternal Flower" etc)
   */
  getFormNameToDisplay(formIndex = 0, append = false): string {
    const formKey = this.forms?.[formIndex!]?.formKey;
    const formText = capitalizeString(formKey, "-", false, false) || "";
    const speciesName = capitalizeString(Species[this.speciesId], "_", true, false);
    let ret = "";

    const region = this.getRegion();
    if (this.speciesId === Species.ARCEUS) {
      ret = i18next.t(`pokemonInfo:Type.${formText?.toUpperCase()}`);
    } else if (
      [
        SpeciesFormKey.MEGA,
        SpeciesFormKey.MEGA_X,
        SpeciesFormKey.MEGA_Y,
        SpeciesFormKey.PRIMAL,
        SpeciesFormKey.GIGANTAMAX,
        SpeciesFormKey.GIGANTAMAX_RAPID,
        SpeciesFormKey.GIGANTAMAX_SINGLE,
        SpeciesFormKey.ETERNAMAX,
      ].includes(formKey as SpeciesFormKey)
    ) {
      return append
        ? i18next.t(`battlePokemonForm:${formKey}`, { pokemonName: this.name })
        : i18next.t(`pokemonForm:battleForm.${formKey}`);
    } else if (
      region === Region.NORMAL ||
      (this.speciesId === Species.GALAR_DARMANITAN && formIndex > 0) ||
      this.speciesId === Species.PALDEA_TAUROS
    ) {
      // More special cases can be added here
      const i18key = `pokemonForm:${speciesName}${formText}`;
      if (i18next.exists(i18key)) {
        ret = i18next.t(i18key);
      } else {
        const rootSpeciesName = capitalizeString(Species[this.getRootSpeciesId()], "_", true, false);
        const i18RootKey = `pokemonForm:${rootSpeciesName}${formText}`;
        ret = i18next.exists(i18RootKey) ? i18next.t(i18RootKey) : formText;
      }
    } else if (append) {
      // Everything beyond this has an expanded name
      return this.getExpandedSpeciesName();
    } else if (this.speciesId === Species.ETERNAL_FLOETTE) {
      // Not a real form, so the key is made up
      return i18next.t("pokemonForm:floetteEternalFlower");
    } else if (this.speciesId === Species.BLOODMOON_URSALUNA) {
      // Not a real form, so the key is made up
      return i18next.t("pokemonForm:ursalunaBloodmoon");
    } else {
      // Only regional forms should be left at this point
      return i18next.t(`pokemonForm:regionalForm.${Region[region]}`);
    }
    return append
      ? i18next.t("pokemonForm:appendForm.GENERIC", {
          pokemonName: this.name,
          formName: ret,
        })
      : ret;
  }

  localize(): void {
    this.name = i18next.t(`pokemon:${Species[this.speciesId].toLowerCase()}`);
  }

  getWildSpeciesForLevel(level: number, allowEvolving: boolean, isBoss: boolean, gameMode: GameMode): Species {
    return this.getSpeciesForLevel(
      level,
      allowEvolving,
      false,
      (isBoss ? PartyMemberStrength.WEAKER : PartyMemberStrength.AVERAGE) + (gameMode?.isEndless ? 1 : 0),
    );
  }

  getTrainerSpeciesForLevel(
    level: number,
    allowEvolving = false,
    strength: PartyMemberStrength,
    currentWave = 0,
  ): Species {
    return this.getSpeciesForLevel(level, allowEvolving, true, strength, currentWave);
  }

  /**
   * @see {@linkcode getSpeciesForLevel} uses an ease in and ease out sine function:
   * @see {@link https://easings.net/#easeInSine}
   * @see {@link https://easings.net/#easeOutSine}
   * Ease in is similar to an exponential function with slower growth, as in, x is directly related to y, and increase in y is higher for higher x.
   * Ease out looks more similar to a logarithmic function shifted to the left. It's still a direct relation but it plateaus instead of increasing in growth.
   *
   * This function is used to calculate the x given to these functions, which is used for evolution chance.
   *
   * First is maxLevelDiff, which is a denominator for evolution chance for mons without wild evolution delay.
   * This means a lower value of x will lead to a higher evolution chance.
   *
   * It's also used for preferredMinLevel, which is used when an evolution delay exists.
   * The calculation with evolution delay is a weighted average of the easeIn and easeOut functions where preferredMinLevel is the denominator.
   * This also means a lower value of x will lead to a higher evolution chance.
   * @param strength {@linkcode PartyMemberStrength} The strength of the party member in question
   * @returns {@linkcode number} The level difference from expected evolution level tolerated for a mon to be unevolved. Lower value = higher evolution chance.
   */
  private getStrengthLevelDiff(strength: PartyMemberStrength): number {
    switch (Math.min(strength, PartyMemberStrength.STRONGER)) {
      case PartyMemberStrength.WEAKEST:
        return 60;
      case PartyMemberStrength.WEAKER:
        return 40;
      case PartyMemberStrength.WEAK:
        return 20;
      case PartyMemberStrength.AVERAGE:
        return 8;
      case PartyMemberStrength.STRONG:
        return 4;
      default:
        return 0;
    }
  }

  getSpeciesForLevel(
    level: number,
    allowEvolving = false,
    forTrainer = false,
    strength: PartyMemberStrength = PartyMemberStrength.WEAKER,
    currentWave = 0,
  ): Species {
    const prevolutionLevels = this.getPrevolutionLevels();

    if (prevolutionLevels.length) {
      for (let pl = prevolutionLevels.length - 1; pl >= 0; pl--) {
        const prevolutionLevel = prevolutionLevels[pl];
        if (level < prevolutionLevel[1]) {
          return prevolutionLevel[0];
        }
      }
    }

    if (
      // If evolutions shouldn't happen, add more cases here :)
      !allowEvolving ||
      !pokemonEvolutions.hasOwnProperty(this.speciesId) ||
      (globalScene.currentBattle?.waveIndex === 20 &&
        globalScene.gameMode.isClassic &&
        globalScene.currentBattle.trainer)
    ) {
      return this.speciesId;
    }

    const evolutions = pokemonEvolutions[this.speciesId];

    const easeInFunc = Phaser.Tweens.Builders.GetEaseFunction("Sine.easeIn");
    const easeOutFunc = Phaser.Tweens.Builders.GetEaseFunction("Sine.easeOut");

    const evolutionPool: Map<number, Species> = new Map();
    let totalWeight = 0;
    let noEvolutionChance = 1;

    for (const ev of evolutions) {
      if (ev.level > level) {
        continue;
      }

      let evolutionChance: number;

      const evolutionSpecies = getPokemonSpecies(ev.speciesId);
      const isRegionalEvolution = !this.isRegional() && evolutionSpecies.isRegional();

      if (!forTrainer && isRegionalEvolution) {
        evolutionChance = 0;
      } else {
        if (ev.wildDelay === SpeciesWildEvolutionDelay.NONE) {
          if (strength === PartyMemberStrength.STRONGER) {
            evolutionChance = 1;
          } else {
            const maxLevelDiff = this.getStrengthLevelDiff(strength); //The maximum distance from the evolution level tolerated for the mon to not evolve
            const minChance: number = 0.875 - 0.125 * strength;

            evolutionChance = Math.min(
              minChance + easeInFunc(Math.min(level - ev.level, maxLevelDiff) / maxLevelDiff) * (1 - minChance),
              1,
            );
          }
        } else {
          const preferredMinLevel = Math.max(ev.level - 1 + ev.wildDelay! * this.getStrengthLevelDiff(strength), 1); // TODO: is the bang correct?
          let evolutionLevel = Math.max(ev.level > 1 ? ev.level : Math.floor(preferredMinLevel / 2), 1);

          if (ev.level <= 1 && pokemonPrevolutions.hasOwnProperty(this.speciesId)) {
            const prevolutionLevel = pokemonEvolutions[pokemonPrevolutions[this.speciesId]].find(
              ev => ev.speciesId === this.speciesId,
            )!.level; // TODO: is the bang correct?
            if (prevolutionLevel > 1) {
              evolutionLevel = prevolutionLevel;
            }
          }

          evolutionChance = Math.min(
            0.65 * easeInFunc(Math.min(Math.max(level - evolutionLevel, 0), preferredMinLevel) / preferredMinLevel) +
              0.35 *
                easeOutFunc(
                  Math.min(Math.max(level - evolutionLevel, 0), preferredMinLevel * 2.5) / (preferredMinLevel * 2.5),
                ),
            1,
          );
        }
      }

      //TODO: Adjust templates and delays so we don't have to hardcode it
      /* TEMPORARY! (Most) Trainers shouldn't be using unevolved Pokemon by the third gym leader / wave 80. Exceptions to this include Breeders, whose large teams are balanced by the use of weaker pokemon */
      if (currentWave >= 80 && forTrainer && strength > PartyMemberStrength.WEAKER) {
        evolutionChance = 1;
        noEvolutionChance = 0;
      }

      if (evolutionChance > 0) {
        if (isRegionalEvolution) {
          evolutionChance /= evolutionSpecies.isRareRegional() ? 16 : 4;
        }

        totalWeight += evolutionChance;

        evolutionPool.set(totalWeight, ev.speciesId);

        if (1 - evolutionChance < noEvolutionChance) {
          noEvolutionChance = 1 - evolutionChance;
        }
      }
    }

    if (noEvolutionChance === 1 || Phaser.Math.RND.realInRange(0, 1) < noEvolutionChance) {
      return this.speciesId;
    }

    const randValue = evolutionPool.size === 1 ? 0 : randSeedInt(totalWeight);

    for (const weight of evolutionPool.keys()) {
      if (randValue < weight) {
        // TODO: this entire function is dumb and should be changed, adding a `!` here for now until then
        return getPokemonSpecies(evolutionPool.get(weight)!).getSpeciesForLevel(
          level,
          true,
          forTrainer,
          strength,
          currentWave,
        );
      }
    }

    return this.speciesId;
  }

  getEvolutionLevels(): EvolutionLevel[] {
    const evolutionLevels: EvolutionLevel[] = [];

    //console.log(Species[this.speciesId], pokemonEvolutions[this.speciesId])

    if (pokemonEvolutions.hasOwnProperty(this.speciesId)) {
      for (const e of pokemonEvolutions[this.speciesId]) {
        const speciesId = e.speciesId;
        const level = e.level;
        evolutionLevels.push([speciesId, level]);
        //console.log(Species[speciesId], getPokemonSpecies(speciesId), getPokemonSpecies(speciesId).getEvolutionLevels());
        const nextEvolutionLevels = getPokemonSpecies(speciesId).getEvolutionLevels();
        for (const npl of nextEvolutionLevels) {
          evolutionLevels.push(npl);
        }
      }
    }

    return evolutionLevels;
  }

  getPrevolutionLevels(): EvolutionLevel[] {
    const prevolutionLevels: EvolutionLevel[] = [];

    const allEvolvingPokemon = Object.keys(pokemonEvolutions);
    for (const p of allEvolvingPokemon) {
      for (const e of pokemonEvolutions[p]) {
        if (
          e.speciesId === this.speciesId &&
          (!this.forms.length || !e.evoFormKey || e.evoFormKey === this.forms[this.formIndex].formKey) &&
          prevolutionLevels.every(pe => pe[0] !== Number.parseInt(p))
        ) {
          const speciesId = Number.parseInt(p) as Species;
          const level = e.level;
          prevolutionLevels.push([speciesId, level]);
          const subPrevolutionLevels = getPokemonSpecies(speciesId).getPrevolutionLevels();
          for (const spl of subPrevolutionLevels) {
            prevolutionLevels.push(spl);
          }
        }
      }
    }

    return prevolutionLevels;
  }

  // This could definitely be written better and more accurate to the getSpeciesForLevel logic, but it is only for generating movesets for evolved Pokemon
  getSimulatedEvolutionChain(
    currentLevel: number,
    forTrainer = false,
    isBoss = false,
    player = false,
  ): EvolutionLevel[] {
    const ret: EvolutionLevel[] = [];
    if (pokemonPrevolutions.hasOwnProperty(this.speciesId)) {
      const prevolutionLevels = this.getPrevolutionLevels().reverse();
      const levelDiff = player ? 0 : forTrainer || isBoss ? (forTrainer && isBoss ? 2.5 : 5) : 10;
      ret.push([prevolutionLevels[0][0], 1]);
      for (let l = 1; l < prevolutionLevels.length; l++) {
        const evolution = pokemonEvolutions[prevolutionLevels[l - 1][0]].find(
          e => e.speciesId === prevolutionLevels[l][0],
        );
        ret.push([
          prevolutionLevels[l][0],
          Math.min(
            Math.max(
              evolution?.level! +
                Math.round(randSeedGauss(0.5, 1 + levelDiff * 0.2) * Math.max(evolution?.wildDelay!, 0.5) * 5) -
                1,
              2,
              evolution?.level!,
            ),
            currentLevel - 1,
          ),
        ]); // TODO: are those bangs correct?
      }
      const lastPrevolutionLevel = ret[prevolutionLevels.length - 1][1];
      const evolution = pokemonEvolutions[prevolutionLevels[prevolutionLevels.length - 1][0]].find(
        e => e.speciesId === this.speciesId,
      );
      ret.push([
        this.speciesId,
        Math.min(
          Math.max(
            lastPrevolutionLevel +
              Math.round(randSeedGauss(0.5, 1 + levelDiff * 0.2) * Math.max(evolution?.wildDelay!, 0.5) * 5),
            lastPrevolutionLevel + 1,
            evolution?.level!,
          ),
          currentLevel,
        ),
      ]); // TODO: are those bangs correct?
    } else {
      ret.push([this.speciesId, 1]);
    }

    return ret;
  }

  getCompatibleFusionSpeciesFilter(): PokemonSpeciesFilter {
    const hasEvolution = pokemonEvolutions.hasOwnProperty(this.speciesId);
    const hasPrevolution = pokemonPrevolutions.hasOwnProperty(this.speciesId);
    const subLegendary = this.subLegendary;
    const legendary = this.legendary;
    const mythical = this.mythical;
    return species => {
      return (
        (subLegendary ||
          legendary ||
          mythical ||
          (pokemonEvolutions.hasOwnProperty(species.speciesId) === hasEvolution &&
            pokemonPrevolutions.hasOwnProperty(species.speciesId) === hasPrevolution)) &&
        species.subLegendary === subLegendary &&
        species.legendary === legendary &&
        species.mythical === mythical &&
        (this.isTrainerForbidden() || !species.isTrainerForbidden()) &&
        species.speciesId !== Species.DITTO
      );
    };
  }

  isObtainable() {
    return super.isObtainable();
  }

  hasVariants() {
    let variantDataIndex: string | number = this.speciesId;
    if (this.forms.length > 0) {
      const formKey = this.forms[this.formIndex]?.formKey;
      if (formKey) {
        variantDataIndex = `${variantDataIndex}-${formKey}`;
      }
    }
    return variantData.hasOwnProperty(variantDataIndex) || variantData.hasOwnProperty(this.speciesId);
  }

  getFormSpriteKey(formIndex?: number) {
    if (this.forms.length && formIndex !== undefined && formIndex >= this.forms.length) {
      console.warn(
        `Attempted accessing form with index ${formIndex} of species ${this.getName()} with only ${this.forms.length || 0} forms`,
      );
      formIndex = Math.min(formIndex, this.forms.length - 1);
    }
    return this.forms?.length ? this.forms[formIndex || 0].getFormSpriteKey() : "";
  }

  /**
   * Generates a {@linkcode bigint} corresponding to the maximum unlocks possible for this species,
   * taking into account if the species has a male/female gender, and which variants are implemented.
   * @returns {@linkcode bigint} Maximum unlocks, can be compared with {@linkcode DexEntry.caughtAttr}.
   */
  getFullUnlocksData(): bigint {
    let caughtAttr = 0n;
    caughtAttr += DexAttr.NON_SHINY;
    caughtAttr += DexAttr.SHINY;
    if (this.malePercent !== null) {
      if (this.malePercent > 0) {
        caughtAttr += DexAttr.MALE;
      }
      if (this.malePercent < 100) {
        caughtAttr += DexAttr.FEMALE;
      }
    }
    caughtAttr += DexAttr.DEFAULT_VARIANT;
    if (this.hasVariants()) {
      caughtAttr += DexAttr.VARIANT_2;
      caughtAttr += DexAttr.VARIANT_3;
    }

    // Summing successive bigints for each obtainable form
    caughtAttr +=
      this?.forms?.length > 1
        ? this.forms
            .map((f, index) => (f.isUnobtainable ? 0n : 128n * 2n ** BigInt(index)))
            .reduce((acc, val) => acc + val, 0n)
        : DexAttr.DEFAULT_FORM;

    return caughtAttr;
  }
}

export class PokemonForm extends PokemonSpeciesForm {
  public formName: string;
  public formKey: string;
  public formSpriteKey: string | null;
  public isUnobtainable: boolean;

  // This is a collection of form keys that have in-run form changes, but should still be separately selectable from the start screen
  private starterSelectableKeys: string[] = [
    "10",
    "50",
    "10-pc",
    "50-pc",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];

  constructor(
    formName: string,
    formKey: string,
    type1: PokemonType,
    type2: PokemonType | null,
    height: number,
    weight: number,
    ability1: Abilities,
    ability2: Abilities,
    abilityHidden: Abilities,
    baseTotal: number,
    baseHp: number,
    baseAtk: number,
    baseDef: number,
    baseSpatk: number,
    baseSpdef: number,
    baseSpd: number,
    catchRate: number,
    baseFriendship: number,
    baseExp: number,
    genderDiffs = false,
    formSpriteKey: string | null = null,
    isStarterSelectable = false,
    isUnobtainable = false,
  ) {
    super(
      type1,
      type2,
      height,
      weight,
      ability1,
      ability2,
      abilityHidden,
      baseTotal,
      baseHp,
      baseAtk,
      baseDef,
      baseSpatk,
      baseSpdef,
      baseSpd,
      catchRate,
      baseFriendship,
      baseExp,
      genderDiffs,
      isStarterSelectable || !formKey,
    );
    this.formName = formName;
    this.formKey = formKey;
    this.formSpriteKey = formSpriteKey;
    this.isUnobtainable = isUnobtainable;
  }

  getFormSpriteKey(_formIndex?: number) {
    return this.formSpriteKey !== null ? this.formSpriteKey : this.formKey;
  }
}

/**
 * Method to get the daily list of starters with Pokerus.
 * @returns A list of starters with Pokerus
 */
export function getPokerusStarters(): PokemonSpecies[] {
  const pokerusStarters: PokemonSpecies[] = [];
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  globalScene.executeWithSeedOffset(
    () => {
      while (pokerusStarters.length < POKERUS_STARTER_COUNT) {
        const randomSpeciesId = Number.parseInt(randSeedItem(Object.keys(speciesStarterCosts)), 10);
        const species = getPokemonSpecies(randomSpeciesId);
        if (!pokerusStarters.includes(species)) {
          pokerusStarters.push(species);
        }
      }
    },
    0,
    date.getTime().toString(),
  );
  return pokerusStarters;
}

export const allSpecies: PokemonSpecies[] = [];

// biome-ignore format: manually formatted
export function initSpecies() {
  allSpecies.push(
new PokemonSpecies(
  Species.ARK_P1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A1, Abilities.NONE, Abilities.NONE, 200, 50, 50, 30, 30, 30, 10, 60, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A2, Abilities.NONE, Abilities.NONE, 200, 30, 50, 50, 10, 30, 30, 60, 50, 100, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P3, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A19, Abilities.NONE, Abilities.NONE, 300, 80, 50, 40, 50, 40, 40, 190, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P4, 1, false, false, false, "", PokemonType.SHIELD, null, 1, 10, Abilities.ARK_A3, Abilities.NONE, Abilities.NONE, 300, 50, 40, 80, 40, 50, 40, 190, 50, 100, GrowthRate.MEDIUM_SLOW, 100, false
),
new PokemonSpecies(
  Species.ARK_P5, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A4, Abilities.NONE, Abilities.NONE, 300, 40, 50, 40, 50, 40, 80, 190, 50, 100, GrowthRate.MEDIUM_SLOW, 100, false
),
new PokemonSpecies(
  Species.ARK_P6, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A5, Abilities.NONE, Abilities.NONE, 300, 40, 40, 40, 50, 80, 50, 190, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P7, 1, false, false, false, "", PokemonType.A_EXPLOSION, null, 1, 10, Abilities.ARK_A70, Abilities.NONE, Abilities.NONE, 300, 40, 80, 50, 40, 40, 50, 190, 50, 100, GrowthRate.MEDIUM_SLOW, 100, false
),
new PokemonSpecies(
  Species.ARK_P8, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A68, Abilities.NONE, Abilities.NONE, 184, 27, 42, 27, 30, 23, 35, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P8_1, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A68, Abilities.NONE, Abilities.NONE, 377.0, 69.0, 90.0, 68.0, 60.0, 38.0, 52.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P9, 1, false, false, false, "", PokemonType.AXE, null, 1, 10, Abilities.ARK_A50, Abilities.NONE, Abilities.NONE, 213, 35, 39, 37, 27, 40, 35, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P9_1, 1, false, false, false, "", PokemonType.AXE, null, 1, 10, Abilities.ARK_A50, Abilities.NONE, Abilities.NONE, 392.0, 48.0, 68.0, 75.0, 89.0, 53.0, 59.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P10, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A71, Abilities.NONE, Abilities.NONE, 220, 36, 45, 32, 37, 33, 37, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P10_1, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A71, Abilities.NONE, Abilities.NONE, 322.0, 46.0, 59.0, 43.0, 62.0, 44.0, 68.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P11, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 211, 30, 47, 34, 30, 29, 41, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P11_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 315.0, 60.0, 63.0, 43.0, 53.0, 43.0, 53.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P12, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A69, Abilities.NONE, Abilities.NONE, 208, 27, 31, 48, 38, 24, 40, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P12_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A69, Abilities.NONE, Abilities.NONE, 340.0, 47.0, 64.0, 86.0, 47.0, 43.0, 53.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P13, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.SWORD, 1, 10, Abilities.ARK_A24, Abilities.NONE, Abilities.NONE, 187, 24, 35, 49, 28, 24, 27, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P13_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.SWORD, 1, 10, Abilities.ARK_A24, Abilities.NONE, Abilities.NONE, 386.0, 40.0, 79.0, 84.0, 55.0, 81.0, 47.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P14, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A7, Abilities.NONE, Abilities.NONE, 197, 34, 41, 25, 33, 32, 32, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P14_1, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A7, Abilities.NONE, Abilities.NONE, 335.0, 60.0, 71.0, 55.0, 52.0, 48.0, 49.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P15, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A8, Abilities.NONE, Abilities.NONE, 209, 40, 51, 31, 28, 28, 31, 120, 50, 100, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P15_1, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A8, Abilities.NONE, Abilities.NONE, 301.0, 64.0, 57.0, 38.0, 48.0, 45.0, 49.0, 90, 50, 150, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P16, 1, false, false, false, "", PokemonType.A_EXPLOSION, null, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 216, 27, 36, 44, 37, 55, 17, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P16_1, 1, false, false, false, "", PokemonType.A_EXPLOSION, null, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 325.0, 57.0, 42.0, 55.0, 56.0, 84.0, 31.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P17, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_POISON, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 212, 41, 36, 34, 37, 43, 21, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P17_1, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_POISON, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 369.0, 80.0, 75.0, 48.0, 71.0, 55.0, 40.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P18, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A67, Abilities.NONE, Abilities.NONE, 220, 45, 37, 29, 47, 33, 29, 120, 50, 100, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P18_1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A67, Abilities.NONE, Abilities.NONE, 385.0, 78.0, 78.0, 45.0, 89.0, 56.0, 39.0, 90, 50, 150, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P19, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A9, Abilities.NONE, Abilities.NONE, 197, 37, 26, 26, 38, 36, 34, 120, 50, 100, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P19_1, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A9, Abilities.NONE, Abilities.NONE, 317.0, 53.0, 45.0, 48.0, 74.0, 51.0, 46.0, 90, 50, 150, GrowthRate.FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P20, 1, false, false, false, "", PokemonType.A_FROZEN, null, 1, 10, Abilities.ARK_A54, Abilities.NONE, Abilities.NONE, 212, 30, 36, 21, 52, 57, 16, 120, 50, 100, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P20_1, 1, false, false, false, "", PokemonType.A_FROZEN, null, 1, 10, Abilities.ARK_A54, Abilities.NONE, Abilities.NONE, 359.0, 50.0, 49.0, 39.0, 62.0, 92.0, 67.0, 90, 50, 150, GrowthRate.FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P21, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A10, Abilities.NONE, Abilities.NONE, 251, 47, 37, 33, 49, 36, 49, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P21_1, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A10, Abilities.NONE, Abilities.NONE, 280.0, 48.0, 41.0, 41.0, 59.0, 42.0, 49.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P21_2, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A10, Abilities.NONE, Abilities.NONE, 395.0, 60.0, 54.0, 51.0, 81.0, 61.0, 88.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P22, 1, false, false, false, "", PokemonType.A_EXPLOSION, null, 1, 10, Abilities.ARK_A11, Abilities.NONE, Abilities.NONE, 209, 27, 28, 34, 47, 58, 15, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P22_1, 1, false, false, false, "", PokemonType.A_EXPLOSION, null, 1, 10, Abilities.ARK_A11, Abilities.NONE, Abilities.NONE, 283.0, 42.0, 44.0, 33.0, 62.0, 82.0, 20.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P22_2, 1, false, false, false, "", PokemonType.A_EXPLOSION, null, 1, 10, Abilities.ARK_A11, Abilities.NONE, Abilities.NONE, 411.0, 60.0, 72.0, 62.0, 80.0, 105.0, 32.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P23, 1, false, false, false, "", PokemonType.MUSKET, null, 1, 10, Abilities.ARK_A12, Abilities.NONE, Abilities.NONE, 237, 42, 40, 30, 50, 39, 36, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P23_1, 1, false, false, false, "", PokemonType.MUSKET, null, 1, 10, Abilities.ARK_A12, Abilities.NONE, Abilities.NONE, 339.0, 44.0, 98.0, 57.0, 49.0, 43.0, 48.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P23_2, 1, false, false, false, "", PokemonType.MUSKET, null, 1, 10, Abilities.ARK_A12, Abilities.NONE, Abilities.NONE, 451.0, 66.0, 98.0, 83.0, 72.0, 79.0, 53.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P24, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A4, Abilities.NONE, Abilities.NONE, 224, 39, 60, 25, 36, 30, 34, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P24_1, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A4, Abilities.NONE, Abilities.NONE, 345.0, 50.0, 71.0, 46.0, 79.0, 51.0, 48.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P24_2, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A4, Abilities.NONE, Abilities.NONE, 367.0, 58.0, 72.0, 48.0, 59.0, 64.0, 66.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P25, 1, false, false, false, "", PokemonType.BOOMERANG, null, 1, 10, Abilities.ARK_A13, Abilities.NONE, Abilities.NONE, 233, 39, 64, 41, 34, 39, 16, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P25_1, 1, false, false, false, "", PokemonType.BOOMERANG, null, 1, 10, Abilities.ARK_A13, Abilities.NONE, Abilities.NONE, 350.0, 59.0, 84.0, 43.0, 69.0, 62.0, 33.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P25_2, 1, false, false, false, "", PokemonType.BOOMERANG, null, 1, 10, Abilities.ARK_A13, Abilities.NONE, Abilities.NONE, 441.0, 79.0, 111.0, 74.0, 60.0, 70.0, 47.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P26, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A14, Abilities.NONE, Abilities.NONE, 234, 35, 62, 31, 52, 24, 30, 90, 50, 100, GrowthRate.MEDIUM_FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P26_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A14, Abilities.NONE, Abilities.NONE, 320.0, 47.0, 59.0, 50.0, 61.0, 39.0, 64.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P26_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A14, Abilities.NONE, Abilities.NONE, 364.0, 69.0, 74.0, 55.0, 65.0, 48.0, 53.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P27, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A16, Abilities.NONE, Abilities.NONE, 228, 35, 44, 32, 38, 38, 41, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P27_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A16, Abilities.NONE, Abilities.NONE, 345.0, 58.0, 63.0, 59.0, 62.0, 47.0, 56.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P27_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A16, Abilities.NONE, Abilities.NONE, 419.0, 65.0, 69.0, 62.0, 98.0, 67.0, 58.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P28, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A17, Abilities.NONE, Abilities.NONE, 232, 47, 33, 40, 33, 34, 45, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P28_1, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A17, Abilities.NONE, Abilities.NONE, 303.0, 41.0, 62.0, 48.0, 41.0, 46.0, 65.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P28_2, 1, false, false, false, "", PokemonType.LANCE, null, 1, 10, Abilities.ARK_A17, Abilities.NONE, Abilities.NONE, 377.0, 53.0, 73.0, 69.0, 52.0, 53.0, 77.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P29, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A18, Abilities.NONE, Abilities.NONE, 255, 43, 59, 35, 39, 33, 46, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P29_1, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A18, Abilities.NONE, Abilities.NONE, 312.0, 52.0, 51.0, 48.0, 61.0, 39.0, 61.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P29_2, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A18, Abilities.NONE, Abilities.NONE, 354.0, 52.0, 71.0, 53.0, 49.0, 50.0, 79.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P30, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A19, Abilities.NONE, Abilities.NONE, 241, 31, 36, 48, 34, 35, 57, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P30_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A19, Abilities.NONE, Abilities.NONE, 322.0, 65.0, 64.0, 49.0, 46.0, 48.0, 50.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P30_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A19, Abilities.NONE, Abilities.NONE, 345.0, 59.0, 67.0, 60.0, 52.0, 52.0, 55.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P31, 1, false, false, false, "", PokemonType.SWORD, PokemonType.A_ICE, 1, 10, Abilities.ARK_A55, Abilities.NONE, Abilities.NONE, 222, 34, 45, 28, 36, 43, 36, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P31_1, 1, false, false, false, "", PokemonType.SWORD, PokemonType.A_ICE, 1, 10, Abilities.ARK_A55, Abilities.NONE, Abilities.NONE, 342.0, 58.0, 79.0, 46.0, 60.0, 51.0, 48.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P31_2, 1, false, false, false, "", PokemonType.SWORD, PokemonType.A_ICE, 1, 10, Abilities.ARK_A55, Abilities.NONE, Abilities.NONE, 405.0, 59.0, 68.0, 88.0, 64.0, 69.0, 57.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P32, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A20, Abilities.NONE, Abilities.NONE, 220, 38, 39, 32, 31, 43, 37, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P32_1, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A20, Abilities.NONE, Abilities.NONE, 289.0, 42.0, 56.0, 45.0, 42.0, 62.0, 42.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P32_2, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A20, Abilities.NONE, Abilities.NONE, 411.0, 58.0, 74.0, 81.0, 67.0, 75.0, 56.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P33, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A21, Abilities.NONE, Abilities.NONE, 220, 40, 31, 32, 39, 49, 29, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P33_1, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A21, Abilities.NONE, Abilities.NONE, 377.0, 46.0, 43.0, 63.0, 88.0, 76.0, 61.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P33_2, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A21, Abilities.NONE, Abilities.NONE, 359.0, 57.0, 50.0, 49.0, 62.0, 89.0, 52.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P34, 1, false, false, false, "", PokemonType.DAGGER, null, 1, 10, Abilities.ARK_A5, Abilities.NONE, Abilities.NONE, 197, 33, 36, 33, 26, 27, 42, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P34_1, 1, false, false, false, "", PokemonType.DAGGER, null, 1, 10, Abilities.ARK_A5, Abilities.NONE, Abilities.NONE, 341.0, 45.0, 52.0, 44.0, 90.0, 43.0, 67.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P34_2, 1, false, false, false, "", PokemonType.DAGGER, null, 1, 10, Abilities.ARK_A5, Abilities.NONE, Abilities.NONE, 356.0, 71.0, 68.0, 48.0, 49.0, 48.0, 72.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P35, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A73, Abilities.NONE, Abilities.NONE, 229, 32, 52, 41, 34, 37, 33, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P35_1, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A73, Abilities.NONE, Abilities.NONE, 339.0, 54.0, 71.0, 50.0, 45.0, 61.0, 58.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P35_2, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A73, Abilities.NONE, Abilities.NONE, 409.0, 89.0, 69.0, 56.0, 59.0, 56.0, 80.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P36, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A1, Abilities.NONE, Abilities.NONE, 200, 33, 45, 32, 36, 37, 17, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P36_1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A1, Abilities.NONE, Abilities.NONE, 324.0, 52.0, 51.0, 61.0, 57.0, 63.0, 40.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P36_2, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A1, Abilities.NONE, Abilities.NONE, 403.0, 79.0, 110.0, 54.0, 64.0, 62.0, 34.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P37, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.HAMMER, 1, 10, Abilities.ARK_A56, Abilities.NONE, Abilities.NONE, 228, 36, 51, 39, 48, 34, 20, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P37_1, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.HAMMER, 1, 10, Abilities.ARK_A56, Abilities.NONE, Abilities.NONE, 298.0, 51.0, 57.0, 48.0, 57.0, 58.0, 27.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P37_2, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.HAMMER, 1, 10, Abilities.ARK_A56, Abilities.NONE, Abilities.NONE, 392.0, 69.0, 91.0, 51.0, 70.0, 66.0, 45.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P38, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A22, Abilities.NONE, Abilities.NONE, 249, 56, 33, 35, 58, 38, 29, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P38_1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A22, Abilities.NONE, Abilities.NONE, 309.0, 46.0, 55.0, 50.0, 66.0, 53.0, 39.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P38_2, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A22, Abilities.NONE, Abilities.NONE, 383.0, 61.0, 75.0, 48.0, 111.0, 59.0, 29.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P39, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.SWORD, 1, 10, Abilities.ARK_A23, Abilities.NONE, Abilities.NONE, 228, 30, 40, 64, 39, 27, 28, 90, 50, 100, GrowthRate.MEDIUM_FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P39_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.SWORD, 1, 10, Abilities.ARK_A23, Abilities.NONE, Abilities.NONE, 314.0, 38.0, 61.0, 96.0, 36.0, 41.0, 42.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P39_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.SWORD, 1, 10, Abilities.ARK_A23, Abilities.NONE, Abilities.NONE, 428.0, 44.0, 62.0, 105.0, 68.0, 86.0, 63.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 100, false
),
new PokemonSpecies(
  Species.ARK_P40, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.HAMMER, 1, 10, Abilities.ARK_A24, Abilities.NONE, Abilities.NONE, 196, 24, 33, 60, 28, 26, 25, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P40_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.HAMMER, 1, 10, Abilities.ARK_A24, Abilities.NONE, Abilities.NONE, 323.0, 65.0, 52.0, 78.0, 44.0, 45.0, 39.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P40_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.HAMMER, 1, 10, Abilities.ARK_A24, Abilities.NONE, Abilities.NONE, 374.0, 48.0, 62.0, 102.0, 56.0, 49.0, 57.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P41, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A25, Abilities.NONE, Abilities.NONE, 245, 27, 65, 53, 28, 39, 33, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P41_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A25, Abilities.NONE, Abilities.NONE, 372.0, 72.0, 61.0, 96.0, 37.0, 54.0, 52.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P41_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A25, Abilities.NONE, Abilities.NONE, 442.0, 70.0, 60.0, 96.0, 73.0, 81.0, 62.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P42, 1, false, false, false, "", PokemonType.WHIP, PokemonType.A_WATER, 1, 10, Abilities.ARK_A26, Abilities.NONE, Abilities.NONE, 224, 33, 38, 29, 49, 43, 32, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P42_1, 1, false, false, false, "", PokemonType.WHIP, PokemonType.A_WATER, 1, 10, Abilities.ARK_A26, Abilities.NONE, Abilities.NONE, 324.0, 54.0, 51.0, 43.0, 59.0, 50.0, 67.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P42_2, 1, false, false, false, "", PokemonType.WHIP, PokemonType.A_WATER, 1, 10, Abilities.ARK_A26, Abilities.NONE, Abilities.NONE, 372.0, 70.0, 73.0, 49.0, 58.0, 64.0, 58.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P43, 1, false, false, false, "", PokemonType.A_FROZEN, PokemonType.A_WIND, 1, 10, Abilities.ARK_A43, Abilities.NONE, Abilities.NONE, 216, 35, 26, 29, 53, 60, 13, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P43_1, 1, false, false, false, "", PokemonType.A_FROZEN, PokemonType.A_WIND, 1, 10, Abilities.ARK_A43, Abilities.NONE, Abilities.NONE, 327.0, 57.0, 46.0, 37.0, 61.0, 88.0, 38.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P43_2, 1, false, false, false, "", PokemonType.A_FROZEN, PokemonType.A_WIND, 1, 10, Abilities.ARK_A43, Abilities.NONE, Abilities.NONE, 406.0, 59.0, 50.0, 40.0, 81.0, 110.0, 66.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P44, 1, false, false, false, "", PokemonType.AXE, PokemonType.A_WATER, 1, 10, Abilities.ARK_A27, Abilities.NONE, Abilities.NONE, 223, 39, 43, 44, 32, 32, 33, 90, 50, 100, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P44_1, 1, false, false, false, "", PokemonType.AXE, PokemonType.A_WATER, 1, 10, Abilities.ARK_A27, Abilities.NONE, Abilities.NONE, 334.0, 52.0, 63.0, 46.0, 64.0, 56.0, 53.0, 80, 50, 150, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P44_2, 1, false, false, false, "", PokemonType.AXE, PokemonType.A_WATER, 1, 10, Abilities.ARK_A27, Abilities.NONE, Abilities.NONE, 431.0, 59.0, 79.0, 73.0, 78.0, 87.0, 55.0, 80, 50, 270, GrowthRate.MEDIUM_FAST, 0, false
),
new PokemonSpecies(
  Species.ARK_P45, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A51, Abilities.NONE, Abilities.NONE, 262, 44, 40, 50, 57, 41, 30, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P45_1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A51, Abilities.NONE, Abilities.NONE, 366.0, 58.0, 59.0, 88.0, 77.0, 53.0, 31.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P45_2, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A51, Abilities.NONE, Abilities.NONE, 464.0, 93.0, 78.0, 61.0, 98.0, 76.0, 58.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P46, 1, false, false, false, "", PokemonType.AXE, null, 1, 10, Abilities.ARK_A72, Abilities.NONE, Abilities.NONE, 211, 31, 43, 34, 35, 32, 36, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P46_1, 1, false, false, false, "", PokemonType.AXE, null, 1, 10, Abilities.ARK_A72, Abilities.NONE, Abilities.NONE, 365.0, 59.0, 70.0, 57.0, 56.0, 72.0, 51.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P46_2, 1, false, false, false, "", PokemonType.AXE, null, 1, 10, Abilities.ARK_A72, Abilities.NONE, Abilities.NONE, 527.0, 105.0, 101.0, 70.0, 115.0, 54.0, 82.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P47, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A38, Abilities.NONE, Abilities.NONE, 268, 43, 48, 41, 36, 48, 52, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P47_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A38, Abilities.NONE, Abilities.NONE, 374.0, 51.0, 66.0, 54.0, 79.0, 69.0, 55.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P47_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A38, Abilities.NONE, Abilities.NONE, 477.0, 70.0, 112.0, 71.0, 85.0, 70.0, 69.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P48, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A28, Abilities.NONE, Abilities.NONE, 298, 49, 57, 54, 54, 37, 47, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P48_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A28, Abilities.NONE, Abilities.NONE, 384.0, 87.0, 79.0, 56.0, 56.0, 54.0, 52.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P48_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A28, Abilities.NONE, Abilities.NONE, 464.0, 70.0, 108.0, 70.0, 72.0, 66.0, 78.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P49, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A29, Abilities.NONE, Abilities.NONE, 215, 34, 39, 33, 27, 31, 51, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P49_1, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A29, Abilities.NONE, Abilities.NONE, 368.0, 44.0, 65.0, 50.0, 60.0, 68.0, 81.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P49_2, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A29, Abilities.NONE, Abilities.NONE, 584.0, 67.0, 96.0, 77.0, 99.0, 96.0, 149.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P50, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A30, Abilities.NONE, Abilities.NONE, 242, 32, 44, 51, 33, 48, 34, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P50_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A30, Abilities.NONE, Abilities.NONE, 332.0, 54.0, 59.0, 64.0, 44.0, 66.0, 45.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P50_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A30, Abilities.NONE, Abilities.NONE, 587.0, 68.0, 112.0, 72.0, 78.0, 122.0, 135.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P51, 1, false, false, false, "", PokemonType.CHAINSAW, null, 1, 10, Abilities.ARK_A31, Abilities.NONE, Abilities.NONE, 276, 40, 52, 35, 37, 61, 51, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P51_1, 1, false, false, false, "", PokemonType.CHAINSAW, null, 1, 10, Abilities.ARK_A31, Abilities.NONE, Abilities.NONE, 343.0, 64.0, 71.0, 49.0, 50.0, 53.0, 56.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P51_2, 1, false, false, false, "", PokemonType.CHAINSAW, null, 1, 10, Abilities.ARK_A31, Abilities.NONE, Abilities.NONE, 497.0, 99.0, 118.0, 74.0, 70.0, 63.0, 73.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P52, 1, false, false, false, "", PokemonType.CROSSBOW, PokemonType.A_POISON, 1, 10, Abilities.ARK_A32, Abilities.NONE, Abilities.NONE, 242, 51, 45, 36, 35, 36, 39, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P52_1, 1, false, false, false, "", PokemonType.CROSSBOW, PokemonType.A_POISON, 1, 10, Abilities.ARK_A32, Abilities.NONE, Abilities.NONE, 434.0, 71.0, 93.0, 66.0, 85.0, 51.0, 68.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P52_2, 1, false, false, false, "", PokemonType.CROSSBOW, PokemonType.A_POISON, 1, 10, Abilities.ARK_A32, Abilities.NONE, Abilities.NONE, 427.0, 73.0, 86.0, 59.0, 70.0, 70.0, 69.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P53, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 224, 36, 47, 31, 38, 33, 39, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P53_1, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 349.0, 61.0, 76.0, 45.0, 50.0, 52.0, 65.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P53_2, 1, false, false, false, "", PokemonType.BOW, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 516.0, 74.0, 110.0, 55.0, 89.0, 111.0, 77.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P54, 1, false, false, false, "", PokemonType.CANNON, null, 1, 10, Abilities.ARK_A42, Abilities.NONE, Abilities.NONE, 230, 37, 58, 45, 39, 34, 17, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P54_1, 1, false, false, false, "", PokemonType.CANNON, null, 1, 10, Abilities.ARK_A42, Abilities.NONE, Abilities.NONE, 379.0, 50.0, 119.0, 51.0, 64.0, 71.0, 24.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P54_2, 1, false, false, false, "", PokemonType.CANNON, null, 1, 10, Abilities.ARK_A42, Abilities.NONE, Abilities.NONE, 538.0, 114.0, 136.0, 103.0, 68.0, 70.0, 47.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P55, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A34, Abilities.NONE, Abilities.NONE, 231, 33, 36, 26, 44, 66, 26, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P55_1, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A34, Abilities.NONE, Abilities.NONE, 376.0, 53.0, 44.0, 55.0, 76.0, 119.0, 29.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P55_2, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A34, Abilities.NONE, Abilities.NONE, 489.0, 61.0, 86.0, 56.0, 102.0, 141.0, 43.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P56, 1, false, false, false, "", PokemonType.A_EXPLOSION, PokemonType.HAMMER, 1, 10, Abilities.ARK_A35, Abilities.NONE, Abilities.NONE, 259, 40, 53, 34, 47, 45, 40, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P56_1, 1, false, false, false, "", PokemonType.A_EXPLOSION, PokemonType.HAMMER, 1, 10, Abilities.ARK_A35, Abilities.NONE, Abilities.NONE, 377.0, 54.0, 61.0, 45.0, 67.0, 68.0, 82.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P56_2, 1, false, false, false, "", PokemonType.A_EXPLOSION, PokemonType.HAMMER, 1, 10, Abilities.ARK_A35, Abilities.NONE, Abilities.NONE, 515.0, 94.0, 93.0, 60.0, 105.0, 72.0, 91.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P57, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_WIND, 1, 10, Abilities.ARK_A36, Abilities.NONE, Abilities.NONE, 217, 37, 44, 33, 45, 40, 18, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P57_1, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_WIND, 1, 10, Abilities.ARK_A36, Abilities.NONE, Abilities.NONE, 397.0, 60.0, 61.0, 86.0, 59.0, 59.0, 72.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P57_2, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_WIND, 1, 10, Abilities.ARK_A36, Abilities.NONE, Abilities.NONE, 459.0, 93.0, 75.0, 69.0, 97.0, 79.0, 46.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P58, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 226, 56, 36, 30, 39, 38, 27, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P58_1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 368.0, 74.0, 57.0, 45.0, 76.0, 81.0, 35.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P58_2, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A53, Abilities.NONE, Abilities.NONE, 551.0, 98.0, 123.0, 82.0, 78.0, 107.0, 63.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P59, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A37, Abilities.NONE, Abilities.NONE, 247, 33, 54, 53, 33, 43, 31, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P59_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A37, Abilities.NONE, Abilities.NONE, 387.0, 60.0, 89.0, 68.0, 54.0, 56.0, 60.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P59_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A37, Abilities.NONE, Abilities.NONE, 493.0, 75.0, 79.0, 90.0, 95.0, 93.0, 61.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P60, 1, false, false, false, "", PokemonType.DAGGER, null, 1, 10, Abilities.ARK_A38, Abilities.NONE, Abilities.NONE, 255, 41, 49, 35, 33, 37, 60, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P60_1, 1, false, false, false, "", PokemonType.DAGGER, null, 1, 10, Abilities.ARK_A38, Abilities.NONE, Abilities.NONE, 394.0, 49.0, 73.0, 44.0, 71.0, 87.0, 70.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P60_2, 1, false, false, false, "", PokemonType.DAGGER, null, 1, 10, Abilities.ARK_A38, Abilities.NONE, Abilities.NONE, 545.0, 82.0, 101.0, 104.0, 79.0, 60.0, 119.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P61, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.MUSKET, 1, 10, Abilities.ARK_A39, Abilities.NONE, Abilities.NONE, 245, 36, 47, 40, 38, 49, 35, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P61_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.MUSKET, 1, 10, Abilities.ARK_A39, Abilities.NONE, Abilities.NONE, 375.0, 68.0, 81.0, 73.0, 49.0, 50.0, 54.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P61_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.MUSKET, 1, 10, Abilities.ARK_A39, Abilities.NONE, Abilities.NONE, 527.0, 85.0, 91.0, 81.0, 91.0, 101.0, 78.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P62, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.HAMMER, 1, 10, Abilities.ARK_A6, Abilities.NONE, Abilities.NONE, 231, 32, 36, 57, 29, 41, 36, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P62_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.HAMMER, 1, 10, Abilities.ARK_A6, Abilities.NONE, Abilities.NONE, 387.0, 55.0, 83.0, 90.0, 44.0, 67.0, 48.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P62_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.HAMMER, 1, 10, Abilities.ARK_A6, Abilities.NONE, Abilities.NONE, 486.0, 92.0, 93.0, 118.0, 63.0, 59.0, 61.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P63, 1, false, false, false, "", PokemonType.HAMMER, PokemonType.A_DARK, 1, 10, Abilities.ARK_A20, Abilities.NONE, Abilities.NONE, 225, 49, 34, 40, 39, 33, 30, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P63_1, 1, false, false, false, "", PokemonType.HAMMER, PokemonType.A_DARK, 1, 10, Abilities.ARK_A20, Abilities.NONE, Abilities.NONE, 342.0, 83.0, 51.0, 70.0, 41.0, 49.0, 48.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P63_2, 1, false, false, false, "", PokemonType.HAMMER, PokemonType.A_DARK, 1, 10, Abilities.ARK_A20, Abilities.NONE, Abilities.NONE, 499.0, 106.0, 91.0, 122.0, 53.0, 70.0, 57.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P64, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A7, Abilities.NONE, Abilities.NONE, 210, 35, 44, 29, 36, 35, 31, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P64_1, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A7, Abilities.NONE, Abilities.NONE, 378.0, 60.0, 74.0, 59.0, 60.0, 84.0, 41.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P64_2, 1, false, false, false, "", PokemonType.CROSSBOW, null, 1, 10, Abilities.ARK_A7, Abilities.NONE, Abilities.NONE, 505.0, 77.0, 104.0, 94.0, 72.0, 100.0, 58.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P65, 1, false, false, false, "", PokemonType.CROSSBOW, PokemonType.A_EXPLOSION, 1, 10, Abilities.ARK_A40, Abilities.NONE, Abilities.NONE, 256, 36, 46, 43, 57, 51, 23, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P65_1, 1, false, false, false, "", PokemonType.CROSSBOW, PokemonType.A_EXPLOSION, 1, 10, Abilities.ARK_A40, Abilities.NONE, Abilities.NONE, 403.0, 64.0, 97.0, 52.0, 82.0, 66.0, 42.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P65_2, 1, false, false, false, "", PokemonType.CROSSBOW, PokemonType.A_EXPLOSION, 1, 10, Abilities.ARK_A40, Abilities.NONE, Abilities.NONE, 477.0, 74.0, 105.0, 85.0, 87.0, 78.0, 48.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P66, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A63, Abilities.NONE, Abilities.NONE, 231, 34, 39, 39, 31, 51, 37, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P66_1, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A63, Abilities.NONE, Abilities.NONE, 383.0, 66.0, 83.0, 63.0, 52.0, 69.0, 50.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P66_2, 1, false, false, false, "", PokemonType.WHIP, null, 1, 10, Abilities.ARK_A63, Abilities.NONE, Abilities.NONE, 503.0, 72.0, 103.0, 73.0, 81.0, 87.0, 87.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P67, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, PokemonType.A_WIND, 1, 10, Abilities.ARK_A41, Abilities.NONE, Abilities.NONE, 266, 30, 39, 30, 48, 75, 44, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P67_1, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, PokemonType.A_WIND, 1, 10, Abilities.ARK_A41, Abilities.NONE, Abilities.NONE, 336.0, 46.0, 47.0, 49.0, 57.0, 94.0, 43.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P67_2, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, PokemonType.A_WIND, 1, 10, Abilities.ARK_A41, Abilities.NONE, Abilities.NONE, 428.0, 59.0, 60.0, 47.0, 83.0, 116.0, 63.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P68, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A43, Abilities.NONE, Abilities.NONE, 254, 36, 38, 28, 45, 86, 21, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P68_1, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A43, Abilities.NONE, Abilities.NONE, 416.0, 87.0, 75.0, 44.0, 64.0, 110.0, 36.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P68_2, 1, false, false, false, "", PokemonType.A_NEUTRALIZE, null, 1, 10, Abilities.ARK_A43, Abilities.NONE, Abilities.NONE, 515.0, 71.0, 93.0, 50.0, 94.0, 166.0, 41.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P69, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A22, Abilities.NONE, Abilities.NONE, 282, 41, 62, 36, 60, 38, 45, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P69_1, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A22, Abilities.NONE, Abilities.NONE, 443.0, 106.0, 59.0, 59.0, 79.0, 69.0, 71.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P69_2, 1, false, false, false, "", PokemonType.A_HEALING, null, 1, 10, Abilities.ARK_A22, Abilities.NONE, Abilities.NONE, 569.0, 71.0, 106.0, 96.0, 87.0, 110.0, 99.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P70, 1, false, false, false, "", PokemonType.A_POISON, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 214, 36, 46, 32, 32, 48, 20, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P70_1, 1, false, false, false, "", PokemonType.A_POISON, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 382.0, 75.0, 83.0, 56.0, 54.0, 79.0, 35.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P70_2, 1, false, false, false, "", PokemonType.A_POISON, null, 1, 10, Abilities.ARK_A33, Abilities.NONE, Abilities.NONE, 520.0, 110.0, 93.0, 75.0, 80.0, 109.0, 53.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P71, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A44, Abilities.NONE, Abilities.NONE, 253, 37, 58, 35, 43, 44, 36, 60, 50, 100, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P71_1, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A44, Abilities.NONE, Abilities.NONE, 336.0, 53.0, 69.0, 49.0, 53.0, 51.0, 61.0, 50, 50, 150, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P71_2, 1, false, false, false, "", PokemonType.FIST, null, 1, 10, Abilities.ARK_A44, Abilities.NONE, Abilities.NONE, 485.0, 72.0, 94.0, 76.0, 95.0, 66.0, 82.0, 50, 50, 270, GrowthRate.MEDIUM_SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P72, 1, false, false, false, "", PokemonType.MUSKET, null, 1, 10, Abilities.ARK_A12, Abilities.NONE, Abilities.NONE, 274, 49, 57, 33, 42, 46, 47, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P72_1, 1, false, false, false, "", PokemonType.MUSKET, null, 1, 10, Abilities.ARK_A12, Abilities.NONE, Abilities.NONE, 426.0, 56.0, 89.0, 61.0, 61.0, 90.0, 69.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P72_2, 1, false, false, false, "", PokemonType.MUSKET, null, 1, 10, Abilities.ARK_A12, Abilities.NONE, Abilities.NONE, 600.0, 84.0, 119.0, 57.0, 98.0, 123.0, 119.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P73, 1, false, false, false, "", PokemonType.HAMMER, null, 1, 10, Abilities.ARK_A58, Abilities.NONE, Abilities.NONE, 259, 37, 58, 40, 45, 32, 47, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P73_1, 1, false, false, false, "", PokemonType.HAMMER, null, 1, 10, Abilities.ARK_A58, Abilities.NONE, Abilities.NONE, 405.0, 72.0, 100.0, 67.0, 62.0, 46.0, 58.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P73_2, 1, false, false, false, "", PokemonType.HAMMER, null, 1, 10, Abilities.ARK_A58, Abilities.NONE, Abilities.NONE, 540.0, 76.0, 135.0, 98.0, 86.0, 63.0, 82.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P74, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A74, Abilities.NONE, Abilities.NONE, 253, 49, 37, 41, 45, 63, 18, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P74_1, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A74, Abilities.NONE, Abilities.NONE, 422.0, 63.0, 57.0, 64.0, 72.0, 121.0, 45.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P74_2, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A74, Abilities.NONE, Abilities.NONE, 550.0, 50.0, 102.0, 86.0, 102.0, 128.0, 82.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P75, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A45, Abilities.NONE, Abilities.NONE, 321, 49, 40, 78, 51, 59, 44, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P75_1, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A45, Abilities.NONE, Abilities.NONE, 441.0, 100.0, 58.0, 63.0, 98.0, 60.0, 62.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P75_2, 1, false, false, false, "", PokemonType.A_FIRE, null, 1, 10, Abilities.ARK_A45, Abilities.NONE, Abilities.NONE, 600.0, 106.0, 109.0, 99.0, 106.0, 86.0, 94.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P76, 1, false, false, false, "", PokemonType.A_FROZEN, PokemonType.A_WIND, 1, 10, Abilities.ARK_A52, Abilities.NONE, Abilities.NONE, 280, 36, 48, 30, 64, 78, 24, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P76_1, 1, false, false, false, "", PokemonType.A_FROZEN, PokemonType.A_WIND, 1, 10, Abilities.ARK_A52, Abilities.NONE, Abilities.NONE, 404.0, 57.0, 51.0, 73.0, 77.0, 103.0, 43.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P76_2, 1, false, false, false, "", PokemonType.A_FROZEN, PokemonType.A_WIND, 1, 10, Abilities.ARK_A52, Abilities.NONE, Abilities.NONE, 565.0, 114.0, 81.0, 61.0, 120.0, 143.0, 46.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P77, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.SWORD, 1, 10, Abilities.ARK_A46, Abilities.NONE, Abilities.NONE, 275, 49, 48, 49, 48, 59, 22, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P77_1, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.SWORD, 1, 10, Abilities.ARK_A46, Abilities.NONE, Abilities.NONE, 372.0, 75.0, 70.0, 55.0, 65.0, 72.0, 35.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P77_2, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.SWORD, 1, 10, Abilities.ARK_A46, Abilities.NONE, Abilities.NONE, 600.0, 91.0, 93.0, 111.0, 146.0, 97.0, 62.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P78, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_NEUTRALIZE, 1, 10, Abilities.ARK_A47, Abilities.NONE, Abilities.NONE, 249, 38, 44, 43, 50, 38, 36, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P78_1, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_NEUTRALIZE, 1, 10, Abilities.ARK_A47, Abilities.NONE, Abilities.NONE, 425.0, 63.0, 105.0, 50.0, 91.0, 78.0, 38.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P78_2, 1, false, false, false, "", PokemonType.A_HEALING, PokemonType.A_NEUTRALIZE, 1, 10, Abilities.ARK_A47, Abilities.NONE, Abilities.NONE, 623.0, 138.0, 83.0, 88.0, 129.0, 108.0, 77.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P79, 1, false, false, false, "", PokemonType.SHIELD, null, 1, 10, Abilities.ARK_A6, Abilities.NONE, Abilities.NONE, 261, 36, 55, 64, 30, 39, 37, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P79_1, 1, false, false, false, "", PokemonType.SHIELD, null, 1, 10, Abilities.ARK_A6, Abilities.NONE, Abilities.NONE, 448.0, 51.0, 87.0, 113.0, 91.0, 47.0, 59.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P79_2, 1, false, false, false, "", PokemonType.SHIELD, null, 1, 10, Abilities.ARK_A6, Abilities.NONE, Abilities.NONE, 570.0, 79.0, 124.0, 137.0, 91.0, 73.0, 66.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P80, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A48, Abilities.NONE, Abilities.NONE, 283, 43, 60, 56, 34, 45, 45, 45, 50, 100, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P80_1, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A48, Abilities.NONE, Abilities.NONE, 437.0, 51.0, 66.0, 101.0, 61.0, 76.0, 82.0, 30, 50, 150, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P80_2, 1, false, false, false, "", PokemonType.SHIELD, PokemonType.A_HEALING, 1, 10, Abilities.ARK_A48, Abilities.NONE, Abilities.NONE, 550.0, 71.0, 103.0, 126.0, 77.0, 105.0, 68.0, 30, 50, 270, GrowthRate.SLOW, 0, false
),
new PokemonSpecies(
  Species.ARK_P81, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A49, Abilities.NONE, Abilities.NONE, 269, 42, 45, 53, 39, 45, 45, 45, 50, 100, GrowthRate.SLOW, 100, false
),
new PokemonSpecies(
  Species.ARK_P81_1, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A49, Abilities.NONE, Abilities.NONE, 418.0, 75.0, 70.0, 63.0, 60.0, 73.0, 77.0, 30, 50, 150, GrowthRate.SLOW, 100, false
),
new PokemonSpecies(
  Species.ARK_P81_2, 1, false, false, false, "", PokemonType.SWORD, null, 1, 10, Abilities.ARK_A49, Abilities.NONE, Abilities.NONE, 525.0, 70.0, 111.0, 68.0, 75.0, 96.0, 105.0, 30, 50, 270, GrowthRate.SLOW, 100, false
),
 );
}
