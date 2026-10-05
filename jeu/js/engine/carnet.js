// Carnet du joueur : ce qu'il a vu et vécu d'une partie à l'autre. Module pur ;
// la sauvegarde (localStorage) est faite par js/ui/carnet.js.
import { VOISINAGE } from "../data/voisinage.js";

export function carnetVide() {
  return { version: 1, cartes: {}, regles: {}, parties: 0, meilleurScore: 0, aRevoir: {}, enigmes: { posees: 0, reussies: 0 }, duels: { joues: 0, gagnes: 0 }, gardiens: [] };
}

/** Accepte n'importe quelle donnée lue : renvoie toujours un carnet valide. */
export function normaliserCarnet(brut) {
  const c = carnetVide();
  if (!brut || typeof brut !== "object" || brut.version !== 1) return c;
  for (const [id, v] of Object.entries(brut.cartes || {})) c.cartes[id] = { vue: +v.vue || 0, vecue: +v.vecue || 0 };
  for (const id of Object.keys(brut.regles || {})) if (VOISINAGE.some(r => r.id === id)) c.regles[id] = true;
  c.parties = +brut.parties || 0;
  c.meilleurScore = +brut.meilleurScore || 0;
  for (const [id, n] of Object.entries(brut.aRevoir || {})) if (+n > 0) c.aRevoir[id] = Math.min(3, +n);
  c.enigmes = { posees: +brut.enigmes?.posees || 0, reussies: +brut.enigmes?.reussies || 0 };
  c.duels = { joues: +brut.duels?.joues || 0, gagnes: +brut.duels?.gagnes || 0 };
  c.gardiens = Array.isArray(brut.gardiens) ? brut.gardiens.filter(f => typeof f === "string") : [];
  return c;
}

const fiche = (c, id) => (c.cartes[id] ||= { vue: 0, vecue: 0 });

/** Première fois que le joueur voit cette carte face visible ? (renvoie vrai si nouvelle) */
export function noterVue(c, id) { const f = fiche(c, id); f.vue++; return f.vue === 1; }
/** Renvoie vrai si c'est la première fois que la carte est vécue. */
export function noterVecue(c, id) { const f = fiche(c, id); f.vecue++; return f.vecue === 1; }
/** Renvoie vrai si la règle est découverte pour la première fois. */
export function noterRegle(c, id) { const neuve = !c.regles[id]; c.regles[id] = true; return neuve; }
/** Fin de partie : renvoie vrai si c'est un nouveau meilleur score. */
export function noterPartie(c, sc) { c.parties++; const record = sc > c.meilleurScore; if (record) c.meilleurScore = sc; return record; }

export function avancement(c) {
  return {
    vues: Object.values(c.cartes).filter(f => f.vue > 0 || f.vecue > 0).length,
    vecues: Object.values(c.cartes).filter(f => f.vecue > 0).length,
    regles: Object.keys(c.regles).length,
    totalRegles: VOISINAGE.length,
    aRevoir: Object.keys(c.aRevoir).length
  };
}

/**
 * Révision espacée : une énigme manquée met la carte « à revoir » (niveau 3) ; chaque bonne réponse
 * sur cette carte baisse le niveau d'un cran. Les cartes à revoir reviennent plus souvent dans les énigmes.
 */
export function noterEnigme(c, id, reussie) {
  c.enigmes.posees++;
  if (reussie) { c.enigmes.reussies++; if (c.aRevoir[id]) { c.aRevoir[id]--; if (!c.aRevoir[id]) delete c.aRevoir[id]; } }
  else c.aRevoir[id] = 3;
}

/** Fin d'un duel. */
export function noterDuel(c, gagne) { c.duels.joues++; if (gagne) c.duels.gagnes++; }

/** Un Gardien vaincu : il enseigne ses règles. Renvoie les règles nouvellement apprises. */
export function vaincreGardien(c, famille, regles) {
  if (!c.gardiens.includes(famille)) c.gardiens.push(famille);
  return regles.filter(id => noterRegle(c, id));
}
