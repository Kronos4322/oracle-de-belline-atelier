/* ---------------------------------------------------------------------------
 * Vue « Tirages » — pour l'instant : le Tirage d'Hécate.
 * Structure du modèle : js/data/spreads.js
 *
 * On touche une position du plateau -> une fenêtre s'ouvre (par-dessus, pas
 * en bas de page) : rôle de la position + recherche pour placer / changer /
 * retirer la carte, avec passage direct à la position suivante.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.tirages = function (root) {
  var S = BELLINE.Storage;
  var SPREAD_IDS = ['hecate', 'miroir', 'verdict', 'flambeau'];

  var spreadId = S.read('tirage.current', 'hecate');
  if (SPREAD_IDS.indexOf(spreadId) === -1) spreadId = 'hecate';

  var spread, posById, draft;
  var selected = null;
  var modalOpen = false;
  var boardRO = null;
  var onKey = null;

  function loadSpread(id) {
    spreadId = id;
    S.write('tirage.current', id);
    spread = BELLINE.SPREADS[id];
    posById = {};
    spread.positions.forEach(function (p) { posById[p.id] = p; });
    draft = S.getDraft(id) || { question: '', cards: {}, notes: '', example: false };
    if (!draft.cards) draft.cards = {};
    selected = null;
    modalOpen = false;
  }
  loadSpread(spreadId);

  function persist() { S.saveDraft(spread.id, draft); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function cardName(n) {
    var c = S.getCard(n);
    return c ? c.name : ('Carte ' + n);
  }
  function shortLabel(p) {
    var m = {
      guide: 'Guide', synthese: 'Synthèse',
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
  function usedElsewhere(n) {
    return Object.keys(draft.cards).filter(function (k) { return draft.cards[k] === n && k !== selected; });
  }
  function nextEmpty() {
    for (var i = 0; i < spread.positions.length; i++) {
      if (!draft.cards[spread.positions[i].id]) return spread.positions[i].id;
    }
    return null;
  }
  function stepPos(dir) {
    var i = spread.positions.findIndex(function (p) { return p.id === selected; });
    if (i === -1) return;
    var j = Math.max(0, Math.min(spread.positions.length - 1, i + dir));
    selected = spread.positions[j].id;
  }
  function filledCount() { return Object.keys(draft.cards).filter(function (k) { return draft.cards[k]; }).length; }

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
    var scale = Math.min(spread.layout ? 1.5 : 2, avail / natural);
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

  /* ---------- slots & plateau ---------- */

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
      '</div>';
  }

  function noeudCol(b, i) {
    var e1 = 'eclair_' + b + '_' + (i * 2 - 1);
    var e2 = 'eclair_' + b + '_' + (i * 2);
    return '<div class="sp-noeud-col">' +
      slotHTML('noeud_' + b + '_' + i) +
      '<div class="sp-eclairs">' + slotHTML(e1) + slotHTML(e2) + '</div>' +
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
    return '<div class="spread spread-rows">' +
      spread.layout.map(function (row, i) {
        var isCoupe = row.length && posById[row[0]] && posById[row[0]].branch === 'coupe';
        return '<div class="sp-rrow' + (isCoupe ? ' is-coupe' : '') + '">' +
          (isCoupe ? '<span class="sp-coupe-label">La Coupe</span>' : '') +
          '<div class="sp-rrow-cards">' + row.map(slotHTML).join('') + '</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  function boardHTML() {
    return spread.layout ? genericBoardHTML() : hecateBoardHTML();
  }

  function readingHTML() {
    var ex = (draft.example && spread.example) ? spread.example : null;
    var t = spread.typologie;
    return '<details class="sp-reading"' + (draft.example ? ' open' : '') + '>' +
      '<summary>Comment lire ce tirage</summary>' +
      (t ? '<p class="muted small">Objet : ' + esc(t.objet) + ' · Question : ' + esc(t.question) +
        ' · Réversible : ' + (t.reversible ? 'oui' : 'non') + ' · Mesure : ' + esc(t.mesure) + '</p>' : '') +
      '<ul class="sp-rules">' + spread.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      (spread.senses && spread.senses.length
        ? '<h4>Sens de lecture</h4><div class="sp-senses">' +
          spread.senses.map(function (s) {
            return '<div><strong>' + esc(s.label) + '</strong><br><span class="muted">' + esc(s.desc) + '</span></div>';
          }).join('') + '</div>'
        : '') +
      (spread.axes
        ? '<h4>Les axes</h4><ul class="sp-rules">' +
            spread.axes.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>'
        : '') +
      (ex
        ? '<div class="sp-example">' +
            '<h4>Lectures croisées — ' + esc(ex.title) + '</h4>' +
            '<ul>' + ex.phrases.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
            '<h4>Notes de lecture</h4>' +
            '<ul>' + ex.notes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
          '</div>'
        : '') +
      '</details>';
  }

  /* Test de valence contraire : carte en désaccord avec la polarité de sa case. */
  function contraireNote(pos, card) {
    if (!card || !pos.polarity || card.valence === 'neutre') return '';
    var favCard = card.valence === 'positive';
    var favPos = pos.polarity === 'favorable';
    if (favCard === favPos) return '';
    var msg = favCard
      ? 'Carte favorable en position défavorable → chercher son ombre, son excès, son blocage.'
      : 'Carte défavorable en position favorable → chercher sa fonction constructive.';
    return '<p class="sp-contraire"><strong>Test de valence contraire.</strong> ' + esc(msg) + '</p>';
  }

  /* ---------- fenêtre : rôle de la position + choix de la carte ---------- */

  function openModal(posId) {
    if (posId) selected = posId;
    if (!selected) selected = nextEmpty() || spread.positions[0].id;
    modalOpen = true;
    renderModal();
  }
  function closeModal() {
    modalOpen = false;
    var m = root.querySelector('#spModal');
    if (m) { m.hidden = true; m.innerHTML = ''; }
    refreshBoardSel();
  }

  function renderModal() {
    var box = root.querySelector('#spModal');
    if (!box) return;
    if (!modalOpen || !selected) { box.hidden = true; box.innerHTML = ''; return; }

    var p = posById[selected];
    var n = draft.cards[selected];
    var c = n ? S.getCard(n) : null;
    var parent = p.parent ? posById[p.parent] : null;
    var idx = spread.positions.findIndex(function (x) { return x.id === selected; });

    var current = '';
    if (c) {
      var val = BELLINE.VALENCE[c.valence];
      current =
        '<div class="sp-modal-current">' +
          '<button type="button" class="sp-current-remove" id="spClear" aria-label="Retirer la carte" title="Retirer la carte">×</button>' +
          '<div><span class="muted small">Carte placée</span><br><strong>' + c.number + ' · ' + esc(c.name) + '</strong>' +
            ((c.keywords && c.keywords.length) ? ' <span class="muted small">— ' + c.keywords.slice(0, 4).map(esc).join(' · ') + '</span>' : '') +
            '<br><span class="val-tag val-' + c.valence + '">valence ' + (val ? val.label : c.valence) + '</span>' +
            (c.forte ? ' <span class="val-tag val-forte">carte forte</span>' : '') +
          '</div>' +
          (BELLINE.imageFor(n)
            ? '<div class="sp-modal-current-btns"><button type="button" class="btn-link" id="spZoom">agrandir</button></div>' : '') +
        '</div>' +
        contraireNote(p, c);
    }

    box.innerHTML =
      '<div class="sp-modal-panel">' +
        '<button type="button" class="sp-modal-close" id="spModalClose" aria-label="Fermer">×</button>' +
        '<div class="sp-modal-head">' +
          '<span class="sp-kind sp-kind-' + p.kind + '">' + (p.kind === 'substantif' ? 'substantif' : 'adjectif') + '</span>' +
          '<h3>' + esc(p.label) + '</h3>' +
        '</div>' +
        '<p class="sp-modal-logic">' + esc(p.logic) + '</p>' +
        (parent ? '<p class="muted small">Éclaire : ' + esc(parent.label) + '</p>' : '') +
        current +
        '<input type="search" id="spModalSearch" placeholder="' + (c ? 'Changer' : 'Choisir') + ' la carte : nom ou numéro…" autocomplete="off">' +
        '<div class="sp-modal-grid" id="spModalGrid"></div>' +
        '<div class="sp-modal-foot">' +
          '<button type="button" class="btn-ghost btn-sm" id="spPrev"' + (idx <= 0 ? ' disabled' : '') + '>← Précédente</button>' +
          '<span class="muted small">' + (idx + 1) + ' / ' + spread.count + '</span>' +
          '<button type="button" class="btn-ghost btn-sm" id="spNext"' + (idx >= spread.count - 1 ? ' disabled' : '') + '>Suivante →</button>' +
          '<button type="button" class="btn-primary btn-sm" id="spDone">Terminé</button>' +
        '</div>' +
      '</div>';
    box.hidden = false;

    var grid = box.querySelector('#spModalGrid');
    var search = box.querySelector('#spModalSearch');

    function drawGrid() {
      var f = (search.value || '').trim().toLowerCase();
      grid.innerHTML = BELLINE.SEED_CARDS.filter(function (x) {
        if (!f) return true;
        return x.name.toLowerCase().indexOf(f) !== -1 || String(x.number) === f;
      }).map(function (x) {
        var here = draft.cards[selected] === x.number;
        var elsw = usedElsewhere(x.number);
        return '<button type="button" class="sp-pick' + (here ? ' on' : '') + (elsw.length ? ' used' : '') +
          '" data-n="' + x.number + '"' + (elsw.length ? ' title="déjà placée ailleurs"' : '') + '>' +
          x.number + '. ' + esc(x.name) + '</button>';
      }).join('');
      grid.querySelectorAll('.sp-pick').forEach(function (b) {
        b.addEventListener('click', function () {
          var wasEmpty = !draft.cards[selected];
          draft.cards[selected] = Number(b.dataset.n);
          draft.example = false;
          persist();
          renderBoardOnly();
          if (wasEmpty) { var nx = nextEmpty(); if (nx) selected = nx; }
          renderModal();
        });
      });
    }
    search.addEventListener('input', drawGrid);
    drawGrid();
    setTimeout(function () { try { search.focus(); } catch (e) {} }, 30);

    var q = function (id) { return box.querySelector(id); };
    q('#spModalClose').addEventListener('click', closeModal);
    q('#spDone').addEventListener('click', closeModal);
    q('#spPrev').addEventListener('click', function () { stepPos(-1); renderBoardOnly(); renderModal(); });
    q('#spNext').addEventListener('click', function () { stepPos(1); renderBoardOnly(); renderModal(); });
    if (q('#spClear')) q('#spClear').addEventListener('click', function () {
      delete draft.cards[selected]; draft.example = false; persist();
      renderBoardOnly(); renderModal();
    });
    if (q('#spZoom')) q('#spZoom').addEventListener('click', function () {
      BELLINE.lightbox(BELLINE.imageFor(draft.cards[selected]), draft.cards[selected] + ' · ' + cardName(draft.cards[selected]));
    });
    box.onclick = function (e) { if (e.target === box) closeModal(); };
    refreshBoardSel();
  }

  /* ---------- rendu global ---------- */

  function render() {
    root.innerHTML =
      '<div class="view-head">' +
        '<h1>Tirages</h1>' +
        '<div class="sp-picker-tabs">' +
          SPREAD_IDS.map(function (id) {
            return '<button type="button" class="sp-tab' + (id === spreadId ? ' is-active' : '') +
              '" data-spread="' + id + '">' + esc(BELLINE.SPREADS[id].name) + '</button>';
          }).join('') +
        '</div>' +
        '<h2 class="sp-name">' + esc(spread.name) + '</h2>' +
        '<p class="muted">' + esc(spread.subtitle) + ' — ' + spread.count + ' cartes. ' + esc(spread.intro) + '</p>' +
      '</div>' +

      '<div class="sp-toolbar">' +
        '<input type="text" id="spQuestion" placeholder="Question du tirage…" value="' + esc(draft.question) + '">' +
        '<div class="sp-toolbar-btns">' +
          '<button type="button" class="btn-ghost btn-sm" id="spRandom">Tirer au sort</button>' +
          (spread.example
            ? '<button type="button" class="btn-ghost btn-sm" id="spExample">' + (draft.example ? 'Masquer l’exemple' : 'Charger l’exemple') + '</button>' : '') +
          '<button type="button" class="btn-ghost btn-sm" id="spClearAll">Tout effacer</button>' +
          '<button type="button" class="btn-primary btn-sm" id="spSave">Enregistrer</button>' +
        '</div>' +
        '<p class="muted small" id="spCount">' + filledCount() + ' / ' + spread.count +
          ' cartes placées · touche une position pour la lire et y placer une carte</p>' +
      '</div>' +

      '<div class="sp-layout">' +
        '<div class="sp-board-wrap">' + boardHTML() + '</div>' +
      '</div>' +

      '<label class="field sp-notes"><span>Notes de lecture</span>' +
        '<textarea id="spNotes" rows="4" placeholder="Ce que dit le tirage, les phrases qui se dégagent…">' + esc(draft.notes) + '</textarea></label>' +

      readingHTML() +
      '<div class="sp-modal" id="spModal" hidden></div>';

    bindSlots();
    wireToolbar();
    if (modalOpen) renderModal();
    observeBoard();
    setTimeout(function () { fitBoard(0); }, 0);

    if (onKey) document.removeEventListener('keydown', onKey);
    onKey = function (e) {
      if (!document.getElementById('spModal')) { document.removeEventListener('keydown', onKey); return; }
      if (e.key === 'Escape' && modalOpen) closeModal();
    };
    document.addEventListener('keydown', onKey);
  }

  function bindSlots() {
    root.querySelectorAll('.sp-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.spread === spreadId) return;
        loadSpread(b.dataset.spread);
        render();
      });
    });
    root.querySelectorAll('.sp-slot').forEach(function (b) {
      b.addEventListener('click', function () { openModal(b.dataset.pos); });
    });
    root.querySelectorAll('.sp-slot-remove').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = b.dataset.remove;
        delete draft.cards[id];
        draft.example = false;
        persist();
        renderBoardOnly();
        if (modalOpen && selected === id) renderModal();
      });
    });
  }

  function refreshBoardSel() {
    root.querySelectorAll('.sp-slot').forEach(function (b) {
      b.classList.toggle('is-sel', b.dataset.pos === selected && modalOpen);
    });
  }

  function renderBoardOnly() {
    root.querySelector('.sp-board-wrap .spread').outerHTML = boardHTML();
    bindSlots();
    refreshBoardSel();
    var count = root.querySelector('#spCount');
    if (count) count.textContent = filledCount() + ' / ' + spread.count +
      ' cartes placées · touche une position pour la lire et y placer une carte';
    setTimeout(function () { fitBoard(0); }, 0);
  }

  function wireToolbar() {
    root.querySelector('#spQuestion').addEventListener('input', function () {
      draft.question = this.value; persist();
    });
    root.querySelector('#spNotes').addEventListener('input', function () {
      draft.notes = this.value; persist();
    });
    root.querySelector('#spRandom').addEventListener('click', function () {
      var pool = [];
      for (var i = 1; i <= 52; i++) pool.push(i);
      Object.keys(draft.cards).forEach(function (k) {
        var j = pool.indexOf(draft.cards[k]); if (j !== -1) pool.splice(j, 1);
      });
      for (var s = pool.length - 1; s > 0; s--) { var r = Math.floor(Math.random() * (s + 1)); var t = pool[s]; pool[s] = pool[r]; pool[r] = t; }
      spread.positions.forEach(function (p) { if (!draft.cards[p.id] && pool.length) draft.cards[p.id] = pool.shift(); });
      draft.example = false; modalOpen = false; persist(); render();
    });
    var exBtn = root.querySelector('#spExample');
    if (exBtn) exBtn.addEventListener('click', function () {
      if (draft.example) { draft.example = false; }
      else {
        draft.cards = {};
        Object.keys(spread.example.cards).forEach(function (k) { draft.cards[k] = spread.example.cards[k]; });
        draft.question = spread.example.title;
        draft.example = true;
      }
      selected = null; modalOpen = false; persist(); render();
    });
    root.querySelector('#spClearAll').addEventListener('click', function () {
      if (!confirm('Effacer toutes les cartes placées ?')) return;
      draft = { question: '', cards: {}, notes: '', example: false };
      selected = null; modalOpen = false; persist(); render();
    });
    root.querySelector('#spSave').addEventListener('click', function () {
      if (!filledCount()) { alert('Place au moins une carte avant d’enregistrer.'); return; }
      var list = S.getTirages();
      list.unshift({
        id: S.uid(), spreadId: spread.id, createdAt: new Date().toISOString(),
        question: draft.question, cards: JSON.parse(JSON.stringify(draft.cards)), notes: draft.notes
      });
      S.saveTirages(list);
      var b = root.querySelector('#spSave');
      b.textContent = 'Enregistré ✓';
      setTimeout(function () { if (b) b.textContent = 'Enregistrer'; }, 2000);
    });
  }

  render();
};
