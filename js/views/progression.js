/* ---------------------------------------------------------------------------
 * Vue « Progression » — mesure et suivi.
 *
 * Test de concordance et relevé des cartes fortes d'après « L'Oracle et la
 * grille », Livre troisième. Un tirage isolé n'est pas concluant ; c'est
 * l'écart cumulé sur une série qui vaut.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.progression = function (root) {
  var S = BELLINE.Storage;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pct(x) { return (x * 100).toFixed(1).replace('.', ',') + ' %'; }

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

  /* --- concordance par tirage + combinaison --- */
  var concLines = [], concPs = [];
  var totalFortes = 0, totalSlots = 0;
  var freq = {};

  tirages.forEach(function (t) {
    var a = BELLINE.analyzeTirage(t.spreadId, t.cards);
    if (!a) return;
    totalFortes += a.fortes.length;
    totalSlots += a.placed;
    Object.keys(t.cards || {}).forEach(function (pid) {
      var n = t.cards[pid]; if (n) freq[n] = (freq[n] || 0) + 1;
    });
    var c = a.concordance;
    if (c.total >= 2) {
      var A = c.entries.filter(function (e) { return e.pos.polarity === 'favorable'; }).length;
      var aPos = c.entries.filter(function (e) { return e.card.valence === 'positive'; }).length;
      var r = BELLINE.concordanceP(c.total, A, aPos, c.concord);
      var when = new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      concLines.push('<tr><td>' + when + ' · ' + esc((BELLINE.SPREADS[t.spreadId] || {}).name || t.spreadId) + '</td>' +
        '<td class="method-idx">' + c.concord + ' / ' + c.total + '</td>' +
        '<td class="method-idx">' + (r ? pct(r.p) : '—') + '</td></tr>');
      if (r) concPs.push(r.p);
    }
  });
  var combined = fisherCombine(concPs);

  var esperFortes = totalSlots ? (5 / 53) * totalSlots : 0;

  var topFreq = Object.keys(freq).map(function (n) { return { n: Number(n), c: freq[n] }; })
    .filter(function (x) { return x.c >= 2; })
    .sort(function (a, b) { return b.c - a.c; }).slice(0, 12);

  function cardLabel(n) {
    var c = (BELLINE.SEED_CARDS || []).find(function (x) { return x.number === n; });
    return n + ' ' + (c ? c.name : '');
  }

  root.innerHTML =
    '<div class="view-head"><h1>Progression</h1>' +
      '<p class="muted">Ce qui s\'accumule au fil des tirages consignés.</p></div>' +

    '<div class="stat-grid">' +
      '<div class="stat"><div class="stat-n">' + done + '<span>/53</span></div>' +
        '<div class="stat-l">Fiches du Grimoire retravaillées</div>' +
        '<div class="bar"><i style="width:' + pctGrim + '%"></i></div></div>' +
      '<div class="stat"><div class="stat-n">' + tirages.length + '</div>' +
        '<div class="stat-l">Tirages consignés au Journal</div></div>' +
      '<div class="stat"><div class="stat-n">' + stats.known + '<span>/' + stats.seen + '</span></div>' +
        '<div class="stat-l">Réussites d\'entraînement (session)</div></div>' +
    '</div>' +

    '<section class="jr-sec"><h2>Test de concordance des valences</h2>' +
      '<p class="muted small">Une lame forte concorde quand sa valence coïncide avec le signe de sa position. ' +
      'Sous répartition aléatoire, la concordance attendue est la moitié. Un tirage isolé n\'est pas concluant.</p>' +
      (concLines.length
        ? '<table class="method-table"><thead><tr><th>Tirage</th><th>Concordance</th><th>P(≥ observé)</th></tr></thead>' +
          '<tbody>' + concLines.join('') + '</tbody></table>' +
          (combined
            ? '<p class="jr-combined"><strong>Combinaison de Fisher</strong> sur ' + combined.k + ' tirages : ' + pct(combined.p) +
              (combined.p < 0.01 ? ' — significatif au seuil de 1 %.' : combined.p < 0.05 ? ' — significatif au seuil de 5 %.' : ' — non concluant.') + '</p>'
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

    '<section class="jr-sec"><h2>Cartes qui reviennent</h2>' +
      '<p class="muted small">Sur l\'ensemble de tes tirages consignés. Une récurrence de lame n\'est pas un signe : à ce volume, elle est attendue.</p>' +
      (topFreq.length
        ? '<ul class="jr-plain">' + topFreq.map(function (x) {
            return '<li>' + esc(cardLabel(x.n)) + ' <span class="muted">— ' + x.c + ' fois</span></li>';
          }).join('') + '</ul>'
        : '<p class="muted">Pas encore assez de tirages.</p>') +
    '</section>' +

    '<div class="soon"><h3>À venir</h3><ul>' +
      '<li>Cartes qui te bloquent le plus en entraînement (hésitation, taux d\'erreur)</li>' +
      '<li>Justesse dans le temps : énoncés du carnet vérifiés vs infirmés</li>' +
      '<li>Régularité de pratique : calendrier et séries de jours</li>' +
    '</ul></div>';
};
