/* ---------------------------------------------------------------------------
 * Vue « Entraînement » — révision libre par flashcards (première version).
 * Quiz et répétition espacée viendront ensuite.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.entrainement = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;

  var stats = S.read('training.stats', { seen: 0, known: 0 });
  var card = null;
  var revealed = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function pick() {
    var cards = S.getCards();
    var next;
    do { next = cards[Math.floor(Math.random() * cards.length)]; }
    while (cards.length > 1 && card && next.number === card.number);
    card = next;
    revealed = false;
    draw();
  }

  function draw() {
    var planet = P[card.planet];
    var img = BELLINE.imageFor(card.number);
    var kw = (card.keywords || []);

    var figure = '<div class="flash-figure' + (img ? ' has-img' : '') + '" style="--hue:' + planet.hue + '">' +
      '<span>' + card.number + '</span>' +
      (img ? '<img src="' + img + '" alt="" onerror="this.remove()">' : '') +
      '</div>';
    var faceRevealed =
      '<h2>' + esc(card.name) + '</h2>' +
      '<p class="muted">' + planet.symbol + ' Série ' + planet.name + '</p>' +
      '<div class="flash-kw">' +
        (kw.length
          ? kw.map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('')
          : '<em class="muted">Aucun mot-clé enregistré — complète la fiche dans le Grimoire.</em>') +
      '</div>' +
      (card.sens && card.sens.general
        ? '<p class="flash-sens">' + esc(card.sens.general) + '</p>' : '');

    var faceHidden =
      '<p class="muted">' + planet.symbol + ' Série ' + planet.name + '</p>' +
      '<p class="flash-hint">À quoi correspond cette carte&nbsp;?</p>';

    root.innerHTML =
      '<div class="view-head"><h1>Entraînement</h1>' +
        '<p class="muted">Révision libre — reconnais la carte, puis vérifie.</p></div>' +

      '<div class="flash" style="--hue:' + planet.hue + '">' +
        '<div class="flash-card">' +
          figure +
          (revealed ? faceRevealed : faceHidden) +
        '</div>' +
        '<div class="flash-actions">' +
          (revealed
            ? '<button class="btn-ghost" id="trAgain">À revoir</button>' +
              '<button class="btn-primary" id="trKnew">Je savais</button>'
            : '<button class="btn-primary" id="trReveal">Révéler</button>') +
        '</div>' +
      '</div>' +

      '<p class="muted small session-line">Session : ' + stats.known + ' / ' + stats.seen +
        ' réussies · <button class="btn-link" id="trReset">remettre à zéro</button></p>' +

      '<div class="soon">' +
        '<h3>À venir dans ce module</h3>' +
        '<ul>' +
          '<li>Quiz à choix multiples (image → nom, nom → mots-clés, série planétaire)</li>' +
          '<li>Répétition espacée : les cartes mal maîtrisées reviennent plus souvent</li>' +
          '<li>Révision ciblée sur une seule famille planétaire</li>' +
        '</ul>' +
      '</div>';

    var q = function (id) { return root.querySelector(id); };
    var fig = root.querySelector('.flash-figure.has-img');
    if (fig && img) {
      fig.classList.add('is-zoom');
      fig.addEventListener('click', function () {
        BELLINE.lightbox(img, revealed ? (card.number + ' · ' + card.name) : ('Carte ' + card.number));
      });
    }
    if (q('#trReveal')) q('#trReveal').addEventListener('click', function () { revealed = true; draw(); });
    if (q('#trKnew')) q('#trKnew').addEventListener('click', function () {
      stats.seen++; stats.known++; S.write('training.stats', stats); pick();
    });
    if (q('#trAgain')) q('#trAgain').addEventListener('click', function () {
      stats.seen++; S.write('training.stats', stats); pick();
    });
    if (q('#trReset')) q('#trReset').addEventListener('click', function () {
      stats.seen = 0; stats.known = 0; S.write('training.stats', stats); draw();
    });
  }

  pick();
};
