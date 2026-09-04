/* ---------------------------------------------------------------------------
 * Vue « Grimoire » — les 53 fiches de cartes.
 *
 * Les champs sont pré-remplis avec les repères issus de la recherche
 * (js/data/card-reference.js). Dès que tu enregistres, c'est TA version qui
 * prend le dessus. « Revenir au texte de référence » efface ta version.
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
    var n = S.editedCount();
    root.querySelector('#grimProgress').textContent =
      n === 0 ? '53 fiches pré-remplies — aucune retravaillée pour l’instant'
              : n + ' / 53 fiches retravaillées';
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
      var pSym = pImg
        ? '<button type="button" class="planet-sym" data-planet="' + pk + '" title="Voir la carte planétaire">' + planet.symbol + '</button>'
        : '<span class="planet-sym">' + planet.symbol + '</span>';
      return '<div class="planet-group">' +
        '<h3 class="planet-title" style="--hue:' + planet.hue + '">' + pSym + ' ' + planet.name + '</h3>' +
        '<ul>' + items.map(function (c) {
          var img = BELLINE.imageFor(c.number);
          var edited = S.isCardEdited(c.number);
          return '<li><button class="card-row' +
            (selected === c.number ? ' is-active' : '') +
            (edited ? ' is-done' : '') +
            '" data-num="' + c.number + '">' +
            '<span class="card-figure">' +
              '<span class="card-num">' + c.number + '</span>' +
              (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
            '</span>' +
            '<span class="card-name">' + esc(c.name) + '</span>' +
            (edited ? '<span class="dot" title="Retravaillée">●</span>' : '') +
            '</button></li>';
        }).join('') + '</ul>' +
      '</div>';
    }).join('');

    groupsEl.innerHTML = html || '<p class="muted pad">Aucune carte ne correspond.</p>';
    groupsEl.querySelectorAll('.card-row').forEach(function (b) {
      b.addEventListener('click', function () { select(Number(b.dataset.num)); });
    });
    groupsEl.querySelectorAll('.planet-sym[data-planet]').forEach(function (b) {
      b.addEventListener('click', function () {
        var pk = b.dataset.planet;
        BELLINE.lightbox(BELLINE.planetImageFor(pk), 'Série ' + P[pk].name);
      });
    });
  }

  function textField(label, id, value, ph) {
    return '<label class="field"><span>' + label + '</span>' +
      '<textarea id="' + id + '" rows="3" placeholder="' + esc(ph || '') + '">' + esc(value) + '</textarea></label>';
  }

  function emptyDetail() {
    detailEl.classList.remove('is-open');
    detailEl.innerHTML =
      '<div class="detail-empty">' +
        '<p class="big-symbol">✷</p>' +
        '<p>Choisis une carte pour ouvrir sa fiche.</p>' +
        '<p class="muted">Les fiches sont pré-remplies : à toi de les réécrire avec tes mots.</p>' +
      '</div>';
  }

  function select(num) {
    selected = num;
    var c = S.getCard(num);
    var planet = P[c.planet];
    var img = BELLINE.imageFor(c.number);
    var pImg = BELLINE.planetImageFor(c.planet);
    var edited = S.isCardEdited(num);
    var pSym = pImg
      ? '<button type="button" class="planet-sym" id="fichePlanet" title="Voir la carte planétaire">' + planet.symbol + '</button>'
      : '<span class="planet-sym">' + planet.symbol + '</span>';

    var statusLine = edited
      ? '<p class="fiche-status is-mine">Ta version enregistrée.</p>'
      : '<p class="fiche-status">Texte de départ (recherche) — réécris-le avec tes mots, puis enregistre.</p>';

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
          '<p class="muted">' + pSym + ' Série ' + planet.name + '</p>' +
          '<p class="fiche-tags">' +
            '<span class="val-tag val-' + c.valence + '" title="Valeur portée par le seul nom de la carte, hors position et hors tirage">valence ' +
              (BELLINE.VALENCE[c.valence] ? BELLINE.VALENCE[c.valence].label : c.valence) + '</span>' +
            (c.forte ? '<span class="val-tag val-forte" title="Une des 5 lames fortes : elle domine son voisinage">carte forte</span>' : '') +
          '</p>' +
          '<p class="muted small">' + planet.desc + '</p>' +
        '</div>' +
      '</header>' +

      statusLine +

      '<label class="field"><span>Mots-clés <em class="muted">(séparés par des virgules)</em></span>' +
        '<input type="text" id="f-keywords" value="' + esc((c.keywords || []).join(', ')) + '" ' +
        'placeholder="ex. rupture, révélation, vérité qui éclate"></label>' +

      textField("Symbolisme de l'image", 'f-symbolisme', c.symbolisme,
        "Ce que montre TA carte : personnages, décor, couleurs, gestes… (à observer)") +

      '<h3 class="fiche-sub">Significations par domaine</h3>' +
      DOMAINS.map(function (d) {
        return textField(d[1], 'f-sens-' + d[0], c.sens ? c.sens[d[0]] : '', '');
      }).join('') +

      '<h3 class="fiche-sub">Associations &amp; combinaisons</h3>' +
      textField('Avec d’autres cartes', 'f-associations', c.associations,
        "Ex. avec Trahison (11) : … — avec Union (27) : … — 3 cartes Saturne : …") +

      textField('Notes personnelles', 'f-notes', c.notes,
        "Ressentis, tirages marquants, ce que la carte t’évoque…") +

      (c.sources && c.sources.length
        ? '<p class="muted small fiche-src">Texte de départ synthétisé de : ' + c.sources.map(esc).join(' · ') + '</p>'
        : '') +

      '<div class="fiche-actions">' +
        '<button class="btn-primary" id="grimSave">Enregistrer</button>' +
        (edited ? '<button class="btn-ghost" id="grimReset">Revenir au texte de référence</button>' : '') +
        '<span class="save-hint" id="grimHint"></span>' +
      '</div>';

    detailEl.querySelector('#grimBack').addEventListener('click', emptyDetail);

    if (img) {
      var fv = detailEl.querySelector('.fiche-visual');
      fv.classList.add('is-zoom');
      fv.addEventListener('click', function () { BELLINE.lightbox(img, c.number + ' · ' + c.name); });
    }
    var fpi = detailEl.querySelector('#fichePlanet');
    if (fpi && pImg) {
      fpi.addEventListener('click', function () { BELLINE.lightbox(pImg, 'Série ' + planet.name); });
    }

    detailEl.querySelector('#grimSave').addEventListener('click', function () {
      var patch = {
        keywords: detailEl.querySelector('#f-keywords').value.split(',')
          .map(function (s) { return s.trim(); }).filter(Boolean),
        symbolisme: detailEl.querySelector('#f-symbolisme').value.trim(),
        associations: detailEl.querySelector('#f-associations').value.trim(),
        notes: detailEl.querySelector('#f-notes').value.trim(),
        sens: {}
      };
      DOMAINS.forEach(function (d) {
        patch.sens[d[0]] = detailEl.querySelector('#f-sens-' + d[0]).value.trim();
      });
      if (S.saveCard(num, patch)) {
        var hint = detailEl.querySelector('#grimHint');
        hint.textContent = 'Enregistré ✓';
        setTimeout(function () { if (hint) hint.textContent = ''; }, 2500);
        var st = detailEl.querySelector('.fiche-status');
        if (st) { st.textContent = 'Ta version enregistrée.'; st.classList.add('is-mine'); }
        if (!detailEl.querySelector('#grimReset')) {
          var b = document.createElement('button');
          b.className = 'btn-ghost'; b.id = 'grimReset';
          b.textContent = 'Revenir au texte de référence';
          detailEl.querySelector('#grimSave').insertAdjacentElement('afterend', b);
          b.addEventListener('click', onReset);
        }
        renderList();
        renderProgress();
      }
    });

    function onReset() {
      if (!confirm('Revenir au texte de référence pour « ' + c.name + ' » ? Ta version sera effacée.')) return;
      S.resetCard(num);
      select(num);
      renderList();
      renderProgress();
    }

    var reset = detailEl.querySelector('#grimReset');
    if (reset) reset.addEventListener('click', onReset);

    renderList();
  }

  searchEl.addEventListener('input', renderList);
  renderList();
  emptyDetail();
  renderProgress();
};
