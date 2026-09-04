/* ---------------------------------------------------------------------------
 * Couche de stockage
 *
 * Pour l'instant : localStorage du navigateur (le plus simple possible).
 * Tout est isolé derrière cet objet BELLINE.Storage : le jour où l'on
 * branchera une vraie base (Supabase, etc.), seul ce fichier changera.
 *
 * Une carte se compose de 3 couches, de la plus faible à la plus forte :
 *   1. SEED_CARDS      : numéro, nom, série planétaire (structure)
 *   2. CARD_REFERENCE  : mots-clés + significations issus de la recherche
 *   3. cards.edits      : ce que TOI tu écris — remplace la référence
 *
 * On ne stocke donc que tes modifications, indexées par numéro de carte.
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
      var msg = "Impossible d'enregistrer : l'espace de stockage du navigateur est plein ou bloqué.";
      if (window.BELLINE && BELLINE.toast) BELLINE.toast(msg, 'error'); else alert(msg);
      return false;
    }
  }

  /* --- Cartes : 3 couches --- */

  var EMPTY_SENS = { general: '', amour: '', travail: '', sante: '', evolution: '' };

  function cardEdits() { return read('cards.edits', {}); }

  // Couches 1 + 2 : structure + repères de recherche.
  function cardBase(seed) {
    var ref = (BELLINE.CARD_REFERENCE || {})[seed.number] || {};
    return {
      number: seed.number,
      name: seed.name,
      planet: seed.planet,
      valence: seed.valence,
      forte: seed.forte,
      fragile: seed.fragile,
      polarite: seed.polarite,
      majeure: seed.majeure,
      supreme: seed.supreme,
      keywords: ref.keywords ? ref.keywords.slice() : [],
      symbolisme: '',
      sens: Object.assign({}, EMPTY_SENS, ref.sens || {}),
      notes: '',
      associations: '',
      sources: ref.sources || []
    };
  }

  // Couche 3 : tes modifications viennent par-dessus.
  function mergeCard(base, patch) {
    if (!patch) return base;
    var out = Object.assign({}, base, patch);
    out.sens = Object.assign({}, base.sens, patch.sens || {});
    return out;
  }

  function getCards() {
    var edits = cardEdits();
    return BELLINE.SEED_CARDS.map(function (c) { return mergeCard(cardBase(c), edits[c.number]); });
  }

  function getCard(number) {
    number = Number(number);
    var seed = BELLINE.SEED_CARDS.find(function (c) { return c.number === number; });
    if (!seed) return null;
    return mergeCard(cardBase(seed), cardEdits()[number]);
  }

  function saveCard(number, patch) {
    var edits = cardEdits();
    var prev = edits[number] || {};
    edits[number] = Object.assign({}, prev, patch, {
      sens: Object.assign({}, prev.sens, patch.sens || {})
    });
    return write('cards.edits', edits);
  }

  // Revenir au texte de référence (supprime tes modifications sur cette carte).
  function resetCard(number) {
    var edits = cardEdits();
    delete edits[number];
    return write('cards.edits', edits);
  }

  function isCardEdited(number) {
    return Object.prototype.hasOwnProperty.call(cardEdits(), String(number));
  }

  function editedCount() { return Object.keys(cardEdits()).length; }

  /* --- Associations : dossiers (arborescents) + combinaisons de cartes ---
   *   folders      : [{ id, name, parentId }]      parentId = null -> racine
   *   associations : [{ id, folderId, cards:[n], text }]
   */

  function getFolders() { return read('folders', []); }
  function saveFolders(list) { return write('folders', list); }

  function getAssociations() { return read('associations', []); }
  function saveAssociations(list) { return write('associations', list); }

  /* --- Tirages ---
   *   tirage en cours (brouillon)  : belline.tirage.<spreadId>
   *   tirages enregistrés          : belline.tirages  [{id, spreadId, createdAt, question, cards, notes}]
   */
  function getDraft(spreadId) { return read('tirage.' + spreadId, null); }
  function saveDraft(spreadId, draft) { return write('tirage.' + spreadId, draft); }
  function getTirages() { return read('tirages', []); }
  function saveTirages(list) { return write('tirages', list); }
  function getTirage(id) {
    return getTirages().find(function (t) { return t.id === id; }) || null;
  }
  function updateTirage(id, patch) {
    var list = getTirages();
    var t = list.find(function (x) { return x.id === id; });
    if (!t) return false;
    Object.assign(t, patch);
    return saveTirages(list);
  }
  function deleteTirage(id) {
    return saveTirages(getTirages().filter(function (t) { return t.id !== id; }));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* --- Carte du jour ---
   *   belline.cartejour  : [{ date:'YYYY-MM-DD', card:n, phrase, verifie:'oui'|'non'|null }]
   */
  function getCarteJour() { return read('cartejour', []); }
  function saveCarteJour(list) { return write('cartejour', list); }

  /* --- Tirages personnels (éditeur, ch. 16) ---
   *   belline.spreads.custom : [{ id, name, subtitle, intro, count, layout, positions:[…], createdAt }]
   */
  function getCustomSpreads() { return read('spreads.custom', []); }
  function saveCustomSpreads(list) { return write('spreads.custom', list); }

  /* --- Entraînement : maîtrise par carte (répétition espacée légère) ---
   *   belline.training.cards : { <n>: { box:0..5, seen, ok, ko, due:'YYYY-MM-DD' } }
   *   box = intervalle de Leitner ; due = prochaine échéance.
   */
  function getTrainingCards() { return read('training.cards', {}); }
  function saveTrainingCards(map) { return write('training.cards', map); }

  /* --- Sauvegarde / restauration complète --- */

  function exportAll() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(NS + '.') === 0) data[k] = localStorage.getItem(k);
    }
    return { app: 'oracle-belline', schema: 2, exportedAt: new Date().toISOString(), data: data };
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
    isCardEdited: isCardEdited,
    editedCount: editedCount,
    getFolders: getFolders,
    saveFolders: saveFolders,
    getAssociations: getAssociations,
    saveAssociations: saveAssociations,
    getDraft: getDraft,
    saveDraft: saveDraft,
    getTirages: getTirages,
    saveTirages: saveTirages,
    getTirage: getTirage,
    updateTirage: updateTirage,
    deleteTirage: deleteTirage,
    uid: uid,
    getCarteJour: getCarteJour,
    saveCarteJour: saveCarteJour,
    getCustomSpreads: getCustomSpreads,
    saveCustomSpreads: saveCustomSpreads,
    getTrainingCards: getTrainingCards,
    saveTrainingCards: saveTrainingCards,
    exportAll: exportAll,
    importAll: importAll
  };
})();
