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

export const CARTES = [
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

export const CARTE_PAR_ID = Object.fromEntries(CARTES.map(c => [c.id, c]));
