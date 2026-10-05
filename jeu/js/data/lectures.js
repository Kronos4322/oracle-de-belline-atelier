// Accords du Duel au-delà des règles de voisinage de la notice (js/data/voisinage.js, qui restent prioritaires).
// Trois sortes, de la plus proche de Belline à la plus libre :
//
// 1. Échos de la notice (ajout de jeu) : deux cartes dont les notices emploient le même mot (cité dans `mot`).
//    La parenté vient du texte de Belline ; la conséquence (favorable ou néfaste) est une lecture du jeu.
// 2. Accompagnement (tiré de la notice) :
//    - Renommée (n° 43) : « l'opinion (bonne ou mauvaise selon les cartes d'accompagnement) que l'on a de vous » :
//      à côté d'une carte favorable, bonne renommée ; à côté d'une carte néfaste, mauvaise renommée.
//    - Trahison (n° 11) : « à côté des meilleures cartes, minimise gravement les chances de succès ».
//      Quelles sont « les meilleures cartes » : choix du jeu (MEILLEURES), la notice ne les nomme pas.
// 3. Lectures modernes (ajout de jeu, demandé pour aider à comprendre l'idée des associations) : sens rédigés pour
//    ce jeu à partir des deux notices, dans l'esprit des recueils d'associations modernes ; ils ne viennent ni de la
//    notice ni d'un recueil particulier, et ne servent qu'au Duel.
//
// Toutes se lisent dans un ordre indifférent (comme « avec le n° … »). Une seule s'applique par paire : la plus proche
// de Belline. Valeurs : écho et accompagnement 500 points, lecture moderne 200 (une règle de Belline vaut 1000 et
// lance son sort) : la notice reste ce qui compte le plus.

/** Cartes favorables et néfastes selon leur notice (pour la Renommée). Les autres sont neutres. */
export const FAVORABLES = [4, 5, 6, 7, 8, 9, 10, 14, 16, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 39, 40, 41, 42, 45, 49, 0];
export const NEFASTES = [11, 13, 17, 21, 32, 33, 34, 35, 38, 46, 47, 48, 50, 51];
/** « Les meilleures cartes » que la Trahison gâte (choix du jeu). */
export const MEILLEURES = [5, 7, 10, 19, 39, 40, 41, 45, 49];

export const ECHOS = [
  { a: 5, b: 7, mot: "succès", sens: 1, glose: "le succès redoublé" },
  { a: 11, b: 46, mot: "la malchance", sens: -1, glose: "la malchance s’acharne" },
  { a: 16, b: 41, mot: "le patrimoine", sens: 1, glose: "le patrimoine se transmet" },
  { a: 27, b: 28, mot: "association", sens: 1, glose: "une association solide" },
  { a: 39, b: 43, mot: "personnage", sens: 1, glose: "un personnage puissant et connu" },
  { a: 45, b: 49, mot: "vocation", sens: 1, glose: "la vocation réalisée" },
  { a: 12, b: 50, mot: "départ", sens: -1, glose: "une mauvaise base de départ" },
  { a: 7, b: 46, mot: "morales", sens: -1, glose: "les valeurs morales éprouvées" },
  { a: 2, b: 34, mot: "consultant", sens: -1, glose: "le consultant victime de la force majeure" },
  { a: 1, b: 34, mot: "décision", sens: -1, glose: "une décision arbitraire" },
  { a: 1, b: 7, mot: "premier", sens: 1, glose: "la première place" }
];

// [a, b, sens, lecture]
export const LECTURES = [
  // Soleil
  [6, 5, 1, "l’œuvre aboutit : un succès bien construit"],
  [6, 22, 1, "un projet qui avance pas à pas"],
  [6, 20, 1, "le progrès par l’étude"],
  [6, 7, 1, "avancement, promotion"],
  [5, 19, 1, "réussite financière, gains mérités"],
  [5, 22, 1, "une entreprise qui réussit"],
  [5, 45, 1, "un accomplissement heureux"],
  [5, 47, -1, "un succès qui reste sans fruit"],
  [5, 51, -1, "un succès qui se fait attendre"],
  [7, 43, 1, "les honneurs publics, la reconnaissance"],
  [7, 34, -1, "l’honneur bafoué, un jugement injuste"],
  [7, 32, -1, "l’honneur terni par la jalousie"],
  [8, 27, 1, "l’amitié devient un lien durable"],
  [8, 29, 1, "une amitié tendre"],
  [8, 39, 1, "un ami bien placé qui vous soutient"],
  [8, 36, 1, "des conversations amicales, un bon conseil"],
  [8, 30, 1, "un repas entre amis"],
  [9, 17, -1, "une santé fragile : le repos s’impose"],
  [9, 42, 1, "une vie saine et mesurée"],
  [9, 26, 1, "un repos paisible"],
  [10, 29, 1, "un cadeau d’amour"],
  [10, 39, 1, "les faveurs d’un protecteur"],
  [10, 41, 1, "un don, un legs inattendu"],
  [10, 21, -1, "un cadeau intéressé"],
  [4, 40, 1, "une jeune vie qui s’épanouit"],
  [4, 28, 1, "une naissance dans la famille"],
  [4, 22, 1, "le début d’un projet"],
  [4, 6, 1, "un commencement prometteur"],
  // Lune
  [11, 32, -1, "la trahison par jalousie"],
  [11, 36, -1, "des paroles fourbes"],
  [12, 24, 1, "des nouvelles de loin"],
  [12, 27, -1, "une séparation"],
  [12, 29, -1, "un amour qui s’éloigne"],
  [12, 16, -1, "quitter sa maison"],
  [12, 18, 1, "un nouveau départ"],
  [13, 29, -1, "un amour inconstant"],
  [13, 36, -1, "des promesses en l’air"],
  [13, 27, -1, "une union fragile"],
  [13, 42, 1, "le retour à la raison"],
  [14, 20, 1, "une recherche fructueuse"],
  [14, 21, 1, "le voleur démasqué"],
  [14, 11, 1, "la trahison découverte à temps"],
  [14, 19, 1, "une trouvaille d’argent"],
  [14, 32, -1, "un espionnage malveillant"],
  [15, 24, 1, "des nouvelles d’outre-mer"],
  [15, 23, 1, "le commerce avec l’étranger"],
  [15, 25, 1, "le plaisir du voyage"],
  [15, 26, 1, "le calme, la douceur de vivre"],
  [16, 28, 1, "un foyer familial uni"],
  [16, 26, 1, "la paix au foyer"],
  [16, 37, 1, "la chaleur du foyer"],
  [16, 50, -1, "la maison en péril"],
  [16, 19, 1, "des biens immobiliers"],
  [17, 46, -1, "une maladie longue"],
  [17, 42, 1, "des soins prudents, une guérison lente"],
  [17, 20, 1, "le bon médecin, le diagnostic juste"],
  [17, 51, -1, "une convalescence lente"],
  // Mercure
  [18, 40, 1, "le renouveau, de belles perspectives"],
  [18, 26, 1, "une évolution apaisée"],
  [18, 48, -1, "la fin d’une période"],
  [18, 44, 1, "la chance tourne"],
  [19, 25, 1, "l’argent des plaisirs"],
  [19, 41, 1, "une fortune héritée"],
  [19, 50, -1, "des pertes d’argent"],
  [19, 44, 1, "un gain au jeu"],
  [19, 21, -1, "de l’argent perdu ou volé"],
  [19, 30, 1, "une fête généreuse"],
  [20, 42, 1, "le savoir et la sagesse réunis"],
  [20, 23, 1, "des affaires intelligemment menées"],
  [20, 24, 1, "un message éclairant"],
  [20, 34, -1, "l’intelligence aveuglée"],
  [21, 33, -1, "un procès pour escroquerie"],
  [21, 32, -1, "la malveillance et le larcin"],
  [22, 23, 1, "des affaires prospères"],
  [22, 39, 1, "un projet soutenu"],
  [22, 51, -1, "un projet retardé"],
  [22, 47, -1, "un projet sans issue"],
  [22, 50, -1, "un projet en faillite"],
  [23, 33, -1, "un litige commercial"],
  [23, 36, 1, "des négociations fructueuses"],
  [24, 29, 1, "une lettre d’amour"],
  [24, 33, -1, "une convocation, une nouvelle de justice"],
  [24, 46, -1, "une triste nouvelle"],
  [24, 45, 1, "une heureuse nouvelle"],
  [24, 51, -1, "des nouvelles tardives"],
  // Vénus
  [25, 31, -1, "des plaisirs excessifs"],
  [25, 40, 1, "la grâce et l’élégance"],
  [26, 33, 1, "la conciliation : le litige prend fin"],
  [26, 35, 1, "la réconciliation avec un ennemi"],
  [26, 36, 1, "un accord trouvé"],
  [27, 29, 1, "un mariage d’amour"],
  [27, 19, 1, "une union avantageuse"],
  [27, 33, -1, "un conflit dans le couple"],
  [27, 45, 1, "une union heureuse"],
  [27, 51, -1, "une union retardée"],
  [28, 33, -1, "une querelle de famille"],
  [28, 41, 1, "l’héritage familial"],
  [28, 46, -1, "une peine en famille"],
  [29, 31, 1, "un amour passionné"],
  [29, 32, -1, "un amour jaloux"],
  [29, 40, 1, "un jeune amour"],
  [29, 45, 1, "un amour heureux"],
  [29, 47, -1, "un amour sans avenir"],
  [30, 25, 1, "une fête joyeuse"],
  [31, 37, -1, "une flamme dévorante"],
  [31, 38, -1, "un coup de folie"],
  // Mars
  [32, 35, -1, "l’hostilité ouverte"],
  [33, 35, -1, "un conflit déclaré"],
  [33, 42, 1, "un jugement sage, un procès gagné"],
  [33, 48, -1, "un verdict sans appel"],
  [34, 35, -1, "l’oppression"],
  [34, 52, -1, "l’emprisonnement"],
  [35, 37, -1, "la violence emportée"],
  [35, 38, -1, "une agression grave"],
  [36, 42, 1, "de sages discussions"],
  [36, 27, 1, "des fiançailles, une entente"],
  [37, 6, 1, "l’élan créateur"],
  [37, 20, 1, "un esprit vif"],
  [38, 51, -1, "un contretemps brutal"],
  [38, 48, -1, "une catastrophe inéluctable"],
  // Jupiter
  [39, 33, 1, "un procès appuyé et gagné"],
  [40, 45, 1, "un épanouissement heureux"],
  [40, 49, 1, "la beauté de l’âme"],
  [41, 50, -1, "un héritage dilapidé"],
  [41, 33, -1, "une succession disputée"],
  [42, 48, 1, "accepter l’inévitable avec sagesse"],
  [42, 44, 1, "la prudence au jeu"],
  [44, 5, 1, "un coup de chance"],
  [44, 45, 1, "une chance heureuse"],
  [45, 26, 1, "un bonheur paisible"],
  // Saturne
  [46, 49, 1, "l’épreuve adoucie par la compassion"],
  [46, 50, -1, "la misère"],
  [47, 40, -1, "des espoirs déçus"],
  [48, 49, 1, "une fin apaisée"],
  [50, 6, -1, "le déclin"],
  [52, 20, 1, "l’étude dans la solitude"],
  [52, 42, 1, "une retraite méditative"],
  [52, 49, 1, "une vocation mystique"],
  // Deuxième série
  [4, 45, 1, "une naissance heureuse"],
  [4, 24, 1, "l’annonce d’une naissance"],
  [4, 18, 1, "un renouveau"],
  [5, 23, 1, "un commerce qui réussit"],
  [6, 42, 1, "un progrès mesuré"],
  [6, 51, -1, "un progrès retardé"],
  [7, 39, 1, "un honneur appuyé par un protecteur"],
  [7, 41, 1, "un nom hérité"],
  [8, 26, 1, "une amitié paisible"],
  [8, 35, -1, "un ami devenu ennemi"],
  [8, 14, 1, "un ami qui veille"],
  [9, 40, 1, "la jeunesse et la santé"],
  [9, 16, 1, "une maison à la campagne"],
  [10, 30, 1, "un cadeau de fête"],
  [10, 45, 1, "un bonheur offert"],
  [12, 22, 1, "un projet de voyage"],
  [12, 46, -1, "un départ dans la peine"],
  [13, 19, -1, "de l’argent vite dépensé"],
  [13, 44, -1, "un pari irréfléchi"],
  [14, 24, 1, "une nouvelle découverte"],
  [14, 41, 1, "un héritage retrouvé"],
  [15, 17, -1, "un mal venu de loin"],
  [15, 29, 1, "un amour lointain"],
  [16, 52, -1, "un foyer devenu prison"],
  [17, 25, -1, "des plaisirs qui rendent malade"],
  [18, 22, 1, "un projet qui évolue"],
  [18, 27, 1, "un changement de vie par l’union"],
  [19, 22, 1, "un capital pour un projet"],
  [19, 46, -1, "la gêne, le manque"],
  [20, 33, 1, "un procès bien plaidé"],
  [20, 40, 1, "un esprit jeune et vif"],
  [21, 44, -1, "une perte au jeu"],
  [21, 24, -1, "la nouvelle d’un vol"],
  [22, 36, 1, "des négociations pour un projet"],
  [23, 24, 1, "des nouvelles d’affaires"],
  [23, 44, 1, "une spéculation heureuse"],
  [24, 27, 1, "une invitation à une union"],
  [24, 38, -1, "une nouvelle brutale"],
  [25, 29, 1, "l’amour des belles choses"],
  [25, 45, 1, "la joie de vivre"],
  [26, 27, 1, "une union paisible"],
  [26, 28, 1, "la concorde familiale"],
  [27, 40, 1, "une jeune union"],
  [28, 40, 1, "une jeune famille"],
  [29, 46, -1, "un amour éprouvé"],
  [30, 36, 1, "un repas d’affaires"],
  [31, 40, 1, "un emballement de jeunesse"],
  [31, 44, -1, "la passion du jeu"],
  [32, 33, -1, "la jalousie qui mène au procès"],
  [34, 48, -1, "une contrainte sans issue"],
  [35, 39, 1, "un protecteur contre l’ennemi"],
  [37, 40, 1, "une ardeur juvénile"],
  [37, 25, 1, "la passion de l’art"],
  [38, 47, -1, "une ruine stérile"],
  [39, 41, 1, "une protection héritée"],
  [41, 48, -1, "la fin d’une lignée"],
  [42, 47, -1, "une prudence stérile"],
  [42, 51, 1, "la patience récompensée"],
  [44, 49, 1, "la chance tourne en votre faveur"],
  [45, 48, 1, "une fin heureuse"],
  [46, 51, -1, "une épreuve qui dure"],
  [47, 51, -1, "l’impasse et l’attente"],
  [48, 52, -1, "le renoncement final"],
  [50, 51, -1, "une faillite qui traîne"],
  [52, 26, 1, "la paix de la retraite"],
  [30, 29, 1, "un dîner d’amoureux"],
  [9, 25, 1, "des vacances heureuses"]
];

const paire = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// Le dictionnaire de l'Atelier (2652 associations ordonnées, « A puis B »), quand il est chargé : il remplace
// les lectures modernes ci-dessus. Le sens vient de la dynamique qu'il donne à chaque paire.
let DICO = null;
const SENS_DICO = { "Renforcement constructif": 1, "Tendance favorable": 1, "Dynamique réparatrice": 1, "Cumul de tensions": -1, "Tendance restrictive": -1, "Qualification restrictive": -1 };
/** Branche le dictionnaire de l'Atelier (objet « a-b » → { general, motscles… }), ou le retire (null). */
export function definirDictionnaire(dict) { DICO = dict || null; }
export const dictionnaireCharge = () => !!DICO;
/** La lecture de la paire « a puis b » dans le dictionnaire : { sens (1, -1, 0), dynamique, phrase }, ou null. */
export function lectureDuDictionnaire(a, b) {
  const e = DICO?.[`${a}-${b}`];
  if (!e?.general) return null;
  const morceaux = e.general.split(". ");
  const dynamique = (morceaux[1] || "").split(":")[0].trim();
  return { sens: SENS_DICO[dynamique] ?? 0, dynamique, phrase: morceaux[0].replace(/^Dans cet ordre, /, "").replace(/[\u2013\u2014]/g, ",") };
}
const INDEX_ECHOS = new Map(ECHOS.map(e => [paire(e.a, e.b), e]));
const INDEX_LECTURES = new Map(LECTURES.map(([a, b, sens, lecture]) => [paire(a, b), { a, b, sens, lecture }]));

/**
 * L'accord (hors règles de la notice) que forment deux cartes, ou null :
 * { sorte: 'echo' | 'accompagnement' | 'lecture', sens: 1 | -1, valeur, texte, cle }.
 * `nom(id)` donne le nom d'une carte (fourni par l'appelant, pour garder ce module sans dépendance).
 */
export function accordDeLecture(a, b, nom) {
  if (a == null || b == null || a === b || a >= 100 || b >= 100) return null;
  const k = paire(a, b);
  const e = INDEX_ECHOS.get(k);
  if (e) return { sorte: "echo", sens: e.sens, valeur: 500, cle: `echo:${k}`, texte: `${nom(e.a)} et ${nom(e.b)} : « ${e.mot} » dans les deux notices, ${e.glose}.` };
  if (a === 43 || b === 43) {
    const autre = a === 43 ? b : a;
    if (FAVORABLES.includes(autre)) return { sorte: "accompagnement", sens: 1, valeur: 500, cle: `renommee:${autre}`, texte: `Renommée et ${nom(autre)} : l’opinion est bonne « selon les cartes d’accompagnement ».` };
    if (NEFASTES.includes(autre)) return { sorte: "accompagnement", sens: -1, valeur: 500, cle: `renommee:${autre}`, texte: `Renommée et ${nom(autre)} : l’opinion est mauvaise « selon les cartes d’accompagnement ».` };
  }
  if ((a === 11 && MEILLEURES.includes(b)) || (b === 11 && MEILLEURES.includes(a))) {
    const autre = a === 11 ? b : a;
    return { sorte: "accompagnement", sens: -1, valeur: 500, cle: `trahison:${autre}`, texte: `Trahison et ${nom(autre)} : « à côté des meilleures cartes, minimise gravement les chances de succès ».` };
  }
  if (DICO) {
    const v = lectureDuDictionnaire(a, b);
    if (!v || !v.sens) return null;
    return { sorte: "lecture", sens: v.sens, valeur: 200, cle: `dico:${a}-${b}`, source: "atelier",
      texte: `${nom(a)} puis ${nom(b)} : ${v.phrase} (${v.dynamique.toLowerCase()}, d’après votre dictionnaire).` };
  }
  const l = INDEX_LECTURES.get(k);
  if (l) return { sorte: "lecture", sens: l.sens, valeur: 200, cle: `lecture:${k}`, texte: `${nom(l.a)} et ${nom(l.b)} : ${l.lecture}.` };
  return null;
}
