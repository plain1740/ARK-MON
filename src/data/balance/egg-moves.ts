import { allMoves } from "#app/data/moves/move";
import { getEnumKeys, getEnumValues } from "#app/utils/common";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";


export const speciesEggMoves = {};

function parseEggMoves(content: string): void {
  let output = "";

  const speciesNames = getEnumKeys(Species);
  const speciesValues = getEnumValues(Species);
  const lines = content.split(/\n/g);

  for (const line of lines) {
    const cols = line.split(",").slice(0, 5);
    const moveNames = allMoves.map(m => m.name.replace(/ \([A-Z]\)$/, "").toLowerCase());
    const enumSpeciesName = cols[0].toUpperCase().replace(/[ -]/g, "_");
    const species = speciesValues[speciesNames.findIndex(s => s === enumSpeciesName)];

    const eggMoves: Moves[] = [];

    for (let m = 0; m < 4; m++) {
      const moveName = cols[m + 1].trim();
      const moveIndex = moveName !== "N/A" ? moveNames.findIndex(mn => mn === moveName.toLowerCase()) : -1;
      eggMoves.push(moveIndex > -1 ? moveIndex as Moves : Moves.NONE);

      if (moveIndex === -1) {
        console.warn(moveName, "could not be parsed");
      }
    }

    if (eggMoves.find(m => m !== Moves.NONE)) {
      output += `[Species.${Species[species]}]: [ ${eggMoves.map(m => `Moves.${Moves[m]}`).join(", ")} ],\n`;
    }
  }

  console.log(output);
}

export function initEggMoves() {
  const eggMovesStr = "";
  if (eggMovesStr) {
    setTimeout(() => {
      parseEggMoves(eggMovesStr);
    }, 1000);
  }
}
