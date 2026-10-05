// Lecture du tirage formé par la partie. Module pur.
// Le tirage composé : à chaque porte, le joueur retient une carte de la région quittée ; ces cartes, une par
// planète, forment le tirage final, lu dans l'ordre, avec les voisinages de Belline entre cartes retenues.
// Suit la grammaire de l'encyclopédie : le significateur (l'Étoile du consultant) et ce qu'il reçoit,
// l'influence (l'autre Étoile), la carte que La Destinée met au premier plan, les règles de voisinage
// réunies, les cartes fortes vécues, puis la séquence région par région.
import { CONFIG, REGIONS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { VOISINAGE, reglesDeclenchees } from "../data/voisinage.js";

const REGLE_PAR_ID = Object.fromEntries(VOISINAGE.map(r => [r.id, r]));

/** Score : fortune + énergie restante + points par règle de Belline réunie, en chemin et dans le tirage (+ 50 si le cycle est accompli). */
export function score(etat, retenues = []) {
  const regles = etat.historique.reduce((n, h) => n + h.regles.length, 0) + accordsDuTirage(etat, retenues).length;
  return Math.round(etat.fortune + etat.energie + CONFIG.pointsParRegle * regles + (etat.victoire ? 50 : 0));
}

/** Règles de Belline entre cartes retenues voisines dans le tirage. */
export function accordsDuTirage(etat, retenues) {
  const entree = id => { const h = [...etat.historique].reverse().find(x => x.id === id); return { id, choix: h ? h.choix : null }; };
  const accords = [];
  for (let i = 1; i < retenues.length; i++) {
    for (const r of reglesDeclenchees(entree(retenues[i - 1].id), entree(retenues[i].id))) accords.push({ id: r.id, texte: r.texte, positions: [i - 1, i] });
  }
  return accords;
}

function etoile(etat, idEtoile) {
  const i = etat.historique.findIndex(h => h.id === idEtoile);
  if (i < 0) return { etoile: idEtoile, rencontree: false };
  const e = etat.historique[i];
  return { etoile: idEtoile, rencontree: true, ignoree: e.ignoree, remplacee: !!e.remplacee, recu: e.recu ?? null };
}

export function lireTirage(etat, retenues = []) {
  const vecues = etat.historique;
  const lecture = { significateur: null, influence: null, premierPlan: null, regles: [], fortes: [], parRegion: [] };

  if (etat.consultant) {
    const moi = etat.consultant === "homme" ? 2 : 3, autre = moi === 2 ? 3 : 2;
    lecture.significateur = etoile(etat, moi);
    lecture.influence = etoile(etat, autre);
  }

  const iDest = vecues.findIndex(h => h.id === 1 && !h.ignoree);
  if (iDest >= 0) {
    const d = vecues[iDest];
    lecture.premierPlan = { ouverte: d.choix === 0, carte: vecues[iDest + 1]?.id ?? null };
  }

  vecues.forEach((h, i) => {
    for (const id of h.regles) lecture.regles.push({ id, texte: REGLE_PAR_ID[id].texte, cartes: [vecues[i - 1]?.id, h.id] });
    if (CARTE_PAR_ID[h.id].forte && !h.ignoree) lecture.fortes.push(h.id);
  });

  REGIONS.forEach((r, i) => {
    const entrees = vecues.filter(h => h.region === i);
    if (entrees.length) lecture.parRegion.push({ region: i, entrees });
  });

  lecture.tirage = retenues.map((r, i) => ({ position: i, region: r.region, id: r.id }));
  lecture.accords = accordsDuTirage(etat, retenues);
  lecture.bilan = {
    vecues: vecues.length,
    laissees: etat.contournees.length + etat.sautees.length + etat.survolees.length,
    fortune: etat.fortune,
    energie: Math.round(etat.energie),
    score: score(etat, retenues)
  };
  return lecture;
}
