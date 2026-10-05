/* ---------------------------------------------------------------------------
 * Vue « Jeux » : le Chemin du Mage et le Duel des Apparitions (dossier jeu/).
 *
 * Les jeux vivent dans jeu/ (leur propre code, compilé par jeu/tools/build.mjs).
 * Même origine que l'Atelier : ils partagent le stockage du navigateur. Cette
 * vue lit le carnet des jeux (cartes vécues, règles découvertes, duels) et
 * ouvre la fiche d'une carte dans le Grimoire.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.jeux = function (root) {
  var esc = BELLINE.esc;
  var carnet = {};
  try { carnet = JSON.parse(localStorage.getItem('chemin-du-mage.carnet') || '{}') || {}; } catch (e) { carnet = {}; }
  var cartes = carnet.cartes || {};
  var vecues = Object.keys(cartes).filter(function (k) { return (cartes[k].vecue || 0) > 0; }).map(Number);
  var regles = Object.keys(carnet.regles || {}).length;
  var duels = carnet.duels || { joues: 0, gagnes: 0 };
  var gardiens = (carnet.gardiens || []).length;
  // le jeu numérote la Carte Bleue 0, l'Atelier 53
  function numAtelier(n) { return n === 0 ? 53 : n; }

  function stat(n, total, label) {
    return '<div class="stat"><div class="stat-n">' + n + (total ? ' <span>/ ' + total + '</span>' : '') + '</div><div class="stat-l">' + esc(label) + '</div></div>';
  }

  root.innerHTML =
    '<div class="view-head"><h1>Jeux</h1>' +
      '<p class="muted">Apprendre le Belline en jouant : vivre les cartes sur un chemin, faire combattre leurs apparitions. ' +
      'Vos cartes vécues et vos règles découvertes sont gardées ici, avec le reste de l\'Atelier.</p></div>' +
    '<div class="jeux-grille">' +
      '<a class="jeu-tuile" href="jeu/chemin.html">' +
        '<span class="jeu-glyphe">✶</span><b>Le Chemin du Mage</b>' +
        '<span>Montez le chemin des planètes, choisissez vos cartes aux fourches, vivez-les selon la notice. À chaque porte, une carte pour votre tirage.</span>' +
        '<em>Jouer</em></a>' +
      '<a class="jeu-tuile" href="jeu/duel.html">' +
        '<span class="jeu-glyphe">⚔</span><b>Le Duel des Apparitions</b>' +
        '<span>Invoquez les apparitions, posez vos présages, accomplissez les règles de Belline et vos associations, défiez les Sept Gardiens.</span>' +
        '<em>Jouer</em></a>' +
    '</div>' +
    '<h2 class="jr-sub">Votre carnet de jeu</h2>' +
    '<div class="stat-grid jeux-stats">' +
      stat(vecues.length, 53, 'cartes vécues dans le Chemin') +
      stat(regles, 26, 'règles de Belline découvertes') +
      stat(duels.gagnes || 0, duels.joues || 0, 'duels gagnés') +
      stat(gardiens, 7, 'Gardiens vaincus') +
    '</div>' +
    (vecues.length
      ? '<h2 class="jr-sub">Cartes vécues</h2><p class="muted">Touchez une carte pour ouvrir sa fiche dans le Grimoire.</p>' +
        '<div class="jeux-vecues">' + vecues.sort(function (a, b) { return a - b; }).map(function (n) {
          return '<button type="button" class="btn-ghost btn-sm" data-carte="' + numAtelier(n) + '">' + numAtelier(n) + ' ' + esc(BELLINE.cardName(numAtelier(n))) + '</button>';
        }).join('') + '</div>'
      : '<p class="muted">Aucune carte vécue pour l\'instant : elles apparaîtront ici après votre premier chemin.</p>');

  root.querySelectorAll('[data-carte]').forEach(function (b) {
    b.addEventListener('click', function () {
      BELLINE.Storage.write('grimoire.open', Number(b.dataset.carte));
      BELLINE.go('grimoire');
    });
  });
};
