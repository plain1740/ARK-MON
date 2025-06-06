import { Abilities } from "#app/enums/abilities";
import { BattlerTagType } from "#app/enums/battler-tag-type";
import { BerryPhase } from "#app/phases/berry-phase";
import { MoveEffectPhase } from "#app/phases/move-effect-phase";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import GameManager from "#test/testUtils/gameManager";
import Phaser from "phaser";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("Moves - Thousand Arrows", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override.battleStyle("single");
    game.override.enemySpecies(Species.TOGETIC);
    game.override.startingLevel(100);
    game.override.enemyLevel(100);
    game.override.moveset([Moves.THOUSAND_ARROWS]);
    game.override.enemyMoveset([Moves.SPLASH, Moves.SPLASH, Moves.SPLASH, Moves.SPLASH]);
  });

  it("move should hit and ground Flying-type targets", async () => {
    await game.startBattle([Species.ILLUMISE]);

    const enemyPokemon = game.scene.getEnemyPokemon()!;

    game.move.select(Moves.THOUSAND_ARROWS);

    await game.phaseInterceptor.to(MoveEffectPhase, false);
    // Enemy should not be grounded before move effect is applied
    expect(enemyPokemon.getTag(BattlerTagType.IGNORE_FLYING)).toBeUndefined();

    await game.phaseInterceptor.to(BerryPhase, false);

    expect(enemyPokemon.getTag(BattlerTagType.IGNORE_FLYING)).toBeDefined();
    expect(enemyPokemon.hp).toBeLessThan(enemyPokemon.getMaxHp());
  });

  it("move should hit and ground targets with Levitate", async () => {
    game.override.enemySpecies(Species.SNORLAX);
    game.override.enemyAbility(Abilities.LEVITATE);

    await game.startBattle([Species.ILLUMISE]);

    const enemyPokemon = game.scene.getEnemyPokemon()!;

    game.move.select(Moves.THOUSAND_ARROWS);

    await game.phaseInterceptor.to(MoveEffectPhase, false);
    // Enemy should not be grounded before move effect is applied
    expect(enemyPokemon.getTag(BattlerTagType.IGNORE_FLYING)).toBeUndefined();

    await game.phaseInterceptor.to(BerryPhase, false);

    expect(enemyPokemon.getTag(BattlerTagType.IGNORE_FLYING)).toBeDefined();
    expect(enemyPokemon.hp).toBeLessThan(enemyPokemon.getMaxHp());
  });

  it("move should hit and ground targets under the effects of Magnet Rise", async () => {
    game.override.enemySpecies(Species.SNORLAX);

    await game.startBattle([Species.ILLUMISE]);

    const enemyPokemon = game.scene.getEnemyPokemon()!;

    enemyPokemon.addTag(BattlerTagType.FLOATING, undefined, Moves.MAGNET_RISE);

    game.move.select(Moves.THOUSAND_ARROWS);

    await game.phaseInterceptor.to(BerryPhase, false);

    expect(enemyPokemon.getTag(BattlerTagType.FLOATING)).toBeUndefined();
    expect(enemyPokemon.getTag(BattlerTagType.IGNORE_FLYING)).toBeDefined();
    expect(enemyPokemon.hp).toBeLessThan(enemyPokemon.getMaxHp());
  });
});
