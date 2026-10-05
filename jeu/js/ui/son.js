// Sons du jeu, générés par le navigateur (Web Audio), sans fichier. Coupés d'un clic ; le choix est retenu.
const CLE = "chemin-du-mage.son";
let ctx = null;
let actif = true;
try { actif = localStorage.getItem(CLE) !== "non"; } catch { /* stockage indisponible : son actif */ }

function audio() {
  if (!actif) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Une note : fréquence (Hz), durée (s), forme d'onde, volume, délai. */
function note(f, duree, forme = "sine", volume = 0.12, delai = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + delai;
  const o = a.createOscillator(), g = a.createGain();
  o.type = forme; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + duree + 0.05);
}

const ACCORDS = {
  gain: [[659, 0], [880, 0.07]],
  perte: [[220, 0], [185, 0.09]],
  neutre: [[523, 0]],
  saut: [[392, 0], [587, 0.06]],
  regle: [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24]],
  porte: [[392, 0], [523, 0.12], [659, 0.24]],
  choix: [[740, 0]],
  erreur: [[311, 0], [294, 0.1]],
  victoire: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.4], [1319, 0.55]],
  defaite: [[392, 0], [349, 0.18], [311, 0.36], [262, 0.6]],
  frappe: [[160, 0], [110, 0.05]],
  invocation: [[440, 0], [554, 0.06], [659, 0.12]]
};

/** Chaque planète a son ton : la même mélodie, transposée et d'un timbre propre (Saturne grave, la Lune claire…). */
const PLANETES = {
  soleil: [1, "sine"], lune: [1.26, "sine"], mercure: [1.5, "triangle"], venus: [1.19, "sine"],
  mars: [0.89, "sawtooth"], jupiter: [0.75, "triangle"], saturne: [0.63, "triangle"]
};

/** Joue un son nommé (voir ACCORDS), dans le ton d'une planète si elle est donnée. */
export function jouerSon(nom, planete = null) {
  const a = ACCORDS[nom]; if (!a) return;
  const [k, timbre] = PLANETES[planete] || [1, null];
  const forme = timbre || (nom === "perte" || nom === "frappe" || nom === "defaite" ? "triangle" : "sine");
  const vol = forme === "sawtooth" ? 0.05 : nom === "frappe" ? 0.18 : 0.1;
  for (const [f, d] of a) note(f * k, nom === "victoire" || nom === "defaite" ? 0.6 : 0.32, forme, vol, d);
}

export function sonActif() { return actif; }

/** Bascule le son ; renvoie le nouvel état. */
export function basculerSon() {
  actif = !actif;
  try { localStorage.setItem(CLE, actif ? "oui" : "non"); } catch { /* rien */ }
  return actif;
}
