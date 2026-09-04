/* ---------------------------------------------------------------------------
 * Vue « Carte du jour » — la boucle quotidienne.
 *
 * Tirer une carte, écrire une phrase falsifiable, cocher le lendemain.
 * D'après « L'Oracle et la grille », ch. 52 : le premier des trois travaux
 * recommandés est mécanique et ne demande que de la constance ; en un mois,
 * il transforme une impression en résultat, ou l'éteint.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.journalier = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;

  var esc = BELLINE.esc;
  var todayKey = BELLINE.todayKey;
  function fmt(key) {
    var p = key.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
  }
  var cardName = BELLINE.cardName;

  var log = S.getCarteJour();
  var tk = todayKey();
  var today = log.find(function (e) { return e.date === tk; });

  function streak() {
    var days = {};
    log.forEach(function (e) { days[e.date] = true; });
    var n = 0;
    var d = new Date();
    for (;;) {
      var k = BELLINE.dateKey(d);
      if (days[k]) { n++; d.setDate(d.getDate() - 1); }
      else if (k === tk) { d.setDate(d.getDate() - 1); }   // aujourd'hui pas encore tiré : on ne casse pas la série
      else break;
    }
    return n;
  }

  function persist() { S.saveCarteJour(log); }

  function draw() {
    var n = 1 + Math.floor(Math.random() * 53);
    if (log.length && log[0] && log[0].card === n) n = (n % 53) + 1;
    today = { date: tk, card: n, phrase: '', verifie: null };
    log.unshift(today);
    persist();
    render();
  }

  function render() {
    var s = streak();
    var head =
      '<div class="view-head"><h1>Carte du jour</h1>' +
        '<p class="muted">Une carte, une phrase vérifiable, une coche le lendemain. ' +
        (s ? '<span class="cj-streak">série : ' + s + ' jour' + (s > 1 ? 's' : '') + '</span>' : 'Commence ta série.') +
        '</p></div>';

    var draw$ = '';
    if (!today) {
      draw$ =
        '<div class="cj-draw">' +
          '<p class="muted">Tu n\'as pas encore tiré ta carte aujourd\'hui.</p>' +
          '<div class="cj-actions"><button type="button" class="btn-primary" id="cjDraw">Tirer la carte du jour</button></div>' +
        '</div>';
    } else {
      var c = S.getCard(today.card);
      var planet = P[c.planet];
      var img = BELLINE.imageFor(c.number);
      var kw = c.keywords || [];
      draw$ =
        '<div class="cj-draw" style="--hue:' + planet.hue + '">' +
          '<div class="cj-figure' + (img ? ' is-zoom' : '') + '" id="cjFig">' +
            '<span>' + c.number + '</span>' +
            (img ? '<img src="' + img + '" alt="" onerror="this.remove()">' : '') +
          '</div>' +
          '<p class="cj-name">' + esc(c.name) + '</p>' +
          '<p class="cj-planet">' + planet.symbol + ' Série ' + planet.name + '</p>' +
          '<p class="cj-tags">' +
            (c.supreme ? '<span class="val-tag val-supreme">★ meilleure carte</span>' : '') +
            '<span class="val-tag val-' + c.valence + '">valence ' + (BELLINE.VALENCE[c.valence] ? BELLINE.VALENCE[c.valence].label : c.valence) + '</span>' +
            (c.forte ? '<span class="val-tag val-forte">carte forte</span>' : '') +
          '</p>' +
          (kw.length ? '<div class="cj-kw">' + kw.slice(0, 6).map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('') + '</div>' : '') +
          (c.sens && c.sens.general ? '<p class="cj-sens muted">' + esc(c.sens.general) + '</p>' : '') +
          '<div class="cj-phrase">' +
            '<textarea id="cjPhrase" placeholder="Ce que je retiens pour aujourd\'hui — une phrase que je pourrai cocher demain (vraie ou fausse).">' + esc(today.phrase || '') + '</textarea>' +
          '</div>' +
          '<div class="cj-actions">' +
            '<button type="button" class="btn-ghost btn-sm" id="cjRedraw">Retirer une autre carte</button>' +
            '<button type="button" class="btn-ghost btn-sm" id="cjOpen">Ouvrir la fiche</button>' +
          '</div>' +
        '</div>';
    }

    var past = log.filter(function (e) { return e.date !== tk; }).slice(0, 30);
    var logHtml = past.length
      ? '<section><h2 class="jr-sub">Les jours précédents — à cocher, sans reformuler</h2>' +
        '<ul class="cj-log">' + past.map(function (e, i) {
          return '<li>' +
            '<span class="cj-log-date">' + fmt(e.date) + '</span>' +
            '<span class="cj-log-card"><b>' + e.card + '</b> ' + esc(cardName(e.card)) +
              (e.phrase ? ' — <span class="muted">' + esc(e.phrase) + '</span>' : '') + '</span>' +
            '<span class="cj-log-verify">' +
              ['—', 'oui', 'non'].map(function (v) {
                var val = v === '—' ? null : v;
                return '<button type="button" class="cj-mini' + (e.verifie === val ? ' on' : '') +
                  '" data-date="' + e.date + '" data-v="' + v + '">' + v + '</button>';
              }).join('') +
            '</span>' +
          '</li>';
        }).join('') + '</ul></section>'
      : '';

    root.innerHTML = head + draw$ + logHtml;

    var q = function (id) { return root.querySelector(id); };
    if (q('#cjDraw')) q('#cjDraw').addEventListener('click', draw);
    if (q('#cjRedraw')) q('#cjRedraw').addEventListener('click', function () {
      BELLINE.confirm('Retirer une autre carte pour aujourd\'hui ? La précédente sera remplacée.').then(function (ok) {
        if (!ok) return;
        log = log.filter(function (e) { return e.date !== tk; });
        today = null;
        draw();
      });
    });
    if (q('#cjOpen')) q('#cjOpen').addEventListener('click', function () {
      S.write('grimoire.open', today.card);
      BELLINE.go('grimoire');
    });
    if (q('#cjPhrase')) q('#cjPhrase').addEventListener('input', function () {
      today.phrase = this.value; persist();
    });
    var fig = q('#cjFig');
    if (fig && today && BELLINE.imageFor(today.card)) {
      fig.addEventListener('click', function () {
        BELLINE.lightbox(BELLINE.imageFor(today.card), today.card + ' · ' + cardName(today.card));
      });
    }
    root.querySelectorAll('.cj-mini').forEach(function (b) {
      b.addEventListener('click', function () {
        var e = log.find(function (x) { return x.date === b.dataset.date; });
        if (!e) return;
        e.verifie = b.dataset.v === '—' ? null : b.dataset.v;
        persist(); render();
      });
    });
  }

  render();
};
