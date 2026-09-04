# -*- coding: utf-8 -*-
import re, json, os

BASE = r"C:\Users\CaMiL\Desktop\PROGRAMMES APPLICATIONS CLAUDE\CARTOMANCIE\js\data"
txt = open('dossier.txt', encoding='utf-8').read()
lines = txt.split('\n')

RUBRICS = [
 ('noyau', '1. Noyau sémantique'),
 ('motscles', '2. Mots-clés'),
 ('ombre', '3. Ombre, difficultés et sens renversé'),
 ('amour', '4. Amour, couple, célibat et réconciliation'),
 ('sexualite', '5. Sexualité et intimité'),
 ('travail', '6. Travail, carrière, entreprise et vocation'),
 ('etudes', '7. Études, concours, formation et recherche'),
 ('argent', '8. Argent, finances et patrimoine'),
 ('sante', '9. Santé et bien-être — lecture symbolique'),
 ('famille', '10. Famille, foyer et immobilier'),
 ('psycho', '11. Psychologie et dynamique intérieure'),
 ('spiritualite', '12. Spiritualité, ésotérisme et cheminement'),
 ('droit', '13. Droit, administration, conflits et contrats'),
 ('personnes', '14. Personnes, rôles et lieux possibles'),
 ('temporalite', '15. Temporalité'),
 ('ouinon', '16. Oui / Non'),
 ('grammaire', '17. Fonction grammaticale : substantif et adjectif'),
 ('lecture', '18. Lecture par position dans un tirage de verdict'),
 ('associations', '19. Associations structurantes'),
 ('synthese', '20. Formule de synthèse pour une base de données'),
]
HEADS = {h: key for key, h in RUBRICS}

blocks = {}
cur = None
buf = []

def flush():
    global cur, buf
    if cur is not None:
        blocks[cur] = buf
    buf = []

for ln in lines:
    m = re.match(r'^Carte n° (\d+) — (.+)$', ln)
    if m:
        flush(); cur = int(m.group(1)); buf = [ln]; continue
    if ln.strip() == 'Carte Bleue — hors numérotation — Carte Bleue':
        flush(); cur = 53; buf = [ln]; continue
    if cur is not None:
        buf.append(ln)
flush()

BOILER = [
 " Dans les méthodes utilisant les cartes renversées, cette rubrique fournit la base la plus prudente du sens inversé.",
 " En pratique, il faut distinguer le sentiment, le statut du lien et le comportement: Amor renseigne davantage le sentiment, Union l'engagement, Passions l'intensité, Pensée-Amitié l'affection ou l'amitié, et les cartes martiennes/saturniennes les obstacles.",
 " Pour une question de carrière, Entreprises, Réussite, Honneurs, Renommée, Appui, Argent et Nouvelle permettent de préciser respectivement l'action, l'aboutissement, le statut, la visibilité, le soutien, la rémunération et l'information.",
 " La carte Argent indique la matérialité du flux; Héritage la transmission; Présents la réception; Vol-Perte et Ruine les risques; Retard la temporalité.",
 " Toute décision de santé doit reposer sur des informations médicales réelles; le tirage ne remplace ni consultation, ni examen, ni diagnostic.",
 " Les cartes Famille et Pénates donnent davantage de poids à cette lecture.",
 " Cette rubrique décrit le langage symbolique utilisé en cartomancie; elle ne constitue pas une démonstration de l'existence d'une entité, d'un karma ou d'un destin métaphysique.",
 " Dans une question juridique réelle, la carte peut structurer la lecture symbolique mais ne permet pas de prévoir avec certitude la décision d'une juridiction ou d'une administration.",
 " Les unités chiffrées attribuées arbitrairement aux numéros des cartes ne sont pas retenues ici comme règle universelle.",
 " L'ordre et la position doivent rester prioritaires sur une simple addition de mots-clés.",
 "Symboliquement: ",
 "Symboliquement : ",
]
BOILER_RE = [
 r" Elle ne signifie pas nécessairement sexualité;[^.]*\.",
 r" Elle ne crée pas à elle seule[^.]*\.",
 r" Passions, Plaisirs,?[^.]*précisent[^.]*\.",
 r" Passions, Plaisirs,?[^.]*confirmer ce registre\.",
 r"^Dans la sphère familiale, elle qualifie le climat du foyer par son sens central ?: ",
 r" Le lieu n'est pas un sens primaire;[^.]*\.",
 r" Les lieux possibles sont surtout contextuels ?:.*",
 r"^Elle ne désigne pas nécessairement une personne\. Lorsqu'une position impose une personnification, elle peut qualifier quelqu'un qui incarne [^.]*\.\s*",
 r"^Elle ne désigne pas nécessairement une personne\.\s*",
]


def clean(s):
    s = s.strip()
    for b in BOILER:
        s = s.replace(b, "")
    for rx in BOILER_RE:
        s = re.sub(rx, "", s, flags=re.S).strip()
    s = re.sub(r'\s+', ' ', s).strip().strip(' ;')
    if s and s[0].islower():
        s = s[0].upper() + s[1:]
    return s


def parse_card(num, blk):
    head = blk[0]
    name = re.sub(r'^Carte n° \d+ — ', '', head).strip()
    if num == 53:
        name = "La Carte Bleue"
    icono = polarite = ''
    for ln in blk[1:9]:
        if ln.startswith('Iconographie / symbole |'):
            icono = ln.split('|', 1)[1].strip()
        elif ln.startswith('Polarité de travail |'):
            polarite = ln.split('|', 1)[1].strip()
    bodies = {}
    curkey = None
    acc = []
    for ln in blk:
        if ln.strip() in HEADS:
            if curkey:
                bodies[curkey] = '\n'.join(acc).strip()
            curkey = HEADS[ln.strip()]; acc = []
        elif curkey is not None:
            acc.append(ln)
    if curkey:
        bodies[curkey] = '\n'.join(acc).strip()

    d = {'name': name, 'icono': icono, 'polarite': polarite}
    noyau = re.split(r'Lecture par famille', bodies.get('noyau', ''))[0].strip()
    d['noyau'] = clean(noyau)
    mc = bodies.get('motscles', '')
    d['motscles'] = [k.strip() for k in re.split(r'[;\n]', mc) if k.strip()]
    for key in ['ombre', 'amour', 'sexualite', 'travail', 'etudes', 'argent', 'sante',
                'famille', 'psycho', 'spiritualite', 'droit', 'personnes', 'temporalite',
                'ouinon', 'grammaire', 'synthese']:
        d[key] = clean(bodies.get(key, ''))
    lec = {}
    lbody = bodies.get('lecture', '')
    for sub in ['Favorable', 'Défavorable', 'Pivot', 'Verdict', 'Explication']:
        m = re.search(re.escape(sub) + r'\s*:\s*(.+?)(?:\n(?:Favorable|Défavorable|Pivot|Verdict|Explication)\s*:|\Z)', lbody, re.S)
        if m:
            lec[sub.lower()] = clean(m.group(1))
    d['lecture'] = lec
    assoc_raw = bodies.get('associations', '')
    mconf = re.search(r'À ne pas confondre\s*:\s*(.+?)(?:\.\s*Ces cartes|\.\s*$|$)', assoc_raw, re.S)
    d['confusion'] = mconf.group(1).strip().rstrip('.') if mconf else ''
    combos = []
    for ln in assoc_raw.split('\n'):
        ln = ln.strip()
        if ' + ' in ln and ' : ' in ln and not ln.startswith('À ne pas'):
            left, right = ln.split(' : ', 1)
            combos.append({'a': left.strip(), 'note': clean(right)})
    d['combos'] = combos
    return d


cards = {num: parse_card(num, blocks[num]) for num in sorted(blocks)}


def jv(x):
    return json.dumps(x, ensure_ascii=False)


out = [
 "/* Genere depuis Oracle_de_Belline_53_cartes_dossier_exhaustif.docx - ne pas editer a la main. */",
 "window.BELLINE = window.BELLINE || {};",
 "window.BELLINE.CARD_DOSSIER = {",
]
for num in sorted(cards):
    out.append("  " + str(num) + ": " + jv(cards[num]) + ",")
out.append("};")
open(os.path.join(BASE, 'card-dossier.js'), 'w', encoding='utf-8').write('\n'.join(out))

ref = [
 "/* Reperes de lecture -- extraits du Dossier encyclopedique des 53 cartes.",
 "   Pre-remplissent les champs du Grimoire ; ta version enregistree les remplace. */",
 "window.BELLINE = window.BELLINE || {};",
 "window.BELLINE.CARD_REFERENCE = {",
]
def kw_from_noyau(noyau):
    parts = re.split(r'[;,]', re.split(r'\.', noyau)[0])
    kws = []
    for p in parts:
        p = p.strip().strip('.').strip()
        p = re.sub(r"^(et |l'|la |le |les |une |un |d'|des )", '', p, flags=re.I)
        if p and len(p.split()) <= 4 and len(p) > 2:
            kws.append(p[0].lower() + p[1:] if p[:2].isupper() is False else p)
    # keep casing of first word natural
    out = []
    for i, k in enumerate(kws[:6]):
        out.append(k if i == 0 else k[0].lower() + k[1:])
    return out


for num in sorted(cards):
    d = cards[num]
    trav = d['travail']
    if d['argent'] and d['argent'][:20] not in trav:
        trav = (trav + " — Argent : " + d['argent']).strip(" —")
    evol = ' '.join(x for x in [d['psycho'], d['spiritualite']] if x).strip()
    kws = kw_from_noyau(d['noyau']) or d['motscles'][:6]
    obj = {
        'keywords': kws,
        'sens': {'general': d['noyau'], 'amour': d['amour'], 'travail': trav,
                 'sante': d['sante'], 'evolution': evol},
        'sources': ['dossier encyclopédique des 53 cartes'],
    }
    ref.append("  " + str(num) + ": " + jv(obj) + ",")
ref.append("};")
open(os.path.join(BASE, 'card-reference.js'), 'w', encoding='utf-8').write('\n'.join(ref))

print("cards:", len(cards))
print(json.dumps(cards[5], ensure_ascii=False, indent=1)[:1400])
