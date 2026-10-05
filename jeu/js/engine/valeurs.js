// Valeur d'une carte pour le mage. Module pur.
//
// La valeur se mesure sur une copie de l'état : on vit la carte, puis on marche 10 secondes, et l'on compare
// avec une copie qui a seulement marché. Ainsi les effets étalés dans le temps comptent (Amor, Beauté, un
// placement), le feu de paille de Passions s'éteint, et un procès se juge en moyenne (gagné ou perdu).
// Un bouclier vaut 12 (à peu près la perte qu'il évite).
import { CARTES, CARTE_PAR_ID } from "../data/cartes.js";
import { rencontrer, choixPossible } from "./effects.js";
import { creerEtat, avancerTemps } from "./state.js";

const HORIZON = 10;
const TIRAGES = [0.25, 0.75];
export const VALEUR_BOUCLIER = 12;

const copier = etat => structuredClone({ ...etat, historique: etat.historique.slice(-3) });
const bilan = e => e.energie + e.fortune + VALEUR_BOUCLIER * e.boucliers;

/** Valeur d'un choix donné (null si la carte n'a pas de choix). */
export function valeurChoix(etat, id, indexChoix) {
  const temoin = copier(etat);
  avancerTemps(temoin, HORIZON, true);
  let somme = 0;
  for (const t of TIRAGES) {
    const e = copier(etat);
    rencontrer(e, id, indexChoix, () => t);
    if (!e.termine) avancerTemps(e, HORIZON, true);
    somme += bilan(e) - bilan(temoin);
  }
  return somme / TIRAGES.length;
}

/** Valeur d'une carte maintenant : celle du meilleur choix possible. Ne modifie pas `etat`. */
export function valence(etat, id) {
  const carte = CARTE_PAR_ID[id];
  const essais = carte.choix ? carte.choix.map((_, i) => i).filter(i => choixPossible(etat, carte, i)) : [null];
  return Math.round(Math.max(...essais.map(i => valeurChoix(etat, id, i))));
}

/** Meilleur choix d'une carte à choix (sert à l'Ombre du duel, au simulateur). */
export function meilleurChoix(etat, id) {
  const carte = CARTE_PAR_ID[id];
  let best = 0, bv = -Infinity;
  carte.choix.forEach((_, i) => { if (choixPossible(etat, carte, i)) { const v = valeurChoix(etat, id, i); if (v > bv) { bv = v; best = i; } } });
  return best;
}

/** Valeur de chaque carte pour un mage frais : sert à composer des fourches qui soient de vrais dilemmes. */
export const VALEURS = Object.fromEntries(CARTES.map(c => [c.id, valence(creerEtat("homme"), c.id)]));
