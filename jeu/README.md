# Le Chemin du Mage

Deux jeux pour apprendre l'Oracle de Belline.

**Le Chemin.** Vu de dessus, le mage monte le jeu d'Edmond, du bas vers le haut : La Destinée, puis les planètes, du Soleil à Saturne. Vous le dirigez. Aux fourches, lisez les cartes et choisissez votre branche ; une carte sur votre route se vit et agit selon la notice de Belline ; sautez-la si vous préférez l'éviter. À chaque porte, retenez une carte pour votre tirage et répondez à l'énigme de la porte. À la fin, votre tirage (une carte par planète) est dessiné et lu, avec les règles de voisinage de Belline.

**Le Duel des Apparitions.** À la manière des jeux de cartes à duel : 8000 points de vie, six cartes en main, et l’Ombre en face. Les figures du jeu s’invoquent en apparitions (niveau, ATK, DEF) qui se dressent sur le tapis ; les événements se jouent en influences ; les présages se posent face cachée et se déclenchent pendant le tour adverse. Deux cartes que la notice associe, révélées à la suite, accomplissent un accord de Belline. Les influences peuvent se poser face cachée pour être révélées plus tard ; trois apparitions d’une même planète forment un alignement qui transforme le terrain ; des associations de cartes révélées (la Destinée et les deux Étoiles, les trois freins, les messagers…) ouvrent des techniques spéciales. Chaque carte joue son effet visuel : l’Eau déferle en vague, l’Accident foudroie, le Départ s’envole en oiseaux.

Un carnet garde, d'une partie à l'autre, les cartes vues et vécues, les règles découvertes, les cartes à revoir et vos duels.

## Lancer

Double-cliquer sur `index.html`.

Ou, avec un serveur local : `npm start` puis ouvrir http://localhost:8000.

Après une modification du code dans `js/` : `npm run build`.

## Jouer au Chemin

- Flèches ou Z Q S D (W A S D) : marcher ; sur écran tactile, glisser sur la scène. Le temps ne passe que lorsque vous marchez.
- Aux fourches : ← ou →.
- Espace (ou un toucher) : sauter la carte qui est devant vous.
- Clic sur une carte : la lire ; « Y conduire le mage » pour y aller.
- B : utiliser la Carte Bleue quand vous l'avez en réserve.
- Chemin court, moyen ou grand ; chaque chemin a un numéro et peut être rejoué.

## Jouer au Duel

- Choisissez un duel libre (Novice, Adepte, Mage) ou un des Sept Gardiens (campagne, planète après planète).
- « Votre deck » : composez un deck de 30 à 53 cartes ; les cartes vécues dans le Chemin sont rares (reflet).
- Touchez une carte de votre main : invoquer, poser, activer, équiper ou poser un présage. Niveau 5 et 6 : un sacrifice ; niveau 7 et 8 : deux.
- ✦ Accord (A) : réunissez les deux cartes d’une règle de Belline que vous connaissez pour invoquer sa figure d’accord.
- En phase de combat, touchez une apparition prête puis sa cible : une flèche et le calcul des dégâts s’affichent.
- Vos présages prêts vous sont proposés quand l’adversaire attaque, invoque ou active une influence.
- Touchez un cimetière ou une réserve pour en voir les cartes. C : combat ; E : fin du tour ; Échap : annuler.

## Tester

```
npm test
```

## Développer

Voir `CLAUDE.md` : règles de contenu, ajouts de jeu signalés, architecture, et manière d'enrichir les cartes.
