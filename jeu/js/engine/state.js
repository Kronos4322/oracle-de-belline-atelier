// État du jeu. Module pur (aucun accès au DOM), testable sous Node.
//
// Le temps du jeu est le temps de marche : minuteurs, usure et espérances n'avancent que quand le mage
// marche. Le joueur peut donc s'arrêter pour lire une carte sans rien perdre. Seul le Cloître
// (retrait) se compte en temps réel, puisque le mage ne peut alors plus marcher.
import { CONFIG } from "../config.js";
import { variation } from "./effects.js";

/** `consultant` : 'homme' | 'femme' | null. Il désigne l'Étoile qui représente le joueur (le significateur). */
export function creerEtat(consultant = null) {
  return {
    consultant,
    energie: CONFIG.energieInitiale,
    energieMax: CONFIG.energieMax,
    fortune: 0,
    boucliers: 0,
    // durées restantes, en secondes de marche (sauf retrait : secondes réelles)
    minuteurs: {
      ralenti: 0, accelere: 0, retrait: 0, sterilite: 0, lunaison: 0, elevation: 0, compagnon: 0, passivite: 0,
      aveuglement: 0, discernement: 0, moderation: 0, deperissement: 0, regain: 0, feuDePaille: 0
    },
    regainTaux: 0,
    feuDePailleValeur: 0,
    // modificateurs qui portent sur la prochaine carte vécue ou le prochain gain / la prochaine perte
    suivante: { double: false, ignorer: false, affaiblir: false, attenuer: false, survoler: false },
    differes: [],          // gains à venir : { restant, valeur, promesse, source } ; une promesse n'est pas tenue
    projets: [],           // Entreprises : { restantCartes, valeur, source }
    reveler: 0,            // rangs de cartes visibles en plus ; diminue d'un à chaque carte vécue
    lunaisonRegion: null,  // région empruntée pendant une lunaison
    region: 0,             // région où se trouve le mage
    historique: [],        // le tirage : cartes vécues, dans l'ordre
    contournees: [],       // cartes laissées de côté (autre branche)
    sautees: [],           // cartes franchies d'un saut
    survolees: [],         // cartes passées sous les oiseaux du Départ
    laissees: [],          // cartes contournées ou sautées, dans l'ordre (Union les fait revenir)
    retourDemande: false,
    carteBleue: false,     // la Carte Bleue est en réserve
    parure: false,         // Plaisirs : le mage porte un bijou
    termine: false,
    victoire: false,
    cause: null
  };
}

/** Multiplicateur de vitesse de marche. */
export function multiplicateurVitesse(etat) {
  const m = etat.minuteurs;
  if (m.retrait > 0) return 0;
  let v = 1;
  if (m.ralenti > 0) v *= CONFIG.facteurRalenti;
  if (m.accelere > 0) v *= CONFIG.facteurAcceleration;
  return v;
}

/** Nombre de rangs de cartes visibles devant le mage (0 sous l'aveuglement de Despotisme). */
export function vue(etat) {
  const m = etat.minuteurs;
  if (m.aveuglement > 0) return 0;
  return CONFIG.vueBase + etat.reveler + (m.elevation > 0 ? 2 : 0) + (m.compagnon > 0 ? 1 : 0);
}

/** Le mage peut-il marcher, sauter ? */
export function peutMarcher(etat) { return etat.minuteurs.retrait <= 0 && !etat.termine; }
export function peutSauter(etat) { return etat.minuteurs.retrait <= 0 && etat.minuteurs.passivite <= 0 && !etat.termine; }

/** Énergie perdue par seconde de marche. */
export function usureCourante(etat) {
  const m = etat.minuteurs;
  if (m.regain > 0) return -etat.regainTaux;
  return CONFIG.usure * (m.deperissement > 0 ? 2 : 1);
}

/**
 * Fait avancer le temps. `marche` : le mage a marché pendant `dt` (sinon seul le retrait s'écoule).
 * Les espérances échues passent par `variation` : elles respectent Stérilité, Sagesse, etc.
 * Renvoie une liste de { texte, source } (source : numéro de la carte qui a produit le message).
 */
export function avancerTemps(etat, dt, marche) {
  const messages = [];
  const m = etat.minuteurs;
  m.retrait = Math.max(0, m.retrait - dt);
  if (!marche || etat.termine) return messages;

  // L'état au début du pas décide de l'usure et des échéances (un minuteur qui s'achève pendant le pas compte encore)
  const usure = usureCourante(etat), sterile = m.sterilite > 0;
  for (const k of Object.keys(m)) if (k !== "retrait") m[k] = Math.max(0, m[k] - dt);
  if (m.lunaison === 0) etat.lunaisonRegion = null;
  if (m.regain === 0) etat.regainTaux = 0;

  // Usure du chemin (ou regain d'Amor)
  etat.energie = Math.max(0, Math.min(etat.energieMax, etat.energie - usure * dt));

  // Passions : le feu de paille s'éteint
  if (m.feuDePaille === 0 && etat.feuDePailleValeur > 0) {
    const v = etat.feuDePailleValeur;
    etat.feuDePailleValeur = 0;
    etat.energie = Math.max(0, etat.energie - v);
    messages.push({ texte: `Le feu de paille s’éteint : -${v} d’énergie.`, source: 31 });
  }

  // Espérances et promesses
  for (const d of etat.differes) d.restant -= dt;
  const echus = etat.differes.filter(d => d.restant <= 0);
  etat.differes = etat.differes.filter(d => d.restant > 0);
  for (const d of echus) {
    if (d.promesse) { messages.push({ texte: `La promesse n’est pas tenue : les ${d.valeur} de fortune n’arrivent pas.`, source: d.source }); continue; }
    if (sterile) { messages.push({ texte: `Stérilité : l’espérance de ${d.valeur} de fortune est vaine.`, source: d.source }); continue; }
    messages.push({ texte: `Une espérance se réalise : ${variation(etat, "fortune", d.valeur)}`, source: d.source });
  }

  if (etat.energie <= 0) { etat.termine = true; etat.cause = "usure"; }
  return messages;
}
