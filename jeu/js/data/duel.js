// Le Duel des Apparitions : ce que fait chaque carte au combat, à la manière des jeux de cartes à duel.
// Adaptation de jeu (signalée) : la notice de Belline ne décrit pas de combat. Chaque carte reçoit pourtant
// sa nature, sa force et son effet d'un mot de sa notice (champ `mot`, vérifié par un test).
//
// Trois sortes de cartes :
//   apparition  une figure invoquée sur le terrain : niveau (étoiles), ATK, DEF. Niveau 5 et 6 : un sacrifice ;
//               niveau 7 et 8 (les cartes fortes de la notice) : deux sacrifices.
//   influence   un événement joué depuis la main pendant votre phase principale (comme une magie).
//               `sousType` : 'equipement' (reste attachée à une apparition) ou 'continue' (reste en jeu
//               plusieurs tours, dans une zone de présage, face visible) ou 'terrain' (ajout de jeu : un lieu
//               que nomme la notice ; il se pose de votre côté du tapis, le change, et agit tant qu'il demeure ;
//               un seul par joueur ; un nouveau terrain casse l'ancien ; l'Accident et la lunaison le cassent).
//               `terrain` : { atk, def, defDefense (en défense seulement), lp (à chacun de vos tours), sansAttaque, duree }.
//               Un terrain s'use : il tombe après `duree` de vos tours (le Cloître, qui arrête, ne tient que 3 tours).
//   presage     posé face cachée ; il se déclenche pendant le tour adverse (comme un piège), à partir du
//               tour suivant sa pose. `declencheur` : 'attaque' (une apparition adverse attaque),
//               'invocation' (l'adversaire invoque une apparition) ou 'influence' (l'adversaire active
//               une influence : c'est une chaîne, le présage répond).
//
// Capacités d'apparition (vraies tant qu'elle est face recto) :
//   garde       l'adversaire doit l'attaquer en premier
//   percant     contre une apparition en défense, inflige la différence en dégâts
//   protege     la première fois qu'elle devrait être détruite au combat, elle ne l'est pas
//   voleur      quand elle inflige des dégâts de combat, elle vole une carte de la main adverse
//   feuDePaille détruite à la fin du tour où elle a attaqué
//   croissance  +v ATK à chacune de vos phases de pioche
//   regain      +v points de vie à chacune de vos phases de pioche
//   moderation  les dégâts de combat que vous subissez sont divisés par deux
//   declaree    ne peut pas être posée face cachée
// `effets` d'une apparition : appliqués quand elle est révélée (invocation face recto, ou retournée).
//
// Règles communes (ajouts de jeu) : l'affinité planétaire (+200 ATK par autre apparition face recto de même
// planète que vous contrôlez) et le terrain (le duel se tient sous une planète : +300 ATK et DEF à ses apparitions).
//
// Effets (`t`) ; `camp` : 'soi' | 'adverse' ; `cible` : 'toutes' | 'plusForte' | 'plusFaible' | 'aleatoire' | 'nouvelle' | 'autres'
//   lp {v} / degats {v} / degatsParAllie {v} / reussite
//   stat {atk, def, camp, cible}  modifie ATK / DEF            retablir            vos apparitions retrouvent leurs valeurs d'origine si elles ont baissé
//   defense {camp}       met en défense                       bloquer {camp, cible, tours}
//   detruire {camp, cible}                                     detruireDefense {camp}  (camp absent : les deux)
//   detruireFaibles {seuil}  détruit les apparitions adverses en attaque d'ATK au plus `seuil`
//   detruirePresages     détruit les présages posés de l'adversaire
//   lunaison / piocher {n} / voir / voler / defausser {n} / defausserSoi {n} / sterilite
//   differe {tours, effets} / retourMain / heritage / doubler / annuler / rejouer / remplacer / hasard {v} / remede {v, seuil}
// Effets de présage : renvoyerAttaquant, annulerCombat, detruireAttaquant, retarderAttaquant {tours}, renfortSurprise,
//   inverserInvoquee, neutraliserInvoquee {tours}, passiviteInvoquee, annulerInfluence, litige.

export const DUEL = {
  // ---------- Préambule ----------
  1: { type: "influence", mot: "décision", texte: "Une décision à prendre. Ouvrir : votre prochaine carte compte double. Fermer : la prochaine carte adverse reste sans effet.",
    choix: [{ label: "Ouvrir", effets: [{ t: "doubler" }] }, { label: "Fermer", effets: [{ t: "annuler" }] }] },
  2: { type: "influence", mot: "consultant", texte: "L’Étoile reçoit la carte qui la précède : votre carte précédente se rejoue, pleinement si c’est votre Étoile, à moitié sinon.", effets: [{ t: "rejouer" }] },
  3: { type: "influence", mot: "consultante", texte: "L’Étoile reçoit la carte qui la précède : votre carte précédente se rejoue, pleinement si c’est votre Étoile, à moitié sinon.", effets: [{ t: "rejouer" }] },

  // ---------- Soleil ----------
  4: { type: "apparition", niveau: 1, atk: 800, def: 600, mot: "naissance", texte: "Naissance, apparition : quand elle est révélée (même retournée), piochez une carte.", effets: [{ t: "piocher", n: 1 }] },
  5: { type: "apparition", niveau: 4, atk: 1700, def: 1300, mot: "récompense", texte: "Succès, récompense : quand elle est révélée, vous gagnez 300 points de vie, plus 50 par carte de votre cimetière.", effets: [{ t: "reussite" }] },
  6: { type: "influence", sousType: "equipement", mot: "progrès", texte: "Équipement. Progrès : votre apparition la plus forte gagne 800 ATK tant qu’elle reste en jeu.", effets: [{ t: "stat", atk: 800, def: 0, camp: "soi", cible: "plusForte", equipement: true }] },
  7: { type: "apparition", niveau: 4, atk: 1800, def: 1700, protege: true, mot: "distinction", texte: "Distinction honorifique : la première fois qu’elle devrait être détruite au combat, elle ne l’est pas.", effets: [] },
  8: { type: "apparition", niveau: 3, atk: 1200, def: 1500, garde: true, mot: "fidélité", texte: "Un ami, fidélité : le chien garde. L’adversaire doit l’attaquer en premier.", effets: [] },
  9: { type: "influence", sousType: "terrain", mot: "santé", texte: "Terrain. Campagne, repos, santé : vos apparitions gagnent 300 DEF et guérissent de leurs états ; au début de chacun de vos tours, vous gagnez 300 points de vie. Tient 5 tours.", effets: [], terrain: { def: 300, lp: 300, duree: 5 } },
  10: { type: "apparition", niveau: 2, atk: 1100, def: 900, mot: "cadeaux", texte: "Cadeaux, ce qui arrive par faveur : quand elle est révélée, piochez une carte.", effets: [{ t: "piocher", n: 1 }] },

  // ---------- Lune ----------
  11: { type: "apparition", niveau: 7, atk: 2500, def: 1800, forte: true, mot: "malchance", texte: "Carte forte. La malchance : quand elle est révélée, toutes les apparitions adverses perdent 500 ATK.",
    effets: [{ t: "stat", atk: -500, def: 0, camp: "adverse", cible: "toutes" }] },
  12: { type: "presage", declencheur: "attaque", mot: "éloignement", texte: "Départ, éloignement : quand une apparition adverse attaque, renvoyez-la dans la main de son joueur.", effets: [{ t: "renvoyerAttaquant" }] },
  13: { type: "presage", declencheur: "invocation", mot: "versatile", texte: "Caractère versatile : quand l’adversaire invoque une apparition, elle échange son ATK et sa DEF et devient confuse.", effets: [{ t: "inverserInvoquee" }] },
  14: { type: "apparition", niveau: 2, atk: 1200, def: 700, mot: "découverte", texte: "Découverte, surveillance, espionnage : quand elle est révélée, vous voyez la main adverse.", effets: [{ t: "voir" }] },
  15: { type: "presage", declencheur: "invocation", mot: "passivité", texte: "La passivité : quand l’adversaire invoque une apparition, elle passe en défense, s’endort et ne pourra pas attaquer à son prochain tour.", effets: [{ t: "passiviteInvoquee" }] },
  16: { type: "influence", sousType: "terrain", mot: "foyer", texte: "Terrain. Le foyer, la maison, le lieu où l’on vit : un abri. Vos apparitions en défense gagnent 700 DEF. Tient 5 tours.", effets: [], terrain: { defDefense: 700, duree: 5 } },
  17: { type: "influence", mot: "remède", texte: "Malaise ou remède : sous 3000 points de vie, vous en regagnez 1000 ; sinon l’épidémie ôte 500 ATK à toutes les apparitions adverses et rend malade la plus forte.", effets: [{ t: "remede", v: 1000, seuil: 3000 }] },

  // ---------- Mercure ----------
  18: { type: "influence", mot: "changements", texte: "Changements, une lunaison : toutes les apparitions et tous les terrains retournent dans la main de leur joueur.", effets: [{ t: "lunaison" }] },
  19: { type: "influence", mot: "placements", texte: "Les placements : encaisser (500 points de vie) ou placer (1200 dans deux tours).",
    choix: [{ label: "Encaisser", effets: [{ t: "lp", v: 500 }] }, { label: "Placer", effets: [{ t: "differe", tours: 2, effets: [{ t: "lp", v: 1200 }] }] }] },
  20: { type: "apparition", niveau: 4, atk: 1500, def: 1700, mot: "savoir", texte: "Le savoir, les connaissances : quand elle est révélée, piochez une carte.", effets: [{ t: "piocher", n: 1 }] },
  21: { type: "apparition", niveau: 3, atk: 1300, def: 800, voleur: true, mot: "vol", texte: "Vol, perte : quand elle inflige des dégâts de combat, elle vole une carte au hasard dans la main adverse.", effets: [] },
  22: { type: "apparition", niveau: 3, atk: 1000, def: 1600, croissance: 300, mot: "projet", texte: "Projet en cours d’exécution : gagne 300 ATK à chacune de vos phases de pioche.", effets: [] },
  23: { type: "apparition", niveau: 3, atk: 1400, def: 1000, mot: "commerce", texte: "Trafic, commerce, négoce : quand elle est révélée, vous gagnez 400 points de vie.", effets: [{ t: "lp", v: 400 }] },
  24: { type: "presage", declencheur: "attaque", mot: "surprise", texte: "Arrivée inattendue, surprise : quand une apparition adverse attaque, une apparition de niveau 4 ou moins de votre main arrive en défense et reçoit l’attaque.", effets: [{ t: "renfortSurprise" }] },

  // ---------- Vénus ----------
  25: { type: "influence", sousType: "equipement", mot: "parures", texte: "Équipement. Les parures, les bijoux : votre apparition la plus forte gagne 300 ATK et 500 DEF tant qu’elle reste en jeu.", effets: [{ t: "stat", atk: 300, def: 500, camp: "soi", cible: "plusForte", equipement: true }] },
  26: { type: "presage", declencheur: "attaque", mot: "paix", texte: "La paix, concorde : quand une apparition adverse attaque, l’attaque est annulée et la phase de combat prend fin ; vous piochez une carte.", effets: [{ t: "annulerCombat" }] },
  27: { type: "apparition", niveau: 3, atk: 1500, def: 1200, mot: "retour", texte: "Union, réunion, retour : quand elle est révélée, la dernière carte de votre cimetière revient dans votre main.", effets: [{ t: "retourMain" }] },
  28: { type: "apparition", niveau: 4, atk: 1400, def: 1600, mot: "liens", texte: "Les liens du sang ou de l’esprit : quand elle est révélée, vos autres apparitions gagnent 400 DEF.", effets: [{ t: "stat", atk: 0, def: 400, camp: "soi", cible: "autres" }] },
  29: { type: "apparition", niveau: 3, atk: 1300, def: 1000, regain: 200, mot: "affection", texte: "L’affection : vous gagnez 200 points de vie à chacune de vos phases de pioche.", effets: [] },
  30: { type: "influence", sousType: "terrain", mot: "fêtes", texte: "Terrain. La table, les fêtes, les festins : vos apparitions gagnent 200 ATK ; au début de chacun de vos tours, vous gagnez 200 points de vie. Tient 5 tours.", effets: [], terrain: { atk: 200, lp: 200, duree: 5 } },
  31: { type: "apparition", niveau: 4, atk: 2200, def: 0, feuDePaille: true, mot: "emballement", texte: "Emballement, feu de paille : une grande force, mais elle est détruite à la fin du tour où elle a attaqué.", effets: [] },

  // ---------- Mars ----------
  32: { type: "apparition", niveau: 4, atk: 1600, def: 1000, mot: "jalousie", texte: "Jalousie, envie : quand elle est révélée, la plus forte apparition adverse perd 600 ATK.", effets: [{ t: "stat", atk: -600, def: 0, camp: "adverse", cible: "plusForte" }] },
  33: { type: "presage", declencheur: "attaque", mot: "procès", texte: "Procès, litiges : quand une apparition adverse attaque, pile ou face : l’attaquant est détruit, ou l’attaque se poursuit.", effets: [{ t: "litige" }] },
  34: { type: "apparition", niveau: 8, atk: 2800, def: 2400, forte: true, mot: "force majeure", texte: "Carte forte. La force majeure : quand elle est révélée, toutes les apparitions adverses passent en défense.", effets: [{ t: "defense", camp: "adverse" }] },
  35: { type: "apparition", niveau: 4, atk: 2000, def: 1300, declaree: true, mot: "attaques", texte: "Ennemis déclarés, attaques : ne peut pas être posée face cachée.", effets: [] },
  36: { type: "apparition", niveau: 2, atk: 1100, def: 1400, mot: "pourparlers", texte: "Pourparlers, conférences : quand elle est révélée, la plus forte apparition adverse ne peut pas attaquer à son prochain tour.", effets: [{ t: "bloquer", camp: "adverse", cible: "plusForte", tours: 1 }] },
  37: { type: "apparition", niveau: 4, atk: 1800, def: 600, percant: true, mot: "ardeur", texte: "L’ardeur : contre une apparition en défense, inflige la différence en dégâts. Quand elle est révélée, le feu brûle la plus forte apparition adverse.", effets: [{ t: "statut", etat: "brulure", camp: "adverse", cible: "plusForte" }] },
  38: { type: "apparition", niveau: 7, atk: 2600, def: 1500, forte: true, mot: "bouleversement", texte: "Carte forte. Le bouleversement, la destruction : quand elle est révélée, les apparitions adverses en défense sont détruites, et le terrain adverse est cassé.", effets: [{ t: "detruireDefense", camp: "adverse" }, { t: "casserTerrain", camp: "adverse" }] },

  // ---------- Jupiter ----------
  39: { type: "apparition", niveau: 6, atk: 2100, def: 2600, garde: true, mot: "protections", texte: "Protections, un personnage puissant : l’aigle garde. L’adversaire doit l’attaquer en premier.", effets: [] },
  40: { type: "influence", sousType: "continue", tours: 3, mot: "espérances", texte: "Continue (3 tours). Espérances qui se réaliseront par la suite : au début de chacun de vos tours, gagnez 300 points de vie et votre apparition la plus faible gagne 200 ATK.",
    effets: [{ t: "lp", v: 300 }, { t: "stat", atk: 200, def: 0, camp: "soi", cible: "plusFaible" }] },
  41: { type: "apparition", niveau: 4, atk: 1500, def: 1500, mot: "legs", texte: "Legs, les ancêtres, les choses du passé : quand elle est révélée, l’apparition la plus forte de votre cimetière revient sur le terrain.", effets: [{ t: "heritage" }] },
  42: { type: "apparition", niveau: 7, atk: 2000, def: 3000, forte: true, moderation: true, mot: "prudence", texte: "Carte forte. Prudence, modération : tant qu’elle est face recto, les dégâts de combat que vous subissez sont divisés par deux.", effets: [] },
  43: { type: "apparition", niveau: 4, atk: 1800, def: 1400, mot: "opinion", texte: "L’opinion, selon les cartes d’accompagnement : quand elle est révélée, l’adversaire perd 300 points de vie par apparition que vous contrôlez.", effets: [{ t: "degatsParAllie", v: 300 }] },
  44: { type: "influence", mot: "occasion", texte: "Une occasion : miser (pile ou face : 1500 points de dégâts à l’un ou à l’autre) ou passer.",
    choix: [{ label: "Miser", effets: [{ t: "hasard", v: 1500 }] }, { label: "Passer", effets: [] }] },
  45: { type: "apparition", niveau: 4, atk: 1600, def: 1600, mot: "bonheur", texte: "Le bonheur, vocation réalisée : quand elle est révélée, vous gagnez 800 points de vie.", effets: [{ t: "lp", v: 800 }] },

  // ---------- Saturne ----------
  46: { type: "apparition", niveau: 2, atk: 900, def: 800, mot: "afflictions", texte: "Afflictions, infirmités : quand elle est révélée, toutes les apparitions adverses perdent 300 ATK et 300 DEF.", effets: [{ t: "stat", atk: -300, def: -300, camp: "adverse", cible: "toutes" }] },
  47: { type: "presage", declencheur: "influence", mot: "tentatives vaines", texte: "Stérilité, tentatives vaines : quand l’adversaire active une influence, elle ne produit rien.", effets: [{ t: "annulerInfluence" }] },
  48: { type: "apparition", niveau: 8, atk: 3000, def: 2500, forte: true, mot: "fin", texte: "Carte forte. L’échéance inéluctable, la fin : quand elle est révélée, détruisez une apparition adverse en défense ou face cachée.", effets: [{ t: "detruire", camp: "adverse", cible: "defense" }] },
  49: { type: "apparition", niveau: 3, atk: 1200, def: 1200, mot: "revirement", texte: "Revirement favorable : quand elle est révélée, vous gagnez 600 points de vie et vos apparitions guérissent de leurs états.", effets: [{ t: "lp", v: 600 }, { t: "guerir", camp: "soi" }] },
  50: { type: "presage", declencheur: "attaque", mot: "échec", texte: "Échec, faillite : quand une apparition adverse attaque, elle est détruite.", effets: [{ t: "detruireAttaquant" }] },
  51: { type: "presage", declencheur: "attaque", mot: "retard", texte: "Retard, délai : quand une apparition adverse attaque, l’attaque est annulée et elle ne pourra plus attaquer pendant deux tours.", effets: [{ t: "retarderAttaquant", tours: 2 }] },
  52: { type: "influence", sousType: "terrain", mot: "repliement", texte: "Terrain. Claustration, repliement sur soi : le Cloître arrête. Vos apparitions gagnent 900 DEF mais ne peuvent pas attaquer tant qu’il demeure (3 tours).", effets: [], terrain: { def: 900, sansAttaque: true, duree: 3 } },

  // ---------- Hors jeu d'Edmond ----------
  0: { type: "influence", mot: "remplacement", texte: "Carte de remplacement : rejoue la dernière influence de votre cimetière.", effets: [{ t: "remplacer" }] }
};

/** Nombre de sacrifices qu'exige une apparition (définition `x` ou numéro). */
export function sacrificesRequis(idOuDef) {
  const n = (typeof idOuDef === "object" ? idOuDef : DUEL[idOuDef])?.niveau || 0;
  return n >= 7 ? 2 : n >= 5 ? 1 : 0;
}
