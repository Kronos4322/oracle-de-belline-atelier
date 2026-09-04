/* ---------------------------------------------------------------------------
 * Vue « Progression » — quelques indicateurs, enrichis au fil des modules.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.progression = function (root) {
  var S = BELLINE.Storage;

  var done = S.editedCount();
  var stats = S.read('training.stats', { seen: 0, known: 0 });
  var pct = Math.round((done / 53) * 100);

  root.innerHTML =
    '<div class="view-head"><h1>Progression</h1>' +
      '<p class="muted">Un aperçu — s\'étoffera avec les Tirages et le Journal.</p></div>' +

    '<div class="stat-grid">' +
      '<div class="stat">' +
        '<div class="stat-n">' + done + '<span>/53</span></div>' +
        '<div class="stat-l">Fiches du Grimoire retravaillées</div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '</div>' +
      '<div class="stat">' +
        '<div class="stat-n">' + stats.known + '<span>/' + stats.seen + '</span></div>' +
        '<div class="stat-l">Réussites d\'entraînement (session en cours)</div>' +
      '</div>' +
    '</div>' +

    '<div class="soon">' +
      '<h3>À venir</h3>' +
      '<ul>' +
        '<li>Cartes qui te bloquent le plus (hésitation, taux d\'erreur en entraînement)</li>' +
        '<li>Fréquence d\'apparition de chaque carte dans tes tirages</li>' +
        '<li><strong>Justesse dans le temps</strong> : interprétation comparée au retour réel</li>' +
        '<li>Régularité de pratique : calendrier et séries de jours</li>' +
      '</ul>' +
    '</div>';
};
