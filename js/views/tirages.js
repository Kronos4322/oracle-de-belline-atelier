/* ---------------------------------------------------------------------------
 * Vue « Tirages » — ossature. Le moteur de tirage arrive à l'étape suivante.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.tirages = function (root) {
  root.innerHTML =
    '<div class="view-head"><h1>Tirages</h1>' +
      '<p class="muted">Module en construction — voici ce qu\'il fera.</p></div>' +

    '<div class="soon">' +
      '<h3>Le sélecteur des 53 cartes</h3>' +
      '<p>Une grille de vignettes (recherche par nom, numéro ou série) pour remplir ' +
      'chaque position d\'un tirage, puis <strong>valider</strong> et enregistrer la lecture ' +
      'dans le Journal.</p>' +

      '<h3>Trois modes d\'entrée, un même moteur</h3>' +
      '<ul>' +
        '<li><strong>Tirage vide</strong> — tu choisis toi-même toutes les cartes ' +
        '(étude d\'une combinaison, rejeu d\'un tirage papier)</li>' +
        '<li><strong>Tirage physique</strong> — tu saisis les cartes sorties de ton vrai jeu</li>' +
        '<li><strong>Tirage numérique</strong> — l\'application mélange et tire</li>' +
      '</ul>' +

      '<h3>Modèles de tirage</h3>' +
      '<p>Chaque modèle décrit ses positions, et <strong>chaque position explique sa ' +
      'logique</strong> : ce qu\'elle éclaire et son lien avec les positions voisines.</p>' +
      '<ul>' +
        '<li>Modèles fournis : carte du jour, croix, passé / présent / futur, ' +
        'maisons planétaires, grand tableau</li>' +
        '<li><strong>Éditeur de tirage</strong> pour créer les tiens, avec ta propre ' +
        'logique de positions</li>' +
      '</ul>' +

      '<h3>Lecture assistée</h3>' +
      '<p>Détection des <strong>dominantes planétaires</strong> du tirage ' +
      '(ex. 3 cartes de Saturne → thème de fond) et des cartes qui se répondent.</p>' +
    '</div>';
};
