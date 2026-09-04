/* ---------------------------------------------------------------------------
 * Planches de lecture symbolique — décomposition iconographique d'une carte.
 * D'après les planches « Oracle de Belline — Carte N ».
 *
 * Seules quelques cartes sont couvertes pour l'instant (27, 48). Les autres
 * s'ajoutent au fur et à mesure ; la fiche du Grimoire affiche la section
 * quand une planche existe.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

window.BELLINE.CARD_PLANCHE = {

  27: {
    devise: ["Deux cœurs, un feu, une chaîne, un autel.", "Deux êtres ; une relation."],
    iconographie: [
      "Série de Vénus, écusson vert portant le glyphe de Vénus",
      "Deux cœurs rouges distincts",
      "Flammes communes",
      "Autel central",
      "Guirlande florale ou végétale",
      "Chaîne ou lien autour de l'autel",
      "Symétrie, dualité, complémentarité"
    ],
    sensTraditionnel: "Rapprochement, alliance, couple, engagement, mariage possible, association, partenariat, contrat, collaboration, réconciliation. Le mariage n'est qu'un cas d'application du symbole, non sa seule définition.",
    elements: [
      { nom: "Vénus", points: ["Attraction", "affinité", "harmonie", "douceur", "sensualité", "communion affective", "séduction", "plaisir", "paix du cœur"],
        note: "Vénus produit de l'un à partir du deux sans abolir le deux." },
      { nom: "Cœur", points: ["Centre vital, centre de la personne, de l'intériorité, des sentiments, de la conscience et de la volonté"],
        note: "Les deux cœurs ne fusionnent pas : ils représentent deux centres, donc deux individualités distinctes." },
      { nom: "Feu", points: ["Passion", "énergie", "transformation", "purification", "régénération", "illumination"],
        note: "Ambivalence : il peut vivifier ou consumer." },
      { nom: "Chaîne", points: ["Lien, communication, coordination, action commune, mariage, famille, collectivité"],
        note: "Polarité positive : adhésion spontanée au lien. Polarité négative : contrainte, attachement pesant, enfermement, dépendance." },
      { nom: "Autel", points: ["Lieu où le sacré se condense", "lieu de consécration", "ce qui rend sacré", "centre symbolique"],
        note: "Dans Union, le lien n'est pas seulement affectif : il est élevé, consacré, engagé." }
    ],
    definition: "Union est la mise en relation durable de deux individualités distinctes qui, par attraction et adhésion réciproque, établissent entre elles un lien commun susceptible d'être consacré ou institutionnalisé.",
    lecturesPositives: ["Relation réciproque", "couple", "engagement", "partenariat", "harmonie", "coopération", "alliance", "adhésion libre"],
    lecturesOmbre: ["Lien imposé", "fusion étouffante", "cadre trop lourd", "dépendance", "institution subie", "passion qui consume"],
    cle: "Le problème n'est pas nécessairement la relation elle-même ; il peut résider dans la forme donnée au lien. Union relie sans abolir la dualité.",
    couleur: { nom: "Vert", points: ["Couleur médiane, médiatrice", "espérance, printemps, réveil de la vie", "terre nourricière, règne végétal", "vitalité, guérison, renouvellement", "polarité complexe : vie / mort, bourgeon / moisissure"],
      note: "Le vert de l'écusson vénusien nuance l'union par l'espérance, la fécondité du lien et une force de renouvellement." }
  },

  48: {
    devise: ["Une faux, un fouet, un vieil homme, Saturne.", "Le temps juge, moissonne et tranche."],
    iconographie: [
      "Série de Saturne, écusson gris ou sombre portant le glyphe de Saturne",
      "Homme mûr ou âgé, debout",
      "Faux tenue à la main",
      "Fouet ou verge dans l'autre main",
      "Barbe marquée",
      "Verticalité, gravité, autorité",
      "Palette austère : gris, noir, brun, rouge atténué"
    ],
    sensTraditionnel: "Destin, fatalité, inéluctable, événement imposé, échéance, fin de cycle, coupe, moisson, bilan, perte de contrôle relative, transformation par l'épreuve. La carte n'annonce pas seulement une catastrophe : elle signale souvent ce qui doit être tranché parce que son temps est venu.",
    elements: [
      { nom: "Saturne", points: ["Temps long", "limite", "contraction", "crise", "frein, obstacle", "renoncement", "détachement", "vieillesse", "épreuve", "sagesse austère", "vérité froide"],
        note: "Le temps saturnien conduit la situation jusqu'à son point de vérité." },
      { nom: "Faux", points: ["Coupe", "fin de cycle", "moisson", "tri, séparation", "échéance", "récolte de ce qui a été semé", "fin d'un état ou d'une illusion"],
        note: "La faux ne tue pas seulement : elle tranche ce qui est arrivé à maturité." },
      { nom: "Fouet", points: ["Pouvoir judiciaire", "châtiment", "sanction", "correction", "contrainte", "discipline", "foudre", "énergie créatrice", "terreur salutaire"],
        note: "Quand la vérité n'est pas acceptée librement, elle peut être imposée." },
      { nom: "Homme", points: ["Figure humaine du destin", "l'homme confronté à la loi du temps", "présence concrète : un homme réel peut être désigné"],
        note: "Le personnage peut être à la fois symbole et personne." },
      { nom: "Barbe", points: ["Virilité", "courage", "sagesse", "ancienneté", "autorité", "maturité", "gravité"], note: "" }
    ],
    definition: "Fatalité est le moment où une situation parvenue à maturité rencontre la loi saturnienne de la coupe, de l'épreuve et du bilan. Ce qui devait être tranché l'est ; ce qui devait être corrigé l'est ; la marge de manœuvre se réduit, mais une vérité plus haute peut apparaître.",
    lecturesPositives: ["Tri nécessaire", "bilan juste", "fin salutaire d'un cycle", "lucidité", "dépouillement des illusions", "renoncement fécond", "rectification d'une trajectoire", "transformation mature", "sagesse acquise par l'épreuve"],
    lecturesOmbre: ["Perte imposée", "rupture", "sanction", "impuissance", "mélancolie", "poids du temps", "crise", "événement subi", "situation devenue inévitable", "subir ce qu'on n'a pas voulu régler"],
    cle: "Fatalité n'est pas la destruction pour elle-même ; c'est la moisson saturnienne du réel. Le temps juge, moissonne et tranche.",
    couleur: { nom: "Gris", points: ["Cendre, brouillard", "demi-deuil", "tristesse, mélancolie", "entre-deux, neutralisation", "lucidité froide", "effacement des illusions", "transition, constat"],
      note: "Le gris place la carte dans une zone de constat et de vérité." },
    personnification: "Peut représenter un homme mûr ou âgé, barbu, une figure paternelle ou d'ancien, un homme austère ou autoritaire, un agriculteur ou homme de la terre, une personne d'autorité ou de sanction. Avant d'être symbole du destin, le vieil homme peut simplement désigner un vieil homme."
  }

};

/* ---------------------------------------------------------------------------
 * plancheFor(num) — renvoie la planche écrite à la main si elle existe,
 * sinon une planche allégée dérivée du Dossier encyclopédique (card-dossier.js).
 * Permet d'« approfondir » les 53 cartes sans attendre les planches complètes.
 * ------------------------------------------------------------------------- */
(function () {
  function splitPhrases(s, max) {
    if (!s) return [];
    return String(s).split(/(?<=[.;!?])\s+/).map(function (x) { return x.trim(); })
      .filter(Boolean).slice(0, max || 6);
  }
  function listify(s, max) {
    if (!s) return [];
    return String(s).split(/[;,]|\.\s+/).map(function (x) { return x.trim(); })
      .filter(function (x) { return x.length > 2; }).slice(0, max || 8);
  }

  BELLINE.plancheFor = function (num) {
    num = Number(num);
    var hand = (BELLINE.CARD_PLANCHE || {})[num];
    if (hand) return Object.assign({ source: 'planche' }, hand);

    var d = (BELLINE.CARD_DOSSIER || {})[num];
    if (!d) return null;
    var c = BELLINE.cardByNumber(num);
    var planet = c && BELLINE.PLANETS ? BELLINE.PLANETS[c.planet] : null;
    var mots = (d.motscles || []).slice(0, 6);

    return {
      source: 'dossier',
      devise: [
        (c ? c.name : '') + (mots.length ? ' — ' + mots.join(', ') : ''),
        (planet ? 'Série ' + planet.name + ' : ' + planet.desc : '')
      ].filter(Boolean),
      iconographie: d.icono ? listify(d.icono, 8) : [],
      sensTraditionnel: splitPhrases(d.noyau, 3).join(' '),
      elements: (planet
        ? [{ nom: 'Série ' + planet.name, points: listify(planet.desc, 6), note: '' }]
        : []),
      definition: d.noyau || '',
      lecturesPositives: mots.length ? mots : listify(d.lecture && d.lecture.favorable, 6),
      lecturesOmbre: listify(d.ombre, 8),
      cle: (d.lecture && (d.lecture.pivot || d.lecture.explication)) || '',
      couleur: null,
      personnification: d.personnes || ''
    };
  };
})();
