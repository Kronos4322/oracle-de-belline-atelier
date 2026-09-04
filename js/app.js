/* ---------------------------------------------------------------------------
 * Routeur minimal + démarrage de l'application
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

(function () {
  var ROUTES = {
    journalier:   { label: 'Jour',         icon: '☀' },
    grimoire:     { label: 'Grimoire',     icon: '📖' },
    tirages:      { label: 'Tirages',      icon: '🔮' },
    journal:      { label: 'Journal',      icon: '📓' },
    entrainement: { label: 'Exercices',    icon: '🎴' },
    associations: { label: 'Associations', icon: '🔗', overflow: true },
    progression:  { label: 'Progression',  icon: '📈', overflow: true },
    methode:      { label: 'Méthode',      icon: '📐', overflow: true }
  };
  var DEFAULT_ROUTE = 'journalier';

  function currentRoute() {
    var h = location.hash.replace(/^#\/?/, '').split('/')[0];
    return ROUTES[h] ? h : DEFAULT_ROUTE;
  }

  function buildNav() {
    var items = Object.keys(ROUTES).map(function (k) {
      var r = ROUTES[k];
      return '<a class="nav-item" data-route="' + k + '"' + (r.overflow ? ' data-overflow="1"' : '') +
             ' href="#/' + k + '">' +
             '<span class="nav-icon">' + r.icon + '</span>' +
             '<span class="nav-label">' + r.label + '</span></a>';
    }).join('');
    return items +
      '<button type="button" class="nav-more" id="navMore">' +
        '<span class="nav-icon">⋯</span><span class="nav-label">Plus</span></button>';
  }

  function openSheet() {
    var sheet = document.getElementById('sheet');
    var route = currentRoute();
    var links = Object.keys(ROUTES).filter(function (k) { return ROUTES[k].overflow; })
      .map(function (k) {
        var r = ROUTES[k];
        return '<button type="button" class="sheet-link' + (k === route ? ' is-active' : '') +
          '" data-route="' + k + '"><span class="nav-icon">' + r.icon + '</span> ' + r.label + '</button>';
      }).join('');
    sheet.innerHTML =
      '<div class="sheet-panel">' +
        '<h3>Aller à</h3>' + links +
      '</div>';
    sheet.hidden = false;
    sheet.querySelectorAll('.sheet-link').forEach(function (b) {
      b.addEventListener('click', function () { sheet.hidden = true; BELLINE.go(b.dataset.route); });
    });
    sheet.onclick = function (e) { if (e.target === sheet) sheet.hidden = true; };
  }

  function render() {
    var route = currentRoute();
    document.querySelectorAll('[data-route]').forEach(function (a) {
      a.classList.toggle('is-active', a.dataset.route === route);
    });
    var more = document.getElementById('navMore');
    if (more) more.classList.toggle('is-active', !!(ROUTES[route] && ROUTES[route].overflow));

    var view = document.getElementById('view');
    view.innerHTML = '';
    document.body.style.overflow = '';
    var fn = BELLINE.Views && BELLINE.Views[route];
    if (typeof fn === 'function') {
      fn(view);
    } else {
      view.innerHTML = '<p class="muted pad">Module introuvable.</p>';
    }
    view.focus();
    window.scrollTo(0, 0);
  }

  function setupBackup() {
    var btn = document.getElementById('btnExport');
    if (btn) btn.addEventListener('click', function () {
      var payload = JSON.stringify(BELLINE.Storage.exportAll(), null, 2);
      var blob = new Blob([payload], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'belline-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    });

    var input = document.getElementById('fileImport');
    if (input) input.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          BELLINE.Storage.importAll(JSON.parse(reader.result));
          if (BELLINE.refreshSpreads) BELLINE.refreshSpreads();
          alert('Sauvegarde importée avec succès.');
          render();
        } catch (err) {
          alert("Import impossible : " + err.message);
        }
        input.value = '';
      };
      reader.readAsText(file);
    });
  }

  function setupLightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;

    function close() { box.hidden = true; box.innerHTML = ''; }

    box.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) close();
    });

    BELLINE.lightbox = function (src, caption) {
      if (!src) return;
      box.innerHTML = '<figure><img src="' + src + '" alt="">' +
        (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
      box.hidden = false;
    };
  }

  /* --- prompt / confirm maison (remplace les boîtes natives) --- */
  function setupDialogs() {
    var el = document.createElement('div');
    el.className = 'mini-prompt';
    el.hidden = true;
    document.body.appendChild(el);

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    }

    function close() { el.hidden = true; el.innerHTML = ''; }

    BELLINE.prompt = function (title, initial) {
      return new Promise(function (resolve) {
        el.innerHTML =
          '<div class="mini-prompt-panel">' +
            '<h3>' + esc(title) + '</h3>' +
            '<input type="text" id="mpInput" value="' + esc(initial || '') + '">' +
            '<div class="mini-prompt-foot">' +
              '<button type="button" class="btn-ghost btn-sm" id="mpCancel">Annuler</button>' +
              '<button type="button" class="btn-primary btn-sm" id="mpOk">Valider</button>' +
            '</div>' +
          '</div>';
        el.hidden = false;
        var input = el.querySelector('#mpInput');
        input.focus(); input.select();
        function done(v) { close(); resolve(v); }
        el.querySelector('#mpOk').addEventListener('click', function () { done(input.value.trim() || null); });
        el.querySelector('#mpCancel').addEventListener('click', function () { done(null); });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') done(input.value.trim() || null);
          if (e.key === 'Escape') done(null);
        });
        el.onclick = function (e) { if (e.target === el) done(null); };
      });
    };

    BELLINE.confirm = function (message) {
      return new Promise(function (resolve) {
        el.innerHTML =
          '<div class="mini-prompt-panel">' +
            '<h3>' + esc(message) + '</h3>' +
            '<div class="mini-prompt-foot">' +
              '<button type="button" class="btn-ghost btn-sm" id="mpNo">Non</button>' +
              '<button type="button" class="btn-primary btn-sm" id="mpYes">Oui</button>' +
            '</div>' +
          '</div>';
        el.hidden = false;
        function done(v) { close(); resolve(v); }
        el.querySelector('#mpYes').addEventListener('click', function () { done(true); });
        el.querySelector('#mpNo').addEventListener('click', function () { done(false); });
        el.onclick = function (e) { if (e.target === el) done(false); };
        document.addEventListener('keydown', function onk(e) {
          if (e.key === 'Escape') { document.removeEventListener('keydown', onk); done(false); }
        });
      });
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (BELLINE.refreshSpreads) BELLINE.refreshSpreads();
    document.getElementById('nav').innerHTML = buildNav();
    var more = document.getElementById('navMore');
    if (more) more.addEventListener('click', openSheet);
    window.addEventListener('hashchange', render);
    setupBackup();
    setupLightbox();
    setupDialogs();
    render();
  });

  BELLINE.go = function (route) { location.hash = '#/' + route; };
  BELLINE.lightbox = function () {}; // remplacé au chargement
})();
