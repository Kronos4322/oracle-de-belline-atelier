// Le Duel des Apparitions : accueil (duel libre, Sept Gardiens), atelier du deck, tapis, main, invocations,
// figures d'accord, présages et chaînes, combats (flèche, calcul), tour de l'adversaire, animations.
import { CARTES, CARTE_PAR_ID } from "./data/cartes.js";
import { DUEL, sacrificesRequis } from "./data/duel.js";
import { FIGURES, figuresDebloquees } from "./data/accords.js";
import { VOISINAGE, reglesDeclenchees } from "./data/voisinage.js";
import { GARDIENS, PROFILS, deckGardien, reglesEnseignees } from "./data/gardiens.js";
import { REGIONS } from "./config.js";
import { creerHasard, nouvelleGraine, reprendreHasard } from "./engine/hasard.js";
import {
  creerDuel, def, nomDe, familleDe, peutInvoquer, invoquer, peutActiver, activer, peutPoser, poser, peutChanger, changerPosition,
  fusionsPossibles, fusionner, passerAuCombat, passerPrincipale2, ciblesAttaque, calculCombat, attaquer,
  presagesActivables, presageOmbre, reagirInvocation, finTour, actionOmbre, executerOmbre, atkEffectif, defEffectif, LP,
  accordsTerrain, accomplirAccordTerrain, peutPoserInfluence, poserInfluence, evolutionsPossibles, evoluer, MECANIQUES, domine, influencesEnReponse, revelerEnReponse, influenceOmbre, preparerReprise, terrainsEnReponse, poserTerrainEnReponse, superInvocationsPossibles, superInvoquer, peutRevelerInfluence, revelerInfluence, techniquesPossibles, utiliserTechnique, avancementAssociation
} from "./engine/duel.js";
import { ALIGNEMENTS, ASSOCIATIONS } from "./data/techniques.js";
import { accordDeLecture, definirDictionnaire, dictionnaireCharge } from "./data/lectures.js";
import { ETATS, GRANDS_ACCORDS } from "./data/sorts.js";
import { ASTRES } from "./data/astres.js";
import { reconcilier, basculer, itemPanneau } from "./ui/duelOutils.js";
import { noterVue, noterRegle, noterDuel, vaincreGardien } from "./engine/carnet.js";
import { peindreCarteDuel, peindreHologramme } from "./render/carteDuel.js";
import { Effets, elementDe, TEINTES } from "./render/effetsVisuels.js";
import { Ambiance } from "./render/ambiance.js";
import { chargerCarnet, sauverCarnet } from "./ui/stockage.js";
import { jouerSon, basculerSon, sonActif, jouerElement } from "./ui/son.js";
import { installerPleinEcran } from "./ui/pleinEcran.js";

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const survol = window.matchMedia?.("(hover: hover)").matches ?? false;
// La vitesse des animations : lente pour lire les combos, normale, ou rapide. Elle allonge aussi les bannières.
const VITESSES = [["lente", 1.9, "🐢 Lent"], ["normale", 1.3, "⏱ Normal"], ["rapide", 0.8, "⚡ Rapide"]];
let vitesse = 1;
try { const v = VITESSES.findIndex(x => x[0] === localStorage.getItem("chemin-du-mage.vitesse")); if (v >= 0) vitesse = v; } catch { /* rien */ }
const facteur = () => VITESSES[vitesse][1];
const attendre = ms => new Promise(r => setTimeout(r, reduit ? Math.min(ms, 150) : ms * facteur()));
const carnet = chargerCarnet();
const CLE_DECK = "chemin-du-mage.deck";
const PLANETES = ["soleil", "lune", "mercure", "venus", "mars", "jupiter", "saturne"];

let d = null, rng = null, partie = null, consultant = "homme";
let selection = null;   // { type: 'main', index } | { type: 'terrain', place } | { type: 'sacrifice', index, pose, requis, choisis } | { type: 'attaque', place }
let occupe = false;
const lpAffiche = [LP, LP];

// ---------- Deck, réserve, rares ----------
function chargerDeck() {
  try { const x = JSON.parse(localStorage.getItem(CLE_DECK) || "null"); if (Array.isArray(x) && x.length >= 30) return x.filter(id => DUEL[id]); } catch { /* rien */ }
  return CARTES.map(c => c.id);
}
function sauverDeck(deck) { try { localStorage.setItem(CLE_DECK, JSON.stringify(deck)); } catch { /* rien */ } }
let deck = chargerDeck();
// La réserve : les figures dont vous connaissez la règle (Chemin, duels, Gardiens), plus quatre figures de départ.
// Une règle accomplie en duel fait aussi entrer sa figure dans la réserve, sur-le-champ.
const FIGURES_DEPART = [101, 102, 106, 111];
const reserveJoueur = () => [...new Set([...FIGURES_DEPART, ...figuresDebloquees(carnet.regles)])];
/** Les mécaniques que chaque Gardien dévoile (le premier n'enseigne que l'essentiel). */
const MECA_GARDIENS = [[], ["poseInfluence", "evolution"], ["poseInfluence", "evolution", "techniques"], ["poseInfluence", "evolution", "techniques", "figures"],
  ["poseInfluence", "evolution", "techniques", "figures", "accordsTerrain"], MECANIQUES, MECANIQUES];
const NOMS_MECA = { poseInfluence: "les influences posées face cachée", evolution: "l’évolution des apparitions", techniques: "les techniques (alignements, associations)",
  figures: "les figures d’accord", accordsTerrain: "les accords sur le terrain", superInvocations: "l’invocation céleste (les astres)" };
let accordsDuDuel = [];
// les moments forts du duel (pour l'écran de fin)
const momentsVides = () => ({ plusGrosCoup: 0, coupPar: null, astres: [], figures: 0, presages: 0, poses: 0, attaques: 0, lectures: 0 });
let moments = momentsVides();
/** Note un événement dans les moments forts du duel. */
function noterMoment(e) {
  if (e.type === "lp" && e.j === 1 && e.v < 0 && -e.v > moments.plusGrosCoup) { moments.plusGrosCoup = -e.v; moments.coupPar = e.pourquoi || ""; }
  if (e.j !== 0) return;
  if (e.type === "celeste") moments.astres.push(e.id);
  if (e.type === "fusion") moments.figures++;
  if (e.type === "presage") moments.presages++;
  if (e.type === "attaque") moments.attaques++;
  if (e.type === "accord" && e.sorte === "lecture") moments.lectures++;
}
const estRare = id => id < 100 && (carnet.cartes[id]?.vecue || 0) > 0;

// ---------- Dessin ----------
function carteCanvas(id, face, largeur, classe = "", format = "complete") {
  const cv = document.createElement("canvas");
  cv.className = classe;
  peindreCarteDuel(cv, id, face, largeur, format);
  return cv;
}


// ---------- Loupe : la carte entière, en grand, au survol (ou en appui long sur écran tactile) ----------
const loupe = document.createElement("div");
loupe.className = "loupe";
loupe.setAttribute("aria-hidden", "true");
const loupeCanvas = document.createElement("canvas");
loupe.appendChild(loupeCanvas);
document.body.appendChild(loupe);
let loupeId = null;
function montrerLoupe(id, face, ancre) {
  if (id == null) return;
  const l = Math.min(320, window.innerWidth - 32, (window.innerHeight - 32) * 150 / 219);
  if (loupeId !== `${id}|${face}|${l}`) { peindreCarteDuel(loupeCanvas, id, face, l); loupeId = `${id}|${face}|${l}`; }
  loupeCanvas.style.width = `${l}px`;
  const h = l * 219 / 150, r = ancre.getBoundingClientRect();
  let x = r.right + 14;
  if (x + l > window.innerWidth - 8) x = r.left - l - 14;
  if (x < 8) x = (window.innerWidth - l) / 2;
  const y = Math.max(8, Math.min(window.innerHeight - h - 8, r.top + r.height / 2 - h / 2));
  loupe.style.left = `${x}px`; loupe.style.top = `${y}px`;
  loupe.classList.add("visible");
}
function cacherLoupe() { loupe.classList.remove("visible"); }
/** Branche la loupe (et l'aperçu passager du panneau) sur un élément. `quoi()` → [id, face, état] ou null. */
function loupable(el, quoi) {
  // double-clic (ou double toucher) : la carte en grand
  el.addEventListener("dblclick", e => { const q = quoi(); if (q) { e.preventDefault(); zoomer(q[0], q[1]); } });
  if (survol) {
    let attente = null;
    el.addEventListener("mouseenter", () => {
      const q = quoi(); if (!q) return;
      apercu(q[0], q[1], q[2], true);
      clearTimeout(attente);
      attente = setTimeout(() => { if (!occupe && el.matches(":hover")) montrerLoupe(q[0], q[1], el); }, 400);
    });
    el.addEventListener("mouseleave", () => { clearTimeout(attente); cacherLoupe(); retablirApercu(); });
  } else {
    let minuteur = null, longue = false;
    el.addEventListener("pointerdown", () => { longue = false; minuteur = setTimeout(() => { const q = quoi(); if (q) { longue = true; montrerLoupe(q[0], q[1], el); } }, 420); });
    const fin = () => { clearTimeout(minuteur); if (longue) setTimeout(cacherLoupe, 60); };
    el.addEventListener("pointerup", fin); el.addEventListener("pointercancel", fin); el.addEventListener("pointerleave", fin);
    el.addEventListener("contextmenu", e => e.preventDefault());
    el.addEventListener("click", e => { if (longue) { e.stopImmediatePropagation(); e.preventDefault(); longue = false; } }, true);
  }
}

// ---------- Effets visuels propres à chaque carte ----------
const effets = new Effets($("plateau"));
// l'ambiance du tapis (particules lentes du ciel et des terrains)
const ambiance = new Ambiance($("tapis"));
/** L'élément d'une carte (sa planète) ; les figures d'accord ont le leur. */
const elementCarte = id => elementDe(id >= 100 && id < 200 ? null : familleDe(id));
// la barre de vie laisse une traînée claire quand elle baisse, comme dans les jeux de combat
for (const j of [0, 1]) { const s = document.createElement("span"); s.className = "lp-trainee"; s.id = `lp-trainee-${j}`; $(`lp-jauge-${j}`).before(s); }
/** Joue l'effet d'une carte : sur tout le tapis, ou autour d'un élément (agrandi). */
function effetCarte(id, cible = null, agrandir = 1, avecEmbleme = false) {
  if (!cible) return effets.carte(id, effets.rect($("tapis")), avecEmbleme);
  const r = effets.rect(cible), w = r.w * agrandir, h = r.h * agrandir;
  return effets.carte(id, { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h }, avecEmbleme);
}
function enveloppe(cv, id, face) {
  const s = document.createElement("span");
  s.className = `carte-env${face && estRare(id) ? " rare" : ""}${face && def(id).forte ? " forte" : ""}${face && id >= 100 && id < 200 ? " figure" : ""}${face && id >= 200 ? " astre" : ""}`;
  s.appendChild(cv);
  return s;
}

let zone = 92, largeurMain = 150;
const etroit = () => window.innerWidth <= 1040;
function tailleZone() {
  const parLargeur = $("monstres-0").clientWidth / 5 - 8;
  const parHauteur = window.innerWidth <= 640 ? 999 : (window.innerHeight - 290) / 4.1;
  return Math.max(52, Math.min(104, parLargeur, parHauteur));
}
/** Tout doit tenir dans l'écran, main comprise : on réduit les zones tant que la page déborde. */
const image_suivante = () => new Promise(r => setTimeout(r, 60));
let reglage = 0;
/**
 * Tout doit tenir dans l'écran, main comprise. On pose des tailles, on laisse le navigateur les afficher, on mesure
 * le débordement, et on le répartit : d'abord sur le tapis (4,2 px de hauteur par px de zone), puis sur la main.
 * (Mesurer juste après avoir changé une variable CSS donne parfois l'ancienne mise en page : d'où l'attente.)
 */
async function ajusterTaille() {
  const moi = ++reglage, racine = document.documentElement.style;
  const poser = () => { racine.setProperty("--zone", `${Math.round(zone)}px`); racine.setProperty("--main-l", `${Math.round(largeurMain)}px`); };
  const zoneMax = () => Math.min(104, $("monstres-0").clientWidth / 5 - 8);
  largeurMain = window.innerWidth <= 640 ? 88 : Math.max(96, Math.min(150, window.innerHeight * 0.18));
  zone = tailleZone();
  poser(); rendre();
  for (let k = 0; k < 4; k++) {
    await image_suivante();
    if (moi !== reglage) return;
    let r = $("plateau").getBoundingClientRect().bottom + window.scrollY - (window.innerHeight - 6);
    if (Math.abs(r) < 6) break;
    if (r > 0) {
      const dz = Math.min(r / 4.2, Math.max(0, zone - 62)); zone -= dz; r -= dz * 4.2;
      if (r > 0) { const dl = Math.min(r / 1.46, Math.max(0, largeurMain - 92)); largeurMain -= dl; r -= dl * 1.46; }
      if (r > 0) zone = Math.max(44, zone - r / 4.2);
    } else {
      r = -r;
      const dz = Math.min(r / 4.2, Math.max(0, zoneMax() - zone)); zone += dz;
    }
    zone = Math.floor(zone); largeurMain = Math.floor(largeurMain);
    poser(); rendre();
  }
}

function rendre() {
  if (!d) return;
  for (const j of [0, 1]) {
    const J = d.joueurs[j];
    allerLP(j, J.lp);
    $(`pioche-${j}`).textContent = J.pioche.length;
    const cim = $(`cimetiere-${j}`);
    cim.querySelector("b").textContent = J.cimetiere.length;
    const haut = J.cimetiere[J.cimetiere.length - 1];
    reconcilier(cim.querySelector(".pile-carte"), haut != null ? [[`${haut}|${zone}`, () => carteCanvas(haut, true, zone * 0.62, "", "jeton")]] : []);
    $(`reserve-${j}`).querySelector("b").textContent = J.reserve.length;
    reconcilier($(`monstres-${j}`), J.monstres.map((m, place) => [sigMonstre(j, m, place), () => zoneMonstre(j, m, place)]));
    [...$(`monstres-${j}`).children].forEach((el, place) => { if (J.monstres[place]) majMonstre(el, j, J.monstres[place], place); });
    reconcilier($(`presages-${j}`), J.presages.map((p, place) => [sigPresage(j, p, place), () => zonePresage(j, p, place)]));
    [...$(`presages-${j}`).children].forEach((el, place) => basculer(el, ["prete"], j === 0 && J.presages[place]?.influence && peutRevelerInfluence(d, 0, place).ok ? ["prete"] : []));
    $(`lp-${j}`).classList.toggle("actif", d.actif === j && !d.fini);
  }
  $("nom-1").textContent = d.joueurs[1].nom;
  const voit = d.joueurs[0].voitMain;
  reconcilier($("main-1"), d.joueurs[1].main.map(id => [`${voit ? id : "dos"}|${zone}`, () => carteCanvas(id, voit, zone * 0.5, "carte-ombre", "compacte")]));
  reconcilierMain();
  const direct = selection?.type === "attaque" && ciblesAttaque(d, 0, selection.place).includes("direct");
  $("lp-1").classList.toggle("ciblable", direct);
  const t = d.terrain ? REGIONS.find(r => r.famille === d.terrain) : null;
  $("terrain-nom").textContent = t ? `Ciel du duel : ${t.glyphe} ${t.nom}` : "";
  for (const j of [0, 1]) majLieu(j);
  $("tapis").dataset.terrain = d.terrain || "";
  ambiance.regler(d.terrain, [d.joueurs[0].terrainCarte, d.joueurs[1].terrainCarte]);
  majCommandes();
  $("indication").textContent = indication();
}

/** Les marques de sélection d'une zone d'apparition (elles entrent dans sa signature). */
const MARQUES = ["prete", "choisie", "ciblable", "sacrifiee-choisie"];

function marquesMonstre(j, m, place) {
  const k = [];
  if (!m) return k;
  if (j === 0 && ciblesAttaque(d, 0, place).length) k.push("prete");
  if (selection?.type === "attaque" && j === 0 && selection.place === place) k.push("choisie");
  if (selection?.type === "attaque" && j === 1 && ciblesAttaque(d, 0, selection.place).includes(place)) k.push("ciblable");
  if (selection?.type === "sacrifice" && j === 0) k.push(selection.choisis.includes(place) ? "sacrifiee-choisie" : "ciblable");
  if (selection?.type === "terrain" && j === 0 && selection.place === place) k.push("choisie");
  return k;
}
function sigMonstre(j, m, place) {
  if (!m) return `vide|${zone}`;
  // seulement ce qui change le dessin : valeurs, états et surlignages se mettent à jour sur place
  return [zone, m.uid, m.id, m.position, m.faceCachee, estRare(m.id)].join("|");
}
function sigPresage(j, p, place) {
  if (!p) return `vide|${zone}`;
  return [zone, p.uid, p.id, p.continue, p.tours, p.poseTour < d.tour, j, !!p.influence].join("|");
}

/** Le terrain posé par un joueur : sa moitié du tapis prend la couleur du lieu, un écriteau donne son nom. */
function majLieu(j) {
  const J = d.joueurs[j], moitie = document.querySelector(j === 0 ? ".moitie-vous" : ".moitie-ombre");
  const id = J.terrainCarte;
  moitie.dataset.lieu = id ?? "";
  let e = moitie.querySelector(".lieu-nom");
  if (!e) {
    e = document.createElement("button"); e.className = "lieu-nom"; moitie.appendChild(e);
    e.addEventListener("click", () => { const k = d.joueurs[j].terrainCarte; if (k != null) { apercu(k, true, etatLieu(j)); ouvrirDetail(); } });
    loupable(e, () => { const k = d.joueurs[j].terrainCarte; return k != null ? [k, true, etatLieu(j)] : null; });
  }
  e.hidden = id == null;
  const texte = id == null ? "" : `⌂ ${nomDe(id)} · ${J.terrainTours} tour${J.terrainTours > 1 ? "s" : ""}`;
  if (e.textContent !== texte) e.textContent = texte;
}
const etatLieu = j => `Terrain de ${j === 0 ? "votre côté" : d.joueurs[1].nom} : encore ${d.joueurs[j].terrainTours} tour${d.joueurs[j].terrainTours > 1 ? "s" : ""}.`;

function zoneMonstre(j, m, place) {
  const el = document.createElement("button");
  el.className = "zone zone-monstre";
  el.dataset.j = j; el.dataset.place = place;
  if (!m) {
    el.classList.add("vide");
    el.setAttribute("aria-label", "Zone d’apparition vide");
    el.addEventListener("click", () => cliquerZone(j, place));
    return el;
  }
  const carte = document.createElement("div");
  carte.className = `carte-terrain ${m.position === "defense" ? "defense" : ""} ${m.faceCachee ? "cachee" : ""}`;
  carte.appendChild(enveloppe(carteCanvas(m.id, !m.faceCachee, zone * 0.7, "", "jeton"), m.id, !m.faceCachee));
  el.appendChild(carte);
  if (!m.faceCachee) {
    const holo = document.createElement("canvas");
    const grand = m.id >= 100 || def(m.id).forte;
    holo.className = `holo ${m.position === "defense" ? "holo-defense" : ""} ${m.id >= 100 ? "holo-figure" : ""} ${grand ? "holo-forte" : ""}`;
    peindreHologramme(holo, m.id, Math.round(zone * (grand ? 1.3 : 1.1)));
    el.appendChild(holo);
  }
  el.insertAdjacentHTML("beforeend", `<div class="stats-terrain"></div><div class="etats-terrain"></div>`);
  const visible = !m.faceCachee || j === 0;
  majMonstre(el, j, m, place);
  el.addEventListener("click", () => cliquerZone(j, place));
  if (visible) loupable(el, () => {
    const mm = d.joueurs[j].monstres[place];
    return mm ? [mm.id, !mm.faceCachee || j === 0, etatMonstre(j, mm)] : null;
  });
  return el;
}

/** Valeurs, états, surlignages et libellé d'une zone d'apparition, mis à jour sans la recréer. */
function majMonstre(el, j, m, place) {
  const x = def(m.id), a = atkEffectif(d, j, m), df = defEffectif(d, j, m);
  const stats = !m.faceCachee || j === 0
    ? `<small class="nom-terrain">${esc(nomDe(m.id))}</small><span class="v-atk ${m.position === "attaque" ? "actif" : ""} ${a > x.atk ? "plus" : a < x.atk ? "moins" : ""}">${a}</span><i>/</i><span class="v-def ${m.position === "defense" ? "actif" : ""} ${df > x.def ? "plus" : df < x.def ? "moins" : ""}">${df}</span>`
    : "<span>?</span>";
  const etats = [];
  if (!m.faceCachee && x.garde) etats.push("<span title='garde'>⛨</span>");
  if (!m.faceCachee && j === 1 && d.joueurs[0].monstres.some(n => n && !n.faceCachee && domine(n.id, m.id))) etats.push("<span title='une de vos apparitions domine sa planète : +500 ATK contre elle'>▲</span>");
  if (!m.faceCachee && m.protege) etats.push("<span title='protégée une fois'>◈</span>");
  if (m.equipements?.length) etats.push(`<span title="équipée">⚒${m.equipements.length > 1 ? m.equipements.length : ""}</span>`);
  if (m.bloque > 0) etats.push(`<span title="ne peut pas attaquer">⛓${m.bloque}</span>`);
  if (j === 0 && m.faceCachee) etats.push("<span title='posée face cachée'>◐</span>");
  if (m.statut && !m.faceCachee) etats.push(`<span title="${ETATS[m.statut].texte}">${ETATS[m.statut].signe}</span>`);
  const s = el.querySelector(".stats-terrain"), e = el.querySelector(".etats-terrain");
  if (s && s.innerHTML !== stats) s.innerHTML = stats;
  if (e && e.dataset.v !== etats.join("")) { e.innerHTML = etats.join(""); e.dataset.v = etats.join(""); }
  const visible = !m.faceCachee || j === 0;
  el.setAttribute("aria-label", visible ? `${nomDe(m.id)}, ${m.position === "attaque" ? "en attaque" : "en défense"}${m.faceCachee ? ", face cachée" : ""}, ATK ${a}, DEF ${df}` : "Apparition face cachée");
  basculer(el, MARQUES, marquesMonstre(j, m, place));
  const auras = [];
  if (m.bloque > 0) auras.push("a-bloquee");
  if (m.protege && !m.faceCachee) auras.push("a-protegee");
  if (m.statut && !m.faceCachee) auras.push(`a-${m.statut}`);
  if (j === 0 && evolutionsPossibles(d, 0).some(x => x.place === place)) auras.push("evolutive");
  basculer(el, ["a-bloquee", "a-protegee", "a-poison", "a-brulure", "a-sommeil", "a-confusion", "evolutive"], auras);
}

function zonePresage(j, p, place) {
  const el = document.createElement("button");
  el.className = "zone zone-presage";
  el.dataset.j = j; el.dataset.place = place;
  if (!p) { el.classList.add("vide"); el.setAttribute("aria-label", "Zone de présage vide"); el.disabled = true; return el; }
  const visible = !!p.continue;
  const carte = document.createElement("div");
  carte.className = `carte-terrain ${visible ? "" : "cachee"}`;
  carte.appendChild(enveloppe(carteCanvas(p.id, visible, zone * 0.62, "", "jeton"), p.id, visible));
  el.appendChild(carte);
  if (p.influence) el.classList.add("influence-posee");
  const pret = p.poseTour < d.tour;
  if (p.continue) el.insertAdjacentHTML("beforeend", `<div class="etats-terrain presage-etat"><span>∞ ${p.tours}</span></div>`);
  else if (j === 0) el.insertAdjacentHTML("beforeend", `<div class="etats-terrain presage-etat${p.influence ? " influence-etat" : ""}"><span>${p.influence ? (pret ? "✦ à révéler" : "✦ posée") : pret ? "prêt" : "posé"}</span></div>`);
  if (j === 0 || visible) {
    const etat = p.continue ? `Influence continue : encore ${p.tours} tour${p.tours > 1 ? "s" : ""}.`
      : p.influence ? (pret ? "Influence posée face cachée : vous pouvez la révéler pendant votre phase principale." : "Influence posée ce tour : elle se révélera à partir de votre prochain tour.")
      : pret ? "Présage posé, prêt à se déclencher pendant le tour adverse." : "Présage posé ce tour : il pourra se déclencher à partir du prochain tour adverse.";
    el.setAttribute("aria-label", `${nomDe(p.id)} : ${etat}`);
    el.addEventListener("click", () => {
      if (occupe) return;
      selection = null; apercu(p.id, true, etat); ouvrirDetail();
      const P = d.joueurs[j].presages[place];
      if (j === 0 && P?.influence) {
        const v = peutRevelerInfluence(d, 0, place), x = def(P.id);
        actions(x.choix ? x.choix.map((ch, c) => ({ label: `Révéler : ${ch.label}`, desactive: v.ok ? null : v.raison, action: () => revelerPosee(place, c) }))
          : [{ label: x.sousType === "equipement" ? "Révéler et équiper" : "Révéler", desactive: v.ok ? null : v.raison, action: () => revelerPosee(place, null) }]);
      } else actions([]);
      rendre();
    });
    loupable(el, () => [p.id, true, etat]);
  } else { el.setAttribute("aria-label", "Présage adverse, face cachée"); el.disabled = true; }
  return el;
}

/** Les marques d'une carte en main : jouable, choisie, matériau d'accord. */
function etatMain(id, index) {
  const x = def(id), k = [];
  if (d.actif === 0 && !d.fini && (x.type === "apparition" ? peutInvoquer(d, 0, index).ok || peutInvoquer(d, 0, index, true).ok
    : x.type === "influence" ? peutActiver(d, 0, index).ok || peutPoserInfluence(d, 0, index).ok : peutPoser(d, 0, index).ok)) k.push("jouable");
  if ((selection?.type === "main" || selection?.type === "sacrifice") && selection.index === index) k.push("choisie");
  if (d.actif === 0 && fusionsPossibles(d, 0).some(f => f.materiaux.some(m => m.ou === "main" && m.index === index))) k.push("materiau");
  if (estRare(id)) k.push("rare");
  return k;
}

function carteMain(id) {
  const b = document.createElement("button");
  b.className = "carte-main";
  const x = def(id);
  b.setAttribute("aria-label", `${nomDe(id)}, ${x.type === "apparition" ? `apparition niveau ${x.niveau}, ATK ${x.atk}, DEF ${x.def}` : x.type}${estRare(id) ? ", rare" : ""}`);
  b.appendChild(enveloppe(carteCanvas(id, true, largeurMain, "", "compacte"), id, true));
  b.addEventListener("click", () => choisirMain(b._index));
  b.addEventListener("animationend", () => b.classList.remove("piochee"));
  loupable(b, () => [id, true, ""]);
  return b;
}

/**
 * La main : chaque carte garde son élément tant qu'elle reste en main (clé : numéro et rang du doublon) ;
 * seules sa place dans l'éventail et ses marques changent. Rien n'est redessiné, rien ne clignote.
 */
function reconcilierMain() {
  const box = $("main-0"), main = d.joueurs[0].main, n = main.length;
  const dispo = new Map();
  for (const el of box.children) { const c = el.dataset.cle; if (!dispo.has(c)) dispo.set(c, []); dispo.get(c).push(el); }
  const vus = {}, voulus = main.map(id => {
    vus[id] = (vus[id] || 0) + 1;
    const cle = `${id}#${vus[id]}|${largeurMain}`;
    let el = dispo.get(cle)?.shift();
    if (!el) { el = carteMain(id); el.dataset.cle = cle; }
    return el;
  });
  for (const reste of dispo.values()) for (const el of reste) el.remove();
  // la main est étalée, cartes côte à côte : si elles ne tiennent pas toutes, elles rapetissent un peu
  const l = Math.min(largeurMain, (box.clientWidth - 8 * (n + 1)) / Math.max(1, n));
  box.style.setProperty("--main-l", `${Math.max(window.innerWidth <= 640 ? 58 : 60, Math.floor(l))}px`);
  voulus.forEach((el, index) => {
    if (box.children[index] !== el) box.insertBefore(el, box.children[index] || null);
    el._index = index;
    el.style.setProperty("--i", index - (n - 1) / 2);
    basculer(el, ["jouable", "choisie", "materiau"], etatMain(main[index], index));
    indicesMain(el, main[index], index);
  });
}

/** Indices sur une carte de la main : avec combien de vos cartes elle s'associe (✦, doré si c'est une règle de Belline), si elle peut faire évoluer une apparition (⇧). */
function indicesMain(el, id, index) {
  const J = d.joueurs[0];
  const autres = [...J.main.filter((_, k) => k !== index), ...J.monstres.filter(m => m && !m.faceCachee).map(m => m.id), ...J.presages.filter(p => p?.continue).map(p => p.id)].filter(x => x < 100);
  let n = 0, belline = false;
  for (const o of new Set(autres)) {
    if (reglesDeclenchees({ id, choix: 0 }, { id: o, choix: 0 }).length || reglesDeclenchees({ id: o, choix: 0 }, { id, choix: 0 }).length || GRANDS_ACCORDS.some(g => (g.a === id && g.b === o) || (g.a === o && g.b === id))) { n++; belline = true; }
    else if (accordDeLecture(id, o, nomDe)?.sorte && accordDeLecture(id, o, nomDe).sorte !== "lecture") n++;
  }
  const evo = d.actif === 0 && evolutionsPossibles(d, 0).some(e => e.index === index);
  // révélée maintenant, quelle association ferait-elle avec la dernière carte révélée ?
  const prec = J.derniere?.id, suite = prec != null && prec < 100 && prec !== id && id < 100 ? accordDeLecture(prec, id, nomDe) : null;
  const cle = `${n}|${belline}|${evo}|${suite ? suite.cle + suite.sens : ""}`;
  if (el.dataset.indices === cle) return;
  el.dataset.indices = cle;
  el.querySelectorAll(".indice-accord, .indice-evolution").forEach(x => x.remove());
  if (n) { const s = document.createElement("span"); s.className = `indice-accord${belline ? " belline" : ""}`; s.textContent = `✦${n > 1 ? n : ""}`; s.title = `${n} association${n > 1 ? "s" : ""} avec vos cartes${belline ? ", dont une règle de Belline" : ""}`; el.appendChild(s); }
  if (suite && !belline) { const s = document.createElement("span"); s.className = `indice-suite${suite.sens < 0 ? " nefaste" : ""}`; s.textContent = `↔ ${suite.sens < 0 ? "−" : "+"}${suite.valeur}`; s.title = `Révélée maintenant, après ${nomDe(prec)} : ${suite.texte}`; el.appendChild(s); }
  if (evo) { const s = document.createElement("span"); s.className = "indice-evolution"; s.textContent = "⇧"; s.title = "Peut faire évoluer une de vos apparitions"; el.appendChild(s); }
}

const ORDRE_PHASES = ["pioche", "principale1", "combat", "principale2", "fin"];
function majCommandes() {
  const phase = d.fini ? "fin" : d.phase;
  for (const li of $("phases").children) {
    li.classList.toggle("courante", li.dataset.phase === phase);
    li.classList.toggle("passee", ORDRE_PHASES.indexOf(li.dataset.phase) < ORDRE_PHASES.indexOf(phase));
  }
  $("phases").classList.toggle("ombre", d.actif === 1);
  const monTour = d.actif === 0 && !d.fini && !occupe;
  const bc = $("bouton-combat");
  bc.disabled = !monTour || d.tour === 1 || d.phase === "principale2";
  bc.textContent = d.phase === "combat" ? "Fin du combat" : "⚔ Combat (C)";
  $("bouton-fin-tour").disabled = !monTour;
  const f = monTour ? fusionsPossibles(d, 0).length + accordsTerrain(d, 0).length : 0;
  const ba = $("bouton-accord");
  ba.disabled = false; ba.textContent = f ? `✦ Accords (${f})` : "✦ Accords";
  ba.classList.toggle("brille", f > 0);
  const t = monTour ? techniquesPossibles(d, 0).length + superInvocationsPossibles(d, 0).length : 0;
  const bt = $("bouton-technique");
  bt.hidden = !d.mec.techniques;
  bt.textContent = t ? `☉ Technique (${t})` : "☉ Techniques";
  bt.classList.toggle("brille", t > 0);
}

function indication() {
  if (d.fini) return d.gagnant === 0 ? "Victoire !" : "Défaite.";
  if (d.actif !== 0) return `${d.joueurs[1].nom} joue…`;
  if (selection?.type === "sacrifice") return `Choisissez ${selection.requis - selection.choisis.length} apparition${selection.requis - selection.choisis.length > 1 ? "s" : ""} à sacrifier.`;
  if (selection?.type === "attaque") return "Choisissez la cible.";
  if (d.phase === "combat") return d.tour === 1 ? "Pas d’attaque au premier tour." : "Touchez une apparition prête, puis sa cible.";
  return "Invoquez, posez, jouez vos influences ; puis le combat.";
}

// ---------- Détail et actions ----------
function etatMonstre(j, m) {
  const x = def(m.id), a = atkEffectif(d, j, m), df = defEffectif(d, j, m);
  const bonus = [];
  if (a !== m.atk) bonus.push(`affinité et terrain : ${a - m.atk > 0 ? "+" : ""}${a - m.atk} ATK`);
  if (m.atk !== x.atk || m.def !== x.def) bonus.push(`modifiée : ${m.atk - x.atk >= 0 ? "+" : ""}${m.atk - x.atk} ATK, ${m.def - x.def >= 0 ? "+" : ""}${m.def - x.def} DEF`);
  return `${m.faceCachee ? "Face cachée. " : ""}En ${m.position === "attaque" ? "attaque" : "défense"} · ATK ${a} · DEF ${df}${bonus.length ? ` (${bonus.join(" ; ")})` : ""}${m.bloque ? ` · bloquée ${m.bloque}` : ""}`;
}

/** Le panneau suit la carte choisie ; un survol ne l'y montre qu'en passant (`temporaire`), puis on y revient. */
let apercuFixe = null;
function retablirApercu() {
  if (apercuFixe) apercu(...apercuFixe);
  else if (!$("actions").children.length) $("detail").classList.add("vide");
}
function fermerDetail() { apercuFixe = null; $("detail").classList.add("vide"); fermerFeuille(); }
// Sur écran étroit, le panneau est une feuille qui monte du bas : elle s'ouvre quand le joueur touche une carte.
function ouvrirDetail() { $("detail").classList.add("ouvert"); }
function fermerFeuille() { $("detail").classList.remove("ouvert"); }
$("detail-fermer").addEventListener("click", () => { if (selection) annuler(); else fermerFeuille(); });

function apercu(id, face = true, etat = "", temporaire = false) {
  if (id == null) return;
  if (!temporaire) apercuFixe = [id, face, etat];
  const box = $("detail");
  box.classList.remove("vide");
  box.classList.toggle("passager", temporaire);
  const l = etroit() ? (window.innerWidth <= 640 ? 120 : 150) : Math.min(240, box.clientWidth - 24 || 240);
  peindreCarteDuel($("detail-carte"), id, face, l);
  $("detail-carte").style.width = `${l}px`;
  $("detail-carte").classList.toggle("rare", face && estRare(id));
  $("detail-etat").textContent = etat;
  if (!face) { $("detail-notice").textContent = ""; $("detail-mot").textContent = ""; return; }
  if (id >= 200) {
    $("detail-notice").textContent = ASTRES[id].texte;
    $("detail-mot").textContent = `Astre de la série ${ASTRES[id].nom} : trois apparitions de cette planète sacrifiées (invocation céleste, ajout de jeu).`;
  } else if (id >= 100) {
    const F = FIGURES[id];
    $("detail-notice").textContent = `« ${VOISINAGE.find(r => r.id === F.regles[0]).texte} »`;
    $("detail-mot").textContent = `Figure d’accord (création de jeu) : ${F.materiaux.map(m => (Array.isArray(m) ? "une Étoile" : CARTE_PAR_ID[m].nom)).join(" et ")}.`;
  } else {
    $("detail-notice").textContent = `« ${CARTE_PAR_ID[id].notice} »`;
    $("detail-mot").textContent = `Notice de Belline · force tirée du mot « ${DUEL[id].mot} »${estRare(id) ? " · carte rare : vécue dans le Chemin" : ""}.`;
    const lien = document.createElement("a");
    lien.href = "../index.html#/grimoire"; lien.className = "lien-grimoire"; lien.textContent = " Ouvrir sa fiche dans le Grimoire ›";
    lien.addEventListener("click", () => { try { localStorage.setItem("belline.grimoire.open", JSON.stringify(id === 0 ? 53 : id)); } catch { /* rien */ } });
    $("detail-mot").appendChild(lien);
  }
}

function actions(boutons) {
  const z = $("actions");
  z.replaceChildren(...boutons.map(b => {
    const el = document.createElement("button");
    el.textContent = b.label;
    if (b.desactive) { el.disabled = true; el.title = b.desactive; }
    if (b.classe) el.className = b.classe;
    el.addEventListener("click", b.action);
    return el;
  }));
  z.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
}

function annuler() { selection = null; actions([]); cacherFleche(); fermerDetail(); if (d) rendre(); }

function choisirMain(index) {
  if (occupe || !d || d.fini) return;
  const id = d.joueurs[0].main[index];
  if (id == null) return;
  if (selection?.type === "main" && selection.index === index) return annuler();
  const x = def(id);
  selection = { type: "main", index };
  apercu(id); ouvrirDetail();
  if (d.actif !== 0) { actions([]); rendre(); return; }
  if (x.type === "apparition") {
    const v1 = peutInvoquer(d, 0, index), v2 = peutInvoquer(d, 0, index, true);
    const s = v1.sacrifices ?? sacrificesRequis(id), off = v1.offrande || 0;
    const cout = [s ? `${s} sacrifice${s > 1 ? "s" : ""}` : "", off ? `offrande ${off * 1500} points` : ""].filter(Boolean).join(" + ");
    actions([
      { label: `Invoquer en attaque${cout ? ` (${cout})` : ""}`, desactive: v1.ok ? null : v1.raison, action: () => preparerInvocation(index, false) },
      { label: "Poser face cachée", desactive: v2.ok ? null : v2.raison, action: () => preparerInvocation(index, true) },
      ...evolutionsPossibles(d, 0).filter(e => e.index === index).map(e => ({ label: `⇧ Faire évoluer ${nomDe(e.de)}`, action: () => executerEvolution(index, e.place), classe: "evolution-bouton" }))
    ]);
  } else if (x.type === "influence") {
    const v = peutActiver(d, 0, index);
    const vp = peutPoserInfluence(d, 0, index);
    actions([...(x.choix ? x.choix.map((ch, c) => ({ label: `Activer : ${ch.label}`, desactive: v.ok ? null : v.raison, action: () => jouerInfluence(index, c) }))
      : [{ label: x.sousType === "equipement" ? "Équiper" : x.sousType === "terrain" ? (d.joueurs[0].terrainCarte != null ? "Poser le terrain (casse l’actuel)" : "Poser le terrain") : "Activer", desactive: v.ok ? null : v.raison, action: () => jouerInfluence(index, null) }]),
      { label: "Poser face cachée", desactive: vp.ok ? null : vp.raison, action: () => poserCachee(index), classe: "discret-fonce" }]);
  } else {
    const v = peutPoser(d, 0, index);
    actions([{ label: "Poser le présage", desactive: v.ok ? null : v.raison, action: () => jouerPresage(index) }]);
  }
  rendre();
}

function preparerInvocation(index, pose) {
  const s = peutInvoquer(d, 0, index, pose).sacrifices ?? sacrificesRequis(d.joueurs[0].main[index]);
  if (!s) return executerInvocation(index, pose, []);
  selection = { type: "sacrifice", index, pose, requis: s, choisis: [] };
  actions([{ label: "Annuler", action: annuler, classe: "discret-fonce" }]);
  rendre();
}

function cliquerZone(j, place) {
  if (occupe || !d || d.fini) return;
  const m = d.joueurs[j].monstres[place];
  if (selection?.type === "sacrifice") {
    if (j !== 0 || !m) return;
    const s = selection;
    s.choisis = s.choisis.includes(place) ? s.choisis.filter(p => p !== place) : [...s.choisis, place];
    if (s.choisis.length >= s.requis) { const { index, pose, choisis } = s; return executerInvocation(index, pose, choisis); }
    return rendre();
  }
  if (selection?.type === "attaque" && j === 1 && m && ciblesAttaque(d, 0, selection.place).includes(place)) return executerAttaque(selection.place, place);
  if (!m) return;
  ouvrirDetail();
  if (j === 1) {
    apercu(m.id, !m.faceCachee, m.faceCachee ? "Apparition face cachée, en défense." : etatMonstre(1, m));
    if (selection?.type !== "attaque") { selection = null; actions([]); }
    return rendre();
  }
  apercu(m.id, true, etatMonstre(0, m));
  const liste = [];
  if (d.actif === 0 && d.phase === "combat") {
    const cibles = ciblesAttaque(d, 0, place);
    if (cibles.length) {
      selection = { type: "attaque", place };
      if (cibles.includes("direct")) liste.push({ label: "⚔ Attaque directe", action: () => executerAttaque(place, "direct") });
      liste.push({ label: "Annuler", action: annuler, classe: "discret-fonce" });
      actions(liste);
      return rendre();
    }
  }
  selection = { type: "terrain", place };
  const v = peutChanger(d, 0, place);
  liste.push({ label: m.faceCachee ? "Retourner (en attaque)" : m.position === "attaque" ? "Passer en défense" : "Passer en attaque", desactive: v.ok ? null : v.raison, action: () => executerPosition(place) });
  actions(liste);
  rendre();
}

// ---------- Coups du joueur ----------
async function apresInvocation(ev, k) {
  // le défenseur k peut répondre par un présage à une invocation
  const inv = ev.find(e => e.type === "invocation" && e.j !== k);
  if (!inv || d.fini) return;
  if (k === 1) {
    const r = presageOmbre(d, 1, "invocation", { place: inv.place });
    if (r != null) await animer(reagirInvocation(d, 1, r, inv.place), true);
  } else {
    const dispo = presagesActivables(d, 0, "invocation");
    if (!dispo.length) return;
    const m = d.joueurs[1].monstres[inv.place];
    const r = await demanderReaction(dispo, `${d.joueurs[1].nom} invoque ${nomDe(inv.id)} (ATK ${atkEffectif(d, 1, m)}, DEF ${defEffectif(d, 1, m)}).`);
    if (r != null) await animer(reagirInvocation(d, 0, r, inv.place), true);
  }
}

async function executerInvocation(index, pose, sacrifices) {
  const id = d.joueurs[0].main[index];
  selection = null; actions([]);
  const ev = invoquer(d, 0, index, { pose, sacrifices }, rng);
  noterVue(carnet, id); sauverCarnet(carnet);
  await animer(ev, true);
  await apresInvocation(ev, 1);
  finAction();
}

async function jouerInfluence(index, choix) {
  const id = d.joueurs[0].main[index];
  selection = null; actions([]);
  noterVue(carnet, id); sauverCarnet(carnet);
  const contre = presageOmbre(d, 1, "influence", { index, choix });
  await animer(activer(d, 0, index, { choix, contre }, rng));
  finAction();
}

async function poserCachee(index) { selection = null; actions([]); await animer(poserInfluence(d, 0, index)); finAction(); }
async function revelerPosee(place, choix) {
  const id = d.joueurs[0].presages[place]?.id;
  if (id == null) return;
  selection = null; actions([]);
  noterVue(carnet, id); sauverCarnet(carnet);
  const contre = presageOmbre(d, 1, "influence", { revelee: true, place, choix });
  await animer(revelerInfluence(d, 0, place, { choix, contre }, rng));
  finAction();
}
async function executerCeleste(famille) {
  fermerGalerie();
  await animer(superInvoquer(d, 0, famille, rng), true);
  finAction();
}

async function executerTechnique(cle) {
  fermerGalerie();
  await animer(utiliserTechnique(d, 0, cle, rng), true);
  finAction();
}

/** Les techniques : celles qui sont prêtes, puis le codex des associations avec leur avancement. */
function ouvrirTechniques() {
  if (!d) return;
  const pretes = d.actif === 0 && !occupe ? techniquesPossibles(d, 0) : [];
  const J = d.joueurs[0];
  $("galerie-titre").textContent = "Techniques";
  $("galerie-texte").textContent = "Ajouts de jeu. Une technique par tour, en phase principale. Alignement : trois apparitions face recto d’une même planète. Association : des cartes révélées pendant le duel, comme les cartes d’un tirage qui se répondent ; chacune sert une fois.";
  const item = itemPanneau;
  const liste = [];
  // l'invocation céleste : trois apparitions d'une planète deviennent l'astre lui-même
  const celestes = d.actif === 0 && !occupe ? superInvocationsPossibles(d, 0) : [];
  for (const c of celestes) liste.push(item(`★ Invocation céleste : ${ASTRES[c.id].nom}`, ASTRES[c.id].texte,
    `Prête : ${[...c.places.map(p => nomDe(J.monstres[p].id)), ...(c.main != null ? [`${nomDe(J.main[c.main])} (main)`] : [])].join(", ")} sont sacrifiées. Touchez pour invoquer.`, () => executerCeleste(c.famille), "prete celeste"));
  if (d.mec.superInvocations && !celestes.length) liste.push(item("★ Invocation céleste", "Réunissez trois cartes d’une même planète : deux apparitions face recto en jeu, et une troisième en jeu ou dans la main. Sacrifiez-les pour invoquer l’astre (niveau 10). Chaque astre une fois par duel.", J.astres.length ? `Déjà invoqués : ${J.astres.map(f => ASTRES[Object.keys(ASTRES).find(k => ASTRES[k].famille === f)].nom).join(", ")}.` : "", null, "vide"));
  for (const t of pretes) liste.push(item(`${t.sorte === "alignement" || t.sorte === "appel" ? t.glyphe : "✦"} ${t.nom}`, t.texte, "Prête : touchez pour l’utiliser", () => executerTechnique(t.cle), "prete"));
  if (!pretes.length) liste.push(item("Aucune technique prête", d.actif === 0 && J.techniqueFaite ? "Vous avez déjà utilisé une technique ce tour." : "Alignez trois apparitions d’une même planète, ou révélez les cartes d’une association.", "", null, "vide"));
  for (const [f, a] of Object.entries(ALIGNEMENTS)) {
    const n = J.monstres.filter(m => m && !m.faceCachee && m.id < 100 && CARTE_PAR_ID[m.id].famille === f).length;
    if (!pretes.some(t => t.cle === `alignement:${f}`)) liste.push(item(`${a.glyphe} ${a.nom}`, a.texte, `Alignement : ${n} sur 3 apparitions`, null, "codex"));
  }
  for (const a of ASSOCIATIONS) {
    if (pretes.some(t => t.cle === `association:${a.id}`)) continue;
    const [n, requis] = avancementAssociation(J, a);
    const faite = J.techniques.includes(a.id);
    const quoi = a.cartes ? a.cartes.map(id => `${J.reveles.includes(id) ? "✓ " : ""}${CARTE_PAR_ID[id].nom}`).join(", ") : "une carte de chaque planète";
    liste.push(item(`✦ ${a.nom}`, a.texte, faite ? "Déjà utilisée dans ce duel" : `${n} sur ${requis} révélées (${quoi})`, null, faite ? "codex faite" : "codex"));
  }
  $("galerie-cartes").replaceChildren(...liste);
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
$("bouton-technique").addEventListener("click", ouvrirTechniques);

async function executerEvolution(index, place) {
  selection = null; actions([]);
  noterVue(carnet, d.joueurs[0].main[index]); sauverCarnet(carnet);
  await animer(evoluer(d, 0, index, place, rng), true);
  finAction();
}

async function jouerPresage(index) { selection = null; actions([]); await animer(poser(d, 0, index)); finAction(); }
async function executerPosition(place) { selection = null; actions([]); await animer(changerPosition(d, 0, place, rng)); finAction(); }

async function executerAttaque(place, cible) {
  selection = null; actions([]);
  const magie = influenceOmbre(d, 1, { place, cible });
  if (magie) {
    await animer(magie.main != null ? poserTerrainEnReponse(d, 1, magie.main, rng) : revelerEnReponse(d, 1, magie.place, { choix: magie.choix }, rng), true);
    if (d.fini || !ciblesAttaque(d, 0, place).includes(cible)) { journal("Votre attaque n’a plus lieu."); finAction(); return; }
  }
  const p = presageOmbre(d, 1, "attaque", { place, cible });
  await animer(attaquer(d, 0, place, cible, rng, p));
  finAction();
}

async function executerAccordTerrain(cle) {
  fermerGalerie();
  await animer(accomplirAccordTerrain(d, 0, cle), true);
  finAction();
}

async function executerFusion(figure) {
  fermerGalerie();
  const ev = fusionner(d, 0, figure, rng);
  await animer(ev, true);
  await apresInvocation(ev, 1);
  finAction();
}

function finAction() { occupe = false; cacherFleche(); rendre(); if (d.fini) terminer(); else enregistrer(); }

// ---------- Enregistrement du duel en cours ----------
// Le duel est gardé dans le navigateur après chaque coup : si l'on quitte l'application, il reprend là où il était
// (même hasard, même tour). Il est effacé à la fin du duel.
const CLE_DUEL = "chemin-du-mage.duel-en-cours";
function enregistrer() {
  if (!d || !partie || partie.demo || d.fini) return;
  try {
    const lignes = [...$("journal").children].slice(0, 40).map(li => [li.textContent, li.className]);
    localStorage.setItem(CLE_DUEL, JSON.stringify({ version: 1, d, partie, hasard: rng.etat(), accordsDuDuel, moments, lignes, quand: Date.now() }));
  } catch { /* stockage plein ou bloqué : le duel continue sans sauvegarde */ }
}
function effacerEnregistrement() { try { localStorage.removeItem(CLE_DUEL); } catch { /* rien */ } }
function lireEnregistrement() {
  try { const s = JSON.parse(localStorage.getItem(CLE_DUEL) || "null"); return s?.version === 1 && s.d && !s.d.fini ? s : null; } catch { return null; }
}
async function reprendre() {
  const s = lireEnregistrement();
  if (!s) return;
  d = preparerReprise(s.d); partie = s.partie; rng = reprendreHasard(s.hasard); accordsDuDuel = s.accordsDuDuel || []; moments = { ...momentsVides(), ...(s.moments || {}) };
  selection = null; occupe = false;
  lpAffiche[0] = d.joueurs[0].lp; lpAffiche[1] = d.joueurs[1].lp;
  $("journal").replaceChildren(...(s.lignes || []).map(([t, c]) => { const li = document.createElement("li"); li.textContent = t; if (c) li.className = c; return li; }));
  journal("· Le duel reprend ·", true);
  $("numero-duel").textContent = `Duel n° ${partie.graine}`;
  for (const e of ["accueil-duel", "fin-duel", "atelier"]) $(e).classList.remove("visible");
  $("detail").classList.add("vide"); actions([]);
  rendre(); ajusterTaille();
  banniere("Le duel reprend", `Tour ${d.tour}`);
  if (d.actif === 1) {
    occupe = true;
    await attendre(900);
    await tourAdverse();
    occupe = false; rendre();
    if (d.fini) terminer(); else enregistrer();
  }
}
// en quittant l'application (onglet caché, téléphone mis en veille), on enregistre aussi
document.addEventListener("visibilitychange", () => { if (document.hidden && !occupe) enregistrer(); });
window.addEventListener("pagehide", () => { if (!occupe) enregistrer(); });

/**
 * Le panneau des accords : les figures invocables maintenant (touchez pour invoquer), puis toutes les figures de la
 * réserve avec leurs deux cartes, cochées quand vous les avez en main ou sur le terrain.
 */
function ouvrirAccords() {
  if (!d) return;
  const J = d.joueurs[0];
  const options = d.actif === 0 && !occupe ? fusionsPossibles(d, 0) : [];
  const dispo = new Set([...J.main, ...J.monstres.filter(Boolean).map(m => m.id)]);
  $("galerie-titre").textContent = "Accords de Belline";
  $("galerie-texte").textContent = "Deux cartes associées (règle de Belline, écho de la notice, accompagnement ou lecture moderne) accomplissent un accord quand elles sont toutes deux face visible sur votre terrain (touchez-le ici, un par tour), ou quand vous les révélez l’une après l’autre. Les deux cartes d’une règle de Belline peuvent aussi former une figure d’accord : elles vont au cimetière et la figure apparaît (une par tour).";
  const item = itemPanneau;
  const surTerrain = d.actif === 0 && !occupe ? accordsTerrain(d, 0) : [];
  const titreSorte = s => ({ belline: "Règle de Belline", echo: "Écho de la notice", accompagnement: "Accord d’accompagnement", lecture: "Lecture moderne" }[s]);
  const liste = surTerrain.map(t => item(`${t.favorable ? "✦" : "☍"} Sur le terrain : ${titreSorte(t.sorte)}`, t.texte,
    `${nomDe(t.a)} et ${nomDe(t.b)} sont en jeu : touchez pour accomplir l’accord (${t.valeur} points${t.favorable ? "" : " de dégâts à l’adversaire"}).`, () => executerAccordTerrain(t.cle), "prete"));
  if (d.actif === 0 && J.accordTerrainFait) liste.push(item("Accord de terrain déjà accompli ce tour", "Un accord de terrain par tour ; chaque paire ne sert qu’une fois par duel.", "", null, "vide"));
  liste.push(...options.map(o => item(`✦ ${FIGURES[o.figure].nom}`, FIGURES[o.figure].texte,
    `Prête : ${o.materiaux.map(m => `${nomDe(m.id)} (${m.ou === "main" ? "main" : "terrain"})`).join(" + ")}. Touchez pour l’invoquer.`, () => executerFusion(o.figure), "prete")));
  if (!options.length) liste.push(item("Aucune figure prête", d.actif !== 0 ? "Les figures s’invoquent pendant votre phase principale." : J.fusionFaite ? "Vous avez déjà invoqué une figure ce tour." : "Il vous manque une des deux cartes de chaque règle. Voici ce qu’il faut réunir.", "", null, "vide"));
  // les accords à révéler avec les cartes que vous avez (main et terrain) : révélez l'une puis l'autre
  const ids = [...new Set([...J.main, ...J.monstres.filter(Boolean).map(m => m.id), ...J.presages.filter(Boolean).map(p => p.id)])].filter(id => id < 100);
  const aReveler = [];
  for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) {
    const r = reglesDeclenchees({ id: ids[x], choix: 0 }, { id: ids[y], choix: 0 })[0] || reglesDeclenchees({ id: ids[y], choix: 0 }, { id: ids[x], choix: 0 })[0];
    if (r) { aReveler.push(item(`☙ Règle de Belline`, r.texte, "Posez-les toutes deux en jeu (ou révélez l’une puis l’autre) : 1000 points et le sort de la règle.", null, "proche")); continue; }
    const a = accordDeLecture(ids[x], ids[y], nomDe);
    if (a) aReveler.push(item(`${a.sens > 0 ? "✦" : "☍"} ${{ echo: "Écho de la notice", accompagnement: "Accord d’accompagnement", lecture: "Lecture moderne" }[a.sorte]}`, a.texte, `Posez-les toutes deux en jeu (ou révélez l’une puis l’autre) : ${a.valeur} points.`, null, a.sorte === "lecture" ? "codex" : "proche"));
  }
  liste.push(item("Accords à former avec vos cartes", aReveler.length ? `${aReveler.length} association${aReveler.length > 1 ? "s" : ""} possible${aReveler.length > 1 ? "s" : ""} entre vos cartes en main et en jeu.` : "Aucune de vos cartes ne s’associe pour l’instant.", "", null, "vide"), ...aReveler);
  const nomMat = m => (Array.isArray(m) ? "une Étoile" : nomDe(m));
  const aMat = m => (Array.isArray(m) ? m.some(x => dispo.has(x)) : dispo.has(m));
  const reste = J.reserve.filter(f => !options.some(o => o.figure === f))
    .sort((a, b) => FIGURES[b].materiaux.filter(aMat).length - FIGURES[a].materiaux.filter(aMat).length);
  for (const f of reste) {
    const F = FIGURES[f], n = F.materiaux.filter(aMat).length;
    liste.push(item(`${F.favorable ? "✦" : "☍"} ${F.nom}`, F.texte, `${F.materiaux.map(m => `${aMat(m) ? "✓ " : ""}${nomMat(m)}`).join(" + ")} · ${n} sur 2`, null, n ? "codex proche" : "codex"));
  }
  $("galerie-cartes").replaceChildren(...liste);
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
$("bouton-accord").addEventListener("click", ouvrirAccords);

$("bouton-combat").addEventListener("click", async () => {
  if (occupe || d.actif !== 0) return;
  selection = null; actions([]);
  await animer(d.phase === "combat" ? passerPrincipale2(d) : passerAuCombat(d));
  finAction();
});
$("lp-1").addEventListener("click", () => { if (selection?.type === "attaque" && ciblesAttaque(d, 0, selection.place).includes("direct")) executerAttaque(selection.place, "direct"); });

// ---------- Tour de l'adversaire ----------
async function tourAdverse() {
  occupe = true;
  for (let pas = 0; pas < 40 && !d.fini && d.actif === 1; pas++) {
    const a = actionOmbre(d, d.joueurs[1].profil, rng);
    if (a.type === "fin" || a.type === "rien") break;
    let reponse = null;
    if (a.type === "attaquer") {
      // vos réponses : un présage, ou une influence posée (révélée avant le choc) ; puis encore un présage si vous voulez
      for (let tour = 0; tour < 3 && !d.fini; tour++) {
        const dispo = presagesActivables(d, 0, "attaque"), magies = influencesEnReponse(d, 0), lieux = terrainsEnReponse(d, 0);
        if (!dispo.length && !magies.length && !lieux.length) break;
        if (!ciblesAttaque(d, 1, a.place).includes(a.cible)) break;
        montrerFleche(zoneEl(1, a.place), a.cible === "direct" ? $("lp-0") : zoneEl(0, a.cible));
        const r = await demanderReaction(dispo, attaqueTexte(a), magies, lieux);
        if (r && typeof r === "object" && r.main != null) { await animer(poserTerrainEnReponse(d, 0, r.main, rng), true); continue; }
        if (r && typeof r === "object") { await animer(revelerEnReponse(d, 0, r.influence, { choix: r.choix }, rng), true); continue; }
        reponse = r; break;
      }
      if (d.fini) break;
      if (!ciblesAttaque(d, 1, a.place).includes(a.cible)) { journal("L’attaque n’a plus lieu."); await attendre(300); continue; }
    }
    if (a.type === "activer" || a.type === "revelerInfluence") {
      const dispo = presagesActivables(d, 0, "influence");
      const id = a.type === "activer" ? d.joueurs[1].main[a.index] : d.joueurs[1].presages[a.place]?.id;
      if (dispo.length && id != null) reponse = await demanderReaction(dispo, `${d.joueurs[1].nom} ${a.type === "activer" ? "active" : "révèle"} ${nomDe(id)}. Répondre par une chaîne ?`);
    }
    if (partie?.apprenti) expliquer(a);
    const ev = executerOmbre(d, a, rng, reponse);
    if (ev.length === 1 && ev[0].type === "refus") break;
    await animer(ev, true);
    if (a.type === "invoquer" || a.type === "fusionner") await apresInvocation(ev, 0);
    enregistrer();
    await attendre(320);
  }
  if (!d.fini) await animer(finTour(d, rng), true);
}

/** Mode apprenti : l'Ombre dit ce qu'elle fait, et pourquoi (sa valeur estimée du coup). */
function expliquer(a) {
  const O = d.joueurs[1], c = a.index != null ? O.main[a.index] : null;
  const gain = a.v != null && Math.round(a.v) > 0 ? ` : j’estime ce coup à +${Math.round(a.v)}` : "";
  const t = {
    invoquer: c != null && `J’invoque ${nomDe(c)}${a.pose ? " face cachée, pour me défendre" : ""}${gain}.`,
    activer: c != null && (def(c).sousType === "terrain" ? `Je pose le terrain ${nomDe(c)} de mon côté${gain}.` : `J’active ${nomDe(c)}${gain}.`),
    poser: "Je pose un présage : il pourra répondre à votre prochain coup.",
    poserInfluence: "Je pose une carte face cachée : vous ne saurez pas si c’est un présage.",
    revelerInfluence: `Je révèle mon influence posée${gain}.`,
    fusionner: `J’unis deux cartes que la notice associe : ${FIGURES[a.figure]?.nom}${gain}.`,
    technique: `J’utilise une technique${gain}.`,
    accordTerrain: `Deux de mes cartes en jeu s’associent : j’accomplis l’accord${gain}.`,
    evoluer: c != null && `Je fais évoluer une apparition en ${nomDe(c)}${gain}.`,
    superInvoquer: `Je sacrifie trois apparitions de ma planète : l’astre descend${gain}.`,
    attaquer: `J’attaque${a.cible === "direct" ? " directement vos points de vie" : ""}${gain}.`,
    changer: "Je change la position d’une apparition.",
    combat: "J’entre en combat.", principale2: "Je termine le combat."
  }[a.type];
  if (t) { journal(`L’Ombre : « ${t} »`); $("journal").firstChild?.classList.add("ombre-pense"); }
}

async function finDeTour() {
  if (occupe || d.fini || d.actif !== 0) return;
  selection = null; actions([]);
  occupe = true;
  await animer(finTour(d, rng), true);
  enregistrer();
  if (!d.fini) await tourAdverse();
  occupe = false;
  rendre();
  if (d.fini) terminer(); else enregistrer();
}
$("bouton-fin-tour").addEventListener("click", finDeTour);

function attaqueTexte(a) {
  const A = d.joueurs[1].monstres[a.place];
  const T = a.cible === "direct" ? null : d.joueurs[0].monstres[a.cible];
  const cible = !T ? "vos points de vie" : `votre ${T.faceCachee ? "apparition face cachée" : nomDe(T.id)}`;
  return `${d.joueurs[1].nom} attaque ${cible} avec ${nomDe(A.id)} (ATK ${atkEffectif(d, 1, A)}).`;
}

/** Le joueur peut répondre par un présage. Résout l'emplacement choisi, ou null. */
/**
 * Le joueur peut répondre : par un présage (`places`), ou par une influence posée face cachée (`influences`,
 * comme une magie jeu-rapide). Résout l'emplacement du présage choisi, { influence: place, choix }, ou null.
 */
function demanderReaction(places, texte, influences = [], terrainsMain = []) {
  return new Promise(resolve => {
    $("reaction-titre").textContent = (influences.length || terrainsMain.length) && !places.length ? "Une réponse ?" : "Un présage ?";
    $("reaction-texte").textContent = texte;
    const zone = $("reaction-cartes");
    const carte = (id, legende, valeur) => {
      const b = document.createElement("button");
      b.className = "reaction-carte";
      b.appendChild(enveloppe(carteCanvas(id, true, 150), id, true));
      const s = document.createElement("span"); s.textContent = legende; b.appendChild(s);
      b.addEventListener("click", () => { $("reaction").classList.remove("visible"); cacherFleche(); resolve(valeur); });
      return b;
    };
    zone.replaceChildren(
      ...places.map(place => { const id = d.joueurs[0].presages[place].id; return carte(id, `Présage : ${nomDe(id)}`, place); }),
      ...influences.flatMap(place => {
        const id = d.joueurs[0].presages[place].id, x = def(id);
        return x.choix ? x.choix.map((ch, c) => carte(id, `Révéler ${nomDe(id)} : ${ch.label}`, { influence: place, choix: c }))
          : [carte(id, `Révéler ${nomDe(id)}`, { influence: place, choix: null })];
      }),
      ...terrainsMain.map(index => { const id = d.joueurs[0].main[index]; return carte(id, `Poser le terrain ${nomDe(id)}`, { main: index }); }));
    $("reaction-non").onclick = () => { $("reaction").classList.remove("visible"); cacherFleche(); resolve(null); };
    $("reaction").classList.add("visible");
    jouerSon("choix");
    zone.querySelector("button")?.focus();
  });
}

// ---------- Galerie (cimetières, réserves, accords) ----------
function galerie(titre, texte, cartes) {
  $("galerie-titre").textContent = titre;
  $("galerie-texte").textContent = texte;
  $("galerie-cartes").replaceChildren(...(cartes.length ? cartes.map(c => {
    const b = document.createElement(c.action ? "button" : "div");
    b.className = "galerie-carte";
    b.appendChild(enveloppe(carteCanvas(c.id, c.face !== false, 120), c.id, c.face !== false));
    if (c.legende) { const s = document.createElement("span"); s.textContent = c.legende; b.appendChild(s); }
    if (c.action) b.addEventListener("click", c.action);
    else b.addEventListener("click", () => { apercu(c.id, c.face !== false); ouvrirDetail(); });
    return b;
  }) : [Object.assign(document.createElement("p"), { textContent: "Rien pour l’instant.", className: "petit" })]));
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
function fermerGalerie() { $("galerie").classList.remove("visible"); }
$("galerie-fermer").addEventListener("click", fermerGalerie);
for (const j of [0, 1]) {
  $(`cimetiere-${j}`).addEventListener("click", () => { if (d) galerie(j === 0 ? "Votre cimetière" : `Cimetière : ${d.joueurs[1].nom}`, `${d.joueurs[j].cimetiere.length} carte${d.joueurs[j].cimetiere.length > 1 ? "s" : ""}, de la plus ancienne à la plus récente.`, d.joueurs[j].cimetiere.map(id => ({ id }))); });
  $(`reserve-${j}`).addEventListener("click", () => { if (d) galerie(j === 0 ? "Votre réserve" : `Réserve : ${d.joueurs[1].nom}`, "Les figures d’accord disponibles.", d.joueurs[j].reserve.map(id => ({ id, face: j === 0 }))); });
}

// ---------- Flèche d'attaque et calcul ----------
function centre(el) {
  const r = el.getBoundingClientRect(), b = $("plateau").getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
}
function tracer(de, vers) {
  const mx = (de.x + vers.x) / 2, my = Math.min(de.y, vers.y) - 60;
  $("fleche-trait").setAttribute("d", `M${de.x},${de.y} Q${mx},${my} ${vers.x},${vers.y}`);
  $("fleche").classList.add("visible");
}
function montrerFleche(de, vers) { if (de && vers) tracer(centre(de), centre(vers)); }
function cacherFleche() { $("fleche").classList.remove("visible"); $("calcul").classList.remove("visible"); }
$("plateau").addEventListener("pointermove", e => {
  if (selection?.type !== "attaque") return;
  const de = zoneEl(0, selection.place);
  if (!de) return;
  const b = $("plateau").getBoundingClientRect();
  const sur = e.target.closest?.(".zone.ciblable, .points-vie.ciblable");
  const vers = sur ? centre(sur) : { x: e.clientX - b.left, y: e.clientY - b.top };
  tracer(centre(de), vers);
  if (sur) {
    const cible = sur.classList.contains("points-vie") ? "direct" : +sur.dataset.place;
    montrerCalcul(calculCombat(d, 0, selection.place, cible), false);
  } else $("calcul").classList.remove("visible");
});
function montrerCalcul(c, fort = true) {
  if (!c) return;
  const el = $("calcul");
  const bas = c.position === "direct" ? "<b>Attaque directe</b>" : c.valeur == null ? "<span>contre une carte cachée</span>" : `<span>${c.contre} ${c.valeur}</span>`;
  const diff = c.position === "direct" ? `−${c.atk}` : c.valeur == null ? "?" : c.atk > c.valeur ? (c.position === "attaque" ? `−${c.atk - c.valeur}` : "détruite") : c.atk < c.valeur ? `${c.position === "attaque" ? "détruit" : "riposte"} −${c.valeur - c.atk}` : "égalité";
  el.innerHTML = `<span class="calc-atk">ATK ${c.atk}</span><span class="calc-contre">⚔</span>${bas}<em>${diff}</em>${c.avantage ? "<span class='calc-avantage'>▲ planète dominée +500</span>" : c.desavantage ? "<span class='calc-avantage' style='color:#ff8a7a'>▼ planète qui vous domine</span>" : ""}`;
  el.classList.toggle("fort", fort);
  el.classList.add("visible");
}

// ---------- Animations ----------
const zoneEl = (j, place, sorte = "monstres") => document.querySelector(`#${sorte}-${j} .zone[data-place="${place}"]`);

function allerLP(j, cible) {
  const el = $(`lp-val-${j}`), jauge = $(`lp-jauge-${j}`);
  const depart = lpAffiche[j];
  jauge.style.width = `${Math.max(0, Math.min(100, cible / LP * 100))}%`;
  const trainee = $(`lp-trainee-${j}`);
  if (trainee) trainee.style.width = `${Math.max(0, Math.min(100, cible / LP * 100))}%`;
  jauge.parentElement.classList.toggle("critique", cible <= 2000);
  jauge.parentElement.classList.toggle("deborde", cible > LP);
  if (depart === cible) { el.textContent = cible; return; }
  lpAffiche[j] = cible;
  const t0 = performance.now(), duree = reduit ? 1 : 700;
  const pas = t => {
    const k = Math.min(1, (t - t0) / duree);
    el.textContent = Math.round(depart + (cible - depart) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

function flotter(el, texte, classe, duree = 1500) {
  if (!el) return;
  const c = centre(el);
  const f = document.createElement("span");
  f.className = `flottant ${classe}`; f.textContent = texte;
  f.style.left = `${c.x}px`; f.style.top = `${c.y - 20}px`;
  if (duree !== 1500) f.style.animationDuration = `${duree}ms`;
  $("plateau").appendChild(f);
  setTimeout(() => f.remove(), duree);
}

function eclats(el, couleur, n = 18) {
  if (!el || reduit) return;
  const c = centre(el);
  for (let k = 0; k < n; k++) {
    const p = document.createElement("span");
    p.className = "eclat";
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
    p.style.left = `${c.x}px`; p.style.top = `${c.y}px`;
    p.style.setProperty("--x", `${Math.cos(a) * v}px`); p.style.setProperty("--y", `${Math.sin(a) * v}px`);
    p.style.background = couleur; p.style.color = couleur;
    $("plateau").appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

function eclair(couleur) {
  const e = $("eclair");
  e.style.background = couleur;
  e.classList.remove("visible"); void e.offsetWidth; e.classList.add("visible");
}

function secousse(fort = false) {
  if (reduit) return;
  const p = $("plateau");
  p.classList.remove("secoue", "secoue-fort"); void p.offsetWidth; p.classList.add(fort ? "secoue-fort" : "secoue");
}

/**
 * Un encart : ce qui vient de se passer d'important (accord, sort, évolution, technique…), avec ses cartes, qui reste
 * le temps d'être lu (plus longtemps en vitesse lente) ; toucher une carte l'agrandit, toucher l'encart le ferme.
 */
function encart(titre, texte, ids = [], classe = "", duree = 8000) {
  const box = $("encarts");
  const el = document.createElement("div");
  el.className = `encart ${classe}`;
  const cartes = document.createElement("div"); cartes.className = "encart-cartes";
  for (const id of ids.filter(x => x != null)) {
    const b = document.createElement("button"); b.className = "encart-carte"; b.setAttribute("aria-label", `Agrandir ${nomDe(id)}`);
    b.appendChild(carteCanvas(id, true, 52, "", "compacte"));
    b.addEventListener("click", ev => { ev.stopPropagation(); zoomer(id); });
    cartes.appendChild(b);
  }
  const corps = document.createElement("div"); corps.className = "encart-corps";
  corps.innerHTML = "<b></b><span></span>";
  corps.querySelector("b").textContent = titre; corps.querySelector("span").textContent = texte;
  el.append(cartes, corps);
  const fermer = () => { el.classList.add("part"); setTimeout(() => el.remove(), 300); };
  el.addEventListener("click", fermer);
  box.append(el);
  while (box.children.length > 3) box.firstChild.remove();
  [...box.children].forEach((x, k, t) => x.classList.toggle("replie", k < t.length - 1));
  setTimeout(fermer, duree * facteur());
}

/** La carte en grand, avec son effet et sa notice ; toucher pour fermer. */
function zoomer(id, face = true) {
  if (id == null) return;
  const z = $("zoom");
  const l = Math.min(420, window.innerWidth * 0.86, (window.innerHeight * 0.6) * 150 / 219);
  peindreCarteDuel($("zoom-carte"), id, face, l);
  $("zoom-carte").style.width = `${l}px`;
  if (face) {
    $("zoom-effet").textContent = def(id).texte || "";
    $("zoom-notice").textContent = id >= 200 ? "Invocation céleste : trois apparitions de sa planète, sacrifiées." : id >= 100 ? `« ${VOISINAGE.find(r => r.id === FIGURES[id].regles[0]).texte} »` : `« ${CARTE_PAR_ID[id].notice} »`;
    $("zoom-mot").textContent = id >= 200 ? `Astre · ${ASTRES[id].nom}` : id >= 100 ? "Figure d’accord" : `N° ${id} · ${CARTE_PAR_ID[id].nom} · mot de la notice : « ${DUEL[id].mot} »`;
  } else { $("zoom-effet").textContent = "Carte face cachée."; $("zoom-notice").textContent = ""; $("zoom-mot").textContent = ""; }
  z.hidden = false; cacherLoupe();
}
$("zoom").addEventListener("click", () => { $("zoom").hidden = true; });
$("detail-carte").addEventListener("click", () => { if (apercuFixe) zoomer(apercuFixe[0], apercuFixe[1]); });
$("detail-zoom").addEventListener("click", () => { if (apercuFixe) zoomer(apercuFixe[0], apercuFixe[1]); });

function banniere(titre, texte, classe = "") {
  const b = $("banniere");
  b.className = `banniere ${classe}`;
  b.innerHTML = `<b>${esc(titre)}</b>${texte ? `<span>${esc(texte)}</span>` : ""}`;
  void b.offsetWidth; b.classList.add("visible");
}

async function carteAuCentre(ids, classe) {
  const z = $("carte-centre");
  z.className = `carte-centre ${classe}`;
  z.replaceChildren(...[].concat(ids).map(id => enveloppe(carteCanvas(id, true, 180), id, true)));
  void z.offsetWidth; z.classList.add("visible");
  await attendre(1200);
}

const nom = j => (j === 0 ? "Vous" : d.joueurs[1].nom);
const accorde = (j, vous, lui) => (j === 0 ? vous : lui);
function journal(texte, important = false) {
  const li = document.createElement("li");
  li.textContent = texte; if (important) li.className = "important";
  $("journal").prepend(li);
  while ($("journal").children.length > 80) $("journal").lastChild.remove();
  $("annonce").textContent = texte;
}

async function animer(ev, garderOccupe = false) {
  occupe = true;
  fermerFeuille(); cacherLoupe();
  majCommandes();
  for (const e of ev) {
    const c = e.id != null ? nomDe(e.id) : "";
    noterMoment(e);
    switch (e.type) {
      case "refus": journal(e.raison); jouerSon("erreur"); break;
      case "tour":
        rendre();
        banniere(e.j === 0 ? "Votre tour" : `Tour : ${d.joueurs[1].nom}`, `Tour ${d.tour}`, e.j === 0 ? "" : "sombre");
        journal(e.j === 0 ? "· Votre tour ·" : `· Tour : ${d.joueurs[1].nom} ·`, true);
        await attendre(850); break;
      case "phase":
        rendre(); banniere(e.phase === "combat" ? "Phase de combat" : "Phase principale 2", "", "petite"); jouerSon("choix");
        await attendre(600); break;
      case "pioche":
        if (e.j === 0) { journal(`Vous piochez ${c}.`); noterVue(carnet, e.id); rendre(); document.querySelector("#main-0 .carte-main:last-child")?.classList.add("piochee"); }
        else { rendre(); document.querySelector("#main-1 canvas:last-child")?.classList.add("piochee"); }
        await attendre(280); break;
      case "fusion":
        journal(`Accord de Belline : ${e.texte} ${nom(e.j)} ${accorde(e.j, "invoquez", "invoque")} la figure ${c}.`, true);
        if (e.j === 0) { noterRegle(carnet, e.regle); sauverCarnet(carnet); }
        eclair("rgba(167,122,216,.4)"); jouerSon("regle");
        banniere("Figure d’accord", e.texte, "accord");
        encart(`Figure d’accord : ${c}`, `${e.texte} ${def(e.id).texte}`, [...e.materiaux, e.id], "technique", 10000);
        effetCarte(e.id);
        await carteAuCentre(e.materiaux, "fusion");
        break;
      case "invocation": {
        journal(`${nom(e.j)} ${accorde(e.j, "invoquez", "invoque")} ${c}${e.speciale && !e.figure ? " (invocation spéciale)" : ""}.`);
        rendre();
        const z = zoneEl(e.j, e.place);
        if (z) { z.style.setProperty("--teinte", (TEINTES[elementCarte(e.id)] || TEINTES.accord).join(",")); z.classList.add(e.figure || e.astre || def(e.id).forte ? "arrivee-majeure" : "arrivee"); }
        if (e.astre && z) { secousse(true); effets.jouer("transformation", (() => { const r = effets.rect(z), k = 3.4; return { x: r.x + r.w / 2 - r.w * k / 2, y: r.y + r.h / 2 - r.h * k / 2, w: r.w * k, h: r.h * k }; })(), { element: elementCarte(e.id) }); effets.impact(z, elementCarte(e.id), true); jouerElement(elementCarte(e.id), "impact"); }
        if (z) effetCarte(e.id, z, e.figure || def(e.id).forte ? 3.2 : 2.4);
        jouerSon("invocation", familleDe(e.id)); eclair(e.figure ? "rgba(167,122,216,.3)" : "rgba(243,213,138,.25)");
        if (e.j === 1) apercu(e.id, true, `Invoquée par ${d.joueurs[1].nom}.`);
        await attendre(e.figure || def(e.id).forte ? 1200 : 850); break;
      }
      case "pose":
        journal(`${nom(e.j)} ${accorde(e.j, "posez", "pose")} une apparition face cachée.`);
        rendre(); zoneEl(e.j, e.place)?.classList.add("arrivee-cachee"); jouerSon("choix");
        await attendre(450); break;
      case "posePresage":
        journal(e.j === 0 ? `Vous posez ${e.influence ? "une influence" : "un présage"} face cachée.` : `${d.joueurs[1].nom} pose une carte face cachée.`);
        rendre(); zoneEl(e.j, e.place, "presages")?.classList.add("arrivee-cachee"); jouerSon("choix");
        await attendre(420); break;
      case "continue":
        rendre(); zoneEl(e.j, e.place, "presages")?.classList.add("arrivee"); break;
      case "influence":
        journal(`${nom(e.j)} ${e.revelee ? accorde(e.j, "révélez", "révèle") : accorde(e.j, "activez", "active")} ${c}${e.revelee ? " (posée face cachée)" : ""}${e.choix != null && DUEL[e.id].choix ? ` (${DUEL[e.id].choix[e.choix].label})` : ""}.`);
        if (e.j === 1) apercu(e.id, true, `Influence activée par ${d.joueurs[1].nom}.`);
        jouerSon("invocation");
        effetCarte(e.id, null, 1, true);
        await carteAuCentre(e.id, "influence"); break;
      case "presage":
        journal(`Présage${e.maillon === 2 ? " (chaîne, maillon 2)" : ""} ! ${nom(e.j)} ${accorde(e.j, "activez", "active")} ${c}.`, true);
        apercu(e.id, true, `Présage activé par ${e.j === 0 ? "vous" : d.joueurs[1].nom}.`);
        eclair("rgba(201,89,159,.35)"); jouerSon("regle");
        banniere(e.maillon === 2 ? "Chaîne : maillon 2" : "Présage", c, "presage");
        encart(`${e.maillon === 2 ? "Chaîne" : "Présage"} : ${c}`, `${e.j === 0 ? "Vous activez" : `${d.joueurs[1].nom} active`} ${c}. ${def(e.id).texte}`, [e.id], "presage", 8000);
        effetCarte(e.id, null, 1, true);
        await carteAuCentre(e.id, "presage"); break;
      case "sacrifice":
        journal(`${nom(e.j)} ${accorde(e.j, "sacrifiez", "sacrifie")} ${c}.`);
        zoneEl(e.j, e.place)?.classList.add("sacrifie"); eclats(zoneEl(e.j, e.place), "#f3d58a");
        await attendre(420); break;
      case "materiau": zoneEl(e.j, e.place)?.classList.add("sacrifie"); eclats(zoneEl(e.j, e.place), "#c9a0ff"); await attendre(300); break;
      case "retournee": journal(`${c} est retournée.`); rendre(); zoneEl(e.j, e.place)?.classList.add("retourne"); await attendre(480); break;
      case "position": rendre(); zoneEl(e.j, e.place)?.classList.add("pivote"); jouerSon("choix"); await attendre(320); break;
      case "attaque": {
        const a = zoneEl(e.j, e.place);
        const cible = e.cible === "direct" ? $(`lp-${1 - e.j}`) : zoneEl(1 - e.j, e.cible);
        journal(`${c} attaque ${e.cible === "direct" ? (e.j === 0 ? `les points de vie de ${d.joueurs[1].nom}` : "vos points de vie") : nomDe(e.idCible)}.`);
        montrerFleche(a, cible); montrerCalcul(e.calcul);
        await attendre(600);
        // le coup part dans l'élément de l'apparition (feu, eau, terre, air, foudre, lumière, fleurs)
        const elem = elementCarte(e.id), c0 = e.calcul || {};
        const fort = c0.avantage || (c0.atk || 0) >= 2400 || (c0.valeur != null && Math.abs((c0.atk || 0) - c0.valeur) >= 1000);
        if (a) a.classList.add("elan");
        cacherFleche();
        jouerElement(elem, "lancer");
        if (a && cible) await effets.attaque(a, cible, elem); else await attendre(300);
        a?.classList.remove("elan");
        cible?.classList.remove("impact"); void cible?.offsetWidth; cible?.classList.add("impact");
        if (cible) effets.impact(cible, elem, fort);
        jouerElement(elem, "impact"); jouerSon("frappe"); secousse(fort);
        if (c0.avantage) flotter(cible, "▲ domination", "neutre");
        await attendre(fort ? 420 : 300);
        break;
      }
      case "detruite": case "sacrifiee": case "epuisee": {
        const z = zoneEl(e.j, e.place, e.zone === "presages" ? "presages" : "monstres");
        if (e.type === "detruite") journal(`${c} est détruite.`);
        if (e.type === "epuisee") journal(`${c} a fini d’agir.`);
        z?.classList.add("eclate");
        if (z) effets.eclatsCarte(z, elementCarte(e.id));
        await attendre(500); break;
      }
      case "protegee": flotter(zoneEl(e.j, e.place), "protégée", "neutre"); journal(`${c} n’est pas détruite (protégée une fois).`); await attendre(450); break;
      case "lp": {
        flotter($(`lp-${e.j}`), `${e.v > 0 ? "+" : "−"}${Math.abs(e.v)}`, `${e.v > 0 ? "bien" : "mal"}${Math.abs(e.v) >= 1000 ? " gros" : ""}`);
        allerLP(e.j, e.lp);
        if (e.v < 0) { const p = $(`lp-${e.j}`); p.classList.remove("touche"); void p.offsetWidth; p.classList.add("touche"); if (-e.v >= 1500) { eclair("rgba(255,60,40,.3)"); secousse(true); } }
        journal(`${nom(e.j)} ${e.v > 0 ? accorde(e.j, "gagnez", "gagne") : accorde(e.j, "perdez", "perd")} ${Math.abs(e.v)} points de vie${e.pourquoi ? ` (${e.pourquoi})` : ""}.`);
        jouerSon(e.v > 0 ? "gain" : "perte");
        await attendre(e.v < 0 ? 520 : 380); break;
      }
      case "accord": {
        const titre = e.cle?.startsWith("dico:") ? "Lecture de l’Atelier" : { echo: "Écho de la notice", accompagnement: "Accord d’accompagnement", lecture: "Lecture moderne", majeur: "Grand accord" }[e.sorte] || "Règle de Belline";
        if (e.sorte === "majeur") {
          // un Grand accord : la terre tremble, la lumière éclate
          secousse(true); eclair(e.favorable ? "rgba(255,214,120,.5)" : "rgba(255,60,40,.45)");
          effets.jouer(e.favorable ? "etoiles" : "eclair", effets.rect($("tapis")));
          jouerElement(e.favorable ? "lumiere" : "foudre", "impact");
        }
        const combo = e.combo > 1 ? ` · combo ×${e.combo}` : "";
        journal(`${titre}${e.terrain ? " (sur le terrain)" : ""}${e.resonance ? " (résonance avec une carte en jeu)" : ""}${combo} : ${e.texte} (${e.valeur} points)`, true);
        if (e.j === 0) { accordsDuDuel.push({ titre, texte: e.texte, belline: e.sorte === "belline" }); if (e.regle) { noterRegle(carnet, e.regle); sauverCarnet(carnet); } }
        if (e.sorte === "lecture") {
          // une lecture : un fil entre les deux cartes et une étiquette qui s'envole, sans encart
          const ancre = e.ids && [...document.querySelectorAll(`#monstres-${e.j} .zone, #presages-${e.j} .zone`)].find(z => { const P = +z.dataset.place, s = z.closest(".rang-presages") ? "presages" : "monstres"; return d.joueurs[e.j][s][P]?.id === e.ids[1]; });
          flotter(ancre || $(`lp-${e.j}`), `✦ ${nomDe(e.ids?.[0])} ↔ ${nomDe(e.ids?.[1])}`, `lecture ${e.favorable ? "bien" : "mal"}`, 2600);
        } else encart(`${titre}${e.resonance ? " · résonance" : ""}${combo}`, `${e.texte} ${e.favorable ? (e.j === 0 ? "Vous gagnez" : `${d.joueurs[1].nom} gagne`) : (e.j === 0 ? `${d.joueurs[1].nom} perd` : "Vous perdez")} ${e.valeur} points${e.sorte === "belline" ? ", et le sort de la règle agit" : ""}.`,
          e.ids || [], `${e.sorte || "belline"} ${e.favorable ? "favorable" : "nefaste"}`, e.sorte === "belline" || e.sorte === "majeur" ? 10000 : 5500);
        if (e.sorte !== "lecture") { banniere(e.sorte === "majeur" ? `${titre} : ${e.texte.split(" : ")[0]}` : titre + combo, e.sorte === "majeur" ? e.texte.split(" : ").slice(1).join(" : ") : e.texte, e.sorte === "belline" ? "belline" : e.sorte === "majeur" ? "majeur" : e.favorable ? "accord" : "sombre"); jouerSon("regle"); eclair(e.favorable ? "rgba(243,213,138,.35)" : "rgba(160,60,90,.3)"); }
        else jouerSon(e.favorable ? "gain" : "perte");
        if (e.ids) {
          {
            const zs = e.ids.map(id => [...document.querySelectorAll(`#monstres-${e.j} .zone, #presages-${e.j} .zone`)].find(z => { const P = +z.dataset.place, sorte = z.closest(".rang-presages") ? "presages" : "monstres"; return d.joueurs[e.j][sorte][P]?.id === id; }));
            if (zs[0] && zs[1]) effets.lien(zs[0], zs[1], e.favorable);
          }
          effets.duo(e.ids[0], e.ids[1], effets.rect($("tapis")), e.favorable);
        }
        await attendre(e.sorte === "lecture" ? 700 : e.sorte === "belline" || e.sorte === "majeur" ? 2200 : 1400); break;
      }
      case "celeste": {
        const A = ASTRES[e.id];
        journal(`Invocation céleste : ${nom(e.j) === "Vous" ? "vous sacrifiez" : `${d.joueurs[1].nom} sacrifie`} trois cartes de ${A.nom} pour invoquer l’astre.`, true);
        banniere("Invocation céleste", `${A.glyphe} ${A.nom}`, "majeur");
        eclair("rgba(255,240,200,.55)"); jouerElement(elementDe(A.famille), "lancer");
        effets.jouer("etoiles", effets.rect($("tapis")));
        encart(`Invocation céleste : ${A.nom}`, A.texte, [...e.materiaux, e.id], "majeur favorable", 11000);
        await attendre(1300); break;
      }
      case "evolution": {
        journal(`Évolution : ${nom(e.j) === "Vous" ? "votre" : "son"} ${nomDe(e.de)} devient ${c} (+300 ATK d’élan).`, true);
        rendre();
        const z = zoneEl(e.j, e.place); z?.classList.add("evolue");
        if (z) effetCarte(e.id, z, 2.6, true);
        banniere("Évolution", `${nomDe(e.de)} ⇧ ${c}`, "accord"); jouerSon("invocation", familleDe(e.id));
        if (z) effets.jouer("transformation", (() => { const r = effets.rect(z), k = 2.2; return { x: r.x + r.w / 2 - r.w * k / 2, y: r.y + r.h / 2 - r.h * k / 2, w: r.w * k, h: r.h * k }; })(), { element: elementCarte(e.id) });
        encart("Évolution", `${nomDe(e.de)} évolue en ${c} : même planète, niveau plus haut, +300 ATK d’élan. ${def(e.id).texte}`, [e.de, e.id], "evolution", 9000);
        if (e.j === 1) apercu(e.id, true, `Évolution de ${d.joueurs[1].nom}.`, true);
        await attendre(1200); break;
      }
      case "statut": {
        const z = zoneEl(e.j, e.place), E = ETATS[e.etat];
        journal(`${c} est ${E.nom}. ${E.texte}`);
        flotter(z, `${E.signe} ${E.nom}`, "mal");
        if (z) effets.jouer({ poison: "miasme", brulure: "flammes", sommeil: "lune", confusion: "vent" }[e.etat], effets.rect(z), {});
        rendre(); await attendre(450); break;
      }
      case "gueri": journal(`${c} ${e.texte || "guérit de son état"}.`); flotter(zoneEl(e.j, e.place), "guérie", "bien"); rendre(); await attendre(300); break;
      case "figureDebloquee":
        journal(`${e.j === 0 ? "Nouvelle figure d’accord dans votre réserve" : `${d.joueurs[1].nom} gagne une figure`} : ${c}.`, true);
        if (e.j === 0) { banniere("Nouvelle figure", c, "accord"); await attendre(900); }
        break;
      case "fatalite":
        journal("La Fatalité : l’échéance inéluctable. Celui qui a le plus de points de vie l’emporte.", true);
        banniere("La Fatalité", "l’échéance inéluctable", "sombre"); await attendre(1600); break;
      case "renvoi": journal(`${c} quitte le terrain.`); zoneEl(e.j, e.place)?.classList.add("eclate"); await attendre(380); break;
      case "vol": journal(`${nom(e.j)} ${accorde(e.j, "volez", "vole")} une carte${e.j === 0 ? ` : ${c}` : ""}.`); break;
      case "retour": journal(`${c} revient du cimetière.`); break;
      case "defausse": journal(`${e.j === 0 ? "Vous envoyez" : `${d.joueurs[1].nom} envoie`} ${c} au cimetière${e.limite ? " (main limitée à sept)" : e.materiau ? " (accord)" : ""}.`); break;
      case "texte": journal(e.texte); break;
      case "terrainPose": {
        const moitie = document.querySelector(e.j === 0 ? ".moitie-vous" : ".moitie-ombre");
        journal(`${nom(e.j)} ${accorde(e.j, "posez", "pose")} le terrain ${c}.`, true);
        rendre(); moitie.classList.remove("lieu-arrive"); void moitie.offsetWidth; moitie.classList.add("lieu-arrive");
        effetCarte(e.id, moitie, 1, true);
        banniere(`Terrain : ${c}`, e.j === 0 ? "votre côté du tapis change" : `côté ${d.joueurs[1].nom}`, "petite");
        await attendre(900); break;
      }
      case "terrainCasse": case "terrainRetour": {
        const moitie = document.querySelector(e.j === 0 ? ".moitie-vous" : ".moitie-ombre");
        journal(e.type === "terrainCasse" ? `Le terrain ${c} est cassé.` : `Le terrain ${c} retourne dans la main.`, true);
        effets.jouer("eboulis", moitie);
        moitie.classList.remove("lieu-casse"); void moitie.offsetWidth; moitie.classList.add("lieu-casse");
        await attendre(500); rendre(); break;
      }
      case "technique": {
        const genre = { alignement: "Alignement", appel: "Appel des règles" }[e.sorte] || "Association";
        journal(`${genre} : ${e.j === 0 ? "vous utilisez" : `${d.joueurs[1].nom} utilise`} « ${e.nom} ». ${e.texte}`, true);
        for (const p of e.places) zoneEl(e.j, p)?.classList.add("aligne");
        banniere(e.nom, e.sorte === "alignement" ? "Alignement planétaire" : e.sorte === "appel" ? "Une règle de Belline se prépare" : "Association", "accord");
        encart(`${genre} : ${e.nom}`, e.texte, e.cartes || [], "technique", 10000);
        jouerSon("regle"); eclair("rgba(243,213,138,.35)");
        effets.jouer(EFFET_TECHNIQUE[e.cle.split(":")[1]] || "etoiles", effets.rect($("tapis")));
        await attendre(1500); break;
      }
      case "terrain": {
        const t = REGIONS.find(r => r.famille === e.famille);
        journal(`Le terrain devient ${t.nom.replace(/^(Le|La|Les) /, m => m.toLowerCase())}.`);
        rendre(); const tp = $("tapis"); tp.classList.remove("change-terrain"); void tp.offsetWidth; tp.classList.add("change-terrain");
        await attendre(500); break;
      }
    }
    if (d.fini) break;
  }
  rendre();
  for (const e of ev) if (["renfort", "affaibli", "bloque"].includes(e.type)) {
    const z = zoneEl(e.j, e.place);
    if (z) { z.classList.remove(e.type); void z.offsetWidth; z.classList.add(e.type); }
  }
  if (!garderOccupe) occupe = false;
  rendre();
}

/** L'effet visuel de chaque technique. */
const EFFET_TECHNIQUE = {
  soleil: "etoiles", lune: "lune", mercure: "vent", venus: "coeurs", mars: "flammes", jupiter: "dome", saturne: "sablier",
  preambule: "cle", freins: "chaines", fortes: "eclair", messagers: "oiseaux", coeurs: "coeurs", fortune: "roue", ciel: "comete"
};

// ---------- Accueil, campagne, atelier ----------
/** Le bouton « Reprendre le duel en cours » de l'accueil. */
function majReprise() {
  const s = lireEnregistrement(), b = $("bouton-reprendre");
  if (!b) return;
  b.hidden = !s;
  if (s) b.textContent = `▶ Reprendre le duel en cours (contre ${s.d.joueurs[1].nom}, tour ${s.d.tour}, vos points de vie ${s.d.joueurs[0].lp})`;
}
$("bouton-reprendre")?.addEventListener("click", reprendre);

function gardienAccessible(i) { return i === 0 || carnet.gardiens.includes(GARDIENS[i - 1].famille); }
/** L'accueil dit combien de cartes compte votre deck ; s'il en manque, un bouton rend les 53. */
function majDeck() {
  const b = $("bouton-deck"), n = deck.length;
  b.textContent = `Votre deck (${n} carte${n > 1 ? "s" : ""} sur 53) et votre réserve`;
  const r = $("deck-complet");
  r.hidden = n >= 53; r.textContent = `Reprendre les 53 cartes (il en manque ${53 - n})`;
}
$("deck-complet").addEventListener("click", () => { deck = CARTES.map(c => c.id); sauverDeck(deck); majDeck(); });

function majAccueil() {
  majDeck();
  if ($("apprenti") && carnet.duels.joues < 3 && !majAccueil.fait) { $("apprenti").checked = true; majAccueil.fait = true; }
  $("liste-gardiens").replaceChildren(...GARDIENS.map((g, i) => {
    const li = document.createElement("li");
    const r = REGIONS.find(x => x.famille === g.famille);
    const battu = carnet.gardiens.includes(g.famille), ouvert = gardienAccessible(i);
    const b = document.createElement("button");
    b.className = `gardien ${battu ? "battu" : ""}`;
    b.disabled = !ouvert;
    b.innerHTML = `<span class="g-glyphe"></span><span class="g-texte"><b></b><small></small></span><span class="g-etat"></span>`;
    b.querySelector(".g-glyphe").textContent = r.glyphe;
    b.querySelector("b").textContent = g.nom;
    b.querySelector("small").textContent = g.style;
    b.querySelector(".g-etat").textContent = battu ? "✓ vaincu" : ouvert ? "défier" : "🔒";
    b.addEventListener("click", () => demarrer({ mode: "gardien", index: i }));
    li.appendChild(b);
    return li;
  }));
}

function demarrer(config, graine = null) {
  consultant = document.querySelector("input[name=consultant]:checked")?.value || "homme";
  partie = { ...config, graine: graine ?? nouvelleGraine(), apprenti: config.apprenti ?? !!$("apprenti")?.checked };
  // le premier duel est doux : vous commencez, et l'Ombre ne pose pas de présage pendant ses deux premiers tours
  const premierDuel = !carnet.duels.joues && !graine;
  accordsDuDuel = []; moments = momentsVides();
  rng = creerHasard(partie.graine);
  let options;
  if (config.mode === "gardien") {
    const g = GARDIENS[config.index];
    options = {
      decks: [deck, deckGardien(g, creerHasard(partie.graine + 3))],
      reserves: [reserveJoueur(), figuresDebloquees(new Set(reglesEnseignees(g)))],
      terrain: g.famille, profils: [null, g.profil], nomAdverse: g.nom, mecaniques: MECA_GARDIENS[config.index]
    };
  } else {
    const profil = config.difficulte === "adaptatif" ? profilAdaptatif() : PROFILS[config.difficulte];
    options = {
      decks: [deck, CARTES.map(c => c.id)],
      reserves: [reserveJoueur(), config.difficulte === "novice" ? [] : config.difficulte === "mage" ? Object.keys(FIGURES).map(Number) : FIGURES_DEPART],
      terrain: PLANETES[Math.floor(rng() * 7)], profils: [null, profil], nomAdverse: `L’Ombre (${profil.nom})`
    };
  }
  if (premierDuel) Object.assign(options, { premier: 0, douceur: 2 });
  d = creerDuel(rng, consultant, options);
  selection = null; occupe = false;
  lpAffiche[0] = lpAffiche[1] = LP;
  $("journal").replaceChildren();
  $("numero-duel").textContent = `Duel n° ${partie.graine}`;
  for (const id of d.joueurs[0].main) noterVue(carnet, id);
  sauverCarnet(carnet);
  for (const e of ["accueil-duel", "fin-duel", "atelier"]) $(e).classList.remove("visible");
  $("detail").classList.add("vide"); actions([]);
  journal(`Le duel commence contre ${d.joueurs[1].nom}. Terrain : ${REGIONS.find(r => r.famille === d.terrain).nom}.`, true);
  if (config.mode === "gardien" && config.index < 5) {
    const ouvertes = MECA_GARDIENS[config.index];
    journal(ouvertes.length ? `Dans ce duel : ${ouvertes.map(k => NOMS_MECA[k]).join(", ")}.` : "Premier duel : invoquez, jouez vos influences et vos présages, combattez. Les accords de Belline s’accomplissent déjà.");
  }
  rendre(); ajusterTaille();
  ouverture();
}

/** La difficulté qui s'ajuste : plus vous gagnez, moins l'Ombre joue au hasard. */
function profilAdaptatif() {
  const { joues, gagnes } = carnet.duels, taux = (gagnes + 1) / (joues + 2);
  const hasard = Math.max(0, Math.min(0.65, 0.75 - taux * 0.9));
  return { nom: `Adaptatif, force ${Math.round((1 - hasard / 0.65) * 100)} %`, hasard, agressif: 1 + (0.65 - hasard) * 0.15, soin: 1 };
}

async function ouverture() {
  occupe = true;
  const t = REGIONS.find(r => r.famille === d.terrain);
  banniere("Duel !", `${d.joueurs[1].nom} · terrain ${t.glyphe} ${t.nom}`);
  jouerSon("porte");
  await attendre(1500);
  banniere("Pile ou face", d.premier === 0 ? "Vous commencez" : `${d.joueurs[1].nom} commence`, d.premier === 0 ? "" : "sombre");
  journal(d.premier === 0 ? "Pile ou face : vous commencez." : `Pile ou face : ${d.joueurs[1].nom} commence.`);
  await attendre(1300);
  if (d.premier === 1) await tourAdverse();
  occupe = false;
  rendre();
  if (d.fini) terminer();
}

function terminer() {
  effacerEnregistrement();
  const gagne = d.gagnant === 0;
  noterDuel(carnet, gagne);
  let lecons = [];
  if (gagne && partie.mode === "gardien") {
    const g = GARDIENS[partie.index];
    lecons = vaincreGardien(carnet, g.famille, reglesEnseignees(g));
  }
  sauverCarnet(carnet);
  // le coup final : un temps suspendu, la barre du vaincu se brise, puis la bannière
  const plateau = $("plateau"), vaincu = d.gagnant == null ? null : 1 - d.gagnant;
  plateau.classList.remove("coup-final"); void plateau.offsetWidth; plateau.classList.add("coup-final");
  if (vaincu != null) { $(`lp-${vaincu}`).classList.add("brise"); secousse(true); eclair(gagne ? "rgba(255,240,200,.6)" : "rgba(255,40,40,.45)"); }
  setTimeout(() => { plateau.classList.remove("coup-final"); $("lp-0").classList.remove("brise"); $("lp-1").classList.remove("brise"); }, 2600);
  jouerSon(gagne ? "victoire" : "defaite");
  setTimeout(() => banniere(gagne ? "Victoire" : "Défaite", "", gagne ? "accord" : "sombre"), 700);
  // la fin du duel : une pluie d'étoiles à la victoire, des cendres à la défaite
  const tout = effets.rect($("plateau"));
  if (gagne) { effets.jouer("etincelles", tout); effets.jouer("etoiles", tout); setTimeout(() => effets.jouer("etincelles", tout), 500); }
  else effets.jouer("cendres", tout);
  setTimeout(() => {
    $("fin-duel-titre").textContent = d.gagnant == null ? "Égalité" : gagne ? "Les apparitions vous obéissent" : `${d.joueurs[1].nom} l’emporte`;
    $("fin-duel-texte").textContent = `Duel n° ${partie.graine} en ${Math.ceil(d.tour / 2)} tours · points de vie : vous ${d.joueurs[0].lp}, ${d.joueurs[1].nom} ${d.joueurs[1].lp} · duels gagnés ${carnet.duels.gagnes} sur ${carnet.duels.joues}.`;
    const regles = VOISINAGE.filter((r, i, t) => lecons.includes(r.id) && t.findIndex(x => x.texte === r.texte && lecons.includes(x.id)) === i);
    $("fin-duel-lecons").innerHTML = partie.mode === "gardien" && gagne
      ? `<p><b>${esc(GARDIENS[partie.index].nom)} vous enseigne :</b></p>${regles.length ? `<ul>${regles.map(r => `<li>${esc(r.texte)}</li>`).join("")}</ul>` : "<p class='petit'>Vous connaissiez déjà toutes ses règles.</p>"}${partie.index < 6 ? `<p>Le Gardien suivant vous attend : ${esc(GARDIENS[partie.index + 1].nom)}.</p>` : "<p><b>Les Sept Gardiens sont vaincus.</b></p>"}`
      : "";
    if (partie.mode === "gardien" && gagne && partie.index < 6) {
      const neuves = MECA_GARDIENS[partie.index + 1].filter(k => !MECA_GARDIENS[partie.index].includes(k));
      if (neuves.length) $("fin-duel-lecons").insertAdjacentHTML("beforeend", `<p><b>Nouvelle mécanique au prochain duel :</b> ${neuves.map(k => esc(NOMS_MECA[k])).join(", ")}.</p>`);
    }
    // les moments forts
    const forts = [];
    if (moments.plusGrosCoup) forts.push(`Votre plus gros coup : <b>${moments.plusGrosCoup}</b> points${moments.coupPar ? ` (${esc(moments.coupPar)})` : ""}.`);
    for (const id of moments.astres) forts.push(`Invocation céleste : <b>${esc(nomDe(id))}</b> est descendu sur le tapis.`);
    if (moments.figures) forts.push(`${moments.figures} figure${moments.figures > 1 ? "s" : ""} d’accord invoquée${moments.figures > 1 ? "s" : ""}.`);
    if (moments.lectures) forts.push(`${moments.lectures} lecture${moments.lectures > 1 ? "s" : ""} de votre dictionnaire.`);
    if (forts.length) $("fin-duel-lecons").insertAdjacentHTML("beforeend", `<p><b>Vos moments forts :</b></p><ul class="moments">${forts.map(t => `<li>${t}</li>`).join("")}</ul>`);
    const vus = accordsDuDuel.filter((a, i, t) => !/^Lecture/.test(a.titre) && t.findIndex(x => x.texte === a.texte) === i);
    $("fin-duel-lecons").insertAdjacentHTML("beforeend", vus.length
      ? `<p><b>Vos accords dans ce duel :</b></p><ul>${vus.map(a => `<li>${a.belline ? "<b>Règle de Belline</b>" : esc(a.titre)} : ${esc(a.texte)}</li>`).join("")}</ul>`
      : "<p class='petit'>Aucune règle ni accord de la notice dans ce duel : les badges ✦ dorés sur vos cartes montrent celles qui forment une règle, et l’Appel des règles (Techniques) va chercher la carte qui manque.</p>");
    // un conseil tiré du duel
    const conseil = !gagne && !moments.presages ? "Vous n’avez déclenché aucun présage : posez-en face cachée, ils répondent aux attaques de l’adversaire."
      : !gagne && moments.attaques < 3 ? "Vous avez peu attaqué : après vos invocations, passez au combat (C) pour user ses points de vie."
      : !vus.some(a => a.belline) ? "Pour accomplir une règle de Belline, révélez ses deux cartes l’une après l’autre, ou la seconde quand la première est face visible en jeu."
      : gagne ? "Belle lecture des cartes. Essayez un Gardien plus loin dans la campagne, ou la difficulté au-dessus." : "";
    if (conseil) $("fin-duel-lecons").insertAdjacentHTML("beforeend", `<p class="conseil-fin">☞ ${esc(conseil)}</p>`);
    $("fin-duel").classList.add("visible");
    $("bouton-revanche").focus();
  }, 2400);
}

/** La nature d'une carte pour l'atelier : légère, moyenne, forte, influence, terrain, présage. */
function natureAtelier(id) {
  const x = def(id);
  if (x.type === "apparition") return x.niveau <= 4 ? "legere" : x.niveau <= 6 ? "moyenne" : "forte";
  if (x.type === "presage") return "presage";
  return x.sousType === "terrain" ? "terrain" : "influence";
}
const NATURES = [["legere", "Apparitions légères"], ["moyenne", "Apparitions moyennes"], ["forte", "Apparitions fortes"], ["influence", "Influences"], ["terrain", "Terrains"], ["presage", "Présages"]];
let filtreAtelier = "toutes";

/** Combien de chances (en %) d'avoir au moins une carte d'un groupe de `k` cartes dans six cartes tirées sur `n`. */
function chanceEnMain(k, n, tirees = 6) {
  if (n < tirees) return k ? 100 : 0;
  let p = 1;
  for (let i = 0; i < tirees; i++) p *= (n - k - i) / (n - i);
  return Math.round(100 * (1 - Math.max(0, p)));
}

/** L'analyse du deck : composition, petites attaques, associations, astres, conseils. */
function analyserDeck() {
  const n = deck.length, ens = new Set(deck);
  const compte = Object.fromEntries(NATURES.map(([k]) => [k, deck.filter(id => natureAtelier(id) === k).length]));
  const jauge = (label, v, max, peu) => `<div class="deck-jauge${peu ? " peu" : ""}"><span>${label}</span><span class="deck-barre"><i style="width:${max ? Math.round(100 * Math.min(1, v / max)) : 0}%"></i></span><b>${v}</b></div>`;
  const regles = VOISINAGE.filter(r => ens.has(r.a) && ens.has(r.b)).length;
  const grands = GRANDS_ACCORDS.filter(g => ens.has(g.a) && ens.has(g.b)).length;
  let lectures = 0;
  for (const a of deck) for (const b of deck) if (a !== b && accordDeLecture(a, b, nomDe)) lectures++;
  const paires = n * (n - 1);
  const planetes = REGIONS.filter(r => r.famille && ASTRES[Object.keys(ASTRES).find(k => ASTRES[k].famille === r.famille)]).map(r => {
    const cartes = deck.filter(id => familleDe(id) === r.famille), app = cartes.filter(id => def(id).type === "apparition").length;
    return { r, cartes: cartes.length, app, astre: app >= 2 && cartes.length >= 3 };
  });
  const legeres = compte.legere, chance = chanceEnMain(legeres, n);
  const conseils = [];
  conseils.push(legeres >= 12 ? ["ok", `${legeres} apparitions légères : ${chance} % de chances d’en avoir au moins une dès la première main.`]
    : ["attention", `Seulement ${legeres} apparitions légères (${chance} % de chances d’en avoir une en première main) : gardez-en au moins 12, sinon vous subirez les attaques.`]);
  if (compte.forte > legeres / 2) conseils.push(["attention", "Beaucoup de cartes fortes pour peu d’apparitions légères à sacrifier : l’offrande vous coûtera des points de vie."]);
  if (!compte.presage) conseils.push(["attention", "Aucun présage : vous ne pourrez pas répondre aux attaques adverses."]);
  conseils.push(regles ? ["ok", `${regles} règle${regles > 1 ? "s" : ""} de Belline complète${regles > 1 ? "s" : ""} dans le deck (les deux cartes y sont).`] : ["attention", "Aucune règle de Belline complète : ajoutez les deux cartes d’une règle."]);
  if (n > 40) conseils.push(["ok", `Votre deck a ${n} cartes : un deck plus court (35 à 40) ferait revenir plus souvent vos meilleures cartes et vos règles.`]);
  const astres = planetes.filter(p => p.astre);
  return `<div><h4>Composition (${n} cartes)</h4>${NATURES.map(([k, l]) => jauge(l, compte[k], n * 0.45, k === "legere" && compte[k] < 12)).join("")}</div>
    <div><h4>Associations possibles</h4>
      ${jauge("Règles de Belline", regles, VOISINAGE.length)}${jauge("Grands accords", grands, GRANDS_ACCORDS.length)}
      ${jauge(dictionnaireCharge() ? "Lectures (dictionnaire)" : "Lectures", lectures, paires)}
      <p class="petit">${dictionnaireCharge() ? `Votre dictionnaire est ouvert : ${lectures} des ${paires} suites de deux cartes de ce deck forment une lecture, presque chaque carte révélée en accomplit une.` : `Le dictionnaire des 2652 associations s’ouvre pendant le duel : presque chaque carte révélée formera alors une lecture.`}</p></div>
    <div><h4>Planètes et astres</h4>${planetes.map(p => jauge(`${p.r.glyphe} ${p.r.nom}${p.astre ? " ★" : ""}`, p.cartes, 9)).join("")}
      <p class="petit">${astres.length ? `★ : astre invocable (${astres.map(p => p.r.nom).join(", ")}).` : "Aucun astre invocable : réunissez trois cartes d’une planète, dont deux apparitions."}</p></div>
    <div><h4>Conseils</h4><ul class="conseils">${conseils.map(([c, t]) => `<li class="${c}">${t}</li>`).join("")}</ul></div>`;
}

function montrerAtelier() {
  const z = $("atelier-cartes");
  const maj = () => {
    $("atelier-compte").textContent = `${deck.length} cartes dans votre deck (30 au moins, 53 au plus). Touchez une carte pour l’ajouter ou la retirer. Les cartes rares (reflet) sont celles que vous avez vécues dans le Chemin.`;
    $("atelier-fermer").disabled = deck.length < 30;
    for (const b of z.children) {
      b.classList.toggle("hors", !deck.includes(+b.dataset.id));
      b.classList.toggle("masquee", filtreAtelier !== "toutes" && natureAtelier(+b.dataset.id) !== filtreAtelier);
    }
    $("atelier-analyse").innerHTML = analyserDeck();
    $("atelier-filtres").replaceChildren(...[["toutes", "Toutes"], ...NATURES].map(([k, l]) => {
      const f = document.createElement("button");
      f.className = `discret-clair${filtreAtelier === k ? " actif" : ""}`;
      f.textContent = k === "toutes" ? `${l} (53)` : `${l} (${deck.filter(id => natureAtelier(id) === k).length}/${CARTES.filter(c => natureAtelier(c.id) === k).length})`;
      f.addEventListener("click", () => { filtreAtelier = k; maj(); });
      return f;
    }));
  };
  z.replaceChildren(...CARTES.map(c => c.id).sort((a, b) => a - b).map(id => {
    const b = document.createElement("button");
    b.className = "atelier-carte"; b.dataset.id = id;
    b.appendChild(enveloppe(carteCanvas(id, true, 92), id, true));
    b.setAttribute("aria-label", `${nomDe(id)} : dans le deck ou non`);
    b.addEventListener("click", () => { deck = deck.includes(id) ? deck.filter(x => x !== id) : [...deck, id]; maj(); });
    if (survol) b.addEventListener("mouseenter", () => apercu(id));
    return b;
  }));
  const debloquees = new Set(reserveJoueur());
  $("atelier-reserve").replaceChildren(...Object.keys(FIGURES).map(Number).map(f => {
    const b = document.createElement("div");
    b.className = `atelier-carte ${debloquees.has(f) ? "" : "verrou"}`;
    b.appendChild(enveloppe(carteCanvas(f, debloquees.has(f), 92), f, debloquees.has(f)));
    const s = document.createElement("small");
    const F = FIGURES[f];
    s.textContent = debloquees.has(f) ? F.nom : `N° ${F.materiaux.map(m => (Array.isArray(m) ? "Étoile" : m)).join(" avec n° ")}`;
    b.appendChild(s);
    if (debloquees.has(f) && survol) b.addEventListener("mouseenter", () => apercu(f));
    return b;
  }));
  maj();
  $("atelier").classList.add("visible");
}
$("bouton-deck").addEventListener("click", montrerAtelier);
$("atelier-tout").addEventListener("click", () => { deck = CARTES.map(c => c.id); montrerAtelier(); });
$("atelier-rien").addEventListener("click", () => { deck = []; montrerAtelier(); });
$("atelier-fermer").addEventListener("click", () => { if (deck.length < 30) return; sauverDeck(deck); $("atelier").classList.remove("visible"); majDeck(); });
$("bouton-regles").addEventListener("click", () => { $("regles-duel").hidden = !$("regles-duel").hidden; });
for (const b of document.querySelectorAll("[data-libre]")) b.addEventListener("click", () => demarrer({ mode: "libre", difficulte: b.dataset.libre }));
// la revanche : même adversaire, nouvelle donne (rejouer la même graine redonnait exactement les mêmes cartes)
$("bouton-revanche").addEventListener("click", () => demarrer(partie));
$("bouton-retour-accueil").addEventListener("click", () => { $("fin-duel").classList.remove("visible"); majAccueil(); majReprise(); $("accueil-duel").classList.add("visible"); });

window.addEventListener("keydown", e => {
  if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
  if (e.code === "Escape") { if (!$("zoom").hidden) $("zoom").hidden = true; else if ($("galerie").classList.contains("visible")) fermerGalerie(); else annuler(); }
  if (!d || $("accueil-duel").classList.contains("visible")) return;
  if (e.code === "KeyE") finDeTour();
  if (e.code === "KeyC") $("bouton-combat").click();
  if (e.code === "KeyA") ouvrirAccords();
  if (e.code === "KeyT") ouvrirTechniques();
});
window.addEventListener("resize", () => { if (d) ajusterTaille(); });
installerPleinEcran($("bouton-plein-ecran"), () => { if (d) ajusterTaille(); });
const boutonSon = $("bouton-son");
const majSon = () => { boutonSon.textContent = sonActif() ? "♪ Son" : "♪ Muet"; boutonSon.setAttribute("aria-pressed", String(sonActif())); };
boutonSon.addEventListener("click", () => { basculerSon(); majSon(); });
majSon();

// Votre dictionnaire des associations (Atelier, 4 Mo) : chargé après le démarrage, il remplace les lectures modernes.
function chargerDictionnaire() {
  if (dictionnaireCharge()) return;
  if (window.BELLINE?.PAIR_DICT) { definirDictionnaire(window.BELLINE.PAIR_DICT); return; }
  const s = document.createElement("script");
  s.src = "../js/data/pair-dictionary.js";
  s.onload = () => { if (window.BELLINE?.PAIR_DICT) { definirDictionnaire(window.BELLINE.PAIR_DICT); journal("Votre dictionnaire des associations est ouvert : ses lectures accompagnent le duel."); } };
  document.head.appendChild(s);
}
setTimeout(chargerDictionnaire, 1500);

// La vitesse : un toucher la change (lente pour lire les combos)
function majVitesse() {
  $("bouton-vitesse").textContent = VITESSES[vitesse][2];
  document.documentElement.style.setProperty("--vitesse", facteur());
}
$("bouton-vitesse").addEventListener("click", () => {
  vitesse = (vitesse + 1) % VITESSES.length;
  try { localStorage.setItem("chemin-du-mage.vitesse", VITESSES[vitesse][0]); } catch { /* rien */ }
  majVitesse();
});
majVitesse();

// L'aide : comment jouer, et ce que veulent dire les signes
function ouvrirAide() {
  const I = itemPanneau;
  $("galerie-titre").textContent = "Comment jouer";
  $("galerie-texte").textContent = "Le but : faire tomber les points de vie de l’adversaire à zéro. Touchez une carte pour voir ce qu’elle peut faire ; touchez la carte du panneau pour l’agrandir.";
  $("galerie-cartes").replaceChildren(
    I("1. Votre tour", "Vous piochez 2 cartes (7 en main au plus). En phase principale : invoquez une apparition (une par tour), activez ou posez vos influences, posez vos présages. Puis « Combat », puis « Fin ».", "", null, "titre-aide"),
    I("2. Invoquer", "Niveau 4 ou moins : sans sacrifice. Niveau 5 et 6 : une apparition à sacrifier ; 7 et 8 : deux. S’il en manque, l’offrande les remplace (1500 points de vie chacune).", ""),
    I("3. Attaquer", "En combat, touchez une apparition prête (cadre doré), puis sa cible. ATK contre ATK : la plus faible tombe et son joueur perd la différence. Contre une défense : la DEF compte.", ""),
    I("4. Répondre", "Pendant l’attaque adverse, une fenêtre vous propose vos présages, vos influences posées et vos terrains : c’est le moment de retourner le combat.", ""),
    I("5. Les accords", "Deux cartes que la notice associe, jouées l’une après l’autre ou toutes deux en jeu, accomplissent un accord : la règle de Belline vaut le plus. Un encart l’explique ; touchez ses cartes pour les agrandir.", ""),
    I("Grands accords et astres", `Deux cartes fortes ensemble (Accident et Fatalité, Despotisme et Fatalité, Sagesse et Fatalité…) forment un Grand accord, violent : ${GRANDS_ACCORDS.length} en tout. Trois cartes d’une même planète (deux apparitions en jeu, la troisième en jeu ou en main) se sacrifient pour invoquer l’astre lui-même (bouton Techniques) : le Soleil, la Lune… niveau 10.`, ""),
    I("✦ et ⇧ sur vos cartes", "✦ : la carte s’associe avec une autre de vos cartes (doré : une règle de Belline). ⇧ : elle peut faire évoluer une de vos apparitions.", ""),
    I("Les auras", "Vert : peut évoluer. Bleu : bloquée (n’attaque pas). Or : protégée une fois. Vert-jaune : malade. Orange : brûlée. Bleu clair : endormie. Rose : confuse.", ""),
    I("Les signes", "⛨ garde (à attaquer d’abord) · ◈ protégée · ⚒ équipée · ⛓ bloquée · ◐ posée face cachée · ☣ malade · ♨ brûlée · ☾ endormie · ✺ confuse · ▲ votre apparition domine sa planète (+500 ATK).", ""),
    I("Les éléments", "Soleil lumière, Lune eau, Mercure air, Vénus fleurs, Mars feu, Jupiter foudre, Saturne terre. Chaque planète domine la suivante dans l’ordre d’Edmond.", ""),
    I("Trop rapide ?", "Le bouton ⏱ change la vitesse : 🐢 Lent laisse le temps de lire chaque combo. Le journal (☰) garde tout ce qui s’est passé.", "")
  );
  $("galerie").classList.add("visible");
  $("galerie-fermer").focus();
}
$("bouton-aide").addEventListener("click", ouvrirAide);

// Téléphone : le journal s'ouvre par un bouton, par-dessus le jeu
$("bouton-journal")?.addEventListener("click", () => {
  const b = document.querySelector(".journal-bloc"), ouvert = b.classList.toggle("ouvert");
  $("bouton-journal").setAttribute("aria-expanded", String(ouvert));
});

// Outil de vérification (?test) : lire l'état depuis la console ou un script.
if (new URLSearchParams(location.search).has("test")) window.__duel = { etat: () => d, occupe: () => occupe, demarrer, effet: id => effetCarte(id), effets, zone: zoneEl, terminer, animer };

// Accueil : un duel de démonstration derrière le voile
majAccueil();
rng = creerHasard(1); d = creerDuel(rng, "homme", { premier: 0, terrain: "soleil" }); partie = { demo: true };
majReprise();
document.fonts?.ready.then(() => ajusterTaille());
ajusterTaille();
