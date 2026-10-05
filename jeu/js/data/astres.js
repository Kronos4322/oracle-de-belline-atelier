// Les astres : les super-invocations du Duel (ajout de jeu, à la manière des invocations spéciales des jeux de
// cartes à duel). Le jeu d'Edmond est rangé en sept séries planétaires ; trois cartes d'une même série, dont deux
// apparitions face recto en jeu (la troisième en jeu ou dans la main), se sacrifient pour invoquer l'astre lui-même :
// l'invocation céleste.
// Une invocation céleste par tour, chaque astre une fois par duel. Un astre détruit ou renvoyé retourne au ciel
// (il ne va ni au cimetière ni en main). Numéros 200 à 206. Effets : ceux de js/engine/duel.js, à la révélation.

export const ASTRES = {
  200: { famille: "soleil", nom: "Le Soleil", glyphe: "☉", type: "apparition", niveau: 10, atk: 3500, def: 3000, forte: true, astre: true,
    texte: "Invocation céleste. La lumière révèle tout : les apparitions adverses cachées sont retournées, celles en défense détruites ; vous gagnez 1000 points de vie.",
    effets: [{ t: "revelerAdverses" }, { t: "detruireDefense", camp: "adverse" }, { t: "lp", v: 1000 }] },
  201: { famille: "lune", nom: "La Lune", glyphe: "☽", type: "apparition", niveau: 10, atk: 3200, def: 3600, forte: true, astre: true,
    texte: "Invocation céleste. La marée : toutes les apparitions adverses sont emportées dans la main de leur joueur.",
    effets: [{ t: "renvoyer", camp: "adverse", cible: "toutes" }] },
  202: { famille: "mercure", nom: "Mercure", glyphe: "☿", type: "apparition", niveau: 10, atk: 3300, def: 2800, forte: true, astre: true,
    texte: "Invocation céleste. Le messager : piochez trois cartes, voyez la main adverse et volez-y une carte.",
    effets: [{ t: "piocher", n: 3 }, { t: "voir" }, { t: "voler" }] },
  203: { famille: "venus", nom: "Vénus", glyphe: "♀", type: "apparition", niveau: 10, atk: 3000, def: 3800, forte: true, astre: true,
    texte: "Invocation céleste. L’harmonie : vous gagnez 3000 points de vie ; vos apparitions guérissent et sont protégées une fois.",
    effets: [{ t: "lp", v: 3000 }, { t: "guerir", camp: "soi" }, { t: "proteger", camp: "soi" }] },
  204: { famille: "mars", nom: "Mars", glyphe: "♂", type: "apparition", niveau: 10, atk: 3800, def: 2500, forte: true, astre: true,
    texte: "Invocation céleste. La guerre : toutes les apparitions adverses brûlent, l’adversaire perd 1000 points de vie, vos autres apparitions gagnent 500 ATK.",
    effets: [{ t: "statut", etat: "brulure", camp: "adverse", cible: "toutes" }, { t: "degats", v: 1000 }, { t: "stat", atk: 500, def: 0, camp: "soi", cible: "autres" }] },
  205: { famille: "jupiter", nom: "Jupiter", glyphe: "♃", type: "apparition", niveau: 10, atk: 3600, def: 3200, forte: true, astre: true,
    texte: "Invocation céleste. La foudre : la plus forte apparition adverse est détruite, les autres ne pourront pas attaquer à leur prochain tour.",
    effets: [{ t: "detruire", camp: "adverse", cible: "plusForte" }, { t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }] },
  206: { famille: "saturne", nom: "Saturne", glyphe: "♄", type: "apparition", niveau: 10, atk: 3400, def: 3400, forte: true, astre: true,
    texte: "Invocation céleste. Le temps : les apparitions adverses ne pourront pas attaquer pendant deux tours ; l’adversaire ne piochera pas et défausse deux cartes.",
    effets: [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 2 }, { t: "sterilite" }, { t: "defausser", n: 2 }] }
};
export const ASTRE_DE = { soleil: 200, lune: 201, mercure: 202, venus: 203, mars: 204, jupiter: 205, saturne: 206 };
