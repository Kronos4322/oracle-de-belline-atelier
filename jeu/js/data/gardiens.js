// Les Sept Gardiens : une campagne, un adversaire par planète, dans l'ordre d'Edmond.
// Création de jeu (signalée). Chaque Gardien joue un deck à la couleur de sa planète, sur le terrain de sa
// planète, avec un style (profil de l'Ombre) ; vaincu, il enseigne les règles de Belline où entrent ses cartes
// (et donc les figures d'accord correspondantes).
//   profil : { hasard (part de coups au hasard : la difficulté), agressif (goût de l'attaque), soin (goût des points de vie) }
import { CARTES } from "./cartes.js";
import { VOISINAGE } from "./voisinage.js";

export const PROFILS = {
  novice: { nom: "Novice", hasard: 0.65, agressif: 1, soin: 1 },
  adepte: { nom: "Adepte", hasard: 0.3, agressif: 1, soin: 1 },
  mage: { nom: "Mage", hasard: 0, agressif: 1.1, soin: 0.8 }
};

export const GARDIENS = [
  { famille: "soleil", nom: "Le Gardien du Soleil", style: "Généreux et lumineux : il récompense, protège, et se fie à ses amis.", profil: { hasard: 0.4, agressif: 0.9, soin: 1.2 } },
  { famille: "lune", nom: "La Gardienne de la Lune", style: "Changeante : elle se dérobe, éloigne vos apparitions et vous prend à revers.", profil: { hasard: 0.32, agressif: 0.9, soin: 1 } },
  { famille: "mercure", nom: "Le Gardien de Mercure", style: "Marchand et voleur : il pioche, échange, et vous dépouille.", profil: { hasard: 0.25, agressif: 1, soin: 0.9 } },
  { famille: "venus", nom: "La Gardienne de Vénus", style: "Elle unit et embellit ; ses apparitions se renforcent les unes les autres.", profil: { hasard: 0.18, agressif: 0.9, soin: 1.1 } },
  { famille: "mars", nom: "Le Gardien de Mars", style: "Ardent : il attaque sans relâche, perce les défenses.", profil: { hasard: 0.1, agressif: 1.4, soin: 0.6 } },
  { famille: "jupiter", nom: "Le Gardien de Jupiter", style: "Puissant et prudent : il protège, attend son heure, et frappe fort.", profil: { hasard: 0.05, agressif: 1, soin: 1 } },
  { famille: "saturne", nom: "Le Gardien de Saturne", style: "Le temps est de son côté : il retarde, épuise, et conclut.", profil: { hasard: 0, agressif: 1.1, soin: 0.8 } }
];

/** Deck d'un Gardien : toutes les cartes de sa planète, le préambule, et des cartes d'autres planètes (35 cartes). */
export function deckGardien(g, rng) {
  const siennes = CARTES.filter(c => c.famille === g.famille || c.famille === "preambule").map(c => c.id);
  const autres = CARTES.filter(c => !siennes.includes(c.id)).map(c => c.id);
  for (let i = autres.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [autres[i], autres[j]] = [autres[j], autres[i]]; }
  return [...siennes, ...autres.slice(0, 35 - siennes.length)];
}

/** Règles de Belline qu'enseigne un Gardien vaincu : celles où entre une carte de sa planète. */
export function reglesEnseignees(g) {
  const ids = new Set(CARTES.filter(c => c.famille === g.famille).map(c => c.id));
  return VOISINAGE.filter(r => ids.has(r.a) || ids.has(r.b)).map(r => r.id);
}
