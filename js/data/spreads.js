/* ---------------------------------------------------------------------------
 * Modèles de tirage.
 *
 * Chaque position porte :
 *   id     — identifiant interne
 *   label  — nom affiché
 *   kind   — 'substantif' (carte principale, porte le sens)
 *          | 'adjectif'   (carte ajoutée, précise et nuance)
 *   branch — 'axe' | 'neg' | 'pos' | 'coupe'  (pour la mise en page / la teinte)
 *   parent — id de la position qu'elle éclaire (nœuds → voie, éclaircisseurs → nœud)
 *   logic  — à quoi sert cette position dans la lecture
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

(function () {
  function noeudLogic() {
    return "Facteur clé de la branche : à lire soit comme cause (origine), soit comme action (levier possible).";
  }
  function eclairLogic() {
    return "Détaille et affine le sens du nœud auquel il se rattache.";
  }
  function coupeLogic() {
    return "Humeur de fond, climat général ou contexte du tirage.";
  }

  BELLINE.SPREADS = {

    hecate: {
      id: 'hecate',
      name: "Tirage d'Hécate",
      subtitle: "Le grand tirage des chemins",
      count: 22,
      intro: "Un axe central — passé, présent, synthèse — d'où partent deux voies, " +
             "négative et positive. Chaque voie se ramifie en deux nœuds (cause ou " +
             "action), puis chaque nœud en deux éclaircisseurs. La Coupe donne le climat.",

      rules: [
        "Les cartes principales — Guide, Synthèse, Voies, Nœuds — sont les substantifs : elles portent le sens.",
        "Les cartes ajoutées — éclaircisseurs, Coupe — sont des adjectifs : elles précisent et nuancent.",
        "Un adjectif peut lui-même être éclairé par un autre.",
        "On lit d'abord la structure certaine, puis les échos entre cartes voisines."
      ],

      senses: [
        { label: "Lecture descendante (haut → bas)",
          desc: "Présent → futur : conditions, actions, ce que la voie produit." },
        { label: "Lecture ascendante (bas → haut)",
          desc: "Passé → présent : causes, racines, ce qui a construit la situation." }
      ],

      positions: [
        { id: 'guide',       label: "Guide",            kind: 'substantif', branch: 'axe',
          logic: "Ce qui gouverne l'ensemble du tirage : la question centrale qui oriente la lecture." },

        { id: 'passe_neg',   label: "Passé négatif",    kind: 'adjectif',   branch: 'axe',
          logic: "Ce qui, dans le passé, a nui, bloqué ou alourdi la situation." },
        { id: 'present_neg', label: "Présent négatif",  kind: 'adjectif',   branch: 'axe',
          logic: "Tensions actuelles, limites, fatigues ou blocages présents." },
        { id: 'passe_pos',   label: "Passé positif",    kind: 'adjectif',   branch: 'axe',
          logic: "Ce qui, dans le passé, a nourri, aidé ou reste bénéfique." },
        { id: 'present_pos', label: "Présent positif",  kind: 'adjectif',   branch: 'axe',
          logic: "Soutiens actuels, ressources, souvenirs utiles, forces disponibles." },

        { id: 'synthese',    label: "Synthèse / Pivot", kind: 'substantif', branch: 'axe',
          logic: "Synthèse globale, tonalité centrale, clé de lecture. Axe de rotation temporel entre le passé et le futur." },

        { id: 'voie_neg', label: "Voie négative", kind: 'substantif', branch: 'neg',
          logic: "Ce qui pourrait aggraver ou entraîner la situation vers le bas. Substantif principal de la branche." },
        { id: 'voie_pos', label: "Voie positive", kind: 'substantif', branch: 'pos',
          logic: "Ce qui peut aider, améliorer ou faire évoluer favorablement. Substantif principal de la branche." },

        { id: 'noeud_neg_1', label: "Nœud négatif — cause ou action", kind: 'substantif', branch: 'neg', parent: 'voie_neg', logic: noeudLogic() },
        { id: 'noeud_neg_2', label: "Nœud négatif — cause ou action", kind: 'substantif', branch: 'neg', parent: 'voie_neg', logic: noeudLogic() },
        { id: 'noeud_pos_1', label: "Nœud positif — cause ou action", kind: 'substantif', branch: 'pos', parent: 'voie_pos', logic: noeudLogic() },
        { id: 'noeud_pos_2', label: "Nœud positif — cause ou action", kind: 'substantif', branch: 'pos', parent: 'voie_pos', logic: noeudLogic() },

        { id: 'eclair_neg_1', label: "Éclaircisseur négatif", kind: 'adjectif', branch: 'neg', parent: 'noeud_neg_1', logic: eclairLogic() },
        { id: 'eclair_neg_2', label: "Éclaircisseur négatif", kind: 'adjectif', branch: 'neg', parent: 'noeud_neg_1', logic: eclairLogic() },
        { id: 'eclair_neg_3', label: "Éclaircisseur négatif", kind: 'adjectif', branch: 'neg', parent: 'noeud_neg_2', logic: eclairLogic() },
        { id: 'eclair_neg_4', label: "Éclaircisseur négatif", kind: 'adjectif', branch: 'neg', parent: 'noeud_neg_2', logic: eclairLogic() },
        { id: 'eclair_pos_1', label: "Éclaircisseur positif", kind: 'adjectif', branch: 'pos', parent: 'noeud_pos_1', logic: eclairLogic() },
        { id: 'eclair_pos_2', label: "Éclaircisseur positif", kind: 'adjectif', branch: 'pos', parent: 'noeud_pos_1', logic: eclairLogic() },
        { id: 'eclair_pos_3', label: "Éclaircisseur positif", kind: 'adjectif', branch: 'pos', parent: 'noeud_pos_2', logic: eclairLogic() },
        { id: 'eclair_pos_4', label: "Éclaircisseur positif", kind: 'adjectif', branch: 'pos', parent: 'noeud_pos_2', logic: eclairLogic() },

        { id: 'coupe_1', label: "La Coupe", kind: 'adjectif', branch: 'coupe', logic: coupeLogic() },
        { id: 'coupe_2', label: "La Coupe", kind: 'adjectif', branch: 'coupe', logic: coupeLogic() }
      ],

      // Lecture croisée : paires de positions dont le rapprochement fait sens.
      crossReadings: [
        { pair: ['voie_neg', 'noeud_neg_1'], note: "La voie négative expliquée par son premier nœud." },
        { pair: ['voie_pos', 'noeud_pos_1'], note: "La voie positive expliquée par son premier nœud." },
        { pair: ['passe_neg', 'present_neg'], note: "Continuité du négatif : d'où vient le blocage actuel." },
        { pair: ['passe_pos', 'present_pos'], note: "Continuité du positif : sur quels acquis s'appuyer." }
      ],

      // Tirage transcrit des planches de référence (8 août 2026).
      example: {
        title: "Exemple — planches de référence (8 août 2026)",
        cards: {
          guide: 33, passe_neg: 32, present_neg: 40, passe_pos: 25, present_pos: 41,
          synthese: 7, voie_neg: 23, voie_pos: 39,
          noeud_neg_1: 30, noeud_neg_2: 38, noeud_pos_1: 52, noeud_pos_2: 45,
          eclair_neg_1: 51, eclair_neg_2: 27, eclair_neg_3: 37, eclair_neg_4: 50,
          eclair_pos_1: 22, eclair_pos_2: 15, eclair_pos_3: 29, eclair_pos_4: 11,
          coupe_1: 23, coupe_2: 8
        },
        phrases: [
          "Descendante positive : Appui devient possible par le Cloître et le Bonheur.",
          "Ascendante positive : le Bonheur se reconstruit à partir d'Amour et de Trahison.",
          "Descendante négative : le Trafic mène au blocage ou à l'explosion.",
          "Ascendante négative : Retard / Union et Feu / Ruine expliquent la crise actuelle."
        ],
        notes: [
          "Trafic + La Table = difficultés à se mettre autour de la table.",
          "Appui + Cloître = soutien grâce au temps et au recul.",
          "Retard + Union = lien qui existe encore, mais freiné.",
          "Accident + Feu = rupture soudaine ou événement brutal.",
          "Ruine + Feu = destruction totale qui transforme, purge.",
          "Entreprises + L'Eau = entreprise qui avance dans l'émotion.",
          "Bonheur + Amour = joie affective et épanouissement."
        ]
      }
    }

  };
})();
