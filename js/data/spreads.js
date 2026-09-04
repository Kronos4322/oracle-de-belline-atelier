/* ---------------------------------------------------------------------------
 * Modèles de tirage.  D'après « Lire le Belline — manuel de méthode »
 * et « L'Oracle et la grille » (méthode d'Hécate révisée, ch. 15).
 *
 * Chaque position porte :
 *   id       — identifiant interne
 *   label    — nom affiché
 *   kind     — 'substantif' (carte principale, porte le sens)
 *            | 'adjectif'   (carte ajoutée, précise et nuance)
 *   branch   — 'axe' | 'neg' | 'pos' | 'coupe'  (mise en page / teinte)
 *   polarity — 'favorable' | 'defavorable' | null   (pour le test de valence contraire)
 *   parent   — id de la position qu'elle éclaire
 *   logic    — à quoi sert cette position
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

(function () {

  var eclairCause = "Complément du nom : de quoi cette cause est faite.";
  var eclairAction = "En descendant : adverbe (comment l'acte se ferait). En remontant : complément du nom (de quoi l'acte était fait).";

  BELLINE.SPREADS = {

    hecate: {
      id: 'hecate',
      name: "Tirage d'Hécate",
      subtitle: "Une situation et ses deux devenirs",
      count: 22,
      intro: "Deux colonnes complètes et symétriques — négative et positive — chacune " +
             "avec son passé, son présent et son devenir. Le Guide les surplombe, le Pivot " +
             "les articule. Sous chaque voie : un nœud de cause (pourquoi) et un nœud " +
             "d'action (par quel geste), chacun avec deux éclaircisseurs. La Coupe donne le climat.",

      rules: [
        "Le substantif porte le sens ; l'adjectif précise la modalité et ne renverse jamais le substantif.",
        "D'abord le littéral (ce que la carte montre), ensuite le symbolique (famille planétaire, dynamique de fond).",
        "Relevés d'abord : familles planétaires, valences (table figée), cartes fortes, cartes en position contraire.",
        "Test de valence contraire, obligatoire et borné : n'examiner que les cartes en désaccord avec leur case.",
        "Cartes fortes (11 Trahison, 34 Despotisme, 38 Accident, 42 Sagesse, 48 Fatalité) : les signaler ; elles dominent leur voisinage.",
        "Le Pivot dit ce vers quoi le consultant tend — une orientation, pas une prédiction."
      ],

      senses: [
        { label: "Lecture descendante (haut → bas)",
          desc: "L'avenir comme possibilité, qu'on attend. Le nœud d'action est un verbe, ses éclaircisseurs des adverbes." },
        { label: "Lecture ascendante (bas → haut)",
          desc: "Le passé comme fait, qu'on peut savoir. Le nœud d'action devient un nom d'événement advenu. On remonte du plus récent au plus ancien." }
      ],

      axes: [
        "Verticale : du Guide au Pivot puis aux voies — comment une loi présente engendre des devenirs.",
        "Horizontales : passé contre passé, présent contre présent. Elles ne se résolvent pas ; elles montrent ce qui, dans une même situation, ne coïncide pas.",
        "Homologues : les deux nœuds d'action posent la même question à deux réponses (par quel geste recommence-t-on ?) ; les deux nœuds de cause posent l'autre (qu'est-ce qui pousse de ce côté ?)."
      ],

      positions: [
        { id: 'guide', label: "Guide", kind: 'substantif', branch: 'axe', polarity: null,
          logic: "Sous quelle loi la situation fonctionne actuellement. Il ne dit pas où va la situation, il dit dans quelle atmosphère lire tout le reste. Commun aux deux colonnes." },

        { id: 'passe_neg', label: "Passé négatif", kind: 'adjectif', branch: 'axe', polarity: 'defavorable',
          logic: "Ce qui, dans le passé, a nui, bloqué ou alourdi la situation." },
        { id: 'present_neg', label: "Présent négatif", kind: 'adjectif', branch: 'axe', polarity: 'defavorable',
          logic: "Ce qui pèse actuellement : tensions, limites, blocages présents." },
        { id: 'passe_pos', label: "Passé positif", kind: 'adjectif', branch: 'axe', polarity: 'favorable',
          logic: "Ce qui, dans le passé, a nourri, aidé ou reste bénéfique." },
        { id: 'present_pos', label: "Présent positif", kind: 'adjectif', branch: 'axe', polarity: 'favorable',
          logic: "Ce qui subsiste, les ressources et forces disponibles aujourd'hui." },

        { id: 'synthese', label: "Pivot", kind: 'substantif', branch: 'axe', polarity: null,
          logic: "Ce vers quoi le consultant tend — une orientation, non une prédiction ni ce qui est objectivement en jeu. Articule les deux colonnes." },

        { id: 'voie_neg', label: "Voie négative", kind: 'substantif', branch: 'neg', polarity: 'defavorable',
          logic: "Le point névralgique de la colonne défavorable. Substantif : rien ne le renverse. Les quatre cartes basses n'ajoutent pas un sens nouveau, elles déploient ce terme." },
        { id: 'voie_pos', label: "Voie positive", kind: 'substantif', branch: 'pos', polarity: 'favorable',
          logic: "Le point névralgique de la colonne favorable. Substantif : rien ne le renverse. Les quatre cartes basses déploient ce terme." },

        { id: 'noeud_neg_1', label: "Nœud négatif — cause", kind: 'substantif', branch: 'neg', polarity: 'defavorable', parent: 'voie_neg',
          logic: "Ce qui pousse vers cette voie (psychologique ou extérieur). Nom de condition. Question : pourquoi cette voie ?" },
        { id: 'noeud_neg_2', label: "Nœud négatif — action", kind: 'substantif', branch: 'neg', polarity: 'defavorable', parent: 'voie_neg',
          logic: "L'acte par lequel la voie s'accomplit. En descendant : un verbe (l'acte à faire ou éviter). En remontant : un nom (l'acte qui a eu lieu). Question : par quel geste ?" },
        { id: 'noeud_pos_1', label: "Nœud positif — cause", kind: 'substantif', branch: 'pos', polarity: 'favorable', parent: 'voie_pos',
          logic: "Ce qui pousse vers cette voie (psychologique ou extérieur). Nom de condition. Question : pourquoi cette voie ?" },
        { id: 'noeud_pos_2', label: "Nœud positif — action", kind: 'substantif', branch: 'pos', polarity: 'favorable', parent: 'voie_pos',
          logic: "L'acte par lequel la voie s'accomplit. En descendant : un verbe. En remontant : un nom d'événement advenu. Question : par quel geste ?" },

        { id: 'eclair_neg_1', label: "Éclaircisseur — cause", kind: 'adjectif', branch: 'neg', polarity: 'defavorable', parent: 'noeud_neg_1', logic: eclairCause },
        { id: 'eclair_neg_2', label: "Éclaircisseur — cause", kind: 'adjectif', branch: 'neg', polarity: 'defavorable', parent: 'noeud_neg_1', logic: eclairCause },
        { id: 'eclair_neg_3', label: "Éclaircisseur — action", kind: 'adjectif', branch: 'neg', polarity: 'defavorable', parent: 'noeud_neg_2', logic: eclairAction },
        { id: 'eclair_neg_4', label: "Éclaircisseur — action", kind: 'adjectif', branch: 'neg', polarity: 'defavorable', parent: 'noeud_neg_2', logic: eclairAction },
        { id: 'eclair_pos_1', label: "Éclaircisseur — cause", kind: 'adjectif', branch: 'pos', polarity: 'favorable', parent: 'noeud_pos_1', logic: eclairCause },
        { id: 'eclair_pos_2', label: "Éclaircisseur — cause", kind: 'adjectif', branch: 'pos', polarity: 'favorable', parent: 'noeud_pos_1', logic: eclairCause },
        { id: 'eclair_pos_3', label: "Éclaircisseur — action", kind: 'adjectif', branch: 'pos', polarity: 'favorable', parent: 'noeud_pos_2', logic: eclairAction },
        { id: 'eclair_pos_4', label: "Éclaircisseur — action", kind: 'adjectif', branch: 'pos', polarity: 'favorable', parent: 'noeud_pos_2', logic: eclairAction },

        { id: 'coupe_1', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null,
          logic: "Climat général : positif ou négatif, lieu, ambiance, contexte. N'occupe aucune position de l'arbre, ne se relie à rien. Ses deux cartes sont remises au jeu avant l'étalement — un doublon avec l'arbre est probable et n'est pas un signe." },
        { id: 'coupe_2', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null,
          logic: "Climat général : positif ou négatif, lieu, ambiance, contexte. Remise au jeu avant l'étalement." }
      ],

      // Tirage transcrit des planches de référence (Camille, 8 août 2026).
      example: {
        title: "Exemple — 8 août 2026",
        cards: {
          guide: 33, passe_neg: 32, present_neg: 40, passe_pos: 25, present_pos: 41,
          synthese: 7, voie_neg: 23, voie_pos: 39,
          noeud_neg_1: 30, noeud_neg_2: 38, noeud_pos_1: 52, noeud_pos_2: 45,
          eclair_neg_1: 51, eclair_neg_2: 27, eclair_neg_3: 37, eclair_neg_4: 50,
          eclair_pos_1: 22, eclair_pos_2: 15, eclair_pos_3: 29, eclair_pos_4: 11,
          coupe_1: 23, coupe_2: 8
        },
        phrases: [
          "Guide 33 Procès : la relation est gouvernée par le contentieux, non par l'amour ni la distance.",
          "Descendante positive : Appui devient possible par le Cloître (retrait négocié) puis le Bonheur (reprise par autre chose que le procès).",
          "Ascendante négative : Retard / Union et Feu / Ruine expliquent la crise — le lien maintenu à vide rend la répétition possible.",
          "Concordance : 10 lames fortes sur 13 du bon côté (7,8 %). Tirage objectivement inhabituel, sans être concluant."
        ],
        notes: [
          "27 Union (favorable) en éclaircisseur négatif : son ombre = le lien maintenu à vide, condition de la répétition.",
          "11 Trahison (défavorable, forte) en éclaircisseur positif : lecture forte = rupture avec l'ancien contrat.",
          "40 Beauté (favorable) en présent négatif : chercher l'ombre.",
          "Coupe : Trafic + Pensée-Amitié — un lien pensé et affectueux qui subsiste, mais mal acheminé."
        ]
      }
    }

  };
})();
