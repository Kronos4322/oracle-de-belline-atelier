// Les figures d'accord : une apparition par règle de voisinage de Belline (la « réserve », à la manière
// des fusions des jeux de cartes à duel).
// Création de jeu (signalée) : la notice ne connaît pas de figures. Chacune porte le nom que la règle donne
// à la rencontre des deux cartes (« Maladie et Grâce : guérison, convalescence » donne « Guérison »), et son
// effet en découle. Favorables (la règle fait gagner) ou néfastes (elle fait perdre) selon la notice.
//
// Pour invoquer une figure (une fois par tour, en phase principale) : envoyer au cimetière ses deux cartes,
// prises dans votre main ou sur votre terrain. Une figure n'est disponible que si vous connaissez la règle
// (carnet), ou si un Gardien vous l'a enseignée.
//   id          numéro de figure (100 et plus)
//   regles      identifiants des règles de voisinage (js/data/voisinage.js)
//   materiaux   deux numéros de carte ; un tableau dans une case = l'une ou l'autre (les deux Étoiles)

export const FIGURES = {
  100: { regles: ["4-47"], materiaux: [4, 47], nom: "Efforts inutiles", niveau: 6, atk: 2000, def: 1800, favorable: false,
    texte: "Nativité près de Stérilité : efforts inutiles. Quand elle apparaît, toutes les apparitions adverses perdent 600 ATK.",
    effets: [{ t: "stat", atk: -600, def: 0, camp: "adverse", cible: "toutes" }] },
  101: { regles: ["9-30"], materiaux: [9, 30], nom: "Pique-nique", niveau: 6, atk: 1600, def: 2400, favorable: true,
    texte: "Campagne et Table : pique-nique. Quand elle apparaît, vos apparitions gagnent 400 DEF et vous gagnez 500 points de vie.",
    effets: [{ t: "stat", atk: 0, def: 400, camp: "soi", cible: "toutes" }, { t: "lp", v: 500 }] },
  102: { regles: ["12-15"], materiaux: [12, 15], nom: "Voyage à l’étranger", niveau: 6, atk: 2200, def: 1600, favorable: true,
    texte: "Départ et Eau : voyage à l’étranger. Quand elle apparaît, la plus forte apparition adverse retourne dans la main de son joueur.",
    effets: [{ t: "renvoyer", camp: "adverse", cible: "plusForte" }] },
  103: { regles: ["13-38"], materiaux: [13, 38], nom: "Catastrophe aérienne", niveau: 7, atk: 2700, def: 1500, favorable: false,
    texte: "Inconstance et Accident : catastrophe aérienne. Quand elle apparaît, les apparitions adverses en attaque d’ATK 1500 ou moins sont détruites.",
    effets: [{ t: "detruireFaibles", seuil: 1500 }] },
  104: { regles: ["15-38"], materiaux: [15, 38], nom: "Naufrage", niveau: 7, atk: 2500, def: 2000, favorable: false,
    texte: "Eau et Accident : noyade, inondation, naufrage. Quand elle apparaît, les apparitions adverses passent en défense et perdent 500 DEF.",
    effets: [{ t: "defense", camp: "adverse" }, { t: "stat", atk: 0, def: -500, camp: "adverse", cible: "toutes" }] },
  105: { regles: ["17-48"], materiaux: [17, 48], nom: "Maladie fatale", niveau: 8, atk: 3000, def: 2200, favorable: false,
    texte: "Maladie et Fatalité : maladie fatale. Quand elle apparaît, la plus forte apparition adverse est détruite.",
    effets: [{ t: "detruire", camp: "adverse", cible: "plusForte" }] },
  106: { regles: ["17-49"], materiaux: [17, 49], nom: "Guérison", niveau: 7, atk: 2300, def: 2800, favorable: true,
    texte: "Maladie et Grâce : guérison, convalescence. Quand elle apparaît, vos apparitions retrouvent leurs valeurs d’origine et vous gagnez 1000 points de vie.",
    effets: [{ t: "retablir" }, { t: "lp", v: 1000 }] },
  107: { regles: ["21-23"], materiaux: [21, 23], nom: "Affaires véreuses", niveau: 6, atk: 2000, def: 1200, favorable: false, voleur: true,
    texte: "Vol-Perte et Trafic : affaires véreuses. Quand elle apparaît, volez une carte de la main adverse ; elle vole encore à chaque coup porté.",
    effets: [{ t: "voler" }] },
  108: { regles: ["21-35"], materiaux: [21, 35], nom: "Attaque, vol", niveau: 7, atk: 2600, def: 1400, favorable: false, voleur: true, percant: true,
    texte: "Vol-Perte et Ennemis : attaque, vol. Perce la défense, et vole une carte à chaque coup porté.", effets: [] },
  109: { regles: ["22-32"], materiaux: [22, 32], nom: "Guet-apens", niveau: 6, atk: 1800, def: 2000, favorable: false,
    texte: "Entreprises et Méchanceté : guet-apens, piège. Quand elle apparaît, la plus forte apparition adverse ne peut plus attaquer pendant deux tours.",
    effets: [{ t: "bloquer", camp: "adverse", cible: "plusForte", tours: 2 }] },
  110: { regles: ["23-19"], materiaux: [23, 19], nom: "Placements intéressants", niveau: 6, atk: 1700, def: 1900, favorable: true,
    texte: "Trafic et Argent : placements intéressants. Quand elle apparaît, piochez deux cartes.", effets: [{ t: "piocher", n: 2 }] },
  111: { regles: ["27-30"], materiaux: [27, 30], nom: "Invitation à un mariage", niveau: 6, atk: 2000, def: 2200, favorable: true,
    texte: "Union et Table : invitation à un mariage. Quand elle apparaît, piochez une carte et gagnez 600 points de vie.",
    effets: [{ t: "piocher", n: 1 }, { t: "lp", v: 600 }] },
  112: { regles: ["27-50"], materiaux: [27, 50], nom: "Divorce, rupture", niveau: 7, atk: 2400, def: 1600, favorable: false,
    texte: "Union et Ruine : divorce, rupture. Quand elle apparaît, l’adversaire jette deux cartes de sa main.", effets: [{ t: "defausser", n: 2 }] },
  113: { regles: ["29-33"], materiaux: [29, 33], nom: "Rivalité en amour", niveau: 6, atk: 2100, def: 1700, favorable: false,
    texte: "Amor et Procès : rivalité en amour. Quand elle apparaît, l’adversaire perd 600 points de vie.", effets: [{ t: "degats", v: 600 }] },
  114: { regles: ["30-17"], materiaux: [30, 17], nom: "Excès nuisibles", niveau: 6, atk: 1900, def: 1900, favorable: false,
    texte: "Table et Maladie : excès nuisibles. Quand elle apparaît, toutes les apparitions adverses perdent 300 ATK et 300 DEF.",
    effets: [{ t: "stat", atk: -300, def: -300, camp: "adverse", cible: "toutes" }] },
  115: { regles: ["31-34"], materiaux: [31, 34], nom: "Passions malheureuses", niveau: 7, atk: 2800, def: 1000, favorable: false, percant: true,
    texte: "Passions et Despotisme : passions malheureuses, dégradantes. Perce la défense.", effets: [] },
  116: { regles: ["36-32"], materiaux: [36, 32], nom: "Complot", niveau: 7, atk: 2400, def: 2000, favorable: false,
    texte: "Pourparlers et Méchanceté : complot. Quand elle apparaît, tous les présages posés de l’adversaire sont détruits.", effets: [{ t: "detruirePresages" }] },
  117: { regles: ["37-38"], materiaux: [37, 38], nom: "Incendie", niveau: 8, atk: 3000, def: 1800, favorable: false, percant: true,
    texte: "Feu et Accident : incendie, foudre, électrocution. Quand elle apparaît, les apparitions adverses en défense sont détruites. Perce la défense.",
    effets: [{ t: "detruireDefense", camp: "adverse" }] },
  118: { regles: ["44-50"], materiaux: [44, 50], nom: "Ruine au jeu", niveau: 7, atk: 2600, def: 1200, favorable: false,
    texte: "Hazard et Ruine : ruine au jeu, spéculations néfastes. Quand elle apparaît, l’adversaire perd 1000 points de vie.", effets: [{ t: "degats", v: 1000 }] },
  119: { regles: ["52-17"], materiaux: [52, 17], nom: "Hôpital", niveau: 6, atk: 1200, def: 3000, favorable: true, garde: true,
    texte: "Cloître et Maladie : hôpital. Elle garde ; quand elle apparaît, vous gagnez 800 points de vie.", effets: [{ t: "lp", v: 800 }] },
  120: { regles: ["52-46"], materiaux: [52, 46], nom: "Hospice", niveau: 6, atk: 1000, def: 2800, favorable: true, garde: true,
    texte: "Cloître et Infortune : hospice. Elle garde ; quand elle apparaît, vos apparitions gagnent 300 DEF.",
    effets: [{ t: "stat", atk: 0, def: 300, camp: "soi", cible: "toutes" }] },
  121: { regles: ["52-29"], materiaux: [52, 29], nom: "Amour sacrifié", niveau: 6, atk: 2200, def: 2000, favorable: false,
    texte: "Cloître et Amor : amour sacrifié. Quand elle apparaît, l’adversaire perd 500 points de vie et vous en gagnez 500.",
    effets: [{ t: "degats", v: 500 }, { t: "lp", v: 500 }] },
  122: { regles: ["38>2", "38>3"], materiaux: [38, [2, 3]], nom: "Exposé à un accident", niveau: 7, atk: 2500, def: 2000, favorable: false,
    texte: "Accident précédant l’Étoile : vous êtes exposé à un accident. Quand elle apparaît, une apparition adverse au hasard est détruite.",
    effets: [{ t: "detruire", camp: "adverse", cible: "aleatoire" }] },
  123: { regles: ["7>2", "7>3"], materiaux: [7, [2, 3]], nom: "Distinction", niveau: 7, atk: 2400, def: 2600, favorable: true, protege: true,
    texte: "Honneur précédant l’Étoile : vous bénéficierez d’une distinction. Protégée une fois ; quand elle apparaît, vous gagnez 500 points de vie.",
    effets: [{ t: "lp", v: 500 }] }
};

/** Figures que permettent les règles connues (`regles` : objet ou ensemble d'identifiants de règles). */
export function figuresDebloquees(regles) {
  const connue = id => (regles instanceof Set ? regles.has(id) : !!regles?.[id]);
  return Object.keys(FIGURES).map(Number).filter(f => FIGURES[f].regles.some(connue));
}
