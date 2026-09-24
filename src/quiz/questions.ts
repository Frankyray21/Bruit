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
      'C’est le constat le plus solide de la formation : la surdité professionnelle ne touche plus seulement les fins de carrière (diapo 3).',
  },
  {
    module: 'decibel',
    enonce: 'Deux machines de 95 dBA fonctionnant côte à côte donnent quel niveau ?',
    options: ['98 dBA', '190 dBA', '95 dBA', '100 dBA'],
    bonne: 0,
    explication:
      'Le bruit ne s’additionne pas comme des dollars : doubler l’énergie sonore ajoute exactement 3 dBA. C’est la règle des 3 dBA (diapo 4).',
  },
  {
    module: 'decibel',
    enonce: 'De combien la durée permise change-t-elle quand le niveau monte de 3 dBA ?',
    options: ['Elle ne change pas', 'Elle diminue de 3 heures', 'Elle est divisée par deux'],
    bonne: 2,
    explication:
      'Chaque tranche de 3 dBA divise le temps permis par deux : 85 dBA → 8 h, 88 → 4 h, 91 → 2 h, 94 → 1 h (table du RSST, diapo 6).',
  },
  {
    module: 'decibel',
    enonce: 'Quelle est la limite d’exposition au Québec pour un quart de 8 heures ?',
    options: ['80 dBA', '85 dBA', '90 dBA', '94 dBA'],
    bonne: 1,
    explication:
      'C’est la limite du Règlement sur la santé et la sécurité du travail (article 137) : 85 dBA pour 8 heures, et moins de temps dès que le niveau monte (diapo 5).',
  },
  {
    module: 'exposition',
    enonce: 'Combien de temps un mineur au jackleg (114,9 dBA) peut-il travailler sans protection ?',
    options: ['29 secondes', '29 minutes', '1 heure', '4 heures'],
    bonne: 0,
    explication:
      'La table du règlement s’arrête à 94 dBA. En continuant la règle des 3 dBA jusqu’à 114,9 dBA, il reste 29 secondes — le jackleg consomme la dose du quart avant même d’avoir commencé.',
  },
  {
    module: 'exposition',
    enonce: 'Deux heures de pause à 66 dBA « remboursent » quelle part de la dose du quart ?',
    options: ['La moitié', 'Un quart', 'Rien du tout — elles ajoutent 0,3 %'],
    bonne: 2,
    explication:
      'Le silence ne rembourse pas le bruit. La dose ne fait que monter ; une période calme ajoute simplement très peu (0,3 % pour deux heures à 66 dBA).',
  },
  {
    module: 'dommages',
    enonce: 'Quel type de surdité est le plus fréquent chez les foreurs ?',
    options: ['La surdité brutale', 'La surdité progressive', 'L’hyperacousie'],
    bonne: 1,
    explication:
      'La surdité progressive vient d’une exposition continue : elle détruit les cellules ciliées, et cette perte est irréversible (diapo 12).',
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
    explication:
      'Une cellule ciliée détruite ne repousse jamais — contrairement à une coupure ou à une fracture. La perte auditive est définitive (diapo 12).',
  },
  {
    module: 'choisir',
    enonce: 'Des bouchons NRR 32 combinés à des coquilles NRR 25 donnent quelle réduction ?',
    options: ['57 dB', 'Environ 24 dB', '32 dB', '28,5 dB'],
    bonne: 1,
    explication:
      'Les atténuations ne s’additionnent pas. On part du meilleur des deux NRR, on applique l’efficacité réelle sur le terrain, et on ajoute environ 5 dB pour le second protecteur (diapo 14).',
  },
  {
    module: 'choisir',
    enonce: 'Au-delà de quel niveau la double protection est-elle recommandée ?',
    options: ['85 dBA', '94 dBA', '105 dBA', '115 dBA'],
    bonne: 2,
    explication:
      'Au-delà de 105 dBA, un seul protecteur ne suffit plus : bouchons et coquilles ensemble (diapo 14, d’après ODYO et le CCHST).',
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
      'Un bouchon bien enfoncé ne se voit pas de face. C’est le seul critère de vérification objectif de toute la formation — regarde-toi dans un miroir (diapo 15).',
  },
  {
    module: 'porter',
    enonce: 'Une protection de 30 dB retirée seulement 10 minutes sur un quart de 8 h protège encore…',
    options: ['29 dB', '25 dB', '17 dB', '30 dB'],
    bonne: 2,
    explication:
      'Dix minutes, c’est 2 % du quart — et près de la moitié de la protection de la journée envolée. L’énergie reçue pendant le retrait écrase tout le reste (diapo 16).',
  },
  {
    module: 'porter',
    enonce: 'À 50 % de temps de port, quelle atténuation reste-t-il, quel que soit le protecteur ?',
    options: ['15 dB', '10 dB', '3 dB', 'La moitié du NRR'],
    bonne: 2,
    explication:
      'À 50 % de port, il ne reste que 3 dB, quel que soit le protecteur. Passé un certain retrait, le choix du modèle ne compte plus du tout (diapo 16).',
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
