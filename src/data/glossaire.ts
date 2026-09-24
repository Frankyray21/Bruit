/**
 * Glossaire : les termes cliquables du parcours et leur fiche détaillée.
 *
 * Chaque fiche part du texte des diapos (`docs/formation-source.md`, la
 * `source`) et ajoute, à part et nommé comme tel, un « complément » qui
 * précise le mécanisme ou donne un ordre de grandeur reconnu. Tutoiement,
 * phrases courtes : ça se lit sur un téléphone, dans une salle de formation.
 */

export interface FicheGlossaire {
  readonly id: string;
  /** Le mot tel qu'on l'affiche en titre. */
  readonly terme: string;
  /** Une phrase, la définition qui tient sur une ligne. */
  readonly court: string;
  /** Paragraphes de détail, dans l'ordre. */
  readonly details: readonly string[];
  /** Ce que le travailleur doit retenir, en une phrase. */
  readonly aRetenir: string;
  /** Diapo(s) de la formation d'où vient la fiche. */
  readonly source: string;
}

export const GLOSSAIRE: readonly FicheGlossaire[] = [
  {
    id: 'surdite-brutale',
    terme: 'Surdité brutale',
    court: 'Une perte d’audition immédiate, causée par un seul bruit très intense.',
    details: [
      'Une déflagration, un coup de feu, un tir de mine trop près : un son si fort qu’il blesse l’oreille d’un coup. Les lésions de l’oreille interne sont immédiates et définitives. Le tympan peut aussi se déchirer.',
      'Complément — on parle de traumatisme sonore aigu. Le tympan déchiré cicatrise souvent en quelques semaines ; les cellules ciliées détruites, elles, ne reviennent jamais. Une oreille qui bourdonne ou qui se sent bouchée après une détonation doit être vue rapidement.',
    ],
    aRetenir: 'Un seul bruit extrême suffit. Après une détonation, fais vérifier ton audition sans attendre.',
    source: 'diapo 12',
  },
  {
    id: 'surdite-progressive',
    terme: 'Surdité progressive',
    court: 'La perte d’audition lente, jour après jour, de celui qui travaille dans le bruit.',
    details: [
      'C’est la forme la plus fréquente chez les foreurs. L’exposition continue à des niveaux élevés détruit peu à peu les cellules ciliées de l’oreille interne. La perte est irréversible.',
      'Elle avance sans douleur et sans qu’on s’en aperçoive : on entend encore, mais moins bien les sons aigus, puis les conversations dans le bruit. Quand on le remarque, une bonne partie est déjà perdue.',
      'Complément — la perte commence autour de 4 000 Hz, la zone des aigus proche de la base de la cochlée, puis s’étend aux fréquences voisines avec les années. C’est l’« encoche » que le médecin voit sur l’audiogramme.',
    ],
    aRetenir: 'Ça ne fait pas mal, ça ne se voit pas, et ça ne revient pas. La seule défense, c’est la protection portée tout le quart.',
    source: 'diapo 12',
  },
  {
    id: 'acouphenes',
    terme: 'Acouphènes',
    court: 'Des bourdonnements ou des sifflements entendus sans aucune source sonore.',
    details: [
      'Sensation de bourdonnement, de sifflement ou d’autres bruits dans les oreilles, même dans le silence. Après un quart bruyant, ils peuvent durer quelques heures ; avec les années, ils peuvent devenir permanents.',
      'Complément — c’est souvent le premier signal d’une oreille qui souffre : les cellules ciliées abîmées envoient au cerveau un signal qui n’existe pas. Un acouphène qui persiste après le repos est un avertissement à prendre au sérieux.',
    ],
    aRetenir: 'Un sifflement après le travail, c’est l’oreille qui te dit qu’elle a trop reçu.',
    source: 'diapo 12',
  },
  {
    id: 'hyperacousie',
    terme: 'Hyperacousie',
    court: 'Une hypersensibilité anormale aux sons du quotidien.',
    details: [
      'Des sons ordinaires — vaisselle, voix, circulation — deviennent pénibles, parfois douloureux. Ce n’est pas une meilleure audition : c’est une oreille et un cerveau qui n’arrivent plus à doser.',
      'Complément — l’hyperacousie accompagne souvent les acouphènes et la surdité due au bruit. Elle fatigue, isole et rend le bruit du travail encore plus dur à supporter.',
    ],
    aRetenir: 'Quand les bruits normaux font mal, l’oreille a déjà été abîmée.',
    source: 'diapo 12',
  },
  {
    id: 'cellules-ciliees',
    terme: 'Cellules ciliées',
    court: 'Les capteurs de l’oreille interne, ceux que le bruit détruit sans retour.',
    details: [
      'Rangées le long de la cochlée, elles portent de minuscules cils qui bougent avec le son et le transforment en signal nerveux. Saines, les rangées sont droites ; abîmées par le bruit, les cils se couchent, fusionnent, puis la cellule meurt.',
      'Complément — chaque oreille en compte environ 15 000 : une rangée de cellules internes, qui envoient le message au nerf, et trois rangées de cellules externes, qui amplifient les sons faibles. Les externes sont atteintes en premier. Chez l’humain, aucune ne repousse.',
    ],
    aRetenir: 'Tu nais avec ton stock de cellules ciliées. Chaque exposition sans protection en brûle une partie, pour toujours.',
    source: 'diapos 11 et 12',
  },
  {
    id: 'cochlee',
    terme: 'Cochlée',
    court: 'L’escargot de l’oreille interne, où le son devient signal nerveux.',
    details: [
      'Un tube enroulé sur deux tours et demi, rempli de liquide, logé dans l’os. Les vibrations arrivent par l’étrier, font onduler la membrane qui porte les cellules ciliées, et le nerf auditif emporte le message vers le cerveau.',
      'Complément — la cochlée est une carte des fréquences : les aigus sont codés à la base, près de l’entrée, les graves à la pointe. C’est pourquoi le bruit, qui frappe d’abord la base, commence par voler les aigus.',
    ],
    aRetenir: 'La base de l’escargot entend les aigus. C’est là que le bruit frappe d’abord.',
    source: 'diapo 11',
  },
  {
    id: 'tympan',
    terme: 'Tympan',
    court: 'La fine membrane au fond du conduit, qui vibre avec le son.',
    details: [
      'Elle sépare l’oreille externe de l’oreille moyenne et transmet les vibrations aux trois osselets, jusqu’à la cochlée. Une déflagration peut la déchirer.',
      'Complément — un tympan perforé cicatrise le plus souvent de lui-même et l’audition revient en partie. Le vrai dégât d’une détonation est plus loin : dans la cochlée, où rien ne cicatrise.',
    ],
    aRetenir: 'Le tympan peut guérir. L’oreille interne, non.',
    source: 'diapos 11 et 12',
  },
  {
    id: 'dba',
    terme: 'Décibel corrigé (dBA)',
    court: 'Le décibel pondéré comme l’oreille entend : l’unité de toutes les limites.',
    details: [
      'Le « A » est une pondération en fréquence : elle atténue les graves, que l’oreille perçoit moins, pour que le chiffre corresponde à ce que l’oreille encaisse vraiment. Les mesures de la mine, les limites du règlement et les valeurs des protecteurs sont toutes en dBA.',
      'L’échelle est logarithmique : à chaque 3 dBA, l’énergie reçue par l’oreille double. 88 dBA, c’est deux fois 85 ; 91 dBA, c’est quatre fois.',
    ],
    aRetenir: '3 dBA de plus, c’est deux fois plus d’énergie dans l’oreille. Une petite différence de chiffre est une grosse différence de risque.',
    source: 'diapo 4',
  },
  {
    id: 'sonometre',
    terme: 'Sonomètre',
    court: 'L’appareil qui lit le niveau de bruit à l’instant même.',
    details: [
      'Il donne le niveau à un endroit, à un moment : utile pour comparer des postes ou vérifier une machine. Il ne dit pas ce qu’une personne a reçu sur tout son quart.',
    ],
    aRetenir: 'Le sonomètre photographie ; le dosimètre filme.',
    source: 'diapo 4',
  },
  {
    id: 'dosimetre',
    terme: 'Dosimètre',
    court: 'L’appareil porté sur l’épaule qui cumule le bruit reçu pendant tout le quart.',
    details: [
      'Il suit le travailleur et additionne tout ce que son oreille encaisse, en dBA, sur la période. C’est avec lui que la mine mesure l’exposition réelle des postes.',
      'Complément — le résultat s’exprime en dose : 100 % correspond à la limite de 85 dBA sur 8 heures. La boîte à outils calcule cette dose pour ton quart.',
    ],
    aRetenir: 'Ce qui compte, c’est le cumul du quart, pas le pic d’un instant.',
    source: 'diapo 4',
  },
  {
    id: 'nrr',
    terme: 'NRR',
    court: 'Le chiffre d’atténuation d’un protecteur, mesuré en laboratoire.',
    details: [
      '« Noise Reduction Rating » : la réduction de bruit, en décibels, obtenue dans des conditions idéales. Bouchons en mousse : 32 à 33. Bouchons sur arceau : 17 à 20. Coquilles sur casque : 25.',
      'Sur le terrain, on n’en retire qu’une partie : ajustement imparfait, port intermittent. La formation retient 60 % du NRR pour les bouchons — 32 × 0,60 = 19 dBA. Et deux protecteurs ne s’additionnent pas : la double protection ajoute environ 5 dBA au meilleur des deux.',
    ],
    aRetenir: 'Le chiffre sur la boîte est un maximum de laboratoire. Bien mis, un bouchon donne à peu près 60 % de ce chiffre.',
    source: 'diapos 13 et 14',
  },
  {
    id: 'double-protection',
    terme: 'Double protection',
    court: 'Bouchons et coquilles portés en même temps, recommandés au-delà de 105 dBA.',
    details: [
      'Au-delà de 105 dBA, un seul protecteur ne suffit plus. Porter les deux ensemble donne une meilleure réduction que le meilleur des deux seul — mais leurs valeurs ne s’additionnent pas : en moyenne, la double protection ajoute 5 dBA au NRR retenu des bouchons.',
      'Exemple de la formation : bouchons à 60 % de 32 NRR = 19 dBA, plus 5 dBA pour les coquilles = 24 dBA de réduction.',
    ],
    aRetenir: 'Au jackleg ou au marteau, c’est bouchons ET coquilles, tout le temps.',
    source: 'diapo 13',
  },
  {
    id: 'reverberation',
    terme: 'Réverbération',
    court: 'Le son qui rebondit sur les parois au lieu de s’éteindre.',
    details: [
      'Dans une galerie en tôle ou en roc nu, le son est renvoyé de toutes parts : le niveau reste presque le même où que tu sois. Un matériau absorbant poreux, lui, l’avale.',
      'Complément — c’est pour ça que reculer de quelques mètres ne protège presque pas sous terre, alors que ça marche à l’extérieur.',
    ],
    aRetenir: 'Sous terre, s’éloigner un peu ne baisse presque rien. Seule la protection compte.',
    source: 'diapo 10',
  },
  {
    id: 'solidienne',
    terme: 'Transmission solidienne',
    court: 'Le son qui voyage dans les structures solides, pas seulement dans l’air.',
    details: [
      'Une machine vibre, et la vibration se transmet au plancher, aux murs, au plafond, qui rayonnent le son à leur tour. On peut ainsi entendre fort une source qu’on ne voit pas.',
    ],
    aRetenir: 'Le bruit arrive aussi par les structures : une cloison ne suffit pas toujours.',
    source: 'diapo 10',
  },
];

const PAR_ID = new Map(GLOSSAIRE.map((f) => [f.id, f]));

export function ficheGlossaire(id: string): FicheGlossaire | undefined {
  return PAR_ID.get(id);
}
