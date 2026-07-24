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
Dose D = 100 × Σ ( Cᵢ / T(Lᵢ) )      [%]
Lex,8h = 85 + 10 × log₁₀(D / 100)     [dBA]
```

Une dose de 100 % correspond à la limite réglementaire. C'est le cœur du
calculateur : il permet de dire « tu as atteint ta dose permise à 10 h 15 »
plutôt que le simple « ton métier est à 97,8 dBA ».

> Le coefficient 10 est exact ici : avec un facteur de bissection de 3 dB,
> 3 / log₁₀(2) = 9,966 ≈ 10.

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
