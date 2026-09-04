/* ---------------------------------------------------------------------------
 * Vue « Associations » — combinaisons de cartes, rangées dans des dossiers
 * et sous-dossiers créés librement.
 *
 *   dossiers     : arborescence libre (parentId)
 *   associations : 2 cartes ou plus + un texte, rattachées à un dossier
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};
BELLINE.Views = BELLINE.Views || {};

BELLINE.Views.associations = function (root) {
  var S = BELLINE.Storage;

  var folders = S.getFolders();
  var assocs = S.getAssociations();
  var editing = null; // { folderId, assocId|null, cards:[], text:'' }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function persist() { S.saveFolders(folders); S.saveAssociations(assocs); }
  function cardName(n) {
    var c = (BELLINE.SEED_CARDS || []).find(function (x) { return x.number === n; });
    return c ? c.name : ('Carte ' + n);
  }
  function childrenOf(pid) { return folders.filter(function (f) { return (f.parentId || null) === pid; }); }
  function assocOf(fid) { return assocs.filter(function (a) { return a.folderId === fid; }); }

  /* ---------- rendu ---------- */

  function render() {
    root.innerHTML =
      '<div class="view-head"><h1>Associations</h1>' +
        '<p class="muted">Range tes combinaisons de cartes dans des dossiers et sous-dossiers.</p></div>' +
      '<div class="assoc-toolbar">' +
        '<button class="btn-ghost btn-sm" id="assocAddRoot">+ Dossier</button>' +
        (assocs.length ? '' : '<button class="btn-ghost btn-sm" id="assocSeed">Importer les combinaisons traditionnelles</button>') +
      '</div>' +
      '<p class="muted small">« Une carte isolée n\'a qu\'une valeur provisoire — c\'est la couverture qui signe le verdict. » ' +
      'Deux dynamiques : <em>renforcement</em> (même polarité qui s\'ajoute) et <em>destruction</em> (une négative retourne la promesse).</p>' +
      '<div id="assocTree"></div>' +
      '<div id="assocEditor"></div>';

    var tree = root.querySelector('#assocTree');
    var roots = childrenOf(null);
    tree.innerHTML = roots.length
      ? roots.map(function (f) { return folderNode(f, 0); }).join('')
      : '<p class="muted pad">Aucun dossier. Crée-en un pour commencer — par ex. « Amour », « Blocages », « Trios ».</p>';

    root.querySelector('#assocAddRoot').addEventListener('click', function () { addFolder(null); });
    var seedBtn = root.querySelector('#assocSeed');
    if (seedBtn) seedBtn.addEventListener('click', seedTraditional);
    wireTree();
    renderEditor();
  }

  function seedTraditional() {
    if (!BELLINE.seedAssociations) return;
    var fid = S.uid();
    folders.push({ id: fid, name: 'Combinaisons traditionnelles', parentId: null });
    BELLINE.seedAssociations().forEach(function (x) {
      assocs.push({ id: S.uid(), folderId: fid, cards: x.cards, text: x.text, sens: x.sens || '' });
    });
    persist(); render();
  }

  var SENS_LABEL = { renforce: 'renforce', retourne: 'retourne', temporise: 'temporise', 'précise': 'precise' };

  function folderNode(f, depth) {
    var subs = childrenOf(f.id);
    var items = assocOf(f.id);
    return '<div class="folder" style="--depth:' + depth + '">' +
      '<div class="folder-head">' +
        '<span class="folder-name">📁 ' + esc(f.name) + '</span>' +
        '<span class="folder-actions">' +
          '<button class="btn-link" data-act="add-assoc" data-id="' + f.id + '">+ association</button>' +
          '<button class="btn-link" data-act="add-sub" data-id="' + f.id + '">+ sous-dossier</button>' +
          '<button class="btn-link" data-act="rename" data-id="' + f.id + '">renommer</button>' +
          '<button class="btn-link danger" data-act="del-folder" data-id="' + f.id + '">supprimer</button>' +
        '</span>' +
      '</div>' +
      (items.length
        ? '<ul class="assoc-list">' + items.map(assocItem).join('') + '</ul>'
        : '<p class="assoc-empty muted small">— aucune association ici —</p>') +
      subs.map(function (s) { return folderNode(s, depth + 1); }).join('') +
      '</div>';
  }

  function assocItem(a) {
    var chips = (a.cards || []).map(function (n) {
      return '<button class="assoc-chip" data-card="' + n + '" title="Voir la carte">' +
        '<b>' + n + '</b> ' + esc(cardName(n)) + '</button>';
    }).join('<span class="assoc-plus">+</span>');
    var sensChip = a.sens && SENS_LABEL[a.sens]
      ? ' <span class="combo-sens ' + SENS_LABEL[a.sens] + '">' + esc(a.sens) + '</span>' : '';
    return '<li class="assoc-item">' +
      '<div class="assoc-cards">' + (chips || '<em class="muted">aucune carte</em>') + sensChip + '</div>' +
      (a.text ? '<p class="assoc-text">' + esc(a.text) + '</p>' : '') +
      '<div class="assoc-item-actions">' +
        '<button class="btn-link" data-act="edit-assoc" data-id="' + a.id + '">modifier</button>' +
        '<button class="btn-link danger" data-act="del-assoc" data-id="' + a.id + '">supprimer</button>' +
      '</div></li>';
  }

  /* ---------- actions dossiers ---------- */

  function addFolder(parentId) {
    BELLINE.prompt(parentId ? 'Nom du sous-dossier' : 'Nom du dossier').then(function (name) {
      if (!name) return;
      folders.push({ id: S.uid(), name: name, parentId: parentId || null });
      persist(); render();
    });
  }
  function renameFolder(id) {
    var f = folders.find(function (x) { return x.id === id; });
    if (!f) return;
    BELLINE.prompt('Renommer le dossier', f.name).then(function (name) {
      if (!name) return;
      f.name = name; persist(); render();
    });
  }
  function deleteFolder(id) {
    var toRemove = [id];
    (function collect(pid) {
      childrenOf(pid).forEach(function (c) { toRemove.push(c.id); collect(c.id); });
    })(id);
    var n = assocs.filter(function (a) { return toRemove.indexOf(a.folderId) !== -1; }).length;
    BELLINE.confirm('Supprimer ce dossier' + (toRemove.length > 1 ? ' et ses sous-dossiers' : '') +
      (n ? ' et ' + n + ' association(s)' : '') + ' ?').then(function (ok) {
      if (!ok) return;
      folders = folders.filter(function (f) { return toRemove.indexOf(f.id) === -1; });
      assocs = assocs.filter(function (a) { return toRemove.indexOf(a.folderId) === -1; });
      persist(); render();
    });
  }

  function wireTree() {
    root.querySelectorAll('#assocTree [data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.id, act = b.dataset.act;
        if (act === 'add-sub') addFolder(id);
        else if (act === 'rename') renameFolder(id);
        else if (act === 'del-folder') deleteFolder(id);
        else if (act === 'add-assoc') { editing = { folderId: id, assocId: null, cards: [], text: '' }; renderEditor(); }
        else if (act === 'edit-assoc') {
          var a = assocs.find(function (x) { return x.id === id; });
          if (a) { editing = { folderId: a.folderId, assocId: a.id, cards: a.cards.slice(), text: a.text || '' }; renderEditor(); }
        }
        else if (act === 'del-assoc') {
          BELLINE.confirm('Supprimer cette association ?').then(function (ok) {
            if (!ok) return;
            assocs = assocs.filter(function (x) { return x.id !== id; });
            persist(); render();
          });
        }
      });
    });
    root.querySelectorAll('#assocTree .assoc-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = Number(b.dataset.card);
        BELLINE.lightbox(BELLINE.imageFor(n), n + ' · ' + cardName(n));
      });
    });
  }

  /* ---------- éditeur d'association ---------- */

  function renderEditor() {
    var box = root.querySelector('#assocEditor');
    if (!editing) { box.innerHTML = ''; return; }

    var folder = folders.find(function (f) { return f.id === editing.folderId; });
    box.innerHTML =
      '<div class="assoc-editor">' +
        '<h3>' + (editing.assocId ? 'Modifier' : 'Nouvelle') + ' association' +
          (folder ? ' <span class="muted">— ' + esc(folder.name) + '</span>' : '') + '</h3>' +
        '<div class="assoc-picked" id="assocPicked"></div>' +
        '<input type="search" id="assocSearch" placeholder="Filtrer les cartes…" autocomplete="off">' +
        '<div class="assoc-grid" id="assocGrid"></div>' +
        '<label class="field"><span>Signification de la combinaison</span>' +
          '<textarea id="assocText" rows="4" placeholder="Ce que dit ce rapprochement de cartes…">' + esc(editing.text) + '</textarea></label>' +
        '<div class="fiche-actions">' +
          '<button class="btn-primary" id="assocSave">Enregistrer</button>' +
          '<button class="btn-ghost" id="assocCancel">Annuler</button>' +
        '</div>' +
      '</div>';

    var grid = box.querySelector('#assocGrid');
    var search = box.querySelector('#assocSearch');

    function drawPicked() {
      box.querySelector('#assocPicked').innerHTML = editing.cards.length
        ? editing.cards.map(function (n) {
            return '<button class="assoc-chip" data-n="' + n + '"><b>' + n + '</b> ' + esc(cardName(n)) + ' ✕</button>';
          }).join('')
        : '<span class="muted small">Choisis au moins 2 cartes ci-dessous.</span>';
      box.querySelectorAll('#assocPicked .assoc-chip').forEach(function (b) {
        b.addEventListener('click', function () {
          editing.cards = editing.cards.filter(function (x) { return x !== Number(b.dataset.n); });
          drawPicked(); drawGrid();
        });
      });
    }
    function drawGrid() {
      var f = (search.value || '').trim().toLowerCase();
      grid.innerHTML = (BELLINE.SEED_CARDS || []).filter(function (c) {
        if (!f) return true;
        return c.name.toLowerCase().indexOf(f) !== -1 || String(c.number) === f;
      }).map(function (c) {
        var on = editing.cards.indexOf(c.number) !== -1;
        return '<button class="assoc-tog' + (on ? ' on' : '') + '" data-n="' + c.number + '">' +
          c.number + '. ' + esc(c.name) + '</button>';
      }).join('');
      grid.querySelectorAll('.assoc-tog').forEach(function (b) {
        b.addEventListener('click', function () {
          var n = Number(b.dataset.n);
          var i = editing.cards.indexOf(n);
          if (i === -1) editing.cards.push(n); else editing.cards.splice(i, 1);
          drawPicked(); drawGrid();
        });
      });
    }

    search.addEventListener('input', drawGrid);
    drawPicked(); drawGrid();

    box.querySelector('#assocCancel').addEventListener('click', function () { editing = null; renderEditor(); });
    box.querySelector('#assocSave').addEventListener('click', function () {
      var text = box.querySelector('#assocText').value.trim();
      if (editing.cards.length < 2) { BELLINE.toast('Choisis au moins 2 cartes.', 'error'); return; }
      if (editing.assocId) {
        var a = assocs.find(function (x) { return x.id === editing.assocId; });
        if (a) { a.cards = editing.cards.slice(); a.text = text; }
      } else {
        assocs.push({ id: S.uid(), folderId: editing.folderId, cards: editing.cards.slice(), text: text });
      }
      editing = null;
      persist(); render();
      root.querySelector('#assocTree').scrollIntoView({ block: 'nearest' });
    });
  }

  render();
};
