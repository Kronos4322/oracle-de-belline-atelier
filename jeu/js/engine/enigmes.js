// L'énigme de la porte : une question sur une carte rencontrée dans la région qu'on quitte. Module pur.
// Ajout de jeu (signalé) : la notice ne parle pas de questions ; c'est un outil d'apprentissage.
// Trois sortes de questions, toutes tirées des textes de la notice :
//   - l'image : « Quelle carte a pour image… ? »
//   - la notice : « Quelle carte dit… ? » (un extrait, sans le nom de la carte)
//   - le voisinage : « Avec quelle carte… annonce-t-elle… ? »
import { CARTES, CARTE_PAR_ID } from "../data/cartes.js";
import { VOISINAGE } from "../data/voisinage.js";
import { melanger, choisir } from "./hasard.js";

const sans = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Extrait de notice lisible sans révéler la carte : la première phrase qui ne contient ni son nom ni « n° ». */
export function extraitNotice(carte) {
  const phrases = carte.notice.split(/(?<=\.)\s+/).map(p => p.trim()).filter(Boolean);
  const nom = sans(carte.nom).split(/[^a-z]+/).filter(m => m.length > 3);
  const ok = phrases.find(p => !/n°/.test(p) && !nom.some(m => sans(p).includes(m)) && p.length > 12);
  return ok ?? null;
}

function leurres(id, n, rng, filtre = () => true) {
  const pool = CARTES.filter(c => c.id !== id && filtre(c)).map(c => c.id);
  return melanger(pool, rng).slice(0, n);
}

/**
 * Pose une énigme sur l'une des cartes `candidates` (préférence aux cartes à revoir du carnet).
 * Renvoie { carte, question, options: [numéros], bonne (index), explication } ou null.
 */
export function poserEnigme(candidates, rng, aRevoir = {}) {
  if (!candidates.length) return null;
  const prioritaires = candidates.filter(id => aRevoir[id] > 0);
  const id = choisir(prioritaires.length && rng() < 0.7 ? prioritaires : candidates, rng);
  const carte = CARTE_PAR_ID[id];
  const sortes = ["image"];
  if (extraitNotice(carte)) sortes.push("notice");
  const regles = VOISINAGE.filter(r => (r.a === id || r.b === id) && r.ordre === "libre");
  if (regles.length) sortes.push("voisinage");
  const sorte = choisir(sortes, rng);

  if (sorte === "voisinage") {
    const r = choisir(regles, rng);
    const autre = r.a === id ? r.b : r.a;
    const sens = r.texte.split(" : ")[1] ?? r.texte;
    const options = melanger([autre, ...leurres(autre, 2, rng, c => c.id !== id)], rng);
    return { carte: id, sorte, question: `Selon Belline, avec quelle carte ${carte.nom} annonce-t-elle « ${sens.replace(/\.$/, "")} » ?`,
      options, bonne: options.indexOf(autre), explication: r.texte };
  }
  const options = melanger([id, ...leurres(id, 2, rng)], rng);
  const question = sorte === "image"
    ? `Quelle carte a pour image « ${carte.image} » ?`
    : `Quelle carte dit : « ${extraitNotice(carte)} » ?`;
  return { carte: id, sorte, question, options, bonne: options.indexOf(id), explication: `${carte.nom} : « ${carte.notice} »` };
}
