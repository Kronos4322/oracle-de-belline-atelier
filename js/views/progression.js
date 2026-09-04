/* ---------------------------------------------------------------------------
 * Vue « Progression » — ce qui s'accumule au fil de la pratique.
 *
 * Concordance et relevé des cartes fortes d'après « L'Oracle et la grille »,
 * Livre troisième. Un tirage isolé n'est pas concluant ; c'est l'écart
 * cumulé sur une série qui vaut. La concordance est toujours donnée en
 * version tranchée ET en version « lames fragiles neutralisées » (ch. 24.3).
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.progression = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;

  var esc = BELLINE.esc;
  var pct = BELLINE.pct;

  function fisherCombine(ps) {
    ps = ps.filter(function (p) { return p > 0 && p <= 1; });
    if (ps.length < 2) return null;
    var k = ps.length;
    var x = -2 * ps.reduce(function (s, p) { return s + Math.log(p); }, 0);
    var half = x / 2, term = 1, sum = 1;
    for (var i = 1; i < k; i++) { term *= half / i; sum += term; }
    return { k: k, p: Math.exp(-half) * sum };
  }

  var done = S.editedCount();
  var stats = S.read('training.stats', { seen: 0, known: 0 });
  var pctGrim = Math.round((done / 53) * 100);
  var tirages = S.getTirages();
  var cj = S.getCarteJour();
  var tc = S.getTrainingCards();

  /* --- carte du jour : série + taux --- */
  var todayKey = BELLINE.todayKey;
  var cjChecked = cj.filter(function (e) { return e.verifie === 'oui' || e.verifie === 'non'; });
  var cjOk = cj.filter(function (e) { return e.verifie === 'oui'; }).length;
  function cjStreak() {
    var days = {}; cj.forEach(function (e) { days[e.date] = true; });
    var n = 0, d = new Date(), tk = todayKey();
    for (;;) {
      var k = BELLINE.dateKey(d);
      if (days[k]) { n++; d.setDate(d.getDate() - 1); }
      else if (k === tk) { d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  }

  /* --- concordance par tirage + combinaison --- */
  var concLines = [], concPs = [], concPsN = [];
  var totalFortes = 0, totalSlots = 0;
  var freq = {};

  tirages.forEach(function (t) {
    var a = BELLINE.analyzeTirage(t.spreadId, t.cards);
    if (!a) return;
    totalFortes += a.fortes.length;
    totalSlots += a.placed;
    Object.keys(t.cards || {}).forEach(function (pid) { var n = t.cards[pid]; if (n) freq[n] = (freq[n] || 0) + 1; });
    var c = a.concordance, cn = a.concordanceNeutral;
    if (c.total >= 2) {
      var when = new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      var frag = a.fragiles && a.fragiles.length;
      concLines.push('<tr><td>' + when + ' · ' + esc((BELLINE.SPREADS[t.spreadId] || {}).name || t.spreadId) + '</td>' +
        '<td class="method-idx">' + c.concord + ' / ' + c.total + '</td>' +
        '<td class="method-idx">' + (c.p != null ? pct(c.p) : '—') + '</td>' +
        '<td class="method-idx">' + (frag ? (cn.p != null ? pct(cn.p) : '—') : '<span class="muted">—</span>') + '</td></tr>');
      if (c.p != null) concPs.push(c.p);
      if (cn.p != null) concPsN.push(cn.p);
    }
  });
  var combined = fisherCombine(concPs);
  var combinedN = fisherCombine(concPsN);
  var esperFortes = totalSlots ? (5 / 53) * totalSlots : 0;

  var topFreq = Object.keys(freq).map(function (n) { return { n: Number(n), c: freq[n] }; })
    .filter(function (x) { return x.c >= 2; }).sort(function (a, b) { return b.c - a.c; }).slice(0, 12);

  /* --- cartes qui bloquent (entraînement) --- */
  var blocking = Object.keys(tc).map(function (n) {
    var r = tc[n]; return { n: Number(n), box: r.box, ok: r.ok, ko: r.ko, seen: r.seen };
  }).filter(function (x) { return x.seen >= 2 && (x.ko >= x.ok || x.box <= 1); })
    .sort(function (a, b) { return (b.ko - b.ok) - (a.ko - a.ok); }).slice(0, 12);

  function cardLabel(n) { var c = BELLINE.cardByNumber(n); return n + ' ' + (c ? c.name : ''); }

  root.innerHTML =
    '<div class="view-head"><h1>Progression</h1>' +
      '<p class="muted">Ce qui s\'accumule au fil des tirages consignés et des exercices.</p></div>' +

    '<div class="stat-grid">' +
      '<div class="stat"><div class="stat-n">' + done + '<span>/53</span></div>' +
        '<div class="stat-l">Fiches du Grimoire retravaillées</div>' +
        '<div class="bar"><i style="width:' + pctGrim + '%"></i></div></div>' +
      '<div class="stat"><div class="stat-n">' + cjStreak() + '</div>' +
        '<div class="stat-l">Série « carte du jour » en cours</div></div>' +
      '<div class="stat"><div class="stat-n">' + tirages.length + '</div>' +
        '<div class="stat-l">Tirages consignés au Journal</div></div>' +
      '<div class="stat"><div class="stat-n">' + stats.known + '<span>/' + stats.seen + '</span></div>' +
        '<div class="stat-l">Réussites d\'exercices (session)</div></div>' +
    '</div>' +

    '<section class="jr-sec"><h2>Carte du jour</h2>' +
      (cj.length
        ? '<dl class="jr-releves">' +
            '<dt>Jours consignés</dt><dd>' + cj.length + '</dd>' +
            '<dt>Phrases vérifiées</dt><dd>' + cjChecked.length + '</dd>' +
            '<dt>Confirmées</dt><dd>' + cjOk + (cjChecked.length ? ' (' + pct(cjOk / cjChecked.length) + ')' : '') + '</dd>' +
          '</dl>' +
          '<p class="muted small">Après trente entrées cochées, un taux devient interprétable. Une correspondance déjà connue d\'avance ne compte pas.</p>'
        : '<p class="muted">Aucune carte du jour tirée. Va dans <strong>Jour</strong> pour commencer.</p>') +
    '</section>' +

    '<section class="jr-sec"><h2>Test de concordance des valences</h2>' +
      '<p class="muted small">Une lame forte concorde quand sa valence coïncide avec le signe de sa position. ' +
      'Un résultat ne s\'énonce jamais seul : la colonne « fragiles neutralisées » recalcule en retirant ' +
      BELLINE.FRAGILE.join(', ') + ' (classements contestés). Si les deux divergent nettement, le résultat n\'est pas exploitable.</p>' +
      (concLines.length
        ? '<div class="tbl-scroll"><table class="method-table"><thead><tr><th>Tirage</th><th>Concord.</th><th>P tranchée</th><th>P fragiles neutr.</th></tr></thead>' +
          '<tbody>' + concLines.join('') + '</tbody></table></div>' +
          (combined
            ? '<p class="jr-combined"><strong>Combinaison de Fisher</strong> — tranchée : ' + pct(combined.p) +
              (combinedN ? ' · fragiles neutralisées : ' + pct(combinedN.p) : '') +
              (combined.p < 0.01 ? ' — significatif au seuil de 1 %.' : combined.p < 0.05 ? ' — significatif au seuil de 5 %.' : ' — non concluant.') +
              '<br><span class="muted small">Valable seulement si les tirages sont indépendants (objets distincts, pas le même jour sur la même situation).</span></p>'
            : '<p class="muted small">Il faut au moins 2 tirages à positions polaires pour combiner.</p>')
        : '<p class="muted">Aucun tirage à positions polaires (Hécate, Verdict) encore enregistré.</p>') +
    '</section>' +

    '<section class="jr-sec"><h2>Relevé des cartes fortes</h2>' +
      '<p class="muted small">11 Trahison · 34 Despotisme · 38 Accident · 42 Sagesse · 48 Fatalité. ' +
      'Espérance : 5 / 53 des cartes tirées. C\'est l\'écart cumulé sur la série qui vaut, jamais le pic d\'un tirage.</p>' +
      (totalSlots
        ? '<dl class="jr-releves">' +
            '<dt>Cartes tirées (cumul)</dt><dd>' + totalSlots + '</dd>' +
            '<dt>Cartes fortes sorties</dt><dd>' + totalFortes + '</dd>' +
            '<dt>Espérance</dt><dd>' + esperFortes.toFixed(1).replace('.', ',') + '</dd>' +
            '<dt>Écart cumulé</dt><dd>' + (totalFortes - esperFortes >= 0 ? '+' : '') + (totalFortes - esperFortes).toFixed(1).replace('.', ',') + '</dd>' +
          '</dl>'
        : '<p class="muted">Aucun tirage enregistré.</p>') +
    '</section>' +

    '<section class="jr-sec"><h2>Cartes qui te bloquent</h2>' +
      '<p class="muted small">D\'après tes exercices : celles où tu te trompes le plus ou qui restent en début de cycle de révision.</p>' +
      (blocking.length
        ? '<ul class="jr-plain">' + blocking.map(function (x) {
            return '<li>' + esc(cardLabel(x.n)) + ' <span class="muted">— ' + x.ok + ' ok / ' + x.ko + ' ko · boîte ' + x.box + '</span></li>';
          }).join('') + '</ul>'
        : '<p class="muted">Pas encore assez d\'exercices. Va dans <strong>Exercices</strong>.</p>') +
    '</section>' +

    '<section class="jr-sec"><h2>Cartes qui reviennent</h2>' +
      '<p class="muted small">Sur l\'ensemble de tes tirages consignés. Une récurrence de lame n\'est pas un signe : à ce volume, elle est attendue.</p>' +
      (topFreq.length
        ? '<ul class="jr-plain">' + topFreq.map(function (x) {
            return '<li>' + esc(cardLabel(x.n)) + ' <span class="muted">— ' + x.c + ' fois</span></li>';
          }).join('') + '</ul>'
        : '<p class="muted">Pas encore assez de tirages.</p>') +
    '</section>';
};
