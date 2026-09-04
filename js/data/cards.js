/* ---------------------------------------------------------------------------
 * Oracle de Belline — données de référence
 * 53 cartes : 7 séries planétaires de 7 cartes (49) + 4 cartes sans planète
 * (La Destinée, L'Étoile de l'Homme, L'Étoile de la Femme, La Carte Bleue).
 *
 * Seuls le numéro, le nom et la série sont fournis ici : c'est l'ossature.
 * Les mots-clés, le symbolisme et les significations se remplissent dans
 * le Grimoire de l'application, carte par carte.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

BELLINE.PLANETS = {
  none:    { key: 'none',    name: 'Sans planète', symbol: '✷', hue: 275, desc: "Cartes maîtresses, hors influence planétaire." },
  soleil:  { key: 'soleil',  name: 'Soleil',       symbol: '☉', hue: 40,  desc: "Rayonnement, réussite, vitalité, reconnaissance." },
  lune:    { key: 'lune',    name: 'Lune',         symbol: '☽', hue: 210, desc: "Émotions, intuition, mouvement, foyer, inconscient." },
  mercure: { key: 'mercure', name: 'Mercure',      symbol: '☿', hue: 150, desc: "Échanges, argent, intellect, commerce, nouvelles." },
  venus:   { key: 'venus',   name: 'Vénus',        symbol: '♀', hue: 330, desc: "Amour, plaisirs, harmonie, liens, sensualité." },
  mars:    { key: 'mars',    name: 'Mars',         symbol: '♂', hue: 5,   desc: "Conflit, énergie, action, obstacles, passion brute." },
  jupiter: { key: 'jupiter', name: 'Jupiter',      symbol: '♃', hue: 255, desc: "Expansion, chance, protection, justice, abondance." },
  saturne: { key: 'saturne', name: 'Saturne',      symbol: '♄', hue: 225, desc: "Épreuves, temps, limitation, karma, structure." }
};

BELLINE.PLANET_ORDER = ['none', 'soleil', 'lune', 'mercure', 'venus', 'mars', 'jupiter', 'saturne'];

function _c(number, name, planet) {
  return {
    number: number,
    name: name,
    planet: planet,
    keywords: [],
    symbolisme: '',
    sens: { general: '', amour: '', travail: '', sante: '', evolution: '' },
    notes: ''
  };
}

BELLINE.SEED_CARDS = [
  _c(1,  "La Destinée",           'none'),
  _c(2,  "L'Étoile de l'Homme",   'none'),
  _c(3,  "L'Étoile de la Femme",  'none'),

  _c(4,  "La Nativité",           'soleil'),
  _c(5,  "La Réussite",           'soleil'),
  _c(6,  "L'Élévation",           'soleil'),
  _c(7,  "Honneurs",              'soleil'),
  _c(8,  "Pensée — Amitié",       'soleil'),
  _c(9,  "Campagne — Santé",      'soleil'),
  _c(10, "Présents",              'soleil'),

  _c(11, "Trahison",              'lune'),
  _c(12, "Départ",                'lune'),
  _c(13, "Inconstance",           'lune'),
  _c(14, "Découverte",            'lune'),
  _c(15, "L'Eau",                 'lune'),
  _c(16, "Les Pénates",           'lune'),
  _c(17, "Maladie",               'lune'),

  _c(18, "Changement",            'mercure'),
  _c(19, "Argent",                'mercure'),
  _c(20, "Intelligence",          'mercure'),
  _c(21, "Vol — Perte",           'mercure'),
  _c(22, "Entreprises",           'mercure'),
  _c(23, "Trafic",                'mercure'),
  _c(24, "Nouvelle",              'mercure'),

  _c(25, "Plaisirs",              'venus'),
  _c(26, "La Paix",               'venus'),
  _c(27, "Union",                 'venus'),
  _c(28, "Famille",               'venus'),
  _c(29, "Amour",                 'venus'),
  _c(30, "La Table",              'venus'),
  _c(31, "Passions",              'venus'),

  _c(32, "Méchanceté",            'mars'),
  _c(33, "Procès",                'mars'),
  _c(34, "Despotisme",            'mars'),
  _c(35, "Ennemis",               'mars'),
  _c(36, "Pourparlers",           'mars'),
  _c(37, "Feu",                   'mars'),
  _c(38, "Accident",              'mars'),

  _c(39, "Appui",                 'jupiter'),
  _c(40, "Beauté",                'jupiter'),
  _c(41, "Héritage",              'jupiter'),
  _c(42, "Sagesse",               'jupiter'),
  _c(43, "La Renommée",           'jupiter'),
  _c(44, "Le Hazard",             'jupiter'),
  _c(45, "Bonheur",               'jupiter'),

  _c(46, "Infortune",             'saturne'),
  _c(47, "Stérilité",             'saturne'),
  _c(48, "Fatalité",              'saturne'),
  _c(49, "La Grâce",              'saturne'),
  _c(50, "Ruine",                 'saturne'),
  _c(51, "Retard",                'saturne'),
  _c(52, "Cloître",               'saturne'),

  _c(53, "La Carte Bleue",        'none')
];

/* ---------------------------------------------------------------------------
 * Valence (d'après « Lire le Belline » / « L'Oracle et la grille », table 17.2)
 *
 * La valence est la valeur portée par le SEUL NOM de la carte, hors position
 * et hors tirage. Trois catégories : positive, négative, neutre/ambivalente.
 * Elle sert au « test de valence contraire » et à la mesure de concordance.
 *
 * 5 cartes dites FORTES dominent leur voisinage : 11, 34, 38, 42, 48.
 * ------------------------------------------------------------------------- */
BELLINE.VALENCE = {
  positive: { key: 'positive', label: 'positive', long: 'Valence positive',            hue: 140 },
  negative: { key: 'negative', label: 'négative', long: 'Valence négative',            hue: 5   },
  neutre:   { key: 'neutre',   label: 'neutre',   long: 'Valence neutre / ambivalente', hue: 45  }
};

(function () {
  var POS = [4, 5, 6, 7, 8, 9, 10, 14, 20, 25, 26, 27, 29, 39, 40, 41, 42, 43, 45, 49];
  var NEG = [11, 13, 17, 21, 32, 33, 34, 35, 37, 38, 46, 47, 48, 50, 51];
  var FORTE = [11, 34, 38, 42, 48];
  BELLINE.SEED_CARDS.forEach(function (c) {
    c.valence = POS.indexOf(c.number) !== -1 ? 'positive'
      : NEG.indexOf(c.number) !== -1 ? 'negative' : 'neutre';
    c.forte = FORTE.indexOf(c.number) !== -1;
  });
})();

/* Chemin de l'image d'une carte, ou null si aucune image n'est associée.
   La correspondance numéro -> fichier vient de card-images.js
   (régénéré par tools/scan-cartes.ps1). */
BELLINE.imageFor = function (number) {
  var map = BELLINE.CARD_IMAGES || {};
  var file = map[number] || map[String(number)];
  return file ? 'assets/cartes/' + encodeURIComponent(file) : null;
};

/* Chemin de l'image du symbole d'une planète ('soleil', 'lune'…), ou null. */
BELLINE.planetImageFor = function (key) {
  var file = (BELLINE.PLANET_IMAGES || {})[key];
  return file ? 'assets/cartes/' + encodeURIComponent(file) : null;
};
