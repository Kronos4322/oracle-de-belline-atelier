/* ---------------------------------------------------------------------------
 * Vue « Astrologie » — dossier de référence des sept influences planétaires.
 *
 * Second niveau de lecture du Belline : chaque série de 7 cartes (4 à 52)
 * porte la grammaire d'une planète. Cette vue expose le noyau symbolique,
 * les déclinaisons par domaine, la fonction grammaticale et les comparaisons
 * entre planètes — la matière vient de js/data/planet-dossier.js.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.astrologie = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;
  var D = BELLINE.PLANET_DOSSIER;
  var esc = BELLINE.esc;

  var SERIES = BELLINE.PLANET_ORDER.filter(function (pk) { return pk !== 'none'; });
  var DOMAIN_LABELS = [
    ['amour', 'Amour, couple et intimité'],
    ['travail', 'Travail, carrière et entreprise'],
    ['argent', 'Argent et patrimoine'],
    ['sante', 'Santé — lecture symbolique'],
    ['psycho', 'Psychologie'],
    ['spiritualite', 'Spiritualité et travail initiatique'],
    ['droit', 'Droit, administration et institutions']
  ];
  var TENDANCE_CLASS = {
    'Très favorable': 'renforce', 'Favorable': 'renforce',
    'Restrictive': 'retourne', 'Tendue / active': 'retourne',
    'Variable': 'precise', 'Neutre / mobile': 'precise'
  };

  var selected = S.read('astro.planet', 'soleil');
  if (!D[selected]) selected = 'soleil';

  function openCard(num) {
    S.write('grimoire.open', num);
    BELLINE.go('grimoire');
  }

  function tabsHTML() {
    return '<div class="astro-tabs">' + SERIES.map(function (pk) {
      var planet = P[pk];
      return '<button type="button" class="astro-tab' + (pk === selected ? ' on' : '') + '" data-planet="' + pk + '" style="--hue:' + planet.hue + '">' +
        '<span class="astro-tab-sym">' + planet.symbol + '</span>' + esc(planet.name) + '</button>';
    }).join('') + '</div>';
  }

  function seriesCardsHTML(pk) {
    var cards = BELLINE.SEED_CARDS.filter(function (c) { return c.planet === pk; });
    return '<ul class="astro-cards">' + cards.map(function (c) {
      var img = BELLINE.imageFor(c.number);
      var expr = BELLINE.PLANET_CARD_EXPR[c.number] || '';
      return '<li><button type="button" class="astro-card-row" data-num="' + c.number + '">' +
        '<span class="card-figure"><span class="card-num">' + c.number + '</span>' +
          (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
        '</span>' +
        '<span class="astro-card-txt"><b>' + esc(c.name) + '</b><span class="muted small">' + esc(expr) + '</span></span>' +
      '</button></li>';
    }).join('') + '</ul>';
  }

  function planetHTML(pk) {
    var planet = P[pk];
    var d = D[pk];
    var tendCls = TENDANCE_CLASS[d.tendance] || 'precise';
    return (
      '<section class="astro-planet" style="--hue:' + planet.hue + '">' +
        '<header class="astro-planet-head">' +
          '<span class="astro-planet-sym">' + planet.symbol + '</span>' +
          '<div><h2>' + esc(planet.name) + '</h2>' +
            '<p class="muted">Cartes ' + esc(d.cartes) + ' · <span class="combo-sens ' + tendCls + '">' + esc(d.tendance) + '</span></p></div>' +
        '</header>' +
        '<p class="astro-lead">' + esc(d.lead) + '</p>' +

        '<h3 class="fiche-sub">Noyau symbolique</h3><p>' + esc(d.noyau) + '</p>' +

        '<div class="astro-two">' +
          '<div class="astro-mode is-good"><h4>Expression harmonieuse</h4><p>' + esc(d.harmonieux) + '</p></div>' +
          '<div class="astro-mode is-shadow"><h4>Ombre et excès</h4><p>' + esc(d.ombre) + '</p></div>' +
        '</div>' +

        '<h3 class="fiche-sub">Lecture par domaine</h3>' +
        DOMAIN_LABELS.map(function (dl) {
          return '<details class="fiche-dossier"><summary>' + esc(dl[1]) + '</summary><p>' + esc(d.domaines[dl[0]]) + '</p></details>';
        }).join('') +

        '<div class="dos-row"><strong>Temporalité et mouvement</strong> ' + esc(d.temporalite) + '</div>' +
        '<div class="dos-row"><strong>Fonction grammaticale dans un tirage</strong> ' + esc(d.grammaire) + '</div>' +

        '<h3 class="fiche-sub">Mots-clés</h3><p class="pl-chips">' +
          d.motscles.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</p>' +

        '<h3 class="fiche-sub">Questions à se poser lorsqu’elle domine un tirage</h3>' +
        '<ul class="jr-plain">' + d.questions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>' +

        '<h3 class="fiche-sub">Les sept cartes de la série</h3>' +
        seriesCardsHTML(pk) +
      '</section>'
    );
  }

  function comparisonsHTML() {
    return '<section class="astro-block">' +
      '<h2>Comparer les planètes entre elles</h2>' +
      BELLINE.PLANET_COMPARISONS.map(function (c) {
        var syms = c.planets.map(function (pk) { return '<span style="--hue:' + P[pk].hue + '" class="astro-tab-sym">' + P[pk].symbol + '</span>'; }).join(' / ');
        return '<details class="fiche-dossier"><summary>' + syms + ' ' + esc(c.pair) + '</summary><p>' + esc(c.text) + '</p></details>';
      }).join('') +
    '</section>';
  }

  function dominantesHTML() {
    return '<section class="astro-block">' +
      '<h2>Lire les dominantes planétaires dans un tirage</h2>' +
      BELLINE.PLANET_DOMINANTES.map(function (b) {
        return '<details class="fiche-dossier"><summary>' + esc(b.title) + '</summary><p>' + esc(b.text) + '</p></details>';
      }).join('') +
    '</section>';
  }

  function draw() {
    root.innerHTML =
      '<div class="view-head"><h1>Astrologie</h1>' +
        '<p class="muted">Le second niveau de lecture du Belline : sept séries de sept cartes (4 à 52), chacune sous la grammaire d’une planète.</p></div>' +

      '<details class="sp-intro"><summary>Introduction — la grammaire planétaire du Belline</summary>' +
        BELLINE.ASTRO_INTRO.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '<p class="muted small">' + esc(BELLINE.ASTRO_NOTE) + '</p>' +
        '<div class="dos-row"><strong>Une règle pratique de polarité</strong> ' + esc(BELLINE.ASTRO_POLARITY_RULE) + '</div>' +
      '</details>' +

      tabsHTML() +
      '<div id="astroPlanet">' + planetHTML(selected) + '</div>' +

      comparisonsHTML() +
      dominantesHTML() +

      '<p class="muted small astro-foot">' + esc(BELLINE.ASTRO_METHOD_NOTE) + '</p>' +
      '<p class="muted small astro-foot">' + esc(BELLINE.ASTRO_SOURCE_NOTE) + '</p>';

    wire();
  }

  function wire() {
    root.querySelectorAll('.astro-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        selected = b.dataset.planet;
        S.write('astro.planet', selected);
        draw();
        var sec = root.querySelector('.astro-planet');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    root.querySelectorAll('.astro-card-row').forEach(function (b) {
      b.addEventListener('click', function () { openCard(Number(b.dataset.num)); });
    });
  }

  draw();
};
