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

      typologie: { objet: "une situation", question: "que va-t-il advenir ?", reversible: true, mesure: "test de concordance" },

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
    },

    /* ===================== Le Miroir du Cœur (Éros) ===================== */
    miroir: {
      id: 'miroir',
      name: "Le Miroir du Cœur",
      subtitle: "L'état psychique d'une personne (aussi appelé Tirage d'Éros, lecture des sentiments)",
      count: 28,
      intro: "Neuf positions fonctionnelles, sans polarité ni Guide. Aucune mesure n'est " +
             "disponible : c'est un instrument d'explicitation, non de vérification. Il porte " +
             "sur l'intériorité d'un tiers absent — le représenter, ce n'est pas y accéder.",
      typologie: { objet: "une personne", question: "comment vit-elle cela ?", reversible: false, mesure: "aucune" },
      rules: [
        "Chaque position reçoit un substantif et un ou deux adjectifs.",
        "Aucune polarité : le test de concordance ne s'y applique pas.",
        "Consigner d'emblée ce qui est déjà connu de la personne — sinon toute justesse est indécidable.",
        "Registre à déclarer (affectif ou circonstanciel), valable pour tout le tirage."
      ],
      senses: [],
      axes: [
        "Verticale : Le Cœur, La Mémoire, Le Verrou, Le Non-dit, Le Miroir — une mécanique intérieure, du sentiment dominant à la synthèse.",
        "Horizontale : Le Conscient contre L'Enfoui — la pensée et l'affect ne racontent pas la même chose.",
        "Horizontale : Le Désir contre Le Masque — l'écart entre ce qui est voulu et ce qui est montré. C'est l'axe qui justifie le nom du dispositif.",
        "Dedans / milieu / dehors : Le Désir, Le Verrou, Le Masque — le blocage du milieu explique pourquoi le fond ne se traduit pas au dehors."
      ],
      layout: [
        ['coupe_1', 'coupe_2'],
        ['coeur'],
        ['conscient', 'enfoui'],
        ['memoire'],
        ['verrou'],
        ['desir', 'masque'],
        ['nondit'],
        ['miroir_syn']
      ],
      positions: [
        { id: 'coupe_1', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Climat, contexte. Hors positions, remise au jeu avant l'étalement." },
        { id: 'coupe_2', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Climat, contexte. Hors positions, remise au jeu avant l'étalement." },
        { id: 'coeur', label: "Le Cœur", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Le sentiment dominant.", read: "Le socle : tout le reste se lit en rapport avec elle. Premier terme de l'axe vertical." },
        { id: 'conscient', label: "Le Conscient", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui est su et reconnu.", read: "À opposer à L'Enfoui : la pensée et l'affect ne racontent pas la même chose (axe horizontal)." },
        { id: 'enfoui', label: "L'Enfoui", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui agit sans se dire.", read: "À opposer au Conscient : ce qui gouverne les comportements sans être reconnu." },
        { id: 'memoire', label: "La Mémoire", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui demeure de l'histoire.", read: "Sur l'axe vertical : ce qui, du passé, agit encore aujourd'hui." },
        { id: 'verrou', label: "Le Verrou", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui bloque : peur, blessure, contradiction.", read: "Le milieu de l'axe dedans / milieu / dehors : c'est lui qui explique pourquoi le Désir ne se traduit pas en Masque." },
        { id: 'desir', label: "Le Désir", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui est voulu au fond.", read: "À opposer au Masque : l'écart entre ce qui est voulu et ce qui est montré. C'est l'axe qui donne son nom au tirage." },
        { id: 'masque', label: "Le Masque", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui est montré au dehors.", read: "À opposer au Désir : la façade, ce que l'entourage voit." },
        { id: 'nondit', label: "Le Non-dit", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui ne parvient pas à s'exprimer.", read: "Sur l'axe vertical : ce qui bute contre le Verrou et ne sort pas." },
        { id: 'miroir_syn', label: "Le Miroir", kind: 'substantif', branch: 'axe', polarity: null, adj: 1, logic: "Synthèse du rapport entre les positions précédentes.", read: "Ne s'ajoute pas aux autres : elle dit le rapport entre elles. Se lit en dernier." }
      ]
    },

    /* ===================== Le Verdict ===================== */
    verdict: {
      id: 'verdict',
      name: "Le Verdict",
      subtitle: "Une question fermée",
      count: 16,
      intro: "Une Coupe et cinq positions, dont deux polaires. Le dispositif le plus contraint " +
             "et le plus exposé : une question fermée sur un sujet sensible est celle où le " +
             "lecteur risque le plus de produire la réponse qu'il attend.",
      typologie: { objet: "une question fermée", question: "oui ou non ?", reversible: false, mesure: "test de concordance (positions Pour / Contre)" },
      rules: [
        "La polarité de la carte du Verdict est établie avant le tirage, depuis la table de valence, et jamais ajustée après.",
        "Une carte neutre au Verdict donne une réponse neutre. Elle ne s'interprète pas dans le sens de ce qui est espéré.",
        "La position 5 (Précision) explique et n'annule jamais. Si elle semble contredire le Verdict, c'est la lecture qu'il faut reprendre.",
        "Registre à déclarer, valable pour tout le tirage."
      ],
      senses: [],
      axes: [
        "Pour contre Contre : la seule horizontale mesurable, parce qu'elle est polaire.",
        "Le Pivot fait basculer ; le Verdict tranche ; la Précision éclaire sans renverser."
      ],
      layout: [
        ['coupe_1', 'coupe_2'],
        ['pour', 'contre'],
        ['pivot'],
        ['verdict_pos'],
        ['precision']
      ],
      positions: [
        { id: 'coupe_1', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Climat général. Ne tranche pas la question." },
        { id: 'coupe_2', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Climat général. Ne tranche pas la question." },
        { id: 'pour', label: "Pour", kind: 'substantif', branch: 'pos', polarity: 'favorable', adj: 2, logic: "Ce qui pousse vers le oui.", read: "Avec « Contre », la seule paire mesurable (polaire). À lire en tension, pas à additionner." },
        { id: 'contre', label: "Contre", kind: 'substantif', branch: 'neg', polarity: 'defavorable', adj: 2, logic: "Ce qui pousse vers le non.", read: "Avec « Pour », la seule paire mesurable. Le poids relatif des deux oriente la lecture du Verdict." },
        { id: 'pivot', label: "Pivot", kind: 'fonctionnelle', branch: 'axe', polarity: null, adj: 2, logic: "Ce qui fera basculer.", read: "Ni pour ni contre : le facteur qui peut faire pencher d'un côté. Pas encore la réponse." },
        { id: 'verdict_pos', label: "Verdict", kind: 'substantif', branch: 'axe', polarity: null, adj: 3, logic: "La réponse principale. Se lit selon la grille oui / neutre / non établie hors de tout tirage." },
        { id: 'precision', label: "Précision", kind: 'adjectif', branch: 'axe', polarity: null, logic: "Explique le verdict sans le renverser." }
      ]
    },

    /* ===================== Le Flambeau (Apollon journalier) ===================== */
    flambeau: {
      id: 'flambeau',
      name: "Le Flambeau",
      subtitle: "La journée à venir — tiré la veille (aussi appelé Tirage d'Apollon, version journalière)",
      count: 18,
      intro: "Une Coupe et sept positions en flamme. Le seul tirage répétable, donc le seul " +
             "par lequel la méthode peut être évaluée : il porte sur des faits, il est daté " +
             "d'avance, il permet d'accumuler.",
      typologie: { objet: "une journée", question: "que sera demain ?", reversible: false, mesure: "vérification événementielle (registre circonstanciel, sans exception)" },
      rules: [
        "Registre circonstanciel, sans exception. Une lecture affective se note à part, jamais comme confirmation.",
        "La veille : substantifs, adjectifs, relevés, contexte déjà connu, et trois à six énoncés vérifiables.",
        "Le lendemain : cocher chaque énoncé, sans en ajouter, sans en retirer, sans reformuler.",
        "Ne jamais compter comme réussite une correspondance qui figurait déjà dans le contexte connu."
      ],
      senses: [],
      axes: [
        "L'ordre de lecture suit la forme : la Flamme, puis les deux flancs, puis le Foyer, puis les deux bases, puis la Lueur."
      ],
      layout: [
        ['coupe_1', 'coupe_2'],
        ['flamme'],
        ['braise', 'vent'],
        ['foyer'],
        ['ombre', 'geste'],
        ['lueur']
      ],
      positions: [
        { id: 'coupe_1', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Fond de journée." },
        { id: 'coupe_2', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Fond de journée." },
        { id: 'flamme', label: "Flamme", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "L'énergie dominante du jour.", read: "Se lit en premier : donne le ton de toute la journée." },
        { id: 'braise', label: "Braise", kind: 'substantif', branch: 'axe', polarity: null, adj: 1, logic: "Ce qui vient de la veille et brûle encore.", read: "À opposer au Vent : ce qui pousse de l'intérieur (l'hier) contre ce qui vient du dehors." },
        { id: 'vent', label: "Vent", kind: 'substantif', branch: 'axe', polarity: null, adj: 1, logic: "Ce qui influence ou déstabilise.", read: "À opposer à la Braise : l'extérieur, ce qui peut faire dévier la journée." },
        { id: 'foyer', label: "Foyer", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Le cœur concret de la journée.", read: "L'événement ou la tâche autour de quoi tout tourne." },
        { id: 'ombre', label: "Ombre", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Le risque à surveiller.", read: "À opposer au Geste : le piège d'un côté, le levier de l'autre." },
        { id: 'geste', label: "Geste", kind: 'substantif', branch: 'axe', polarity: null, adj: 2, logic: "Ce qu'il faut faire ou favoriser.", read: "À opposer à l'Ombre : l'action concrète qui aide la journée." },
        { id: 'lueur', label: "Lueur", kind: 'substantif', branch: 'axe', polarity: null, adj: 1, logic: "L'issue du soir, la leçon du jour.", read: "Se lit en dernier : ce qu'on retient une fois la journée passée." }
      ]
    },

    /* ===================== Apollon — le message du jour ===================== */
    apollon: {
      id: 'apollon',
      name: "Apollon — Message du jour",
      subtitle: "Trois cartes, une seule phrase",
      count: 5,
      intro: "Une Coupe (climat général, qui n'annonce pas à elle seule le message) et trois " +
             "cartes qui forment une seule phrase. La carte du milieu porte le substantif ; " +
             "les deux autres le qualifient.",
      typologie: { objet: "la journée", question: "quelle est l'unique chose à savoir ?", reversible: false, mesure: "vérification événementielle" },
      rules: [
        "Les trois cartes forment une seule phrase — jamais trois messages séparés.",
        "La carte 2 (Message) donne le substantif principal ; les cartes 1 et 3 le qualifient.",
        "D'abord le littéral (ce que la carte montre), ensuite le symbolique."
      ],
      senses: [],
      axes: [
        "Lecture : Contexte → Message → Manifestation, comme sujet + verbe + complément."
      ],
      layout: [
        ['coupe_1', 'coupe_2'],
        ['contexte', 'message', 'manifestation']
      ],
      positions: [
        { id: 'coupe_1', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Climat général du jour. N'annonce pas à elle seule le message." },
        { id: 'coupe_2', label: "La Coupe", kind: 'adjectif', branch: 'coupe', polarity: null, logic: "Climat général du jour. N'annonce pas à elle seule le message." },
        { id: 'contexte', label: "Contexte", kind: 'adjectif', branch: 'axe', polarity: null, logic: "Ce qui amène le message.", read: "Qualifie le Message : d'où il vient, dans quel cadre le recevoir." },
        { id: 'message', label: "Message", kind: 'substantif', branch: 'axe', polarity: null, logic: "L'unique chose importante à savoir aujourd'hui.", read: "Le substantif : lis-le seul d'abord, puis qualifié par le Contexte et la Manifestation." },
        { id: 'manifestation', label: "Manifestation", kind: 'adjectif', branch: 'axe', polarity: null, logic: "Comment cela se montre ou agit.", read: "Qualifie le Message : sous quelle forme concrète le repérer dans la journée." }
      ]
    },

    /* ===================== Tirage en croix (tradition classique) ===================== */
    croix: {
      id: 'croix',
      name: "Tirage en croix",
      subtitle: "Cinq cartes — tradition classique, hors méthode d'Hécate",
      count: 5,
      tradition: 'classique',
      intro: "Tirage rapide de la tradition Belline, réputé parmi les plus fiables. " +
             "Cinq positions en croix : ce qui porte, ce qui gêne, la conduite à tenir, " +
             "la tendance, l'évolution probable. Il ne comporte pas de Coupe et ne se mesure pas.",
      typologie: { objet: "une situation", question: "où en est-elle, que faire ?", reversible: false, mesure: "aucune" },
      rules: [
        "Position centrale d'abord (la Réponse), puis les bras : atout, obstacle, conseil, puis l'évolution.",
        "Le substantif porte le sens ; d'abord le littéral, ensuite le symbolique.",
        "Hors méthode d'Hécate : pas de polarité positionnelle, donc pas de test de concordance."
      ],
      senses: [],
      axes: [
        "Vertical : Atout (ce qui soutient) contre Obstacle (ce qui freine) — la tension de la situation.",
        "Horizontal : Conseil (à gauche) et Évolution (à droite) — ce qu'on peut faire, ce vers quoi cela va."
      ],
      layout: [
        ['cx_atout'],
        ['cx_conseil', 'cx_reponse', 'cx_evolution'],
        ['cx_obstacle']
      ],
      positions: [
        { id: 'cx_atout', label: "Atout", kind: 'substantif', branch: 'pos', polarity: null, logic: "Ce qui soutient, ce sur quoi s'appuyer.", read: "En haut : la ressource. À mettre en regard de l'Obstacle." },
        { id: 'cx_conseil', label: "Conseil", kind: 'substantif', branch: 'axe', polarity: null, logic: "La conduite à tenir.", read: "À gauche de la Réponse : l'attitude juste, pas encore le résultat." },
        { id: 'cx_reponse', label: "Réponse", kind: 'substantif', branch: 'axe', polarity: null, logic: "Le cœur de la situation, la réponse principale.", read: "Se lit en premier : tout le reste la qualifie." },
        { id: 'cx_evolution', label: "Évolution", kind: 'substantif', branch: 'axe', polarity: null, logic: "Ce vers quoi la situation tend.", read: "À droite de la Réponse : la tendance, non un verdict." },
        { id: 'cx_obstacle', label: "Obstacle", kind: 'substantif', branch: 'neg', polarity: null, logic: "Ce qui gêne, ralentit ou complique.", read: "En bas : le frein. À mettre en regard de l'Atout." }
      ]
    },

    /* ===================== Trois cartes (tradition classique) ===================== */
    trois: {
      id: 'trois',
      name: "Trois cartes",
      subtitle: "Passé · Présent · Avenir — lecture rapide, hors méthode d'Hécate",
      count: 3,
      tradition: 'classique',
      intro: "La lecture la plus courte : trois cartes lues comme une phrase, de gauche à droite. " +
             "Positions temporelles — ce qui vient de la veille, l'état actuel, la tendance. " +
             "Sans Coupe et sans mesure.",
      typologie: { objet: "une question ouverte", question: "d'où cela vient, où cela va ?", reversible: false, mesure: "aucune" },
      rules: [
        "Se lit de gauche à droite comme sujet → verbe → complément.",
        "Positions temporelles : elles portent une place dans le temps, pas une valence.",
        "D'abord chaque carte seule, puis la phrase que les trois forment ensemble."
      ],
      senses: [],
      axes: ["La phrase : Passé → Présent → Avenir. Si elle ne se dit pas simplement, la lecture n'est pas finie."],
      layout: [['tr_passe', 'tr_present', 'tr_avenir']],
      positions: [
        { id: 'tr_passe', label: "Passé", kind: 'substantif', branch: 'axe', polarity: null, logic: "Ce qui vient de la veille et pèse encore.", read: "Premier terme de la phrase : la racine." },
        { id: 'tr_present', label: "Présent", kind: 'substantif', branch: 'axe', polarity: null, logic: "L'état actuel, le nœud de la question.", read: "Terme central : la carte qui gouverne." },
        { id: 'tr_avenir', label: "Avenir", kind: 'substantif', branch: 'axe', polarity: null, logic: "La tendance, ce vers quoi cela va.", read: "Dernier terme : une orientation, jamais un verdict." }
      ]
    },

    /* ===================== Roue astrologique (tradition classique) ===================== */
    roue: {
      id: 'roue',
      name: "Roue astrologique",
      subtitle: "Douze maisons — vue d'ensemble, hors méthode d'Hécate",
      count: 12,
      tradition: 'classique',
      intro: "Douze positions, une par maison astrologique, pour une vue d'ensemble d'une " +
             "période (souvent l'année). Chaque carte décrit le domaine de vie de sa maison. " +
             "Lecture longue, sans Coupe et sans mesure.",
      typologie: { objet: "une période de vie", question: "quel climat, domaine par domaine ?", reversible: false, mesure: "aucune" },
      rules: [
        "Une carte par maison ; on lit d'abord chaque maison seule, puis les oppositions (I/VII, IV/X…).",
        "Le substantif porte le domaine ; le littéral avant le symbolique.",
        "Hors méthode d'Hécate : positions fonctionnelles, aucune mesure."
      ],
      senses: [],
      axes: [
        "Axe I / VII : soi et l'autre. Axe IV / X : le foyer et le métier. Axe II / VIII : ce qu'on a, ce qui se transforme.",
        "Les maisons d'angle (I, IV, VII, X) donnent la structure ; les autres la nuancent."
      ],
      layout: [
        ['ma_1', 'ma_2', 'ma_3', 'ma_4'],
        ['ma_5', 'ma_6', 'ma_7', 'ma_8'],
        ['ma_9', 'ma_10', 'ma_11', 'ma_12']
      ],
      positions: [
        { id: 'ma_1', label: "I · Soi", kind: 'substantif', branch: 'axe', polarity: null, logic: "Toi, ton allure, ton élan du moment." },
        { id: 'ma_2', label: "II · Avoirs", kind: 'substantif', branch: 'axe', polarity: null, logic: "Argent, ressources, ce que tu possèdes et gagnes." },
        { id: 'ma_3', label: "III · Échanges", kind: 'substantif', branch: 'axe', polarity: null, logic: "Communication, fratrie, déplacements courts, apprentissages." },
        { id: 'ma_4', label: "IV · Foyer", kind: 'substantif', branch: 'axe', polarity: null, logic: "Maison, famille, racines, vie privée." },
        { id: 'ma_5', label: "V · Création", kind: 'substantif', branch: 'axe', polarity: null, logic: "Amour, plaisir, enfants, ce que tu crées." },
        { id: 'ma_6', label: "VI · Travail", kind: 'substantif', branch: 'axe', polarity: null, logic: "Tâches quotidiennes, santé, hygiène de vie, service." },
        { id: 'ma_7', label: "VII · L'Autre", kind: 'substantif', branch: 'axe', polarity: null, logic: "Couple, associations, contrats, adversaires déclarés." },
        { id: 'ma_8', label: "VIII · Mutations", kind: 'substantif', branch: 'axe', polarity: null, logic: "Crises, transformations, argent commun, ce qui finit et renaît." },
        { id: 'ma_9', label: "IX · Horizons", kind: 'substantif', branch: 'axe', polarity: null, logic: "Voyages lointains, études, sens, convictions, étranger." },
        { id: 'ma_10', label: "X · Métier", kind: 'substantif', branch: 'axe', polarity: null, logic: "Carrière, statut social, réputation, réalisation publique." },
        { id: 'ma_11', label: "XI · Alliés", kind: 'substantif', branch: 'axe', polarity: null, logic: "Amis, réseaux, projets, espérances." },
        { id: 'ma_12', label: "XII · Retrait", kind: 'substantif', branch: 'axe', polarity: null, logic: "Épreuves cachées, solitude, inconscient, ce qui se dénoue en secret." }
      ]
    }

  };

  /* -------------------------------------------------------------------------
   * Tirages personnels (éditeur, ch. 16) — fusionnés dans le registre.
   * ----------------------------------------------------------------------- */
  BELLINE.baseSpreads = Object.assign({}, BELLINE.SPREADS);

  /* Nombre total d'emplacements d'un tirage = substantifs/adjectifs fixes
     + éclaircisseurs d'adjectifs (champ `adj` d'une position). */
  BELLINE.spreadSlots = function (spread) {
    if (!spread || !spread.positions) return 0;
    return spread.positions.reduce(function (n, p) { return n + 1 + (p.adj || 0); }, 0);
  };

  /* Toutes les cartes d'un brouillon, y compris les éclaircisseurs "<id>#aN". */
  BELLINE.spreadEntries = function (spread, cards) {
    if (!spread) return [];
    var posById = {};
    spread.positions.forEach(function (p) { posById[p.id] = p; });
    var out = [];
    Object.keys(cards || {}).forEach(function (key) {
      var n = cards[key];
      if (!n) return;
      var m = key.match(/^(.+)#a(\d+)$/);
      var baseId = m ? m[1] : key;
      var base = posById[baseId];
      if (!base) return;
      var card = BELLINE.cardByNumber(n);
      if (!card) return;
      var pos = m
        ? { id: key, label: base.label + ' — adj. ' + m[2], kind: 'adjectif', branch: base.branch, polarity: null, parent: baseId }
        : base;
      out.push({ posId: key, pos: pos, card: card, isAdj: !!m });
    });
    return out;
  };

  /* -------------------------------------------------------------------------
   * Couples ordonnés (substantif -> ce qui le qualifie), pour la lecture
   * croisée (manuel, ch. 21.3, 22) : ce n'est pas la carte isolée qui revient
   * qui vaut de signe (elle est attendue au volume du jeu), c'est un couple
   * ordonné conservé comme unité d'un tirage à l'autre.
   * ----------------------------------------------------------------------- */
  BELLINE.structuralPairs = function (spread, cards) {
    var entries = BELLINE.spreadEntries(spread, cards);
    var byId = {};
    entries.forEach(function (e) { byId[e.posId] = e; });
    var pairs = [];
    entries.forEach(function (e) {
      var parentId = e.pos.parent;
      if (!parentId || !byId[parentId]) return;
      pairs.push({
        parentCard: byId[parentId].card.number,
        childCard: e.card.number,
        parentLabel: byId[parentId].pos.label,
        childLabel: e.pos.label
      });
    });
    return pairs;
  };

  /* Comparaison de deux tirages consignés — ce qu'une lecture croisée peut
     légitimement produire (ch. 22) : cartes communes, familles communes, et
     couples ordonnés répétés. Ne dit jamais si c'est un « signe » : donne la
     matière, le lecteur juge au vu des trois conditions (objets distincts,
     indépendance, consultant déclaré). */
  BELLINE.compareTirages = function (t1, t2) {
    var a1 = BELLINE.analyzeTirage(t1.spreadId, t1.cards) || { planets: {} };
    var a2 = BELLINE.analyzeTirage(t2.spreadId, t2.cards) || { planets: {} };
    var e1 = BELLINE.spreadEntries(BELLINE.SPREADS[t1.spreadId], t1.cards);
    var e2 = BELLINE.spreadEntries(BELLINE.SPREADS[t2.spreadId], t2.cards);

    var nums1 = {}, nums2 = {};
    e1.forEach(function (e) { nums1[e.card.number] = (nums1[e.card.number] || 0) + 1; });
    e2.forEach(function (e) { nums2[e.card.number] = (nums2[e.card.number] || 0) + 1; });
    var commonCards = Object.keys(nums1).filter(function (n) { return nums2[n]; })
      .map(function (n) { return { number: Number(n), count1: nums1[n], count2: nums2[n] }; });

    var fam1 = Object.keys(a1.planets || {}), fam2 = Object.keys(a2.planets || {});
    var commonFamilies = fam1.filter(function (f) { return fam2.indexOf(f) !== -1; });

    var p1 = BELLINE.structuralPairs(BELLINE.SPREADS[t1.spreadId], t1.cards);
    var p2 = BELLINE.structuralPairs(BELLINE.SPREADS[t2.spreadId], t2.cards);
    var key = function (p) { return p.parentCard + '>' + p.childCard; };
    var k2 = {}; p2.forEach(function (p) { k2[key(p)] = p; });
    var commonPairs = [];
    p1.forEach(function (p) { if (k2[key(p)]) commonPairs.push(p); });

    var d1 = new Date(t1.createdAt), d2 = new Date(t2.createdAt);
    var sameDay = d1.toDateString() === d2.toDateString();

    return {
      sameSpread: t1.spreadId === t2.spreadId,
      sameDay: sameDay,
      commonCards: commonCards,
      commonFamilies: commonFamilies,
      commonPairs: commonPairs,
      total1: e1.length, total2: e2.length
    };
  };

  BELLINE.refreshSpreads = function () {
    var out = Object.assign({}, BELLINE.baseSpreads);
    var custom = (BELLINE.Storage && BELLINE.Storage.getCustomSpreads)
      ? BELLINE.Storage.getCustomSpreads() : [];
    custom.forEach(function (s) {
      if (s && s.id) out[s.id] = Object.assign({ custom: true }, s);
    });
    BELLINE.SPREADS = out;
    return out;
  };

  /* -------------------------------------------------------------------------
   * Analyse d'un tirage : relevés (familles, valences, cartes fortes,
   * cartes en position contraire) + concordance des valences, en version
   * tranchée ET en version « lames fragiles neutralisées » (ch. 24.3).
   * ----------------------------------------------------------------------- */
  function concordOf(entries, neutralizeFragile) {
    var polar = entries.filter(function (e) {
      if (!e.pos.polarity) return false;
      var v = neutralizeFragile && e.card.fragile ? 'neutre' : e.card.valence;
      return v !== 'neutre';
    });
    var concord = polar.filter(function (e) {
      return (e.card.valence === 'positive') === (e.pos.polarity === 'favorable');
    }).length;
    var A = polar.filter(function (e) { return e.pos.polarity === 'favorable'; }).length;
    var aPos = polar.filter(function (e) { return e.card.valence === 'positive'; }).length;
    var r = polar.length ? BELLINE.concordanceP(polar.length, A, aPos, concord) : null;
    return { total: polar.length, concord: concord, entries: polar, A: A, aPos: aPos, p: r ? r.p : null, expected: r ? r.expected : null };
  }

  BELLINE.analyzeTirage = function (spreadId, cards) {
    var spread = BELLINE.SPREADS[spreadId];
    if (!spread) return null;

    var placed = BELLINE.spreadEntries(spread, cards);

    var planets = {}, valences = { positive: 0, negative: 0, neutre: 0 }, fortes = [], contraires = [], fragiles = [];
    placed.forEach(function (e) {
      planets[e.card.planet] = (planets[e.card.planet] || 0) + 1;
      valences[e.card.valence]++;
      if (e.card.forte) fortes.push(e);
      if (e.pos.polarity && e.card.fragile) fragiles.push(e);
      if (e.pos.polarity && e.card.valence !== 'neutre') {
        var favCard = e.card.valence === 'positive';
        if (favCard !== (e.pos.polarity === 'favorable')) contraires.push(e);
      }
    });

    /* Coupe : cartes du décor qui reparaissent dans une position de l'arbre.
       Au-delà de ~20 cartes étalées, c'est attendu — jamais un signe. */
    var coupeNums = placed.filter(function (e) { return e.pos.branch === 'coupe'; }).map(function (e) { return e.card.number; });
    var doublons = placed.filter(function (e) {
      return e.pos.branch !== 'coupe' && coupeNums.indexOf(e.card.number) !== -1;
    });

    return {
      placed: placed.length,
      count: BELLINE.spreadSlots(spread),
      planets: planets,
      valences: valences,
      fortes: fortes,
      contraires: contraires,
      fragiles: fragiles,
      doublons: doublons,
      concordance: concordOf(placed, false),
      concordanceNeutral: concordOf(placed, true)
    };
  };

  /* Loi hypergéométrique : P(concordance >= observée) sous répartition
   * aléatoire des N lames fortes dans les N emplacements polaires.
   * A = emplacements favorables, a = lames de valence positive. */
  BELLINE.concordanceP = function (N, A, a, observed) {
    if (!N) return null;
    var B = N - A;
    function logFact(x) { var s = 0; for (var i = 2; i <= x; i++) s += Math.log(i); return s; }
    function logC(n, k) { return (k < 0 || k > n) ? -Infinity : logFact(n) - logFact(k) - logFact(n - k); }
    var p = 0, expected = 0;
    var xMax = Math.min(A, a);
    for (var x = Math.max(0, a - B); x <= xMax; x++) {
      var pr = Math.exp(logC(A, x) + logC(B, a - x) - logC(N, a)); // P(x positives en position favorable)
      var conc = 2 * x + B - a;
      expected += conc * pr;
      if (conc >= observed) p += pr;
    }
    return { p: p, expected: expected };
  };
})();
