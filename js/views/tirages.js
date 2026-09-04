/* ---------------------------------------------------------------------------
 * Vue « Tirages » — pour l'instant : le Tirage d'Hécate.
 * Structure du modèle : js/data/spreads.js
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.tirages = function (root) {
  var S = BELLINE.Storage;
  var spread = BELLINE.SPREADS.hecate;

  var posById = {};
  spread.positions.forEach(function (p) { posById[p.id] = p; });

  var draft = S.getDraft(spread.id) || { question: '', cards: {}, notes: '', example: false };
  if (!draft.cards) draft.cards = {};

  var selected = null;
  var pickerOpen = false;
  var panelClosed = false;
  var boardRO = null;
  var onScroll = null;

  function persist() { S.saveDraft(spread.id, draft); }

  /* Le plateau est large : on le met à l'échelle pour qu'il tienne toujours
     en entier dans la largeur disponible (jamais de défilement horizontal).
     On mesure la largeur sur le conteneur .sp-layout (dont la taille ne
     dépend pas du plateau), pour éviter toute boucle de redimensionnement. */
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

    var scale = Math.min(2, avail / natural);
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
      requestAnimationFrame(function () { fitBoard(0); positionPop(); });
    });
    boardRO.observe(layout);
  }
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
  function usedAt(n) {
    var ids = [];
    Object.keys(draft.cards).forEach(function (k) { if (draft.cards[k] === n) ids.push(k); });
    return ids;
  }
  function nextEmpty() {
    for (var i = 0; i < spread.positions.length; i++) {
      if (!draft.cards[spread.positions[i].id]) return spread.positions[i].id;
    }
    return null;
  }
  function filledCount() { return Object.keys(draft.cards).filter(function (k) { return draft.cards[k]; }).length; }

  /* ---------- slots & plateau ---------- */

  function slotHTML(posId) {
    var p = posById[posId];
    var n = draft.cards[posId];
    var img = n ? BELLINE.imageFor(n) : null;
    return '<button type="button" class="sp-slot' +
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
      '</button>';
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

  function boardHTML() {
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

  /* ---------- infobulle mobile : suit la position cliquée ---------- */

  function popHTML() {
    var p = posById[selected];
    if (!p) return '';
    var n = draft.cards[selected];
    var c = n ? S.getCard(n) : null;
    var parent = p.parent ? posById[p.parent] : null;

    var cardBlock = '';
    if (c) {
      cardBlock =
        '<div class="sp-panel-card">' +
          '<div class="sp-panel-card-head">' +
            '<strong>' + c.number + ' · ' + esc(c.name) + '</strong>' +
            (BELLINE.imageFor(n) ? '<button type="button" class="btn-link" id="spZoom">agrandir</button>' : '') +
          '</div>' +
          ((c.keywords && c.keywords.length)
            ? '<p class="sp-panel-kw">' + c.keywords.map(esc).join(' · ') + '</p>' : '') +
          (c.sens && c.sens.general ? '<p>' + esc(c.sens.general) + '</p>' : '') +
        '</div>';
    }

    return '<button type="button" class="sp-pop-close" id="spPopClose" aria-label="Fermer">×</button>' +
      '<div class="sp-panel-role">' +
        '<span class="sp-kind sp-kind-' + p.kind + '">' + (p.kind === 'substantif' ? 'substantif' : 'adjectif') + '</span>' +
        '<h3>' + esc(p.label) + '</h3>' +
      '</div>' +
      '<p class="sp-panel-logic">' + esc(p.logic) + '</p>' +
      (parent ? '<p class="muted small">Éclaire : ' + esc(parent.label) + '</p>' : '') +
      cardBlock +
      '<div class="sp-panel-actions">' +
        '<button type="button" class="btn-primary btn-sm" id="spChoose">' + (n ? 'Changer la carte' : 'Placer une carte') + '</button>' +
        (n ? '<button type="button" class="btn-ghost btn-sm" id="spClear">Retirer</button>' : '') +
      '</div>';
  }

  function showPop() {
    var pop = root.querySelector('#spPop');
    if (!pop) return;
    if (!selected || panelClosed || pickerOpen) { pop.hidden = true; pop.innerHTML = ''; return; }
    pop.innerHTML = popHTML();
    pop.hidden = false;
    wirePanel();
    positionPop();
  }

  function positionPop() {
    var pop = root.querySelector('#spPop');
    if (!pop || pop.hidden || !selected) return;
    var slot = root.querySelector('.sp-slot[data-pos="' + selected + '"]');
    if (!slot) return;
    var sr = slot.getBoundingClientRect();
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = 10, topSafe = 62, bottomSafe = vh - 78;
    var left = sr.left + sr.width / 2 - pw / 2;
    left = Math.max(m, Math.min(left, vw - pw - m));
    var below = sr.bottom + 8;
    var above = sr.top - ph - 8;
    var top = (below + ph <= bottomSafe || above < topSafe) ? below : above;
    top = Math.max(topSafe, Math.min(top, Math.max(topSafe, bottomSafe - ph)));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function readingHTML() {
    var ex = draft.example ? spread.example : null;
    return '<details class="sp-reading"' + (draft.example ? ' open' : '') + '>' +
      '<summary>Comment lire ce tirage</summary>' +
      '<ul class="sp-rules">' + spread.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<div class="sp-senses">' +
        spread.senses.map(function (s) {
          return '<div><strong>' + esc(s.label) + '</strong><br><span class="muted">' + esc(s.desc) + '</span></div>';
        }).join('') +
      '</div>' +
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

  /* ---------- rendu global ---------- */

  function render() {
    root.innerHTML =
      '<div class="view-head">' +
        '<h1>' + esc(spread.name) + '</h1>' +
        '<p class="muted">' + esc(spread.subtitle) + ' — ' + spread.count + ' cartes. ' + esc(spread.intro) + '</p>' +
      '</div>' +

      '<div class="sp-toolbar">' +
        '<input type="text" id="spQuestion" placeholder="Question du tirage…" value="' + esc(draft.question) + '">' +
        '<div class="sp-toolbar-btns">' +
          '<button type="button" class="btn-ghost btn-sm" id="spRandom">Tirer au sort</button>' +
          '<button type="button" class="btn-ghost btn-sm" id="spExample">' + (draft.example ? 'Masquer l’exemple' : 'Charger l’exemple') + '</button>' +
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
      '<div id="spPicker"></div>' +
      '<div class="sp-pop" id="spPop" hidden></div>';

    root.querySelectorAll('.sp-slot').forEach(function (b) {
      b.addEventListener('click', function () {
        selected = b.dataset.pos;
        panelClosed = false;
        refreshBoardSel();
        showPop();
      });
    });

    wireToolbar();
    if (pickerOpen) renderPicker();
    showPop();
    observeBoard();
    setTimeout(function () { fitBoard(0); }, 0);

    if (onScroll) { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
    onScroll = function () {
      if (!document.getElementById('spPop')) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        return;
      }
      positionPop();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  function refreshBoardSel() {
    root.querySelectorAll('.sp-slot').forEach(function (b) {
      b.classList.toggle('is-sel', b.dataset.pos === selected);
    });
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
      for (var i = 1; i <= 53; i++) if (i !== 53) pool.push(i); // 1..52 (on garde la carte bleue à part)
      Object.keys(draft.cards).forEach(function (k) {
        var used = draft.cards[k]; var j = pool.indexOf(used); if (j !== -1) pool.splice(j, 1);
      });
      for (var s = pool.length - 1; s > 0; s--) { var r = Math.floor(Math.random() * (s + 1)); var t = pool[s]; pool[s] = pool[r]; pool[r] = t; }
      spread.positions.forEach(function (p) { if (!draft.cards[p.id] && pool.length) draft.cards[p.id] = pool.shift(); });
      draft.example = false; persist(); render();
    });
    root.querySelector('#spExample').addEventListener('click', function () {
      if (draft.example) { draft.example = false; }
      else {
        draft.cards = {};
        Object.keys(spread.example.cards).forEach(function (k) { draft.cards[k] = spread.example.cards[k]; });
        draft.question = 'Exemple des planches de référence';
        draft.example = true;
      }
      selected = null; persist(); render();
    });
    root.querySelector('#spClearAll').addEventListener('click', function () {
      if (!confirm('Effacer toutes les cartes placées ?')) return;
      draft = { question: '', cards: {}, notes: '', example: false };
      selected = null; pickerOpen = false; persist(); render();
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

  function wirePanel() {
    var close = root.querySelector('#spPopClose');
    if (close) close.addEventListener('click', function () { panelClosed = true; showPop(); });
    var choose = root.querySelector('#spChoose');
    if (choose) choose.addEventListener('click', openPicker);
    var clear = root.querySelector('#spClear');
    if (clear) clear.addEventListener('click', function () {
      delete draft.cards[selected]; draft.example = false; persist();
      renderBoardOnly(); showPop();
    });
    var zoom = root.querySelector('#spZoom');
    if (zoom) zoom.addEventListener('click', function () {
      var n = draft.cards[selected];
      BELLINE.lightbox(BELLINE.imageFor(n), n + ' · ' + cardName(n));
    });
  }

  /* ---------- sélecteur de carte ---------- */

  function openPicker() {
    if (!selected) selected = nextEmpty() || spread.positions[0].id;
    pickerOpen = true;
    showPop();
    renderPicker();
    root.querySelector('#spPicker').scrollIntoView({ block: 'nearest' });
  }

  function renderPicker() {
    var box = root.querySelector('#spPicker');
    var p = posById[selected];
    box.innerHTML =
      '<div class="sp-picker">' +
        '<div class="sp-picker-head">' +
          '<span>Carte pour <strong>' + esc(p.label) + '</strong></span>' +
          '<button type="button" class="btn-ghost btn-sm" id="spPickDone">Terminé</button>' +
        '</div>' +
        '<input type="search" id="spPickSearch" placeholder="Filtrer : nom ou numéro…" autocomplete="off">' +
        '<div class="sp-picker-grid" id="spPickGrid"></div>' +
      '</div>';

    var grid = box.querySelector('#spPickGrid');
    var search = box.querySelector('#spPickSearch');

    function draw() {
      var f = (search.value || '').trim().toLowerCase();
      grid.innerHTML = BELLINE.SEED_CARDS.filter(function (c) {
        if (!f) return true;
        return c.name.toLowerCase().indexOf(f) !== -1 || String(c.number) === f;
      }).map(function (c) {
        var here = draft.cards[selected] === c.number;
        var elsewhere = usedAt(c.number).filter(function (id) { return id !== selected; });
        return '<button type="button" class="sp-pick' + (here ? ' on' : '') + (elsewhere.length ? ' used' : '') +
          '" data-n="' + c.number + '" title="' + (elsewhere.length ? 'déjà placée' : '') + '">' +
          c.number + '. ' + esc(c.name) + '</button>';
      }).join('');
      grid.querySelectorAll('.sp-pick').forEach(function (b) {
        b.addEventListener('click', function () {
          draft.cards[selected] = Number(b.dataset.n);
          draft.example = false;
          var nxt = nextEmpty();
          persist();
          if (nxt) { selected = nxt; renderBoardOnly(); renderPicker(); }
          else { pickerOpen = false; render(); }
        });
      });
    }
    search.addEventListener('input', draw);
    draw();
    box.querySelector('#spPickDone').addEventListener('click', function () {
      pickerOpen = false; render();
    });
  }

  function renderBoardOnly() {
    root.querySelector('.sp-board-wrap .spread').outerHTML = boardHTML();
    root.querySelectorAll('.sp-slot').forEach(function (b) {
      b.addEventListener('click', function () {
        selected = b.dataset.pos;
        panelClosed = false;
        refreshBoardSel();
        showPop();
      });
    });
    refreshBoardSel();
    var count = root.querySelector('#spCount');
    if (count) count.textContent = filledCount() + ' / ' + spread.count +
      ' cartes placées · touche une position pour la lire et y placer une carte';
    setTimeout(function () { fitBoard(0); }, 0);
  }

  render();
};
