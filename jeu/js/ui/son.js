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

// ---------- Les sons des éléments (bruit filtré : l'eau, le feu, la roche, le vent…) ----------
let bruit = null;
function souffle(duree, filtre, f0, f1, volume = 0.18, delai = 0) {
  const a = audio(); if (!a) return;
  if (!bruit) {
    bruit = a.createBuffer(1, a.sampleRate * 1.5, a.sampleRate);
    const d = bruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + delai, src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = bruit; f.type = filtre; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + duree);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  src.connect(f).connect(g).connect(a.destination); src.start(t); src.stop(t + duree + 0.05);
}

/** Le son d'un élément : `phase` 'lancer' (le coup part) ou 'impact' (il frappe). */
export function jouerElement(element, phase = "impact") {
  const lancer = phase === "lancer";
  switch (element) {
    case "eau": lancer ? souffle(0.45, "bandpass", 600, 1800, 0.12) : (souffle(0.6, "lowpass", 2400, 300, 0.22), note(180, 0.25, "sine", 0.08)); break;
    case "feu": lancer ? souffle(0.4, "bandpass", 900, 2400, 0.12) : (souffle(0.7, "lowpass", 3000, 200, 0.25), note(90, 0.4, "triangle", 0.1)); break;
    case "terre": lancer ? souffle(0.3, "lowpass", 400, 200, 0.14) : (souffle(0.5, "lowpass", 300, 60, 0.3), note(55, 0.5, "sine", 0.2)); break;
    case "air": souffle(lancer ? 0.4 : 0.6, "highpass", lancer ? 1500 : 3000, lancer ? 4000 : 800, 0.12); break;
    case "foudre": lancer ? souffle(0.15, "highpass", 3000, 6000, 0.1) : (souffle(0.35, "highpass", 6000, 600, 0.28), note(70, 0.45, "sawtooth", 0.06)); break;
    case "fleurs": [1047, 1319, 1568].forEach((f, k) => note(f, 0.3, "sine", 0.05, k * 0.05)); break;
    default: lancer ? note(880, 0.2, "sine", 0.06) : [784, 1047, 1319].forEach((f, k) => note(f, 0.4, "sine", 0.07, k * 0.04));
  }
}

/** Le bruissement d'une carte qu'on pioche. */
export function bruissement() { souffle(0.16, "highpass", 2500, 6000, 0.05); }

// ---------- La musique d'ambiance : un bourdon doux, accordé à la planète du duel (réglage à part) ----------
const CLE_MUSIQUE = "chemin-du-mage.musique";
let musiqueVoulue = true;
try { musiqueVoulue = localStorage.getItem(CLE_MUSIQUE) !== "non"; } catch { /* stockage indisponible */ }
let bourdon = null, planeteBourdon = null;
// la fondamentale de chaque planète (Saturne grave, la Lune claire), et l'intervalle qui l'accompagne
const BOURDONS = { soleil: [110, 1.5], lune: [138.6, 1.5], mercure: [164.8, 1.335], venus: [130.8, 1.26], mars: [98, 1.5], jupiter: [82.4, 1.5], saturne: [69.3, 1.335] };

function arreterBourdon(fondu = 1.2) {
  if (!bourdon) return;
  const b = bourdon, t = b.ctx.currentTime;
  b.gain.gain.cancelScheduledValues(t); b.gain.gain.setValueAtTime(b.gain.gain.value, t); b.gain.gain.linearRampToValueAtTime(0, t + fondu);
  setTimeout(() => b.sources.forEach(s => { try { s.stop(); } catch { /* déjà arrêtée */ } }), fondu * 1000 + 100);
  bourdon = null;
}

/** Lance (ou change) la musique d'ambiance de la planète ; null l'arrête. */
export function musique(planete) {
  if (planete === planeteBourdon && bourdon) return;
  planeteBourdon = planete;
  arreterBourdon();
  if (!planete || !musiqueVoulue || !BOURDONS[planete]) return;
  const a = audio(); if (!a) return;
  const [f, k] = BOURDONS[planete], t = a.currentTime;
  const gain = a.createGain(); gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.03, t + 3);
  const filtre = a.createBiquadFilter(); filtre.type = "lowpass"; filtre.frequency.value = 700;
  gain.connect(filtre).connect(a.destination);
  const sources = [];
  for (const [freq, forme, vol] of [[f, "sine", 1], [f * k, "sine", 0.6], [f * 2, "triangle", 0.25]]) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = forme; o.frequency.value = freq; g.gain.value = vol;
    // une respiration lente : chaque voix ondule à son rythme
    const lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.value = 0.05 + Math.random() * 0.08; lg.gain.value = vol * 0.5;
    lfo.connect(lg).connect(g.gain);
    o.connect(g).connect(gain); o.start(t); lfo.start(t);
    sources.push(o, lfo);
  }
  bourdon = { ctx: a, gain, sources };
}
export function musiqueActive() { return musiqueVoulue; }
/** Bascule la musique ; renvoie le nouvel état. */
export function basculerMusique() {
  musiqueVoulue = !musiqueVoulue;
  try { localStorage.setItem(CLE_MUSIQUE, musiqueVoulue ? "oui" : "non"); } catch { /* rien */ }
  const p = planeteBourdon; planeteBourdon = null;
  if (musiqueVoulue) musique(p); else arreterBourdon();
  return musiqueVoulue;
}
