# Modèle de calcul

Toutes les tables de la formation se reconstituent **exactement** par formule.
C'est ce qui permet de bâtir un calculateur interactif (curseurs continus) plutôt
que d'afficher des tableaux figés à 5 lignes.

Chaque formule ci-dessous est accompagnée de sa validation contre la diapo
correspondante. Ces validations doivent devenir des **tests unitaires** en Phase 1.

---

## 1. Durée maximale permise (RSST art. 137)

Le Québec utilise un **facteur de bissection de 3 dB** : chaque tranche de 3 dBA
double l'énergie sonore reçue, donc divise par deux la durée permise. C'est
exactement l'énoncé de la diapo 4 (« à chaque 3 dBA, l'impact est doublé »).

```
T(L) = 8 / 2^((L - 85) / 3)          [heures]
```

**Validation contre la diapo 6**

| L (dBA) | Formule | Table RSST |
|---|---|---|
| 82 | 16,00 h | 16 h |
| 83 | 12,70 h | 12 h |
| 85 | 8,00 h | 8 h |
| 88 | 4,00 h | 4 h |
| 91 | 2,00 h | 2 h |
| 94 | 1,00 h | 1 h |

> **Règle d'implémentation** : quand un niveau figure explicitement dans la table
> réglementaire, c'est **la valeur de la table qui prime** (le règlement arrondit
> 12,70 h à 12 h, à l'avantage du travailleur). La formule ne sert qu'à interpoler
> entre les lignes. `data/rsst-art137.json` porte les deux.

## 2. Dose de bruit et niveau équivalent sur 8 h

Pour un quart composé de plusieurs tâches, de durée `Cᵢ` à un niveau `Lᵢ` :

```
Dose D = 100 × Σ ( Cᵢ / T(Lᵢ) )               [%]
Lex,8h = 85 + (3 / log₁₀2) × log₁₀(D / 100)    [dBA]     avec 3 / log₁₀2 = 9,9658
```

Une dose de 100 % correspond à la limite réglementaire. C'est le cœur du
calculateur : il permet de dire « tu as atteint ta dose permise à 10 h 15 »
plutôt que le simple « ton métier est à 97,8 dBA ».

> **Le coefficient est 9,9658, pas 10.** L'approximation `10 ≈ 3/log₁₀2` paraît
> anodine mais casse l'aller-retour du calcul :
>
> | Entrée | avec 10 | avec 9,9658 |
> |---|---|---|
> | 8 h à 88 dBA | 88,010 | **88,000** |
> | 8 h à 97,8 dBA | 97,844 | **97,800** |
> | 8 h à 114,9 dBA | 115,003 | **114,900** |
>
> Un test « 8 h à L dBA doit redonner L » échoue avec le coefficient 10, et
> l'erreur croît avec le niveau — donc précisément là où les enjeux sont les plus
> grands. Utiliser `3 / Math.log10(2)`.

## 3. Atténuation réelle d'un protecteur (dérating)

La formation applique un pourcentage d'efficacité au NRR nominal :

```
Atténuation réelle = NRR × facteur_efficacité
```

**Facteurs annoncés (diapo 13)** : bouchons 70 %, coquilles 75 %.

> ⚠️ **Incohérence de la source à trancher avec le formateur.**
> L'exemple de la diapo 14 calcule « 60 % de 32 NRR = 19 dBA », donc avec un
> facteur de **60 %**, pas 70 %. Les deux valeurs ne peuvent pas coexister.
>
> **Décision provisoire** : le facteur est une **constante de configuration**, pas
> une valeur codée en dur. Défaut = 60 % (valeur la plus conservatrice, et celle
> qui reproduit l'exemple chiffré de la formation), ajustable dans un fichier de
> config. À confirmer avant la mise en production.

Pour référence, la méthode NIOSH usuelle est différente (`(NRR − 7) × facteur`,
avec 50 % pour les bouchons mousse). Prévoir la possibilité de basculer de méthode
sans réécrire le calculateur — mais **afficher la méthode de la formation par
défaut**, pour que les chiffres de l'app correspondent à ceux enseignés en classe.

## 4. Double protection

```
Atténuation double = max(NRR_bouchon, NRR_coquille) × facteur_efficacité + 5
```

Recommandée au-delà de **105 dBA** (diapo 14).

**Validation contre l'exemple de la diapo 14** : 32 × 0,60 = 19,2 dBA, + 5 = 24,2 dBA
→ la diapo annonce 19 puis 24 dBA. ✅

> Point pédagogique fort à mettre en avant dans l'interface : **les atténuations
> ne s'additionnent pas**. Bouchons NRR 32 + coquilles NRR 25 ne donnent pas 57 dB
> de réduction, mais environ 24. Beaucoup de travailleurs croient l'inverse.

## 5. Effet du temps de port réel

C'est le calcul le plus contre-intuitif de la formation, et probablement l'écran le
plus utile de l'application. Si le protecteur est retiré une fraction du temps,
l'énergie sonore reçue pendant ce laps de temps domine complètement le bilan :

```
A_eff(t) = −10 × log₁₀( (1 − t) + t × 10^(−A/10) )
```

où `t` = fraction du temps de port (0 à 1) et `A` = atténuation nominale.

**Validation contre la diapo 16** (A = 30 dB)

| Temps de port | Formule | Table |
|---|---|---|
| 100 % | 30,00 dB | 30 dB |
| 98 % | 16,78 dB | 17 dB |
| 95 % | 12,93 dB | 13 dB |
| 90 % | 9,96 dB | 10 dB |
| 50 % | 3,01 dB | 3 dB |

Correspondance exacte sur les 5 lignes. La formule permet donc un **curseur
continu** : « retirer ses bouchons 10 minutes sur un quart de 8 h fait tomber la
protection de 30 dB à 17 dB » — un message beaucoup plus fort qu'un tableau.

> ⚠️ **Le « 30 dB » de la diapo 16 est orphelin.** Il ne correspond à aucun NRR
> de la diapo 13 (33, 32, 25, 20, 17), ni à aucune de ces valeurs dératées
> (à 60 % : 19,8 / 19,2 / 15,0 / 12,0 / 10,2 — à 70 % : 23,1 / 22,4 / 17,5 /
> 14,0 / 11,9). La diapo 16 raisonne donc en **atténuation nominale**, alors que
> la diapo 14 raisonne en **atténuation dératée** : deux conventions dans la même
> formation.
>
> **Conséquence d'implémentation** : `A` est un **paramètre d'entrée**, jamais la
> constante 30. Sinon l'app affiche 30 dB de protection pour un bouchon que la
> diapo 14 valorise à 19 dB.

**Plafond du temps de port.** À 50 % de port, l'atténuation effective plafonne à
**3,01 dB** — c'est `−10·log₁₀(0,5)`, une borne supérieure approchée par le
dessous : 2,92 dB à 17 dB nominaux, 3,00 à 25 dB, 3,01 à partir de 30 dB. Un
NRR 33 et un NRR 100 deviennent indiscernables (moins de 0,01 dB d'écart).
Au-delà d'un certain retrait, le choix du protecteur ne compte plus.

## 6. Budget de retrait (inversion de §5)

La formule §5 s'inverse analytiquement. Pour rester sous 85 dBA à un poste de
niveau `L`, avec un protecteur d'atténuation nominale `A_nom` :

```
A_requise = L − 85
t_min = (1 − 10^(−A_requise/10)) / (1 − 10^(−A_nom/10))
```

Si `t_min > 1`, aucun temps de port ne suffit : le protecteur est inadéquat pour
ce poste.

**Contrôle** : foreur long trou (97,8 dBA) avec un NRR 32 dératé à 60 % → `t_min`
= 95,90 %, ce qui redonne exactement **85,00 dBA**. ✅

| Métier | NRR 33 | NRR 25 | NRR 20 |
|---|---|---|---|
| Mineur jackleg (114,9) | impossible | impossible | impossible |
| Câbleur (100,1) | 10 min | impossible | impossible |
| Foreur long trou (97,8) | 20 min | 10 min | impossible |
| Mécanicien 2 atelier (96,0) | 33 min | 24 min | 8 min |
| Superviseur (89,3) | 2 h 55 | 2 h 48 | 2 h 38 |

C'est la sortie la plus actionnable du domaine : un **budget** de minutes de
retrait, pas une consigne morale.

## 7. Sommation de sources

Identité exacte, aucune approximation :

```
Énergie relative   E = 10^(L/10)
Somme de sources   L_total = 10 × log₁₀( Σ 10^(Lᵢ/10) )
```

| Situation | Résultat |
|---|---|
| 95 + 95 dBA | **98,01 dBA** — la « règle des 3 dBA » de la diapo 4 *est* ce calcul |
| 100 + 90 dBA | 100,41 dBA |
| 103 + 66 dBA (drill à air + ambiant) | 103,00 dBA |
| 98 + 95 + 92 dBA | 100,44 dBA |

Deux conséquences opérationnelles : le bruit ne s'additionne pas
arithmétiquement (même erreur mentale que la double protection de la diapo 14),
et **éteindre la machine la plus faible ne sert à rien** — passer de [100, 90] à
[100] fait gagner 0,4 dB.

Cette formule rend la règle des 3 dBA **démontrable** au lieu d'assénée. Elle
n'est nulle part dans la formation, mais elle en est le fondement implicite.

> ⚠️ **3 dB n'est pas exactement un doublement.** Le vrai doublement d'énergie
> vaut `10·log₁₀2 = 3,0103 dB`. Le RSST adopte 3 dB tout rond comme convention
> réglementaire, et le calcul de durée permise doit garder cette convention —
> c'est la loi. Mais l'outil qui affiche l'énergie doit montrer la valeur
> physique : +3 dBA = ×1,995 et non ×2, +6 dBA = ×3,98 et non ×4. L'écart est
> négligeable en pratique et ne change aucune décision ; le mentionner évite
> simplement qu'un travailleur attentif prenne l'app en défaut.

## 8. Cumul de carrière

Aucune science ajoutée : c'est la formule §2 prolongée dans le temps.

```
doses_par_jour = D / 100
doses_carriere = doses_par_jour × jours_par_an × années
```

| Métier | Doses permises / jour | Sur 25 ans (240 j/an) |
|---|---|---|
| Foreur long trou | 19,2 | 115 490 |
| Câbleur | 32,7 | 196 488 |
| Mineur jackleg | 1 000,6 | 6 003 671 |

Ce n'est **pas** une prédiction médicale — c'est le compteur du règlement,
prolongé. La modélisation de la perte auditive réelle (ISO 1999) exigerait des
coefficients tabulés par fréquence qui ne doivent pas être improvisés ; voir la
limite n° 6 ci-dessous.

---

## Limites — à afficher dans l'application

1. **Ce n'est pas une mesure.** Les niveaux proviennent de dosimétries antérieures
   effectuées par la mine sur des postes types. Le bruit réel varie selon
   l'équipement, son entretien, le lieu et la tâche du jour.
2. **Le NRR est un chiffre de laboratoire.** Le dérating corrige partiellement cet
   écart, mais l'ajustement individuel réel n'est vérifiable que par un test
   d'ajustement (fit-test).
3. **Aucune valeur légale.** L'app ne remplace ni la dosimétrie individuelle, ni
   l'évaluation d'un hygiéniste du travail, ni le programme de conservation de
   l'ouïe de l'employeur.
4. **Pas un outil de dépistage médical.** Le module de symptômes, s'il est ajouté,
   oriente vers l'infirmerie ou le médecin — il ne pose aucun diagnostic.
5. **Le micro d'un téléphone n'est pas un sonomètre.** Si une mesure sonore est un
   jour ajoutée, elle doit être présentée comme indicative et non comme une mesure
   de conformité.
6. **Pas de modèle de perte auditive.** Le cumul de §8 compte des doses
   réglementaires, pas des décibels perdus. Projeter une perte auditive exige la
   norme **ISO 1999:2013** et ses coefficients `u, v, L₀` tabulés par fréquence.
   Ces coefficients doivent venir du texte de la norme (ou de NIOSH 98-126) et
   vivre dans un JSON cité — jamais être approchés de mémoire. Une fausse
   précision dans un outil de santé est pire que l'absence d'outil.
7. **Le modèle de propagation n'est pas validé.** Aucun chiffre de la formation
   ne permet de vérifier un calcul de distance ou de réverbération, et une galerie
   minière est un guide d'onde, pas une salle diffuse. Si un tel outil est
   construit, il doit afficher des **écarts** et jamais des dBA absolus.
