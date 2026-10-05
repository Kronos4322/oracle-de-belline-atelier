// Simulateur de parties : joue le vrai module de partie (js/engine/partie.js) sans affichage,
// avec une politique de jeu. Sert aux tests (équilibre, règles atteignables) et au réglage :
//   node tests/simulateur.mjs
import { CARTE_PAR_ID } from "../js/data/cartes.js";
import { creerHasard } from "../js/engine/hasard.js";
import { coutSaut, etatArrivee } from "../js/engine/effects.js";
import { valence, meilleurChoix, VALEURS } from "../js/engine/valeurs.js";
import { creerPartie, avancer, resoudre, demanderSaut, regarder } from "../js/engine/partie.js";
import { reglesDeclenchees } from "../js/data/voisinage.js";

const PAS = 0.1;

/** Politiques : 'hasard' (branches, choix, réponses au hasard ; jamais de saut) ou 'avise' (lit les cartes). */
export function jouerPartie(graine, politique = "hasard", consultant = "homme", options = {}) {
  const p = creerPartie(graine, consultant, options);
  const rng = creerHasard(graine + 101);
  const avise = politique === "avise";
  let vue = regarder(p);
  for (let i = 0; i < 40000 && !p.fini; i++) {
    if (p.attente) { resoudre(p, repondre(p, p.attente, avise, rng)); continue; }
    const { mage, chemin, etat } = p;
    let commande = { dx: 0, dy: 1 };
    if (mage.vers == null && chemin.suivants[mage.noeud].length === 2 && etat.minuteurs.passivite <= 0) {
      if (i % 3 === 0) vue = regarder(p);
      const outs = chemin.suivants[mage.noeud];
      const choix = avise ? meilleureBranche(p, outs, vue) : outs[Math.floor(rng() * 2)];
      commande = { dx: chemin.noeuds[choix].x < chemin.noeuds[mage.noeud].x ? -1 : 1, dy: 0.4 };
    }
    if (avise && !mage.saut) {
      const c = mage.cibleSaut(chemin);
      if (c) {
        const id = chemin.noeuds[c.noeud].carte;
        if (etatArrivee(etat, id) === "normale" && valence(etat, id) < -coutSaut(etat, id) - 2) demanderSaut(p);
      }
    }
    avancer(p, PAS, commande);
    if (i % 10 === 0) vue = regarder(p);
  }
  return { etat: p.etat, chemin: p.chemin, partie: p };
}

function meilleureBranche(p, outs, vue) {
  const { chemin, etat } = p;
  let best = outs[0], bv = -Infinity;
  for (const o of outs) {
    let k = o, v = 0;
    for (let pas = 0; pas < 4 && k != null; pas++) {
      const n = chemin.noeuds[k];
      if (n.carte != null && n.etat === "libre") { if (vue.faces.get(k) === "face") v += valence(etat, n.carte); break; }
      if (chemin.suivants[k].length !== 1) break;
      k = chemin.suivants[k][0];
    }
    if (v > bv) { bv = v; best = o; }
  }
  return best;
}

function repondre(p, a, avise, rng) {
  if (a.kind === "choix") return avise ? meilleurChoix(p.etat, a.id) : Math.floor(rng() * CARTE_PAR_ID[a.id].choix.length);
  if (a.kind === "enigme") return avise && rng() < 0.8 ? a.enigme.bonne : Math.floor(rng() * a.enigme.options.length);
  if (a.kind === "retenir") {
    if (!avise) return a.candidats[Math.floor(rng() * a.candidats.length)];
    const derniere = p.retenues.at(-1);
    const accord = derniere && a.candidats.find(id => reglesDeclenchees({ id: derniere.id }, { id }).length);
    return accord ?? [...a.candidats].sort((x, y) => VALEURS[y] - VALEURS[x])[0];
  }
  return null;
}

// Lancé directement : statistiques d'équilibre
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  for (const pol of ["hasard", "avise"]) {
    let morts = 0, vecues = 0, en = 0, fo = 0, sauts = 0, retenues = 0;
    const N = 200;
    for (let g = 1; g <= N; g++) {
      const { etat, partie } = jouerPartie(g, pol);
      if (!etat.victoire) morts++;
      vecues += etat.historique.length; en += etat.energie; fo += etat.fortune; sauts += etat.sautees.length; retenues += partie.retenues.length;
    }
    console.log(`${pol.padEnd(7)} défaites ${(100 * morts / N).toFixed(0)} %  cartes vécues ${(vecues / N).toFixed(1)}  sauts ${(sauts / N).toFixed(1)}  retenues ${(retenues / N).toFixed(1)}  énergie finale ${(en / N).toFixed(0)}  fortune ${(fo / N).toFixed(0)}`);
  }
}
