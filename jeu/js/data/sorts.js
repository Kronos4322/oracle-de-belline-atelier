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
  "13-38": [{ t: "detruireFaibles", seuil: 1800 }, { t: "degats", v: 500 }],                         // catastrophe aérienne
  "15-38": [{ t: "defense", camp: "adverse" }, { t: "stat", atk: 0, def: -800, camp: "adverse", cible: "toutes" }, { t: "renvoyer", camp: "adverse", cible: "plusForte" }], // naufrage
  "17-48": [{ t: "statut", etat: "poison", camp: "adverse", cible: "toutes" }, { t: "detruire", camp: "adverse", cible: "plusFaible" }], // maladie fatale
  "17-49": [{ t: "retablir" }, { t: "guerir", camp: "soi" }],                                          // guérison
  "21-23": [{ t: "voler" }],                                                                           // affaires véreuses
  "21-35": [{ t: "voler" }, { t: "degats", v: 300 }],                                                  // attaque, vol
  "22-32": [{ t: "detruire", camp: "adverse", cible: "aleatoire" }],                                   // guet-apens, piège
  "23-19": [{ t: "piocher", n: 1 }, { t: "differe", tours: 2, effets: [{ t: "lp", v: 800 }] }],        // placements intéressants
  "27-30": [{ t: "piocher", n: 1 }, { t: "stat", atk: 0, def: 300, camp: "soi", cible: "toutes" }],    // invitation à un mariage
  "27-50": [{ t: "defausser", n: 1 }],                                                                 // divorce, rupture
  "29-33": [{ t: "statut", etat: "confusion", camp: "adverse", cible: "plusForte" }],                  // rivalité en amour
  "30-17": [{ t: "statut", etat: "poison", camp: "adverse", cible: "plusForte" }],                     // excès nuisibles
  "31-34": [{ t: "statut", etat: "brulure", camp: "adverse", cible: "toutes" }, { t: "bloquer", camp: "adverse", cible: "plusForte", tours: 2 }], // passions malheureuses
  "36-32": [{ t: "annuler" }],                                                                         // complot
  "37-38": [{ t: "statut", etat: "brulure", camp: "adverse", cible: "toutes" }, { t: "casserTerrain", camp: "adverse" }, { t: "degats", v: 1000 }], // incendie
  "44-50": [{ t: "hasard", v: 1500 }],                                                                 // ruine au jeu
  "52-17": [{ t: "proteger", camp: "soi" }, { t: "guerir", camp: "soi" }],                             // hôpital
  "52-46": [{ t: "retablir" }, { t: "guerir", camp: "soi" }],                                          // hospice
  "52-29": [{ t: "statut", etat: "sommeil", camp: "adverse", cible: "plusForte" }],                    // amour sacrifié
  "38>2": [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }, { t: "degats", v: 600 }],   // exposé à un accident
  "38>3": [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }, { t: "degats", v: 600 }],
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

/**
 * Les Grands accords (ajout de jeu) : deux cartes fortes, ou une carte forte et la Destinée, la Réussite ou le Bonheur,
 * dont les notices s'additionnent avec violence (« la destruction » et « la fin », « la force majeure » et « l'échéance
 * inéluctable »…). Ils ne sont pas des règles de la notice : leurs noms et leurs effets sont des lectures du jeu, tirées
 * des mots des deux notices. Plus forts que les échos et les lectures (1500 points, une carte s'ils sont favorables),
 * moins sûrs que les règles de Belline qui restent prioritaires. Ordre indifférent.
 */
export const GRANDS_ACCORDS = [
  { a: 38, b: 48, nom: "La catastrophe inéluctable", sens: -1, texte: "L’accident, « la destruction », et la Fatalité, « la fin » : toutes les apparitions adverses sont détruites et l’adversaire perd 1500 points de vie.",
    effets: [{ t: "detruire", camp: "adverse", cible: "toutes" }, { t: "degats", v: 1500 }] },
  { a: 34, b: 48, nom: "Le jugement sans appel", sens: -1, texte: "« Décision arbitraire » et « échéance inéluctable » : les apparitions adverses ne pourront pas attaquer pendant deux tours, l’adversaire défausse deux cartes.",
    effets: [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 2 }, { t: "defausser", n: 2 }] },
  { a: 11, b: 38, nom: "La chute", sens: -1, texte: "La malchance et le bouleversement : la plus forte apparition adverse est détruite, et vous volez une carte à l’adversaire.",
    effets: [{ t: "detruire", camp: "adverse", cible: "plusForte" }, { t: "voler" }] },
  { a: 34, b: 38, nom: "La force majeure", sens: -1, texte: "« Le consultant est victime de la force majeure » et du bouleversement : les apparitions adverses passent en défense, celles qui y étaient sont détruites.",
    effets: [{ t: "detruireDefense", camp: "adverse" }, { t: "defense", camp: "adverse" }, { t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }] },
  { a: 11, b: 48, nom: "La malchance fatale", sens: -1, texte: "La malchance et la fin : toutes les apparitions adverses tombent malades et perdent 800 ATK.",
    effets: [{ t: "statut", etat: "poison", camp: "adverse", cible: "toutes" }, { t: "stat", atk: -800, def: 0, camp: "adverse", cible: "toutes" }] },
  { a: 11, b: 34, nom: "La convoitise", sens: -1, texte: "« La convoitise » et la « décision arbitraire » : vous volez deux cartes à l’adversaire.",
    effets: [{ t: "voler" }, { t: "voler" }] },
  { a: 42, b: 48, nom: "La sagesse devant la fin", sens: 1, texte: "« La raison, la réflexion » devant « l’échéance inéluctable » : vos apparitions retrouvent leurs forces, guérissent et sont protégées ; vous gagnez 2000 points de vie.",
    effets: [{ t: "retablir" }, { t: "guerir", camp: "soi" }, { t: "proteger", camp: "soi" }, { t: "lp", v: 2000 }] },
  { a: 34, b: 42, nom: "La raison contre l’arbitraire", sens: 1, texte: "« La raison » contre la « décision arbitraire » : vos apparitions guérissent et gagnent 600 ATK ; la prochaine carte adverse sera sans effet.",
    effets: [{ t: "guerir", camp: "soi" }, { t: "stat", atk: 600, def: 0, camp: "soi", cible: "toutes" }, { t: "annuler" }] },
  { a: 38, b: 42, nom: "La prudence", sens: 1, texte: "« Prudence, modération » devant l’accident : vos apparitions sont protégées une fois ; vous gagnez 1500 points de vie.",
    effets: [{ t: "proteger", camp: "soi" }, { t: "lp", v: 1500 }] },
  { a: 11, b: 42, nom: "La trahison déjouée", sens: 1, texte: "La sagesse voit la trahison : les présages adverses sont détruits, vous voyez la main adverse.",
    effets: [{ t: "detruirePresages" }, { t: "voir" }] },
  { a: 5, b: 45, nom: "L’accomplissement", sens: 1, texte: "« Succès, aboutissement » et « vocation réalisée » : vous gagnez 2500 points de vie et piochez deux cartes.",
    effets: [{ t: "lp", v: 2500 }, { t: "piocher", n: 2 }] },
  { a: 1, b: 48, nom: "L’heure du destin", sens: -1, texte: "La Destinée donne « une importance de premier plan » à l’échéance : l’adversaire perd 2000 points de vie.",
    effets: [{ t: "degats", v: 2000 }] }
];
const INDEX_GRANDS = new Map(GRANDS_ACCORDS.map(g => [g.a < g.b ? `${g.a}-${g.b}` : `${g.b}-${g.a}`, g]));
/** Le Grand accord que forment deux cartes (ordre indifférent), ou null. */
export const grandAccord = (a, b) => INDEX_GRANDS.get(a < b ? `${a}-${b}` : `${b}-${a}`) || null;
