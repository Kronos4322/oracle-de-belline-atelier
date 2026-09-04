/* ---------------------------------------------------------------------------
 * Couche de stockage
 *
 * Pour l'instant : localStorage du navigateur (le plus simple possible).
 * Tout est isolé derrière cet objet BELLINE.Storage : le jour où l'on
 * branchera une vraie base (Supabase, etc.), seul ce fichier changera.
 *
 * Les cartes ne sont pas dupliquées : on garde SEED_CARDS comme référence
 * et on ne stocke que les modifications de l'utilisateur (« patches »),
 * indexées par numéro de carte.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

(function () {
  var NS = 'belline';
  function key(name) { return NS + '.' + name; }

  function read(name, fallback) {
    try {
      var raw = localStorage.getItem(key(name));
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.warn('[storage] lecture impossible :', name, e);
      return fallback;
    }
  }

  function write(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[storage] écriture impossible :', name, e);
      alert("Impossible d'enregistrer : l'espace de stockage du navigateur est plein ou bloqué.");
      return false;
    }
  }

  /* --- Cartes : référence + modifications utilisateur --- */

  function cardEdits() { return read('cards.edits', {}); }

  function mergeCard(base, patch) {
    var out = Object.assign({}, base, patch || {});
    out.sens = Object.assign({}, base.sens, (patch && patch.sens) || {});
    return out;
  }

  function getCards() {
    var edits = cardEdits();
    return BELLINE.SEED_CARDS.map(function (c) { return mergeCard(c, edits[c.number]); });
  }

  function getCard(number) {
    number = Number(number);
    var base = BELLINE.SEED_CARDS.find(function (c) { return c.number === number; });
    if (!base) return null;
    return mergeCard(base, cardEdits()[number]);
  }

  function saveCard(number, patch) {
    var edits = cardEdits();
    var prev = edits[number] || {};
    edits[number] = mergeCard({ sens: {} }, Object.assign({}, prev, patch, {
      sens: Object.assign({}, prev.sens, patch.sens || {})
    }));
    return write('cards.edits', edits);
  }

  function resetCard(number) {
    var edits = cardEdits();
    delete edits[number];
    return write('cards.edits', edits);
  }

  function isCardComplete(c) {
    return !!(c && c.keywords && c.keywords.length && c.sens && c.sens.general && c.sens.general.trim());
  }

  /* --- Sauvegarde / restauration complète --- */

  function exportAll() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(NS + '.') === 0) data[k] = localStorage.getItem(k);
    }
    return { app: 'oracle-belline', schema: 1, exportedAt: new Date().toISOString(), data: data };
  }

  function importAll(obj) {
    if (!obj || obj.app !== 'oracle-belline' || !obj.data) {
      throw new Error("ce fichier n'est pas une sauvegarde de l'application");
    }
    Object.keys(obj.data).forEach(function (k) {
      if (k.indexOf(NS + '.') === 0) localStorage.setItem(k, obj.data[k]);
    });
  }

  BELLINE.Storage = {
    read: read,
    write: write,
    getCards: getCards,
    getCard: getCard,
    saveCard: saveCard,
    resetCard: resetCard,
    isCardComplete: isCardComplete,
    exportAll: exportAll,
    importAll: importAll
  };
})();
