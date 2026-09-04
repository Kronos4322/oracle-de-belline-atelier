/* ---------------------------------------------------------------------------
 * Vue « Tirages »
 *   · les quatre dispositifs de la méthode (Hécate, Miroir, Verdict, Flambeau)
 *   · Apollon (message du jour) et trois tirages de la tradition classique
 *   · un éditeur pour créer ses propres tirages (manuel, ch. 16)
 *
 * Chaque position peut recevoir un substantif et, si `adj` le permet, un à
 * trois éclaircisseurs (clés « <id>#a1 »…). On touche une case -> fenêtre :
 * rôle de la position + recherche pour placer / changer / retirer la carte.
 * Bascule descendant / ascendant pour les dispositifs réversibles.
 * Lecture guidée dans l'ordre canonique (ch. 17).
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.tirages = function (root) {
  var S = BELLINE.Storage;

  function methodIds() { return ['hecate', 'miroir', 'verdict', 'flambeau', 'apollon']; }
  function classicIds() { return ['croix', 'trois', 'roue']; }
  function customIds() { return (S.getCustomSpreads() || []).map(function (s) { return s.id; }); }
  function allIds() { return methodIds().concat(classicIds(), customIds()); }

  var spreadId = S.read('tirage.current', 'hecate');
  if (allIds().indexOf(spreadId) === -1) spreadId = 'hecate';

  var spread, posById, draft, slotKeys;
  var selected = null;      // position affichée dans l'inspecteur (lecture, dans le tirage)
  var pickerOpen = false;   // fenêtre de choix de carte, distincte de l'inspecteur
  var pickerAdvance = false;
  var editorOpen = false;
  var explainOpen = true;
  var guidedStep = -1;   // -1 = fermé
  var boardRO = null;
  var onKey = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function cardName(n) { var c = S.getCard(n); return c ? c.name : ('Carte ' + n); }

  /* Filtre de domaine : ne montrer, à la lecture d'une carte, que ce qui
     concerne le sujet du tirage (professionnel, affectif, santé…). */
  var DOMAINES = [
    ['general',   'Tout le tirage',        ['noyau']],
    ['amour',     'Amour & relations',     ['amour', 'sexualite']],
    ['travail',   'Professionnel & argent', ['travail', 'etudes', 'argent']],
    ['sante',     'Santé & énergie',       ['sante']],
    ['evolution', 'Évolution intérieure',  ['psycho', 'spiritualite']]
  ];
  function domaineDef(k) { return DOMAINES.find(function (d) { return d[0] === k; }) || DOMAINES[0]; }

  function cardExplainHTML(c) {
    if (!c) return '';
    var dk = draft.domaine || 'general';
    var d = domaineDef(dk);
    var dossier = (BELLINE.CARD_DOSSIER || {})[c.number] || {};
    var planche = BELLINE.plancheFor ? BELLINE.plancheFor(c.number) : null;

    var rows = [];
    // ta version (Grimoire) d'abord
    var mineSens = c.sens && (dk === 'general' ? c.sens.general : c.sens[dk === 'travail' ? 'travail' : dk]);
    if (mineSens) rows.push(['Ta fiche — ' + (dk === 'general' ? 'sens général' : d[1].toLowerCase()), mineSens]);
    if (dk === 'general' && c.symbolisme) rows.push(['Ton symbolisme', c.symbolisme]);
    if (c.notes) rows.push(['Tes notes', c.notes]);
    // dossier pour le domaine
    d[2].forEach(function (field) {
      var v = dossier[field];
      if (v && !/transpose son noyau|qualifie le climat|constitue une ressource|logique profonde de la situation/.test(v)) {
        var lbl = { noyau: 'Dossier — noyau', amour: 'Dossier — amour', sexualite: 'Dossier — intimité',
          travail: 'Dossier — travail', etudes: 'Dossier — études', argent: 'Dossier — argent',
          sante: 'Dossier — santé', psycho: 'Dossier — psychologie', spiritualite: 'Dossier — cheminement' }[field] || 'Dossier';
        rows.push([lbl, v]);
      }
    });
    if (planche && planche.cle) rows.push(['Clé de lecture', planche.cle]);
    if (dossier.temporalite && dk === 'general') rows.push(['Temporalité', dossier.temporalite]);
    if (dossier.ouinon && dk === 'general') rows.push(['Oui / Non', dossier.ouinon]);

    if (!rows.length) return '<p class="muted small">Rien de spécifique à « ' + esc(d[1]) + ' » pour cette carte. Complète sa fiche dans le Grimoire.</p>';
    return '<div class="sp-explain-rows">' +
      rows.map(function (r) {
        return '<div class="sp-explain-row"><strong>' + esc(r[0]) + '</strong> ' + esc(r[1]) + '</div>';
      }).join('') +
      '<button type="button" class="btn-link" id="spExplainFiche">Ouvrir la fiche complète</button>' +
    '</div>';
  }

  function loadSpread(id) {
    BELLINE.refreshSpreads();
    spreadId = id;
    S.write('tirage.current', id);
    spread = BELLINE.SPREADS[id];
    posById = {};
    spread.positions.forEach(function (p) { posById[p.id] = p; });
    draft = S.getDraft(id) || { question: '', cards: {}, notes: '', example: false, sens: 'descendant', domaine: 'general' };
    if (!draft.cards) draft.cards = {};
    if (!draft.sens) draft.sens = 'descendant';
    if (!draft.domaine) draft.domaine = 'general';
    slotKeys = [];
    spread.positions.forEach(function (p) {
      slotKeys.push(p.id);
      for (var i = 1; i <= (p.adj || 0); i++) slotKeys.push(p.id + '#a' + i);
    });
    selected = slotKeys.filter(function (k) { return draft.cards[k]; })[0] || null;
    pickerOpen = false;
    guidedStep = -1;
  }
  loadSpread(spreadId);

  function persist() { S.saveDraft(spread.id, draft); }

  function basePos(key) {
    var m = key.match(/^(.+)#a(\d+)$/);
    return m ? posById[m[1]] : posById[key];
  }
  function adjIndexOf(key) { var m = key.match(/#a(\d+)$/); return m ? Number(m[1]) : 0; }
  function slotCount() { return slotKeys.length; }
  function filledCount() { return slotKeys.filter(function (k) { return draft.cards[k]; }).length; }
  function nextEmpty() {
    for (var i = 0; i < slotKeys.length; i++) if (!draft.cards[slotKeys[i]]) return slotKeys[i];
    return null;
  }
  function stepPos(dir) {
    var i = slotKeys.indexOf(selected);
    if (i === -1) return;
    selected = slotKeys[Math.max(0, Math.min(slotKeys.length - 1, i + dir))];
  }
  function usedElsewhere(n) {
    return slotKeys.filter(function (k) { return draft.cards[k] === n && k !== selected; });
  }
  function isReversible() { return !!(spread.typologie && spread.typologie.reversible); }
  function shortLabel(p) {
    var m = {
      guide: 'Guide', synthese: 'Pivot',
      passe_neg: 'Passé −', present_neg: 'Présent −', passe_pos: 'Passé +', present_pos: 'Présent +',
      voie_neg: 'Voie −', voie_pos: 'Voie +', coupe_1: 'Coupe', coupe_2: 'Coupe'
    };
    if (m[p.id]) return m[p.id];
    if (p.id.indexOf('noeud_neg') === 0) return 'Nœud −';
    if (p.id.indexOf('noeud_pos') === 0) return 'Nœud +';
    if (p.id.indexOf('eclair_neg') === 0) return 'Éclair. −';
    if (p.id.indexOf('eclair_pos') === 0) return 'Éclair. +';
    return p.label;
  }

  /* ---------- mise à l'échelle du plateau ---------- */

  function fitBoard(tries) {
    var wrap = root.querySelector('.sp-board-wrap');
    var board = wrap && wrap.querySelector('.spread');
    if (!board) return;
    board.style.transform = 'none';
    board.style.marginLeft = '0';
    var natural = board.offsetWidth;
    var avail = wrap.clientWidth;
    if ((!natural || !avail) && (tries || 0) < 10) {
      setTimeout(function () { fitBoard((tries || 0) + 1); }, 60);
      return;
    }
    if (!natural || !avail) return;
    var scale = Math.min(spread.layout ? 1.4 : 2, avail / natural);
    board.style.transform = 'scale(' + scale + ')';
    board.style.marginLeft = Math.max(0, (avail - natural * scale) / 2) + 'px';
    wrap.style.height = Math.ceil(board.offsetHeight * scale) + 'px';
  }
  function observeBoard() {
    var layout = root.querySelector('.sp-layout');
    if (boardRO) boardRO.disconnect();
    if (!layout || typeof ResizeObserver === 'undefined') return;
    var last = 0;
    boardRO = new ResizeObserver(function () {
      if (!root.contains(layout)) { boardRO.disconnect(); return; }
      var w = layout.clientWidth;
      if (Math.abs(w - last) < 2) return;
      last = w;
      requestAnimationFrame(function () { fitBoard(0); });
    });
    boardRO.observe(layout);
  }

  /* ---------- emplacements ---------- */

  function adjRowHTML(posId) {
    var p = posById[posId];
    if (!p || !p.adj || !draft.cards[posId]) return '';
    var cells = '';
    for (var i = 1; i <= p.adj; i++) {
      var key = posId + '#a' + i;
      var n = draft.cards[key];
      var img = n ? BELLINE.imageFor(n) : null;
      cells += '<button type="button" class="sp-adj' + (n ? ' is-filled' : '') + (selected === key ? ' is-sel' : '') +
        '" data-pos="' + key + '" data-branch="' + p.branch + '" title="Éclaircisseur de ' + esc(p.label) + '">' +
        (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
        '<span class="sp-adj-n">' + (n ? n : '+') + '</span></button>';
    }
    return '<div class="sp-adjrow">' + cells + '</div>';
  }

  function slotHTML(posId) {
    var p = posById[posId];
    var n = draft.cards[posId];
    var img = n ? BELLINE.imageFor(n) : null;
    return '<div class="sp-slot-wrap">' +
      '<button type="button" class="sp-slot' +
        (selected === posId ? ' is-sel' : '') + (n ? ' is-filled' : '') +
        '" data-pos="' + posId + '" data-branch="' + p.branch + '" data-kind="' + p.kind + '">' +
        '<span class="sp-slot-label">' + esc(shortLabel(p)) + '</span>' +
        '<span class="sp-card">' +
          (n
            ? (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
              '<span class="sp-card-num">' + n + '</span>'
            : '<span class="sp-card-empty">+</span>') +
        '</span>' +
        '<span class="sp-card-name">' + (n ? esc(cardName(n)) : '&nbsp;') + '</span>' +
      '</button>' +
      (n ? '<button type="button" class="sp-slot-remove" data-remove="' + posId + '" aria-label="Retirer la carte" title="Retirer la carte">×</button>' : '') +
      adjRowHTML(posId) +
      '</div>';
  }

  function noeudCol(b, i) {
    return '<div class="sp-noeud-col">' +
      slotHTML('noeud_' + b + '_' + i) +
      '<div class="sp-eclairs">' + slotHTML('eclair_' + b + '_' + (i * 2 - 1)) + slotHTML('eclair_' + b + '_' + (i * 2)) + '</div>' +
      '</div>';
  }
  function branchHTML(b) {
    return '<div class="sp-branch" data-branch="' + b + '">' +
      '<div class="sp-branch-title">' + (b === 'neg' ? 'Voie négative' : 'Voie positive') + '</div>' +
      '<div class="sp-voie">' + slotHTML('voie_' + b) + '</div>' +
      '<div class="sp-noeuds">' + noeudCol(b, 1) + noeudCol(b, 2) + '</div>' +
      '</div>';
  }
  function hecateBoardHTML() {
    return '<div class="spread">' +
      '<div class="sp-guide-row">' + slotHTML('guide') + '</div>' +
      '<div class="sp-axis">' +
        '<div class="sp-axis-side">' + slotHTML('passe_neg') + slotHTML('present_neg') + '</div>' +
        '<div class="sp-axis-mid">' + slotHTML('synthese') + '</div>' +
        '<div class="sp-axis-side">' + slotHTML('passe_pos') + slotHTML('present_pos') + '</div>' +
      '</div>' +
      '<div class="sp-branches">' + branchHTML('neg') + branchHTML('pos') + '</div>' +
      '<div class="sp-coupe">' +
        '<span class="sp-coupe-label">La Coupe</span>' +
        '<div class="sp-coupe-cards">' + slotHTML('coupe_1') + slotHTML('coupe_2') + '</div>' +
      '</div>' +
      '</div>';
  }
  function genericBoardHTML() {
    var grid = spread.count <= 9 ? '' : ' is-grid';
    return '<div class="spread spread-rows' + grid + '">' +
      spread.layout.map(function (row) {
        var isCoupe = row.length && posById[row[0]] && posById[row[0]].branch === 'coupe';
        return '<div class="sp-rrow' + (isCoupe ? ' is-coupe' : '') + '">' +
          (isCoupe ? '<span class="sp-coupe-label">La Coupe</span>' : '') +
          '<div class="sp-rrow-cards">' + row.map(slotHTML).join('') + '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }
  function boardHTML() { return spread.layout ? genericBoardHTML() : hecateBoardHTML(); }

  /* ---------- « comment lire » ---------- */

  function readHint(p, key) {
    var asc = isReversible() && draft.sens === 'ascendant';
    if (adjIndexOf(key)) {
      var base = basePos(key);
      if (/— action/.test(base.label))
        return asc ? "Complément du nom : de quoi l'acte qui a eu lieu était fait."
                   : "Adverbe : comment l'acte se ferait.";
      if (/— cause/.test(base.label)) return "Complément du nom : de quoi cette cause est faite.";
      return "Précise et nuance « " + esc(base.label) + " » — sans jamais le renverser.";
    }
    if (p.read) return p.read;
    if (p.branch === 'coupe') return "Se lit AVANT tout le reste. Ne se relie à aucune position : c'est le décor, pas un événement. Ses cartes sont remises au jeu.";
    if (p.id === 'guide') return "Se lit juste après la Coupe. Nomme le régime dans lequel toute la suite se lit — jamais une prédiction.";
    if (p.id === 'synthese') return "Une intention, pas un fait : ce vers quoi le consultant tend, non ce qui arrivera.";
    if (p.id === 'verdict_pos') return "La réponse. Grille oui / neutre / non fixée AVANT le tirage. Carte neutre = réponse neutre.";
    if (p.id === 'precision') return "Éclaire le Verdict, ne l'annule jamais. Si elle semble le contredire, reprends la lecture.";
    if (p.kind === 'substantif' && p.id.indexOf('voie') === 0)
      return "Lis-la seule d'abord : le mot qui gouverne toute la colonne. Les cartes en dessous ne font que le décliner.";
    if (/— cause/.test(p.label)) return "Répond à « pourquoi cette voie ? ». Un nom : une condition.";
    if (/— action/.test(p.label))
      return asc ? "Répond à « par quel geste ? ». En remontant : un nom, l'acte qui a eu lieu."
                 : "Répond à « par quel geste ? ». En descendant : un verbe, l'acte à faire ou éviter.";
    if (p.polarity && p.branch === 'axe')
      return "À mettre en regard de son homologue de l'autre colonne : les deux ne coïncident pas, et c'est le sens.";
    if (p.parent) return "Précise et nuance « " + esc((posById[p.parent] || {}).label || '') + " » — sans jamais le renverser.";
    return "Lis d'abord la carte seule (ce qu'elle montre), puis dans le rôle de la position.";
  }

  function contraireNote(pos, card) {
    if (!card || !pos.polarity || card.valence === 'neutre') return '';
    var favCard = card.valence === 'positive';
    if (favCard === (pos.polarity === 'favorable')) return '';
    var msg = favCard
      ? 'Carte favorable en position défavorable → chercher son ombre, son excès, son blocage.'
      : 'Carte défavorable en position favorable → chercher sa fonction constructive.';
    return '<p class="sp-contraire"><strong>Test de valence contraire.</strong> ' + esc(msg) +
      (card.fragile ? ' <em>(classement fragile — à confirmer.)</em>' : '') + '</p>';
  }

  /* ---------- sélection & inspecteur (lecture, DANS le tirage) ---------- */

  function selectPos(key) {
    selected = key;
    renderInspector();
    refreshBoardSel();
    var insp = root.querySelector('.sp-inspector');
    if (insp && window.innerWidth < 1000) insp.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function posMeta(key) {
    var isAdj = !!adjIndexOf(key);
    var base = basePos(key);
    var p = isAdj
      ? { id: key, label: 'Éclaircisseur — ' + base.label, kind: 'adjectif', branch: base.branch, polarity: null,
          logic: 'Précise le substantif « ' + base.label + ' » sans en changer la nature.' }
      : base;
    return { isAdj: isAdj, base: base, p: p };
  }

  function inspectorHTML() {
    if (!selected) {
      return '<div class="sp-insp sp-insp-empty">' +
        '<p class="big-symbol">✦</p>' +
        '<p>Touche une position du plateau pour la lire.</p>' +
        '<p class="muted small">Une carte posée s\'explique ici, sans quitter le tirage.</p>' +
      '</div>';
    }
    var m = posMeta(selected);
    var p = m.p, isAdj = m.isAdj, base = m.base;
    var n = draft.cards[selected];
    var c = n ? S.getCard(n) : null;
    var idx = slotKeys.indexOf(selected);
    var read = readHint(p, selected);
    var val = c ? BELLINE.VALENCE[c.valence] : null;

    return '<div class="sp-insp">' +
      '<div class="sp-insp-head">' +
        '<span class="sp-kind sp-kind-' + (p.kind === 'substantif' ? 'substantif' : 'adjectif') + '">' +
          (p.kind === 'substantif' ? 'substantif' : 'adjectif') + '</span>' +
        '<span class="muted small">' + (idx + 1) + ' / ' + slotCount() + '</span>' +
      '</div>' +
      '<h3 class="sp-insp-title">' + esc(p.label) + '</h3>' +

      (c
        ? '<div class="sp-insp-card">' +
            (BELLINE.imageFor(n)
              ? '<button type="button" class="sp-insp-fig is-zoom" id="spInspZoom" style="--hue:' + BELLINE.PLANETS[c.planet].hue + '">' +
                  '<img src="' + BELLINE.imageFor(n) + '" alt=""></button>'
              : '') +
            '<div class="sp-insp-card-txt">' +
              '<strong>' + c.number + ' · ' + esc(c.name) + '</strong>' +
              '<div class="sp-insp-tags">' +
                '<span class="val-tag val-' + c.valence + '">valence ' + (val ? val.label : c.valence) + '</span>' +
                (c.forte ? '<span class="val-tag val-forte">carte forte</span>' : '') +
                (c.fragile ? '<span class="val-tag val-fragile">fragile</span>' : '') +
              '</div>' +
              ((c.keywords && c.keywords.length) ? '<p class="muted small">' + c.keywords.slice(0, 5).map(esc).join(' · ') + '</p>' : '') +
            '</div>' +
          '</div>'
        : '<p class="muted">Aucune carte ici pour l\'instant.</p>') +

      contraireNote(p, c) +

      '<div class="sp-modal-role">' +
        '<p class="sp-modal-logic"><span class="sp-modal-role-h">À quoi sert cette position</span>' + esc(p.logic) + '</p>' +
        (read ? '<p class="sp-modal-read"><span class="sp-modal-role-h">Comment la lire' +
          (isReversible() ? ' — sens ' + esc(draft.sens) : '') + '</span>' + esc(read) + '</p>' : '') +
        (isAdj ? '<p class="muted small">Éclaire : ' + esc(base.label) + '</p>' : '') +
      '</div>' +

      (c
        ? '<details class="sp-explain"' + (explainOpen ? ' open' : '') + '>' +
            '<summary>Explication détaillée' +
              (draft.domaine !== 'general' ? ' — ' + esc(domaineDef(draft.domaine)[1].toLowerCase()) : '') + '</summary>' +
            cardExplainHTML(c) +
          '</details>'
        : '') +

      '<div class="sp-insp-actions">' +
        '<button type="button" class="btn-primary btn-sm" id="spInspChoose">' + (c ? 'Changer la carte' : 'Choisir une carte') + '</button>' +
        (c ? '<button type="button" class="btn-ghost btn-sm" id="spInspClear">Retirer</button>' : '') +
        (c ? '<button type="button" class="btn-ghost btn-sm" id="spInspFiche">Fiche complète</button>' : '') +
      '</div>' +
      '<div class="sp-insp-nav">' +
        '<button type="button" class="btn-ghost btn-sm" id="spInspPrev"' + (idx <= 0 ? ' disabled' : '') + '>← Précédente</button>' +
        '<button type="button" class="btn-ghost btn-sm" id="spInspNext"' + (idx >= slotCount() - 1 ? ' disabled' : '') + '>Suivante →</button>' +
      '</div>' +
    '</div>';
  }

  function renderInspector() {
    var box = root.querySelector('#spInspector');
    if (!box) return;
    box.innerHTML = inspectorHTML();
    var q = function (id) { return box.querySelector(id); };
    if (q('#spInspChoose')) q('#spInspChoose').addEventListener('click', function () { openPicker(selected, false); });
    if (q('#spInspClear')) q('#spInspClear').addEventListener('click', function () {
      delete draft.cards[selected]; draft.example = false; persist();
      renderBoardOnly(); renderInspector();
    });
    if (q('#spInspZoom')) q('#spInspZoom').addEventListener('click', function () {
      BELLINE.lightbox(BELLINE.imageFor(draft.cards[selected]), draft.cards[selected] + ' · ' + cardName(draft.cards[selected]));
    });
    if (q('#spInspFiche')) q('#spInspFiche').addEventListener('click', function () {
      S.write('grimoire.open', draft.cards[selected]); BELLINE.go('grimoire');
    });
    if (q('#spInspPrev')) q('#spInspPrev').addEventListener('click', function () { stepPos(-1); renderInspector(); refreshBoardSel(); });
    if (q('#spInspNext')) q('#spInspNext').addEventListener('click', function () { stepPos(1); renderInspector(); refreshBoardSel(); });
    var expl = box.querySelector('.sp-explain');
    if (expl) {
      expl.addEventListener('toggle', function () { explainOpen = expl.open; });
      var ef = expl.querySelector('#spExplainFiche');
      if (ef) ef.addEventListener('click', function () { S.write('grimoire.open', draft.cards[selected]); BELLINE.go('grimoire'); });
    }
  }

  /* ---------- fenêtre de choix de carte (picker) ---------- */

  function openPicker(key, advance) {
    if (key) selected = key;
    if (!selected) selected = nextEmpty() || slotKeys[0];
    pickerOpen = true;
    pickerAdvance = !!advance;
    renderPicker();
  }
  function closePicker() {
    pickerOpen = false;
    var m = root.querySelector('#spModal');
    if (m) { m.hidden = true; m.innerHTML = ''; }
    refreshBoardSel();
    renderInspector();
  }

  function renderPicker() {
    var box = root.querySelector('#spModal');
    if (!box) return;
    if (!pickerOpen || !selected) { box.hidden = true; box.innerHTML = ''; return; }

    var m = posMeta(selected);
    var p = m.p;
    var n = draft.cards[selected];
    var c = n ? S.getCard(n) : null;
    var idx = slotKeys.indexOf(selected);

    box.innerHTML =
      '<div class="sp-modal-panel">' +
        '<button type="button" class="sp-modal-close" id="spModalClose" aria-label="Fermer">×</button>' +
        '<div class="sp-modal-head">' +
          '<span class="sp-kind sp-kind-' + (p.kind === 'substantif' ? 'substantif' : 'adjectif') + '">' +
            (p.kind === 'substantif' ? 'substantif' : 'adjectif') + '</span>' +
          '<h3>' + esc(p.label) + '</h3>' +
          '<span class="muted small">' + (idx + 1) + ' / ' + slotCount() + '</span>' +
        '</div>' +

        '<div class="sp-combo" id="spCombo">' +
          '<input type="text" id="spComboInput" role="combobox" aria-expanded="false" autocomplete="off" ' +
            'placeholder="' + (c ? 'Changer la carte…' : 'Choisir une carte — nom ou numéro') + '" ' +
            'value="' + (c ? esc(c.number + ' · ' + c.name) : '') + '">' +
          '<button type="button" class="sp-combo-toggle" id="spComboToggle" aria-label="Ouvrir la liste">▾</button>' +
          '<div class="sp-combo-list" id="spComboList" hidden></div>' +
        '</div>' +

        (c
          ? '<div class="sp-modal-current">' +
              '<button type="button" class="sp-current-remove" id="spClear" aria-label="Retirer la carte" title="Retirer la carte">×</button>' +
              '<div><strong>' + c.number + ' · ' + esc(c.name) + '</strong>' +
                ' <span class="val-tag val-' + c.valence + '">valence ' + BELLINE.VALENCE[c.valence].label + '</span>' +
                (c.forte ? ' <span class="val-tag val-forte">carte forte</span>' : '') +
              '</div></div>'
          : '') +

        '<div class="sp-modal-foot">' +
          '<button type="button" class="btn-ghost btn-sm" id="spPrev"' + (idx <= 0 ? ' disabled' : '') + '>← Précédente</button>' +
          '<button type="button" class="btn-ghost btn-sm" id="spNext"' + (idx >= slotCount() - 1 ? ' disabled' : '') + '>Suivante →</button>' +
          '<button type="button" class="btn-primary btn-sm" id="spDone">Terminé</button>' +
        '</div>' +
      '</div>';
    box.hidden = false;

    var combo = box.querySelector('#spCombo');
    var input = box.querySelector('#spComboInput');
    var listEl = box.querySelector('#spComboList');
    var panel = box.querySelector('.sp-modal-panel');
    var typed = '';

    /* La liste est en position fixe (jamais rognée par le défilement du
       panneau) et se recale sur la position de l'input. */
    function placeList() {
      if (listEl.hidden) return;
      var r = input.getBoundingClientRect();
      var below = window.innerHeight - r.bottom;
      listEl.style.left = r.left + 'px';
      listEl.style.width = r.width + 'px';
      if (below < 220 && r.top > below) {
        listEl.style.top = 'auto';
        listEl.style.bottom = (window.innerHeight - r.top + 4) + 'px';
        listEl.style.maxHeight = Math.min(340, r.top - 12) + 'px';
      } else {
        listEl.style.bottom = 'auto';
        listEl.style.top = (r.bottom + 4) + 'px';
        listEl.style.maxHeight = Math.min(340, below - 12) + 'px';
      }
    }
    function openList() { listEl.hidden = false; input.setAttribute('aria-expanded', 'true'); drawList(); placeList(); }
    function closeList() {
      listEl.hidden = true; input.setAttribute('aria-expanded', 'false'); typed = '';
      var cur = draft.cards[selected];
      input.value = cur ? (cur + ' · ' + cardName(cur)) : '';
    }
    if (panel) panel.addEventListener('scroll', placeList);
    function drawList() {
      var f = typed.trim().toLowerCase();
      var items = BELLINE.SEED_CARDS.filter(function (x) {
        if (!f) return true;
        return x.name.toLowerCase().indexOf(f) !== -1 || String(x.number).indexOf(f) === 0;
      });
      listEl.innerHTML = items.length
        ? items.map(function (x) {
            var here = draft.cards[selected] === x.number;
            var elsw = usedElsewhere(x.number).map(function (k) { var b = basePos(k); return b ? shortLabel(b) : k; });
            return '<button type="button" class="sp-opt' + (here ? ' on' : '') + (elsw.length ? ' used' : '') + '" data-n="' + x.number + '">' +
              '<span class="sp-opt-n">' + x.number + '</span>' +
              '<span class="sp-opt-name">' + esc(x.name) + '</span>' +
              '<span class="sp-opt-val val-' + x.valence + '" title="valence ' + BELLINE.VALENCE[x.valence].label + '">●</span>' +
              (x.forte ? '<span class="sp-opt-forte" title="carte forte">★</span>' : '') +
              (elsw.length ? '<span class="sp-opt-used">déjà en ' + esc(elsw[0]) + '</span>' : '') +
              '</button>';
          }).join('')
        : '<p class="sp-opt-empty muted">Aucune carte.</p>';
      listEl.querySelectorAll('.sp-opt').forEach(function (b) {
        b.addEventListener('mousedown', function (e) {
          e.preventDefault();
          var wasEmpty = !draft.cards[selected];
          draft.cards[selected] = Number(b.dataset.n);
          draft.example = false;
          persist();
          renderBoardOnly();
          if (pickerAdvance && wasEmpty) { var nx = nextEmpty(); if (nx) selected = nx; else { closePicker(); return; } }
          else { closePicker(); return; }
          renderPicker();
        });
      });
    }

    input.addEventListener('focus', function () { typed = ''; input.value = ''; openList(); });
    input.addEventListener('input', function () { typed = input.value; if (listEl.hidden) openList(); else { drawList(); placeList(); } });
    box.querySelector('#spComboToggle').addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (listEl.hidden) input.focus(); else closeList();
    });
    // Cliquer/glisser la barre de défilement de la liste ne doit pas fermer la liste
    // (sinon le blur de l'input la referme avant que le clic n'aboutisse).
    listEl.addEventListener('mousedown', function (e) { if (e.target === listEl) e.preventDefault(); });
    var blurTimer = null;
    input.addEventListener('blur', function () { blurTimer = setTimeout(closeList, 160); });
    listEl.addEventListener('pointerdown', function () { if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; } });
    box.querySelector('.sp-modal-panel').addEventListener('mousedown', function (e) {
      if (!listEl.hidden && !combo.contains(e.target)) closeList();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !listEl.hidden) { e.stopPropagation(); closeList(); input.blur(); }
      else if (e.key === 'Enter') {
        var first = listEl.querySelector('.sp-opt');
        if (first && !listEl.hidden) { e.preventDefault(); first.dispatchEvent(new MouseEvent('mousedown')); }
      }
    });

    var q = function (id) { return box.querySelector(id); };
    q('#spModalClose').addEventListener('click', closePicker);
    q('#spDone').addEventListener('click', closePicker);
    q('#spPrev').addEventListener('click', function () { stepPos(-1); renderBoardOnly(); renderPicker(); });
    q('#spNext').addEventListener('click', function () { stepPos(1); renderBoardOnly(); renderPicker(); });
    if (q('#spClear')) q('#spClear').addEventListener('click', function () {
      delete draft.cards[selected]; draft.example = false; persist();
      renderBoardOnly(); renderPicker();
    });
    box.onclick = function (e) { if (e.target === box) closePicker(); };
    refreshBoardSel();
  }

  /* ---------- lecture guidée (ordre canonique, ch. 17) ---------- */

  function chip(n) {
    return '<span class="assoc-chip"><b>' + n + '</b> ' + esc(cardName(n)) + '</span>';
  }
  function subsList() {
    return spread.positions.filter(function (p) { return p.kind === 'substantif' && draft.cards[p.id]; });
  }
  function guidedSteps() {
    var a = BELLINE.analyzeTirage(spread.id, draft.cards) || {};
    var steps = [];

    steps.push({ t: "1 · Relevés préalables", h: function () {
      var fam = BELLINE.PLANET_ORDER.filter(function (pk) { return a.planets && a.planets[pk]; })
        .map(function (pk) { return BELLINE.PLANETS[pk].symbol + ' ' + BELLINE.PLANETS[pk].name + ' ×' + a.planets[pk]; }).join(' · ');
      return '<p>Avant d\'interpréter : familles planétaires, valences, cartes fortes, cartes en position contraire.</p>' +
        '<p><span class="muted">Familles :</span> ' + (fam || '—') + '</p>' +
        '<p><span class="muted">Valences :</span> ' + (a.valences ? a.valences.positive + ' + / ' + a.valences.negative + ' − / ' + a.valences.neutre + ' neutre' : '—') + '</p>' +
        '<p><span class="muted">Cartes fortes :</span> ' + ((a.fortes && a.fortes.length) ? a.fortes.map(function (e) { return chip(e.card.number); }).join(' ') : '— aucune') + '</p>' +
        '<p><span class="muted">Positions contraires :</span> ' + ((a.contraires && a.contraires.length) ? a.contraires.map(function (e) { return esc(e.pos.label) + ' (' + chip(e.card.number) + ')'; }).join('<br>') : '— aucune') + '</p>';
    }});

    var coupe = spread.positions.filter(function (p) { return p.branch === 'coupe' && draft.cards[p.id]; });
    if (coupe.length) steps.push({ t: "2 · La Coupe", h: function () {
      return '<p>Le décor devant lequel tout se lit : positif ou négatif, lieu, ambiance. Ne se relie à aucune position.</p>' +
        '<div class="sp-guided-cards">' + coupe.map(function (p) { return chip(draft.cards[p.id]); }).join('') + '</div>' +
        ((a.doublons && a.doublons.length)
          ? '<p class="sp-doublon"><strong>Doublon.</strong> ' + a.doublons.map(function (e) { return chip(e.card.number); }).join(' ') +
            ' reparaît dans l\'arbre. Au-delà de ~20 cartes étalées c\'est attendu — jamais un signe ; se note comme une articulation de sens si elle en a une.</p>'
          : '');
    }});

    if (draft.cards.guide) steps.push({ t: "3 · Le Guide", h: function () {
      return '<p>Sous quelle loi la situation fonctionne actuellement. Ni où l\'on va, ni un présage : l\'atmosphère.</p>' +
        '<div class="sp-guided-cards">' + chip(draft.cards.guide) + '</div>';
    }});

    steps.push({ t: "4 · Les substantifs seuls", h: function () {
      var subs = subsList();
      return subs.length
        ? subs.map(function (p) {
            return '<p><strong>' + esc(p.label) + '</strong> — ' + chip(draft.cards[p.id]) +
              '<br><span class="muted small">' + esc(readHint(p, p.id)) + '</span></p>';
          }).join('')
        : '<p class="muted">Aucun substantif placé.</p>';
    }});

    steps.push({ t: "5 · Les substantifs qualifiés", h: function () {
      var withAdj = spread.positions.filter(function (p) {
        if (!draft.cards[p.id] || !p.adj) return false;
        for (var i = 1; i <= p.adj; i++) if (draft.cards[p.id + '#a' + i]) return true;
        return false;
      });
      return withAdj.length
        ? withAdj.map(function (p) {
            var adjs = [];
            for (var i = 1; i <= p.adj; i++) if (draft.cards[p.id + '#a' + i]) adjs.push(draft.cards[p.id + '#a' + i]);
            return '<p><strong>' + esc(p.label) + '</strong> : ' + chip(draft.cards[p.id]) + ' qualifié par ' +
              adjs.map(chip).join(' ') + '<br><span class="muted small">L\'adjectif précise la modalité — il ne renverse jamais le substantif.</span></p>';
          }).join('')
        : '<p class="muted">Aucun substantif encore qualifié par des adjectifs.</p>';
    }});

    steps.push({ t: "6 · Test de valence contraire", h: function () {
      return (a.contraires && a.contraires.length)
        ? a.contraires.map(function (e) {
            return '<p>' + esc(e.pos.label) + ' : ' + chip(e.card.number) + ' (' + BELLINE.VALENCE[e.card.valence].label + ')<br>' +
              '<span class="muted small">' + (e.card.valence === 'positive'
                ? 'Favorable en position défavorable → chercher son ombre.'
                : 'Défavorable en position favorable → chercher sa fonction constructive.') + '</span></p>';
          }).join('')
        : '<p class="muted">Aucune carte en désaccord avec sa case. Le test ne s\'applique qu\'au désaccord.</p>';
    }});

    if (spread.axes && spread.axes.length) steps.push({ t: "7 · Les axes", h: function () {
      return '<ul class="sp-rules">' + spread.axes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    }});

    var conc = a.concordance;
    if (conc && conc.total >= 2) steps.push({ t: "8 · Concordance des valences", h: function () { return concordanceHTML(a); }});

    steps.push({ t: (spread.axes ? '9' : '8') + " · Phrase de synthèse", h: function () {
      return '<p>Résume le tirage en une phrase claire, puis confronte-la au réel. Si elle ne se dit pas simplement, la lecture n\'est pas achevée.</p>' +
        '<textarea id="spGuidedSynth" class="cj-phrase" style="width:100%;min-height:70px">' + esc(draft.notes || '') + '</textarea>';
    }});

    return steps;
  }

  function guidedHTML() {
    if (guidedStep < 0) return '';
    var steps = guidedSteps();
    var i = Math.max(0, Math.min(steps.length - 1, guidedStep));
    guidedStep = i;
    return '<div class="sp-guided">' +
      '<div class="sp-guided-head"><h3>Lecture guidée</h3>' +
        '<span class="sp-guided-step">étape ' + (i + 1) + ' / ' + steps.length + '</span></div>' +
      '<div class="sp-guided-body"><h4>' + esc(steps[i].t) + '</h4>' + steps[i].h() + '</div>' +
      '<div class="sp-guided-nav">' +
        '<button type="button" class="btn-ghost btn-sm" id="spgPrev"' + (i <= 0 ? ' disabled' : '') + '>←</button>' +
        '<button type="button" class="btn-ghost btn-sm" id="spgNext"' + (i >= steps.length - 1 ? ' disabled' : '') + '>Suivante →</button>' +
        '<button type="button" class="btn-link" id="spgClose">fermer</button>' +
        '<span class="sp-guided-dots">' + steps.map(function (_, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</span>' +
      '</div>' +
      '</div>';
  }

  /* ---------- concordance (tranchée + fragiles neutralisées) ---------- */

  function pct(x) { return (x * 100).toFixed(1).replace('.', ',') + ' %'; }
  function concordanceHTML(a) {
    var c = a.concordance, cn = a.concordanceNeutral;
    if (!c || !c.total) return '<p class="muted">Aucune position polaire renseignée — pas de mesure pour ce tirage.</p>';
    var strong = c.p != null && c.p < 0.1;
    var diverge = c.p != null && cn.p != null && Math.abs(c.p - cn.p) > 0.1;
    return '<div class="conc-block' + (strong ? ' is-strong' : '') + '">' +
      '<div class="conc-row"><span>Table tranchée</span><b>' + c.concord + ' / ' + c.total +
        (c.p != null ? ' — P(≥ observé) ' + pct(c.p) : '') + '</b></div>' +
      (a.fragiles && a.fragiles.length
        ? '<div class="conc-row"><span>Lames fragiles neutralisées (' +
            a.fragiles.map(function (e) { return e.card.number; }).join(', ') + ')</span><b>' +
            cn.concord + ' / ' + cn.total + (cn.p != null ? ' — ' + pct(cn.p) : '') + '</b></div>'
        : '<div class="conc-row"><span>Lames fragiles</span><b>aucune en position polaire</b></div>') +
      '<p class="conc-caveat">Une concordance ne s\'énonce jamais seule (traité, ch. 24.3). ' +
        (diverge
          ? '<strong>Ici les deux versions divergent nettement — le résultat n\'est pas exploitable seul.</strong>'
          : 'Sur peu de lames fortes, un taux parfait ne vaut presque rien ; c\'est l\'écart cumulé sur une série qui compte.') +
      '</p></div>';
  }

  /* ---------- panneau « comment lire » ---------- */

  function readingHTML() {
    var ex = (draft.example && spread.example) ? spread.example : null;
    var t = spread.typologie;
    var a = BELLINE.analyzeTirage(spread.id, draft.cards);
    var polar = a && a.concordance && a.concordance.total >= 2;
    return '<details class="sp-reading"' + (draft.example ? ' open' : '') + '>' +
      '<summary>Comment lire ce tirage</summary>' +
      (t ? '<p class="muted small">Objet : ' + esc(t.objet) + ' · Question : ' + esc(t.question) +
        ' · Réversible : ' + (t.reversible ? 'oui' : 'non') + ' · Mesure : ' + esc(t.mesure) + '</p>' : '') +
      (spread.tradition === 'classique'
        ? '<p class="muted small"><em>Tirage de la tradition classique, hors méthode d\'Hécate : positions sans polarité, aucune mesure.</em></p>' : '') +
      '<ul class="sp-rules">' + (spread.rules || []).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      (spread.senses && spread.senses.length
        ? '<h4>Sens de lecture</h4><div class="sp-senses">' +
          spread.senses.map(function (s) {
            return '<div><strong>' + esc(s.label) + '</strong><br><span class="muted">' + esc(s.desc) + '</span></div>';
          }).join('') + '</div>'
        : '') +
      (spread.axes
        ? '<h4>Les axes</h4><ul class="sp-rules">' + spread.axes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
        : '') +
      (polar ? '<h4>Concordance</h4>' + concordanceHTML(a) : '') +
      (ex
        ? '<div class="sp-example"><h4>Lectures croisées — ' + esc(ex.title) + '</h4>' +
            '<ul>' + ex.phrases.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
            '<h4>Notes de lecture</h4>' +
            '<ul>' + ex.notes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>'
        : '') +
      '</details>';
  }

  /* ---------- éditeur de tirage (ch. 16) ---------- */

  var GENRES = [
    ['fonctionnelle', 'fonctionnelle — porte un rôle, sans valence (pas de mesure)'],
    ['polaire', 'polaire — porte une valence favorable ou défavorable (mesurable)'],
    ['temporelle', 'temporelle — porte une place dans le temps']
  ];

  function editorHTML(editing) {
    var e = editing || { name: '', subtitle: '', intro: '', positions: [{ label: '', genre: 'fonctionnelle', polarity: '' }, { label: '', genre: 'fonctionnelle', polarity: '' }, { label: '', genre: 'fonctionnelle', polarity: '' }] };
    return '<div class="se-wrap">' +
      '<p class="muted small">Manuel, ch. 16 : les positions et leur genre se déclarent AVANT le premier tirage. ' +
      'Seules les positions <em>polaires</em> alimentent le test de concordance.</p>' +
      '<label class="se-field"><span>Nom du tirage</span><input type="text" id="seName" value="' + esc(e.name) + '"></label>' +
      '<label class="se-field"><span>Sous-titre</span><input type="text" id="seSub" value="' + esc(e.subtitle || '') + '"></label>' +
      '<label class="se-field"><span>Présentation (à quoi il sert)</span><textarea id="seIntro" rows="2">' + esc(e.intro || '') + '</textarea></label>' +
      '<div class="se-field"><span>Positions (dans l\'ordre de pose)</span>' +
        '<div class="se-pos-list" id="sePosList"></div>' +
        '<button type="button" class="btn-ghost btn-sm" id="seAddPos">+ position</button>' +
      '</div>' +
      '<div class="fiche-actions">' +
        '<button type="button" class="btn-primary" id="seSave">Créer le tirage</button>' +
        '<button type="button" class="btn-ghost" id="seCancel">Annuler</button>' +
      '</div>' +
    '</div>';
  }

  function renderEditor() {
    var wrapEl = root.querySelector('#spEditor');
    if (!editorOpen) { wrapEl.innerHTML = ''; return; }
    var model = { name: '', subtitle: '', intro: '', positions: [
      { label: 'Situation', genre: 'fonctionnelle', polarity: '' },
      { label: 'Ce qui aide', genre: 'polaire', polarity: 'favorable' },
      { label: 'Ce qui gêne', genre: 'polaire', polarity: 'defavorable' }
    ] };
    wrapEl.innerHTML = editorHTML(model);

    function drawPos() {
      var list = wrapEl.querySelector('#sePosList');
      list.innerHTML = model.positions.map(function (p, i) {
        return '<div class="se-pos" data-i="' + i + '">' +
          '<input type="text" class="se-pl" data-i="' + i + '" placeholder="Nom de la position" value="' + esc(p.label) + '">' +
          '<select class="se-pg" data-i="' + i + '">' +
            GENRES.map(function (g) { return '<option value="' + g[0] + '"' + (p.genre === g[0] ? ' selected' : '') + '>' + esc(g[1]) + '</option>'; }).join('') +
          '</select>' +
          '<select class="se-pp" data-i="' + i + '"' + (p.genre === 'polaire' ? '' : ' disabled') + '>' +
            '<option value=""' + (!p.polarity ? ' selected' : '') + '>—</option>' +
            '<option value="favorable"' + (p.polarity === 'favorable' ? ' selected' : '') + '>favorable</option>' +
            '<option value="defavorable"' + (p.polarity === 'defavorable' ? ' selected' : '') + '>défavorable</option>' +
          '</select>' +
          '<button type="button" class="se-pos-del" data-i="' + i + '" aria-label="Retirer">×</button>' +
        '</div>';
      }).join('');
      list.querySelectorAll('.se-pl').forEach(function (inp) {
        inp.addEventListener('input', function () { model.positions[inp.dataset.i].label = inp.value; });
      });
      list.querySelectorAll('.se-pg').forEach(function (sel) {
        sel.addEventListener('change', function () {
          model.positions[sel.dataset.i].genre = sel.value;
          if (sel.value !== 'polaire') model.positions[sel.dataset.i].polarity = '';
          drawPos();
        });
      });
      list.querySelectorAll('.se-pp').forEach(function (sel) {
        sel.addEventListener('change', function () { model.positions[sel.dataset.i].polarity = sel.value; });
      });
      list.querySelectorAll('.se-pos-del').forEach(function (b) {
        b.addEventListener('click', function () {
          if (model.positions.length <= 2) return;
          model.positions.splice(Number(b.dataset.i), 1); drawPos();
        });
      });
    }
    drawPos();

    wrapEl.querySelector('#seAddPos').addEventListener('click', function () {
      model.positions.push({ label: '', genre: 'fonctionnelle', polarity: '' }); drawPos();
    });
    wrapEl.querySelector('#seCancel').addEventListener('click', function () { editorOpen = false; render(); });
    wrapEl.querySelector('#seSave').addEventListener('click', function () {
      model.name = wrapEl.querySelector('#seName').value.trim();
      model.subtitle = wrapEl.querySelector('#seSub').value.trim();
      model.intro = wrapEl.querySelector('#seIntro').value.trim();
      if (!model.name) { alert('Donne un nom au tirage.'); return; }
      var clean = model.positions.filter(function (p) { return p.label.trim(); });
      if (clean.length < 2) { alert('Il faut au moins deux positions nommées.'); return; }
      var id = 'u_' + S.uid();
      var spreadObj = {
        id: id, name: model.name, subtitle: model.subtitle || 'Tirage personnel',
        intro: model.intro || 'Tirage personnel.', tradition: 'personnel',
        count: clean.length,
        typologie: { objet: 'libre', question: model.name, reversible: false,
          mesure: clean.some(function (p) { return p.genre === 'polaire'; }) ? 'test de concordance (positions polaires)' : 'aucune' },
        rules: ['Positions déclarées avant le premier tirage (ch. 16).', 'Le substantif porte le sens ; le littéral avant le symbolique.'],
        senses: [], axes: [],
        layout: [clean.map(function (_, i) { return id + '_p' + i; })],
        positions: clean.map(function (p, i) {
          return {
            id: id + '_p' + i, label: p.label.trim(),
            kind: 'substantif', branch: p.polarity === 'favorable' ? 'pos' : p.polarity === 'defavorable' ? 'neg' : 'axe',
            polarity: p.genre === 'polaire' ? (p.polarity || null) : null,
            genre: p.genre,
            logic: p.label.trim() + (p.genre === 'polaire' ? ' — position polaire.' : p.genre === 'temporelle' ? ' — position temporelle.' : ' — position fonctionnelle.')
          };
        })
      };
      // layout en rangées de 4 max
      spreadObj.layout = [];
      for (var k = 0; k < spreadObj.positions.length; k += 4) {
        spreadObj.layout.push(spreadObj.positions.slice(k, k + 4).map(function (pp) { return pp.id; }));
      }
      var list = S.getCustomSpreads();
      list.push(spreadObj);
      S.saveCustomSpreads(list);
      editorOpen = false;
      loadSpread(id);
      render();
    });
  }

  /* ---------- rendu global ---------- */

  function tabButton(id, active) {
    return '<button type="button" class="sp-tab' + (active ? ' is-active' : '') + '" data-spread="' + id + '">' +
      esc(BELLINE.SPREADS[id].name) + '</button>';
  }

  function render() {
    if (editorOpen) {
      root.innerHTML =
        '<div class="view-head"><h1>Nouveau tirage</h1>' +
          '<p class="muted">Concevoir un dispositif — manuel, ch. 16.</p></div>' +
        '<div id="spEditor"></div>';
      renderEditor();
      return;
    }

    var custom = customIds();
    root.innerHTML =
      '<div class="view-head">' +
        '<h1>Tirages</h1>' +
        '<div class="sp-picker-tabs">' +
          '<span class="u-label" style="align-self:center">Méthode</span>' +
          methodIds().map(function (id) { return tabButton(id, id === spreadId); }).join('') +
          '<span class="u-label" style="align-self:center">Tradition</span>' +
          classicIds().map(function (id) { return tabButton(id, id === spreadId); }).join('') +
          (custom.length ? '<span class="u-label" style="align-self:center">Mes tirages</span>' +
            custom.map(function (id) { return tabButton(id, id === spreadId); }).join('') : '') +
          '<button type="button" class="sp-tab" id="spNew">+ créer</button>' +
        '</div>' +
        '<h2 class="sp-name">' + esc(spread.name) +
          (spread.custom ? ' <button type="button" class="btn-link" id="spDelSpread">supprimer</button>' : '') + '</h2>' +
        '<p class="muted">' + esc(spread.subtitle) + ' — ' + slotCount() + ' cartes. ' + esc(spread.intro) + '</p>' +
      '</div>' +

      (isReversible()
        ? '<div class="sp-sensbar"><span class="sp-sensbar-label">Sens de lecture</span>' +
            '<button type="button" class="sp-sens-toggle' + (draft.sens === 'descendant' ? ' on' : '') + '" data-sens="descendant">descendant — l\'avenir</button>' +
            '<button type="button" class="sp-sens-toggle' + (draft.sens === 'ascendant' ? ' on' : '') + '" data-sens="ascendant">ascendant — le passé</button>' +
            '<em>' + (draft.sens === 'ascendant'
              ? 'On remonte du plus récent au plus ancien ; le nœud d\'action devient un nom d\'événement advenu.'
              : 'L\'avenir comme possibilité ; le nœud d\'action est un verbe.') + '</em>' +
          '</div>'
        : '') +

      '<div class="sp-toolbar">' +
        '<label class="sp-toolbar-q"><span>Question du tirage</span>' +
          '<input type="text" id="spQuestion" placeholder="Sur quoi porte ce tirage…" value="' + esc(draft.question) + '"></label>' +
        '<label class="sp-domaine"><span class="u-label">Sujet</span>' +
          '<select id="spDomaine">' + DOMAINES.map(function (d) {
            return '<option value="' + d[0] + '"' + (draft.domaine === d[0] ? ' selected' : '') + '>' + esc(d[1]) + '</option>';
          }).join('') + '</select></label>' +
        '<div class="sp-toolbar-btns">' +
          '<button type="button" class="btn-ghost btn-sm" id="spGuided">Lecture guidée</button>' +
          '<button type="button" class="btn-ghost btn-sm" id="spRandom">Tirer au sort</button>' +
          (spread.example
            ? '<button type="button" class="btn-ghost btn-sm" id="spExample">' + (draft.example ? 'Masquer l’exemple' : 'Charger l’exemple') + '</button>' : '') +
          '<button type="button" class="btn-ghost btn-sm" id="spClearAll">Tout effacer</button>' +
          '<button type="button" class="btn-primary btn-sm" id="spSave">Enregistrer</button>' +
        '</div>' +
        '<p class="muted small" id="spCount">' + filledCount() + ' / ' + slotCount() +
          ' cartes placées · touche une position pour la lire et y placer une carte</p>' +
      '</div>' +

      '<div class="sp-layout">' +
        '<div class="sp-board-wrap">' + boardHTML() + '</div>' +
        '<aside class="sp-inspector" id="spInspector"></aside>' +
      '</div>' +
      '<div id="spGuidedWrap">' + guidedHTML() + '</div>' +

      '<label class="field sp-notes"><span>Notes de lecture</span>' +
        '<textarea id="spNotes" rows="4" placeholder="Ce que dit le tirage, les phrases qui se dégagent…">' + esc(draft.notes) + '</textarea></label>' +

      readingHTML() +
      '<div class="sp-modal" id="spModal" hidden></div>';

    bindSlots();
    wireToolbar();
    wireGuided();
    renderInspector();
    if (pickerOpen) renderPicker();
    observeBoard();
    setTimeout(function () { fitBoard(0); }, 0);

    if (onKey) document.removeEventListener('keydown', onKey);
    onKey = function (ev) {
      if (!document.getElementById('spModal')) { document.removeEventListener('keydown', onKey); return; }
      if (ev.key === 'Escape' && pickerOpen) closePicker();
    };
    document.addEventListener('keydown', onKey);
  }

  function bindSlots() {
    root.querySelectorAll('.sp-tab[data-spread]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.spread === spreadId) return;
        loadSpread(b.dataset.spread); render();
      });
    });
    var neu = root.querySelector('#spNew');
    if (neu) neu.addEventListener('click', function () { editorOpen = true; render(); });
    var del = root.querySelector('#spDelSpread');
    if (del) del.addEventListener('click', function () {
      BELLINE.confirm('Supprimer le tirage « ' + spread.name + ' » ? Tes tirages déjà enregistrés au Journal restent.').then(function (ok) {
        if (!ok) return;
        S.saveCustomSpreads(S.getCustomSpreads().filter(function (s) { return s.id !== spread.id; }));
        loadSpread('hecate'); render();
      });
    });
    root.querySelectorAll('.sp-slot, .sp-adj').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.dataset.pos;
        if (draft.cards[key]) selectPos(key); else openPicker(key, true);
      });
    });
    root.querySelectorAll('.sp-slot-remove').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = b.dataset.remove;
        delete draft.cards[id];
        // retirer aussi ses éclaircisseurs
        Object.keys(draft.cards).forEach(function (k) { if (k.indexOf(id + '#a') === 0) delete draft.cards[k]; });
        draft.example = false; persist();
        renderBoardOnly();
        if (selected === id) renderInspector();
      });
    });
  }

  function refreshBoardSel() {
    root.querySelectorAll('.sp-slot, .sp-adj').forEach(function (b) {
      b.classList.toggle('is-sel', b.dataset.pos === selected);
    });
  }

  function renderBoardOnly() {
    var el = root.querySelector('.sp-board-wrap .spread');
    if (el) el.outerHTML = boardHTML();
    bindSlots();
    refreshBoardSel();
    var count = root.querySelector('#spCount');
    if (count) count.textContent = filledCount() + ' / ' + slotCount() + ' cartes placées · touche une position pour la lire et y placer une carte';
    renderInspector();
    var gw = root.querySelector('#spGuidedWrap');
    if (gw && guidedStep >= 0) { gw.innerHTML = guidedHTML(); wireGuided(); }
    setTimeout(function () { fitBoard(0); }, 0);
  }

  function wireGuided() {
    var q = function (id) { return root.querySelector(id); };
    if (q('#spgPrev')) q('#spgPrev').addEventListener('click', function () { guidedStep--; renderGuided(); });
    if (q('#spgNext')) q('#spgNext').addEventListener('click', function () { guidedStep++; renderGuided(); });
    if (q('#spgClose')) q('#spgClose').addEventListener('click', function () { guidedStep = -1; renderGuided(); });
    var synth = q('#spGuidedSynth');
    if (synth) synth.addEventListener('input', function () { draft.notes = synth.value; persist();
      var n = root.querySelector('#spNotes'); if (n) n.value = synth.value; });
  }
  function renderGuided() {
    var gw = root.querySelector('#spGuidedWrap');
    if (gw) { gw.innerHTML = guidedHTML(); wireGuided(); }
  }

  function wireToolbar() {
    root.querySelector('#spQuestion').addEventListener('input', function () { draft.question = this.value; persist(); });
    root.querySelector('#spNotes').addEventListener('input', function () { draft.notes = this.value; persist(); });
    var dom = root.querySelector('#spDomaine');
    if (dom) dom.addEventListener('change', function () {
      draft.domaine = dom.value; persist();
      renderInspector();
      if (pickerOpen) renderPicker();
    });
    root.querySelector('#spGuided').addEventListener('click', function () {
      guidedStep = guidedStep < 0 ? 0 : -1; renderGuided();
    });
    root.querySelectorAll('.sp-sens-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        draft.sens = b.dataset.sens; persist(); render();
      });
    });
    root.querySelector('#spRandom').addEventListener('click', function () {
      var pool = [];
      for (var i = 1; i <= 53; i++) pool.push(i);
      slotKeys.forEach(function (k) { var j = pool.indexOf(draft.cards[k]); if (j !== -1) pool.splice(j, 1); });
      for (var s = pool.length - 1; s > 0; s--) { var r = Math.floor(Math.random() * (s + 1)); var t = pool[s]; pool[s] = pool[r]; pool[r] = t; }
      slotKeys.forEach(function (k) { if (!draft.cards[k] && pool.length) draft.cards[k] = pool.shift(); });
      draft.example = false; pickerOpen = false; selected = slotKeys[0]; persist(); render();
    });
    var exBtn = root.querySelector('#spExample');
    if (exBtn) exBtn.addEventListener('click', function () {
      if (draft.example) { draft.example = false; selected = null; }
      else {
        draft.cards = {};
        Object.keys(spread.example.cards).forEach(function (k) { draft.cards[k] = spread.example.cards[k]; });
        draft.question = spread.example.title;
        draft.example = true;
        selected = Object.keys(spread.example.cards)[0] || null;
      }
      pickerOpen = false; persist(); render();
    });
    root.querySelector('#spClearAll').addEventListener('click', function () {
      BELLINE.confirm('Effacer toutes les cartes placées ?').then(function (ok) {
        if (!ok) return;
        draft = { question: '', cards: {}, notes: '', example: false, sens: draft.sens || 'descendant', domaine: draft.domaine || 'general' };
        selected = null; pickerOpen = false; guidedStep = -1; persist(); render();
      });
    });
    root.querySelector('#spSave').addEventListener('click', function () {
      if (!filledCount()) { alert('Place au moins une carte avant d’enregistrer.'); return; }
      var id = S.uid();
      var list = S.getTirages();
      list.unshift({
        id: id, spreadId: spread.id, createdAt: new Date().toISOString(),
        question: draft.question, cards: JSON.parse(JSON.stringify(draft.cards)),
        notes: draft.notes, sens: draft.sens, carnet: {}
      });
      S.saveTirages(list);
      S.write('journal.justSaved', id);
      BELLINE.go('journal');
    });
  }

  render();
};
