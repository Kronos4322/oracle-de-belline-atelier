// Le Chemin : relie la partie (engine/partie.js), le dessin (render) et l'interface (ui).
import { COULEURS, REGIONS } from "./config.js";
import { CARTE_PAR_ID } from "./data/cartes.js";
import { nouvelleGraine } from "./engine/hasard.js";
import { utiliserCarteBleue, coutSaut } from "./engine/effects.js";
import { creerPartie, avancer, resoudre, demanderSaut, reprendreMain, allerVers, regarder, besoinEnergie, regionAffichee } from "./engine/partie.js";
import { lireTirage, score } from "./engine/lecture.js";
import { noterVue, noterVecue, noterRegle, noterPartie } from "./engine/carnet.js";
import { Rendu } from "./render/renderer.js";
import { Effets } from "./render/effetsVisuels.js";
import { majHud, majRetenues } from "./ui/hud.js";
import { montrerVecue, montrerMessage, montrerApercu, fermerFiche, majDevant, demanderChoix, demanderRetenue, demanderEnigme, annoncer, dialogueOuvert } from "./ui/fiche.js";
import { montrerLecture, cacherTirage } from "./ui/tirage.js";
import { montrerCarnet, cacherCarnet } from "./ui/carnet.js";
import { chargerCarnet, sauverCarnet } from "./ui/stockage.js";
import { installerCommandes } from "./ui/commandes.js";
import { jouerSon, basculerSon, sonActif } from "./ui/son.js";
import { installerPleinEcran } from "./ui/pleinEcran.js";

const $ = id => document.getElementById(id);
const canvas = $("jeu");
const rendu = new Rendu(canvas);
// Chaque carte vécue joue son effet sur la scène (l'Eau déferle, le Feu flambe...).
const effets = new Effets(canvas.parentElement);
rendu.mouvementReduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const carnet = chargerCarnet();
// Outil de vérification : ?acceleration=4 fait passer le temps quatre fois plus vite (navigateurs lents, tests).
const ACCELERATION = Math.min(10, Math.max(1, Number(new URLSearchParams(location.search).get("acceleration")) || 1));

let p = null, mode = "accueil", consultant = "homme", longueur = 7, dernierT = 0;
let vue = null, cleDevant = "", enDialogue = false;

function nouvellePartie(graine = null) {
  p = creerPartie(graine ?? nouvelleGraine(), consultant, { regions: longueur, carnet });
  cleDevant = ""; enDialogue = false;
  rendu.camA = null; rendu.flottants = []; rendu.particules = []; rendu.revelation = null;
  cacherTirage(); cacherCarnet(); $("accueil").classList.remove("visible");
  $("numero-chemin").textContent = `Chemin n° ${p.graine}`;
  mode = "jeu";
  rendu.annoncer(`${REGIONS[0].glyphe} ${REGIONS[0].nom}`, "Montez avec ↑, choisissez aux fourches");
  montrerMessage(1, ["Montez avec ↑ (ou Z / W), ou glissez le doigt sur la scène. Aux fourches, choisissez ← ou →. Espace (ou un toucher) : sauter la carte qui est devant vous.",
    "Le temps ne passe que lorsque vous marchez : arrêtez-vous pour lire.",
    "À chaque porte, vous retiendrez une carte pour votre tirage, et une énigme vous attend."], "Le chemin commence");
  majRetenues(p.retenues, id => CARTE_PAR_ID[id].nom);
  canvas.focus({ preventScroll: true });
}

// ---------- Événements de la partie ----------
const signe = g => Math.sign((g?.energie || 0) + (g?.fortune || 0));

function flotterGain(gain) {
  const pos = p.mage.position(p.chemin);
  if (gain.energie) rendu.flotter(`${gain.energie > 0 ? "+" : ""}${gain.energie} ⚡`, gain.energie > 0 ? "#bfe3b4" : "#ffb3b3", pos);
  if (gain.fortune) rendu.flotter(`${gain.fortune > 0 ? "+" : ""}${gain.fortune} ✦`, "#f3d58a", pos);
}

function traiter(evenements) {
  for (const e of evenements) {
    switch (e.type) {
      case "region": {
        const r = REGIONS[e.region];
        rendu.annoncer(`${r.glyphe} ${r.nom}`, e.region === 2 || e.region === 3 ? "Le pas se fait plus vif" : e.region === 7 ? "Le pas s’alourdit" : "");
        jouerSon("porte");
        annoncer(`Vous entrez dans la région ${r.nom}.`);
        break;
      }
      case "laissee":
        if (e.messages.length) { montrerMessage(e.id, e.messages, "Laissée de côté", e.gain); flotterGain(e.gain); }
        break;
      case "sautee":
        montrerVecue(e.id, e.messages, { titre: "Carte sautée", gain: e.gain });
        flotterGain(e.gain); jouerSon("saut");
        break;
      case "survolee":
        montrerVecue(e.id, e.messages, { titre: "Carte survolée" });
        break;
      case "vecue": {
        const nouvelle = noterVecue(carnet, e.id);
        let regleNeuve = false;
        for (const r of e.regles) regleNeuve = noterRegle(carnet, r.id) || regleNeuve;
        sauverCarnet(carnet);
        montrerVecue(e.id, e.messages, { titre: e.titre, nouvelle, gain: e.gain, regles: e.regles });
        flotterGain(e.gain);
        rendu.reveler(e.id, signe(e.gain), p.mage.position(p.chemin));
        effets.carte(e.id, null, true);
        if (e.regles.length) { rendu.annoncer(regleNeuve ? "Règle de Belline découverte" : "Règle de Belline", e.regles[0].texte.split(" : ")[1] ?? ""); jouerSon("regle"); }
        else jouerSon(signe(e.gain) > 0 ? "gain" : signe(e.gain) < 0 ? "perte" : "neutre");
        annoncer(`${CARTE_PAR_ID[e.id].nom}. ${e.messages.join(" ")}`);
        break;
      }
      case "temps":
        montrerMessage(e.source ?? p.etat.historique.at(-1)?.id ?? 1, [e.texte], "En chemin");
        annoncer(e.texte);
        break;
      case "retenue":
        majRetenues(p.retenues, id => CARTE_PAR_ID[id].nom);
        rendu.annoncer(`${REGIONS[e.region].glyphe} ${CARTE_PAR_ID[e.id].nom}`, "retenue pour votre tirage");
        break;
      case "enigme":
        sauverCarnet(carnet);
        if (e.reussie) { jouerSon("gain"); flotterGain({ fortune: 10 }); } else jouerSon("erreur");
        break;
      case "fin": finir(e.victoire); break;
    }
  }
  traiterAttente();
}

/** Une décision attend le joueur : on ouvre le dialogue qui convient. */
async function traiterAttente() {
  if (!p.attente || enDialogue) return;
  enDialogue = true;
  controles.relacher();
  const a = p.attente;
  let reponse;
  if (a.kind === "choix") { jouerSon("choix"); reponse = await demanderChoix(a.id, p.etat); }
  else if (a.kind === "retenir") reponse = await demanderRetenue(a.region, a.candidats, conseilRetenue());
  else if (a.kind === "enigme") reponse = (await demanderEnigme(a.enigme)).index;
  enDialogue = false;
  dernierT = performance.now();
  canvas.focus({ preventScroll: true });
  traiter(resoudre(p, reponse));
}

function conseilRetenue() {
  const derniere = p.retenues.at(-1);
  return derniere ? `Votre carte précédente : ${CARTE_PAR_ID[derniere.id].nom}. Deux cartes voisines peuvent former une règle de Belline.` : "";
}

function finir(victoire) {
  mode = "fin";
  controles.relacher();
  fermerFiche();
  jouerSon(victoire ? "victoire" : "defaite");
  const record = noterPartie(carnet, score(p.etat, p.retenues));
  sauverCarnet(carnet);
  setTimeout(() => montrerLecture(lireTirage(p.etat, p.retenues), p.etat, { graine: p.graine, record, consultant, enigmes: p.enigmes }), 900);
}

// ---------- Boucle ----------
function etape(dt, commande, nouvelleCommande = false) {
  if (!p || mode !== "jeu") return;
  if (nouvelleCommande) { fermerFiche(); reprendreMain(p); }
  traiter(avancer(p, dt, commande));
}

function majVue() {
  vue = regarder(p);
  if (vue.nouvelles.length && mode !== "accueil") { for (const id of vue.nouvelles) noterVue(carnet, id); sauverCarnet(carnet); }
  const cle = vue.devant.map(d => `${d.noeud}:${d.rang}`).join(",");
  if (cle !== cleDevant) {
    cleDevant = cle;
    majDevant(vue.devant, apercu);
    const proches = vue.devant.filter(d => d.rang === 1);
    if (proches.length > 1) annoncer(`Fourche : ${proches.map(d => `${d.cote}, ${CARTE_PAR_ID[d.id].nom}`).join(" ; ")}.`);
  }
}

function boucle(t) {
  const dt = Math.min(0.1, Math.max(0, (t - dernierT) / 1000) || 0) * ACCELERATION;
  dernierT = t;
  if (!dialogueOuvert()) etape(dt, controles.commande(), controles.manuel());
  if (p) {
    majVue();
    rendu.dessiner({ p, vue, dt });
    majHud(p.etat, regionAffichee(p), mode === "jeu" ? besoinEnergie(p) : 0);
  }
  requestAnimationFrame(boucle);
}

// ---------- Actions du joueur ----------
function sautDemande() {
  if (mode !== "jeu") return;
  const r = demanderSaut(p);
  if (!r.ok && r.raison) rendu.flotter(r.raison, COULEURS.creme, p.mage.position(p.chemin));
}

function carteBleue() {
  const avant = { e: p.etat.energie, f: p.etat.fortune };
  const msgs = utiliserCarteBleue(p.etat);
  if (msgs) { montrerMessage(0, msgs, "Carte Bleue", { energie: Math.round(p.etat.energie - avant.e), fortune: Math.round(p.etat.fortune - avant.f) }); jouerSon("gain"); }
}

function apercu(noeud) {
  if (!p) return;
  const n = p.chemin.noeuds[noeud];
  const face = vue.faces.get(noeud), rang = vue.atteints.get(noeud), libre = n.etat === "libre";
  let info = "";
  if (!libre) info = { vecue: "déjà vécue", fermee: "fermée par La Destinée", sautee: "sautée", survolee: "survolée", contournee: "laissée de côté" }[n.etat];
  else if (rang == null) info = "hors d’atteinte";
  else info = `${rang === 1 ? "prochaine carte sur ce chemin" : `à ${rang} cartes`}${n.tronc ? ", sur le tronc" : ""} · sauter coûte ${coutSaut(p.etat, n.carte)} ⚡`;
  montrerApercu(n.carte, { face, info, onAller: mode === "jeu" && libre && rang != null ? () => allerVers(p, noeud) : null });
}

function toucher(e) {
  if (!p) return;
  const r = canvas.getBoundingClientRect();
  const q = rendu.versLogique(e.clientX - r.left, e.clientY - r.top);
  const z = rendu.zones.find(z => q.x >= z.x && q.x <= z.x + z.l && q.y >= z.y && q.y <= z.y + z.h);
  if (z) apercu(z.noeud);
  else if (e.pointerType === "touch") sautDemande();
}

const controles = installerCommandes({
  canvas,
  surSaut: sautDemande,
  surBleue: carteBleue,
  surToucher: toucher,
  surEchap: () => { if ($("ecran-carnet").classList.contains("visible")) cacherCarnet(); else fermerFiche(); },
  surChiffre: k => {
    const b = document.querySelector(`#dialogue.visible #dlg-boutons button[data-index="${k - 1}"]`);
    if (b && !b.disabled) { b.click(); return true; }
    return false;
  },
  enJeu: () => mode === "jeu" && !dialogueOuvert()
});

for (const b of document.querySelectorAll("[data-consultant]")) b.addEventListener("click", () => {
  consultant = b.dataset.consultant;
  longueur = +document.querySelector("input[name=longueur]:checked")?.value || 7;
  const n = parseInt($("graine").value, 10);
  nouvellePartie(Number.isFinite(n) && n > 0 ? n : null);
});
$("bouton-meme").addEventListener("click", () => nouvellePartie(p.graine));
$("bouton-nouveau").addEventListener("click", () => nouvellePartie(null));
for (const b of document.querySelectorAll("[data-carnet]")) b.addEventListener("click", () => montrerCarnet(carnet));
$("bouton-fermer-carnet").addEventListener("click", cacherCarnet);
$("bouton-bleue").addEventListener("click", carteBleue);
$("bouton-fermer-fiche").addEventListener("click", fermerFiche);
installerPleinEcran($("bouton-plein-ecran"));
const boutonSon = $("bouton-son");
const majSon = () => { boutonSon.textContent = sonActif() ? "♪ Son" : "♪ Muet"; boutonSon.setAttribute("aria-pressed", String(sonActif())); };
boutonSon.addEventListener("click", () => { basculerSon(); majSon(); });
majSon();

const ajuster = () => rendu.ajuster();
window.addEventListener("resize", ajuster);
if (window.ResizeObserver) new ResizeObserver(ajuster).observe(canvas);

// Outil de vérification (?test) : faire avancer le jeu pas à pas depuis la console ou un script.
if (new URLSearchParams(location.search).has("test")) {
  const resume = () => ({
    mode, attente: p.attente?.kind ?? null, energie: Math.round(p.etat.energie), fortune: p.etat.fortune, region: p.etat.region,
    noeud: p.mage.noeud, vers: p.mage.vers, fourche: p.mage.fourche,
    tirage: p.etat.historique.map(h => CARTE_PAR_ID[h.id].nom), retenues: p.retenues.map(r => CARTE_PAR_ID[r.id].nom),
    fiche: `${$("fiche-titre").textContent} : ${$("fiche-nom").textContent}`
  });
  window.__test = {
    pas(secondes, dx = 0, dy = 1) { for (let s = 0; s < secondes && mode === "jeu" && !dialogueOuvert(); s += 0.05) etape(0.05, { dx, dy }); return resume(); },
    sauter() { sautDemande(); return resume(); },
    resume,
    partie: () => p
  };
}

// Écran d'accueil : un chemin de démonstration en arrière-plan
p = creerPartie(nouvelleGraine(), "homme", { carnet });
requestAnimationFrame(t => { dernierT = t; requestAnimationFrame(boucle); });
