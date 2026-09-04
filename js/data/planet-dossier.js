/* ---------------------------------------------------------------------------
 * Dossier de référence des sept influences planétaires du Belline.
 * Genere depuis Oracle_de_Belline_Les_7_Planetes_Dossier_de_reference.docx
 * (Camille, sept. 2026) - ne pas editer a la main.
 * ------------------------------------------------------------------------- */
window.BELLINE = window.BELLINE || {};

BELLINE.ASTRO_NOTE = "Le terme « planète » est employé ici au sens astrologique traditionnel du Belline : le Soleil et la Lune font partie des sept luminaires/astres du septénaire, bien qu’ils ne soient pas des planètes au sens astronomique moderne.";

BELLINE.ASTRO_INTRO = [
  "L’Oracle de Belline possède une architecture remarquablement régulière : les cartes 4 à 52 forment quarante-neuf lames réparties en sept séries de sept cartes. Ces séries correspondent au Soleil, à la Lune, à Mercure, à Vénus, à Mars, à Jupiter et à Saturne. Les cartes situées avant la Nativité — Destinée, Étoile de l’Homme et Étoile de la Femme — sont hors série planétaire ; la Carte Bleue, ajoutée dans le Belline moderne, l’est également. La structure planétaire n’est donc pas un décor : elle constitue un second niveau de lecture qui colore immédiatement le sens de chaque lame.",
  "Il serait pourtant erroné de plaquer mécaniquement un manuel d’astrologie sur le Belline. Le Mage Edmond reprend le septénaire traditionnel, mais il lui donne une grammaire propre. Le Soleil devient avant tout réalisation et vitalité ; la Lune, monde émotionnel, mobilité et inconscient ; Mercure, réflexion, économie, entreprise et information ; Vénus, plaisir, paix, union, famille et amour ; Mars, conflit, action, rapport de force et événement brusque ; Jupiter, appui, transmission, renommée, hasard et bonheur ; Saturne, limitation, temps, perte, retard, cloître — mais aussi Grâce. La planète ne remplace donc jamais le sens de la carte : elle l’explique, l’oriente et révèle la logique commune à toute sa famille.",
  "Dans une lecture pratique, l’influence planétaire peut servir de niveau intermédiaire entre le mot inscrit sur la carte et son interprétation contextuelle. Une carte peut être lue comme un substantif — ce dont parle le tirage — puis être qualifiée par les cartes voisines. La planète permet alors de savoir de quel registre procède l’événement : solaire s’il cherche à se réaliser ; lunaire s’il fluctue ou touche l’intime ; mercurien s’il se négocie, se calcule ou se transmet ; vénusien s’il concerne le lien et le plaisir ; martien s’il exige action ou confrontation ; jupitérien s’il dépend du réseau, de l’opportunité ou de la reconnaissance ; saturnien s’il rencontre le temps, la limite ou l’épreuve.",
  "Le présent dossier distingue volontairement trois niveaux. D’abord, le noyau Belline, fondé sur la composition effective des sept séries et les interprétations contemporaines concordantes. Ensuite, une synthèse pratique destinée à la lecture des tirages. Enfin, lorsqu’elles sont mentionnées, les correspondances astrologiques générales — jours, rythmes ou qualités traditionnelles — sont présentées comme des extensions secondaires et non comme des règles canoniques de datation."
];

BELLINE.ASTRO_POLARITY_RULE = "À titre heuristique, Soleil, Vénus et Jupiter ont une coloration plutôt favorable ; Mars et Saturne tendent vers l’épreuve ou la contrainte ; Lune et Mercure sont particulièrement variables et prennent facilement la couleur de la question et des cartes voisines. Cette règle ne doit jamais écraser le sens individuel : Hasard reste aléatoire malgré Jupiter, Passions peut devenir destructrice malgré Vénus, Grâce reste favorable malgré Saturne, et Découverte peut être excellente malgré la Lune.";

BELLINE.PLANET_DOSSIER = {
  soleil: {
    cartes: '4 à 10', tendance: 'Très favorable',
    lead: 'Expansion vitale, accomplissement, visibilité, croissance et reconnaissance.',
    noyau: "Dans le Belline, le Soleil forme la première série planétaire et constitue la famille la plus directement associée à la réalisation. Belline.fr le présente comme le noyau vital du système : source de fertilité, d’épanouissement, de chaleur humaine, de succès et de développement. Ce caractère explique l’étonnante cohérence de la série : elle commence par Nativité, fait croître ce qui est né avec Réussite et Élévation, le rend visible avec Honneurs, l’inscrit dans les relations avec Pensée-Amitié, le rattache à la vie avec Campagne-Santé, puis se matérialise dans Présents. Le Soleil ne signifie donc pas seulement « bonheur » ; il décrit le mouvement par lequel quelque chose devient vivant, manifeste, reconnu et fécond.",
    harmonieux: "Mode harmonieux : confiance, vitalité, visibilité, réussite assumée, générosité, croissance, santé symbolique, reconnaissance et capacité à entraîner les autres. Une dominante solaire indique souvent que la situation cherche à se manifester au grand jour et à parvenir à un résultat concret.",
    ombre: "Mode excessif : orgueil, surexposition, besoin d’être reconnu, optimisme démesuré, volonté d’occuper tout l’espace, difficulté à accepter les zones d’ombre ou les délais. Une carte solaire défavorable ne devient pas nécessairement négative par nature ; elle peut montrer qu’une réussite, un statut ou une attente de reconnaissance devient le problème.",
    domaines: {
      amour: "En amour, le Soleil favorise la clarté, la joie d’être ensemble, la reconnaissance mutuelle et les relations qui peuvent être assumées au grand jour. Sa série parle moins d’érotisme que Vénus : elle s’intéresse davantage à la solidité positive de l’expérience et à son développement. Nativité peut annoncer un commencement, Pensée-Amitié une affection sincère, Présents des gestes concrets, tandis qu’Honneurs peut traduire une officialisation ou le fait d’être fier du lien.",
      travail: "Dans le travail, c’est la série de la progression la plus lisible : démarrage, réussite, promotion, visibilité, récompense. Une concentration de cartes solaires dans un tirage professionnel renforce l’idée qu’un projet peut sortir de l’ombre, être reconnu ou atteindre un niveau supérieur.",
      argent: "Financièrement, le Soleil est favorable mais n’est pas la famille de l’argent au sens strict : il montre surtout les effets positifs d’une situation, les récompenses et les bénéfices d’une réussite. Présents est la carte la plus matérielle de la série ; Argent, sous Mercure, reste beaucoup plus directement économique.",
      sante: "Sur le plan symbolique de la santé, le Soleil renvoie à la vitalité, au ressourcement et à la capacité de récupération, notamment par Campagne-Santé. Il ne doit jamais être utilisé comme diagnostic ou garantie médicale ; il colore plutôt la dynamique générale vers le vivant et le regain d’énergie.",
      psycho: "Psychologiquement, le Soleil correspond au sentiment d’exister pleinement : confiance, affirmation de soi, cohérence entre identité et action, besoin de créer et de laisser une trace. Dans son ombre, il peut signaler le narcissisme, la dépendance à l’approbation et la difficulté à tolérer l’échec.",
      spiritualite: "Spirituellement, le Soleil est principe d’éclairage et de conscience. Il révèle, rend manifeste et recentre. Dans une lecture initiatique, il évoque ce qui doit être intégré consciemment, assumé et transmis.",
      droit: "Dans une question juridique ou administrative, le Soleil tend à favoriser les décisions claires, la reconnaissance d’un droit, la validation et les issues visibles. Honneurs peut renforcer l’institutionnel ; Réussite, l’issue favorable ; mais la planète seule ne remplace jamais la carte décrivant l’objet du litige."
    },
    temporalite: "Temporalité : plutôt rapide à moyenne lorsqu’il s’agit de manifestation, mais aucune règle temporelle fixe n’est canonique au Belline. Symboliquement, le Soleil indique ce qui arrive à maturité ou devient visible. Extension astrologique prudente : dimanche, saison lumineuse, phase de plein développement ; à utiliser uniquement comme aide secondaire, jamais comme chronomètre automatique.",
    grammaire: "Dans une lecture substantif/adjectif, une carte solaire adjectivante donne souvent à la carte principale les qualités suivantes : favorable, vivant, croissant, visible, reconnu, réussi, fécond, soutenu. Une carte solaire substantive demande : qu’est-ce qui naît, réussit, s’élève, est reconnu ou reçoit un bénéfice ?",
    motscles: ['vitalité', 'réalisation', 'réussite', 'naissance', 'croissance', 'élévation', 'reconnaissance', 'honneurs', 'visibilité', 'santé symbolique', 'générosité', 'cadeau', 'accomplissement', 'joie', 'rayonnement', 'confiance', 'fertilité', 'expansion'],
    questions: [
      "Qu’est-ce qui cherche à naître ou à devenir pleinement visible ?",
      "Où se trouve le potentiel de réussite ou d’élévation ?",
      "La recherche de reconnaissance soutient-elle la situation ou l’enferme-t-elle ?"
    ]
  },

  lune: {
    cartes: '11 à 17', tendance: 'Variable',
    lead: 'Émotions profondes, inconscient, mobilité, fluctuations, intuition et vulnérabilité.',
    noyau: "La série lunaire est probablement la plus ambivalente du Belline. Belline.fr insiste sur les motivations profondes, les peurs primitives, le subconscient et l’intuition. La Lune change continuellement de forme ; elle décrit donc ce qui fluctue, se déplace, se cache, se ressent avant d’être compris. Les sept cartes illustrent cette logique : Trahison et Maladie font remonter les inquiétudes ; Départ et Inconstance introduisent la mobilité ; Découverte ouvre vers l’inconnu ; Eau traduit la fluidité ; Pénates recherche un abri stable au milieu de ce mouvement. La Lune est donc autant la peur que le pressentiment, autant la perte de repères que la capacité à sentir le chemin dans l’obscurité.",
    harmonieux: "Mode harmonieux : intuition, imagination, souplesse, sensibilité, capacité d’adaptation, écoute des signaux faibles, mobilité et attention à la vie intérieure. Elle permet de comprendre ce qui n’est pas encore formulé rationnellement.",
    ombre: "Mode difficile : peur, anxiété, projection, méfiance, instabilité, confusion, hypersensibilité, fuite, secrets et variations d’humeur. Une dominante lunaire demande toujours de distinguer le fait objectif de l’émotion ou de l’anticipation qu’il produit.",
    domaines: {
      amour: "En amour, la Lune décrit le monde de l’attachement, de la peur de perdre, des séparations, du foyer et des mouvements émotionnels. Elle peut donner une relation très intuitive mais fluctuante. Trahison n’est pas automatiquement une infidélité matérielle : elle peut représenter le vécu de la confiance blessée ; Départ, une distance ; Pénates, le besoin de sécurité ou de vie commune.",
      travail: "Au travail, la série lunaire indique mobilité, changement de cadre, intuition, environnement instable ou nécessité de s’adapter. Départ peut être mutation ou départ d’un poste ; Découverte, recherche et exploration ; Inconstance, organisation fluctuante. Une dominante lunaire est moins propice aux structures rigides qu’aux situations mouvantes ou créatives.",
      argent: "Financièrement, la Lune recommande prudence face aux variations et aux décisions guidées par l’inquiétude. Elle peut accompagner des dépenses liées au foyer ou aux déplacements. Elle n’est pas une famille financière : il faut lire son influence comme une modulation émotionnelle ou cyclique des questions matérielles.",
      sante: "Symboliquement, la Lune attire l’attention sur la fatigue, les rythmes, la vulnérabilité, le sommeil, la récupération et la manière dont l’état émotionnel colore le vécu corporel. Maladie est une carte d’alerte symbolique, jamais un diagnostic. L’Eau peut évoquer fluidité et récupération ; Pénates, le besoin de repos dans un lieu sécurisant.",
      psycho: "C’est la planète la plus directement liée à l’inconscient dans la grammaire du Belline. Elle parle de mémoire affective, de peurs enfouies, d’intuition, de projection et de besoin de refuge. Elle invite à écouter l’émotion sans lui accorder automatiquement valeur de preuve.",
      spiritualite: "Dans une lecture spirituelle, la Lune est guide nocturne : rêve, intuition, imagination, découverte de l’invisible et traversée de l’ombre intérieure. Elle convient particulièrement aux questions de médiumnité ou de perception symbolique, mais toujours comme langage divinatoire et non comme démonstration objective d’un phénomène surnaturel.",
      droit: "Dans les affaires juridiques ou administratives, une dominante lunaire évoque dossier mouvant, informations incomplètes, changement de position, départ, secret ou nécessité d’enquêter. Elle ne tranche pas l’issue ; elle signale surtout que la situation n’est pas encore stabilisée."
    },
    temporalite: "Temporalité : cyclique et fluctuante. Elle peut indiquer des alternances, une évolution par phases ou un changement relativement proche. Extension astrologique prudente : lundi, nuit, rythme mensuel ; à employer comme symbolique secondaire, non comme règle absolue.",
    grammaire: "Adjectivante, la Lune rend le substantif émotionnel, changeant, mobile, caché, intuitif, vulnérable ou instable. Substantive, elle attire la lecture vers ce qui se sépare, fluctue, se découvre, se protège au foyer ou se vit dans le corps et l’inconscient.",
    motscles: ['émotions', 'inconscient', 'intuition', 'fluctuation', 'mobilité', 'départ', 'peur', 'secret', 'découverte', 'eau', 'foyer', 'vulnérabilité', 'imagination', 'changement d’humeur', 'mémoire', 'refuge', 'cycles'],
    questions: [
      "Qu’est-ce qui relève du fait, et qu’est-ce qui relève de la peur ou de la projection ?",
      "Quelle partie de la situation fluctue, se déplace ou reste cachée ?",
      "Que dit l’intuition avant que l’intellect n’ait formulé une réponse ?"
    ]
  },

  mercure: {
    cartes: '18 à 24', tendance: 'Neutre / mobile',
    lead: 'Intellect, circulation, commerce, information, décision, adaptation et monde matériel.',
    noyau: "Mercure est la série de l’intelligence appliquée et de la circulation. Belline.fr le rattache explicitement à l’esprit, à la réflexion sur le travail, le matériel, la société et les choix quotidiens. Cette famille est particulièrement importante parce qu’elle relie l’intellect au concret : Changement réfléchit à l’orientation ; Argent mesure les ressources ; Intelligence analyse ; Vol-Perte protège les acquis ; Entreprise organise l’action ; Trafic met en circulation ; Nouvelle transmet l’information. Dans le Belline, Mercure est donc moins le simple « messager » de l’astrologie populaire qu’un principe de gestion, d’échange, de calcul et d’adaptation.",
    harmonieux: "Mode harmonieux : intelligence, rapidité d’esprit, souplesse, communication efficace, sens des affaires, capacité à négocier, analyser, organiser et trouver une solution pratique. Une dominante mercurienne rend le tirage très concret.",
    ombre: "Mode difficile : nervosité, dispersion, opportunisme, calcul excessif, perte, manipulation de l’information, instabilité des décisions, confusion administrative ou financière. Mercure peut rendre une situation très mobile sans garantir qu’elle soit stable.",
    domaines: {
      amour: "En amour, Mercure s’intéresse principalement au dialogue, aux décisions et à la circulation de l’information. Nouvelle peut représenter un message ; Changement, une modification de la relation ; Trafic, des échanges nombreux ; Intelligence, une relation intellectualisée. Mercure seul ne prouve ni amour ni absence d’amour : il décrit comment le lien se pense et communique.",
      travail: "C’est la grande famille du travail au sens opérationnel : entreprise, commerce, dossiers, décisions, stratégie, échanges, contrats informels et communication. Une dominante mercurienne est fréquente dans les questions professionnelles, entrepreneuriales, commerciales ou administratives.",
      argent: "C’est la famille la plus directement matérielle grâce à Argent, Vol-Perte, Entreprise et Trafic. Elle permet de distinguer ressources, risque de perte, activité génératrice de valeur et circulation commerciale. Une dominante de Mercure ne signifie pas richesse : elle indique que le nœud de la question est économique, transactionnel ou organisationnel.",
      sante: "Symboliquement, Mercure peut représenter la nécessité d’obtenir des informations, de comprendre un problème, de changer une habitude ou d’organiser un suivi. Il est moins directement corporel que Soleil ou Lune. Toute question médicale réelle doit rester du ressort des professionnels de santé.",
      psycho: "Psychologiquement, Mercure est l’intellect qui met de l’ordre : rationalisation, analyse, recherche de solutions et besoin de comprendre. Son ombre est la rumination, l’hypercontrôle cognitif ou l’utilisation de l’intelligence pour éviter le ressenti.",
      spiritualite: "Sur le plan spirituel, Mercure correspond à l’interprétation, à l’étude, à la transmission d’un savoir et au déchiffrement des symboles. Dans une pratique cartomantique, il favorise la méthode, la comparaison, l’écriture du journal de tirage et l’analyse des répétitions.",
      droit: "Très pertinent pour le droit et l’administration : dossiers, notifications, contrats, négociations, écritures, changement de statut, circulation de documents et enjeux financiers. Nouvelle peut représenter une notification ; Argent un enjeu pécuniaire ; Entreprise une structure ; Trafic un échange ; Intelligence la stratégie juridique."
    },
    temporalite: "Temporalité : généralement mobile, rapide ou liée à la réception d’une information, mais le Belline ne fournit pas de règle temporelle canonique par planète. Extension astrologique prudente : mercredi, délais courts, mouvements successifs.",
    grammaire: "Adjectivant, Mercure rend le substantif mobile, négocié, réfléchi, écrit, communiqué, commercial, financier ou changeant. Substantif, il place au centre l’information, l’argent, la décision, l’entreprise, la perte ou l’échange.",
    motscles: ['intelligence', 'information', 'communication', 'changement', 'argent', 'calcul', 'entreprise', 'commerce', 'trafic', 'nouvelle', 'contrat', 'négociation', 'stratégie', 'déplacement', 'adaptation', 'analyse', 'ressources', 'perte'],
    questions: [
      "Quelle information manque pour décider ?",
      "Quel échange, contrat, message ou calcul structure réellement la situation ?",
      "Faut-il adapter la stratégie, négocier ou changer de méthode ?"
    ]
  },

  venus: {
    cartes: '25 à 31', tendance: 'Favorable',
    lead: 'Amour, harmonie, plaisir, lien, famille, sociabilité et intensité affective.',
    noyau: "Vénus est la famille affective du Belline. Belline.fr la rattache à la beauté, à l’esthétique, à la féminité dans le langage traditionnel du XIXe siècle, à l’art, aux émotions et au plaisir. La série montre une véritable cartographie du lien : Plaisirs traite de ce qui procure satisfaction ; Paix équilibre ; Union rapproche ; Famille consolide l’appartenance ; Amour nomme le sentiment ; Table l’inscrit dans la sociabilité ; Passions montre ce qui arrive lorsque l’émotion dépasse la mesure. Vénus n’est donc pas seulement romantique : elle englobe le plaisir de vivre, l’harmonie sociale, la convivialité et l’intensité du désir.",
    harmonieux: "Mode harmonieux : affection, douceur, diplomatie, réconciliation, sensualité, beauté, créativité, plaisir partagé, sociabilité et capacité à créer de l’accord. Une dominante vénusienne ramène la question vers la qualité du lien et du ressenti.",
    ombre: "Mode difficile : dépendance affective, complaisance, recherche de plaisir sans limite, passion possessive, jalousie, évitement du conflit réel sous couvert d’harmonie, idéalisation du couple ou du groupe.",
    domaines: {
      amour: "C’est naturellement la famille centrale de l’amour. Elle permet toutefois de distinguer plusieurs niveaux : Plaisirs n’est pas Amour ; Union n’est pas nécessairement sentiment ; Famille n’est pas nécessairement couple ; Passions n’est pas nécessairement stabilité. Cette différenciation est indispensable pour une lecture fine.",
      travail: "Au travail, Vénus favorise coopération, relations professionnelles, métiers créatifs, image, esthétique, accueil, restauration, médiation, travail en équipe et satisfaction au travail. Union peut représenter un partenariat ; Table le réseau ; Paix un accord ; Passions un investissement très fort dans une activité.",
      argent: "Financièrement, Vénus s’intéresse davantage à la manière dont l’argent procure confort, plaisir ou cohésion qu’à l’argent lui-même. Elle peut décrire des dépenses de loisirs, de beauté, de famille ou de réception. Une carte mercurienne est généralement nécessaire pour préciser le mécanisme financier.",
      sante: "Symboliquement, Vénus renvoie au bien-être, au plaisir, à la détente et à l’équilibre relationnel qui soutient la qualité de vie. Elle n’autorise aucune conclusion médicale. Paix peut représenter l’apaisement ; Plaisirs, la récupération par des activités agréables ; Passions, l’excès qu’il convient parfois de modérer.",
      psycho: "Psychologiquement, Vénus décrit la capacité à recevoir et donner de l’affection, à éprouver du plaisir, à vivre la proximité et à se sentir digne d’amour. Son ombre se voit dans la dépendance, l’idéalisation, le besoin de plaire ou la peur de décevoir.",
      spiritualite: "Spirituellement, Vénus peut symboliser la voie de l’harmonie, de la beauté et de la relation. Elle rappelle que l’expérience du sacré peut aussi passer par l’art, le lien, la paix, le banquet symbolique et la rencontre de l’autre.",
      droit: "En droit ou en administration, Vénus favorise les solutions négociées, accords, partenariats et médiations. Union peut représenter un contrat ou une association si le contexte le confirme ; Paix une transaction ; Famille les questions familiales ; Table une réunion ou négociation collective."
    },
    temporalite: "Temporalité : tendance à la maturation relationnelle plutôt qu’à l’événement brusque. Extension astrologique prudente : vendredi, moments de sociabilité ou de rapprochement ; ce ne sont pas des délais canoniques du Belline.",
    grammaire: "Adjectivante, Vénus rend le substantif affectif, harmonieux, plaisant, relationnel, uni, familial, amoureux ou passionné. Substantive, elle place au centre le plaisir, la paix, le lien, l’amour, la famille, la sociabilité ou l’intensité du désir.",
    motscles: ['amour', 'union', 'paix', 'plaisir', 'famille', 'passion', 'sensualité', 'beauté', 'art', 'relation', 'harmonie', 'convivialité', 'table', 'affection', 'désir', 'réconciliation', 'sociabilité'],
    questions: [
      "Quelle est la qualité réelle du lien et du plaisir partagé ?",
      "S’agit-il d’amour, d’union, de famille, de sociabilité ou seulement de passion ?",
      "L’harmonie est-elle authentique ou obtenue au prix de l’évitement ?"
    ]
  },

  mars: {
    cartes: '32 à 38', tendance: 'Tendue / active',
    lead: 'Action, combat, conflit, volonté, rapport de force, négociation sous tension et brusquerie.',
    noyau: "Mars constitue la série de la force mise en mouvement. Belline.fr le décrit comme dynamique, courageux, ambitieux et conquérant, mais insiste aussi sur le risque de despotisme et de destruction lorsque cette énergie n’est pas maîtrisée. Les cartes de Mars racontent ainsi la progression du conflit : Méchanceté donne l’intention hostile ; Procès formalise l’opposition ; Despotisme concentre le pouvoir ; Ennemis désigne l’adversaire ; Pourparlers tente de transformer l’affrontement en négociation ; Feu libère l’énergie ; Accident montre ce qui survient lorsque la dynamique devient incontrôlable. Mars n’est donc pas seulement « mauvais » : il est la puissance d’action dont le résultat dépend de sa maîtrise.",
    harmonieux: "Mode harmonieux : courage, franchise, initiative, capacité à défendre ses intérêts, énergie, rapidité, négociation ferme, décision et puissance de transformation. Pourparlers montre précisément que Mars maîtrisé peut devenir diplomatie active.",
    ombre: "Mode difficile : agressivité, conflit, domination, rivalité, impulsivité, brûlure, rupture, accident, comportement destructeur et escalade. Une dominante martienne exige de regarder où l’énergie peut être canalisée avant de se retourner contre la situation.",
    domaines: {
      amour: "En amour, Mars décrit davantage la dynamique du désir, du conflit et du rapport de force que le sentiment lui-même. Feu peut accentuer attraction et impulsion ; Pourparlers une discussion décisive ; Procès des disputes ; Despotisme le contrôle ; Ennemis une opposition ; Accident une rupture brusque. Avec Vénus, Mars devient particulièrement parlant pour la tension désir/conflit.",
      travail: "Professionnellement, Mars est compétition, négociation difficile, conflit hiérarchique, défense d’un projet, situation d’urgence ou environnement exigeant. Il peut être excellent pour entreprendre une action courageuse, mais mauvais pour la stabilité si plusieurs cartes martiennes s’accumulent sans contrepoids.",
      argent: "Financièrement, Mars peut signaler dépense urgente, conflit sur l’argent, contentieux, risque pris ou décision brutale. Il ne décrit pas la richesse ; il décrit l’action et la tension appliquées au matériel. Il gagne à être lu avec Mercure pour préciser les mécanismes économiques.",
      sante: "Symboliquement, Mars représente énergie, inflammation au sens métaphorique, choc, fatigue due à la suractivité et événements brusques. Accident et Feu doivent rester des avertissements symboliques, jamais des prédictions médicales ou physiques certaines.",
      psycho: "Psychologiquement, Mars est la capacité à dire non, agir, se défendre, poser des limites et transformer la colère en action utile. Son ombre est la violence, la rumination hostile, l’impulsivité ou la volonté de gagner à tout prix.",
      spiritualite: "Dans un registre initiatique, Mars est l’épreuve du feu : confrontation à la volonté, au conflit et au pouvoir. Il demande de convertir l’énergie brute en courage conscient plutôt qu’en domination.",
      droit: "Mars est une famille extrêmement juridique : Procès, Pourparlers, Despotisme et Ennemis donnent au contentieux une grammaire complète. Il décrit le conflit, la partie adverse, le rapport de force et la négociation. La carte qui l’accompagne déterminera plus sûrement l’issue."
    },
    temporalite: "Temporalité : souvent rapide, brusque ou liée à une crise qui accélère les événements. Extension astrologique prudente : mardi ; délais courts lorsqu’une action est déjà engagée. Le Belline ne permet toutefois pas d’en faire une règle automatique.",
    grammaire: "Adjectivant, Mars rend le substantif conflictuel, actif, agressif, négocié sous tension, brusque, contraignant ou énergique. Substantif, il place au centre l’hostilité, le litige, l’autorité, l’adversaire, la discussion, le feu ou l’incident.",
    motscles: ['action', 'conflit', 'courage', 'combat', 'procès', 'ennemi', 'despotisme', 'négociation', 'feu', 'accident', 'agressivité', 'énergie', 'volonté', 'compétition', 'crise', 'impulsion', 'défense', 'rapport de force'],
    questions: [
      "Où se trouve le rapport de force ?",
      "Quelle action est nécessaire, et laquelle serait seulement impulsive ?",
      "Le conflit peut-il être converti en pourparlers plutôt qu’en rupture ?"
    ]
  },

  jupiter: {
    cartes: '39 à 45', tendance: 'Très favorable',
    lead: 'Expansion sociale, soutien, légitimité, transmission, reconnaissance, opportunité et bonheur.',
    noyau: "Jupiter est la planète de l’intégration et de l’expansion sociale. Belline.fr insiste sur le rayonnement de l’individu dans la société, sur la reconnaissance et sur la manière dont l’environnement humain soutient l’épanouissement. La série est très cohérente : Appui donne le soutien ; Beauté valorise ; Héritage transmet ; Sagesse ordonne l’expérience ; Renommée rend visible ; Hasard introduit l’opportunité ; Bonheur représente l’aboutissement positif. Jupiter n’est pas seulement « chance » : il est le mécanisme par lequel une personne trouve une place, bénéficie d’un réseau, reçoit une transmission et transforme cette intégration en expansion.",
    harmonieux: "Mode harmonieux : soutien, confiance sociale, opportunité, croissance, reconnaissance, générosité, conseil, transmission, protection et capacité à profiter d’un contexte favorable.",
    ombre: "Mode excessif : excès de confiance, dépendance au statut, inflation de l’ego, conformisme social, recherche de prestige, gaspillage ou croyance que la chance remplacera l’effort. Même une planète réputée favorable peut devenir problématique par excès.",
    domaines: {
      amour: "En amour, Jupiter apporte soutien, légitimité, stabilité sociale et sentiment que la relation peut s’intégrer dans un projet de vie. Appui favorise l’entraide ; Héritage peut parler des modèles familiaux ; Renommée de l’officialisation sociale ; Bonheur d’un épanouissement. Il est moins intime que Vénus et plus social.",
      travail: "C’est une excellente famille professionnelle pour le réseau, la progression sociale, la réputation, les mentors, la reconnaissance et les opportunités. Appui peut être un supérieur ou un partenaire ; Renommée la visibilité ; Hasard une occasion ; Sagesse le conseil stratégique.",
      argent: "Jupiter est favorable à l’expansion matérielle lorsqu’une carte financière le confirme. Héritage peut avoir une dimension patrimoniale directe ; Hasard une opportunité ; Appui un financement ou soutien. Mais Argent sous Mercure reste le significateur financier le plus direct.",
      sante: "Symboliquement, Jupiter soutient l’idée de protection, de recours à un bon conseil et d’amélioration générale du cadre de vie. Sagesse peut inviter à la mesure ; Appui à chercher de l’aide. Aucune carte ne doit servir de diagnostic médical.",
      psycho: "Psychologiquement, Jupiter correspond à la confiance dans sa place au sein du monde social, au sentiment de pouvoir grandir avec les autres et à l’intégration de l’expérience. Son ombre est l’inflation, la dépendance à la reconnaissance et la difficulté à accepter les limites.",
      spiritualite: "Spirituellement, Jupiter est transmission, enseignement, sagesse et élargissement du sens. Il convient aux questions de tradition, de maître, de filiation intellectuelle ou symbolique, et à la manière dont une expérience personnelle devient connaissance transmissible.",
      droit: "Dans le domaine juridique et institutionnel, Jupiter favorise l’appui, les conseils avisés, la reconnaissance d’une position et les solutions soutenues par une institution ou un réseau. Héritage est évidemment important en matière successorale ; Renommée dans les enjeux de réputation."
    },
    temporalite: "Temporalité : expansion progressive, souvent moyenne plutôt qu’immédiate. Extension astrologique prudente : jeudi, croissance par étapes, opportunité lorsque le contexte social devient favorable.",
    grammaire: "Adjectivant, Jupiter rend le substantif soutenu, reconnu, favorisé, transmis, sage, opportun ou heureux. Substantif, il place au centre l’aide, la valeur, l’héritage, le conseil, la réputation, la chance ou l’épanouissement.",
    motscles: ['appui', 'expansion', 'chance', 'reconnaissance', 'sagesse', 'héritage', 'renommée', 'bonheur', 'opportunité', 'réseau', 'protection', 'transmission', 'statut', 'réputation', 'croissance', 'conseil', 'légitimité'],
    questions: [
      "Qui ou quoi apporte un appui réel ?",
      "Quelle place sociale, réputation ou opportunité est en jeu ?",
      "L’expansion est-elle soutenue par l’expérience et la sagesse ou seulement par l’optimisme ?"
    ]
  },

  saturne: {
    cartes: '46 à 52', tendance: 'Restrictive',
    lead: 'Restriction, temps, limite, épreuve, maturation, perte, attente, clôture et grâce après l’épreuve.',
    noyau: "Saturne clôt le septénaire et représente la limite. Belline.fr le décrit comme une énergie restrictive qui responsabilise, canalise les excès et rappelle les règles de l’environnement. Cela explique le caractère difficile de la plupart des cartes : Infortune, Stérilité, Fatalité, Ruine, Retard, Cloître. Mais Grâce appartient à la même série, ce qui interdit toute lecture simpliste de Saturne comme pur malheur. La logique profonde est celle de l’épreuve qui réduit, ralentit ou ferme afin d’obliger à reconnaître une limite, apprendre, mûrir, se dépouiller ou réorganiser la situation. Grâce montre qu’une issue, un secours ou une forme de sens peut émerger à l’intérieur même de la restriction.",
    harmonieux: "Mode harmonieux : patience, discipline, prudence, endurance, capacité à accepter une limite, maturation, profondeur, sobriété, reconstruction et sagesse acquise par l’expérience.",
    ombre: "Mode difficile : blocage, pessimisme, isolement, privation, retard, rigidité, perte, fatalisme, peur, épuisement et sentiment d’enfermement. Une dominante saturnienne indique rarement une progression fluide ; elle demande du temps, une réduction ou un travail de fond.",
    domaines: {
      amour: "En amour, Saturne peut représenter distance, solitude, blocage, relation qui n’avance pas, séparation ou poids du temps. Mais il peut aussi désigner une relation soumise à une épreuve de durée et de responsabilité. Grâce est la grande exception positive : pardon, secours, possibilité de sortir d’une période froide. Cloître peut être besoin de retrait plutôt que rupture définitive selon les adjectifs.",
      travail: "Professionnellement, Saturne correspond aux lenteurs, restructurations, difficultés, obligations, bureaucratie lourde, manque de débouchés et périodes de consolidation. Retard est très littéral ; Ruine peut indiquer un modèle qui s’effondre ; Stérilité un projet qui ne produit rien ; Grâce une aide ou une deuxième chance.",
      argent: "C’est une famille de prudence financière : perte, restriction, diminution, immobilisation et nécessité de reconstruire. Elle n’annonce pas automatiquement une catastrophe ; elle peut montrer que les ressources sont limitées ou qu’une stratégie de conservation est nécessaire.",
      sante: "Symboliquement, Saturne évoque fatigue, ralentissement, chronicité au sens symbolique, repos imposé et nécessité de respecter des limites. Ces cartes ne permettent jamais un diagnostic ni une prédiction de maladie ou de décès. Grâce peut représenter soulagement ou soutien ; Cloître, repos ou isolement.",
      psycho: "Psychologiquement, Saturne confronte aux limites réelles : deuil d’une possibilité, patience, solitude, culpabilité, responsabilité, maturation. Son enseignement est d’éviter deux extrêmes : nier les contraintes ou s’y identifier au point de sombrer dans le fatalisme.",
      spiritualite: "Spirituellement, Saturne est la grande planète de l’épreuve initiatique, du silence, du retrait et du temps long. Cloître et Grâce rendent cette dimension particulièrement explicite : retraite, dépouillement, pardon, transcendance d’une difficulté. Il ne promet pas que toute souffrance ait un sens objectif ; il fournit un langage symbolique pour travailler ce que la limite transforme.",
      droit: "Dans les affaires juridiques ou administratives, Saturne peut signaler délais, refus, procédures longues, contraintes réglementaires, enfermement institutionnel ou conséquences d’une décision passée. Grâce peut représenter indulgence, faveur, remise ou issue plus clémente ; Retard, le temps procédural."
    },
    temporalite: "Temporalité : la plus lente des sept familles. Retard en est l’expression directe. Extension astrologique prudente : samedi, temps long, vieillissement, maturation, échéances repoussées. Là encore, il s’agit d’une coloration symbolique et non d’une méthode de datation automatique.",
    grammaire: "Adjectivant, Saturne rend le substantif retardé, limité, stérile, difficile, fatal, ruiné, isolé, mûri ou parfois gracié. Substantif, il place au centre la difficulté, le blocage, la nécessité, le secours, la perte, l’attente ou le retrait.",
    motscles: ['restriction', 'temps', 'retard', 'limite', 'infortune', 'stérilité', 'fatalité', 'grâce', 'ruine', 'cloître', 'patience', 'solitude', 'épreuve', 'discipline', 'vieillissement', 'maturation', 'responsabilité', 'reconstruction'],
    questions: [
      "Quelle limite doit être acceptée plutôt que combattue ?",
      "Qu’est-ce qui demande du temps, de la discipline ou une reconstruction ?",
      "Où se trouve la possibilité de Grâce à l’intérieur de l’épreuve ?"
    ]
  }
};

/* --- Comparer les planètes entre elles --- */
BELLINE.PLANET_COMPARISONS = [
  { pair: 'Soleil / Jupiter', planets: ['soleil', 'jupiter'],
    text: "Les deux familles sont favorables mais ne parlent pas de la même réussite. Le Soleil décrit l’accomplissement intrinsèque : quelque chose naît, croît, réussit et rayonne. Jupiter décrit l’intégration sociale de cette réussite : soutien, transmission, renommée, opportunité et bonheur. En termes simples : le Soleil dit « je réussis » ; Jupiter dit « ma réussite trouve une place et des relais dans le monde »." },
  { pair: 'Lune / Vénus', planets: ['lune', 'venus'],
    text: "Toutes deux parlent du sensible, mais la Lune traite davantage de l’émotion profonde, de la fluctuation, de l’attachement et de l’inconscient ; Vénus traite de la qualité du lien, du plaisir, de l’harmonie et du désir. Une émotion lunaire peut être solitaire ou inquiète ; une dynamique vénusienne cherche plus volontiers l’autre et la relation." },
  { pair: 'Mercure / Mars', planets: ['mercure', 'mars'],
    text: "Mercure pense, calcule, écrit, négocie et fait circuler ; Mars agit, confronte et impose un mouvement. Leur association est très puissante dans les questions de contrat, de contentieux ou de stratégie : Mercure donne la méthode, Mars la force. Mal combinés, ils produisent précipitation, conflit verbal ou décision mal calculée." },
  { pair: 'Jupiter / Saturne', planets: ['jupiter', 'saturne'],
    text: "C’est le grand axe expansion–restriction du Belline. Jupiter ouvre le champ social, soutient et augmente ; Saturne impose la limite, le temps et la responsabilité. Leur dialogue est souvent plus riche qu’une opposition bien/mal : Jupiter sans Saturne peut devenir inflation ; Saturne sans Jupiter, enfermement. Ensemble, ils décrivent une croissance qui doit respecter une structure." },
  { pair: 'Soleil / Saturne', planets: ['soleil', 'saturne'],
    text: "Le Soleil veut faire apparaître et développer ; Saturne réduit, retarde ou concentre. Dans un tirage, leur rencontre peut décrire une réussite tardive, un projet qui doit mûrir, une reconnaissance après épreuve ou une ambition freinée par une contrainte réelle." },
  { pair: 'Vénus / Mars', planets: ['venus', 'mars'],
    text: "Vénus attire et relie ; Mars désire, agit et confronte. Leur combinaison est essentielle dans les lectures sentimentales : attraction et passion, mais aussi tension, jalousie, conflit ou sexualité énergique. Il faut regarder laquelle des deux familles fournit le substantif et laquelle agit comme adjectif." },
  { pair: 'Lune / Mercure', planets: ['lune', 'mercure'],
    text: "La Lune ressent avant de savoir ; Mercure analyse et verbalise. Ensemble, ils décrivent le passage de l’intuition à la compréhension, mais aussi le conflit entre anxiété et rationalité. Dans une lecture psychologique, c’est souvent l’axe le plus utile pour distinguer impression, information et interprétation." }
];

/* --- Lire les dominantes planétaires dans un tirage --- */
BELLINE.PLANET_DOMINANTES = [
  { title: 'Une seule planète très présente',
    text: "Lorsque trois cartes ou davantage appartiennent à la même famille, la planète peut être considérée comme une dominante thématique. Cela ne crée pas une règle mathématique absolue ; cela indique que plusieurs cartes racontent la situation avec le même type d’énergie. Trois cartes de Mercure peuvent signaler que la question est moins sentimentale qu’on ne le croit et qu’elle dépend en réalité d’informations, de décisions ou d’échanges. Trois cartes de Saturne peuvent montrer que le problème central est le temps et la limite, même si la question posée concernait l’amour ou le travail." },
  { title: 'Deux familles en tension',
    text: "Une répartition nette entre deux planètes permet souvent de repérer le conflit central : Vénus/Mars pour lien contre confrontation ; Jupiter/Saturne pour expansion contre limite ; Soleil/Lune pour manifestation contre intériorité ; Lune/Mercure pour ressenti contre rationalisation. Il est alors utile de lire les positions du tirage : quelle planète occupe le favorable, laquelle occupe le défavorable, et laquelle se trouve au pivot ?" },
  { title: 'Planète du substantif et planète des adjectifs',
    text: "Dans une méthode où la carte centrale est substantive et les cartes latérales adjectivantes, la famille de la carte substantive indique le registre principal de l’événement ; les familles adjectivantes expliquent comment il se produit. Un substantif vénusien entouré de Mars et Saturne ne cesse pas d’être relationnel : il devient une relation conflictuelle, limitée ou retardée. Un substantif mercurien entouré de Soleil et Jupiter reste matériel ou informationnel, mais bénéficie de réalisation, de soutien ou de reconnaissance." },
  { title: 'Planètes et polarité Oui/Non',
    text: "La planète peut être utilisée comme pondération, jamais comme verdict autonome. Soleil, Vénus et Jupiter renforcent volontiers un Oui ; Mars et Saturne renforcent un Non ou un obstacle ; Lune et Mercure demandent davantage de contexte. Mais une carte individuellement forte prime sur cette tendance : Grâce ne devient pas négative parce qu’elle est saturnienne, et Passions ne devient pas stable simplement parce qu’elle est vénusienne." },
  { title: 'Planètes et coupe',
    text: "Lorsque les deux cartes de coupe appartiennent à la même famille, elles donnent une tonalité particulièrement nette à la question avant même le tirage principal. Deux cartes mercuriennes peuvent annoncer une question de décision ou d’échange ; deux saturniennes, une situation déjà contrainte ; deux vénusiennes, une problématique de lien ; deux martiennes, un rapport de force. Deux familles différentes indiquent souvent le dialogue qui devra être résolu dans le tirage." }
];

BELLINE.ASTRO_SOURCE_NOTE = "Ce dossier est une synthèse interprétative : il croise la structure effective du Belline avec plusieurs ressources contemporaines consacrées aux séries planétaires. Les passages relatifs aux domaines modernes — droit, psychologie, entrepreneuriat, lecture substantif/adjectif — sont des extensions méthodologiques construites à partir du noyau symbolique des cartes ; elles ne sont pas présentées comme un livret historique du Mage Edmond.";
BELLINE.ASTRO_METHOD_NOTE = "Les correspondances planétaires doivent être utilisées comme une couche interprétative, non comme un système autonome. Une carte reste d’abord définie par son nom, son iconographie, sa position dans le tirage et son dialogue avec les cartes voisines. La planète fournit la famille sémantique et la dynamique générale. Pour les questions de santé, les cartes ne constituent ni un diagnostic ni une méthode de prédiction médicale ; pour les questions juridiques ou financières, elles ne remplacent pas l’analyse des faits et du droit.";

/* --- Expression de la planète, par carte (table de synthèse des 49 cartes) --- */
BELLINE.PLANET_CARD_EXPR = {
  4: "Le Soleil prend ici sa forme germinative : naissance, commencement, fécondité, apparition d’un potentiel nouveau.",
  5: "L’énergie solaire parvient à son accomplissement : succès, victoire, objectif atteint, résultat visible.",
  6: "Le rayonnement devient ascension : amélioration, progression, montée en compétence ou en statut.",
  7: "La lumière solaire devient publique : distinction, reconnaissance, prestige, mérite reconnu par autrui.",
  8: "Le Soleil réchauffe le lien humain : bienveillance, affection, loyauté, soutien moral et pensée positive.",
  9: "La force solaire retourne au vivant : vitalité, ressourcement, nature, repos réparateur et équilibre physique.",
  10: "Le rayonnement se matérialise en faveur reçue : cadeau, bénéfice, gratification, aide ou circonstance heureuse.",
  11: "La Lune montre l’ombre du lien : peur de la tromperie, secret, confiance blessée, perception de ce qui se dissimule.",
  12: "La mobilité lunaire devient éloignement, changement de lieu, séparation, déplacement ou retrait.",
  13: "Le cycle lunaire devient variation : humeur, instabilité, retournement, imprévisibilité, mouvement sans fixation.",
  14: "L’inconnu lunaire est exploré : révélation, enquête, curiosité, exploration du caché ou d’un territoire nouveau.",
  15: "La substance lunaire par excellence : émotions, fluidité, voyage, profondeur, intuition, milieu aquatique.",
  16: "Le besoin lunaire de sécurité se concentre sur le foyer, l’intimité, la maison et le refuge.",
  17: "La vulnérabilité lunaire se manifeste par fatigue, malaise, baisse d’énergie ou inquiétude concernant le corps.",
  18: "Mercure met l’intelligence en mouvement : adaptation, virage, modification, choix d’une autre méthode.",
  19: "La circulation devient matérielle : ressources, finances, valeur, moyens, trésorerie et échanges monétaires.",
  20: "Mercure apparaît dans sa fonction la plus pure : raison, analyse, stratégie, compréhension et facultés mentales.",
  21: "La circulation se dérègle : disparition, perte d’acquis, fuite de valeur, soustraction, érosion ou risque matériel.",
  22: "L’idée devient organisation : projet, initiative professionnelle, construction, activité et mise en œuvre.",
  23: "Le mouvement devient échange : commerce, négociation, affaires, transactions, réseau, circulation de biens ou de services.",
  24: "La circulation devient information : message, courrier, annonce, réponse, nouvelle reçue ou transmise.",
  25: "Vénus sous sa forme sensible : plaisir, détente, sensualité, loisirs, satisfaction et goût de la vie.",
  26: "Le lien vénusien atteint l’équilibre : réconciliation, harmonie, cessation du conflit, sérénité.",
  27: "Vénus crée un lien : couple, association, partenariat, alliance, rapprochement et mise en commun.",
  28: "Le lien s’élargit au groupe proche : clan, parenté, foyer relationnel, solidarité et appartenance.",
  29: "Le cœur de la série : sentiment, attachement affectif, tendresse, affection profonde et relation amoureuse.",
  30: "La relation devient sociabilité : repas, invitation, partage, réception, convivialité, cercle social.",
  31: "Vénus poussée à l’intensité : désir, ferveur, attraction, obsession, emballement, création ou emportement affectif.",
  32: "L’énergie martienne devient intention hostile, agressivité, nuisance, dureté, volonté de blesser ou comportement toxique.",
  33: "Le conflit se formalise : litige, dispute, contradiction, contentieux, opposition et débat de positions.",
  34: "La force devient domination : autorité abusive, contrainte, contrôle, rigidité et rapport hiérarchique oppressant.",
  35: "Mars identifie l’adversité humaine : concurrence, rivalité, opposition, hostilité ou personne qui agit contre le consultant.",
  36: "La force est canalisée dans le langage : négociation, discussion, diplomatie, tractation, confrontation verbale.",
  37: "L’énergie pure : impulsion, chaleur, désir d’agir, accélération, passion combative, danger ou transformation rapide.",
  38: "L’action échappe au contrôle : choc, incident, imprévu brutal, rupture de continuité ou événement soudain.",
  39: "Jupiter se manifeste par le soutien du groupe, d’un allié, d’une institution ou d’une personne influente.",
  40: "L’expansion devient qualité, harmonie et valorisation : ce qui plaît, attire, s’améliore ou paraît prometteur.",
  41: "La société transmet : patrimoine, expérience, acquis, tradition, legs matériel ou symbolique.",
  42: "Jupiter devient jugement mûri : conseil, prudence, compréhension sociale, juste mesure et expérience.",
  43: "L’individu est reconnu par le groupe : réputation, visibilité sociale, notoriété et validation publique.",
  44: "L’expansion rencontre l’occasion : concours de circonstances, opportunité, chance, imprévu favorable ou aléatoire.",
  45: "L’intégration réussie donne satisfaction, épanouissement, réussite sociale et joie durable.",
  46: "Saturne confronte à la difficulté, au manque, à la solitude, à la peine ou à une période lourde.",
  47: "La limite devient absence de production : blocage, effort sans résultat, terrain improductif, répétition ou vide.",
  48: "La contrainte atteint son maximum : événement difficilement évitable, nécessité, force des circonstances, poids du destin.",
  49: "Au cœur même de Saturne apparaît l’ouverture : pardon, secours, protection, soulagement, faveur ou possibilité de traverser l’épreuve.",
  50: "La structure se défait : perte, dégradation, effondrement matériel ou symbolique, nécessité de reconstruire.",
  51: "Saturne devient temps : délai, attente, maturation, report, lenteur, échéance différée.",
  52: "La restriction devient espace fermé : isolement, retraite, institution, confinement, intériorisation ou séparation du monde."
};
