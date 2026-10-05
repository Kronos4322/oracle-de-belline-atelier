// Sauvegarde locale du carnet (localStorage), commune au Chemin et au Duel.
import { carnetVide, normaliserCarnet } from "../engine/carnet.js";

const CLE = "chemin-du-mage.carnet";

export function chargerCarnet() {
  try { return normaliserCarnet(JSON.parse(localStorage.getItem(CLE) || "null")); }
  catch { return carnetVide(); }
}

export function sauverCarnet(c) {
  try { localStorage.setItem(CLE, JSON.stringify(c)); } catch { /* stockage indisponible : le carnet vit le temps de la partie */ }
}
