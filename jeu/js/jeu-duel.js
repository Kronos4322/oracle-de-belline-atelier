// Fichier généré par tools/build.mjs à partir des modules de js/. Ne pas modifier à la main.
(() => {
"use strict";
const M = {};
// ===== js/config.js =====
M["js/config.js"] = (() => {
// Paramètres généraux du jeu.

const CONFIG = {
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
const REGIONS = [
  { famille: "preambule", nom: "Les cartes maîtresses", glyphe: "⚷", vitesse: 140, ciel: ["#2a2440", "#5b4a7a"], sol: "#8d7bb0", accent: "#B08D3C" },
  { famille: "soleil",   nom: "Le Soleil",   glyphe: "☉", vitesse: 150, ciel: ["#f3cf7e", "#f7ecd0"], sol: "#d9b866", accent: "#7A1F2B" },
  { famille: "lune",     nom: "La Lune",     glyphe: "☽", vitesse: 190, ciel: ["#1c2a44", "#46597c"], sol: "#7f93b8", accent: "#d9dfe8" },
  { famille: "mercure",  nom: "Mercure",     glyphe: "☿", vitesse: 185, ciel: ["#bcdcd7", "#eef0e6"], sol: "#8fb9b2", accent: "#1F3A5F" },
  { famille: "venus",    nom: "Vénus",       glyphe: "♀", vitesse: 165, ciel: ["#efc3c8", "#fbeee6"], sol: "#d8a2a9", accent: "#7A1F2B" },
  { famille: "mars",     nom: "Mars",        glyphe: "♂", vitesse: 155, ciel: ["#e39472", "#f6dcc4"], sol: "#c26a4c", accent: "#2A2420" },
  { famille: "jupiter",  nom: "Jupiter",     glyphe: "♃", vitesse: 135, ciel: ["#bccbec", "#f1eee2"], sol: "#8696c4", accent: "#B08D3C" },
  { famille: "saturne",  nom: "Saturne",     glyphe: "♄", vitesse: 115, ciel: ["#7f7b75", "#cfc8bb"], sol: "#9a948a", accent: "#2A2420" }
];

const COULEURS = {
  creme: "#F7F1E3", bordeaux: "#7A1F2B", bleu: "#1F3A5F", or: "#B08D3C", encre: "#2A2420", bleuCarte: "#2b5fae",
  vert: "#3f7a3a", rouge: "#a3262f"
};

return { CONFIG, REGIONS, COULEURS };
})();

// ===== js/data/cartes.js =====
M["js/data/cartes.js"] = (() => {
// Les 53 cartes de l'Oracle de Belline.
// Source des textes : notice de Belline (La Ducale 1960, Grimaud 1961), transcription intégrale.
//
// Schéma d'une carte :
//   id        numéro Grimaud (0 = Carte Bleue)
//   nom       nom de la carte
//   image     libellé de l'image dans la notice
//   famille   'preambule' | 'soleil' | 'lune' | 'mercure' | 'venus' | 'mars' | 'jupiter' | 'saturne' | 'hors'
//   notice    texte de Belline (mot pour mot)
//   motCle    un ou deux mots pris dans la notice, écrits en gros sur la carte (un test vérifie qu'ils y figurent)
//   symbole   glyphe affiché dans les listes
//   effets    liste d'effets appliqués quand le mage vit la carte (voir js/engine/effects.js)
//   message   ce qui arrive au mage, en une phrase
//   choix     (facultatif) liste de { label, effets, message, exige } : le jeu s'arrête et le joueur choisit ;
//             `exige: { fortune: n }` rend le choix impossible sans cette fortune
//   contourne (facultatif) effets appliqués quand le joueur évite la carte (autre branche ou saut)
//   messageContourne (facultatif)
//   forte     true pour les cartes que la notice dit « Carte forte » : elles se dressent sur le tronc du chemin
//             (on ne peut pas les contourner) et les sauter coûte cher
//   etoile    (Étoiles seulement) 'homme' | 'femme' : l'Étoile du consultant le représente, l'autre est une influence
//   surprise  (facultatif) la carte reste face cachée jusqu'à ce qu'on la vive
//   declaree  (facultatif) la carte est toujours visible, même hors de vue
//   lecon     ce que le jeu fait de la carte et pourquoi, rattaché aux mots de la notice

const CARTES = [
  // ---------- Préambule ----------
  { id: 1, nom: "La Destinée", image: "La clef", famille: "preambule", symbole: "⚷", motCle: "Décision",
    notice: "Elle donne une importance de premier plan à la carte qu’elle précède immédiatement ; une décision à prendre.",
    message: "Une porte se présente. Que faire de la clef ?",
    effets: [],
    choix: [
      { label: "Ouvrir", effets: [{ type: "doubleSuivante" }], message: "La clef tourne : la porte s’ouvre." },
      { label: "Fermer", effets: [{ type: "ignorerSuivante" }], message: "La clef reste dans la serrure : la porte demeure close." }
    ],
    lecon: "« Une décision à prendre » : le joueur choisit. Ouverte, la clef met au premier plan la carte qu’elle précède, c’est-à-dire la prochaine carte que vous vivrez : son effet est doublé. Fermée, cette carte reste voilée et sans effet. À vous de choisir ensuite la branche qui mène à la carte que vous voulez au premier plan." },
  { id: 2, nom: "L’Étoile de l’Homme", image: "L’Étoile de l’homme", famille: "preambule", symbole: "✡", motCle: "Le consultant",
    notice: "Le Consultant. Représente une influence masculine dans le jeu d’une femme (exemple : le mari).",
    message: "Un homme entre en scène : la carte précédente s’applique à lui.",
    effets: [{ type: "rejouerPrecedente" }], etoile: "homme",
    lecon: "L’Étoile reçoit la carte qui la précède. Si vous êtes le consultant, elle vous représente : la carte s’applique pleinement à vous. Dans le jeu d’une consultante, elle est une influence masculine (le mari) : vous n’en recevez que la moitié. L’Étoile se dresse sur le tronc du chemin : choisissez bien la branche qui y mène." },
  { id: 3, nom: "L’Étoile de la Femme", image: "L’Étoile de la femme", famille: "preambule", symbole: "✶", motCle: "La consultante",
    notice: "La consultante. Représente une influence féminine dans le jeu d’un homme (exemple : l’épouse).",
    message: "Une femme entre en scène : la carte précédente s’applique à elle.",
    effets: [{ type: "rejouerPrecedente" }], etoile: "femme",
    lecon: "L’Étoile reçoit la carte qui la précède. Si vous êtes la consultante, elle vous représente : la carte s’applique pleinement à vous. Dans le jeu d’un consultant, elle est une influence féminine (l’épouse) : vous n’en recevez que la moitié. L’Étoile se dresse sur le tronc du chemin : choisissez bien la branche qui y mène." },

  // ---------- Soleil ----------
  { id: 4, nom: "Nativité", image: "L’Horoscope", famille: "soleil", symbole: "✷", motCle: "Naissance, début",
    notice: "Naissance, apparition, éclosion, début. Près du n° 47 : efforts inutiles.",
    message: "Quelque chose commence, et ce qui vient apparaît.", effets: [{ type: "energie", valeur: 10 }, { type: "reveler", nombre: 1 }],
    lecon: "« Naissance, apparition, début » : un regain d’énergie, et les cartes d’un rang plus loin apparaissent. Près de Stérilité (n° 47) : efforts inutiles." },
  { id: 5, nom: "Réussite", image: "La médaille", famille: "soleil", symbole: "◉", motCle: "Succès",
    notice: "Succès. Aboutissement. Rémunération, récompense.",
    message: "Succès et récompense.", effets: [{ type: "recompense", base: 20, parCarte: 2 }],
    lecon: "« Aboutissement. Rémunération, récompense » : la récompense mesure le chemin accompli. 20 de fortune, plus 2 par carte déjà vécue : plus elle vient tard, plus elle rapporte." },
  { id: 6, nom: "Élévation", image: "La pyramide", famille: "soleil", symbole: "▲", motCle: "Progrès",
    notice: "Progrès, amélioration, perfectionnement, continuation. L’œuvre progresse.",
    message: "L’œuvre progresse : le mage s’élève.", effets: [{ type: "fortune", valeur: 10 }, { type: "elever", duree: 12 }, { type: "accelerer", duree: 4 }],
    lecon: "« Progrès, amélioration, continuation. L’œuvre progresse » : le pas s’allonge, et pendant 12 secondes de marche, le mage saute sans effort (sauts gratuits) et, du haut de la pyramide, voit deux rangs de cartes plus loin." },
  { id: 7, nom: "Honneur", image: "L’honneur", famille: "soleil", symbole: "♛", motCle: "Distinction",
    notice: "Distinction honorifique, poste de premier, succès d’amour-propre ; valeurs morales.",
    message: "Une distinction.", effets: [{ type: "fortune", valeur: 15 }],
    lecon: "« Distinction honorifique » : un gain modeste par lui-même. Juste avant une Étoile, la règle s’ajoute : « vous bénéficierez d’une distinction »." },
  { id: 8, nom: "Pensée-Amitié", image: "Le chien", famille: "soleil", symbole: "❦", motCle: "L’amitié",
    notice: "L’amitié, pensée. Les relations amicales, un ami, fidélité.",
    message: "Un ami fidèle.", effets: [{ type: "energie", valeur: 5 }, { type: "compagnon", duree: 15 }],
    lecon: "« Un ami, fidélité » : le chien court aux côtés du mage pendant 15 secondes de marche ; il part devant et dévoile les cartes d’un rang plus loin." },
  { id: 9, nom: "Campagne-Santé", image: "Le jardin", famille: "soleil", symbole: "❀", motCle: "Repos, santé",
    notice: "Campagne, vacances, repos, détente. Caractère honnête. Mœurs champêtres, naturalisme. Santé. Près du n° 30 : pique-nique.",
    message: "Repos à la campagne.", effets: [{ type: "energie", valeur: 20 }, { type: "ralentir", duree: 2 }],
    lecon: "« Repos, détente. Santé » : le plus fort regain d’énergie du Soleil, au prix d’un pas plus lent (et chaque seconde de marche use le mage). Avec la Table (n° 30) : pique-nique." },
  { id: 10, nom: "Présents", image: "Les présents", famille: "soleil", symbole: "✉", motCle: "Cadeaux",
    notice: "Cadeaux, gratifications. Ce qui arrive par faveur, attentions délicates.",
    message: "Un cadeau.", effets: [{ type: "fortune", valeur: 20 }],
    contourne: [{ type: "fortune", valeur: 20 }], messageContourne: "Ce qui arrive par faveur arrive quand même : le cadeau vous rejoint.",
    lecon: "« Ce qui arrive par faveur » : on ne mérite pas un présent, on le reçoit. Prendre l’autre branche ou sauter par-dessus n’y change rien." },

  // ---------- Lune ----------
  { id: 11, nom: "Trahison", image: "Le diable", famille: "lune", symbole: "♆", motCle: "La malchance",
    notice: "Carte forte. La malchance, les complexes, la luxure, la convoitise. À côté des meilleures cartes, minimise gravement les chances de succès.",
    message: "La malchance s’installe à côté des bonnes cartes.", forte: true,
    effets: [{ type: "minimiserPrecedente" }, { type: "energie", valeur: -10 }, { type: "affaiblirSuivante" }],
    lecon: "« À côté des meilleures cartes, minimise gravement les chances de succès » : Trahison reprend la moitié de ce qu’a donné la carte précédente, et le gain suivant sera divisé par deux. Carte forte : elle se dresse sur le tronc, on ne peut pas la contourner, et la sauter coûte cher. Choisissez donc ce que vous vivez juste avant elle." },
  { id: 12, nom: "Départ", image: "Les oiseaux", famille: "lune", symbole: "⋎", motCle: "Départ",
    notice: "Départ, éloignement ou abandon. Avec le n° 15 : voyage à l’étranger.",
    message: "Le mage s’éloigne.",
    effets: [{ type: "accelerer", duree: 3 }, { type: "survolerSuivante" }],
    lecon: "« Départ, éloignement ou abandon » : les oiseaux emportent le mage au-dessus de la prochaine carte, qu’il abandonne sans la vivre, bonne ou mauvaise. Avec l’Eau (n° 15) : voyage à l’étranger." },
  { id: 13, nom: "Inconstance", image: "Le vent", famille: "lune", symbole: "≈", motCle: "Versatile",
    notice: "Caractère versatile, paroles irréfléchies ou promesses qui ne seront pas tenues. Avec le n° 38 : catastrophe aérienne.",
    message: "Le vent tourne, et promet.",
    effets: [{ type: "hasardVitesse" }, { type: "promesse", valeur: 30, delai: 6 }],
    lecon: "« Paroles irréfléchies ou promesses qui ne seront pas tenues » : le vent pousse ou freine au hasard, et promet 30 de fortune qui n’arriveront jamais. Comparez avec Beauté (n° 40), dont les espérances se réaliseront." },
  { id: 14, nom: "Découverte", image: "La longue-vue", famille: "lune", symbole: "⌕", motCle: "Trouvaille",
    notice: "La découverte. Trouvaille. Mais aussi surveillance, espionnage.",
    message: "La longue-vue révèle la route.", effets: [{ type: "reveler", nombre: 4 }, { type: "fortune", valeur: 10 }],
    lecon: "« La découverte. Trouvaille » : la longue-vue dévoile quatre rangs de cartes de plus, et une trouvaille rapporte 10 de fortune. Elle sert « aussi » à la surveillance : c’est le même regard, tourné vers les autres." },
  { id: 15, nom: "Eau", image: "L’eau", famille: "lune", symbole: "≋", motCle: "Passivité",
    notice: "Voyage par mer. La sensibilité, la passivité. L’étranger, l’exotisme, ce qui est loin ou en vient. Avec le n° 38 : noyade, inondation, naufrage.",
    message: "Le mage se laisse porter.", effets: [{ type: "passivite", duree: 3 }, { type: "energie", valeur: 10 }],
    lecon: "« La sensibilité, la passivité » : l’eau repose (+10 d’énergie) mais porte le mage où elle veut : pendant 3 secondes, il ne dirige plus ses pas ni ne saute, et l’eau choisit la branche aux fourches. Avec le Départ (n° 12) : voyage à l’étranger ; avec l’Accident (n° 38) : naufrage." },
  { id: 16, nom: "Pénates", image: "Le château", famille: "lune", symbole: "⌂", motCle: "Le foyer",
    notice: "Les pénates, la maison, le domicile, le foyer, le patrimoine, la patrie, le lieu où l’on vit, le lieu où l’on se tient habituellement.",
    message: "Le foyer protège.", effets: [{ type: "bouclier", nombre: 1 }, { type: "energie", valeur: 10 }],
    lecon: "« La maison, le foyer, le lieu où l’on se tient habituellement » : un abri. Le foyer redonne 10 d’énergie et dresse un bouclier contre la prochaine perte." },
  { id: 17, nom: "Maladie", image: "L’aigle, ou le crapaud", famille: "lune", symbole: "✚", motCle: "Malaise, remède",
    notice: "Malaise, maladie, accès, épidémie (sens propre et sens figuré). Par extension le médecin, le remède. Avec le n° 48 : maladie fatale ; avec le n° 49 : guérison, convalescence.",
    message: "Le malaise, ou le remède.",
    effets: [{ type: "si", condition: "affaibli",
      alors: [{ type: "energie", valeur: 15 }, { type: "apaiser" }],
      sinon: [{ type: "energie", valeur: -15 }, { type: "ralentir", duree: 3 }] }],
    lecon: "« Malaise, maladie. Par extension le médecin, le remède » : la carte a deux faces, comme son image (l’aigle, ou le crapaud). Pour un mage en forme, c’est le malaise (-15 d’énergie, ralenti). Pour un mage déjà affaibli (énergie sous 60, ou ralenti), c’est le remède (+15, entraves levées). Avec Fatalité (n° 48) : maladie fatale ; avec Grâce (n° 49) : guérison." },

  // ---------- Mercure ----------
  { id: 18, nom: "Changement", image: "Les astres", famille: "mercure", symbole: "⁂", motCle: "Une lunaison",
    notice: "Évolution, changements, innovations. Une période donnée, un laps de temps, une lunaison.",
    message: "Une lunaison : le monde change pour un temps.", effets: [{ type: "lunaison", duree: 8 }],
    lecon: "« Une période donnée, un laps de temps, une lunaison » : pendant 8 secondes de marche, le monde passe sous une autre planète, avec ses couleurs et son allure (plus vive sous la Lune, plus lente sous Saturne). Puis il revient." },
  { id: 19, nom: "Argent", image: "La corne d’abondance", famille: "mercure", symbole: "♁", motCle: "Les placements",
    notice: "L’argent, le capital, les placements, les biens, les gains et les ressources, les récoltes.",
    message: "Des ressources : les encaisser, ou les placer ?",
    effets: [],
    choix: [
      { label: "Encaisser", effets: [{ type: "fortune", valeur: 25 }], message: "Les gains sont encaissés." },
      { label: "Placer", effets: [{ type: "fortuneDifferee", valeur: 40, delai: 10 }], message: "Le capital est placé : la récolte viendra." }
    ],
    lecon: "« Le capital, les placements, les gains, les récoltes » : encaisser tout de suite (25), ou placer pour récolter davantage (40) après 10 secondes de marche. Un placement est une espérance : Stérilité peut la rendre vaine, Retard la repousse. Avec Trafic (n° 23) : placements intéressants." },
  { id: 20, nom: "Intelligence", image: "Le livre", famille: "mercure", symbole: "❡", motCle: "Le savoir",
    notice: "L’intelligence, le savoir, la science, les connaissances, ce qui est intellectuel. Les facultés d’adaptation.",
    message: "Le mage comprend ce qui vient.", effets: [{ type: "reveler", nombre: 2 }, { type: "discernement", duree: 15 }],
    lecon: "« Le savoir, les connaissances » : deux rangs de cartes de plus apparaissent, et pendant 15 secondes de marche chaque carte visible porte une marque : verte si elle vous serait favorable maintenant, rouge sinon. « Les facultés d’adaptation » : la marque dépend de votre état du moment." },
  { id: 21, nom: "Vol-Perte", image: "La chauve-souris", famille: "mercure", symbole: "⚇", motCle: "Vol, perte",
    notice: "Vol, perte, escroquerie, abus de confiance (matériel ou moral). Négligence fatale. Avec le n° 23 : affaires véreuses ; avec le n° 35 : attaque, vol.",
    message: "Une perte.", effets: [{ type: "vol", valeur: 25 }],
    lecon: "« Vol, perte (matériel ou moral) » : la chauve-souris prend 25 de fortune ; s’il n’y a plus rien à prendre, elle prend le reste sur l’énergie. Avec Trafic (n° 23) : affaires véreuses ; avec Ennemis (n° 35) : attaque, vol." },
  { id: 22, nom: "Entreprises", image: "Le plan", famille: "mercure", symbole: "⌗", motCle: "Projet en cours",
    notice: "Entreprise, affaires immobilières, négociations en cours, projet en cours d’exécution. Avec le n° 32 : guet-apens, piège.",
    message: "Un projet en cours d’exécution.", effets: [{ type: "projet", valeur: 35, cartes: 2 }],
    lecon: "« Projet en cours d’exécution » : le projet rapportera 35 de fortune si les deux cartes suivantes que vous vivez ne vous font rien perdre. Une perte en route, et le projet échoue. Avec Méchanceté (n° 32) : guet-apens, piège." },
  { id: 23, nom: "Trafic", image: "Le caducée", famille: "mercure", symbole: "☤", motCle: "Commerce",
    notice: "Trafic, commerce, négoce, organismes tels que banques, bourses, assurances, chambres de commerce, avocats, notaires, la presse. Avec le n° 19 : placements intéressants.",
    message: "Le négoce : vendre ou acheter ?",
    effets: [],
    choix: [
      { label: "Vendre (énergie contre fortune)", effets: [{ type: "energie", valeur: -15 }, { type: "fortune", valeur: 25 }], message: "Marché conclu." },
      { label: "Acheter (fortune contre énergie)", exige: { fortune: 20 }, effets: [{ type: "fortune", valeur: -20 }, { type: "energie", valeur: 25 }], message: "Marché conclu." }
    ],
    lecon: "« Trafic, commerce, négoce » : la seule carte qui échange. Vendez de l’énergie contre de la fortune, ou achetez de l’énergie avec votre fortune (il en faut au moins 20). Avec Argent (n° 19) : placements intéressants." },
  { id: 24, nom: "Nouvelle", image: "La comète", famille: "mercure", symbole: "☄", motCle: "Surprise", surprise: true,
    notice: "Messages, lettres, téléphone, arrivée inattendue, surprise.",
    message: "Une nouvelle arrive.", effets: [{ type: "reveler", nombre: 3 }, { type: "accelerer", duree: 2 }],
    lecon: "« Arrivée inattendue, surprise » : la comète reste face cachée jusqu’au dernier moment ; on ne la voit pas venir. Le message qu’elle porte dévoile trois rangs de cartes à venir." },

  // ---------- Vénus ----------
  { id: 25, nom: "Plaisirs", image: "La lyre", famille: "venus", symbole: "♫", motCle: "Les plaisirs",
    notice: "Les plaisirs, tout ce qui rend la vie agréable, distractions, les parures, les bijoux, etc. Par extension, l’art.",
    message: "Un moment agréable.", effets: [{ type: "energie", valeur: 15 }, { type: "parure" }],
    lecon: "« Tout ce qui rend la vie agréable, les parures, les bijoux » : +15 d’énergie, et le mage porte désormais un bijou." },
  { id: 26, nom: "Paix", image: "La hache aux faisceaux", famille: "venus", symbole: "☮", motCle: "Apaisement",
    notice: "La paix, concorde, entente, harmonie, apaisement.",
    message: "L’apaisement efface les entraves.", effets: [{ type: "apaiser" }, { type: "energie", valeur: 5 }],
    lecon: "« Apaisement » : toutes les entraves tombent (ralentissement, aveuglement, dépérissement, gain affaibli)." },
  { id: 27, nom: "Union", image: "L’autel", famille: "venus", symbole: "∞", motCle: "Union, retour",
    notice: "Union, mariage, liaison, association, réunion, retour, dévouement. Avec le n° 30 : invitation à un mariage ; avec le n° 50 : divorce, rupture.",
    message: "Une union.", effets: [{ type: "energie", valeur: 10 }, { type: "fortune", valeur: 10 }, { type: "retour" }],
    lecon: "« Réunion, retour » : la dernière carte que vous avez contournée revient, et vous la vivez à son tour, bonne ou mauvaise. Si c’est la Table (n° 30) : invitation à un mariage ; si c’est Ruine (n° 50) : divorce, rupture." },
  { id: 28, nom: "Famille", image: "Le pélican", famille: "venus", symbole: "⚘", motCle: "Les liens",
    notice: "La famille, les liens du sang ou ceux de l’esprit ; par extension, une association, un groupement, une société.",
    message: "La famille protège.", effets: [{ type: "bouclier", nombre: 1 }, { type: "energie", valeur: 5 }, { type: "si", condition: "accompagne", alors: [{ type: "bouclier", nombre: 1 }], sinon: [] }],
    lecon: "« Les liens du sang ou ceux de l’esprit » : un bouclier. Si le mage est accompagné (le chien de Pensée-Amitié court avec lui), le lien de l’esprit en ajoute un second." },
  { id: 29, nom: "Amor", image: "Les deux cœurs", famille: "venus", symbole: "♥", motCle: "L’affection",
    notice: "L’amour, l’affection. Avec le n° 33 : rivalité en amour.",
    message: "L’amour.", effets: [{ type: "regain", taux: 2, duree: 10 }],
    lecon: "« L’amour, l’affection » : un bien qui dure. Pendant 10 secondes de marche, le mage regagne 2 d’énergie par seconde au lieu de s’user. Avec Procès (n° 33) : rivalité en amour." },
  { id: 30, nom: "Table", image: "L’amphore", famille: "venus", symbole: "⚱", motCle: "Invitations",
    notice: "La table, invitations, fêtes, festins, la vie mondaine, les sorties. Avec le n° 17 : excès nuisibles.",
    message: "Une invitation.",
    effets: [],
    choix: [
      { label: "Accepter", effets: [{ type: "energie", valeur: 20 }, { type: "ralentir", duree: 3 }], message: "Le festin réconforte, mais on repart lentement." },
      { label: "Décliner", effets: [], message: "Le mage poursuit sa route." }
    ],
    lecon: "« Invitations, fêtes, festins » : une invitation se décide. Accepter redonne 20 d’énergie mais alourdit le pas. Avec Maladie (n° 17) : excès nuisibles ; avec Union (n° 27) : invitation à un mariage." },
  { id: 31, nom: "Passions", image: "Les cœurs blessés", famille: "venus", symbole: "♡", motCle: "Feu de paille",
    notice: "Les passions, quelles qu’elles soient, emballement, engouement, feu de paille. Avec le n° 34 : passions malheureuses, dégradantes, pouvant aller jusqu’au déshonneur.",
    message: "Un emballement : feu de paille.", effets: [{ type: "accelerer", duree: 3 }, { type: "feuDePaille", valeur: 25, duree: 6 }],
    lecon: "« Emballement, engouement, feu de paille » : +25 d’énergie et le pas s’emballe ; mais au bout de 6 secondes de marche, le feu s’éteint et les 25 disparaissent. Avec Despotisme (n° 34) : passions malheureuses." },

  // ---------- Mars ----------
  { id: 32, nom: "Méchanceté", image: "La lanterne", famille: "mars", symbole: "☌", motCle: "Jalousie, envie",
    notice: "Méchanceté, une personne méchante, jalousie, envie.",
    message: "Une jalousie.", effets: [{ type: "envie", part: 0.3, sinon: 10 }],
    lecon: "« Jalousie, envie » : l’envie vise ce que vous avez. Elle prend 30 % de votre fortune ; si vous n’avez rien, elle s’en prend à vous (-10 d’énergie). Avec Entreprises (n° 22) : guet-apens ; avec Pourparlers (n° 36) : complot." },
  { id: 33, nom: "Procès", image: "Les deux épées", famille: "mars", symbole: "⚔", motCle: "Chicanes",
    notice: "Chicanes, discussions, litiges, procès, antagonisme, opposition.",
    message: "Un litige : transiger ou plaider ?",
    effets: [],
    choix: [
      { label: "Transiger", effets: [{ type: "fortune", valeur: -15 }], message: "On s’arrange, à prix coûtant." },
      { label: "Plaider", effets: [{ type: "hasardFortune", valeur: 30 }, { type: "ralentir", duree: 3 }], message: "Le procès traîne." }
    ],
    lecon: "« Chicanes, litiges, procès » : transiger coûte 15 de fortune ; plaider, c’est gagner ou perdre 30 au hasard, et le procès ralentit le mage. Avec Amor (n° 29) : rivalité en amour." },
  { id: 34, nom: "Despotisme", forte: true, image: "L’enchaîné", famille: "mars", symbole: "⛓", motCle: "Force majeure",
    notice: "Carte forte. Le consultant est victime de la force majeure. Décision arbitraire. Sacrifice mal compris, jugement faux ou inique. Aveuglement, illusions.",
    message: "La force majeure enchaîne le mage.", effets: [{ type: "ralentir", duree: 4 }, { type: "energie", valeur: -10 }, { type: "aveuglement", duree: 8 }],
    lecon: "« Victime de la force majeure. Aveuglement, illusions » : le mage, enchaîné, ralentit, et pendant 8 secondes de marche toutes les cartes à venir lui sont cachées : il choisit ses branches à l’aveugle. Carte forte : sur le tronc ; on ne la contourne pas, et la sauter coûte cher. Avec Passions (n° 31) : passions malheureuses." },
  { id: 35, nom: "Ennemis", image: "Le glaive et le serpent", famille: "mars", symbole: "⚚", motCle: "Attaques", declaree: true,
    notice: "Ennemis déclarés, rixes, attaques, agressions, voies de fait.",
    message: "Une attaque.", effets: [{ type: "energie", valeur: -20 }],
    lecon: "« Ennemis déclarés » : ils ne se cachent pas. Cette carte est toujours visible, même hors de vue : vous savez où elle est, à vous de l’éviter. « Attaques » : -20 d’énergie. Avec Vol-Perte (n° 21) : attaque, vol." },
  { id: 36, nom: "Pourparlers", image: "Les oiseaux des îles", famille: "mars", symbole: "❝", motCle: "Entretiens",
    notice: "Pourparlers, entretiens, conférences, conciliabules. Avec le n° 32 : complot.",
    message: "Un entretien s’engage.",
    effets: [],
    choix: [
      { label: "Négocier", effets: [{ type: "ralentir", duree: 2 }, { type: "fortune", valeur: 15 }], message: "On discute longuement, avec profit." },
      { label: "Écourter", effets: [{ type: "fortune", valeur: 5 }], message: "On se quitte vite." }
    ],
    lecon: "« Pourparlers, entretiens, conférences » : négocier prend du temps (le pas ralentit) mais rapporte 15 ; écourter rapporte 5. Avec Méchanceté (n° 32) : complot." },
  { id: 37, nom: "Feu", image: "La torche", famille: "mars", symbole: "♨", motCle: "L’ardeur",
    notice: "Le feu et tout ce qu’il symbolise, l’ardeur, la spontanéité.",
    message: "L’ardeur.", effets: [{ type: "accelerer", duree: 6 }, { type: "energie", valeur: 5 }],
    lecon: "« L’ardeur, la spontanéité » : le pas s’accélère pendant 6 secondes ; on parcourt plus de chemin pour moins d’usure. Avec Accident (n° 38) : incendie, foudre." },
  { id: 38, nom: "Accident", forte: true, image: "La tour foudroyée", famille: "mars", symbole: "ϟ", motCle: "Bouleversement",
    notice: "Carte forte. L’accident, le bouleversement, la destruction au propre comme au figuré. Avec le n° 37 : incendie, foudre, électrocution.",
    message: "Le scénario est rompu.", effets: [{ type: "detruireBoucliers" }, { type: "energie", valeur: -20 }, { type: "bouleverser" }],
    lecon: "« Le bouleversement, la destruction » : les boucliers sont détruits avant de servir, -20 d’énergie, et les cartes qui restent dans la région sont rebattues sur leurs branches : ce que vous aviez vu ne tient plus. Carte forte : sur le tronc ; on ne la contourne pas, et la sauter coûte cher." },

  // ---------- Jupiter ----------
  { id: 39, nom: "Appui", image: "L’aigle couronné", famille: "jupiter", symbole: "♔", motCle: "Protections",
    notice: "Appui, protections, faveurs d’un personnage puissant.",
    message: "Un protecteur puissant.", effets: [{ type: "bouclier", nombre: 2 }],
    lecon: "« Protections, faveurs d’un personnage puissant » : deux boucliers. Chacun absorbe entièrement une perte, petite ou grande." },
  { id: 40, nom: "Beauté", image: "La fleur royale", famille: "jupiter", symbole: "⚜", motCle: "Espérances",
    notice: "Beauté, jeunesse, épanouissement, espoir, espérances qui se réaliseront par la suite.",
    message: "Une espérance qui se réalisera par la suite.", effets: [{ type: "energie", valeur: 5 }, { type: "fortuneDifferee", valeur: 35, delai: 8 }],
    lecon: "« Espérances qui se réaliseront par la suite » : 35 de fortune, non pas tout de suite, mais après 8 secondes de marche. Comparez avec Inconstance (n° 13), dont les promesses ne seront pas tenues." },
  { id: 41, nom: "Héritage", image: "Le grimoire", famille: "jupiter", symbole: "§", motCle: "Legs",
    notice: "Héritage, don, legs, le patrimoine, l’hérédité, les ancêtres, les choses du passé.",
    message: "Un legs du passé.", effets: [{ type: "heritage" }],
    lecon: "« Legs, les choses du passé » : le grimoire rend ce que le passé a donné de meilleur. La carte la plus favorable que vous avez vécue redonne ses gains une seconde fois." },
  { id: 42, nom: "Sagesse", forte: true, image: "La chouette", famille: "jupiter", symbole: "⚖", motCle: "Prudence",
    notice: "Carte forte. Sagesse, prudence, modération, la raison, la réflexion.",
    message: "La prudence modère tout.", effets: [{ type: "moderation", duree: 12 }, { type: "reveler", nombre: 1 }],
    lecon: "« Prudence, modération, la réflexion » : pendant 12 secondes de marche, gains et pertes sont divisés par deux ; et la réflexion porte le regard un rang plus loin. Carte forte : sur le tronc ; on ne la contourne pas, et la sauter coûte cher." },
  { id: 43, nom: "Renommée", image: "La trompette", famille: "jupiter", symbole: "♬", motCle: "L’opinion",
    notice: "La renommée, la célébrité, personnage connu. On appréciera vos talents ; l’opinion (bonne ou mauvaise selon les cartes d’accompagnement) que l’on a de vous.",
    message: "La trompette sonne : l’opinion se fait.", effets: [{ type: "renommee", valeur: 20 }],
    lecon: "« L’opinion (bonne ou mauvaise selon les cartes d’accompagnement) » : la renommée suit la carte vécue juste avant. Après une carte favorable, +20 de fortune ; après une carte néfaste, -20." },
  { id: 44, nom: "Hazard", image: "La roue de fortune", famille: "jupiter", symbole: "☸", motCle: "Une occasion",
    notice: "Le hazard, la chance, le jeu, les spéculations, une occasion. Avec le n° 50 : ruine au jeu, spéculations néfastes.",
    message: "La roue de fortune tourne : une occasion.",
    effets: [],
    choix: [
      { label: "Miser", effets: [{ type: "pari", min: 10 }], message: "La roue a tourné." },
      { label: "Passer", effets: [], message: "L’occasion s’envole." }
    ],
    lecon: "« Le jeu, les spéculations, une occasion » : vous décidez. Miser engage la moitié de votre fortune (au moins 10) : la roue la double ou l’emporte. Si vous avez misé et que Ruine (n° 50) suit : ruine au jeu." },
  { id: 45, nom: "Bonheur", image: "L’étoile des mages", famille: "jupiter", symbole: "★", motCle: "Vocation réalisée",
    notice: "Le bonheur, vocation réalisée.",
    message: "Le bonheur.", effets: [{ type: "combler" }, { type: "fortune", valeur: 10 }],
    lecon: "« Le bonheur, vocation réalisée » : la plénitude. L’énergie remonte à son maximum." },

  // ---------- Saturne ----------
  { id: 46, nom: "Infortune", image: "La mendiante", famille: "saturne", symbole: "☋", motCle: "Afflictions",
    notice: "Infortunes, afflictions morales et physiques, la malchance, les infirmités, la vieillesse.",
    message: "Une épreuve.", effets: [{ type: "energie", valeur: -10 }, { type: "ralentir", duree: 6 }],
    lecon: "« Afflictions morales et physiques, les infirmités, la vieillesse » : -10 d’énergie et le pas s’alourdit longtemps (6 secondes) ; or chaque seconde de marche use le mage." },
  { id: 47, nom: "Stérilité", image: "L’île déserte", famille: "saturne", symbole: "◌", motCle: "Impasse",
    notice: "Stérilité, œuvres chimériques, utopies, tentatives vaines, impasse.",
    message: "Rien ne pousse : les gains sont suspendus.", effets: [{ type: "sterilite", duree: 8 }],
    lecon: "« Stérilité, tentatives vaines, impasse » : pendant 8 secondes de marche, aucun gain de fortune ne produit rien, et les espérances qui arrivent à terme sont perdues." },
  { id: 48, nom: "Fatalité", forte: true, image: "Le temps", famille: "saturne", symbole: "⧗", motCle: "Échéance",
    notice: "Carte forte. Limites, bornes, échéance inéluctable, la fin.",
    message: "L’échéance tombe.", effets: [{ type: "energie", valeur: -20 }, { type: "borner", valeur: 25 }],
    lecon: "« Limites, bornes, échéance inéluctable » : -20 d’énergie, et l’énergie maximale du mage est abaissée de 25 pour le reste du chemin. Carte forte : sur le tronc ; on ne la contourne pas, et la sauter coûte cher." },
  { id: 49, nom: "Grâce", image: "La colombe", famille: "saturne", symbole: "☙", motCle: "Revirement",
    notice: "La grâce, revirement favorable, compassion, prière exaucée, vocation, penchant artistique ou mystique.",
    message: "Revirement favorable.", effets: [{ type: "revirement" }, { type: "apaiser" }, { type: "energie", valeur: 10 }],
    lecon: "« Revirement favorable, prière exaucée » : la dernière perte que vous avez subie vous est rendue, et les entraves tombent." },
  { id: 50, nom: "Ruine", image: "Les ruines", famille: "saturne", symbole: "⌓", motCle: "Faillite",
    notice: "Dépérissement, consomption, mauvaise base de départ, superstitions, méthodes périmées, échec, faillite.",
    message: "Une structure s’effondre.", effets: [{ type: "fortune", valeur: -20 }, { type: "deperissement", duree: 8 }],
    lecon: "« Échec, faillite. Dépérissement, consomption » : -20 de fortune, et pendant 8 secondes de marche l’usure du mage est doublée." },
  { id: 51, nom: "Retard", image: "La roue dans l’ornière", famille: "saturne", symbole: "⊗", motCle: "Délai",
    notice: "Retard, contretemps, tergiversations, morte-saison, expectative, délai.",
    message: "La roue s’enlise dans l’ornière.", effets: [{ type: "ralentir", duree: 5 }, { type: "delai", secondes: 5 }],
    lecon: "« Retard, délai, expectative » : le mage ralentit sans s’arrêter, et toutes les espérances en cours (placements, Beauté) sont repoussées de 5 secondes." },
  { id: 52, nom: "Cloître", image: "Le cloître", famille: "saturne", symbole: "⛫", motCle: "Repliement",
    notice: "Claustration, repliement sur soi, les idées mélancoliques (hôpital avec le n° 17, hospice avec le n° 46, ou prison). Isolement, tour d’ivoire, renoncement (avec le n° 29 : amour sacrifié).",
    message: "Retrait : le mage s’arrête et récupère.", effets: [{ type: "retrait", duree: 3 }, { type: "energie", valeur: 15 }],
    lecon: "« Claustration, repliement sur soi » : le mage s’arrête 3 secondes, sans pouvoir marcher ni sauter ; enfermé, il ne s’use pas et récupère 15 d’énergie. Avec Maladie (n° 17) : hôpital ; avec Infortune (n° 46) : hospice ; avec Amor (n° 29) : amour sacrifié." },

  // ---------- Hors jeu d'Edmond ----------
  { id: 0, nom: "Carte Bleue", image: "Fond bleu uni", famille: "hors", symbole: "◆", motCle: "Remplacement",
    notice: "Carte supplémentaire à fond bleu uni, particulièrement bénéfique si l’on s’en sert dans le jeu, mais qui peut aussi servir de carte de remplacement.",
    message: "Une protection bienveillante, et une carte en réserve.", effets: [{ type: "energie", valeur: 10 }, { type: "reserve" }],
    lecon: "« Peut aussi servir de carte de remplacement » : la Carte Bleue reste en réserve. Une fois dans la partie (touche B ou bouton), elle remplace la dernière carte vécue : ce que cette carte vous avait fait est annulé." }
];

const CARTE_PAR_ID = Object.fromEntries(CARTES.map(c => [c.id, c]));

return { CARTES, CARTE_PAR_ID };
})();

// ===== js/data/voisinage.js =====
M["js/data/voisinage.js"] = (() => {
// Règles de voisinage de la notice de Belline.
// Elles s'appliquent quand deux cartes sont vécues l'une après l'autre (cartes voisines dans le tirage).
//   id      identifiant stable (carnet du joueur)
//   a, b    numéros des cartes
//   ordre   'libre' : « avec le n° … », « près du n° … » (l'ordre est indifférent)
//           'avant' : « la carte a précédant la carte b » (a doit être vécue juste avant b)
//   exige   (facultatif) { id, choix } : la carte `id` doit avoir été vécue avec ce choix (Hazard : avoir misé)
//   texte   formulation de Belline
//   source  où la notice donne cette règle
//   effets  effets ajoutés à ceux des deux cartes

const SOURCE_ETOILE = "À vérifier : cette règle ne figure dans aucune notice de carte de ce fichier (méthode de lecture ?)";

const VOISINAGE = [
  { id: "4-47", a: 4, b: 47, ordre: "libre", source: "notice du n° 4", texte: "Nativité près de Stérilité : efforts inutiles.", effets: [{ type: "fortune", valeur: -15 }] },
  { id: "9-30", a: 9, b: 30, ordre: "libre", source: "notice du n° 9", texte: "Campagne et Table : pique-nique.", effets: [{ type: "energie", valeur: 15 }] },
  { id: "12-15", a: 12, b: 15, ordre: "libre", source: "notice du n° 12", texte: "Départ et Eau : voyage à l’étranger.", effets: [{ type: "accelerer", duree: 4 }, { type: "fortune", valeur: 10 }] },
  { id: "13-38", a: 13, b: 38, ordre: "libre", source: "notice du n° 13", texte: "Inconstance et Accident : catastrophe aérienne.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "15-38", a: 15, b: 38, ordre: "libre", source: "notice du n° 15", texte: "Eau et Accident : noyade, inondation, naufrage.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "17-48", a: 17, b: 48, ordre: "libre", source: "notice du n° 17", texte: "Maladie et Fatalité : maladie fatale.", effets: [{ type: "energie", valeur: -25 }] },
  { id: "17-49", a: 17, b: 49, ordre: "libre", source: "notice du n° 17", texte: "Maladie et Grâce : guérison, convalescence.", effets: [{ type: "energie", valeur: 25 }] },
  { id: "21-23", a: 21, b: 23, ordre: "libre", source: "notice du n° 21", texte: "Vol-Perte et Trafic : affaires véreuses.", effets: [{ type: "fortune", valeur: -20 }] },
  { id: "21-35", a: 21, b: 35, ordre: "libre", source: "notice du n° 21", texte: "Vol-Perte et Ennemis : attaque, vol.", effets: [{ type: "fortune", valeur: -20 }] },
  { id: "22-32", a: 22, b: 32, ordre: "libre", source: "notice du n° 22", texte: "Entreprises et Méchanceté : guet-apens, piège.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "23-19", a: 23, b: 19, ordre: "libre", source: "notice du n° 23", texte: "Trafic et Argent : placements intéressants.", effets: [{ type: "fortune", valeur: 25 }] },
  { id: "27-30", a: 27, b: 30, ordre: "libre", source: "notice du n° 27", texte: "Union et Table : invitation à un mariage.", effets: [{ type: "energie", valeur: 15 }] },
  { id: "27-50", a: 27, b: 50, ordre: "libre", source: "notice du n° 27", texte: "Union et Ruine : divorce, rupture.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "29-33", a: 29, b: 33, ordre: "libre", source: "notice du n° 29", texte: "Amor et Procès : rivalité en amour.", effets: [{ type: "energie", valeur: -10 }] },
  { id: "30-17", a: 30, b: 17, ordre: "libre", source: "notice du n° 30", texte: "Table et Maladie : excès nuisibles.", effets: [{ type: "energie", valeur: -10 }] },
  { id: "31-34", a: 31, b: 34, ordre: "libre", source: "notice du n° 31", texte: "Passions et Despotisme : passions malheureuses, dégradantes.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "36-32", a: 36, b: 32, ordre: "libre", source: "notice du n° 36", texte: "Pourparlers et Méchanceté : complot.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "37-38", a: 37, b: 38, ordre: "libre", source: "notice du n° 38", texte: "Feu et Accident : incendie, foudre, électrocution.", effets: [{ type: "energie", valeur: -20 }] },
  { id: "44-50", a: 44, b: 50, ordre: "libre", exige: { id: 44, choix: 0 }, source: "notice du n° 44", texte: "Hazard et Ruine : ruine au jeu, spéculations néfastes.", effets: [{ type: "fortune", valeur: -40 }] },
  { id: "52-17", a: 52, b: 17, ordre: "libre", source: "notice du n° 52", texte: "Cloître et Maladie : hôpital.", effets: [{ type: "retrait", duree: 2 }] },
  { id: "52-46", a: 52, b: 46, ordre: "libre", source: "notice du n° 52", texte: "Cloître et Infortune : hospice.", effets: [{ type: "retrait", duree: 2 }] },
  { id: "52-29", a: 52, b: 29, ordre: "libre", source: "notice du n° 52", texte: "Cloître et Amor : amour sacrifié.", effets: [{ type: "energie", valeur: -10 }] },
  { id: "38>2", a: 38, b: 2, ordre: "avant", source: SOURCE_ETOILE, texte: "Accident précédant l’Étoile : vous êtes exposé à un accident.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "38>3", a: 38, b: 3, ordre: "avant", source: SOURCE_ETOILE, texte: "Accident précédant l’Étoile : vous êtes exposé à un accident.", effets: [{ type: "energie", valeur: -15 }] },
  { id: "7>2", a: 7, b: 2, ordre: "avant", source: SOURCE_ETOILE, texte: "Honneur précédant l’Étoile : vous bénéficierez d’une distinction.", effets: [{ type: "fortune", valeur: 30 }] },
  { id: "7>3", a: 7, b: 3, ordre: "avant", source: SOURCE_ETOILE, texte: "Honneur précédant l’Étoile : vous bénéficierez d’une distinction.", effets: [{ type: "fortune", valeur: 30 }] }
];

/** Vrai si la règle `r` relie les deux cartes (ordre compris). */
function regleRelie(r, idPrecedente, idCourante) {
  if (r.ordre === "avant") return r.a === idPrecedente && r.b === idCourante;
  return (r.a === idPrecedente && r.b === idCourante) || (r.b === idPrecedente && r.a === idCourante);
}

/**
 * Règles déclenchées quand l'entrée `courante` du tirage suit immédiatement `precedente`.
 * Une entrée est { id, choix } ; `exige` vérifie le choix fait sur une carte (Hazard misé).
 */
function reglesDeclenchees(precedente, courante) {
  if (!precedente || !courante) return [];
  return VOISINAGE.filter(r => {
    if (!regleRelie(r, precedente.id, courante.id)) return false;
    if (r.exige) {
      const e = [precedente, courante].find(x => x.id === r.exige.id);
      if (!e || e.choix !== r.exige.choix) return false;
    }
    return true;
  });
}

return { VOISINAGE, regleRelie, reglesDeclenchees };
})();

// ===== js/data/duel.js =====
M["js/data/duel.js"] = (() => {
// Le Duel des Apparitions : ce que fait chaque carte au combat, à la manière des jeux de cartes à duel.
// Adaptation de jeu (signalée) : la notice de Belline ne décrit pas de combat. Chaque carte reçoit pourtant
// sa nature, sa force et son effet d'un mot de sa notice (champ `mot`, vérifié par un test).
//
// Trois sortes de cartes :
//   apparition  une figure invoquée sur le terrain : niveau (étoiles), ATK, DEF. Niveau 5 et 6 : un sacrifice ;
//               niveau 7 et 8 (les cartes fortes de la notice) : deux sacrifices.
//   influence   un événement joué depuis la main pendant votre phase principale (comme une magie).
//               `sousType` : 'equipement' (reste attachée à une apparition) ou 'continue' (reste en jeu
//               plusieurs tours, dans une zone de présage, face visible) ou 'terrain' (ajout de jeu : un lieu
//               que nomme la notice ; il se pose de votre côté du tapis, le change, et agit tant qu'il demeure ;
//               un seul par joueur ; un nouveau terrain casse l'ancien ; l'Accident et la lunaison le cassent).
//               `terrain` : { atk, def, defDefense (en défense seulement), lp (à chacun de vos tours), sansAttaque, duree }.
//               Un terrain s'use : il tombe après `duree` de vos tours (le Cloître, qui arrête, ne tient que 3 tours).
//   presage     posé face cachée ; il se déclenche pendant le tour adverse (comme un piège), à partir du
//               tour suivant sa pose. `declencheur` : 'attaque' (une apparition adverse attaque),
//               'invocation' (l'adversaire invoque une apparition) ou 'influence' (l'adversaire active
//               une influence : c'est une chaîne, le présage répond).
//
// Capacités d'apparition (vraies tant qu'elle est face recto) :
//   garde       l'adversaire doit l'attaquer en premier
//   percant     contre une apparition en défense, inflige la différence en dégâts
//   protege     la première fois qu'elle devrait être détruite au combat, elle ne l'est pas
//   voleur      quand elle inflige des dégâts de combat, elle vole une carte de la main adverse
//   feuDePaille détruite à la fin du tour où elle a attaqué
//   croissance  +v ATK à chacune de vos phases de pioche
//   regain      +v points de vie à chacune de vos phases de pioche
//   moderation  les dégâts de combat que vous subissez sont divisés par deux
//   declaree    ne peut pas être posée face cachée
// `effets` d'une apparition : appliqués quand elle est révélée (invocation face recto, ou retournée).
//
// Règles communes (ajouts de jeu) : l'affinité planétaire (+200 ATK par autre apparition face recto de même
// planète que vous contrôlez) et le terrain (le duel se tient sous une planète : +300 ATK et DEF à ses apparitions).
//
// Effets (`t`) ; `camp` : 'soi' | 'adverse' ; `cible` : 'toutes' | 'plusForte' | 'plusFaible' | 'aleatoire' | 'nouvelle' | 'autres'
//   lp {v} / degats {v} / degatsParAllie {v} / reussite
//   stat {atk, def, camp, cible}  modifie ATK / DEF            retablir            vos apparitions retrouvent leurs valeurs d'origine si elles ont baissé
//   defense {camp}       met en défense                       bloquer {camp, cible, tours}
//   detruire {camp, cible}                                     detruireDefense {camp}  (camp absent : les deux)
//   detruireFaibles {seuil}  détruit les apparitions adverses en attaque d'ATK au plus `seuil`
//   detruirePresages     détruit les présages posés de l'adversaire
//   lunaison / piocher {n} / voir / voler / defausser {n} / defausserSoi {n} / sterilite
//   differe {tours, effets} / retourMain / heritage / doubler / annuler / rejouer / remplacer / hasard {v} / remede {v, seuil}
// Effets de présage : renvoyerAttaquant, annulerCombat, detruireAttaquant, retarderAttaquant {tours}, renfortSurprise,
//   inverserInvoquee, neutraliserInvoquee {tours}, passiviteInvoquee, annulerInfluence, litige.

const DUEL = {
  // ---------- Préambule ----------
  1: { type: "influence", mot: "décision", texte: "Une décision à prendre. Ouvrir : votre prochaine carte compte double. Fermer : la prochaine carte adverse reste sans effet.",
    choix: [{ label: "Ouvrir", effets: [{ t: "doubler" }] }, { label: "Fermer", effets: [{ t: "annuler" }] }] },
  2: { type: "influence", mot: "consultant", texte: "L’Étoile reçoit la carte qui la précède : votre carte précédente se rejoue, pleinement si c’est votre Étoile, à moitié sinon.", effets: [{ t: "rejouer" }] },
  3: { type: "influence", mot: "consultante", texte: "L’Étoile reçoit la carte qui la précède : votre carte précédente se rejoue, pleinement si c’est votre Étoile, à moitié sinon.", effets: [{ t: "rejouer" }] },

  // ---------- Soleil ----------
  4: { type: "apparition", niveau: 1, atk: 800, def: 600, mot: "naissance", texte: "Naissance, apparition : quand elle est révélée (même retournée), piochez une carte.", effets: [{ t: "piocher", n: 1 }] },
  5: { type: "apparition", niveau: 4, atk: 1700, def: 1300, mot: "récompense", texte: "Succès, récompense : quand elle est révélée, vous gagnez 300 points de vie, plus 50 par carte de votre cimetière.", effets: [{ t: "reussite" }] },
  6: { type: "influence", sousType: "equipement", mot: "progrès", texte: "Équipement. Progrès : votre apparition la plus forte gagne 800 ATK tant qu’elle reste en jeu.", effets: [{ t: "stat", atk: 800, def: 0, camp: "soi", cible: "plusForte", equipement: true }] },
  7: { type: "apparition", niveau: 4, atk: 1800, def: 1700, protege: true, mot: "distinction", texte: "Distinction honorifique : la première fois qu’elle devrait être détruite au combat, elle ne l’est pas.", effets: [] },
  8: { type: "apparition", niveau: 3, atk: 1200, def: 1500, garde: true, mot: "fidélité", texte: "Un ami, fidélité : le chien garde. L’adversaire doit l’attaquer en premier.", effets: [] },
  9: { type: "influence", sousType: "terrain", mot: "santé", texte: "Terrain. Campagne, repos, santé : vos apparitions gagnent 300 DEF et guérissent de leurs états ; au début de chacun de vos tours, vous gagnez 300 points de vie. Tient 5 tours.", effets: [], terrain: { def: 300, lp: 300, duree: 5 } },
  10: { type: "apparition", niveau: 2, atk: 1100, def: 900, mot: "cadeaux", texte: "Cadeaux, ce qui arrive par faveur : quand elle est révélée, piochez une carte.", effets: [{ t: "piocher", n: 1 }] },

  // ---------- Lune ----------
  11: { type: "apparition", niveau: 7, atk: 2500, def: 1800, forte: true, mot: "malchance", texte: "Carte forte. La malchance : quand elle est révélée, toutes les apparitions adverses perdent 500 ATK.",
    effets: [{ t: "stat", atk: -500, def: 0, camp: "adverse", cible: "toutes" }] },
  12: { type: "presage", declencheur: "attaque", mot: "éloignement", texte: "Départ, éloignement : quand une apparition adverse attaque, renvoyez-la dans la main de son joueur.", effets: [{ t: "renvoyerAttaquant" }] },
  13: { type: "presage", declencheur: "invocation", mot: "versatile", texte: "Caractère versatile : quand l’adversaire invoque une apparition, elle échange son ATK et sa DEF et devient confuse.", effets: [{ t: "inverserInvoquee" }] },
  14: { type: "apparition", niveau: 2, atk: 1200, def: 700, mot: "découverte", texte: "Découverte, surveillance, espionnage : quand elle est révélée, vous voyez la main adverse.", effets: [{ t: "voir" }] },
  15: { type: "presage", declencheur: "invocation", mot: "passivité", texte: "La passivité : quand l’adversaire invoque une apparition, elle passe en défense, s’endort et ne pourra pas attaquer à son prochain tour.", effets: [{ t: "passiviteInvoquee" }] },
  16: { type: "influence", sousType: "terrain", mot: "foyer", texte: "Terrain. Le foyer, la maison, le lieu où l’on vit : un abri. Vos apparitions en défense gagnent 700 DEF. Tient 5 tours.", effets: [], terrain: { defDefense: 700, duree: 5 } },
  17: { type: "influence", mot: "remède", texte: "Malaise ou remède : sous 3000 points de vie, vous en regagnez 1000 ; sinon l’épidémie ôte 500 ATK à toutes les apparitions adverses et rend malade la plus forte.", effets: [{ t: "remede", v: 1000, seuil: 3000 }] },

  // ---------- Mercure ----------
  18: { type: "influence", mot: "changements", texte: "Changements, une lunaison : toutes les apparitions et tous les terrains retournent dans la main de leur joueur.", effets: [{ t: "lunaison" }] },
  19: { type: "influence", mot: "placements", texte: "Les placements : encaisser (500 points de vie) ou placer (1200 dans deux tours).",
    choix: [{ label: "Encaisser", effets: [{ t: "lp", v: 500 }] }, { label: "Placer", effets: [{ t: "differe", tours: 2, effets: [{ t: "lp", v: 1200 }] }] }] },
  20: { type: "apparition", niveau: 4, atk: 1500, def: 1700, mot: "savoir", texte: "Le savoir, les connaissances : quand elle est révélée, piochez une carte.", effets: [{ t: "piocher", n: 1 }] },
  21: { type: "apparition", niveau: 3, atk: 1300, def: 800, voleur: true, mot: "vol", texte: "Vol, perte : quand elle inflige des dégâts de combat, elle vole une carte au hasard dans la main adverse.", effets: [] },
  22: { type: "apparition", niveau: 3, atk: 1000, def: 1600, croissance: 300, mot: "projet", texte: "Projet en cours d’exécution : gagne 300 ATK à chacune de vos phases de pioche.", effets: [] },
  23: { type: "apparition", niveau: 3, atk: 1400, def: 1000, mot: "commerce", texte: "Trafic, commerce, négoce : quand elle est révélée, vous gagnez 400 points de vie.", effets: [{ t: "lp", v: 400 }] },
  24: { type: "presage", declencheur: "attaque", mot: "surprise", texte: "Arrivée inattendue, surprise : quand une apparition adverse attaque, une apparition de niveau 4 ou moins de votre main arrive en défense et reçoit l’attaque.", effets: [{ t: "renfortSurprise" }] },

  // ---------- Vénus ----------
  25: { type: "influence", sousType: "equipement", mot: "parures", texte: "Équipement. Les parures, les bijoux : votre apparition la plus forte gagne 300 ATK et 500 DEF tant qu’elle reste en jeu.", effets: [{ t: "stat", atk: 300, def: 500, camp: "soi", cible: "plusForte", equipement: true }] },
  26: { type: "presage", declencheur: "attaque", mot: "paix", texte: "La paix, concorde : quand une apparition adverse attaque, l’attaque est annulée et la phase de combat prend fin ; vous piochez une carte.", effets: [{ t: "annulerCombat" }] },
  27: { type: "apparition", niveau: 3, atk: 1500, def: 1200, mot: "retour", texte: "Union, réunion, retour : quand elle est révélée, la dernière carte de votre cimetière revient dans votre main.", effets: [{ t: "retourMain" }] },
  28: { type: "apparition", niveau: 4, atk: 1400, def: 1600, mot: "liens", texte: "Les liens du sang ou de l’esprit : quand elle est révélée, vos autres apparitions gagnent 400 DEF.", effets: [{ t: "stat", atk: 0, def: 400, camp: "soi", cible: "autres" }] },
  29: { type: "apparition", niveau: 3, atk: 1300, def: 1000, regain: 200, mot: "affection", texte: "L’affection : vous gagnez 200 points de vie à chacune de vos phases de pioche.", effets: [] },
  30: { type: "influence", sousType: "terrain", mot: "fêtes", texte: "Terrain. La table, les fêtes, les festins : vos apparitions gagnent 200 ATK ; au début de chacun de vos tours, vous gagnez 200 points de vie. Tient 5 tours.", effets: [], terrain: { atk: 200, lp: 200, duree: 5 } },
  31: { type: "apparition", niveau: 4, atk: 2200, def: 0, feuDePaille: true, mot: "emballement", texte: "Emballement, feu de paille : une grande force, mais elle est détruite à la fin du tour où elle a attaqué.", effets: [] },

  // ---------- Mars ----------
  32: { type: "apparition", niveau: 4, atk: 1600, def: 1000, mot: "jalousie", texte: "Jalousie, envie : quand elle est révélée, la plus forte apparition adverse perd 600 ATK.", effets: [{ t: "stat", atk: -600, def: 0, camp: "adverse", cible: "plusForte" }] },
  33: { type: "presage", declencheur: "attaque", mot: "procès", texte: "Procès, litiges : quand une apparition adverse attaque, pile ou face : l’attaquant est détruit, ou l’attaque se poursuit.", effets: [{ t: "litige" }] },
  34: { type: "apparition", niveau: 8, atk: 2800, def: 2400, forte: true, mot: "force majeure", texte: "Carte forte. La force majeure : quand elle est révélée, toutes les apparitions adverses passent en défense.", effets: [{ t: "defense", camp: "adverse" }] },
  35: { type: "apparition", niveau: 4, atk: 2000, def: 1300, declaree: true, mot: "attaques", texte: "Ennemis déclarés, attaques : ne peut pas être posée face cachée.", effets: [] },
  36: { type: "apparition", niveau: 2, atk: 1100, def: 1400, mot: "pourparlers", texte: "Pourparlers, conférences : quand elle est révélée, la plus forte apparition adverse ne peut pas attaquer à son prochain tour.", effets: [{ t: "bloquer", camp: "adverse", cible: "plusForte", tours: 1 }] },
  37: { type: "apparition", niveau: 4, atk: 1800, def: 600, percant: true, mot: "ardeur", texte: "L’ardeur : contre une apparition en défense, inflige la différence en dégâts. Quand elle est révélée, le feu brûle la plus forte apparition adverse.", effets: [{ t: "statut", etat: "brulure", camp: "adverse", cible: "plusForte" }] },
  38: { type: "apparition", niveau: 7, atk: 2600, def: 1500, forte: true, mot: "bouleversement", texte: "Carte forte. Le bouleversement, la destruction : quand elle est révélée, les apparitions adverses en défense sont détruites, et le terrain adverse est cassé.", effets: [{ t: "detruireDefense", camp: "adverse" }, { t: "casserTerrain", camp: "adverse" }] },

  // ---------- Jupiter ----------
  39: { type: "apparition", niveau: 6, atk: 2100, def: 2600, garde: true, mot: "protections", texte: "Protections, un personnage puissant : l’aigle garde. L’adversaire doit l’attaquer en premier.", effets: [] },
  40: { type: "influence", sousType: "continue", tours: 3, mot: "espérances", texte: "Continue (3 tours). Espérances qui se réaliseront par la suite : au début de chacun de vos tours, gagnez 300 points de vie et votre apparition la plus faible gagne 200 ATK.",
    effets: [{ t: "lp", v: 300 }, { t: "stat", atk: 200, def: 0, camp: "soi", cible: "plusFaible" }] },
  41: { type: "apparition", niveau: 4, atk: 1500, def: 1500, mot: "legs", texte: "Legs, les ancêtres, les choses du passé : quand elle est révélée, l’apparition la plus forte de votre cimetière revient sur le terrain.", effets: [{ t: "heritage" }] },
  42: { type: "apparition", niveau: 7, atk: 2000, def: 3000, forte: true, moderation: true, mot: "prudence", texte: "Carte forte. Prudence, modération : tant qu’elle est face recto, les dégâts de combat que vous subissez sont divisés par deux.", effets: [] },
  43: { type: "apparition", niveau: 4, atk: 1800, def: 1400, mot: "opinion", texte: "L’opinion, selon les cartes d’accompagnement : quand elle est révélée, l’adversaire perd 300 points de vie par apparition que vous contrôlez.", effets: [{ t: "degatsParAllie", v: 300 }] },
  44: { type: "influence", mot: "occasion", texte: "Une occasion : miser (pile ou face : 1500 points de dégâts à l’un ou à l’autre) ou passer.",
    choix: [{ label: "Miser", effets: [{ t: "hasard", v: 1500 }] }, { label: "Passer", effets: [] }] },
  45: { type: "apparition", niveau: 4, atk: 1600, def: 1600, mot: "bonheur", texte: "Le bonheur, vocation réalisée : quand elle est révélée, vous gagnez 800 points de vie.", effets: [{ t: "lp", v: 800 }] },

  // ---------- Saturne ----------
  46: { type: "apparition", niveau: 2, atk: 900, def: 800, mot: "afflictions", texte: "Afflictions, infirmités : quand elle est révélée, toutes les apparitions adverses perdent 300 ATK et 300 DEF.", effets: [{ t: "stat", atk: -300, def: -300, camp: "adverse", cible: "toutes" }] },
  47: { type: "presage", declencheur: "influence", mot: "tentatives vaines", texte: "Stérilité, tentatives vaines : quand l’adversaire active une influence, elle ne produit rien.", effets: [{ t: "annulerInfluence" }] },
  48: { type: "apparition", niveau: 8, atk: 3000, def: 2500, forte: true, mot: "fin", texte: "Carte forte. L’échéance inéluctable, la fin : quand elle est révélée, détruisez une apparition adverse en défense ou face cachée.", effets: [{ t: "detruire", camp: "adverse", cible: "defense" }] },
  49: { type: "apparition", niveau: 3, atk: 1200, def: 1200, mot: "revirement", texte: "Revirement favorable : quand elle est révélée, vous gagnez 600 points de vie et vos apparitions guérissent de leurs états.", effets: [{ t: "lp", v: 600 }, { t: "guerir", camp: "soi" }] },
  50: { type: "presage", declencheur: "attaque", mot: "échec", texte: "Échec, faillite : quand une apparition adverse attaque, elle est détruite.", effets: [{ t: "detruireAttaquant" }] },
  51: { type: "presage", declencheur: "attaque", mot: "retard", texte: "Retard, délai : quand une apparition adverse attaque, l’attaque est annulée et elle ne pourra plus attaquer pendant deux tours.", effets: [{ t: "retarderAttaquant", tours: 2 }] },
  52: { type: "influence", sousType: "terrain", mot: "repliement", texte: "Terrain. Claustration, repliement sur soi : le Cloître arrête. Vos apparitions gagnent 900 DEF mais ne peuvent pas attaquer tant qu’il demeure (3 tours).", effets: [], terrain: { def: 900, sansAttaque: true, duree: 3 } },

  // ---------- Hors jeu d'Edmond ----------
  0: { type: "influence", mot: "remplacement", texte: "Carte de remplacement : rejoue la dernière influence de votre cimetière.", effets: [{ t: "remplacer" }] }
};

/** Nombre de sacrifices qu'exige une apparition (définition `x` ou numéro). */
function sacrificesRequis(idOuDef) {
  const n = (typeof idOuDef === "object" ? idOuDef : DUEL[idOuDef])?.niveau || 0;
  return n >= 7 ? 2 : n >= 5 ? 1 : 0;
}

return { DUEL, sacrificesRequis };
})();

// ===== js/data/accords.js =====
M["js/data/accords.js"] = (() => {
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

const FIGURES = {
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
function figuresDebloquees(regles) {
  const connue = id => (regles instanceof Set ? regles.has(id) : !!regles?.[id]);
  return Object.keys(FIGURES).map(Number).filter(f => FIGURES[f].regles.some(connue));
}

return { FIGURES, figuresDebloquees };
})();

// ===== js/data/gardiens.js =====
M["js/data/gardiens.js"] = (() => {
// Les Sept Gardiens : une campagne, un adversaire par planète, dans l'ordre d'Edmond.
// Création de jeu (signalée). Chaque Gardien joue un deck à la couleur de sa planète, sur le terrain de sa
// planète, avec un style (profil de l'Ombre) ; vaincu, il enseigne les règles de Belline où entrent ses cartes
// (et donc les figures d'accord correspondantes).
//   profil : { hasard (part de coups au hasard : la difficulté), agressif (goût de l'attaque), soin (goût des points de vie) }
const { CARTES } = M["js/data/cartes.js"];
const { VOISINAGE } = M["js/data/voisinage.js"];

const PROFILS = {
  novice: { nom: "Novice", hasard: 0.65, agressif: 1, soin: 1 },
  adepte: { nom: "Adepte", hasard: 0.3, agressif: 1, soin: 1 },
  mage: { nom: "Mage", hasard: 0, agressif: 1.1, soin: 0.8 }
};

const GARDIENS = [
  { famille: "soleil", nom: "Le Gardien du Soleil", style: "Généreux et lumineux : il récompense, protège, et se fie à ses amis.", profil: { hasard: 0.4, agressif: 0.9, soin: 1.2 } },
  { famille: "lune", nom: "La Gardienne de la Lune", style: "Changeante : elle se dérobe, éloigne vos apparitions et vous prend à revers.", profil: { hasard: 0.32, agressif: 0.9, soin: 1 } },
  { famille: "mercure", nom: "Le Gardien de Mercure", style: "Marchand et voleur : il pioche, échange, et vous dépouille.", profil: { hasard: 0.25, agressif: 1, soin: 0.9 } },
  { famille: "venus", nom: "La Gardienne de Vénus", style: "Elle unit et embellit ; ses apparitions se renforcent les unes les autres.", profil: { hasard: 0.18, agressif: 0.9, soin: 1.1 } },
  { famille: "mars", nom: "Le Gardien de Mars", style: "Ardent : il attaque sans relâche, perce les défenses.", profil: { hasard: 0.1, agressif: 1.4, soin: 0.6 } },
  { famille: "jupiter", nom: "Le Gardien de Jupiter", style: "Puissant et prudent : il protège, attend son heure, et frappe fort.", profil: { hasard: 0.05, agressif: 1, soin: 1 } },
  { famille: "saturne", nom: "Le Gardien de Saturne", style: "Le temps est de son côté : il retarde, épuise, et conclut.", profil: { hasard: 0, agressif: 1.1, soin: 0.8 } }
];

/** Deck d'un Gardien : toutes les cartes de sa planète, le préambule, et des cartes d'autres planètes (35 cartes). */
function deckGardien(g, rng) {
  const siennes = CARTES.filter(c => c.famille === g.famille || c.famille === "preambule").map(c => c.id);
  const autres = CARTES.filter(c => !siennes.includes(c.id)).map(c => c.id);
  for (let i = autres.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [autres[i], autres[j]] = [autres[j], autres[i]]; }
  return [...siennes, ...autres.slice(0, 35 - siennes.length)];
}

/** Règles de Belline qu'enseigne un Gardien vaincu : celles où entre une carte de sa planète. */
function reglesEnseignees(g) {
  const ids = new Set(CARTES.filter(c => c.famille === g.famille).map(c => c.id));
  return VOISINAGE.filter(r => ids.has(r.a) || ids.has(r.b)).map(r => r.id);
}

return { PROFILS, GARDIENS, deckGardien, reglesEnseignees };
})();

// ===== js/data/techniques.js =====
M["js/data/techniques.js"] = (() => {
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

const ALIGNEMENTS = {
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

const ASSOCIATIONS = [
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

return { ALIGNEMENTS, ASSOCIATIONS };
})();

// ===== js/data/lectures.js =====
M["js/data/lectures.js"] = (() => {
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
const FAVORABLES = [4, 5, 6, 7, 8, 9, 10, 14, 16, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 39, 40, 41, 42, 45, 49, 0];
const NEFASTES = [11, 13, 17, 21, 32, 33, 34, 35, 38, 46, 47, 48, 50, 51];
/** « Les meilleures cartes » que la Trahison gâte (choix du jeu). */
const MEILLEURES = [5, 7, 10, 19, 39, 40, 41, 45, 49];

const ECHOS = [
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
const LECTURES = [
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
function definirDictionnaire(dict) { DICO = dict || null; }
const dictionnaireCharge = () => !!DICO;
/** La lecture de la paire « a puis b » dans le dictionnaire : { sens (1, -1, 0), dynamique, phrase }, ou null. */
function lectureDuDictionnaire(a, b) {
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
function accordDeLecture(a, b, nom) {
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

return { FAVORABLES, NEFASTES, MEILLEURES, ECHOS, LECTURES, definirDictionnaire, dictionnaireCharge, lectureDuDictionnaire, accordDeLecture };
})();

// ===== js/data/sorts.js =====
M["js/data/sorts.js"] = (() => {
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

const SORTS = {
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
const ETATS = {
  poison: { nom: "malade", signe: "☣", texte: "Malade (le malaise, l’épidémie) : perd 300 ATK à chacun des tours de son joueur." },
  brulure: { nom: "brûlée", signe: "♨", texte: "Brûlée (le feu) : 500 ATK de moins, et son joueur perd 200 points de vie à chacun de ses tours." },
  sommeil: { nom: "endormie", signe: "☾", texte: "Endormie (la passivité) : ne peut pas attaquer ; une chance sur deux de s’éveiller à chaque tour de son joueur." },
  confusion: { nom: "confuse", signe: "✺", texte: "Confuse (le caractère versatile) : une attaque sur deux échoue et blesse son joueur (300 points) ; une chance sur trois de s’en remettre à chaque tour." }
};

return { SORTS, ETATS };
})();

// ===== js/engine/hasard.js =====
M["js/engine/hasard.js"] = (() => {
// Générateur pseudo-aléatoire à graine (mulberry32). Module pur.
// Une même graine redonne le même chemin : « Chemin n° 4821 » peut se rejouer.

/**
 * Renvoie une fonction qui donne un nombre dans [0, 1[. Son état (`f.etat()`) se sauvegarde, et
 * `reprendreHasard(etat)` continue exactement la même suite (un duel enregistré reprend à l'identique).
 */
function creerHasard(graine) { return reprendreHasard(graine >>> 0); }
function reprendreHasard(etat) {
  let s = etat >>> 0;
  const f = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.etat = () => s;
  return f;
}

/** Une graine lisible, de 1 à 99 999. */
function nouvelleGraine(rng = Math.random) { return 1 + Math.floor(rng() * 99999); }

function melanger(tab, rng) {
  const t = tab.slice();
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}

function choisir(tab, rng) { return tab[Math.floor(rng() * tab.length)]; }

return { creerHasard, reprendreHasard, nouvelleGraine, melanger, choisir };
})();

// ===== js/engine/duel.js =====
M["js/engine/duel.js"] = (() => {
// Le Duel des Apparitions : moteur pur (aucun accès au DOM), testable sous Node.
//
// À la manière des jeux de cartes à duel. Chacun a 8000 points de vie et un deck de Belline (53 cartes, ou un
// deck composé), plus une réserve de figures d'accord. On tire 6 cartes ; pile ou face désigne qui commence.
// Le tour : pioche (le premier joueur ne pioche pas au premier tour), phase principale (une invocation normale
// ou une pose ; une figure d'accord ; influences ; présages posés ; changements de position), combat (pas au
// premier tour du duel), seconde phase principale, fin (main limitée à 7). On pioche 2 cartes par tour, sans dépasser 7.
//
// Combat : l'ATK de l'attaquant contre l'ATK de la cible (la plus faible est détruite, son joueur perd la
// différence ; égalité : les deux), ou contre sa DEF si elle défend (détruite sans dégâts, sauf « perçant » ;
// si la DEF tient, l'attaquant perd la différence). Plus d'apparition adverse : attaque directe.
// Les valeurs comptent l'affinité planétaire (+200 ATK par autre apparition face recto de même planète)
// et le terrain (+300 ATK et DEF aux apparitions de la planète du duel).
//
// Ajouts de jeu (signalés) : accords de Belline (deux cartes révélées à la suite qui forment une règle :
// favorable, +800 points de vie et une carte ; néfaste, 800 points de dégâts à l'adversaire) ; figures d'accord ;
// influences posées face cachée (révélées à partir du tour suivant) ; techniques : alignements planétaires et
// associations (js/data/techniques.js) ; sorts de Belline (chaque règle de la notice a son effet, js/data/sorts.js) ;
// évolution (Digimon, Pokémon : une apparition évolue en une plus haute de sa planète) ; états (poison, brûlure,
// sommeil, confusion) ; affinités entre planètes (chacune domine la suivante dans l'ordre d'Edmond : +500 ATK) ;
// combos (plusieurs accords dans un même tour) ; fin au 40e tour (la Fatalité : l'échéance inéluctable) ;
// mécaniques dévoilées pas à pas dans la campagne (`d.mec`).
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { DUEL, sacrificesRequis } = M["js/data/duel.js"];
const { FIGURES } = M["js/data/accords.js"];
const { ALIGNEMENTS, ASSOCIATIONS } = M["js/data/techniques.js"];
const { accordDeLecture } = M["js/data/lectures.js"];
const { SORTS } = M["js/data/sorts.js"];
const { VOISINAGE, reglesDeclenchees } = M["js/data/voisinage.js"];
const { melanger } = M["js/engine/hasard.js"];

const OFFRANDE = 1500;
const LP = 8000, MAIN_INITIALE = 6, ZONES = 5, MAIN_MAX = 7, PIOCHE_TOUR = 2, ACCORD = 1000, LIMITE = 40, AVANTAGE = 500, AFFINITE = 200, TERRAIN = 300;
const TOUS = Object.keys(DUEL).map(Number);
const REGLE = Object.fromEntries(VOISINAGE.map(r => [r.id, r]));
const adversaire = j => 1 - j;
const PLANETES = ["soleil", "lune", "mercure", "venus", "mars", "jupiter", "saturne"];
/** Les mécaniques avancées ; la campagne les dévoile une à une (toutes en duel libre). */
const MECANIQUES = ["poseInfluence", "evolution", "techniques", "figures", "accordsTerrain"];
let compteurUid = 1;

/** Définition de duel d'une carte ou d'une figure d'accord. */
const def = id => (id >= 100 ? FIGURES[id] : DUEL[id]);
/** Nom d'une carte ou d'une figure. */
const nomDe = id => (id >= 100 ? FIGURES[id].nom : CARTE_PAR_ID[id].nom);
/** Planète d'une carte (les figures n'en ont pas). */
const familleDe = id => (id >= 100 ? null : CARTE_PAR_ID[id].famille);

function joueur(nom, consultant, deck, reserve, profil, rng) {
  const pioche = melanger(deck, rng);
  return {
    nom, consultant, lp: LP, pioche, main: pioche.splice(0, MAIN_INITIALE), reserve: [...reserve], profil,
    monstres: Array(ZONES).fill(null), presages: Array(ZONES).fill(null), cimetiere: [],
    invocationFaite: false, fusionFaite: false, derniere: null, doubler: false, annuleProchaine: false,
    sterile: false, voitMain: false, differes: [], reveles: [], techniques: [], techniqueFaite: false,
    accordsFaits: [], accordTerrainFait: false, terrainCarte: null, combo: 0, evolutionFaite: false
  };
}

/**
 * Nouveau duel. options : { premier (0 | 1 ; sinon pile ou face), decks: [ids, ids], reserves: [[figures], [figures]],
 * terrain (une famille ou null), profils: [null, profil] }.
 */
function creerDuel(rng, consultant = "homme", options = {}) {
  const decks = options.decks || [TOUS, TOUS];
  const reserves = options.reserves || [[], []];
  const premier = options.premier ?? (rng() < 0.5 ? 0 : 1);
  return {
    joueurs: [
      joueur("Vous", consultant, decks[0], reserves[0], null, rng),
      joueur(options.nomAdverse || "L’Ombre", consultant === "homme" ? "femme" : "homme", decks[1], reserves[1], options.profils?.[1] || null, rng)
    ],
    actif: premier, premier, tour: 1, phase: "principale1", fini: false, gagnant: null, terrain: options.terrain ?? null,
    mec: Object.fromEntries(MECANIQUES.map(k => [k, options.mecaniques ? options.mecaniques.includes(k) : true])), limite: options.limite ?? LIMITE
  };
}

function apparitionDe(id, d = null) {
  const x = def(id);
  return {
    uid: compteurUid++, id, niveau: x.niveau, atk: x.atk, def: x.def,
    position: "attaque", faceCachee: false, aAttaque: false, changeFait: false, invoqueTour: d ? d.tour : 0,
    bloque: 0, protege: !!x.protege, attaqueCeTour: false, equipements: []
  };
}

const monstres = J => J.monstres.map((m, place) => ({ m, place })).filter(x => x.m);
const placeLibre = zone => zone.findIndex(x => !x);
const capacite = (m, nom) => !m.faceCachee && !!def(m.id)[nom];

/** ATK et DEF en jeu : valeurs propres, affinité planétaire, terrain. */
function atkEffectif(d, j, m) {
  if (!m) return 0;
  const f = familleDe(m.id);
  let v = m.atk + (terrainDe(d.joueurs[j])?.atk || 0) * (m.faceCachee ? 0 : 1);
  if (!m.faceCachee && f) {
    v += AFFINITE * monstres(d.joueurs[j]).filter(x => x.m !== m && !x.m.faceCachee && familleDe(x.m.id) === f).length;
    if (d.terrain === f) v += TERRAIN;
  }
  if (m.statut === "brulure" && !m.faceCachee) v -= 500;
  return Math.max(0, v);
}

/** L'affinité entre planètes : chacune domine la suivante dans l'ordre d'Edmond (Saturne domine le Soleil). */
function domine(idA, idB) {
  const a = PLANETES.indexOf(familleDe(idA)), b = PLANETES.indexOf(familleDe(idB));
  return a >= 0 && b >= 0 && b === (a + 1) % 7;
}
/** L'ATK d'un attaquant contre une cible : avec l'avantage de planète si la cible est visible. */
function atkContre(d, j, A, T) { return atkEffectif(d, j, A) + (T && !T.faceCachee && domine(A.id, T.id) ? AVANTAGE : 0); }
function defEffectif(d, j, m) {
  if (!m) return 0;
  const t = terrainDe(d.joueurs[j]);
  const lieu = (t?.def || 0) + (m.position === "defense" ? t?.defDefense || 0 : 0);
  return Math.max(0, m.def + lieu + (!m.faceCachee && d.terrain && familleDe(m.id) === d.terrain ? TERRAIN : 0));
}

/** Le terrain qu'un joueur a posé de son côté : ses valeurs ({ atk, def, defDefense, lp, sansAttaque }) ou null. */
function terrainDe(J) { return J.terrainCarte != null ? def(J.terrainCarte).terrain : null; }

function casserTerrain(d, k, ev, versMainAussi = false) {
  const K = d.joueurs[k], id = K.terrainCarte;
  if (id == null) return;
  K.terrainCarte = null;
  if (versMainAussi) { K.main.push(id); ev.push({ type: "terrainRetour", j: k, id }); }
  else { K.cimetiere.push(id); ev.push({ type: "terrainCasse", j: k, id }); }
}

function finSiBesoin(d, ev) {
  if (d.fini) return;
  const [a, b] = d.joueurs;
  if (a.lp <= 0 || b.lp <= 0) {
    d.fini = true;
    d.gagnant = a.lp <= 0 && b.lp <= 0 ? null : a.lp <= 0 ? 1 : 0;
    ev.push({ type: "fin", gagnant: d.gagnant });
  }
}

function changerLP(d, j, v, ev, pourquoi = "") {
  v = Math.round(v);
  if (!v) return;
  const J = d.joueurs[j];
  J.lp = Math.max(0, J.lp + v);
  ev.push({ type: "lp", j, v, lp: J.lp, pourquoi });
}

function piocher(d, j, n, ev) {
  const J = d.joueurs[j];
  for (let k = 0; k < n; k++) {
    if (!J.pioche.length) { ev.push({ type: "texte", j, texte: `${J.nom} ne peut plus piocher : le jeu est épuisé.` }); J.lp = 0; finSiBesoin(d, ev); return; }
    const id = J.pioche.shift();
    J.main.push(id);
    ev.push({ type: "pioche", j, id });
  }
}

/** Une carte quitte le terrain pour le cimetière (une figure retourne dans la réserve ; ses équipements suivent). */
function auCimetiere(d, j, zone, place, ev, pourquoi = "detruite") {
  const J = d.joueurs[j], x = J[zone][place];
  if (!x) return;
  J[zone][place] = null;
  if (x.id >= 100) J.reserve.push(x.id); else J.cimetiere.push(x.id);
  for (const e of x.equipements || []) J.cimetiere.push(e);
  ev.push({ type: pourquoi, j, place, zone, id: x.id });
}

function versMain(d, j, zone, place, ev) {
  const J = d.joueurs[j], x = J[zone][place];
  J[zone][place] = null;
  if (x.id >= 100) J.reserve.push(x.id); else J.main.push(x.id);
  for (const e of x.equipements || []) J.cimetiere.push(e);
  ev.push({ type: "renvoi", j, place, id: x.id });
}

function choisirCibles(d, k, liste, cible, rng, nouvelle = null) {
  if (!liste.length) return [];
  if (cible === "toutes") return liste;
  if (cible === "nouvelle") return liste.filter(x => x.place === nouvelle);
  if (cible === "autres") return liste.filter(x => x.place !== nouvelle);
  if (cible === "aleatoire") return [liste[Math.floor(rng() * liste.length)]];
  if (cible === "defense") {
    const def = liste.filter(x => x.m.position === "defense" || x.m.faceCachee);
    if (!def.length) return [];
    return [def.sort((u, v) => defEffectif(d, k, v.m) - defEffectif(d, k, u.m))[0]];
  }
  const force = x => (x.m.position === "attaque" ? atkEffectif(d, k, x.m) : defEffectif(d, k, x.m)) + x.m.atk * 0.01;
  const tri = [...liste].sort((u, v) => force(v) - force(u));
  return [cible === "plusFaible" ? tri[tri.length - 1] : tri[0]];
}

/** Révèle une apparition (invocation face recto, ou retournement) : ses effets s'appliquent. */
/** Une carte révélée compte pour les associations. */
function noterRevelee(J, id) { if (id < 100 && !J.reveles.includes(id)) J.reveles.push(id); }

function reveler(d, j, place, ev, rng, mult = 1) {
  const m = d.joueurs[j].monstres[place];
  if (!m) return;
  m.faceCachee = false;
  noterRevelee(d.joueurs[j], m.id);
  for (const e of def(m.id).effets) { appliquer({ d, j, rng, ev, mult, nouvelle: place, prec: null, idCarte: m.id }, e); if (d.fini) return; }
}

/** Applique un effet. ctx : { d, j, rng, ev, mult, nouvelle (emplacement), prec ({ id, choix }), idCarte }. */
function appliquer(ctx, e) {
  const { d, j, rng, ev } = ctx;
  const J = d.joueurs[j], o = adversaire(j), O = d.joueurs[o];
  const n = x => Math.round(x * ctx.mult);
  const camp = c => (c === "soi" ? j : o);
  switch (e.t) {
    case "lp": changerLP(d, j, e.v > 0 ? n(e.v) : e.v, ev); break;
    case "degats": changerLP(d, o, -n(e.v), ev); break;
    case "degatsParAllie": changerLP(d, o, -n(e.v * monstres(J).length), ev, "l’opinion"); break;
    case "reussite": changerLP(d, j, n(300 + 50 * J.cimetiere.length), ev, "récompense"); break;
    case "stat": {
      const k = camp(e.camp);
      for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng, k === j ? ctx.nouvelle : null)) {
        x.m.atk = Math.max(0, x.m.atk + n(e.atk)); x.m.def = Math.max(0, x.m.def + n(e.def));
        if (e.equipement) x.m.equipements.push(ctx.idCarte);
        ev.push({ type: e.atk + e.def >= 0 ? "renfort" : "affaibli", j: k, place: x.place, equipement: !!e.equipement });
      }
      break;
    }
    case "retablir":
      for (const x of monstres(J)) {
        const base = def(x.m.id);
        if (x.m.atk < base.atk || x.m.def < base.def) { x.m.atk = Math.max(x.m.atk, base.atk); x.m.def = Math.max(x.m.def, base.def); ev.push({ type: "renfort", j, place: x.place }); }
      }
      break;
    case "defense": {
      const k = camp(e.camp);
      for (const x of monstres(d.joueurs[k])) if (x.m.position === "attaque") { x.m.position = "defense"; ev.push({ type: "position", j: k, place: x.place }); }
      break;
    }
    case "bloquer": {
      const k = camp(e.camp);
      for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng)) { x.m.bloque = Math.max(x.m.bloque, e.tours); ev.push({ type: "bloque", j: k, place: x.place }); }
      break;
    }
    case "detruire": { const k = camp(e.camp); for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng)) auCimetiere(d, k, "monstres", x.place, ev); break; }
    case "renvoyer": { const k = camp(e.camp); for (const x of choisirCibles(d, k, monstres(d.joueurs[k]), e.cible, rng)) versMain(d, k, "monstres", x.place, ev); break; }
    case "detruireDefense":
      for (const k of e.camp ? [camp(e.camp)] : [j, o]) for (const x of monstres(d.joueurs[k])) if ((x.m.position === "defense" || x.m.faceCachee) && !(k === j && x.place === ctx.nouvelle)) auCimetiere(d, k, "monstres", x.place, ev);
      break;
    case "detruireFaibles":
      for (const x of monstres(O)) if (x.m.position === "attaque" && !x.m.faceCachee && atkEffectif(d, o, x.m) <= e.seuil) auCimetiere(d, o, "monstres", x.place, ev);
      break;
    case "detruirePresages":
      O.presages.forEach((p, place) => { if (p && !p.continue) auCimetiere(d, o, "presages", place, ev); });
      break;
    case "lunaison":
      for (const k of [j, o]) for (const x of monstres(d.joueurs[k])) versMain(d, k, "monstres", x.place, ev);
      for (const k of [j, o]) casserTerrain(d, k, ev, true);
      break;
    case "piocher": piocher(d, j, n(e.n), ev); break;
    case "voir": J.voitMain = true; ev.push({ type: "texte", j, texte: `${J.nom} voit la main adverse.` }); break;
    case "voler": {
      if (!O.main.length) break;
      const id = O.main.splice(Math.floor(rng() * O.main.length), 1)[0];
      J.main.push(id); ev.push({ type: "vol", j, id });
      break;
    }
    case "defausser": case "defausserSoi": {
      const k = e.t === "defausser" ? o : j, K = d.joueurs[k];
      for (let i = 0; i < n(e.n) && K.main.length; i++) { const id = K.main.splice(Math.floor(rng() * K.main.length), 1)[0]; K.cimetiere.push(id); ev.push({ type: "defausse", j: k, id }); }
      break;
    }
    case "sterilite": O.sterile = true; ev.push({ type: "texte", j, texte: `${O.nom} ne piochera pas à son prochain tour.` }); break;
    case "differe": J.differes.push({ tours: e.tours, effets: e.effets, mult: ctx.mult }); ev.push({ type: "texte", j, texte: "Une espérance se réalisera par la suite." }); break;
    case "retourMain": {
      const id = J.cimetiere.pop();
      if (id == null) ev.push({ type: "texte", j, texte: "Le cimetière est vide : rien ne revient." });
      else { J.main.push(id); ev.push({ type: "retour", j, id }); }
      break;
    }
    case "heritage": {
      const place = placeLibre(J.monstres);
      const ids = J.cimetiere.filter(id => def(id).type === "apparition");
      if (!ids.length || place < 0) { ev.push({ type: "texte", j, texte: "Le passé n’a rien à transmettre." }); break; }
      const id = ids.sort((u, v) => def(v).atk - def(u).atk)[0];
      J.cimetiere.splice(J.cimetiere.lastIndexOf(id), 1);
      J.monstres[place] = apparitionDe(id, d);
      ev.push({ type: "invocation", j, place, id, speciale: true });
      break;
    }
    case "doubler": J.doubler = true; ev.push({ type: "texte", j, texte: "La prochaine carte comptera double." }); break;
    case "annuler": O.annuleProchaine = true; ev.push({ type: "texte", j, texte: `La prochaine carte de ${O.nom} sera sans effet.` }); break;
    case "hasard": if (rng() < 0.5) changerLP(d, o, -n(e.v), ev, "le sort"); else changerLP(d, j, -n(e.v), ev, "le sort"); break;
    case "remede":
      if (J.lp < e.seuil) changerLP(d, j, n(e.v), ev, "le remède");
      else { appliquer(ctx, { t: "stat", atk: -500, def: 0, camp: "adverse", cible: "toutes" }); appliquer(ctx, { t: "statut", etat: "poison", camp: "adverse", cible: "plusForte" }); }
      break;
    case "rejouer": {
      const prec = ctx.prec;
      if (!prec || prec.id >= 100 || def(prec.id).type === "presage") { ev.push({ type: "texte", j, texte: "Aucune carte ne précède : l’Étoile n’a rien à recevoir." }); break; }
      const x = def(prec.id);
      const effets = x.choix ? x.choix[prec.choix ?? 0].effets : x.effets;
      const mienne = (ctx.idCarte === 2 ? "homme" : "femme") === J.consultant;
      const m2 = mienne ? ctx.mult : ctx.mult / 2;
      ev.push({ type: "texte", j, texte: `${nomDe(prec.id)} se rejoue${mienne ? "" : " à moitié (une influence)"}.` });
      // un effet rejoué ne déplace pas de carte : un équipement rejoué donne son bonus sans s'attacher une seconde fois
      for (const f of effets) if (f.t !== "rejouer" && f.t !== "remplacer") appliquer({ ...ctx, mult: m2, nouvelle: null, idCarte: prec.id }, { ...f, equipement: false });
      break;
    }
    case "casserTerrain": casserTerrain(d, camp(e.camp), ev); break;
    case "statut": {
      const k = camp(e.camp);
      for (const x of choisirCibles(d, k, monstres(d.joueurs[k]).filter(y => !y.m.faceCachee), e.cible, rng)) {
        x.m.statut = e.etat; ev.push({ type: "statut", j: k, place: x.place, id: x.m.id, etat: e.etat });
      }
      break;
    }
    case "guerir":
      for (const x of monstres(d.joueurs[camp(e.camp)])) if (x.m.statut) { x.m.statut = null; ev.push({ type: "gueri", j: camp(e.camp), place: x.place, id: x.m.id }); }
      break;
    case "terrain": d.terrain = e.famille; ev.push({ type: "terrain", j, famille: e.famille }); break;
    case "revelerAdverses":
      for (const x of monstres(O)) if (x.m.faceCachee) { x.m.faceCachee = false; noterRevelee(O, x.m.id); ev.push({ type: "retournee", j: o, place: x.place, id: x.m.id }); }
      break;
    case "proteger":
      for (const x of monstres(d.joueurs[camp(e.camp)])) if (!x.m.protege) { x.m.protege = true; ev.push({ type: "renfort", j: camp(e.camp), place: x.place }); }
      break;
    case "remplacer": {
      const id = [...J.cimetiere].reverse().find(k => def(k).type === "influence" && k !== 0 && !def(k).sousType);
      if (id == null) { ev.push({ type: "texte", j, texte: "Aucune influence à remplacer." }); break; }
      ev.push({ type: "texte", j, texte: `La Carte Bleue prend la place de ${nomDe(id)}.` });
      const x = def(id);
      for (const f of (x.choix ? x.choix[0].effets : x.effets)) if (f.t !== "remplacer" && f.t !== "rejouer") appliquer({ ...ctx, idCarte: id }, f);
      break;
    }
  }
}

/**
 * Accords entre la carte révélée et la précédente du même joueur. D'abord les règles de la notice (800 points) ;
 * sinon un écho, un accord d'accompagnement ou une lecture moderne (js/data/lectures.js).
 */
function accorder(d, j, prec, courante, ev) {
  if (!prec || prec.id >= 100 || courante.id >= 100) return;
  const a = accordEntre(prec, courante);
  if (a) accomplir(d, j, a, ev, false);
}

/** L'accord que forment deux cartes (`prec` puis `courante`, { id, choix }), ou null. Les règles de la notice d'abord. */
function accordEntre(prec, courante) {
  const r = reglesDeclenchees(prec, courante)[0];
  const ids = [prec.id, courante.id];
  if (r) return { texte: r.texte, favorable: r.effets.reduce((s, f) => s + (f.valeur ?? 0), 0) >= 0, regle: r.id, sorte: "belline", valeur: ACCORD, pioche: true, ids, sort: SORTS[r.id] || [] };
  const l = accordDeLecture(prec.id, courante.id, nomDe);
  return l ? { texte: l.texte, favorable: l.sens > 0, sorte: l.sorte, cle: l.cle, valeur: l.valeur, pioche: l.sorte !== "lecture", ids } : null;
}

function accomplir(d, j, a, ev, terrain = false, rng = Math.random) {
  const J = d.joueurs[j];
  J.combo++;
  const bonus = 200 * (J.combo - 1), valeur = a.valeur + bonus;
  ev.push({ type: "accord", j, texte: a.texte, favorable: a.favorable, regle: a.regle, sorte: a.sorte, cle: a.cle, terrain, ids: a.ids, combo: J.combo, valeur });
  if (a.favorable) { changerLP(d, j, valeur, ev, J.combo > 1 ? `combo ×${J.combo}` : "accord"); if (a.pioche) piocher(d, j, 1, ev); }
  else changerLP(d, adversaire(j), -valeur, ev, J.combo > 1 ? `combo ×${J.combo}` : "accord");
  // le sort de Belline : l'effet propre de la règle
  for (const e of a.sort || []) { if (d.fini) break; appliquer({ d, j, rng, ev, mult: 1, nouvelle: null, prec: null, idCarte: null }, e); }
  // une règle accomplie fait entrer sa figure dans la réserve
  if (a.regle && d.mec.figures) {
    const f = Object.keys(FIGURES).map(Number).find(k => FIGURES[k].regles.includes(a.regle));
    if (f != null && !J.reserve.includes(f) && !J.monstres.some(m => m?.id === f)) { J.reserve.push(f); ev.push({ type: "figureDebloquee", j, id: f }); }
  }
}

/**
 * Accords sur le terrain (ajout de jeu) : deux de vos cartes face visible en jeu (apparitions, influences continues)
 * qui forment un accord peuvent l'accomplir sans être rejouées. Une fois par paire et par duel, un par tour.
 * Renvoie [{ cle, a, b, texte, favorable, sorte, valeur }].
 */
function accordsTerrain(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || J.accordTerrainFait || !d.mec.accordsTerrain) return [];
  const ids = [...new Set([...J.monstres.filter(m => m && !m.faceCachee).map(m => m.id), ...J.presages.filter(p => p?.continue).map(p => p.id)])].filter(id => id < 100);
  const res = [];
  for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) {
    const [a, b] = [ids[x], ids[y]].sort((u, v) => u - v), cle = `${a}-${b}`;
    if (J.accordsFaits.includes(cle)) continue;
    const t = accordEntre({ id: a, choix: 0 }, { id: b, choix: 0 }) || accordEntre({ id: b, choix: 0 }, { id: a, choix: 0 });
    if (t) res.push({ ...t, cle, a, b });
  }
  return res;
}

function accomplirAccordTerrain(d, j, cle) {
  const t = accordsTerrain(d, j).find(x => x.cle === cle);
  if (!t) return [{ type: "refus", j, raison: "Cet accord n’est pas possible maintenant." }];
  const J = d.joueurs[j], ev = [];
  J.accordsFaits.push(cle); J.accordTerrainFait = true;
  accomplir(d, j, t, ev, true);
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Phase principale ----------

const enPrincipale = d => d.phase === "principale1" || d.phase === "principale2";

/** Peut-on invoquer (ou poser, si `pose`) l'apparition `index` de la main ? { ok, raison, sacrifices } */
function peutInvoquer(d, j, index, pose = false) {
  const J = d.joueurs[j], id = J.main[index];
  if (d.fini || d.actif !== j || !enPrincipale(d)) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "apparition") return { ok: false, raison: "Ce n’est pas une apparition." };
  if (J.invocationFaite) return { ok: false, raison: "Une seule invocation normale par tour." };
  if (pose && def(id).declaree) return { ok: false, raison: "Ennemis déclarés : elle ne peut pas être posée face cachée." };
  const s = sacrificesRequis(id), n = monstres(J).length;
  // l'offrande (ajout de jeu) : un sacrifice qui manque se remplace par des points de vie ; on n'est jamais bloqué
  const offrande = Math.max(0, s - n);
  if (offrande && J.lp <= offrande * OFFRANDE) return { ok: false, raison: `Il faut ${s} apparition${s > 1 ? "s" : ""} à sacrifier, ou ${offrande * OFFRANDE} points de vie d’offrande.`, sacrifices: s };
  if (s === 0 && placeLibre(J.monstres) < 0) return { ok: false, raison: "Vos cinq zones sont occupées." };
  return { ok: true, sacrifices: s - offrande, offrande };
}

/** Invocation normale (face recto, en attaque) ou pose (face cachée, en défense). options : { pose, sacrifices: [places] } */
function invoquer(d, j, index, options = {}, rng = Math.random) {
  const v = peutInvoquer(d, j, index, !!options.pose);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const ev = [], J = d.joueurs[j];
  let sacrifices = (options.sacrifices || []).filter(p => J.monstres[p]).slice(0, v.sacrifices);
  if (sacrifices.length < v.sacrifices) {
    const restants = monstres(J).filter(x => !sacrifices.includes(x.place)).sort((a, b) => (a.m.atk + a.m.def) - (b.m.atk + b.m.def));
    sacrifices = [...sacrifices, ...restants.slice(0, v.sacrifices - sacrifices.length).map(x => x.place)];
  }
  for (const p of sacrifices) { ev.push({ type: "sacrifice", j, place: p, id: J.monstres[p].id }); auCimetiere(d, j, "monstres", p, ev, "sacrifiee"); }
  if (v.offrande) changerLP(d, j, -v.offrande * OFFRANDE, ev, "offrande");
  const id = J.main.splice(index, 1)[0];
  const place = placeLibre(J.monstres);
  const m = apparitionDe(id, d);
  J.monstres[place] = m;
  J.invocationFaite = true;
  if (options.pose) { m.faceCachee = true; m.position = "defense"; ev.push({ type: "pose", j, place, id }); return ev; }
  ev.push({ type: "invocation", j, place, id });
  revelerJouee(d, j, place, ev, rng);
  return ev;
}

/** Révélation d'une apparition jouée face recto : Destinée (annulation, doublement), effets, accords. */
function revelerJouee(d, j, place, ev, rng) {
  const J = d.joueurs[j], m = J.monstres[place], prec = J.derniere;
  if (J.annuleProchaine) { J.annuleProchaine = false; m.faceCachee = false; ev.push({ type: "texte", j, texte: `La porte est fermée : l’effet de ${nomDe(m.id)} est annulé.` }); }
  else {
    let mult = 1;
    if (J.doubler) { J.doubler = false; mult = 2; ev.push({ type: "texte", j, texte: "Mise au premier plan : effet doublé." }); }
    reveler(d, j, place, ev, rng, mult);
    if (!d.fini) accorder(d, j, prec, { id: m.id, choix: null }, ev);
  }
  J.derniere = { id: m.id, choix: null };
  finSiBesoin(d, ev);
}

/** Peut-on activer l'influence `index` ? */
/** Un terrain se pose aussi pendant votre phase de combat, au moment d'attaquer (ajout de jeu). */
const momentTerrain = d => enPrincipale(d) || d.phase === "combat";

function peutActiver(d, j, index, horsTour = false) {
  const J = d.joueurs[j], id = J.main[index];
  const terrain = id != null && def(id)?.sousType === "terrain";
  if (d.fini || (!horsTour && (d.actif !== j || !(terrain ? momentTerrain(d) : enPrincipale(d))))) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "influence") return { ok: false, raison: "Ce n’est pas une influence." };
  const x = def(id);
  if (x.sousType === "equipement" && !monstres(J).length) return { ok: false, raison: "Équipement : il faut une apparition à équiper." };
  if (x.sousType === "continue" && placeLibre(J.presages) < 0) return { ok: false, raison: "Il faut une zone de présage libre." };
  return { ok: true };
}

/**
 * Active une influence depuis la main. options : { choix, contre } ; `contre` : emplacement du présage
 * (déclencheur 'influence') que l'adversaire active en réponse : c'est une chaîne.
 */
function activer(d, j, index, options = {}, rng = Math.random) {
  const v = peutActiver(d, j, index, !!options.horsTour);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const ev = [], J = d.joueurs[j], o = adversaire(j);
  const id = J.main.splice(index, 1)[0], x = def(id);
  const choix = x.choix ? Math.max(0, Math.min(x.choix.length - 1, options.choix ?? 0)) : null;
  const prec = J.derniere;
  ev.push({ type: "influence", j, id, choix, maillon: 1, revelee: !!options.revelee });
  noterRevelee(J, id);
  J.derniere = { id, choix };
  if (options.contre != null && presagesActivables(d, o, "influence").includes(options.contre)) {
    const e = activerPresage(d, o, options.contre, ev, 2);
    if (e && e.t === "annulerInfluence") {
      ev.push({ type: "texte", j: o, texte: `Tentatives vaines : ${nomDe(id)} ne produit rien.` });
      J.cimetiere.push(id); finSiBesoin(d, ev); return ev;
    }
  }
  if (J.annuleProchaine) {
    J.annuleProchaine = false;
    ev.push({ type: "texte", j, texte: `La porte est fermée : ${nomDe(id)} reste sans effet.` });
    J.cimetiere.push(id); return ev;
  }
  let mult = 1;
  if (J.doubler && id !== 1) { J.doubler = false; mult = 2; ev.push({ type: "texte", j, texte: "Mise au premier plan : effet doublé." }); }
  if (x.sousType === "terrain") {
    if (J.terrainCarte != null) casserTerrain(d, j, ev);
    J.terrainCarte = id; J.terrainTours = x.terrain.duree;
    ev.push({ type: "terrainPose", j, id });
  } else if (x.sousType === "continue") {
    const place = placeLibre(J.presages);
    J.presages[place] = { uid: compteurUid++, id, continue: true, tours: x.tours, mult, poseTour: d.tour };
    ev.push({ type: "continue", j, place, id });
  } else {
    for (const e of (x.choix ? x.choix[choix].effets : x.effets)) { appliquer({ d, j, rng, ev, mult, nouvelle: null, prec, idCarte: id }, e); if (d.fini) break; }
    if (x.sousType !== "equipement") J.cimetiere.push(id);
  }
  if (!d.fini) accorder(d, j, prec, { id, choix }, ev);
  finSiBesoin(d, ev);
  return ev;
}

/** Pose un présage face cachée. */
function peutPoser(d, j, index) {
  const J = d.joueurs[j], id = J.main[index];
  if (d.fini || d.actif !== j || !enPrincipale(d)) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "presage") return { ok: false, raison: "Ce n’est pas un présage." };
  if (placeLibre(J.presages) < 0) return { ok: false, raison: "Vos cinq zones de présage sont occupées." };
  return { ok: true };
}
function poser(d, j, index) {
  const v = peutPoser(d, j, index);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const J = d.joueurs[j], id = J.main.splice(index, 1)[0], place = placeLibre(J.presages);
  J.presages[place] = { uid: compteurUid++, id, poseTour: d.tour };
  return [{ type: "posePresage", j, place, id }];
}

/**
 * Poser une influence face cachée dans une zone de présage (ajout de jeu) : l'adversaire ne sait pas si c'est
 * un présage ou une influence. Elle se révèle pendant une de vos phases principales, à partir du tour suivant.
 */
function peutPoserInfluence(d, j, index) {
  const J = d.joueurs[j], id = J.main[index];
  if (d.fini || d.actif !== j || !enPrincipale(d)) return { ok: false, raison: "Pas maintenant." };
  if (id == null || def(id).type !== "influence") return { ok: false, raison: "Ce n’est pas une influence." };
  if (!d.mec.poseInfluence) return { ok: false, raison: "Pas encore : un Gardien vous l’enseignera." };
  if (placeLibre(J.presages) < 0) return { ok: false, raison: "Vos cinq zones de présage sont occupées." };
  return { ok: true };
}
function poserInfluence(d, j, index) {
  const v = peutPoserInfluence(d, j, index);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const J = d.joueurs[j], id = J.main.splice(index, 1)[0], place = placeLibre(J.presages);
  J.presages[place] = { uid: compteurUid++, id, influence: true, poseTour: d.tour };
  return [{ type: "posePresage", j, place, id, influence: true }];
}
function peutRevelerInfluence(d, j, place) {
  const J = d.joueurs[j], p = J.presages[place];
  const terrain = p && def(p.id)?.sousType === "terrain";
  if (d.fini || d.actif !== j || !(terrain ? momentTerrain(d) : enPrincipale(d))) return { ok: false, raison: "Pas maintenant." };
  if (!p || !p.influence) return { ok: false, raison: "Ce n’est pas une influence posée." };
  if (p.poseTour >= d.tour) return { ok: false, raison: "Posée ce tour : elle se révélera à partir de votre prochain tour." };
  const x = def(p.id);
  if (x.sousType === "equipement" && !monstres(J).length) return { ok: false, raison: "Équipement : il faut une apparition à équiper." };
  return { ok: true };
}
/** Révèle une influence posée : elle s'active comme depuis la main (options : { choix, contre }). */
function revelerInfluence(d, j, place, options = {}, rng = Math.random) {
  const v = peutRevelerInfluence(d, j, place);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const J = d.joueurs[j], p = J.presages[place];
  J.presages[place] = null;
  J.main.push(p.id);
  const ev = activer(d, j, J.main.length - 1, { ...options, revelee: true }, rng);
  if (ev.length === 1 && ev[0].type === "refus") { J.main.pop(); J.presages[place] = p; }
  return ev;
}

/**
 * Magies en réponse (ajout de jeu, comme les magies jeu-rapide) : pendant le tour adverse, une influence posée
 * face cachée depuis au moins un tour peut être révélée en réponse (à une attaque, avant le choc). Les terrains
 * ne se révèlent qu'à son tour.
 */
function influencesEnReponse(d, k) {
  const K = d.joueurs[k];
  if (d.fini || d.actif === k) return [];
  return K.presages.map((p, place) => ({ p, place }))
    .filter(x => x.p?.influence && x.p.poseTour < d.tour)
    .filter(x => def(x.p.id).sousType !== "equipement" || monstres(K).length)
    .map(x => x.place);
}
function revelerEnReponse(d, k, place, options = {}, rng = Math.random) {
  if (!influencesEnReponse(d, k).includes(place)) return [{ type: "refus", j: k, raison: "Cette carte ne peut pas répondre maintenant." }];
  const K = d.joueurs[k], p = K.presages[place];
  K.presages[place] = null;
  K.main.push(p.id);
  const ev = activer(d, k, K.main.length - 1, { choix: options.choix, revelee: true, horsTour: true }, rng);
  if (ev.length === 1 && ev[0].type === "refus") { K.main.pop(); K.presages[place] = p; }
  else ev.unshift({ type: "texte", j: k, texte: `${K.nom} répond par une influence posée.` });
  return ev;
}

/**
 * Terrains en réponse (ajout de jeu) : pendant l'attaque adverse, un terrain de votre main peut être posé avant le
 * choc (les Pénates abritent vos défenseurs, le Cloître…) ; un terrain posé face cachée se révèle aussi
 * (`influencesEnReponse`). Renvoie les index de la main.
 */
function terrainsEnReponse(d, k) {
  if (d.fini || d.actif === k) return [];
  return d.joueurs[k].main.map((id, index) => ({ id, index })).filter(x => def(x.id).sousType === "terrain").map(x => x.index);
}
function poserTerrainEnReponse(d, k, index, rng = Math.random) {
  if (!terrainsEnReponse(d, k).includes(index)) return [{ type: "refus", j: k, raison: "Ce terrain ne peut pas être posé maintenant." }];
  const ev = activer(d, k, index, { horsTour: true }, rng);
  if (!(ev.length === 1 && ev[0].type === "refus")) ev.unshift({ type: "texte", j: k, texte: `${d.joueurs[k].nom} pose un terrain en réponse.` });
  return ev;
}

/** Après une reprise (duel enregistré) : les nouveaux identifiants ne doivent pas croiser les anciens. */
function preparerReprise(d) {
  let max = 0;
  for (const J of d.joueurs) for (const x of [...J.monstres, ...J.presages]) if (x?.uid > max) max = x.uid;
  compteurUid = Math.max(compteurUid, max + 1);
  return d;
}

/**
 * L'Ombre répond-elle à une attaque par une influence posée ? Renvoie { place, choix } ou null.
 * Elle compare la suite de l'attaque avec et sans sa réponse.
 */
function influenceOmbre(d, k, contexte, profil = d.joueurs[k].profil) {
  const dispo = influencesEnReponse(d, k), terrains = terrainsEnReponse(d, k);
  if ((!dispo.length && !terrains.length) || (profil?.hasard ?? 0) > 0.5) return null;
  const j = adversaire(k);
  const apres = s => { if (ciblesAttaque(s, j, contexte.place).includes(contexte.cible)) attaquer(s, j, contexte.place, contexte.cible, neutre, null); return evaluer(s, k); };
  const base = apres(copie(d));
  let meilleur = null, gain = 2;
  for (const place of dispo) {
    const x = def(d.joueurs[k].presages[place].id);
    for (const choix of (x.choix ? x.choix.map((_, i) => i) : [null])) {
      const s = copie(d);
      revelerEnReponse(s, k, place, { choix }, neutre);
      const v = apres(s) - base;
      if (v > gain) { gain = v; meilleur = { place, choix }; }
    }
  }
  for (const index of terrains) {
    const s = copie(d);
    poserTerrainEnReponse(s, k, index, neutre);
    const v = apres(s) - base;
    if (v > gain) { gain = v; meilleur = { main: index }; }
  }
  return meilleur;
}

// ---------- Techniques : alignements et associations ----------

const planetesRevelees = J => new Set(J.reveles.map(familleDe).filter(f => PLANETES.includes(f))).size;

/** Avancement d'une association : [cartes révélées, cartes requises]. */
function avancementAssociation(J, a) {
  if (a.planetes) return [planetesRevelees(J), a.planetes];
  return [a.cartes.filter(id => J.reveles.includes(id)).length, a.parmi ?? a.cartes.length];
}
function associationComplete(J, a) { const [n, requis] = avancementAssociation(J, a); return n >= requis; }

/** Techniques utilisables maintenant : [{ cle, sorte: 'alignement' | 'association', nom, texte, famille?, places? }]. */
function techniquesPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || J.techniqueFaite || !d.mec.techniques) return [];
  const res = [];
  for (const f of PLANETES) {
    const places = monstres(J).filter(x => !x.m.faceCachee && familleDe(x.m.id) === f).map(x => x.place);
    if (places.length >= 3) res.push({ cle: `alignement:${f}`, sorte: "alignement", famille: f, places, ...ALIGNEMENTS[f] });
  }
  for (const a of ASSOCIATIONS) if (!J.techniques.includes(a.id) && associationComplete(J, a)) res.push({ cle: `association:${a.id}`, sorte: "association", ...a });
  return res;
}

/** Utilise une technique (`cle` : 'alignement:soleil', 'association:freins'...). */
function utiliserTechnique(d, j, cle, rng = Math.random) {
  const t = techniquesPossibles(d, j).find(x => x.cle === cle);
  if (!t) return [{ type: "refus", j, raison: "Cette technique n’est pas possible maintenant." }];
  const J = d.joueurs[j], ev = [];
  J.techniqueFaite = true;
  if (t.sorte === "association") J.techniques.push(t.id);
  ev.push({ type: "technique", j, cle, sorte: t.sorte, nom: t.nom, texte: t.texte, famille: t.famille ?? null, places: t.places ?? [], cartes: t.cartes ?? [] });
  const effets = t.sorte === "alignement" ? [{ t: "terrain", famille: t.famille }, ...t.effets] : t.effets;
  for (const e of effets) { appliquer({ d, j, rng, ev, mult: 1, nouvelle: null, prec: null, idCarte: null }, e); if (d.fini) break; }
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Évolution (ajout de jeu, à la manière de Digimon et Pokémon) ----------

/**
 * Une apparition face recto, en jeu depuis un tour au moins, peut évoluer en une apparition de votre main de la même
 * planète et de niveau plus haut (au plus trois de plus), sans sacrifice. Elle garde ses équipements, gagne 300 ATK
 * d'élan, perd ses états ; l'ancienne forme va au cimetière. Une évolution par tour.
 */
function evolutionsPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || !d.mec.evolution || J.evolutionFaite) return [];
  const res = [];
  J.main.forEach((id, index) => {
    const x = def(id);
    if (x.type !== "apparition") return;
    J.monstres.forEach((m, place) => {
      if (!m || m.faceCachee || m.id >= 100 || m.invoqueTour >= d.tour) return;
      if (familleDe(m.id) !== familleDe(id) || x.niveau <= m.niveau || x.niveau > m.niveau + 3) return;
      res.push({ index, place, id, de: m.id });
    });
  });
  return res;
}
function evoluer(d, j, index, place, rng = Math.random) {
  if (!evolutionsPossibles(d, j).some(e => e.index === index && e.place === place)) return [{ type: "refus", j, raison: "Cette évolution n’est pas possible." }];
  const J = d.joueurs[j], ancien = J.monstres[place], id = J.main.splice(index, 1)[0], ev = [];
  const m = apparitionDe(id, d);
  m.equipements = ancien.equipements; m.atk += 300; m.invoqueTour = ancien.invoqueTour; m.aAttaque = ancien.aAttaque; m.attaqueCeTour = ancien.attaqueCeTour;
  J.cimetiere.push(ancien.id);
  J.monstres[place] = m; J.evolutionFaite = true;
  ev.push({ type: "evolution", j, place, id, de: ancien.id });
  revelerJouee(d, j, place, ev, rng);
  return ev;
}

/** Changer de position (ou retourner une apparition face cachée : elle passe en attaque et se révèle). */
function peutChanger(d, j, place) {
  const m = d.joueurs[j].monstres[place];
  if (d.fini || d.actif !== j || !enPrincipale(d) || !m) return { ok: false, raison: "Pas maintenant." };
  if (m.invoqueTour === d.tour) return { ok: false, raison: "Elle vient d’arriver : elle ne change pas de position ce tour." };
  if (m.changeFait || m.attaqueCeTour) return { ok: false, raison: "Une seule fois par tour, et pas après avoir attaqué." };
  return { ok: true };
}
function changerPosition(d, j, place, rng = Math.random) {
  const v = peutChanger(d, j, place);
  if (!v.ok) return [{ type: "refus", j, raison: v.raison }];
  const m = d.joueurs[j].monstres[place], ev = [];
  m.changeFait = true;
  if (m.faceCachee) { m.position = "attaque"; ev.push({ type: "retournee", j, place, id: m.id }); revelerJouee(d, j, place, ev, rng); }
  else { m.position = m.position === "attaque" ? "defense" : "attaque"; ev.push({ type: "position", j, place }); }
  return ev;
}

// ---------- Figures d'accord ----------

function trouverMateriau(J, voulu, pris) {
  const ids = Array.isArray(voulu) ? voulu : [voulu];
  for (const id of ids) {
    const i = J.main.findIndex((x, k) => x === id && !pris.some(p => p.ou === "main" && p.index === k));
    if (i >= 0) return { ou: "main", index: i, id };
    const p = J.monstres.findIndex((m, k) => m && m.id === id && !pris.some(q => q.ou === "monstres" && q.place === k));
    if (p >= 0) return { ou: "monstres", place: p, id };
  }
  return null;
}

/** Figures d'accord invocables maintenant : [{ figure, materiaux: [{ ou, index | place, id }] }]. */
function fusionsPossibles(d, j) {
  const J = d.joueurs[j];
  if (d.fini || d.actif !== j || !enPrincipale(d) || J.fusionFaite || !d.mec.figures) return [];
  const res = [];
  for (const f of J.reserve) {
    const pris = [];
    for (const voulu of FIGURES[f].materiaux) { const m = trouverMateriau(J, voulu, pris); if (!m) break; pris.push(m); }
    if (pris.length < 2) continue;
    const libere = pris.filter(p => p.ou === "monstres").length;
    if (placeLibre(J.monstres) < 0 && !libere) continue;
    res.push({ figure: f, materiaux: pris });
  }
  return res;
}

/** Invoque une figure d'accord : ses deux cartes vont au cimetière, elle apparaît en attaque. */
function fusionner(d, j, figure, rng = Math.random) {
  const option = fusionsPossibles(d, j).find(f => f.figure === figure);
  if (!option) return [{ type: "refus", j, raison: "Cet accord n’est pas possible maintenant." }];
  const ev = [], J = d.joueurs[j], F = FIGURES[figure];
  ev.push({ type: "fusion", j, id: figure, materiaux: option.materiaux.map(m => m.id), texte: REGLE[F.regles[0]].texte, regle: F.regles[0] });
  for (const m of option.materiaux.filter(m => m.ou === "monstres")) auCimetiere(d, j, "monstres", m.place, ev, "materiau");
  for (const m of option.materiaux.filter(m => m.ou === "main").sort((a, b) => b.index - a.index)) { J.main.splice(m.index, 1); J.cimetiere.push(m.id); ev.push({ type: "defausse", j, id: m.id, materiau: true }); }
  J.reserve = J.reserve.filter(x => x !== figure);
  J.fusionFaite = true;
  const place = placeLibre(J.monstres);
  J.monstres[place] = apparitionDe(figure, d);
  ev.push({ type: "invocation", j, place, id: figure, speciale: true, figure: true });
  reveler(d, j, place, ev, rng);
  J.derniere = { id: figure, choix: null };
  finSiBesoin(d, ev);
  return ev;
}

// ---------- Combat ----------

function passerAuCombat(d) {
  if (d.fini || d.phase !== "principale1") return [];
  d.phase = "combat";
  return [{ type: "phase", phase: "combat" }];
}
function passerPrincipale2(d) {
  if (d.fini || d.phase !== "combat") return [];
  d.phase = "principale2";
  return [{ type: "phase", phase: "principale2" }];
}

/** Cibles d'une attaque : emplacements adverses (les gardiens d'abord), ou 'direct' si l'adversaire n'a plus d'apparition. */
function ciblesAttaque(d, j, place) {
  const m = d.joueurs[j].monstres[place];
  if (d.fini || d.actif !== j || d.phase !== "combat" || !m || d.tour === 1) return [];
  if (m.position !== "attaque" || m.faceCachee || m.aAttaque || m.bloque > 0 || m.statut === "sommeil" || terrainDe(d.joueurs[j])?.sansAttaque) return [];
  const ennemies = monstres(d.joueurs[adversaire(j)]);
  if (!ennemies.length) return ["direct"];
  const gardes = ennemies.filter(x => capacite(x.m, "garde"));
  return (gardes.length ? gardes : ennemies).map(x => x.place);
}

/** Ce que donnerait une attaque (pour l'afficher avant le choc) : { atk, contre, valeur, position }. */
function calculCombat(d, j, place, cible) {
  const A = d.joueurs[j].monstres[place], o = adversaire(j);
  if (!A) return null;
  if (cible === "direct") return { atk: atkEffectif(d, j, A), contre: null, valeur: 0, position: "direct" };
  const T = d.joueurs[o].monstres[cible];
  if (!T) return null;
  if (T.faceCachee) return { atk: atkEffectif(d, j, A), contre: "?", valeur: null, position: "cachee" };
  const avantage = domine(A.id, T.id);
  return T.position === "attaque"
    ? { atk: atkContre(d, j, A, T), contre: "ATK", valeur: atkContre(d, o, T, A), position: "attaque", avantage, desavantage: domine(T.id, A.id) }
    : { atk: atkContre(d, j, A, T), contre: "DEF", valeur: defEffectif(d, o, T), position: "defense", avantage };
}

/** Présages que le joueur k peut activer en réponse (`declencheur` : 'attaque' | 'invocation' | 'influence'). */
function presagesActivables(d, k, declencheur) {
  const K = d.joueurs[k];
  if (d.actif === k) return [];
  return K.presages.map((p, place) => ({ p, place }))
    .filter(x => x.p && !x.p.continue && x.p.poseTour < d.tour && def(x.p.id).declencheur === declencheur)
    .filter(x => def(x.p.id).effets[0].t !== "renfortSurprise" || K.main.some(id => def(id).type === "apparition" && (def(id).niveau || 0) <= 4))
    .map(x => x.place);
}

function activerPresage(d, k, place, ev, maillon = null) {
  const K = d.joueurs[k], p = K.presages[place];
  K.presages[place] = null; K.cimetiere.push(p.id);
  const prec = K.derniere;
  ev.push({ type: "presage", j: k, place, id: p.id, maillon });
  noterRevelee(K, p.id);
  K.derniere = { id: p.id, choix: null };
  if (K.annuleProchaine) { K.annuleProchaine = false; ev.push({ type: "texte", j: k, texte: `La porte est fermée : ${nomDe(p.id)} reste sans effet.` }); return null; }
  accorder(d, k, prec, { id: p.id, choix: null }, ev);
  return def(p.id).effets[0];
}

/** Attaque. `presage` : emplacement du présage que le défenseur active en réponse (ou null). */
function attaquer(d, j, place, cible, rng = Math.random, presage = null) {
  if (!ciblesAttaque(d, j, place).includes(cible)) return [{ type: "refus", j, raison: "Cette attaque n’est pas possible." }];
  const ev = [], o = adversaire(j), J = d.joueurs[j], O = d.joueurs[o];
  const A = J.monstres[place];
  A.aAttaque = true; A.attaqueCeTour = true;
  ev.push({ type: "attaque", j, place, cible, id: A.id, idCible: cible === "direct" ? null : O.monstres[cible].id, calcul: calculCombat(d, j, place, cible) });
  if (A.statut === "confusion" && rng() < 0.5) {
    ev.push({ type: "texte", j, texte: `${nomDe(A.id)} est confuse : l’attaque échoue et la blesse.` });
    changerLP(d, j, -300, ev, "confusion"); finSiBesoin(d, ev); return ev;
  }

  if (presage != null && presagesActivables(d, o, "attaque").includes(presage)) {
    const e = activerPresage(d, o, presage, ev);
    if (e) switch (e.t) {
      case "renvoyerAttaquant": versMain(d, j, "monstres", place, ev); finSiBesoin(d, ev); return ev;
      case "detruireAttaquant": auCimetiere(d, j, "monstres", place, ev); finSiBesoin(d, ev); return ev;
      case "litige":
        if (rng() < 0.5) { ev.push({ type: "texte", j: o, texte: "Le procès est gagné : l’attaquant est détruit." }); auCimetiere(d, j, "monstres", place, ev); return ev; }
        ev.push({ type: "texte", j: o, texte: "Le procès est perdu : l’attaque se poursuit." });
        break;
      case "annulerCombat":
        ev.push({ type: "texte", j: o, texte: "La paix : l’attaque est annulée, le combat prend fin." });
        piocher(d, o, 1, ev);
        d.phase = "principale2"; ev.push({ type: "phase", phase: "principale2" });
        return ev;
      case "retarderAttaquant":
        A.bloque = Math.max(A.bloque, e.tours + 1);
        ev.push({ type: "bloque", j, place }); ev.push({ type: "texte", j: o, texte: "Retard : l’attaque est annulée." });
        return ev;
      case "renfortSurprise": {
        const choisi = O.main.map((id, i) => ({ id, i })).filter(x => def(x.id).type === "apparition" && (def(x.id).niveau || 0) <= 4)
          .sort((a, b) => def(b.id).def - def(a.id).def)[0];
        const zone = placeLibre(O.monstres);
        if (choisi && zone >= 0) {
          O.main.splice(choisi.i, 1);
          const m = apparitionDe(choisi.id, d); m.position = "defense"; O.monstres[zone] = m;
          ev.push({ type: "invocation", j: o, place: zone, id: choisi.id, speciale: true });
          reveler(d, o, zone, ev, rng);
          if (!O.monstres[zone] || !J.monstres[place]) { finSiBesoin(d, ev); return ev; }
          cible = zone;
          ev.push({ type: "texte", j: o, texte: `L’attaque est redirigée vers ${nomDe(choisi.id)}.` });
        }
        break;
      }
    }
  }
  if (!J.monstres[place]) return ev;

  const atk = atkEffectif(d, j, A);
  if (cible === "direct") { changerLP(d, o, -degatsSubis(O, atk), ev, "attaque directe"); voleur(d, j, A, ev, rng); finSiBesoin(d, ev); return ev; }
  const T = O.monstres[cible];
  if (!T) return ev;
  if (T.faceCachee) {
    T.faceCachee = false; ev.push({ type: "retournee", j: o, place: cible, id: T.id });
    reveler(d, o, cible, ev, rng);
    if (d.fini || !O.monstres[cible] || !J.monstres[place]) { finSiBesoin(d, ev); return ev; }
  }
  const atkA = atkContre(d, j, A, T);
  if (T.position === "attaque") {
    const atkT = atkContre(d, o, T, A), diff = atkA - atkT;
    if (diff > 0) { detruireAuCombat(d, o, cible, ev); changerLP(d, o, -degatsSubis(O, diff), ev, "combat"); voleur(d, j, A, ev, rng); }
    else if (diff < 0) { detruireAuCombat(d, j, place, ev); changerLP(d, j, -degatsSubis(J, -diff), ev, "combat"); }
    else if (atkA > 0) { detruireAuCombat(d, o, cible, ev); detruireAuCombat(d, j, place, ev); }
  } else {
    const diff = atkA - defEffectif(d, o, T);
    if (diff > 0) {
      detruireAuCombat(d, o, cible, ev);
      if (capacite(A, "percant")) { changerLP(d, o, -degatsSubis(O, diff), ev, "perçant"); voleur(d, j, A, ev, rng); }
    } else if (diff < 0) changerLP(d, j, -degatsSubis(J, -diff), ev, "la défense tient");
    else ev.push({ type: "texte", j, texte: "Les forces s’équilibrent : rien ne se passe." });
  }
  finSiBesoin(d, ev);
  return ev;
}

function degatsSubis(K, v) { return K.monstres.some(m => m && capacite(m, "moderation")) ? Math.round(v / 2) : v; }

function detruireAuCombat(d, k, place, ev) {
  const m = d.joueurs[k].monstres[place];
  if (!m) return;
  if (m.protege && !m.faceCachee) { m.protege = false; ev.push({ type: "protegee", j: k, place, id: m.id }); return; }
  auCimetiere(d, k, "monstres", place, ev);
}

function voleur(d, j, A, ev, rng) {
  if (capacite(A, "voleur")) appliquer({ d, j, rng, ev, mult: 1, nouvelle: null, prec: null }, { t: "voler" });
}

/** Un présage répond à une invocation adverse (versatile, passivité). */
function reagirInvocation(d, k, presage, place) {
  const ev = [];
  if (presage == null || !presagesActivables(d, k, "invocation").includes(presage)) return ev;
  const e = activerPresage(d, k, presage, ev);
  const j = adversaire(k), m = d.joueurs[j].monstres[place];
  if (!e || !m) return ev;
  if (e.t === "inverserInvoquee") { [m.atk, m.def] = [m.def, m.atk]; m.statut = "confusion"; ev.push({ type: "affaibli", j, place }); ev.push({ type: "statut", j, place, id: m.id, etat: "confusion" }); }
  if (e.t === "passiviteInvoquee") { m.position = "defense"; m.bloque = Math.max(m.bloque, 2); m.statut = "sommeil"; ev.push({ type: "position", j, place }); ev.push({ type: "bloque", j, place }); ev.push({ type: "statut", j, place, id: m.id, etat: "sommeil" }); }
  return ev;
}

// ---------- Fin de tour et tour suivant ----------

function finTour(d, rng = Math.random) {
  const ev = [];
  if (d.fini) return ev;
  const j = d.actif, J = d.joueurs[j];
  for (const x of monstres(J)) if (x.m.attaqueCeTour && capacite(x.m, "feuDePaille")) { ev.push({ type: "texte", j, texte: "Le feu de paille s’éteint." }); auCimetiere(d, j, "monstres", x.place, ev); }
  while (J.main.length > MAIN_MAX) {
    const id = J.main.splice(Math.floor(rng() * J.main.length), 1)[0];
    J.cimetiere.push(id); ev.push({ type: "defausse", j, id, limite: true });
  }
  for (const x of monstres(J)) if (x.m.bloque > 0) x.m.bloque--;
  J.voitMain = false; J.combo = 0;
  d.actif = adversaire(j); d.tour++; d.phase = "principale1";
  if (d.tour > d.limite) {
    // la Fatalité : l'échéance inéluctable ; celui qui a le plus de points de vie l'emporte
    d.fini = true;
    d.gagnant = d.joueurs[0].lp === d.joueurs[1].lp ? null : d.joueurs[0].lp > d.joueurs[1].lp ? 0 : 1;
    ev.push({ type: "fatalite", gagnant: d.gagnant }); ev.push({ type: "fin", gagnant: d.gagnant });
    return ev;
  }
  const K = d.joueurs[d.actif];
  K.invocationFaite = false; K.fusionFaite = false; K.techniqueFaite = false; K.accordTerrainFait = false; K.evolutionFaite = false; K.combo = 0;
  ev.push({ type: "tour", j: d.actif });
  for (const x of monstres(K)) {
    x.m.aAttaque = false; x.m.changeFait = false; x.m.attaqueCeTour = false;
    if (!x.m.faceCachee && def(x.m.id).croissance) { x.m.atk += def(x.m.id).croissance; ev.push({ type: "renfort", j: d.actif, place: x.place }); }
    if (!x.m.faceCachee && def(x.m.id).regain) changerLP(d, d.actif, def(x.m.id).regain, ev, "l’affection");
    // les états
    const s = x.m.statut;
    if (s && K.terrainCarte === 9) { x.m.statut = null; ev.push({ type: "gueri", j: d.actif, place: x.place, id: x.m.id }); }
    else if (s === "poison") { x.m.atk = Math.max(0, x.m.atk - 300); ev.push({ type: "affaibli", j: d.actif, place: x.place }); ev.push({ type: "texte", j: d.actif, texte: `${nomDe(x.m.id)} est malade : −300 ATK.` }); }
    else if (s === "brulure") changerLP(d, d.actif, -200, ev, `${nomDe(x.m.id)} brûle`);
    else if (s === "sommeil" && rng() < 0.5) { x.m.statut = null; ev.push({ type: "gueri", j: d.actif, place: x.place, id: x.m.id, texte: "s’éveille" }); }
    else if (s === "confusion" && rng() < 1 / 3) { x.m.statut = null; ev.push({ type: "gueri", j: d.actif, place: x.place, id: x.m.id, texte: "reprend ses esprits" }); }
    if (d.fini) return ev;
  }
  // influences continues
  K.presages.forEach((p, place) => {
    if (!p || !p.continue || d.fini) return;
    ev.push({ type: "texte", j: d.actif, texte: `${nomDe(p.id)} agit encore (${p.tours} tour${p.tours > 1 ? "s" : ""}).` });
    for (const e of def(p.id).effets) appliquer({ d, j: d.actif, rng, ev, mult: p.mult || 1, nouvelle: null, prec: null, idCarte: p.id }, e);
    if (--p.tours <= 0) auCimetiere(d, d.actif, "presages", place, ev, "epuisee");
  });
  for (const df of K.differes) df.tours--;
  const echus = K.differes.filter(df => df.tours <= 0);
  K.differes = K.differes.filter(df => df.tours > 0);
  for (const df of echus) { ev.push({ type: "texte", j: d.actif, texte: "Une espérance se réalise." }); for (const e of df.effets) appliquer({ d, j: d.actif, rng, ev, mult: df.mult, nouvelle: null, prec: null }, e); }
  if (K.sterile) { K.sterile = false; ev.push({ type: "texte", j: d.actif, texte: `Stérilité : ${K.nom} ne pioche pas.` }); }
  else piocher(d, d.actif, Math.max(0, Math.min(PIOCHE_TOUR, MAIN_MAX - K.main.length)), ev);
  const lieu = terrainDe(K);
  if (lieu?.lp && !d.fini) changerLP(d, d.actif, lieu.lp, ev, nomDe(K.terrainCarte));
  if (lieu && --K.terrainTours <= 0) { ev.push({ type: "texte", j: d.actif, texte: `${nomDe(K.terrainCarte)} s’use et tombe.` }); casserTerrain(d, d.actif, ev); }
  finSiBesoin(d, ev);
  return ev;
}

// ---------- L'Ombre ----------

/** Valeur des points de vie : au-delà de 8000, chaque point compte moins (les soins ne sont pas tout). */
const valeurLP = lp => (lp <= LP ? lp / 100 : LP / 100 + (lp - LP) / 300);

/** Évaluation d'une position pour le joueur j. `soin` pondère le goût des points de vie. */
function evaluer(d, j, profil = null) {
  const J = d.joueurs[j], o = adversaire(j), O = d.joueurs[o];
  if (O.lp <= 0) return 100000;
  if (J.lp <= 0) return -100000;
  const soin = profil?.soin ?? 1;
  const terrain = (K, k) => monstres(K).reduce((s, x) => s + (x.m.position === "attaque" ? atkEffectif(d, k, x.m) / 100 : defEffectif(d, k, x.m) / 160)
    + (x.m.faceCachee ? 3 : 0) + (x.m.bloque ? -2 : 0) + (capacite(x.m, "garde") ? 1.5 : 0) + (x.m.statut ? -3 : 0), 0)
    + K.presages.filter(p => p && !p.continue).length * 4 + K.presages.filter(p => p && p.continue).reduce((s, p) => s + 3 * p.tours, 0);
  const attente = K => K.differes.reduce((s, df) => s + df.effets.reduce((t, e) => t + (e.t === "lp" ? e.v / 120 : 2), 0), 0)
    + (K.doubler ? 3 : 0) + (K.voitMain ? 1 : 0);
  return soin * (valeurLP(J.lp) - valeurLP(O.lp)) + terrain(J, j) - terrain(O, o) + 2.5 * (J.main.length - O.main.length)
    + attente(J) - attente(O) + (O.annuleProchaine ? 4 : 0) - (J.annuleProchaine ? 4 : 0) + (O.sterile ? 3 : 0) - (J.sterile ? 3 : 0)
    + J.reserve.length * 0.5 + (J.terrainCarte != null ? 3 : 0) - (O.terrainCarte != null ? 3 : 0);
}

const neutre = () => 0.5;
const copie = d => structuredClone(d);

/**
 * L'adversaire k répond-il par un présage ? Renvoie l'emplacement choisi, ou null. contexte : { place, cible, index, choix }.
 * Un profil très hasardeux (le Novice) ne répond jamais : c'est l'essentiel de l'écart entre les difficultés.
 */
function presageOmbre(d, k, declencheur, contexte = {}, profil = d.joueurs[k].profil) {
  const dispo = presagesActivables(d, k, declencheur);
  if (!dispo.length || (profil?.hasard ?? 0) > 0.5) return null;
  const j = adversaire(k);
  if (declencheur === "influence") {
    // une influence vaut-elle d'être contrée ? on compare la position avec et sans elle
    const sim = copie(d);
    if (contexte.revelee) revelerInfluence(sim, j, contexte.place, { choix: contexte.choix }, neutre);
    else activer(sim, j, contexte.index, { choix: contexte.choix }, neutre);
    return evaluer(sim, k) < evaluer(d, k) - 4 ? dispo[0] : null;
  }
  const A = d.joueurs[j].monstres[contexte.place];
  if (!A) return null;
  if (declencheur === "invocation") {
    const atk = atkEffectif(d, j, A);
    return dispo.find(p => {
      const t = def(d.joueurs[k].presages[p].id).effets[0].t;
      return t === "inverserInvoquee" ? A.atk - A.def >= 600 : atk >= 1600;
    }) ?? null;
  }
  const calc = calculCombat(d, j, contexte.place, contexte.cible);
  const grave = contexte.cible === "direct" ? calc.atk >= 1200 : calc.valeur == null || calc.atk >= calc.valeur;
  if (!grave) return null;
  const ordre = ["detruireAttaquant", "renvoyerAttaquant", "litige", "retarderAttaquant", "renfortSurprise", "annulerCombat"];
  const rang = place => ordre.indexOf(def(d.joueurs[k].presages[place].id).effets[0].t);
  return [...dispo].sort((a, b) => rang(a) - rang(b))[0];
}

/** Toutes les actions possibles du joueur actif, chacune avec sa valeur (positions simulées). */
function actionsNotees(d, profil) {
  const j = d.actif, J = d.joueurs[j], O = d.joueurs[adversaire(j)];
  const base = evaluer(d, j, profil), res = [];
  const noter = (action, faire) => { const sim = copie(d); faire(sim); res.push({ ...action, v: evaluer(sim, j, profil) - base }); };
  if (enPrincipale(d)) {
    J.main.forEach((id, index) => {
      const x = def(id);
      if (x.type === "influence" && peutActiver(d, j, index).ok)
        for (const c of (x.choix ? x.choix.map((_, i) => i) : [null])) noter({ type: "activer", index, choix: c }, s => activer(s, j, index, { choix: c }, neutre));
      if (x.type === "presage" && peutPoser(d, j, index).ok) res.push({ type: "poser", index, v: 3.5 });
      // une influence peu utile maintenant se garde face cachée pour plus tard
      if (x.type === "influence" && !x.sousType && peutPoserInfluence(d, j, index).ok && J.presages.filter(Boolean).length < 3) res.push({ type: "poserInfluence", index, v: 0.6 });
      if (x.type === "apparition") for (const pose of [false, true]) if (peutInvoquer(d, j, index, pose).ok) {
        const menace = Math.max(0, ...monstres(O).filter(m => m.m.position === "attaque" && !m.m.faceCachee).map(m => atkEffectif(d, adversaire(j), m.m)));
        noter({ type: "invoquer", index, pose }, s => invoquer(s, j, index, { pose }, neutre));
        if (!pose && x.atk < menace) res[res.length - 1].v -= 6;
      }
    });
    for (const f of fusionsPossibles(d, j)) noter({ type: "fusionner", figure: f.figure }, s => fusionner(s, j, f.figure, neutre));
    for (const t of techniquesPossibles(d, j)) noter({ type: "technique", cle: t.cle }, s => utiliserTechnique(s, j, t.cle, neutre));
    for (const t of accordsTerrain(d, j)) noter({ type: "accordTerrain", cle: t.cle }, s => accomplirAccordTerrain(s, j, t.cle));
    for (const e of evolutionsPossibles(d, j)) noter({ type: "evoluer", index: e.index, place: e.place }, s => evoluer(s, j, e.index, e.place, neutre));
    J.presages.forEach((p, place) => {
      if (!p?.influence || !peutRevelerInfluence(d, j, place).ok) return;
      for (const c of (def(p.id).choix ? def(p.id).choix.map((_, i) => i) : [null])) noter({ type: "revelerInfluence", place, choix: c }, s => revelerInfluence(s, j, place, { choix: c }, neutre));
    });
    for (const x of monstres(J)) if (peutChanger(d, j, x.place).ok) noter({ type: "changer", place: x.place }, s => changerPosition(s, j, x.place, neutre));
  } else if (d.phase === "combat") {
    J.monstres.forEach((m, place) => {
      if (!m) return;
      for (const c of ciblesAttaque(d, j, place)) noter({ type: "attaquer", place, cible: c }, s => attaquer(s, j, place, c, neutre, null));
    });
    for (const r of res) if (r.type === "attaquer") r.v *= profil?.agressif ?? 1;
  }
  return res;
}

/** Prochaine action de l'Ombre (joueur actif), que l'interface exécute puis anime. `profil` règle son style. */
function actionOmbre(d, profil = d.joueurs[d.actif].profil, rng = Math.random) {
  if (d.fini) return { type: "rien" };
  const j = d.actif;
  const notes = actionsNotees(d, profil).sort((a, b) => b.v - a.v);
  const seuil = { activer: 1.5, poser: 0, poserInfluence: 0.5, revelerInfluence: 1.5, technique: 1, accordTerrain: 0.5, evoluer: 0.5, invoquer: -1, fusionner: 0, changer: 0.8, attaquer: 0 };
  let utiles = notes.filter(a => a.v > seuil[a.type] || (a.type === "invoquer" && !monstres(d.joueurs[j]).length));
  // la difficulté : une part de coups pris au hasard parmi les coups possibles
  if (utiles.length && profil?.hasard && rng() < profil.hasard) {
    const hasard = notes.filter(a => a.type !== "changer");
    if (hasard.length) return hasard[Math.floor(rng() * hasard.length)];
  }
  if (utiles.length) return utiles[0];
  if (d.phase === "principale1" && d.tour > 1 && monstres(d.joueurs[j]).some(x => x.m.position === "attaque" && !x.m.faceCachee && !x.m.bloque)) return { type: "combat" };
  if (d.phase === "combat") return { type: "principale2" };
  return { type: "fin" };
}

/** Exécute une action de l'Ombre. `reponse` : présage du défenseur (attaque) ou contre (influence). */
function executerOmbre(d, a, rng = Math.random, reponse = null) {
  const j = d.actif;
  switch (a.type) {
    case "activer": return activer(d, j, a.index, { choix: a.choix, contre: reponse }, rng);
    case "poser": return poser(d, j, a.index);
    case "poserInfluence": return poserInfluence(d, j, a.index);
    case "revelerInfluence": return revelerInfluence(d, j, a.place, { choix: a.choix, contre: reponse }, rng);
    case "technique": return utiliserTechnique(d, j, a.cle, rng);
    case "accordTerrain": return accomplirAccordTerrain(d, j, a.cle);
    case "evoluer": return evoluer(d, j, a.index, a.place, rng);
    case "invoquer": return invoquer(d, j, a.index, { pose: a.pose }, rng);
    case "fusionner": return fusionner(d, j, a.figure, rng);
    case "changer": return changerPosition(d, j, a.place, rng);
    case "combat": return passerAuCombat(d);
    case "principale2": return passerPrincipale2(d);
    case "attaquer": return attaquer(d, j, a.place, a.cible, rng, reponse);
    default: return [];
  }
}

return { OFFRANDE, LP, MECANIQUES, def, nomDe, familleDe, creerDuel, apparitionDe, atkEffectif, domine, defEffectif, terrainDe, accordsTerrain, accomplirAccordTerrain, peutInvoquer, invoquer, peutActiver, activer, peutPoser, poser, peutPoserInfluence, poserInfluence, peutRevelerInfluence, revelerInfluence, influencesEnReponse, revelerEnReponse, terrainsEnReponse, poserTerrainEnReponse, preparerReprise, influenceOmbre, avancementAssociation, associationComplete, techniquesPossibles, utiliserTechnique, evolutionsPossibles, evoluer, peutChanger, changerPosition, fusionsPossibles, fusionner, passerAuCombat, passerPrincipale2, ciblesAttaque, calculCombat, presagesActivables, attaquer, reagirInvocation, finTour, evaluer, presageOmbre, actionOmbre, executerOmbre };
})();

// ===== js/engine/carnet.js =====
M["js/engine/carnet.js"] = (() => {
// Carnet du joueur : ce qu'il a vu et vécu d'une partie à l'autre. Module pur ;
// la sauvegarde (localStorage) est faite par js/ui/carnet.js.
const { VOISINAGE } = M["js/data/voisinage.js"];

function carnetVide() {
  return { version: 1, cartes: {}, regles: {}, parties: 0, meilleurScore: 0, aRevoir: {}, enigmes: { posees: 0, reussies: 0 }, duels: { joues: 0, gagnes: 0 }, gardiens: [] };
}

/** Accepte n'importe quelle donnée lue : renvoie toujours un carnet valide. */
function normaliserCarnet(brut) {
  const c = carnetVide();
  if (!brut || typeof brut !== "object" || brut.version !== 1) return c;
  for (const [id, v] of Object.entries(brut.cartes || {})) c.cartes[id] = { vue: +v.vue || 0, vecue: +v.vecue || 0 };
  for (const id of Object.keys(brut.regles || {})) if (VOISINAGE.some(r => r.id === id)) c.regles[id] = true;
  c.parties = +brut.parties || 0;
  c.meilleurScore = +brut.meilleurScore || 0;
  for (const [id, n] of Object.entries(brut.aRevoir || {})) if (+n > 0) c.aRevoir[id] = Math.min(3, +n);
  c.enigmes = { posees: +brut.enigmes?.posees || 0, reussies: +brut.enigmes?.reussies || 0 };
  c.duels = { joues: +brut.duels?.joues || 0, gagnes: +brut.duels?.gagnes || 0 };
  c.gardiens = Array.isArray(brut.gardiens) ? brut.gardiens.filter(f => typeof f === "string") : [];
  return c;
}

const fiche = (c, id) => (c.cartes[id] ||= { vue: 0, vecue: 0 });

/** Première fois que le joueur voit cette carte face visible ? (renvoie vrai si nouvelle) */
function noterVue(c, id) { const f = fiche(c, id); f.vue++; return f.vue === 1; }
/** Renvoie vrai si c'est la première fois que la carte est vécue. */
function noterVecue(c, id) { const f = fiche(c, id); f.vecue++; return f.vecue === 1; }
/** Renvoie vrai si la règle est découverte pour la première fois. */
function noterRegle(c, id) { const neuve = !c.regles[id]; c.regles[id] = true; return neuve; }
/** Fin de partie : renvoie vrai si c'est un nouveau meilleur score. */
function noterPartie(c, sc) { c.parties++; const record = sc > c.meilleurScore; if (record) c.meilleurScore = sc; return record; }

function avancement(c) {
  return {
    vues: Object.values(c.cartes).filter(f => f.vue > 0 || f.vecue > 0).length,
    vecues: Object.values(c.cartes).filter(f => f.vecue > 0).length,
    regles: Object.keys(c.regles).length,
    totalRegles: VOISINAGE.length,
    aRevoir: Object.keys(c.aRevoir).length
  };
}

/**
 * Révision espacée : une énigme manquée met la carte « à revoir » (niveau 3) ; chaque bonne réponse
 * sur cette carte baisse le niveau d'un cran. Les cartes à revoir reviennent plus souvent dans les énigmes.
 */
function noterEnigme(c, id, reussie) {
  c.enigmes.posees++;
  if (reussie) { c.enigmes.reussies++; if (c.aRevoir[id]) { c.aRevoir[id]--; if (!c.aRevoir[id]) delete c.aRevoir[id]; } }
  else c.aRevoir[id] = 3;
}

/** Fin d'un duel. */
function noterDuel(c, gagne) { c.duels.joues++; if (gagne) c.duels.gagnes++; }

/** Un Gardien vaincu : il enseigne ses règles. Renvoie les règles nouvellement apprises. */
function vaincreGardien(c, famille, regles) {
  if (!c.gardiens.includes(famille)) c.gardiens.push(famille);
  return regles.filter(id => noterRegle(c, id));
}

return { carnetVide, normaliserCarnet, noterVue, noterVecue, noterRegle, noterPartie, avancement, noterEnigme, noterDuel, vaincreGardien };
})();

// ===== js/render/illustrations.js =====
M["js/render/illustrations.js"] = (() => {
// Illustrations des cartes, dessinées d'après l'image que nomme la notice de Belline
// (sans reproduire les illustrations éditées). Chaque fonction dessine dans un carré
// de côté `t` centré en (cx, cy), à l'encre courante (strokeStyle et fillStyle déjà posés).
// Une carte sans illustration affiche son symbole.

function etoile(c, cx, cy, branches, rExt, rInt, rotation = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < branches * 2; i++) {
    const r = i % 2 ? rInt : rExt, a = rotation + i * Math.PI / branches;
    c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  c.closePath();
}

const ILLUSTRATIONS = {
  // La clef
  1(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.5 * u;
    c.beginPath(); c.arc(cx - 9 * u, cy, 7 * u, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx - 9 * u, cy, 2.5 * u, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(cx - 2 * u, cy); c.lineTo(cx + 16 * u, cy);
    c.moveTo(cx + 10 * u, cy); c.lineTo(cx + 10 * u, cy + 6 * u);
    c.moveTo(cx + 15 * u, cy); c.lineTo(cx + 15 * u, cy + 8 * u); c.stroke();
  },
  // L'Étoile de l'homme : sceau à six branches
  2(c, cx, cy, t) {
    const r = t * 0.42;
    c.lineWidth = 2;
    for (const rot of [-Math.PI / 2, Math.PI / 2]) {
      c.beginPath();
      for (let i = 0; i < 3; i++) { const a = rot + i * 2 * Math.PI / 3; c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
      c.closePath(); c.stroke();
    }
  },
  // L'Étoile de la femme : étoile pleine à huit branches
  3(c, cx, cy, t) { etoile(c, cx, cy, 8, t * 0.44, t * 0.2); c.fill(); },
  // L'Horoscope : la roue des douze maisons
  4(c, cx, cy, t) {
    const R = t * 0.44, r = t * 0.18;
    c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    c.beginPath();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); c.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); }
    c.stroke();
    c.beginPath(); c.arc(cx, cy, 2, 0, Math.PI * 2); c.fill();
  },
  // La médaille
  5(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 8 * u, cy - 18 * u); c.lineTo(cx, cy - 4 * u); c.lineTo(cx + 8 * u, cy - 18 * u); c.stroke();
    c.beginPath(); c.arc(cx, cy + 6 * u, 11 * u, 0, Math.PI * 2); c.fill();
    c.save(); c.fillStyle = "#F7F1E3"; etoile(c, cx, cy + 6 * u, 5, 6 * u, 2.6 * u); c.fill(); c.restore();
  },
  // La pyramide
  6(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx, cy - 17 * u); c.lineTo(cx + 19 * u, cy + 15 * u); c.lineTo(cx - 19 * u, cy + 15 * u); c.closePath(); c.stroke();
    c.beginPath();
    for (const k of [0.33, 0.66]) {
      const y = cy - 17 * u + k * 32 * u, dx = k * 19 * u;
      c.moveTo(cx - dx, y); c.lineTo(cx + dx, y);
    }
    c.moveTo(cx, cy - 17 * u); c.lineTo(cx + 4 * u, cy + 15 * u); c.stroke();
  },
  // L'honneur : la couronne de laurier
  7(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    for (const s of [-1, 1]) {
      c.beginPath(); c.arc(cx, cy + 2 * u, 15 * u, Math.PI / 2 + s * 0.25, Math.PI / 2 + s * 2.6, s < 0); c.stroke();
      for (let i = 0; i < 5; i++) {
        const a = Math.PI / 2 + s * (0.6 + i * 0.45), x = cx + 15 * u * Math.cos(a), y = cy + 2 * u + 15 * u * Math.sin(a);
        c.save(); c.translate(x, y); c.rotate(a + s * 0.9);
        c.beginPath(); c.ellipse(0, -4 * u, 2.2 * u, 4.5 * u, 0, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
  },
  // Le chien
  8(c, cx, cy, t) { dessinerChien(c, cx - t * 0.45, cy + t * 0.3, t * 0.9); },
  // Le jardin
  9(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx - 19 * u, cy + 15 * u); c.lineTo(cx + 19 * u, cy + 15 * u); c.stroke();
    for (const [dx, h] of [[-11, 20], [0, 28], [11, 18]]) {
      const x = cx + dx * u, y = cy + 15 * u - h * u;
      c.beginPath(); c.moveTo(x, cy + 15 * u); c.lineTo(x, y); c.stroke();
      for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5; c.beginPath(); c.arc(x + 3.2 * u * Math.cos(a), y + 3.2 * u * Math.sin(a), 2.4 * u, 0, Math.PI * 2); c.fill(); }
      c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.arc(x, y, 1.8 * u, 0, Math.PI * 2); c.fill(); c.restore();
    }
  },
  // Les présents
  10(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.strokeRect(cx - 14 * u, cy - 4 * u, 28 * u, 20 * u);
    c.strokeRect(cx - 16 * u, cy - 10 * u, 32 * u, 6 * u);
    c.beginPath(); c.moveTo(cx, cy - 10 * u); c.lineTo(cx, cy + 16 * u); c.stroke();
    c.beginPath(); c.ellipse(cx - 6 * u, cy - 14 * u, 6 * u, 3.5 * u, -0.4, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.ellipse(cx + 6 * u, cy - 14 * u, 6 * u, 3.5 * u, 0.4, 0, Math.PI * 2); c.stroke();
  }
};

Object.assign(ILLUSTRATIONS, {
  // Le diable : tête cornue
  11(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.ellipse(cx, cy + 3 * u, 10 * u, 12 * u, 0, 0, Math.PI * 2); c.stroke();
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + s * 6 * u, cy - 7 * u); c.quadraticCurveTo(cx + s * 14 * u, cy - 12 * u, cx + s * 12 * u, cy - 19 * u);
      c.quadraticCurveTo(cx + s * 10 * u, cy - 12 * u, cx + s * 3 * u, cy - 8 * u); c.fill();
      c.beginPath(); c.moveTo(cx + s * 2 * u, cy); c.lineTo(cx + s * 7 * u, cy - 2 * u); c.lineTo(cx + s * 6 * u, cy + 1 * u); c.closePath(); c.fill();
    }
    c.beginPath(); c.moveTo(cx - 5 * u, cy + 8 * u); c.quadraticCurveTo(cx, cy + 11 * u, cx + 5 * u, cy + 8 * u); c.stroke();
    c.beginPath(); c.moveTo(cx - 3 * u, cy + 14 * u); c.lineTo(cx, cy + 22 * u); c.lineTo(cx + 3 * u, cy + 14 * u); c.fill();
  },
  // Les oiseaux
  12(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2; c.lineCap = "round";
    for (const [dx, dy, k] of [[-9, -8, 1], [8, -2, 1.2], [-4, 10, 0.8]]) {
      const x = cx + dx * u, y = cy + dy * u, l = 9 * u * k;
      c.beginPath(); c.moveTo(x - l, y - l * 0.4); c.quadraticCurveTo(x - l * 0.4, y - l * 0.7, x, y);
      c.quadraticCurveTo(x + l * 0.4, y - l * 0.7, x + l, y - l * 0.4); c.stroke();
    }
  },
  // Le vent : un visage de nuage qui souffle
  13(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8; c.lineCap = "round";
    c.beginPath(); c.arc(cx - 9 * u, cy - 2 * u, 8 * u, Math.PI * 0.4, Math.PI * 1.9); c.stroke();
    c.beginPath(); c.arc(cx - 9 * u, cy - 4 * u, 1.3 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx - 2 * u, cy + 1 * u, 1.6 * u, 0, Math.PI * 2); c.stroke();
    for (const [dy, l] of [[-7, 18], [1, 21], [9, 15]]) {
      c.beginPath(); c.moveTo(cx + 2 * u, cy + dy * u); c.lineTo(cx + l * u, cy + dy * u);
      c.arc(cx + l * u, cy + (dy - 2.5) * u, 2.5 * u, Math.PI / 2, -Math.PI, true); c.stroke();
    }
  },
  // La longue-vue
  14(c, cx, cy, t) {
    const u = t / 40;
    c.save(); c.translate(cx, cy - 2 * u); c.rotate(-0.45);
    c.lineWidth = 1.6;
    c.strokeRect(-18 * u, -3 * u, 13 * u, 6 * u);
    c.strokeRect(-5 * u, -4 * u, 12 * u, 8 * u);
    c.strokeRect(7 * u, -5.5 * u, 11 * u, 11 * u);
    c.restore();
    c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cx, cy + 1 * u); c.lineTo(cx - 8 * u, cy + 18 * u); c.moveTo(cx, cy + 1 * u); c.lineTo(cx + 8 * u, cy + 18 * u);
    c.moveTo(cx, cy + 1 * u); c.lineTo(cx, cy + 18 * u); c.stroke();
  },
  // L'eau : vagues
  15(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2; c.lineCap = "round";
    for (const dy of [-10, 0, 10]) {
      c.beginPath();
      for (let i = 0; i <= 3; i++) {
        const x = cx - 18 * u + i * 12 * u, y = cy + dy * u;
        if (i === 0) c.moveTo(x, y); else c.quadraticCurveTo(x - 6 * u, y - 7 * u, x, y);
      }
      c.stroke();
    }
  },
  // Le château
  16(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    const bas = cy + 16 * u;
    const tour = (x, l, h) => {
      c.strokeRect(x, bas - h, l, h);
      for (let k = 0; k < 3; k++) c.fillRect(x + k * l / 2.5, bas - h - 3 * u, l / 5, 3 * u);
    };
    tour(cx - 19 * u, 10 * u, 26 * u); tour(cx + 9 * u, 10 * u, 26 * u); tour(cx - 9 * u, 18 * u, 20 * u);
    c.beginPath(); c.arc(cx, bas, 4.5 * u, Math.PI, 0); c.fill();
    c.fillRect(cx - 15.5 * u, bas - 18 * u, 3 * u, 5 * u); c.fillRect(cx + 12.5 * u, bas - 18 * u, 3 * u, 5 * u);
  },
  // Le crapaud (l'autre image de la carte est l'aigle)
  17(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 4 * u, 14 * u, 9 * u, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) {
      c.beginPath(); c.arc(cx + s * 7 * u, cy - 4 * u, 4.5 * u, 0, Math.PI * 2); c.fill();
      c.save(); c.fillStyle = "#F7F1E3"; c.beginPath(); c.arc(cx + s * 7 * u, cy - 4.5 * u, 2 * u, 0, Math.PI * 2); c.fill(); c.restore();
      c.lineWidth = 3 * u; c.lineCap = "round";
      c.beginPath(); c.moveTo(cx + s * 10 * u, cy + 9 * u); c.lineTo(cx + s * 18 * u, cy + 14 * u); c.lineTo(cx + s * 13 * u, cy + 16 * u); c.stroke();
    }
    c.save(); c.strokeStyle = "#F7F1E3"; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(cx - 8 * u, cy + 2 * u); c.quadraticCurveTo(cx, cy + 6 * u, cx + 8 * u, cy + 2 * u); c.stroke(); c.restore();
  }
});

// Mercure, Vénus, Mars, Jupiter, Saturne
Object.assign(ILLUSTRATIONS, {
  // Les astres : un croissant et trois étoiles
  18(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx - 4 * u, cy, 13 * u, Math.PI * 0.35, Math.PI * 1.65); c.arc(cx + 1 * u, cy, 10 * u, Math.PI * 1.55, Math.PI * 0.45, true); c.closePath(); c.fill();
    for (const [dx, dy, r] of [[11, -11, 4], [15, 4, 3], [5, 14, 2.5]]) { etoile(c, cx + dx * u, cy + dy * u, 5, r * u, r * 0.42 * u); c.fill(); }
  },
  // La corne d'abondance
  19(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx - 17 * u, cy + 12 * u); c.quadraticCurveTo(cx - 6 * u, cy + 16 * u, cx + 6 * u, cy + 2 * u);
    c.lineTo(cx + 12 * u, cy - 10 * u); c.quadraticCurveTo(cx + 2 * u, cy - 4 * u, cx - 4 * u, cy + 4 * u); c.quadraticCurveTo(cx - 10 * u, cy + 10 * u, cx - 17 * u, cy + 12 * u); c.stroke();
    for (const [dx, dy, r] of [[12, -15, 4], [17, -9, 3.5], [7, -16, 3], [17, -17, 2.5]]) { c.beginPath(); c.arc(cx + dx * u, cy + dy * u, r * u, 0, Math.PI * 2); c.fill(); }
  },
  // Le livre ouvert
  20(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx, cy - 10 * u); c.quadraticCurveTo(cx + s * 9 * u, cy - 14 * u, cx + s * 18 * u, cy - 11 * u);
      c.lineTo(cx + s * 18 * u, cy + 12 * u); c.quadraticCurveTo(cx + s * 9 * u, cy + 9 * u, cx, cy + 13 * u); c.closePath(); c.stroke();
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(cx + s * 4 * u, cy - 6 * u + k * 5 * u); c.lineTo(cx + s * 15 * u, cy - 7 * u + k * 5 * u); c.stroke(); }
    }
  },
  // La chauve-souris
  21(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath();
    for (const s of [1, -1]) {
      c.moveTo(cx, cy - 2 * u);
      c.quadraticCurveTo(cx + s * 10 * u, cy - 14 * u, cx + s * 20 * u, cy - 8 * u);
      c.quadraticCurveTo(cx + s * 16 * u, cy - 2 * u, cx + s * 17 * u, cy + 4 * u);
      c.quadraticCurveTo(cx + s * 12 * u, cy, cx + s * 10 * u, cy + 5 * u);
      c.quadraticCurveTo(cx + s * 6 * u, cy + 1 * u, cx, cy + 6 * u);
    }
    c.fill();
    c.beginPath(); c.ellipse(cx, cy, 4 * u, 6 * u, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 1 * u, cy - 5 * u); c.lineTo(cx + s * 3.5 * u, cy - 10 * u); c.lineTo(cx + s * 4 * u, cy - 4 * u); c.fill(); }
  },
  // Le plan
  22(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.strokeRect(cx - 17 * u, cy - 14 * u, 34 * u, 28 * u);
    c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(cx - 3 * u, cy - 14 * u); c.lineTo(cx - 3 * u, cy + 3 * u); c.lineTo(cx - 17 * u, cy + 3 * u);
    c.moveTo(cx - 3 * u, cy - 3 * u); c.lineTo(cx + 17 * u, cy - 3 * u); c.moveTo(cx + 6 * u, cy - 3 * u); c.lineTo(cx + 6 * u, cy + 14 * u); c.stroke();
    c.beginPath(); c.arc(cx - 10 * u, cy + 3 * u, 5 * u, -Math.PI / 2, 0); c.stroke();
  },
  // Le caducée
  23(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(cx, cy - 16 * u); c.lineTo(cx, cy + 19 * u); c.stroke();
    c.beginPath(); c.arc(cx, cy - 17 * u, 2.6 * u, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.6;
    for (const s of [-1, 1]) {
      c.beginPath();
      for (let k = 0; k <= 24; k++) { const y = cy + 14 * u - k * 1.15 * u, x = cx + s * Math.sin(k / 24 * Math.PI * 3) * 6 * u; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke();
      c.beginPath(); c.moveTo(cx, cy - 12 * u); c.quadraticCurveTo(cx + s * 10 * u, cy - 20 * u, cx + s * 17 * u, cy - 16 * u); c.quadraticCurveTo(cx + s * 9 * u, cy - 13 * u, cx, cy - 9 * u); c.fill();
    }
  },
  // La comète
  24(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx + 9 * u, cy - 9 * u, 6 * u, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.6; c.lineCap = "round";
    for (const [k, l] of [[-1, 24], [0, 30], [1, 24], [-2, 16], [2, 16]]) {
      c.beginPath(); c.moveTo(cx + 9 * u + k * 2.5 * u, cy - 9 * u - k * 2.5 * u); c.lineTo(cx + 9 * u - l * u * 0.75 + k * 2.5 * u, cy - 9 * u + l * u * 0.75 - k * 2.5 * u); c.stroke();
    }
  },
  // La lyre
  25(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(cx - 12 * u, cy - 16 * u); c.quadraticCurveTo(cx - 18 * u, cy + 4 * u, cx - 8 * u, cy + 14 * u); c.lineTo(cx + 8 * u, cy + 14 * u);
    c.quadraticCurveTo(cx + 18 * u, cy + 4 * u, cx + 12 * u, cy - 16 * u); c.stroke();
    c.beginPath(); c.moveTo(cx - 14 * u, cy - 10 * u); c.lineTo(cx + 14 * u, cy - 10 * u); c.stroke();
    c.lineWidth = 1;
    for (const dx of [-6, -2, 2, 6]) { c.beginPath(); c.moveTo(cx + dx * u, cy - 10 * u); c.lineTo(cx + dx * u, cy + 14 * u); c.stroke(); }
  },
  // La hache aux faisceaux
  26(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.5;
    for (const dx of [-6, -3, 0, 3, 6]) { c.beginPath(); c.moveTo(cx + dx * u, cy - 14 * u); c.lineTo(cx + dx * u, cy + 18 * u); c.stroke(); }
    c.lineWidth = 2;
    for (const dy of [-6, 4, 13]) { c.beginPath(); c.moveTo(cx - 8 * u, cy + dy * u); c.lineTo(cx + 8 * u, cy + dy * u); c.stroke(); }
    c.beginPath(); c.moveTo(cx + 7 * u, cy - 15 * u); c.quadraticCurveTo(cx + 20 * u, cy - 18 * u, cx + 18 * u, cy - 6 * u); c.quadraticCurveTo(cx + 14 * u, cy - 9 * u, cx + 7 * u, cy - 8 * u); c.fill();
  },
  // L'autel et sa flamme
  27(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.strokeRect(cx - 13 * u, cy - 2 * u, 26 * u, 18 * u);
    c.fillRect(cx - 16 * u, cy - 5 * u, 32 * u, 4 * u); c.fillRect(cx - 16 * u, cy + 15 * u, 32 * u, 3 * u);
    c.beginPath(); c.moveTo(cx, cy - 20 * u); c.quadraticCurveTo(cx + 8 * u, cy - 11 * u, cx + 3 * u, cy - 6 * u); c.lineTo(cx - 3 * u, cy - 6 * u); c.quadraticCurveTo(cx - 8 * u, cy - 11 * u, cx, cy - 20 * u); c.fill();
  },
  // Le pélican et ses petits
  28(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx + 2 * u, cy + 2 * u, 13 * u, 8 * u, -0.2, 0, Math.PI * 2); c.fill();
    c.lineWidth = 3 * u; c.lineCap = "round";
    c.beginPath(); c.moveTo(cx - 8 * u, cy - 2 * u); c.quadraticCurveTo(cx - 14 * u, cy - 14 * u, cx - 6 * u, cy - 16 * u); c.stroke();
    c.lineWidth = 2 * u;
    c.beginPath(); c.moveTo(cx - 5 * u, cy - 16 * u); c.lineTo(cx - 1 * u, cy - 4 * u); c.stroke();
    for (const dx of [-10, -2, 6]) { c.beginPath(); c.arc(cx + dx * u, cy + 15 * u, 3.2 * u, 0, Math.PI * 2); c.fill(); }
  },
  // Les deux cœurs
  29(c, cx, cy, t) {
    const u = t / 40;
    coeur(c, cx - 6 * u, cy - 2 * u, 11 * u); c.fill();
    c.save(); c.globalAlpha = 0.6; coeur(c, cx + 6 * u, cy + 3 * u, 11 * u); c.fill(); c.restore();
  },
  // L'amphore
  30(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx - 4 * u, cy - 17 * u); c.lineTo(cx - 4 * u, cy - 11 * u); c.quadraticCurveTo(cx - 15 * u, cy - 4 * u, cx - 9 * u, cy + 10 * u);
    c.lineTo(cx - 3 * u, cy + 18 * u); c.lineTo(cx + 3 * u, cy + 18 * u); c.lineTo(cx + 9 * u, cy + 10 * u); c.quadraticCurveTo(cx + 15 * u, cy - 4 * u, cx + 4 * u, cy - 11 * u); c.lineTo(cx + 4 * u, cy - 17 * u); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 4 * u, cy - 14 * u); c.quadraticCurveTo(cx + s * 13 * u, cy - 15 * u, cx + s * 9 * u, cy - 5 * u); c.stroke(); }
    c.beginPath(); c.moveTo(cx - 10 * u, cy + 2 * u); c.lineTo(cx + 10 * u, cy + 2 * u); c.stroke();
  },
  // Les cœurs blessés : un cœur percé d'une flèche
  31(c, cx, cy, t) {
    const u = t / 40;
    coeur(c, cx, cy, 14 * u); c.fill();
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 19 * u, cy + 12 * u); c.lineTo(cx + 18 * u, cy - 12 * u); c.stroke();
    c.beginPath(); c.moveTo(cx + 18 * u, cy - 12 * u); c.lineTo(cx + 11 * u, cy - 11 * u); c.lineTo(cx + 15 * u, cy - 6 * u); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx - 19 * u, cy + 12 * u); c.lineTo(cx - 19 * u, cy + 6 * u); c.moveTo(cx - 19 * u, cy + 12 * u); c.lineTo(cx - 13 * u, cy + 13 * u); c.stroke();
  },
  // La lanterne
  32(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.beginPath(); c.arc(cx, cy - 17 * u, 3 * u, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(cx - 8 * u, cy - 9 * u); c.lineTo(cx, cy - 14 * u); c.lineTo(cx + 8 * u, cy - 9 * u); c.closePath(); c.fill();
    c.strokeRect(cx - 8 * u, cy - 9 * u, 16 * u, 22 * u);
    c.fillRect(cx - 9 * u, cy + 13 * u, 18 * u, 3 * u);
    c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.moveTo(cx, cy - 4 * u); c.quadraticCurveTo(cx + 5 * u, cy + 3 * u, cx, cy + 8 * u); c.quadraticCurveTo(cx - 5 * u, cy + 3 * u, cx, cy - 4 * u); c.fill(); c.restore();
  },
  // Les deux épées croisées
  33(c, cx, cy, t) {
    const u = t / 40;
    for (const s of [-1, 1]) {
      c.save(); c.translate(cx, cy); c.rotate(s * 0.75);
      c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, -20 * u); c.lineTo(0, 12 * u); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(-6 * u, 12 * u); c.lineTo(6 * u, 12 * u); c.stroke();
      c.beginPath(); c.moveTo(0, 12 * u); c.lineTo(0, 19 * u); c.stroke();
      c.restore();
    }
  },
  // L'enchaîné : une silhouette entravée par une chaîne
  34(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx, cy - 13 * u, 5 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - 7 * u, cy - 6 * u); c.lineTo(cx + 7 * u, cy - 6 * u); c.lineTo(cx + 5 * u, cy + 18 * u); c.lineTo(cx - 5 * u, cy + 18 * u); c.closePath(); c.fill();
    c.lineWidth = 1.5;
    for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(cx - 16 * u + k * 8 * u, cy + 4 * u, 4 * u, 2.4 * u, 0, 0, Math.PI * 2); c.stroke(); }
  },
  // Le glaive et le serpent
  35(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.6; c.beginPath(); c.moveTo(cx, cy - 20 * u); c.lineTo(cx, cy + 12 * u); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 8 * u, cy + 12 * u); c.lineTo(cx + 8 * u, cy + 12 * u); c.moveTo(cx, cy + 12 * u); c.lineTo(cx, cy + 20 * u); c.stroke();
    c.lineWidth = 2.2; c.beginPath();
    for (let k = 0; k <= 30; k++) { const y = cy + 9 * u - k * 0.9 * u, x = cx + Math.sin(k / 30 * Math.PI * 3.2) * 8 * u; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke();
    c.beginPath(); c.arc(cx + Math.sin(Math.PI * 3.2) * 8 * u, cy - 18 * u, 2.6 * u, 0, Math.PI * 2); c.fill();
  },
  // Les oiseaux des îles : deux perroquets face à face
  36(c, cx, cy, t) {
    const u = t / 40;
    for (const s of [-1, 1]) {
      c.save(); c.translate(cx + s * 9 * u, cy); c.scale(-s, 1);
      c.beginPath(); c.ellipse(0, 0, 6 * u, 10 * u, 0.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(3 * u, -11 * u, 4.5 * u, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(6 * u, -12 * u); c.quadraticCurveTo(11 * u, -11 * u, 8 * u, -6 * u); c.lineTo(6 * u, -9 * u); c.fill();
      c.beginPath(); c.moveTo(-3 * u, 8 * u); c.lineTo(-7 * u, 20 * u); c.lineTo(-1 * u, 10 * u); c.fill();
      c.restore();
    }
  },
  // La torche
  37(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.moveTo(cx - 4 * u, cy - 2 * u); c.lineTo(cx + 4 * u, cy - 2 * u); c.lineTo(cx + 2 * u, cy + 20 * u); c.lineTo(cx - 2 * u, cy + 20 * u); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx, cy - 22 * u); c.quadraticCurveTo(cx + 12 * u, cy - 10 * u, cx + 6 * u, cy - 3 * u); c.lineTo(cx - 6 * u, cy - 3 * u); c.quadraticCurveTo(cx - 12 * u, cy - 10 * u, cx, cy - 22 * u); c.fill();
    c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.moveTo(cx, cy - 14 * u); c.quadraticCurveTo(cx + 5 * u, cy - 7 * u, cx + 2 * u, cy - 4 * u); c.lineTo(cx - 2 * u, cy - 4 * u); c.quadraticCurveTo(cx - 5 * u, cy - 7 * u, cx, cy - 14 * u); c.fill(); c.restore();
  },
  // La tour foudroyée
  38(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.6;
    c.strokeRect(cx - 8 * u, cy - 8 * u, 16 * u, 26 * u);
    for (let k = 0; k < 3; k++) c.fillRect(cx - 8 * u + k * 6 * u, cy - 12 * u, 4 * u, 4 * u);
    c.fillRect(cx - 2 * u, cy + 10 * u, 4 * u, 8 * u);
    c.save(); c.fillStyle = "#B08D3C";
    c.beginPath(); c.moveTo(cx + 6 * u, cy - 22 * u); c.lineTo(cx - 3 * u, cy - 11 * u); c.lineTo(cx + 2 * u, cy - 11 * u); c.lineTo(cx - 6 * u, cy + 2 * u); c.lineTo(cx + 7 * u, cy - 13 * u); c.lineTo(cx + 2 * u, cy - 13 * u); c.closePath(); c.fill(); c.restore();
  },
  // L'aigle couronné
  39(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 3 * u, 5 * u, 9 * u, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx, cy - 8 * u, 4 * u, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + s * 3 * u, cy - 2 * u); c.lineTo(cx + s * 20 * u, cy - 9 * u); c.lineTo(cx + s * 17 * u, cy - 2 * u);
      c.lineTo(cx + s * 19 * u, cy); c.lineTo(cx + s * 14 * u, cy + 3 * u); c.lineTo(cx + s * 15 * u, cy + 6 * u); c.lineTo(cx + s * 4 * u, cy + 5 * u); c.fill();
    }
    c.beginPath(); c.moveTo(cx - 5 * u, cy - 14 * u); c.lineTo(cx - 5 * u, cy - 20 * u); c.lineTo(cx - 2 * u, cy - 17 * u); c.lineTo(cx, cy - 21 * u); c.lineTo(cx + 2 * u, cy - 17 * u); c.lineTo(cx + 5 * u, cy - 20 * u); c.lineTo(cx + 5 * u, cy - 14 * u); c.closePath(); c.fill();
  },
  // La fleur royale (fleur de lis)
  40(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.moveTo(cx, cy - 20 * u); c.quadraticCurveTo(cx + 7 * u, cy - 8 * u, cx, cy + 4 * u); c.quadraticCurveTo(cx - 7 * u, cy - 8 * u, cx, cy - 20 * u); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 2 * u, cy + 2 * u); c.quadraticCurveTo(cx + s * 18 * u, cy - 10 * u, cx + s * 14 * u, cy + 4 * u); c.quadraticCurveTo(cx + s * 12 * u, cy - 2 * u, cx + s * 2 * u, cy + 6 * u); c.fill(); }
    c.fillRect(cx - 9 * u, cy + 4 * u, 18 * u, 3.5 * u);
    c.beginPath(); c.moveTo(cx - 2 * u, cy + 7 * u); c.lineTo(cx - 6 * u, cy + 18 * u); c.lineTo(cx + 6 * u, cy + 18 * u); c.lineTo(cx + 2 * u, cy + 7 * u); c.fill();
  },
  // Le grimoire
  41(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 1.8;
    c.strokeRect(cx - 13 * u, cy - 17 * u, 26 * u, 34 * u);
    c.fillRect(cx - 13 * u, cy - 17 * u, 4 * u, 34 * u);
    c.fillRect(cx + 11 * u, cy - 3 * u, 5 * u, 6 * u);
    etoile(c, cx + 2 * u, cy, 5, 7 * u, 3 * u); c.stroke();
  },
  // La chouette
  42(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 4 * u, 12 * u, 15 * u, 0, 0, Math.PI * 2); c.fill();
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + s * 4 * u, cy - 9 * u); c.lineTo(cx + s * 11 * u, cy - 17 * u); c.lineTo(cx + s * 11 * u, cy - 7 * u); c.fill();
      c.save(); c.fillStyle = "#F7F1E3"; c.beginPath(); c.arc(cx + s * 5 * u, cy - 3 * u, 4.5 * u, 0, Math.PI * 2); c.fill(); c.restore();
      c.beginPath(); c.arc(cx + s * 5 * u, cy - 3 * u, 2 * u, 0, Math.PI * 2); c.fill();
    }
    c.save(); c.fillStyle = "#B08D3C"; c.beginPath(); c.moveTo(cx - 2 * u, cy + 1 * u); c.lineTo(cx + 2 * u, cy + 1 * u); c.lineTo(cx, cy + 5 * u); c.fill(); c.restore();
  },
  // La trompette
  43(c, cx, cy, t) {
    const u = t / 40;
    c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(cx - 18 * u, cy + 6 * u); c.lineTo(cx + 6 * u, cy - 4 * u); c.stroke();
    c.beginPath(); c.moveTo(cx + 4 * u, cy - 3 * u); c.lineTo(cx + 18 * u, cy - 14 * u); c.lineTo(cx + 20 * u, cy + 2 * u); c.closePath(); c.fill();
    c.lineWidth = 1.4; c.beginPath(); c.ellipse(cx - 6 * u, cy + 4 * u, 6 * u, 3 * u, -0.4, 0, Math.PI * 2); c.stroke();
    c.save(); c.globalAlpha = 0.6; c.lineWidth = 1.2;
    for (const r of [6, 10]) { c.beginPath(); c.arc(cx + 20 * u, cy - 6 * u, r * u, -0.9, 0.5); c.stroke(); }
    c.restore();
  },
  // La roue de fortune
  44(c, cx, cy, t) {
    const R = t * 0.42;
    c.lineWidth = 2;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx, cy, R * 0.2, 0, Math.PI * 2); c.fill();
    c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(cx, cy); c.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); }
    c.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; c.beginPath(); c.arc(cx + R * Math.cos(a), cy + R * Math.sin(a), 2, 0, Math.PI * 2); c.fill(); }
  },
  // L'étoile des mages
  45(c, cx, cy, t) {
    const u = t / 40;
    etoile(c, cx, cy - 2 * u, 5, 13 * u, 5.5 * u); c.fill();
    c.lineWidth = 1.2;
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 10; c.beginPath(); c.moveTo(cx + 15 * u * Math.cos(a), cy - 2 * u + 15 * u * Math.sin(a)); c.lineTo(cx + 19 * u * Math.cos(a), cy - 2 * u + 19 * u * Math.sin(a)); c.stroke(); }
  },
  // La mendiante : une silhouette voûtée tend sa sébile
  46(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.arc(cx - 2 * u, cy - 10 * u, 5 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - 9 * u, cy - 12 * u); c.quadraticCurveTo(cx - 2 * u, cy - 20 * u, cx + 5 * u, cy - 10 * u); c.lineTo(cx + 8 * u, cy + 18 * u); c.lineTo(cx - 12 * u, cy + 18 * u); c.closePath(); c.fill();
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx + 4 * u, cy); c.lineTo(cx + 13 * u, cy + 3 * u); c.stroke();
    c.beginPath(); c.arc(cx + 15 * u, cy + 3 * u, 4 * u, 0, Math.PI); c.fill();
  },
  // L'île déserte
  47(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 10 * u, 14 * u, 5 * u, 0, Math.PI, 0); c.fill();
    c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy + 6 * u); c.quadraticCurveTo(cx + 3 * u, cy - 6 * u, cx - 1 * u, cy - 14 * u); c.stroke();
    for (const s of [-1, 1]) for (const k of [0.6, 1]) { c.beginPath(); c.moveTo(cx - 1 * u, cy - 14 * u); c.quadraticCurveTo(cx + s * 8 * u * k, cy - 20 * u, cx + s * 13 * u * k, cy - 11 * u * k - 3 * u); c.stroke(); }
    c.lineWidth = 1.4;
    for (const dy of [14, 19]) { c.beginPath(); for (let i = 0; i <= 4; i++) { const x = cx - 18 * u + i * 9 * u; if (i) c.quadraticCurveTo(x - 4.5 * u, cy + (dy - 3) * u, x, cy + dy * u); else c.moveTo(x, cy + dy * u); } c.stroke(); }
  },
  // Le temps : le sablier
  48(c, cx, cy, t) {
    const u = t / 40;
    c.fillRect(cx - 12 * u, cy - 19 * u, 24 * u, 3 * u); c.fillRect(cx - 12 * u, cy + 16 * u, 24 * u, 3 * u);
    c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(cx - 9 * u, cy - 16 * u); c.quadraticCurveTo(cx - 9 * u, cy - 4 * u, cx - 1.5 * u, cy); c.quadraticCurveTo(cx - 9 * u, cy + 4 * u, cx - 9 * u, cy + 16 * u);
    c.moveTo(cx + 9 * u, cy - 16 * u); c.quadraticCurveTo(cx + 9 * u, cy - 4 * u, cx + 1.5 * u, cy); c.quadraticCurveTo(cx + 9 * u, cy + 4 * u, cx + 9 * u, cy + 16 * u); c.stroke();
    c.beginPath(); c.moveTo(cx - 6 * u, cy - 10 * u); c.lineTo(cx + 6 * u, cy - 10 * u); c.lineTo(cx, cy - 2 * u); c.fill();
    c.beginPath(); c.moveTo(cx - 8 * u, cy + 16 * u); c.lineTo(cx, cy + 8 * u); c.lineTo(cx + 8 * u, cy + 16 * u); c.fill();
  },
  // La colombe au rameau
  49(c, cx, cy, t) {
    const u = t / 40;
    c.beginPath(); c.ellipse(cx, cy + 2 * u, 12 * u, 6 * u, -0.2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(cx + 11 * u, cy - 3 * u, 4.5 * u, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - 2 * u, cy); c.quadraticCurveTo(cx - 6 * u, cy - 18 * u, cx + 6 * u, cy - 16 * u); c.quadraticCurveTo(cx + 2 * u, cy - 8 * u, cx + 4 * u, cy - 1 * u); c.fill();
    c.beginPath(); c.moveTo(cx - 11 * u, cy + 2 * u); c.lineTo(cx - 20 * u, cy - 2 * u); c.lineTo(cx - 19 * u, cy + 7 * u); c.fill();
    c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx + 15 * u, cy - 2 * u); c.lineTo(cx + 21 * u, cy + 6 * u); c.stroke();
    for (const k of [0.3, 0.65, 0.95]) { c.beginPath(); c.ellipse(cx + 15 * u + 6 * u * k, cy - 2 * u + 8 * u * k, 2.2 * u, 1.1 * u, 0.6, 0, Math.PI * 2); c.fill(); }
  },
  // Les ruines : des colonnes brisées
  50(c, cx, cy, t) {
    const u = t / 40;
    c.fillRect(cx - 19 * u, cy + 15 * u, 38 * u, 3 * u);
    for (const [dx, h, cassee] of [[-12, 26, false], [0, 15, true], [12, 21, true]]) {
      c.fillRect(cx + (dx - 3) * u, cy + (15 - h) * u, 6 * u, h * u);
      if (!cassee) c.fillRect(cx + (dx - 5) * u, cy + (13 - h) * u, 10 * u, 3 * u);
      else { c.beginPath(); c.moveTo(cx + (dx - 3) * u, cy + (15 - h) * u); c.lineTo(cx + dx * u, cy + (11 - h) * u); c.lineTo(cx + (dx + 3) * u, cy + (16 - h) * u); c.fill(); }
    }
    c.fillRect(cx + 4 * u, cy + 11 * u, 10 * u, 4 * u);
  },
  // La roue dans l'ornière
  51(c, cx, cy, t) {
    const u = t / 40;
    c.save(); c.beginPath(); c.rect(cx - 20 * u, cy - 20 * u, 40 * u, 28 * u); c.clip();
    c.lineWidth = 2; c.beginPath(); c.arc(cx, cy + 2 * u, 14 * u, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; c.moveTo(cx, cy + 2 * u); c.lineTo(cx + 14 * u * Math.cos(a), cy + 2 * u + 14 * u * Math.sin(a)); }
    c.stroke(); c.restore();
    c.beginPath(); c.moveTo(cx - 20 * u, cy + 6 * u); c.quadraticCurveTo(cx, cy + 12 * u, cx + 20 * u, cy + 6 * u); c.lineTo(cx + 20 * u, cy + 18 * u); c.lineTo(cx - 20 * u, cy + 18 * u); c.closePath(); c.fill();
  },
  // Le cloître : une arcade
  52(c, cx, cy, t) {
    const u = t / 40;
    c.fillRect(cx - 19 * u, cy - 14 * u, 38 * u, 3 * u); c.fillRect(cx - 19 * u, cy + 15 * u, 38 * u, 3 * u);
    c.lineWidth = 1.8;
    for (const dx of [-12, 0, 12]) {
      c.beginPath(); c.moveTo(cx + (dx - 5) * u, cy + 15 * u); c.lineTo(cx + (dx - 5) * u, cy - 3 * u); c.arc(cx + dx * u, cy - 3 * u, 5 * u, Math.PI, 0); c.lineTo(cx + (dx + 5) * u, cy + 15 * u); c.stroke();
    }
  }
});

function coeur(c, cx, cy, r) {
  c.beginPath();
  c.moveTo(cx, cy + r * 0.9);
  c.bezierCurveTo(cx - r * 1.3, cy, cx - r * 0.8, cy - r * 1.0, cx, cy - r * 0.35);
  c.bezierCurveTo(cx + r * 0.8, cy - r * 1.0, cx + r * 1.3, cy, cx, cy + r * 0.9);
  c.closePath();
}

/** Chien de profil, tourné vers la droite. (x, y) : bas gauche ; l : longueur. Sert aussi au compagnon du mage. */
function dessinerChien(c, x, y, l, phase = 0) {
  const u = l / 36;
  c.save();
  c.lineCap = "round";
  c.beginPath(); c.ellipse(x + 16 * u, y - 13 * u, 11 * u, 5.5 * u, 0, 0, Math.PI * 2); c.fill();      // corps
  c.beginPath(); c.ellipse(x + 29 * u, y - 20 * u, 5 * u, 4.2 * u, 0, 0, Math.PI * 2); c.fill();       // tête
  c.beginPath(); c.ellipse(x + 34 * u, y - 18.5 * u, 3 * u, 2 * u, 0, 0, Math.PI * 2); c.fill();       // museau
  c.beginPath(); c.ellipse(x + 26.5 * u, y - 22 * u, 2 * u, 4.5 * u, 0.5, 0, Math.PI * 2); c.fill();   // oreille
  c.lineWidth = 2.6 * u;
  const p = Math.sin(phase) * 3 * u;
  c.beginPath();
  c.moveTo(x + 9 * u, y - 10 * u); c.lineTo(x + 9 * u + p, y);                                          // pattes
  c.moveTo(x + 13 * u, y - 10 * u); c.lineTo(x + 13 * u - p, y);
  c.moveTo(x + 21 * u, y - 10 * u); c.lineTo(x + 21 * u - p, y);
  c.moveTo(x + 24 * u, y - 10 * u); c.lineTo(x + 24 * u + p, y);
  c.moveTo(x + 6 * u, y - 15 * u); c.quadraticCurveTo(x, y - 22 * u, x + 2 * u, y - 26 * u);            // queue
  c.stroke();
  c.restore();
}

return { ILLUSTRATIONS, dessinerChien };
})();

// ===== js/render/carte.js =====
M["js/render/carte.js"] = (() => {
// Dessin d'une carte (face et dos), commun au Chemin, au Duel, au carnet et à la planche.
// Une carte occupe un rectangle de CONFIG.carteL × CONFIG.carteH à partir de (x, y).
const { CONFIG, COULEURS } = M["js/config.js"];
const { ILLUSTRATIONS } = M["js/render/illustrations.js"];

const CL = CONFIG.carteL, CH = CONFIG.carteH;

/** Couleur de famille : un liseré, le glyphe en pied de carte. */
const FAMILLES = {
  preambule: { couleur: "#7A1F2B", glyphe: "⚷" },
  soleil: { couleur: "#b8862a", glyphe: "☉" },
  lune: { couleur: "#4f6290", glyphe: "☽" },
  mercure: { couleur: "#2f7d73", glyphe: "☿" },
  venus: { couleur: "#a8495e", glyphe: "♀" },
  mars: { couleur: "#a53b22", glyphe: "♂" },
  jupiter: { couleur: "#40549a", glyphe: "♃" },
  saturne: { couleur: "#57514a", glyphe: "♄" },
  hors: { couleur: "#2b5fae", glyphe: "◆" }
};

function arrondi(c, x, y, l, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + l - r, y); c.quadraticCurveTo(x + l, y, x + l, y + r);
  c.lineTo(x + l, y + h - r); c.quadraticCurveTo(x + l, y + h, x + l - r, y + h); c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}

/** Écrit un texte sur plusieurs lignes centrées ; renvoie le nombre de lignes. */
function ligneMultiple(c, texte, x, y, max, hl) {
  // Coupe aux espaces et après les traits d'union (PENSÉE-AMITIÉ)
  const mots = texte.split(" ").flatMap(m => m.split(/(?<=-)/)); let ligne = "", lignes = [];
  for (const m of mots) { const t = !ligne ? m : ligne.endsWith("-") ? ligne + m : ligne + " " + m; if (c.measureText(t).width > max && ligne) { lignes.push(ligne); ligne = m; } else ligne = t; }
  lignes.push(ligne);
  lignes.forEach((l, i) => c.fillText(l, x, y + i * hl - (lignes.length - 1) * hl / 2, max));
  return lignes.length;
}

function cadreDore(c, x, y) {
  const g = c.createLinearGradient(x, y, x + CL, y + CH);
  g.addColorStop(0, "#e4c675"); g.addColorStop(0.45, "#a9832f"); g.addColorStop(1, "#e0bd62");
  c.fillStyle = g; arrondi(c, x, y, CL, CH, 9); c.fill();
}

/** Face d'une carte. */
function dessinerFace(c, carte, x, y) {
  const bleue = carte.id === 0;
  const fam = FAMILLES[carte.famille];
  c.save();
  cadreDore(c, x, y);
  // parchemin (ou fond bleu uni)
  const p = c.createLinearGradient(x, y, x, y + CH);
  if (bleue) { p.addColorStop(0, "#3a72c4"); p.addColorStop(1, "#1f4d8f"); }
  else { p.addColorStop(0, "#fdf8ec"); p.addColorStop(1, "#eedfbd"); }
  c.fillStyle = p; arrondi(c, x + 3, y + 3, CL - 6, CH - 6, 7); c.fill();
  // filet intérieur
  c.strokeStyle = bleue ? "rgba(247,241,227,.6)" : fam.couleur; c.lineWidth = 1;
  arrondi(c, x + 6, y + 6, CL - 12, CH - 12, 5); c.stroke();

  if (!bleue) {
    // halo derrière l'image, à la couleur de la famille
    const h = c.createRadialGradient(x + CL / 2, y + 50, 2, x + CL / 2, y + 50, 30);
    h.addColorStop(0, hexA(fam.couleur, 0.22)); h.addColorStop(1, hexA(fam.couleur, 0));
    c.fillStyle = h; c.fillRect(x + 8, y + 20, CL - 16, 60);
    // médaillon du numéro
    c.fillStyle = "#fdf8ec"; c.strokeStyle = "#a9832f"; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x + CL / 2, y + 13, 9, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = COULEURS.bordeaux; c.font = "bold 10px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(String(carte.id), x + CL / 2, y + 13.5);
  }
  const encre = bleue ? COULEURS.creme : COULEURS.bordeaux;
  c.fillStyle = encre; c.strokeStyle = encre;
  const dessin = ILLUSTRATIONS[carte.id];
  if (dessin) { c.save(); dessin(c, x + CL / 2, y + 50, 44); c.restore(); }
  else if (bleue) { c.font = "28px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◆", x + CL / 2, y + 50); }

  // bandeau du nom
  c.font = "bold 9.5px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
  const yb = y + 86;
  c.fillStyle = bleue ? "rgba(247,241,227,.18)" : COULEURS.bordeaux;
  c.beginPath(); c.moveTo(x + 7, yb - 10); c.lineTo(x + CL - 7, yb - 10); c.lineTo(x + CL - 11, yb); c.lineTo(x + CL - 7, yb + 10);
  c.lineTo(x + 7, yb + 10); c.lineTo(x + 11, yb); c.closePath(); c.fill();
  c.fillStyle = COULEURS.creme;
  if (c.measureText(carte.nom.toUpperCase()).width > CL - 22) c.font = "bold 7.5px 'Cinzel', serif";
  ligneMultiple(c, carte.nom.toUpperCase(), x + CL / 2, yb, CL - 22, 8);

  c.font = "italic 600 13.5px 'EB Garamond', serif"; c.fillStyle = bleue ? COULEURS.creme : COULEURS.bleu;
  ligneMultiple(c, carte.motCle, x + CL / 2, y + 108, CL - 12, 12);
  c.font = "11px 'EB Garamond', serif"; c.fillStyle = bleue ? COULEURS.creme : fam.couleur;
  c.fillText(fam.glyphe, x + CL / 2, y + CH - 11);
  if (carte.forte) {
    c.fillStyle = COULEURS.bordeaux; arrondi(c, x + CL - 30, y + CH - 18, 24, 11, 3); c.fill();
    c.fillStyle = "#f3d58a"; c.font = "bold 6.5px 'Cinzel', serif"; c.fillText("FORTE", x + CL - 18, y + CH - 12.3);
  }
  c.restore();
}

/** Dos d'une carte : `glyphe` (planète) et `legende` facultatifs. */
function dessinerDos(c, x, y, glyphe = "✶", legende = "") {
  c.save();
  cadreDore(c, x, y);
  const g = c.createLinearGradient(x, y, x + CL, y + CH);
  g.addColorStop(0, "#8a2433"); g.addColorStop(1, "#4d1019");
  c.fillStyle = g; arrondi(c, x + 3, y + 3, CL - 6, CH - 6, 7); c.fill();
  // treillis doré
  c.save(); arrondi(c, x + 7, y + 7, CL - 14, CH - 14, 5); c.clip();
  c.strokeStyle = "rgba(228,198,117,.28)"; c.lineWidth = 1;
  for (let k = -CH; k < CL + CH; k += 12) {
    c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + k + CH, y + CH); c.stroke();
    c.beginPath(); c.moveTo(x + k, y + CH); c.lineTo(x + k + CH, y); c.stroke();
  }
  c.restore();
  c.strokeStyle = "#e4c675"; c.lineWidth = 1; arrondi(c, x + 7, y + 7, CL - 14, CH - 14, 5); c.stroke();
  // médaillon central
  c.fillStyle = "#4d1019"; c.strokeStyle = "#e4c675"; c.lineWidth = 2;
  c.beginPath(); c.arc(x + CL / 2, y + CH / 2 - 4, 22, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#f3d58a"; c.font = "28px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(glyphe, x + CL / 2, y + CH / 2 - 3);
  if (legende) { c.font = "italic 600 13px 'EB Garamond', serif"; c.fillText(legende, x + CL / 2, y + CH - 18); }
  c.restore();
}

/** Couleur #rrggbb avec transparence. */
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Peint une carte dans un canvas à la taille d'une carte (densité de l'écran comprise). */
function peindreDansCanvas(canvas, carte, face = true) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = CL * dpr; canvas.height = CH * dpr;
  const c = canvas.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, CL, CH);
  if (face) dessinerFace(c, carte, 0, 0); else dessinerDos(c, 0, 0);
}

return { FAMILLES, arrondi, ligneMultiple, dessinerFace, dessinerDos, hexA, peindreDansCanvas };
})();

// ===== js/render/carteDuel.js =====
M["js/render/carteDuel.js"] = (() => {
// Cartes du Duel, dessinées à la manière des jeux de cartes à duel : cadre selon la sorte de carte
// (apparition ambrée, influence vert-bleu, présage violet, figure d'accord pourpre et or, carte forte dorée),
// nom et attribut planétaire, étoiles de niveau, grande image sur un fond propre à chaque planète, texte
// d'effet, ATK / DEF. Format de base : 150 × 219 (proportions d'une carte à jouer).
const { COULEURS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { DUEL } = M["js/data/duel.js"];
const { FIGURES } = M["js/data/accords.js"];
const { ILLUSTRATIONS } = M["js/render/illustrations.js"];
const { FAMILLES, arrondi, hexA } = M["js/render/carte.js"];

const DL = 150, DH = 219;

const CADRES = {
  apparition: ["#e2a654", "#a8662a", "#6e3c16"],
  forte: ["#fff1b8", "#d4a43c", "#7a5410"],
  influence: ["#3fb3a6", "#1c7d75", "#0d4743"],
  presage: ["#c9599f", "#8c2a68", "#4f0f39"],
  accord: ["#a77ad8", "#5e2f99", "#2a0f52"],
  bleue: ["#5b8fe0", "#2b5fae", "#173a75"]
};
const NOMS_FAMILLE = { preambule: "Cartes maîtresses", soleil: "Soleil", lune: "Lune", mercure: "Mercure", venus: "Vénus", mars: "Mars", jupiter: "Jupiter", saturne: "Saturne", hors: "Hors jeu" };
const ACCORD_FAM = { couleur: "#7a4bb0", glyphe: "✦" };

const est = id => (id >= 100 ? FIGURES[id] : DUEL[id]);
const nom = id => (id >= 100 ? FIGURES[id].nom : CARTE_PAR_ID[id].nom);
const famille = id => (id >= 100 ? ACCORD_FAM : FAMILLES[CARTE_PAR_ID[id].famille]);

function lignes(c, texte, max) {
  const mots = texte.split(" "), res = [];
  let l = "";
  for (const m of mots) { const t = l ? l + " " + m : m; if (c.measureText(t).width > max && l) { res.push(l); l = m; } else l = t; }
  if (l) res.push(l);
  return res;
}

/** Fond de l'image, propre à chaque planète. */
function fondArt(c, id, fx, fy, fl, fh, coul) {
  const art = c.createRadialGradient(fx + fl / 2, fy + fh * 0.45, 4, fx + fl / 2, fy + fh / 2, fl * 0.8);
  art.addColorStop(0, hexA(coul, 0.95)); art.addColorStop(0.55, hexA(coul, 0.55)); art.addColorStop(1, "#120a1c");
  c.fillStyle = art; c.fillRect(fx, fy, fl, fh);
  const f = id >= 100 ? "accord" : CARTE_PAR_ID[id].famille;
  const hasard = k => { const s = Math.sin((id + 1) * 91.7 + k * 12.9898) * 43758.5453; return s - Math.floor(s); };
  c.save();
  if (f === "lune" || f === "saturne" || f === "accord" || f === "preambule") {
    for (let k = 0; k < 26; k++) { c.fillStyle = `rgba(255,250,230,${0.25 + hasard(k) * 0.6})`; c.beginPath(); c.arc(fx + hasard(k + 40) * fl, fy + hasard(k + 80) * fh, 0.4 + hasard(k + 120) * 1.1, 0, Math.PI * 2); c.fill(); }
  }
  if (f === "saturne") { c.strokeStyle = "rgba(255,240,200,.18)"; c.lineWidth = 2; c.beginPath(); c.ellipse(fx + fl / 2, fy + fh / 2, fl * 0.55, fh * 0.16, -0.3, 0, Math.PI * 2); c.stroke(); }
  if (f === "mars") for (let k = 0; k < 18; k++) { c.fillStyle = `rgba(255,${120 + hasard(k) * 100},60,${0.25 + hasard(k + 7) * 0.5})`; c.beginPath(); c.arc(fx + hasard(k + 3) * fl, fy + fh - hasard(k + 9) * fh * 0.7, 0.8 + hasard(k + 5) * 1.6, 0, Math.PI * 2); c.fill(); }
  if (f === "venus") for (let k = 0; k < 10; k++) { c.fillStyle = `rgba(255,210,220,${0.15 + hasard(k) * 0.3})`; c.beginPath(); c.ellipse(fx + hasard(k + 2) * fl, fy + hasard(k + 4) * fh, 3, 1.5, hasard(k) * 3, 0, Math.PI * 2); c.fill(); }
  if (f === "jupiter") for (let k = 0; k < 5; k++) { c.fillStyle = "rgba(255,255,255,.07)"; c.beginPath(); c.ellipse(fx + hasard(k) * fl, fy + 12 + k * 18, 40, 6, 0, 0, Math.PI * 2); c.fill(); }
  if (f === "mercure") { c.strokeStyle = "rgba(220,255,250,.12)"; c.lineWidth = 1; for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(fx, fy + k * 12); c.quadraticCurveTo(fx + fl / 2, fy + k * 12 - 10, fx + fl, fy + k * 12); c.stroke(); } }
  if (f === "soleil" || f === "hors" || f === "accord" || f === "preambule") {
    c.strokeStyle = "rgba(255,240,200,.12)"; c.lineWidth = 6;
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.beginPath(); c.moveTo(fx + fl / 2, fy + fh / 2); c.lineTo(fx + fl / 2 + Math.cos(a) * 120, fy + fh / 2 + Math.sin(a) * 120); c.stroke(); }
  }
  // l'élément de la planète, au pied de l'image
  if (f === "lune") {   // l'eau : trois vagues superposées
    for (let k = 0; k < 3; k++) {
      const base = fy + fh * (0.74 + k * 0.09), amp = fh * (0.035 - k * 0.006);
      c.fillStyle = `rgba(${150 - k * 30},${190 - k * 25},255,${0.2 - k * 0.03})`;
      c.beginPath(); c.moveTo(fx, fy + fh);
      for (let x = 0; x <= fl; x += 4) c.lineTo(fx + x, base - amp * Math.sin(x / (fl * 0.16) + k * 1.7 + hasard(k) * 3));
      c.lineTo(fx + fl, fy + fh); c.closePath(); c.fill();
      c.strokeStyle = `rgba(230,245,255,${0.28 - k * 0.07})`; c.lineWidth = 1;
      c.beginPath(); for (let x = 0; x <= fl; x += 4) c[x ? "lineTo" : "moveTo"](fx + x, base - amp * Math.sin(x / (fl * 0.16) + k * 1.7 + hasard(k) * 3)); c.stroke();
    }
  }
  if (f === "mars") {   // le feu : des langues de flamme qui montent du bas
    for (let k = 0; k < 7; k++) {
      const x = fx + (k + 0.5) * fl / 7 + (hasard(k + 30) - 0.5) * 8, H = fh * (0.18 + hasard(k + 31) * 0.22), l = fl / 9;
      const g = c.createLinearGradient(0, fy + fh, 0, fy + fh - H);
      g.addColorStop(0, "rgba(255,190,80,.32)"); g.addColorStop(1, "rgba(255,80,30,0)");
      c.fillStyle = g; c.beginPath(); c.moveTo(x - l, fy + fh);
      c.quadraticCurveTo(x - l * 0.6, fy + fh - H * 0.6, x + (hasard(k) - 0.5) * l, fy + fh - H);
      c.quadraticCurveTo(x + l * 0.6, fy + fh - H * 0.5, x + l, fy + fh); c.closePath(); c.fill();
    }
  }
  if (f === "saturne") {   // la terre : des strates et des galets
    for (let k = 0; k < 4; k++) {
      c.strokeStyle = `rgba(210,190,160,${0.16 - k * 0.025})`; c.lineWidth = 1.2;
      c.beginPath(); const y = fy + fh * (0.78 + k * 0.06);
      for (let x = 0; x <= fl; x += 6) c[x ? "lineTo" : "moveTo"](fx + x, y + Math.sin(x / 14 + k * 2 + hasard(k)) * 1.6); c.stroke();
    }
    for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(180,160,135,${0.22 + hasard(k + 60) * 0.15})`; c.beginPath(); c.ellipse(fx + hasard(k + 61) * fl, fy + fh * (0.84 + hasard(k + 62) * 0.13), 2 + hasard(k + 63) * 3, 1.3 + hasard(k + 64) * 1.6, hasard(k) * 3, 0, Math.PI * 2); c.fill(); }
  }
  if (f === "jupiter") {   // la foudre, au loin dans les nuées
    c.strokeStyle = "rgba(220,230,255,.16)"; c.lineWidth = 1.4;
    for (let k = 0; k < 2; k++) {
      let x = fx + fl * (0.2 + k * 0.55 + hasard(k + 70) * 0.1), y = fy + 4; c.beginPath(); c.moveTo(x, y);
      for (let n = 0; n < 6; n++) { x += (hasard(k * 10 + n + 71) - 0.5) * 14; y += fh * 0.08; c.lineTo(x, y); } c.stroke();
    }
  }
  // vignette
  const v = c.createRadialGradient(fx + fl / 2, fy + fh / 2, fl * 0.3, fx + fl / 2, fy + fh / 2, fl * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  c.fillStyle = v; c.fillRect(fx, fy, fl, fh);
  c.restore();
}

/** Un dégradé d'or poli, en diagonale. */
function orPoli(c, l, h) {
  const g = c.createLinearGradient(0, 0, l, h);
  g.addColorStop(0, "#fff1c4"); g.addColorStop(0.22, "#c9a24a"); g.addColorStop(0.45, "#fbe7a8");
  g.addColorStop(0.7, "#9c7a2c"); g.addColorStop(1, "#f3d58a");
  return g;
}

/** Cadre d'or poli et fleurons aux quatre coins (cartes complètes et compactes). */
function orner(c, l, h, r, fort) {
  c.save();
  c.strokeStyle = orPoli(c, l, h); c.lineWidth = fort ? 3 : 2;
  arrondi(c, 1.5, 1.5, l - 3, h - 3, r); c.stroke();
  c.strokeStyle = "rgba(20,12,30,.55)"; c.lineWidth = 1;
  arrondi(c, 4, 4, l - 8, h - 8, Math.max(2, r - 2)); c.stroke();
  const f = Math.max(3, l * 0.03), o = 3.5;
  c.fillStyle = orPoli(c, l, h);
  for (const [x, y] of [[o, o], [l - o, o], [o, h - o], [l - o, h - o]]) {
    c.beginPath(); c.moveTo(x, y - f); c.lineTo(x + f * 0.45, y); c.lineTo(x, y + f); c.lineTo(x - f * 0.45, y); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x - f, y); c.lineTo(x, y + f * 0.45); c.lineTo(x + f, y); c.lineTo(x, y - f * 0.45); c.closePath(); c.fill();
  }
  c.restore();
}

/** Liseré d'une fenêtre d'image : un filet d'or et un filet à la couleur de la planète, une ombre intérieure. */
function fenetre(c, x, y, l, h, couleur) {
  c.save();
  const v = c.createRadialGradient(x + l / 2, y + h / 2, Math.min(l, h) * 0.35, x + l / 2, y + h / 2, Math.max(l, h) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.45)");
  c.fillStyle = v; c.fillRect(x, y, l, h);
  c.strokeStyle = hexA(couleur, 0.9); c.lineWidth = 1.2; c.strokeRect(x + 1.5, y + 1.5, l - 3, h - 3);
  c.strokeStyle = orPoli(c, l, h); c.lineWidth = 1.2; c.strokeRect(x, y, l, h);
  c.restore();
}

/** Encre de l'image : un dégradé crème à or, avec une ombre portée. */
function encre(c, fy, fh) {
  const g = c.createLinearGradient(0, fy, 0, fy + fh);
  g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#f3d58a");
  c.fillStyle = g; c.strokeStyle = g;
  c.shadowColor = "rgba(0,0,0,.65)"; c.shadowBlur = 6; c.shadowOffsetY = 2;
}

/** Dessine la face d'une carte de duel (ou d'une figure d'accord) à (x, y), à l'échelle `s`. */
function dessinerCarteDuel(c, id, x = 0, y = 0, s = 1) {
  const x0 = est(id), fam = famille(id);
  const sorte = id >= 100 ? "accord" : id === 0 ? "bleue" : x0.forte ? "forte" : x0.type;
  const [c1, c2, c3] = CADRES[sorte];
  c.save();
  c.translate(x, y); c.scale(s, s);

  const g = c.createLinearGradient(0, 0, DL, DH);
  g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c3);
  c.fillStyle = g; arrondi(c, 0, 0, DL, DH, 7); c.fill();
  orner(c, DL, DH, 6, sorte === "forte" || sorte === "accord");
  c.save(); arrondi(c, 3, 3, DL - 6, DH - 6, 5); c.clip();
  c.strokeStyle = "rgba(255,255,255,.06)"; c.lineWidth = 1;
  for (let k = -DH; k < DL; k += 6) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + DH, DH); c.stroke(); }
  c.restore();

  // barre du nom
  const nb = c.createLinearGradient(0, 7, 0, 27);
  nb.addColorStop(0, "#fdf8ec"); nb.addColorStop(1, sorte === "forte" ? "#f3d58a" : "#e6d5ae");
  c.fillStyle = nb; arrondi(c, 7, 7, DL - 14, 20, 3); c.fill();
  c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 0.8; c.stroke();
  c.fillStyle = COULEURS.encre; c.font = "bold 11px 'Cinzel', serif"; c.textAlign = "left"; c.textBaseline = "middle";
  let n = nom(id);
  while (c.measureText(n).width > DL - 46 && n.length > 4) n = n.slice(0, -2) + "…";
  c.fillText(n, 12, 17.5);
  c.fillStyle = fam.couleur; c.beginPath(); c.arc(DL - 18, 17, 8.5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#f3d58a"; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = "#fdf8ec"; c.font = "11px 'EB Garamond', serif"; c.textAlign = "center"; c.fillText(fam.glyphe, DL - 18, 17.5);

  // niveau ou sorte
  if (x0.type === "presage" || x0.type === "influence") {
    c.font = "bold 8px 'Cinzel', serif"; c.fillStyle = "#fdf8ec"; c.textAlign = "right";
    const st = x0.sousType === "equipement" ? " ⚒" : x0.sousType === "continue" ? " ∞" : x0.sousType === "terrain" ? " ⌂" : "";
    c.fillText(x0.type === "presage" ? "[ PRÉSAGE ◈ ]" : `[ INFLUENCE ✦${st} ]`, DL - 10, 34);
  } else {
    for (let k = 0; k < x0.niveau; k++) {
      const sx = DL - 14 - k * 12;
      c.beginPath(); c.arc(sx - 4.5, 34, 5, 0, Math.PI * 2); c.fillStyle = sorte === "accord" ? "#5e2f99" : "#b8322b"; c.fill();
      c.fillStyle = "#ffe9a6"; c.font = "8px serif"; c.textAlign = "center"; c.fillText("★", sx - 4.5, 34.5);
    }
  }

  // image
  const fx = 13, fy = 42, fl = DL - 26, fh = 74;
  c.fillStyle = "#1a1224"; c.fillRect(fx - 2, fy - 2, fl + 4, fh + 4);
  fondArt(c, id, fx, fy, fl, fh, fam.couleur);
  c.save(); c.beginPath(); c.rect(fx, fy, fl, fh); c.clip();
  if (id >= 100) {
    // la figure d'accord réunit les deux cartes de la règle
    const [a, b] = x0.materiaux.map(m => (Array.isArray(m) ? m[0] : m));
    c.fillStyle = "rgba(243,213,138,.25)"; c.beginPath(); c.arc(fx + fl / 2, fy + fh / 2, 32, 0, Math.PI * 2); c.fill();
    encre(c, fy, fh);
    if (ILLUSTRATIONS[a]) { c.save(); ILLUSTRATIONS[a](c, fx + fl * 0.32, fy + fh * 0.48, 46); c.restore(); }
    encre(c, fy, fh);
    if (ILLUSTRATIONS[b]) { c.save(); ILLUSTRATIONS[b](c, fx + fl * 0.68, fy + fh * 0.52, 46); c.restore(); }
    c.shadowBlur = 0; c.fillStyle = "#f3d58a"; c.font = "16px serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("✦", fx + fl / 2, fy + fh * 0.5);
  } else {
    c.fillStyle = "rgba(255,255,255,.16)"; c.beginPath(); c.arc(fx + fl / 2, fy + fh / 2, 28, 0, Math.PI * 2); c.fill();
    encre(c, fy, fh);
    const dessin = ILLUSTRATIONS[id];
    if (dessin) { c.save(); dessin(c, fx + fl / 2, fy + fh / 2, 62); c.restore(); }
    else { c.font = "54px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◆", fx + fl / 2, fy + fh / 2); }
  }
  c.restore();
  fenetre(c, fx, fy, fl, fh, fam.couleur);

  // texte
  // le texte prend la place : il doit se lire même quand la carte est petite
  const tx = 7, ty = 121, tl = DL - 14, th = DH - 121 - 10;
  const tb = c.createLinearGradient(0, ty, 0, ty + th);
  tb.addColorStop(0, "#fbf3df"); tb.addColorStop(1, "#ead9b2");
  c.fillStyle = tb; arrondi(c, tx, ty, tl, th, 3); c.fill();
  c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 0.8; c.stroke();
  c.textAlign = "left"; c.textBaseline = "alphabetic";
  c.fillStyle = COULEURS.encre; c.font = "bold 8px 'Cinzel', serif";
  const typeLigne = id >= 100 ? `[ Figure d’accord / ${x0.favorable ? "Favorable" : "Néfaste"} ]`
    : x0.type === "apparition" ? `[ ${NOMS_FAMILLE[CARTE_PAR_ID[id].famille]} / Figure${x0.forte ? " / Forte" : ""} ]`
    : x0.type === "presage" ? `[ Présage / ${{ attaque: "Attaque", invocation: "Invocation", influence: "Chaîne" }[x0.declencheur]} ]`
    : `[ Influence${x0.sousType === "equipement" ? " / Équipement" : x0.sousType === "continue" ? " / Continue" : x0.sousType === "terrain" ? " / Terrain" : ""} ]`;
  c.fillText(typeLigne, tx + 4, ty + 10);
  c.fillStyle = "#3a2f28";
  const avecStats = x0.atk != null, place = th - 17 - (avecStats ? 13 : 2);
  // la plus grande taille où tout le texte tient
  let taille = 10.4, ls;
  for (; taille > 7; taille -= 0.4) {
    c.font = `italic 500 ${taille}px 'EB Garamond', serif`;
    ls = lignes(c, x0.texte, tl - 8);
    if (ls.length * taille * 1.04 <= place) break;
  }
  ls.forEach((l, i) => c.fillText(l, tx + 4, ty + 15 + taille + i * taille * 1.04));
  if (avecStats) {
    c.strokeStyle = "rgba(0,0,0,.4)"; c.lineWidth = 0.7; c.beginPath(); c.moveTo(tx + 4, ty + th - 11); c.lineTo(tx + tl - 4, ty + th - 11); c.stroke();
    c.font = "bold 9.5px 'Cinzel', serif"; c.fillStyle = COULEURS.encre; c.textAlign = "right";
    c.fillText(`ATK/${x0.atk}   DEF/${x0.def}`, tx + tl - 4, ty + th - 3);
  }
  c.font = "6px 'Cinzel', serif"; c.fillStyle = "rgba(253,248,236,.85)"; c.textAlign = "left";
  const pied = id >= 100 ? `Accord ${x0.regles[0].replace(">", " · ").replace("-", " · ")} · Belline` : id === 0 ? "Carte Bleue · Belline" : `N° ${id} · Belline`;
  c.fillText(pied, 9, DH - 4);
  c.restore();
}

/** Dos d'une carte de duel. */
function dessinerDosDuel(c, x = 0, y = 0, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(DL / 2, DH / 2, 10, DL / 2, DH / 2, DH * 0.7);
  g.addColorStop(0, "#7a2a3a"); g.addColorStop(0.6, "#4a1424"); g.addColorStop(1, "#200810");
  c.fillStyle = g; arrondi(c, 0, 0, DL, DH, 7); c.fill();
  c.strokeStyle = "#e4c675"; c.lineWidth = 2; arrondi(c, 4, 4, DL - 8, DH - 8, 5); c.stroke();
  c.lineWidth = 0.8; arrondi(c, 9, 9, DL - 18, DH - 18, 4); c.stroke();
  c.save(); c.translate(DL / 2, DH / 2);
  c.strokeStyle = "rgba(228,198,117,.35)"; c.lineWidth = 1;
  for (let k = 0; k < 24; k++) { c.rotate(Math.PI / 12); c.beginPath(); c.moveTo(0, 28); c.lineTo(0, 62); c.stroke(); }
  c.fillStyle = "#2a0c16"; c.strokeStyle = "#e4c675"; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 30, 40, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#f3d58a"; c.font = "34px serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("✶", 0, 1);
  c.restore();
  c.fillStyle = "#e4c675"; c.font = "bold 9px 'Cinzel', serif"; c.textAlign = "center";
  c.fillText("BELLINE", DL / 2, DH - 22);
  c.restore();
}

/** L'apparition elle-même : l'image de la carte, lumineuse, sur fond transparent (l'hologramme du terrain). */
/**
 * Hologramme d'une apparition, dessiné une fois pour toutes (aucune animation, aucun filtre CSS : rien ne scintille).
 * Un projecteur au sol, un cône de lumière à la couleur de la planète, la figure lumineuse, de fines lignes de balayage,
 * et un fondu vers le bas pour qu'elle se pose sur sa carte.
 */
function dessinerHologramme(c, id, taille) {
  const fam = famille(id), T = taille, cx = T / 2, sol = T * 0.97;
  c.save();
  c.clearRect(0, 0, T, T);
  // cône de lumière depuis le projecteur
  const cone = c.createLinearGradient(0, sol, 0, T * 0.08);
  cone.addColorStop(0, hexA(fam.couleur, 0.55)); cone.addColorStop(0.55, hexA(fam.couleur, 0.16)); cone.addColorStop(1, hexA(fam.couleur, 0));
  c.fillStyle = cone;
  c.beginPath(); c.moveTo(cx - T * 0.1, sol); c.lineTo(cx - T * 0.46, T * 0.08); c.lineTo(cx + T * 0.46, T * 0.08); c.lineTo(cx + T * 0.1, sol); c.closePath(); c.fill();
  // halo derrière la figure
  const g = c.createRadialGradient(cx, T * 0.5, 2, cx, T * 0.5, T * 0.45);
  g.addColorStop(0, hexA(fam.couleur, 0.5)); g.addColorStop(0.6, hexA(fam.couleur, 0.14)); g.addColorStop(1, hexA(fam.couleur, 0));
  c.fillStyle = g; c.fillRect(0, 0, T, T);
  // la figure : deux passes, une lueur colorée puis le trait clair
  const figure = (couleur, flou) => {
    c.save();
    c.shadowColor = couleur; c.shadowBlur = flou;
    c.fillStyle = "#fff8e6"; c.strokeStyle = "#fff8e6";
    if (id >= 100) {
      const [a, b] = FIGURES[id].materiaux.map(m => (Array.isArray(m) ? m[0] : m));
      if (ILLUSTRATIONS[a]) { c.save(); ILLUSTRATIONS[a](c, T * 0.35, T * 0.5, T * 0.56); c.restore(); }
      if (ILLUSTRATIONS[b]) { c.save(); ILLUSTRATIONS[b](c, T * 0.65, T * 0.48, T * 0.56); c.restore(); }
    } else if (ILLUSTRATIONS[id]) ILLUSTRATIONS[id](c, cx, T * 0.5, T * 0.72);
    c.restore();
  };
  figure(fam.couleur, T * 0.12);
  figure("#fff3c4", T * 0.04);
  // lignes de balayage, fixes
  c.globalCompositeOperation = "destination-out";
  c.fillStyle = "rgba(0,0,0,.2)";
  for (let y = 0; y < T; y += 3) c.fillRect(0, y, T, 1);
  // fondu vers le bas
  const fondu = c.createLinearGradient(0, T * 0.68, 0, T);
  fondu.addColorStop(0, "rgba(0,0,0,0)"); fondu.addColorStop(1, "rgba(0,0,0,.92)");
  c.fillStyle = fondu; c.fillRect(0, T * 0.68, T, T * 0.32);
  c.globalCompositeOperation = "source-over";
  // le projecteur au sol
  const p = c.createRadialGradient(cx, sol, 0, cx, sol, T * 0.18);
  p.addColorStop(0, "rgba(255,248,225,.9)"); p.addColorStop(0.4, hexA(fam.couleur, 0.6)); p.addColorStop(1, hexA(fam.couleur, 0));
  c.fillStyle = p; c.beginPath(); c.ellipse(cx, sol, T * 0.18, T * 0.05, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}

/** Peint une carte de duel dans un canvas, à la largeur CSS `largeur`. */

// ---------- Formats lisibles en petit ----------

const borne = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Carte compacte, dessinée à sa taille réelle (`l` px de large) avec des textes à taille fixe, pour rester
 * lisible en petit : nom en gros, niveau, image ; en bas l'ATK et la DEF en grands chiffres (ou la sorte de carte).
 * `jeton` : sans bandeau du bas (sur le terrain, les valeurs en jeu s'affichent à part).
 */
function dessinerCarteCompacte(c, id, l, jeton = false) {
  const h = l * DH / DL, x0 = est(id), fam = famille(id);
  const sorte = id >= 100 ? "accord" : id === 0 ? "bleue" : x0.forte ? "forte" : x0.type;
  const [c1, c2, c3] = CADRES[sorte];
  c.save();
  const g = c.createLinearGradient(0, 0, l, h);
  g.addColorStop(0, c1); g.addColorStop(0.5, c2); g.addColorStop(1, c3);
  c.fillStyle = g; arrondi(c, 0, 0, l, h, Math.max(4, l * 0.05)); c.fill();
  orner(c, l, h, Math.max(3, l * 0.045), sorte === "forte" || sorte === "accord");

  // bandeau du nom
  const fn = borne(l * 0.105, 10, 16), bh = fn + 8, m = Math.max(3, l * 0.035);
  const nb = c.createLinearGradient(0, m, 0, m + bh);
  nb.addColorStop(0, "#fdf8ec"); nb.addColorStop(1, sorte === "forte" ? "#f3d58a" : "#e6d5ae");
  c.fillStyle = nb; arrondi(c, m, m, l - 2 * m, bh, 3); c.fill();
  const rM = bh * 0.36;
  c.fillStyle = fam.couleur; c.beginPath(); c.arc(l - m - rM - 3, m + bh / 2, rM, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#fdf8ec"; c.font = `${Math.round(rM * 1.5)}px 'EB Garamond', serif`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(fam.glyphe, l - m - rM - 3, m + bh / 2 + 1);
  c.fillStyle = COULEURS.encre; c.textAlign = "left";
  const place = l - 2 * m - 2 * rM - 12;
  let n = nom(id), taille = fn;
  // le nom entier d'abord, en rapetissant un peu ; il n'est coupé qu'en dernier recours
  c.font = `bold ${taille}px 'Cinzel', serif`;
  while (c.measureText(n).width > place && taille > fn * 0.78) { taille -= 0.5; c.font = `bold ${taille}px 'Cinzel', serif`; }
  while (c.measureText(n).width > place && n.length > 3) n = n.slice(0, -2) + "…";
  c.fillText(n, m + 4, m + bh / 2 + 1);

  // image
  const basH = jeton ? 0 : borne(l * 0.2, 18, 30);
  const ax = m, ay = m + bh + 2, al = l - 2 * m, ah = h - ay - m - basH - (jeton ? 0 : 2);
  c.save(); c.beginPath(); c.rect(ax, ay, al, ah); c.clip();
  fondArt(c, id, ax, ay, al, ah, fam.couleur);
  const t = Math.min(al, ah) * 0.82, cx = ax + al / 2, cy = ay + ah / 2;
  if (id >= 100) {
    const [a, b] = x0.materiaux.map(mm => (Array.isArray(mm) ? mm[0] : mm));
    encre(c, ay, ah); if (ILLUSTRATIONS[a]) { c.save(); ILLUSTRATIONS[a](c, cx - al * 0.18, cy, t * 0.7); c.restore(); }
    encre(c, ay, ah); if (ILLUSTRATIONS[b]) { c.save(); ILLUSTRATIONS[b](c, cx + al * 0.18, cy, t * 0.7); c.restore(); }
  } else {
    encre(c, ay, ah);
    if (ILLUSTRATIONS[id]) { c.save(); ILLUSTRATIONS[id](c, cx, cy, t); c.restore(); }
    else { c.font = `${Math.round(t * 0.6)}px 'EB Garamond', serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◆", cx, cy); }
  }
  c.restore();
  fenetre(c, ax, ay, al, ah, fam.couleur);
  // niveau (étoiles) ou sorte, en surimpression sur l'image
  const pe = borne(l * 0.075, 8, 12);
  if (x0.niveau) {
    c.font = `${pe}px serif`; c.textAlign = "left"; c.textBaseline = "top";
    const txt = "★".repeat(x0.niveau);
    const lt = c.measureText(txt).width + 6;
    c.fillStyle = "rgba(14,10,24,.72)"; arrondi(c, ax + 2, ay + 2, lt, pe + 5, 3); c.fill();
    c.fillStyle = "#ffd76a"; c.fillText(txt, ax + 5, ay + 4);
  } else {
    const st = x0.type === "presage" ? "◈" : x0.sousType === "equipement" ? "⚒" : x0.sousType === "continue" ? "∞" : x0.sousType === "terrain" ? "⌂" : "✦";
    c.font = `bold ${pe + 2}px serif`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "rgba(14,10,24,.72)"; c.beginPath(); c.arc(ax + pe + 2, ay + pe + 2, pe, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fdf3d8"; c.fillText(st, ax + pe + 2, ay + pe + 3);
  }

  // bandeau du bas
  if (!jeton) {
    const by = h - m - basH;
    c.fillStyle = "rgba(251,243,223,.97)"; arrondi(c, m, by, l - 2 * m, basH, 3); c.fill();
    c.textBaseline = "middle"; c.textAlign = "center";
    if (x0.atk != null) {
      const f = borne(l * 0.1, 10, 17);
      c.font = `900 ${f}px 'Cinzel', serif`;
      c.fillStyle = "#8a1f1f"; c.textAlign = "left"; c.fillText(`${x0.atk}`, m + 5, by + basH / 2 + 1);
      c.fillStyle = "#1f3a5f"; c.textAlign = "right"; c.fillText(`${x0.def}`, l - m - 5, by + basH / 2 + 1);
      c.fillStyle = "#6e6a64"; c.textAlign = "center"; c.font = `bold ${Math.round(f * 0.62)}px 'Cinzel', serif`; c.fillText("ATK · DEF", l / 2, by + basH / 2 + 1);
    } else {
      c.font = `bold ${borne(l * 0.075, 8, 13)}px 'Cinzel', serif`; c.fillStyle = COULEURS.encre;
      const lib = x0.type === "presage" ? "Présage" : x0.sousType === "equipement" ? "Équipement" : x0.sousType === "continue" ? "Continue" : x0.sousType === "terrain" ? "Terrain" : "Influence";
      c.fillText(lib.toUpperCase(), l / 2, by + basH / 2 + 1);
    }
  }
  c.restore();
}

// ---------- Mémoire des dessins ----------
// Dessiner une carte coûte cher (dégradés, ombres, textes) ; chaque dessin est gardé en mémoire et recopié.
const memoire = new Map();
const dprCourant = () => Math.min(window.devicePixelRatio || 1, 2.5);

function image(cle, l, h, dessiner) {
  const dpr = dprCourant(), k = `${cle}|${Math.round(l)}|${dpr}`;
  let img = memoire.get(k);
  if (!img) {
    if (memoire.size > 600) memoire.clear();
    img = document.createElement("canvas");
    img.width = Math.max(1, Math.round(l * dpr)); img.height = Math.max(1, Math.round(h * dpr));
    const c = img.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    dessiner(c);
    memoire.set(k, img);
  }
  return img;
}

function recopier(canvas, img) {
  canvas.width = img.width; canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
}

/**
 * Peint une carte de duel dans un canvas, à la largeur CSS `largeur`.
 * `format` : 'complete' (la vraie carte), 'compacte' (main), 'jeton' (terrain).
 */
function peindreCarteDuel(canvas, id, face = true, largeur = DL, format = "complete") {
  const h = largeur * DH / DL;
  const f = face ? format : "dos";
  recopier(canvas, image(`v5:${f}:${id}`, largeur, h, c => {
    if (!face) dessinerDosDuel(c, 0, 0, largeur / DL);
    else if (format === "complete") dessinerCarteDuel(c, id, 0, 0, largeur / DL);
    else dessinerCarteCompacte(c, id, largeur, format === "jeton");
  }));
}

/** Peint l'hologramme d'une apparition dans un canvas carré de `taille` px CSS. */
function peindreHologramme(canvas, id, taille) {
  recopier(canvas, image(`holo2:${id}`, taille, taille, c => dessinerHologramme(c, id, taille)));
}

return { DL, dessinerCarteDuel, dessinerDosDuel, dessinerHologramme, dessinerCarteCompacte, peindreCarteDuel, peindreHologramme };
})();

// ===== js/render/effetsVisuels.js =====
M["js/render/effetsVisuels.js"] = (() => {
// Effets visuels des cartes : un calque transparent posé sur la scène, qui joue une petite animation propre à
// chaque carte (l'Eau déferle en vague, le Feu flambe, l'Accident foudroie, le Départ s'envole en oiseaux...).
// Les effets suivent l'image que nomme la notice (la vague pour l'eau, la tour foudroyée, les oiseaux, la comète...). Ils sont décoratifs : ils ne changent rien au jeu.

const { ILLUSTRATIONS } = M["js/render/illustrations.js"];

const TAU = Math.PI * 2;
const hasard = (a, b) => a + Math.random() * (b - a);
const ease = t => 1 - Math.pow(1 - t, 3);
const fondu = (p, entree = 0.15, sortie = 0.3) => Math.min(1, p / entree, (1 - p) / sortie);

/** Les effets : { duree (s), init(rect) → état, dessiner(c, rect, p (0 → 1), état, dt) }. */
/** Dessine l'image d'une carte (d'après la notice), lumineuse, centrée en (x, y), de taille t. */
function embleme(c, id, x, y, t, alpha, lueur = "#f3d58a") {
  const dessin = ILLUSTRATIONS[id];
  if (!dessin || alpha <= 0) return;
  c.save();
  c.globalAlpha = Math.min(1, alpha);
  const g = c.createRadialGradient(x, y, 0, x, y, t * 0.75);
  g.addColorStop(0, "rgba(255,248,225,.35)"); g.addColorStop(1, "rgba(255,248,225,0)");
  c.fillStyle = g; c.beginPath(); c.arc(x, y, t * 0.75, 0, TAU); c.fill();
  c.shadowColor = lueur; c.shadowBlur = t * 0.25;
  c.fillStyle = "#fff8e6"; c.strokeStyle = "#fff8e6";
  dessin(c, x, y, t);
  c.restore();
}

const EFFETS = {
  // l'image de la carte monte au centre, puis s'efface
  embleme: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const t = Math.min(r.w, r.h) * 0.42 * (0.85 + 0.15 * ease(Math.min(1, p * 2)));
      embleme(c, o.id, r.x + r.w / 2, r.y + r.h * (0.55 - 0.08 * ease(p)), t, fondu(p, 0.2, 0.35) * 0.9, o.lueur);
    }
  },
  // un duo : les deux images viennent l'une vers l'autre, se rejoignent, et la lumière éclate
  duo: {
    duree: 2.4,
    init: r => ({ rayons: Array.from({ length: 18 }, (_, k) => ({ a: k * TAU / 18 + hasard(-0.1, 0.1), l: hasard(0.6, 1) })) }),
    dessiner(c, r, p, e, dt, o) {
      const cx = r.x + r.w / 2, cy = r.y + r.h * 0.5, t = Math.min(r.w, r.h) * 0.32;
      const teinte = o.favorable ? "243,213,138" : "190,110,230";
      const q = ease(Math.min(1, p / 0.5)), ecart = r.w * 0.3 * (1 - q);
      const a = fondu(p, 0.12, 0.3);
      // le fil qui relie les deux cartes
      if (p < 0.55) {
        c.strokeStyle = `rgba(${teinte},${0.7 * a})`; c.lineWidth = 3; c.shadowColor = `rgb(${teinte})`; c.shadowBlur = 14;
        c.beginPath(); c.moveTo(cx - ecart, cy); c.quadraticCurveTo(cx, cy - r.h * 0.18 * (1 - q), cx + ecart, cy); c.stroke(); c.shadowBlur = 0;
      }
      embleme(c, o.a, cx - ecart, cy, t * (1 - 0.3 * Math.max(0, (p - 0.4) / 0.6)), a * (p < 0.6 ? 1 : 1 - (p - 0.6) * 2.5), `rgb(${teinte})`);
      embleme(c, o.b, cx + ecart, cy, t * (1 - 0.3 * Math.max(0, (p - 0.4) / 0.6)), a * (p < 0.6 ? 1 : 1 - (p - 0.6) * 2.5), `rgb(${teinte})`);
      if (p > 0.45) {
        const k = (p - 0.45) / 0.55, R = Math.max(r.w, r.h) * 0.6 * ease(k);
        c.globalCompositeOperation = "lighter";
        for (const ray of e.rayons) {
          c.strokeStyle = `rgba(${teinte},${0.5 * (1 - k)})`; c.lineWidth = 3;
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ray.a) * R * ray.l, cy + Math.sin(ray.a) * R * ray.l); c.stroke();
        }
        c.strokeStyle = `rgba(255,248,225,${0.8 * (1 - k)})`; c.lineWidth = 4;
        c.beginPath(); c.arc(cx, cy, R * 0.5, 0, TAU); c.stroke();
        c.globalCompositeOperation = "source-over";
      }
    }
  },
  // un lien lumineux entre deux points (accord sur le terrain)
  lien: {
    duree: 1.8,
    init: () => ({ p: [] }),
    dessiner(c, r, p, e, dt, o) {
      const [x1, y1, x2, y2] = o.points, a = fondu(p, 0.1, 0.35);
      const teinte = o.favorable ? "243,213,138" : "190,110,230";
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 50;
      c.strokeStyle = `rgba(${teinte},${a})`; c.lineWidth = 4; c.shadowColor = `rgb(${teinte})`; c.shadowBlur = 18;
      c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2); c.stroke(); c.shadowBlur = 0;
      for (let k = 0; k < 6; k++) {
        const t = (p * 1.5 + k / 6) % 1, u = 1 - t;
        const x = u * u * x1 + 2 * u * t * mx + t * t * x2, y = u * u * y1 + 2 * u * t * my + t * t * y2;
        c.fillStyle = `rgba(255,250,230,${a})`; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill();
      }
    }
  },
  vague: {
    duree: 1.8,
    init: r => ({ gouttes: Array.from({ length: 40 }, () => ({ x: hasard(0, 1), y: hasard(0.3, 1), v: hasard(0.4, 1), t: hasard(2, 5) })) }),
    dessiner(c, r, p, e) {
      const front = r.x - r.w * 0.3 + ease(p) * r.w * 1.6, a = fondu(p, 0.1, 0.35);
      c.beginPath(); c.rect(r.x, r.y - r.h * 0.2, r.w, r.h * 1.2); c.clip();
      for (let k = 0; k < 4; k++) {
        const base = r.y + r.h * (0.45 + k * 0.14), amp = r.h * (0.12 - k * 0.02);
        c.beginPath(); c.moveTo(r.x - 20, r.y + r.h + 20);
        for (let x = r.x - 20; x <= front; x += 6) {
          const y = base - amp * Math.sin((x - front) / 34 + k + p * 9) - (x > front - 80 ? (1 - (front - x) / 80) * amp * 1.4 : 0);
          c.lineTo(x, y);
        }
        c.quadraticCurveTo(front + r.h * 0.25, base, front + r.h * 0.45, r.y + r.h + 20); c.closePath();
        const g = c.createLinearGradient(0, base - amp, 0, r.y + r.h);
        g.addColorStop(0, `rgba(160,215,255,${0.55 * a})`); g.addColorStop(1, `rgba(20,70,150,${0.6 * a})`);
        c.fillStyle = g; c.fill();
      }
      c.fillStyle = `rgba(255,255,255,${0.8 * a})`;
      for (const d of e.gouttes) { const x = r.x + d.x * r.w; if (x < front) { c.beginPath(); c.arc(x, r.y + d.y * r.h - Math.abs(Math.sin(p * 10 * d.v)) * 30, d.t * 0.6, 0, TAU); c.fill(); } }
    }
  },
  flammes: {
    duree: 1.6,
    init: () => ({ p: [] }),
    dessiner(c, r, p, e, dt, o) {
      if (p < 0.75) for (let k = 0; k < 8; k++) e.p.push({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.75, 1), vy: hasard(60, 160), vie: 1, t: hasard(6, 16) });
      c.globalCompositeOperation = "lighter";
      for (const q of e.p) {
        q.vie -= dt * 1.4; q.y -= q.vy * dt; q.x += Math.sin(q.y / 12) * 0.8;
        if (q.vie <= 0) continue;
        const g = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.t);
        g.addColorStop(0, `rgba(255,240,180,${q.vie})`); g.addColorStop(0.4, o.couleur || `rgba(255,120,30,${q.vie * 0.8})`); g.addColorStop(1, "rgba(120,20,0,0)");
        c.fillStyle = g; c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.fill();
      }
      e.p = e.p.filter(q => q.vie > 0);
      c.globalCompositeOperation = "source-over";
    }
  },
  eclair: {
    duree: 1.1,
    init: r => ({ chemins: [0, 1].map(() => { const pts = [[r.x + r.w * hasard(0.3, 0.7), r.y - r.h * 0.6]]; for (let k = 1; k <= 8; k++) pts.push([pts[k - 1][0] + hasard(-25, 25), r.y - r.h * 0.6 + (r.h * 1.2) * k / 8]); return pts; }) }),
    dessiner(c, r, p, e, dt, o) {
      // une lueur qui monte et retombe, sans flash
      const lueur = o.reduit ? 0 : Math.max(0, Math.sin(Math.min(1, p * 1.6) * Math.PI)) * 0.18;
      if (lueur) { c.fillStyle = `rgba(220,235,255,${lueur})`; c.fillRect(r.x, r.y, r.w, r.h); }
      const alpha = Math.sin(p * Math.PI);
      for (const [k, pts] of e.chemins.entries()) {
        const q = Math.min(1, Math.max(0, p * 3 - k * 0.6)), n = Math.max(2, Math.round(pts.length * q));
        c.globalAlpha = alpha; c.strokeStyle = "#fffbe0"; c.lineWidth = 4; c.shadowColor = "#9ad0ff"; c.shadowBlur = 22;
        c.beginPath(); pts.slice(0, n).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        c.lineWidth = 1.5; c.strokeStyle = "#ffffff"; c.stroke(); c.shadowBlur = 0;
      }
    }
  },
  oiseaux: {
    duree: 2,
    init: r => ({ o: Array.from({ length: 9 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.5, 1), vx: hasard(40, 110), vy: hasard(-140, -70), t: hasard(7, 13), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt) {
      c.strokeStyle = `rgba(30,25,40,${fondu(p)})`; c.lineWidth = 2.2; c.lineCap = "round";
      for (const b of e.o) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.ph += dt * 14;
        const a = Math.sin(b.ph) * b.t * 0.5;
        c.beginPath(); c.moveTo(b.x - b.t, b.y - a); c.quadraticCurveTo(b.x - b.t / 2, b.y - b.t * 0.4, b.x, b.y); c.quadraticCurveTo(b.x + b.t / 2, b.y - b.t * 0.4, b.x + b.t, b.y - a); c.stroke();
      }
    }
  },
  vent: {
    duree: 1.6,
    init: r => ({ l: Array.from({ length: 10 }, () => ({ y: r.y + hasard(0.1, 0.9) * r.h, v: hasard(0.8, 1.4), r: hasard(10, 22), d: hasard(0, 0.3) })) }),
    dessiner(c, r, p, e) {
      c.lineCap = "round";
      for (const w of e.l) {
        const q = Math.max(0, Math.min(1, (p - w.d) * 1.6 * w.v));
        if (q <= 0 || q >= 1) continue;
        const x = r.x - 40 + q * (r.w + 80);
        c.strokeStyle = `rgba(230,240,255,${Math.sin(q * Math.PI) * 0.8})`; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(x - 70, w.y); c.lineTo(x, w.y); c.arc(x, w.y - w.r, w.r, Math.PI / 2, -Math.PI * 0.9, true); c.stroke();
      }
    }
  },
  colombes: {
    duree: 2,
    init: r => ({ o: Array.from({ length: 4 }, (_, k) => ({ x: r.x + r.w * (0.25 + k * 0.17), y: r.y + r.h * 0.85, vy: hasard(-100, -70), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      const g = c.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 5, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.6);
      g.addColorStop(0, `rgba(255,255,240,${0.5 * a})`); g.addColorStop(1, "rgba(255,255,240,0)");
      c.fillStyle = g; c.fillRect(r.x - r.w * 0.2, r.y - r.h * 0.2, r.w * 1.4, r.h * 1.4);
      c.fillStyle = `rgba(255,255,255,${a})`;
      for (const b of e.o) {
        b.y += b.vy * dt; b.ph += dt * 10; const w = Math.sin(b.ph) * 8;
        c.beginPath(); c.ellipse(b.x, b.y, 9, 4.5, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(b.x - 2, b.y); c.quadraticCurveTo(b.x - 10, b.y - 14 - w, b.x + 6, b.y - 10 - w); c.closePath(); c.fill();
      }
    }
  },
  eboulis: {
    duree: 1.7,
    init: r => ({ p: Array.from({ length: 22 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y - hasard(0, r.h * 0.6), vy: hasard(20, 80), t: hasard(5, 14), rot: hasard(0, 6), vr: hasard(-4, 4) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p, 0.05, 0.25);
      for (const q of e.p) {
        q.vy += 600 * dt; q.y = Math.min(q.y + q.vy * dt, r.y + r.h - q.t / 2); q.rot += q.vr * dt;
        c.save(); c.translate(q.x, q.y); c.rotate(q.rot);
        c.fillStyle = `rgba(110,98,86,${a})`; c.strokeStyle = `rgba(40,34,30,${a})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-q.t / 2, -q.t / 3); c.lineTo(q.t / 3, -q.t / 2); c.lineTo(q.t / 2, q.t / 4); c.lineTo(-q.t / 4, q.t / 2); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      c.fillStyle = `rgba(160,150,140,${0.3 * a * p})`; c.fillRect(r.x, r.y + r.h * 0.6, r.w, r.h * 0.4);
    }
  },
  cendres: {
    duree: 2,
    init: r => ({ p: Array.from({ length: 60 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y + hasard(-0.2, 0.8) * r.h, vy: hasard(15, 45), t: hasard(1, 3) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      c.fillStyle = `rgba(70,66,62,${0.35 * a})`; c.fillRect(r.x, r.y, r.w, r.h);
      c.fillStyle = `rgba(200,195,185,${0.8 * a})`;
      for (const q of e.p) { q.y += q.vy * dt; q.x += Math.sin(q.y / 20) * 0.4; c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.fill(); }
    }
  },
  etincelles: {
    duree: 1.8,
    init: r => ({ p: Array.from({ length: 46 }, () => ({ x: r.x + r.w / 2, y: r.y + r.h / 2, vx: hasard(-220, 220), vy: hasard(-260, 60), t: hasard(2, 5), rot: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p, 0.05, 0.4);
      c.globalCompositeOperation = "lighter";
      for (const q of e.p) {
        q.vy += 240 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += dt * 4;
        c.fillStyle = o.couleur || `rgba(255,215,110,${a})`; c.globalAlpha = a;
        c.save(); c.translate(q.x, q.y); c.rotate(q.rot); etoile(c, q.t * 1.6, q.t * 0.6); c.fill(); c.restore();
      }
      c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
    }
  },
  feuilles: {
    duree: 2,
    init: r => ({ p: Array.from({ length: 24 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y - hasard(0, r.h * 0.5), vy: hasard(40, 90), ph: hasard(0, 6), t: hasard(5, 9) })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      const g = c.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 5, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.6);
      g.addColorStop(0, `rgba(160,240,150,${0.35 * a})`); g.addColorStop(1, "rgba(160,240,150,0)");
      c.fillStyle = g; c.fillRect(r.x - 20, r.y - 20, r.w + 40, r.h + 40);
      for (const q of e.p) {
        q.y += q.vy * dt; q.ph += dt * 3; const x = q.x + Math.sin(q.ph) * 18;
        c.save(); c.translate(x, q.y); c.rotate(Math.sin(q.ph) * 0.8);
        c.fillStyle = `rgba(90,170,70,${a})`; c.beginPath(); c.ellipse(0, 0, q.t, q.t * 0.45, 0, 0, TAU); c.fill();
        c.strokeStyle = `rgba(40,90,30,${a})`; c.lineWidth = 1; c.beginPath(); c.moveTo(-q.t, 0); c.lineTo(q.t, 0); c.stroke();
        c.restore();
      }
    }
  },
  miasme: {
    duree: 1.9,
    init: r => ({ b: Array.from({ length: 12 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + hasard(0.2, 0.9) * r.h, t: hasard(14, 34), d: hasard(0, 0.4) })) }),
    dessiner(c, r, p, e, dt, o) {
      for (const b of e.b) {
        const q = Math.max(0, p - b.d) / (1 - b.d), a = Math.sin(q * Math.PI) * 0.45;
        if (a <= 0) continue;
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.t * (0.6 + q));
        g.addColorStop(0, o.couleur || `rgba(140,180,60,${a})`); g.addColorStop(1, "rgba(80,40,90,0)");
        c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y - q * 20, b.t * (0.6 + q), 0, TAU); c.fill();
      }
    }
  },
  lune: {
    duree: 2,
    init: r => ({ et: Array.from({ length: 30 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y + hasard(0, 1) * r.h, t: hasard(0.6, 2), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e) {
      const a = fondu(p);
      c.fillStyle = `rgba(20,30,70,${0.35 * a})`; c.fillRect(r.x, r.y, r.w, r.h);
      for (const s of e.et) { c.fillStyle = `rgba(255,255,255,${a * (0.5 + 0.5 * Math.sin(s.ph + p * 12))})`; c.beginPath(); c.arc(s.x, s.y, s.t, 0, TAU); c.fill(); }
      const cx = r.x + r.w / 2, cy = r.y + r.h * (0.75 - ease(p) * 0.35), R = Math.min(r.w, r.h) * 0.2;
      c.shadowColor = "#cfe0ff"; c.shadowBlur = 30; c.fillStyle = `rgba(240,245,255,${a})`;
      c.beginPath(); c.arc(cx, cy, R, 0.5, TAU - 0.5); c.arc(cx + R * 0.45, cy - R * 0.1, R * 0.82, TAU - 0.75, 0.75, true); c.fill(); c.shadowBlur = 0;
    }
  },
  fumee: {
    duree: 1.9,
    init: r => ({ b: Array.from({ length: 16 }, () => ({ x: r.x + hasard(0, 1) * r.w, y: r.y + r.h * hasard(0.6, 1), t: hasard(18, 40), vy: hasard(-40, -15) })) }),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p) * 0.5;
      for (const b of e.b) {
        b.y += b.vy * dt; b.t += dt * 12;
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.t);
        g.addColorStop(0, o.couleur || `rgba(70,30,90,${a})`); g.addColorStop(1, "rgba(20,10,30,0)");
        c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, b.t, 0, TAU); c.fill();
      }
    }
  },
  chaines: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p, 0.1, 0.3), n = 9, q = ease(Math.min(1, p * 2));
      c.lineWidth = 3; c.strokeStyle = `rgba(190,190,200,${a})`; c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 4;
      for (const s of [-1, 1]) for (let k = 0; k < n; k++) {
        const t = k / (n - 1);
        const x = s < 0 ? r.x + t * r.w * q : r.x + r.w - t * r.w * q, y = r.y + r.h * (s < 0 ? 0.25 + t * 0.5 : 0.75 - t * 0.5);
        c.save(); c.translate(x, y); c.rotate((s < 0 ? 0.45 : -0.45) + (k % 2) * Math.PI / 2);
        c.beginPath(); c.ellipse(0, 0, 9, 5, 0, 0, TAU); c.stroke(); c.restore();
      }
      c.shadowBlur = 0;
    }
  },
  sablier: {
    duree: 1.9,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, H = Math.min(r.h * 0.6, 120), L = H * 0.55;
      c.fillStyle = `rgba(20,14,30,${0.35 * a})`; c.fillRect(r.x, r.y, r.w, r.h);
      c.save(); c.translate(cx, cy); c.rotate(p < 0.2 ? 0 : Math.min(1, (p - 0.2) * 3) * Math.PI);
      c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 3;
      c.beginPath(); c.moveTo(-L / 2, -H / 2); c.lineTo(L / 2, -H / 2); c.lineTo(3, 0); c.lineTo(L / 2, H / 2); c.lineTo(-L / 2, H / 2); c.lineTo(-3, 0); c.closePath(); c.stroke();
      const s = Math.min(1, p * 1.4);
      c.fillStyle = `rgba(230,190,110,${a})`;
      c.beginPath(); c.moveTo(-L / 2 * (1 - s) + 2, -H / 2 * (1 - s)); c.lineTo(L / 2 * (1 - s) - 2, -H / 2 * (1 - s)); c.lineTo(0, -2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-L / 2 + 3, H / 2 - 2); c.lineTo(L / 2 - 3, H / 2 - 2); c.lineTo(0, H / 2 - 2 - s * H * 0.4); c.closePath(); c.fill();
      c.restore();
    }
  },
  chauvesouris: {
    duree: 1.7,
    init: r => ({ o: Array.from({ length: 7 }, (_, k) => ({ x: r.x - 30 - k * 25, y: r.y + r.h * hasard(0.2, 0.8), vx: hasard(260, 360), ph: hasard(0, 6), a: hasard(20, 50) })) }),
    dessiner(c, r, p, e, dt) {
      c.fillStyle = `rgba(25,15,30,${fondu(p)})`;
      for (const b of e.o) {
        b.x += b.vx * dt; b.ph += dt * 18; const y = b.y + Math.sin(b.x / 40) * b.a * 0.4, w = Math.sin(b.ph) * 6;
        c.beginPath(); c.moveTo(b.x, y);
        for (const s of [-1, 1]) { c.moveTo(b.x, y); c.quadraticCurveTo(b.x + s * 9, y - 9 - w, b.x + s * 18, y - 3 - w); c.quadraticCurveTo(b.x + s * 12, y + 1, b.x + s * 6, y + 4); c.lineTo(b.x, y + 2); }
        c.fill();
      }
    }
  },
  roue: {
    duree: 1.9,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, R = Math.min(r.w, r.h) * 0.32;
      c.save(); c.translate(cx, cy); c.rotate(ease(p) * TAU * 3);
      c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 4; c.shadowColor = "#f3d58a"; c.shadowBlur = 16;
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
      c.lineWidth = 2; for (let k = 0; k < 8; k++) { const t = k * TAU / 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(t) * R, Math.sin(t) * R); c.stroke(); }
      c.restore(); c.shadowBlur = 0;
    }
  },
  comete: {
    duree: 1.3,
    init: () => ({}),
    dessiner(c, r, p) {
      const q = ease(Math.min(1, p * 1.4)), x0 = r.x - r.w * 0.5, y0 = r.y - r.h * 0.6;
      const x = x0 + (r.x + r.w / 2 - x0) * q, y = y0 + (r.y + r.h / 2 - y0) * q, a = fondu(p, 0.05, 0.3);
      const g = c.createLinearGradient(x0, y0, x, y);
      g.addColorStop(0, "rgba(180,220,255,0)"); g.addColorStop(1, `rgba(255,255,255,${a})`);
      c.strokeStyle = g; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(x - (x - x0) * 0.6, y - (y - y0) * 0.6); c.lineTo(x, y); c.stroke();
      c.fillStyle = `rgba(255,255,255,${a})`; c.shadowColor = "#bfe0ff"; c.shadowBlur = 24; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); c.shadowBlur = 0;
      if (p > 0.7) { c.strokeStyle = `rgba(255,255,255,${(1 - p) * 2})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, (p - 0.7) * 300, 0, TAU); c.stroke(); }
    }
  },
  faisceau: {
    duree: 1.7,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p), x = r.x + r.w * (0.1 + 0.8 * (0.5 + 0.5 * Math.sin(p * Math.PI * 2 - Math.PI / 2)));
      const g = c.createLinearGradient(x - 60, 0, x + 60, 0);
      g.addColorStop(0, "rgba(255,255,220,0)"); g.addColorStop(0.5, o.couleur || `rgba(255,250,210,${0.55 * a})`); g.addColorStop(1, "rgba(255,255,220,0)");
      c.fillStyle = g; c.beginPath(); c.moveTo(x - 10, r.y - r.h * 0.3); c.lineTo(x + 10, r.y - r.h * 0.3); c.lineTo(x + 70, r.y + r.h); c.lineTo(x - 70, r.y + r.h); c.closePath(); c.fill();
    }
  },
  cle: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, s = Math.min(r.w, r.h) / 120;
      c.save(); c.translate(cx, cy); c.scale(s * (0.8 + 0.4 * ease(Math.min(1, p * 2))), s * (0.8 + 0.4 * ease(Math.min(1, p * 2))));
      c.rotate(p < 0.4 ? 0 : Math.min(1, (p - 0.4) * 3) * Math.PI / 2);
      c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 7; c.shadowColor = "#f3d58a"; c.shadowBlur = 20;
      c.beginPath(); c.arc(-22, 0, 16, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-6, 0); c.lineTo(38, 0); c.moveTo(26, 0); c.lineTo(26, 13); c.moveTo(36, 0); c.lineTo(36, 17); c.stroke();
      c.restore(); c.shadowBlur = 0;
    }
  },
  etoiles: {
    duree: 1.7,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h / 2, R = Math.min(r.w, r.h) * (0.15 + 0.25 * ease(p));
      c.save(); c.translate(cx, cy); c.rotate(p * 1.5);
      c.globalCompositeOperation = "lighter";
      for (let k = 0; k < 12; k++) { c.rotate(TAU / 12); c.fillStyle = `rgba(255,230,160,${0.35 * a})`; c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -R * 1.6); c.lineTo(3, 0); c.fill(); }
      c.fillStyle = `rgba(255,248,220,${a})`; etoile(c, R * 0.5, R * 0.2); c.fill();
      c.restore(); c.globalCompositeOperation = "source-over";
    }
  },
  dome: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p), cx = r.x + r.w / 2, cy = r.y + r.h * 0.95, R = Math.min(r.w * 0.6, r.h * 1.1) * ease(Math.min(1, p * 2));
      const g = c.createRadialGradient(cx, cy, Math.max(0, R * 0.6), cx, cy, Math.max(1, R));
      g.addColorStop(0, "rgba(120,170,255,0)"); g.addColorStop(0.85, o.couleur || `rgba(140,190,255,${0.35 * a})`); g.addColorStop(1, `rgba(220,240,255,${0.7 * a})`);
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, Math.PI, 0); c.closePath(); c.fill();
      c.strokeStyle = `rgba(230,245,255,${0.6 * a})`; c.lineWidth = 1;
      for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(cx, cy, R, Math.PI + k * Math.PI / 6 - 0.01, Math.PI + k * Math.PI / 6 + 0.01); c.lineTo(cx, cy); c.stroke(); }
    }
  },
  coeurs: {
    duree: 1.9,
    init: r => ({ p: Array.from({ length: 16 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.7, 1.1), vy: hasard(-110, -60), t: hasard(6, 13), ph: hasard(0, 6) })) }),
    dessiner(c, r, p, e, dt, o) {
      const a = fondu(p);
      for (const q of e.p) {
        q.y += q.vy * dt; q.ph += dt * 3;
        c.fillStyle = o.couleur || `rgba(240,90,120,${a})`;
        coeur(c, q.x + Math.sin(q.ph) * 8, q.y, q.t); c.fill();
      }
    }
  },
  epees: {
    duree: 1.4,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = fondu(p, 0.1, 0.3), cx = r.x + r.w / 2, cy = r.y + r.h / 2, q = ease(Math.min(1, p * 2.2)), L = Math.min(r.w, r.h) * 0.45;
      for (const s of [-1, 1]) {
        c.save(); c.translate(cx + s * (1 - q) * r.w * 0.5, cy); c.rotate(s * (0.7 - q * 0.1));
        c.strokeStyle = `rgba(230,235,245,${a})`; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -L); c.lineTo(0, L * 0.6); c.stroke();
        c.strokeStyle = `rgba(243,213,138,${a})`; c.lineWidth = 4; c.beginPath(); c.moveTo(-12, L * 0.6); c.lineTo(12, L * 0.6); c.moveTo(0, L * 0.6); c.lineTo(0, L * 0.9); c.stroke();
        c.restore();
      }
      if (p > 0.42 && p < 0.7) { c.fillStyle = `rgba(255,240,180,${(0.7 - p) * 3})`; for (let k = 0; k < 10; k++) { const t = k * TAU / 10; c.beginPath(); c.arc(cx + Math.cos(t) * (p - 0.42) * 160, cy + Math.sin(t) * (p - 0.42) * 160, 3, 0, TAU); c.fill(); } }
    }
  },
  ondes: {
    duree: 1.6,
    init: () => ({}),
    dessiner(c, r, p, e, dt, o) {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      for (let k = 0; k < 4; k++) {
        const q = p * 1.4 - k * 0.15; if (q <= 0 || q >= 1) continue;
        c.strokeStyle = o.couleur || `rgba(243,213,138,${1 - q})`; c.lineWidth = 3;
        c.beginPath(); c.arc(cx, cy, q * Math.max(r.w, r.h) * 0.6, 0, TAU); c.stroke();
      }
    }
  },
  notes: {
    duree: 1.9,
    init: r => ({ p: Array.from({ length: 12 }, () => ({ x: r.x + hasard(0.1, 0.9) * r.w, y: r.y + r.h * hasard(0.7, 1), vy: hasard(-90, -50), ph: hasard(0, 6), g: Math.random() < 0.5 ? "♪" : "♫" })) }),
    dessiner(c, r, p, e, dt) {
      const a = fondu(p);
      c.font = "24px serif"; c.textAlign = "center"; c.fillStyle = `rgba(255,230,170,${a})`; c.shadowColor = "#f3d58a"; c.shadowBlur = 8;
      for (const q of e.p) { q.y += q.vy * dt; q.ph += dt * 4; c.fillText(q.g, q.x + Math.sin(q.ph) * 10, q.y); }
      c.shadowBlur = 0;
    }
  },
  entaille: {
    duree: 0.6,
    init: () => ({}),
    dessiner(c, r, p) {
      const a = 1 - p, cx = r.x + r.w / 2, cy = r.y + r.h / 2, L = Math.max(r.w, r.h) * 0.6 * ease(Math.min(1, p * 3));
      c.strokeStyle = `rgba(255,250,230,${a})`; c.lineWidth = 4; c.shadowColor = "#ffb070"; c.shadowBlur = 14;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx - L / 2, cy - s * L / 2); c.lineTo(cx + L / 2, cy + s * L / 2); c.stroke(); }
      c.shadowBlur = 0;
    }
  }
};

function etoile(c, R, r) {
  c.beginPath();
  for (let k = 0; k < 10; k++) { const t = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? r : R; c.lineTo(Math.cos(t) * d, Math.sin(t) * d); }
  c.closePath();
}
function coeur(c, x, y, r) {
  c.beginPath(); c.moveTo(x, y + r * 0.9);
  c.bezierCurveTo(x - r * 1.3, y, x - r * 0.8, y - r, x, y - r * 0.35);
  c.bezierCurveTo(x + r * 0.8, y - r, x + r * 1.3, y, x, y + r * 0.9); c.closePath();
}


// ---------- Les éléments du combat ----------
// Chaque planète a son élément ; il colore ce que font ses apparitions (attaque, impact, éclats).
const ELEMENTS = { soleil: "lumiere", lune: "eau", mercure: "air", venus: "fleurs", mars: "feu", jupiter: "foudre", saturne: "terre", preambule: "lumiere", hors: "eau" };
const TEINTES = {
  lumiere: [255, 214, 120], eau: [110, 178, 255], air: [190, 245, 232], fleurs: [255, 150, 190],
  feu: [255, 118, 40], foudre: [175, 195, 255], terre: [176, 132, 88], accord: [196, 150, 255]
};
/** L'élément d'une famille (planète) ; les figures d'accord ont le leur. */
const elementDe = famille => ELEMENTS[famille] || "accord";
const rgba = (t, a) => `rgba(${t[0]},${t[1]},${t[2]},${a})`;
const bez = (o, q) => {
  const [x1, y1] = o.de, [x2, y2] = o.vers, mx = (x1 + x2) / 2, my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.15 - 30, u = 1 - q;
  return [u * u * x1 + 2 * u * q * mx + q * q * x2, u * u * y1 + 2 * u * q * my + q * q * y2];
};
function zigzag(c, x1, y1, x2, y2, n, amp) {
  c.beginPath(); c.moveTo(x1, y1);
  for (let k = 1; k < n; k++) { const t = k / n; c.lineTo(x1 + (x2 - x1) * t + hasard(-amp, amp), y1 + (y2 - y1) * t + hasard(-amp, amp)); }
  c.lineTo(x2, y2); c.stroke();
}
function caillou(c, x, y, t, rot, coul) {
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = coul;
  c.beginPath(); c.moveTo(-t, -t * 0.4); c.lineTo(-t * 0.3, -t); c.lineTo(t * 0.8, -t * 0.6); c.lineTo(t, t * 0.3); c.lineTo(t * 0.1, t); c.lineTo(-t * 0.8, t * 0.6); c.closePath(); c.fill();
  c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.moveTo(-t * 0.3, -t); c.lineTo(t * 0.8, -t * 0.6); c.lineTo(t * 0.1, -t * 0.1); c.closePath(); c.fill();
  c.restore();
}
function petale(c, x, y, t, rot, a) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const g = c.createLinearGradient(-t, 0, t, 0); g.addColorStop(0, `rgba(255,190,215,${a})`); g.addColorStop(1, `rgba(255,120,170,${a})`);
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, t, t * 0.45, 0, 0, TAU); c.fill(); c.restore();
}

const EFFETS_ELEMENTS = {
  // le coup part de l'attaquant et file vers sa cible
  projectile: {
    duree: 0.5,
    init: () => ({ p: [], ancien: null }),
    dessiner(c, r, p, e, dt, o) {
      const q = p * p * (3 - 2 * p), [x, y] = bez(o, q), t = TEINTES[o.element] || TEINTES.accord;
      const [px, py] = e.ancien || [x, y]; e.ancien = [x, y];
      const ang = Math.atan2(y - py, x - px);
      // sillage
      for (let k = 0; k < 3; k++) e.p.push({ x: x + hasard(-4, 4), y: y + hasard(-4, 4), vx: hasard(-30, 30), vy: hasard(-30, 30) + (o.element === "eau" ? 40 : o.element === "feu" ? -50 : 0), vie: 1, t: hasard(2, 6), rot: hasard(0, 6) });
      c.globalCompositeOperation = o.element === "terre" ? "source-over" : "lighter";
      for (const s of e.p) {
        s.vie -= dt * 2.6; if (s.vie <= 0) continue;
        s.x += s.vx * dt; s.y += s.vy * dt; s.rot += dt * 6;
        if (o.element === "terre") caillou(c, s.x, s.y, s.t * 0.7, s.rot, `rgba(120,90,60,${s.vie})`);
        else if (o.element === "fleurs") petale(c, s.x, s.y, s.t, s.rot, s.vie);
        else { c.fillStyle = rgba(t, s.vie * 0.8); c.beginPath(); c.arc(s.x, s.y, s.t * s.vie, 0, TAU); c.fill(); }
      }
      e.p = e.p.filter(s => s.vie > 0);
      // la tête du coup
      if (o.element === "foudre") {
        c.strokeStyle = "rgba(235,245,255,.95)"; c.lineWidth = 3; c.shadowColor = rgba(t, 1); c.shadowBlur = 18;
        zigzag(c, o.de[0], o.de[1], x, y, 9, 10); c.lineWidth = 1.2; c.strokeStyle = "#fff"; zigzag(c, o.de[0], o.de[1], x, y, 9, 6); c.shadowBlur = 0;
      } else if (o.element === "lumiere") {
        const g = c.createLinearGradient(o.de[0], o.de[1], x, y); g.addColorStop(0, rgba(t, 0)); g.addColorStop(1, rgba(t, 0.9));
        c.strokeStyle = g; c.lineWidth = 6 + q * 8; c.lineCap = "round"; c.beginPath(); c.moveTo(o.de[0], o.de[1]); c.lineTo(x, y); c.stroke();
      } else if (o.element === "air") {
        c.strokeStyle = rgba(t, 0.8); c.lineWidth = 2.5;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x - Math.cos(ang) * k * 14, y - Math.sin(ang) * k * 14, 9 - k * 2, ang + 1, ang + 4); c.stroke(); }
      } else if (o.element === "terre") {
        caillou(c, x, y, 13, q * 9, "#7b5a3c");
      }
      const g = c.createRadialGradient(x, y, 0, x, y, o.element === "eau" ? 16 : 20);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.35, rgba(t, 0.9)); g.addColorStop(1, rgba(t, 0));
      c.fillStyle = g;
      c.save(); c.translate(x, y); c.rotate(ang); c.beginPath();
      if (o.element === "eau" || o.element === "feu") c.ellipse(0, 0, 24, 11, 0, 0, TAU); else c.arc(0, 0, 20, 0, TAU);
      c.fill(); c.restore();
      c.globalCompositeOperation = "source-over";
    }
  },
  // l'impact sur la cible, selon l'élément ; `fort` : un coup puissant (plus grand, plus de matière)
  impact: {
    duree: 0.9,
    init: (r, o) => {
      const n = o.fort ? 46 : 28, t = [];
      for (let k = 0; k < n; k++) { const a = hasard(0, TAU), v = hasard(60, o.fort ? 320 : 220); t.push({ x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.element === "eau" ? 120 : 0), t: hasard(2, 7), rot: hasard(0, 6), vr: hasard(-8, 8) }); }
      return { p: t, eclair: Array.from({ length: 8 }, () => hasard(-14, 14)) };
    },
    dessiner(c, r, p, e, dt, o) {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, t = TEINTES[o.element] || TEINTES.accord, a = 1 - p, R = Math.max(r.w, r.h) * (o.fort ? 1.1 : 0.8);
      // onde
      c.strokeStyle = rgba(t, a * 0.9); c.lineWidth = 3 + 4 * a;
      c.beginPath(); c.arc(cx, cy, R * ease(Math.min(1, p * 1.6)), 0, TAU); c.stroke();
      if (o.element === "feu" || o.element === "lumiere") {
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, R * 0.8 * ease(Math.min(1, p * 2.5)));
        g.addColorStop(0, `rgba(255,250,220,${a})`); g.addColorStop(0.4, rgba(t, a * 0.85)); g.addColorStop(1, rgba(t, 0));
        c.globalCompositeOperation = "lighter"; c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.globalCompositeOperation = "source-over";
      }
      if (o.element === "foudre" && p < 0.45) {
        c.strokeStyle = "rgba(240,248,255,.95)"; c.lineWidth = 4; c.shadowColor = rgba(t, 1); c.shadowBlur = 22;
        c.beginPath(); let y = r.y - R * 1.2, x = cx; c.moveTo(x, y);
        for (const d of e.eclair) { y += (cy - (r.y - R * 1.2)) / 8; x = cx + d; c.lineTo(x, y); }
        c.stroke(); c.shadowBlur = 0;
      }
      if (o.element === "terre") {
        const g = c.createRadialGradient(cx, cy + 10, 0, cx, cy + 10, R);
        g.addColorStop(0, `rgba(150,120,90,${0.55 * a})`); g.addColorStop(1, "rgba(150,120,90,0)");
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy + 10, R, 0, TAU); c.fill();
      }
      for (const s of e.p) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.96; s.vy = s.vy * 0.96 + (o.element === "eau" || o.element === "terre" ? 520 : o.element === "feu" ? -80 : 60) * dt; s.rot += s.vr * dt;
        const x = cx + s.x, y = cy + s.y;
        if (o.element === "terre") caillou(c, x, y, s.t, s.rot, `rgba(110,82,56,${a})`);
        else if (o.element === "fleurs") petale(c, x, y, s.t * 1.2, s.rot, a);
        else if (o.element === "air") { c.strokeStyle = rgba(t, a * 0.8); c.lineWidth = 2; c.beginPath(); c.arc(x, y, s.t * 2, s.rot, s.rot + 2.5); c.stroke(); }
        else if (o.element === "eau") { c.fillStyle = `rgba(200,230,255,${a})`; c.beginPath(); c.ellipse(x, y, s.t * 0.6, s.t, Math.atan2(s.vy, s.vx) + Math.PI / 2, 0, TAU); c.fill(); }
        else { c.globalCompositeOperation = "lighter"; c.fillStyle = rgba(t, a); c.beginPath(); c.arc(x, y, s.t * (0.4 + a * 0.6), 0, TAU); c.fill(); c.globalCompositeOperation = "source-over"; }
      }
    }
  },
  // une apparition détruite vole en éclats de sa couleur
  eclatsCarte: {
    duree: 1.1,
    init: r => ({ p: Array.from({ length: 22 }, () => ({ x: hasard(0.15, 0.85) * r.w, y: hasard(0.1, 0.9) * r.h, vx: hasard(-160, 160), vy: hasard(-260, -40), t: hasard(5, 13), rot: hasard(0, 6), vr: hasard(-9, 9) })) }),
    dessiner(c, r, p, e, dt, o) {
      const t = TEINTES[o.element] || TEINTES.accord, a = 1 - p;
      for (const s of e.p) {
        s.vy += 640 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt;
        c.save(); c.translate(r.x + s.x, r.y + s.y); c.rotate(s.rot);
        c.fillStyle = rgba(t, a * 0.95); c.strokeStyle = `rgba(255,243,207,${a})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-s.t, -s.t * 0.6); c.lineTo(s.t, -s.t * 0.2); c.lineTo(-s.t * 0.1, s.t); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      if (p < 0.3) { c.globalCompositeOperation = "lighter"; c.fillStyle = rgba(t, (0.3 - p) * 2); c.fillRect(r.x, r.y, r.w, r.h); c.globalCompositeOperation = "source-over"; }
    }
  }
};
Object.assign(EFFETS, EFFETS_ELEMENTS);

/** Les noms des effets disponibles. */
const NOMS_EFFETS = Object.keys(EFFETS).filter(n => !["embleme", "duo", "lien", "projectile", "impact", "eclatsCarte"].includes(n));

/** L'effet de chaque carte (d'après son image) : [effet, couleur facultative]. */
const EFFET_DE_CARTE = {
  0: ["dome", "rgba(90,140,230,.4)"], 1: ["cle"], 2: ["etoiles"], 3: ["etoiles"], 4: ["etoiles"], 5: ["etincelles"], 6: ["faisceau"],
  7: ["etincelles"], 8: ["dome", "rgba(200,160,110,.35)"], 9: ["feuilles"], 10: ["etincelles"],
  11: ["fumee"], 12: ["oiseaux"], 13: ["vent"], 14: ["faisceau"], 15: ["vague"], 16: ["dome"], 17: ["miasme"],
  18: ["lune"], 19: ["etincelles"], 20: ["faisceau", "rgba(200,230,255,.5)"], 21: ["chauvesouris"], 22: ["faisceau"], 23: ["etincelles"], 24: ["comete"],
  25: ["notes"], 26: ["ondes", "rgba(243,213,138,.7)"], 27: ["coeurs", "rgba(255,200,120,.9)"], 28: ["dome", "rgba(230,150,170,.35)"], 29: ["coeurs"], 30: ["etincelles"], 31: ["flammes", "rgba(255,80,140,.8)"],
  32: ["faisceau", "rgba(255,150,90,.5)"], 33: ["epees"], 34: ["chaines"], 35: ["epees"], 36: ["oiseaux"], 37: ["flammes"], 38: ["eclair"],
  39: ["dome", "rgba(243,213,138,.35)"], 40: ["etincelles", "rgba(255,170,210,.9)"], 41: ["faisceau", "rgba(243,213,138,.5)"], 42: ["lune"], 43: ["ondes"], 44: ["roue"], 45: ["etoiles"],
  46: ["cendres"], 47: ["cendres"], 48: ["sablier"], 49: ["colombes"], 50: ["eboulis"], 51: ["sablier"], 52: ["dome", "rgba(120,110,140,.4)"],
  100: ["cendres"], 101: ["feuilles"], 102: ["oiseaux"], 103: ["eclair"], 104: ["vague"], 105: ["miasme", "rgba(60,30,40,.5)"], 106: ["colombes"],
  107: ["chauvesouris"], 108: ["epees"], 109: ["chaines"], 110: ["etincelles"], 111: ["coeurs"], 112: ["eboulis"], 113: ["epees"], 114: ["miasme"],
  115: ["flammes", "rgba(255,80,140,.8)"], 116: ["fumee"], 117: ["flammes"], 118: ["roue"], 119: ["dome"], 120: ["dome"], 121: ["coeurs", "rgba(150,120,200,.9)"],
  122: ["eclair"], 123: ["etincelles"]
};

/** Le calque d'effets d'un conteneur (positionné). */
class Effets {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "calque-effets";
    this.canvas.setAttribute("aria-hidden", "true");
    conteneur.appendChild(this.canvas);
    this.c = this.canvas.getContext("2d");
    this.actifs = [];
    this.boucle = null;
    // Avec « animations réduites », les effets jouent quand même (ils sont demandés), mais sans éclair blanc.
    this.reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.ajuster();
    if (window.ResizeObserver) new ResizeObserver(() => this.ajuster()).observe(conteneur);
  }

  ajuster() {
    const r = this.conteneur.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.l = r.width; this.h = r.height;
    this.canvas.width = Math.max(1, Math.round(r.width * dpr)); this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Rectangle d'un élément, dans les coordonnées du calque. */
  rect(el) {
    if (!el) return { x: 0, y: 0, w: this.l, h: this.h };
    const r = el.getBoundingClientRect(), b = this.conteneur.getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  }

  /** Joue un effet nommé sur un rectangle (ou un élément). Résout quand il s'achève. */
  jouer(nom, cible = null, options = {}) {
    const def = EFFETS[nom];
    if (!def) return Promise.resolve();
    const r = cible && cible.getBoundingClientRect ? this.rect(cible) : cible || this.rect(null);
    return new Promise(resolve => {
      this.actifs.push({ def, r, options: { ...options, reduit: this.reduit }, etat: def.init(r, options), t: 0, resolve });
      if (!this.boucle) { this.dernier = performance.now(); this.boucle = requestAnimationFrame(t => this.pas(t)); }
    });
  }

  /** L'effet propre à une carte. */
  carte(id, cible = null, avecEmbleme = false) {
    const [nom, couleur] = EFFET_DE_CARTE[id] || ["etincelles"];
    if (avecEmbleme && id < 100) this.jouer("embleme", cible, { id, lueur: couleur ? couleur.replace(/,[\d.]+\)$/, ",1)") : "#f3d58a" });
    return this.jouer(nom, cible, { couleur });
  }

  /** Un duo de cartes (accord) : leurs deux images se rejoignent ; puis l'effet de chacune. */
  duo(a, b, cible, favorable) {
    this.jouer("duo", cible, { a, b, favorable });
    setTimeout(() => { this.carte(a, cible); this.carte(b, cible); }, 1100);
  }

  /** Le coup d'une apparition : il file de l'attaquant à sa cible, dans son élément. Résout à l'arrivée. */
  attaque(de, vers, element) {
    const a = this.rect(de), b = this.rect(vers);
    return this.jouer("projectile", null, { element, de: [a.x + a.w / 2, a.y + a.h * 0.35], vers: [b.x + b.w / 2, b.y + b.h / 2] });
  }

  /** L'impact d'un coup sur sa cible (`fort` : un coup puissant). */
  impact(cible, element, fort = false) { return this.jouer("impact", cible, { element, fort }); }

  /** Une apparition détruite vole en éclats, de la couleur de son élément. */
  eclatsCarte(cible, element) { return this.jouer("eclatsCarte", cible, { element }); }

  /** Un lien lumineux entre deux éléments. */
  lien(el1, el2, favorable) {
    const r1 = this.rect(el1), r2 = this.rect(el2);
    return this.jouer("lien", null, { points: [r1.x + r1.w / 2, r1.y + r1.h / 3, r2.x + r2.w / 2, r2.y + r2.h / 3], favorable });
  }

  pas(t) {
    // l'horodatage du premier dessin peut précéder le départ : jamais de temps négatif
    const dt = Math.max(0, Math.min(0.05, (t - this.dernier) / 1000)); this.dernier = Math.max(t, this.dernier);
    this.c.clearRect(0, 0, this.l, this.h);
    for (const a of this.actifs) {
      a.t += dt;
      const p = Math.min(1, a.t / a.def.duree);
      this.c.save();
      // un effet qui échoue s'arrête seul, sans bloquer les autres
      try { a.def.dessiner(this.c, a.r, p, a.etat, dt, a.options); } catch (err) { a.t = a.def.duree; console.warn("Effet visuel interrompu :", err); }
      this.c.restore();
      if (p >= 1) { a.fini = true; a.resolve(); }
    }
    this.actifs = this.actifs.filter(a => !a.fini);
    if (this.actifs.length) this.boucle = requestAnimationFrame(x => this.pas(x));
    else { this.boucle = null; this.c.clearRect(0, 0, this.l, this.h); }
  }
}

return { ELEMENTS, TEINTES, elementDe, NOMS_EFFETS, EFFET_DE_CARTE, Effets };
})();

// ===== js/render/ambiance.js =====
M["js/render/ambiance.js"] = (() => {
// L'ambiance du tapis : de fines particules qui dérivent lentement, selon le ciel du duel (la planète) et le terrain
// que chaque joueur a posé de son côté. Elles naissent et s'effacent en fondu, sans jamais clignoter.
// Décoratif : rien ne change au jeu. Avec « animations réduites », un seul dessin immobile.

const TAU = Math.PI * 2;
const h = (a, b) => a + Math.random() * (b - a);

// sorte de particule : [couleur (r,g,b), taille, vitesse x, vitesse y, nombre, forme]
const CIELS = {
  soleil: { c: [255, 214, 130], t: [1, 2.4], vx: [-4, 4], vy: [-14, -5], n: 26, forme: "point" },        // poussière d'or qui monte
  lune: { c: [190, 215, 255], t: [1.2, 3.2], vx: [-3, 3], vy: [-12, -4], n: 24, forme: "bulle" },        // bulles d'argent
  mercure: { c: [200, 250, 240], t: [8, 18], vx: [12, 26], vy: [-2, 2], n: 12, forme: "souffle" },      // souffles de vent
  venus: { c: [255, 170, 200], t: [2.5, 4.5], vx: [-6, 6], vy: [5, 13], n: 16, forme: "petale" },       // pétales qui tombent
  mars: { c: [255, 130, 50], t: [1, 2.2], vx: [-5, 5], vy: [-20, -8], n: 26, forme: "braise" },         // braises qui montent
  jupiter: { c: [175, 195, 255], t: [1, 2], vx: [-8, 8], vy: [-6, 6], n: 22, forme: "point" },          // étincelles bleues
  saturne: { c: [190, 175, 155], t: [1, 2.6], vx: [-2, 2], vy: [3, 9], n: 26, forme: "point" }          // poussière qui retombe
};
const LIEUX = {
  9: { c: [150, 220, 110], t: [2.5, 4.5], vx: [-8, 8], vy: [3, 9], n: 10, forme: "feuille" },          // Campagne : feuilles
  16: { c: [255, 150, 60], t: [1, 2.2], vx: [-4, 4], vy: [-16, -7], n: 12, forme: "braise" },          // Pénates : braises de l'âtre
  30: { c: [255, 220, 130], t: [1, 2], vx: [-3, 3], vy: [-6, 6], n: 12, forme: "point" },              // Table : poussière d'or
  52: { c: [200, 200, 215], t: [1, 2.4], vx: [-2, 2], vy: [2, 6], n: 12, forme: "point" }              // Cloître : poussière de pierre
};

class Ambiance {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "ambiance";
    this.canvas.setAttribute("aria-hidden", "true");
    conteneur.prepend(this.canvas);
    this.c = this.canvas.getContext("2d");
    this.p = [];
    this.cle = "";
    this.reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.ajuster();
    if (window.ResizeObserver) new ResizeObserver(() => this.ajuster()).observe(conteneur);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.lancer(); });
  }

  ajuster() {
    const l = this.conteneur.clientWidth, H = this.conteneur.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!l || !H) return;
    this.l = l; this.h = H;
    this.canvas.width = Math.round(l * dpr); this.canvas.height = Math.round(H * dpr);
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.reduit) this.dessiner(0);
  }

  /** Le ciel du duel (famille) et les terrains des deux joueurs ([vous, adversaire]). */
  regler(ciel, lieux = [null, null]) {
    const cle = `${ciel}|${lieux[0]}|${lieux[1]}`;
    if (cle === this.cle) return;
    this.cle = cle;
    this.sortes = [];
    if (CIELS[ciel]) this.sortes.push({ ...CIELS[ciel], zone: [0, 1] });
    // la moitié du bas est la vôtre, celle du haut est celle de l'adversaire
    if (LIEUX[lieux[0]]) this.sortes.push({ ...LIEUX[lieux[0]], zone: [0.5, 1] });
    if (LIEUX[lieux[1]]) this.sortes.push({ ...LIEUX[lieux[1]], zone: [0, 0.5] });
    // les particules des sortes qui ne sont plus là s'effacent d'elles-mêmes
    for (const q of this.p) {
      const m = this.sortes.find(s => s.c === q.s.c && s.zone[0] === q.s.zone[0]);
      if (m) q.s = m; else q.vie = Math.min(q.vie, q.age + 1.5);
    }
    this.lancer();
  }

  naitre(s, partout = false) {
    const y0 = s.zone[0] * this.h, y1 = s.zone[1] * this.h;
    return { s, x: h(0, this.l), y: partout ? h(y0, y1) : s.vy[0] < 0 ? y1 : s.vy[0] > 0 ? y0 : h(y0, y1), vx: h(...s.vx), vy: h(...s.vy), t: h(...s.t),
      rot: h(0, TAU), vr: h(-0.6, 0.6), age: 0, vie: h(7, 14), y0, y1 };
  }

  lancer() {
    if (this.boucle || !this.sortes || !this.l) return;
    if (this.reduit) { this.dessiner(0); return; }
    // au premier lancement, les particules sont déjà là (pas d'apparition en masse)
    for (const s of this.sortes) while (this.p.filter(q => q.s === s).length < s.n) { const q = this.naitre(s, true); q.age = h(1.5, q.vie - 1); this.p.push(q); }
    this.dernier = performance.now();
    const pas = t => {
      if (document.hidden) { this.boucle = null; return; }
      const dt = Math.min(0.1, (t - this.dernier) / 1000);
      if (dt >= 1 / 32) { this.dernier = t; this.avancer(dt); this.dessiner(); }
      this.boucle = requestAnimationFrame(pas);
    };
    this.boucle = requestAnimationFrame(pas);
  }

  avancer(dt) {
    for (const q of this.p) {
      q.age += dt; q.x += q.vx * dt + Math.sin(q.age * 0.7 + q.rot) * 3 * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
      if (q.x < -20) q.x = this.l + 20; if (q.x > this.l + 20) q.x = -20;
    }
    this.p = this.p.filter(q => q.age < q.vie && q.y > q.y0 - 30 && q.y < q.y1 + 30);
    for (const s of this.sortes) { const n = this.p.filter(q => q.s === s).length; for (let k = n; k < s.n; k++) if (Math.random() < 0.08) this.p.push(this.naitre(s)); }
  }

  dessiner() {
    const c = this.c;
    c.clearRect(0, 0, this.l, this.h);
    for (const q of this.p) {
      // fondu doux à la naissance et à la fin : ni pop, ni clignotement
      const a = Math.min(1, q.age / 1.5, (q.vie - q.age) / 1.5) * 0.55;
      if (a <= 0) continue;
      const [r, g, b] = q.s.c;
      c.fillStyle = `rgba(${r},${g},${b},${a})`; c.strokeStyle = `rgba(${r},${g},${b},${a})`;
      switch (q.s.forme) {
        case "bulle": c.lineWidth = 0.8; c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.stroke(); break;
        case "souffle": c.lineWidth = 1.2; c.beginPath(); c.moveTo(q.x - q.t, q.y); c.quadraticCurveTo(q.x, q.y - q.t * 0.3, q.x + q.t, q.y); c.stroke(); break;
        case "petale": case "feuille":
          c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.beginPath(); c.ellipse(0, 0, q.t, q.t * 0.45, 0, 0, TAU); c.fill(); c.restore(); break;
        case "braise": {
          const gr = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.t * 3);
          gr.addColorStop(0, `rgba(255,230,180,${a})`); gr.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.7})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
          c.fillStyle = gr; c.beginPath(); c.arc(q.x, q.y, q.t * 3, 0, TAU); c.fill(); break;
        }
        default: c.beginPath(); c.arc(q.x, q.y, q.t, 0, TAU); c.fill();
      }
    }
  }
}

return { Ambiance };
})();

// ===== js/ui/stockage.js =====
M["js/ui/stockage.js"] = (() => {
// Sauvegarde locale du carnet (localStorage), commune au Chemin et au Duel.
const { carnetVide, normaliserCarnet } = M["js/engine/carnet.js"];

const CLE = "chemin-du-mage.carnet";

function chargerCarnet() {
  try { return normaliserCarnet(JSON.parse(localStorage.getItem(CLE) || "null")); }
  catch { return carnetVide(); }
}

function sauverCarnet(c) {
  try { localStorage.setItem(CLE, JSON.stringify(c)); } catch { /* stockage indisponible : le carnet vit le temps de la partie */ }
}

return { chargerCarnet, sauverCarnet };
})();

// ===== js/ui/son.js =====
M["js/ui/son.js"] = (() => {
// Sons du jeu, générés par le navigateur (Web Audio), sans fichier. Coupés d'un clic ; le choix est retenu.
const CLE = "chemin-du-mage.son";
let ctx = null;
let actif = true;
try { actif = localStorage.getItem(CLE) !== "non"; } catch { /* stockage indisponible : son actif */ }

function audio() {
  if (!actif) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Une note : fréquence (Hz), durée (s), forme d'onde, volume, délai. */
function note(f, duree, forme = "sine", volume = 0.12, delai = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delai;
  const o = a.createOscillator(), g = a.createGain();
  o.type = forme; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + duree + 0.05);
}

const ACCORDS = {
  gain: [[659, 0], [880, 0.07]],
  perte: [[220, 0], [185, 0.09]],
  neutre: [[523, 0]],
  saut: [[392, 0], [587, 0.06]],
  regle: [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24]],
  porte: [[392, 0], [523, 0.12], [659, 0.24]],
  choix: [[740, 0]],
  erreur: [[311, 0], [294, 0.1]],
  victoire: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.4], [1319, 0.55]],
  defaite: [[392, 0], [349, 0.18], [311, 0.36], [262, 0.6]],
  frappe: [[160, 0], [110, 0.05]],
  invocation: [[440, 0], [554, 0.06], [659, 0.12]]
};

/** Chaque planète a son ton : la même mélodie, transposée et d'un timbre propre (Saturne grave, la Lune claire…). */
const PLANETES = {
  soleil: [1, "sine"], lune: [1.26, "sine"], mercure: [1.5, "triangle"], venus: [1.19, "sine"],
  mars: [0.89, "sawtooth"], jupiter: [0.75, "triangle"], saturne: [0.63, "triangle"]
};

/** Joue un son nommé (voir ACCORDS), dans le ton d'une planète si elle est donnée. */
function jouerSon(nom, planete = null) {
  const a = ACCORDS[nom]; if (!a) return;
  const [k, timbre] = PLANETES[planete] || [1, null];
  const forme = timbre || (nom === "perte" || nom === "frappe" || nom === "defaite" ? "triangle" : "sine");
  const vol = forme === "sawtooth" ? 0.05 : nom === "frappe" ? 0.18 : 0.1;
  for (const [f, d] of a) note(f * k, nom === "victoire" || nom === "defaite" ? 0.6 : 0.32, forme, vol, d);
}

function sonActif() { return actif; }

/** Bascule le son ; renvoie le nouvel état. */
function basculerSon() {
  actif = !actif;
  try { localStorage.setItem(CLE, actif ? "oui" : "non"); } catch { /* rien */ }
  return actif;
}

// ---------- Les sons des éléments (bruit filtré : l'eau, le feu, la roche, le vent…) ----------
let bruit = null;
function souffle(duree, filtre, f0, f1, volume = 0.18, delai = 0) {
  const a = audio(); if (!a) return;
  if (!bruit) {
    bruit = a.createBuffer(1, a.sampleRate * 1.5, a.sampleRate);
    const d = bruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + delai, src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = bruit; f.type = filtre; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + duree);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + duree + 0.05);
}

/** Le son d'un élément : `phase` 'lancer' (le coup part) ou 'impact' (il frappe). */
function jouerElement(element, phase = "impact") {
  const lancer = phase === "lancer";
  switch (element) {
    case "eau": lancer ? souffle(0.45, "bandpass", 600, 1800, 0.12) : (souffle(0.6, "lowpass", 2400, 300, 0.22), note(180, 0.25, "sine", 0.08)); break;
    case "feu": lancer ? souffle(0.4, "bandpass", 900, 2400, 0.12) : (souffle(0.7, "lowpass", 3000, 200, 0.25), note(90, 0.4, "triangle", 0.1)); break;
    case "terre": lancer ? souffle(0.3, "lowpass", 400, 200, 0.14) : (souffle(0.5, "lowpass", 300, 60, 0.3), note(55, 0.5, "sine", 0.2)); break;
    case "air": souffle(lancer ? 0.4 : 0.6, "highpass", lancer ? 1500 : 3000, lancer ? 4000 : 800, 0.12); break;
    case "foudre": lancer ? souffle(0.15, "highpass", 3000, 6000, 0.1) : (souffle(0.35, "highpass", 6000, 600, 0.28), note(70, 0.45, "sawtooth", 0.06)); break;
    case "fleurs": [1047, 1319, 1568].forEach((f, k) => note(f, 0.3, "sine", 0.05, k * 0.05)); break;
    default: lancer ? note(880, 0.2, "sine", 0.06) : [784, 1047, 1319].forEach((f, k) => note(f, 0.4, "sine", 0.07, k * 0.04));
  }
}

return { jouerSon, sonActif, basculerSon, jouerElement };
})();

// ===== js/ui/pleinEcran.js =====
M["js/ui/pleinEcran.js"] = (() => {
// Plein écran : un bouton qui ouvre la page entière en grand (et la referme). Commun au Chemin et au Duel.

/** Branche le bouton ; `apres()` est appelé quand l'écran change de taille (entrée ou sortie). */
function installerPleinEcran(bouton, apres = () => {}) {
  if (!bouton) return;
  const racine = document.documentElement;
  const possible = !!(racine.requestFullscreen || racine.webkitRequestFullscreen);
  if (!possible) { bouton.hidden = true; return; }
  const actif = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const maj = () => {
    bouton.textContent = actif() ? "⤡ Quitter le plein écran" : "⤢ Plein écran";
    bouton.setAttribute("aria-pressed", String(actif()));
    document.body.classList.toggle("plein-ecran", actif());
  };
  bouton.addEventListener("click", () => {
    if (actif()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (racine.requestFullscreen || racine.webkitRequestFullscreen).call(racine).catch?.(() => {});
  });
  for (const ev of ["fullscreenchange", "webkitfullscreenchange"]) document.addEventListener(ev, () => { maj(); setTimeout(apres, 60); });
  maj();
}

return { installerPleinEcran };
})();

// ===== js/ui/duelOutils.js =====
M["js/ui/duelOutils.js"] = (() => {
// Petits outils de l'interface du Duel, sans état : mises à jour sur place (rien ne clignote), éléments de panneau.

/**
 * Met à jour les enfants d'un conteneur sans tout reconstruire : un élément dont la signature n'a pas changé
 * est gardé tel quel (ses animations continuent). `liste` : [[signature, créer]].
 */
function reconcilier(conteneur, liste) {
  const enfants = [...conteneur.children];
  liste.forEach(([sig, creer], k) => {
    const ancien = enfants[k];
    if (ancien && ancien.dataset.sig === sig) return;
    const el = creer();
    el.dataset.sig = sig;
    if (ancien) ancien.replaceWith(el); else conteneur.appendChild(el);
  });
  for (let k = liste.length; k < enfants.length; k++) enfants[k].remove();
}

/** Pose ou retire des classes sur place (l'élément n'est pas recréé). */
function basculer(el, toutes, actives) { for (const k of toutes) el.classList.toggle(k, actives.includes(k)); }

/** Un élément des panneaux Accords et Techniques : titre, texte, état ; un bouton s'il y a une action. */
function itemPanneau(titre, texte, etat, action = null, classe = "") {
  const b = document.createElement(action ? "button" : "div");
  b.className = `technique-item ${classe}`;
  b.innerHTML = "<b></b><span></span><small></small>";
  b.querySelector("b").textContent = titre;
  b.querySelector("span").textContent = texte;
  b.querySelector("small").textContent = etat;
  if (action) b.addEventListener("click", action);
  return b;
}

return { reconcilier, basculer, itemPanneau };
})();

// ===== js/duel-main.js =====
M["js/duel-main.js"] = (() => {
// Le Duel des Apparitions : accueil (duel libre, Sept Gardiens), atelier du deck, tapis, main, invocations,
// figures d'accord, présages et chaînes, combats (flèche, calcul), tour de l'adversaire, animations.
const { CARTES, CARTE_PAR_ID } = M["js/data/cartes.js"];
const { DUEL, sacrificesRequis } = M["js/data/duel.js"];
const { FIGURES, figuresDebloquees } = M["js/data/accords.js"];
const { VOISINAGE, reglesDeclenchees } = M["js/data/voisinage.js"];
const { GARDIENS, PROFILS, deckGardien, reglesEnseignees } = M["js/data/gardiens.js"];
const { REGIONS } = M["js/config.js"];
const { creerHasard, nouvelleGraine, reprendreHasard } = M["js/engine/hasard.js"];
const {
  creerDuel, def, nomDe, familleDe, peutInvoquer, invoquer, peutActiver, activer, peutPoser, poser, peutChanger, changerPosition,
  fusionsPossibles, fusionner, passerAuCombat, passerPrincipale2, ciblesAttaque, calculCombat, attaquer,
  presagesActivables, presageOmbre, reagirInvocation, finTour, actionOmbre, executerOmbre, atkEffectif, defEffectif, LP,
  accordsTerrain, accomplirAccordTerrain, peutPoserInfluence, poserInfluence, evolutionsPossibles, evoluer, MECANIQUES, domine, influencesEnReponse, revelerEnReponse, influenceOmbre, preparerReprise, terrainsEnReponse, poserTerrainEnReponse, peutRevelerInfluence, revelerInfluence, techniquesPossibles, utiliserTechnique, avancementAssociation
} = M["js/engine/duel.js"];
const { ALIGNEMENTS, ASSOCIATIONS } = M["js/data/techniques.js"];
const { accordDeLecture, definirDictionnaire, dictionnaireCharge } = M["js/data/lectures.js"];
const { ETATS } = M["js/data/sorts.js"];
const { reconcilier, basculer, itemPanneau } = M["js/ui/duelOutils.js"];
const { noterVue, noterRegle, noterDuel, vaincreGardien } = M["js/engine/carnet.js"];
const { peindreCarteDuel, peindreHologramme } = M["js/render/carteDuel.js"];
const { Effets, elementDe, TEINTES } = M["js/render/effetsVisuels.js"];
const { Ambiance } = M["js/render/ambiance.js"];
const { chargerCarnet, sauverCarnet } = M["js/ui/stockage.js"];
const { jouerSon, basculerSon, sonActif, jouerElement } = M["js/ui/son.js"];
const { installerPleinEcran } = M["js/ui/pleinEcran.js"];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const survol = window.matchMedia?.("(hover: hover)").matches ?? false;
const attendre = ms => new Promise(r => setTimeout(r, reduit ? Math.min(ms, 150) : ms));
const carnet = chargerCarnet();
const CLE_DECK = "chemin-du-mage.deck";
const PLANETES = ["soleil", "lune", "mercure", "venus", "mars", "jupiter", "saturne"];

let d = null, rng = null, partie = null, consultant = "homme";
let selection = null;   // { type: 'main', index } | { type: 'terrain', place } | { type: 'sacrifice', index, pose, requis, choisis } | { type: 'attaque', place }
let occupe = false;
const lpAffiche = [LP, LP];

// ---------- Deck, réserve, rares ----------
function chargerDeck() {
  try { const x = JSON.parse(localStorage.getItem(CLE_DECK) || "null"); if (Array.isArray(x) && x.length >= 30) return x.filter(id => DUEL[id]); } catch { /* rien */ }
  return CARTES.map(c => c.id);
}
function sauverDeck(deck) { try { localStorage.setItem(CLE_DECK, JSON.stringify(deck)); } catch { /* rien */ } }
let deck = chargerDeck();
// La réserve : les figures dont vous connaissez la règle (Chemin, duels, Gardiens), plus quatre figures de départ.
// Une règle accomplie en duel fait aussi entrer sa figure dans la réserve, sur-le-champ.
const FIGURES_DEPART = [101, 102, 106, 111];
const reserveJoueur = () => [...new Set([...FIGURES_DEPART, ...figuresDebloquees(carnet.regles)])];
/** Les mécaniques que chaque Gardien dévoile (le premier n'enseigne que l'essentiel). */
const MECA_GARDIENS = [[], ["poseInfluence", "evolution"], ["poseInfluence", "evolution", "techniques"], ["poseInfluence", "evolution", "techniques", "figures"],
  ["poseInfluence", "evolution", "techniques", "figures", "accordsTerrain"], MECANIQUES, MECANIQUES];
const NOMS_MECA = { poseInfluence: "les influences posées face cachée", evolution: "l’évolution des apparitions", techniques: "les techniques (alignements, associations)",
  figures: "les figures d’accord", accordsTerrain: "les accords sur le terrain" };
let accordsDuDuel = [];
const estRare = id => id < 100 && (carnet.cartes[id]?.vecue || 0) > 0;

// ---------- Dessin ----------
function carteCanvas(id, face, largeur, classe = "", format = "complete") {
  const cv = document.createElement("canvas");
  cv.className = classe;
  peindreCarteDuel(cv, id, face, largeur, format);
  return cv;
}


// ---------- Loupe : la carte entière, en grand, au survol (ou en appui long sur écran tactile) ----------
const loupe = document.createElement("div");
loupe.className = "loupe";
loupe.setAttribute("aria-hidden", "true");
const loupeCanvas = document.createElement("canvas");
loupe.appendChild(loupeCanvas);
document.body.appendChild(loupe);
let loupeId = null;
function montrerLoupe(id, face, ancre) {
  if (id == null) return;
  const l = Math.min(320, window.innerWidth - 32, (window.innerHeight - 32) * 150 / 219);
  if (loupeId !== `${id}|${face}|${l}`) { peindreCarteDuel(loupeCanvas, id, face, l); loupeId = `${id}|${face}|${l}`; }
  loupeCanvas.style.width = `${l}px`;
  const h = l * 219 / 150, r = ancre.getBoundingClientRect();
  let x = r.right + 14;
  if (x + l > window.innerWidth - 8) x = r.left - l - 14;
  if (x < 8) x = (window.innerWidth - l) / 2;
  const y = Math.max(8, Math.min(window.innerHeight - h - 8, r.top + r.height / 2 - h / 2));
  loupe.style.left = `${x}px`; loupe.style.top = `${y}px`;
  loupe.classList.add("visible");
}
function cacherLoupe() { loupe.classList.remove("visible"); }
/** Branche la loupe (et l'aperçu passager du panneau) sur un élément. `quoi()` → [id, face, état] ou null. */
function loupable(el, quoi) {
  if (survol) {
    el.addEventListener("mouseenter", () => { const q = quoi(); if (!q) return; montrerLoupe(q[0], q[1], el); apercu(q[0], q[1], q[2], true); });
    el.addEventListener("mouseleave", () => { cacherLoupe(); retablirApercu(); });
  } else {
    let minuteur = null, longue = false;
    el.addEventListener("pointerdown", () => { longue = false; minuteur = setTimeout(() => { const q = quoi(); if (q) { longue = true; montrerLoupe(q[0], q[1], el); } }, 420); });
    const fin = () => { clearTimeout(minuteur); if (longue) setTimeout(cacherLoupe, 60); };
    el.addEventListener("pointerup", fin); el.addEventListener("pointercancel", fin); el.addEventListener("pointerleave", fin);
    el.addEventListener("contextmenu", e => e.preventDefault());
    el.addEventListener("click", e => { if (longue) { e.stopImmediatePropagation(); e.preventDefault(); longue = false; } }, true);
  }
}

// ---------- Effets visuels propres à chaque carte ----------
const effets = new Effets($("plateau"));
// l'ambiance du tapis (particules lentes du ciel et des terrains)
const ambiance = new Ambiance($("tapis"));
/** L'élément d'une carte (sa planète) ; les figures d'accord ont le leur. */
const elementCarte = id => elementDe(id >= 100 ? null : familleDe(id));
// la barre de vie laisse une traînée claire quand elle baisse, comme dans les jeux de combat
for (const j of [0, 1]) { const s = document.createElement("span"); s.className = "lp-trainee"; s.id = `lp-trainee-${j}`; $(`lp-jauge-${j}`).before(s); }
/** Joue l'effet d'une carte : sur tout le tapis, ou autour d'un élément (agrandi). */
function effetCarte(id, cible = null, agrandir = 1, avecEmbleme = false) {
  if (!cible) return effets.carte(id, effets.rect($("tapis")), avecEmbleme);
  const r = effets.rect(cible), w = r.w * agrandir, h = r.h * agrandir;
  return effets.carte(id, { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h }, avecEmbleme);
}
function enveloppe(cv, id, face) {
  const s = document.createElement("span");
  s.className = `carte-env${face && estRare(id) ? " rare" : ""}${face && def(id).forte ? " forte" : ""}${face && id >= 100 ? " figure" : ""}`;
  s.appendChild(cv);
  return s;
}

let zone = 92, largeurMain = 150;
const etroit = () => window.innerWidth <= 1040;
function tailleZone() {
  const parLargeur = $("monstres-0").clientWidth / 5 - 8;
  const parHauteur = window.innerWidth <= 640 ? 999 : (window.innerHeight - 290) / 4.1;
  return Math.max(52, Math.min(104, parLargeur, parHauteur));
}
/** Tout doit tenir dans l'écran, main comprise : on réduit les zones tant que la page déborde. */
const image_suivante = () => new Promise(r => setTimeout(r, 60));
let reglage = 0;
/**
 * Tout doit tenir dans l'écran, main comprise. On pose des tailles, on laisse le navigateur les afficher, on mesure
 * le débordement, et on le répartit : d'abord sur le tapis (4,2 px de hauteur par px de zone), puis sur la main.
 * (Mesurer juste après avoir changé une variable CSS donne parfois l'ancienne mise en page : d'où l'attente.)
 */
async function ajusterTaille() {
  const moi = ++reglage, racine = document.documentElement.style;
  const poser = () => { racine.setProperty("--zone", `${Math.round(zone)}px`); racine.setProperty("--main-l", `${Math.round(largeurMain)}px`); };
  const zoneMax = () => Math.min(104, $("monstres-0").clientWidth / 5 - 8);
  largeurMain = window.innerWidth <= 640 ? 88 : Math.max(96, Math.min(150, window.innerHeight * 0.18));
  zone = tailleZone();
  poser(); rendre();
  for (let k = 0; k < 4; k++) {
    await image_suivante();
    if (moi !== reglage) return;
    let r = $("plateau").getBoundingClientRect().bottom + window.scrollY - (window.innerHeight - 6);
    if (Math.abs(r) < 6) break;
    if (r > 0) {
      const dz = Math.min(r / 4.2, Math.max(0, zone - 62)); zone -= dz; r -= dz * 4.2;
      if (r > 0) { const dl = Math.min(r / 1.46, Math.max(0, largeurMain - 92)); largeurMain -= dl; r -= dl * 1.46; }
      if (r > 0) zone = Math.max(44, zone - r / 4.2);
    } else {
      r = -r;
      const dz = Math.min(r / 4.2, Math.max(0, zoneMax() - zone)); zone += dz;
    }
    zone = Math.floor(zone); largeurMain = Math.floor(largeurMain);
    poser(); rendre();
  }
}

function rendre() {
  if (!d) return;
  for (const j of [0, 1]) {
    const J = d.joueurs[j];
    allerLP(j, J.lp);
    $(`pioche-${j}`).textContent = J.pioche.length;
    const cim = $(`cimetiere-${j}`);
    cim.querySelector("b").textContent = J.cimetiere.length;
    const haut = J.cimetiere[J.cimetiere.length - 1];
    reconcilier(cim.querySelector(".pile-carte"), haut != null ? [[`${haut}|${zone}`, () => carteCanvas(haut, true, zone * 0.62, "", "jeton")]] : []);
    $(`reserve-${j}`).querySelector("b").textContent = J.reserve.length;
    reconcilier($(`monstres-${j}`), J.monstres.map((m, place) => [sigMonstre(j, m, place), () => zoneMonstre(j, m, place)]));
    [...$(`monstres-${j}`).children].forEach((el, place) => { if (J.monstres[place]) majMonstre(el, j, J.monstres[place], place); });
    reconcilier($(`presages-${j}`), J.presages.map((p, place) => [sigPresage(j, p, place), () => zonePresage(j, p, place)]));
    [...$(`presages-${j}`).children].forEach((el, place) => basculer(el, ["prete"], j === 0 && J.presages[place]?.influence && peutRevelerInfluence(d, 0, place).ok ? ["prete"] : []));
    $(`lp-${j}`).classList.toggle("actif", d.actif === j && !d.fini);
  }
  $("nom-1").textContent = d.joueurs[1].nom;
  const voit = d.joueurs[0].voitMain;
  reconcilier($("main-1"), d.joueurs[1].main.map(id => [`${voit ? id : "dos"}|${zone}`, () => carteCanvas(id, voit, zone * 0.5, "carte-ombre", "compacte")]));
  reconcilierMain();
  const direct = selection?.type === "attaque" && ciblesAttaque(d, 0, selection.place).includes("direct");
  $("lp-1").classList.toggle("ciblable", direct);
  const t = d.terrain ? REGIONS.find(r => r.famille === d.terrain) : null;
  $("terrain-nom").textContent = t ? `Ciel du duel : ${t.glyphe} ${t.nom}` : "";
  for (const j of [0, 1]) majLieu(j);
  $("tapis").dataset.terrain = d.terrain || "";
  ambiance.regler(d.terrain, [d.joueurs[0].terrainCarte, d.joueurs[1].terrainCarte]);
  majCommandes();
  $("indication").textContent = indication();
}

/** Les marques de sélection d'une zone d'apparition (elles entrent dans sa signature). */
const MARQUES = ["prete", "choisie", "ciblable", "sacrifiee-choisie"];

function marquesMonstre(j, m, place) {
  const k = [];
  if (!m) return k;
  if (j === 0 && ciblesAttaque(d, 0, place).length) k.push("prete");
  if (selection?.type === "attaque" && j === 0 && selection.place === place) k.push("choisie");
  if (selection?.type === "attaque" && j === 1 && ciblesAttaque(d, 0, selection.place).includes(place)) k.push("ciblable");
  if (selection?.type === "sacrifice" && j === 0) k.push(selection.choisis.includes(place) ? "sacrifiee-choisie" : "ciblable");
  if (selection?.type === "terrain" && j === 0 && selection.place === place) k.push("choisie");
  return k;
}
function sigMonstre(j, m, place) {
  if (!m) return `vide|${zone}`;
  // seulement ce qui change le dessin : valeurs, états et surlignages se mettent à jour sur place
  return [zone, m.uid, m.id, m.position, m.faceCachee, estRare(m.id)].join("|");
}
function sigPresage(j, p, place) {
  if (!p) return `vide|${zone}`;
  return [zone, p.uid, p.id, p.continue, p.tours, p.poseTour < d.tour, j, !!p.influence].join("|");
}

/** Le terrain posé par un joueur : sa moitié du tapis prend la couleur du lieu, un écriteau donne son nom. */
function majLieu(j) {
  const J = d.joueurs[j], moitie = document.querySelector(j === 0 ? ".moitie-vous" : ".moitie-ombre");
  const id = J.terrainCarte;
  moitie.dataset.lieu = id ?? "";
  let e = moitie.querySelector(".lieu-nom");
  if (!e) {
    e = document.createElement("button"); e.className = "lieu-nom"; moitie.appendChild(e);
    e.addEventListener("click", () => { const k = d.joueurs[j].terrainCarte; if (k != null) { apercu(k, true, etatLieu(j)); ouvrirDetail(); } });
    loupable(e, () => { const k = d.joueurs[j].terrainCarte; return k != null ? [k, true, etatLieu(j)] : null; });
  }
  e.hidden = id == null;
  const texte = id == null ? "" : `⌂ ${nomDe(id)} · ${J.terrainTours} tour${J.terrainTours > 1 ? "s" : ""}`;
  if (e.textContent !== texte) e.textContent = texte;
}
const etatLieu = j => `Terrain de ${j === 0 ? "votre côté" : d.joueurs[1].nom} : encore ${d.joueurs[j].terrainTours} tour${d.joueurs[j].terrainTours > 1 ? "s" : ""}.`;

function zoneMonstre(j, m, place) {
  const el = document.createElement("button");
  el.className = "zone zone-monstre";
  el.dataset.j = j; el.dataset.place = place;
  if (!m) {
    el.classList.add("vide");
    el.setAttribute("aria-label", "Zone d’apparition vide");
    el.addEventListener("click", () => cliquerZone(j, place));
    return el;
  }
  const carte = document.createElement("div");
  carte.className = `carte-terrain ${m.position === "defense" ? "defense" : ""} ${m.faceCachee ? "cachee" : ""}`;
  carte.appendChild(enveloppe(carteCanvas(m.id, !m.faceCachee, zone * 0.7, "", "jeton"), m.id, !m.faceCachee));
  el.appendChild(carte);
  if (!m.faceCachee) {
    const holo = document.createElement("canvas");
    const grand = m.id >= 100 || def(m.id).forte;
    holo.className = `holo ${m.position === "defense" ? "holo-defense" : ""} ${m.id >= 100 ? "holo-figure" : ""} ${grand ? "holo-forte" : ""}`;
    peindreHologramme(holo, m.id, Math.round(zone * (grand ? 1.3 : 1.1)));
    el.appendChild(holo);
  }
  el.insertAdjacentHTML("beforeend", `<div class="stats-terrain"></div><div class="etats-terrain"></div>`);
  const visible = !m.faceCachee || j === 0;
  majMonstre(el, j, m, place);
  el.addEventListener("click", () => cliquerZone(j, place));
  if (visible) loupable(el, () => {
    const mm = d.joueurs[j].monstres[place];
    return mm ? [mm.id, !mm.faceCachee || j === 0, etatMonstre(j, mm)] : null;
  });
  return el;
}

/** Valeurs, états, surlignages et libellé d'une zone d'apparition, mis à jour sans la recréer. */
function majMonstre(el, j, m, place) {
  const x = def(m.id), a = atkEffectif(d, j, m), df = defEffectif(d, j, m);
  const stats = !m.faceCachee || j === 0
    ? `<small class="nom-terrain">${esc(nomDe(m.id))}</small><span class="v-atk ${m.position === "attaque" ? "actif" : ""} ${a > x.atk ? "plus" : a < x.atk ? "moins" : ""}">${a}</span><i>/</i><span class="v-def ${m.position === "defense" ? "actif" : ""} ${df > x.def ? "plus" : df < x.def ? "moins" : ""}">${df}</span>`
    : "<span>?</span>";
  const etats = [];
  if (!m.faceCachee && x.garde) etats.push("<span title='garde'>⛨</span>");
  if (!m.faceCachee && j === 1 && d.joueurs[0].monstres.some(n => n && !n.faceCachee && domine(n.id, m.id))) etats.push("<span title='une de vos apparitions domine sa planète : +500 ATK contre elle'>▲</span>");
  if (!m.faceCachee && m.protege) etats.push("<span title='protégée une fois'>◈</span>");
  if (m.equipements?.length) etats.push(`<span title="équipée">⚒${m.equipements.length > 1 ? m.equipements.length : ""}</span>`);
  if (m.bloque > 0) etats.push(`<span title="ne peut pas attaquer">⛓${m.bloque}</span>`);
  if (j === 0 && m.faceCachee) etats.push("<span title='posée face cachée'>◐</span>");
  if (m.statut && !m.faceCachee) etats.push(`<span title="${ETATS[m.statut].texte}">${ETATS[m.statut].signe}</span>`);
  const s = el.querySelector(".stats-terrain"), e = el.querySelector(".etats-terrain");
  if (s && s.innerHTML !== stats) s.innerHTML = stats;
  if (e && e.dataset.v !== etats.join("")) { e.innerHTML = etats.join(""); e.dataset.v = etats.join(""); }
  const visible = !m.faceCachee || j === 0;
  el.setAttribute("aria-label", visible ? `${nomDe(m.id)}, ${m.position === "attaque" ? "en attaque" : "en défense"}${m.faceCachee ? ", face cachée" : ""}, ATK ${a}, DEF ${df}` : "Apparition face cachée");
  basculer(el, MARQUES, marquesMonstre(j, m, place));
  const auras = [];
  if (m.bloque > 0) auras.push("a-bloquee");
  if (m.protege && !m.faceCachee) auras.push("a-protegee");
  if (m.statut && !m.faceCachee) auras.push(`a-${m.statut}`);
  if (j === 0 && evolutionsPossibles(d, 0).some(x => x.place === place)) auras.push("evolutive");
  basculer(el, ["a-bloquee", "a-protegee", "a-poison", "a-brulure", "a-sommeil", "a-confusion", "evolutive"], auras);
}

function zonePresage(j, p, place) {
  const el = document.createElement("button");
  el.className = "zone zone-presage";
  el.dataset.j = j; el.dataset.place = place;
  if (!p) { el.classList.add("vide"); el.setAttribute("aria-label", "Zone de présage vide"); el.disabled = true; return el; }
  const visible = !!p.continue;
  const carte = document.createElement("div");
  carte.className = `carte-terrain ${visible ? "" : "cachee"}`;
  carte.appendChild(enveloppe(carteCanvas(p.id, visible, zone * 0.62, "", "jeton"), p.id, visible));
  el.appendChild(carte);
  if (p.influence) el.classList.add("influence-posee");
  const pret = p.poseTour < d.tour;
  if (p.continue) el.insertAdjacentHTML("beforeend", `<div class="etats-terrain presage-etat"><span>∞ ${p.tours}</span></div>`);
  else if (j === 0) el.insertAdjacentHTML("beforeend", `<div class="etats-terrain presage-etat${p.influence ? " influence-etat" : ""}"><span>${p.influence ? (pret ? "✦ à révéler" : "✦ posée") : pret ? "prêt" : "posé"}</span></div>`);
  if (j === 0 || visible) {
    const etat = p.continue ? `Influence continue : encore ${p.tours} tour${p.tours > 1 ? "s" : ""}.`
      : p.influence ? (pret ? "Influence posée face cachée : vous pouvez la révéler pendant votre phase principale." : "Influence posée ce tour : elle se révélera à partir de votre prochain tour.")
      : pret ? "Présage posé, prêt à se déclencher pendant le tour adverse." : "Présage posé ce tour : il pourra se déclencher à partir du prochain tour adverse.";
    el.setAttribute("aria-label", `${nomDe(p.id)} : ${etat}`);
    el.addEventListener("click", () => {
      if (occupe) return;
      selection = null; apercu(p.id, true, etat); ouvrirDetail();
      const P = d.joueurs[j].presages[place];
      if (j === 0 && P?.influence) {
        const v = peutRevelerInfluence(d, 0, place), x = def(P.id);
        actions(x.choix ? x.choix.map((ch, c) => ({ label: `Révéler : ${ch.label}`, desactive: v.ok ? null : v.raison, action: () => revelerPosee(place, c) }))
          : [{ label: x.sousType === "equipement" ? "Révéler et équiper" : "Révéler", desactive: v.ok ? null : v.raison, action: () => revelerPosee(place, null) }]);
      } else actions([]);
      rendre();
    });
    loupable(el, () => [p.id, true, etat]);
  } else { el.setAttribute("aria-label", "Présage adverse, face cachée"); el.disabled = true; }
  return el;
}

/** Les marques d'une carte en main : jouable, choisie, matériau d'accord. */
function etatMain(id, index) {
  const x = def(id), k = [];
  if (d.actif === 0 && !d.fini && (x.type === "apparition" ? peutInvoquer(d, 0, index).ok || peutInvoquer(d, 0, index, true).ok
    : x.type === "influence" ? peutActiver(d, 0, index).ok || peutPoserInfluence(d, 0, index).ok : peutPoser(d, 0, index).ok)) k.push("jouable");
  if ((selection?.type === "main" || selection?.type === "sacrifice") && selection.index === index) k.push("choisie");
  if (d.actif === 0 && fusionsPossibles(d, 0).some(f => f.materiaux.some(m => m.ou === "main" && m.index === index))) k.push("materiau");
  if (estRare(id)) k.push("rare");
  return k;
}

function carteMain(id) {
  const b = document.createElement("button");
  b.className = "carte-main";
  const x = def(id);
  b.setAttribute("aria-label", `${nomDe(id)}, ${x.type === "apparition" ? `apparition niveau ${x.niveau}, ATK ${x.atk}, DEF ${x.def}` : x.type}${estRare(id) ? ", rare" : ""}`);
  b.appendChild(enveloppe(carteCanvas(id, true, largeurMain, "", "compacte"), id, true));
  b.addEventListener("click", () => choisirMain(b._index));
  b.addEventListener("animationend", () => b.classList.remove("piochee"));
  loupable(b, () => [id, true, ""]);
  return b;
}

/**
 * La main : chaque carte garde son élément tant qu'elle reste en main (clé : numéro et rang du doublon) ;
 * seules sa place dans l'éventail et ses marques changent. Rien n'est redessiné, rien ne clignote.
 */
function reconcilierMain() {
  const box = $("main-0"), main = d.joueurs[0].main, n = main.length;
  const dispo = new Map();
  for (const el of box.children) { const c = el.dataset.cle; if (!dispo.has(c)) dispo.set(c, []); dispo.get(c).push(el); }
  const vus = {}, voulus = main.map(id => {
    vus[id] = (vus[id] || 0) + 1;
    const cle = `${id}#${vus[id]}|${largeurMain}`;
    let el = dispo.get(cle)?.shift();
    if (!el) { el = carteMain(id); el.dataset.cle = cle; }
    return el;
  });
  for (const reste of dispo.values()) for (const el of reste) el.remove();
  // la main est étalée, cartes côte à côte : si elles ne tiennent pas toutes, elles rapetissent un peu
  const l = Math.min(largeurMain, (box.clientWidth - 8 * (n + 1)) / Math.max(1, n));
  box.style.setProperty("--main-l", `${Math.max(window.innerWidth <= 640 ? 58 : 60, Math.floor(l))}px`);
  voulus.forEach((el, index) => {
    if (box.children[index] !== el) box.insertBefore(el, box.children[index] || null);
    el._index = index;
    el.style.setProperty("--i", index - (n - 1) / 2);
    basculer(el, ["jouable", "choisie", "materiau"], etatMain(main[index], index));
    indicesMain(el, main[index], index);
  });
}

/** Indices sur une carte de la main : avec combien de vos cartes elle s'associe (✦, doré si c'est une règle de Belline), si elle peut faire évoluer une apparition (⇧). */
function indicesMain(el, id, index) {
  const J = d.joueurs[0];
  const autres = [...J.main.filter((_, k) => k !== index), ...J.monstres.filter(m => m && !m.faceCachee).map(m => m.id), ...J.presages.filter(p => p?.continue).map(p => p.id)].filter(x => x < 100);
  let n = 0, belline = false;
  for (const o of new Set(autres)) {
    if (reglesDeclenchees({ id, choix: 0 }, { id: o, choix: 0 }).length || reglesDeclenchees({ id: o, choix: 0 }, { id, choix: 0 }).length) { n++; belline = true; }
    else if (accordDeLecture(id, o, nomDe)?.sorte && accordDeLecture(id, o, nomDe).sorte !== "lecture") n++;
  }
  const evo = d.actif === 0 && evolutionsPossibles(d, 0).some(e => e.index === index);
  const cle = `${n}|${belline}|${evo}`;
  if (el.dataset.indices === cle) return;
  el.dataset.indices = cle;
  el.querySelectorAll(".indice-accord, .indice-evolution").forEach(x => x.remove());
  if (n) { const s = document.createElement("span"); s.className = `indice-accord${belline ? " belline" : ""}`; s.textContent = `✦${n > 1 ? n : ""}`; s.title = `${n} association${n > 1 ? "s" : ""} avec vos cartes${belline ? ", dont une règle de Belline" : ""}`; el.appendChild(s); }
  if (evo) { const s = document.createElement("span"); s.className = "indice-evolution"; s.textContent = "⇧"; s.title = "Peut faire évoluer une de vos apparitions"; el.appendChild(s); }
}

const ORDRE_PHASES = ["pioche", "principale1", "combat", "principale2", "fin"];
function majCommandes() {
  const phase = d.fini ? "fin" : d.phase;
  for (const li of $("phases").children) {
    li.classList.toggle("courante", li.dataset.phase === phase);
    li.classList.toggle("passee", ORDRE_PHASES.indexOf(li.dataset.phase) < ORDRE_PHASES.indexOf(phase));
  }
  $("phases").classList.toggle("ombre", d.actif === 1);
  const monTour = d.actif === 0 && !d.fini && !occupe;
  const bc = $("bouton-combat");
  bc.disabled = !monTour || d.tour === 1 || d.phase === "principale2";
  bc.textContent = d.phase === "combat" ? "Fin du combat" : "⚔ Combat (C)";
  $("bouton-fin-tour").disabled = !monTour;
  const f = monTour ? fusionsPossibles(d, 0).length + accordsTerrain(d, 0).length : 0;
  const ba = $("bouton-accord");
  ba.disabled = false; ba.textContent = f ? `✦ Accords (${f})` : "✦ Accords";
  ba.classList.toggle("brille", f > 0);
  const t = monTour ? techniquesPossibles(d, 0).length : 0;
  const bt = $("bouton-technique");
  bt.hidden = !d.mec.techniques;
  bt.textContent = t ? `☉ Technique (${t})` : "☉ Techniques";
  bt.classList.toggle("brille", t > 0);
}

function indication() {
  if (d.fini) return d.gagnant === 0 ? "Victoire !" : "Défaite.";
  if (d.actif !== 0) return `${d.joueurs[1].nom} joue…`;
  if (selection?.type === "sacrifice") return `Choisissez ${selection.requis - selection.choisis.length} apparition${selection.requis - selection.choisis.length > 1 ? "s" : ""} à sacrifier.`;
  if (selection?.type === "attaque") return "Choisissez la cible.";
  if (d.phase === "combat") return d.tour === 1 ? "Pas d’attaque au premier tour." : "Touchez une apparition prête, puis sa cible.";
  return "Invoquez, posez, jouez vos influences ; puis le combat.";
}

// ---------- Détail et actions ----------
function etatMonstre(j, m) {
  const x = def(m.id), a = atkEffectif(d, j, m), df = defEffectif(d, j, m);
  const bonus = [];
  if (a !== m.atk) bonus.push(`affinité et terrain : ${a - m.atk > 0 ? "+" : ""}${a - m.atk} ATK`);
  if (m.atk !== x.atk || m.def !== x.def) bonus.push(`modifiée : ${m.atk - x.atk >= 0 ? "+" : ""}${m.atk - x.atk} ATK, ${m.def - x.def >= 0 ? "+" : ""}${m.def - x.def} DEF`);
  return `${m.faceCachee ? "Face cachée. " : ""}En ${m.position === "attaque" ? "attaque" : "défense"} · ATK ${a} · DEF ${df}${bonus.length ? ` (${bonus.join(" ; ")})` : ""}${m.bloque ? ` · bloquée ${m.bloque}` : ""}`;
}

/** Le panneau suit la carte choisie ; un survol ne l'y montre qu'en passant (`temporaire`), puis on y revient. */
let apercuFixe = null;
function retablirApercu() {
  if (apercuFixe) apercu(...apercuFixe);
  else if (!$("actions").children.length) $("detail").classList.add("vide");
}
function fermerDetail() { apercuFixe = null; $("detail").classList.add("vide"); fermerFeuille(); }
// Sur écran étroit, le panneau est une feuille qui monte du bas : elle s'ouvre quand le joueur touche une carte.
function ouvrirDetail() { $("detail").classList.add("ouvert"); }
function fermerFeuille() { $("detail").classList.remove("ouvert"); }
$("detail-fermer").addEventListener("click", () => { if (selection) annuler(); else fermerFeuille(); });

function apercu(id, face = true, etat = "", temporaire = false) {
  if (id == null) return;
  if (!temporaire) apercuFixe = [id, face, etat];
  const box = $("detail");
  box.classList.remove("vide");
  box.classList.toggle("passager", temporaire);
  const l = etroit() ? (window.innerWidth <= 640 ? 120 : 150) : Math.min(240, box.clientWidth - 24 || 240);
  peindreCarteDuel($("detail-carte"), id, face, l);
  $("detail-carte").style.width = `${l}px`;
  $("detail-carte").classList.toggle("rare", face && estRare(id));
  $("detail-etat").textContent = etat;
  if (!face) { $("detail-notice").textContent = ""; $("detail-mot").textContent = ""; return; }
  if (id >= 100) {
    const F = FIGURES[id];
    $("detail-notice").textContent = `« ${VOISINAGE.find(r => r.id === F.regles[0]).texte} »`;
    $("detail-mot").textContent = `Figure d’accord (création de jeu) : ${F.materiaux.map(m => (Array.isArray(m) ? "une Étoile" : CARTE_PAR_ID[m].nom)).join(" et ")}.`;
  } else {
    $("detail-notice").textContent = `« ${CARTE_PAR_ID[id].notice} »`;
    $("detail-mot").textContent = `Notice de Belline · force tirée du mot « ${DUEL[id].mot} »${estRare(id) ? " · carte rare : vécue dans le Chemin" : ""}.`;
    const lien = document.createElement("a");
    lien.href = "../index.html#/grimoire"; lien.className = "lien-grimoire"; lien.textContent = " Ouvrir sa fiche dans le Grimoire ›";
    lien.addEventListener("click", () => { try { localStorage.setItem("belline.grimoire.open", JSON.stringify(id === 0 ? 53 : id)); } catch { /* rien */ } });
    $("detail-mot").appendChild(lien);
  }
}

function actions(boutons) {
  const z = $("actions");
  z.replaceChildren(...boutons.map(b => {
    const el = document.createElement("button");
    el.textContent = b.label;
    if (b.desactive) { el.disabled = true; el.title = b.desactive; }
    if (b.classe) el.className = b.classe;
    el.addEventListener("click", b.action);
    return el;
  }));
  z.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
}

function annuler() { selection = null; actions([]); cacherFleche(); fermerDetail(); if (d) rendre(); }

function choisirMain(index) {
  if (occupe || !d || d.fini) return;
  const id = d.joueurs[0].main[index];
  if (id == null) return;
  if (selection?.type === "main" && selection.index === index) return annuler();
  const x = def(id);
  selection = { type: "main", index };
  apercu(id); ouvrirDetail();
  if (d.actif !== 0) { actions([]); rendre(); return; }
  if (x.type === "apparition") {
    const v1 = peutInvoquer(d, 0, index), v2 = peutInvoquer(d, 0, index, true);
    const s = v1.sacrifices ?? sacrificesRequis(id), off = v1.offrande || 0;
    const cout = [s ? `${s} sacrifice${s > 1 ? "s" : ""}` : "", off ? `offrande ${off * 1500} points` : ""].filter(Boolean).join(" + ");
    actions([
      { label: `Invoquer en attaque${cout ? ` (${cout})` : ""}`, desactive: v1.ok ? null : v1.raison, action: () => preparerInvocation(index, false) },
      { label: "Poser face cachée", desactive: v2.ok ? null : v2.raison, action: () => preparerInvocation(index, true) },
      ...evolutionsPossibles(d, 0).filter(e => e.index === index).map(e => ({ label: `⇧ Faire évoluer ${nomDe(e.de)}`, action: () => executerEvolution(index, e.place), classe: "evolution-bouton" }))
    ]);
  } else if (x.type === "influence") {
    const v = peutActiver(d, 0, index);
    const vp = peutPoserInfluence(d, 0, index);
    actions([...(x.choix ? x.choix.map((ch, c) => ({ label: `Activer : ${ch.label}`, desactive: v.ok ? null : v.raison, action: () => jouerInfluence(index, c) }))
      : [{ label: x.sousType === "equipement" ? "Équiper" : x.sousType === "terrain" ? (d.joueurs[0].terrainCarte != null ? "Poser le terrain (casse l’actuel)" : "Poser le terrain") : "Activer", desactive: v.ok ? null : v.raison, action: () => jouerInfluence(index, null) }]),
      { label: "Poser face cachée", desactive: vp.ok ? null : vp.raison, action: () => poserCachee(index), classe: "discret-fonce" }]);
  } else {
    const v = peutPoser(d, 0, index);
    actions([{ label: "Poser le présage", desactive: v.ok ? null : v.raison, action: () => jouerPresage(index) }]);
  }
  rendre();
}

function preparerInvocation(index, pose) {
  const s = peutInvoquer(d, 0, index, pose).sacrifices ?? sacrificesRequis(d.joueurs[0].main[index]);
  if (!s) return executerInvocation(index, pose, []);
  selection = { type: "sacrifice", index, pose, requis: s, choisis: [] };
  actions([{ label: "Annuler", action: annuler, classe: "discret-fonce" }]);
  rendre();
}

function cliquerZone(j, place) {
  if (occupe || !d || d.fini) return;
  const m = d.joueurs[j].monstres[place];
  if (selection?.type === "sacrifice") {
    if (j !== 0 || !m) return;
    const s = selection;
    s.choisis = s.choisis.includes(place) ? s.choisis.filter(p => p !== place) : [...s.choisis, place];
    if (s.choisis.length >= s.requis) { const { index, pose, choisis } = s; return executerInvocation(index, pose, choisis); }
    return rendre();
  }
  if (selection?.type === "attaque" && j === 1 && m && ciblesAttaque(d, 0, selection.place).includes(place)) return executerAttaque(selection.place, place);
  if (!m) return;
  ouvrirDetail();
  if (j === 1) {
    apercu(m.id, !m.faceCachee, m.faceCachee ? "Apparition face cachée, en défense." : etatMonstre(1, m));
    if (selection?.type !== "attaque") { selection = null; actions([]); }
    return rendre();
  }
  apercu(m.id, true, etatMonstre(0, m));
  const liste = [];
  if (d.actif === 0 && d.phase === "combat") {
    const cibles = ciblesAttaque(d, 0, place);
    if (cibles.length) {
      selection = { type: "attaque", place };
      if (cibles.includes("direct")) liste.push({ label: "⚔ Attaque directe", action: () => executerAttaque(place, "direct") });
      liste.push({ label: "Annuler", action: annuler, classe: "discret-fonce" });
      actions(liste);
      return rendre();
    }
  }
  selection = { type: "terrain", place };
  const v = peutChanger(d, 0, place);
  liste.push({ label: m.faceCachee ? "Retourner (en attaque)" : m.position === "attaque" ? "Passer en défense" : "Passer en attaque", desactive: v.ok ? null : v.raison, action: () => executerPosition(place) });
  actions(liste);
  rendre();
}

// ---------- Coups du joueur ----------
async function apresInvocation(ev, k) {
  // le défenseur k peut répondre par un présage à une invocation
  const inv = ev.find(e => e.type === "invocation" && e.j !== k);
  if (!inv || d.fini) return;
  if (k === 1) {
    const r = presageOmbre(d, 1, "invocation", { place: inv.place });
    if (r != null) await animer(reagirInvocation(d, 1, r, inv.place), true);
  } else {
    const dispo = presagesActivables(d, 0, "invocation");
    if (!dispo.length) return;
    const m = d.joueurs[1].monstres[inv.place];
    const r = await demanderReaction(dispo, `${d.joueurs[1].nom} invoque ${nomDe(inv.id)} (ATK ${atkEffectif(d, 1, m)}, DEF ${defEffectif(d, 1, m)}).`);
    if (r != null) await animer(reagirInvocation(d, 0, r, inv.place), true);
  }
}

async function executerInvocation(index, pose, sacrifices) {
  const id = d.joueurs[0].main[index];
  selection = null; actions([]);
  const ev = invoquer(d, 0, index, { pose, sacrifices }, rng);
  noterVue(carnet, id); sauverCarnet(carnet);
  await animer(ev, true);
  await apresInvocation(ev, 1);
  finAction();
}

async function jouerInfluence(index, choix) {
  const id = d.joueurs[0].main[index];
  selection = null; actions([]);
  noterVue(carnet, id); sauverCarnet(carnet);
  const contre = presageOmbre(d, 1, "influence", { index, choix });
  await animer(activer(d, 0, index, { choix, contre }, rng));
  finAction();
}

async function poserCachee(index) { selection = null; actions([]); await animer(poserInfluence(d, 0, index)); finAction(); }
async function revelerPosee(place, choix) {
  const id = d.joueurs[0].presages[place]?.id;
  if (id == null) return;
  selection = null; actions([]);
  noterVue(carnet, id); sauverCarnet(carnet);
  const contre = presageOmbre(d, 1, "influence", { revelee: true, place, choix });
  await animer(revelerInfluence(d, 0, place, { choix, contre }, rng));
  finAction();
}
async function executerTechnique(cle) {
  fermerGalerie();
  await animer(utiliserTechnique(d, 0, cle, rng), true);
  finAction();
}

/** Les techniques : celles qui sont prêtes, puis le codex des associations avec leur avancement. */
function ouvrirTechniques() {
  if (!d) return;
  const pretes = d.actif === 0 && !occupe ? techniquesPossibles(d, 0) : [];
  const J = d.joueurs[0];
  $("galerie-titre").textContent = "Techniques";
  $("galerie-texte").textContent = "Ajouts de jeu. Une technique par tour, en phase principale. Alignement : trois apparitions face recto d’une même planète. Association : des cartes révélées pendant le duel, comme les cartes d’un tirage qui se répondent ; chacune sert une fois.";
  const item = itemPanneau;
  const liste = [];
  for (const t of pretes) liste.push(item(`${t.sorte === "alignement" ? t.glyphe : "✦"} ${t.nom}`, t.texte, "Prête : touchez pour l’utiliser", () => executerTechnique(t.cle), "prete"));
  if (!pretes.length) liste.push(item("Aucune technique prête", d.actif === 0 && J.techniqueFaite ? "Vous avez déjà utilisé une technique ce tour." : "Alignez trois apparitions d’une même planète, ou révélez les cartes d’une association.", "", null, "vide"));
  for (const [f, a] of Object.entries(ALIGNEMENTS)) {
    const n = J.monstres.filter(m => m && !m.faceCachee && m.id < 100 && CARTE_PAR_ID[m.id].famille === f).length;
    if (!pretes.some(t => t.cle === `alignement:${f}`)) liste.push(item(`${a.glyphe} ${a.nom}`, a.texte, `Alignement : ${n} sur 3 apparitions`, null, "codex"));
  }
  for (const a of ASSOCIATIONS) {
    if (pretes.some(t => t.cle === `association:${a.id}`)) continue;
    const [n, requis] = avancementAssociation(J, a);
    const faite = J.techniques.includes(a.id);
    const quoi = a.cartes ? a.cartes.map(id => `${J.reveles.includes(id) ? "✓ " : ""}${CARTE_PAR_ID[id].nom}`).join(", ") : "une carte de chaque planète";
    liste.push(item(`✦ ${a.nom}`, a.texte, faite ? "Déjà utilisée dans ce duel" : `${n} sur ${requis} révélées (${quoi})`, null, faite ? "codex faite" : "codex"));
  }
  $("galerie-cartes").replaceChildren(...liste);
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
$("bouton-technique").addEventListener("click", ouvrirTechniques);

async function executerEvolution(index, place) {
  selection = null; actions([]);
  noterVue(carnet, d.joueurs[0].main[index]); sauverCarnet(carnet);
  await animer(evoluer(d, 0, index, place, rng), true);
  finAction();
}

async function jouerPresage(index) { selection = null; actions([]); await animer(poser(d, 0, index)); finAction(); }
async function executerPosition(place) { selection = null; actions([]); await animer(changerPosition(d, 0, place, rng)); finAction(); }

async function executerAttaque(place, cible) {
  selection = null; actions([]);
  const magie = influenceOmbre(d, 1, { place, cible });
  if (magie) {
    await animer(magie.main != null ? poserTerrainEnReponse(d, 1, magie.main, rng) : revelerEnReponse(d, 1, magie.place, { choix: magie.choix }, rng), true);
    if (d.fini || !ciblesAttaque(d, 0, place).includes(cible)) { journal("Votre attaque n’a plus lieu."); finAction(); return; }
  }
  const p = presageOmbre(d, 1, "attaque", { place, cible });
  await animer(attaquer(d, 0, place, cible, rng, p));
  finAction();
}

async function executerAccordTerrain(cle) {
  fermerGalerie();
  await animer(accomplirAccordTerrain(d, 0, cle), true);
  finAction();
}

async function executerFusion(figure) {
  fermerGalerie();
  const ev = fusionner(d, 0, figure, rng);
  await animer(ev, true);
  await apresInvocation(ev, 1);
  finAction();
}

function finAction() { occupe = false; cacherFleche(); rendre(); if (d.fini) terminer(); else enregistrer(); }

// ---------- Enregistrement du duel en cours ----------
// Le duel est gardé dans le navigateur après chaque coup : si l'on quitte l'application, il reprend là où il était
// (même hasard, même tour). Il est effacé à la fin du duel.
const CLE_DUEL = "chemin-du-mage.duel-en-cours";
function enregistrer() {
  if (!d || !partie || partie.demo || d.fini) return;
  try {
    const lignes = [...$("journal").children].slice(0, 40).map(li => [li.textContent, li.className]);
    localStorage.setItem(CLE_DUEL, JSON.stringify({ version: 1, d, partie, hasard: rng.etat(), accordsDuDuel, lignes, quand: Date.now() }));
  } catch { /* stockage plein ou bloqué : le duel continue sans sauvegarde */ }
}
function effacerEnregistrement() { try { localStorage.removeItem(CLE_DUEL); } catch { /* rien */ } }
function lireEnregistrement() {
  try { const s = JSON.parse(localStorage.getItem(CLE_DUEL) || "null"); return s?.version === 1 && s.d && !s.d.fini ? s : null; } catch { return null; }
}
async function reprendre() {
  const s = lireEnregistrement();
  if (!s) return;
  d = preparerReprise(s.d); partie = s.partie; rng = reprendreHasard(s.hasard); accordsDuDuel = s.accordsDuDuel || [];
  selection = null; occupe = false;
  lpAffiche[0] = d.joueurs[0].lp; lpAffiche[1] = d.joueurs[1].lp;
  $("journal").replaceChildren(...(s.lignes || []).map(([t, c]) => { const li = document.createElement("li"); li.textContent = t; if (c) li.className = c; return li; }));
  journal("· Le duel reprend ·", true);
  $("numero-duel").textContent = `Duel n° ${partie.graine}`;
  for (const e of ["accueil-duel", "fin-duel", "atelier"]) $(e).classList.remove("visible");
  $("detail").classList.add("vide"); actions([]);
  rendre(); ajusterTaille();
  banniere("Le duel reprend", `Tour ${d.tour}`);
  if (d.actif === 1) {
    occupe = true;
    await attendre(900);
    await tourAdverse();
    occupe = false; rendre();
    if (d.fini) terminer(); else enregistrer();
  }
}
// en quittant l'application (onglet caché, téléphone mis en veille), on enregistre aussi
document.addEventListener("visibilitychange", () => { if (document.hidden && !occupe) enregistrer(); });
window.addEventListener("pagehide", () => { if (!occupe) enregistrer(); });

/**
 * Le panneau des accords : les figures invocables maintenant (touchez pour invoquer), puis toutes les figures de la
 * réserve avec leurs deux cartes, cochées quand vous les avez en main ou sur le terrain.
 */
function ouvrirAccords() {
  if (!d) return;
  const J = d.joueurs[0];
  const options = d.actif === 0 && !occupe ? fusionsPossibles(d, 0) : [];
  const dispo = new Set([...J.main, ...J.monstres.filter(Boolean).map(m => m.id)]);
  $("galerie-titre").textContent = "Accords de Belline";
  $("galerie-texte").textContent = "Deux cartes associées (règle de Belline, écho de la notice, accompagnement ou lecture moderne) accomplissent un accord quand elles sont toutes deux face visible sur votre terrain (touchez-le ici, un par tour), ou quand vous les révélez l’une après l’autre. Les deux cartes d’une règle de Belline peuvent aussi former une figure d’accord : elles vont au cimetière et la figure apparaît (une par tour).";
  const item = itemPanneau;
  const surTerrain = d.actif === 0 && !occupe ? accordsTerrain(d, 0) : [];
  const titreSorte = s => ({ belline: "Règle de Belline", echo: "Écho de la notice", accompagnement: "Accord d’accompagnement", lecture: "Lecture moderne" }[s]);
  const liste = surTerrain.map(t => item(`${t.favorable ? "✦" : "☍"} Sur le terrain : ${titreSorte(t.sorte)}`, t.texte,
    `${nomDe(t.a)} et ${nomDe(t.b)} sont en jeu : touchez pour accomplir l’accord (${t.valeur} points${t.favorable ? "" : " de dégâts à l’adversaire"}).`, () => executerAccordTerrain(t.cle), "prete"));
  if (d.actif === 0 && J.accordTerrainFait) liste.push(item("Accord de terrain déjà accompli ce tour", "Un accord de terrain par tour ; chaque paire ne sert qu’une fois par duel.", "", null, "vide"));
  liste.push(...options.map(o => item(`✦ ${FIGURES[o.figure].nom}`, FIGURES[o.figure].texte,
    `Prête : ${o.materiaux.map(m => `${nomDe(m.id)} (${m.ou === "main" ? "main" : "terrain"})`).join(" + ")}. Touchez pour l’invoquer.`, () => executerFusion(o.figure), "prete")));
  if (!options.length) liste.push(item("Aucune figure prête", d.actif !== 0 ? "Les figures s’invoquent pendant votre phase principale." : J.fusionFaite ? "Vous avez déjà invoqué une figure ce tour." : "Il vous manque une des deux cartes de chaque règle. Voici ce qu’il faut réunir.", "", null, "vide"));
  // les accords à révéler avec les cartes que vous avez (main et terrain) : révélez l'une puis l'autre
  const ids = [...new Set([...J.main, ...J.monstres.filter(Boolean).map(m => m.id), ...J.presages.filter(Boolean).map(p => p.id)])].filter(id => id < 100);
  const aReveler = [];
  for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) {
    const r = reglesDeclenchees({ id: ids[x], choix: 0 }, { id: ids[y], choix: 0 })[0] || reglesDeclenchees({ id: ids[y], choix: 0 }, { id: ids[x], choix: 0 })[0];
    if (r) { aReveler.push(item(`☙ Règle de Belline`, r.texte, "Posez-les toutes deux en jeu (ou révélez l’une puis l’autre) : 1000 points et le sort de la règle.", null, "proche")); continue; }
    const a = accordDeLecture(ids[x], ids[y], nomDe);
    if (a) aReveler.push(item(`${a.sens > 0 ? "✦" : "☍"} ${{ echo: "Écho de la notice", accompagnement: "Accord d’accompagnement", lecture: "Lecture moderne" }[a.sorte]}`, a.texte, `Posez-les toutes deux en jeu (ou révélez l’une puis l’autre) : ${a.valeur} points.`, null, a.sorte === "lecture" ? "codex" : "proche"));
  }
  liste.push(item("Accords à former avec vos cartes", aReveler.length ? `${aReveler.length} association${aReveler.length > 1 ? "s" : ""} possible${aReveler.length > 1 ? "s" : ""} entre vos cartes en main et en jeu.` : "Aucune de vos cartes ne s’associe pour l’instant.", "", null, "vide"), ...aReveler);
  const nomMat = m => (Array.isArray(m) ? "une Étoile" : nomDe(m));
  const aMat = m => (Array.isArray(m) ? m.some(x => dispo.has(x)) : dispo.has(m));
  const reste = J.reserve.filter(f => !options.some(o => o.figure === f))
    .sort((a, b) => FIGURES[b].materiaux.filter(aMat).length - FIGURES[a].materiaux.filter(aMat).length);
  for (const f of reste) {
    const F = FIGURES[f], n = F.materiaux.filter(aMat).length;
    liste.push(item(`${F.favorable ? "✦" : "☍"} ${F.nom}`, F.texte, `${F.materiaux.map(m => `${aMat(m) ? "✓ " : ""}${nomMat(m)}`).join(" + ")} · ${n} sur 2`, null, n ? "codex proche" : "codex"));
  }
  $("galerie-cartes").replaceChildren(...liste);
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
$("bouton-accord").addEventListener("click", ouvrirAccords);

$("bouton-combat").addEventListener("click", async () => {
  if (occupe || d.actif !== 0) return;
  selection = null; actions([]);
  await animer(d.phase === "combat" ? passerPrincipale2(d) : passerAuCombat(d));
  finAction();
});
$("lp-1").addEventListener("click", () => { if (selection?.type === "attaque" && ciblesAttaque(d, 0, selection.place).includes("direct")) executerAttaque(selection.place, "direct"); });

// ---------- Tour de l'adversaire ----------
async function tourAdverse() {
  occupe = true;
  for (let pas = 0; pas < 40 && !d.fini && d.actif === 1; pas++) {
    const a = actionOmbre(d, d.joueurs[1].profil, rng);
    if (a.type === "fin" || a.type === "rien") break;
    let reponse = null;
    if (a.type === "attaquer") {
      // vos réponses : un présage, ou une influence posée (révélée avant le choc) ; puis encore un présage si vous voulez
      for (let tour = 0; tour < 3 && !d.fini; tour++) {
        const dispo = presagesActivables(d, 0, "attaque"), magies = influencesEnReponse(d, 0), lieux = terrainsEnReponse(d, 0);
        if (!dispo.length && !magies.length && !lieux.length) break;
        if (!ciblesAttaque(d, 1, a.place).includes(a.cible)) break;
        montrerFleche(zoneEl(1, a.place), a.cible === "direct" ? $("lp-0") : zoneEl(0, a.cible));
        const r = await demanderReaction(dispo, attaqueTexte(a), magies, lieux);
        if (r && typeof r === "object" && r.main != null) { await animer(poserTerrainEnReponse(d, 0, r.main, rng), true); continue; }
        if (r && typeof r === "object") { await animer(revelerEnReponse(d, 0, r.influence, { choix: r.choix }, rng), true); continue; }
        reponse = r; break;
      }
      if (d.fini) break;
      if (!ciblesAttaque(d, 1, a.place).includes(a.cible)) { journal("L’attaque n’a plus lieu."); await attendre(300); continue; }
    }
    if (a.type === "activer" || a.type === "revelerInfluence") {
      const dispo = presagesActivables(d, 0, "influence");
      const id = a.type === "activer" ? d.joueurs[1].main[a.index] : d.joueurs[1].presages[a.place]?.id;
      if (dispo.length && id != null) reponse = await demanderReaction(dispo, `${d.joueurs[1].nom} ${a.type === "activer" ? "active" : "révèle"} ${nomDe(id)}. Répondre par une chaîne ?`);
    }
    if (partie?.apprenti) expliquer(a);
    const ev = executerOmbre(d, a, rng, reponse);
    if (ev.length === 1 && ev[0].type === "refus") break;
    await animer(ev, true);
    if (a.type === "invoquer" || a.type === "fusionner") await apresInvocation(ev, 0);
    enregistrer();
    await attendre(320);
  }
  if (!d.fini) await animer(finTour(d, rng), true);
}

/** Mode apprenti : l'Ombre dit ce qu'elle fait, et pourquoi (sa valeur estimée du coup). */
function expliquer(a) {
  const O = d.joueurs[1], c = a.index != null ? O.main[a.index] : null;
  const gain = a.v != null && Math.round(a.v) > 0 ? ` : j’estime ce coup à +${Math.round(a.v)}` : "";
  const t = {
    invoquer: c != null && `J’invoque ${nomDe(c)}${a.pose ? " face cachée, pour me défendre" : ""}${gain}.`,
    activer: c != null && (def(c).sousType === "terrain" ? `Je pose le terrain ${nomDe(c)} de mon côté${gain}.` : `J’active ${nomDe(c)}${gain}.`),
    poser: "Je pose un présage : il pourra répondre à votre prochain coup.",
    poserInfluence: "Je pose une carte face cachée : vous ne saurez pas si c’est un présage.",
    revelerInfluence: `Je révèle mon influence posée${gain}.`,
    fusionner: `J’unis deux cartes que la notice associe : ${FIGURES[a.figure]?.nom}${gain}.`,
    technique: `J’utilise une technique${gain}.`,
    accordTerrain: `Deux de mes cartes en jeu s’associent : j’accomplis l’accord${gain}.`,
    evoluer: c != null && `Je fais évoluer une apparition en ${nomDe(c)}${gain}.`,
    attaquer: `J’attaque${a.cible === "direct" ? " directement vos points de vie" : ""}${gain}.`,
    changer: "Je change la position d’une apparition.",
    combat: "J’entre en combat.", principale2: "Je termine le combat."
  }[a.type];
  if (t) { journal(`L’Ombre : « ${t} »`); $("journal").firstChild?.classList.add("ombre-pense"); }
}

async function finDeTour() {
  if (occupe || d.fini || d.actif !== 0) return;
  selection = null; actions([]);
  occupe = true;
  await animer(finTour(d, rng), true);
  enregistrer();
  if (!d.fini) await tourAdverse();
  occupe = false;
  rendre();
  if (d.fini) terminer(); else enregistrer();
}
$("bouton-fin-tour").addEventListener("click", finDeTour);

function attaqueTexte(a) {
  const A = d.joueurs[1].monstres[a.place];
  const T = a.cible === "direct" ? null : d.joueurs[0].monstres[a.cible];
  const cible = !T ? "vos points de vie" : `votre ${T.faceCachee ? "apparition face cachée" : nomDe(T.id)}`;
  return `${d.joueurs[1].nom} attaque ${cible} avec ${nomDe(A.id)} (ATK ${atkEffectif(d, 1, A)}).`;
}

/** Le joueur peut répondre par un présage. Résout l'emplacement choisi, ou null. */
/**
 * Le joueur peut répondre : par un présage (`places`), ou par une influence posée face cachée (`influences`,
 * comme une magie jeu-rapide). Résout l'emplacement du présage choisi, { influence: place, choix }, ou null.
 */
function demanderReaction(places, texte, influences = [], terrainsMain = []) {
  return new Promise(resolve => {
    $("reaction-titre").textContent = (influences.length || terrainsMain.length) && !places.length ? "Une réponse ?" : "Un présage ?";
    $("reaction-texte").textContent = texte;
    const zone = $("reaction-cartes");
    const carte = (id, legende, valeur) => {
      const b = document.createElement("button");
      b.className = "reaction-carte";
      b.appendChild(enveloppe(carteCanvas(id, true, 150), id, true));
      const s = document.createElement("span"); s.textContent = legende; b.appendChild(s);
      b.addEventListener("click", () => { $("reaction").classList.remove("visible"); cacherFleche(); resolve(valeur); });
      return b;
    };
    zone.replaceChildren(
      ...places.map(place => { const id = d.joueurs[0].presages[place].id; return carte(id, `Présage : ${nomDe(id)}`, place); }),
      ...influences.flatMap(place => {
        const id = d.joueurs[0].presages[place].id, x = def(id);
        return x.choix ? x.choix.map((ch, c) => carte(id, `Révéler ${nomDe(id)} : ${ch.label}`, { influence: place, choix: c }))
          : [carte(id, `Révéler ${nomDe(id)}`, { influence: place, choix: null })];
      }),
      ...terrainsMain.map(index => { const id = d.joueurs[0].main[index]; return carte(id, `Poser le terrain ${nomDe(id)}`, { main: index }); }));
    $("reaction-non").onclick = () => { $("reaction").classList.remove("visible"); cacherFleche(); resolve(null); };
    $("reaction").classList.add("visible");
    jouerSon("choix");
    zone.querySelector("button")?.focus();
  });
}

// ---------- Galerie (cimetières, réserves, accords) ----------
function galerie(titre, texte, cartes) {
  $("galerie-titre").textContent = titre;
  $("galerie-texte").textContent = texte;
  $("galerie-cartes").replaceChildren(...(cartes.length ? cartes.map(c => {
    const b = document.createElement(c.action ? "button" : "div");
    b.className = "galerie-carte";
    b.appendChild(enveloppe(carteCanvas(c.id, c.face !== false, 120), c.id, c.face !== false));
    if (c.legende) { const s = document.createElement("span"); s.textContent = c.legende; b.appendChild(s); }
    if (c.action) b.addEventListener("click", c.action);
    else b.addEventListener("click", () => { apercu(c.id, c.face !== false); ouvrirDetail(); });
    return b;
  }) : [Object.assign(document.createElement("p"), { textContent: "Rien pour l’instant.", className: "petit" })]));
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
function fermerGalerie() { $("galerie").classList.remove("visible"); }
$("galerie-fermer").addEventListener("click", fermerGalerie);
for (const j of [0, 1]) {
  $(`cimetiere-${j}`).addEventListener("click", () => { if (d) galerie(j === 0 ? "Votre cimetière" : `Cimetière : ${d.joueurs[1].nom}`, `${d.joueurs[j].cimetiere.length} carte${d.joueurs[j].cimetiere.length > 1 ? "s" : ""}, de la plus ancienne à la plus récente.`, d.joueurs[j].cimetiere.map(id => ({ id }))); });
  $(`reserve-${j}`).addEventListener("click", () => { if (d) galerie(j === 0 ? "Votre réserve" : `Réserve : ${d.joueurs[1].nom}`, "Les figures d’accord disponibles.", d.joueurs[j].reserve.map(id => ({ id, face: j === 0 }))); });
}

// ---------- Flèche d'attaque et calcul ----------
function centre(el) {
  const r = el.getBoundingClientRect(), b = $("plateau").getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
}
function tracer(de, vers) {
  const mx = (de.x + vers.x) / 2, my = Math.min(de.y, vers.y) - 60;
  $("fleche-trait").setAttribute("d", `M${de.x},${de.y} Q${mx},${my} ${vers.x},${vers.y}`);
  $("fleche").classList.add("visible");
}
function montrerFleche(de, vers) { if (de && vers) tracer(centre(de), centre(vers)); }
function cacherFleche() { $("fleche").classList.remove("visible"); $("calcul").classList.remove("visible"); }
$("plateau").addEventListener("pointermove", e => {
  if (selection?.type !== "attaque") return;
  const de = zoneEl(0, selection.place);
  if (!de) return;
  const b = $("plateau").getBoundingClientRect();
  const sur = e.target.closest?.(".zone.ciblable, .points-vie.ciblable");
  const vers = sur ? centre(sur) : { x: e.clientX - b.left, y: e.clientY - b.top };
  tracer(centre(de), vers);
  if (sur) {
    const cible = sur.classList.contains("points-vie") ? "direct" : +sur.dataset.place;
    montrerCalcul(calculCombat(d, 0, selection.place, cible), false);
  } else $("calcul").classList.remove("visible");
});
function montrerCalcul(c, fort = true) {
  if (!c) return;
  const el = $("calcul");
  const bas = c.position === "direct" ? "<b>Attaque directe</b>" : c.valeur == null ? "<span>contre une carte cachée</span>" : `<span>${c.contre} ${c.valeur}</span>`;
  const diff = c.position === "direct" ? `−${c.atk}` : c.valeur == null ? "?" : c.atk > c.valeur ? (c.position === "attaque" ? `−${c.atk - c.valeur}` : "détruite") : c.atk < c.valeur ? `${c.position === "attaque" ? "détruit" : "riposte"} −${c.valeur - c.atk}` : "égalité";
  el.innerHTML = `<span class="calc-atk">ATK ${c.atk}</span><span class="calc-contre">⚔</span>${bas}<em>${diff}</em>${c.avantage ? "<span class='calc-avantage'>▲ planète dominée +500</span>" : c.desavantage ? "<span class='calc-avantage' style='color:#ff8a7a'>▼ planète qui vous domine</span>" : ""}`;
  el.classList.toggle("fort", fort);
  el.classList.add("visible");
}

// ---------- Animations ----------
const zoneEl = (j, place, sorte = "monstres") => document.querySelector(`#${sorte}-${j} .zone[data-place="${place}"]`);

function allerLP(j, cible) {
  const el = $(`lp-val-${j}`), jauge = $(`lp-jauge-${j}`);
  const depart = lpAffiche[j];
  jauge.style.width = `${Math.max(0, Math.min(100, cible / LP * 100))}%`;
  const trainee = $(`lp-trainee-${j}`);
  if (trainee) trainee.style.width = `${Math.max(0, Math.min(100, cible / LP * 100))}%`;
  jauge.parentElement.classList.toggle("critique", cible <= 2000);
  jauge.parentElement.classList.toggle("deborde", cible > LP);
  if (depart === cible) { el.textContent = cible; return; }
  lpAffiche[j] = cible;
  const t0 = performance.now(), duree = reduit ? 1 : 700;
  const pas = t => {
    const k = Math.min(1, (t - t0) / duree);
    el.textContent = Math.round(depart + (cible - depart) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

function flotter(el, texte, classe) {
  if (!el) return;
  const c = centre(el);
  const f = document.createElement("span");
  f.className = `flottant ${classe}`; f.textContent = texte;
  f.style.left = `${c.x}px`; f.style.top = `${c.y - 20}px`;
  $("plateau").appendChild(f);
  setTimeout(() => f.remove(), 1500);
}

function eclats(el, couleur, n = 18) {
  if (!el || reduit) return;
  const c = centre(el);
  for (let k = 0; k < n; k++) {
    const p = document.createElement("span");
    p.className = "eclat";
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
    p.style.left = `${c.x}px`; p.style.top = `${c.y}px`;
    p.style.setProperty("--x", `${Math.cos(a) * v}px`); p.style.setProperty("--y", `${Math.sin(a) * v}px`);
    p.style.background = couleur; p.style.color = couleur;
    $("plateau").appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

function eclair(couleur) {
  const e = $("eclair");
  e.style.background = couleur;
  e.classList.remove("visible"); void e.offsetWidth; e.classList.add("visible");
}

function secousse(fort = false) {
  if (reduit) return;
  const p = $("plateau");
  p.classList.remove("secoue", "secoue-fort"); void p.offsetWidth; p.classList.add(fort ? "secoue-fort" : "secoue");
}

function banniere(titre, texte, classe = "") {
  const b = $("banniere");
  b.className = `banniere ${classe}`;
  b.innerHTML = `<b>${esc(titre)}</b>${texte ? `<span>${esc(texte)}</span>` : ""}`;
  void b.offsetWidth; b.classList.add("visible");
}

async function carteAuCentre(ids, classe) {
  const z = $("carte-centre");
  z.className = `carte-centre ${classe}`;
  z.replaceChildren(...[].concat(ids).map(id => enveloppe(carteCanvas(id, true, 180), id, true)));
  void z.offsetWidth; z.classList.add("visible");
  await attendre(1200);
}

const nom = j => (j === 0 ? "Vous" : d.joueurs[1].nom);
const accorde = (j, vous, lui) => (j === 0 ? vous : lui);
function journal(texte, important = false) {
  const li = document.createElement("li");
  li.textContent = texte; if (important) li.className = "important";
  $("journal").prepend(li);
  while ($("journal").children.length > 80) $("journal").lastChild.remove();
  $("annonce").textContent = texte;
}

async function animer(ev, garderOccupe = false) {
  occupe = true;
  fermerFeuille(); cacherLoupe();
  majCommandes();
  for (const e of ev) {
    const c = e.id != null ? nomDe(e.id) : "";
    switch (e.type) {
      case "refus": journal(e.raison); jouerSon("erreur"); break;
      case "tour":
        rendre();
        banniere(e.j === 0 ? "Votre tour" : `Tour : ${d.joueurs[1].nom}`, `Tour ${d.tour}`, e.j === 0 ? "" : "sombre");
        journal(e.j === 0 ? "· Votre tour ·" : `· Tour : ${d.joueurs[1].nom} ·`, true);
        await attendre(850); break;
      case "phase":
        rendre(); banniere(e.phase === "combat" ? "Phase de combat" : "Phase principale 2", "", "petite"); jouerSon("choix");
        await attendre(600); break;
      case "pioche":
        if (e.j === 0) { journal(`Vous piochez ${c}.`); noterVue(carnet, e.id); rendre(); document.querySelector("#main-0 .carte-main:last-child")?.classList.add("piochee"); }
        else { rendre(); document.querySelector("#main-1 canvas:last-child")?.classList.add("piochee"); }
        await attendre(280); break;
      case "fusion":
        journal(`Accord de Belline : ${e.texte} ${nom(e.j)} ${accorde(e.j, "invoquez", "invoque")} la figure ${c}.`, true);
        if (e.j === 0) { noterRegle(carnet, e.regle); sauverCarnet(carnet); }
        eclair("rgba(167,122,216,.4)"); jouerSon("regle");
        banniere("Figure d’accord", e.texte, "accord");
        effetCarte(e.id);
        await carteAuCentre(e.materiaux, "fusion");
        break;
      case "invocation": {
        journal(`${nom(e.j)} ${accorde(e.j, "invoquez", "invoque")} ${c}${e.speciale && !e.figure ? " (invocation spéciale)" : ""}.`);
        rendre();
        const z = zoneEl(e.j, e.place);
        if (z) { z.style.setProperty("--teinte", (TEINTES[elementCarte(e.id)] || TEINTES.accord).join(",")); z.classList.add(e.figure || def(e.id).forte ? "arrivee-majeure" : "arrivee"); }
        if (z) effetCarte(e.id, z, e.figure || def(e.id).forte ? 3.2 : 2.4);
        jouerSon("invocation", familleDe(e.id)); eclair(e.figure ? "rgba(167,122,216,.3)" : "rgba(243,213,138,.25)");
        if (e.j === 1) apercu(e.id, true, `Invoquée par ${d.joueurs[1].nom}.`);
        await attendre(e.figure || def(e.id).forte ? 1200 : 850); break;
      }
      case "pose":
        journal(`${nom(e.j)} ${accorde(e.j, "posez", "pose")} une apparition face cachée.`);
        rendre(); zoneEl(e.j, e.place)?.classList.add("arrivee-cachee"); jouerSon("choix");
        await attendre(450); break;
      case "posePresage":
        journal(e.j === 0 ? `Vous posez ${e.influence ? "une influence" : "un présage"} face cachée.` : `${d.joueurs[1].nom} pose une carte face cachée.`);
        rendre(); zoneEl(e.j, e.place, "presages")?.classList.add("arrivee-cachee"); jouerSon("choix");
        await attendre(420); break;
      case "continue":
        rendre(); zoneEl(e.j, e.place, "presages")?.classList.add("arrivee"); break;
      case "influence":
        journal(`${nom(e.j)} ${e.revelee ? accorde(e.j, "révélez", "révèle") : accorde(e.j, "activez", "active")} ${c}${e.revelee ? " (posée face cachée)" : ""}${e.choix != null && DUEL[e.id].choix ? ` (${DUEL[e.id].choix[e.choix].label})` : ""}.`);
        if (e.j === 1) apercu(e.id, true, `Influence activée par ${d.joueurs[1].nom}.`);
        jouerSon("invocation");
        effetCarte(e.id, null, 1, true);
        await carteAuCentre(e.id, "influence"); break;
      case "presage":
        journal(`Présage${e.maillon === 2 ? " (chaîne, maillon 2)" : ""} ! ${nom(e.j)} ${accorde(e.j, "activez", "active")} ${c}.`, true);
        apercu(e.id, true, `Présage activé par ${e.j === 0 ? "vous" : d.joueurs[1].nom}.`);
        eclair("rgba(201,89,159,.35)"); jouerSon("regle");
        banniere(e.maillon === 2 ? "Chaîne : maillon 2" : "Présage", c, "presage");
        effetCarte(e.id, null, 1, true);
        await carteAuCentre(e.id, "presage"); break;
      case "sacrifice":
        journal(`${nom(e.j)} ${accorde(e.j, "sacrifiez", "sacrifie")} ${c}.`);
        zoneEl(e.j, e.place)?.classList.add("sacrifie"); eclats(zoneEl(e.j, e.place), "#f3d58a");
        await attendre(420); break;
      case "materiau": zoneEl(e.j, e.place)?.classList.add("sacrifie"); eclats(zoneEl(e.j, e.place), "#c9a0ff"); await attendre(300); break;
      case "retournee": journal(`${c} est retournée.`); rendre(); zoneEl(e.j, e.place)?.classList.add("retourne"); await attendre(480); break;
      case "position": rendre(); zoneEl(e.j, e.place)?.classList.add("pivote"); jouerSon("choix"); await attendre(320); break;
      case "attaque": {
        const a = zoneEl(e.j, e.place);
        const cible = e.cible === "direct" ? $(`lp-${1 - e.j}`) : zoneEl(1 - e.j, e.cible);
        journal(`${c} attaque ${e.cible === "direct" ? (e.j === 0 ? `les points de vie de ${d.joueurs[1].nom}` : "vos points de vie") : nomDe(e.idCible)}.`);
        montrerFleche(a, cible); montrerCalcul(e.calcul);
        await attendre(600);
        // le coup part dans l'élément de l'apparition (feu, eau, terre, air, foudre, lumière, fleurs)
        const elem = elementCarte(e.id), c0 = e.calcul || {};
        const fort = c0.avantage || (c0.atk || 0) >= 2400 || (c0.valeur != null && Math.abs((c0.atk || 0) - c0.valeur) >= 1000);
        if (a) a.classList.add("elan");
        cacherFleche();
        jouerElement(elem, "lancer");
        if (a && cible) await effets.attaque(a, cible, elem); else await attendre(300);
        a?.classList.remove("elan");
        cible?.classList.remove("impact"); void cible?.offsetWidth; cible?.classList.add("impact");
        if (cible) effets.impact(cible, elem, fort);
        jouerElement(elem, "impact"); jouerSon("frappe"); secousse(fort);
        if (c0.avantage) flotter(cible, "▲ domination", "neutre");
        await attendre(fort ? 420 : 300);
        break;
      }
      case "detruite": case "sacrifiee": case "epuisee": {
        const z = zoneEl(e.j, e.place, e.zone === "presages" ? "presages" : "monstres");
        if (e.type === "detruite") journal(`${c} est détruite.`);
        if (e.type === "epuisee") journal(`${c} a fini d’agir.`);
        z?.classList.add("eclate");
        if (z) effets.eclatsCarte(z, elementCarte(e.id));
        await attendre(500); break;
      }
      case "protegee": flotter(zoneEl(e.j, e.place), "protégée", "neutre"); journal(`${c} n’est pas détruite (protégée une fois).`); await attendre(450); break;
      case "lp": {
        flotter($(`lp-${e.j}`), `${e.v > 0 ? "+" : "−"}${Math.abs(e.v)}`, e.v > 0 ? "bien" : "mal");
        allerLP(e.j, e.lp);
        if (e.v < 0) { const p = $(`lp-${e.j}`); p.classList.remove("touche"); void p.offsetWidth; p.classList.add("touche"); if (-e.v >= 1500) { eclair("rgba(255,60,40,.3)"); secousse(true); } }
        journal(`${nom(e.j)} ${e.v > 0 ? accorde(e.j, "gagnez", "gagne") : accorde(e.j, "perdez", "perd")} ${Math.abs(e.v)} points de vie${e.pourquoi ? ` (${e.pourquoi})` : ""}.`);
        jouerSon(e.v > 0 ? "gain" : "perte");
        await attendre(e.v < 0 ? 520 : 380); break;
      }
      case "accord": {
        const titre = { echo: "Écho de la notice", accompagnement: "Accord d’accompagnement", lecture: "Lecture moderne" }[e.sorte] || "Règle de Belline";
        const combo = e.combo > 1 ? ` · combo ×${e.combo}` : "";
        journal(`${titre}${e.terrain ? " (sur le terrain)" : ""}${combo} : ${e.texte} (${e.valeur} points)`, true);
        if (e.j === 0) { accordsDuDuel.push({ titre, texte: e.texte, belline: e.sorte === "belline" }); if (e.regle) { noterRegle(carnet, e.regle); sauverCarnet(carnet); } }
        if (e.sorte !== "lecture") { banniere(titre + combo, e.texte, e.sorte === "belline" ? "belline" : e.favorable ? "accord" : "sombre"); jouerSon("regle"); eclair(e.favorable ? "rgba(243,213,138,.35)" : "rgba(160,60,90,.3)"); }
        else jouerSon(e.favorable ? "gain" : "perte");
        if (e.ids) {
          if (e.terrain) {
            const zs = e.ids.map(id => [...document.querySelectorAll(`#monstres-${e.j} .zone, #presages-${e.j} .zone`)].find(z => { const P = +z.dataset.place, sorte = z.closest(".rang-presages") ? "presages" : "monstres"; return d.joueurs[e.j][sorte][P]?.id === id; }));
            if (zs[0] && zs[1]) effets.lien(zs[0], zs[1], e.favorable);
          }
          effets.duo(e.ids[0], e.ids[1], effets.rect($("tapis")), e.favorable);
        }
        await attendre(e.sorte === "lecture" ? 700 : e.sorte === "belline" ? 2000 : 1400); break;
      }
      case "evolution": {
        journal(`Évolution : ${nom(e.j) === "Vous" ? "votre" : "son"} ${nomDe(e.de)} devient ${c} (+300 ATK d’élan).`, true);
        rendre();
        const z = zoneEl(e.j, e.place); z?.classList.add("evolue");
        if (z) effetCarte(e.id, z, 2.6, true);
        banniere("Évolution", `${nomDe(e.de)} ⇧ ${c}`, "accord"); jouerSon("invocation", familleDe(e.id));
        if (e.j === 1) apercu(e.id, true, `Évolution de ${d.joueurs[1].nom}.`, true);
        await attendre(1200); break;
      }
      case "statut": {
        const z = zoneEl(e.j, e.place), E = ETATS[e.etat];
        journal(`${c} est ${E.nom}. ${E.texte}`);
        flotter(z, `${E.signe} ${E.nom}`, "mal");
        if (z) effets.jouer({ poison: "miasme", brulure: "flammes", sommeil: "lune", confusion: "vent" }[e.etat], effets.rect(z), {});
        rendre(); await attendre(450); break;
      }
      case "gueri": journal(`${c} ${e.texte || "guérit de son état"}.`); flotter(zoneEl(e.j, e.place), "guérie", "bien"); rendre(); await attendre(300); break;
      case "figureDebloquee":
        journal(`${e.j === 0 ? "Nouvelle figure d’accord dans votre réserve" : `${d.joueurs[1].nom} gagne une figure`} : ${c}.`, true);
        if (e.j === 0) { banniere("Nouvelle figure", c, "accord"); await attendre(900); }
        break;
      case "fatalite":
        journal("La Fatalité : l’échéance inéluctable. Celui qui a le plus de points de vie l’emporte.", true);
        banniere("La Fatalité", "l’échéance inéluctable", "sombre"); await attendre(1600); break;
      case "renvoi": journal(`${c} quitte le terrain.`); zoneEl(e.j, e.place)?.classList.add("eclate"); await attendre(380); break;
      case "vol": journal(`${nom(e.j)} ${accorde(e.j, "volez", "vole")} une carte${e.j === 0 ? ` : ${c}` : ""}.`); break;
      case "retour": journal(`${c} revient du cimetière.`); break;
      case "defausse": journal(`${e.j === 0 ? "Vous envoyez" : `${d.joueurs[1].nom} envoie`} ${c} au cimetière${e.limite ? " (main limitée à sept)" : e.materiau ? " (accord)" : ""}.`); break;
      case "texte": journal(e.texte); break;
      case "terrainPose": {
        const moitie = document.querySelector(e.j === 0 ? ".moitie-vous" : ".moitie-ombre");
        journal(`${nom(e.j)} ${accorde(e.j, "posez", "pose")} le terrain ${c}.`, true);
        rendre(); moitie.classList.remove("lieu-arrive"); void moitie.offsetWidth; moitie.classList.add("lieu-arrive");
        effetCarte(e.id, moitie, 1, true);
        banniere(`Terrain : ${c}`, e.j === 0 ? "votre côté du tapis change" : `côté ${d.joueurs[1].nom}`, "petite");
        await attendre(900); break;
      }
      case "terrainCasse": case "terrainRetour": {
        const moitie = document.querySelector(e.j === 0 ? ".moitie-vous" : ".moitie-ombre");
        journal(e.type === "terrainCasse" ? `Le terrain ${c} est cassé.` : `Le terrain ${c} retourne dans la main.`, true);
        effets.jouer("eboulis", moitie);
        moitie.classList.remove("lieu-casse"); void moitie.offsetWidth; moitie.classList.add("lieu-casse");
        await attendre(500); rendre(); break;
      }
      case "technique": {
        journal(`${e.sorte === "alignement" ? "Alignement" : "Association"} : ${e.j === 0 ? "vous utilisez" : `${d.joueurs[1].nom} utilise`} « ${e.nom} ». ${e.texte}`, true);
        for (const p of e.places) zoneEl(e.j, p)?.classList.add("aligne");
        banniere(e.nom, e.sorte === "alignement" ? "Alignement planétaire" : "Association", "accord");
        jouerSon("regle"); eclair("rgba(243,213,138,.35)");
        effets.jouer(EFFET_TECHNIQUE[e.cle.split(":")[1]] || "etoiles", effets.rect($("tapis")));
        await attendre(1500); break;
      }
      case "terrain": {
        const t = REGIONS.find(r => r.famille === e.famille);
        journal(`Le terrain devient ${t.nom.replace(/^(Le|La|Les) /, m => m.toLowerCase())}.`);
        rendre(); const tp = $("tapis"); tp.classList.remove("change-terrain"); void tp.offsetWidth; tp.classList.add("change-terrain");
        await attendre(500); break;
      }
    }
    if (d.fini) break;
  }
  rendre();
  for (const e of ev) if (["renfort", "affaibli", "bloque"].includes(e.type)) {
    const z = zoneEl(e.j, e.place);
    if (z) { z.classList.remove(e.type); void z.offsetWidth; z.classList.add(e.type); }
  }
  if (!garderOccupe) occupe = false;
  rendre();
}

/** L'effet visuel de chaque technique. */
const EFFET_TECHNIQUE = {
  soleil: "etoiles", lune: "lune", mercure: "vent", venus: "coeurs", mars: "flammes", jupiter: "dome", saturne: "sablier",
  preambule: "cle", freins: "chaines", fortes: "eclair", messagers: "oiseaux", coeurs: "coeurs", fortune: "roue", ciel: "comete"
};

// ---------- Accueil, campagne, atelier ----------
/** Le bouton « Reprendre le duel en cours » de l'accueil. */
function majReprise() {
  const s = lireEnregistrement(), b = $("bouton-reprendre");
  if (!b) return;
  b.hidden = !s;
  if (s) b.textContent = `▶ Reprendre le duel en cours (contre ${s.d.joueurs[1].nom}, tour ${s.d.tour}, vos points de vie ${s.d.joueurs[0].lp})`;
}
$("bouton-reprendre")?.addEventListener("click", reprendre);

function gardienAccessible(i) { return i === 0 || carnet.gardiens.includes(GARDIENS[i - 1].famille); }
/** L'accueil dit combien de cartes compte votre deck ; s'il en manque, un bouton rend les 53. */
function majDeck() {
  const b = $("bouton-deck"), n = deck.length;
  b.textContent = `Votre deck (${n} carte${n > 1 ? "s" : ""} sur 53) et votre réserve`;
  const r = $("deck-complet");
  r.hidden = n >= 53; r.textContent = `Reprendre les 53 cartes (il en manque ${53 - n})`;
}
$("deck-complet").addEventListener("click", () => { deck = CARTES.map(c => c.id); sauverDeck(deck); majDeck(); });

function majAccueil() {
  majDeck();
  $("liste-gardiens").replaceChildren(...GARDIENS.map((g, i) => {
    const li = document.createElement("li");
    const r = REGIONS.find(x => x.famille === g.famille);
    const battu = carnet.gardiens.includes(g.famille), ouvert = gardienAccessible(i);
    const b = document.createElement("button");
    b.className = `gardien ${battu ? "battu" : ""}`;
    b.disabled = !ouvert;
    b.innerHTML = `<span class="g-glyphe"></span><span class="g-texte"><b></b><small></small></span><span class="g-etat"></span>`;
    b.querySelector(".g-glyphe").textContent = r.glyphe;
    b.querySelector("b").textContent = g.nom;
    b.querySelector("small").textContent = g.style;
    b.querySelector(".g-etat").textContent = battu ? "✓ vaincu" : ouvert ? "défier" : "🔒";
    b.addEventListener("click", () => demarrer({ mode: "gardien", index: i }));
    li.appendChild(b);
    return li;
  }));
}

function demarrer(config, graine = null) {
  consultant = document.querySelector("input[name=consultant]:checked")?.value || "homme";
  partie = { ...config, graine: graine ?? nouvelleGraine(), apprenti: config.apprenti ?? !!$("apprenti")?.checked };
  accordsDuDuel = [];
  rng = creerHasard(partie.graine);
  let options;
  if (config.mode === "gardien") {
    const g = GARDIENS[config.index];
    options = {
      decks: [deck, deckGardien(g, creerHasard(partie.graine + 3))],
      reserves: [reserveJoueur(), figuresDebloquees(new Set(reglesEnseignees(g)))],
      terrain: g.famille, profils: [null, g.profil], nomAdverse: g.nom, mecaniques: MECA_GARDIENS[config.index]
    };
  } else {
    const profil = config.difficulte === "adaptatif" ? profilAdaptatif() : PROFILS[config.difficulte];
    options = {
      decks: [deck, CARTES.map(c => c.id)],
      reserves: [reserveJoueur(), config.difficulte === "novice" ? [] : config.difficulte === "mage" ? Object.keys(FIGURES).map(Number) : FIGURES_DEPART],
      terrain: PLANETES[Math.floor(rng() * 7)], profils: [null, profil], nomAdverse: `L’Ombre (${profil.nom})`
    };
  }
  d = creerDuel(rng, consultant, options);
  selection = null; occupe = false;
  lpAffiche[0] = lpAffiche[1] = LP;
  $("journal").replaceChildren();
  $("numero-duel").textContent = `Duel n° ${partie.graine}`;
  for (const id of d.joueurs[0].main) noterVue(carnet, id);
  sauverCarnet(carnet);
  for (const e of ["accueil-duel", "fin-duel", "atelier"]) $(e).classList.remove("visible");
  $("detail").classList.add("vide"); actions([]);
  journal(`Le duel commence contre ${d.joueurs[1].nom}. Terrain : ${REGIONS.find(r => r.famille === d.terrain).nom}.`, true);
  if (config.mode === "gardien" && config.index < 5) {
    const ouvertes = MECA_GARDIENS[config.index];
    journal(ouvertes.length ? `Dans ce duel : ${ouvertes.map(k => NOMS_MECA[k]).join(", ")}.` : "Premier duel : invoquez, jouez vos influences et vos présages, combattez. Les accords de Belline s’accomplissent déjà.");
  }
  rendre(); ajusterTaille();
  ouverture();
}

/** La difficulté qui s'ajuste : plus vous gagnez, moins l'Ombre joue au hasard. */
function profilAdaptatif() {
  const { joues, gagnes } = carnet.duels, taux = (gagnes + 1) / (joues + 2);
  const hasard = Math.max(0, Math.min(0.65, 0.75 - taux * 0.9));
  return { nom: `Adaptatif, force ${Math.round((1 - hasard / 0.65) * 100)} %`, hasard, agressif: 1 + (0.65 - hasard) * 0.15, soin: 1 };
}

async function ouverture() {
  occupe = true;
  const t = REGIONS.find(r => r.famille === d.terrain);
  banniere("Duel !", `${d.joueurs[1].nom} · terrain ${t.glyphe} ${t.nom}`);
  jouerSon("porte");
  await attendre(1500);
  banniere("Pile ou face", d.premier === 0 ? "Vous commencez" : `${d.joueurs[1].nom} commence`, d.premier === 0 ? "" : "sombre");
  journal(d.premier === 0 ? "Pile ou face : vous commencez." : `Pile ou face : ${d.joueurs[1].nom} commence.`);
  await attendre(1300);
  if (d.premier === 1) await tourAdverse();
  occupe = false;
  rendre();
  if (d.fini) terminer();
}

function terminer() {
  effacerEnregistrement();
  const gagne = d.gagnant === 0;
  noterDuel(carnet, gagne);
  let lecons = [];
  if (gagne && partie.mode === "gardien") {
    const g = GARDIENS[partie.index];
    lecons = vaincreGardien(carnet, g.famille, reglesEnseignees(g));
  }
  sauverCarnet(carnet);
  jouerSon(gagne ? "victoire" : "defaite");
  banniere(gagne ? "Victoire" : "Défaite", "", gagne ? "accord" : "sombre");
  // la fin du duel : une pluie d'étoiles à la victoire, des cendres à la défaite
  const tout = effets.rect($("plateau"));
  if (gagne) { effets.jouer("etincelles", tout); effets.jouer("etoiles", tout); setTimeout(() => effets.jouer("etincelles", tout), 500); }
  else effets.jouer("cendres", tout);
  setTimeout(() => {
    $("fin-duel-titre").textContent = d.gagnant == null ? "Égalité" : gagne ? "Les apparitions vous obéissent" : `${d.joueurs[1].nom} l’emporte`;
    $("fin-duel-texte").textContent = `Duel n° ${partie.graine} en ${Math.ceil(d.tour / 2)} tours · points de vie : vous ${d.joueurs[0].lp}, ${d.joueurs[1].nom} ${d.joueurs[1].lp} · duels gagnés ${carnet.duels.gagnes} sur ${carnet.duels.joues}.`;
    const regles = VOISINAGE.filter((r, i, t) => lecons.includes(r.id) && t.findIndex(x => x.texte === r.texte && lecons.includes(x.id)) === i);
    $("fin-duel-lecons").innerHTML = partie.mode === "gardien" && gagne
      ? `<p><b>${esc(GARDIENS[partie.index].nom)} vous enseigne :</b></p>${regles.length ? `<ul>${regles.map(r => `<li>${esc(r.texte)}</li>`).join("")}</ul>` : "<p class='petit'>Vous connaissiez déjà toutes ses règles.</p>"}${partie.index < 6 ? `<p>Le Gardien suivant vous attend : ${esc(GARDIENS[partie.index + 1].nom)}.</p>` : "<p><b>Les Sept Gardiens sont vaincus.</b></p>"}`
      : "";
    if (partie.mode === "gardien" && gagne && partie.index < 6) {
      const neuves = MECA_GARDIENS[partie.index + 1].filter(k => !MECA_GARDIENS[partie.index].includes(k));
      if (neuves.length) $("fin-duel-lecons").insertAdjacentHTML("beforeend", `<p><b>Nouvelle mécanique au prochain duel :</b> ${neuves.map(k => esc(NOMS_MECA[k])).join(", ")}.</p>`);
    }
    const vus = accordsDuDuel.filter((a, i, t) => t.findIndex(x => x.texte === a.texte) === i);
    $("fin-duel-lecons").insertAdjacentHTML("beforeend", vus.length
      ? `<p><b>Vos accords dans ce duel :</b></p><ul>${vus.map(a => `<li>${a.belline ? "<b>Règle de Belline</b>" : esc(a.titre)} : ${esc(a.texte)}</li>`).join("")}</ul>`
      : "<p class='petit'>Aucun accord dans ce duel : les badges ✦ sur vos cartes montrent celles qui s’associent.</p>");
    $("fin-duel").classList.add("visible");
    $("bouton-revanche").focus();
  }, 1300);
}

function montrerAtelier() {
  const z = $("atelier-cartes");
  const maj = () => {
    $("atelier-compte").textContent = `${deck.length} cartes dans votre deck (30 au moins, 53 au plus). Les cartes rares (reflet) sont celles que vous avez vécues dans le Chemin.`;
    $("atelier-fermer").disabled = deck.length < 30;
    for (const b of z.children) b.classList.toggle("hors", !deck.includes(+b.dataset.id));
  };
  z.replaceChildren(...CARTES.map(c => c.id).sort((a, b) => a - b).map(id => {
    const b = document.createElement("button");
    b.className = "atelier-carte"; b.dataset.id = id;
    b.appendChild(enveloppe(carteCanvas(id, true, 92), id, true));
    b.setAttribute("aria-label", `${nomDe(id)} : dans le deck ou non`);
    b.addEventListener("click", () => { deck = deck.includes(id) ? deck.filter(x => x !== id) : [...deck, id]; maj(); });
    if (survol) b.addEventListener("mouseenter", () => apercu(id));
    return b;
  }));
  const debloquees = new Set(reserveJoueur());
  $("atelier-reserve").replaceChildren(...Object.keys(FIGURES).map(Number).map(f => {
    const b = document.createElement("div");
    b.className = `atelier-carte ${debloquees.has(f) ? "" : "verrou"}`;
    b.appendChild(enveloppe(carteCanvas(f, debloquees.has(f), 92), f, debloquees.has(f)));
    const s = document.createElement("small");
    const F = FIGURES[f];
    s.textContent = debloquees.has(f) ? F.nom : `N° ${F.materiaux.map(m => (Array.isArray(m) ? "Étoile" : m)).join(" avec n° ")}`;
    b.appendChild(s);
    if (debloquees.has(f) && survol) b.addEventListener("mouseenter", () => apercu(f));
    return b;
  }));
  maj();
  $("atelier").classList.add("visible");
}
$("bouton-deck").addEventListener("click", montrerAtelier);
$("atelier-tout").addEventListener("click", () => { deck = CARTES.map(c => c.id); montrerAtelier(); });
$("atelier-rien").addEventListener("click", () => { deck = []; montrerAtelier(); });
$("atelier-fermer").addEventListener("click", () => { if (deck.length < 30) return; sauverDeck(deck); $("atelier").classList.remove("visible"); majDeck(); });
$("bouton-regles").addEventListener("click", () => { $("regles-duel").hidden = !$("regles-duel").hidden; });
for (const b of document.querySelectorAll("[data-libre]")) b.addEventListener("click", () => demarrer({ mode: "libre", difficulte: b.dataset.libre }));
// la revanche : même adversaire, nouvelle donne (rejouer la même graine redonnait exactement les mêmes cartes)
$("bouton-revanche").addEventListener("click", () => demarrer(partie));
$("bouton-retour-accueil").addEventListener("click", () => { $("fin-duel").classList.remove("visible"); majAccueil(); majReprise(); $("accueil-duel").classList.add("visible"); });

window.addEventListener("keydown", e => {
  if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
  if (e.code === "Escape") { if ($("galerie").classList.contains("visible")) fermerGalerie(); else annuler(); }
  if (!d || $("accueil-duel").classList.contains("visible")) return;
  if (e.code === "KeyE") finDeTour();
  if (e.code === "KeyC") $("bouton-combat").click();
  if (e.code === "KeyA") ouvrirAccords();
  if (e.code === "KeyT") ouvrirTechniques();
});
window.addEventListener("resize", () => { if (d) ajusterTaille(); });
installerPleinEcran($("bouton-plein-ecran"), () => { if (d) ajusterTaille(); });
const boutonSon = $("bouton-son");
const majSon = () => { boutonSon.textContent = sonActif() ? "♪ Son" : "♪ Muet"; boutonSon.setAttribute("aria-pressed", String(sonActif())); };
boutonSon.addEventListener("click", () => { basculerSon(); majSon(); });
majSon();

// Votre dictionnaire des associations (Atelier, 4 Mo) : chargé après le démarrage, il remplace les lectures modernes.
function chargerDictionnaire() {
  if (dictionnaireCharge()) return;
  if (window.BELLINE?.PAIR_DICT) { definirDictionnaire(window.BELLINE.PAIR_DICT); return; }
  const s = document.createElement("script");
  s.src = "../js/data/pair-dictionary.js";
  s.onload = () => { if (window.BELLINE?.PAIR_DICT) { definirDictionnaire(window.BELLINE.PAIR_DICT); journal("Votre dictionnaire des associations est ouvert : ses lectures accompagnent le duel."); } };
  document.head.appendChild(s);
}
setTimeout(chargerDictionnaire, 1500);

// Téléphone : le journal s'ouvre par un bouton, par-dessus le jeu
$("bouton-journal")?.addEventListener("click", () => {
  const b = document.querySelector(".journal-bloc"), ouvert = b.classList.toggle("ouvert");
  $("bouton-journal").setAttribute("aria-expanded", String(ouvert));
});

// Outil de vérification (?test) : lire l'état depuis la console ou un script.
if (new URLSearchParams(location.search).has("test")) window.__duel = { etat: () => d, occupe: () => occupe, demarrer, effet: id => effetCarte(id), effets, zone: zoneEl };

// Accueil : un duel de démonstration derrière le voile
majAccueil();
rng = creerHasard(1); d = creerDuel(rng, "homme", { premier: 0, terrain: "soleil" }); partie = { demo: true };
majReprise();
document.fonts?.ready.then(() => ajusterTaille());
ajusterTaille();

return {  };
})();
})();
