/* ---------------------------------------------------------------------------
 * Vue « Journal » — le carnet de tirages.
 *
 * Format d'après « Lire le Belline », ch. 30 : ce qui se consigne AVANT
 * (interlocuteurs, registre, sens de lecture, contexte connu, délai, relevés,
 * 3 à 6 énoncés falsifiables) et ce qui se coche APRÈS (chaque énoncé oui/non,
 * sans reformuler), plus un retour libre. Lectures croisées (ch. 22, 21.3).
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.journal = function (root) {
  var S = BELLINE.Storage;
  var P = BELLINE.PLANETS;
  var openId = null;
  var compareMode = false;
  var cmpA = null, cmpB = null;
  var query = '';
  var filterSpread = '';
  var sortDir = 'desc';

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
  function fmtMonth(iso) {
    try {
      var d = new Date(iso);
      var s = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      return s.charAt(0).toUpperCase() + s.slice(1);
    } catch (e) { return ''; }
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
  function pct(x) { return (x * 100).toFixed(1).replace('.', ',') + ' %'; }
  function enoncesDone(t) {
    var k = t.carnet || {};
    var list = k.enonces || [];
    return { done: list.filter(function (e) { return e.verifie === 'oui' || e.verifie === 'non'; }).length, tot: list.length };
  }

  /* Cartes représentatives d'un tirage pour la vignette de la liste :
     les substantifs d'abord, puis le reste, jusqu'à 4. */
  function thumbCards(t, max) {
    BELLINE.refreshSpreads();
    var spread = BELLINE.SPREADS[t.spreadId];
    if (!spread) return [];
    var entries = BELLINE.spreadEntries(spread, t.cards);
    entries.sort(function (a, b) {
      var ra = a.pos.kind === 'substantif' ? 0 : 1, rb = b.pos.kind === 'substantif' ? 0 : 1;
      return ra - rb;
    });
    var seen = {}, out = [];
    entries.forEach(function (e) {
      if (out.length >= (max || 4)) return;
      if (seen[e.card.number]) return;
      seen[e.card.number] = true;
      out.push(e.card.number);
    });
    return out;
  }

  function thumbsHTML(nums) {
    if (!nums.length) return '<div class="jr-thumbs jr-thumbs-empty">✷</div>';
    return '<div class="jr-thumbs">' + nums.map(function (n) {
      var img = BELLINE.imageFor(n);
      return '<span class="jr-thumb">' + (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : n) + '</span>';
    }).join('') + '</div>';
  }

  function valenceBarHTML(a) {
    var v = a.valences, tot = v.positive + v.negative + v.neutre;
    if (!tot) return '';
    var pp = (v.positive / tot) * 100, pn = (v.negative / tot) * 100, pu = (v.neutre / tot) * 100;
    return '<div class="jr-valbar" title="' + v.positive + ' positives · ' + v.negative + ' négatives · ' + v.neutre + ' neutres">' +
      (pp ? '<i class="is-pos" style="width:' + pp + '%"></i>' : '') +
      (pn ? '<i class="is-neg" style="width:' + pn + '%"></i>' : '') +
      (pu ? '<i class="is-neu" style="width:' + pu + '%"></i>' : '') +
      '</div>';
  }

  /* ---------- liste ---------- */

  function renderList() {
    var all = S.getTirages();
    var spreadOptions = '<option value="">Tous les tirages</option>' +
      Object.keys(BELLINE.SPREADS || {}).filter(function (id) { return all.some(function (t) { return t.spreadId === id; }); })
        .map(function (id) { return '<option value="' + id + '"' + (filterSpread === id ? ' selected' : '') + '>' + esc(spreadName(id)) + '</option>'; }).join('');

    var list = all.filter(function (t) {
      if (filterSpread && t.spreadId !== filterSpread) return false;
      if (query && (t.question || '').toLowerCase().indexOf(query.toLowerCase()) === -1) return false;
      return true;
    }).sort(function (a, b) {
      var d = new Date(a.createdAt) - new Date(b.createdAt);
      return sortDir === 'desc' ? -d : d;
    });

    /* stats globales */
    var totEnonces = 0, doneEnonces = 0, thisMonth = 0;
    var nowMonth = new Date().getMonth(), nowYear = new Date().getFullYear();
    all.forEach(function (t) {
      var e = enoncesDone(t); totEnonces += e.tot; doneEnonces += e.done;
      var d = new Date(t.createdAt);
      if (d.getMonth() === nowMonth && d.getFullYear() === nowYear) thisMonth++;
    });

    var statsHTML = all.length
      ? '<div class="stat-grid jr-stats">' +
          '<div class="stat"><div class="stat-n">' + all.length + '</div><div class="stat-l">Tirages consignés</div></div>' +
          '<div class="stat"><div class="stat-n">' + thisMonth + '</div><div class="stat-l">Ce mois-ci</div></div>' +
          '<div class="stat"><div class="stat-n">' + doneEnonces + '<span>/' + totEnonces + '</span></div>' +
            '<div class="stat-l">Énoncés vérifiés</div>' +
            (totEnonces ? '<div class="bar"><i style="width:' + Math.round(doneEnonces / totEnonces * 100) + '%"></i></div>' : '') + '</div>' +
        '</div>'
      : '';

    var toolbarHTML = all.length
      ? '<div class="jr-toolbar">' +
          '<input type="search" id="jrSearch" placeholder="Filtrer par question…" value="' + esc(query) + '" autocomplete="off">' +
          '<select id="jrFilterSpread">' + spreadOptions + '</select>' +
          '<select id="jrSort">' +
            '<option value="desc"' + (sortDir === 'desc' ? ' selected' : '') + '>Plus récent</option>' +
            '<option value="asc"' + (sortDir === 'asc' ? ' selected' : '') + '>Plus ancien</option>' +
          '</select>' +
          (all.length >= 2 ? '<button type="button" class="btn-ghost btn-sm" id="jrCompareBtn">Comparer deux tirages</button>' : '') +
        '</div>'
      : '';

    /* regroupement par mois si l'historique s'étale sur plusieurs mois */
    var months = {};
    list.forEach(function (t) {
      var mk = new Date(t.createdAt).getFullYear() + '-' + new Date(t.createdAt).getMonth();
      (months[mk] = months[mk] || []).push(t);
    });
    var multiMonth = Object.keys(months).length > 1;

    function itemHTML(t) {
      var a = BELLINE.analyzeTirage(t.spreadId, t.cards);
      var eo = enoncesDone(t);
      var conc = a && a.concordance;
      return '<li class="jr-item" data-id="' + t.id + '">' +
        thumbsHTML(thumbCards(t, 4)) +
        '<button type="button" class="jr-open" data-id="' + t.id + '">' +
          '<span class="jr-item-top"><strong>' + esc(spreadName(t.spreadId)) + '</strong>' +
            '<span class="muted small">' + fmtDate(t.createdAt) + '</span></span>' +
          '<span class="jr-q">' + (t.question ? esc(t.question) : '<em class="muted">sans question</em>') + '</span>' +
          '<span class="jr-item-meta">' +
            (a ? valenceBarHTML(a) : '') +
            (a && a.fortes.length ? '<span class="jr-badge">★ ' + a.fortes.length + '</span>' : '') +
            (conc && conc.total >= 2 && conc.p != null ? '<span class="jr-badge jr-badge-conc">conc. ' + conc.concord + '/' + conc.total + '</span>' : '') +
            (eo.tot ? '<span class="jr-badge">' + eo.done + '/' + eo.tot + ' vérifiés</span>' : '') +
          '</span>' +
        '</button>' +
        '<button type="button" class="jr-del" data-id="' + t.id + '" aria-label="Supprimer" title="Supprimer">×</button>' +
        '</li>';
    }

    var listHTML;
    if (!all.length) {
      listHTML = '<div class="soon"><p>Aucun tirage enregistré. Va dans <strong>Tirages</strong>, pose un tirage et clique <strong>Enregistrer</strong>.</p></div>';
    } else if (!list.length) {
      listHTML = '<p class="muted pad">Aucun tirage ne correspond à ce filtre.</p>';
    } else if (multiMonth) {
      listHTML = Object.keys(months).sort(function (a, b) {
        var d = new Date(months[a][0].createdAt) - new Date(months[b][0].createdAt);
        return sortDir === 'desc' ? -d : d;
      }).map(function (mk) {
        return '<h3 class="jr-month">' + esc(fmtMonth(months[mk][0].createdAt)) + '</h3>' +
          '<ul class="jr-list">' + months[mk].map(itemHTML).join('') + '</ul>';
      }).join('');
    } else {
      listHTML = '<ul class="jr-list">' + list.map(itemHTML).join('') + '</ul>';
    }

    root.innerHTML =
      '<div class="view-head"><h1>Journal</h1>' +
        '<p class="muted">Tes tirages enregistrés. Ouvre-en un pour remplir le carnet.</p></div>' +
      statsHTML + toolbarHTML + listHTML;

    root.querySelectorAll('.jr-open').forEach(function (b) {
      b.addEventListener('click', function () { openId = b.dataset.id; render(); });
    });
    var search = root.querySelector('#jrSearch');
    if (search) search.addEventListener('input', function () { query = search.value; renderListOnly(); });
    var fsel = root.querySelector('#jrFilterSpread');
    if (fsel) fsel.addEventListener('change', function () { filterSpread = fsel.value; renderListOnly(); });
    var ssel = root.querySelector('#jrSort');
    if (ssel) ssel.addEventListener('change', function () { sortDir = ssel.value; renderListOnly(); });
    var cmpBtn = root.querySelector('#jrCompareBtn');
    if (cmpBtn) cmpBtn.addEventListener('click', function () {
      compareMode = true; cmpA = null; cmpB = null; render();
    });
    root.querySelectorAll('.jr-del').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        BELLINE.confirm('Supprimer ce tirage du journal ?').then(function (ok) {
          if (!ok) return;
          S.deleteTirage(b.dataset.id); render();
        });
      });
    });
  }

  /* Ré-affiche juste la liste après un filtre, sans perdre le focus du champ
     de recherche (contrairement à un render() complet). */
  function renderListOnly() {
    var active = document.activeElement;
    var wasSearch = active && active.id === 'jrSearch';
    var caret = wasSearch ? active.selectionStart : null;
    renderList();
    if (wasSearch) {
      var s = root.querySelector('#jrSearch');
      if (s) { s.focus(); if (caret != null) s.setSelectionRange(caret, caret); }
    }
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
    var conc = a.concordance, cn = a.concordanceNeutral;
    var diverge = conc.p != null && cn.p != null && Math.abs(conc.p - cn.p) > 0.1;
    return '<dl class="jr-releves">' +
      '<dt>Familles</dt><dd>' + (fam || '—') + '</dd>' +
      '<dt>Valences</dt><dd>' + v.positive + ' positive' + (v.positive > 1 ? 's' : '') + ' · ' +
        v.negative + ' négative' + (v.negative > 1 ? 's' : '') + ' · ' + v.neutre + ' neutre' + (v.neutre > 1 ? 's' : '') + '</dd>' +
      '<dt>Cartes fortes' + (a.fortes.length > 1 ? ' (' + a.fortes.length + ')' : '') + '</dt><dd>' + (a.fortes.length
        ? a.fortes.map(function (e) { return esc(e.pos.label) + ' : ' + e.card.number + ' ' + esc(e.card.name); }).join('<br>') : '— aucune') + '</dd>' +
      (t.sens ? '<dt>Sens de lecture</dt><dd>' + esc(t.sens) + '</dd>' : '') +
      '<dt>Positions contraires</dt><dd>' + (a.contraires.length
        ? a.contraires.map(function (e) {
            return esc(e.pos.label) + ' : ' + e.card.number + ' ' + esc(e.card.name) +
              ' (' + BELLINE.VALENCE[e.card.valence].label + ')' + (e.card.fragile ? ' — fragile' : '');
          }).join('<br>')
        : '— aucune') + '</dd>' +
      (a.doublons && a.doublons.length
        ? '<dt>Doublon de Coupe</dt><dd>' + a.doublons.map(function (e) { return e.card.number + ' ' + esc(e.card.name); }).join(' · ') +
          ' <span class="muted small">(attendu au-delà de ~20 cartes — pas un signe)</span></dd>' : '') +
      (conc.total
        ? '<dt>Concordance</dt><dd>' +
            conc.concord + ' / ' + conc.total + (conc.p != null ? ' — P(≥ obs.) ' + pct(conc.p) : '') +
            (a.fragiles && a.fragiles.length
              ? '<br><span class="muted small">Lames fragiles neutralisées (' + a.fragiles.map(function (e) { return e.card.number; }).join(', ') +
                ') : ' + cn.concord + ' / ' + cn.total + (cn.p != null ? ' — ' + pct(cn.p) : '') +
                (diverge ? ' — <strong>divergence forte, résultat non exploitable seul.</strong>' : '') + '</span>'
              : '<br><span class="muted small">Aucune lame fragile en jeu.</span>') +
          '</dd>'
        : '') +
      '</dl>';
  }

  function positionsHTML(t) {
    var spread = BELLINE.SPREADS[t.spreadId];
    if (!spread) return '';
    var subs = [], adjs = [];
    spread.positions.forEach(function (p) {
      var n = t.cards[p.id];
      if (n) {
        var line = '<li><span class="muted">' + esc(p.label) + '</span> — ' + n + ' ' + esc(cardName(n)) + '</li>';
        (p.kind === 'substantif' ? subs : adjs).push(line);
      }
      for (var i = 1; i <= (p.adj || 0); i++) {
        var an = t.cards[p.id + '#a' + i];
        if (an) adjs.push('<li><span class="muted">' + esc(p.label) + ' — adj.</span> — ' + an + ' ' + esc(cardName(an)) + '</li>');
      }
    });
    return '<div class="jr-cols">' +
      '<div><h4>Substantifs</h4><ul class="jr-plain">' + (subs.join('') || '<li class="muted">—</li>') + '</ul></div>' +
      '<div><h4>Adjectifs &amp; Coupe</h4><ul class="jr-plain">' + (adjs.join('') || '<li class="muted">—</li>') + '</ul></div>' +
      '</div>';
  }

  /* Résumé texte, pour copier ailleurs (messagerie, autre appli…). */
  function toPlainText(t) {
    var k = carnetOf(t);
    var spread = BELLINE.SPREADS[t.spreadId] || {};
    var lines = [];
    lines.push(spreadName(t.spreadId) + ' — ' + fmtDate(t.createdAt));
    if (t.question) lines.push('Question : ' + t.question);
    lines.push('');
    (spread.positions || []).forEach(function (p) {
      var n = t.cards[p.id];
      if (n) lines.push(p.label + ' — ' + n + ' ' + cardName(n));
      for (var i = 1; i <= (p.adj || 0); i++) {
        var an = t.cards[p.id + '#a' + i];
        if (an) lines.push('  ' + p.label + ' (adj.) — ' + an + ' ' + cardName(an));
      }
    });
    if (k.enonces && k.enonces.length) {
      lines.push('');
      lines.push('Énoncés :');
      k.enonces.forEach(function (e) {
        lines.push('  [' + (e.verifie === 'oui' ? 'oui' : e.verifie === 'non' ? 'non' : ' — ') + '] ' + (e.text || '(vide)'));
      });
    }
    if (t.retour) { lines.push(''); lines.push('Retour : ' + t.retour); }
    return lines.join('\n');
  }

  function renderCarnet(t) {
    var k = carnetOf(t);
    var spread = BELLINE.SPREADS[t.spreadId] || {};
    var reversible = spread.typologie && spread.typologie.reversible;
    var eo = enoncesDone(t);
    var a = BELLINE.analyzeTirage(t.spreadId, t.cards);
    var thumbs = thumbCards(t, 6);
    var apresStarted = eo.done > 0 || !!(t.retour && t.retour.trim());

    root.innerHTML =
      '<div class="view-head">' +
        '<button class="back-btn" id="jrBack">← Journal</button>' +
        '<h1>' + esc(spreadName(t.spreadId)) + '</h1>' +
        '<p class="muted">' + fmtDate(t.createdAt) + (t.question ? ' — ' + esc(t.question) : '') + '</p>' +
      '</div>' +

      '<div class="jr-summary">' +
        thumbsHTML(thumbs) +
        '<div class="jr-summary-body">' +
          (a ? valenceBarHTML(a) : '') +
          '<div class="jr-summary-chips">' +
            (a && a.fortes.length ? '<span class="jr-badge">★ ' + a.fortes.length + ' carte' + (a.fortes.length > 1 ? 's' : '') + ' forte' + (a.fortes.length > 1 ? 's' : '') + '</span>' : '') +
            (a && a.contraires.length ? '<span class="jr-badge jr-badge-warn">' + a.contraires.length + ' contraire' + (a.contraires.length > 1 ? 's' : '') + '</span>' : '') +
            (a && a.concordance.total >= 2 && a.concordance.p != null ? '<span class="jr-badge jr-badge-conc">concordance ' + a.concordance.concord + '/' + a.concordance.total + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="jr-summary-actions">' +
          '<button type="button" class="btn-ghost btn-sm" id="jrReopen">Revoir le plateau</button>' +
          '<button type="button" class="btn-ghost btn-sm" id="jrCopy">Copier en texte</button>' +
        '</div>' +
      '</div>' +

      '<div class="jr-steps">' +
        '<span class="jr-step is-active">① Avant</span>' +
        '<span class="jr-step-arrow">→</span>' +
        '<span class="jr-step' + (apresStarted ? ' is-active' : '') + '">② Après' +
          (eo.tot ? ' <em>' + eo.done + '/' + eo.tot + '</em>' : '') + '</span>' +
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

        '<details class="jr-details"><summary>Relevés &amp; cartes posées <span class="muted small">(calculés)</span></summary>' +
          '<h3 class="jr-sub">Relevés</h3>' + relevesHTML(t) +
          '<h3 class="jr-sub">Cartes posées</h3>' + positionsHTML(t) +
        '</details>' +

        '<h3 class="jr-sub">Énoncés vérifiables <span class="muted small">(3 à 6, falsifiables)</span></h3>' +
        '<ul class="jr-enonces" id="jrEnonces"></ul>' +
        '<button type="button" class="btn-ghost btn-sm" id="jrAddEnonce">+ énoncé</button>' +
      '</section>' +

      '<section class="jr-sec jr-sec-apres"><h2>Après — cocher, sans reformuler</h2>' +
        (eo.tot ? '<div class="bar jr-progress"><i style="width:' + Math.round(eo.done / eo.tot * 100) + '%"></i></div>' : '') +
        '<ul class="jr-check" id="jrCheck"></ul>' +
        '<label class="field"><span>Retour — ce qui s\'est réellement passé</span>' +
          '<textarea id="k-retour" rows="4">' + esc(t.retour || '') + '</textarea></label>' +
      '</section>';

    root.querySelector('#jrBack').addEventListener('click', function () { openId = null; render(); });
    root.querySelector('#jrReopen').addEventListener('click', function () {
      S.saveDraft(t.spreadId, { question: t.question, cards: JSON.parse(JSON.stringify(t.cards)), notes: t.notes || '', sens: t.sens || 'descendant', domaine: 'general', example: false });
      S.write('tirage.current', t.spreadId);
      BELLINE.go('tirages');
    });
    root.querySelector('#jrCopy').addEventListener('click', function () {
      var text = toPlainText(t);
      var done = function () { BELLINE.toast('Tirage copié — colle-le où tu veux.', 'success'); };
      var fail = function () { BELLINE.toast('Copie impossible sur cet appareil.', 'error'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
      else fail();
    });

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

    function bindText(sel, setter) {
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
              [['—', null], ['✓', 'oui'], ['✕', 'non']].map(function (v) {
                return '<button type="button" class="jr-3state jr-3state-' + (v[1] || 'none') + (e.verifie === v[1] ? ' on' : '') +
                  '" data-i="' + i + '" data-v="' + (v[1] || '') + '" aria-label="' + (v[1] || 'à vérifier') + '">' + v[0] + '</button>';
              }).join('') +
            '</span></li>';
        }).join('')
      : '<li class="muted">Ajoute des énoncés dans la section « Avant ».</li>';
    ul.querySelectorAll('.jr-3state').forEach(function (b) {
      b.addEventListener('click', function () {
        k.enonces[b.dataset.i].verifie = b.dataset.v || null;
        save(t); drawCheck(t);
        var top = root.querySelector('.jr-step-arrow'); if (top) top.nextElementSibling.classList.add('is-active');
        var prog = root.querySelector('.jr-progress i');
        if (prog) { var eo = enoncesDone(t); prog.style.width = Math.round(eo.done / eo.tot * 100) + '%'; }
      });
    });
  }

  /* ---------- lectures croisées (ch. 22) ---------- */

  function renderCompare() {
    var list = S.getTirages();
    var options = '<option value="">— choisir —</option>' + list.map(function (t) {
      return '<option value="' + t.id + '">' + esc(fmtDate(t.createdAt)) + ' · ' + esc(spreadName(t.spreadId)) +
        (t.question ? ' — ' + esc(t.question) : '') + '</option>';
    }).join('');

    var tA = cmpA ? S.getTirage(cmpA) : null;
    var tB = cmpB ? S.getTirage(cmpB) : null;
    var result = (tA && tB) ? BELLINE.compareTirages(tA, tB) : null;

    root.innerHTML =
      '<div class="view-head">' +
        '<button class="back-btn" id="jrCompareBack">← Journal</button>' +
        '<h1>Lectures croisées</h1>' +
        '<p class="muted">Comparer deux tirages consignés — manuel, ch. 22.</p>' +
      '</div>' +

      '<section class="jr-sec">' +
        '<h2>Trois conditions, avant de comparer</h2>' +
        '<ul>' +
          '<li><strong>Objets distincts.</strong> Comparer deux tirages sur la même question ne mesure que ta propre stabilité, pas la situation.</li>' +
          '<li><strong>Indépendance.</strong> Deux tirages posés le même jour sur la même situation ne sont pas deux observations : leurs coïncidences ne se combinent pas.</li>' +
          '<li><strong>Consultant déclaré.</strong> Une carte-personne qui apparaît dans les deux tirages ne désigne la même personne que si le consultant est le même des deux côtés.</li>' +
        '</ul>' +
        '<p class="muted small">Ce qu\'une lecture croisée peut légitimement produire : des énoncés qu\'aucun tirage ne donne seul. Ce qu\'elle ne produit jamais : une preuve — la cohérence de plusieurs lectures faites par la même personne sur la même situation est exactement ce qu\'on attend.</p>' +
      '</section>' +

      '<section class="jr-sec">' +
        '<h2>Choisir les deux tirages</h2>' +
        '<div class="jr-grid3" style="grid-template-columns:1fr 1fr">' +
          '<label class="field"><span>Tirage A</span><select id="cmpSelA">' + options + '</select></label>' +
          '<label class="field"><span>Tirage B</span><select id="cmpSelB">' + options + '</select></label>' +
        '</div>' +
      '</section>' +

      (result ? compareResultHTML(result) : '');

    root.querySelector('#jrCompareBack').addEventListener('click', function () { compareMode = false; render(); });
    var selA = root.querySelector('#cmpSelA'), selB = root.querySelector('#cmpSelB');
    selA.value = cmpA || ''; selB.value = cmpB || '';
    selA.addEventListener('change', function () { cmpA = selA.value || null; renderCompare(); });
    selB.addEventListener('change', function () { cmpB = selB.value || null; renderCompare(); });
  }

  function compareResultHTML(r) {
    return '<section class="jr-sec">' +
      '<h2>Ce que les deux tirages ont en commun</h2>' +
      (r.sameDay ? '<p class="sp-doublon"><strong>Même jour.</strong> Les deux tirages sont datés du même jour — leur indépendance est douteuse ; ne pas combiner leurs probabilités (Progression).</p>' : '') +
      '<h3 class="jr-sub">Cartes communes</h3>' +
      (r.commonCards.length
        ? '<ul class="jr-plain">' + r.commonCards.map(function (c) {
            return '<li>' + c.number + ' ' + esc(cardName(c.number)) +
              (c.count1 > 1 || c.count2 > 1 ? ' <span class="muted small">(' + c.count1 + ' fois dans A, ' + c.count2 + ' dans B)</span>' : '') + '</li>';
          }).join('') + '</ul>' +
          '<p class="muted small">Attendu au volume du jeu : une lame donnée a couramment des chances d\'apparaître dans deux tirages distincts. Une récurrence de <em>carte</em> seule n\'est pas un signe.</p>'
        : '<p class="muted">Aucune carte commune.</p>') +
      '<h3 class="jr-sub">Familles communes</h3>' +
      (r.commonFamilies.length
        ? '<p>' + r.commonFamilies.map(function (pk) { return P[pk] ? P[pk].symbol + ' ' + P[pk].name : pk; }).join(' · ') + '</p>'
        : '<p class="muted">Aucune famille commune.</p>') +
      '<h3 class="jr-sub">Couples ordonnés conservés <span class="muted small">(la seule récurrence qui compte, ch. 21.3)</span></h3>' +
      (r.commonPairs.length
        ? '<ul class="jr-plain">' + r.commonPairs.map(function (p) {
            return '<li><strong>' + p.parentCard + ' ' + esc(cardName(p.parentCard)) + '</strong> qualifié par <strong>' +
              p.childCard + ' ' + esc(cardName(p.childCard)) + '</strong> dans les deux tirages ' +
              '<span class="muted small">(' + esc(p.parentLabel) + ' → ' + esc(p.childLabel) + ')</span></li>';
          }).join('') + '</ul>' +
          '<p class="muted small">C\'est ce couple — pas la carte isolée — qui garde une valeur, et pour son sens, non pour sa rareté.</p>'
        : '<p class="muted">Aucun couple substantif/adjectif ne se répète à l\'identique.</p>') +
    '</section>';
  }

  function render() {
    if (compareMode) { renderCompare(); return; }
    var t = openId ? S.getTirage(openId) : null;
    if (t) renderCarnet(t); else { openId = null; renderList(); }
  }

  render();
};
