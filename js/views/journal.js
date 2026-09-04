/* ---------------------------------------------------------------------------
 * Vue « Journal » — le carnet de tirages.
 *
 * Format d'après « Lire le Belline », ch. 30 : ce qui se consigne AVANT
 * (interlocuteurs, registre, sens de lecture, contexte connu, délai, relevés,
 * 3 à 6 énoncés falsifiables) et ce qui se coche APRÈS (chaque énoncé oui/non,
 * sans reformuler), plus un retour libre.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.journal = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;
  var openId = null;

  var js = S.read('journal.justSaved', null);
  if (js) { openId = js; S.write('journal.justSaved', null); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }
  function spreadName(id) { return (BELLINE.SPREADS[id] || {}).name || id; }
  function cardName(n) {
    var c = (BELLINE.SEED_CARDS || []).find(function (x) { return x.number === n; });
    return c ? c.name : ('Carte ' + n);
  }
  function carnetOf(t) {
    t.carnet = t.carnet || {};
    var k = t.carnet;
    k.interlocuteurs = k.interlocuteurs || { tire: '', sujet: '', consultant: '' };
    k.enonces = k.enonces || [];
    return k;
  }
  function save(t) { S.updateTirage(t.id, { carnet: t.carnet, retour: t.retour }); }

  /* ---------- liste ---------- */

  function renderList() {
    var list = S.getTirages();
    root.innerHTML =
      '<div class="view-head"><h1>Journal</h1>' +
        '<p class="muted">Tes tirages enregistrés. Ouvre-en un pour remplir le carnet.</p></div>' +
      (list.length
        ? '<ul class="jr-list">' + list.map(function (t) {
            var k = t.carnet || {};
            var done = (k.enonces || []).filter(function (e) { return e.verifie === 'oui' || e.verifie === 'non'; }).length;
            var tot = (k.enonces || []).length;
            return '<li class="jr-item" data-id="' + t.id + '">' +
              '<button type="button" class="jr-open" data-id="' + t.id + '">' +
                '<span class="jr-item-top"><strong>' + esc(spreadName(t.spreadId)) + '</strong>' +
                  '<span class="muted small">' + fmtDate(t.createdAt) + '</span></span>' +
                '<span class="jr-q">' + (t.question ? esc(t.question) : '<em class="muted">sans question</em>') + '</span>' +
                '<span class="muted small">' + Object.keys(t.cards || {}).filter(function (x) { return t.cards[x]; }).length + ' cartes' +
                  (tot ? ' · ' + done + '/' + tot + ' énoncés vérifiés' : '') + '</span>' +
              '</button>' +
              '<button type="button" class="jr-del btn-link danger" data-id="' + t.id + '">supprimer</button>' +
              '</li>';
          }).join('') + '</ul>'
        : '<div class="soon"><p>Aucun tirage enregistré. Va dans <strong>Tirages</strong>, pose un tirage et clique <strong>Enregistrer</strong>.</p></div>');

    root.querySelectorAll('.jr-open').forEach(function (b) {
      b.addEventListener('click', function () { openId = b.dataset.id; render(); });
    });
    root.querySelectorAll('.jr-del').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm('Supprimer ce tirage du journal ?')) return;
        S.deleteTirage(b.dataset.id); render();
      });
    });
  }

  /* ---------- carnet ---------- */

  function radio(name, value, current, label) {
    return '<label class="jr-radio"><input type="radio" name="' + name + '" value="' + value + '"' +
      (current === value ? ' checked' : '') + '> ' + label + '</label>';
  }

  function relevesHTML(t) {
    var a = BELLINE.analyzeTirage(t.spreadId, t.cards);
    if (!a || !a.placed) return '<p class="muted small">Aucune carte placée dans ce tirage.</p>';
    var fam = BELLINE.PLANET_ORDER.filter(function (pk) { return a.planets[pk]; })
      .map(function (pk) { return P[pk].symbol + ' ' + P[pk].name + ' ×' + a.planets[pk]; }).join(' · ');
    var v = a.valences;
    var conc = a.concordance;
    return '<dl class="jr-releves">' +
      '<dt>Familles</dt><dd>' + (fam || '—') + '</dd>' +
      '<dt>Valences</dt><dd>' + v.positive + ' positive' + (v.positive > 1 ? 's' : '') + ' · ' +
        v.negative + ' négative' + (v.negative > 1 ? 's' : '') + ' · ' + v.neutre + ' neutre' + (v.neutre > 1 ? 's' : '') + '</dd>' +
      '<dt>Cartes fortes</dt><dd>' + (a.fortes.length
        ? a.fortes.map(function (e) { return e.card.number + ' ' + esc(e.card.name); }).join(' · ') : '— aucune') + '</dd>' +
      '<dt>Positions contraires</dt><dd>' + (a.contraires.length
        ? a.contraires.map(function (e) {
            return esc(e.pos.label) + ' : ' + e.card.number + ' ' + esc(e.card.name) +
              ' (' + BELLINE.VALENCE[e.card.valence].label + ')';
          }).join('<br>')
        : '— aucune') + '</dd>' +
      (conc.total
        ? '<dt>Concordance</dt><dd>' + conc.concord + ' / ' + conc.total + ' lames fortes du bon côté</dd>'
        : '') +
      '</dl>';
  }

  function positionsHTML(t) {
    var spread = BELLINE.SPREADS[t.spreadId];
    if (!spread) return '';
    var subs = [], adjs = [];
    spread.positions.forEach(function (p) {
      var n = t.cards[p.id];
      if (!n) return;
      var line = '<li><span class="muted">' + esc(p.label) + '</span> — ' + n + ' ' + esc(cardName(n)) + '</li>';
      (p.kind === 'substantif' ? subs : adjs).push(line);
    });
    return '<div class="jr-cols">' +
      '<div><h4>Substantifs</h4><ul class="jr-plain">' + (subs.join('') || '<li class="muted">—</li>') + '</ul></div>' +
      '<div><h4>Adjectifs & Coupe</h4><ul class="jr-plain">' + (adjs.join('') || '<li class="muted">—</li>') + '</ul></div>' +
      '</div>';
  }

  function renderCarnet(t) {
    var k = carnetOf(t);
    var spread = BELLINE.SPREADS[t.spreadId] || {};
    var reversible = spread.typologie && spread.typologie.reversible;

    root.innerHTML =
      '<div class="view-head">' +
        '<button class="back-btn" id="jrBack">← Journal</button>' +
        '<h1>' + esc(spreadName(t.spreadId)) + '</h1>' +
        '<p class="muted">' + fmtDate(t.createdAt) + (t.question ? ' — ' + esc(t.question) : '') + '</p>' +
      '</div>' +

      '<section class="jr-sec"><h2>Avant — à consigner avant tout événement</h2>' +

        '<div class="jr-grid3">' +
          field('Qui tire', 'k-tire', k.interlocuteurs.tire) +
          field('Sujet (de qui il est question)', 'k-sujet', k.interlocuteurs.sujet) +
          field('Consultant (au sens du jeu)', 'k-consultant', k.interlocuteurs.consultant) +
        '</div>' +

        '<div class="jr-radios"><span class="jr-radios-label">Registre</span>' +
          radio('k-registre', 'affectif', k.registre, 'affectif') +
          radio('k-registre', 'circonstanciel', k.registre, 'circonstanciel') +
        '</div>' +
        (reversible
          ? '<div class="jr-radios"><span class="jr-radios-label">Sens de lecture</span>' +
              radio('k-sens', 'descendant', k.sens, 'descendant (avenir)') +
              radio('k-sens', 'ascendant', k.sens, 'ascendant (passé)') +
            '</div>'
          : '') +

        '<label class="field"><span>Contexte déjà connu — ce qui pourrait expliquer une correspondance</span>' +
          '<textarea id="k-contexte" rows="3">' + esc(k.contexte) + '</textarea></label>' +

        '<label class="field jr-delai"><span>Délai — date avant laquelle la question ne sera pas reposée</span>' +
          '<input type="date" id="k-delai" value="' + esc(k.delai || '') + '"></label>' +

        '<h3 class="jr-sub">Relevés (calculés)</h3>' + relevesHTML(t) +
        '<h3 class="jr-sub">Cartes posées</h3>' + positionsHTML(t) +

        '<h3 class="jr-sub">Énoncés vérifiables <span class="muted small">(3 à 6, falsifiables)</span></h3>' +
        '<ul class="jr-enonces" id="jrEnonces"></ul>' +
        '<button type="button" class="btn-ghost btn-sm" id="jrAddEnonce">+ énoncé</button>' +
      '</section>' +

      '<section class="jr-sec"><h2>Après — cocher, sans reformuler</h2>' +
        '<ul class="jr-check" id="jrCheck"></ul>' +
        '<label class="field"><span>Retour — ce qui s\'est réellement passé</span>' +
          '<textarea id="k-retour" rows="4">' + esc(t.retour || '') + '</textarea></label>' +
      '</section>';

    root.querySelector('#jrBack').addEventListener('click', function () { openId = null; render(); });

    bindText('#k-tire', function (val) { k.interlocuteurs.tire = val; });
    bindText('#k-sujet', function (val) { k.interlocuteurs.sujet = val; });
    bindText('#k-consultant', function (val) { k.interlocuteurs.consultant = val; });
    bindText('#k-contexte', function (val) { k.contexte = val; });
    bindText('#k-delai', function (val) { k.delai = val; });
    bindText('#k-retour', function (val) { t.retour = val; }, true);

    root.querySelectorAll('input[name="k-registre"]').forEach(function (r) {
      r.addEventListener('change', function () { k.registre = r.value; save(t); });
    });
    root.querySelectorAll('input[name="k-sens"]').forEach(function (r) {
      r.addEventListener('change', function () { k.sens = r.value; save(t); });
    });

    drawEnonces(t);
    root.querySelector('#jrAddEnonce').addEventListener('click', function () {
      if (k.enonces.length >= 6) return;
      k.enonces.push({ text: '', verifie: null });
      save(t); drawEnonces(t);
    });

    function bindText(sel, setter, isRetour) {
      var el = root.querySelector(sel);
      if (!el) return;
      el.addEventListener('input', function () { setter(el.value); save(t); });
    }
  }

  function field(label, id, value) {
    return '<label class="field"><span>' + label + '</span>' +
      '<input type="text" id="' + id + '" value="' + esc(value || '') + '"></label>';
  }

  function drawEnonces(t) {
    var k = carnetOf(t);
    var ul = root.querySelector('#jrEnonces');
    ul.innerHTML = k.enonces.map(function (e, i) {
      return '<li><input type="text" class="jr-enonce-txt" data-i="' + i + '" value="' + esc(e.text) + '" placeholder="Proposition vérifiable n°' + (i + 1) + '">' +
        '<button type="button" class="jr-enonce-del btn-link danger" data-i="' + i + '">×</button></li>';
    }).join('');
    ul.querySelectorAll('.jr-enonce-txt').forEach(function (inp) {
      inp.addEventListener('input', function () { k.enonces[inp.dataset.i].text = inp.value; save(t); });
    });
    ul.querySelectorAll('.jr-enonce-del').forEach(function (b) {
      b.addEventListener('click', function () {
        k.enonces.splice(Number(b.dataset.i), 1); save(t); drawEnonces(t);
      });
    });
    drawCheck(t);
  }

  function drawCheck(t) {
    var k = carnetOf(t);
    var ul = root.querySelector('#jrCheck');
    if (!ul) return;
    ul.innerHTML = k.enonces.length
      ? k.enonces.map(function (e, i) {
          return '<li><span class="jr-check-txt">' + (e.text ? esc(e.text) : '<em class="muted">énoncé n°' + (i + 1) + ' vide</em>') + '</span>' +
            '<span class="jr-check-btns">' +
              ['—', 'oui', 'non'].map(function (v) {
                var val = v === '—' ? null : v;
                return '<button type="button" class="jr-3state' + (e.verifie === val ? ' on' : '') +
                  '" data-i="' + i + '" data-v="' + v + '">' + v + '</button>';
              }).join('') +
            '</span></li>';
        }).join('')
      : '<li class="muted">Ajoute des énoncés dans la section « Avant ».</li>';
    ul.querySelectorAll('.jr-3state').forEach(function (b) {
      b.addEventListener('click', function () {
        k.enonces[b.dataset.i].verifie = b.dataset.v === '—' ? null : b.dataset.v;
        save(t); drawCheck(t);
      });
    });
  }

  function render() {
    var t = openId ? S.getTirage(openId) : null;
    if (t) renderCarnet(t); else { openId = null; renderList(); }
  }

  render();
};
