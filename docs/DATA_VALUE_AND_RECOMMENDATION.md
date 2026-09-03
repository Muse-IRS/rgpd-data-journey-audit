# Valeur des données, recommandations et contrôle

## Statut

- portée : couche publique pédagogique ;
- domaine : circulation, valorisation économique, personnalisation et recommandations ;
- verdict juridique automatique : interdit ;
- inspection de l'appareil : aucune ;
- stockage local ajouté par cette page : aucun.

## 1. Question publique

Après avoir compris où vont les données, l'utilisateur doit pouvoir poser une seconde question :

> Qui tire une valeur de ces données, sous quelle forme, et quels réglages permettent de conserver ce qui est utile tout en réduisant ce qui devient du bruit ?

Le cadre ne part pas du principe que la personnalisation est bonne ou mauvaise en soi.

```text
PERSONNALISATION != BIEN_OU_MAL_EN_SOI
```

La restitution cherche à distinguer utilité, coût informationnel, niveau de collecte et capacité de contrôle.

## 2. Chaîne publique

```text
DONNEE
-> COLLECTE
-> USAGE
-> DESTINATAIRE
-> FINALITE
-> TRANSFERT / PARTAGE / ACCES
-> VALEUR ECONOMIQUE EVENTUELLE
-> CONTROLE UTILISATEUR
```

Une donnée peut contribuer à une valeur économique sans qu'une vente directe soit démontrée.

```text
MONETISATION_DES_DONNEES != VENTE_DIRECTE_DES_DONNEES
PARTAGE_DE_DONNEES != VENTE_DIRECTE_DES_DONNEES
```

Le terme « vente directe » est utilisé ici comme catégorie descriptive ordinaire. Il ne remplace pas une qualification juridique applicable dans une juridiction déterminée.

## 3. Formes possibles de valeur

Selon le service et les éléments effectivement documentés, les données peuvent notamment contribuer à :

- personnaliser un service ou un fil de recommandations ;
- mesurer une audience ou une performance ;
- sélectionner ou mesurer une publicité ;
- améliorer un produit ou un service ;
- enrichir un profil ou un segment ;
- permettre l'accès d'un partenaire ou prestataire à certaines informations ;
- soutenir une relation commerciale ou un modèle financé indirectement par la publicité ;
- améliorer ou entraîner certains systèmes lorsque cela est explicitement documenté.

Cette liste décrit des mécanismes possibles. Leur présence doit être établie par les documents ou le fonctionnement observable du service concerné.

## 4. Verrous épistémiques

```text
PUBLICITE_APRES_CONVERSATION != PREUVE_UTILISATION_MICROPHONE
RECOMMANDATION_PERTINENTE != LEGITIMITE_AUTOMATIQUE_DE_LA_COLLECTE
RECOMMANDATION_NON_PERTINENTE != PREUVE_DE_COLLECTE_ILLICITE
ABSENCE_DE_MENTION_DE_VENTE != PREUVE_D_ABSENCE_DE_TOUTE_VALORISATION
```

Une recommandation très précise peut provenir de plusieurs signaux : recherches antérieures, navigation, activité de compte, historique, localisation approximative, identifiants, interactions dans une application, profils statistiques, comportements similaires ou simple coïncidence.

Retirer une permission microphone peut être pertinent lorsqu'une application n'en a pas besoin, mais cela n'interrompt pas automatiquement les autres signaux de personnalisation.

## 5. Lecture utilité / intrusion

Deux axes doivent rester distincts :

```text
UTILITE_POUR_UTILISATEUR
!=
COUT_DE_COLLECTE_OU_DE_VIE_PRIVEE
```

Matrice publique :

| | collecte limitée / acceptable pour l'utilisateur | collecte jugée trop large par l'utilisateur |
|---|---|---|
| recommandation utile | valeur ajoutée probable | utile mais réglage / réduction à envisager |
| recommandation peu utile | bruit | bruit + coût de données |

Cette matrice n'est pas un verdict juridique. Elle aide l'utilisateur à décider ce qu'il souhaite conserver, ajuster ou réduire.

## 6. Chemin de réglage simple

```text
LA_PERSONNALISATION_M_AIDE ?
  |
  +-- OUI -> conserver ou ajuster les signaux inutiles
  |
  +-- NON -> réduire personnalisation, publicité et historique lorsque les réglages existent
```

Puis :

```text
UNE_PERMISSION_EST_ELLE_NECESSAIRE_A_LA_FONCTION ?
  |
  +-- OUI -> conserver si souhaité
  |
  +-- NON / UNKNOWN -> vérifier et limiter si souhaité
```

Catégories de réglages à examiner selon l'appareil ou le service :

- permissions application : microphone, localisation, photos, contacts, Bluetooth, caméra ;
- personnalisation publicitaire ;
- historique de recherche et activité web / application ;
- cookies, stockage local et suivi intersite dans le navigateur ;
- personnalisation du moteur de recherche ;
- historique et recommandations du compte ;
- notifications et suggestions ;
- identifiant publicitaire lorsqu'un contrôle est proposé.

Les chemins exacts changent selon les systèmes et versions. La couche publique doit donc expliquer la catégorie de contrôle avant de donner un chemin spécifique à une plateforme.

## 7. Restitution publique cible

```text
Ce qui est collecte
Ce qui reste local
Ce qui est transmis
A qui
Pourquoi
Quelle personnalisation est declaree
Quelle valeur economique est identifiable
Vente directe : OBS | UNKNOWN
Contrepartie financiere : OBS | UNKNOWN
Ce qui reste a verifier
Ce que l'utilisateur peut conserver
Ce qu'il peut ajuster
Ce qu'il peut reduire ou refuser lorsque le service le permet
```

## 8. Frontière

La couche ne doit jamais transformer :

```text
partage -> vente
publicite -> ecoute_microphone
personnalisation -> consentement
utilite -> legitimite
absence_de_preuve -> preuve_d_absence
```

Elle doit rendre compréhensible la relation entre données, valeur, recommandations et contrôle utilisateur sans produire davantage de certitude que les éléments disponibles n'en contiennent.
