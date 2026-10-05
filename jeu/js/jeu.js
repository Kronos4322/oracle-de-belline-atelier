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

// ===== js/engine/effects.js =====
M["js/engine/effects.js"] = (() => {
// Moteur d'effets. Module pur (aucun accès au DOM), testable sous Node.
//
// Effets disponibles (champ `type`). Les durées sont en secondes de marche (voir state.js).
//   energie {valeur}             gain ou perte d'énergie
//   fortune {valeur}             gain ou perte de fortune
//   fortuneDifferee {valeur, delai}  gain qui arrive après `delai` (Beauté, placement d'Argent)
//   promesse {valeur, delai}     gain annoncé qui, au terme, n'arrive pas (Inconstance)
//   hasardFortune {valeur}       gain ou perte de `valeur`, à pile ou face
//   pari {min}                   mise de la moitié de la fortune (au moins `min`) : doublée ou perdue (Hazard)
//   ralentir {duree} / accelerer {duree} / hasardVitesse
//   retrait {duree}              le mage s'arrête, sans usure (Cloître) ; temps réel
//   sterilite {duree}            aucun gain de fortune ; les espérances échues sont perdues
//   lunaison {duree}             le monde passe sous une autre région pour un temps
//   bouclier {nombre}            annule les prochaines pertes ; detruireBoucliers les supprime (Accident)
//   reveler {nombre}             rangs de cartes visibles en plus ; un rang se consume à chaque carte vécue
//   elever {duree}               sauts gratuits et vue +2 (Élévation)
//   compagnon {duree}            le chien court avec le mage : vue +1 (Pensée-Amitié)
//   discernement {duree}         les cartes visibles portent une marque favorable / défavorable (Intelligence)
//   aveuglement {duree}          plus aucune carte visible (Despotisme)
//   moderation {duree}           gains et pertes divisés par deux (Sagesse)
//   deperissement {duree}        usure doublée (Ruine)
//   regain {taux, duree}         l'énergie remonte au lieu de s'user (Amor)
//   feuDePaille {valeur, duree}  gain d'énergie repris quand la durée s'achève (Passions)
//   passivite {duree}            l'eau porte le mage : il ne dirige plus ses pas ni ne saute (Eau)
//   apaiser                      lève ralentissement, aveuglement, dépérissement, gain affaibli
//   doubleSuivante / ignorerSuivante  la prochaine carte vécue compte double / reste sans effet (Destinée)
//   affaiblirSuivante            le prochain gain est divisé par deux (Trahison)
//   attenuerSuivante             la prochaine perte est divisée par deux
//   survolerSuivante             la prochaine carte est survolée sans être vécue (Départ)
//   rejouerPrecedente            la carte précédente s'applique à nouveau (Étoiles) ; à moitié si l'Étoile
//                                n'est pas celle du consultant (elle représente alors une influence dans le jeu)
//   minimiserPrecedente          reprend la moitié des gains de la carte précédente (Trahison)
//   recompense {base, parCarte}  fortune qui croît avec le nombre de cartes vécues (Réussite)
//   vol {valeur}                 prend de la fortune, puis de l'énergie s'il n'y a plus rien (Vol-Perte)
//   projet {valeur, cartes}      gain si les `cartes` cartes suivantes ne font rien perdre (Entreprises)
//   envie {part, sinon}          prend une part de la fortune, ou de l'énergie si elle est nulle (Méchanceté)
//   renommee {valeur}            gain ou perte selon la carte précédente (Renommée)
//   heritage                     la carte la plus favorable déjà vécue redonne ses gains (Héritage)
//   combler                      énergie au maximum (Bonheur)
//   borner {valeur}              abaisse l'énergie maximale (Fatalité)
//   revirement                   rend la dernière perte subie (Grâce)
//   delai {secondes}             repousse les espérances en cours (Retard)
//   bouleverser                  rebat les cartes libres de la région (Accident)
//   retour                       la dernière carte laissée de côté revient et sera vécue (Union)
//   parure                       le mage porte un bijou (Plaisirs)
//   reserve                      la Carte Bleue reste en réserve pour remplacer une carte
//   si {condition, alors, sinon} effets selon l'état du mage ; conditions : voir CONDITIONS
//
// Pour créer un nouvel effet : ajouter un `case` dans appliquerEffet, le documenter ici, ajouter un test.

const { CONFIG, REGIONS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { reglesDeclenchees } = M["js/data/voisinage.js"];

function borner(v, min, max) { return Math.max(min, Math.min(max, v)); }

/** Conditions utilisables par l'effet `si`. */
const CONDITIONS = {
  // Le mage est affaibli : énergie basse, ou déjà ralenti
  affaibli: etat => etat.energie < 60 || etat.minuteurs.ralenti > 0,
  // Le chien de Pensée-Amitié court avec le mage
  accompagne: etat => etat.minuteurs.compagnon > 0
};

/** Applique un gain ou une perte en tenant compte des boucliers et des modificateurs. Renvoie un message. */
function variation(etat, cle, valeur) {
  if (etat.minuteurs.moderation > 0) valeur = valeur / 2;
  if (valeur < 0) {
    if (etat.boucliers > 0) { etat.boucliers--; return "Le bouclier absorbe la perte."; }
    if (etat.suivante.attenuer) { etat.suivante.attenuer = false; valeur = valeur / 2; }
  } else if (valeur > 0) {
    if (cle === "fortune" && etat.minuteurs.sterilite > 0) return "Stérilité : ce gain ne produit rien.";
    if (etat.suivante.affaiblir) { etat.suivante.affaiblir = false; valeur = valeur / 2; }
  }
  valeur = Math.round(valeur);
  let reel = valeur;
  if (cle === "energie") {
    const avant = etat.energie;
    etat.energie = borner(etat.energie + valeur, 0, etat.energieMax);
    reel = Math.round(etat.energie - avant);
  } else etat.fortune += valeur;
  return `${reel >= 0 ? "+" : ""}${reel} ${cle === "energie" ? "d’énergie" : "de fortune"}`;
}

const derniereEntree = etat => {
  for (let i = etat.historique.length - 1; i >= 0; i--) if (!etat.historique[i].remplacee) return etat.historique[i];
  return null;
};
const valeurGain = g => (g ? g.fortune + g.energie : 0);

/**
 * Applique un effet. `mult` vaut 2 quand La Destinée a mis la carte au premier plan, 1/2 pour une influence.
 * `rng` renvoie un nombre dans [0, 1[ (injectable pour les tests).
 * `ctx` : { carte, region, bouleverser } (facultatif ; `bouleverser()` rebat les cartes de la région et renvoie leur nombre).
 * Renvoie un message ou null.
 */
function appliquerEffet(etat, effet, mult = 1, rng = Math.random, ctx = {}) {
  const m = etat.minuteurs;
  const duree = d => d * mult;
  switch (effet.type) {
    case "energie": return variation(etat, "energie", effet.valeur * mult);
    case "fortune": return variation(etat, "fortune", effet.valeur * mult);
    case "fortuneDifferee":
      etat.differes.push({ restant: effet.delai, valeur: Math.round(effet.valeur * mult), source: ctx.carte ?? null });
      return `+${Math.round(effet.valeur * mult)} de fortune après ${effet.delai} s de marche.`;
    case "promesse":
      etat.differes.push({ restant: effet.delai, valeur: Math.round(effet.valeur * mult), promesse: true, source: ctx.carte ?? null });
      return `Promis : +${Math.round(effet.valeur * mult)} de fortune dans ${effet.delai} s.`;
    case "hasardFortune": {
      const v = (rng() < 0.5 ? -1 : 1) * effet.valeur * mult;
      return (v > 0 ? "Le sort est favorable : " : "Le sort est contraire : ") + variation(etat, "fortune", v);
    }
    case "pari": {
      const mise = Math.max(effet.min, Math.floor(Math.max(0, etat.fortune) / 2)) * mult;
      const gagne = rng() >= 0.5;
      return `Mise de ${Math.round(mise)}. ` + (gagne ? "La roue monte : " : "La roue descend : ") + variation(etat, "fortune", gagne ? mise : -mise);
    }
    case "ralentir": m.ralenti = Math.max(m.ralenti, duree(effet.duree)); return "Le pas ralentit.";
    case "accelerer": m.accelere = Math.max(m.accelere, duree(effet.duree)); return "Le pas s’accélère.";
    case "hasardVitesse":
      if (rng() < 0.5) { m.ralenti = Math.max(m.ralenti, duree(3)); return "Le vent freine."; }
      m.accelere = Math.max(m.accelere, duree(3)); return "Le vent pousse.";
    case "retrait": m.retrait = Math.max(m.retrait, duree(effet.duree)); return "Retrait : le mage s’arrête.";
    case "sterilite": m.sterilite = Math.max(m.sterilite, duree(effet.duree)); return "Les gains sont suspendus.";
    case "lunaison": {
      const autres = [1, 2, 3, 4, 5, 6, 7].filter(i => i !== etat.region);
      etat.lunaisonRegion = autres[Math.floor(rng() * autres.length)];
      m.lunaison = duree(effet.duree);
      return `Lunaison : le monde passe sous ${REGIONS[etat.lunaisonRegion].nom}.`;
    }
    case "bouclier": {
      const n = Math.floor(effet.nombre * mult);
      if (n <= 0) return "Trop lointaine, l’influence ne suffit pas à protéger.";
      etat.boucliers += n; return `+${n} bouclier${n > 1 ? "s" : ""}.`;
    }
    case "detruireBoucliers": {
      const n = etat.boucliers; etat.boucliers = 0;
      return n ? `${n} bouclier${n > 1 ? "s" : ""} détruit${n > 1 ? "s" : ""}.` : null;
    }
    case "reveler": {
      const n = Math.floor(effet.nombre * mult);
      etat.reveler = Math.max(etat.reveler, n); return n ? "La route se révèle." : null;
    }
    case "elever": m.elevation = Math.max(m.elevation, duree(effet.duree)); return "Le mage s’élève : il voit plus loin et saute sans effort.";
    case "compagnon": m.compagnon = Math.max(m.compagnon, duree(effet.duree)); return "Un ami fidèle court à ses côtés et part devant.";
    case "discernement": m.discernement = Math.max(m.discernement, duree(effet.duree)); return "Le mage discerne ce qui lui serait favorable.";
    case "aveuglement": m.aveuglement = Math.max(m.aveuglement, duree(effet.duree)); return "Aveuglement : la route se dérobe au regard.";
    case "moderation": m.moderation = Math.max(m.moderation, duree(effet.duree)); return "Modération : gains et pertes sont divisés par deux.";
    case "deperissement": m.deperissement = Math.max(m.deperissement, duree(effet.duree)); return "Dépérissement : la marche use deux fois plus.";
    case "regain":
      etat.regainTaux = Math.max(etat.regainTaux, effet.taux * mult); m.regain = Math.max(m.regain, effet.duree);
      return "L’affection soutient le mage : il regagne de l’énergie en marchant.";
    case "feuDePaille": {
      const avant = etat.energie;
      const msg = variation(etat, "energie", effet.valeur * mult);
      etat.feuDePailleValeur += Math.max(0, Math.round(etat.energie - avant));
      m.feuDePaille = Math.max(m.feuDePaille, effet.duree);
      return `${msg} (feu de paille).`;
    }
    case "passivite": m.passivite = Math.max(m.passivite, duree(effet.duree)); return "Le mage se laisse porter : il ne dirige plus ses pas.";
    case "apaiser":
      m.ralenti = 0; m.aveuglement = 0; m.deperissement = 0; etat.suivante.affaiblir = false; return "Les entraves tombent.";
    case "doubleSuivante": etat.suivante.double = true; return "La prochaine carte vécue comptera double.";
    case "ignorerSuivante": etat.suivante.ignorer = true; return "La prochaine carte vécue restera sans effet.";
    case "affaiblirSuivante": etat.suivante.affaiblir = true; return "Le prochain gain sera affaibli.";
    case "attenuerSuivante": etat.suivante.attenuer = true; return "La prochaine perte sera atténuée.";
    case "survolerSuivante": etat.suivante.survoler = true; return "Les oiseaux emporteront le mage au-dessus de la prochaine carte.";
    case "recompense": {
      const vecues = etat.historique.filter(h => !h.ignoree).length;
      return "Aboutissement : " + variation(etat, "fortune", (effet.base + effet.parCarte * vecues) * mult);
    }
    case "minimiserPrecedente": {
      const prec = derniereEntree(etat);
      const g = prec && !prec.ignoree ? prec.gain : null;
      if (!g || (g.fortune <= 0 && g.energie <= 0)) return "Aucune bonne carte à côté : rien à minimiser.";
      const msgs = [];
      for (const cle of ["fortune", "energie"]) if (g[cle] > 0) msgs.push(variation(etat, cle, -Math.ceil(g[cle] / 2 * mult)));
      return `${CARTE_PAR_ID[prec.id].nom} est minimisée : ${msgs.join(", ")}.`;
    }
    case "vol": {
      const v = Math.round(effet.valeur * mult);
      if (etat.fortune >= v || etat.boucliers > 0) return variation(etat, "fortune", -v);
      const msgs = [];
      const f = Math.max(0, etat.fortune);
      if (f > 0) msgs.push(variation(etat, "fortune", -f));
      msgs.push(variation(etat, "energie", -(v - f)));
      return `Plus rien à prendre : la perte devient morale. ${msgs.join(", ")}.`;
    }
    case "projet":
      etat.projets.push({ restantCartes: effet.cartes, valeur: Math.round(effet.valeur * mult), source: ctx.carte ?? null, cree: etat.historique.length });
      return `Projet en cours : +${Math.round(effet.valeur * mult)} de fortune si les ${effet.cartes} prochaines cartes ne vous font rien perdre.`;
    case "envie":
      if (etat.fortune > 0) return "L’envie vise votre fortune : " + variation(etat, "fortune", -Math.max(5, Math.round(etat.fortune * effet.part)) * mult);
      return "Rien à envier : la méchanceté s’en prend à vous. " + variation(etat, "energie", -effet.sinon * mult);
    case "renommee": {
      const prec = derniereEntree(etat);
      const s = prec && !prec.ignoree ? valeurGain(prec.gain) : 0;
      const signe = s > 0 ? 1 : s < 0 ? -1 : (rng() < 0.5 ? -1 : 1);
      const texte = s > 0 ? "Bonne opinion, portée par la carte précédente : " : s < 0 ? "Mauvaise opinion, entachée par la carte précédente : " : "Sans carte pour l’accompagner, l’opinion se fait au hasard : ";
      return texte + variation(etat, "fortune", signe * effet.valeur * mult);
    }
    case "heritage": {
      let meilleure = null;
      for (const h of etat.historique) if (!h.ignoree && !h.remplacee && valeurGain(h.gain) > valeurGain(meilleure?.gain ?? null) && (h.gain.fortune > 0 || h.gain.energie > 0)) meilleure = h;
      if (!meilleure) return "Le passé n’a rien laissé à hériter.";
      const msgs = [];
      for (const cle of ["fortune", "energie"]) if (meilleure.gain[cle] > 0) msgs.push(variation(etat, cle, meilleure.gain[cle] * mult));
      return `Legs de ${CARTE_PAR_ID[meilleure.id].nom} : ${msgs.join(", ")}.`;
    }
    case "combler": {
      const d = etat.energieMax - etat.energie;
      return d > 0 ? "Plénitude : " + variation(etat, "energie", d) : "L’énergie est déjà à son comble.";
    }
    case "borner":
      etat.energieMax = Math.max(CONFIG.energieMaxPlancher, etat.energieMax - Math.round(effet.valeur * mult));
      etat.energie = Math.min(etat.energie, etat.energieMax);
      return `Les bornes se resserrent : énergie maximale ${etat.energieMax}.`;
    case "revirement": {
      for (let i = etat.historique.length - 1; i >= 0; i--) {
        const h = etat.historique[i];
        if (h.remplacee || h.ignoree) continue;
        if (h.gain.energie < 0 || h.gain.fortune < 0) {
          const msgs = [];
          for (const cle of ["energie", "fortune"]) if (h.gain[cle] < 0) {
            const v = Math.round(-h.gain[cle] * mult);
            if (cle === "energie") etat.energie = Math.min(etat.energieMax, etat.energie + v); else etat.fortune += v;
            msgs.push(`+${v} ${cle === "energie" ? "d’énergie" : "de fortune"}`);
          }
          return `Revirement : la perte de ${CARTE_PAR_ID[h.id].nom} est rendue (${msgs.join(", ")}).`;
        }
      }
      return "Aucune perte à racheter.";
    }
    case "delai": {
      const n = etat.differes.length;
      for (const d of etat.differes) d.restant += effet.secondes * mult;
      return n ? `Les espérances en cours sont repoussées de ${effet.secondes * mult} s.` : null;
    }
    case "bouleverser": {
      const n = ctx.bouleverser ? ctx.bouleverser() : 0;
      return n > 1 ? `Bouleversement : les ${n} cartes qui restent dans la région sont rebattues.` : "Le scénario est rompu.";
    }
    case "retour": etat.retourDemande = true; return null;
    case "parure": etat.parure = true; return "Le mage porte désormais un bijou.";
    case "reserve": etat.carteBleue = true; return "La Carte Bleue est en réserve (touche B) : elle pourra remplacer une carte vécue.";
    case "si": {
      const branche = CONDITIONS[effet.condition](etat) ? effet.alors : effet.sinon;
      return branche.map(e => appliquerEffet(etat, e, mult, rng, ctx)).filter(Boolean).join(" ") || null;
    }
    case "rejouerPrecedente": return null; // traité dans rencontrer()
    default: return `Effet inconnu : ${effet.type}`;
  }
}

/** Effets réellement appliqués par une carte (choix éventuel compris). */
function effetsDeCarte(carte, indexChoix) {
  if (carte.choix && indexChoix != null) return carte.choix[indexChoix].effets;
  return carte.effets;
}

/** Un choix est-il possible dans l'état présent ? */
function choixPossible(etat, carte, indexChoix) {
  const ex = carte.choix?.[indexChoix]?.exige;
  return !ex || ex.fortune == null || etat.fortune >= ex.fortune;
}

// Effets qu'une Étoile ne rejoue pas : ils n'ont de sens qu'une fois.
const NON_REJOUES = new Set(["rejouerPrecedente", "retour", "reserve", "bouleverser"]);

/**
 * Que se passe-t-il quand le mage arrive sur une carte ?
 * 'survolee' (Départ), 'fermee' (Destinée fermée : pas de choix à faire), 'choix' (le joueur doit choisir), 'normale'.
 */
function etatArrivee(etat, id) {
  if (etat.suivante.survoler) return "survolee";
  if (etat.suivante.ignorer) return "fermee";
  return CARTE_PAR_ID[id].choix ? "choix" : "normale";
}

/**
 * Le mage vit une carte.
 * Ordre : un rang de vue se consume → carte fermée ? → multiplicateur de La Destinée → effets de la carte
 *         (et de la précédente pour les Étoiles) → règles de voisinage → inscription dans le tirage → projets.
 * Renvoie { messages, regles, entree, retour } ; `retour` est le numéro d'une carte qu'Union fait revenir
 * (le jeu doit alors la faire vivre à son tour).
 */
function rencontrer(etat, id, indexChoix = null, rng = Math.random, ctx = {}) {
  const carte = CARTE_PAR_ID[id];
  const messages = [];
  const entree = { id, choix: indexChoix, ignoree: false, double: false, region: ctx.region ?? etat.region, regles: [], retour: !!ctx.retour };
  const avant = { fortune: etat.fortune, energie: etat.energie };
  const c = { ...ctx, carte: id };
  etat.reveler = Math.max(0, etat.reveler - 1);
  etat.retourDemande = false;

  if (etat.suivante.ignorer) {
    etat.suivante.ignorer = false;
    entree.ignoree = true;
    entree.choix = null;
    messages.push("La porte était fermée : cette carte reste voilée et sans effet.");
  } else {
    let mult = 1;
    if (etat.suivante.double) { etat.suivante.double = false; mult = 2; entree.double = true; messages.push("Mise au premier plan par La Destinée : effet doublé."); }
    if (carte.choix && indexChoix != null) {
      if (!choixPossible(etat, carte, indexChoix)) { messages.push("Ce choix n’est pas possible : il y faut plus de fortune."); indexChoix = null; entree.choix = null; }
      else if (carte.choix[indexChoix].message) messages.push(carte.choix[indexChoix].message);
    }
    const effets = carte.choix && indexChoix == null ? [] : effetsDeCarte(carte, indexChoix);
    for (const effet of effets) {
      if (effet.type === "rejouerPrecedente") {
        const prec = derniereEntree(etat);
        if (prec && !prec.ignoree) {
          const cp = CARTE_PAR_ID[prec.id];
          // Ajout de jeu : l'Étoile du consultant le représente ; l'autre est une influence (le mari, l'épouse),
          // dont le sort ne touche le consultant qu'à moitié.
          const influence = etat.consultant && carte.etoile && carte.etoile !== etat.consultant;
          const m2 = influence ? mult / 2 : mult;
          messages.push(influence
            ? `${cp.nom} s’applique à ${carte.etoile === "homme" ? "l’homme de votre jeu" : "la femme de votre jeu"} : vous n’en recevez que la moitié.`
            : `${cp.nom} s’applique à vous, ${etat.consultant === "femme" ? "la consultante" : "le consultant"}.`);
          entree.recu = prec.id;
          for (const e of effetsDeCarte(cp, prec.choix)) {
            if (NON_REJOUES.has(e.type)) continue;
            const msg = appliquerEffet(etat, e, m2, rng, { ...c, carte: prec.id }); if (msg) messages.push(msg);
          }
        } else messages.push("Aucune carte ne précède : rien à lui appliquer.");
        continue;
      }
      const msg = appliquerEffet(etat, effet, mult, rng, c); if (msg) messages.push(msg);
    }
  }

  const prec = derniereEntree(etat);
  const regles = prec && !prec.ignoree && !entree.ignoree ? reglesDeclenchees(prec, entree) : [];
  for (const r of regles) {
    messages.push(`Règle de Belline : ${r.texte}`);
    entree.regles.push(r.id);
    for (const e of r.effets) { const msg = appliquerEffet(etat, e, 1, rng, c); if (msg) messages.push(msg); }
  }

  entree.gain = { fortune: etat.fortune - avant.fortune, energie: Math.round(etat.energie - avant.energie) };
  const index = etat.historique.length;
  etat.historique.push(entree);

  // Entreprises : chaque projet attend des cartes sans perte
  const perte = entree.gain.fortune < 0 || entree.gain.energie < 0;
  for (const p of etat.projets) {
    if (p.cree >= index || p.fini) continue;
    if (perte) { p.fini = true; messages.push("Une perte en route : le projet d’Entreprises échoue."); continue; }
    if (--p.restantCartes <= 0) { p.fini = true; messages.push("Le projet aboutit : " + variation(etat, "fortune", p.valeur)); }
  }
  etat.projets = etat.projets.filter(p => !p.fini);

  let retour = null;
  if (etat.retourDemande) {
    etat.retourDemande = false;
    retour = etat.laissees?.pop() ?? null;
    messages.push(retour != null ? `Retour : ${CARTE_PAR_ID[retour].nom}, laissée de côté, revient vers vous.` : "Rien de ce que vous avez laissé ne revient.");
  }

  entree.messages = messages.slice();
  if (etat.energie <= 0) { etat.termine = true; etat.cause = "carte"; }
  return { messages, regles, entree, retour };
}

/** Le mage laisse une carte de côté en prenant une autre branche. */
function contourner(etat, id, rng = Math.random) {
  const carte = CARTE_PAR_ID[id];
  etat.contournees.push(id);
  (etat.laissees ||= []).push(id);
  const messages = carte.messageContourne && carte.contourne ? [carte.messageContourne] : [];
  for (const e of (carte.contourne || [])) { const msg = appliquerEffet(etat, e, 1, rng, { carte: id }); if (msg) messages.push(msg); }
  return messages;
}

/** Coût d'un saut par-dessus une carte : gratuit sous Élévation, plus cher pour une carte forte. */
function coutSaut(etat, id) {
  if (etat.minuteurs.elevation > 0) return 0;
  return CARTE_PAR_ID[id].forte ? 15 : 6;
}

/** Le mage saute par-dessus une carte. */
function sauter(etat, id, rng = Math.random) {
  const carte = CARTE_PAR_ID[id];
  const cout = coutSaut(etat, id);
  etat.energie = Math.max(0, etat.energie - cout);
  etat.sautees.push(id);
  (etat.laissees ||= []).push(id);
  const messages = [cout ? `Le mage saute par-dessus ${carte.nom} : -${cout} d’énergie.` : `Le mage s’élève par-dessus ${carte.nom} sans effort.`];
  if (carte.messageContourne && carte.contourne) messages.push(carte.messageContourne);
  for (const e of (carte.contourne || [])) { const msg = appliquerEffet(etat, e, 1, rng, { carte: id }); if (msg) messages.push(msg); }
  if (etat.energie <= 0) { etat.termine = true; etat.cause = "saut"; }
  return messages;
}

/** Départ : les oiseaux emportent le mage au-dessus de la carte. */
function survoler(etat, id) {
  etat.suivante.survoler = false;
  etat.survolees.push(id);
  return [`Les oiseaux emportent le mage au-dessus de ${CARTE_PAR_ID[id].nom} : elle est abandonnée.`];
}

/** Carte Bleue : remplace la dernière carte vécue (ce qu'elle avait fait est annulé). Renvoie des messages ou null. */
function utiliserCarteBleue(etat) {
  if (!etat.carteBleue) return null;
  const e = derniereEntree(etat);
  if (!e || e.id === 0) return ["Aucune carte à remplacer pour l’instant."];
  etat.carteBleue = false;
  e.remplacee = true;
  etat.energie = borner(etat.energie - e.gain.energie, 0, etat.energieMax);
  etat.fortune -= e.gain.fortune;
  if (etat.energie <= 0) { etat.energie = 1; }
  return [`La Carte Bleue remplace ${CARTE_PAR_ID[e.id].nom} : ce que cette carte avait fait est annulé (${-e.gain.energie >= 0 ? "+" : ""}${-e.gain.energie} d’énergie, ${-e.gain.fortune >= 0 ? "+" : ""}${-e.gain.fortune} de fortune).`];
}

return { CONDITIONS, variation, appliquerEffet, effetsDeCarte, choixPossible, etatArrivee, rencontrer, contourner, coutSaut, sauter, survoler, utiliserCarteBleue };
})();

// ===== js/engine/state.js =====
M["js/engine/state.js"] = (() => {
// État du jeu. Module pur (aucun accès au DOM), testable sous Node.
//
// Le temps du jeu est le temps de marche : minuteurs, usure et espérances n'avancent que quand le mage
// marche. Le joueur peut donc s'arrêter pour lire une carte sans rien perdre. Seul le Cloître
// (retrait) se compte en temps réel, puisque le mage ne peut alors plus marcher.
const { CONFIG } = M["js/config.js"];
const { variation } = M["js/engine/effects.js"];

/** `consultant` : 'homme' | 'femme' | null. Il désigne l'Étoile qui représente le joueur (le significateur). */
function creerEtat(consultant = null) {
  return {
    consultant,
    energie: CONFIG.energieInitiale,
    energieMax: CONFIG.energieMax,
    fortune: 0,
    boucliers: 0,
    // durées restantes, en secondes de marche (sauf retrait : secondes réelles)
    minuteurs: {
      ralenti: 0, accelere: 0, retrait: 0, sterilite: 0, lunaison: 0, elevation: 0, compagnon: 0, passivite: 0,
      aveuglement: 0, discernement: 0, moderation: 0, deperissement: 0, regain: 0, feuDePaille: 0
    },
    regainTaux: 0,
    feuDePailleValeur: 0,
    // modificateurs qui portent sur la prochaine carte vécue ou le prochain gain / la prochaine perte
    suivante: { double: false, ignorer: false, affaiblir: false, attenuer: false, survoler: false },
    differes: [],          // gains à venir : { restant, valeur, promesse, source } ; une promesse n'est pas tenue
    projets: [],           // Entreprises : { restantCartes, valeur, source }
    reveler: 0,            // rangs de cartes visibles en plus ; diminue d'un à chaque carte vécue
    lunaisonRegion: null,  // région empruntée pendant une lunaison
    region: 0,             // région où se trouve le mage
    historique: [],        // le tirage : cartes vécues, dans l'ordre
    contournees: [],       // cartes laissées de côté (autre branche)
    sautees: [],           // cartes franchies d'un saut
    survolees: [],         // cartes passées sous les oiseaux du Départ
    laissees: [],          // cartes contournées ou sautées, dans l'ordre (Union les fait revenir)
    retourDemande: false,
    carteBleue: false,     // la Carte Bleue est en réserve
    parure: false,         // Plaisirs : le mage porte un bijou
    termine: false,
    victoire: false,
    cause: null
  };
}

/** Multiplicateur de vitesse de marche. */
function multiplicateurVitesse(etat) {
  const m = etat.minuteurs;
  if (m.retrait > 0) return 0;
  let v = 1;
  if (m.ralenti > 0) v *= CONFIG.facteurRalenti;
  if (m.accelere > 0) v *= CONFIG.facteurAcceleration;
  return v;
}

/** Nombre de rangs de cartes visibles devant le mage (0 sous l'aveuglement de Despotisme). */
function vue(etat) {
  const m = etat.minuteurs;
  if (m.aveuglement > 0) return 0;
  return CONFIG.vueBase + etat.reveler + (m.elevation > 0 ? 2 : 0) + (m.compagnon > 0 ? 1 : 0);
}

/** Le mage peut-il marcher, sauter ? */
function peutMarcher(etat) { return etat.minuteurs.retrait <= 0 && !etat.termine; }
function peutSauter(etat) { return etat.minuteurs.retrait <= 0 && etat.minuteurs.passivite <= 0 && !etat.termine; }

/** Énergie perdue par seconde de marche. */
function usureCourante(etat) {
  const m = etat.minuteurs;
  if (m.regain > 0) return -etat.regainTaux;
  return CONFIG.usure * (m.deperissement > 0 ? 2 : 1);
}

/**
 * Fait avancer le temps. `marche` : le mage a marché pendant `dt` (sinon seul le retrait s'écoule).
 * Les espérances échues passent par `variation` : elles respectent Stérilité, Sagesse, etc.
 * Renvoie une liste de { texte, source } (source : numéro de la carte qui a produit le message).
 */
function avancerTemps(etat, dt, marche) {
  const messages = [];
  const m = etat.minuteurs;
  m.retrait = Math.max(0, m.retrait - dt);
  if (!marche || etat.termine) return messages;

  // L'état au début du pas décide de l'usure et des échéances (un minuteur qui s'achève pendant le pas compte encore)
  const usure = usureCourante(etat), sterile = m.sterilite > 0;
  for (const k of Object.keys(m)) if (k !== "retrait") m[k] = Math.max(0, m[k] - dt);
  if (m.lunaison === 0) etat.lunaisonRegion = null;
  if (m.regain === 0) etat.regainTaux = 0;

  // Usure du chemin (ou regain d'Amor)
  etat.energie = Math.max(0, Math.min(etat.energieMax, etat.energie - usure * dt));

  // Passions : le feu de paille s'éteint
  if (m.feuDePaille === 0 && etat.feuDePailleValeur > 0) {
    const v = etat.feuDePailleValeur;
    etat.feuDePailleValeur = 0;
    etat.energie = Math.max(0, etat.energie - v);
    messages.push({ texte: `Le feu de paille s’éteint : -${v} d’énergie.`, source: 31 });
  }

  // Espérances et promesses
  for (const d of etat.differes) d.restant -= dt;
  const echus = etat.differes.filter(d => d.restant <= 0);
  etat.differes = etat.differes.filter(d => d.restant > 0);
  for (const d of echus) {
    if (d.promesse) { messages.push({ texte: `La promesse n’est pas tenue : les ${d.valeur} de fortune n’arrivent pas.`, source: d.source }); continue; }
    if (sterile) { messages.push({ texte: `Stérilité : l’espérance de ${d.valeur} de fortune est vaine.`, source: d.source }); continue; }
    messages.push({ texte: `Une espérance se réalise : ${variation(etat, "fortune", d.valeur)}`, source: d.source });
  }

  if (etat.energie <= 0) { etat.termine = true; etat.cause = "usure"; }
  return messages;
}

return { creerEtat, multiplicateurVitesse, vue, peutMarcher, peutSauter, usureCourante, avancerTemps };
})();

// ===== js/engine/valeurs.js =====
M["js/engine/valeurs.js"] = (() => {
// Valeur d'une carte pour le mage. Module pur.
//
// La valeur se mesure sur une copie de l'état : on vit la carte, puis on marche 10 secondes, et l'on compare
// avec une copie qui a seulement marché. Ainsi les effets étalés dans le temps comptent (Amor, Beauté, un
// placement), le feu de paille de Passions s'éteint, et un procès se juge en moyenne (gagné ou perdu).
// Un bouclier vaut 12 (à peu près la perte qu'il évite).
const { CARTES, CARTE_PAR_ID } = M["js/data/cartes.js"];
const { rencontrer, choixPossible } = M["js/engine/effects.js"];
const { creerEtat, avancerTemps } = M["js/engine/state.js"];

const HORIZON = 10;
const TIRAGES = [0.25, 0.75];
const VALEUR_BOUCLIER = 12;

const copier = etat => structuredClone({ ...etat, historique: etat.historique.slice(-3) });
const bilan = e => e.energie + e.fortune + VALEUR_BOUCLIER * e.boucliers;

/** Valeur d'un choix donné (null si la carte n'a pas de choix). */
function valeurChoix(etat, id, indexChoix) {
  const temoin = copier(etat);
  avancerTemps(temoin, HORIZON, true);
  let somme = 0;
  for (const t of TIRAGES) {
    const e = copier(etat);
    rencontrer(e, id, indexChoix, () => t);
    if (!e.termine) avancerTemps(e, HORIZON, true);
    somme += bilan(e) - bilan(temoin);
  }
  return somme / TIRAGES.length;
}

/** Valeur d'une carte maintenant : celle du meilleur choix possible. Ne modifie pas `etat`. */
function valence(etat, id) {
  const carte = CARTE_PAR_ID[id];
  const essais = carte.choix ? carte.choix.map((_, i) => i).filter(i => choixPossible(etat, carte, i)) : [null];
  return Math.round(Math.max(...essais.map(i => valeurChoix(etat, id, i))));
}

/** Meilleur choix d'une carte à choix (sert à l'Ombre du duel, au simulateur). */
function meilleurChoix(etat, id) {
  const carte = CARTE_PAR_ID[id];
  let best = 0, bv = -Infinity;
  carte.choix.forEach((_, i) => { if (choixPossible(etat, carte, i)) { const v = valeurChoix(etat, id, i); if (v > bv) { bv = v; best = i; } } });
  return best;
}

/** Valeur de chaque carte pour un mage frais : sert à composer des fourches qui soient de vrais dilemmes. */
const VALEURS = Object.fromEntries(CARTES.map(c => [c.id, valence(creerEtat("homme"), c.id)]));

return { VALEUR_BOUCLIER, valeurChoix, valence, meilleurChoix, VALEURS };
})();

// ===== js/engine/chemin.js =====
M["js/engine/chemin.js"] = (() => {
// Construction du chemin : un graphe qui monte de bas en haut, région par région, dans l'ordre d'Edmond.
// Module pur (aucun accès au DOM), testable sous Node.
//
// Chaque région alterne des fourches (deux branches portant des cartes, qui se rejoignent ; à chaque fourche,
// le joueur doit choisir à gauche ou à droite) et des cartes de tronc, que tout chemin traverse :
// les cartes fortes, La Destinée et les Étoiles. Une branche porte au plus trois cartes.
//
// Ajouts de jeu (signalés) :
//   - Les Étoiles quittent le préambule : chacune se dresse sur le tronc d'une région planétaire, pour
//     que la carte qui la précède soit une vraie carte, choisie par le joueur.
//   - Rendez-vous : dans chaque région, une règle de voisinage de Belline est préparée en plaçant ses deux
//     cartes l'une après l'autre (au besoin, une carte d'une autre famille vient en visiteuse). Sans cela,
//     les règles qui relient deux familles éloignées (Maladie et Grâce...) ne pourraient jamais se produire.
//   - Dilemmes : les cartes libres sont échangées entre branches pour qu'une fourche offre rarement un
//     choix évident (une branche bien meilleure que l'autre).
//   - Parcours progressif : `regions` limite le chemin aux premières planètes (chemin court, moyen, grand).
//
// Un nœud : { id, x (voie : -1, 0, 1), a (altitude), region, carte (numéro ou null), tronc, porte, depart,
//             arrivee, etat ('libre' | 'vecue' | 'fermee' | 'contournee' | 'sautee' | 'survolee') }
const { CONFIG, REGIONS } = M["js/config.js"];
const { CARTES, CARTE_PAR_ID } = M["js/data/cartes.js"];
const { VOISINAGE } = M["js/data/voisinage.js"];
const { melanger, choisir } = M["js/engine/hasard.js"];
const { VALEURS } = M["js/engine/valeurs.js"];

const PROBA_RENDEZ_VOUS = 0.85;
const MAX_PAR_FOURCHE = 4;      // deux branches de deux, ou trois et une : jamais plus de trois par branche
const ECART_EVIDENT = 15; // au-delà, une fourche est un choix évident

/** Cartes qui se dressent sur le tronc. */
function estTronc(id) { const c = CARTE_PAR_ID[id]; return !!c.forte || id === 1 || !!c.etoile; }

/** Répartit les cartes entre les régions et prépare les rendez-vous. `n` : nombre de régions planétaires. */
function planifier(rng, n) {
  const planetes = Array.from({ length: n }, (_, i) => i + 1);
  const parRegion = REGIONS.map((r, i) => (i <= n ? CARTES.filter(c => c.famille === r.famille && !c.etoile).map(c => c.id) : []));
  const regionDe = {};
  parRegion.forEach((ids, i) => ids.forEach(id => { regionDe[id] = i; }));
  const deplacer = (id, i) => { parRegion[regionDe[id]] = parRegion[regionDe[id]].filter(x => x !== id); parRegion[i].push(id); regionDe[id] = i; };

  // Les Étoiles : deux régions planétaires distinctes
  const [r2, r3] = melanger(planetes, rng);
  parRegion[r2].push(2); regionDe[2] = r2;
  parRegion[r3].push(3); regionDe[3] = r3;

  const liens = REGIONS.map(() => []);
  const rendezVous = [];
  const utilises = new Set();
  for (const i of melanger(planetes, rng)) {
    if (rng() > PROBA_RENDEZ_VOUS) continue;
    const candidates = VOISINAGE.filter(r => {
      if (utilises.has(r.a) || utilises.has(r.b)) return false;
      const ra = regionDe[r.a], rb = regionDe[r.b];
      if (ra == null || rb == null) return false;   // carte hors du chemin court
      if (ra !== i && rb !== i) return false;
      const visiteuse = ra === i ? r.b : r.a;
      if (regionDe[visiteuse] === i) return true;
      return !estTronc(visiteuse) && regionDe[visiteuse] >= 1; // une carte de tronc reste dans sa région
    });
    if (!candidates.length) continue;
    const r = choisir(candidates, rng);
    for (const id of [r.a, r.b]) { if (regionDe[id] !== i) deplacer(id, i); utilises.add(id); }
    const [p, s] = r.ordre === "avant" || rng() < 0.5 ? [r.a, r.b] : [r.b, r.a];
    const tp = estTronc(p), ts = estTronc(s);
    if (!tp && !ts) liens[i].push({ type: "paire", ids: [p, s] });
    else if (!tp && ts) liens[i].push({ type: "avant", partenaire: p, tronc: s });
    else if (tp && !ts) liens[i].push({ type: "apres", tronc: p, partenaire: s });
    else liens[i].push({ type: "troncs", ids: [p, s] });
    rendezVous.push({ regle: r.id, cartes: [p, s], region: i });
  }

  // La Carte Bleue (hors jeu d'Edmond) apparaît une fois, dans une région planétaire
  parRegion[choisir(planetes, rng)].push(0);
  return { parRegion, liens, rendezVous };
}

/** Suite de segments d'une région : { type: 'tronc', ids } ou { type: 'fourche', branches: [[ids], [ids]] }. */
function segmentsRegion(ids, liens, rng) {
  const lies = new Set();
  const groupes = [];      // groupes de cartes de tronc consécutives
  const parTronc = {};
  for (const l of liens) {
    if (l.type === "troncs") { const g = { ids: l.ids.slice() }; groupes.push(g); l.ids.forEach(id => { parTronc[id] = g; lies.add(id); }); }
  }
  for (const id of ids) if (estTronc(id) && !parTronc[id]) { const g = { ids: [id] }; groupes.push(g); parTronc[id] = g; lies.add(id); }
  for (const l of liens) {
    if (l.type === "avant") { parTronc[l.tronc].avant = l.partenaire; lies.add(l.partenaire); }
    if (l.type === "apres") { parTronc[l.tronc].apres = l.partenaire; lies.add(l.partenaire); }
  }
  const unites = liens.filter(l => l.type === "paire").map(l => { l.ids.forEach(id => lies.add(id)); return l.ids.slice(); });
  const libres = new Set(ids.filter(id => !lies.has(id)));
  for (const id of libres) unites.push([id]);

  const ordre = melanger(groupes, rng);
  const fourches = ordre.map(() => ({ unites: [], fin: null, debut: null }));
  fourches.push({ unites: [], fin: null, debut: null });
  ordre.forEach((g, k) => {
    if (g.avant != null) fourches[k].fin = g.avant;
    if (g.apres != null) fourches[k + 1].debut = g.apres;
  });
  const depart = Math.floor(rng() * fourches.length);
  melanger(unites, rng).forEach((u, k) => fourches[(depart + k) % fourches.length].unites.push(u));

  const segments = [];
  fourches.forEach((f, k) => {
    for (const morceau of decouper(f)) segments.push({ type: "fourche", branches: branches(morceau, rng) });
    if (k < ordre.length) segments.push({ type: "tronc", ids: ordre[k].ids });
  });
  ameliorerFourches(segments, libres, rng);
  return segments;
}

/** Une fourche trop chargée devient plusieurs fourches successives d'au plus MAX_PAR_FOURCHE cartes. */
function decouper(f) {
  const taille = m => m.unites.reduce((s, u) => s + u.length, 0) + (m.fin != null) + (m.debut != null);
  if (taille(f) === 0) return [];
  const morceaux = [{ unites: [], fin: null, debut: f.debut }];
  for (const u of f.unites) {
    let m = morceaux[morceaux.length - 1];
    if (taille(m) + u.length > MAX_PAR_FOURCHE) { m = { unites: [], fin: null, debut: null }; morceaux.push(m); }
    m.unites.push(u);
  }
  const dernier = morceaux[morceaux.length - 1];
  if (f.fin != null) {
    if (taille(dernier) + 1 > MAX_PAR_FOURCHE) morceaux.push({ unites: [], fin: f.fin, debut: null });
    else dernier.fin = f.fin;
  }
  return morceaux.filter(m => taille(m) > 0);
}

function branches(f, rng) {
  const b = [{ debut: [], unites: [], fin: [] }, { debut: [], unites: [], fin: [] }];
  if (f.fin != null) b[0].fin.push(f.fin);
  if (f.debut != null) b[1].debut.push(f.debut);
  const taille = x => x.debut.length + x.fin.length + x.unites.reduce((s, u) => s + u.length, 0);
  for (const u of f.unites) {
    const min = Math.min(...b.map(taille));
    choisir(b.filter(x => taille(x) === min), rng).unites.push(u);
  }
  return melanger(b.map(x => [...x.debut, ...x.unites.flat(), ...x.fin]), rng);
}

const valeurBranche = ids => ids.reduce((s, id) => s + VALEURS[id], 0);
const penalite = segs => segs.filter(s => s.type === "fourche").reduce((p, s) => {
  const ecart = Math.abs(valeurBranche(s.branches[0]) - valeurBranche(s.branches[1]));
  return p + Math.max(0, ecart - 8);
}, 0);

/** Échange des cartes libres entre branches pour que les fourches soient des dilemmes. */
function ameliorerFourches(segments, libres, rng) {
  const places = [];
  segments.forEach((s, i) => { if (s.type === "fourche") s.branches.forEach((b, j) => b.forEach((id, k) => { if (libres.has(id)) places.push([i, j, k]); })); });
  if (places.length < 2) return;
  let actuelle = penalite(segments);
  for (let essai = 0; essai < 120 && actuelle > 0; essai++) {
    const [p, q] = [choisir(places, rng), choisir(places, rng)];
    if (p[0] === q[0] && p[1] === q[1]) continue;
    const bp = segments[p[0]].branches[p[1]], bq = segments[q[0]].branches[q[1]];
    [bp[p[2]], bq[q[2]]] = [bq[q[2]], bp[p[2]]];
    const nouvelle = penalite(segments);
    if (nouvelle <= actuelle) actuelle = nouvelle;
    else [bp[p[2]], bq[q[2]]] = [bq[q[2]], bp[p[2]]];
  }
}

/** Construit le chemin. `options.regions` : nombre de régions planétaires (2 à 7 ; 7 par défaut). */
function construireChemin(rng, options = {}) {
  const nRegions = Math.max(2, Math.min(7, options.regions ?? 7));
  const { parRegion, liens, rendezVous } = planifier(rng, nRegions);
  const noeuds = [], suivants = [];
  const ajouter = n => { n.id = noeuds.length; n.etat = "libre"; if (n.carte === undefined) n.carte = null; noeuds.push(n); suivants.push([]); return n.id; };
  const lier = (a, b) => suivants[a].push(b);
  const regions = REGIONS.slice(0, nRegions + 1).map((r, i) => ({ index: i, aDebut: 0, aFin: 0 }));

  let a = 0;
  let cur = ajouter({ x: 0, a, region: 0, depart: true });
  regions[0].aDebut = -600;
  a += CONFIG.rang;
  const dest = ajouter({ x: 0, a, region: 0, carte: 1, tronc: true }); lier(cur, dest); cur = dest;

  const fourches = [];
  for (let i = 1; i <= nRegions; i++) {
    a += 170;
    const porte = ajouter({ x: 0, a, region: i, porte: i }); lier(cur, porte); cur = porte;
    regions[i].aDebut = a; regions[i - 1].aFin = a;
    for (const seg of segmentsRegion(parRegion[i], liens[i], rng)) {
      if (seg.type === "tronc") {
        for (const id of seg.ids) { a += CONFIG.rang; const n = ajouter({ x: 0, a, region: i, carte: id, tronc: true }); lier(cur, n); cur = n; }
        continue;
      }
      let split = cur;
      if (noeuds[cur].carte != null || noeuds[cur].porte != null) { a += 110; split = ajouter({ x: 0, a, region: i }); lier(cur, split); }
      const L = Math.max(1, ...seg.branches.map(b => b.length));
      const S = CONFIG.ecartFourche * 2 + (L - 1) * CONFIG.rang;
      const fins = [];
      fourches.push(seg.branches.map(b => b.slice()));
      seg.branches.forEach((ids, k) => {
        const x = k === 0 ? -1 : 1;
        let prev = split;
        if (!ids.length) { const w = ajouter({ x, a: a + S / 2, region: i }); lier(prev, w); prev = w; }
        ids.forEach((id, j) => {
          const aj = ids.length === L ? a + CONFIG.ecartFourche + j * CONFIG.rang : a + S * (j + 1) / (ids.length + 1);
          const n = ajouter({ x, a: aj, region: i, carte: id }); lier(prev, n); prev = n;
        });
        fins.push(prev);
      });
      a += S;
      const merge = ajouter({ x: 0, a, region: i });
      fins.forEach(f => lier(f, merge));
      cur = merge;
    }
  }
  a += 230;
  const arrivee = ajouter({ x: 0, a, region: nRegions, arrivee: true }); lier(cur, arrivee);
  regions[nRegions].aFin = a + 600;

  const ordre = noeuds.map(n => n.id).sort((p, q) => noeuds[p].a - noeuds[q].a);
  return { noeuds, suivants, ordre, depart: 0, arrivee, regions, rendezVous, fourches, nRegions };
}

const cout = n => (n.carte != null && n.etat === "libre" ? 1 : 0);

/**
 * Rangs des nœuds atteignables depuis une position du mage ({ noeud, vers }).
 * Le rang d'une carte libre est le nombre de cartes libres qu'il faut vivre pour l'atteindre, elle comprise :
 * rang 1 = les cartes de la prochaine fourche (ou la prochaine carte du tronc).
 */
function rangs(chemin, noeud, vers = null) {
  const { noeuds, suivants, ordre } = chemin;
  const dist = new Map();
  if (vers != null) dist.set(vers, cout(noeuds[vers]));
  else for (const s of suivants[noeud]) dist.set(s, Math.min(dist.get(s) ?? Infinity, cout(noeuds[s])));
  for (const n of ordre) {
    if (!dist.has(n)) continue;
    for (const s of suivants[n]) {
      const d = dist.get(n) + cout(noeuds[s]);
      if (d < (dist.get(s) ?? Infinity)) dist.set(s, d);
    }
  }
  return dist;
}

/** Longueur d'une arête (unités du monde). */
function longueurArete(chemin, p, q) {
  const A = chemin.noeuds[p], B = chemin.noeuds[q];
  return Math.hypot((B.x - A.x) * CONFIG.ecartVoies, B.a - A.a);
}

/** Plus court trajet (distance) d'un nœud jusqu'au premier nœud qui vérifie `but`. */
function distanceJusqua(chemin, depuis, but) {
  const dist = new Map([[depuis, 0]]);
  for (const n of chemin.ordre) {
    if (!dist.has(n)) continue;
    if (n !== depuis && but(chemin.noeuds[n])) return dist.get(n);
    for (const s of chemin.suivants[n]) {
      const d = dist.get(n) + longueurArete(chemin, n, s);
      if (d < (dist.get(s) ?? Infinity)) dist.set(s, d);
    }
  }
  return null;
}

/** Cartes encore libres que le mage ne peut plus atteindre depuis le nœud où il se tient. */
function injoignables(chemin, noeud) {
  const atteints = rangs(chemin, noeud);
  return chemin.noeuds.filter(n => n.carte != null && n.etat === "libre" && n.id !== noeud && !atteints.has(n.id)).map(n => n.id);
}

/** Suite de nœuds de `depuis` (exclu) à `cible` (inclus), ou null. */
function cheminVers(chemin, depuis, cible) {
  const prec = new Map([[depuis, null]]);
  const file = [depuis];
  while (file.length) {
    const n = file.shift();
    if (n === cible) break;
    for (const s of chemin.suivants[n]) if (!prec.has(s)) { prec.set(s, n); file.push(s); }
  }
  if (!prec.has(cible)) return null;
  const route = [];
  for (let n = cible; n !== depuis; n = prec.get(n)) route.unshift(n);
  return route;
}

/** Accident : rebat les cartes encore libres des branches de la région, devant le mage. Renvoie leur nombre. */
function bouleverser(chemin, region, depuis, rng) {
  const atteints = rangs(chemin, depuis);
  const cibles = chemin.noeuds.filter(n => n.region === region && n.carte != null && n.etat === "libre" && !n.tronc && atteints.has(n.id));
  const ids = melanger(cibles.map(n => n.carte), rng);
  cibles.forEach((n, k) => { n.carte = ids[k]; });
  return cibles.length;
}

/** Nœud portant une carte donnée. */
function noeudDeCarte(chemin, id) { return chemin.noeuds.find(n => n.carte === id); }

/** Part des fourches où une branche vaut nettement plus que l'autre (mesure des dilemmes). */
function partEvidente(chemin) {
  const f = chemin.fourches;
  return f.length ? f.filter(b => Math.abs(valeurBranche(b[0]) - valeurBranche(b[1])) >= ECART_EVIDENT).length / f.length : 0;
}

return { ECART_EVIDENT, estTronc, construireChemin, rangs, longueurArete, distanceJusqua, injoignables, cheminVers, bouleverser, noeudDeCarte, partEvidente };
})();

// ===== js/engine/enigmes.js =====
M["js/engine/enigmes.js"] = (() => {
// L'énigme de la porte : une question sur une carte rencontrée dans la région qu'on quitte. Module pur.
// Ajout de jeu (signalé) : la notice ne parle pas de questions ; c'est un outil d'apprentissage.
// Trois sortes de questions, toutes tirées des textes de la notice :
//   - l'image : « Quelle carte a pour image… ? »
//   - la notice : « Quelle carte dit… ? » (un extrait, sans le nom de la carte)
//   - le voisinage : « Avec quelle carte… annonce-t-elle… ? »
const { CARTES, CARTE_PAR_ID } = M["js/data/cartes.js"];
const { VOISINAGE } = M["js/data/voisinage.js"];
const { melanger, choisir } = M["js/engine/hasard.js"];

const sans = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Extrait de notice lisible sans révéler la carte : la première phrase qui ne contient ni son nom ni « n° ». */
function extraitNotice(carte) {
  const phrases = carte.notice.split(/(?<=\.)\s+/).map(p => p.trim()).filter(Boolean);
  const nom = sans(carte.nom).split(/[^a-z]+/).filter(m => m.length > 3);
  const ok = phrases.find(p => !/n°/.test(p) && !nom.some(m => sans(p).includes(m)) && p.length > 12);
  return ok ?? null;
}

function leurres(id, n, rng, filtre = () => true) {
  const pool = CARTES.filter(c => c.id !== id && filtre(c)).map(c => c.id);
  return melanger(pool, rng).slice(0, n);
}

/**
 * Pose une énigme sur l'une des cartes `candidates` (préférence aux cartes à revoir du carnet).
 * Renvoie { carte, question, options: [numéros], bonne (index), explication } ou null.
 */
function poserEnigme(candidates, rng, aRevoir = {}) {
  if (!candidates.length) return null;
  const prioritaires = candidates.filter(id => aRevoir[id] > 0);
  const id = choisir(prioritaires.length && rng() < 0.7 ? prioritaires : candidates, rng);
  const carte = CARTE_PAR_ID[id];
  const sortes = ["image"];
  if (extraitNotice(carte)) sortes.push("notice");
  const regles = VOISINAGE.filter(r => (r.a === id || r.b === id) && r.ordre === "libre");
  if (regles.length) sortes.push("voisinage");
  const sorte = choisir(sortes, rng);

  if (sorte === "voisinage") {
    const r = choisir(regles, rng);
    const autre = r.a === id ? r.b : r.a;
    const sens = r.texte.split(" : ")[1] ?? r.texte;
    const options = melanger([autre, ...leurres(autre, 2, rng, c => c.id !== id)], rng);
    return { carte: id, sorte, question: `Selon Belline, avec quelle carte ${carte.nom} annonce-t-elle « ${sens.replace(/\.$/, "")} » ?`,
      options, bonne: options.indexOf(autre), explication: r.texte };
  }
  const options = melanger([id, ...leurres(id, 2, rng)], rng);
  const question = sorte === "image"
    ? `Quelle carte a pour image « ${carte.image} » ?`
    : `Quelle carte dit : « ${extraitNotice(carte)} » ?`;
  return { carte: id, sorte, question, options, bonne: options.indexOf(id), explication: `${carte.nom} : « ${carte.notice} »` };
}

return { extraitNotice, poserEnigme };
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

// ===== js/game/player.js =====
M["js/game/player.js"] = (() => {
// Le mage sur le chemin : il marche le long des arêtes du graphe, choisit sa branche aux fourches, saute.
// Module pur (aucun accès au DOM), testable sous Node.
//
// Position : au nœud `noeud` si `vers` est null ; sinon sur l'arête noeud → vers, à la fraction `t`.
// Commande : { dx, dy } avec dx ∈ [-1, 1] (droite positive) et dy ∈ [-1, 1] (haut positif).
// Aux fourches, le mage prend l'arête la mieux alignée sur la commande ; une commande ambiguë
// (tout droit devant deux branches symétriques) le laisse sur place : il faut choisir.
const { CONFIG } = M["js/config.js"];

const PORTEE_SAUT = 190;     // distance maximale jusqu'à la carte qu'on veut sauter
const RECEPTION = 80;              // distance parcourue après la carte, à l'atterrissage
const VITESSE_SAUT = 300;

function geometrie(chemin, p, q) {
  const A = chemin.noeuds[p], B = chemin.noeuds[q];
  const dx = (B.x - A.x) * CONFIG.ecartVoies, da = B.a - A.a;
  const L = Math.hypot(dx, da) || 1;
  return { L, ux: dx / L, ua: da / L };
}

class Mage {
  constructor(chemin) {
    this.noeud = chemin.depart;
    this.vers = null;
    this.t = 0;
    this.phase = 0;        // animation de marche
    this.saut = null;      // { cible, restant, total }
    this.fourche = false;  // arrêté devant une fourche, sans direction claire
  }

  position(chemin) {
    const A = chemin.noeuds[this.noeud];
    if (this.vers == null) return { x: A.x, a: A.a };
    const B = chemin.noeuds[this.vers];
    return { x: A.x + (B.x - A.x) * this.t, a: A.a + (B.a - A.a) * this.t };
  }

  /** Hauteur du saut en cours, de 0 à 1. */
  hauteur() { return this.saut ? Math.sin(Math.PI * (1 - this.saut.restant / this.saut.total)) : 0; }

  /** Carte que le mage peut sauter maintenant : la prochaine carte libre devant lui, à portée. */
  cibleSaut(chemin) {
    let de = this.noeud, vers = this.vers, distance = 0;
    if (vers == null) {
      const outs = chemin.suivants[de];
      if (outs.length !== 1) return null;
      vers = outs[0];
    } else distance = -this.t * geometrie(chemin, de, vers).L;
    // on suit le chemin tant qu'il est unique, jusqu'à la première carte libre
    for (let i = 0; i < 4; i++) {
      distance += geometrie(chemin, de, vers).L;
      if (distance > PORTEE_SAUT) return null;
      const n = chemin.noeuds[vers];
      if (n.carte != null && n.etat === "libre") return { noeud: vers, distance };
      if (n.porte != null || n.arrivee) return null;
      const outs = chemin.suivants[vers];
      if (outs.length !== 1) return null;
      de = vers; vers = outs[0];
    }
    return null;
  }

  /** Lance un saut. Renvoie la cible (nœud) ou null s'il n'y a rien à sauter (le mage saute quand même, pour rien). */
  sauter(chemin) {
    if (this.saut) return null;
    const c = this.cibleSaut(chemin);
    const total = c ? c.distance + RECEPTION : 90;
    if (this.vers == null) {
      const outs = chemin.suivants[this.noeud];
      if (outs.length === 1) { this.vers = outs[0]; this.t = 0; }
    }
    this.saut = { cible: c ? c.noeud : null, restant: total, total, aplace: this.vers == null };
    return c ? c.noeud : null;
  }

  /**
   * Avance le mage de `dt` secondes. `auto` : null (commande du joueur), { mode: 'hasard', rng }
   * (l'eau le porte) ou { mode: 'route', route: [nœuds] } (le joueur a cliqué une destination).
   * Renvoie { distance, arrivees: [{ noeud, enSaut }] }.
   */
  avancer(dt, commande, vitesse, chemin, auto = null) {
    const res = { distance: 0, arrivees: [] };
    this.fourche = false;

    if (this.saut) {
      const d = Math.min(this.saut.restant, Math.max(vitesse, VITESSE_SAUT) * dt);
      this.saut.restant -= d;
      if (!this.saut.aplace) this.deplacer(d, chemin, res, outs => (outs.length === 1 ? outs[0] : null), this.saut.cible);
      res.distance = d;
      if (this.saut.restant <= 0) this.saut = null;
      this.phase += dt * 6;
      return res;
    }
    if (vitesse <= 0) return res;

    const d = vitesse * dt;
    if (auto) {
      const choisir = auto.mode === "route"
        ? outs => { const k = outs.find(o => o === auto.route[0]); return k ?? null; }
        : outs => outs[Math.floor(auto.rng() * outs.length)];
      res.distance = this.deplacer(d, chemin, res, choisir, null, auto.mode === "route" ? auto.route : null);
      this.phase += res.distance / 22;
      return res;
    }

    const n = Math.hypot(commande.dx, commande.dy);
    if (n < 0.2) return res;
    const cx = commande.dx / n, ca = commande.dy / n;

    if (this.vers == null) {
      const outs = chemin.suivants[this.noeud];
      if (!outs.length) return res;
      const notes = outs.map(o => { const g = geometrie(chemin, this.noeud, o); return { o, s: g.ux * cx + g.ua * ca }; }).sort((p, q) => q.s - p.s);
      if (notes[0].s < 0.3) { this.fourche = outs.length > 1 && ca > 0; return res; }
      if (notes.length > 1 && notes[0].s - notes[1].s < 0.12) { this.fourche = true; return res; }
      this.vers = notes[0].o; this.t = 0;
    }
    const g = geometrie(chemin, this.noeud, this.vers);
    const s = g.ux * cx + g.ua * ca;
    if (s > 0.2) {
      res.distance = this.deplacer(d, chemin, res, () => null);
    } else if (s < -0.2) {
      // retour en arrière sur l'arête, jamais au-delà du nœud quitté
      const recul = Math.min(d, this.t * g.L);
      this.t -= recul / g.L;
      res.distance = recul;
      if (this.t <= 0.0001) { this.t = 0; this.vers = null; }
    }
    this.phase += res.distance / 22;
    return res;
  }

  /** Avance de `d` le long du chemin ; `choisir(outs)` désigne l'arête à prendre à un nœud (null : s'arrêter). */
  deplacer(d, chemin, res, choisir, cibleSaut = null, route = null) {
    let parcouru = 0;
    while (d > 1e-6) {
      if (this.vers == null) {
        const outs = chemin.suivants[this.noeud];
        const s = outs.length ? choisir(outs) : null;
        if (s == null) break;
        this.vers = s; this.t = 0;
        if (route && route[0] === s) route.shift();
      }
      const g = geometrie(chemin, this.noeud, this.vers);
      const reste = (1 - this.t) * g.L;
      if (d < reste) { this.t += d / g.L; parcouru += d; d = 0; break; }
      d -= reste; parcouru += reste;
      this.noeud = this.vers; this.vers = null; this.t = 0;
      res.arrivees.push({ noeud: this.noeud, enSaut: cibleSaut != null && this.noeud === cibleSaut });
      if (!cibleSaut && !route) break;   // à pied, on s'arrête sur chaque nœud (la carte se lit)
      if (route && !route.length) break;
      if (chemin.noeuds[this.noeud].carte != null && this.noeud !== cibleSaut) break;
    }
    return parcouru;
  }
}

return { PORTEE_SAUT, Mage };
})();

// ===== js/engine/partie.js =====
M["js/engine/partie.js"] = (() => {
// Une partie du Chemin : le mage, le chemin, l'état, et tout ce qui se passe quand il marche.
// Module pur (aucun accès au DOM) : le jeu (js/main.js) et le simulateur (tests/simulateur.mjs) s'en servent
// tous les deux, pour que les tests vérifient exactement ce que joue le joueur.
//
// La partie avance par `avancer(p, dt, commande)` et renvoie des événements que l'interface met en scène.
// Quand une décision du joueur est nécessaire, `p.attente` est rempli ; `resoudre(p, reponse)` y répond :
//   { kind: 'choix', id }          carte à choix (Destinée, Hazard…) : réponse = index du choix
//   { kind: 'retenir', region, candidats }  porte de région : la carte retenue pour le tirage (numéro)
//   { kind: 'enigme', enigme }     énigme de la porte : réponse = index de l'option
const { REGIONS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { creerHasard } = M["js/engine/hasard.js"];
const { creerEtat, multiplicateurVitesse, avancerTemps, vue, peutSauter, usureCourante } = M["js/engine/state.js"];
const { construireChemin, rangs, injoignables, cheminVers, noeudDeCarte, bouleverser, distanceJusqua, longueurArete } = M["js/engine/chemin.js"];
const { rencontrer, contourner, etatArrivee, survoler, sauter, coutSaut, variation } = M["js/engine/effects.js"];
const { valence } = M["js/engine/valeurs.js"];
const { poserEnigme } = M["js/engine/enigmes.js"];
const { noterEnigme } = M["js/engine/carnet.js"];
const { Mage } = M["js/game/player.js"];

const RECOMPENSE_ENIGME = { vue: 2, fortune: 10 };

function creerPartie(graine, consultant = "homme", { regions = 7, carnet = null } = {}) {
  const chemin = construireChemin(creerHasard(graine), { regions });
  return {
    graine, consultant, chemin, carnet,
    etat: creerEtat(consultant),
    mage: new Mage(chemin),
    rng: { effets: creerHasard(graine + 7), eau: creerHasard(graine + 13), enigme: creerHasard(graine + 29) },
    parcourus: new Set([chemin.depart]),
    vues: new Set(),          // cartes vues face visible pendant la partie
    retenues: [],             // le tirage composé : { region, id }, une carte par région planétaire
    enigmes: { posees: 0, reussies: 0 },
    route: null, cible: null, // marche vers une carte désignée
    file: [], attente: null,
    finDemandee: false, fini: false,
    cacheValences: { cle: "", valeurs: new Map() }
  };
}

/** Région dont le monde a l'apparence (la lunaison de Changement en emprunte une autre). */
function regionAffichee(p) { return p.etat.lunaisonRegion ?? p.etat.region; }
const vitesse = p => REGIONS[regionAffichee(p)].vitesse * multiplicateurVitesse(p.etat);

/** Fait marcher le mage `dt` secondes. `commande` : { dx, dy }. Renvoie des événements. */
function avancer(p, dt, commande) {
  const ev = [];
  if (p.attente || p.fini) return ev;
  const { etat, mage, chemin } = p;
  let auto = null;
  if (etat.minuteurs.passivite > 0) { auto = { mode: "hasard", rng: p.rng.eau }; p.route = null; p.cible = null; }
  else if (p.route) auto = { mode: "route", route: p.route };
  const v = etat.minuteurs.retrait > 0 ? 0 : vitesse(p);
  const res = mage.avancer(dt, commande, v, chemin, auto);
  for (const m of avancerTemps(etat, dt, res.distance > 0)) ev.push({ type: "temps", texte: m.texte, source: m.source });
  for (const a of res.arrivees) { ev.push(...arriver(p, a)); if (p.attente || p.fini) break; }
  if (p.route && !p.route.length) { p.route = null; p.cible = null; }
  ev.push(...verifierFin(p));
  return ev;
}

/** Le joueur reprend la main : la marche automatique s'arrête. */
function reprendreMain(p) { p.route = null; p.cible = null; }

/** Conduire le mage vers un nœud (clic sur une carte). */
function allerVers(p, noeud) {
  const route = cheminVers(p.chemin, p.mage.vers ?? p.mage.noeud, noeud);
  p.route = route; p.cible = route ? noeud : null;
  return !!route;
}

/** Saut demandé. Renvoie { ok, raison }. */
function demanderSaut(p) {
  const { etat, mage, chemin } = p;
  if (p.attente || p.fini) return { ok: false };
  if (!peutSauter(etat)) return { ok: false, raison: etat.minuteurs.passivite > 0 ? "L’eau vous porte" : "Impossible de sauter" };
  const c = mage.cibleSaut(chemin);
  if (c && coutSaut(etat, chemin.noeuds[c.noeud].carte) >= etat.energie) return { ok: false, raison: "Trop épuisé pour sauter" };
  reprendreMain(p);
  mage.sauter(chemin);
  return { ok: true, cible: c?.noeud ?? null };
}

function arriver(p, { noeud, enSaut }) {
  const { chemin, etat } = p;
  const ev = [];
  const n = chemin.noeuds[noeud];
  p.parcourus.add(noeud);
  if (n.porte != null && n.porte !== etat.region) {
    const quittee = etat.region;
    etat.region = n.porte;
    ev.push({ type: "region", region: n.porte });
    if (quittee >= 1) preparerPorte(p, quittee, true);
  }
  for (const k of injoignables(chemin, noeud)) {
    const m = chemin.noeuds[k];
    m.etat = "contournee";
    const avant = gainDepuis(etat);
    const messages = contourner(etat, m.carte, p.rng.effets);
    ev.push({ type: "laissee", id: m.carte, noeud: k, messages, gain: avant() });
  }
  if (n.carte != null && n.etat === "libre") {
    if (enSaut) {
      n.etat = "sautee";
      const avant = gainDepuis(etat);
      const messages = sauter(etat, n.carte, p.rng.effets);
      ev.push({ type: "sautee", id: n.carte, noeud, messages, gain: avant() });
    } else ev.push(...vivre(p, n, n.carte));
  }
  if (n.arrivee) { preparerPorte(p, etat.region, false); p.finDemandee = true; }
  poursuivre(p);
  return ev;
}

const gainDepuis = etat => {
  const e = etat.energie, f = etat.fortune;
  return () => ({ energie: Math.round(etat.energie - e), fortune: Math.round(etat.fortune - f) });
};

/** À une porte : retenir une carte de la région quittée, puis (sauf à l'arrivée) une énigme. */
function preparerPorte(p, region, enigme) {
  const vecues = [...new Set(p.etat.historique.filter(h => h.region === region && !h.ignoree && !h.remplacee).map(h => h.id))];
  if (vecues.length) p.file.push({ kind: "retenir", region, candidats: vecues });
  if (!enigme) return;
  const vus = p.chemin.noeuds.filter(n => n.region === region && n.carte != null && (p.vues.has(n.carte) || n.etat !== "libre")).map(n => n.carte);
  const e = poserEnigme(vus, p.rng.enigme, p.carnet?.aRevoir);
  if (e) p.file.push({ kind: "enigme", enigme: e });
}

function vivre(p, n, id) {
  const quoi = etatArrivee(p.etat, id);
  if (quoi === "survolee") {
    if (n) n.etat = "survolee";
    return [{ type: "survolee", id, noeud: n?.id, messages: survoler(p.etat, id) }];
  }
  if (quoi === "choix") { p.file.unshift({ kind: "choix", id, noeud: n ? n.id : null }); return []; }
  return appliquer(p, n, id, null);
}

function appliquer(p, n, id, choix) {
  const { etat, chemin } = p;
  const avant = gainDepuis(etat);
  const retour = n != null && (n.etat === "contournee" || n.etat === "sautee");
  const region = etat.region;
  const res = rencontrer(etat, id, choix, p.rng.effets, {
    region, retour,
    bouleverser: () => bouleverser(chemin, region, p.mage.noeud, p.rng.effets)
  });
  if (n) n.etat = res.entree.ignoree ? "fermee" : "vecue";
  const titre = res.entree.ignoree ? "Carte fermée" : retour ? "Carte revenue" : "Carte vécue";
  const ev = [{ type: "vecue", id, noeud: n?.id, messages: res.messages, regles: res.regles, entree: res.entree, gain: avant(), titre }];
  if (res.retour != null && !etat.termine) ev.push(...vivre(p, noeudDeCarte(chemin, res.retour), res.retour));
  return ev;
}

function poursuivre(p) {
  if (!p.attente && p.file.length) p.attente = p.file.shift();
}

function verifierFin(p) {
  if (p.fini) return [];
  const { etat } = p;
  if (etat.termine && !etat.victoire) { p.fini = true; p.file = []; p.attente = null; return [{ type: "fin", victoire: false }]; }
  if (p.finDemandee && !p.attente && !p.file.length) {
    etat.victoire = true; etat.termine = true; p.fini = true;
    return [{ type: "fin", victoire: true }];
  }
  return [];
}

/** Répond à l'attente en cours. Renvoie des événements. */
function resoudre(p, reponse) {
  const a = p.attente;
  if (!a) return [];
  p.attente = null;
  let ev = [];
  if (a.kind === "choix") {
    const n = a.noeud != null ? p.chemin.noeuds[a.noeud] : null;
    ev = appliquer(p, n, a.id, reponse);
  } else if (a.kind === "retenir") {
    const id = a.candidats.includes(reponse) ? reponse : a.candidats[0];
    p.retenues.push({ region: a.region, id });
    ev = [{ type: "retenue", region: a.region, id }];
  } else if (a.kind === "enigme") {
    const e = a.enigme, reussie = reponse === e.bonne;
    p.enigmes.posees++;
    const messages = [];
    if (reussie) {
      p.enigmes.reussies++;
      p.etat.reveler = Math.max(p.etat.reveler, RECOMPENSE_ENIGME.vue);
      messages.push("La porte s’ouvre en grand : la route se révèle.", variation(p.etat, "fortune", RECOMPENSE_ENIGME.fortune));
    } else messages.push("La porte s’ouvre quand même. Cette carte reviendra dans vos énigmes.");
    if (p.carnet) noterEnigme(p.carnet, e.carte, reussie);
    ev = [{ type: "enigme", reussie, enigme: e, messages }];
  }
  poursuivre(p);
  ev.push(...verifierFin(p));
  return ev;
}

/**
 * Ce que voit le mage : rangs, faces visibles, cartes « devant vous », marques du discernement,
 * fils d'or (règles déjà découvertes dans le carnet), cartes vues pour la première fois.
 */
function regarder(p) {
  const { chemin, etat, mage } = p;
  const atteints = rangs(chemin, mage.noeud, mage.vers);
  const portee = vue(etat);
  const faces = new Map(), nouvelles = [];
  for (const n of chemin.noeuds) {
    if (n.carte == null) continue;
    if (n.etat !== "libre") { faces.set(n.id, "face"); continue; }
    const c = CARTE_PAR_ID[n.carte], rang = atteints.get(n.id);
    const visible = rang != null && (c.declaree || (!c.surprise && rang <= portee));
    faces.set(n.id, visible ? "face" : "dos");
    if (visible && !p.vues.has(n.carte)) { p.vues.add(n.carte); nouvelles.push(n.carte); }
  }

  const devant = [];
  for (const [id, f] of faces) {
    const n = chemin.noeuds[id];
    if (f !== "face" || n.etat !== "libre" || !atteints.has(id)) continue;
    const rang = atteints.get(id);
    if (rang > Math.max(portee, 1) + (CARTE_PAR_ID[n.carte].declaree ? 2 : 0)) continue;
    const cote = rang > 1 ? `plus loin (rang ${rang})` : n.tronc ? "sur le tronc" : n.x < 0 ? "à gauche" : "à droite";
    devant.push({ noeud: id, id: n.carte, rang, cote, x: n.x });
  }
  devant.sort((a, b) => a.rang - b.rang || a.x - b.x);

  let valences = new Map();
  if (etat.minuteurs.discernement > 0) {
    const visibles = [...faces].filter(([id, f]) => f === "face" && chemin.noeuds[id].etat === "libre").map(([id]) => id);
    const cle = `${visibles.join(",")}|${Math.round(etat.energie / 5)}|${etat.fortune}|${etat.boucliers}`;
    if (cle !== p.cacheValences.cle) p.cacheValences = { cle, valeurs: new Map(visibles.map(id => [id, valence(etat, chemin.noeuds[id].carte)])) };
    valences = p.cacheValences.valeurs;
  }

  const fils = [];
  if (p.carnet) for (const rv of chemin.rendezVous) {
    if (!p.carnet.regles[rv.regle]) continue;
    const [a, b] = rv.cartes.map(id => noeudDeCarte(chemin, id));
    if (a && b && a.etat === "libre" && b.etat === "libre" && (faces.get(a.id) === "face" || faces.get(b.id) === "face")) fils.push({ a: a.id, b: b.id, regle: rv.regle });
  }
  return { atteints, faces, devant, valences, fils, nouvelles, portee };
}

/** Énergie qu'il faudra pour atteindre la prochaine porte (ou l'arrivée), au pas actuel. */
function besoinEnergie(p) {
  const { chemin, mage, etat } = p;
  let d = 0, depuis = mage.noeud;
  if (mage.vers != null) { d = (1 - mage.t) * longueurArete(chemin, mage.noeud, mage.vers); depuis = mage.vers; }
  const n0 = chemin.noeuds[depuis];
  const reste = n0.porte != null && n0.porte !== etat.region || n0.arrivee ? 0 : distanceJusqua(chemin, depuis, n => (n.porte != null && n.porte !== etat.region) || n.arrivee);
  if (reste == null) return 0;
  const v = Math.max(1, vitesse(p) || REGIONS[regionAffichee(p)].vitesse);
  return Math.max(0, Math.ceil((d + reste) / v * usureCourante(etat)));
}


return { RECOMPENSE_ENIGME, creerPartie, regionAffichee, avancer, reprendreMain, allerVers, demanderSaut, resoudre, regarder, besoinEnergie };
})();

// ===== js/engine/lecture.js =====
M["js/engine/lecture.js"] = (() => {
// Lecture du tirage formé par la partie. Module pur.
// Le tirage composé : à chaque porte, le joueur retient une carte de la région quittée ; ces cartes, une par
// planète, forment le tirage final, lu dans l'ordre, avec les voisinages de Belline entre cartes retenues.
// Suit la grammaire de l'encyclopédie : le significateur (l'Étoile du consultant) et ce qu'il reçoit,
// l'influence (l'autre Étoile), la carte que La Destinée met au premier plan, les règles de voisinage
// réunies, les cartes fortes vécues, puis la séquence région par région.
const { CONFIG, REGIONS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { VOISINAGE, reglesDeclenchees } = M["js/data/voisinage.js"];

const REGLE_PAR_ID = Object.fromEntries(VOISINAGE.map(r => [r.id, r]));

/** Score : fortune + énergie restante + points par règle de Belline réunie, en chemin et dans le tirage (+ 50 si le cycle est accompli). */
function score(etat, retenues = []) {
  const regles = etat.historique.reduce((n, h) => n + h.regles.length, 0) + accordsDuTirage(etat, retenues).length;
  return Math.round(etat.fortune + etat.energie + CONFIG.pointsParRegle * regles + (etat.victoire ? 50 : 0));
}

/** Règles de Belline entre cartes retenues voisines dans le tirage. */
function accordsDuTirage(etat, retenues) {
  const entree = id => { const h = [...etat.historique].reverse().find(x => x.id === id); return { id, choix: h ? h.choix : null }; };
  const accords = [];
  for (let i = 1; i < retenues.length; i++) {
    for (const r of reglesDeclenchees(entree(retenues[i - 1].id), entree(retenues[i].id))) accords.push({ id: r.id, texte: r.texte, positions: [i - 1, i] });
  }
  return accords;
}

function etoile(etat, idEtoile) {
  const i = etat.historique.findIndex(h => h.id === idEtoile);
  if (i < 0) return { etoile: idEtoile, rencontree: false };
  const e = etat.historique[i];
  return { etoile: idEtoile, rencontree: true, ignoree: e.ignoree, remplacee: !!e.remplacee, recu: e.recu ?? null };
}

function lireTirage(etat, retenues = []) {
  const vecues = etat.historique;
  const lecture = { significateur: null, influence: null, premierPlan: null, regles: [], fortes: [], parRegion: [] };

  if (etat.consultant) {
    const moi = etat.consultant === "homme" ? 2 : 3, autre = moi === 2 ? 3 : 2;
    lecture.significateur = etoile(etat, moi);
    lecture.influence = etoile(etat, autre);
  }

  const iDest = vecues.findIndex(h => h.id === 1 && !h.ignoree);
  if (iDest >= 0) {
    const d = vecues[iDest];
    lecture.premierPlan = { ouverte: d.choix === 0, carte: vecues[iDest + 1]?.id ?? null };
  }

  vecues.forEach((h, i) => {
    for (const id of h.regles) lecture.regles.push({ id, texte: REGLE_PAR_ID[id].texte, cartes: [vecues[i - 1]?.id, h.id] });
    if (CARTE_PAR_ID[h.id].forte && !h.ignoree) lecture.fortes.push(h.id);
  });

  REGIONS.forEach((r, i) => {
    const entrees = vecues.filter(h => h.region === i);
    if (entrees.length) lecture.parRegion.push({ region: i, entrees });
  });

  lecture.tirage = retenues.map((r, i) => ({ position: i, region: r.region, id: r.id }));
  lecture.accords = accordsDuTirage(etat, retenues);
  lecture.bilan = {
    vecues: vecues.length,
    laissees: etat.contournees.length + etat.sautees.length + etat.survolees.length,
    fortune: etat.fortune,
    energie: Math.round(etat.energie),
    score: score(etat, retenues)
  };
  return lecture;
}

return { score, accordsDuTirage, lireTirage };
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

// ===== js/render/renderer.js =====
M["js/render/renderer.js"] = (() => {
// Dessin du chemin vu de dessus : il monte de bas en haut, la caméra suit le mage.
// Le canvas s'adapte à sa taille d'affichage et à la densité de l'écran (devicePixelRatio).
const { CONFIG, REGIONS, COULEURS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { dessinerChien } = M["js/render/illustrations.js"];
const { dessinerFace, dessinerDos, arrondi, hexA } = M["js/render/carte.js"];

const CL = CONFIG.carteL, CH = CONFIG.carteH;

/** Abscisse logique d'une voie. */
const xVoie = x => CONFIG.largeurMonde / 2 + x * CONFIG.ecartVoies;

// Hasard fixe pour les décors (le même à chaque image)
const bruit = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

class Rendu {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.camA = null;
    this.zones = [];          // rectangles des cartes à l'écran, pour le clic : { noeud, x, y, l, h }
    this.flottants = [];      // textes qui s'envolent du mage
    this.particules = [];     // éclats : { x, a, vx, vy, vie, couleur }
    this.revelation = null;   // carte vécue montrée en grand : { id, vie, couleur }
    this.bandeau = null;      // { texte, sous, vie }
    this.secousse = 0;
    this.temps = 0;
    this.mouvementReduit = false;
    this.ajuster();
  }

  ajuster() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const l = Math.max(1, r.width), h = Math.max(1, r.height);
    this.k = l / CONFIG.largeurMonde;
    this.W = CONFIG.largeurMonde;
    // sur un écran étroit, les cartes grandissent (leur nom et leur mot-clé restent lisibles), le chemin ne bouge pas
    this.loupe = l < 520 ? 1.18 : 1;
    this.H = h / this.k;
    this.canvas.width = Math.round(l * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.dpr = dpr;
  }

  versLogique(px, py) { return { x: px / this.k, y: py / this.k }; }
  y(a) { return this.H * 0.7 - (a - this.camA); }

  flotter(texte, couleur, pos) { this.flottants.push({ texte, couleur, x: pos.x, a: pos.a, vie: 1.8, decalage: this.flottants.length }); }
  annoncer(texte, sous = "") { this.bandeau = { texte, sous, vie: 2.6 }; }

  /** Une carte vécue apparaît en grand ; éclats d'or (favorable) ou de braise (néfaste). */
  reveler(id, signe, pos) {
    const couleur = signe > 0 ? "#f3d58a" : signe < 0 ? "#ff8a5c" : "#e9e2d0";
    this.revelation = { id, vie: this.mouvementReduit ? 0.9 : 1.15, couleur };
    this.eclater(pos, couleur, signe < 0 ? 22 : 26);
    if (signe < 0 && !this.mouvementReduit) this.secousse = 0.25;
  }
  eclater(pos, couleur, n = 24) {
    if (this.mouvementReduit) return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, v = 60 + Math.random() * 140;
      this.particules.push({ x: xVoie(pos.x), a: pos.a + 26, vx: Math.cos(ang) * v, va: Math.sin(ang) * v + 60, vie: 0.6 + Math.random() * 0.6, couleur });
    }
  }

  /** v : { p (partie), vue (regarder), dt } */
  dessiner(v) {
    const c = this.ctx, { p, vue } = v, { chemin, mage, etat } = p;
    this.temps += v.dt;
    const pos = mage.position(chemin);
    if (this.camA == null || this.mouvementReduit) this.camA = pos.a;
    else this.camA += (pos.a - this.camA) * Math.min(1, v.dt * 6);
    const aMin = this.camA - this.H * 0.35, aMax = this.camA + this.H * 0.75;

    c.setTransform(this.dpr * this.k, 0, 0, this.dpr * this.k, 0, 0);
    c.save();
    if (this.secousse > 0) { this.secousse -= v.dt; c.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4); }
    this.fond(c, p, aMin, aMax);
    this.aretes(c, p, vue, aMin, aMax);
    this.zones = [];
    for (const n of chemin.noeuds) {
      if (n.a < aMin - CH || n.a > aMax + CH) continue;
      if (n.porte != null) this.porte(c, n, pos);
      else if (n.depart) this.etiquette(c, xVoie(0), this.y(n.a) + 62, "Départ");
      else if (n.arrivee) this.arrivee(c, n);
    }
    this.fils(c, p, vue);
    for (const n of chemin.noeuds) if (n.carte != null && n.a > aMin - CH && n.a < aMax + CH) this.carte(c, n, vue);
    if (p.cible != null) this.marqueCible(c, chemin.noeuds[p.cible]);
    this.fleches(c, p);
    this.dessinerMage(c, mage, etat, pos);
    this.eclats(c, v.dt);
    this.textesFlottants(c, v.dt);
    c.restore();
    this.voiles(c, etat, v.dt);
    this.carteEnGrand(c, v.dt);
  }

  fond(c, p, aMin, aMax) {
    const W = this.W, H = this.H, { chemin, etat } = p;
    c.fillStyle = "#1d1830"; c.fillRect(-10, -10, W + 20, H + 20);
    chemin.regions.forEach((r, i) => {
      if (r.aFin < aMin || r.aDebut > aMax) return;
      const reg = REGIONS[i];
      const haut = this.y(r.aFin), bas = this.y(r.aDebut);
      const g = c.createLinearGradient(0, haut, 0, bas);
      g.addColorStop(0, reg.ciel[0]); g.addColorStop(1, reg.ciel[1]);
      c.fillStyle = g; c.fillRect(-10, haut, W + 20, bas - haut);
      this.decor(c, i, r, aMin, aMax);
      const yg = Math.max(haut + 90, Math.min(bas - 90, H * 0.3));
      c.save(); c.globalAlpha = 0.12; c.fillStyle = reg.accent;
      c.font = "150px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(reg.glyphe, W - 62, yg); c.restore();
    });
    if (etat.lunaisonRegion != null) {
      const reg = REGIONS[etat.lunaisonRegion];
      c.save(); c.globalAlpha = 0.35; c.fillStyle = reg.ciel[0]; c.fillRect(0, 0, W, H); c.restore();
    }
    // vignette
    const v = c.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H * 0.55, H * 0.9);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(10,6,20,0.38)");
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }

  /** Décor de la région : des motifs semés (purement décoratifs, aux couleurs de la planète). */
  decor(c, i, r, aMin, aMax) {
    const reg = REGIONS[i];
    const pas = 90;
    const debut = Math.max(r.aDebut, Math.floor(aMin / pas) * pas), fin = Math.min(r.aFin, aMax);
    c.save();
    for (let a = debut; a < fin; a += pas) {
      for (const cote of [-1, 1]) {
        const s = a * 0.013 + cote * 7 + i * 31;
        if (bruit(s) < 0.45) continue;
        const x = cote < 0 ? 18 + bruit(s + 1) * 38 : this.W - 18 - bruit(s + 1) * 38;
        const y = this.y(a + bruit(s + 2) * pas);
        const t = 0.55 + bruit(s + 3) * 0.7;
        c.globalAlpha = 0.28 + bruit(s + 4) * 0.25;
        motif(c, reg.famille, x, y, 14 * t, reg.accent, reg.sol, this.temps + s);
      }
    }
    c.restore();
  }

  aretes(c, p, vue, aMin, aMax) {
    const { chemin, mage, parcourus } = p;
    c.save(); c.lineCap = "round"; c.lineJoin = "round";
    for (const passe of [0, 1, 2, 3]) {
      for (const n of chemin.noeuds) {
        for (const s of chemin.suivants[n.id]) {
          const m = chemin.noeuds[s];
          if (Math.max(n.a, m.a) < aMin || Math.min(n.a, m.a) > aMax) continue;
          const x1 = xVoie(n.x), y1 = this.y(n.a), x2 = xVoie(m.x), y2 = this.y(m.a);
          const marche = parcourus.has(n.id) && parcourus.has(s);
          const ouvert = marche || vue.atteints.has(s) || mage.vers === s;
          const sol = REGIONS[n.region].sol;
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
          if (passe === 0) { c.globalAlpha = ouvert ? 0.6 : 0.16; c.strokeStyle = "#1c1424"; c.lineWidth = 36; c.stroke(); }
          else if (passe === 1) { c.globalAlpha = ouvert ? 1 : 0.28; c.strokeStyle = sol; c.lineWidth = 28; c.stroke(); }
          else if (passe === 2) { c.globalAlpha = ouvert ? 0.35 : 0.1; c.strokeStyle = "#fff8e4"; c.lineWidth = 12; c.stroke(); }
          else if (marche) { c.globalAlpha = 0.95; c.strokeStyle = COULEURS.or; c.lineWidth = 3; c.setLineDash([2, 9]); c.stroke(); c.setLineDash([]); }
        }
      }
    }
    c.restore();
  }

  porte(c, n, pos) {
    const reg = REGIONS[n.porte], x = xVoie(0), y = this.y(n.a);
    // les battants s'ouvrent quand le mage approche
    const ouverture = Math.max(0, Math.min(1, 1 - (n.a - pos.a - 40) / 260));
    c.save();
    c.fillStyle = hexA("#000000", 0.25); c.fillRect(x - 52, y - 4, 104, 8);
    for (const s of [-1, 1]) {
      const l = 40 * (1 - ouverture * 0.85);
      c.fillStyle = "#5a3a1c"; c.strokeStyle = "#2a1a0c"; c.lineWidth = 1.5;
      c.fillRect(s < 0 ? x - 40 : x + 40 - l, y - 46, l, 46); c.strokeRect(s < 0 ? x - 40 : x + 40 - l, y - 46, l, 46);
      c.fillStyle = reg.accent; c.fillRect(x + s * 48 - 7, y - 58, 14, 62);
      c.strokeStyle = COULEURS.encre; c.strokeRect(x + s * 48 - 7, y - 58, 14, 62);
    }
    c.beginPath(); c.arc(x, y - 58, 55, Math.PI, 0); c.lineWidth = 10; c.strokeStyle = reg.accent; c.stroke();
    c.lineWidth = 2; c.strokeStyle = COULEURS.or; c.beginPath(); c.arc(x, y - 58, 60, Math.PI, 0); c.stroke();
    c.fillStyle = COULEURS.or; c.font = "22px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(reg.glyphe, x, y - 92);
    c.fillStyle = "rgba(253,248,236,.95)"; c.strokeStyle = COULEURS.or; c.lineWidth = 1.5;
    arrondi(c, x + 62, y - 44, 140, 28, 8); c.fill(); c.stroke();
    c.fillStyle = COULEURS.bordeaux; c.font = "bold 13px 'Cinzel', serif";
    c.fillText(`${reg.glyphe} ${reg.nom}`, x + 132, y - 30);
    c.restore();
  }

  arrivee(c, n) {
    const x = xVoie(0), y = this.y(n.a);
    c.save();
    const g = c.createRadialGradient(x, y - 30, 4, x, y - 30, 90);
    g.addColorStop(0, "rgba(243,213,138,.75)"); g.addColorStop(1, "rgba(243,213,138,0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y - 30, 90, 0, Math.PI * 2); c.fill();
    this.etiquette(c, x, y - 30, "Le cycle des sept planètes");
    c.restore();
  }

  etiquette(c, x, y, texte) {
    c.save(); c.font = "bold 13px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    const l = c.measureText(texte).width + 22;
    c.fillStyle = "rgba(253,248,236,.95)"; c.strokeStyle = COULEURS.or; c.lineWidth = 1.5; arrondi(c, x - l / 2, y - 13, l, 26, 8); c.fill(); c.stroke();
    c.fillStyle = COULEURS.bordeaux; c.fillText(texte, x, y); c.restore();
  }

  /** Fils d'or : deux cartes que relie une règle déjà découverte dans le carnet. */
  fils(c, p, vue) {
    if (!vue.fils.length) return;
    c.save();
    for (const f of vue.fils) {
      const A = p.chemin.noeuds[f.a], B = p.chemin.noeuds[f.b];
      const x1 = xVoie(A.x), y1 = this.y(A.a), x2 = xVoie(B.x), y2 = this.y(B.a);
      const mx = (x1 + x2) / 2 + (A.x === B.x ? 64 * (A.x <= 0 ? 1 : -1) : 0), my = (y1 + y2) / 2;
      c.strokeStyle = "rgba(243,213,138,.9)"; c.lineWidth = 2.5; c.setLineDash([6, 5]);
      c.lineDashOffset = -this.temps * 20;
      c.shadowColor = "#f3d58a"; c.shadowBlur = 8;
      c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2); c.stroke();
      c.setLineDash([]); c.shadowBlur = 0;
      c.fillStyle = "#f3d58a"; c.font = "16px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("✦", (x1 + 2 * mx + x2) / 4, (y1 + 2 * my + y2) / 4);
    }
    c.restore();
  }

  carte(c, n, vue) {
    const carte = CARTE_PAR_ID[n.carte];
    const cx = xVoie(n.x), cy = this.y(n.a);
    const x = cx - CL / 2, y = cy - CH / 2;
    const face = vue.faces.get(n.id) || (n.etat !== "libre" ? "face" : "dos");
    const libre = n.etat === "libre";
    const s = this.loupe || 1;
    this.zones.push({ noeud: n.id, x: cx - CL * s / 2, y: cy - CH * s / 2, l: CL * s, h: CH * s });
    c.save();
    if (s !== 1) { c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy); }
    c.globalAlpha = libre ? 1 : n.etat === "vecue" ? 0.45 : 0.3;
    c.fillStyle = "rgba(0,0,0,0.3)"; arrondi(c, x + 4, y + 6, CL, CH, 9); c.fill();
    if (libre && face === "face" && vue.atteints.get(n.id) === 1) {
      // les cartes à portée immédiate respirent doucement
      c.shadowColor = "rgba(243,213,138,.8)"; c.shadowBlur = this.mouvementReduit ? 10 : 8 + Math.sin(this.temps * 3) * 5;
    }
    if (face === "dos") dessinerDos(c, x, y, REGIONS[n.region].glyphe, n.tronc ? "sur le tronc" : "voilée");
    else dessinerFace(c, carte, x, y);
    c.shadowBlur = 0;
    const val = vue.valences.get(n.id);
    if (libre && face === "face" && val != null) {
      c.fillStyle = val > 0 ? COULEURS.vert : val < 0 ? COULEURS.rouge : COULEURS.or;
      c.beginPath(); c.arc(x + 4, y + 4, 11, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = "#fff"; c.font = "bold 15px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(val > 0 ? "+" : val < 0 ? "−" : "~", x + 4, y + 4);
    }
    c.globalAlpha = 1;
    const marques = { fermee: "fermée", sautee: "sautée", survolee: "survolée", contournee: "laissée" };
    if (marques[n.etat]) marque(c, cx, cy, marques[n.etat]);
    c.restore();
  }

  marqueCible(c, n) {
    const x = xVoie(n.x), y = this.y(n.a);
    c.save(); c.strokeStyle = COULEURS.or; c.lineWidth = 3; c.setLineDash([6, 5]); c.lineDashOffset = -this.temps * 30;
    arrondi(c, x - CL / 2 - 7, y - CH / 2 - 7, CL + 14, CH + 14, 11); c.stroke(); c.restore();
  }

  /** Aux fourches : des flèches vers chaque branche. */
  fleches(c, p) {
    const { chemin, mage } = p;
    if (mage.vers != null || mage.saut) return;
    const outs = chemin.suivants[mage.noeud];
    if (outs.length < 2) return;
    const n = chemin.noeuds[mage.noeud];
    c.save();
    for (const o of outs) {
      const m = chemin.noeuds[o];
      const dx = (m.x - n.x) * CONFIG.ecartVoies, da = m.a - n.a, L = Math.hypot(dx, da);
      const ux = dx / L, uy = -da / L;
      const r = 50 + (this.mouvementReduit ? 0 : Math.sin(this.temps * 5) * 4);
      const px = xVoie(n.x) + ux * r, py = this.y(n.a) + uy * r;
      c.fillStyle = COULEURS.or; c.strokeStyle = COULEURS.encre; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(px + ux * 13, py + uy * 13); c.lineTo(px - uy * 10, py + ux * 10); c.lineTo(px + uy * 10, py - ux * 10); c.closePath(); c.fill(); c.stroke();
    }
    if (mage.fourche) {
      c.font = "bold 14px 'Cinzel', serif"; c.textAlign = "center"; c.fillStyle = COULEURS.creme;
      c.strokeStyle = COULEURS.encre; c.lineWidth = 3;
      const y = this.y(n.a) + 66;
      c.strokeText("Choisissez : ← ou →", xVoie(n.x), y); c.fillText("Choisissez : ← ou →", xVoie(n.x), y);
    }
    c.restore();
  }

  dessinerMage(c, m, etat, pos) {
    const h = m.hauteur();
    const x = xVoie(pos.x), y0 = this.y(pos.a) + 30;
    const y = y0 - h * 48, s = 1 + h * 0.3;
    c.save();
    c.fillStyle = "rgba(0,0,0,0.32)"; c.beginPath(); c.ellipse(x, y0 + 2, 16 * (1 - h * 0.35), 5 * (1 - h * 0.35), 0, 0, Math.PI * 2); c.fill();
    if (etat.minuteurs.compagnon > 0) { c.fillStyle = "#8a5a2b"; c.strokeStyle = "#8a5a2b"; dessinerChien(c, x + 22, y0 + 2, 34, m.phase * 1.4); }
    if (etat.minuteurs.passivite > 0) {
      c.strokeStyle = "rgba(43,95,174,0.85)"; c.lineWidth = 3;
      for (let k = 0; k < 2; k++) {
        c.beginPath();
        for (let i = 0; i <= 6; i++) { const px = x - 30 + i * 10, py = y0 - 2 - k * 7 + Math.sin(i * 1.6 + m.phase * 2 + k) * 3; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
        c.stroke();
      }
    }
    if (etat.suivante.double) {
      const g = c.createRadialGradient(x, y - 30, 4, x, y - 30, 44);
      g.addColorStop(0, "rgba(243,213,138,.6)"); g.addColorStop(1, "rgba(243,213,138,0)");
      c.fillStyle = g; c.beginPath(); c.arc(x, y - 30, 44, 0, Math.PI * 2); c.fill();
    }
    if (etat.boucliers > 0) {
      c.strokeStyle = "rgba(90,140,220,0.85)"; c.lineWidth = 2.5;
      for (let k = 0; k < Math.min(3, etat.boucliers); k++) { c.beginPath(); c.arc(x, y - 28, 34 + k * 5, 0, Math.PI * 2); c.stroke(); }
    }
    if (etat.suivante.survoler) {
      c.strokeStyle = COULEURS.encre; c.lineWidth = 2;
      for (const [dx, dy] of [[-14, -70], [4, -78], [20, -68]]) {
        const bx = x + dx, by = y + dy + Math.sin(m.phase * 3 + dx) * 2;
        c.beginPath(); c.moveTo(bx - 6, by - 3); c.quadraticCurveTo(bx - 3, by - 5, bx, by); c.quadraticCurveTo(bx + 3, by - 5, bx + 6, by - 3); c.stroke();
      }
    }
    c.translate(x, y); c.scale(s, s);
    const p = Math.sin(m.phase) * 4, vent = Math.sin(this.temps * 2.2) * 2;
    // cape
    c.fillStyle = "#4d1019";
    c.beginPath(); c.moveTo(-9, -36); c.quadraticCurveTo(-18 - vent, -14, -15 - vent, -3); c.lineTo(15 + vent, -3); c.quadraticCurveTo(18 + vent, -14, 9, -36); c.closePath(); c.fill();
    c.strokeStyle = COULEURS.encre; c.lineWidth = 4; c.lineCap = "round";
    c.beginPath(); c.moveTo(-6, -6); c.lineTo(-6 + p * 0.4, 0); c.moveTo(6, -6); c.lineTo(6 - p * 0.4, 0); c.stroke();
    const robe = c.createLinearGradient(0, -36, 0, -6);
    robe.addColorStop(0, "#2d5487"); robe.addColorStop(1, COULEURS.bleu);
    c.fillStyle = robe;
    c.beginPath(); c.moveTo(-13, -6); c.lineTo(13, -6); c.lineTo(5, -36); c.lineTo(-5, -36); c.closePath(); c.fill();
    c.strokeStyle = COULEURS.or; c.lineWidth = 1; c.beginPath(); c.moveTo(-12, -9); c.lineTo(12, -9); c.stroke();
    c.strokeStyle = "#2d5487"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-6, -32); c.lineTo(-14 - p * 0.6, -18); c.moveTo(6, -32); c.lineTo(14 + p * 0.6, -18); c.stroke();
    // bâton
    c.strokeStyle = "#7a5530"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(16 + p * 0.6, -16); c.lineTo(19 + p * 0.6, -50); c.stroke();
    c.fillStyle = "#f3d58a"; c.beginPath(); c.arc(19 + p * 0.6, -52, 3.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#e9cfa6"; c.beginPath(); c.arc(0, -41, 7, 0, Math.PI * 2); c.fill();
    if (etat.parure) { c.fillStyle = COULEURS.or; c.beginPath(); c.arc(0, -33, 2.6, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = COULEURS.bordeaux;
    c.beginPath(); c.ellipse(0, -45, 13, 4, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(-8, -46); c.lineTo(8, -46); c.quadraticCurveTo(4, -60, 6 + vent, -72); c.closePath(); c.fill();
    c.fillStyle = COULEURS.or; c.font = "9px serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("★", 1, -55);
    c.restore();
  }

  eclats(c, dt) {
    if (!this.particules.length) return;
    c.save();
    for (const q of this.particules) {
      q.vie -= dt; q.x += q.vx * dt; q.a += q.va * dt; q.va -= 260 * dt;
      c.globalAlpha = Math.max(0, Math.min(1, q.vie * 1.5));
      c.fillStyle = q.couleur;
      c.beginPath(); c.arc(q.x, this.y(q.a), 2.4, 0, Math.PI * 2); c.fill();
    }
    this.particules = this.particules.filter(q => q.vie > 0);
    c.restore();
  }

  textesFlottants(c, dt) {
    c.save(); c.font = "bold 17px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    for (const f of this.flottants) {
      f.vie -= dt;
      const montee = this.mouvementReduit ? 0 : (1.8 - f.vie) * 40;
      const y = this.y(f.a) - 70 - montee - f.decalage * 20;
      c.globalAlpha = Math.max(0, Math.min(1, f.vie));
      c.lineWidth = 3.5; c.strokeStyle = "rgba(30,20,30,0.85)"; c.strokeText(f.texte, xVoie(f.x) + 46, y);
      c.fillStyle = f.couleur; c.fillText(f.texte, xVoie(f.x) + 46, y);
    }
    this.flottants = this.flottants.filter(f => f.vie > 0);
    c.restore();
  }

  voiles(c, etat, dt) {
    const W = this.W, H = this.H, m = etat.minuteurs;
    if (m.aveuglement > 0) {
      const g = c.createRadialGradient(W / 2, H * 0.7, 40, W / 2, H * 0.7, H * 0.8);
      g.addColorStop(0, "rgba(20,16,30,0)"); g.addColorStop(1, "rgba(20,16,30,0.8)");
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    if (m.retrait > 0) {
      c.fillStyle = "rgba(42,36,32,0.42)"; c.fillRect(0, 0, W, H);
      this.etiquette(c, W / 2, H * 0.35, `Retrait : ${m.retrait.toFixed(1)} s`);
    }
    if (this.bandeau) {
      this.bandeau.vie -= dt;
      const b = this.bandeau, t = Math.max(0, Math.min(1, b.vie, (2.6 - b.vie) * 3));
      c.save(); c.globalAlpha = t;
      const y = H * 0.14;
      const g = c.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "rgba(253,248,236,0)"); g.addColorStop(0.2, "rgba(253,248,236,.95)"); g.addColorStop(0.8, "rgba(253,248,236,.95)"); g.addColorStop(1, "rgba(253,248,236,0)");
      c.fillStyle = g; c.fillRect(0, y, W, b.sous ? 70 : 54);
      c.fillStyle = COULEURS.or; c.fillRect(W * 0.2, y, W * 0.6, 1.5); c.fillRect(W * 0.2, y + (b.sous ? 70 : 54) - 1.5, W * 0.6, 1.5);
      c.fillStyle = COULEURS.bordeaux; c.font = "bold 24px 'Cinzel', serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(b.texte, W / 2, y + 27);
      if (b.sous) { c.font = "italic 600 18px 'EB Garamond', serif"; c.fillStyle = COULEURS.bleu; c.fillText(b.sous, W / 2, y + 52); }
      c.restore();
      if (b.vie <= 0) this.bandeau = null;
    }
  }

  carteEnGrand(c, dt) {
    const r = this.revelation;
    if (!r) return;
    r.vie -= dt;
    if (r.vie <= 0) { this.revelation = null; return; }
    const total = this.mouvementReduit ? 0.9 : 1.15;
    const t = 1 - r.vie / total;                    // 0 → 1
    const entree = Math.min(1, t / 0.25), sortie = Math.max(0, (t - 0.7) / 0.3);
    const echelle = 1.6 + 0.4 * (1 - Math.pow(1 - entree, 3)) - sortie * 0.8;
    const retourne = this.mouvementReduit ? 1 : Math.min(1, t / 0.18);   // la carte se retourne
    c.save();
    c.globalAlpha = 1 - sortie;
    c.translate(this.W / 2, this.H * 0.42);
    const g = c.createRadialGradient(0, 0, 10, 0, 0, 150);
    g.addColorStop(0, hexA(r.couleur.length === 7 ? r.couleur : "#f3d58a", 0.55)); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 150, 0, Math.PI * 2); c.fill();
    c.scale(echelle * Math.max(0.05, Math.abs(Math.cos((1 - retourne) * Math.PI / 2))), echelle);
    if (retourne < 0.5 && !this.mouvementReduit) dessinerDos(c, -CL / 2, -CH / 2);
    else dessinerFace(c, CARTE_PAR_ID[r.id], -CL / 2, -CH / 2);
    c.restore();
  }
}

/** Motifs de décor par famille. */
function motif(c, famille, x, y, r, accent, sol, t) {
  c.fillStyle = accent; c.strokeStyle = accent; c.lineWidth = 1.4;
  switch (famille) {
    case "soleil":
      c.beginPath(); c.arc(x, y, r * 0.45, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.2; c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); }
      break;
    case "lune":
      c.beginPath(); c.arc(x, y, r * 0.6, 0.4, Math.PI * 2 - 0.4); c.arc(x + r * 0.3, y, r * 0.45, Math.PI * 2 - 0.6, 0.6, true); c.fill();
      break;
    case "mercure": case "jupiter":
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + (i - 1) * r * 0.55, y + (i % 2) * r * 0.2, r * 0.45, Math.PI, 0); c.fill(); }
      break;
    case "venus":
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; c.beginPath(); c.arc(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4, r * 0.3, 0, Math.PI * 2); c.fill(); }
      break;
    case "mars":
      c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x + r * 0.7, y, x, y + r * 0.4); c.quadraticCurveTo(x - r * 0.7, y, x, y - r); c.fill();
      break;
    case "saturne":
      c.beginPath(); c.ellipse(x, y, r * 0.5, r * 0.5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x, y, r, r * 0.3, -0.3, 0, Math.PI * 2); c.stroke();
      break;
    default:
      c.beginPath(); c.arc(x, y, r * 0.18, 0, Math.PI * 2); c.fill();
  }
}

function marque(c, cx, cy, texte) {
  c.font = "italic 600 15px 'EB Garamond', serif"; c.textAlign = "center"; c.textBaseline = "middle";
  const l = c.measureText(texte).width + 14;
  c.fillStyle = "rgba(30,22,30,0.78)"; arrondi(c, cx - l / 2, cy - 10, l, 20, 6); c.fill();
  c.fillStyle = COULEURS.creme; c.fillText(texte, cx, cy);
}

return { xVoie, Rendu };
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

// ===== js/ui/hud.js =====
M["js/ui/hud.js"] = (() => {
// Tableau de bord : énergie (et ce qu'il faut pour la prochaine porte), fortune, boucliers, région, effets actifs.
const { CONFIG, REGIONS } = M["js/config.js"];

const $ = id => document.getElementById(id);
let dernierActifs = "";

function majHud(etat, region, besoin = 0) {
  const max = CONFIG.energieMax;
  $("jauge-energie").style.width = `${Math.min(100, etat.energie / max * 100)}%`;
  $("jauge-borne").style.width = `${100 - etat.energieMax / max * 100}%`;
  const b = $("jauge-besoin");
  b.style.left = `${Math.min(100, besoin / max * 100)}%`;
  b.classList.toggle("alerte", besoin >= etat.energie);
  b.title = `Il faut environ ${besoin} d’énergie pour atteindre la prochaine porte au pas actuel.`;
  $("val-energie").textContent = `${Math.round(etat.energie)} / ${etat.energieMax}`;
  $("val-besoin").textContent = besoin ? `porte : ${besoin}` : "";
  $("val-besoin").classList.toggle("alerte", besoin >= etat.energie);
  $("val-fortune").textContent = Math.round(etat.fortune);
  $("val-boucliers").textContent = etat.boucliers;
  const reg = REGIONS[region];
  $("nom-region").textContent = `${reg.glyphe} ${reg.nom}`;
  $("bouton-bleue").hidden = !etat.carteBleue;

  const m = etat.minuteurs, s = etat.suivante, actifs = [];
  const t = (nom, v, cl = "") => actifs.push(`<span class="puce ${cl}">${nom} <b>${Math.ceil(v)} s</b></span>`);
  const f = (nom, cl = "") => actifs.push(`<span class="puce ${cl}">${nom}</span>`);
  if (m.retrait > 0) t("Retrait", m.retrait, "mal");
  if (m.ralenti > 0) t("Ralenti", m.ralenti, "mal");
  if (m.accelere > 0) t("Pas vif", m.accelere, "bien");
  if (m.sterilite > 0) t("Stérilité", m.sterilite, "mal");
  if (m.lunaison > 0) t(`Lunaison ${REGIONS[etat.lunaisonRegion]?.glyphe ?? ""}`, m.lunaison);
  if (m.elevation > 0) t("Élévation", m.elevation, "bien");
  if (m.compagnon > 0) t("Le chien", m.compagnon, "bien");
  if (m.passivite > 0) t("Porté par l’eau", m.passivite, "mal");
  if (m.aveuglement > 0) t("Aveuglement", m.aveuglement, "mal");
  if (m.discernement > 0) t("Discernement", m.discernement, "bien");
  if (m.moderation > 0) t("Modération", m.moderation);
  if (m.deperissement > 0) t("Dépérissement", m.deperissement, "mal");
  if (m.regain > 0) t("Affection", m.regain, "bien");
  if (m.feuDePaille > 0) t("Feu de paille", m.feuDePaille);
  if (s.double) f("Prochaine carte doublée", "bien");
  if (s.ignorer) f("Prochaine carte fermée");
  if (s.survoler) f("Envol au-dessus de la prochaine");
  if (s.affaiblir) f("Prochain gain affaibli", "mal");
  if (s.attenuer) f("Prochaine perte atténuée", "bien");
  if (etat.reveler > 0) f(`Vue +${etat.reveler}`, "bien");
  for (const d of etat.differes) t(d.promesse ? "Promesse" : `Espérance +${d.valeur}`, d.restant);
  for (const p of etat.projets) f(`Projet : encore ${p.restantCartes} carte${p.restantCartes > 1 ? "s" : ""}`);
  const html = actifs.join("");
  if (html !== dernierActifs) { $("effets-actifs").innerHTML = html; dernierActifs = html; }
}

/** Le tirage composé en cours : les cartes retenues aux portes. */
function majRetenues(retenues, nomCarte) {
  const el = $("retenues");
  if (!el) return;
  el.innerHTML = retenues.length
    ? retenues.map(r => `<span class="retenue" title="${nomCarte(r.id)}">${REGIONS[r.region].glyphe} ${nomCarte(r.id)}</span>`).join("")
    : "<span class='vide'>Aux portes, vous retiendrez une carte par planète.</span>";
}

return { majHud, majRetenues };
})();

// ===== js/ui/fiche.js =====
M["js/ui/fiche.js"] = (() => {
// Fiche de carte (carte vécue ou aperçu), cartes devant le mage, dialogues (choix, carte retenue, énigme), annonces.
const { REGIONS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { choixPossible } = M["js/engine/effects.js"];
const { peindreDansCanvas } = M["js/render/carte.js"];

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

function peindreCarte(canvas, id, face = true) { peindreDansCanvas(canvas, CARTE_PAR_ID[id], face); }

/** Pastilles : ce que la carte a fait, en un coup d'œil. */
function pastilles(gain = {}, extra = []) {
  const p = [];
  if (gain.energie) p.push(`<span class="pastille ${gain.energie > 0 ? "bon" : "mauvais"}" title="énergie">${gain.energie > 0 ? "+" : ""}${gain.energie} <i>⚡</i></span>`);
  if (gain.fortune) p.push(`<span class="pastille ${gain.fortune > 0 ? "bon" : "mauvais"}" title="fortune">${gain.fortune > 0 ? "+" : ""}${gain.fortune} <i>✦</i></span>`);
  for (const e of extra) p.push(`<span class="pastille neutre">${esc(e)}</span>`);
  return p.join("");
}

function liste(el, messages) {
  el.replaceChildren(...messages.map(m => { const li = document.createElement("li"); li.textContent = m; return li; }));
}

function remplir(carte, titre, ouvrirLecon) {
  $("fiche-titre").textContent = titre;
  peindreCarte($("fiche-dessin"), carte.id);
  $("fiche-numero").textContent = carte.id === 0 ? "Hors jeu d’Edmond" : `N° ${carte.id} · ${REGIONS.find(r => r.famille === carte.famille)?.nom ?? "Les cartes maîtresses"}`;
  $("fiche-nom").textContent = carte.nom;
  $("fiche-image").textContent = `Image : ${carte.image}`;
  $("fiche-notice").textContent = `« ${carte.notice} »`;
  $("fiche-lecon").textContent = carte.lecon || "";
  $("fiche-lecon-bloc").open = !!ouvrirLecon;
  $("fiche").classList.toggle("bleue", carte.id === 0);
  $("fiche").classList.remove("vide");
}

function ouvrir() { $("fiche").classList.add("ouverte"); }
function fermerFiche() { $("fiche").classList.remove("ouverte"); }

/** La carte qui vient d'être vécue (ou sautée, survolée...). */
function montrerVecue(id, messages, { titre = "Carte vécue", nouvelle = false, gain = {}, regles = [] } = {}) {
  const carte = CARTE_PAR_ID[id];
  remplir(carte, nouvelle ? `${titre} · nouvelle au carnet` : titre, nouvelle);
  $("fiche-message").textContent = carte.message;
  $("fiche-pastilles").innerHTML = pastilles(gain, regles.map(r => `Règle : ${r.texte.split(" : ")[1] ?? r.texte}`));
  liste($("fiche-effets"), messages);
  $("fiche-actions").replaceChildren();
  ouvrir();
}

/** Un message qui ne vient pas d'une carte vécue à l'instant (espérance échue, Carte Bleue...). */
function montrerMessage(id, messages, titre, gain = {}) {
  const carte = CARTE_PAR_ID[id];
  remplir(carte, titre, false);
  $("fiche-message").textContent = "";
  $("fiche-pastilles").innerHTML = pastilles(gain);
  liste($("fiche-effets"), messages);
  $("fiche-actions").replaceChildren();
  ouvrir();
}

/** Aperçu d'une carte du chemin ; `onAller` (facultatif) propose d'y conduire le mage. */
function montrerApercu(id, { face, info = "", onAller = null }) {
  if (face !== "face") {
    $("fiche-titre").textContent = "Carte voilée";
    $("fiche-nom").textContent = "Carte voilée";
    $("fiche-numero").textContent = ""; $("fiche-image").textContent = "";
    $("fiche-notice").textContent = "Elle est trop loin pour être lue. Approchez, ou gagnez de la vue (Nativité, Découverte, Intelligence, le chien, une énigme réussie…).";
    $("fiche-lecon").textContent = ""; $("fiche-message").textContent = info;
    $("fiche-pastilles").innerHTML = ""; $("fiche-effets").replaceChildren();
    peindreCarte($("fiche-dessin"), id, false);
    $("fiche").classList.remove("vide", "bleue");
  } else {
    remplir(CARTE_PAR_ID[id], "Aperçu", false);
    $("fiche-message").textContent = CARTE_PAR_ID[id].motCle + (info ? ` · ${info}` : "");
    $("fiche-pastilles").innerHTML = "";
    $("fiche-effets").replaceChildren();
  }
  const actions = $("fiche-actions");
  actions.replaceChildren();
  if (onAller) {
    const b = document.createElement("button");
    b.textContent = "Y conduire le mage";
    b.addEventListener("click", () => { onAller(); fermerFiche(); });
    actions.appendChild(b);
  }
  ouvrir();
}

/** Liste des cartes visibles devant le mage (rang le plus proche d'abord). */
function majDevant(entrees, onClic) {
  const ul = $("devant");
  if (!entrees.length) { ul.innerHTML = "<li class='vide'>Aucune carte en vue.</li>"; return; }
  ul.replaceChildren(...entrees.map(({ noeud, id, cote }) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "ligne-carte";
    const c = CARTE_PAR_ID[id];
    b.innerHTML = `<span class="sym"></span><span class="txt"><b></b><small></small></span><span class="cote"></span>`;
    b.querySelector(".sym").textContent = c.symbole;
    b.querySelector("b").textContent = `${c.id === 0 ? "" : c.id + ". "}${c.nom}`;
    b.querySelector("small").textContent = c.motCle;
    b.querySelector(".cote").textContent = cote;
    b.addEventListener("click", () => onClic(noeud));
    li.appendChild(b);
    return li;
  }));
}

// ---------- Dialogue commun ----------
function dialogue({ titre, texte = "", notice = "", lecon = "", cartes = [], boutons = [] }) {
  const dlg = $("dialogue");
  $("dlg-titre").textContent = titre;
  $("dlg-texte").textContent = texte;
  $("dlg-notice").textContent = notice;
  $("dlg-lecon").textContent = lecon;
  const zc = $("dlg-cartes"); zc.replaceChildren();
  for (const { id, face = true, onClic, legende } of cartes) {
    const el = document.createElement(onClic ? "button" : "div");
    el.className = "dlg-carte";
    const cv = document.createElement("canvas"); peindreCarte(cv, id, face); el.appendChild(cv);
    if (legende) { const s = document.createElement("span"); s.textContent = legende; el.appendChild(s); }
    if (onClic) { el.addEventListener("click", onClic); el.setAttribute("aria-label", CARTE_PAR_ID[id].nom); }
    zc.appendChild(el);
  }
  const zb = $("dlg-boutons"); zb.replaceChildren();
  boutons.forEach((b, i) => {
    const el = document.createElement("button");
    el.textContent = b.label; el.dataset.index = i;
    if (b.desactive) { el.disabled = true; el.title = b.desactive; }
    if (b.classe) el.className = b.classe;
    el.addEventListener("click", ev => { ev.stopPropagation(); b.action(); });
    zb.appendChild(el);
  });
  dlg.classList.add("visible");
  (zb.querySelector("button:not([disabled])") || zc.querySelector("button"))?.focus();
}
function fermerDialogue() { $("dialogue").classList.remove("visible"); }
function dialogueOuvert() { return $("dialogue").classList.contains("visible"); }

/** Carte à choix (Destinée, Hazard...). Résout l'index choisi. */
function demanderChoix(id, etat) {
  const carte = CARTE_PAR_ID[id];
  return new Promise(resolve => dialogue({
    titre: `${carte.id === 0 ? "" : carte.id + ". "}${carte.nom}`,
    texte: carte.message, notice: `« ${carte.notice} »`, lecon: carte.lecon,
    cartes: [{ id }],
    boutons: carte.choix.map((ch, i) => ({
      label: `${i + 1}. ${ch.label}`,
      desactive: choixPossible(etat, carte, i) ? null : `Il faut au moins ${ch.exige.fortune} de fortune.`,
      action: () => { fermerDialogue(); resolve(i); }
    }))
  }));
}

/** À la porte : quelle carte de la région quittée retenir pour le tirage ? Résout son numéro. */
function demanderRetenue(region, candidats, conseil = "") {
  const r = REGIONS[region];
  return new Promise(resolve => dialogue({
    titre: `${r.glyphe} ${r.nom} : votre carte`,
    texte: `Quelle carte de ${r.nom} retenez-vous pour votre tirage ? Elle prendra la place de ${r.nom} dans la lecture finale.${conseil ? " " + conseil : ""}`,
    cartes: candidats.map((id, i) => ({ id, legende: `${i + 1}. ${CARTE_PAR_ID[id].nom}`, onClic: () => { fermerDialogue(); resolve(id); } })),
    boutons: candidats.map((id, i) => ({ label: `${i + 1}`, classe: "petit-bouton", action: () => { fermerDialogue(); resolve(id); } }))
  }));
}

/** L'énigme de la porte. Résout { index, reussie } après que le joueur a lu la correction. */
function demanderEnigme(e) {
  return new Promise(resolve => {
    const repondre = i => {
      const reussie = i === e.bonne;
      dialogue({
        titre: reussie ? "Bien lu !" : "Pas tout à fait",
        texte: reussie ? "La porte s’ouvre en grand : deux rangs de vue et 10 de fortune." : `La bonne réponse était : ${CARTE_PAR_ID[e.options[e.bonne]].nom}. Cette carte reviendra dans vos énigmes.`,
        notice: e.explication,
        cartes: [{ id: e.options[e.bonne] }],
        boutons: [{ label: "Continuer", action: () => { fermerDialogue(); resolve({ index: i, reussie }); } }]
      });
    };
    dialogue({
      titre: "L’énigme de la porte",
      texte: e.question,
      boutons: e.options.map((id, i) => ({ label: `${i + 1}. ${CARTE_PAR_ID[id].nom}`, action: () => repondre(i) }))
    });
  });
}

/** Annonce pour les lecteurs d'écran (zone aria-live discrète). */
function annoncer(texte) { $("annonce").textContent = texte; }

return { peindreCarte, pastilles, fermerFiche, montrerVecue, montrerMessage, montrerApercu, majDevant, fermerDialogue, dialogueOuvert, demanderChoix, demanderRetenue, demanderEnigme, annoncer };
})();

// ===== js/ui/tirage.js =====
M["js/ui/tirage.js"] = (() => {
// Écran de fin : le tirage composé (une carte retenue par planète), dessiné et lu, puis le chemin parcouru.
const { REGIONS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { peindreCarte } = M["js/ui/fiche.js"];

const $ = id => document.getElementById(id);
const nom = id => (id == null ? "" : `${CARTE_PAR_ID[id].symbole} ${CARTE_PAR_ID[id].nom}`);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

function phraseEtoile(e, role) {
  if (!e) return "";
  if (!e.rencontree) return `<p><b>${role}</b> : ${esc(nom(e.etoile))} n’a pas été rencontrée.</p>`;
  if (e.ignoree) return `<p><b>${role}</b> : ${esc(nom(e.etoile))} est restée voilée (porte fermée par La Destinée).</p>`;
  if (e.recu == null) return `<p><b>${role}</b> : ${esc(nom(e.etoile))} n’a rien reçu.</p>`;
  return `<p><b>${role}</b> : ${esc(nom(e.etoile))} a reçu <b>${esc(nom(e.recu))}</b> : « ${esc(CARTE_PAR_ID[e.recu].motCle)} ».</p>`;
}

function montrerLecture(lecture, etat, { graine, record, consultant, enigmes }) {
  $("fin-titre").textContent = etat.victoire ? "Le cycle des sept planètes est accompli" : "Le mage s’arrête";
  const b = lecture.bilan;
  $("fin-bilan").textContent = `Chemin n° ${graine} · ${b.vecues} cartes vécues, ${b.laissees} laissées · Fortune ${b.fortune} · Énergie ${b.energie} · Énigmes ${enigmes.reussies}/${enigmes.posees} · Score ${b.score}${record ? " · nouveau record" : ""}`;

  // Le tirage, dessiné
  const zone = $("fin-tirage");
  zone.replaceChildren(...lecture.tirage.map(t => {
    const fig = document.createElement("figure");
    fig.className = "carte-tirage";
    fig.style.setProperty("--i", t.position);
    const cv = document.createElement("canvas"); peindreCarte(cv, t.id);
    const cap = document.createElement("figcaption");
    cap.textContent = `${REGIONS[t.region].glyphe} ${REGIONS[t.region].nom}`;
    fig.append(cv, cap);
    return fig;
  }));
  $("fin-tirage-vide").hidden = lecture.tirage.length > 0;

  // La lecture, position par position
  const accordsPar = new Map();
  for (const a of lecture.accords) accordsPar.set(a.positions[1], a);
  let html = lecture.tirage.map(t => {
    const c = CARTE_PAR_ID[t.id], a = accordsPar.get(t.position);
    return `<p><b>${esc(REGIONS[t.region].glyphe)} ${esc(REGIONS[t.region].nom)}</b> : ${esc(c.nom)}, « ${esc(c.motCle)} ». <span class="petit">${esc(c.notice)}</span>${a ? `<br><span class="accord">✦ Avec la carte précédente : ${esc(a.texte)}</span>` : ""}</p>`;
  }).join("");
  const moi = consultant === "femme" ? "Votre significateur (la consultante)" : "Votre significateur (le consultant)";
  html += `<hr>${phraseEtoile(lecture.significateur, moi)}${phraseEtoile(lecture.influence, "L’influence")}`;
  if (lecture.premierPlan) {
    const p = lecture.premierPlan;
    html += p.ouverte
      ? `<p><b>Au premier plan</b> : La Destinée a ouvert la porte sur ${p.carte != null ? `<b>${esc(nom(p.carte))}</b>` : "aucune carte"}.</p>`
      : `<p><b>La Destinée</b> a fermé la porte sur ${p.carte != null ? esc(nom(p.carte)) : "aucune carte"}.</p>`;
  }
  html += lecture.regles.length
    ? `<p><b>Règles de Belline réunies en chemin</b> :</p><ul>${lecture.regles.map(r => `<li>${esc(r.texte)}</li>`).join("")}</ul>`
    : "<p><b>Règles de Belline</b> : aucune réunie en chemin. Cherchez les fils d’or.</p>";
  if (lecture.fortes.length) html += `<p><b>Cartes fortes vécues</b> : ${lecture.fortes.map(id => esc(nom(id))).join(", ")}.</p>`;
  $("fin-lecture").innerHTML = html;

  $("fin-sequence").innerHTML = lecture.parRegion.map(({ region, entrees }) => {
    const r = REGIONS[region];
    const cartes = entrees.map(h => {
      const c = CARTE_PAR_ID[h.id];
      const marques = [h.double ? "doublée" : "", h.ignoree ? "fermée" : "", h.remplacee ? "remplacée" : "", h.retour ? "revenue" : "",
        h.choix != null && c.choix ? c.choix[h.choix].label.split(" (")[0] : ""].filter(Boolean).join(", ");
      return `<li title="${esc(c.notice)}"><span class="sym">${esc(c.symbole)}</span>${esc(c.nom)}${marques ? ` <em>(${esc(marques)})</em>` : ""}</li>`;
    }).join("");
    return `<div class="region-tirage"><h4>${esc(r.glyphe)} ${esc(r.nom)}</h4><ol>${cartes}</ol></div>`;
  }).join("");
  $("ecran-fin").classList.add("visible");
  $("ecran-fin").scrollTop = 0;
  $("bouton-meme").focus();
}

function cacherTirage() { $("ecran-fin").classList.remove("visible"); }

return { montrerLecture, cacherTirage };
})();

// ===== js/ui/carnet.js =====
M["js/ui/carnet.js"] = (() => {
// Carnet : écran de collection des cartes et des règles (la sauvegarde est dans stockage.js).
const { CARTES, CARTE_PAR_ID } = M["js/data/cartes.js"];
const { VOISINAGE } = M["js/data/voisinage.js"];
const { avancement } = M["js/engine/carnet.js"];
const { peindreCarte } = M["js/ui/fiche.js"];

const $ = id => document.getElementById(id);
function montrerCarnet(c) {
  const av = avancement(c);
  $("carnet-avancement").textContent = `${av.vecues} cartes vécues et ${av.vues} vues sur 53 · ${av.regles} règles de Belline sur ${av.totalRegles} · énigmes ${c.enigmes.reussies}/${c.enigmes.posees} · ${av.aRevoir} carte${av.aRevoir > 1 ? "s" : ""} à revoir · ${c.parties} chemin${c.parties > 1 ? "s" : ""}, meilleur score ${c.meilleurScore} · duels gagnés ${c.duels.gagnes}/${c.duels.joues}`;
  const grille = $("carnet-grille");
  const ordre = [...CARTES].sort((a, b) => a.id - b.id);
  grille.replaceChildren(...ordre.map(carte => {
    const f = c.cartes[carte.id] || { vue: 0, vecue: 0 };
    const b = document.createElement("button");
    b.className = "case-carnet" + (f.vecue ? " vecue" : f.vue ? " vue" : " inconnue") + (c.aRevoir[carte.id] ? " a-revoir" : "");
    b.setAttribute("aria-label", f.vue || f.vecue ? `${carte.id}. ${carte.nom}` : `Carte ${carte.id}, pas encore rencontrée`);
    if (f.vue || f.vecue) {
      const cv = document.createElement("canvas"); peindreCarte(cv, carte.id); b.appendChild(cv);
    } else b.innerHTML = `<span class="num">${carte.id || "◆"}</span><span>?</span>`;
    b.addEventListener("click", () => detail(carte.id, f));
    return b;
  }));
  $("carnet-regles").replaceChildren(...VOISINAGE.map(r => {
    const li = document.createElement("li");
    li.className = c.regles[r.id] ? "connue" : "";
    li.textContent = c.regles[r.id] ? r.texte : `N° ${r.a} ${r.ordre === "avant" ? "précédant" : "avec"} n° ${r.b} : à découvrir`;
    return li;
  }));
  $("carnet-detail").textContent = "Choisissez une carte pour relire sa notice.";
  $("ecran-carnet").classList.add("visible");
  $("bouton-fermer-carnet").focus();
}

function detail(id, f) {
  const carte = CARTE_PAR_ID[id];
  const d = $("carnet-detail");
  if (!f.vue && !f.vecue) { d.textContent = "Cette carte ne s’est pas encore montrée sur votre chemin."; return; }
  d.innerHTML = "<b></b><br><em></em><p></p><p class='lecon'></p>";
  d.querySelector("b").textContent = `${carte.id === 0 ? "" : carte.id + ". "}${carte.nom} · ${carte.motCle}`;
  d.querySelector("em").textContent = `Image : ${carte.image} · vue ${f.vue} fois, vécue ${f.vecue} fois`;
  d.querySelector("p").textContent = `« ${carte.notice} »`;
  d.querySelector(".lecon").textContent = carte.lecon;
}

function cacherCarnet() { $("ecran-carnet").classList.remove("visible"); }

return { montrerCarnet, cacherCarnet };
})();

// ===== js/ui/commandes.js =====
M["js/ui/commandes.js"] = (() => {
// Commandes : clavier (flèches, ou ZQSD / WASD selon le clavier : on lit la position des touches),
// et, sur écran tactile ou à la souris, glisser sur la scène pour marcher (comme un manche), toucher pour lire
// une carte ou sauter. Espace : sauter. B : Carte Bleue. Échap : fermer.

const DIRECTIONS = {
  ArrowUp: "haut", KeyW: "haut",
  ArrowDown: "bas", KeyS: "bas",
  ArrowLeft: "gauche", KeyA: "gauche",
  ArrowRight: "droite", KeyD: "droite"
};
const SEUIL_GLISSE = 14;   // px avant qu'un toucher devienne une marche

function surControle(e) {
  const t = e.target;
  return t instanceof HTMLElement && (t.closest("button, input, select, textarea, a, summary, [contenteditable]") != null);
}

function installerCommandes({ canvas, surSaut, surBleue, surEchap, surChiffre, surToucher, enJeu }) {
  const tenues = new Set();
  let manuel = false;
  let glisse = null;   // { x0, y0, dx, dy, actif, t0 }

  window.addEventListener("keydown", e => {
    const dir = DIRECTIONS[e.code];
    if (dir && enJeu() && !surControle(e)) { e.preventDefault(); tenues.add(dir); manuel = true; return; }
    if (e.code === "Escape") { surEchap(); return; }
    if (/^Digit[1-9]$/.test(e.code) || /^Numpad[1-9]$/.test(e.code)) { if (surChiffre(+e.code.slice(-1))) e.preventDefault(); return; }
    if (surControle(e)) return; // Espace et Entrée activent le bouton qui a le focus
    if (e.code === "Space" && enJeu()) { e.preventDefault(); if (!e.repeat) surSaut(); return; }
    if (e.code === "KeyB" && enJeu()) surBleue();
  });
  window.addEventListener("keyup", e => { const dir = DIRECTIONS[e.code]; if (dir) tenues.delete(dir); });
  window.addEventListener("blur", () => { tenues.clear(); glisse = null; });

  // Glisser pour marcher, toucher pour lire ou sauter
  canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture?.(e.pointerId);
    glisse = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, actif: false, t0: performance.now() };
  });
  canvas.addEventListener("pointermove", e => {
    if (!glisse) return;
    const dx = e.clientX - glisse.x0, dy = e.clientY - glisse.y0;
    if (!glisse.actif && Math.hypot(dx, dy) > SEUIL_GLISSE) { glisse.actif = true; manuel = true; }
    if (glisse.actif) { const n = Math.hypot(dx, dy) || 1; glisse.dx = dx / n; glisse.dy = -dy / n; }
  });
  const finir = e => {
    if (!glisse) return;
    if (!glisse.actif && performance.now() - glisse.t0 < 450) surToucher(e);
    glisse = null;
  };
  canvas.addEventListener("pointerup", finir);
  canvas.addEventListener("pointercancel", () => { glisse = null; });
  document.querySelector("[data-action='saut']")?.addEventListener("click", () => surSaut());

  const tient = d => tenues.has(d);
  return {
    /** Direction voulue : { dx, dy } (dy positif vers le haut). */
    commande() {
      if (glisse?.actif) return { dx: glisse.dx, dy: glisse.dy };
      return { dx: (tient("droite") ? 1 : 0) - (tient("gauche") ? 1 : 0), dy: (tient("haut") ? 1 : 0) - (tient("bas") ? 1 : 0) };
    },
    /** Vrai si le joueur a donné une direction depuis le dernier appel (annule une marche automatique). */
    manuel() { const m = manuel; manuel = false; return m; },
    relacher() { tenues.clear(); glisse = null; }
  };
}

return { installerCommandes };
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

// ===== js/main.js =====
M["js/main.js"] = (() => {
// Le Chemin : relie la partie (engine/partie.js), le dessin (render) et l'interface (ui).
const { COULEURS, REGIONS } = M["js/config.js"];
const { CARTE_PAR_ID } = M["js/data/cartes.js"];
const { nouvelleGraine } = M["js/engine/hasard.js"];
const { utiliserCarteBleue, coutSaut } = M["js/engine/effects.js"];
const { creerPartie, avancer, resoudre, demanderSaut, reprendreMain, allerVers, regarder, besoinEnergie, regionAffichee } = M["js/engine/partie.js"];
const { lireTirage, score } = M["js/engine/lecture.js"];
const { noterVue, noterVecue, noterRegle, noterPartie } = M["js/engine/carnet.js"];
const { Rendu } = M["js/render/renderer.js"];
const { Effets } = M["js/render/effetsVisuels.js"];
const { majHud, majRetenues } = M["js/ui/hud.js"];
const { montrerVecue, montrerMessage, montrerApercu, fermerFiche, majDevant, demanderChoix, demanderRetenue, demanderEnigme, annoncer, dialogueOuvert } = M["js/ui/fiche.js"];
const { montrerLecture, cacherTirage } = M["js/ui/tirage.js"];
const { montrerCarnet, cacherCarnet } = M["js/ui/carnet.js"];
const { chargerCarnet, sauverCarnet } = M["js/ui/stockage.js"];
const { installerCommandes } = M["js/ui/commandes.js"];
const { jouerSon, basculerSon, sonActif } = M["js/ui/son.js"];
const { installerPleinEcran } = M["js/ui/pleinEcran.js"];

const $ = id => document.getElementById(id);
const canvas = $("jeu");
const rendu = new Rendu(canvas);
// Chaque carte vécue joue son effet sur la scène (l'Eau déferle, le Feu flambe...).
const effets = new Effets(canvas.parentElement);
rendu.mouvementReduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const carnet = chargerCarnet();
// Outil de vérification : ?acceleration=4 fait passer le temps quatre fois plus vite (navigateurs lents, tests).
const ACCELERATION = Math.min(10, Math.max(1, Number(new URLSearchParams(location.search).get("acceleration")) || 1));

let p = null, mode = "accueil", consultant = "homme", longueur = 7, dernierT = 0;
let vue = null, cleDevant = "", enDialogue = false;

function nouvellePartie(graine = null) {
  p = creerPartie(graine ?? nouvelleGraine(), consultant, { regions: longueur, carnet });
  cleDevant = ""; enDialogue = false;
  rendu.camA = null; rendu.flottants = []; rendu.particules = []; rendu.revelation = null;
  cacherTirage(); cacherCarnet(); $("accueil").classList.remove("visible");
  $("numero-chemin").textContent = `Chemin n° ${p.graine}`;
  mode = "jeu";
  rendu.annoncer(`${REGIONS[0].glyphe} ${REGIONS[0].nom}`, "Montez avec ↑, choisissez aux fourches");
  montrerMessage(1, ["Montez avec ↑ (ou Z / W), ou glissez le doigt sur la scène. Aux fourches, choisissez ← ou →. Espace (ou un toucher) : sauter la carte qui est devant vous.",
    "Le temps ne passe que lorsque vous marchez : arrêtez-vous pour lire.",
    "À chaque porte, vous retiendrez une carte pour votre tirage, et une énigme vous attend."], "Le chemin commence");
  majRetenues(p.retenues, id => CARTE_PAR_ID[id].nom);
  canvas.focus({ preventScroll: true });
}

// ---------- Événements de la partie ----------
const signe = g => Math.sign((g?.energie || 0) + (g?.fortune || 0));

function flotterGain(gain) {
  const pos = p.mage.position(p.chemin);
  if (gain.energie) rendu.flotter(`${gain.energie > 0 ? "+" : ""}${gain.energie} ⚡`, gain.energie > 0 ? "#bfe3b4" : "#ffb3b3", pos);
  if (gain.fortune) rendu.flotter(`${gain.fortune > 0 ? "+" : ""}${gain.fortune} ✦`, "#f3d58a", pos);
}

function traiter(evenements) {
  for (const e of evenements) {
    switch (e.type) {
      case "region": {
        const r = REGIONS[e.region];
        rendu.annoncer(`${r.glyphe} ${r.nom}`, e.region === 2 || e.region === 3 ? "Le pas se fait plus vif" : e.region === 7 ? "Le pas s’alourdit" : "");
        jouerSon("porte");
        annoncer(`Vous entrez dans la région ${r.nom}.`);
        break;
      }
      case "laissee":
        if (e.messages.length) { montrerMessage(e.id, e.messages, "Laissée de côté", e.gain); flotterGain(e.gain); }
        break;
      case "sautee":
        montrerVecue(e.id, e.messages, { titre: "Carte sautée", gain: e.gain });
        flotterGain(e.gain); jouerSon("saut");
        break;
      case "survolee":
        montrerVecue(e.id, e.messages, { titre: "Carte survolée" });
        break;
      case "vecue": {
        const nouvelle = noterVecue(carnet, e.id);
        let regleNeuve = false;
        for (const r of e.regles) regleNeuve = noterRegle(carnet, r.id) || regleNeuve;
        sauverCarnet(carnet);
        montrerVecue(e.id, e.messages, { titre: e.titre, nouvelle, gain: e.gain, regles: e.regles });
        flotterGain(e.gain);
        rendu.reveler(e.id, signe(e.gain), p.mage.position(p.chemin));
        effets.carte(e.id, null, true);
        if (e.regles.length) { rendu.annoncer(regleNeuve ? "Règle de Belline découverte" : "Règle de Belline", e.regles[0].texte.split(" : ")[1] ?? ""); jouerSon("regle"); }
        else jouerSon(signe(e.gain) > 0 ? "gain" : signe(e.gain) < 0 ? "perte" : "neutre");
        annoncer(`${CARTE_PAR_ID[e.id].nom}. ${e.messages.join(" ")}`);
        break;
      }
      case "temps":
        montrerMessage(e.source ?? p.etat.historique.at(-1)?.id ?? 1, [e.texte], "En chemin");
        annoncer(e.texte);
        break;
      case "retenue":
        majRetenues(p.retenues, id => CARTE_PAR_ID[id].nom);
        rendu.annoncer(`${REGIONS[e.region].glyphe} ${CARTE_PAR_ID[e.id].nom}`, "retenue pour votre tirage");
        break;
      case "enigme":
        sauverCarnet(carnet);
        if (e.reussie) { jouerSon("gain"); flotterGain({ fortune: 10 }); } else jouerSon("erreur");
        break;
      case "fin": finir(e.victoire); break;
    }
  }
  traiterAttente();
}

/** Une décision attend le joueur : on ouvre le dialogue qui convient. */
async function traiterAttente() {
  if (!p.attente || enDialogue) return;
  enDialogue = true;
  controles.relacher();
  const a = p.attente;
  let reponse;
  if (a.kind === "choix") { jouerSon("choix"); reponse = await demanderChoix(a.id, p.etat); }
  else if (a.kind === "retenir") reponse = await demanderRetenue(a.region, a.candidats, conseilRetenue());
  else if (a.kind === "enigme") reponse = (await demanderEnigme(a.enigme)).index;
  enDialogue = false;
  dernierT = performance.now();
  canvas.focus({ preventScroll: true });
  traiter(resoudre(p, reponse));
}

function conseilRetenue() {
  const derniere = p.retenues.at(-1);
  return derniere ? `Votre carte précédente : ${CARTE_PAR_ID[derniere.id].nom}. Deux cartes voisines peuvent former une règle de Belline.` : "";
}

function finir(victoire) {
  mode = "fin";
  controles.relacher();
  fermerFiche();
  jouerSon(victoire ? "victoire" : "defaite");
  const record = noterPartie(carnet, score(p.etat, p.retenues));
  sauverCarnet(carnet);
  setTimeout(() => montrerLecture(lireTirage(p.etat, p.retenues), p.etat, { graine: p.graine, record, consultant, enigmes: p.enigmes }), 900);
}

// ---------- Boucle ----------
function etape(dt, commande, nouvelleCommande = false) {
  if (!p || mode !== "jeu") return;
  if (nouvelleCommande) { fermerFiche(); reprendreMain(p); }
  traiter(avancer(p, dt, commande));
}

function majVue() {
  vue = regarder(p);
  if (vue.nouvelles.length && mode !== "accueil") { for (const id of vue.nouvelles) noterVue(carnet, id); sauverCarnet(carnet); }
  const cle = vue.devant.map(d => `${d.noeud}:${d.rang}`).join(",");
  if (cle !== cleDevant) {
    cleDevant = cle;
    majDevant(vue.devant, apercu);
    const proches = vue.devant.filter(d => d.rang === 1);
    if (proches.length > 1) annoncer(`Fourche : ${proches.map(d => `${d.cote}, ${CARTE_PAR_ID[d.id].nom}`).join(" ; ")}.`);
  }
}

function boucle(t) {
  const dt = Math.min(0.1, Math.max(0, (t - dernierT) / 1000) || 0) * ACCELERATION;
  dernierT = t;
  if (!dialogueOuvert()) etape(dt, controles.commande(), controles.manuel());
  if (p) {
    majVue();
    rendu.dessiner({ p, vue, dt });
    majHud(p.etat, regionAffichee(p), mode === "jeu" ? besoinEnergie(p) : 0);
  }
  requestAnimationFrame(boucle);
}

// ---------- Actions du joueur ----------
function sautDemande() {
  if (mode !== "jeu") return;
  const r = demanderSaut(p);
  if (!r.ok && r.raison) rendu.flotter(r.raison, COULEURS.creme, p.mage.position(p.chemin));
}

function carteBleue() {
  const avant = { e: p.etat.energie, f: p.etat.fortune };
  const msgs = utiliserCarteBleue(p.etat);
  if (msgs) { montrerMessage(0, msgs, "Carte Bleue", { energie: Math.round(p.etat.energie - avant.e), fortune: Math.round(p.etat.fortune - avant.f) }); jouerSon("gain"); }
}

function apercu(noeud) {
  if (!p) return;
  const n = p.chemin.noeuds[noeud];
  const face = vue.faces.get(noeud), rang = vue.atteints.get(noeud), libre = n.etat === "libre";
  let info = "";
  if (!libre) info = { vecue: "déjà vécue", fermee: "fermée par La Destinée", sautee: "sautée", survolee: "survolée", contournee: "laissée de côté" }[n.etat];
  else if (rang == null) info = "hors d’atteinte";
  else info = `${rang === 1 ? "prochaine carte sur ce chemin" : `à ${rang} cartes`}${n.tronc ? ", sur le tronc" : ""} · sauter coûte ${coutSaut(p.etat, n.carte)} ⚡`;
  montrerApercu(n.carte, { face, info, onAller: mode === "jeu" && libre && rang != null ? () => allerVers(p, noeud) : null });
}

function toucher(e) {
  if (!p) return;
  const r = canvas.getBoundingClientRect();
  const q = rendu.versLogique(e.clientX - r.left, e.clientY - r.top);
  const z = rendu.zones.find(z => q.x >= z.x && q.x <= z.x + z.l && q.y >= z.y && q.y <= z.y + z.h);
  if (z) apercu(z.noeud);
  else if (e.pointerType === "touch") sautDemande();
}

const controles = installerCommandes({
  canvas,
  surSaut: sautDemande,
  surBleue: carteBleue,
  surToucher: toucher,
  surEchap: () => { if ($("ecran-carnet").classList.contains("visible")) cacherCarnet(); else fermerFiche(); },
  surChiffre: k => {
    const b = document.querySelector(`#dialogue.visible #dlg-boutons button[data-index="${k - 1}"]`);
    if (b && !b.disabled) { b.click(); return true; }
    return false;
  },
  enJeu: () => mode === "jeu" && !dialogueOuvert()
});

for (const b of document.querySelectorAll("[data-consultant]")) b.addEventListener("click", () => {
  consultant = b.dataset.consultant;
  longueur = +document.querySelector("input[name=longueur]:checked")?.value || 7;
  const n = parseInt($("graine").value, 10);
  nouvellePartie(Number.isFinite(n) && n > 0 ? n : null);
});
$("bouton-meme").addEventListener("click", () => nouvellePartie(p.graine));
$("bouton-nouveau").addEventListener("click", () => nouvellePartie(null));
for (const b of document.querySelectorAll("[data-carnet]")) b.addEventListener("click", () => montrerCarnet(carnet));
$("bouton-fermer-carnet").addEventListener("click", cacherCarnet);
$("bouton-bleue").addEventListener("click", carteBleue);
$("bouton-fermer-fiche").addEventListener("click", fermerFiche);
installerPleinEcran($("bouton-plein-ecran"));
const boutonSon = $("bouton-son");
const majSon = () => { boutonSon.textContent = sonActif() ? "♪ Son" : "♪ Muet"; boutonSon.setAttribute("aria-pressed", String(sonActif())); };
boutonSon.addEventListener("click", () => { basculerSon(); majSon(); });
majSon();

const ajuster = () => rendu.ajuster();
window.addEventListener("resize", ajuster);
if (window.ResizeObserver) new ResizeObserver(ajuster).observe(canvas);

// Outil de vérification (?test) : faire avancer le jeu pas à pas depuis la console ou un script.
if (new URLSearchParams(location.search).has("test")) {
  const resume = () => ({
    mode, attente: p.attente?.kind ?? null, energie: Math.round(p.etat.energie), fortune: p.etat.fortune, region: p.etat.region,
    noeud: p.mage.noeud, vers: p.mage.vers, fourche: p.mage.fourche,
    tirage: p.etat.historique.map(h => CARTE_PAR_ID[h.id].nom), retenues: p.retenues.map(r => CARTE_PAR_ID[r.id].nom),
    fiche: `${$("fiche-titre").textContent} : ${$("fiche-nom").textContent}`
  });
  window.__test = {
    pas(secondes, dx = 0, dy = 1) { for (let s = 0; s < secondes && mode === "jeu" && !dialogueOuvert(); s += 0.05) etape(0.05, { dx, dy }); return resume(); },
    sauter() { sautDemande(); return resume(); },
    resume,
    partie: () => p
  };
}

// Écran d'accueil : un chemin de démonstration en arrière-plan
p = creerPartie(nouvelleGraine(), "homme", { carnet });
requestAnimationFrame(t => { dernierT = t; requestAnimationFrame(boucle); });

return {  };
})();
})();
