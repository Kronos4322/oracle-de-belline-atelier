// Générateur pseudo-aléatoire à graine (mulberry32). Module pur.
// Une même graine redonne le même chemin : « Chemin n° 4821 » peut se rejouer.

/**
 * Renvoie une fonction qui donne un nombre dans [0, 1[. Son état (`f.etat()`) se sauvegarde, et
 * `reprendreHasard(etat)` continue exactement la même suite (un duel enregistré reprend à l'identique).
 */
export function creerHasard(graine) { return reprendreHasard(graine >>> 0); }
export function reprendreHasard(etat) {
  let s = etat >>> 0;
  const f = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.etat = () => s;
  return f;
}

/** Une graine lisible, de 1 à 99 999. */
export function nouvelleGraine(rng = Math.random) { return 1 + Math.floor(rng() * 99999); }

export function melanger(tab, rng) {
  const t = tab.slice();
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}

export function choisir(tab, rng) { return tab[Math.floor(rng() * tab.length)]; }
