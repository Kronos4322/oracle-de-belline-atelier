/* ---------------------------------------------------------------------------
 * Vue « Méthode » — mémo de lecture, d'après « Lire le Belline — manuel de
 * méthode » et « L'Oracle et la grille ».
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.methode = function (root) {

  var PRINCIPES = [
    "Le jeu parle une langue concrète : commencer par ce que la carte montre, non par ce qu'elle cache.",
    "Un tirage est une phrase : le substantif porte le sens, l'adjectif précise la modalité, l'adjectif ne renverse jamais le substantif.",
    "La position donne la fonction, la carte donne la matière ; ni l'une ni l'autre ne s'efface.",
    "Une carte en désaccord avec sa case ne change pas de nature : elle change d'usage.",
    "Tout ce qui pourrait être ajusté après le tirage doit être fixé avant.",
    "Ce qui n'est pas consigné n'existe pas : sans carnet, il n'y a que des impressions successives."
  ];

  var PROGRESSION = [
    ["Regarder la carte", "Le nom et l'image, au premier degré. Une lame peut être très littérale : Ruine = un bâtiment délabré, Argent = des finances, une carte-personne = une personne réelle."],
    ["Identifier la position", "La place assigne une fonction. Vérifier aussi si la carte est substantif (posée en premier) ou adjectif (ajoutée)."],
    ["Lire le contexte concret", "Relier la lame au réel du consultant : personnes, projet, lieu, santé, argent, documents. L'Eau = la mer, un voyage ; La Table = une réunion ; Découverte = vérifier, observer."],
    ["Combiner", "Le substantif porte le sens, l'adjectif le précise. Puis lire les adjectifs entre eux : ils forment souvent une proposition."],
    ["Repérer personnes et lieux", "Certaines lames désignent directement un homme, une femme, un lieu, un document. Ne pas chercher trop vite un sens caché."],
    ["Ajouter le symbolique", "Une fois le concret trouvé, monter vers la famille planétaire et la dynamique de fond. D'abord le concret, ensuite le symbole — jamais l'inverse."],
    ["Formuler une phrase", "Résumer le tirage en une phrase claire, puis la confronter au réel. Si la phrase ne peut pas être dite simplement, la lecture n'est pas achevée."]
  ];

  var ORDRE = [
    "Relevés préalables : familles planétaires, valences (table figée), cartes fortes, cartes en position contraire.",
    "La Coupe, puis le Guide s'il existe.",
    "Les substantifs seuls, position par position.",
    "Le substantif avec ses adjectifs.",
    "Les adjectifs entre eux.",
    "Le test de valence contraire, par énumération écrite.",
    "Les axes : verticaux, puis horizontaux.",
    "Les paires et parallélismes.",
    "La couche symbolique et planétaire.",
    "Une phrase de synthèse, confrontée au réel."
  ];

  var COUPLES = [
    ["Feu / Eau", "intensité contre fluidité", "deux manières de vivre la même énergie"],
    ["Ruine / Entreprises", "destruction contre construction", "défaire ou refaire une structure"],
    ["Retard / Changement", "répétition contre transformation", "la roue bloquée ou le déplacement"],
    ["Cloître / Trafic", "retrait contre circulation", "s'arrêter ou continuer à faire circuler"]
  ];

  var FAMILLES = [
    ["Soleil", "+1,00", "intégralement favorable — vitalité, reconnaissance, extériorité"],
    ["Jupiter", "+0,86", "valeur, ampleur, sens, ce à quoi l'on tient"],
    ["Vénus", "+0,57", "lien, plaisir, relation, attachement"],
    ["Mercure", "0,00", "exactement neutre — échange, circulation, information, calcul"],
    ["Lune", "−0,29", "affect, réceptivité, ce qui est nocturne ou tu"],
    ["Saturne", "−0,57", "temps, contrainte, limite, structure"],
    ["Mars", "−0,86", "conflit, réaction, initiative brusque"]
  ];

  var DECLARER = [
    "Sens de lecture (dans un dispositif réversible) : assigné par le temps, jamais choisi. Ne pas mêler les deux sens.",
    "Registre : affectif ou circonstanciel, valable pour tout le tirage. L'autre registre se note à part et ne confirme jamais.",
    "Interlocuteurs : qui tire, de qui il est question, qui est le consultant au sens du jeu.",
    "Critères de coïncidence : ce qui compterait comme récurrence notable, avant de comparer deux tirages.",
    "Énoncés vérifiables : trois à six propositions falsifiables, écrites avant tout événement.",
    "Délai : la date avant laquelle la question ne sera pas reposée.",
    "Photographie du premier niveau : les substantifs seuls, avant tout ajout d'adjectif."
  ];

  function li(arr) { return '<ul>' + arr.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; }
  function ol(arr) { return '<ol>' + arr.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; }

  root.innerHTML =
    '<div class="view-head"><h1>Méthode</h1>' +
      '<p class="muted">Mémo de lecture — d\'après <em>Lire le Belline</em> et <em>L\'Oracle et la grille</em>.</p></div>' +

    '<div class="method">' +

      '<section class="method-card"><h2>Les six principes</h2>' + ol(PRINCIPES) + '</section>' +

      '<section class="method-card"><h2>La règle d\'or — du littéral au symbolique</h2>' +
        '<p class="muted">Ne pas chercher d\'abord ce que la carte cache. Regarder d\'abord ce qu\'elle montre.</p>' +
        '<ol class="method-steps">' +
          PROGRESSION.map(function (s) { return '<li><strong>' + s[0] + '</strong><br><span class="muted">' + s[1] + '</span></li>'; }).join('') +
        '</ol></section>' +

      '<section class="method-card"><h2>L\'ordre canonique de lecture</h2>' + ol(ORDRE) + '</section>' +

      '<section class="method-card"><h2>Le test de valence contraire</h2>' +
        '<ul>' +
          '<li><strong>Carte favorable en position défavorable</strong> → chercher son ombre, son excès, son blocage.</li>' +
          '<li><strong>Carte défavorable en position favorable</strong> → chercher sa fonction constructive.</li>' +
          '<li><strong>Borne stricte</strong> : une carte favorable en position favorable n\'en relève pas.</li>' +
        '</ul>' +
        '<p>« Une lame difficile en bonne position ne devient pas douce : elle devient utile. »</p>' +
        '<p class="muted small">Le test se conduit par énumération écrite, avant l\'interprétation, sur toutes les cartes concernées sans exception.</p>' +
      '</section>' +

      '<section class="method-card"><h2>La grammaire temporelle (réversibilité)</h2>' +
        '<p><strong>Le passé se nomme, l\'avenir se conjugue.</strong></p>' +
        '<ul>' +
          '<li><strong>Vers le bas</strong> — l\'avenir comme possibilité, qu\'on attend. Le nœud d\'action est un verbe, ses éclaircisseurs des adverbes (comment l\'acte se ferait).</li>' +
          '<li><strong>Vers le haut</strong> — le passé comme fait, qu\'on peut savoir. Le nœud d\'action devient un nom d\'événement advenu, ses éclaircisseurs des compléments du nom. On remonte du plus récent au plus ancien.</li>' +
          '<li>Les deux sens ne se mêlent jamais dans une même phrase.</li>' +
        '</ul></section>' +

      '<section class="method-card"><h2>Les couples élémentaires</h2>' +
        '<table class="method-table"><tbody>' +
          COUPLES.map(function (c) { return '<tr><td><strong>' + c[0] + '</strong></td><td class="muted">' + c[1] + '</td><td>' + c[2] + '</td></tr>'; }).join('') +
        '</tbody></table></section>' +

      '<section class="method-card"><h2>Les cartes fortes</h2>' +
        '<p><strong>11 Trahison · 34 Despotisme · 38 Accident · 42 Sagesse · 48 Fatalité</strong></p>' +
        '<p>Elles dominent leur voisinage et fournissent le seul opérateur d\'intensité du jeu. Ne jamais en inventer un autre.</p>' +
        '<p class="muted small">Espérance : 1,6 sur un tirage de 17 cartes · 2,1 sur 22 · 2,7 sur 29. Trois cartes fortes sur 22 surviennent dans un tiers des cas.</p>' +
      '</section>' +

      '<section class="method-card"><h2>L\'orientation des familles</h2>' +
        '<p class="muted small">L\'indice rapporte l\'écart entre lames positives et négatives au nombre de lames de la famille.</p>' +
        '<table class="method-table"><tbody>' +
          FAMILLES.map(function (f) { return '<tr><td><strong>' + f[0] + '</strong></td><td class="method-idx">' + f[1] + '</td><td class="muted">' + f[2] + '</td></tr>'; }).join('') +
        '</tbody></table>' +
        '<p class="muted small">Un tirage riche en Mars ou en Saturne est mécaniquement sombre, sans que cela constitue une information. La distribution planétaire se lit comme un contexte, jamais comme un présage.</p>' +
      '</section>' +

      '<section class="method-card"><h2>Déclarer avant</h2>' +
        '<p class="muted">Sept exigences portent sur la même chose : ce qui pourrait être ajusté après le tirage doit être fixé avant.</p>' +
        li(DECLARER) +
        '<p class="muted small">Aucune règle ne rend le lecteur neutre. Toutes réduisent sa marge de manœuvre après le tirage — c\'est le seul objectif atteignable.</p>' +
      '</section>' +

    '</div>';
};
