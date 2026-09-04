/* ---------------------------------------------------------------------------
 * Routeur minimal + démarrage de l'application
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

(function () {
  var ROUTES = {
    grimoire:     { label: 'Grimoire',     icon: '📖' },
    associations: { label: 'Associations', icon: '🔗' },
    entrainement: { label: 'Entraînement', icon: '🎴' },
    tirages:      { label: 'Tirages',      icon: '🔮' },
    journal:      { label: 'Journal',      icon: '📓' },
    progression:  { label: 'Progression',  icon: '📈' }
  };
  var DEFAULT_ROUTE = 'grimoire';

  function currentRoute() {
    var h = location.hash.replace(/^#\/?/, '').split('/')[0];
    return ROUTES[h] ? h : DEFAULT_ROUTE;
  }

  function buildNav() {
    return Object.keys(ROUTES).map(function (k) {
      var r = ROUTES[k];
      return '<a class="nav-item" data-route="' + k + '" href="#/' + k + '">' +
             '<span class="nav-icon">' + r.icon + '</span>' +
             '<span class="nav-label">' + r.label + '</span></a>';
    }).join('');
  }

  function render() {
    var route = currentRoute();
    document.querySelectorAll('[data-route]').forEach(function (a) {
      a.classList.toggle('is-active', a.dataset.route === route);
    });
    var view = document.getElementById('view');
    view.innerHTML = '';
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

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('nav').innerHTML = buildNav();
    window.addEventListener('hashchange', render);
    setupBackup();
    setupLightbox();
    render();
  });

  BELLINE.go = function (route) { location.hash = '#/' + route; };
  BELLINE.lightbox = function () {}; // remplacé au chargement
})();
