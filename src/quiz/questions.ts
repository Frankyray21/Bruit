/**
 * Banque de questions du quiz.
 *
 * Au moins une question par module, et chaque réponse est traçable à une diapo
 * de la formation ou à un calcul du domaine.
 */

export interface Question {
  readonly module: string;
  readonly enonce: string;
  readonly options: readonly string[];
  readonly bonne: number;
  readonly explication: string;
}

export const QUESTIONS: readonly Question[] = [
  {
    module: 'pourquoi',
    enonce: 'Selon la formation, les réclamations pour surdité professionnelle viennent de travailleurs…',
    options: ['de plus en plus âgés', 'de plus en plus jeunes', 'du même âge qu’avant'],
    bonne: 1,
    explication:
      'Diapo 3. C’est le constat le plus solide de la section : la surdité professionnelle ne touche plus seulement les fins de carrière.',
  },
  {
    module: 'decibel',
    enonce: 'Deux machines de 95 dBA fonctionnant côte à côte donnent quel niveau ?',
    options: ['98 dBA', '190 dBA', '95 dBA', '100 dBA'],
    bonne: 0,
    explication:
      'Le bruit ne s’additionne pas arithmétiquement. Doubler l’énergie sonore ajoute exactement 3 dBA — c’est la règle de la diapo 4.',
  },
  {
    module: 'decibel',
    enonce: 'De combien la durée permise change-t-elle quand le niveau monte de 3 dBA ?',
    options: ['Elle ne change pas', 'Elle diminue de 3 heures', 'Elle est divisée par deux'],
    bonne: 2,
    explication:
      'Diapo 6 : 85 dBA → 8 h, 88 dBA → 4 h, 91 dBA → 2 h, 94 dBA → 1 h.',
  },
  {
    module: 'decibel',
    enonce: 'Quelle est la limite d’exposition au Québec pour un quart de 8 heures ?',
    options: ['80 dBA', '85 dBA', '90 dBA', '94 dBA'],
    bonne: 1,
    explication: 'Diapo 5, article 137 du RSST.',
  },
  {
    module: 'exposition',
    enonce: 'Combien de temps un mineur au jackleg (114,9 dBA) peut-il travailler sans protection ?',
    options: ['29 secondes', '29 minutes', '1 heure', '4 heures'],
    bonne: 0,
    explication:
      'La table réglementaire s’arrête à 94 dBA. Extrapolée, la règle des 3 dBA donne 29 secondes.',
  },
  {
    module: 'exposition',
    enonce: 'Deux heures de pause à 66 dBA « remboursent » quelle part de la dose du quart ?',
    options: ['La moitié', 'Un quart', 'Rien du tout — elles ajoutent 0,3 %'],
    bonne: 2,
    explication:
      'Le silence ne rembourse pas le bruit. La dose ne fait que s’accumuler ; une période calme ajoute simplement très peu.',
  },
  {
    module: 'dommages',
    enonce: 'Quel type de surdité est le plus fréquent chez les foreurs ?',
    options: ['La surdité brutale', 'La surdité progressive', 'L’hyperacousie'],
    bonne: 1,
    explication:
      'Diapo 12. Elle résulte d’une exposition continue et détruit les cellules ciliées de façon irréversible.',
  },
  {
    module: 'dommages',
    enonce: 'Les cellules ciliées détruites par le bruit…',
    options: [
      'repoussent en quelques mois',
      'repoussent si l’exposition cesse',
      'ne repoussent jamais',
    ],
    bonne: 2,
    explication: 'Diapo 12 : la perte auditive qui en résulte est irréversible.',
  },
  {
    module: 'choisir',
    enonce: 'Des bouchons NRR 32 combinés à des coquilles NRR 25 donnent quelle réduction ?',
    options: ['57 dB', 'Environ 24 dB', '32 dB', '28,5 dB'],
    bonne: 1,
    explication:
      'Diapo 14 : les atténuations ne s’additionnent pas. On part du meilleur NRR dératé et on ajoute environ 5 dB.',
  },
  {
    module: 'choisir',
    enonce: 'Au-delà de quel niveau la double protection est-elle recommandée ?',
    options: ['85 dBA', '94 dBA', '105 dBA', '115 dBA'],
    bonne: 2,
    explication: 'Diapo 14, sources ODYO et CCHST.',
  },
  {
    module: 'porter',
    enonce: 'Un bouchon correctement posé…',
    options: [
      'dépasse légèrement pour pouvoir le retirer',
      'ne doit pas être visible de face',
      'doit être visible pour prouver qu’on le porte',
    ],
    bonne: 1,
    explication:
      'Diapo 15. C’est le seul critère de vérification objectif de toute la formation.',
  },
  {
    module: 'porter',
    enonce: 'Une protection de 30 dB retirée seulement 10 minutes sur un quart de 8 h protège encore…',
    options: ['29 dB', '25 dB', '17 dB', '30 dB'],
    bonne: 2,
    explication:
      'Diapo 16. Deux pour cent du quart sans protection font perdre près de la moitié de la protection de la journée.',
  },
  {
    module: 'porter',
    enonce: 'À 50 % de temps de port, quelle atténuation reste-t-il, quel que soit le protecteur ?',
    options: ['15 dB', '10 dB', '3 dB', 'La moitié du NRR'],
    bonne: 2,
    explication:
      'Diapo 16. Passé un certain retrait, le choix du protecteur ne compte plus du tout.',
  },
  {
    module: 'porter',
    enonce: 'Entre un NRR 33 retiré 48 minutes et un NRR 20 gardé tout le quart, lequel protège le mieux ?',
    options: ['Le NRR 33', 'Le NRR 20', 'Les deux pareil'],
    bonne: 1,
    explication:
      'La discipline de port compte plus que le choix du protecteur. Le point de bascule se situe vers 25 minutes de retrait.',
  },
];
