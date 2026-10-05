# Audit : jouabilité et beauté du Duel (5 octobre 2026)

But : que le jeu donne envie, dès la première minute et pendant des semaines.

Méthode :
- un duel joué dans le navigateur, sur un écran d'ordinateur (800 px) et sur un écran de téléphone (375 × 812) ;
- 300 duels simulés entre deux Ombres (Adepte), avec et sans le dictionnaire des 2652 associations ;
- lecture du code de l'interface (`js/duel-main.js`, 1646 lignes ; `css/duel.css`, 605 lignes) et des données des cartes.

Priorités : **P1** (gros effet, à faire d'abord), **P2** (net progrès), **P3** (finitions, envies).

---

## 0. Ce qui marche déjà

- Les cartes sont belles : un cadre par nature, l'image de la notice, le niveau, l'ATK et la DEF lisibles en grand.
- Toucher une carte ouvre une feuille en bas de l'écran : la notice mot pour mot, le mot d'où vient la force, un lien vers le Grimoire, puis les deux boutons d'action. C'est clair et élégant.
- Les indices sur la main (✦ association, ⇧ évolution, et désormais ↔ +150 / −200 pour la lecture que ferait la carte) apprennent sans texte.
- La vitesse (lente, normale, rapide), les encarts qui restent affichés, le zoom, l'aide ❔ et la sauvegarde du duel en cours sont en place.
- La nouvelle partie « Comprendre votre deck » explique la pioche, la composition, les associations et les astres.

---

## 1. Les premières minutes

### Constats
1. **La première action est punie.** Dans le duel joué, l'Ombre commence et pose deux cartes face cachée. Ma première invocation (Passions) déclenche aussitôt le présage Inconstance : Passions est confuse et je perds 200 points sur une lecture. Le joueur n'a encore rien compris, et le jeu le punit déjà.
2. **Pas de duel d'initiation.** Les règles forment une longue liste à puces (12 paragraphes denses). On apprend en se trompant.
3. **L'accueil est un formulaire** : consultant ou consultante, quatre niveaux, mode apprenti, puis la campagne. Rien ne bouge, rien ne montre une carte ou un combat.
4. Le choix « consultant / consultante » vient en premier sans explication (il décide quelle Étoile est la vôtre).

### Propositions
- **P1 Un premier duel doux** : pour un carnet sans duel joué, vous commencez, l'Ombre (Novice) ne pose aucun présage pendant ses deux premiers tours, et le mode apprenti est activé.
- **P1 Un duel d'initiation guidé** : cinq tours mis en scène (graine fixe, mains choisies). Une bulle montre où toucher : invoquer, attaquer, poser un présage, accomplir une règle de Belline (Campagne puis Table : le pique-nique), invoquer une figure d'accord. Il se termine sur une victoire.
- **P2 Un accueil qui donne envie** : une carte tourne en hologramme au centre, un grand bouton « Jouer » (duel adaptatif), puis « Campagne des Sept Gardiens » et « Votre deck ». Les réglages (consultant, apprenti, difficulté) se replient sous « Options ».
- **P2** Expliquer le choix de l'Étoile par une phrase et l'image des deux Étoiles.

---

## 2. Lisibilité du plateau

### Constats
1. **Les quatre rangées de cinq zones se ressemblent** : on ne voit pas d'un coup d'œil où vont les apparitions et où vont les présages, ni quel camp est le sien, à part la position.
2. **L'hologramme adverse déborde** : « Famille » se dresse à cheval entre deux zones ; son étiquette « 1400 / 1600 » chevauche la consigne du centre (« Invoquez, posez, jouez vos influences »).
3. **Les encarts s'empilent en haut à gauche** et couvrent la barre de vie de l'adversaire au moment même où elle change.
4. **La loupe au survol** (la carte en grand) reste ouverte pendant les animations et couvre la moitié du tapis.
5. **Deux badges « ✦ 4 »** (les réserves de figures) ne disent pas ce qu'ils comptent ; le mot « réserve » est minuscule.
6. Les boutons « Techniques » et « Accords » ont la même couleur vive, qu'une action soit prête ou non.
7. Les phases (Pioche, Principale, Combat…) sont petites et à droite : on ne sait pas toujours que « Combat » est la suite logique.

### Propositions
- **P1** Les encarts vont dans une colonne au-dessus de la main (ou à droite sur grand écran), **jamais sur les points de vie**. Trois encarts au plus ; les plus anciens se replient en une ligne.
- **P1** Loupe : seulement après 400 ms d'immobilité, jamais pendant une animation, fermée dès que le pointeur bouge.
- **P1** Hologrammes à l'échelle de leur zone, centrés, avec une petite ombre au sol ; l'étiquette ATK / DEF sous la zone, jamais sur la consigne.
- **P2** Zones différenciées : les zones d'apparition en cadre doré avec une silhouette ; les zones de présage plus basses, en cadre violet avec un œil ; le camp adverse teinté plus froid.
- **P2** Boutons « Techniques » et « Accords » sobres quand rien n'est prêt, lumineux et pulsant une fois (sans boucle) avec le nombre prêt (« ✦ Accords 2 »).
- **P2** La consigne du centre passe dans un bandeau fin entre le tapis et la main, avec le nom de la phase en grand.
- **P3** Badge de réserve avec un petit éventail de figures et la légende « figures ».

---

## 3. Rythme et sensations

### Chiffres (300 duels simulés)
| | sans dictionnaire | avec dictionnaire |
|---|---|---|
| Tours par duel | 12 | 14 |
| Règles de Belline accomplies | 0,31 par duel | 0,36 par duel |
| Grands accords | 0,36 par duel | 0,39 par duel |
| Invocations célestes | 0,34 par duel | 0,39 par duel |
| Lectures (dictionnaire ou lectures modernes) | 5,4 par duel | 23,5 par duel |
| Attaques directes | 3,4 par duel | 3,9 par duel |
| Soins par rapport aux dégâts | 33 % | 50 % |

### Constats
1. **Le cœur du jeu est rare.** Une règle de Belline (ce qu'on veut apprendre) ne s'accomplit qu'une fois tous les trois duels. Les lectures, elles, arrivent presque à chaque carte révélée depuis que le dictionnaire est branché.
2. **Risque de bruit** : avec 23 lectures par duel, chaque encart de 6 secondes finit par cacher les vrais moments forts (règle, Grand accord, astre).
3. **Soins trop forts avec le dictionnaire** : 50 % des dégâts sont rendus en soins (la cible du projet est un quart), et les duels s'allongent un peu.
4. **Une courbe de niveaux creuse** : 23 apparitions de niveau 1 à 4, une seule de niveau 5 ou 6 (le Bonheur), puis cinq cartes fortes. Le sacrifice d'une carte, mécanique centrale des jeux de duel, n'existe presque pas.
5. **Le combat manque de poids** : pas de chiffre de dégâts qui jaillit, pas de ralenti sur le coup final, et l'écran de fin est sobre.

### Propositions
- **P1 L'Appel des règles** (ajout de jeu) : une fois par duel, quand une carte de votre main appartient à une règle de Belline dont l'autre carte est dans votre deck, vous pouvez chercher cette autre carte (bouton dans Techniques). Visé : une règle par duel environ.
- **P1 Hiérarchie des associations** en quatre niveaux, chacun avec son traitement :
  1. lecture : une ligne lumineuse entre les deux cartes et un chiffre flottant (+150), sans encart ;
  2. écho et accompagnement : un encart court ;
  3. règle de Belline : bannière dorée, encart long, sort ;
  4. Grand accord et astre : secousse, éclair, bannière pourpre et or.
- **P1 Équilibre** : lecture favorable ramenée à 100 points, ou bien +100 ATK jusqu'à la fin du tour à la carte révélée plutôt que des points de vie (à mesurer : soins vers 25 à 30 %).
- **P1 Courbe de niveaux** : passer quatre ou cinq des apparitions de niveau 4 les plus fortes au niveau 5 (un sacrifice), en relevant leur ATK de 300 à 400. Candidates : Passions (2200), Ennemis (2000), Honneur, Feu, Renommée (1800). Les effets restent tirés de leur notice.
- **P2 Chiffres de combat** : les dégâts jaillissent de la carte touchée (rouge, en grand, puis retombent) ; les soins montent en vert.
- **P2 Coup final** : ralenti, zoom sur la carte qui l'emporte, la barre de vie se vide d'un trait, puis l'écran de fin.
- **P2 Écran de fin riche** : vos meilleurs moments (règle accomplie, plus gros coup, astre invoqué), les règles apprises dans le carnet, un conseil tiré du duel (« vous avez joué peu de présages »), et le bouton Revanche bien en vue.
- **P3** Quand la vie passe sous 2000 : battement de cœur discret, bord de l'écran rougi.

---

## 4. Beauté

### Constats
1. Le tapis est un dégradé violet uni ; seule l'ambiance (particules) change selon la planète du duel.
2. Les cartes de la main ne réagissent pas au survol, sauf la loupe.
3. Les dos des cartes adverses sont plats et ne s'animent pas à la pioche.
4. Les polices sont chargées en ligne : hors ligne, le jeu perd Cinzel et EB Garamond.

### Propositions
- **P1 Un tapis par planète** : un motif gravé en or pâle sous les zones (la roue du Soleil, les phases de la Lune, le caducée de Mercure, la rose de Vénus, l'épée de Mars, la foudre de Jupiter, le sablier de Saturne), avec la couleur de la région. Le ciel du duel se voit enfin.
- **P2 Cartes vivantes** : à l'approche du doigt ou de la souris, la carte se penche légèrement (3 à 5 degrés) et un reflet glisse sur les cartes rares. Dessiné une fois : aucune boucle, pour ne pas faire scintiller.
- **P2 La pioche se voit** : la carte sort du deck, se retourne en vol et rejoint la main ; chez l'adversaire, un dos glisse vers sa main.
- **P2 Musique d'ambiance** : un bourdon doux par planète (quelques notes générées, comme les sons actuels), avec son propre réglage de volume.
- **P3** Les figures d'accord et les astres apparaissent avec un cadre animé une seule fois (or qui se dessine le long du bord).
- **P3** Embarquer les polices pour le jeu hors ligne (piste déjà notée).

---

## 5. Téléphone

### Constats
1. Sept cartes de 88 px dans 358 px : elles se chevauchent, et leur texte devient illisible. La feuille du bas compense, mais il faut toucher chaque carte pour la lire.
2. La barre du haut occupe 56 px avec quatre boutons à libellé.
3. Les boutons de phase et certains badges font moins de 44 px : difficiles à toucher.
4. Aucun retour tactile.

### Propositions
- **P1 Main en éventail** : la carte touchée monte et grandit, ses voisines s'écartent ; un appui long ouvre le zoom.
- **P2** Barre du haut en icônes seules (aide, vitesse, journal, son) ; libellés dans un menu.
- **P2** Cibles tactiles d'au moins 44 px pour les phases, les réserves et les piles.
- **P3** Vibration légère (Android) sur un coup reçu, une règle accomplie, un astre.
- **P3** Vérifier le mode paysage (non testé dans cet audit).

---

## 6. Compréhension

### Constats
1. Les mots du jeu (présage, influence, terrain, figure, astre, offrande) ne sont expliqués que dans l'aide.
2. Le mode apprenti (l'Ombre explique ses coups) est désactivé par défaut.
3. Le journal est long : les entrées les plus récentes viennent en premier, toutes avec la même apparence.

### Propositions
- **P1** Le mode apprenti est activé pendant les trois premiers duels.
- **P2** La première fois qu'un mot paraît (premier présage déclenché, premier terrain…), une petite bulle l'explique en une phrase, une seule fois (mémorisé dans le carnet).
- **P2 Journal illustré** : une icône et une couleur par sorte (combat, accord, invocation, présage) ; les associations en doré ; un filtre « moments forts ».

---

## 7. Envie de revenir

### Propositions
- **P1 Le ciel des règles** : une carte du ciel où chaque règle de Belline apprise allume une étoile ; les 30 règles forment des constellations par planète. On voit ce qu'il reste à découvrir.
- **P2 Le défi du jour** : un duel à graine du jour, le même pour tous, avec une contrainte (« accomplir Campagne et Table »).
- **P2 L'album** : les 53 cartes, combien de fois jouées, les rares (reflet) obtenues dans le Chemin, les figures et astres débloqués.
- **P3 Rangs du mage** : Apprenti, Adepte, Mage, Maître de Belline, selon les règles apprises et les Gardiens vaincus.
- **P3 Pont avec le Chemin** : une carte vécue dans le Chemin donne en duel un petit bonus visible (reflet et +100 ATK), pour relier les deux jeux.

---

## 8. Qualité et confort

- **P2** Respecter « réduire les animations » (`prefers-reduced-motion`) : le Duel ne le gère pas encore ; secousses et éclairs devraient alors disparaître.
- **P2** Contraste : certains textes gris sur violet sont en dessous du seuil de lisibilité.
- **P3** `js/duel-main.js` dépasse 1600 lignes : séparer les animations (`animer`) et l'atelier du deck dans leurs propres modules rendra les prochains ajouts plus sûrs.

---

## Plan proposé

| Lot | Contenu | Effet |
|---|---|---|
| 1 | Encarts hors des points de vie, loupe différée, hologrammes à l'échelle, hiérarchie des associations, équilibre des lectures, premier duel doux, apprenti par défaut | Le jeu devient lisible et agréable dès maintenant |
| 2 | Appel des règles, courbe de niveaux (niveau 5), chiffres de combat, coup final, écran de fin riche | Les duels ont du poids, les règles de Belline arrivent |
| 3 | Tapis par planète, cartes vivantes, pioche animée, main en éventail sur téléphone | La beauté |
| 4 | Duel d'initiation guidé, accueil « Jouer », bulles des mots | L'entrée en jeu |
| 5 | Ciel des règles, défi du jour, album, rangs | L'envie de revenir |

Tout ce qui touche aux règles reste signalé comme ajout de jeu, avec un effet tiré des mots de la notice.
