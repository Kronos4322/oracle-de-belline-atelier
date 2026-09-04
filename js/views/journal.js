/* ---------------------------------------------------------------------------
 * Vue « Journal » — ossature. Enregistrement des lectures + suivi des retours.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.journal = function (root) {
  root.innerHTML =
    '<div class="view-head"><h1>Journal</h1>' +
      '<p class="muted">Module en construction — voici ce qu\'il fera.</p></div>' +

    '<div class="soon">' +
      '<h3>Chaque lecture, enregistrée</h3>' +
      '<ul>' +
        '<li>Date, question posée, <strong>consultant</strong> (toi ou une autre personne)</li>' +
        '<li>Le tirage utilisé et les cartes tombées à chaque position</li>' +
        '<li>Ton interprétation, rédigée au moment de la lecture</li>' +
      '</ul>' +

      '<h3>Le champ « retour »</h3>' +
      '<p>À remplir plus tard : <strong>ce qui s\'est réellement passé</strong>. ' +
      'C\'est ce qui permettra de mesurer ta justesse dans le temps.</p>' +

      '<h3>Historique &amp; consultants</h3>' +
      '<ul>' +
        '<li>Recherche et filtres : par consultant, par période, par carte</li>' +
        '<li>Fiche par consultant : questions récurrentes, évolution des tirages</li>' +
      '</ul>' +
    '</div>';
};
