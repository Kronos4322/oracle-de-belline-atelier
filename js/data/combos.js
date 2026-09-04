/* ---------------------------------------------------------------------------
 * Combinaisons de cartes — le cœur de la pratique du Belline.
 *
 *   « Une carte isolée n'a qu'une valeur provisoire. C'est toujours la
 *     couverture qui signe le verdict final. »
 *
 * Deux dynamiques :
 *   · renforcement  — deux cartes de même polarité s'additionnent
 *   · destruction   — une carte négative annule ou retourne la promesse
 *
 * Sources : Dossier encyclopédique des 53 cartes (logique des modificateurs) ;
 * guides « associations de cartes » de la tradition Belline (kartomanta et
 * autres) pour les paires spécifiques.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

/* Modificateurs universels : une poignée de lames re-colorent n'importe quel
   thème, quel que soit le reste du tirage. Le Dossier en tire 6 régularités. */
BELLINE.MODIFIERS = [
  { card: 53, name: "La Carte Bleue", effet: "protège, atténue, oriente plus favorablement — sans effacer l'événement décrit." },
  { card: 1,  name: "La Destinée",    effet: "transforme le thème en porte, en choix, en tournant déterminant." },
  { card: 5,  name: "La Réussite",    effet: "le thème peut parvenir à un aboutissement favorable." },
  { card: 51, name: "Retard",         effet: "diffère, ralentit ou suspend la manifestation du thème." },
  { card: 48, name: "Fatalité",       effet: "rend le thème plus contraignant, terminal, difficile à éviter." },
  { card: 19, name: "Argent",         effet: "matérialise le thème dans les ressources, les paiements, le patrimoine." }
];

/* Paires et trios traditionnels. `note` = lecture courante ; `sens` = teinte
   (renforce / retourne / précise / temporise). À confronter au tirage réel. */
BELLINE.CLASSIC_COMBOS = [
  // --- amour ---
  { cards: [29, 24], note: "Déclaration, aveu, annonce heureuse dans la relation.", sens: "renforce" },
  { cards: [29, 27], note: "Sentiment qui s'institue : engagement, fiançailles, vie commune.", sens: "renforce" },
  { cards: [29, 13], note: "Attirance sans lendemain, sentiment instable, coup de cœur passager.", sens: "retourne" },
  { cards: [29, 50], note: "Rupture, effondrement du lien, fin brutale d'une histoire.", sens: "retourne" },
  { cards: [29, 51], note: "Amour réel mais ajourné : rien n'avance, l'attente s'installe.", sens: "temporise" },
  { cards: [29, 11], note: "Fidélité rompue, tromperie, promesse trahie.", sens: "retourne" },
  { cards: [29, 45], note: "Bonheur affectif, relation qui rend heureux.", sens: "renforce" },
  { cards: [27, 45], note: "Union heureuse, mariage favorable, alliance qui porte ses fruits.", sens: "renforce" },
  { cards: [27, 33], note: "Union sous tension juridique : contrat disputé, séparation, divorce.", sens: "retourne" },
  { cards: [31, 37], note: "Passion brûlante, désir qui consume, emballement difficile à tenir.", sens: "renforce" },
  // --- argent, travail ---
  { cards: [19, 33], note: "Litige financier, dette réclamée, argent devant la justice.", sens: "précise" },
  { cards: [19, 21], note: "Perte d'argent, vol, dépense subie, trou dans le budget.", sens: "retourne" },
  { cards: [19, 5],  note: "Gain, opération rentable, objectif financier atteint.", sens: "renforce" },
  { cards: [19, 41], note: "Rentrée patrimoniale : succession, donation, capital reçu.", sens: "précise" },
  { cards: [22, 43], note: "Reconnaissance professionnelle, promotion, montée en visibilité.", sens: "renforce" },
  { cards: [22, 50], note: "Projet qui échoue, entreprise qui s'effondre, chantier abandonné.", sens: "retourne" },
  { cards: [5, 7],   note: "Succès public, réussite reconnue, honneur mérité.", sens: "renforce" },
  { cards: [6, 43],  note: "Ascension sociale, notoriété qui grandit.", sens: "renforce" },
  { cards: [33, 34], note: "Procès perdu ou autorité qui écrase : rapport de force défavorable.", sens: "renforce" },
  { cards: [20, 24], note: "Nouvelle bien comprise, information juste, bon raisonnement.", sens: "renforce" },
  // --- nouvelles, voyages, lieux ---
  { cards: [24, 15], note: "Nouvelle qui vient de loin, d'au-delà de l'eau, de l'étranger.", sens: "précise" },
  { cards: [12, 15], note: "Voyage par mer, départ à l'étranger, éloignement géographique.", sens: "précise" },
  { cards: [12, 16], note: "Départ du foyer, déménagement, changement de domicile.", sens: "précise" },
  { cards: [18, 16], note: "Changement dans la maison : travaux, réaménagement, nouvelle vie de famille.", sens: "précise" },
  { cards: [23, 30], note: "On échange sans fabriquer d'espace commun : réunions qui n'aboutissent pas.", sens: "précise" },
  // --- santé ---
  { cards: [17, 48], note: "Maladie grave, pronostic lourd, épreuve du corps qui s'impose.", sens: "renforce" },
  { cards: [17, 53], note: "Guérison, amélioration, sortie de la maladie.", sens: "retourne" },
  { cards: [17, 9],  note: "Convalescence au calme, repos réparateur, santé qui se refait.", sens: "temporise" },
  { cards: [9, 15],  note: "Cure, thermalisme, repos près de l'eau ; santé et détente.", sens: "précise" },
  // --- conflit, épreuve ---
  { cards: [32, 35], note: "Malveillance active : on te veut du mal, hostilité organisée.", sens: "renforce" },
  { cards: [38, 37], note: "Choc soudain qui embrase tout : accident, emportement, crise ouverte.", sens: "renforce" },
  { cards: [37, 50], note: "Le feu atteint la structure : ce qui brûlait finit par ruiner.", sens: "renforce" },
  { cards: [46, 51], note: "Malchance qui s'éternise, guigne tenace, rien ne se débloque.", sens: "renforce" },
  { cards: [50, 22], note: "Défaire pour refaire : une structure tombe, une autre se bâtit.", sens: "retourne" },
  { cards: [47, 22], note: "Projet stérile : effort sans résultat, entreprise qui ne prend pas.", sens: "retourne" },
  // --- couples élémentaires (manuel, ch. 20.3) ---
  { cards: [37, 15], note: "Deux manières de vivre la même énergie : l'intensité contre la fluidité.", sens: "précise" },
  { cards: [50, 22], note: "Destruction contre construction : défaire ou refaire une structure.", sens: "précise" },
  { cards: [51, 18], note: "Répétition contre transformation : la roue bloquée ou le déplacement.", sens: "précise" },
  { cards: [52, 23], note: "Retrait contre circulation : s'arrêter ou continuer à faire circuler.", sens: "précise" },
  // --- issues, tournants ---
  { cards: [1, 48],  note: "Tournant imposé : un choix décisif que les circonstances tranchent.", sens: "renforce" },
  { cards: [14, 11], note: "On découvre une trahison : révélation d'un mensonge, vérité qui éclate.", sens: "précise" },
  { cards: [41, 48], note: "Succession ouverte par un décès : héritage et fin de cycle.", sens: "précise" },
  { cards: [26, 27], note: "Paix retrouvée dans le lien : réconciliation, apaisement du couple.", sens: "renforce" }
];

(function () {
  var byName = {};
  (BELLINE.SEED_CARDS || []).forEach(function (c) { byName[c.number] = c.name; });

  /* Combinaisons impliquant la carte n, prêtes à afficher sur sa fiche. */
  BELLINE.combosFor = function (n) {
    n = Number(n);
    var pairs = BELLINE.CLASSIC_COMBOS.filter(function (x) { return x.cards.indexOf(n) !== -1; })
      .map(function (x) {
        var other = x.cards.filter(function (k) { return k !== n; });
        return {
          cards: x.cards,
          others: other,
          label: x.cards.map(function (k) { return k + ' ' + (byName[k] || ''); }).join('  +  '),
          note: x.note,
          sens: x.sens
        };
      });
    var isModifier = BELLINE.MODIFIERS.some(function (m) { return m.card === n; });
    return { pairs: pairs, isModifier: isModifier, modifiers: BELLINE.MODIFIERS };
  };

  /* Toutes les paires curées, pour amorcer la vue Associations. */
  BELLINE.seedAssociations = function () {
    return BELLINE.CLASSIC_COMBOS.map(function (x) {
      return { cards: x.cards.slice(), text: x.note, sens: x.sens || '' };
    });
  };

  /* -----------------------------------------------------------------------
   * Moteur des 2652 combinaisons — 52 cartes (tout sauf la Carte Bleue,
   * hors-série) × 51 partenaires possibles, en respectant l'ordre
   * grammatical substantif → adjectif (méthode, ch. 18).
   *
   * Trois strates, de la plus sourcée à la plus déduite :
   *   1. « curée »   — une paire du corpus CLASSIC_COMBOS (lecture attestée)
   *   2. « dossier »  — l'adjectif est un des 8 modificateurs universels que
   *                     le Dossier documente carte par carte (combos[])
   *   3. « calculée » — synthèse par la grammaire : noyau du substantif +
   *                     valence/teinte de l'adjectif. Toujours annoncée
   *                     comme telle, jamais présentée comme une source.
   * ------------------------------------------------------------------- */
  var byNumber = {};
  (BELLINE.SEED_CARDS || []).forEach(function (c) { byNumber[c.number] = c; });

  BELLINE.PAIR_COUNT = 52 * 51; // 2652 — total des paires ordonnées hors Carte Bleue

  // Étiquette du modificateur telle qu'elle apparaît dans Dossier[n].combos[i].a
  var MODIFIER_LABEL = {
    53: 'Carte Bleue',
    1: 'La Destinée',
    5: 'Réussite',
    51: 'Retard',
    48: 'Fatalité',
    19: 'Argent'
  };
  // Amour (29) et Union (27) partagent la même case « Amor / Union » du Dossier.
  var AMOR_UNION_CARDS = [29, 27];

  function firstClause(str) {
    if (!str) return '';
    var m = String(str).split(/[;.]/)[0];
    return (m || '').trim();
  }
  function lower1(s) {
    return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  }
  function dossierComboNote(subNum, matchRe) {
    var D = (BELLINE.CARD_DOSSIER || {})[subNum];
    if (!D || !D.combos) return null;
    var hit = D.combos.filter(function (e) { return e && e.a && matchRe.test(e.a); })[0];
    return hit ? hit.note : null;
  }
  function sensFromValences(subValence, adjValence) {
    if (adjValence === 'positive') return subValence === 'negative' ? 'retourne' : (subValence === 'positive' ? 'renforce' : 'precise');
    if (adjValence === 'negative') return subValence === 'positive' ? 'retourne' : (subValence === 'negative' ? 'renforce' : 'precise');
    return 'precise';
  }

  function computedReading(subC, adjC, subD, adjD) {
    subD = subD || {}; adjD = adjD || {};
    var topic = (subD.motscles && subD.motscles.length) ? subD.motscles.slice(0, 3).join(', ')
      : firstClause(subD.noyau) || (subC.sens && subC.sens.general) || subC.name;
    var trait = (adjD.motscles && adjD.motscles.length) ? adjD.motscles[0] : adjC.name;
    var ombre = firstClause(adjD.ombre);
    var sens = sensFromValences(subC.valence, adjC.valence);
    var phrase;
    if (adjC.valence === 'positive') {
      phrase = subC.name + ' qualifiée par ' + adjC.name + ' : ' + lower1(topic) + ', porté(e) ou facilité(e) par ' + lower1(trait) + '.';
    } else if (adjC.valence === 'negative') {
      phrase = subC.name + ' qualifiée par ' + adjC.name + ' : ' + lower1(topic) + ', freiné(e) ou compliqué(e) par ' + lower1(ombre || trait) + '.';
    } else {
      phrase = subC.name + ' qualifiée par ' + adjC.name + ' : ' + lower1(topic) + ', ramenée au registre concret de ' + lower1(trait) + '.';
    }
    return { source: 'calculee', text: phrase, sens: sens };
  }

  /* Lecture de la paire (substantif = thème/base, adjectif = qui qualifie).
     Toujours retourne { source, text, sens, subNum, adjNum } ou null si la
     paire n'est pas valide (carte absente, ou substantif === adjectif). */
  BELLINE.combinationReading = function (subNum, adjNum) {
    subNum = Number(subNum);
    adjNum = Number(adjNum);
    var subC = byNumber[subNum], adjC = byNumber[adjNum];
    if (!subC || !adjC || subNum === adjNum) return null;

    // 1) curée
    var curated = BELLINE.CLASSIC_COMBOS.filter(function (x) {
      return x.cards.length === 2 && x.cards.indexOf(subNum) !== -1 && x.cards.indexOf(adjNum) !== -1;
    })[0];
    if (curated) {
      return { source: 'curee', text: curated.note, sens: curated.sens, subNum: subNum, adjNum: adjNum };
    }

    // 2) dossier — l'adjectif est un modificateur universel documenté
    var note = null, sens2 = null;
    if (MODIFIER_LABEL[adjNum]) {
      note = dossierComboNote(subNum, new RegExp('\\+\\s*' + MODIFIER_LABEL[adjNum].replace('.', '\\.') + '\\s*$', 'i'));
    } else if (AMOR_UNION_CARDS.indexOf(adjNum) !== -1) {
      note = dossierComboNote(subNum, /amor\s*\/\s*union/i);
    }
    if (note) {
      sens2 = sensFromValences(subC.valence, adjC.valence);
      return { source: 'dossier', text: note, sens: sens2, subNum: subNum, adjNum: adjNum };
    }

    // 3) calculée — synthèse grammaticale
    var D = BELLINE.CARD_DOSSIER || {};
    var r = computedReading(subC, adjC, D[subNum], D[adjNum]);
    r.subNum = subNum; r.adjNum = adjNum;
    return r;
  };
})();
