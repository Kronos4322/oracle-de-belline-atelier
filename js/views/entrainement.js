/* ---------------------------------------------------------------------------
 * Vue « Exercices » — révision active de l'Oracle.
 *
 *   · Révision espacée (Leitner) : les cartes mal maîtrisées reviennent plus vite
 *   · QCM : image → nom, nom → mots-clés, carte → série, carte → valence
 *   · Combinaisons : comment se lisent deux cartes ensemble
 *   · Positions : une carte à telle place — concorde-t-elle ou relève-t-elle
 *     du test de valence contraire ?
 *
 * Le suivi par carte alimente la Progression (« cartes qui te bloquent »).
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.entrainement = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;

  var BOX_DAYS = [0, 1, 2, 4, 8, 16];

  var mode = S.read('training.mode', 'revision');
  var famFilter = S.read('training.fam', '');
  var stats = S.read('training.stats', { seen: 0, known: 0 });
  var tc = S.getTrainingCards();

  var current = null;      // { card, kind, question, options, answer }
  var answered = null;     // index choisi (QCM) ou 'oui'/'non' (révision)

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(k, n) {
    var p = k.split('-'); var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function rec(n) {
    if (!tc[n]) tc[n] = { box: 0, seen: 0, ok: 0, ko: 0, due: today() };
    return tc[n];
  }
  function grade(n, correct) {
    var r = rec(n);
    r.seen++;
    if (correct) { r.ok++; r.box = Math.min(5, r.box + 1); }
    else { r.ko++; r.box = 0; }
    r.due = addDays(today(), BOX_DAYS[r.box]);
    S.saveTrainingCards(tc);
    stats.seen++; if (correct) stats.known++;
    S.write('training.stats', stats);
  }

  function pool() {
    var cards = BELLINE.SEED_CARDS.slice();
    if (famFilter) cards = cards.filter(function (c) { return c.planet === famFilter; });
    return cards;
  }
  function dueCards() {
    var t = today();
    return pool().filter(function (c) { return !tc[c.number] || tc[c.number].due <= t; });
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function sample(arr, n, exclude) {
    var p = arr.filter(function (x) { return exclude == null || x !== exclude; });
    var out = [];
    while (out.length < n && p.length) out.push(p.splice(Math.floor(Math.random() * p.length), 1)[0]);
    return out;
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- fabrication d'une question ---------- */

  function buildRevision() {
    var due = dueCards();
    var src = due.length ? due : pool();
    var seed = pick(src);
    current = { kind: 'revision', card: S.getCard(seed.number), revealed: false };
  }

  function buildQCM() {
    var kinds = ['nom', 'motscle', 'serie', 'valence'];
    var k = pick(kinds);
    var c = S.getCard(pick(pool()).number);
    var all = BELLINE.SEED_CARDS;
    if (k === 'nom') {
      var opts = shuffle([c.name].concat(sample(all, 3, null).filter(function (x) { return x.number !== c.number; }).map(function (x) { return x.name; })).slice(0, 4));
      if (opts.indexOf(c.name) === -1) opts[0] = c.name;
      current = { kind: 'qcm', sub: 'nom', card: c, showImage: true,
        q: 'Quelle est cette carte ?', options: opts, answer: c.name };
    } else if (k === 'motscle') {
      var kw = (c.keywords || []);
      if (!kw.length) return buildQCM();
      var good = kw[0];
      var others = shuffle(all.filter(function (x) { return x.number !== c.number; }))
        .map(function (x) { var b = S.getCard(x.number); return (b.keywords || [])[0]; })
        .filter(function (w) { return w && kw.indexOf(w) === -1; }).slice(0, 3);
      current = { kind: 'qcm', sub: 'motscle', card: c, showImage: false,
        q: 'Quel mot-clé va avec « ' + c.name + ' » ?', options: shuffle([good].concat(others)), answer: good };
    } else if (k === 'serie') {
      var series = BELLINE.PLANET_ORDER.map(function (pk) { return P[pk].name; });
      current = { kind: 'qcm', sub: 'serie', card: c, showImage: true,
        q: 'À quelle série appartient « ' + c.name + ' » ?', options: shuffle(series.slice()), answer: P[c.planet].name };
    } else {
      current = { kind: 'qcm', sub: 'valence', card: c, showImage: false,
        q: 'Quelle est la valence lexicale de « ' + c.name + ' » ?',
        options: ['positive', 'négative', 'neutre'],
        answer: BELLINE.VALENCE[c.valence].label };
    }
  }

  function buildCombo() {
    var list = (BELLINE.CLASSIC_COMBOS || []);
    if (!list.length) return buildQCM();
    var good = pick(list);
    var others = shuffle(list.filter(function (x) { return x !== good; })).slice(0, 3);
    var label = good.cards.map(function (k) { var b = BELLINE.cardByNumber(k); return k + ' ' + (b ? b.name : ''); }).join('  +  ');
    current = { kind: 'combo', pairLabel: label, cards: good.cards,
      q: 'Comment se lit cette combinaison ?',
      options: shuffle([good.note].concat(others.map(function (o) { return o.note; }))),
      answer: good.note };
  }

  function buildPosition() {
    var spreads = ['hecate', 'verdict'];
    var sp = BELLINE.SPREADS[pick(spreads)];
    var polar = sp.positions.filter(function (p) { return p.polarity; });
    var pos = pick(polar);
    var np = pool().filter(function (x) { return x.valence !== 'neutre'; });
    var c = S.getCard((np.length ? pick(np) : pick(pool())).number);
    var favCard = c.valence === 'positive';
    var favPos = pos.polarity === 'favorable';
    var ans = favCard === favPos ? 'Elle concorde — rien à faire de spécial.'
      : favCard ? 'Test de valence contraire : chercher son ombre.'
                : 'Test de valence contraire : chercher sa fonction constructive.';
    current = { kind: 'position', card: c, posLabel: sp.name + ' — ' + pos.label + ' (' + pos.polarity + ')',
      q: '« ' + c.number + ' ' + c.name + ' » (valence ' + BELLINE.VALENCE[c.valence].label + ') tombe ici. Que fais-tu ?',
      options: shuffle([
        'Elle concorde — rien à faire de spécial.',
        'Test de valence contraire : chercher son ombre.',
        'Test de valence contraire : chercher sa fonction constructive.'
      ]), answer: ans };
  }

  function next() {
    answered = null;
    if (mode === 'revision') buildRevision();
    else if (mode === 'qcm') buildQCM();
    else if (mode === 'combo') buildCombo();
    else buildPosition();
    draw();
  }

  /* ---------- rendu ---------- */

  var MODES = [
    ['revision', 'Révision espacée'],
    ['qcm', 'QCM'],
    ['combo', 'Combinaisons'],
    ['position', 'Positions']
  ];

  function figureHTML(c, big) {
    var planet = P[c.planet];
    var img = BELLINE.imageFor(c.number);
    return '<div class="qcm-figure" style="--hue:' + planet.hue + (big ? ';width:150px;height:232px' : '') + '">' +
      '<span>' + c.number + '</span>' +
      (img ? '<img src="' + img + '" alt="" onerror="this.remove()">' : '') + '</div>';
  }

  function draw() {
    var dueN = dueCards().length;
    var famOpts = '<option value="">Toutes les séries</option>' +
      BELLINE.PLANET_ORDER.map(function (pk) {
        return '<option value="' + pk + '"' + (famFilter === pk ? ' selected' : '') + '>' + esc(P[pk].name) + '</option>';
      }).join('');

    var body = '';

    if (current && current.kind === 'revision') {
      var c = current.card;
      var planet = P[c.planet];
      var kw = c.keywords || [];
      body =
        '<div class="qcm">' +
          figureHTML(c, true) +
          (current.revealed
            ? '<p class="qcm-q">' + esc(c.name) + '</p>' +
              '<p class="qcm-sub">' + planet.symbol + ' Série ' + planet.name + ' · valence ' + BELLINE.VALENCE[c.valence].label +
                (c.forte ? ' · carte forte' : '') + '</p>' +
              (kw.length ? '<div class="cj-kw">' + kw.slice(0, 6).map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('') + '</div>' : '') +
              (c.sens && c.sens.general ? '<p class="cj-sens muted">' + esc(c.sens.general) + '</p>' : '') +
              '<div class="qcm-next"><button type="button" class="btn-ghost" id="exKo">À revoir</button>' +
                '<button type="button" class="btn-primary" id="exOk">Je savais</button></div>'
            : '<p class="qcm-sub">' + planet.symbol + ' Série ' + planet.name + '</p>' +
              '<p class="qcm-q">Que dit cette carte ?</p>' +
              '<div class="qcm-next"><button type="button" class="btn-primary" id="exReveal">Révéler</button></div>') +
        '</div>';
    } else if (current && current.kind === 'qcm') {
      body =
        '<div class="qcm">' +
          (current.showImage ? figureHTML(current.card, true) : '') +
          '<p class="qcm-q">' + esc(current.q) + '</p>' +
          optsHTML(current.options, current.answer) +
          (answered != null ? feedbackHTML(current.card) : '') +
        '</div>';
    } else if (current && current.kind === 'combo') {
      body =
        '<div class="qcm">' +
          '<p class="qcm-sub">' + esc(current.pairLabel) + '</p>' +
          '<div class="sp-guided-cards" style="justify-content:center">' +
            current.cards.map(function (k) {
              var b = BELLINE.cardByNumber(k);
              return '<span class="assoc-chip"><b>' + k + '</b> ' + esc(b ? b.name : '') + '</span>';
            }).join('') + '</div>' +
          '<p class="qcm-q">' + esc(current.q) + '</p>' +
          optsHTML(current.options, current.answer) +
        '</div>';
    } else if (current && current.kind === 'position') {
      body =
        '<div class="qcm">' +
          '<p class="qcm-sub">' + esc(current.posLabel) + '</p>' +
          '<p class="qcm-q">' + esc(current.q) + '</p>' +
          optsHTML(current.options, current.answer) +
        '</div>';
    }

    root.innerHTML =
      '<div class="view-head"><h1>Exercices</h1>' +
        '<p class="muted">Révision active — le suivi par carte alimente la Progression.</p></div>' +

      '<div class="ex-modes">' +
        MODES.map(function (m) {
          return '<button type="button" class="ex-mode' + (mode === m[0] ? ' on' : '') + '" data-mode="' + m[0] + '">' + esc(m[1]) + '</button>';
        }).join('') +
        '<select id="exFam" class="se-field">' + famOpts + '</select>' +
      '</div>' +

      (mode === 'revision' ? '<p class="ex-due">' + dueN + ' carte' + (dueN > 1 ? 's' : '') + ' à revoir aujourd\'hui' +
        (famFilter ? ' · série ' + esc(P[famFilter].name) : '') + '</p>' : '') +

      body +

      '<p class="qcm-score">Session : ' + stats.known + ' / ' + stats.seen + ' réussies · ' +
        '<button type="button" class="btn-link" id="exReset">remettre à zéro</button></p>';

    wire();
  }

  function optsHTML(options, answer) {
    return '<div class="qcm-opts">' + options.map(function (o, i) {
      var cls = 'qcm-opt';
      if (answered != null) {
        if (o === answer) cls += ' correct';
        else if (i === answered) cls += ' wrong';
      }
      return '<button type="button" class="' + cls + '" data-i="' + i + '"' + (answered != null ? ' disabled' : '') + '>' + esc(o) + '</button>';
    }).join('') + '</div>' +
      (answered != null
        ? '<div class="qcm-next"><button type="button" class="btn-primary" id="exContinue">Continuer</button></div>'
        : '');
  }

  function feedbackHTML(c) {
    if (!c) return '';
    return '<p class="qcm-score">' + esc(c.number + ' ' + c.name) + ' · ' + P[c.planet].name +
      ' · valence ' + BELLINE.VALENCE[c.valence].label + '</p>';
  }

  function wire() {
    var q = function (id) { return root.querySelector(id); };

    root.querySelectorAll('.ex-mode').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.dataset.mode; S.write('training.mode', mode); next();
      });
    });
    var fam = q('#exFam');
    if (fam) fam.addEventListener('change', function () {
      famFilter = fam.value; S.write('training.fam', famFilter); next();
    });
    if (q('#exReset')) q('#exReset').addEventListener('click', function () {
      stats = { seen: 0, known: 0 }; S.write('training.stats', stats); draw();
    });

    if (q('#exReveal')) q('#exReveal').addEventListener('click', function () { current.revealed = true; draw(); });
    if (q('#exOk')) q('#exOk').addEventListener('click', function () { grade(current.card.number, true); next(); });
    if (q('#exKo')) q('#exKo').addEventListener('click', function () { grade(current.card.number, false); next(); });

    root.querySelectorAll('.qcm-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        if (answered != null) return;
        answered = Number(b.dataset.i);
        var chosen = current.options[answered];
        var correct = chosen === current.answer;
        if (current.card) grade(current.card.number, correct);
        else { stats.seen++; if (correct) stats.known++; S.write('training.stats', stats); }
        draw();
      });
    });
    if (q('#exContinue')) q('#exContinue').addEventListener('click', next);

    var fig = root.querySelector('.qcm-figure');
    if (fig && current && current.card && BELLINE.imageFor(current.card.number)) {
      fig.style.cursor = 'zoom-in';
      fig.addEventListener('click', function () {
        BELLINE.lightbox(BELLINE.imageFor(current.card.number),
          (current.revealed || current.kind !== 'revision') ? (current.card.number + ' · ' + current.card.name) : ('Carte ' + current.card.number));
      });
    }
  }

  next();
};
