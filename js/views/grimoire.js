/* ---------------------------------------------------------------------------
 * Vue « Grimoire » — les 53 fiches de cartes, éditables et enregistrées.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.grimoire = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;

  var DOMAINS = [
    ['general',   'Sens général'],
    ['amour',     'Amour & relations'],
    ['travail',   'Travail & argent'],
    ['sante',     'Santé & énergie'],
    ['evolution', 'Évolution intérieure']
  ];

  var selected = null;

  root.innerHTML =
    '<div class="view-head">' +
      '<h1>Grimoire</h1>' +
      '<p class="muted" id="grimProgress"></p>' +
    '</div>' +
    '<div class="grimoire">' +
      '<aside class="grim-list">' +
        '<input type="search" id="grimSearch" placeholder="Rechercher : nom, numéro, planète…" autocomplete="off">' +
        '<div id="grimGroups" class="planet-groups"></div>' +
      '</aside>' +
      '<section class="grim-detail" id="grimDetail"></section>' +
    '</div>';

  var groupsEl = root.querySelector('#grimGroups');
  var detailEl = root.querySelector('#grimDetail');
  var searchEl = root.querySelector('#grimSearch');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function renderProgress() {
    var done = S.getCards().filter(S.isCardComplete).length;
    root.querySelector('#grimProgress').textContent = done + ' / 53 fiches complétées';
  }

  function renderList() {
    var f = (searchEl.value || '').trim().toLowerCase();
    var cards = S.getCards();
    var html = BELLINE.PLANET_ORDER.map(function (pk) {
      var planet = P[pk];
      var items = cards.filter(function (c) { return c.planet === pk; }).filter(function (c) {
        if (!f) return true;
        return c.name.toLowerCase().indexOf(f) !== -1 ||
               String(c.number) === f ||
               planet.name.toLowerCase().indexOf(f) !== -1;
      });
      if (!items.length) return '';
      var pImg = BELLINE.planetImageFor(pk);
      var pIco = pImg
        ? '<img class="planet-ico" src="' + pImg + '" alt="" onerror="this.remove()">'
        : '<span>' + planet.symbol + '</span>';
      return '<div class="planet-group">' +
        '<h3 class="planet-title" style="--hue:' + planet.hue + '">' + pIco + ' ' + planet.name + '</h3>' +
        '<ul>' + items.map(function (c) {
          var img = BELLINE.imageFor(c.number);
          return '<li><button class="card-row' +
            (selected === c.number ? ' is-active' : '') +
            (S.isCardComplete(c) ? ' is-done' : '') +
            '" data-num="' + c.number + '">' +
            '<span class="card-figure">' +
              '<span class="card-num">' + c.number + '</span>' +
              (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
            '</span>' +
            '<span class="card-name">' + esc(c.name) + '</span>' +
            (S.isCardComplete(c) ? '<span class="dot" title="Fiche complétée">●</span>' : '') +
            '</button></li>';
        }).join('') + '</ul>' +
      '</div>';
    }).join('');

    groupsEl.innerHTML = html || '<p class="muted pad">Aucune carte ne correspond.</p>';
    groupsEl.querySelectorAll('.card-row').forEach(function (b) {
      b.addEventListener('click', function () { select(Number(b.dataset.num)); });
    });
  }

  function textField(label, id, value, ph) {
    return '<label class="field"><span>' + label + '</span>' +
      '<textarea id="' + id + '" rows="3" placeholder="' + esc(ph || '') + '">' + esc(value) + '</textarea></label>';
  }

  /* --- Repères de lecture (lecture seule, issus de card-reference.js) --- */

  var REF_KEYS = ['keywords', 'symbolisme', 'sens-general', 'sens-amour', 'sens-travail', 'sens-sante', 'sens-evolution'];

  function refText(ref, key) {
    if (!ref) return '';
    if (key === 'keywords') return (ref.keywords || []).join(', ');
    if (key === 'symbolisme') return ref.symbolisme || '';
    if (key.indexOf('sens-') === 0) return (ref.sens && ref.sens[key.slice(5)]) || '';
    return '';
  }

  function refFieldEl(key) {
    if (key === 'keywords') return detailEl.querySelector('#f-keywords');
    if (key === 'symbolisme') return detailEl.querySelector('#f-symbolisme');
    if (key.indexOf('sens-') === 0) return detailEl.querySelector('#f-' + key);
    return null;
  }

  function refRow(ref, key, label) {
    var t = refText(ref, key);
    if (!t) return '';
    return '<div class="ref-row">' +
      '<div class="ref-row-top"><strong>' + label + '</strong>' +
      '<button type="button" class="btn-link ref-copy" data-key="' + key + '">copier ↑</button></div>' +
      '<p>' + esc(t) + '</p></div>';
  }

  function referenceSection(ref) {
    if (!ref) return '';
    var rows = refRow(ref, 'keywords', 'Mots-clés') +
      refRow(ref, 'symbolisme', "Symbolisme") +
      DOMAINS.map(function (d) { return refRow(ref, 'sens-' + d[0], d[1]); }).join('');
    if (!rows) return '';
    return '<section class="fiche-ref">' +
      '<div class="ref-head"><h3>Repères de lecture</h3>' +
      '<button type="button" class="btn-ghost btn-sm" id="refFillAll">Pré-remplir mes champs vides</button></div>' +
      '<p class="muted small">Synthèse de plusieurs sources publiques, à retravailler avec tes mots.</p>' +
      rows +
      (ref.sources && ref.sources.length
        ? '<p class="muted small ref-src">Sources : ' + ref.sources.map(esc).join(' · ') + '</p>' : '') +
      '</section>';
  }

  function wireReference(ref) {
    if (!ref) return;
    detailEl.querySelectorAll('.ref-copy').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = refFieldEl(b.dataset.key);
        if (!el) return;
        var t = refText(ref, b.dataset.key);
        var sep = b.dataset.key === 'keywords' ? ', ' : '\n\n';
        el.value = el.value.trim() ? el.value.trim() + sep + t : t;
        el.focus();
      });
    });
    var fill = detailEl.querySelector('#refFillAll');
    if (fill) fill.addEventListener('click', function () {
      REF_KEYS.forEach(function (key) {
        var el = refFieldEl(key);
        if (el && !el.value.trim()) {
          var t = refText(ref, key);
          if (t) el.value = t;
        }
      });
    });
  }

  function emptyDetail() {
    detailEl.classList.remove('is-open');
    detailEl.innerHTML =
      '<div class="detail-empty">' +
        '<p class="big-symbol">✷</p>' +
        '<p>Choisis une carte pour ouvrir sa fiche.</p>' +
        '<p class="muted">On remplit les 53 fiches ensemble, une par une.</p>' +
      '</div>';
  }

  function select(num) {
    selected = num;
    var c = S.getCard(num);
    var planet = P[c.planet];
    var img = BELLINE.imageFor(c.number);
    var pImg = BELLINE.planetImageFor(c.planet);
    var pIco = pImg
      ? '<img class="planet-ico" src="' + pImg + '" alt="" onerror="this.remove()">'
      : planet.symbol;
    var ref = (BELLINE.CARD_REFERENCE || {})[num];

    detailEl.classList.add('is-open');
    detailEl.innerHTML =
      '<button class="back-btn" id="grimBack">← Liste</button>' +
      '<header class="fiche-head" style="--hue:' + planet.hue + '">' +
        '<div class="fiche-visual">' +
          '<span class="fiche-visual-num">' + c.number + '</span>' +
          (img ? '<img src="' + img + '" alt="' + esc(c.name) + '" loading="lazy" onerror="this.remove()">' : '') +
        '</div>' +
        '<div class="fiche-head-txt">' +
          '<h2>' + esc(c.name) + '</h2>' +
          '<p class="muted">' + pIco + ' Série ' + planet.name + '</p>' +
          '<p class="muted small">' + planet.desc + '</p>' +
        '</div>' +
      '</header>' +

      '<label class="field"><span>Mots-clés <em class="muted">(séparés par des virgules)</em></span>' +
        '<input type="text" id="f-keywords" value="' + esc((c.keywords || []).join(', ')) + '" ' +
        'placeholder="ex. rupture, révélation, vérité qui éclate"></label>' +

      textField("Symbolisme de l'image", 'f-symbolisme', c.symbolisme,
        "Ce que montre la carte : personnages, décor, couleurs, gestes…") +

      '<h3 class="fiche-sub">Significations par domaine</h3>' +
      DOMAINS.map(function (d) {
        return textField(d[1], 'f-sens-' + d[0], c.sens ? c.sens[d[0]] : '', '');
      }).join('') +

      textField('Notes personnelles', 'f-notes', c.notes,
        "Ressentis, tirages marquants, associations d'idées, combinaisons…") +

      referenceSection(ref) +

      '<div class="fiche-actions">' +
        '<button class="btn-primary" id="grimSave">Enregistrer</button>' +
        '<button class="btn-ghost" id="grimReset">Réinitialiser</button>' +
        '<span class="save-hint" id="grimHint"></span>' +
      '</div>';

    detailEl.querySelector('#grimBack').addEventListener('click', emptyDetail);

    if (img) {
      var fv = detailEl.querySelector('.fiche-visual');
      fv.classList.add('is-zoom');
      fv.addEventListener('click', function () { BELLINE.lightbox(img, c.number + ' · ' + c.name); });
    }
    var fpi = detailEl.querySelector('.fiche-head-txt .planet-ico');
    if (fpi && pImg) {
      fpi.classList.add('is-zoom');
      fpi.addEventListener('click', function () { BELLINE.lightbox(pImg, 'Série ' + planet.name); });
    }

    wireReference(ref);

    detailEl.querySelector('#grimSave').addEventListener('click', function () {
      var patch = {
        keywords: detailEl.querySelector('#f-keywords').value.split(',')
          .map(function (s) { return s.trim(); }).filter(Boolean),
        symbolisme: detailEl.querySelector('#f-symbolisme').value.trim(),
        notes: detailEl.querySelector('#f-notes').value.trim(),
        sens: {}
      };
      DOMAINS.forEach(function (d) {
        patch.sens[d[0]] = detailEl.querySelector('#f-sens-' + d[0]).value.trim();
      });
      if (S.saveCard(num, patch)) {
        var hint = detailEl.querySelector('#grimHint');
        hint.textContent = 'Enregistré ✓';
        setTimeout(function () { if (hint) hint.textContent = ''; }, 2000);
        renderList();
        renderProgress();
      }
    });

    detailEl.querySelector('#grimReset').addEventListener('click', function () {
      if (!confirm('Effacer tout le contenu saisi pour « ' + c.name + ' » ?')) return;
      S.resetCard(num);
      select(num);
      renderList();
      renderProgress();
    });

    renderList();
  }

  searchEl.addEventListener('input', renderList);
  renderList();
  emptyDetail();
  renderProgress();
};
