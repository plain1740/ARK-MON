import { Moves } from "#enums/moves";
import { Species } from "#enums/species";

export type LevelMoves = ([number, Moves])[];

interface PokemonSpeciesLevelMoves {
  [key: number]: LevelMoves
}

interface PokemonFormLevelMoves {
  [key: number]: LevelMoves
}

interface PokemonSpeciesFormLevelMoves {
  [key: number]: PokemonFormLevelMoves
}

/** Moves that can only be learned with a memory-mushroom */
export const RELEARN_MOVE = -1;
/** Moves that can only be learned with an evolve */
export const EVOLVE_MOVE = 0;

export const pokemonSpeciesLevelMoves: PokemonSpeciesLevelMoves = {
[Species.ARK_P1]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P2]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P3]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_125 ]
],
[Species.ARK_P4]: [
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ]
],
[Species.ARK_P5]: [
  [ 1, Moves.ARK_85 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P6]: [
  [ 1, Moves.ARK_01 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_11 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P7]: [
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P8]: [
  [ 1, Moves.ARK_36 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P8_1]: [
  [ EVOLVE_MOVE, Moves.ARK_37 ],
  [ EVOLVE_MOVE, Moves.ARK_40 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ]
],
[Species.ARK_P9]: [
  [ 1, Moves.ARK_89 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_59 ],
  [ 1, Moves.ARK_125 ]
],
[Species.ARK_P9_1]: [
  [ EVOLVE_MOVE, Moves.ARK_90 ],
  [ EVOLVE_MOVE, Moves.ARK_93 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ]
],
[Species.ARK_P10]: [
  [ 1, Moves.ARK_36 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P10_1]: [
  [ EVOLVE_MOVE, Moves.ARK_37 ],
  [ EVOLVE_MOVE, Moves.ARK_40 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ]
],
[Species.ARK_P11]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_36 ],
  [ 1, Moves.ARK_89 ]
],
[Species.ARK_P11_1]: [
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ],
  [ EVOLVE_MOVE, Moves.ARK_93 ],
  [ EVOLVE_MOVE, Moves.ARK_37 ]
],
[Species.ARK_P12]: [
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_104 ]
],
[Species.ARK_P12_1]: [
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P13]: [
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ]
],
[Species.ARK_P13_1]: [
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P14]: [
  [ 1, Moves.ARK_46 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P14_1]: [
  [ EVOLVE_MOVE, Moves.ARK_47 ],
  [ EVOLVE_MOVE, Moves.ARK_45 ],
  [ EVOLVE_MOVE, Moves.ARK_48 ],
  [ EVOLVE_MOVE, Moves.ARK_49 ]
],
[Species.ARK_P15]: [
  [ 1, Moves.ARK_46 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P15_1]: [
  [ EVOLVE_MOVE, Moves.ARK_45 ],
  [ EVOLVE_MOVE, Moves.ARK_48 ],
  [ EVOLVE_MOVE, Moves.ARK_49 ]
],
[Species.ARK_P16]: [
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P16_1]: [
  [ EVOLVE_MOVE, Moves.ARK_74 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ]
],
[Species.ARK_P17]: [
  [ 1, Moves.ARK_118 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P17_1]: [
  [ EVOLVE_MOVE, Moves.ARK_119 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P18]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P18_1]: [
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ],
  [ EVOLVE_MOVE, Moves.ARK_119 ]
],
[Species.ARK_P19]: [
  [ 1, Moves.ARK_01 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_11 ]
],
[Species.ARK_P19_1]: [
  [ EVOLVE_MOVE, Moves.ARK_02 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ]
],
[Species.ARK_P20]: [
  [ 1, Moves.ARK_52 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P20_1]: [
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ]
],
[Species.ARK_P21]: [
  [ 1, Moves.ARK_01 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_11 ]
],
[Species.ARK_P21_1]: [
  [ EVOLVE_MOVE, Moves.ARK_143 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ]
],
[Species.ARK_P21_2]: [
  [ 1, Moves.ARK_06 ],
  [ 1, Moves.ARK_08 ],
  [ 1, Moves.ARK_04 ],
  [ 1, Moves.ARK_153 ],
  [ 1, Moves.ARK_10 ]
],
[Species.ARK_P22]: [
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_142 ],
  [ 1, Moves.ARK_96 ]
],
[Species.ARK_P22_1]: [
  [ EVOLVE_MOVE, Moves.ARK_03 ],
  [ EVOLVE_MOVE, Moves.ARK_98 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ]
],
[Species.ARK_P22_2]: [
  [ 1, Moves.ARK_154 ],
  [ 1, Moves.ARK_33 ],
  [ 1, Moves.ARK_51 ],
  [ 1, Moves.ARK_78 ]
],
[Species.ARK_P23]: [
  [ 1, Moves.ARK_131 ],
  [ 1, Moves.ARK_23 ],
  [ 1, Moves.ARK_99 ]
],
[Species.ARK_P23_1]: [
  [ EVOLVE_MOVE, Moves.ARK_97 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_48 ]
],
[Species.ARK_P23_2]: [
  [ 1, Moves.ARK_130 ],
  [ 1, Moves.ARK_132 ],
  [ 1, Moves.ARK_50 ],
  [ 1, Moves.ARK_47 ]
],
[Species.ARK_P24]: [
  [ 1, Moves.ARK_83 ],
  [ 1, Moves.ARK_84 ],
  [ 1, Moves.ARK_85 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P24_1]: [
  [ EVOLVE_MOVE, Moves.ARK_86 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_49 ]
],
[Species.ARK_P24_2]: [
  [ 1, Moves.ARK_87 ],
  [ 1, Moves.ARK_88 ],
  [ 1, Moves.ARK_101 ],
  [ 1, Moves.ARK_110 ]
],
[Species.ARK_P25]: [
  [ 1, Moves.ARK_81 ],
  [ 1, Moves.ARK_82 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P25_1]: [
  [ EVOLVE_MOVE, Moves.ARK_49 ],
  [ EVOLVE_MOVE, Moves.ARK_45 ]
],
[Species.ARK_P25_2]: [
  [ 1, Moves.ARK_47 ],
  [ 1, Moves.ARK_111 ]
],
[Species.ARK_P26]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_144 ]
],
[Species.ARK_P26_1]: [
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ],
  [ EVOLVE_MOVE, Moves.ARK_26 ],
  [ EVOLVE_MOVE, Moves.ARK_90 ]
],
[Species.ARK_P26_2]: [
  [ 1, Moves.ARK_72 ],
  [ 1, Moves.ARK_69 ],
  [ 1, Moves.ARK_66 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_63 ]
],
[Species.ARK_P27]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P27_1]: [
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ],
  [ EVOLVE_MOVE, Moves.ARK_90 ],
  [ EVOLVE_MOVE, Moves.ARK_127 ]
],
[Species.ARK_P27_2]: [
  [ 1, Moves.ARK_69 ],
  [ 1, Moves.ARK_66 ],
  [ 1, Moves.ARK_64 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_63 ]
],
[Species.ARK_P28]: [
  [ 1, Moves.ARK_36 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P28_1]: [
  [ EVOLVE_MOVE, Moves.ARK_39 ],
  [ EVOLVE_MOVE, Moves.ARK_37 ],
  [ EVOLVE_MOVE, Moves.ARK_40 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ]
],
[Species.ARK_P28_2]: [
  [ 1, Moves.ARK_38 ],
  [ 1, Moves.ARK_35 ],
  [ 1, Moves.ARK_67 ]
],
[Species.ARK_P29]: [
  [ 1, Moves.ARK_135 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P29_1]: [
  [ EVOLVE_MOVE, Moves.ARK_136 ],
  [ EVOLVE_MOVE, Moves.ARK_137 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ]
],
[Species.ARK_P29_2]: [
  [ 1, Moves.ARK_138 ],
  [ 1, Moves.ARK_139 ],
  [ 1, Moves.ARK_39 ],
  [ 1, Moves.ARK_58 ]
],
[Species.ARK_P30]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P30_1]: [
  [ EVOLVE_MOVE, Moves.ARK_69 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P30_2]: [
  [ 1, Moves.ARK_72 ],
  [ 1, Moves.ARK_64 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_63 ],
  [ 1, Moves.ARK_66 ]
],
[Species.ARK_P31]: [
  [ 1, Moves.ARK_37 ],
  [ 1, Moves.ARK_133 ],
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P31_1]: [
  [ EVOLVE_MOVE, Moves.ARK_38 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P31_2]: [
  [ 1, Moves.ARK_134 ],
  [ 1, Moves.ARK_72 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_64 ],
  [ 1, Moves.ARK_67 ]
],
[Species.ARK_P32]: [
  [ 1, Moves.ARK_27 ],
  [ 1, Moves.ARK_29 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P32_1]: [
  [ EVOLVE_MOVE, Moves.ARK_32 ],
  [ EVOLVE_MOVE, Moves.ARK_26 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ],
  [ EVOLVE_MOVE, Moves.ARK_31 ]
],
[Species.ARK_P32_2]: [
  [ 1, Moves.ARK_28 ],
  [ 1, Moves.ARK_34 ],
  [ 1, Moves.ARK_35 ]
],
[Species.ARK_P33]: [
  [ 1, Moves.ARK_31 ],
  [ 1, Moves.ARK_27 ],
  [ 1, Moves.ARK_29 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P33_1]: [
  [ EVOLVE_MOVE, Moves.ARK_34 ],
  [ EVOLVE_MOVE, Moves.ARK_26 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ]
],
[Species.ARK_P33_2]: [
  [ 1, Moves.ARK_28 ],
  [ 1, Moves.ARK_32 ],
  [ 1, Moves.ARK_35 ]
],
[Species.ARK_P34]: [
  [ 1, Moves.ARK_113 ],
  [ 1, Moves.ARK_148 ],
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_59 ]
],
[Species.ARK_P34_1]: [
  [ EVOLVE_MOVE, Moves.ARK_116 ],
  [ EVOLVE_MOVE, Moves.ARK_117 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ],
  [ EVOLVE_MOVE, Moves.ARK_37 ]
],
[Species.ARK_P34_2]: [
  [ 1, Moves.ARK_114 ],
  [ 1, Moves.ARK_115 ],
  [ 1, Moves.ARK_72 ],
  [ 1, Moves.ARK_67 ]
],
[Species.ARK_P35]: [
  [ 1, Moves.ARK_135 ],
  [ 1, Moves.ARK_144 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_113 ]
],
[Species.ARK_P35_1]: [
  [ EVOLVE_MOVE, Moves.ARK_138 ],
  [ EVOLVE_MOVE, Moves.ARK_137 ],
  [ EVOLVE_MOVE, Moves.ARK_40 ],
  [ EVOLVE_MOVE, Moves.ARK_26 ]
],
[Species.ARK_P35_2]: [
  [ 1, Moves.ARK_136 ],
  [ 1, Moves.ARK_139 ],
  [ 1, Moves.ARK_117 ],
  [ 1, Moves.ARK_124 ]
],
[Species.ARK_P36]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P36_1]: [
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_95 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ]
],
[Species.ARK_P36_2]: [
  [ 1, Moves.ARK_159 ],
  [ 1, Moves.ARK_157 ],
  [ 1, Moves.ARK_15 ],
  [ 1, Moves.ARK_19 ],
  [ 1, Moves.ARK_21 ]
],
[Species.ARK_P37]: [
  [ 1, Moves.ARK_16 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_125 ]
],
[Species.ARK_P37_1]: [
  [ EVOLVE_MOVE, Moves.ARK_127 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_98 ],
  [ EVOLVE_MOVE, Moves.ARK_74 ]
],
[Species.ARK_P37_2]: [
  [ 1, Moves.ARK_19 ],
  [ 1, Moves.ARK_159 ],
  [ 1, Moves.ARK_157 ],
  [ 1, Moves.ARK_126 ],
  [ 1, Moves.ARK_124 ]
],
[Species.ARK_P38]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_140 ]
],
[Species.ARK_P38_1]: [
  [ EVOLVE_MOVE, Moves.ARK_15 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P38_2]: [
  [ 1, Moves.ARK_14 ],
  [ 1, Moves.ARK_159 ],
  [ 1, Moves.ARK_21 ],
  [ 1, Moves.ARK_17 ],
  [ 1, Moves.ARK_157 ]
],
[Species.ARK_P39]: [
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_104 ]
],
[Species.ARK_P39_1]: [
  [ EVOLVE_MOVE, Moves.ARK_107 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P39_2]: [
  [ 1, Moves.ARK_63 ],
  [ 1, Moves.ARK_110 ],
  [ 1, Moves.ARK_106 ],
  [ 1, Moves.ARK_108 ],
  [ 1, Moves.ARK_69 ]
],
[Species.ARK_P40]: [
  [ 1, Moves.ARK_125 ],
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ]
],
[Species.ARK_P40_1]: [
  [ EVOLVE_MOVE, Moves.ARK_108 ],
  [ EVOLVE_MOVE, Moves.ARK_127 ],
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ]
],
[Species.ARK_P40_2]: [
  [ 1, Moves.ARK_111 ],
  [ 1, Moves.ARK_110 ],
  [ 1, Moves.ARK_101 ],
  [ 1, Moves.ARK_107 ],
  [ 1, Moves.ARK_124 ]
],
[Species.ARK_P41]: [
  [ 1, Moves.ARK_100 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_99 ]
],
[Species.ARK_P41_1]: [
  [ EVOLVE_MOVE, Moves.ARK_101 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P41_2]: [
  [ 1, Moves.ARK_157 ],
  [ 1, Moves.ARK_106 ],
  [ 1, Moves.ARK_21 ],
  [ 1, Moves.ARK_111 ],
  [ 1, Moves.ARK_17 ]
],
[Species.ARK_P42]: [
  [ 1, Moves.ARK_135 ],
  [ 1, Moves.ARK_24 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P42_1]: [
  [ EVOLVE_MOVE, Moves.ARK_139 ],
  [ EVOLVE_MOVE, Moves.ARK_25 ],
  [ EVOLVE_MOVE, Moves.ARK_137 ]
],
[Species.ARK_P42_2]: [
  [ 1, Moves.ARK_136 ],
  [ 1, Moves.ARK_138 ],
  [ 1, Moves.ARK_115 ],
  [ 1, Moves.ARK_126 ]
],
[Species.ARK_P43]: [
  [ 1, Moves.ARK_98 ],
  [ 1, Moves.ARK_96 ],
  [ 1, Moves.ARK_52 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P43_1]: [
  [ EVOLVE_MOVE, Moves.ARK_95 ],
  [ EVOLVE_MOVE, Moves.ARK_74 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ]
],
[Species.ARK_P43_2]: [
  [ 1, Moves.ARK_97 ],
  [ 1, Moves.ARK_51 ],
  [ 1, Moves.ARK_53 ],
  [ 1, Moves.ARK_55 ]
],
[Species.ARK_P44]: [
  [ 1, Moves.ARK_93 ],
  [ 1, Moves.ARK_89 ],
  [ 1, Moves.ARK_24 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P44_1]: [
  [ EVOLVE_MOVE, Moves.ARK_90 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ]
],
[Species.ARK_P44_2]: [
  [ 1, Moves.ARK_91 ],
  [ 1, Moves.ARK_25 ],
  [ 1, Moves.ARK_32 ],
  [ 1, Moves.ARK_67 ]
],
[Species.ARK_P45]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P45_1]: [
  [ EVOLVE_MOVE, Moves.ARK_14 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P45_2]: [
  [ 1, Moves.ARK_159 ],
  [ 1, Moves.ARK_19 ],
  [ 1, Moves.ARK_21 ],
  [ 1, Moves.ARK_157 ],
  [ 1, Moves.ARK_15 ]
],
[Species.ARK_P46]: [
  [ 1, Moves.ARK_89 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P46_1]: [
  [ EVOLVE_MOVE, Moves.ARK_90 ],
  [ EVOLVE_MOVE, Moves.ARK_93 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ]
],
[Species.ARK_P46_2]: [
  [ 1, Moves.ARK_92 ],
  [ 1, Moves.ARK_91 ],
  [ 1, Moves.ARK_138 ],
  [ 1, Moves.ARK_35 ]
],
[Species.ARK_P47]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_125 ],
  [ 1, Moves.ARK_59 ]
],
[Species.ARK_P47_1]: [
  [ EVOLVE_MOVE, Moves.ARK_63 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P47_2]: [
  [ 1, Moves.ARK_66 ],
  [ 1, Moves.ARK_69 ],
  [ 1, Moves.ARK_72 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_67 ]
],
[Species.ARK_P48]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P48_1]: [
  [ EVOLVE_MOVE, Moves.ARK_64 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P48_2]: [
  [ 1, Moves.ARK_63 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_67 ],
  [ 1, Moves.ARK_66 ],
  [ 1, Moves.ARK_72 ]
],
[Species.ARK_P49]: [
  [ 1, Moves.ARK_26 ],
  [ 1, Moves.ARK_30 ],
  [ 1, Moves.ARK_27 ],
  [ 1, Moves.ARK_29 ]
],
[Species.ARK_P49_1]: [
  [ EVOLVE_MOVE, Moves.ARK_31 ],
  [ EVOLVE_MOVE, Moves.ARK_90 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P49_2]: [
  [ 1, Moves.ARK_28 ],
  [ 1, Moves.ARK_32 ],
  [ 1, Moves.ARK_34 ],
  [ 1, Moves.ARK_35 ]
],
[Species.ARK_P50]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_89 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P50_1]: [
  [ EVOLVE_MOVE, Moves.ARK_66 ],
  [ EVOLVE_MOVE, Moves.ARK_71 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P50_2]: [
  [ 1, Moves.ARK_63 ],
  [ 1, Moves.ARK_64 ],
  [ 1, Moves.ARK_67 ],
  [ 1, Moves.ARK_69 ],
  [ 1, Moves.ARK_72 ]
],
[Species.ARK_P51]: [
  [ 1, Moves.ARK_56 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_36 ],
  [ 1, Moves.ARK_59 ]
],
[Species.ARK_P51_1]: [
  [ EVOLVE_MOVE, Moves.ARK_57 ],
  [ EVOLVE_MOVE, Moves.ARK_58 ],
  [ EVOLVE_MOVE, Moves.ARK_90 ],
  [ EVOLVE_MOVE, Moves.ARK_127 ]
],
[Species.ARK_P51_2]: [
  [ 1, Moves.ARK_155 ],
  [ 1, Moves.ARK_158 ],
  [ 1, Moves.ARK_28 ],
  [ 1, Moves.ARK_115 ]
],
[Species.ARK_P52]: [
  [ 1, Moves.ARK_118 ],
  [ 1, Moves.ARK_46 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P52_1]: [
  [ EVOLVE_MOVE, Moves.ARK_119 ],
  [ EVOLVE_MOVE, Moves.ARK_45 ],
  [ EVOLVE_MOVE, Moves.ARK_48 ],
  [ EVOLVE_MOVE, Moves.ARK_49 ]
],
[Species.ARK_P52_2]: [
  [ 1, Moves.ARK_121 ],
  [ 1, Moves.ARK_122 ],
  [ 1, Moves.ARK_47 ],
  [ 1, Moves.ARK_50 ]
],
[Species.ARK_P53]: [
  [ 1, Moves.ARK_85 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P53_1]: [
  [ EVOLVE_MOVE, Moves.ARK_88 ],
  [ EVOLVE_MOVE, Moves.ARK_83 ],
  [ EVOLVE_MOVE, Moves.ARK_84 ],
  [ EVOLVE_MOVE, Moves.ARK_86 ]
],
[Species.ARK_P53_2]: [
  [ 1, Moves.ARK_87 ],
  [ 1, Moves.ARK_132 ],
  [ 1, Moves.ARK_130 ]
],
[Species.ARK_P54]: [
  [ 1, Moves.ARK_42 ],
  [ 1, Moves.ARK_43 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_23 ]
],
[Species.ARK_P54_1]: [
  [ EVOLVE_MOVE, Moves.ARK_152 ],
  [ EVOLVE_MOVE, Moves.ARK_49 ]
],
[Species.ARK_P54_2]: [
  [ 1, Moves.ARK_44 ],
  [ 1, Moves.ARK_109 ],
  [ 1, Moves.ARK_101 ]
],
[Species.ARK_P55]: [
  [ 1, Moves.ARK_75 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_60 ]
],
[Species.ARK_P55_1]: [
  [ EVOLVE_MOVE, Moves.ARK_78 ],
  [ EVOLVE_MOVE, Moves.ARK_74 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ]
],
[Species.ARK_P55_2]: [
  [ 1, Moves.ARK_79 ],
  [ 1, Moves.ARK_80 ],
  [ 1, Moves.ARK_55 ],
  [ 1, Moves.ARK_10 ]
],
[Species.ARK_P56]: [
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_125 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P56_1]: [
  [ EVOLVE_MOVE, Moves.ARK_33 ],
  [ EVOLVE_MOVE, Moves.ARK_35 ],
  [ EVOLVE_MOVE, Moves.ARK_127 ]
],
[Species.ARK_P56_2]: [
  [ 1, Moves.ARK_154 ],
  [ 1, Moves.ARK_124 ],
  [ 1, Moves.ARK_126 ]
],
[Species.ARK_P57]: [
  [ 1, Moves.ARK_96 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ]
],
[Species.ARK_P57_1]: [
  [ EVOLVE_MOVE, Moves.ARK_95 ],
  [ EVOLVE_MOVE, Moves.ARK_98 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P57_2]: [
  [ 1, Moves.ARK_19 ],
  [ 1, Moves.ARK_17 ],
  [ 1, Moves.ARK_14 ],
  [ 1, Moves.ARK_97 ],
  [ 1, Moves.ARK_15 ]
],
[Species.ARK_P58]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P58_1]: [
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ],
  [ EVOLVE_MOVE, Moves.ARK_74 ]
],
[Species.ARK_P58_2]: [
  [ 1, Moves.ARK_18 ],
  [ 1, Moves.ARK_15 ],
  [ 1, Moves.ARK_21 ],
  [ 1, Moves.ARK_157 ],
  [ 1, Moves.ARK_159 ]
],
[Species.ARK_P59]: [
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ]
],
[Species.ARK_P59_1]: [
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P59_2]: [
  [ 1, Moves.ARK_106 ],
  [ 1, Moves.ARK_14 ],
  [ 1, Moves.ARK_109 ],
  [ 1, Moves.ARK_111 ],
  [ 1, Moves.ARK_19 ]
],
[Species.ARK_P60]: [
  [ 1, Moves.ARK_113 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_125 ]
],
[Species.ARK_P60_1]: [
  [ EVOLVE_MOVE, Moves.ARK_114 ],
  [ EVOLVE_MOVE, Moves.ARK_115 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ]
],
[Species.ARK_P60_2]: [
  [ 1, Moves.ARK_116 ],
  [ 1, Moves.ARK_117 ],
  [ 1, Moves.ARK_91 ],
  [ 1, Moves.ARK_139 ]
],
[Species.ARK_P61]: [
  [ 1, Moves.ARK_131 ],
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ]
],
[Species.ARK_P61_1]: [
  [ EVOLVE_MOVE, Moves.ARK_123 ],
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ]
],
[Species.ARK_P61_2]: [
  [ 1, Moves.ARK_130 ],
  [ 1, Moves.ARK_108 ],
  [ 1, Moves.ARK_110 ],
  [ 1, Moves.ARK_106 ],
  [ 1, Moves.ARK_109 ]
],
[Species.ARK_P62]: [
  [ 1, Moves.ARK_125 ],
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P62_1]: [
  [ EVOLVE_MOVE, Moves.ARK_124 ],
  [ EVOLVE_MOVE, Moves.ARK_127 ],
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ]
],
[Species.ARK_P62_2]: [
  [ 1, Moves.ARK_109 ],
  [ 1, Moves.ARK_101 ],
  [ 1, Moves.ARK_106 ],
  [ 1, Moves.ARK_111 ],
  [ 1, Moves.ARK_107 ]
],
[Species.ARK_P63]: [
  [ 1, Moves.ARK_142 ],
  [ 1, Moves.ARK_125 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P63_1]: [
  [ EVOLVE_MOVE, Moves.ARK_126 ],
  [ EVOLVE_MOVE, Moves.ARK_127 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ]
],
[Species.ARK_P63_2]: [
  [ 1, Moves.ARK_143 ],
  [ 1, Moves.ARK_124 ],
  [ 1, Moves.ARK_71 ],
  [ 1, Moves.ARK_57 ]
],
[Species.ARK_P64]: [
  [ 1, Moves.ARK_49 ],
  [ 1, Moves.ARK_46 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P64_1]: [
  [ EVOLVE_MOVE, Moves.ARK_50 ],
  [ EVOLVE_MOVE, Moves.ARK_45 ],
  [ EVOLVE_MOVE, Moves.ARK_48 ]
],
[Species.ARK_P64_2]: [
  [ 1, Moves.ARK_47 ],
  [ 1, Moves.ARK_132 ],
  [ 1, Moves.ARK_110 ]
],
[Species.ARK_P65]: [
  [ 1, Moves.ARK_48 ],
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_46 ]
],
[Species.ARK_P65_1]: [
  [ EVOLVE_MOVE, Moves.ARK_45 ],
  [ EVOLVE_MOVE, Moves.ARK_49 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ]
],
[Species.ARK_P65_2]: [
  [ 1, Moves.ARK_141 ],
  [ 1, Moves.ARK_154 ],
  [ 1, Moves.ARK_33 ],
  [ 1, Moves.ARK_47 ],
  [ 1, Moves.ARK_50 ]
],
[Species.ARK_P66]: [
  [ 1, Moves.ARK_135 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_113 ],
  [ 1, Moves.ARK_89 ]
],
[Species.ARK_P66_1]: [
  [ EVOLVE_MOVE, Moves.ARK_137 ],
  [ EVOLVE_MOVE, Moves.ARK_31 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P66_2]: [
  [ 1, Moves.ARK_136 ],
  [ 1, Moves.ARK_138 ],
  [ 1, Moves.ARK_139 ]
],
[Species.ARK_P67]: [
  [ 1, Moves.ARK_95 ],
  [ 1, Moves.ARK_11 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_01 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P67_1]: [
  [ EVOLVE_MOVE, Moves.ARK_134 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ],
  [ EVOLVE_MOVE, Moves.ARK_98 ]
],
[Species.ARK_P67_2]: [
  [ 1, Moves.ARK_08 ],
  [ 1, Moves.ARK_153 ],
  [ 1, Moves.ARK_04 ],
  [ 1, Moves.ARK_06 ],
  [ 1, Moves.ARK_10 ]
],
[Species.ARK_P68]: [
  [ 1, Moves.ARK_01 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_11 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P68_1]: [
  [ EVOLVE_MOVE, Moves.ARK_53 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ]
],
[Species.ARK_P68_2]: [
  [ 1, Moves.ARK_153 ],
  [ 1, Moves.ARK_08 ],
  [ 1, Moves.ARK_03 ],
  [ 1, Moves.ARK_06 ],
  [ 1, Moves.ARK_04 ]
],
[Species.ARK_P69]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P69_1]: [
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ]
],
[Species.ARK_P69_2]: [
  [ 1, Moves.ARK_14 ],
  [ 1, Moves.ARK_15 ],
  [ 1, Moves.ARK_159 ],
  [ 1, Moves.ARK_21 ],
  [ 1, Moves.ARK_157 ]
],
[Species.ARK_P70]: [
  [ 1, Moves.ARK_118 ],
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_96 ]
],
[Species.ARK_P70_1]: [
  [ EVOLVE_MOVE, Moves.ARK_121 ],
  [ EVOLVE_MOVE, Moves.ARK_119 ],
  [ EVOLVE_MOVE, Moves.ARK_98 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ]
],
[Species.ARK_P70_2]: [
  [ 1, Moves.ARK_120 ],
  [ 1, Moves.ARK_122 ],
  [ 1, Moves.ARK_21 ],
  [ 1, Moves.ARK_157 ]
],
[Species.ARK_P71]: [
  [ 1, Moves.ARK_27 ],
  [ 1, Moves.ARK_29 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P71_1]: [
  [ EVOLVE_MOVE, Moves.ARK_28 ],
  [ EVOLVE_MOVE, Moves.ARK_26 ],
  [ EVOLVE_MOVE, Moves.ARK_30 ],
  [ EVOLVE_MOVE, Moves.ARK_31 ]
],
[Species.ARK_P71_2]: [
  [ 1, Moves.ARK_32 ],
  [ 1, Moves.ARK_34 ],
  [ 1, Moves.ARK_35 ]
],
[Species.ARK_P72]: [
  [ 1, Moves.ARK_131 ],
  [ 1, Moves.ARK_46 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P72_1]: [
  [ EVOLVE_MOVE, Moves.ARK_130 ],
  [ EVOLVE_MOVE, Moves.ARK_132 ],
  [ EVOLVE_MOVE, Moves.ARK_86 ],
  [ EVOLVE_MOVE, Moves.ARK_83 ]
],
[Species.ARK_P72_2]: [
  [ 1, Moves.ARK_129 ],
  [ 1, Moves.ARK_108 ],
  [ 1, Moves.ARK_44 ]
],
[Species.ARK_P73]: [
  [ 1, Moves.ARK_127 ],
  [ 1, Moves.ARK_125 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P73_1]: [
  [ EVOLVE_MOVE, Moves.ARK_137 ],
  [ EVOLVE_MOVE, Moves.ARK_61 ]
],
[Species.ARK_P73_2]: [
  [ 1, Moves.ARK_128 ],
  [ 1, Moves.ARK_124 ],
  [ 1, Moves.ARK_126 ]
],
[Species.ARK_P74]: [
  [ 1, Moves.ARK_74 ],
  [ 1, Moves.ARK_75 ],
  [ 1, Moves.ARK_145 ],
  [ 1, Moves.ARK_146 ]
],
[Species.ARK_P74_1]: [
  [ EVOLVE_MOVE, Moves.ARK_79 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ],
  [ EVOLVE_MOVE, Moves.ARK_02 ]
],
[Species.ARK_P74_2]: [
  [ 1, Moves.ARK_76 ],
  [ 1, Moves.ARK_78 ],
  [ 1, Moves.ARK_80 ]
],
[Species.ARK_P75]: [
  [ 1, Moves.ARK_75 ],
  [ 1, Moves.ARK_140 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P75_1]: [
  [ EVOLVE_MOVE, Moves.ARK_80 ],
  [ EVOLVE_MOVE, Moves.ARK_74 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ]
],
[Species.ARK_P75_2]: [
  [ 1, Moves.ARK_77 ],
  [ 1, Moves.ARK_78 ],
  [ 1, Moves.ARK_79 ]
],
[Species.ARK_P76]: [
  [ 1, Moves.ARK_96 ],
  [ 1, Moves.ARK_52 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P76_1]: [
  [ EVOLVE_MOVE, Moves.ARK_51 ],
  [ EVOLVE_MOVE, Moves.ARK_55 ],
  [ EVOLVE_MOVE, Moves.ARK_95 ],
  [ EVOLVE_MOVE, Moves.ARK_98 ]
],
[Species.ARK_P76_2]: [
  [ 1, Moves.ARK_54 ],
  [ 1, Moves.ARK_97 ],
  [ 1, Moves.ARK_53 ]
],
[Species.ARK_P77]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P77_1]: [
  [ EVOLVE_MOVE, Moves.ARK_72 ],
  [ EVOLVE_MOVE, Moves.ARK_19 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ]
],
[Species.ARK_P77_2]: [
  [ 1, Moves.ARK_20 ],
  [ 1, Moves.ARK_69 ],
  [ 1, Moves.ARK_64 ],
  [ 1, Moves.ARK_14 ],
  [ 1, Moves.ARK_15 ]
],
[Species.ARK_P78]: [
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_13 ],
  [ 1, Moves.ARK_01 ],
  [ 1, Moves.ARK_07 ],
  [ 1, Moves.ARK_11 ]
],
[Species.ARK_P78_1]: [
  [ EVOLVE_MOVE, Moves.ARK_21 ],
  [ EVOLVE_MOVE, Moves.ARK_150 ],
  [ EVOLVE_MOVE, Moves.ARK_147 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ],
  [ EVOLVE_MOVE, Moves.ARK_09 ]
],
[Species.ARK_P78_2]: [
  [ 1, Moves.ARK_22 ],
  [ 1, Moves.ARK_19 ],
  [ 1, Moves.ARK_15 ],
  [ 1, Moves.ARK_14 ],
  [ 1, Moves.ARK_153 ]
],
[Species.ARK_P79]: [
  [ 1, Moves.ARK_104 ],
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_148 ]
],
[Species.ARK_P79_1]: [
  [ EVOLVE_MOVE, Moves.ARK_110 ],
  [ EVOLVE_MOVE, Moves.ARK_111 ],
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ]
],
[Species.ARK_P79_2]: [
  [ 1, Moves.ARK_103 ],
  [ 1, Moves.ARK_107 ],
  [ 1, Moves.ARK_108 ],
  [ 1, Moves.ARK_101 ],
  [ 1, Moves.ARK_106 ]
],
[Species.ARK_P80]: [
  [ 1, Moves.ARK_105 ],
  [ 1, Moves.ARK_12 ],
  [ 1, Moves.ARK_99 ],
  [ 1, Moves.ARK_146 ],
  [ 1, Moves.ARK_13 ]
],
[Species.ARK_P80_1]: [
  [ EVOLVE_MOVE, Moves.ARK_100 ],
  [ EVOLVE_MOVE, Moves.ARK_102 ],
  [ EVOLVE_MOVE, Moves.ARK_152 ],
  [ EVOLVE_MOVE, Moves.ARK_156 ],
  [ EVOLVE_MOVE, Moves.ARK_16 ]
],
[Species.ARK_P80_2]: [
  [ 1, Moves.ARK_112 ],
  [ 1, Moves.ARK_110 ],
  [ 1, Moves.ARK_101 ],
  [ 1, Moves.ARK_109 ],
  [ 1, Moves.ARK_107 ]
],
[Species.ARK_P81]: [
  [ 1, Moves.ARK_62 ],
  [ 1, Moves.ARK_70 ],
  [ 1, Moves.ARK_145 ]
],
[Species.ARK_P81_1]: [
  [ EVOLVE_MOVE, Moves.ARK_61 ],
  [ EVOLVE_MOVE, Moves.ARK_65 ],
  [ EVOLVE_MOVE, Moves.ARK_41 ],
  [ EVOLVE_MOVE, Moves.ARK_26 ]
],
[Species.ARK_P81_2]: [
  [ 1, Moves.ARK_68 ],
  [ 1, Moves.ARK_73 ],
  [ 1, Moves.ARK_67 ],
  [ 1, Moves.ARK_63 ],
  [ 1, Moves.ARK_64 ]
],

};

export const pokemonFormLevelMoves: PokemonSpeciesFormLevelMoves = {
};
