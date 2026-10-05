// Moteur d'effets. Module pur (aucun accès au DOM), testable sous Node.
//
// Effets disponibles (champ `type`). Les durées sont en secondes de marche (voir state.js).
//   energie {valeur}             gain ou perte d'énergie
//   fortune {valeur}             gain ou perte de fortune
//   fortuneDifferee {valeur, delai}  gain qui arrive après `delai` (Beauté, placement d'Argent)
//   promesse {valeur, delai}     gain annoncé qui, au terme, n'arrive pas (Inconstance)
//   hasardFortune {valeur}       gain ou perte de `valeur`, à pile ou face
//   pari {min}                   mise de la moitié de la fortune (au moins `min`) : doublée ou perdue (Hazard)
//   ralentir {duree} / accelerer {duree} / hasardVitesse
//   retrait {duree}              le mage s'arrête, sans usure (Cloître) ; temps réel
//   sterilite {duree}            aucun gain de fortune ; les espérances échues sont perdues
//   lunaison {duree}             le monde passe sous une autre région pour un temps
//   bouclier {nombre}            annule les prochaines pertes ; detruireBoucliers les supprime (Accident)
//   reveler {nombre}             rangs de cartes visibles en plus ; un rang se consume à chaque carte vécue
//   elever {duree}               sauts gratuits et vue +2 (Élévation)
//   compagnon {duree}            le chien court avec le mage : vue +1 (Pensée-Amitié)
//   discernement {duree}         les cartes visibles portent une marque favorable / défavorable (Intelligence)
//   aveuglement {duree}          plus aucune carte visible (Despotisme)
//   moderation {duree}           gains et pertes divisés par deux (Sagesse)
//   deperissement {duree}        usure doublée (Ruine)
//   regain {taux, duree}         l'énergie remonte au lieu de s'user (Amor)
//   feuDePaille {valeur, duree}  gain d'énergie repris quand la durée s'achève (Passions)
//   passivite {duree}            l'eau porte le mage : il ne dirige plus ses pas ni ne saute (Eau)
//   apaiser                      lève ralentissement, aveuglement, dépérissement, gain affaibli
//   doubleSuivante / ignorerSuivante  la prochaine carte vécue compte double / reste sans effet (Destinée)
//   affaiblirSuivante            le prochain gain est divisé par deux (Trahison)
//   attenuerSuivante             la prochaine perte est divisée par deux
//   survolerSuivante             la prochaine carte est survolée sans être vécue (Départ)
//   rejouerPrecedente            la carte précédente s'applique à nouveau (Étoiles) ; à moitié si l'Étoile
//                                n'est pas celle du consultant (elle représente alors une influence dans le jeu)
//   minimiserPrecedente          reprend la moitié des gains de la carte précédente (Trahison)
//   recompense {base, parCarte}  fortune qui croît avec le nombre de cartes vécues (Réussite)
//   vol {valeur}                 prend de la fortune, puis de l'énergie s'il n'y a plus rien (Vol-Perte)
//   projet {valeur, cartes}      gain si les `cartes` cartes suivantes ne font rien perdre (Entreprises)
//   envie {part, sinon}          prend une part de la fortune, ou de l'énergie si elle est nulle (Méchanceté)
//   renommee {valeur}            gain ou perte selon la carte précédente (Renommée)
//   heritage                     la carte la plus favorable déjà vécue redonne ses gains (Héritage)
//   combler                      énergie au maximum (Bonheur)
//   borner {valeur}              abaisse l'énergie maximale (Fatalité)
//   revirement                   rend la dernière perte subie (Grâce)
//   delai {secondes}             repousse les espérances en cours (Retard)
//   bouleverser                  rebat les cartes libres de la région (Accident)
//   retour                       la dernière carte laissée de côté revient et sera vécue (Union)
//   parure                       le mage porte un bijou (Plaisirs)
//   reserve                      la Carte Bleue reste en réserve pour remplacer une carte
//   si {condition, alors, sinon} effets selon l'état du mage ; conditions : voir CONDITIONS
//
// Pour créer un nouvel effet : ajouter un `case` dans appliquerEffet, le documenter ici, ajouter un test.

import { CONFIG, REGIONS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { reglesDeclenchees } from "../data/voisinage.js";

function borner(v, min, max) { return Math.max(min, Math.min(max, v)); }

/** Conditions utilisables par l'effet `si`. */
export const CONDITIONS = {
  // Le mage est affaibli : énergie basse, ou déjà ralenti
  affaibli: etat => etat.energie < 60 || etat.minuteurs.ralenti > 0,
  // Le chien de Pensée-Amitié court avec le mage
  accompagne: etat => etat.minuteurs.compagnon > 0
};

/** Applique un gain ou une perte en tenant compte des boucliers et des modificateurs. Renvoie un message. */
export function variation(etat, cle, valeur) {
  if (etat.minuteurs.moderation > 0) valeur = valeur / 2;
  if (valeur < 0) {
    if (etat.boucliers > 0) { etat.boucliers--; return "Le bouclier absorbe la perte."; }
    if (etat.suivante.attenuer) { etat.suivante.attenuer = false; valeur = valeur / 2; }
  } else if (valeur > 0) {
    if (cle === "fortune" && etat.minuteurs.sterilite > 0) return "Stérilité : ce gain ne produit rien.";
    if (etat.suivante.affaiblir) { etat.suivante.affaiblir = false; valeur = valeur / 2; }
  }
  valeur = Math.round(valeur);
  let reel = valeur;
  if (cle === "energie") {
    const avant = etat.energie;
    etat.energie = borner(etat.energie + valeur, 0, etat.energieMax);
    reel = Math.round(etat.energie - avant);
  } else etat.fortune += valeur;
  return `${reel >= 0 ? "+" : ""}${reel} ${cle === "energie" ? "d’énergie" : "de fortune"}`;
}

const derniereEntree = etat => {
  for (let i = etat.historique.length - 1; i >= 0; i--) if (!etat.historique[i].remplacee) return etat.historique[i];
  return null;
};
const valeurGain = g => (g ? g.fortune + g.energie : 0);

/**
 * Applique un effet. `mult` vaut 2 quand La Destinée a mis la carte au premier plan, 1/2 pour une influence.
 * `rng` renvoie un nombre dans [0, 1[ (injectable pour les tests).
 * `ctx` : { carte, region, bouleverser } (facultatif ; `bouleverser()` rebat les cartes de la région et renvoie leur nombre).
 * Renvoie un message ou null.
 */
export function appliquerEffet(etat, effet, mult = 1, rng = Math.random, ctx = {}) {
  const m = etat.minuteurs;
  const duree = d => d * mult;
  switch (effet.type) {
    case "energie": return variation(etat, "energie", effet.valeur * mult);
    case "fortune": return variation(etat, "fortune", effet.valeur * mult);
    case "fortuneDifferee":
      etat.differes.push({ restant: effet.delai, valeur: Math.round(effet.valeur * mult), source: ctx.carte ?? null });
      return `+${Math.round(effet.valeur * mult)} de fortune après ${effet.delai} s de marche.`;
    case "promesse":
      etat.differes.push({ restant: effet.delai, valeur: Math.round(effet.valeur * mult), promesse: true, source: ctx.carte ?? null });
      return `Promis : +${Math.round(effet.valeur * mult)} de fortune dans ${effet.delai} s.`;
    case "hasardFortune": {
      const v = (rng() < 0.5 ? -1 : 1) * effet.valeur * mult;
      return (v > 0 ? "Le sort est favorable : " : "Le sort est contraire : ") + variation(etat, "fortune", v);
    }
    case "pari": {
      const mise = Math.max(effet.min, Math.floor(Math.max(0, etat.fortune) / 2)) * mult;
      const gagne = rng() >= 0.5;
      return `Mise de ${Math.round(mise)}. ` + (gagne ? "La roue monte : " : "La roue descend : ") + variation(etat, "fortune", gagne ? mise : -mise);
    }
    case "ralentir": m.ralenti = Math.max(m.ralenti, duree(effet.duree)); return "Le pas ralentit.";
    case "accelerer": m.accelere = Math.max(m.accelere, duree(effet.duree)); return "Le pas s’accélère.";
    case "hasardVitesse":
      if (rng() < 0.5) { m.ralenti = Math.max(m.ralenti, duree(3)); return "Le vent freine."; }
      m.accelere = Math.max(m.accelere, duree(3)); return "Le vent pousse.";
    case "retrait": m.retrait = Math.max(m.retrait, duree(effet.duree)); return "Retrait : le mage s’arrête.";
    case "sterilite": m.sterilite = Math.max(m.sterilite, duree(effet.duree)); return "Les gains sont suspendus.";
    case "lunaison": {
      const autres = [1, 2, 3, 4, 5, 6, 7].filter(i => i !== etat.region);
      etat.lunaisonRegion = autres[Math.floor(rng() * autres.length)];
      m.lunaison = duree(effet.duree);
      return `Lunaison : le monde passe sous ${REGIONS[etat.lunaisonRegion].nom}.`;
    }
    case "bouclier": {
      const n = Math.floor(effet.nombre * mult);
      if (n <= 0) return "Trop lointaine, l’influence ne suffit pas à protéger.";
      etat.boucliers += n; return `+${n} bouclier${n > 1 ? "s" : ""}.`;
    }
    case "detruireBoucliers": {
      const n = etat.boucliers; etat.boucliers = 0;
      return n ? `${n} bouclier${n > 1 ? "s" : ""} détruit${n > 1 ? "s" : ""}.` : null;
    }
    case "reveler": {
      const n = Math.floor(effet.nombre * mult);
      etat.reveler = Math.max(etat.reveler, n); return n ? "La route se révèle." : null;
    }
    case "elever": m.elevation = Math.max(m.elevation, duree(effet.duree)); return "Le mage s’élève : il voit plus loin et saute sans effort.";
    case "compagnon": m.compagnon = Math.max(m.compagnon, duree(effet.duree)); return "Un ami fidèle court à ses côtés et part devant.";
    case "discernement": m.discernement = Math.max(m.discernement, duree(effet.duree)); return "Le mage discerne ce qui lui serait favorable.";
    case "aveuglement": m.aveuglement = Math.max(m.aveuglement, duree(effet.duree)); return "Aveuglement : la route se dérobe au regard.";
    case "moderation": m.moderation = Math.max(m.moderation, duree(effet.duree)); return "Modération : gains et pertes sont divisés par deux.";
    case "deperissement": m.deperissement = Math.max(m.deperissement, duree(effet.duree)); return "Dépérissement : la marche use deux fois plus.";
    case "regain":
      etat.regainTaux = Math.max(etat.regainTaux, effet.taux * mult); m.regain = Math.max(m.regain, effet.duree);
      return "L’affection soutient le mage : il regagne de l’énergie en marchant.";
    case "feuDePaille": {
      const avant = etat.energie;
      const msg = variation(etat, "energie", effet.valeur * mult);
      etat.feuDePailleValeur += Math.max(0, Math.round(etat.energie - avant));
      m.feuDePaille = Math.max(m.feuDePaille, effet.duree);
      return `${msg} (feu de paille).`;
    }
    case "passivite": m.passivite = Math.max(m.passivite, duree(effet.duree)); return "Le mage se laisse porter : il ne dirige plus ses pas.";
    case "apaiser":
      m.ralenti = 0; m.aveuglement = 0; m.deperissement = 0; etat.suivante.affaiblir = false; return "Les entraves tombent.";
    case "doubleSuivante": etat.suivante.double = true; return "La prochaine carte vécue comptera double.";
    case "ignorerSuivante": etat.suivante.ignorer = true; return "La prochaine carte vécue restera sans effet.";
    case "affaiblirSuivante": etat.suivante.affaiblir = true; return "Le prochain gain sera affaibli.";
    case "attenuerSuivante": etat.suivante.attenuer = true; return "La prochaine perte sera atténuée.";
    case "survolerSuivante": etat.suivante.survoler = true; return "Les oiseaux emporteront le mage au-dessus de la prochaine carte.";
    case "recompense": {
      const vecues = etat.historique.filter(h => !h.ignoree).length;
      return "Aboutissement : " + variation(etat, "fortune", (effet.base + effet.parCarte * vecues) * mult);
    }
    case "minimiserPrecedente": {
      const prec = derniereEntree(etat);
      const g = prec && !prec.ignoree ? prec.gain : null;
      if (!g || (g.fortune <= 0 && g.energie <= 0)) return "Aucune bonne carte à côté : rien à minimiser.";
      const msgs = [];
      for (const cle of ["fortune", "energie"]) if (g[cle] > 0) msgs.push(variation(etat, cle, -Math.ceil(g[cle] / 2 * mult)));
      return `${CARTE_PAR_ID[prec.id].nom} est minimisée : ${msgs.join(", ")}.`;
    }
    case "vol": {
      const v = Math.round(effet.valeur * mult);
      if (etat.fortune >= v || etat.boucliers > 0) return variation(etat, "fortune", -v);
      const msgs = [];
      const f = Math.max(0, etat.fortune);
      if (f > 0) msgs.push(variation(etat, "fortune", -f));
      msgs.push(variation(etat, "energie", -(v - f)));
      return `Plus rien à prendre : la perte devient morale. ${msgs.join(", ")}.`;
    }
    case "projet":
      etat.projets.push({ restantCartes: effet.cartes, valeur: Math.round(effet.valeur * mult), source: ctx.carte ?? null, cree: etat.historique.length });
      return `Projet en cours : +${Math.round(effet.valeur * mult)} de fortune si les ${effet.cartes} prochaines cartes ne vous font rien perdre.`;
    case "envie":
      if (etat.fortune > 0) return "L’envie vise votre fortune : " + variation(etat, "fortune", -Math.max(5, Math.round(etat.fortune * effet.part)) * mult);
      return "Rien à envier : la méchanceté s’en prend à vous. " + variation(etat, "energie", -effet.sinon * mult);
    case "renommee": {
      const prec = derniereEntree(etat);
      const s = prec && !prec.ignoree ? valeurGain(prec.gain) : 0;
      const signe = s > 0 ? 1 : s < 0 ? -1 : (rng() < 0.5 ? -1 : 1);
      const texte = s > 0 ? "Bonne opinion, portée par la carte précédente : " : s < 0 ? "Mauvaise opinion, entachée par la carte précédente : " : "Sans carte pour l’accompagner, l’opinion se fait au hasard : ";
      return texte + variation(etat, "fortune", signe * effet.valeur * mult);
    }
    case "heritage": {
      let meilleure = null;
      for (const h of etat.historique) if (!h.ignoree && !h.remplacee && valeurGain(h.gain) > valeurGain(meilleure?.gain ?? null) && (h.gain.fortune > 0 || h.gain.energie > 0)) meilleure = h;
      if (!meilleure) return "Le passé n’a rien laissé à hériter.";
      const msgs = [];
      for (const cle of ["fortune", "energie"]) if (meilleure.gain[cle] > 0) msgs.push(variation(etat, cle, meilleure.gain[cle] * mult));
      return `Legs de ${CARTE_PAR_ID[meilleure.id].nom} : ${msgs.join(", ")}.`;
    }
    case "combler": {
      const d = etat.energieMax - etat.energie;
      return d > 0 ? "Plénitude : " + variation(etat, "energie", d) : "L’énergie est déjà à son comble.";
    }
    case "borner":
      etat.energieMax = Math.max(CONFIG.energieMaxPlancher, etat.energieMax - Math.round(effet.valeur * mult));
      etat.energie = Math.min(etat.energie, etat.energieMax);
      return `Les bornes se resserrent : énergie maximale ${etat.energieMax}.`;
    case "revirement": {
      for (let i = etat.historique.length - 1; i >= 0; i--) {
        const h = etat.historique[i];
        if (h.remplacee || h.ignoree) continue;
        if (h.gain.energie < 0 || h.gain.fortune < 0) {
          const msgs = [];
          for (const cle of ["energie", "fortune"]) if (h.gain[cle] < 0) {
            const v = Math.round(-h.gain[cle] * mult);
            if (cle === "energie") etat.energie = Math.min(etat.energieMax, etat.energie + v); else etat.fortune += v;
            msgs.push(`+${v} ${cle === "energie" ? "d’énergie" : "de fortune"}`);
          }
          return `Revirement : la perte de ${CARTE_PAR_ID[h.id].nom} est rendue (${msgs.join(", ")}).`;
        }
      }
      return "Aucune perte à racheter.";
    }
    case "delai": {
      const n = etat.differes.length;
      for (const d of etat.differes) d.restant += effet.secondes * mult;
      return n ? `Les espérances en cours sont repoussées de ${effet.secondes * mult} s.` : null;
    }
    case "bouleverser": {
      const n = ctx.bouleverser ? ctx.bouleverser() : 0;
      return n > 1 ? `Bouleversement : les ${n} cartes qui restent dans la région sont rebattues.` : "Le scénario est rompu.";
    }
    case "retour": etat.retourDemande = true; return null;
    case "parure": etat.parure = true; return "Le mage porte désormais un bijou.";
    case "reserve": etat.carteBleue = true; return "La Carte Bleue est en réserve (touche B) : elle pourra remplacer une carte vécue.";
    case "si": {
      const branche = CONDITIONS[effet.condition](etat) ? effet.alors : effet.sinon;
      return branche.map(e => appliquerEffet(etat, e, mult, rng, ctx)).filter(Boolean).join(" ") || null;
    }
    case "rejouerPrecedente": return null; // traité dans rencontrer()
    default: return `Effet inconnu : ${effet.type}`;
  }
}

/** Effets réellement appliqués par une carte (choix éventuel compris). */
export function effetsDeCarte(carte, indexChoix) {
  if (carte.choix && indexChoix != null) return carte.choix[indexChoix].effets;
  return carte.effets;
}

/** Un choix est-il possible dans l'état présent ? */
export function choixPossible(etat, carte, indexChoix) {
  const ex = carte.choix?.[indexChoix]?.exige;
  return !ex || ex.fortune == null || etat.fortune >= ex.fortune;
}

// Effets qu'une Étoile ne rejoue pas : ils n'ont de sens qu'une fois.
const NON_REJOUES = new Set(["rejouerPrecedente", "retour", "reserve", "bouleverser"]);

/**
 * Que se passe-t-il quand le mage arrive sur une carte ?
 * 'survolee' (Départ), 'fermee' (Destinée fermée : pas de choix à faire), 'choix' (le joueur doit choisir), 'normale'.
 */
export function etatArrivee(etat, id) {
  if (etat.suivante.survoler) return "survolee";
  if (etat.suivante.ignorer) return "fermee";
  return CARTE_PAR_ID[id].choix ? "choix" : "normale";
}

/**
 * Le mage vit une carte.
 * Ordre : un rang de vue se consume → carte fermée ? → multiplicateur de La Destinée → effets de la carte
 *         (et de la précédente pour les Étoiles) → règles de voisinage → inscription dans le tirage → projets.
 * Renvoie { messages, regles, entree, retour } ; `retour` est le numéro d'une carte qu'Union fait revenir
 * (le jeu doit alors la faire vivre à son tour).
 */
export function rencontrer(etat, id, indexChoix = null, rng = Math.random, ctx = {}) {
  const carte = CARTE_PAR_ID[id];
  const messages = [];
  const entree = { id, choix: indexChoix, ignoree: false, double: false, region: ctx.region ?? etat.region, regles: [], retour: !!ctx.retour };
  const avant = { fortune: etat.fortune, energie: etat.energie };
  const c = { ...ctx, carte: id };
  etat.reveler = Math.max(0, etat.reveler - 1);
  etat.retourDemande = false;

  if (etat.suivante.ignorer) {
    etat.suivante.ignorer = false;
    entree.ignoree = true;
    entree.choix = null;
    messages.push("La porte était fermée : cette carte reste voilée et sans effet.");
  } else {
    let mult = 1;
    if (etat.suivante.double) { etat.suivante.double = false; mult = 2; entree.double = true; messages.push("Mise au premier plan par La Destinée : effet doublé."); }
    if (carte.choix && indexChoix != null) {
      if (!choixPossible(etat, carte, indexChoix)) { messages.push("Ce choix n’est pas possible : il y faut plus de fortune."); indexChoix = null; entree.choix = null; }
      else if (carte.choix[indexChoix].message) messages.push(carte.choix[indexChoix].message);
    }
    const effets = carte.choix && indexChoix == null ? [] : effetsDeCarte(carte, indexChoix);
    for (const effet of effets) {
      if (effet.type === "rejouerPrecedente") {
        const prec = derniereEntree(etat);
        if (prec && !prec.ignoree) {
          const cp = CARTE_PAR_ID[prec.id];
          // Ajout de jeu : l'Étoile du consultant le représente ; l'autre est une influence (le mari, l'épouse),
          // dont le sort ne touche le consultant qu'à moitié.
          const influence = etat.consultant && carte.etoile && carte.etoile !== etat.consultant;
          const m2 = influence ? mult / 2 : mult;
          messages.push(influence
            ? `${cp.nom} s’applique à ${carte.etoile === "homme" ? "l’homme de votre jeu" : "la femme de votre jeu"} : vous n’en recevez que la moitié.`
            : `${cp.nom} s’applique à vous, ${etat.consultant === "femme" ? "la consultante" : "le consultant"}.`);
          entree.recu = prec.id;
          for (const e of effetsDeCarte(cp, prec.choix)) {
            if (NON_REJOUES.has(e.type)) continue;
            const msg = appliquerEffet(etat, e, m2, rng, { ...c, carte: prec.id }); if (msg) messages.push(msg);
          }
        } else messages.push("Aucune carte ne précède : rien à lui appliquer.");
        continue;
      }
      const msg = appliquerEffet(etat, effet, mult, rng, c); if (msg) messages.push(msg);
    }
  }

  const prec = derniereEntree(etat);
  const regles = prec && !prec.ignoree && !entree.ignoree ? reglesDeclenchees(prec, entree) : [];
  for (const r of regles) {
    messages.push(`Règle de Belline : ${r.texte}`);
    entree.regles.push(r.id);
    for (const e of r.effets) { const msg = appliquerEffet(etat, e, 1, rng, c); if (msg) messages.push(msg); }
  }

  entree.gain = { fortune: etat.fortune - avant.fortune, energie: Math.round(etat.energie - avant.energie) };
  const index = etat.historique.length;
  etat.historique.push(entree);

  // Entreprises : chaque projet attend des cartes sans perte
  const perte = entree.gain.fortune < 0 || entree.gain.energie < 0;
  for (const p of etat.projets) {
    if (p.cree >= index || p.fini) continue;
    if (perte) { p.fini = true; messages.push("Une perte en route : le projet d’Entreprises échoue."); continue; }
    if (--p.restantCartes <= 0) { p.fini = true; messages.push("Le projet aboutit : " + variation(etat, "fortune", p.valeur)); }
  }
  etat.projets = etat.projets.filter(p => !p.fini);

  let retour = null;
  if (etat.retourDemande) {
    etat.retourDemande = false;
    retour = etat.laissees?.pop() ?? null;
    messages.push(retour != null ? `Retour : ${CARTE_PAR_ID[retour].nom}, laissée de côté, revient vers vous.` : "Rien de ce que vous avez laissé ne revient.");
  }

  entree.messages = messages.slice();
  if (etat.energie <= 0) { etat.termine = true; etat.cause = "carte"; }
  return { messages, regles, entree, retour };
}

/** Le mage laisse une carte de côté en prenant une autre branche. */
export function contourner(etat, id, rng = Math.random) {
  const carte = CARTE_PAR_ID[id];
  etat.contournees.push(id);
  (etat.laissees ||= []).push(id);
  const messages = carte.messageContourne && carte.contourne ? [carte.messageContourne] : [];
  for (const e of (carte.contourne || [])) { const msg = appliquerEffet(etat, e, 1, rng, { carte: id }); if (msg) messages.push(msg); }
  return messages;
}

/** Coût d'un saut par-dessus une carte : gratuit sous Élévation, plus cher pour une carte forte. */
export function coutSaut(etat, id) {
  if (etat.minuteurs.elevation > 0) return 0;
  return CARTE_PAR_ID[id].forte ? 15 : 6;
}

/** Le mage saute par-dessus une carte. */
export function sauter(etat, id, rng = Math.random) {
  const carte = CARTE_PAR_ID[id];
  const cout = coutSaut(etat, id);
  etat.energie = Math.max(0, etat.energie - cout);
  etat.sautees.push(id);
  (etat.laissees ||= []).push(id);
  const messages = [cout ? `Le mage saute par-dessus ${carte.nom} : -${cout} d’énergie.` : `Le mage s’élève par-dessus ${carte.nom} sans effort.`];
  if (carte.messageContourne && carte.contourne) messages.push(carte.messageContourne);
  for (const e of (carte.contourne || [])) { const msg = appliquerEffet(etat, e, 1, rng, { carte: id }); if (msg) messages.push(msg); }
  if (etat.energie <= 0) { etat.termine = true; etat.cause = "saut"; }
  return messages;
}

/** Départ : les oiseaux emportent le mage au-dessus de la carte. */
export function survoler(etat, id) {
  etat.suivante.survoler = false;
  etat.survolees.push(id);
  return [`Les oiseaux emportent le mage au-dessus de ${CARTE_PAR_ID[id].nom} : elle est abandonnée.`];
}

/** Carte Bleue : remplace la dernière carte vécue (ce qu'elle avait fait est annulé). Renvoie des messages ou null. */
export function utiliserCarteBleue(etat) {
  if (!etat.carteBleue) return null;
  const e = derniereEntree(etat);
  if (!e || e.id === 0) return ["Aucune carte à remplacer pour l’instant."];
  etat.carteBleue = false;
  e.remplacee = true;
  etat.energie = borner(etat.energie - e.gain.energie, 0, etat.energieMax);
  etat.fortune -= e.gain.fortune;
  if (etat.energie <= 0) { etat.energie = 1; }
  return [`La Carte Bleue remplace ${CARTE_PAR_ID[e.id].nom} : ce que cette carte avait fait est annulé (${-e.gain.energie >= 0 ? "+" : ""}${-e.gain.energie} d’énergie, ${-e.gain.fortune >= 0 ? "+" : ""}${-e.gain.fortune} de fortune).`];
}
