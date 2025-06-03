import { Species } from "#enums/species";

export const POKERUS_STARTER_COUNT = 5;

// #region Friendship constants
export const CLASSIC_CANDY_FRIENDSHIP_MULTIPLIER = 3;
export const FRIENDSHIP_GAIN_FROM_BATTLE = 3;
export const FRIENDSHIP_GAIN_FROM_RARE_CANDY = 6;
export const FRIENDSHIP_LOSS_FROM_FAINT = 5;

/**
 * Function to get the cumulative friendship threshold at which a candy is earned
 * @param starterCost The cost of the starter, found in {@linkcode speciesStarterCosts}
 * @returns aforementioned threshold
 */
export function getStarterValueFriendshipCap(starterCost: number): number {
  switch (starterCost) {
    case 1:
      return 25;
    case 2:
      return 50;
    case 3:
      return 75;
    case 4:
      return 100;
    case 5:
      return 150;
    case 6:
      return 200;
    case 7:
      return 300;
    case 8:
    case 9:
      return 450;
    default:
      return 600;
  }
}

export const speciesStarterCosts = {
[Species.ARK_P1]: 1,
[Species.ARK_P2]: 1,
[Species.ARK_P3]: 2,
[Species.ARK_P4]: 2,
[Species.ARK_P5]: 2,
[Species.ARK_P6]: 2,
[Species.ARK_P7]: 2,
[Species.ARK_P8]: 3,
[Species.ARK_P9]: 3,
[Species.ARK_P10]: 3,
[Species.ARK_P11]: 3,
[Species.ARK_P12]: 3,
[Species.ARK_P13]: 3,
[Species.ARK_P14]: 3,
[Species.ARK_P15]: 3,
[Species.ARK_P16]: 3,
[Species.ARK_P17]: 3,
[Species.ARK_P18]: 3,
[Species.ARK_P19]: 3,
[Species.ARK_P20]: 3,
[Species.ARK_P21]: 4,
[Species.ARK_P22]: 4,
[Species.ARK_P23]: 4,
[Species.ARK_P24]: 4,
[Species.ARK_P25]: 4,
[Species.ARK_P26]: 4,
[Species.ARK_P27]: 4,
[Species.ARK_P28]: 4,
[Species.ARK_P29]: 4,
[Species.ARK_P30]: 4,
[Species.ARK_P31]: 4,
[Species.ARK_P32]: 4,
[Species.ARK_P33]: 4,
[Species.ARK_P34]: 4,
[Species.ARK_P35]: 4,
[Species.ARK_P36]: 4,
[Species.ARK_P37]: 4,
[Species.ARK_P38]: 4,
[Species.ARK_P39]: 4,
[Species.ARK_P40]: 4,
[Species.ARK_P41]: 4,
[Species.ARK_P42]: 4,
[Species.ARK_P43]: 4,
[Species.ARK_P44]: 4,
[Species.ARK_P45]: 5,
[Species.ARK_P46]: 5,
[Species.ARK_P47]: 5,
[Species.ARK_P48]: 5,
[Species.ARK_P49]: 5,
[Species.ARK_P50]: 5,
[Species.ARK_P51]: 5,
[Species.ARK_P52]: 5,
[Species.ARK_P53]: 5,
[Species.ARK_P54]: 5,
[Species.ARK_P55]: 5,
[Species.ARK_P56]: 5,
[Species.ARK_P57]: 5,
[Species.ARK_P58]: 5,
[Species.ARK_P59]: 5,
[Species.ARK_P60]: 5,
[Species.ARK_P61]: 5,
[Species.ARK_P62]: 5,
[Species.ARK_P63]: 5,
[Species.ARK_P64]: 5,
[Species.ARK_P65]: 5,
[Species.ARK_P66]: 5,
[Species.ARK_P67]: 5,
[Species.ARK_P68]: 5,
[Species.ARK_P69]: 5,
[Species.ARK_P70]: 5,
[Species.ARK_P71]: 5,
[Species.ARK_P72]: 6,
[Species.ARK_P73]: 6,
[Species.ARK_P74]: 6,
[Species.ARK_P75]: 6,
[Species.ARK_P76]: 6,
[Species.ARK_P77]: 6,
[Species.ARK_P78]: 6,
[Species.ARK_P79]: 6,
[Species.ARK_P80]: 6,
[Species.ARK_P81]: 6,};

const starterCandyCosts: { passive: number; costReduction: [number, number]; egg: number; }[] = [
  { passive: 40, costReduction: [ 25, 60 ], egg: 30 }, // 1 Cost
  { passive: 40, costReduction: [ 25, 60 ], egg: 30 }, // 2 Cost
  { passive: 35, costReduction: [ 20, 50 ], egg: 25 }, // 3 Cost
  { passive: 30, costReduction: [ 15, 40 ], egg: 20 }, // 4 Cost
  { passive: 25, costReduction: [ 12, 35 ], egg: 18 }, // 5 Cost
  { passive: 20, costReduction: [ 10, 30 ], egg: 15 }, // 6 Cost
  { passive: 15, costReduction: [ 8, 20 ], egg: 12 }, // 7 Cost
  { passive: 10, costReduction: [ 5, 15 ], egg: 10 }, // 8 Cost
  { passive: 10, costReduction: [ 5, 15 ], egg: 10 }, // 9 Cost
  { passive: 10, costReduction: [ 5, 15 ], egg: 10 }, // 10 Cost
];

/**
 * Getter for {@linkcode starterCandyCosts} for passive unlock candy cost based on initial point cost
 * @param starterCost the default point cost of the starter found in {@linkcode speciesStarterCosts}
 * @returns the candy cost for passive unlock
 */
export function getPassiveCandyCount(starterCost: number): number {
  return starterCandyCosts[starterCost - 1].passive;
}

/**
 * Getter for {@linkcode starterCandyCosts} for value reduction unlock candy cost based on initial point cost
 * @param starterCost the default point cost of the starter found in {@linkcode speciesStarterCosts}
 * @returns respective candy cost for the two cost reductions as an array 2 numbers
 */
export function getValueReductionCandyCounts(starterCost: number): [number, number] {
  return starterCandyCosts[starterCost - 1].costReduction;
}

/**
 * Getter for {@linkcode starterCandyCosts} for egg purchase candy cost based on initial point cost
 * @param starterCost the default point cost of the starter found in {@linkcode speciesStarterCosts}
 * @returns the candy cost for the purchasable egg
 */
export function getSameSpeciesEggCandyCounts(starterCost: number): number {
  return starterCandyCosts[starterCost - 1].egg;
}

