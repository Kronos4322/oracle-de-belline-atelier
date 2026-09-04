/* ---------------------------------------------------------------------------
 * Repères de lecture — synthèse de plusieurs sources publiques sur l'Oracle
 * de Belline, reformulée.
 *
 * Ces textes PRÉ-REMPLISSENT les champs de chaque fiche du Grimoire. Dès que
 * tu enregistres une carte, ta version remplace ces repères (couche « edits »
 * dans storage.js). « Revenir au texte de référence » restaure ceci.
 *
 * Sources croisées : kartomanta.com, clemy-voyance.fr, oracle-de-belline.com
 *
 * Le « symbolisme de l'image » n'est pas fourni : c'est à observer sur ta
 * propre carte, c'est le meilleur exercice.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

(function () {
  var SRC = ['kartomanta.com', 'clemy-voyance.fr', 'oracle-de-belline.com'];

  function R(keywords, general, amour, travail, sante, evolution) {
    return {
      keywords: keywords,
      sens: { general: general, amour: amour, travail: travail, sante: sante, evolution: evolution },
      sources: SRC
    };
  }

  window.BELLINE.CARD_REFERENCE = {

    1: R(['destin', 'tournant majeur', 'chemin de vie', 'cycle qui s’ouvre', 'orientation'],
      'Un passage décisif : une grande orientation de vie se dessine.',
      'Rencontre ou choix sentimental qui engage l’avenir.',
      'Changement de cap, opportunité qui structure la trajectoire professionnelle.',
      'Moment charnière : écouter les signaux de fond du corps.',
      'Prise de conscience de sa trajectoire, alignement avec sa voie.'),

    2: R(['figure masculine', 'énergie d’action', 'le consultant (homme)', 'influence masculine', 'affirmation'],
      'Un homme joue un rôle central, ou l’énergie d’affirmation est en jeu.',
      'Le partenaire masculin, un prétendant, un homme influent dans la situation.',
      'Un interlocuteur, supérieur ou associé masculin déterminant.',
      'Vitalité et tonus physique à surveiller.',
      'Rapport à l’action et à l’affirmation de soi.'),

    3: R(['figure féminine', 'réceptivité', 'intuition', 'la consultante', 'influence féminine'],
      'Une femme au cœur de la situation, ou la dimension sensible à écouter.',
      'La partenaire, une rivale, une femme centrale dans le lien.',
      'Une collaboratrice, une cliente, une relation féminine importante.',
      'Sphère émotionnelle, cycles, sensibilité.',
      'Rapport à l’accueil, à l’intuition, à la vie intérieure.'),

    4: R(['commencement', 'naissance', 'renouveau', 'potentiel', 'germe'],
      'Le début d’un cycle : quelque chose prend forme et demande à grandir.',
      'Début d’histoire, lien naissant, renouveau dans le couple.',
      'Nouveau projet, prise de poste, lancement prometteur.',
      'Regain de vitalité, nouveau départ dans l’hygiène de vie.',
      'Naissance d’une conscience nouvelle, élan de renouveau.'),

    5: R(['succès', 'aboutissement', 'reconnaissance', 'résultat concret', 'victoire'],
      'Un effort qui porte ses fruits, une issue favorable.',
      'Relation qui progresse, satisfaction, concrétisation.',
      'Objectif atteint, projet validé, reconnaissance méritée.',
      'Nette amélioration, énergie retrouvée.',
      'Confiance en ses capacités, sentiment d’accomplissement.'),

    6: R(['progression', 'ascension', 'ambition', 'montée en puissance', 'promotion'],
      'On s’élève, pas à pas, vers un niveau supérieur.',
      'Relation qui gagne en maturité, engagement qui se renforce.',
      'Promotion, responsabilités accrues, évolution de statut.',
      'Amélioration progressive, remise en forme qui monte.',
      'Élévation de conscience, dépassement de soi.'),

    7: R(['reconnaissance', 'prestige', 'estime', 'légitimité', 'distinction'],
      'Mérite reconnu, image valorisée, respect obtenu.',
      'Relation assumée et respectée, fierté partagée.',
      'Réputation, visibilité, crédibilité, honneurs professionnels.',
      'Rapport valorisant à son corps et à son image.',
      'Reconnaissance de sa valeur, alignement avec sa dignité.'),

    8: R(['soutien sincère', 'amitié', 'bienveillance', 'appui discret', 'confiance'],
      'Un attachement bienveillant, un soutien moral sur lequel compter.',
      'Complicité, tendresse, relation fondée sur la confiance.',
      'Appui d’un collègue, réseau sain, entraide.',
      'Moral porté par les proches, entourage soutenant.',
      'Gratitude, qualité des liens, donner et recevoir.'),

    9: R(['repos', 'nature', 'récupération', 'ralentir', 'équilibre de vie'],
      'Besoin de souffler, de revenir au simple et au calme.',
      'Retour à la simplicité, apaisement, respiration dans le lien.',
      'Lever le pied, préserver son rythme, environnement plus sain.',
      'Convalescence, hygiène de vie, ressourcement, mieux-être physique.',
      'Écoute du corps, retour à l’essentiel.'),

    10: R(['cadeau', 'faveur', 'opportunité', 'chance', 'geste favorable'],
      'Un avantage offert, une aide ou une occasion inattendue.',
      'Marque d’affection reçue, attention qui touche.',
      'Proposition, prime, opportunité à saisir.',
      'Coup de pouce, amélioration offerte par les circonstances.',
      'Capacité à recevoir, reconnaissance de ce qui est donné.'),

    11: R(['déloyauté', 'dissimulation', 'doute', 'méfiance', 'non-dit'],
      'La confiance est fragilisée : vigilance sur les intentions réelles.',
      'Soupçon, non-dits, sentiment d’être trompé·e ou tenu·e à l’écart.',
      'Risque de coup bas, promesses à vérifier, prudence sur les alliances.',
      'Ne pas négliger un signal, se méfier d’un avis hâtif.',
      'Apprendre à discerner ; surtout, ne pas se trahir soi-même.'),

    12: R(['éloignement', 'séparation', 'mouvement', 'transition', 'mise à distance'],
      'Quelque chose s’en va ou se met en mouvement ; une page se tourne.',
      'Distance, prise de recul, éloignement momentané ou rupture.',
      'Déplacement, mutation, changement de lieu ou d’équipe.',
      'Besoin de changer d’air, de quitter un environnement pesant.',
      'Lâcher-prise, accepter qu’un cycle se termine.'),

    13: R(['instabilité', 'hésitation', 'fluctuation', 'irrégularité', 'versatilité'],
      'Rien n’est fixé : les choses ou les gens changent d’avis.',
      'Relation en dents de scie, partenaire changeant, incertitude.',
      'Projet sans cadre, priorités mouvantes, manque de continuité.',
      'Symptômes variables, énergie en yo-yo.',
      'Besoin de stabiliser ses choix, de clarifier ses désirs.'),

    14: R(['révélation', 'information nouvelle', 'vérité qui apparaît', 'solution', 'éclaircissement'],
      'Un élément caché devient visible et change la donne.',
      'Discussion qui éclaire, découverte sur l’autre ou sur soi.',
      'Information utile, transparence, solution trouvée.',
      'Diagnostic clair, compréhension d’un trouble.',
      'Prise de conscience, accès à une vérité intérieure.'),

    15: R(['émotions', 'intuition', 'profondeur', 'sensibilité', 'trouble possible'],
      'La vie émotionnelle domine ; écouter ce qui se joue en profondeur.',
      'Sentiments intenses, besoin de sécurité affective, larmes possibles.',
      'Importance de l’écoute, de la créativité, de l’adaptation.',
      'Sphère émotionnelle, rétention, fatigue liée au stress.',
      'Navigation intérieure : accueillir ses émotions sans s’y noyer.'),

    16: R(['foyer', 'maison', 'intimité', 'racines', 'sécurité domestique'],
      'La sphère privée, le chez-soi, le besoin de se sentir en sécurité.',
      'Vie commune, cocon, stabilité du couple, projet de foyer.',
      'Télétravail, entreprise familiale, ancrage.',
      'Repos à la maison, importance d’un cadre rassurant.',
      'Rapport à ses racines, besoin d’un port d’attache intérieur.'),

    17: R(['fragilité', 'fatigue', 'ralentissement', 'déséquilibre', 'vulnérabilité'],
      'Un point de faiblesse à soigner, une usure à prendre au sérieux.',
      'Relation épuisante, moral en berne, lien à soigner.',
      'Surmenage, baisse d’énergie, arrêt possible.',
      'Trouble physique ou psychique : besoin de soin et de repos.',
      'Écouter ce que le mal-être révèle, se réparer.'),

    18: R(['transformation', 'mobilité', 'évolution', 'adaptation', 'bascule'],
      'Le contexte bouge : il faut s’ajuster et accompagner le mouvement.',
      'Nouvelle dynamique, relation qui se transforme.',
      'Réorganisation, changement de méthode ou de poste.',
      'Modification d’habitudes, transition de traitement.',
      'Souplesse : muer sans résister.'),

    19: R(['ressources', 'finances', 'gains', 'sécurité matérielle', 'échanges d’argent'],
      'La question matérielle est au centre ; flux d’argent à mesurer.',
      'Aspect financier du couple, équilibre donner-recevoir.',
      'Revenus, contrat, négociation salariale, rentrée d’argent.',
      'Moyens de se soigner, lien entre stress et finances.',
      'Rapport à la valeur, à l’abondance, à la juste circulation.'),

    20: R(['analyse', 'discernement', 'stratégie', 'clarté mentale', 'compétence'],
      'La tête prime : comprendre, planifier, décider avec lucidité.',
      'Relation réfléchie, discussion lucide avant de s’engager.',
      'Expertise, résolution stratégique, bonne décision.',
      'Comprendre le fonctionnement de son corps, choix éclairés.',
      'Lucidité, connaissance de soi, esprit clair.'),

    21: R(['perte', 'manque', 'dépossession', 'vigilance', 'fuite'],
      'Quelque chose est perdu, pris ou gaspillé : protéger ce qui compte.',
      'Peur de perdre l’autre, déséquilibre, confiance entamée.',
      'Perte financière, vol d’idée, vigilance contractuelle.',
      'Perte d’énergie, fuite de vitalité, négligence.',
      'Deuil : distinguer l’essentiel du superflu.'),

    22: R(['projet', 'initiative', 'construction', 'action organisée', 'volonté'],
      'On entreprend : un plan d’action se met en place.',
      'Projets de couple, initiatives pour faire avancer le lien.',
      'Lancement, création, démarche structurée.',
      'Prendre en main sa forme, programme d’action.',
      'Passer à l’acte, structurer sa volonté.'),

    23: R(['échanges', 'commerce', 'circulation', 'négociation', 'allers-retours'],
      'Ça circule : contacts, transactions, mouvement d’informations.',
      'Échanges fréquents, relation à distance, beaucoup de messages.',
      'Ventes, réseau, transactions actives, déplacements.',
      'Mobilité, activité ; éviter la dispersion.',
      'Fluidité des échanges : savoir donner et recevoir.'),

    24: R(['message', 'annonce', 'information entrante', 'contact', 'signe'],
      'Une nouvelle arrive et fait bouger la situation.',
      'Message attendu, reprise de contact, déclaration.',
      'Réponse, information importante, proposition.',
      'Résultat d’examen, nouvelle sur un traitement.',
      'Être attentif aux signes, à ce qui vient de l’extérieur.'),

    25: R(['joie', 'légèreté', 'désir', 'sorties', 'satisfaction'],
      'Moments agréables, plaisir simple, détente.',
      'Attirance, séduction, moments doux et complices.',
      'Ambiance plaisante, gratification, créativité.',
      'Bien-être, énergie du plaisir ; éviter les excès.',
      'Se réautoriser la joie, savourer l’instant.'),

    26: R(['apaisement', 'réconciliation', 'équilibre', 'tranquillité', 'calme retrouvé'],
      'Après la tension, le calme ; un conflit s’apaise.',
      'Réconciliation, dialogue serein, harmonie retrouvée.',
      'Résolution d’un différend, environnement stable.',
      'Apaisement nerveux, retour à l’équilibre.',
      'Paix intérieure, réconciliation avec soi.'),

    27: R(['alliance', 'engagement', 'association', 'lien fort', 'officialisation'],
      'Deux forces se lient ; un engagement se prend.',
      'Mise en couple, fiançailles, mariage, relation consolidée.',
      'Partenariat, contrat, collaboration solide.',
      'Cohérence corps-esprit, alliance des soins.',
      'Unification intérieure, choix alignés.'),

    28: R(['proches', 'foyer', 'clan', 'transmission', 'appartenance'],
      'La famille et les liens du sang influencent la situation.',
      'Influence de la famille, sécurité d’appartenance, belle-famille.',
      'Entreprise familiale, équipe très soudée.',
      'Hérédité, santé des proches, soutien familial.',
      'Rapport aux racines, place dans la lignée.'),

    29: R(['sentiment', 'attachement', 'affection', 'élan du cœur', 'tendresse'],
      'Le cœur parle : un sentiment sincère est présent.',
      'Amour vrai, attirance profonde, relation qui compte.',
      'Passion pour le métier, relations chaleureuses.',
      'Bienfait de se sentir aimé ; le cœur au propre et au figuré.',
      'Ouverture du cœur, amour de soi.'),

    30: R(['partage', 'réunion', 'convivialité', 'échange', 'hospitalité'],
      'On se réunit autour d’un cadre commun ; convivialité.',
      'Rendez-vous, discussions intimes, moments à deux.',
      'Réunions, négociations, travail d’équipe.',
      'Alimentation, rapport à la nourriture, repas partagés.',
      'Nourrir ses liens, générosité.'),

    31: R(['désir intense', 'excès', 'attirance forte', 'impulsivité', 'feu du cœur'],
      'Une force émotionnelle puissante : à la fois moteur et risque.',
      'Relation passionnelle, intensité, risque de dépendance ou de jalousie.',
      'Ambition brûlante, engagement total ; attention aux excès.',
      'Emballements, tensions ; canaliser l’énergie.',
      'Habiter l’intensité sans se consumer.'),

    32: R(['malveillance', 'jalousie', 'paroles blessantes', 'intention de nuire', 'coup bas'],
      'Une hostilité agit dans l’ombre : médisance ou mauvaise volonté.',
      'Jalousie, mots qui blessent, tiers malveillant.',
      'Rivalité déloyale, rumeurs, ambiance toxique.',
      'Usure due à un climat hostile, stress relationnel qui somatise.',
      'Se protéger ; ne pas répondre à la nuisance par la nuisance.'),

    33: R(['conflit', 'confrontation', 'litige', 'trancher', 'justice'],
      'Un désaccord formel qui demande une décision ou un arbitrage.',
      'Affrontement, mise au point nécessaire, séparation conflictuelle.',
      'Litige, contentieux, négociation dure.',
      'Décision médicale à trancher, second avis.',
      'Assumer ses positions, chercher l’équité.'),

    34: R(['contrôle', 'autorité excessive', 'pression', 'contrainte', 'emprise'],
      'Un rapport de force pesant : quelqu’un ou quelque chose impose sa loi.',
      'Relation dominatrice, jalousie contrôlante, manque de liberté.',
      'Hiérarchie écrasante, micro-management, pression.',
      'Sentiment d’étouffement, tension liée à la contrainte.',
      'Reprendre son pouvoir, poser des limites.'),

    35: R(['opposition', 'rivalité', 'obstacles extérieurs', 'adversité', 'hostilité'],
      'Des forces contraires s’opposent à vous ; obstacles humains.',
      'Rivalité amoureuse, entourage hostile au couple.',
      'Concurrence agressive, opposants, freins politiques.',
      'Résistance de l’organisme, lutte contre un trouble.',
      'Identifier ses vrais obstacles, y compris intérieurs.'),

    36: R(['négociation', 'discussion tendue', 'compromis', 'tractations', 'débat'],
      'On discute pour trouver un terrain d’entente, non sans friction.',
      'Mise au point, négociation des besoins de chacun.',
      'Négociation de contrat, médiation, tractations.',
      'Dialogue avec les soignants, ajustement d’un traitement.',
      'Négocier sans se renier.'),

    37: R(['énergie intense', 'crise', 'passion', 'impulsivité', 'embrasement'],
      'Forte énergie qui peut créer ou détruire : urgence, éclat.',
      'Passion vive, dispute enflammée, désir brûlant.',
      'Projet qui s’accélère, crise à gérer, surchauffe.',
      'Inflammation, fièvre, montée de tension, épuisement.',
      'Canaliser sa puissance ; transformer la colère en élan.'),

    38: R(['imprévu', 'choc', 'rupture soudaine', 'secousse', 'incident'],
      'Un événement brutal bouscule les certitudes.',
      'Crise soudaine, révélation choc, rupture inattendue.',
      'Contretemps majeur, incident, projet stoppé net.',
      'Blessure, malaise soudain : prudence physique.',
      'Composer avec l’imprévu, rebondir après le choc.'),

    39: R(['soutien concret', 'protection', 'aide', 'mentor', 'ressources'],
      'Une aide solide se présente : on ne porte pas tout seul.',
      'Partenaire soutenant, relation qui protège, entourage aidant.',
      'Mentor, appui hiérarchique, financement, recommandation.',
      'Bon accompagnement médical, soutien des proches.',
      'Accepter l’aide sans s’y reposer entièrement.'),

    40: R(['harmonie', 'charme', 'séduction', 'esthétique', 'épanouissement'],
      'Quelque chose de beau et d’harmonieux se manifeste.',
      'Attirance, relation harmonieuse, séduction qui opère.',
      'Image soignée, projet élégant, créativité valorisée.',
      'Rapport apaisé au corps, éclat, vitalité.',
      'Goût du beau, harmonie intérieure.'),

    41: R(['transmission', 'legs', 'passé familial', 'tradition', 'schémas hérités'],
      'Le passé et ce qui se transmet pèsent sur le présent.',
      'Schémas familiaux rejoués, héritage affectif.',
      'Reprise d’une activité, savoir-faire transmis, dossier ancien.',
      'Terrain héréditaire, antécédents familiaux.',
      'Trier son héritage : garder l’utile, laisser le reste.'),

    42: R(['maturité', 'discernement', 'prudence', 'conseil avisé', 'recul'],
      'La situation appelle mesure et réflexion posée.',
      'Relation mûre, décisions réfléchies, patience.',
      'Bon conseil, stratégie prudente, expérience qui parle.',
      'Modération, hygiène de vie raisonnée.',
      'Hauteur de vue, paix par la compréhension.'),

    43: R(['réputation', 'notoriété', 'reconnaissance publique', 'visibilité', 'image'],
      'On est vu et reconnu ; l’image publique compte.',
      'Relation exposée au regard des autres, réputation du couple.',
      'Visibilité, notoriété professionnelle, bouche-à-oreille.',
      'Image de soi, regard social porté sur le corps.',
      'Rapport au regard des autres ; cohérence entre image et être.'),

    44: R(['chance', 'synchronicité', 'opportunité inattendue', 'coup du sort', 'destin'],
      'Un événement fortuit change la donne, souvent favorablement.',
      'Rencontre due au hasard, timing heureux.',
      'Opportunité imprévue, concours de circonstances.',
      'Heureux hasard : bon diagnostic, bon praticien croisé au bon moment.',
      'Confiance dans ce qui advient, lecture des coïncidences.'),

    45: R(['joie profonde', 'accomplissement', 'plénitude', 'contentement', 'chance'],
      'Une période heureuse, un bien-être qui comble.',
      'Relation épanouie, bonheur partagé, sérénité.',
      'Satisfaction, réussite vécue avec joie.',
      'Bonne forme générale, moral solide.',
      'Gratitude, sentiment de plénitude.'),

    46: R(['épreuve', 'difficulté', 'contrariété', 'malchance passagère', 'obstacle'],
      'Une passe difficile, des contrariétés à traverser.',
      'Période creuse, malentendus, moral affecté.',
      'Revers, projet contrarié, échéance manquée.',
      'Coup de fatigue, petits maux à répétition.',
      'Endurance ; chercher le sens dans l’épreuve.'),

    47: R(['blocage', 'impasse', 'effort sans fruit', 'immobilisme', 'infécondité'],
      'Rien ne pousse ici : voie sans issue ou attente vaine.',
      'Relation qui n’évolue plus, projet d’enfant contrarié, lassitude.',
      'Projet qui stagne, efforts non récompensés.',
      'Fatigue chronique, fonction ralentie, fertilité.',
      'Renoncer à ce qui ne donne rien ; redéployer son énergie.'),

    48: R(['inévitable', 'dénouement imposé', 'fin de cycle', 'ce qui échappe au contrôle', 'karma'],
      'Une issue s’impose, qu’on ne peut pas infléchir.',
      'Fin inéluctable ou lien karmique : accepter ce qui est.',
      'Décision subie, restructuration imposée.',
      'Évolution qu’on ne maîtrise pas ; se faire accompagner.',
      'Accepter ses limites, faire la paix avec l’inéluctable.'),

    49: R(['protection', 'faveur du ciel', 'soulagement', 'bénédiction', 'aide inespérée'],
      'Une issue douce après l’épreuve : on est protégé.',
      'Pardon, réconciliation inespérée, apaisement.',
      'Sauvetage in extremis, soutien décisif.',
      'Rémission, mieux inattendu, soulagement.',
      'Recevoir la grâce, s’ouvrir à plus grand que soi.'),

    50: R(['effondrement', 'perte importante', 'obsolescence', 'fin d’un édifice', 'chute'],
      'Une structure s’écroule : ce qui était bâti ne tient plus.',
      'Rupture profonde, relation qui s’effondre, désillusion.',
      'Faillite, perte de poste, projet qui s’écroule.',
      'Gros coup de fatigue, effondrement des défenses.',
      'Reconstruire sur des bases plus justes après la chute.'),

    51: R(['lenteur', 'ajournement', 'attente', 'patience imposée', 'délai'],
      'Les choses prennent du temps : il faut patienter.',
      'Relation qui piétine, engagement repoussé.',
      'Dossier bloqué, décision différée, calendrier qui glisse.',
      'Convalescence longue, résultats lents.',
      'Apprendre la patience, respecter le temps juste.'),

    52: R(['retrait', 'isolement', 'introspection', 'solitude', 'mise à l’écart'],
      'Un temps de repli, volontaire ou subi, loin de l’agitation.',
      'Solitude, relation distante, besoin de s’isoler.',
      'Travail solitaire, mise au placard, retrait d’un projet.',
      'Repos imposé, isolement, convalescence au calme.',
      'Le silence et la solitude comme chemin de connaissance de soi.'),

    53: R(['protection', 'bénédiction', 'sécurité', 'chance', 'présage favorable'],
      'La carte la plus favorable : elle protège et adoucit tout le tirage.',
      'Relation protégée, obstacles qui s’aplanissent.',
      'Projet sous bonne étoile, sécurité.',
      'Protection, guérison favorisée.',
      'Confiance : le sentiment d’être guidé et soutenu.')
  };
})();
