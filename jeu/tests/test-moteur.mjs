// Tests du moteur et des données. Lancer : node tests/test-moteur.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONFIG } from "../js/config.js";
import { CARTES, CARTE_PAR_ID } from "../js/data/cartes.js";
import { VOISINAGE, reglesDeclenchees } from "../js/data/voisinage.js";
import { REGIONS } from "../js/config.js";
import { creerHasard } from "../js/engine/hasard.js";
import { creerEtat, avancerTemps, multiplicateurVitesse, vue, peutSauter } from "../js/engine/state.js";
import { rencontrer, appliquerEffet, contourner, sauter, coutSaut, survoler, etatArrivee, utiliserCarteBleue } from "../js/engine/effects.js";
import { valence, VALEURS } from "../js/engine/valeurs.js";
import { construireChemin, rangs, injoignables, cheminVers, estTronc, bouleverser, partEvidente } from "../js/engine/chemin.js";
import { creerPartie, avancer, resoudre, regarder, besoinEnergie } from "../js/engine/partie.js";
import { poserEnigme, extraitNotice } from "../js/engine/enigmes.js";
import { DUEL, sacrificesRequis } from "../js/data/duel.js";
import { poserInfluence, peutRevelerInfluence, revelerInfluence, techniquesPossibles, utiliserTechnique, avancementAssociation } from "../js/engine/duel.js";
import { ALIGNEMENTS, ASSOCIATIONS } from "../js/data/techniques.js";
import { creerDuel, peutInvoquer, invoquer, activer, passerAuCombat, ciblesAttaque, attaquer, presagesActivables, reagirInvocation, finTour, actionOmbre, executerOmbre, apparitionDe, evaluer, atkEffectif, defEffectif, fusionsPossibles, fusionner, presageOmbre } from "../js/engine/duel.js";
import { FIGURES, figuresDebloquees } from "../js/data/accords.js";
import { GARDIENS, PROFILS, deckGardien, reglesEnseignees } from "../js/data/gardiens.js";
import { SCRIPTS } from "../tools/build.mjs";
import { lireTirage, score } from "../js/engine/lecture.js";
import { carnetVide, normaliserCarnet, noterVecue, noterRegle, noterPartie, avancement, noterEnigme, noterDuel, vaincreGardien } from "../js/engine/carnet.js";
import { Mage } from "../js/game/player.js";
import { jouerPartie } from "./simulateur.mjs";
import { assembler } from "../tools/build.mjs";
import { EFFET_DE_CARTE, NOMS_EFFETS } from "../js/render/effetsVisuels.js";
import { ECHOS, LECTURES, accordDeLecture, FAVORABLES, NEFASTES, MEILLEURES, definirDictionnaire, lectureDuDictionnaire } from "../js/data/lectures.js";
import { existsSync } from "node:fs";
import vm from "node:vm";
import { activer as activerDuel, accordsTerrain, accomplirAccordTerrain, terrainDe, finTour as finTourDuel, MAIN_MAX } from "../js/engine/duel.js";
import { deckGardien as deckDuGardien, GARDIENS as LES_GARDIENS } from "../js/data/gardiens.js";
import { def as defDuel, peutPoserInfluence, evolutionsPossibles, evoluer, domine, calculCombat as calculDuel, passerAuCombat as auCombatDuel, attaquer as attaquerDuel, techniquesPossibles as techniquesDuel, fusionsPossibles as fusionsDuel } from "../js/engine/duel.js";
import { SORTS, ETATS } from "../js/data/sorts.js";

let ok = 0, echecs = 0;
const test = (nom, f) => {
  try { f(); ok++; console.log("  ✓", nom); }
  catch (e) { echecs++; console.log("  ✗", nom, "\n     ", e.message.split("\n")[0]); }
};
const pile = () => 0.9, face = () => 0.1; // rng déterministes
const e0 = (c = null) => creerEtat(c);

console.log("Données");
test("53 cartes, numéros 0 à 52 uniques", () => {
  assert.equal(CARTES.length, 53);
  assert.deepEqual(CARTES.map(c => c.id).sort((a, b) => a - b), Array.from({ length: 53 }, (_, i) => i));
});
test("Familles : 3 cartes maîtresses, 7 par planète, 1 hors jeu", () => {
  const n = f => CARTES.filter(c => c.famille === f).length;
  assert.equal(n("preambule"), 3);
  for (const r of REGIONS.slice(1)) assert.equal(n(r.famille), 7, r.famille);
  assert.equal(n("hors"), 1);
});
test("Chaque carte est travaillée : nom, image, notice, symbole, mot-clé, message, effets, leçon", () => {
  for (const c of CARTES) for (const k of ["nom", "image", "notice", "symbole", "motCle", "message", "lecon"]) assert.ok(c[k], `${c.id}.${k}`);
  for (const c of CARTES) assert.ok(Array.isArray(c.effets));
});
test("Chaque mot-clé est pris dans la notice de sa carte", () => {
  const sans = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const c of CARTES) for (const mot of sans(c.motCle).split(/[^a-z]+/).filter(m => m.length >= 4))
    assert.ok(sans(c.notice).includes(mot), `${c.id} : « ${mot} » absent de la notice`);
});
test("Aucun tiret cadratin ni demi-cadratin dans les textes", () => {
  const pages = ["index.html", "chemin.html", "duel.html"].map(f => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("");
  const txt = JSON.stringify(CARTES) + JSON.stringify(VOISINAGE) + JSON.stringify(DUEL) + pages;
  assert.ok(!txt.includes("—") && !txt.includes("–"));
});
test("Symboles distincts, et aucun ne reprend le glyphe d'une planète", () => {
  const s = CARTES.map(c => c.symbole);
  assert.equal(new Set(s).size, s.length);
  for (const r of REGIONS.slice(1)) assert.ok(!s.includes(r.glyphe), r.glyphe);
});
test("Tous les effets sont connus du moteur", () => {
  const e = e0();
  const tous = c => [...c.effets, ...(c.choix || []).flatMap(x => x.effets), ...(c.contourne || [])];
  for (const c of CARTES) for (const ef of tous(c)) assert.ok(!String(appliquerEffet(e, ef, 1, pile)).startsWith("Effet inconnu"), `${c.id} ${ef.type}`);
  for (const r of VOISINAGE) for (const ef of r.effets) assert.ok(!String(appliquerEffet(e, ef, 1, pile)).startsWith("Effet inconnu"));
});
test("Règles : cartes existantes, identifiants uniques, source indiquée", () => {
  for (const r of VOISINAGE) { assert.ok(CARTE_PAR_ID[r.a]); assert.ok(CARTE_PAR_ID[r.b]); assert.ok(r.source); }
  assert.equal(new Set(VOISINAGE.map(r => r.id)).size, VOISINAGE.length);
});
test("Chaque « n° X » d'une notice a sa règle de voisinage", () => {
  for (const c of CARTES) for (const m of c.notice.matchAll(/n° (\d+)/g)) {
    const x = +m[1];
    assert.ok(VOISINAGE.some(r => (r.a === c.id && r.b === x) || (r.b === c.id && r.a === x)), `${c.id} avec ${x}`);
  }
});
test("Les cinq cartes fortes sont marquées", () => {
  assert.deepEqual(CARTES.filter(c => c.forte).map(c => c.id).sort((x, y) => x - y), [11, 34, 38, 42, 48]);
});

console.log("Chemin");
const chemins = Array.from({ length: 300 }, (_, g) => construireChemin(creerHasard(g + 1)));
test("Le chemin porte les 53 cartes, chacune une fois", () => {
  for (const ch of chemins) {
    const ids = ch.noeuds.filter(n => n.carte != null).map(n => n.carte).sort((a, b) => a - b);
    assert.deepEqual(ids, Array.from({ length: 53 }, (_, i) => i));
  }
});
test("Il monte toujours, et l'ordre des régions est celui d'Edmond", () => {
  for (const ch of chemins.slice(0, 50)) {
    ch.suivants.forEach((ss, n) => ss.forEach(s => assert.ok(ch.noeuds[s].a > ch.noeuds[n].a)));
    const portes = ch.noeuds.filter(n => n.porte != null).sort((a, b) => a.a - b.a).map(n => n.porte);
    assert.deepEqual(portes, [1, 2, 3, 4, 5, 6, 7]);
  }
});
test("La Destinée ouvre le chemin ; Étoiles, cartes fortes sur le tronc", () => {
  for (const ch of chemins) for (const n of ch.noeuds) if (n.carte != null) {
    assert.equal(!!n.tronc, estTronc(n.carte), `carte ${n.carte}`);
    if (n.carte === 1) assert.equal(n.region, 0);
    if (n.carte === 2 || n.carte === 3) assert.ok(n.region >= 1);
  }
});
test("Toute carte est atteignable depuis le départ, et l'arrivée depuis tout nœud", () => {
  for (const ch of chemins.slice(0, 50)) {
    const r = rangs(ch, ch.depart);
    for (const n of ch.noeuds) if (n.id !== ch.depart) assert.ok(r.has(n.id), `nœud ${n.id}`);
    for (const n of ch.noeuds) if (n.id !== ch.arrivee) assert.ok(cheminVers(ch, n.id, ch.arrivee), `nœud ${n.id}`);
  }
});
test("Les fourches ont deux branches, de trois cartes au plus", () => {
  for (const ch of chemins) for (const ss of ch.suivants) assert.ok(ss.length <= 2);
  for (const ch of chemins) for (const f of ch.fourches) for (const b of f) assert.ok(b.length <= 3, `branche de ${b.length}`);
});
test("Les fourches sont des dilemmes : moins d'un tiers de choix évidents", () => {
  const part = chemins.reduce((s, ch) => s + partEvidente(ch), 0) / chemins.length;
  assert.ok(part < 0.33, `${Math.round(part * 100)} % de fourches évidentes`);
});
test("Parcours progressif : un chemin court ne garde que les premières planètes", () => {
  for (let g = 1; g <= 40; g++) {
    const ch = construireChemin(creerHasard(g), { regions: 2 });
    const familles = new Set(ch.noeuds.filter(n => n.carte != null).map(n => CARTE_PAR_ID[n.carte].famille));
    for (const f of familles) assert.ok(["preambule", "soleil", "lune", "hors"].includes(f), f);
    assert.deepEqual(ch.noeuds.filter(n => n.porte != null).map(n => n.porte).sort(), [1, 2]);
  }
});
test("Même graine, même chemin", () => {
  const a = construireChemin(creerHasard(42)), b = construireChemin(creerHasard(42));
  assert.deepEqual(a.noeuds.map(n => [n.carte, n.x, n.a]), b.noeuds.map(n => [n.carte, n.x, n.a]));
});
test("Chaque règle de Belline est préparée en rendez-vous dans au moins une partie", () => {
  const vus = new Set(chemins.flatMap(ch => ch.rendezVous.map(r => r.regle)));
  for (const r of VOISINAGE) {
    if (r.ordre === "avant" && r.a === 38) continue; // Accident et une Étoile : seulement si l'Étoile tombe sous Mars
    assert.ok(vus.has(r.id), r.id);
  }
});
test("Un rendez-vous place ses deux cartes l'une après l'autre sur un même chemin", () => {
  for (const ch of chemins.slice(0, 80)) for (const rv of ch.rendezVous) {
    const [p, s] = rv.cartes.map(id => ch.noeuds.find(n => n.carte === id).id);
    const route = cheminVers(ch, p, s);
    assert.ok(route, rv.regle);
    assert.equal(route.filter(n => ch.noeuds[n].carte != null).length, 1, `${rv.regle} : une carte entre les deux`);
  }
});
test("Rangs : à une fourche, la première carte de chaque branche est au rang 1", () => {
  const ch = chemins[0];
  const f = ch.noeuds.find(n => ch.suivants[n.id].length === 2 && n.region === 1);
  const r = rangs(ch, f.id);
  for (const s of ch.suivants[f.id]) {
    let k = s; while (ch.noeuds[k].carte == null) k = ch.suivants[k][0];
    assert.equal(r.get(k), 1);
  }
});

console.log("Le mage");
test("Il monte avec ↑, s'arrête à une fourche, prend la branche indiquée", () => {
  const ch = construireChemin(creerHasard(5));
  const m = new Mage(ch);
  let fourche = false;
  for (let i = 0; i < 400 && !fourche; i++) {
    const r = m.avancer(0.05, { dx: 0, dy: 1 }, 200, ch);
    for (const a of r.arrivees) if (ch.noeuds[a.noeud].carte != null) ch.noeuds[a.noeud].etat = "vecue";
    fourche = m.fourche;
  }
  assert.ok(fourche, "le mage doit s'arrêter devant une fourche");
  const n = m.noeud;
  m.avancer(0.05, { dx: -1, dy: 0 }, 200, ch);
  assert.ok(ch.noeuds[m.vers].x < ch.noeuds[n].x, "il part à gauche");
});
test("Il saute la carte qui est devant lui", () => {
  const ch = construireChemin(creerHasard(5));
  const m = new Mage(ch);
  m.avancer(0.3, { dx: 0, dy: 1 }, 200, ch);  // vers La Destinée
  const cible = m.sauter(ch);
  assert.equal(ch.noeuds[cible].carte, 1);
  let passee = false;
  for (let i = 0; i < 60; i++) for (const a of m.avancer(0.05, { dx: 0, dy: 0 }, 150, ch).arrivees) if (a.noeud === cible && a.enSaut) passee = true;
  assert.ok(passee);
});
test("Il ne recule pas au-delà du nœud qu'il a quitté", () => {
  const ch = construireChemin(creerHasard(5));
  const m = new Mage(ch);
  m.avancer(0.2, { dx: 0, dy: 1 }, 200, ch);
  for (let i = 0; i < 20; i++) m.avancer(0.05, { dx: 0, dy: -1 }, 200, ch);
  assert.equal(m.noeud, ch.depart); assert.equal(m.vers, null);
});

console.log("Temps de marche");
test("Le temps ne passe que lorsque le mage marche", () => {
  const e = e0(); rencontrer(e, 51);
  avancerTemps(e, 10, false); assert.equal(multiplicateurVitesse(e), 0.5); assert.equal(e.energie, 100);
  avancerTemps(e, 5.1, true); assert.equal(multiplicateurVitesse(e), 1); assert.ok(e.energie < 100);
});
test("La marche use le mage", () => {
  const e = e0(); avancerTemps(e, 10, true); assert.equal(e.energie, 100 - 10 * CONFIG.usure);
});
test("Le Cloître se compte en temps réel, sans usure", () => {
  const e = e0(); rencontrer(e, 52);
  assert.equal(multiplicateurVitesse(e), 0); assert.ok(!peutSauter(e));
  avancerTemps(e, 3.1, false); assert.equal(multiplicateurVitesse(e), 1); assert.equal(e.energie, 115);
});

console.log("Préambule");
test("Destinée (ouvrir) double la prochaine carte vécue", () => { const e = e0(); rencontrer(e, 1, 0); rencontrer(e, 10); assert.equal(e.fortune, 40); });
test("Destinée (fermer) annule la prochaine carte vécue ; pas de choix à faire", () => {
  const e = e0(); rencontrer(e, 1, 1); assert.equal(etatArrivee(e, 44), "fermee"); rencontrer(e, 38); assert.equal(e.energie, 100);
});
test("Destinée : une carte sautée n'est pas « précédée » ; la suivante vécue est doublée", () => {
  const e = e0(); rencontrer(e, 1, 0); sauter(e, 38); rencontrer(e, 10); assert.equal(e.fortune, 40);
});
test("Significateur : l'Étoile du consultant applique tout, l'autre la moitié", () => {
  const h = e0("homme"); rencontrer(h, 10); rencontrer(h, 2); assert.equal(h.fortune, 40);
  const f = e0("homme"); rencontrer(f, 10); rencontrer(f, 3); assert.equal(f.fortune, 30);
});
test("Influence : un bouclier ne se coupe pas en deux", () => {
  const e = e0("homme"); rencontrer(e, 16); rencontrer(e, 3);
  assert.equal(e.boucliers, 1); assert.ok(Number.isInteger(e.boucliers));
});
test("Accident précédant l'Étoile ; Honneur précédant l'Étoile", () => {
  const a = e0(); rencontrer(a, 38); rencontrer(a, 3); assert.equal(a.energie, 100 - 20 - 20 - 15);
  const b = e0(); rencontrer(b, 7); rencontrer(b, 2); assert.equal(b.fortune, 15 + 15 + 30);
});

console.log("Soleil");
test("Nativité : un rang de vue en plus pour la carte suivante", () => { const e = e0(); rencontrer(e, 4); assert.equal(vue(e), 2); });
test("Réussite croît avec les cartes vécues", () => {
  const b = e0(); [4, 8, 9].forEach(id => rencontrer(b, id)); rencontrer(b, 5); assert.equal(b.fortune, 26);
});
test("Élévation : sauts gratuits et vue +2", () => { const e = e0(); rencontrer(e, 6); assert.equal(coutSaut(e, 38), 0); assert.equal(vue(e), 3); });
test("Pensée-Amitié : le chien donne un rang de vue", () => { const e = e0(); rencontrer(e, 8); assert.equal(vue(e), 2); avancerTemps(e, 15.1, true); assert.equal(vue(e), 1); });
test("Campagne-Santé : +20 d'énergie, pas plus lent", () => { const e = e0(); rencontrer(e, 9); assert.equal(e.energie, 120); assert.equal(multiplicateurVitesse(e), 0.5); });
test("Présents arrive même contourné ou sauté", () => {
  const a = e0(); contourner(a, 10); assert.equal(a.fortune, 20);
  const b = e0(); sauter(b, 10); assert.equal(b.fortune, 20);
});
test("Sauter coûte 6 d'énergie, 15 pour une carte forte", () => {
  const e = e0(); sauter(e, 46); assert.equal(e.energie, 94); sauter(e, 48); assert.equal(e.energie, 79);
});

console.log("Lune");
test("Trahison minimise la bonne carte précédente et affaiblit le gain suivant", () => {
  const a = e0(); rencontrer(a, 10); rencontrer(a, 11); assert.equal(a.fortune, 10);
  const b = e0(); rencontrer(b, 11); rencontrer(b, 10); assert.equal(b.fortune, 10);
});
test("Départ : la carte suivante est survolée", () => {
  const e = e0(); rencontrer(e, 12); assert.equal(etatArrivee(e, 48), "survolee"); survoler(e, 48); assert.equal(e.energie, 100);
});
test("Inconstance : la promesse n'est pas tenue", () => { const e = e0(); rencontrer(e, 13, null, pile); avancerTemps(e, 6.1, true); assert.equal(e.fortune, 0); });
test("Découverte : quatre rangs de vue en plus", () => { const e = e0(); rencontrer(e, 14); assert.equal(vue(e), 5); });
test("Eau : passivité, plus de saut", () => { const e = e0(); rencontrer(e, 15); assert.ok(!peutSauter(e)); avancerTemps(e, 3.1, true); assert.ok(peutSauter(e)); });
test("Pénates : un bouclier qui absorbe une perte", () => { const e = e0(); rencontrer(e, 16); rencontrer(e, 35); assert.equal(e.energie, 110); });
test("Maladie : malaise pour le mage en forme, remède pour le mage affaibli", () => {
  const a = e0(); rencontrer(a, 17); assert.equal(a.energie, 85);
  const b = e0(); b.energie = 40; rencontrer(b, 17); assert.equal(b.energie, 55);
});

console.log("Mercure");
test("Changement : lunaison vers une autre région, puis retour", () => {
  const e = e0(); e.region = 3; rencontrer(e, 18, null, face);
  assert.ok(e.lunaisonRegion >= 1 && e.lunaisonRegion !== 3); avancerTemps(e, 8.1, true); assert.equal(e.lunaisonRegion, null);
});
test("Argent : encaisser 25, ou placer pour 40 par la suite", () => {
  const a = e0(); rencontrer(a, 19, 0); assert.equal(a.fortune, 25);
  const b = e0(); rencontrer(b, 19, 1); assert.equal(b.fortune, 0); avancerTemps(b, 10.1, true); assert.equal(b.fortune, 40);
});
test("Intelligence : discernement et vue", () => { const e = e0(); rencontrer(e, 20); assert.ok(e.minuteurs.discernement > 0); assert.equal(vue(e), 3); });
test("Vol-Perte : la fortune d'abord, puis l'énergie", () => {
  const e = e0(); e.fortune = 10; rencontrer(e, 21); assert.equal(e.fortune, 0); assert.equal(e.energie, 85);
});
test("Entreprises : le projet aboutit sans perte, échoue sinon", () => {
  const a = e0(); rencontrer(a, 22); rencontrer(a, 25); rencontrer(a, 29); assert.equal(a.fortune, 35);
  const b = e0(); rencontrer(b, 22); rencontrer(b, 35); rencontrer(b, 25); assert.equal(b.fortune, 0);
});
test("Trafic : vendre, ou acheter si l'on a de quoi", () => {
  const a = e0(); rencontrer(a, 23, 0); assert.equal(a.fortune, 25); assert.equal(a.energie, 85);
  const b = e0(); rencontrer(b, 23, 1); assert.equal(b.fortune, 0); assert.equal(b.energie, 100);
});
test("Nouvelle reste cachée jusqu'au bout ; elle dévoile trois rangs", () => {
  assert.ok(CARTE_PAR_ID[24].surprise); const e = e0(); rencontrer(e, 24); assert.equal(vue(e), 4);
});

console.log("Vénus");
test("Plaisirs : +15 et un bijou", () => { const e = e0(); rencontrer(e, 25); assert.equal(e.energie, 115); assert.ok(e.parure); });
test("Paix : les entraves tombent", () => { const e = e0(); rencontrer(e, 34); rencontrer(e, 26); assert.equal(multiplicateurVitesse(e), 1); assert.equal(e.minuteurs.aveuglement, 0); });
test("Union : la dernière carte laissée revient", () => {
  const e = e0(); contourner(e, 30); const r = rencontrer(e, 27); assert.equal(r.retour, 30);
  const r2 = rencontrer(e, 30, 1, Math.random, { retour: true });
  assert.ok(r2.regles.some(x => x.id === "27-30"));
});
test("Famille : un bouclier, deux si le chien accompagne le mage", () => {
  const a = e0(); rencontrer(a, 28); assert.equal(a.boucliers, 1);
  const b = e0(); rencontrer(b, 8); rencontrer(b, 28); assert.equal(b.boucliers, 2);
});
test("Amor : le mage regagne de l'énergie en marchant", () => { const e = e0(); rencontrer(e, 29); avancerTemps(e, 10, true); assert.equal(Math.round(e.energie), 120); });
test("Table : accepter ou décliner l'invitation", () => {
  const a = e0(); rencontrer(a, 30, 0); assert.equal(a.energie, 120); const b = e0(); rencontrer(b, 30, 1); assert.equal(b.energie, 100);
});
test("Passions : le feu de paille s'éteint", () => {
  const e = e0(); rencontrer(e, 31); assert.equal(e.energie, 125); avancerTemps(e, 6.1, false); assert.equal(e.energie, 125);
  avancerTemps(e, 6.1, true); assert.ok(e.energie < 100);
});

console.log("Mars");
test("Méchanceté : l'envie vise la fortune, sinon la personne", () => {
  const a = e0(); a.fortune = 100; rencontrer(a, 32); assert.equal(a.fortune, 70);
  const b = e0(); rencontrer(b, 32); assert.equal(b.energie, 90);
});
test("Procès : transiger coûte 15 ; plaider se joue à pile ou face", () => {
  const a = e0(); rencontrer(a, 33, 0); assert.equal(a.fortune, -15);
  const b = e0(); rencontrer(b, 33, 1, pile); assert.equal(b.fortune, 30);
});
test("Despotisme : aveuglement, plus aucune carte visible", () => { const e = e0(); rencontrer(e, 34); assert.equal(vue(e), 0); });
test("Ennemis : déclarés, toujours visibles ; -20", () => { assert.ok(CARTE_PAR_ID[35].declaree); const e = e0(); rencontrer(e, 35); assert.equal(e.energie, 80); });
test("Pourparlers : négocier rapporte plus, mais ralentit", () => {
  const a = e0(); rencontrer(a, 36, 0); assert.equal(a.fortune, 15); assert.equal(multiplicateurVitesse(a), 0.5);
});
test("Feu : le pas s'accélère", () => { const e = e0(); rencontrer(e, 37); assert.equal(multiplicateurVitesse(e), 1.5); });
test("Accident : détruit les boucliers et rebat les cartes de la région", () => {
  const e = e0(); rencontrer(e, 39); rencontrer(e, 38); assert.equal(e.boucliers, 0); assert.equal(e.energie, 80);
  const ch = construireChemin(creerHasard(9));
  const region = 5, avant = ch.noeuds.filter(n => n.region === region && n.carte != null && !n.tronc).map(n => n.carte);
  const f = creerEtat(); f.region = region;
  const depuis = ch.noeuds.find(n => n.porte === region).id;
  rencontrer(f, 38, null, creerHasard(3), { region, bouleverser: () => bouleverser(ch, region, depuis, creerHasard(3)) });
  const apres = ch.noeuds.filter(n => n.region === region && n.carte != null && !n.tronc).map(n => n.carte);
  assert.deepEqual([...apres].sort(), [...avant].sort());
});

console.log("Jupiter");
test("Appui : deux boucliers", () => { const e = e0(); rencontrer(e, 39); assert.equal(e.boucliers, 2); });
test("Beauté : la fortune arrive par la suite", () => { const e = e0(); rencontrer(e, 40); assert.equal(e.fortune, 0); avancerTemps(e, 8.1, true); assert.equal(e.fortune, 35); });
test("Héritage : la meilleure carte du passé redonne ses gains", () => { const e = e0(); rencontrer(e, 19, 0); rencontrer(e, 46); rencontrer(e, 41); assert.equal(e.fortune, 50); });
test("Sagesse : gains et pertes divisés par deux", () => { const e = e0(); rencontrer(e, 42); rencontrer(e, 35); assert.equal(e.energie, 90); });
test("Renommée suit la carte qui l'accompagne", () => {
  const a = e0(); rencontrer(a, 10); rencontrer(a, 43); assert.equal(a.fortune, 40);
  const b = e0(); rencontrer(b, 35); rencontrer(b, 43); assert.equal(b.fortune, -20);
});
test("Hazard : la mise est la moitié de la fortune", () => {
  const e = e0(); e.fortune = 100; rencontrer(e, 44, 0, pile); assert.equal(e.fortune, 150);
});
test("Hazard misé puis Ruine : ruine au jeu ; passé, pas de ruine au jeu", () => {
  const a = e0(); rencontrer(a, 44, 0, pile); rencontrer(a, 50); assert.equal(a.fortune, 10 - 20 - 40);
  const b = e0(); rencontrer(b, 44, 1); const r = rencontrer(b, 50); assert.equal(r.regles.length, 0); assert.equal(b.fortune, -20);
});
test("Bonheur : l'énergie à son comble", () => { const e = e0(); rencontrer(e, 45); assert.equal(e.energie, e.energieMax); });

console.log("Saturne");
test("Infortune : -10 et un long ralentissement", () => { const e = e0(); rencontrer(e, 46); assert.equal(e.energie, 90); assert.equal(e.minuteurs.ralenti, 6); });
test("Stérilité suspend les gains, et rend vaines les espérances échues", () => {
  const a = e0(); rencontrer(a, 47); rencontrer(a, 19, 0); assert.equal(a.fortune, 0);
  const b = e0(); rencontrer(b, 40); rencontrer(b, 47); avancerTemps(b, 8.1, true); assert.equal(b.fortune, 0);
});
test("Fatalité abaisse l'énergie maximale", () => { const e = e0(); rencontrer(e, 48); assert.equal(e.energieMax, 125); assert.equal(e.energie, 80); });
test("Grâce rend la dernière perte", () => { const e = e0(); rencontrer(e, 35); rencontrer(e, 49); assert.equal(e.energie, 110); });
test("Maladie puis Grâce : guérison", () => { const e = e0(); rencontrer(e, 17); rencontrer(e, 49); assert.ok(lireTirage(e).regles.some(r => r.id === "17-49")); });
test("Ruine : faillite et dépérissement", () => { const e = e0(); rencontrer(e, 50); assert.equal(e.fortune, -20); avancerTemps(e, 1, true); assert.equal(Math.round(e.energie), Math.round(100 - 2 * CONFIG.usure)); });
test("Retard repousse les espérances", () => { const e = e0(); rencontrer(e, 40); rencontrer(e, 51); avancerTemps(e, 8.1, true); assert.equal(e.fortune, 0); avancerTemps(e, 5, true); assert.equal(e.fortune, 35); });
test("Cloître et Infortune : hospice", () => { const e = e0(); rencontrer(e, 52); const r = rencontrer(e, 46); assert.ok(r.regles.some(x => x.id === "52-46")); });

console.log("Carte Bleue");
test("Elle remplace la dernière carte vécue", () => {
  const e = e0(); rencontrer(e, 0); rencontrer(e, 35); assert.equal(e.energie, 90);
  utiliserCarteBleue(e); assert.equal(e.energie, 110); assert.ok(!e.carteBleue);
  assert.equal(utiliserCarteBleue(e), null);
});

console.log("Règles, lecture, carnet");
test("Règle « avant » : l'ordre compte", () => {
  assert.equal(reglesDeclenchees({ id: 38 }, { id: 2 }).length, 1);
  assert.equal(reglesDeclenchees({ id: 2 }, { id: 38 }).length, 0);
});
test("Les espérances échues signalent la carte d'origine", () => {
  const e = e0(); rencontrer(e, 40); rencontrer(e, 51); const msgs = avancerTemps(e, 13.1, true);
  assert.equal(msgs.at(-1).source, 40);
});
test("La lecture nomme le significateur et ce qu'il a reçu", () => {
  const e = e0("femme"); rencontrer(e, 1, 0); rencontrer(e, 7); rencontrer(e, 3);
  const l = lireTirage(e);
  assert.equal(l.significateur.recu, 7); assert.equal(l.premierPlan.carte, 7); assert.ok(l.regles.some(r => r.id === "7>3"));
  assert.ok(score(e) > 0);
});
test("Le carnet se remplit et survit à une donnée abîmée", () => {
  const c = carnetVide(); assert.ok(noterVecue(c, 5)); assert.ok(!noterVecue(c, 5)); assert.ok(noterRegle(c, "17-49"));
  assert.ok(noterPartie(c, 120)); assert.equal(avancement(c).regles, 1);
  assert.deepEqual(normaliserCarnet("n'importe quoi"), carnetVide());
  assert.equal(normaliserCarnet(JSON.parse(JSON.stringify(c))).cartes[5].vecue, 2);
});
test("Discernement : la valence ne modifie pas l'état", () => {
  const e = e0(); const avant = JSON.stringify(e); assert.ok(valence(e, 35) < 0); assert.ok(valence(e, 45) > 0); assert.equal(JSON.stringify(e), avant);
});
test("Valeurs justes : feu de paille et procès ne sont pas des gains ; Amor, Appui, Beauté le sont", () => {
  assert.ok(VALEURS[31] <= 5, `Passions ${VALEURS[31]}`); assert.ok(VALEURS[33] <= 5, `Procès ${VALEURS[33]}`);
  for (const id of [29, 39, 40]) assert.ok(VALEURS[id] > 15, `${CARTE_PAR_ID[id].nom} ${VALEURS[id]}`);
});

console.log("Partie, portes, énigmes");
test("À la porte : retenir une carte de la région quittée, puis une énigme", () => {
  const p = creerPartie(777, "homme");
  const vu = new Set();
  for (let i = 0; i < 6000 && !p.fini; i++) {
    if (p.attente) {
      const a = p.attente; vu.add(a.kind);
      resoudre(p, a.kind === "choix" ? 0 : a.kind === "retenir" ? a.candidats[0] : a.enigme.bonne);
      continue;
    }
    const fourche = p.mage.vers == null && p.chemin.suivants[p.mage.noeud].length === 2;
    avancer(p, 0.1, fourche ? { dx: -1, dy: 0.4 } : { dx: 0, dy: 1 });
    if (i % 5 === 0) regarder(p);
  }
  assert.ok(vu.has("retenir") && vu.has("enigme"));
  assert.ok(p.fini);
  assert.equal(new Set(p.retenues.map(r => r.region)).size, p.retenues.length, "une carte par région");
  assert.ok(p.enigmes.reussies === p.enigmes.posees && p.enigmes.posees >= 3, `${p.enigmes.posees} énigmes`);
});
test("Énigme : manquée, la carte passe « à revoir » et revient", () => {
  const c = carnetVide(); noterEnigme(c, 17, false); assert.equal(c.aRevoir[17], 3);
  noterEnigme(c, 17, true); assert.equal(c.aRevoir[17], 2);
  let vise = 0;
  for (let g = 1; g <= 40; g++) if (poserEnigme([17, 49, 4, 9, 10], creerHasard(g), c.aRevoir).carte === 17) vise++;
  assert.ok(vise >= 20, `la carte à revoir revient ${vise} fois sur 40`);
});
test("Les extraits de notice ne trahissent pas le nom de la carte", () => {
  for (const c of CARTES) {
    const x = extraitNotice(c);
    if (x) for (const mot of c.nom.toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿœ]+/).filter(m => m.length > 3)) assert.ok(!x.toLowerCase().includes(mot), `${c.nom} : ${x}`);
  }
});
test("L'énergie prévue pour la prochaine porte est positive au départ", () => {
  assert.ok(besoinEnergie(creerPartie(5, "homme")) > 0);
});
test("Le tirage composé : les accords entre cartes retenues comptent au score", () => {
  const e = e0(); rencontrer(e, 17); rencontrer(e, 4); rencontrer(e, 49);
  const ret = [{ region: 2, id: 17 }, { region: 7, id: 49 }];
  const l = lireTirage(e, ret);
  assert.equal(l.tirage.length, 2); assert.ok(l.accords.some(a => a.id === "17-49"));
  assert.ok(score(e, ret) > score(e, []));
});

console.log("Le Duel des Apparitions");
const duelVide = (graine = 1, options = {}) => {
  const d = creerDuel(creerHasard(graine), "homme", { premier: 0, ...options });
  for (const J of d.joueurs) { J.main = []; J.monstres.fill(null); J.presages.fill(null); }
  return d;
};
const poserMonstre = (d, j, place, id, position = "attaque") => { const m = apparitionDe(id, null); m.position = position; m.invoqueTour = 0; d.joueurs[j].monstres[place] = m; return m; };
const auCombat = d => { d.tour = Math.max(d.tour, 3); passerAuCombat(d); };

test("Chaque carte a sa fiche de duel, tirée d'un mot de sa notice", () => {
  for (const c of CARTES) {
    const x = DUEL[c.id]; assert.ok(x, `${c.id}`);
    assert.ok(c.notice.toLowerCase().includes(x.mot.toLowerCase()), `${c.nom} : « ${x.mot} »`);
    assert.ok(["apparition", "influence", "presage"].includes(x.type), c.nom);
    if (x.type === "apparition") assert.ok(x.niveau >= 1 && x.niveau <= 8 && x.atk >= 0 && x.def >= 0, c.nom);
    if (x.type === "presage") assert.ok(["attaque", "invocation", "influence"].includes(x.declencheur), c.nom);
    assert.equal(!!x.forte, !!c.forte, `${c.nom} : carte forte`);
    if (x.forte) assert.equal(sacrificesRequis(c.id), 2, `${c.nom} : deux sacrifices`);
  }
});
test("Une vraie courbe : assez de petites apparitions (niveau 4 au plus), des moyennes, des fortes, neuf présages", () => {
  const app = CARTES.map(c => DUEL[c.id]).filter(x => x.type === "apparition");
  assert.ok(app.filter(x => x.niveau <= 4).length >= 15, "trop peu de petites cartes : la main se bloque");
  assert.ok(app.filter(x => x.niveau >= 5 && x.niveau <= 6).length >= 3);
  assert.ok(CARTES.filter(c => DUEL[c.id].type === "presage").length >= 9);
});
test("Les figures d'accord : une par règle, avec ses deux cartes, et un nom pris dans la règle", () => {
  const couvertes = new Set(Object.values(FIGURES).flatMap(f => f.regles));
  for (const r of VOISINAGE) assert.ok(couvertes.has(r.id), r.id);
  for (const f of Object.values(FIGURES)) {
    const r = VOISINAGE.find(x => x.id === f.regles[0]);
    for (const m of f.materiaux) for (const id of [].concat(m)) assert.ok(r.a === id || r.b === id || f.regles.some(g => VOISINAGE.find(x => x.id === g).b === id), `${f.nom} : ${id}`);
    const mots = f.nom.toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿœ’]+/).filter(m => m.length > 3);
    assert.ok(mots.some(m => r.texte.toLowerCase().includes(m)), `${f.nom} : nom absent de « ${r.texte} »`);
  }
  assert.deepEqual(figuresDebloquees({ "17-49": true }), [106]);
});
test("8000 points de vie, six cartes en main, pile ou face, pas d'attaque au premier tour", () => {
  const premiers = new Set();
  for (let g = 1; g <= 20; g++) premiers.add(creerDuel(creerHasard(g)).premier);
  assert.deepEqual([...premiers].sort(), [0, 1]);
  const d = creerDuel(creerHasard(3), "homme", { premier: 0 });
  assert.equal(d.joueurs[0].lp, 8000); assert.equal(d.joueurs[0].main.length, 6);
  poserMonstre(d, 0, 0, 37); passerAuCombat(d);
  assert.deepEqual(ciblesAttaque(d, 0, 0), []);
});
test("Une invocation par tour ; niveau 5 : un sacrifice ; carte forte : deux", () => {
  const d = duelVide(4); d.joueurs[0].main = [37, 32];
  invoquer(d, 0, 0, {}, creerHasard(1));
  assert.equal(peutInvoquer(d, 0, 0).ok, false);
  const e = duelVide(5); e.joueurs[0].main = [35];
  assert.equal(peutInvoquer(e, 0, 0).offrande, 1, "sans apparition à sacrifier : l'offrande de points de vie");
  e.joueurs[0].lp = 1000; assert.equal(peutInvoquer(e, 0, 0).ok, false, "pas assez de points de vie pour l'offrande");
  e.joueurs[0].lp = 8000; poserMonstre(e, 0, 0, 4); assert.equal(peutInvoquer(e, 0, 0).ok, true); assert.equal(peutInvoquer(e, 0, 0).offrande, 0);
  const o = duelVide(7); o.joueurs[0].main = [35];
  invoquer(o, 0, 0, {}, creerHasard(1)); assert.equal(o.joueurs[0].lp, 8000 - 1500); assert.equal(o.joueurs[0].monstres.find(Boolean).id, 35);
  const f = duelVide(6); f.joueurs[0].main = [48]; poserMonstre(f, 0, 0, 4);
  poserMonstre(f, 0, 1, 8);
  invoquer(f, 0, 0, { sacrifices: [0, 1] }, creerHasard(1));
  assert.equal(f.joueurs[0].monstres.filter(Boolean).length, 1); assert.equal(f.joueurs[0].monstres.find(Boolean).id, 48);
});
test("Combat : ATK contre ATK, la différence en dégâts", () => {
  const d = duelVide(7);
  poserMonstre(d, 0, 0, 37); poserMonstre(d, 1, 0, 32);   // Feu 1800 contre Méchanceté 1600
  auCombat(d); attaquer(d, 0, 0, 0, creerHasard(1));
  assert.equal(d.joueurs[1].monstres[0], null); assert.equal(d.joueurs[1].lp, 7800);
});
test("Combat : contre la défense ; perçant ; défense trop forte, l'attaquant paie", () => {
  const d = duelVide(8);
  poserMonstre(d, 0, 0, 32); poserMonstre(d, 1, 0, 46, "defense");  // 1600 contre DEF 800
  auCombat(d); attaquer(d, 0, 0, 0, creerHasard(1));
  assert.equal(d.joueurs[1].monstres[0], null); assert.equal(d.joueurs[1].lp, 8000);
  const e = duelVide(9);
  poserMonstre(e, 0, 0, 37); poserMonstre(e, 1, 0, 46, "defense");  // Feu 1800, perçant
  auCombat(e); attaquer(e, 0, 0, 0, creerHasard(1));
  assert.equal(e.joueurs[1].lp, 7000);
  const f = duelVide(10);
  poserMonstre(f, 0, 0, 32); poserMonstre(f, 1, 0, 39, "defense");  // 1600 + 500 (Mars domine Jupiter) contre Appui DEF 2600
  auCombat(f); attaquer(f, 0, 0, 0, creerHasard(1));
  assert.equal(f.joueurs[0].lp, 7500); assert.ok(f.joueurs[1].monstres[0]);
});
test("Affinité planétaire et terrain", () => {
  const d = duelVide(11, { terrain: "mars" });
  const a = poserMonstre(d, 0, 0, 37); poserMonstre(d, 0, 1, 32);   // deux apparitions de Mars
  assert.equal(atkEffectif(d, 0, a), 1800 + 200 + 300);
  assert.equal(defEffectif(d, 0, a), 600 + 300);
  const m = poserMonstre(d, 0, 2, 8); assert.equal(atkEffectif(d, 0, m), 1200);  // Soleil : rien
});
test("Gardiens d'abord ; attaque directe quand le terrain adverse est vide", () => {
  const d = duelVide(12);
  poserMonstre(d, 0, 0, 37); poserMonstre(d, 1, 0, 32); poserMonstre(d, 1, 1, 8);
  auCombat(d); assert.deepEqual(ciblesAttaque(d, 0, 0), [1]);
  const e = duelVide(13); poserMonstre(e, 0, 0, 37); auCombat(e);
  assert.deepEqual(ciblesAttaque(e, 0, 0), ["direct"]);
  attaquer(e, 0, 0, "direct", creerHasard(1)); assert.equal(e.joueurs[1].lp, 6200);
});
test("Présages : Retard annule ; Échec détruit ; pas le tour de leur pose", () => {
  const d = duelVide(14);
  poserMonstre(d, 0, 0, 37);
  d.joueurs[1].presages[0] = { uid: 1, id: 51, poseTour: 1 };
  d.joueurs[1].presages[1] = { uid: 2, id: 50, poseTour: 99 };
  auCombat(d);
  assert.deepEqual(presagesActivables(d, 1, "attaque"), [0]);
  attaquer(d, 0, 0, "direct", creerHasard(1), 0);
  assert.equal(d.joueurs[1].lp, 8000); assert.ok(d.joueurs[0].monstres[0].bloque > 0);
  const e = duelVide(15); poserMonstre(e, 0, 0, 37); e.joueurs[1].presages[0] = { uid: 3, id: 50, poseTour: 1 }; auCombat(e);
  attaquer(e, 0, 0, "direct", creerHasard(1), 0);
  assert.equal(e.joueurs[0].monstres[0], null); assert.equal(e.joueurs[1].lp, 8000);
});
test("Chaîne : Stérilité répond à une influence, qui ne produit rien", () => {
  const d = duelVide(16); d.tour = 3;
  d.joueurs[0].main = [45];
  d.joueurs[1].presages[0] = { uid: 4, id: 47, poseTour: 1 };
  const ev = activer(d, 0, 0, { contre: 0 }, creerHasard(1));
  assert.equal(d.joueurs[0].lp, 8000);
  assert.ok(ev.some(e => e.type === "presage" && e.maillon === 2));
});
test("Présage d'invocation : Eau met en défense et bloque l'apparition invoquée", () => {
  const d = duelVide(17); d.tour = 3;
  d.joueurs[1].presages[0] = { uid: 5, id: 15, poseTour: 1 };
  d.joueurs[0].main = [37];
  const ev = invoquer(d, 0, 0, {}, creerHasard(1));
  const inv = ev.find(e => e.type === "invocation");
  reagirInvocation(d, 1, 0, inv.place);
  const m = d.joueurs[0].monstres[inv.place];
  assert.equal(m.position, "defense"); assert.ok(m.bloque > 0);
});
test("Équipement et influence continue", () => {
  const d = duelVide(18);
  poserMonstre(d, 0, 0, 37); d.joueurs[0].main = [6, 40];
  activer(d, 0, 0, {}, creerHasard(1));
  assert.equal(d.joueurs[0].monstres[0].atk, 2600); assert.deepEqual(d.joueurs[0].monstres[0].equipements, [6]);
  activer(d, 0, 0, {}, creerHasard(1));
  assert.ok(d.joueurs[0].presages.some(p => p && p.continue));
  finTour(d, creerHasard(1)); finTour(d, creerHasard(1));
  assert.equal(d.joueurs[0].lp, 8300);
});
test("Figure d'accord : Maladie et Grâce donnent la Guérison", () => {
  const d = duelVide(19, { reserves: [[106], []] });
  d.joueurs[0].main = [17, 49];
  const options = fusionsPossibles(d, 0);
  assert.equal(options.length, 1);
  const ev = fusionner(d, 0, 106, creerHasard(1));
  assert.ok(ev.some(e => e.type === "fusion"));
  assert.equal(d.joueurs[0].monstres.find(Boolean).id, 106);
  assert.equal(d.joueurs[0].lp, 9000);
  assert.ok(d.joueurs[0].cimetiere.includes(17) && d.joueurs[0].cimetiere.includes(49));
  assert.equal(fusionsPossibles(d, 0).length, 0, "une figure par tour");
});
test("Accord de Belline : Maladie puis Grâce rend des points de vie et une carte", () => {
  const d = duelVide(20);
  d.joueurs[0].lp = 7000; d.joueurs[0].main = [17, 49];
  activer(d, 0, 0, {}, creerHasard(1));
  const ev = invoquer(d, 0, 0, {}, creerHasard(1));
  assert.ok(ev.some(e => e.type === "accord" && e.favorable));
  assert.equal(d.joueurs[0].lp, 7000 + 600 + 1000); assert.equal(d.joueurs[0].main.length, 1);
  assert.ok(d.joueurs[0].reserve.includes(106), "la règle accomplie fait entrer sa figure (Guérison) dans la réserve");
});
test("L'Étoile rejoue la carte précédente, à moitié si ce n'est pas la vôtre", () => {
  const a = duelVide(21); a.joueurs[0].consultant = "homme"; a.joueurs[0].main = [45, 2];
  activer(a, 0, 0, {}, creerHasard(1)); activer(a, 0, 0, {}, creerHasard(1));
  assert.equal(a.joueurs[0].lp, 11000);
  const b = duelVide(21); b.joueurs[0].consultant = "homme"; b.joueurs[0].main = [45, 3];
  activer(b, 0, 0, {}, creerHasard(1)); activer(b, 0, 0, {}, creerHasard(1));
  assert.equal(b.joueurs[0].lp, 10250);
});
test("Les Gardiens : un deck à leur couleur, des règles à enseigner", () => {
  for (const g of GARDIENS) {
    const deckG = deckGardien(g, creerHasard(1));
    assert.equal(deckG.length, 35); assert.equal(new Set(deckG).size, 35);
    assert.ok(CARTES.filter(c => c.famille === g.famille).every(c => deckG.includes(c.id)));
    assert.ok(reglesEnseignees(g).length > 0, g.nom);
  }
  const c = carnetVide();
  const appris = vaincreGardien(c, "lune", reglesEnseignees(GARDIENS[1]));
  assert.ok(appris.length > 0 && c.gardiens.includes("lune"));
});
test("L'Ombre joue des tours entiers et les duels se terminent ; le Mage bat le plus souvent le Novice", () => {
  let fins = 0, mage = 0;
  const toutes = Object.keys(FIGURES).map(Number);
  for (let g = 1; g <= 40; g++) {
    const rng = creerHasard(g), d = creerDuel(rng, "homme", { reserves: [toutes, toutes], profils: [PROFILS.novice, PROFILS.mage] });
    d.joueurs[0].profil = PROFILS.novice;
    for (let t = 0; t < 300 && !d.fini; t++) {
      for (let s = 0; s < 40 && !d.fini; s++) {
        const a = actionOmbre(d, d.joueurs[d.actif].profil, rng); if (a.type === "fin") break;
        const k = 1 - d.actif, r = a.type === "attaquer" ? presageOmbre(d, k, "attaque", { place: a.place, cible: a.cible }) : null;
        const ev = executerOmbre(d, a, rng, r); if (ev.length === 1 && ev[0].type === "refus") break;
      }
      if (!d.fini) finTour(d, rng);
    }
    if (d.fini) fins++;
    if (d.gagnant === 1) mage++;
  }
  assert.equal(fins, 40);
  assert.ok(mage >= 26, `le Mage gagne ${mage} fois sur 40`);
  assert.ok(Number.isFinite(evaluer(creerDuel(creerHasard(1)), 0)));
});
test("Le carnet compte les duels", () => { const c = carnetVide(); noterDuel(c, true); noterDuel(c, false); assert.deepEqual(c.duels, { joues: 2, gagnes: 1 }); });

console.log("Parties simulées");
test("Équilibre : celui qui lit les cartes gagne bien plus souvent que celui qui va au hasard", () => {
  let hasard = 0, avise = 0;
  for (let g = 1; g <= 60; g++) { if (!jouerPartie(g, "hasard").etat.victoire) hasard++; if (!jouerPartie(g, "avise").etat.victoire) avise++; }
  assert.ok(hasard >= 10 && hasard <= 40, `défaites au hasard : ${hasard}/60`);
  assert.ok(avise <= 8, `défaites en lisant : ${avise}/60`);
  assert.ok(avise < hasard / 2);
});
test("Les règles de Belline se produisent en jeu (et pas seulement en test)", () => {
  const vues = new Set();
  for (let g = 1; g <= 120; g++) for (const h of jouerPartie(g, g % 2 ? "hasard" : "avise").etat.historique) h.regles.forEach(r => vues.add(r));
  assert.ok(vues.size >= 18, `${vues.size} règles différentes vues`);
});

console.log("Influences posées et techniques");
test("Une influence se pose face cachée et se révèle au tour suivant", () => {
  const d = creerDuel(creerHasard(5), "homme", { premier: 0 });
  d.joueurs[0].main = [45, 10];
  const ev = poserInfluence(d, 0, 0);
  assert.equal(ev[0].type, "posePresage");
  const place = ev[0].place;
  assert.ok(d.joueurs[0].presages[place].influence);
  assert.equal(peutRevelerInfluence(d, 0, place).ok, false, "pas le tour même");
  d.tour += 2;
  const lp = d.joueurs[0].lp;
  const ev2 = revelerInfluence(d, 0, place, {}, creerHasard(1));
  assert.ok(ev2.some(e => e.type === "influence" && e.revelee));
  assert.equal(d.joueurs[0].lp, lp + 1500);
  assert.equal(d.joueurs[0].presages[place], null);
  assert.ok(d.joueurs[0].cimetiere.includes(45));
  assert.ok(d.joueurs[0].reveles.includes(45));
});
test("Une influence posée n'est pas un présage : elle ne répond jamais à l'adversaire", () => {
  const d = creerDuel(creerHasard(5), "homme", { premier: 0 });
  d.joueurs[1].presages[0] = { uid: 1, id: 45, influence: true, poseTour: 0 };
  for (const k of ["attaque", "invocation", "influence"]) assert.deepEqual(presagesActivables(d, 1, k), []);
});
test("Alignement : trois apparitions du Soleil transforment le terrain et révèlent les cartes cachées", () => {
  const d = creerDuel(creerHasard(5), "homme", { premier: 0, terrain: "mars" });
  for (const [k, id] of [[0, 4], [1, 7], [2, 8]]) d.joueurs[0].monstres[k] = apparitionDe(id, d);
  const cachee = apparitionDe(37, d); cachee.faceCachee = true; cachee.position = "defense"; d.joueurs[1].monstres[0] = cachee;
  const t = techniquesPossibles(d, 0).find(x => x.cle === "alignement:soleil");
  assert.ok(t);
  const ev = utiliserTechnique(d, 0, "alignement:soleil", creerHasard(1));
  assert.equal(d.terrain, "soleil");
  assert.ok(ev.some(e => e.type === "terrain"));
  assert.equal(d.joueurs[1].monstres[0].faceCachee, false);
  assert.equal(techniquesPossibles(d, 0).length, 0, "une technique par tour");
});
test("Chaque planète a son alignement", () => {
  for (const f of ["soleil", "lune", "mercure", "venus", "mars", "jupiter", "saturne"]) assert.ok(ALIGNEMENTS[f]?.effets.length, f);
});
test("Association : les trois freins, une fois par duel", () => {
  const d = creerDuel(creerHasard(5), "homme", { premier: 0 });
  d.joueurs[0].reveles = [47, 51];
  assert.ok(!techniquesPossibles(d, 0).some(t => t.cle === "association:freins"));
  d.joueurs[0].reveles.push(52);
  const m = apparitionDe(37, d); d.joueurs[1].monstres[2] = m;
  utiliserTechnique(d, 0, "association:freins", creerHasard(1));
  assert.ok(d.joueurs[1].monstres[2].bloque >= 2);
  assert.ok(d.joueurs[1].sterile);
  d.joueurs[0].techniqueFaite = false;
  assert.ok(!techniquesPossibles(d, 0).some(t => t.cle === "association:freins"));
});
test("Les associations ne nomment que des cartes du jeu, et le tour du ciel compte les planètes", () => {
  for (const a of ASSOCIATIONS) for (const id of a.cartes || []) assert.ok(CARTE_PAR_ID[id], `${a.id} : ${id}`);
  const ciel = ASSOCIATIONS.find(a => a.id === "ciel");
  assert.deepEqual(avancementAssociation({ reveles: [4, 11, 18, 25, 32, 39] }, ciel), [6, 7]);
  assert.deepEqual(avancementAssociation({ reveles: [4, 11, 18, 25, 32, 39, 46] }, ciel), [7, 7]);
});

console.log("Accords : échos, accompagnement, lectures modernes");
const nomCarte = id => CARTE_PAR_ID[id].nom;
test("Échos et lectures : cartes réelles, paires uniques, jamais une règle de la notice", () => {
  const vues = new Set(), regles = new Set(VOISINAGE.map(r => [r.a, r.b].sort((x, y) => x - y).join("-")));
  for (const [a, b, sens, l] of [...ECHOS.map(e => [e.a, e.b, e.sens, e.glose]), ...LECTURES]) {
    assert.ok(CARTE_PAR_ID[a] && CARTE_PAR_ID[b] && a !== b, `${a}-${b}`);
    assert.ok(sens === 1 || sens === -1);
    assert.ok(l && !/[\u2013\u2014]/.test(l));
    const k = [a, b].sort((x, y) => x - y).join("-");
    assert.ok(!vues.has(k), `paire en double : ${k}`); vues.add(k);
    assert.ok(!regles.has(k), `déjà une règle de la notice : ${k}`);
  }
  assert.ok(LECTURES.length >= 120, `${LECTURES.length} lectures`);
});
test("Chaque écho cite un mot présent dans les deux notices", () => {
  const norm = t => t.toLowerCase().replace(/[’]/g, "'");
  for (const e of ECHOS) {
    const m = norm(e.mot);
    assert.ok(norm(CARTE_PAR_ID[e.a].notice).includes(m) && norm(CARTE_PAR_ID[e.b].notice).includes(m), e.mot);
  }
});
test("La Renommée prend le sens de la carte qui l'accompagne ; la Trahison gâte les meilleures cartes", () => {
  assert.equal(accordDeLecture(43, 45, nomCarte).sens, 1);
  assert.equal(accordDeLecture(32, 43, nomCarte).sens, -1);
  assert.equal(accordDeLecture(43, 12, nomCarte), null, "carte neutre : pas d'opinion");
  assert.equal(accordDeLecture(11, 45, nomCarte).sens, -1);
  assert.equal(accordDeLecture(39, 43, nomCarte).sorte, "echo", "l'écho passe avant l'accompagnement");
  for (const id of [...FAVORABLES, ...MEILLEURES]) assert.ok(!NEFASTES.includes(id));
});
test("En duel, une lecture moderne s'accomplit quand ses deux cartes se suivent", () => {
  const d = creerDuel(creerHasard(3), "homme", { premier: 0 });
  d.joueurs[0].main = [10, 45];   // Présents puis Bonheur : un bonheur offert
  activerDuel(d, 0, 0, {}, creerHasard(1));
  const ev = activerDuel(d, 0, 0, {}, creerHasard(1));
  const a = ev.find(e => e.type === "accord");
  assert.ok(a && a.sorte === "lecture" && a.favorable, JSON.stringify(a));
});

test("Accord sur le terrain : deux cartes en jeu l'accomplissent, une fois par paire, un par tour", () => {
  const d = creerDuel(creerHasard(3), "homme", { premier: 0 });
  d.joueurs[0].monstres[0] = apparitionDe(29, d);   // Amor
  d.joueurs[0].monstres[1] = apparitionDe(49, d);   // Grâce
  d.joueurs[0].monstres[2] = apparitionDe(8, d);    // Pensée-Amitié : Amor et Pensée-Amitié, une amitié tendre
  const possibles = accordsTerrain(d, 0).map(t => t.cle);
  assert.ok(possibles.includes("8-29"), possibles.join(","));
  const lp = d.joueurs[0].lp;
  const ev = accomplirAccordTerrain(d, 0, "8-29");
  assert.ok(ev.some(e => e.type === "accord" && e.terrain));
  assert.equal(d.joueurs[0].lp, lp + 200);
  assert.equal(accordsTerrain(d, 0).length, 0, "un par tour");
  d.joueurs[0].accordTerrainFait = false;
  assert.ok(!accordsTerrain(d, 0).some(t => t.cle === "8-29"), "une fois par paire");
  const cachee = creerDuel(creerHasard(3), "homme", { premier: 0 });
  const m = apparitionDe(29, cachee); m.faceCachee = true; cachee.joueurs[0].monstres[0] = m;
  cachee.joueurs[0].monstres[1] = apparitionDe(8, cachee);
  assert.equal(accordsTerrain(cachee, 0).length, 0, "face cachée : pas d'accord");
});

console.log("Terrains, pioche, conservation des cartes");
test("Un terrain se pose de votre côté, change vos valeurs, et un nouveau casse l'ancien", () => {
  const d = creerDuel(creerHasard(4), "homme", { premier: 0 });
  d.joueurs[0].main = [16, 52];
  const m = apparitionDe(8, d); m.position = "defense"; d.joueurs[0].monstres[0] = m;
  const avant = defEffectif(d, 0, m);
  const ev = activerDuel(d, 0, 0, {}, creerHasard(1));
  assert.ok(ev.some(e => e.type === "terrainPose" && e.id === 16));
  assert.equal(d.joueurs[0].terrainCarte, 16);
  assert.equal(defEffectif(d, 0, m), avant + 700, "Pénates : +700 DEF en défense");
  activerDuel(d, 0, 0, {}, creerHasard(1));
  assert.equal(d.joueurs[0].terrainCarte, 52);
  assert.ok(d.joueurs[0].cimetiere.includes(16), "l'ancien terrain est cassé");
  m.position = "attaque"; d.phase = "combat"; d.tour = 3;
  assert.deepEqual(ciblesAttaque(d, 0, 0), [], "le Cloître arrête : pas d'attaque");
});
test("L'Accident casse le terrain adverse ; la lunaison rend les terrains à la main ; un terrain s'use", () => {
  const d = creerDuel(creerHasard(4), "homme", { premier: 0 });
  d.joueurs[1].terrainCarte = 9; d.joueurs[1].terrainTours = 5;
  d.joueurs[0].main = [38]; d.joueurs[0].monstres = [apparitionDe(4, d), apparitionDe(5 + 2, d), null, null, null];
  invoquer(d, 0, 0, {}, creerHasard(1));
  assert.equal(d.joueurs[1].terrainCarte, null); assert.ok(d.joueurs[1].cimetiere.includes(9));
  const e = creerDuel(creerHasard(4), "homme", { premier: 0 });
  e.joueurs[0].main = [18]; e.joueurs[1].terrainCarte = 30; e.joueurs[1].terrainTours = 5;
  activerDuel(e, 0, 0, {}, creerHasard(1));
  assert.ok(e.joueurs[1].main.includes(30));
  const f = creerDuel(creerHasard(4), "homme", { premier: 0 });
  f.joueurs[0].main = [52]; activerDuel(f, 0, 0, {}, creerHasard(1));
  for (let k = 0; k < 6 && f.joueurs[0].terrainCarte != null; k++) finTourDuel(f, creerHasard(1));
  assert.equal(f.joueurs[0].terrainCarte, null, "le Cloître tombe après 3 tours");
});
test("On pioche 2 cartes par tour, sans dépasser 7 en main", () => {
  const d = creerDuel(creerHasard(4), "homme", { premier: 0 });
  d.joueurs[1].main = d.joueurs[1].main.slice(0, 3);
  finTourDuel(d, creerHasard(1));
  assert.equal(d.joueurs[1].main.length, 5);
  d.joueurs[0].main = d.joueurs[0].main.slice(0, 6);
  finTourDuel(d, creerHasard(1));
  assert.equal(d.joueurs[0].main.length, MAIN_MAX, "6 + 1 : la main s'arrête à 7");
});
test("Aucune carte n'apparaît ni ne disparaît (duels libres et Gardiens, toutes les règles)", () => {
  const toutes = Object.keys(FIGURES).map(Number), tous = CARTES.map(c => c.id);
  for (let g = 1; g <= 40; g++) {
    const rng = creerHasard(g);
    const decks = g % 2 ? [tous, deckDuGardien(LES_GARDIENS[g % 7], creerHasard(g))] : [tous, tous];
    for (const dk of decks) assert.equal(new Set(dk).size, dk.length, "un deck sans doublon");
    const attendu = new Map(); for (const dk of decks) for (const id of dk) attendu.set(id, (attendu.get(id) || 0) + 1);
    const d = creerDuel(rng, "homme", { decks, reserves: [toutes, toutes], profils: [PROFILS.adepte, PROFILS.mage] });
    d.joueurs[0].profil = PROFILS.adepte;
    for (let pas = 0; pas < 1500 && !d.fini; pas++) {
      const a = actionOmbre(d, d.joueurs[d.actif].profil, rng);
      if (a.type === "fin" || a.type === "rien") { finTour(d, rng); continue; }
      const ev = executerOmbre(d, a, rng, a.type === "attaquer" ? presageOmbre(d, 1 - d.actif, "attaque", { place: a.place, cible: a.cible }, PROFILS.mage) : null);
      if (ev.length === 1 && ev[0].type === "refus") finTour(d, rng);
      const n = new Map(), figs = [new Map(), new Map()];
      d.joueurs.forEach((J, k) => {
        const plus = id => { if (id >= 100) figs[k].set(id, (figs[k].get(id) || 0) + 1); else n.set(id, (n.get(id) || 0) + 1); };
        [...J.pioche, ...J.main, ...J.cimetiere, ...J.reserve].forEach(plus);
        for (const m of J.monstres) if (m) { plus(m.id); (m.equipements || []).forEach(plus); }
        for (const p of J.presages) if (p) plus(p.id);
        if (J.terrainCarte != null) plus(J.terrainCarte);
      });
      for (const [id, c] of attendu) assert.equal(n.get(id) || 0, c, `duel ${g}, après ${a.type} : carte ${id}`);
      assert.equal(n.size, attendu.size);
      for (const m of figs) for (const [f, c] of m) assert.equal(c, 1, `figure ${f} en double`);
    }
  }
});

console.log("Évolution, états, planètes, combos, Fatalité, mécaniques");
test("Évolution : une apparition en jeu depuis un tour évolue en une plus haute de sa planète", () => {
  const d = creerDuel(creerHasard(6), "homme", { premier: 0 });
  const m = apparitionDe(8, d); m.invoqueTour = 0; d.joueurs[0].monstres[0] = m;   // Pensée-Amitié (Soleil, niveau 3)
  d.joueurs[0].main = [7];                                                         // Honneur (Soleil, niveau 5)
  d.tour = 3;
  assert.deepEqual(evolutionsPossibles(d, 0).map(e => [e.index, e.place]), [[0, 0]]);
  const ev = evoluer(d, 0, 0, 0, creerHasard(1));
  assert.ok(ev.some(e => e.type === "evolution"));
  assert.equal(d.joueurs[0].monstres[0].id, 7);
  assert.equal(d.joueurs[0].monstres[0].atk, defDuel(7).atk + 300);
  assert.ok(d.joueurs[0].cimetiere.includes(8));
  assert.equal(evolutionsPossibles(d, 0).length, 0, "une évolution par tour");
  const e2 = creerDuel(creerHasard(6), "homme", { premier: 0 });
  const n = apparitionDe(8, e2); n.invoqueTour = 1; e2.joueurs[0].monstres[0] = n; e2.joueurs[0].main = [7];
  assert.equal(evolutionsPossibles(e2, 0).length, 0, "pas le tour de son arrivée");
});
test("Chaque règle de la notice a son sort ; les états existent", () => {
  for (const r of VOISINAGE) assert.ok(SORTS[r.id]?.length, `règle ${r.id} sans sort`);
  for (const k of ["poison", "brulure", "sommeil", "confusion"]) assert.ok(ETATS[k]);
});
test("États : la brûlure ôte 500 ATK ; le sommeil empêche d'attaquer ; le poison use à chaque tour", () => {
  const d = creerDuel(creerHasard(6), "homme", { premier: 0 });
  const m = apparitionDe(35, d); d.joueurs[0].monstres[0] = m;
  const a = atkEffectif(d, 0, m); m.statut = "brulure";
  assert.equal(atkEffectif(d, 0, m), a - 500);
  m.statut = "sommeil"; d.tour = 3; auCombatDuel(d);
  assert.deepEqual(ciblesAttaque(d, 0, 0), []);
  const e = creerDuel(creerHasard(6), "homme", { premier: 1 });
  const p = apparitionDe(35, e); p.statut = "poison"; e.joueurs[0].monstres[0] = p;
  const atk = p.atk; finTourDuel(e, creerHasard(1));
  assert.equal(e.joueurs[0].monstres[0].atk, atk - 300);
});
test("Affinité entre planètes : chacune domine la suivante dans l'ordre d'Edmond", () => {
  assert.ok(domine(32, 39), "Mars domine Jupiter"); assert.ok(domine(46, 4), "Saturne domine le Soleil");
  assert.ok(!domine(39, 32));
  const d = creerDuel(creerHasard(6), "homme", { premier: 0 });
  d.joueurs[0].monstres[0] = apparitionDe(32, d); d.joueurs[1].monstres[0] = apparitionDe(39, d);
  d.tour = 3; auCombatDuel(d);
  const c = calculDuel(d, 0, 0, 0);
  assert.ok(c.avantage); assert.equal(c.atk, atkEffectif(d, 0, d.joueurs[0].monstres[0]) + 500);
});
test("Combo : un second accord dans le même tour rapporte 200 points de plus", () => {
  const d = creerDuel(creerHasard(6), "homme", { premier: 0 });
  d.joueurs[0].main = [10, 45];        // Présents puis Bonheur : une lecture
  activerDuel(d, 0, 0, {}, creerHasard(1));
  const ev1 = activerDuel(d, 0, 0, {}, creerHasard(1));
  assert.equal(ev1.find(e => e.type === "accord").combo, 1);
  d.joueurs[0].main = [27, 29];        // Union, Amor : un mariage d'amour
  activerDuel(d, 0, 0, {}, creerHasard(1));
  const lp = d.joueurs[0].lp;
  const ev2 = invoquer(d, 0, 0, {}, creerHasard(1));
  const acc = ev2.find(e => e.type === "accord");
  assert.ok(acc && acc.combo >= 2, JSON.stringify(acc));
  assert.equal(d.joueurs[0].lp, lp + acc.valeur);
});
test("La Fatalité : au-delà du 40e tour, le plus de points de vie l'emporte", () => {
  const d = creerDuel(creerHasard(6), "homme", { premier: 0 });
  d.tour = 40; d.joueurs[1].lp = 3000;
  const ev = finTourDuel(d, creerHasard(1));
  assert.ok(ev.some(e => e.type === "fatalite"));
  assert.ok(d.fini); assert.equal(d.gagnant, 0);
});
test("Mécaniques dévoilées pas à pas : le premier Gardien n'ouvre ni figures, ni techniques, ni évolution", () => {
  const d = creerDuel(creerHasard(6), "homme", { premier: 0, mecaniques: [], reserves: [Object.keys(FIGURES).map(Number), []] });
  d.joueurs[0].main = [17, 49];
  assert.equal(fusionsDuel(d, 0).length, 0);
  assert.equal(techniquesDuel(d, 0).length, 0);
  assert.equal(peutPoserInfluence(d, 0, 0).ok, false);
  const libre = creerDuel(creerHasard(6), "homme", { premier: 0, reserves: [Object.keys(FIGURES).map(Number), []] });
  libre.joueurs[0].main = [17, 49];
  assert.ok(fusionsDuel(libre, 0).length > 0, "en duel libre, tout est ouvert");
});

console.log("Effets visuels");
test("Chaque carte et chaque figure a son effet visuel, et l'Eau déferle en vague", () => {
  for (const id of [...CARTES.map(c => c.id), ...Object.keys(FIGURES).map(Number)]) {
    assert.ok(EFFET_DE_CARTE[id], `carte ${id} sans effet`);
    assert.ok(NOMS_EFFETS.includes(EFFET_DE_CARTE[id][0]), `effet inconnu pour ${id}`);
  }
  assert.equal(EFFET_DE_CARTE[CARTES.find(c => c.nom === "Eau").id][0], "vague");
});

console.log("Scripts du navigateur");
test("js/jeu.js et js/jeu-duel.js sont à jour (sinon : npm run build)", () => {
  for (const sortie of Object.keys(SCRIPTS)) {
    const actuel = readFileSync(new URL("../" + sortie, import.meta.url), "utf8").replace(/\r\n/g, "\n");
    assert.ok(actuel === assembler(sortie), `${sortie} ne correspond pas aux modules : lancer npm run build`);
    assert.doesNotThrow(() => new Function(actuel), `${sortie} : le script ne se lit pas (erreur de syntaxe, import en double ?)`);
  }
});

test("Le dictionnaire de l'Atelier (2652 associations) se lit dans le Duel : chaque paire a sa dynamique", () => {
  const f = new URL("../../js/data/pair-dictionary.js", import.meta.url);
  if (!existsSync(f)) return;   // jeu utilisé hors de l'Atelier
  const bac = { window: {} };
  vm.runInNewContext(readFileSync(f, "utf8"), bac);
  const D = bac.window.BELLINE.PAIR_DICT;
  assert.equal(Object.keys(D).length, 2652);
  definirDictionnaire(D);
  try {
    const n = { 1: 0, "-1": 0, 0: 0 };
    for (const k of Object.keys(D)) { const [a, b] = k.split("-").map(Number); const l = lectureDuDictionnaire(a, b); assert.ok(l && l.dynamique, k); n[l.sens]++; }
    assert.equal(n[1], 1275); assert.equal(n[-1], 714); assert.equal(n[0], 663);
    const acc = accordDeLecture(45, 25, id => CARTE_PAR_ID[id].nom);
    assert.ok(!acc || acc.sorte === "lecture" || acc.sorte === "accompagnement" || acc.sorte === "echo");
  } finally { definirDictionnaire(null); }
});

test("Chaque élément que les scripts cherchent par son identifiant existe dans sa page", () => {
  const lire = f => readFileSync(new URL("../" + f, import.meta.url), "utf8");
  const pages = { "duel.html": ["js/duel-main.js"], "chemin.html": ["js/main.js", "js/ui/hud.js", "js/ui/fiche.js", "js/ui/tirage.js", "js/ui/carnet.js", "js/ui/commandes.js"] };
  for (const [page, scripts] of Object.entries(pages)) {
    const html = lire(page), ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
    for (const f of scripts) {
      for (const m of lire(f).matchAll(/(?:\$|getElementById)\("([\w-]+)"\)/g)) assert.ok(ids.has(m[1]), `${f} cherche #${m[1]}, absent de ${page}`);
    }
  }
});

console.log(`\n${ok} tests réussis${echecs ? `, ${echecs} en échec` : ""}.`);
if (echecs) process.exit(1);
