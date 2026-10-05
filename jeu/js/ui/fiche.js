// Fiche de carte (carte vécue ou aperçu), cartes devant le mage, dialogues (choix, carte retenue, énigme), annonces.
import { REGIONS } from "../config.js";
import { CARTE_PAR_ID } from "../data/cartes.js";
import { choixPossible } from "../engine/effects.js";
import { peindreDansCanvas } from "../render/carte.js";

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

export function peindreCarte(canvas, id, face = true) { peindreDansCanvas(canvas, CARTE_PAR_ID[id], face); }

/** Pastilles : ce que la carte a fait, en un coup d'œil. */
export function pastilles(gain = {}, extra = []) {
  const p = [];
  if (gain.energie) p.push(`<span class="pastille ${gain.energie > 0 ? "bon" : "mauvais"}" title="énergie">${gain.energie > 0 ? "+" : ""}${gain.energie} <i>⚡</i></span>`);
  if (gain.fortune) p.push(`<span class="pastille ${gain.fortune > 0 ? "bon" : "mauvais"}" title="fortune">${gain.fortune > 0 ? "+" : ""}${gain.fortune} <i>✦</i></span>`);
  for (const e of extra) p.push(`<span class="pastille neutre">${esc(e)}</span>`);
  return p.join("");
}

function liste(el, messages) {
  el.replaceChildren(...messages.map(m => { const li = document.createElement("li"); li.textContent = m; return li; }));
}

function remplir(carte, titre, ouvrirLecon) {
  $("fiche-titre").textContent = titre;
  peindreCarte($("fiche-dessin"), carte.id);
  $("fiche-numero").textContent = carte.id === 0 ? "Hors jeu d’Edmond" : `N° ${carte.id} · ${REGIONS.find(r => r.famille === carte.famille)?.nom ?? "Les cartes maîtresses"}`;
  $("fiche-nom").textContent = carte.nom;
  $("fiche-image").textContent = `Image : ${carte.image}`;
  $("fiche-notice").textContent = `« ${carte.notice} »`;
  $("fiche-lecon").textContent = carte.lecon || "";
  $("fiche-lecon-bloc").open = !!ouvrirLecon;
  $("fiche").classList.toggle("bleue", carte.id === 0);
  $("fiche").classList.remove("vide");
}

function ouvrir() { $("fiche").classList.add("ouverte"); }
export function fermerFiche() { $("fiche").classList.remove("ouverte"); }

/** La carte qui vient d'être vécue (ou sautée, survolée...). */
export function montrerVecue(id, messages, { titre = "Carte vécue", nouvelle = false, gain = {}, regles = [] } = {}) {
  const carte = CARTE_PAR_ID[id];
  remplir(carte, nouvelle ? `${titre} · nouvelle au carnet` : titre, nouvelle);
  $("fiche-message").textContent = carte.message;
  $("fiche-pastilles").innerHTML = pastilles(gain, regles.map(r => `Règle : ${r.texte.split(" : ")[1] ?? r.texte}`));
  liste($("fiche-effets"), messages);
  $("fiche-actions").replaceChildren();
  ouvrir();
}

/** Un message qui ne vient pas d'une carte vécue à l'instant (espérance échue, Carte Bleue...). */
export function montrerMessage(id, messages, titre, gain = {}) {
  const carte = CARTE_PAR_ID[id];
  remplir(carte, titre, false);
  $("fiche-message").textContent = "";
  $("fiche-pastilles").innerHTML = pastilles(gain);
  liste($("fiche-effets"), messages);
  $("fiche-actions").replaceChildren();
  ouvrir();
}

/** Aperçu d'une carte du chemin ; `onAller` (facultatif) propose d'y conduire le mage. */
export function montrerApercu(id, { face, info = "", onAller = null }) {
  if (face !== "face") {
    $("fiche-titre").textContent = "Carte voilée";
    $("fiche-nom").textContent = "Carte voilée";
    $("fiche-numero").textContent = ""; $("fiche-image").textContent = "";
    $("fiche-notice").textContent = "Elle est trop loin pour être lue. Approchez, ou gagnez de la vue (Nativité, Découverte, Intelligence, le chien, une énigme réussie…).";
    $("fiche-lecon").textContent = ""; $("fiche-message").textContent = info;
    $("fiche-pastilles").innerHTML = ""; $("fiche-effets").replaceChildren();
    peindreCarte($("fiche-dessin"), id, false);
    $("fiche").classList.remove("vide", "bleue");
  } else {
    remplir(CARTE_PAR_ID[id], "Aperçu", false);
    $("fiche-message").textContent = CARTE_PAR_ID[id].motCle + (info ? ` · ${info}` : "");
    $("fiche-pastilles").innerHTML = "";
    $("fiche-effets").replaceChildren();
  }
  const actions = $("fiche-actions");
  actions.replaceChildren();
  if (onAller) {
    const b = document.createElement("button");
    b.textContent = "Y conduire le mage";
    b.addEventListener("click", () => { onAller(); fermerFiche(); });
    actions.appendChild(b);
  }
  ouvrir();
}

/** Liste des cartes visibles devant le mage (rang le plus proche d'abord). */
export function majDevant(entrees, onClic) {
  const ul = $("devant");
  if (!entrees.length) { ul.innerHTML = "<li class='vide'>Aucune carte en vue.</li>"; return; }
  ul.replaceChildren(...entrees.map(({ noeud, id, cote }) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "ligne-carte";
    const c = CARTE_PAR_ID[id];
    b.innerHTML = `<span class="sym"></span><span class="txt"><b></b><small></small></span><span class="cote"></span>`;
    b.querySelector(".sym").textContent = c.symbole;
    b.querySelector("b").textContent = `${c.id === 0 ? "" : c.id + ". "}${c.nom}`;
    b.querySelector("small").textContent = c.motCle;
    b.querySelector(".cote").textContent = cote;
    b.addEventListener("click", () => onClic(noeud));
    li.appendChild(b);
    return li;
  }));
}

// ---------- Dialogue commun ----------
function dialogue({ titre, texte = "", notice = "", lecon = "", cartes = [], boutons = [] }) {
  const dlg = $("dialogue");
  $("dlg-titre").textContent = titre;
  $("dlg-texte").textContent = texte;
  $("dlg-notice").textContent = notice;
  $("dlg-lecon").textContent = lecon;
  const zc = $("dlg-cartes"); zc.replaceChildren();
  for (const { id, face = true, onClic, legende } of cartes) {
    const el = document.createElement(onClic ? "button" : "div");
    el.className = "dlg-carte";
    const cv = document.createElement("canvas"); peindreCarte(cv, id, face); el.appendChild(cv);
    if (legende) { const s = document.createElement("span"); s.textContent = legende; el.appendChild(s); }
    if (onClic) { el.addEventListener("click", onClic); el.setAttribute("aria-label", CARTE_PAR_ID[id].nom); }
    zc.appendChild(el);
  }
  const zb = $("dlg-boutons"); zb.replaceChildren();
  boutons.forEach((b, i) => {
    const el = document.createElement("button");
    el.textContent = b.label; el.dataset.index = i;
    if (b.desactive) { el.disabled = true; el.title = b.desactive; }
    if (b.classe) el.className = b.classe;
    el.addEventListener("click", ev => { ev.stopPropagation(); b.action(); });
    zb.appendChild(el);
  });
  dlg.classList.add("visible");
  (zb.querySelector("button:not([disabled])") || zc.querySelector("button"))?.focus();
}
export function fermerDialogue() { $("dialogue").classList.remove("visible"); }
export function dialogueOuvert() { return $("dialogue").classList.contains("visible"); }

/** Carte à choix (Destinée, Hazard...). Résout l'index choisi. */
export function demanderChoix(id, etat) {
  const carte = CARTE_PAR_ID[id];
  return new Promise(resolve => dialogue({
    titre: `${carte.id === 0 ? "" : carte.id + ". "}${carte.nom}`,
    texte: carte.message, notice: `« ${carte.notice} »`, lecon: carte.lecon,
    cartes: [{ id }],
    boutons: carte.choix.map((ch, i) => ({
      label: `${i + 1}. ${ch.label}`,
      desactive: choixPossible(etat, carte, i) ? null : `Il faut au moins ${ch.exige.fortune} de fortune.`,
      action: () => { fermerDialogue(); resolve(i); }
    }))
  }));
}

/** À la porte : quelle carte de la région quittée retenir pour le tirage ? Résout son numéro. */
export function demanderRetenue(region, candidats, conseil = "") {
  const r = REGIONS[region];
  return new Promise(resolve => dialogue({
    titre: `${r.glyphe} ${r.nom} : votre carte`,
    texte: `Quelle carte de ${r.nom} retenez-vous pour votre tirage ? Elle prendra la place de ${r.nom} dans la lecture finale.${conseil ? " " + conseil : ""}`,
    cartes: candidats.map((id, i) => ({ id, legende: `${i + 1}. ${CARTE_PAR_ID[id].nom}`, onClic: () => { fermerDialogue(); resolve(id); } })),
    boutons: candidats.map((id, i) => ({ label: `${i + 1}`, classe: "petit-bouton", action: () => { fermerDialogue(); resolve(id); } }))
  }));
}

/** L'énigme de la porte. Résout { index, reussie } après que le joueur a lu la correction. */
export function demanderEnigme(e) {
  return new Promise(resolve => {
    const repondre = i => {
      const reussie = i === e.bonne;
      dialogue({
        titre: reussie ? "Bien lu !" : "Pas tout à fait",
        texte: reussie ? "La porte s’ouvre en grand : deux rangs de vue et 10 de fortune." : `La bonne réponse était : ${CARTE_PAR_ID[e.options[e.bonne]].nom}. Cette carte reviendra dans vos énigmes.`,
        notice: e.explication,
        cartes: [{ id: e.options[e.bonne] }],
        boutons: [{ label: "Continuer", action: () => { fermerDialogue(); resolve({ index: i, reussie }); } }]
      });
    };
    dialogue({
      titre: "L’énigme de la porte",
      texte: e.question,
      boutons: e.options.map((id, i) => ({ label: `${i + 1}. ${CARTE_PAR_ID[id].nom}`, action: () => repondre(i) }))
    });
  });
}

/** Annonce pour les lecteurs d'écran (zone aria-live discrète). */
export function annoncer(texte) { $("annonce").textContent = texte; }
