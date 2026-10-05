// Techniques du Duel des Apparitions : alignements planétaires et associations.
// Ajouts de jeu (signalés) : la notice de Belline ne décrit pas de duel. Les techniques s'appuient sur la
// structure du jeu d'Edmond (sept régions planétaires, cartes maîtresses, cartes fortes) et sur les images
// que nomme la notice ; elles ne prêtent aux cartes aucun sens qui n'y soit pas.
//
// Une technique par tour, en phase principale.
//
// Alignement : trois apparitions face recto d'une même planète sur votre terrain. Le terrain du duel devient
// cette planète (ses apparitions y gagnent 300 ATK et DEF), et la planète agit selon sa région.
// Un alignement peut servir une fois par tour.
//
// Association : un groupe de cartes que vous avez révélées pendant le duel (invoquées face recto, retournées,
// activées, déclenchées), comme les cartes d'un tirage qui se répondent. Chaque association sert une fois par duel.
//   cartes  numéros des cartes du groupe ; `parmi` : combien il en faut (toutes par défaut)
//   planetes  nombre de planètes différentes à avoir révélées (le tour du ciel)
//
// Effets (`t`) : ceux de js/engine/duel.js, plus
//   terrain {famille}    le terrain du duel devient cette planète
//   revelerAdverses      les apparitions adverses face cachée sont retournées face recto (sans déclencher leur effet)
//   proteger {camp}      les apparitions du camp sont protégées une fois de la destruction au combat

export const ALIGNEMENTS = {
  soleil: {
    nom: "Plein soleil", glyphe: "☉",
    texte: "Le terrain devient le Soleil. La lumière révèle tout : les apparitions adverses cachées sont retournées face recto, et vous gagnez 500 points de vie.",
    effets: [{ t: "revelerAdverses" }, { t: "lp", v: 500 }]
  },
  lune: {
    nom: "La marée", glyphe: "☽",
    texte: "Le terrain devient la Lune, la plus rapide des régions avec Mercure. L’eau monte : toutes les apparitions adverses passent en défense.",
    effets: [{ t: "defense", camp: "adverse" }]
  },
  mercure: {
    nom: "Vif-argent", glyphe: "☿",
    texte: "Le terrain devient Mercure, la plus vive des régions : piochez deux cartes.",
    effets: [{ t: "piocher", n: 2 }]
  },
  venus: {
    nom: "Harmonie", glyphe: "♀",
    texte: "Le terrain devient Vénus : vos apparitions retrouvent leurs valeurs d’origine et vous gagnez 1000 points de vie.",
    effets: [{ t: "retablir" }, { t: "lp", v: 1000 }]
  },
  mars: {
    nom: "L’ardeur de Mars", glyphe: "♂",
    texte: "Le terrain devient Mars : toutes vos apparitions gagnent 400 ATK.",
    effets: [{ t: "stat", atk: 400, def: 0, camp: "soi", cible: "toutes" }]
  },
  jupiter: {
    nom: "Haute protection", glyphe: "♃",
    texte: "Le terrain devient Jupiter : chacune de vos apparitions est protégée une fois de la destruction au combat.",
    effets: [{ t: "proteger", camp: "soi" }]
  },
  saturne: {
    nom: "La lenteur de Saturne", glyphe: "♄",
    texte: "Le terrain devient Saturne, la plus lente des régions : les apparitions adverses ne pourront pas attaquer à leur prochain tour.",
    effets: [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 1 }]
  }
};

export const ASSOCIATIONS = [
  {
    id: "preambule", nom: "Le préambule", cartes: [1, 2, 3],
    texte: "La Destinée et les deux Étoiles, les trois cartes maîtresses, révélées : votre prochaine carte compte double, et vous piochez une carte.",
    effets: [{ t: "doubler" }, { t: "piocher", n: 1 }]
  },
  {
    id: "freins", nom: "Les trois freins", cartes: [47, 51, 52],
    texte: "Stérilité suspend, Retard ralentit, Cloître arrête : les apparitions adverses ne pourront pas attaquer pendant deux tours, et l’adversaire ne piochera pas à son prochain tour.",
    effets: [{ t: "bloquer", camp: "adverse", cible: "toutes", tours: 2 }, { t: "sterilite" }]
  },
  {
    id: "fortes", nom: "Les puissances", cartes: [11, 34, 38, 42, 48], parmi: 3,
    texte: "Trois des cinq cartes fortes révélées : les présages posés de l’adversaire sont détruits, et il perd 1000 points de vie.",
    effets: [{ t: "detruirePresages" }, { t: "degats", v: 1000 }]
  },
  {
    id: "messagers", nom: "Les messagers", cartes: [12, 24, 36],
    texte: "Les oiseaux, la comète, les oiseaux des îles : les nouvelles arrivent. Piochez deux cartes et voyez la main adverse.",
    effets: [{ t: "piocher", n: 2 }, { t: "voir" }]
  },
  {
    id: "coeurs", nom: "Les cœurs", cartes: [27, 29, 31],
    texte: "L’autel, les deux cœurs, les cœurs blessés : gagnez 1500 points de vie.",
    effets: [{ t: "lp", v: 1500 }]
  },
  {
    id: "fortune", nom: "La fortune", cartes: [19, 23, 44],
    texte: "La corne d’abondance, le caducée, la roue de fortune : une grande occasion. Pile ou face : 2000 points de dégâts à l’un ou à l’autre.",
    effets: [{ t: "hasard", v: 2000 }]
  },
  {
    id: "ciel", nom: "Le tour du ciel", planetes: 7,
    texte: "Une carte de chacune des sept régions révélée, du Soleil à Saturne : l’adversaire perd 1500 points de vie.",
    effets: [{ t: "degats", v: 1500 }]
  }
];
