// Assemble les modules ES en scripts classiques, un par jeu : js/jeu.js (le Chemin) et js/jeu-duel.js (le Duel).
// Les navigateurs refusent les modules ES ouverts en file:// (double-clic sur un fichier .html) ;
// un script classique, lui, fonctionne partout. Lancer : node tools/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

// Pour chaque script : les modules dans l'ordre de dépendance (chacun après ceux qu'il importe).
export const SCRIPTS = {
  "js/jeu.js": [
    "js/config.js",
    "js/data/cartes.js",
    "js/data/voisinage.js",
    "js/engine/hasard.js",
    "js/engine/effects.js",
    "js/engine/state.js",
    "js/engine/valeurs.js",
    "js/engine/chemin.js",
    "js/engine/enigmes.js",
    "js/engine/carnet.js",
    "js/game/player.js",
    "js/engine/partie.js",
    "js/engine/lecture.js",
    "js/render/illustrations.js",
    "js/render/carte.js",
    "js/render/renderer.js",
    "js/render/effetsVisuels.js",
    "js/ui/son.js",
    "js/ui/stockage.js",
    "js/ui/hud.js",
    "js/ui/fiche.js",
    "js/ui/tirage.js",
    "js/ui/carnet.js",
    "js/ui/commandes.js",
    "js/ui/pleinEcran.js",
    "js/main.js"
  ],
  "js/jeu-duel.js": [
    "js/config.js",
    "js/data/cartes.js",
    "js/data/voisinage.js",
    "js/data/duel.js",
    "js/data/accords.js",
    "js/data/gardiens.js",
    "js/data/techniques.js",
    "js/data/lectures.js",
    "js/data/sorts.js",
    "js/data/astres.js",
    "js/engine/hasard.js",
    "js/engine/duel.js",
    "js/engine/carnet.js",
    "js/render/illustrations.js",
    "js/render/carte.js",
    "js/render/carteDuel.js",
    "js/render/effetsVisuels.js",
    "js/render/ambiance.js",
    "js/ui/stockage.js",
    "js/ui/son.js",
    "js/ui/pleinEcran.js",
    "js/ui/duelOutils.js",
    "js/duel-main.js"
  ]
};

export function assembler(sortie = "js/jeu.js") {
  const MODULES = SCRIPTS[sortie];
  const morceaux = MODULES.map(chemin => {
    let src = readFileSync(join(RACINE, chemin), "utf8").replace(/\r\n/g, "\n");
    const exports = [];
    src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*"([^"]+)";?$/gm, (_, noms, rel) => {
      const cible = posix.normalize(posix.join(posix.dirname(chemin), rel));
      if (!MODULES.includes(cible)) throw new Error(`${chemin} : import inconnu ${rel} (absent de ${sortie})`);
      if (MODULES.indexOf(cible) > MODULES.indexOf(chemin)) throw new Error(`${chemin} : ${cible} doit le précéder`);
      return `const {${noms.replace(/\s+as\s+/g, ": ")}} = M[${JSON.stringify(cible)}];`;
    });
    src = src.replace(/^export\s+(const|let|function|class|async function)\s+([A-Za-z_$][\w$]*)/gm, (_, mot, nom) => {
      exports.push(nom);
      return `${mot} ${nom}`;
    });
    if (/^\s*(import|export)\b/m.test(src)) throw new Error(`${chemin} : forme d'import ou d'export non prise en charge`);
    return `// ===== ${chemin} =====\nM[${JSON.stringify(chemin)}] = (() => {\n${src}\nreturn { ${exports.join(", ")} };\n})();\n`;
  });
  return "// Fichier généré par tools/build.mjs à partir des modules de js/. Ne pas modifier à la main.\n" +
    "(() => {\n\"use strict\";\nconst M = {};\n" + morceaux.join("\n") + "})();\n";
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const sortie of Object.keys(SCRIPTS)) {
    writeFileSync(join(RACINE, sortie), assembler(sortie));
    console.log(`${sortie} généré (${SCRIPTS[sortie].length} modules).`);
  }
}
