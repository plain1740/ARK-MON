import { PokemonType } from "#enums/pokemon-type";

export type TypeDamageMultiplier = 0 | 0.125 | 0.25 | 0.5 | 1 | 2 | 4 | 8;

export function getTypeDamageMultiplier(attackType: PokemonType, defType: PokemonType): TypeDamageMultiplier {
  if (attackType === PokemonType.UNKNOWN || defType === PokemonType.UNKNOWN) {
    return 1;
  }

switch (defType) {
  case PokemonType.SWORD  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.SCYTHE  :
      case PokemonType.BOW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
      case PokemonType.BOOMERANG  :
        return 1.0;
      case PokemonType.LANCE  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.CROSSBOW  :
        return 2.0;
      case PokemonType.DAGGER  :
      case PokemonType.AXE  :
      case PokemonType.SHIELD  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.LANCE  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.SHOTGUN  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.DAGGER  :
        return 0.0;
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
        return 0.5;
      case PokemonType.BOW  :
      case PokemonType.CROSSBOW  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.DAGGER  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.SCYTHE  :
        return 2.0;
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.BOW  :
      case PokemonType.CROSSBOW  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.FIST  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.SHOTGUN  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.BOW  :
        return 2.0;
      case PokemonType.CROSSBOW  :
      case PokemonType.MUSKET  :
      case PokemonType.BOOMERANG  :
        return 0.5;
      case PokemonType.CANNON  :
        return 0.0;
      default:
        return 1;
    }
  case PokemonType.WHIP  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.AXE  :
      case PokemonType.SCYTHE  :
      case PokemonType.MUSKET  :
        return 2.0;
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.BOW  :
      case PokemonType.CROSSBOW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.CANNON  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      default:
        return 1;
    }
  case PokemonType.AXE  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.FIST  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.SHOTGUN  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.DAGGER  :
      case PokemonType.WHIP  :
      case PokemonType.BOOMERANG  :
        return 0.5;
      case PokemonType.BOW  :
      case PokemonType.CROSSBOW  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.HAMMER  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.SCYTHE  :
      case PokemonType.CROSSBOW  :
        return 0.5;
      case PokemonType.LANCE  :
      case PokemonType.AXE  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.MUSKET  :
        return 2.0;
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.HAMMER  :
      case PokemonType.BOW  :
      case PokemonType.CANNON  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      default:
        return 1;
    }
  case PokemonType.CHAINSAW  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.FIST  :
      case PokemonType.CROSSBOW  :
      case PokemonType.MUSKET  :
        return 0.5;
      case PokemonType.LANCE  :
      case PokemonType.WHIP  :
      case PokemonType.HAMMER  :
      case PokemonType.SHOTGUN  :
        return 2.0;
      case PokemonType.DAGGER  :
      case PokemonType.AXE  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.BOW  :
      case PokemonType.CANNON  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      default:
        return 1;
    }
  case PokemonType.SCYTHE  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.BOW  :
      case PokemonType.SHOTGUN  :
        return 2.0;
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.AXE  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.CROSSBOW  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.HAMMER  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.BOW  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.SCYTHE  :
      case PokemonType.BOW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.LANCE  :
        return 0.5;
      case PokemonType.DAGGER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.CROSSBOW  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
      case PokemonType.BOOMERANG  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.CROSSBOW  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.BOW  :
      case PokemonType.MUSKET  :
        return 0.5;
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.CANNON  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 2.0;
      case PokemonType.WHIP  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.CROSSBOW  :
      case PokemonType.SHOTGUN  :
        return 1.0;
      default:
        return 1;
    }
  case PokemonType.SHOTGUN  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.CROSSBOW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.HAMMER  :
        return 2.0;
      case PokemonType.BOW  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.CANNON  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.BOW  :
      case PokemonType.CROSSBOW  :
      case PokemonType.CANNON  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.SHOTGUN  :
        return 0.5;
      case PokemonType.MUSKET  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.MUSKET  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.LANCE  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.BOW  :
      case PokemonType.MUSKET  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.DAGGER  :
      case PokemonType.FIST  :
      case PokemonType.SCYTHE  :
      case PokemonType.CROSSBOW  :
      case PokemonType.CANNON  :
      case PokemonType.BOOMERANG  :
        return 2.0;
      case PokemonType.CHAINSAW  :
      case PokemonType.SHOTGUN  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.BOOMERANG  :
    switch (attackType) {
      case PokemonType.SWORD  :
      case PokemonType.DAGGER  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.SHOTGUN  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      case PokemonType.LANCE  :
        return 0.0;
      case PokemonType.FIST  :
      case PokemonType.BOW  :
      case PokemonType.CROSSBOW  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.SHIELD  :
    switch (attackType) {
      case PokemonType.SWORD  :
        return 2.0;
      case PokemonType.LANCE  :
      case PokemonType.DAGGER  :
      case PokemonType.CROSSBOW  :
      case PokemonType.CANNON  :
      case PokemonType.MUSKET  :
        return 0.5;
      case PokemonType.FIST  :
      case PokemonType.WHIP  :
      case PokemonType.AXE  :
      case PokemonType.HAMMER  :
      case PokemonType.CHAINSAW  :
      case PokemonType.SCYTHE  :
      case PokemonType.BOW  :
      case PokemonType.SHOTGUN  :
      case PokemonType.BOOMERANG  :
      case PokemonType.SHIELD  :
        return 1.0;
      default:
        return 1;
    }
}switch (defType) {
  case PokemonType.A_FIRE  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_WIND  :
      case PokemonType.A_DARK  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_WATER  :
        return 2.0;
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_FROZEN  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.A_WATER  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_EXPLOSION  :
        return 0.5;
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_WIND  :
      case PokemonType.A_DARK  :
      case PokemonType.A_POISON  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_LIGHTNING  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.A_ICE  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_EXPLOSION  :
        return 2.0;
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_DARK  :
      case PokemonType.A_POISON  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_WIND  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.A_LIGHTNING  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_DARK  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_WIND  :
        return 0.5;
      case PokemonType.A_FROZEN  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.A_WIND  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_WATER  :
      case PokemonType.A_WIND  :
      case PokemonType.A_DARK  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_EXPLOSION  :
        return 2.0;
      case PokemonType.A_POISON  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.A_DARK  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_DARK  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_WIND  :
        return 2.0;
      case PokemonType.A_HEALING  :
        return 0.0;
      case PokemonType.A_FROZEN  :
        return 0.5;
      default:
        return 1;
    }
  case PokemonType.A_POISON  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_ICE  :
      case PokemonType.A_WIND  :
        return 2.0;
      case PokemonType.A_WATER  :
        return 0.5;
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_DARK  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      default:
        return 1;
    }
  case PokemonType.A_EXPLOSION  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
        return 0.5;
      case PokemonType.A_WATER  :
      case PokemonType.A_FROZEN  :
        return 2.0;
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_WIND  :
      case PokemonType.A_DARK  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      default:
        return 1;
    }
  case PokemonType.A_HEALING  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_WIND  :
      case PokemonType.A_POISON  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_DARK  :
      case PokemonType.A_EXPLOSION  :
        return 2.0;
      default:
        return 1;
    }
  case PokemonType.A_FROZEN  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_WIND  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
        return 1.0;
      case PokemonType.A_DARK  :
        return 2.0;
      case PokemonType.A_NEUTRALIZE  :
        return 0.0;
      default:
        return 1;
    }
  case PokemonType.A_NEUTRALIZE  :
    switch (attackType) {
      case PokemonType.A_FIRE  :
      case PokemonType.A_WATER  :
      case PokemonType.A_ICE  :
      case PokemonType.A_LIGHTNING  :
      case PokemonType.A_WIND  :
      case PokemonType.A_POISON  :
      case PokemonType.A_EXPLOSION  :
      case PokemonType.A_HEALING  :
      case PokemonType.A_FROZEN  :
      case PokemonType.A_NEUTRALIZE  :
        return 1.0;
      case PokemonType.A_DARK  :
        return 2.0;
      default:
        return 1;
    }
}
}

/**
 * Retrieve the color corresponding to a specific damage multiplier
 * @returns A color or undefined if the default color should be used
 */
export function getTypeDamageMultiplierColor(
  multiplier: TypeDamageMultiplier,
  side: "defense" | "offense",
): string | undefined {
  if (side === "offense") {
    switch (multiplier) {
      case 0:
        return "#929292";
      case 0.125:
        return "#FF5500";
      case 0.25:
        return "#FF7400";
      case 0.5:
        return "#FE8E00";
      case 1:
        return undefined;
      case 2:
        return "#4AA500";
      case 4:
        return "#4BB400";
      case 8:
        return "#52C200";
    }
  }
  if (side === "defense") {
    switch (multiplier) {
      case 0:
        return "#B1B100";
      case 0.125:
        return "#2DB4FF";
      case 0.25:
        return "#00A4FF";
      case 0.5:
        return "#0093FF";
      case 1:
        return undefined;
      case 2:
        return "#FE8E00";
      case 4:
        return "#FF7400";
      case 8:
        return "#FF5500";
    }
  }
}

export function getTypeRgb(type: PokemonType): [number, number, number] {
  switch (type) {
case PokemonType.UNKNOWN:
    return [112, 128, 144];
case PokemonType.SWORD:
    return [229, 45, 60];
case PokemonType.LANCE:
    return [229, 136, 45];
case PokemonType.DAGGER:
    return [229, 158, 45];
case PokemonType.FIST:
    return [184, 229, 45];
case PokemonType.WHIP:
    return [204, 229, 45];
case PokemonType.AXE:
    return [119, 229, 45];
case PokemonType.HAMMER:
    return [45, 229, 81];
case PokemonType.CHAINSAW:
    return [45, 229, 76];
case PokemonType.SCYTHE:
    return [45, 229, 165];
case PokemonType.BOW:
    return [45, 207, 229];
case PokemonType.CROSSBOW:
    return [45, 147, 229];
case PokemonType.SHOTGUN:
    return [45, 66, 229];
case PokemonType.CANNON:
    return [58, 45, 229];
case PokemonType.MUSKET:
    return [192, 45, 229];
case PokemonType.BOOMERANG:
    return [229, 45, 187];
case PokemonType.SHIELD:
    return [229, 45, 80];
case PokemonType.A_FIRE:
    return [229, 45, 45];
case PokemonType.A_WATER:
    return [45, 107, 229];
case PokemonType.A_LIGHTNING:
    return [229, 214, 45];
case PokemonType.A_WIND:
    return [45, 229, 76];
case PokemonType.A_DARK:
    return [137, 45, 229];
case PokemonType.A_ICE:
    return [169, 205, 242];
case PokemonType.A_POISON:
    return [20, 102, 20];
case PokemonType.A_EXPLOSION:
    return [30, 153, 153];
case PokemonType.A_HEALING:
    return [183, 229, 137];
case PokemonType.A_FROZEN:
    return [168, 168, 168];
case PokemonType.A_NEUTRALIZE:
    return [255, 255, 255];
    default:
      return [0, 0, 0];
  }
}
