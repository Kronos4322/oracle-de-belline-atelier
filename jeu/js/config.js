// Paramètres généraux du jeu.

export const CONFIG = {
  energieInitiale: 100,
  energieMax: 150,
  energieMaxPlancher: 60,   // Fatalité ne peut abaisser l'énergie maximale en dessous
  usure: 1.25,               // énergie perdue par seconde de marche : le chemin use le mage
  facteurRalenti: 0.5,      // multiplicateur de vitesse sous Retard, Maladie...
  facteurAcceleration: 1.5,
  vueBase: 1,               // rangs de cartes visibles devant le mage (1 : les cartes de la prochaine fourche)

  // Géométrie du chemin (unités du monde ; l'axe « a » monte vers le haut)
  largeurMonde: 480,        // largeur logique de la scène
  ecartVoies: 150,          // distance entre deux voies (gauche, centre, droite)
  rang: 200,                // distance entre deux cartes d'une même branche
  ecartFourche: 150,        // de l'embranchement à la première carte d'une branche
  carteL: 96,
  carteH: 136,
  pointsParRegle: 15        // score : chaque règle de Belline réunie
};

// Le monde suit l'ordre des familles d'Edmond, de bas en haut.
// La vitesse de marche reprend le dossier « La temporalité » : la Lune et Mercure les plus rapides, Saturne le plus lent.
export const REGIONS = [
  { famille: "preambule", nom: "Les cartes maîtresses", glyphe: "⚷", vitesse: 140, ciel: ["#2a2440", "#5b4a7a"], sol: "#8d7bb0", accent: "#B08D3C" },
  { famille: "soleil",   nom: "Le Soleil",   glyphe: "☉", vitesse: 150, ciel: ["#f3cf7e", "#f7ecd0"], sol: "#d9b866", accent: "#7A1F2B" },
  { famille: "lune",     nom: "La Lune",     glyphe: "☽", vitesse: 190, ciel: ["#1c2a44", "#46597c"], sol: "#7f93b8", accent: "#d9dfe8" },
  { famille: "mercure",  nom: "Mercure",     glyphe: "☿", vitesse: 185, ciel: ["#bcdcd7", "#eef0e6"], sol: "#8fb9b2", accent: "#1F3A5F" },
  { famille: "venus",    nom: "Vénus",       glyphe: "♀", vitesse: 165, ciel: ["#efc3c8", "#fbeee6"], sol: "#d8a2a9", accent: "#7A1F2B" },
  { famille: "mars",     nom: "Mars",        glyphe: "♂", vitesse: 155, ciel: ["#e39472", "#f6dcc4"], sol: "#c26a4c", accent: "#2A2420" },
  { famille: "jupiter",  nom: "Jupiter",     glyphe: "♃", vitesse: 135, ciel: ["#bccbec", "#f1eee2"], sol: "#8696c4", accent: "#B08D3C" },
  { famille: "saturne",  nom: "Saturne",     glyphe: "♄", vitesse: 115, ciel: ["#7f7b75", "#cfc8bb"], sol: "#9a948a", accent: "#2A2420" }
];

export const COULEURS = {
  creme: "#F7F1E3", bordeaux: "#7A1F2B", bleu: "#1F3A5F", or: "#B08D3C", encre: "#2A2420", bleuCarte: "#2b5fae",
  vert: "#3f7a3a", rouge: "#a3262f"
};
