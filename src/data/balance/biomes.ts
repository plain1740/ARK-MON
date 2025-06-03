import { PokemonType } from "#enums/pokemon-type";
import { randSeedInt, getEnumValues } from "#app/utils/common";
import type { SpeciesFormEvolution } from "#app/data/balance/pokemon-evolutions";
import { pokemonEvolutions } from "#app/data/balance/pokemon-evolutions";
import i18next from "i18next";
import { Biome } from "#enums/biome";
import { Species } from "#enums/species";
import { TimeOfDay } from "#enums/time-of-day";
import { TrainerType } from "#enums/trainer-type";
// import beautify from "json-beautify";

export function getBiomeName(biome: Biome | -1) {
  if (biome === -1) {
    return i18next.t("biome:unknownLocation");
  }
  switch (biome) {
    case Biome.GRASS:
      return i18next.t("biome:GRASS");
    case Biome.RUINS:
      return i18next.t("biome:RUINS");
    case Biome.END:
      return i18next.t("biome:END");
    default:
      return i18next.t(`biome:${Biome[biome].toUpperCase()}`);
  }
}

interface BiomeLinks {
  [key: number]: Biome | (Biome | [Biome, number])[]
}

interface BiomeDepths {
  [key: number]: [number, number]
}

export const biomeLinks: BiomeLinks = {
  [Biome.Rhodes]: [Biome.Rhodes1],
[Biome.Rhodes1]: [Biome.Rhodes2],
[Biome.Rhodes2]: [Biome.Rhodes]
};

export const biomeDepths: BiomeDepths = {};

export enum BiomePoolTier {
  COMMON,
  UNCOMMON,
  RARE,
  SUPER_RARE,
  ULTRA_RARE,
  BOSS,
  BOSS_RARE,
  BOSS_SUPER_RARE,
  BOSS_ULTRA_RARE
}

export const uncatchableSpecies: Species[] = [];

export interface SpeciesTree {
  [key: number]: Species[]
}

export interface PokemonPools {
  [key: number]: (Species | SpeciesTree)[]
}

export interface BiomeTierPokemonPools {
  [key: number]: PokemonPools
}

export interface BiomePokemonPools {
  [key: number]: BiomeTierPokemonPools
}

export interface BiomeTierTod {
  biome: Biome,
  tier: BiomePoolTier,
  tod: TimeOfDay[]
}

export interface CatchableSpecies{
  [key: number]: BiomeTierTod[]
}

export const catchableSpecies: CatchableSpecies = {};

export interface BiomeTierTrainerPools {
  [key: number]: TrainerType[]
}

export interface BiomeTrainerPools {
  [key: number]: BiomeTierTrainerPools
}

export const biomePokemonPools: BiomePokemonPools = {
[Biome.Rhodes]: 
{ [BiomePoolTier.COMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[Species.ARK_P7,{1: [Species.ARK_P11], 8: [Species.ARK_P11_1]},{1: [Species.ARK_P10], 7: [Species.ARK_P10_1]},{1: [Species.ARK_P15], 7: [Species.ARK_P15_1]},{1: [Species.ARK_P16], 9: [Species.ARK_P16_1]},{1: [Species.ARK_P31], 12: [Species.ARK_P31_1], 21: [Species.ARK_P31_2]},{1: [Species.ARK_P33], 18: [Species.ARK_P33_1], 23: [Species.ARK_P33_2]},{1: [Species.ARK_P22], 12: [Species.ARK_P22_1], 29: [Species.ARK_P22_2]},{1: [Species.ARK_P29], 14: [Species.ARK_P29_1], 26: [Species.ARK_P29_2]},{1: [Species.ARK_P24], 18: [Species.ARK_P24_1], 27: [Species.ARK_P24_2]},{1: [Species.ARK_P36], 12: [Species.ARK_P36_1], 24: [Species.ARK_P36_2]},{1: [Species.ARK_P35], 15: [Species.ARK_P35_1], 23: [Species.ARK_P35_2]},{1: [Species.ARK_P37], 17: [Species.ARK_P37_1], 21: [Species.ARK_P37_2]},], 
}, [BiomePoolTier.UNCOMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[Species.ARK_P2,{1: [Species.ARK_P59], 18: [Species.ARK_P59_1], 37: [Species.ARK_P59_2]},{1: [Species.ARK_P60], 18: [Species.ARK_P60_1], 37: [Species.ARK_P60_2]},{1: [Species.ARK_P61], 22: [Species.ARK_P61_1], 37: [Species.ARK_P61_2]},{1: [Species.ARK_P45], 18: [Species.ARK_P45_1], 36: [Species.ARK_P45_2]},{1: [Species.ARK_P57], 19: [Species.ARK_P57_1], 31: [Species.ARK_P57_2]},{1: [Species.ARK_P66], 23: [Species.ARK_P66_1], 33: [Species.ARK_P66_2]},{1: [Species.ARK_P49], 18: [Species.ARK_P49_1], 31: [Species.ARK_P49_2]},{1: [Species.ARK_P58], 19: [Species.ARK_P58_1], 30: [Species.ARK_P58_2]},{1: [Species.ARK_P62], 23: [Species.ARK_P62_1], 36: [Species.ARK_P62_2]}], 
}, [BiomePoolTier.RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P81], 23: [Species.ARK_P81_1], 50: [Species.ARK_P81_2]},{1: [Species.ARK_P79], 25: [Species.ARK_P79_1], 50: [Species.ARK_P79_2]},{1: [Species.ARK_P72], 23: [Species.ARK_P72_1], 41: [Species.ARK_P72_2]}], 
}, [BiomePoolTier.SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.BOSS]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P11], 8: [Species.ARK_P11_1]},{1: [Species.ARK_P10], 7: [Species.ARK_P10_1]},{1: [Species.ARK_P15], 7: [Species.ARK_P15_1]},{1: [Species.ARK_P16], 9: [Species.ARK_P16_1]},{1: [Species.ARK_P31], 12: [Species.ARK_P31_1], 21: [Species.ARK_P31_2]},{1: [Species.ARK_P33], 18: [Species.ARK_P33_1], 23: [Species.ARK_P33_2]},{1: [Species.ARK_P22], 12: [Species.ARK_P22_1], 29: [Species.ARK_P22_2]},{1: [Species.ARK_P29], 14: [Species.ARK_P29_1], 26: [Species.ARK_P29_2]},{1: [Species.ARK_P24], 18: [Species.ARK_P24_1], 27: [Species.ARK_P24_2]},{1: [Species.ARK_P36], 12: [Species.ARK_P36_1], 24: [Species.ARK_P36_2]},{1: [Species.ARK_P35], 15: [Species.ARK_P35_1], 23: [Species.ARK_P35_2]},{1: [Species.ARK_P37], 17: [Species.ARK_P37_1], 21: [Species.ARK_P37_2]}], 
}, [BiomePoolTier.BOSS_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P59], 18: [Species.ARK_P59_1], 37: [Species.ARK_P59_2]},{1: [Species.ARK_P60], 18: [Species.ARK_P60_1], 37: [Species.ARK_P60_2]},{1: [Species.ARK_P61], 22: [Species.ARK_P61_1], 37: [Species.ARK_P61_2]},{1: [Species.ARK_P45], 18: [Species.ARK_P45_1], 36: [Species.ARK_P45_2]},{1: [Species.ARK_P57], 19: [Species.ARK_P57_1], 31: [Species.ARK_P57_2]},{1: [Species.ARK_P66], 23: [Species.ARK_P66_1], 33: [Species.ARK_P66_2]},{1: [Species.ARK_P49], 18: [Species.ARK_P49_1], 31: [Species.ARK_P49_2]},{1: [Species.ARK_P58], 19: [Species.ARK_P58_1], 30: [Species.ARK_P58_2]},{1: [Species.ARK_P62], 23: [Species.ARK_P62_1], 36: [Species.ARK_P62_2]}], 
}, [BiomePoolTier.BOSS_SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P81], 23: [Species.ARK_P81_1], 50: [Species.ARK_P81_2]},{1: [Species.ARK_P79], 25: [Species.ARK_P79_1], 50: [Species.ARK_P79_2]},{1: [Species.ARK_P72], 23: [Species.ARK_P72_1], 41: [Species.ARK_P72_2]}], 
}, [BiomePoolTier.BOSS_ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, 
}, [Biome.Rhodes1]: 
{ [BiomePoolTier.COMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[Species.ARK_P4,Species.ARK_P6,{1: [Species.ARK_P13], 9: [Species.ARK_P13_1]},{1: [Species.ARK_P18], 13: [Species.ARK_P18_1]},{1: [Species.ARK_P17], 8: [Species.ARK_P17_1]},{1: [Species.ARK_P8], 11: [Species.ARK_P8_1]},{1: [Species.ARK_P41], 15: [Species.ARK_P41_1], 29: [Species.ARK_P41_2]},{1: [Species.ARK_P25], 17: [Species.ARK_P25_1], 27: [Species.ARK_P25_2]},{1: [Species.ARK_P42], 17: [Species.ARK_P42_1], 23: [Species.ARK_P42_2]},{1: [Species.ARK_P23], 15: [Species.ARK_P23_1], 24: [Species.ARK_P23_2]},{1: [Species.ARK_P26], 14: [Species.ARK_P26_1], 23: [Species.ARK_P26_2]},{1: [Species.ARK_P28], 13: [Species.ARK_P28_1], 21: [Species.ARK_P28_2]},{1: [Species.ARK_P21], 12: [Species.ARK_P21_1], 28: [Species.ARK_P21_2]},{1: [Species.ARK_P27], 18: [Species.ARK_P27_1], 25: [Species.ARK_P27_2]},], 
}, [BiomePoolTier.UNCOMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[Species.ARK_P1,{1: [Species.ARK_P48], 22: [Species.ARK_P48_1], 35: [Species.ARK_P48_2]},{1: [Species.ARK_P51], 18: [Species.ARK_P51_1], 30: [Species.ARK_P51_2]},{1: [Species.ARK_P46], 19: [Species.ARK_P46_1], 30: [Species.ARK_P46_2]},{1: [Species.ARK_P55], 17: [Species.ARK_P55_1], 28: [Species.ARK_P55_2]},{1: [Species.ARK_P50], 17: [Species.ARK_P50_1], 35: [Species.ARK_P50_2]},{1: [Species.ARK_P54], 23: [Species.ARK_P54_1], 29: [Species.ARK_P54_2]},{1: [Species.ARK_P64], 23: [Species.ARK_P64_1], 33: [Species.ARK_P64_2]},{1: [Species.ARK_P70], 22: [Species.ARK_P70_1], 29: [Species.ARK_P70_2]},{1: [Species.ARK_P71], 21: [Species.ARK_P71_1], 36: [Species.ARK_P71_2]}], 
}, [BiomePoolTier.RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P78], 28: [Species.ARK_P78_1], 40: [Species.ARK_P78_2]},{1: [Species.ARK_P73], 26: [Species.ARK_P73_1], 50: [Species.ARK_P73_2]},{1: [Species.ARK_P80], 28: [Species.ARK_P80_1], 47: [Species.ARK_P80_2]}], 
}, [BiomePoolTier.SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.BOSS]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P13], 9: [Species.ARK_P13_1]},{1: [Species.ARK_P18], 13: [Species.ARK_P18_1]},{1: [Species.ARK_P17], 8: [Species.ARK_P17_1]},{1: [Species.ARK_P8], 11: [Species.ARK_P8_1]},{1: [Species.ARK_P41], 15: [Species.ARK_P41_1], 29: [Species.ARK_P41_2]},{1: [Species.ARK_P25], 17: [Species.ARK_P25_1], 27: [Species.ARK_P25_2]},{1: [Species.ARK_P42], 17: [Species.ARK_P42_1], 23: [Species.ARK_P42_2]},{1: [Species.ARK_P23], 15: [Species.ARK_P23_1], 24: [Species.ARK_P23_2]},{1: [Species.ARK_P26], 14: [Species.ARK_P26_1], 23: [Species.ARK_P26_2]},{1: [Species.ARK_P28], 13: [Species.ARK_P28_1], 21: [Species.ARK_P28_2]},{1: [Species.ARK_P21], 12: [Species.ARK_P21_1], 28: [Species.ARK_P21_2]},{1: [Species.ARK_P27], 18: [Species.ARK_P27_1], 25: [Species.ARK_P27_2]}], 
}, [BiomePoolTier.BOSS_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P48], 22: [Species.ARK_P48_1], 35: [Species.ARK_P48_2]},{1: [Species.ARK_P51], 18: [Species.ARK_P51_1], 30: [Species.ARK_P51_2]},{1: [Species.ARK_P46], 19: [Species.ARK_P46_1], 30: [Species.ARK_P46_2]},{1: [Species.ARK_P55], 17: [Species.ARK_P55_1], 28: [Species.ARK_P55_2]},{1: [Species.ARK_P50], 17: [Species.ARK_P50_1], 35: [Species.ARK_P50_2]},{1: [Species.ARK_P54], 23: [Species.ARK_P54_1], 29: [Species.ARK_P54_2]},{1: [Species.ARK_P64], 23: [Species.ARK_P64_1], 33: [Species.ARK_P64_2]},{1: [Species.ARK_P70], 22: [Species.ARK_P70_1], 29: [Species.ARK_P70_2]},{1: [Species.ARK_P71], 21: [Species.ARK_P71_1], 36: [Species.ARK_P71_2]}], 
}, [BiomePoolTier.BOSS_SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P78], 28: [Species.ARK_P78_1], 40: [Species.ARK_P78_2]},{1: [Species.ARK_P73], 26: [Species.ARK_P73_1], 50: [Species.ARK_P73_2]},{1: [Species.ARK_P80], 28: [Species.ARK_P80_1], 47: [Species.ARK_P80_2]}], 
}, [BiomePoolTier.BOSS_ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, 
}, [Biome.Rhodes2]: 
{ [BiomePoolTier.COMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[Species.ARK_P5,Species.ARK_P3,{1: [Species.ARK_P19], 9: [Species.ARK_P19_1]},{1: [Species.ARK_P20], 13: [Species.ARK_P20_1]},{1: [Species.ARK_P12], 12: [Species.ARK_P12_1]},{1: [Species.ARK_P14], 13: [Species.ARK_P14_1]},{1: [Species.ARK_P9], 11: [Species.ARK_P9_1]},{1: [Species.ARK_P39], 15: [Species.ARK_P39_1], 26: [Species.ARK_P39_2]},{1: [Species.ARK_P34], 17: [Species.ARK_P34_1], 19: [Species.ARK_P34_2]},{1: [Species.ARK_P40], 17: [Species.ARK_P40_1], 23: [Species.ARK_P40_2]},{1: [Species.ARK_P32], 13: [Species.ARK_P32_1], 21: [Species.ARK_P32_2]},{1: [Species.ARK_P30], 18: [Species.ARK_P30_1], 22: [Species.ARK_P30_2]},{1: [Species.ARK_P44], 18: [Species.ARK_P44_1], 29: [Species.ARK_P44_2]},{1: [Species.ARK_P43], 17: [Species.ARK_P43_1], 25: [Species.ARK_P43_2]},{1: [Species.ARK_P38], 12: [Species.ARK_P38_1], 21: [Species.ARK_P38_2]},], 
}, [BiomePoolTier.UNCOMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[,{1: [Species.ARK_P47], 20: [Species.ARK_P47_1], 27: [Species.ARK_P47_2]},{1: [Species.ARK_P67], 18: [Species.ARK_P67_1], 27: [Species.ARK_P67_2]},{1: [Species.ARK_P53], 21: [Species.ARK_P53_1], 30: [Species.ARK_P53_2]},{1: [Species.ARK_P63], 19: [Species.ARK_P63_1], 32: [Species.ARK_P63_2]},{1: [Species.ARK_P56], 20: [Species.ARK_P56_1], 35: [Species.ARK_P56_2]},{1: [Species.ARK_P69], 19: [Species.ARK_P69_1], 36: [Species.ARK_P69_2]},{1: [Species.ARK_P65], 20: [Species.ARK_P65_1], 35: [Species.ARK_P65_2]},{1: [Species.ARK_P68], 23: [Species.ARK_P68_1], 37: [Species.ARK_P68_2]},{1: [Species.ARK_P52], 20: [Species.ARK_P52_1], 30: [Species.ARK_P52_2]}], 
}, [BiomePoolTier.RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P75], 28: [Species.ARK_P75_1], 50: [Species.ARK_P75_2]},{1: [Species.ARK_P77], 24: [Species.ARK_P77_1], 50: [Species.ARK_P77_2]},{1: [Species.ARK_P76], 24: [Species.ARK_P76_1], 43: [Species.ARK_P76_2]},{1: [Species.ARK_P74], 24: [Species.ARK_P74_1], 44: [Species.ARK_P74_2]}], 
}, [BiomePoolTier.SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.BOSS]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P19], 9: [Species.ARK_P19_1]},{1: [Species.ARK_P20], 13: [Species.ARK_P20_1]},{1: [Species.ARK_P12], 12: [Species.ARK_P12_1]},{1: [Species.ARK_P14], 13: [Species.ARK_P14_1]},{1: [Species.ARK_P9], 11: [Species.ARK_P9_1]},{1: [Species.ARK_P39], 15: [Species.ARK_P39_1], 26: [Species.ARK_P39_2]},{1: [Species.ARK_P34], 17: [Species.ARK_P34_1], 19: [Species.ARK_P34_2]},{1: [Species.ARK_P40], 17: [Species.ARK_P40_1], 23: [Species.ARK_P40_2]},{1: [Species.ARK_P32], 13: [Species.ARK_P32_1], 21: [Species.ARK_P32_2]},{1: [Species.ARK_P30], 18: [Species.ARK_P30_1], 22: [Species.ARK_P30_2]},{1: [Species.ARK_P44], 18: [Species.ARK_P44_1], 29: [Species.ARK_P44_2]},{1: [Species.ARK_P43], 17: [Species.ARK_P43_1], 25: [Species.ARK_P43_2]},{1: [Species.ARK_P38], 12: [Species.ARK_P38_1], 21: [Species.ARK_P38_2]}], 
}, [BiomePoolTier.BOSS_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P47], 20: [Species.ARK_P47_1], 27: [Species.ARK_P47_2]},{1: [Species.ARK_P67], 18: [Species.ARK_P67_1], 27: [Species.ARK_P67_2]},{1: [Species.ARK_P53], 21: [Species.ARK_P53_1], 30: [Species.ARK_P53_2]},{1: [Species.ARK_P63], 19: [Species.ARK_P63_1], 32: [Species.ARK_P63_2]},{1: [Species.ARK_P56], 20: [Species.ARK_P56_1], 35: [Species.ARK_P56_2]},{1: [Species.ARK_P69], 19: [Species.ARK_P69_1], 36: [Species.ARK_P69_2]},{1: [Species.ARK_P65], 20: [Species.ARK_P65_1], 35: [Species.ARK_P65_2]},{1: [Species.ARK_P68], 23: [Species.ARK_P68_1], 37: [Species.ARK_P68_2]},{1: [Species.ARK_P52], 20: [Species.ARK_P52_1], 30: [Species.ARK_P52_2]}], 
}, [BiomePoolTier.BOSS_SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P75], 28: [Species.ARK_P75_1], 50: [Species.ARK_P75_2]},{1: [Species.ARK_P77], 24: [Species.ARK_P77_1], 50: [Species.ARK_P77_2]},{1: [Species.ARK_P76], 24: [Species.ARK_P76_1], 43: [Species.ARK_P76_2]},{1: [Species.ARK_P74], 24: [Species.ARK_P74_1], 44: [Species.ARK_P74_2]}], 
}, [BiomePoolTier.BOSS_ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, 
}, [Biome.END]: 
{ [BiomePoolTier.COMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[Species.ARK_P5,Species.ARK_P3,{1: [Species.ARK_P19], 9: [Species.ARK_P19_1]},{1: [Species.ARK_P20], 13: [Species.ARK_P20_1]},{1: [Species.ARK_P12], 12: [Species.ARK_P12_1]},{1: [Species.ARK_P14], 13: [Species.ARK_P14_1]},{1: [Species.ARK_P9], 11: [Species.ARK_P9_1]},{1: [Species.ARK_P39], 15: [Species.ARK_P39_1], 26: [Species.ARK_P39_2]},{1: [Species.ARK_P34], 17: [Species.ARK_P34_1], 19: [Species.ARK_P34_2]},{1: [Species.ARK_P40], 17: [Species.ARK_P40_1], 23: [Species.ARK_P40_2]},{1: [Species.ARK_P32], 13: [Species.ARK_P32_1], 21: [Species.ARK_P32_2]},{1: [Species.ARK_P30], 18: [Species.ARK_P30_1], 22: [Species.ARK_P30_2]},{1: [Species.ARK_P44], 18: [Species.ARK_P44_1], 29: [Species.ARK_P44_2]},{1: [Species.ARK_P43], 17: [Species.ARK_P43_1], 25: [Species.ARK_P43_2]},{1: [Species.ARK_P38], 12: [Species.ARK_P38_1], 21: [Species.ARK_P38_2]},], 
}, [BiomePoolTier.UNCOMMON]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[,{1: [Species.ARK_P47], 20: [Species.ARK_P47_1], 27: [Species.ARK_P47_2]},{1: [Species.ARK_P67], 18: [Species.ARK_P67_1], 27: [Species.ARK_P67_2]},{1: [Species.ARK_P53], 21: [Species.ARK_P53_1], 30: [Species.ARK_P53_2]},{1: [Species.ARK_P63], 19: [Species.ARK_P63_1], 32: [Species.ARK_P63_2]},{1: [Species.ARK_P56], 20: [Species.ARK_P56_1], 35: [Species.ARK_P56_2]},{1: [Species.ARK_P69], 19: [Species.ARK_P69_1], 36: [Species.ARK_P69_2]},{1: [Species.ARK_P65], 20: [Species.ARK_P65_1], 35: [Species.ARK_P65_2]},{1: [Species.ARK_P68], 23: [Species.ARK_P68_1], 37: [Species.ARK_P68_2]},{1: [Species.ARK_P52], 20: [Species.ARK_P52_1], 30: [Species.ARK_P52_2]}], 
}, [BiomePoolTier.RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P75], 28: [Species.ARK_P75_1], 50: [Species.ARK_P75_2]},{1: [Species.ARK_P77], 24: [Species.ARK_P77_1], 50: [Species.ARK_P77_2]},{1: [Species.ARK_P76], 24: [Species.ARK_P76_1], 43: [Species.ARK_P76_2]},{1: [Species.ARK_P74], 24: [Species.ARK_P74_1], 44: [Species.ARK_P74_2]}], 
}, [BiomePoolTier.SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, [BiomePoolTier.BOSS]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P19], 9: [Species.ARK_P19_1]},{1: [Species.ARK_P20], 13: [Species.ARK_P20_1]},{1: [Species.ARK_P12], 12: [Species.ARK_P12_1]},{1: [Species.ARK_P14], 13: [Species.ARK_P14_1]},{1: [Species.ARK_P9], 11: [Species.ARK_P9_1]},{1: [Species.ARK_P39], 15: [Species.ARK_P39_1], 26: [Species.ARK_P39_2]},{1: [Species.ARK_P34], 17: [Species.ARK_P34_1], 19: [Species.ARK_P34_2]},{1: [Species.ARK_P40], 17: [Species.ARK_P40_1], 23: [Species.ARK_P40_2]},{1: [Species.ARK_P32], 13: [Species.ARK_P32_1], 21: [Species.ARK_P32_2]},{1: [Species.ARK_P30], 18: [Species.ARK_P30_1], 22: [Species.ARK_P30_2]},{1: [Species.ARK_P44], 18: [Species.ARK_P44_1], 29: [Species.ARK_P44_2]},{1: [Species.ARK_P43], 17: [Species.ARK_P43_1], 25: [Species.ARK_P43_2]},{1: [Species.ARK_P38], 12: [Species.ARK_P38_1], 21: [Species.ARK_P38_2]}], 
}, [BiomePoolTier.BOSS_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P47], 20: [Species.ARK_P47_1], 27: [Species.ARK_P47_2]},{1: [Species.ARK_P67], 18: [Species.ARK_P67_1], 27: [Species.ARK_P67_2]},{1: [Species.ARK_P53], 21: [Species.ARK_P53_1], 30: [Species.ARK_P53_2]},{1: [Species.ARK_P63], 19: [Species.ARK_P63_1], 32: [Species.ARK_P63_2]},{1: [Species.ARK_P56], 20: [Species.ARK_P56_1], 35: [Species.ARK_P56_2]},{1: [Species.ARK_P69], 19: [Species.ARK_P69_1], 36: [Species.ARK_P69_2]},{1: [Species.ARK_P65], 20: [Species.ARK_P65_1], 35: [Species.ARK_P65_2]},{1: [Species.ARK_P68], 23: [Species.ARK_P68_1], 37: [Species.ARK_P68_2]},{1: [Species.ARK_P52], 20: [Species.ARK_P52_1], 30: [Species.ARK_P52_2]}], 
}, [BiomePoolTier.BOSS_SUPER_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[{1: [Species.ARK_P75], 28: [Species.ARK_P75_1], 50: [Species.ARK_P75_2]},{1: [Species.ARK_P77], 24: [Species.ARK_P77_1], 50: [Species.ARK_P77_2]},{1: [Species.ARK_P76], 24: [Species.ARK_P76_1], 43: [Species.ARK_P76_2]},{1: [Species.ARK_P74], 24: [Species.ARK_P74_1], 44: [Species.ARK_P74_2]}], 
}, [BiomePoolTier.BOSS_ULTRA_RARE]: 
{ [TimeOfDay.DAWN]:
[], [TimeOfDay.DAY]:
[], [TimeOfDay.DUSK]:
[], [TimeOfDay.NIGHT]:
[], [TimeOfDay.ALL]:
[], 
}, 
},

};


export const biomeTrainerPools: BiomeTrainerPools = {
}



// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: init methods are expected to have many lines.
export function initBiomes() {
  const pokemonBiomes = [ [ Species.ARK_P1, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ]
    ] ],
[ Species.ARK_P2, PokemonType.SWORD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ]
    ] ],
[ Species.ARK_P3, PokemonType.SWORD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P4, PokemonType.SHIELD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P5, PokemonType.BOW, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P6, PokemonType.A_NEUTRALIZE, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P7, PokemonType.A_EXPLOSION, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P8, PokemonType.LANCE, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P9, PokemonType.AXE, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P10, PokemonType.LANCE, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P11, PokemonType.SWORD, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P12, PokemonType.SHIELD, PokemonType.A_HEALING, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P13, PokemonType.SHIELD, PokemonType.SWORD, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P14, PokemonType.CROSSBOW, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P15, PokemonType.CROSSBOW, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P16, PokemonType.A_EXPLOSION, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P17, PokemonType.A_HEALING, PokemonType.A_POISON, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P18, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P19, PokemonType.A_NEUTRALIZE, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P20, PokemonType.A_FROZEN, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ]
    ] ],
[ Species.ARK_P21, PokemonType.A_NEUTRALIZE, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P22, PokemonType.A_EXPLOSION, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P23, PokemonType.MUSKET, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P24, PokemonType.BOW, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P25, PokemonType.BOOMERANG, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P26, PokemonType.SWORD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P27, PokemonType.SWORD, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P28, PokemonType.LANCE, -1, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P29, PokemonType.WHIP, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P30, PokemonType.SWORD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P31, PokemonType.SWORD, PokemonType.A_ICE, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P32, PokemonType.FIST, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P33, PokemonType.FIST, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P34, PokemonType.DAGGER, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P35, PokemonType.WHIP, -1, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P36, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P37, PokemonType.A_HEALING, PokemonType.HAMMER, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P38, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P39, PokemonType.SHIELD, PokemonType.SWORD, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P40, PokemonType.SHIELD, PokemonType.HAMMER, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P41, PokemonType.SHIELD, PokemonType.A_HEALING, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P42, PokemonType.WHIP, PokemonType.A_WATER, [
      [ Biome.Rhodes1, BiomePoolTier.COMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P43, PokemonType.A_FROZEN, PokemonType.A_WIND, [
      [ Biome.Rhodes2, BiomePoolTier.COMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P44, PokemonType.AXE, PokemonType.A_WATER, [
      [ Biome.Rhodes, BiomePoolTier.COMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS ]
    ] ],
[ Species.ARK_P45, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P46, PokemonType.AXE, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P47, PokemonType.SWORD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P48, PokemonType.SWORD, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P49, PokemonType.FIST, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P50, PokemonType.SWORD, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P51, PokemonType.CHAINSAW, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P52, PokemonType.CROSSBOW, PokemonType.A_POISON, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P53, PokemonType.BOW, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P54, PokemonType.CANNON, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P55, PokemonType.A_FIRE, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P56, PokemonType.A_EXPLOSION, PokemonType.HAMMER, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P57, PokemonType.A_HEALING, PokemonType.A_WIND, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P58, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P59, PokemonType.SHIELD, PokemonType.A_HEALING, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P60, PokemonType.DAGGER, -1, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P61, PokemonType.SHIELD, PokemonType.MUSKET, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P62, PokemonType.SHIELD, PokemonType.HAMMER, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P63, PokemonType.HAMMER, PokemonType.A_DARK, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P64, PokemonType.CROSSBOW, -1, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P65, PokemonType.CROSSBOW, PokemonType.A_EXPLOSION, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P66, PokemonType.WHIP, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P67, PokemonType.A_NEUTRALIZE, PokemonType.A_WIND, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P68, PokemonType.A_NEUTRALIZE, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P69, PokemonType.A_HEALING, -1, [
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P70, PokemonType.A_POISON, -1, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P71, PokemonType.FIST, -1, [
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_RARE ]
    ] ],
[ Species.ARK_P72, PokemonType.MUSKET, -1, [
      [ Biome.Rhodes2, BiomePoolTier.RARE ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P73, PokemonType.HAMMER, -1, [
      [ Biome.Rhodes2, BiomePoolTier.RARE ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P74, PokemonType.A_FIRE, -1, [
      [ Biome.Rhodes, BiomePoolTier.RARE ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P75, PokemonType.A_FIRE, -1, [
      [ Biome.Rhodes2, BiomePoolTier.RARE ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P76, PokemonType.A_FROZEN, PokemonType.A_WIND, [
      [ Biome.Rhodes1, BiomePoolTier.RARE ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P77, PokemonType.A_HEALING, PokemonType.SWORD, [
      [ Biome.Rhodes, BiomePoolTier.RARE ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P78, PokemonType.A_HEALING, PokemonType.A_NEUTRALIZE, [
      [ Biome.Rhodes1, BiomePoolTier.RARE ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P79, PokemonType.SHIELD, -1, [
      [ Biome.Rhodes1, BiomePoolTier.RARE ],
      [ Biome.Rhodes1, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P80, PokemonType.SHIELD, PokemonType.A_HEALING, [
      [ Biome.Rhodes2, BiomePoolTier.RARE ],
      [ Biome.Rhodes2, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ],
[ Species.ARK_P81, PokemonType.SWORD, -1, [
      [ Biome.Rhodes, BiomePoolTier.RARE ],
      [ Biome.Rhodes, BiomePoolTier.BOSS_SUPER_RARE ]
    ] ]

];

  const trainerBiomes = [
    [ TrainerType.ACE_TRAINER, [
      [ Biome.Rhodes, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes1, BiomePoolTier.UNCOMMON ],
      [ Biome.Rhodes2, BiomePoolTier.UNCOMMON ],
      [ Biome.SWAMP, BiomePoolTier.UNCOMMON ],
      [ Biome.BEACH, BiomePoolTier.UNCOMMON ],
      [ Biome.LAKE, BiomePoolTier.UNCOMMON ],
      [ Biome.MOUNTAIN, BiomePoolTier.UNCOMMON ],
      [ Biome.BADLANDS, BiomePoolTier.UNCOMMON ],
      [ Biome.CAVE, BiomePoolTier.UNCOMMON ],
      [ Biome.MEADOW, BiomePoolTier.UNCOMMON ],
      [ Biome.RUINS, BiomePoolTier.UNCOMMON ],
      [ Biome.ABYSS, BiomePoolTier.UNCOMMON ],
      [ Biome.FAIRY_CAVE, BiomePoolTier.UNCOMMON ],
      [ Biome.TEMPLE, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.ARTIST, [
      [ Biome.METROPOLIS, BiomePoolTier.RARE ]
    ]
    ],
    [ TrainerType.BACKERS, []],
    [ TrainerType.BACKPACKER, [
      [ Biome.MOUNTAIN, BiomePoolTier.COMMON ],
      [ Biome.CAVE, BiomePoolTier.COMMON ],
      [ Biome.BADLANDS, BiomePoolTier.COMMON ],
      [ Biome.JUNGLE, BiomePoolTier.COMMON ],
      [ Biome.DESERT, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.BAKER, [
      [ Biome.SLUM, BiomePoolTier.UNCOMMON ],
      [ Biome.MEADOW, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.BEAUTY, [
      [ Biome.METROPOLIS, BiomePoolTier.COMMON ],
      [ Biome.MEADOW, BiomePoolTier.COMMON ],
      [ Biome.FAIRY_CAVE, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.BIKER, [
      [ Biome.SLUM, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.BLACK_BELT, [
      [ Biome.DOJO, BiomePoolTier.COMMON ],
      [ Biome.PLAINS, BiomePoolTier.RARE ],
      [ Biome.GRASS, BiomePoolTier.RARE ],
      [ Biome.SWAMP, BiomePoolTier.RARE ],
      [ Biome.BEACH, BiomePoolTier.RARE ],
      [ Biome.LAKE, BiomePoolTier.RARE ],
      [ Biome.MOUNTAIN, BiomePoolTier.COMMON ],
      [ Biome.CAVE, BiomePoolTier.UNCOMMON ],
      [ Biome.RUINS, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.BREEDER, [
      [ Biome.PLAINS, BiomePoolTier.COMMON ],
      [ Biome.GRASS, BiomePoolTier.COMMON ],
      [ Biome.TALL_GRASS, BiomePoolTier.UNCOMMON ],
      [ Biome.METROPOLIS, BiomePoolTier.UNCOMMON ],
      [ Biome.BEACH, BiomePoolTier.UNCOMMON ],
      [ Biome.LAKE, BiomePoolTier.COMMON ],
      [ Biome.MEADOW, BiomePoolTier.UNCOMMON ],
      [ Biome.FAIRY_CAVE, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.CLERK, [
      [ Biome.METROPOLIS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.CYCLIST, [
      [ Biome.PLAINS, BiomePoolTier.UNCOMMON ],
      [ Biome.METROPOLIS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.DANCER, []],
    [ TrainerType.DEPOT_AGENT, [
      [ Biome.METROPOLIS, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.DOCTOR, []],
    [ TrainerType.FIREBREATHER, [
      [ Biome.VOLCANO, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.FISHERMAN, [
      [ Biome.LAKE, BiomePoolTier.COMMON ],
      [ Biome.BEACH, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.GUITARIST, [
      [ Biome.METROPOLIS, BiomePoolTier.UNCOMMON ],
      [ Biome.POWER_PLANT, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.HARLEQUIN, []],
    [ TrainerType.HIKER, [
      [ Biome.MOUNTAIN, BiomePoolTier.COMMON ],
      [ Biome.CAVE, BiomePoolTier.COMMON ],
      [ Biome.BADLANDS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.HOOLIGANS, [
      [ Biome.SLUM, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.HOOPSTER, []],
    [ TrainerType.INFIELDER, []],
    [ TrainerType.JANITOR, []],
    [ TrainerType.LINEBACKER, []],
    [ TrainerType.MAID, []],
    [ TrainerType.MUSICIAN, [
      [ Biome.MEADOW, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.HEX_MANIAC, [
      [ Biome.RUINS, BiomePoolTier.UNCOMMON ],
      [ Biome.GRAVEYARD, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.NURSERY_AIDE, []],
    [ TrainerType.OFFICER, [
      [ Biome.METROPOLIS, BiomePoolTier.COMMON ],
      [ Biome.CONSTRUCTION_SITE, BiomePoolTier.COMMON ],
      [ Biome.SLUM, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.PARASOL_LADY, [
      [ Biome.SWAMP, BiomePoolTier.COMMON ],
      [ Biome.LAKE, BiomePoolTier.COMMON ],
      [ Biome.MEADOW, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.PILOT, [
      [ Biome.MOUNTAIN, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.POKEFAN, [
      [ Biome.GRASS, BiomePoolTier.UNCOMMON ],
      [ Biome.MEADOW, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.PRESCHOOLER, []],
    [ TrainerType.PSYCHIC, [
      [ Biome.GRAVEYARD, BiomePoolTier.COMMON ],
      [ Biome.RUINS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.RANGER, [
      [ Biome.TALL_GRASS, BiomePoolTier.UNCOMMON ],
      [ Biome.FOREST, BiomePoolTier.COMMON ],
      [ Biome.JUNGLE, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.RICH, [
      [ Biome.ISLAND, BiomePoolTier.UNCOMMON ]
    ]
    ],
    [ TrainerType.RICH_KID, [
      [ Biome.METROPOLIS, BiomePoolTier.RARE ],
      [ Biome.ISLAND, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.ROUGHNECK, [
      [ Biome.SLUM, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.SAILOR, [
      [ Biome.SEA, BiomePoolTier.COMMON ],
      [ Biome.BEACH, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.SCIENTIST, [
      [ Biome.DESERT, BiomePoolTier.COMMON ],
      [ Biome.RUINS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.SMASHER, []],
    [ TrainerType.SNOW_WORKER, [
      [ Biome.ICE_CAVE, BiomePoolTier.COMMON ],
      [ Biome.SNOWY_FOREST, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.STRIKER, []],
    [ TrainerType.SCHOOL_KID, [
      [ Biome.GRASS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.SWIMMER, [
      [ Biome.SEA, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.TWINS, [
      [ Biome.PLAINS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.VETERAN, [
      [ Biome.WASTELAND, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.WAITER, [
      [ Biome.METROPOLIS, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.WORKER, [
      [ Biome.POWER_PLANT, BiomePoolTier.COMMON ],
      [ Biome.FACTORY, BiomePoolTier.COMMON ],
      [ Biome.CONSTRUCTION_SITE, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.YOUNGSTER, [
      [ Biome.TOWN, BiomePoolTier.COMMON ]
    ]
    ],
    [ TrainerType.BROCK, [
      [ Biome.CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MISTY, [
      [ Biome.BEACH, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.LT_SURGE, [
      [ Biome.CONSTRUCTION_SITE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.ERIKA, [
      [ Biome.GRASS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.JANINE, [
      [ Biome.SWAMP, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.SABRINA, [
      [ Biome.RUINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.GIOVANNI, [
      [ Biome.LABORATORY, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BLAINE, [
      [ Biome.VOLCANO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.FALKNER, [
      [ Biome.MOUNTAIN, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BUGSY, [
      [ Biome.FOREST, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.WHITNEY, [
      [ Biome.METROPOLIS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MORTY, [
      [ Biome.GRAVEYARD, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CHUCK, [
      [ Biome.CONSTRUCTION_SITE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.JASMINE, [
      [ Biome.FACTORY, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.PRYCE, [
      [ Biome.ICE_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CLAIR, [
      [ Biome.WASTELAND, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.ROXANNE, [
      [ Biome.CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BRAWLY, [
      [ Biome.DOJO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.WATTSON, [
      [ Biome.CONSTRUCTION_SITE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.FLANNERY, [
      [ Biome.VOLCANO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.NORMAN, [
      [ Biome.METROPOLIS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.WINONA, [
      [ Biome.MOUNTAIN, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.TATE, [
      [ Biome.RUINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.LIZA, [
      [ Biome.RUINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.JUAN, [
      [ Biome.SEABED, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.ROARK, [
      [ Biome.CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.GARDENIA, [
      [ Biome.TALL_GRASS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CRASHER_WAKE, [
      [ Biome.LAKE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MAYLENE, [
      [ Biome.DOJO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.FANTINA, [
      [ Biome.TEMPLE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BYRON, [
      [ Biome.FACTORY, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CANDICE, [
      [ Biome.SNOWY_FOREST, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.VOLKNER, [
      [ Biome.POWER_PLANT, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CILAN, [
      [ Biome.PLAINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CHILI, [
      [ Biome.PLAINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CRESS, [
      [ Biome.PLAINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CHEREN, [
      [ Biome.PLAINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.LENORA, [
      [ Biome.MEADOW, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.ROXIE, [
      [ Biome.SWAMP, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BURGH, [
      [ Biome.FOREST, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.ELESA, [
      [ Biome.POWER_PLANT, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CLAY, [
      [ Biome.BADLANDS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.SKYLA, [
      [ Biome.MOUNTAIN, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BRYCEN, [
      [ Biome.ICE_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.DRAYDEN, [
      [ Biome.WASTELAND, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MARLON, [
      [ Biome.SEA, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.VIOLA, [
      [ Biome.TALL_GRASS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.GRANT, [
      [ Biome.BADLANDS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.KORRINA, [
      [ Biome.DOJO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.RAMOS, [
      [ Biome.JUNGLE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.CLEMONT, [
      [ Biome.POWER_PLANT, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.VALERIE, [
      [ Biome.FAIRY_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.OLYMPIA, [
      [ Biome.SPACE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.WULFRIC, [
      [ Biome.ICE_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MILO, [
      [ Biome.MEADOW, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.NESSA, [
      [ Biome.ISLAND, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.KABU, [
      [ Biome.VOLCANO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BEA, [
      [ Biome.DOJO, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.ALLISTER, [
      [ Biome.GRAVEYARD, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.OPAL, [
      [ Biome.FAIRY_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BEDE, [
      [ Biome.FAIRY_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.GORDIE, [
      [ Biome.DESERT, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MELONY, [
      [ Biome.SNOWY_FOREST, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.PIERS, [
      [ Biome.SLUM, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.MARNIE, [
      [ Biome.ABYSS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.RAIHAN, [
      [ Biome.WASTELAND, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.KATY, [
      [ Biome.FOREST, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.BRASSIUS, [
      [ Biome.TALL_GRASS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.IONO, [
      [ Biome.METROPOLIS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.KOFU, [
      [ Biome.BEACH, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.LARRY, [
      [ Biome.METROPOLIS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.RYME, [
      [ Biome.GRAVEYARD, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.TULIP, [
      [ Biome.RUINS, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.GRUSHA, [
      [ Biome.ICE_CAVE, BiomePoolTier.BOSS ]
    ]
    ],
    [ TrainerType.LORELEI, []],
    [ TrainerType.BRUNO, []],
    [ TrainerType.AGATHA, []],
    [ TrainerType.LANCE, []],
    [ TrainerType.WILL, []],
    [ TrainerType.KOGA, []],
    [ TrainerType.KAREN, []],
    [ TrainerType.SIDNEY, []],
    [ TrainerType.PHOEBE, []],
    [ TrainerType.GLACIA, []],
    [ TrainerType.DRAKE, []],
    [ TrainerType.AARON, []],
    [ TrainerType.BERTHA, []],
    [ TrainerType.FLINT, []],
    [ TrainerType.LUCIAN, []],
    [ TrainerType.SHAUNTAL, []],
    [ TrainerType.MARSHAL, []],
    [ TrainerType.GRIMSLEY, []],
    [ TrainerType.CAITLIN, []],
    [ TrainerType.MALVA, []],
    [ TrainerType.SIEBOLD, []],
    [ TrainerType.WIKSTROM, []],
    [ TrainerType.DRASNA, []],
    [ TrainerType.HALA, []],
    [ TrainerType.MOLAYNE, []],
    [ TrainerType.OLIVIA, []],
    [ TrainerType.ACEROLA, []],
    [ TrainerType.KAHILI, []],
    [ TrainerType.RIKA, []],
    [ TrainerType.POPPY, []],
    [ TrainerType.LARRY_ELITE, []],
    [ TrainerType.HASSEL, []],
    [ TrainerType.CRISPIN, []],
    [ TrainerType.AMARYS, []],
    [ TrainerType.LACEY, []],
    [ TrainerType.DRAYTON, []],
    [ TrainerType.BLUE, []],
    [ TrainerType.RED, []],
    [ TrainerType.LANCE_CHAMPION, []],
    [ TrainerType.STEVEN, []],
    [ TrainerType.WALLACE, []],
    [ TrainerType.CYNTHIA, []],
    [ TrainerType.ALDER, []],
    [ TrainerType.IRIS, []],
    [ TrainerType.DIANTHA, []],
    [ TrainerType.HAU, []],
    [ TrainerType.GEETA, []],
    [ TrainerType.NEMONA, []],
    [ TrainerType.KIERAN, []],
    [ TrainerType.LEON, []],
    [ TrainerType.RIVAL, []]
  ];

  biomeDepths[Biome.Rhodes] = [ 0, 1 ];

  const traverseBiome = (biome: Biome, depth: number) => {
    if (biome === Biome.END) {
      const biomeList = Object.keys(Biome).filter(key => !Number.isNaN(Number(key)));
      biomeList.pop(); // Removes Biome.END from the list
      const randIndex = randSeedInt(biomeList.length, 1); // Will never be Biome.TOWN
      biome = Biome[biomeList[randIndex]];
    }
    const linkedBiomes: (Biome | [ Biome, number ])[] = Array.isArray(biomeLinks[biome])
      ? biomeLinks[biome] as (Biome | [ Biome, number ])[]
      : [ biomeLinks[biome] as Biome ];
    for (const linkedBiomeEntry of linkedBiomes) {
      const linkedBiome = !Array.isArray(linkedBiomeEntry)
        ? linkedBiomeEntry as Biome
        : linkedBiomeEntry[0];
      const biomeChance = !Array.isArray(linkedBiomeEntry)
        ? 1
        : linkedBiomeEntry[1];
      if (!biomeDepths.hasOwnProperty(linkedBiome) || biomeChance < biomeDepths[linkedBiome][1] || (depth < biomeDepths[linkedBiome][0] && biomeChance === biomeDepths[linkedBiome][1])) {
        biomeDepths[linkedBiome] = [ depth + 1, biomeChance ];
        traverseBiome(linkedBiome, depth + 1);
      }
    }
  };

  traverseBiome(Biome.Rhodes, 0);
  biomeDepths[Biome.END] = [ Object.values(biomeDepths).map(d => d[0]).reduce((max: number, value: number) => Math.max(max, value), 0) + 1, 1 ];

  for (const biome of getEnumValues(Biome)) {
    biomePokemonPools[biome] = {};
    biomeTrainerPools[biome] = {};

    for (const tier of getEnumValues(BiomePoolTier)) {
      biomePokemonPools[biome][tier] = {};
      biomeTrainerPools[biome][tier] = [];

      for (const tod of getEnumValues(TimeOfDay)) {
        biomePokemonPools[biome][tier][tod] = [];
      }
    }
  }


  for (const pb of pokemonBiomes) {
    const speciesId = pb[0] as Species;
    const biomeEntries = pb[3] as (Biome | BiomePoolTier)[][];

    const speciesEvolutions: SpeciesFormEvolution[] = pokemonEvolutions.hasOwnProperty(speciesId)
      ? pokemonEvolutions[speciesId]
      : [];

    if (!biomeEntries.filter(b => b[0] !== Biome.END).length && !speciesEvolutions.filter(es => !!((pokemonBiomes.find(p => p[0] === es.speciesId)!)[3] as any[]).filter(b => b[0] !== Biome.END).length).length) { // TODO: is the bang on the `find()` correct?
      uncatchableSpecies.push(speciesId);
    }

    // array of biome options for the current species
    catchableSpecies[speciesId] = [];

    for (const b of biomeEntries) {
      const biome = b[0];
      const tier = b[1];
      const timesOfDay = b.length > 2
        ? Array.isArray(b[2])
          ? b[2]
          : [ b[2] ]
        : [ TimeOfDay.ALL ];

      catchableSpecies[speciesId].push({
        biome: biome as Biome,
        tier: tier as BiomePoolTier,
        tod: timesOfDay as TimeOfDay[]
      });

      for (const tod of timesOfDay) {
        if (!biomePokemonPools.hasOwnProperty(biome) || !biomePokemonPools[biome].hasOwnProperty(tier) || !biomePokemonPools[biome][tier].hasOwnProperty(tod)) {
          continue;
        }

        const biomeTierPool = biomePokemonPools[biome][tier][tod];
        let treeIndex = -1;
        let arrayIndex = 0;

        for (let t = 0; t < biomeTierPool.length; t++) {
          const existingSpeciesIds = biomeTierPool[t] as unknown as Species[];
          for (let es = 0; es < existingSpeciesIds.length; es++) {
            const existingSpeciesId = existingSpeciesIds[es];
            if (pokemonEvolutions.hasOwnProperty(existingSpeciesId) && (pokemonEvolutions[existingSpeciesId] as SpeciesFormEvolution[]).find(ese => ese.speciesId === speciesId)) {
              treeIndex = t;
              arrayIndex = es + 1;
              break;
            }
            if (speciesEvolutions?.find(se => se.speciesId === existingSpeciesId)) {
              treeIndex = t;
              arrayIndex = es;
              break;
            }
          }
          if (treeIndex > -1) {
            break;
          }
        }

        if (treeIndex > -1) {
          (biomeTierPool[treeIndex] as unknown as Species[]).splice(arrayIndex, 0, speciesId);
        } else {
          (biomeTierPool as unknown as Species[][]).push([ speciesId ]);
        }
      }
    }
  }

  for (const b of Object.keys(biomePokemonPools)) {
    for (const t of Object.keys(biomePokemonPools[b])) {
      const tier = Number.parseInt(t) as BiomePoolTier;
      for (const tod of Object.keys(biomePokemonPools[b][t])) {
        const biomeTierTimePool = biomePokemonPools[b][t][tod];
        for (let e = 0; e < biomeTierTimePool.length; e++) {
          const entry = biomeTierTimePool[e];
          if (entry.length === 1) {
            biomeTierTimePool[e] = entry[0];
          } else {
            const newEntry = {
              1: [ entry[0] ]
            };
            for (let s = 1; s < entry.length; s++) {
              const speciesId = entry[s];
              const prevolution = entry.flatMap((s: string | number) => pokemonEvolutions[s]).find(e => e && e.speciesId === speciesId);
              const level = prevolution.level - (prevolution.level === 1 ? 1 : 0) + (prevolution.wildDelay * 10) - (tier >= BiomePoolTier.BOSS ? 10 : 0);
              if (!newEntry.hasOwnProperty(level)) {
                newEntry[level] = [ speciesId ];
              } else {
                newEntry[level].push(speciesId);
              }
            }
            biomeTierTimePool[e] = newEntry;
          }
        }
      }
    }
  }

  for (const tb of trainerBiomes) {
    const trainerType = tb[0] as TrainerType;
    const biomeEntries = tb[1] as BiomePoolTier[][];

    for (const b of biomeEntries) {
      const biome = b[0];
      const tier = b[1];

      if (!biomeTrainerPools.hasOwnProperty(biome) || !biomeTrainerPools[biome].hasOwnProperty(tier)) {
        continue;
      }

      const biomeTierPool = biomeTrainerPools[biome][tier];
      biomeTierPool.push(trainerType);
    }
    //outputPools();
  }


  // used in a commented code
  // function outputPools() {
  //   const pokemonOutput = {};
  //   const trainerOutput = {};

  //   for (const b of Object.keys(biomePokemonPools)) {
  //     const biome = Biome[b];
  //     pokemonOutput[biome] = {};
  //     trainerOutput[biome] = {};

  //     for (const t of Object.keys(biomePokemonPools[b])) {
  //       const tier = BiomePoolTier[t];

  //       pokemonOutput[biome][tier] = {};

  //       for (const tod of Object.keys(biomePokemonPools[b][t])) {
  //         const timeOfDay = TimeOfDay[tod];

  //         pokemonOutput[biome][tier][timeOfDay] = [];

  //         for (const f of biomePokemonPools[b][t][tod]) {
  //           if (typeof f === "number") {
  //             pokemonOutput[biome][tier][timeOfDay].push(Species[f]);
  //           } else {
  //             const tree = {};

  //             for (const l of Object.keys(f)) {
  //               tree[l] = f[l].map(s => Species[s]);
  //             }

  //             pokemonOutput[biome][tier][timeOfDay].push(tree);
  //           }
  //         }

  //       }
  //     }

  //     for (const t of Object.keys(biomeTrainerPools[b])) {
  //       const tier = BiomePoolTier[t];

  //       trainerOutput[biome][tier] = [];

  //       for (const f of biomeTrainerPools[b][t]) {
  //         trainerOutput[biome][tier].push(TrainerType[f]);
  //       }
  //     }
  //   }

  //   console.log(beautify(pokemonOutput, null, 2, 180).replace(/(        |        (?:\{ "\d+": \[ )?|    "(?:.*?)": \[ |(?:,|\[) (?:"\w+": \[ |(?:\{ )?"\d+": \[ )?)"(\w+)"(?= |,|\n)/g, "$1Species.$2").replace(/"(\d+)": /g, "$1: ").replace(/((?:      )|(?:(?!\n)    "(?:.*?)": \{) |\[(?: .*? )?\], )"(\w+)"/g, "$1[TimeOfDay.$2]").replace(/(    )"(.*?)"/g, "$1[BiomePoolTier.$2]").replace(/(  )"(.*?)"/g, "$1[Biome.$2]"));
  //   console.log(beautify(trainerOutput, null, 2, 120).replace(/(      |      (?:\{ "\d+": \[ )?|    "(?:.*?)": \[ |, (?:(?:\{ )?"\d+": \[ )?)"(.*?)"/g, "$1TrainerType.$2").replace(/"(\d+)": /g, "$1: ").replace(/(    )"(.*?)"/g, "$1[BiomePoolTier.$2]").replace(/(  )"(.*?)"/g, "$1[Biome.$2]"));
  // }

  /*for (let pokemon of allSpecies) {
    if (pokemon.speciesId >= Species.XERNEAS)
      break;
    pokemonBiomes[pokemon.speciesId - 1][0] = Species[pokemonBiomes[pokemon.speciesId - 1][0]];
    pokemonBiomes[pokemon.speciesId - 1][1] = Type[pokemonBiomes[pokemon.speciesId - 1][1]];
    if (pokemonBiomes[pokemon.speciesId - 1][2] > -1)
      pokemonBiomes[pokemon.speciesId - 1][2] = Type[pokemonBiomes[pokemon.speciesId - 1][2]];
    for (let b of Utils.getEnumValues(Biome)) {
      if (biomePools.hasOwnProperty(b)) {
        let poolTier = -1;
        for (let t of Object.keys(biomePools[b])) {
          for (let p = 0; p < biomePools[b][t].length; p++) {
            if (biomePools[b][t][p] === pokemon.speciesId) {
              poolTier = parseInt(t) as BiomePoolTier;
              break;
            }
          }
        }
        if (poolTier > -1)
          pokemonBiomes[pokemon.speciesId - 1][3].push([ Biome[b], BiomePoolTier[poolTier] ]);
      } else if (biomePoolPredicates[b](pokemon)) {
        pokemonBiomes[pokemon.speciesId - 1][3].push([ Biome[b], BiomePoolTier[BiomePoolTier.COMMON] ]);
      }
    }
  }

  console.log(JSON.stringify(pokemonBiomes, null, '  '));*/
}
