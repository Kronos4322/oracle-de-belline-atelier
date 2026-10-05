# Le Chemin du Mage

Les jeux vivent dans l'Atelier (dépôt `oracle-de-belline-atelier`, dossier `jeu/`) : onglet « Jeux » de l'Atelier
(`js/views/jeux.js` à la racine), même origine, même cache hors-ligne (`tools/gen-sw.js` à la racine).
Le Duel charge le dictionnaire des 2652 associations de l'Atelier (`../js/data/pair-dictionary.js`) et en tire ses
lectures (`definirDictionnaire`, `js/data/lectures.js`) ; une carte du Duel ouvre sa fiche dans le Grimoire
(clé `belline.grimoire.open`, la Carte Bleue y porte le n° 53). Lancer : servir la racine de l'Atelier
(`python -m http.server 4173` depuis la racine), puis http://localhost:4173/jeu/duel.html.

Deux jeux pour apprendre l'Oracle de Belline, réunis sous une page d'accueil (`index.html`) :

- **Le Chemin** (`chemin.html`) : vu de dessus, le mage monte un chemin de bas en haut (La Destinée, puis les planètes). Le joueur le dirige lui-même ; aux fourches, il lit les cartes et choisit sa branche ; une carte sur sa route se vit (elle agit selon la notice) ; il peut la sauter. Le chemin use le mage. À chaque porte, il retient une carte pour son tirage et répond à l'énigme de la porte. À la fin, le tirage composé (une carte par planète) est dessiné et lu.
- **Le Duel des Apparitions** (`duel.html`) : à la manière des jeux de cartes à duel. 8000 points de vie, six cartes en main. Les figures sont des apparitions (niveau, ATK, DEF ; position attaque ou défense, pose face cachée ; sacrifices au-delà du niveau 4), les événements des influences (comme des magies), certaines cartes des présages (posés face cachée, déclenchés pendant le tour adverse, comme des pièges). Phases : pioche, principale, combat, principale 2, fin. Les apparitions face recto se dressent en hologramme sur le tapis. Deux cartes révélées à la suite qui forment une règle de Belline accomplissent un accord ; les deux cartes d'une règle connue peuvent aussi être réunies en une figure d'accord (comme une fusion). Influences d'équipement et continues ; présages qui répondent aux attaques, aux invocations et aux influences (chaîne). Affinité planétaire et terrain. Adversaires : l'Ombre (Novice, Adepte, Mage) et la campagne des Sept Gardiens. Deck composable (30 à 53 cartes) ; les cartes vécues dans le Chemin sont rares (reflet). Les influences peuvent aussi se poser face cachée et se révéler à partir du tour suivant. Techniques (une par tour) : alignements (trois apparitions d'une planète changent le terrain) et associations (groupes de cartes révélées pendant le duel). Chaque carte a son effet visuel (l'Eau déferle en vague, etc.), dans le Chemin comme dans le Duel.

Le projet fait partie d'une encyclopédie de l'Oracle de Belline. La fidélité aux sources prime sur l'effet de jeu.

## Règles de contenu (impératives)

- Langue : français. Aucun tiret cadratin ni demi-cadratin (caractères U+2014 et U+2013) dans les textes ; utiliser deux-points, virgules ou parenthèses.
- Les champs `notice` reprennent mot pour mot la notice de Belline (La Ducale 1960, Grimaud 1961). Ne pas les reformuler.
- Le `motCle` d'une carte (Chemin) et le `mot` de sa fiche de duel sont pris dans sa notice (des tests le vérifient).
- Les effets doivent pouvoir se justifier par la notice. Les lectures modernes (karma, âme sœur, etc.) ne servent pas de base à un effet.
- Les règles de voisinage de `js/data/voisinage.js` sont celles de la notice ; chacune indique sa `source`. Ne pas en inventer sans le signaler comme ajout.
- Distinguer « avec le n° … » (ordre indifférent) et « précédant » (ordre imposé).

## Principes tirés de l'encyclopédie

- La Destinée met au premier plan la carte qui la suit (effet doublé, ou carte fermée selon le choix). Dans le Chemin, « la carte qu'elle précède » est la prochaine carte vécue.
- Les Étoiles reçoivent la carte qui les précède : elle s'applique à la personne.
- Retard ralentit sans annuler ; Cloître arrête ; Stérilité suspend les gains ; Changement porte une « lunaison » ; Beauté donne un gain « par la suite ».
- Hazard est une occasion : le joueur décide de miser. Misé, puis Ruine : ruine au jeu.
- Ordre des régions : celui d'Edmond (préambule, Soleil, Lune, Mercure, Vénus, Mars, Jupiter, Saturne). Vitesses : Lune et Mercure les plus rapides, Saturne la plus lente.
- La Carte Bleue n'appartient pas au jeu d'Edmond ; elle apparaît une fois.

## Ajouts de jeu (signalés, à garder visibles)

Chemin :
- Les Étoiles quittent le préambule : chacune se dresse sur le tronc d'une région planétaire, pour que la carte qui la précède soit une vraie carte choisie par le joueur. L'Étoile qui n'est pas celle du consultant est une influence : elle n'applique que la moitié.
- Rendez-vous : dans chaque région, une règle de voisinage est préparée en plaçant ses deux cartes l'une après l'autre.
- Dilemmes : les cartes libres sont échangées entre branches pour que peu de fourches soient évidentes (`VALEURS`, `js/engine/valeurs.js`).
- Cartes fortes : sur le tronc (on ne les contourne pas) et chères à sauter (15 d'énergie au lieu de 6).
- Usure : le chemin use le mage ; le temps du jeu est le temps de marche.
- Tirage composé : à chaque porte, une carte retenue par région ; énigme de la porte (récompense : vue et fortune) ; révision espacée des cartes manquées.
- Fils d'or : deux cartes que relie une règle déjà découverte dans le carnet.
- Parcours progressif : chemin court (2 planètes), moyen (4), grand (7).
- Règles « Accident / Honneur précédant l'Étoile » : source exacte à vérifier (absentes des notices de cartes).

Duel (tout le mode est une adaptation) :
- Nature (apparition, influence, présage), niveau, ATK / DEF et effets tirés d'un mot de la notice (`js/data/duel.js`, champ `mot`).
- Accords : deux cartes révélées à la suite, ou toutes deux face visible sur le terrain (un accord de terrain par tour, une fois par paire), qui forment une règle de Belline ; favorable, +1000 points de vie et une carte ; néfaste, 1000 points de dégâts à l'adversaire ; et le sort de la règle (`js/data/sorts.js`, un effet tiré des mots de la règle). La règle de Belline doit rester l'accord le plus fort.
- Accords hors notice (`js/data/lectures.js`), moins forts que les règles : échos (le même mot dans les deux notices, 500), accompagnement (Renommée « selon les cartes d'accompagnement », Trahison « à côté des meilleures cartes » ; la liste des meilleures cartes est un choix du jeu, 500), lectures modernes (environ 200 sens rédigés pour le jeu à la demande de l'auteur, pour faire comprendre l'idée des associations ; ni notice ni recueil recopié ; Duel seulement, 200).
- Combos : chaque accord de plus dans le même tour vaut 200 points de plus.
- Évolution (Digimon, Pokémon) : une apparition en jeu depuis un tour évolue en une apparition de la même planète, d'un à trois niveaux plus haut, sans sacrifice (+300 ATK, équipements gardés). Une par tour.
- États (`js/data/sorts.js`) : poison (Maladie), brûlure (Feu), sommeil (Eau, passivité), confusion (Inconstance) ; guéris par la Grâce, la Campagne-Santé, certaines règles.
- Affinité entre planètes : chacune domine la suivante dans l'ordre d'Edmond (+500 ATK contre elle).
- La Fatalité : au-delà du 40e tour, le plus de points de vie l'emporte (aucun duel sans fin).
- Mécaniques dévoilées pas à pas dans la campagne (`MECA_GARDIENS` dans `js/duel-main.js`, `d.mec` dans le moteur) ; toutes ouvertes en duel libre.
- Difficulté adaptative (selon les victoires du carnet) et mode apprenti (l'Ombre explique ses coups dans le journal).
- Cartes fortes : niveau 7 ou 8, deux sacrifices.
- Gardiens (garde) : l'adversaire doit les attaquer en premier.
- Figures d'accord (`js/data/accords.js`) : une par règle de voisinage ; nom et effet tirés du texte de la règle ; dans la réserve : quatre figures de départ et celles des règles connues (carnet) ; une règle accomplie en duel fait entrer sa figure dans la réserve.
- Affinité planétaire (+200 ATK par autre apparition de même planète) et ciel du duel (+300 ATK / DEF à la planète du duel).
- Pioche : 2 cartes par tour, main limitée à 7.
- Assez d'attaques légères : au moins 22 apparitions de niveau 4 au plus (test ; 23 aujourd'hui, 2,6 par main de
  départ, 2,5 % de mains sans aucune). Réussite, Découverte (« surveillance, espionnage »), Intelligence (« le
  savoir »), Trafic (« commerce, avocats, notaires »), Présents (« cadeaux »), Union (« réunion, retour »),
  Héritage (« les ancêtres ») et Bonheur sont des apparitions ; Honneur, Renommée, Ennemis et Passions sont de niveau 4.
- Revanche : même adversaire, nouvelle donne (la même graine redonnait les mêmes cartes). L'accueil montre la taille du
  deck du joueur et propose de reprendre les 53 cartes s'il en manque.
- Terrains au combat : pendant votre phase de combat, un terrain se pose avant d'attaquer ; pendant l'attaque adverse,
  un terrain de la main (ou posé face cachée) se pose en réponse, avant le choc (`terrainsEnReponse`).
- Offrande : un sacrifice qui manque se remplace par 1500 points de vie (on n'est jamais bloqué).
- Lectures du dictionnaire de l'Atelier (quand il est chargé) : la paire « A puis B » donne un accord de 200 points
  selon sa dynamique (renforcement constructif, tendance favorable, dynamique réparatrice : favorable ; cumul de
  tensions, tendances et qualifications restrictives : néfaste ; mixte et contextuelle : rien). Elles remplacent
  les lectures modernes, sans bannière.
- Terrains (sousType 'terrain') : Campagne-Santé, Pénates, Table, Cloître, des lieux que nomme la notice. Posé de son côté, un terrain teinte sa moitié du tapis et agit tant qu'il demeure ; il s'use (5 tours, le Cloître qui « arrête » 3 tours, et empêche d'attaquer) ; un nouveau terrain casse l'ancien ; l'Accident (« la destruction ») casse le terrain adverse ; la lunaison (Changement) rend tous les terrains à la main.
- Éléments du combat (`ELEMENTS`, `js/render/effetsVisuels.js`) : Soleil lumière, Lune eau, Mercure air, Vénus fleurs, Mars feu, Jupiter foudre, Saturne terre. Une attaque part en projectile de l'élément et frappe d'un impact à sa mesure ; une apparition détruite vole en éclats de sa couleur ; cercles d'invocation à la couleur de la planète ; sons d'éléments (`jouerElement`, `js/ui/son.js`) ; le fond des cartes porte le motif de l'élément (vagues, flammes, strates, éclairs).
- Ambiance du tapis (`js/render/ambiance.js`) : particules lentes selon le ciel du duel et les terrains posés ; elles naissent et meurent en fondu, sans clignoter. Décoratif.
- Barre de vie : une traînée claire suit la perte, avec un temps de retard.
- Lisibilité : vitesse des animations (🐢 lente, ⏱ normale, ⚡ rapide ; `facteur()` dans `js/duel-main.js`, `--vitesse` en CSS). Les événements importants (accords, sorts, évolutions, techniques, figures, présages) laissent un encart avec leurs cartes, le temps d'être lu ; toucher une carte de l'encart, du panneau ou double-cliquer une carte l'agrandit (`zoomer`). Le bouton ❔ ouvre l'aide (comment jouer, les signes, les auras, les éléments).
- Évolution : effet « transformation » (spirale de l'élément, colonne de lumière, anneau). Accords : lien de lumière entre les deux cartes quand elles sont en jeu.
- Hologrammes : dessinés une fois (cône de lumière, lignes de balayage, fondu) ; aucune animation en boucle, aucun filtre ni mode de fusion CSS, sinon ils scintillent.
- Les Sept Gardiens (`js/data/gardiens.js`) : campagne, decks et styles par planète ; un Gardien vaincu enseigne ses règles.
- Influences posées face cachée, alignements planétaires et associations (`js/data/techniques.js`) : effets tirés de la structure du jeu d'Edmond (régions, vitesses, cartes maîtresses et fortes) et des images de la notice.
- Effets visuels des cartes (`js/render/effetsVisuels.js`) : d'après l'image que nomme la notice ; décoratifs.
- Difficulté : le Novice joue en partie au hasard et ne répond jamais par un présage ; le Mage ne joue jamais au hasard.

## Architecture

```
index.html              accueil : les deux jeux, résumé du carnet
chemin.html             le Chemin (charge js/jeu.js)
duel.html               le Duel (charge js/jeu-duel.js)
css/style.css           style commun (nuit étoilée, parchemin, or) et mise en page du Chemin
css/duel.css            plateau du Duel
js/config.js            constantes, régions planétaires (couleurs, vitesses de marche), usure
js/data/cartes.js       les 53 cartes : notice, mot-clé, effets, choix, effet de contournement, leçon
js/data/voisinage.js    règles de voisinage de Belline (avec leur source)
js/data/duel.js         fiche de combat de chaque carte
js/data/accords.js      figures d'accord (une par règle de voisinage)
js/data/gardiens.js     les Sept Gardiens, profils de difficulté
js/data/techniques.js   alignements planétaires et associations (techniques du Duel)
js/data/lectures.js     accords hors notice du Duel : échos, accompagnement, lectures modernes
js/data/sorts.js        sorts des règles de Belline, états (poison, brûlure, sommeil, confusion)
js/ui/duelOutils.js     outils de l'interface du Duel (mise à jour sur place, éléments de panneau)
js/ui/pleinEcran.js     bouton plein écran (Chemin et Duel)
js/engine/hasard.js     générateur à graine (une partie se rejoue par son numéro)
js/engine/effects.js    moteur d'effets du Chemin ; rencontrer, contourner, sauter, survoler, Carte Bleue
js/engine/state.js      état du Chemin, temps de marche, usure, vue
js/engine/valeurs.js    valeur d'une carte (marche simulée) ; VALEURS ; meilleur choix
js/engine/chemin.js     construction du chemin (graphe montant, fourches, tronc, rendez-vous, dilemmes)
js/engine/enigmes.js    énigmes de porte
js/engine/carnet.js     carnet du joueur (pur) : vues, vécues, règles, à revoir, duels
js/engine/partie.js     une partie du Chemin (pure) : marche, arrivées, portes, attentes, vue ; partagée par le jeu et le simulateur
js/engine/lecture.js    lecture du tirage composé, score
js/engine/duel.js       moteur du Duel (phases, invocations, présages, combat) et l'Ombre (pur)
js/game/player.js       le mage sur le graphe : marche, fourches, saut
js/render/carte.js      dessin des faces et dos de cartes du Chemin (commun)
js/render/carteDuel.js  cartes du Duel (complète, compacte pour la main, jeton pour le terrain ; mémoire des dessins) et hologrammes
js/render/effetsVisuels.js  effets visuels propres à chaque carte (calque canvas ; Chemin et Duel)
js/render/illustrations.js dessins des cartes d'après les images de la notice
js/render/renderer.js   dessin du Chemin (caméra, décors, portes, fils d'or, carte en grand, éclats)
js/ui/*.js              interface du Chemin (hud, fiche et dialogues, tirage, carnet, commandes), son, stockage
js/main.js              boucle du Chemin
js/duel-main.js         interface et animations du Duel
js/jeu.js, js/jeu-duel.js  scripts générés (ne pas modifier à la main)
tools/build.mjs         génère les deux scripts (liste SCRIPTS)
tools/planche.html      toutes les cartes dessinées (http://localhost:8000/tools/planche.html)
tests/test-moteur.mjs   tests (données, chemin, partie, effets carte par carte, duel, équilibre)
tests/simulateur.mjs    parties simulées sur le vrai module de partie ; seul, il affiche l'équilibre
```

Le moteur (`js/engine`, `js/data`, `js/config.js`) et le mage (`js/game`) ne touchent jamais au DOM : ils restent testables sous Node. L'outil d'assemblage ne gère que `import { … } from "…"` et `export const|let|function|class` (pas de réexportation).

## Enrichir une carte

Chemin (`js/data/cartes.js`) : `effets`, `choix` (avec `exige`), `contourne` + `messageContourne`, `surprise`, `declaree`, `lecon`. Nouveau type d'effet : un `case` dans `appliquerEffet` (`js/engine/effects.js`), documenté dans l'en-tête, avec un test.

Duel (`js/data/duel.js`) : `type` ('apparition' | 'influence' | 'presage'), `niveau`, `atk`, `def`, capacités (`garde`, `percant`, `protege`, `voleur`, `feuDePaille`, `croissance`, `regain`, `moderation`, `declaree`), `effets` ou `choix`, `declencheur` (présages), `texte`, `mot` (pris dans la notice). Nouvel effet : un `case` dans `appliquer` (`js/engine/duel.js`).

Dessin : une fonction dans `ILLUSTRATIONS` (`js/render/illustrations.js`), d'après l'image que nomme la notice ; vérifier sur la planche.

Équilibre : `node tests/simulateur.mjs` (cible Chemin : environ 40 % de défaites au hasard, moins de 10 % en lisant ; réglage : `usure` dans `js/config.js`). Duel : l'Ombre (Adepte) contre elle-même donne environ 9 tours par joueur et 50 % / 50 % ; soins environ un quart des dégâts ; le Mage bat le Novice environ 8 fois sur 10.

## Commandes

- Jouer : double-cliquer sur index.html, ou `npm start` puis ouvrir http://localhost:8000.
- Après toute modification d'un fichier de `js/` : `npm run build` (régénère `js/jeu.js` et `js/jeu-duel.js`).
- Tester : `npm test`. Les tests doivent passer avant toute livraison ; ils échouent si un script généré n'est pas à jour.
- Vérifier dans un navigateur lent : `chemin.html?acceleration=4` accélère le temps ; `chemin.html?test` expose `window.__test` (`pas(secondes, dx, dy)`, `sauter()`, `resume()`, `partie()`) ; `duel.html?test` expose `window.__duel` (`etat()`, `occupe()`, `demarrer(config, graine)`, `effet(id)`).
- `css/duel.css` : une seule définition par élément, rangée dans sa partie ; ne pas empiler de correctifs en fin de fichier.
- Interface du Duel : le rendu met à jour les éléments sur place (signatures, `reconcilier`, `reconcilierMain`) ; ne pas recréer une carte ou un hologramme pour un simple surlignage, sinon tout clignote.

## Pistes

- Vérifier la source des règles « précédant l'Étoile ».
- Embarquer les polices pour le jeu hors ligne.
- Duel : un second adversaire, plus fin ; un mode à deux joueurs sur le même écran.
