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
  _c(6,  "L'Élévation",           'soleil'),   // « Élévation » dans la table du manuel
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
  _c(20, "L'Intelligence",        'mercure'),
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
  _c(44, "Le Hasard",             'jupiter'),
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

/* Polarité de travail (d'après le « Dossier encyclopédique des 53 cartes »).
   Plus nuancée que la valence lexicale : elle décrit comment la carte pèse
   en pratique. Une carte « majeure » (très favorable ou très défavorable)
   domine son voisinage — c'est vrai des deux côtés. */
BELLINE.POLARITE = {
  53: "Très favorable / protectrice",
  1: "Favorable conditionnelle", 2: "Neutre à favorable, significateur", 3: "Neutre à favorable, significateur",
  4: "Favorable", 5: "Très favorable", 6: "Favorable", 7: "Favorable", 8: "Favorable", 9: "Favorable", 10: "Favorable",
  11: "Défavorable", 12: "Neutre à favorable selon contexte", 13: "Défavorable / instable", 14: "Favorable / révélatrice",
  15: "Neutre, émotionnelle et mobile", 16: "Favorable / stable", 17: "Défavorable",
  18: "Favorable à neutre, dynamique", 19: "Favorable matériellement", 20: "Favorable", 21: "Défavorable",
  22: "Favorable active", 23: "Favorable à neutre", 24: "Neutre, messagère",
  25: "Favorable", 26: "Très favorable", 27: "Très favorable relationnellement", 28: "Favorable",
  29: "Très favorable affectivement", 30: "Favorable sociale", 31: "Favorable à risquée, très intense",
  32: "Défavorable", 33: "Défavorable à neutre, conflictuel", 34: "Défavorable", 35: "Défavorable",
  36: "Neutre à favorable si dialogue constructif", 37: "Neutre — dynamique, favorable ou dangereuse selon contexte",
  38: "Très défavorable / brusque",
  39: "Très favorable", 40: "Favorable", 41: "Favorable à neutre", 42: "Très favorable / modératrice",
  43: "Très favorable socialement", 44: "Très favorable mais imprévisible", 45: "Très favorable",
  46: "Défavorable", 47: "Très défavorable / bloquante", 48: "Très défavorable / contraignante",
  49: "Très favorable / protectrice", 50: "Très défavorable", 51: "Défavorable mais temporaire",
  52: "Défavorable à protectrice selon contexte"
};

/* Lames à classement FRAGILE (marqueur † de la table, ch. 2.1).
   Elles portent une valence forte mais contestée par les répertoires publiés.
   Le traité (ch. 24.3, 47.4) impose de recalculer toute concordance en les
   neutralisant : reclasser une seule peut faire varier un résultat du simple
   au triple.
   37 Feu n'y figure plus : classée neutre à la demande explicite de Camille
   (choix de lecture personnel, pas une case "contestée" à recalculer —
   une carte neutre est de toute façon déjà exclue du test de concordance). */
BELLINE.FRAGILE = [41, 48];

/* Cartes fortes de la tradition : opérateur d'intensité unique et fixe. */
BELLINE.FORTES = [11, 34, 38, 42, 48];

(function () {
  // Carte 53 = La Carte Bleue, « la carte du ciel » : tenue pour la plus
  // favorable du jeu (un ciel bleu sans nuage, une éclaircie après l'orage).
  // 16, 19, 22, 28, 30, 44 vérifiées et corrigées (audit sources, sept. 2026) :
  // classées neutres par erreur alors que la tradition (kartomanta, oracle-
  // de-belline.com, tarot-ana, mediumnitemagnetisme…) les donne favorables
  // sans réserve — et 44 contredisait même sa propre marque « majeure ».
  // 37 Feu : classée neutre à la demande explicite de Camille (sept. 2026) —
  // les sources publiques la donnent presque toutes ambivalente de toute
  // façon ; c'est sa lecture personnelle qui tranche, pas un répertoire.
  var POS = [4, 5, 6, 7, 8, 9, 10, 14, 16, 19, 20, 22, 25, 26, 27, 28, 29, 30, 39, 40, 41, 42, 43, 44, 45, 49, 53];
  var NEG = [11, 13, 17, 21, 32, 33, 34, 35, 38, 46, 47, 48, 50, 51];
  var FORTE = BELLINE.FORTES;                    // opérateur d'intensité traditionnel, fixe
  var MAJ_POS = [5, 26, 27, 29, 39, 42, 43, 44, 45, 49, 53]; // très favorables
  var MAJ_NEG = [38, 47, 48, 50];                            // très défavorables
  BELLINE.SEED_CARDS.forEach(function (c) {
    c.valence = POS.indexOf(c.number) !== -1 ? 'positive'
      : NEG.indexOf(c.number) !== -1 ? 'negative' : 'neutre';
    c.forte = FORTE.indexOf(c.number) !== -1;
    c.fragile = BELLINE.FRAGILE.indexOf(c.number) !== -1;
    c.polarite = BELLINE.POLARITE[c.number] || '';
    c.majeure = MAJ_POS.indexOf(c.number) !== -1 ? 'positive'
      : MAJ_NEG.indexOf(c.number) !== -1 ? 'negative' : null;
    c.supreme = c.number === 53;
  });
})();

/* Accès direct à une carte-graine par numéro (structure seule, non éditée). */
BELLINE.cardByNumber = function (n) {
  n = Number(n);
  return (BELLINE.SEED_CARDS || []).find(function (c) { return c.number === n; }) || null;
};

/* Un champ du Dossier (rubrique par domaine) est-il resté un renvoi générique
   au noyau/à la lecture standard plutôt qu'un texte propre au domaine ?
   Sert à masquer ces rubriques non spécifiques dans Grimoire, Tirages et
   Entraînement — les trois vues partageaient jusqu'ici trois regex
   légèrement différentes (risque de désynchronisation), unifiées ici. */
BELLINE.isTemplateText = function (s) {
  if (!s) return true;
  return /transpose son noyau sémantique|qualifie le climat du foyer par son sens|constitue une ressource, une possibilité utile ou le mécanisme|logique profonde de la situation tient à/.test(s);
};

/* Pourcentage lisible, virgule française (0,133 -> "13,3 %"). */
BELLINE.pct = function (x) { return (x * 100).toFixed(1).replace('.', ',') + ' %'; };

/* Clé de date locale AAAA-MM-JJ (jamais l'ISO en UTC, qui glisse d'un jour
   selon le fuseau) — journalier, entraînement et progression comparaient
   chacun leur propre copie de ce calcul. */
BELLINE.dateKey = function (d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
BELLINE.todayKey = function () { return BELLINE.dateKey(new Date()); };

/* Échappement HTML minimal — dupliqué à l'identique dans chaque vue avant
   cette factorisation ; désormais une seule source. */
BELLINE.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
};

/* Nom d'une carte par numéro, ou repli générique si le numéro est inconnu
   (le nom n'est jamais éditable depuis le Grimoire, donc identique quelle
   que soit la couche de données interrogée). */
BELLINE.cardName = function (n) {
  var c = BELLINE.cardByNumber(n);
  return c ? c.name : ('Carte ' + n);
};

/* Valence effective d'une carte, lames fragiles éventuellement neutralisées. */
BELLINE.valenceOf = function (n, neutralizeFragile) {
  var c = BELLINE.cardByNumber(n);
  if (!c) return 'neutre';
  if (neutralizeFragile && c.fragile) return 'neutre';
  return c.valence;
};

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
