// Sorts de Belline : ce que fait chaque règle de voisinage de la notice quand elle s'accomplit en duel.
// Ajout de jeu (signalé) : la notice donne la rencontre des deux cartes (« Départ et Eau : voyage à l'étranger »),
// le duel en tire un effet qui suit ces mots (le voyage éloigne une apparition adverse). Une règle favorable agit
// pour vous ; une règle néfaste s'abat sur l'adversaire. S'y ajoutent les points de l'accord (js/engine/duel.js).
//
// Effets : ceux de js/engine/duel.js, plus les états (Pokémon et Digimon, ajout de jeu) :
//   statut {etat, camp, cible}  'poison' (Maladie : malaise, épidémie), 'brulure' (Feu), 'sommeil' (Eau : passivité),
//                               'confusion' (Inconstance : caractère versatile)
//   guerir {camp}               les états du camp disparaissent
//   proteger {camp}             protégées une fois de la destruction au combat

export const SORTS = {
  "4-47": [{ t: "stat", atk: -500, def: 0, camp: "adverse", cible: "toutes" }],                       // efforts inutiles
  "9-30": [{ t: "stat", atk: 0, def: 400, camp: "soi", cible: "toutes" }, { t: "guerir", camp: "soi" }], // pique-nique
  "12-15": [{ t: "renvoyer", camp: "adverse", cible: "plusForte" }],                                  // voyage à l'étranger
  "13-38": [{ t: "detruireFaibles", seuil: 1200 }],                                                    // catastrophe aérienne
  "15-38": [{ t: "defense", camp: "adverse" }, { t: "stat", atk: 0, def: -400, camp: "adverse", cible: "toutes" }], // naufrage
  "17-48": [{ t: "statut", etat: "poison", camp: "adverse", cible: "toutes" }],                       // maladie fatale
  "17-49": [{ t: "retablir" }, { t: "guerir", camp: "soi" }],                                          // guérison
  "21-23": [{ t: "voler" }],                                                                           // affaires véreuses
  "21-35": [{ t: "voler" }, { t: "degats", v: 300 }],                                                  // attaque, vol
  "22-32": [{ t: "detruire", camp: "adverse", cible: "aleatoire" }],                                   // guet-apens, piège
  "23-19": [{ t: "piocher", n: 1 }, { t: "differe", tours: 2, effets: [{ t: "lp", v: 800 }] }],        // placements intéressants
  "27-30": [{ t: "piocher", n: 1 }, { t: "stat", atk: 0, def: 300, camp: "soi", cible: "toutes" }],    // invitation à un mariage
  "27-50": [{ t: "defausser", n: 1 }],                                                                 // divorce, rupture
  "29-33": [{ t: "statut", etat: "confusion", camp: "adverse", cible: "plusForte" }],                  // rivalité en amour
  "30-17": [{ t: "statut", etat: "poison", camp: "adverse", cible: "plusForte" }],                     // excès nuisibles
  "31-34": [{ t: "statut", etat: "brulure", camp: "adverse", cible: "toutes" }],                       // passions malheureuses
  "36-32": [{ t: "annuler" }],                                                                         // complot
  "37-38": [{ t: "statut", etat: "brulure", camp: "adverse", cible: "toutes" }, { t: "casserTerrain", camp: "adverse" }], // incendie
  "44-50": [{ t: "hasard", v: 1500 }],                                                                 // ruine au jeu
  "52-17": [{ t: "proteger", camp: "soi" }, { t: "guerir", camp: "soi" }],                             // hôpital
  "52-46": [{ t: "retablir" }, { t: "guerir", camp: "soi" }],                                          // hospice
  "52-29": [{ t: "statut", etat: "sommeil", camp: "adverse", cible: "plusForte" }],                    // amour sacrifié
  "38>2": [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }],                              // exposé à un accident
  "38>3": [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }],
  "7>2": [{ t: "stat", atk: 500, def: 0, camp: "soi", cible: "plusForte" }, { t: "proteger", camp: "soi" }], // distinction
  "7>3": [{ t: "stat", atk: 500, def: 0, camp: "soi", cible: "plusForte" }, { t: "proteger", camp: "soi" }]
};

/** Les états : nom, signe, ce qu'ils font (pour l'interface). */
export const ETATS = {
  poison: { nom: "malade", signe: "☣", texte: "Malade (le malaise, l’épidémie) : perd 300 ATK à chacun des tours de son joueur." },
  brulure: { nom: "brûlée", signe: "♨", texte: "Brûlée (le feu) : 500 ATK de moins, et son joueur perd 200 points de vie à chacun de ses tours." },
  sommeil: { nom: "endormie", signe: "☾", texte: "Endormie (la passivité) : ne peut pas attaquer ; une chance sur deux de s’éveiller à chaque tour de son joueur." },
  confusion: { nom: "confuse", signe: "✺", texte: "Confuse (le caractère versatile) : une attaque sur deux échoue et blesse son joueur (300 points) ; une chance sur trois de s’en remettre à chaque tour." }
};
