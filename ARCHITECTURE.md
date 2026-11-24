# Architecture et bonnes pratiques — Steering Behaviors (p5.js)

Ce document définit l'architecture logicielle et les conventions de développement pour toutes les applications p5.js de ce dépôt, basées sur l'article fondateur de **Craig W. Reynolds** (*Steering Behaviors For Autonomous Characters*, GDC 1999 : <https://www.red3d.com/cwr/steer/gdc99/>).

---

## 1. Principes architecturaux fondamentaux

### 1.1 Une classe maximum par fichier
- Chaque fichier `.js` (hors `sketch.js`) contient **au maximum une classe** (sauf éventuelle classe interne strictement liée à son implémentation).
- Le nom du fichier reflète directement la classe qu'il contient en `camelCase` :
  - `vehicle.js` → `class Vehicle`
  - `target.js` → `class Target`
  - `obstacle.js` → `class Obstacle`
  - `player.js` → `class Player`
  - `missile.js` → `class Missile`
  - `animatedScore.js` → `class AnimatedScore`
- Cela garantit une structure modulaire, lisible et facile à charger dans `index.html`.

### 1.2 Tout élément graphique animé (ou potentiellement mobile) est un `Vehicle`
- **Règle absolue** : chaque élément graphique animé est une instance de `Vehicle` (`vehicle.js`) ou d'une **sous-classe de `Vehicle`**, et se déplace exclusivement via les **steering behaviors** (`applyForce()` + intégration physique dans `update()`).
- **Éléments fixes susceptibles de se déplacer** : même des éléments initialement statiques mais qui pourraient bouger ou réagir à des forces (ex. : **obstacles**, cibles fixes, bonus, plateformes, murs mobiles) doivent être modélisés comme des `Vehicle` (ou sous-classes de `Vehicle`), éventuellement avec `vel = (0, 0)` et `maxSpeed = 0` tant qu'ils restent immobiles.
- **Objets spécialisés par héritage** : tout objet métier ou de gameplay (joueur, ennemi, vaisseau spatial, score animé flottant, missile, particule, anneau de serpent, etc.) doit être implémenté comme une **sous-classe de `Vehicle`** :
  ```js
  class Missile extends Vehicle {
    constructor(x, y) {
      super(x, y);
      // propriétés spécifiques au missile
    }
  }
  ```
- On évite de modifier `this.pos` directement à la main dans `draw()` (sauf téléportation/wrap d'écran `edges()` ou initialisation) : le mouvement doit passer par l'application de forces de steering.

---

## 2. Modèle théorique de Craig Reynolds (GDC 1999)

### 2.1 Hiérarchie du mouvement en 3 couches
Craig Reynolds décompose le comportement moteur d'un personnage autonome en trois niveaux :
1. **Action Selection (Sélection d'action)** : niveau stratégique qui choisit le but courant selon l'état du monde (ex. : patrouiller, chasser, fuir un prédateur, esquiver).
2. **Steering (Pilotage)** : niveau intermédiaire qui calcule un vecteur de force désirée (*steering force*) pour satisfaire un ou plusieurs sous-objectifs.
3. **Locomotion (Locomotion)** : niveau bas qui traduit la force de steering en mouvement physique soumis aux contraintes du corps (inertie, vitesse max, force max).

### 2.2 Simple Vehicle Model (Modèle de véhicule simple)
Dans ce modèle à masse ponctuelle (2D dans p5.js) :
- `pos` (`p5.Vector`) : position dans l'espace global
- `vel` (`p5.Vector`) : vélocité courante (définit l'orientation locale *forward* via `vel.heading()`)
- `acc` (`p5.Vector`) : accélération accumulée sur la frame
- `mass` (`number`, optionnel, défaut `1`) : masse du véhicule
- `maxSpeed` (`number`) : vitesse maximale autorisée
- `maxForce` (`number`) : force de pilotage maximale applicable
- `r` (`number`) : rayon englobant (affichage, détection d'obstacles, collisions)

À chaque pas de simulation (`update()`), intégration d'Euler :
```js
// steeringForce = truncate(steeringDirection, maxForce)
// acceleration = steeringForce / mass
this.vel.add(this.acc);
this.vel.limit(this.maxSpeed);
this.pos.add(this.vel);
this.acc.set(0, 0);
```

Formule fondamentale du steering :
$$\vec{F}_{\text{steering}} = \text{limit}\left(\vec{v}_{\text{désirée}} - \vec{v}_{\text{actuelle}},\; \text{maxForce}\right)$$

---

## 3. Catalogue des Steering Behaviors standards (GDC 1999)

### Comportements individuels de base
1. **Seek** : calcule une vitesse désirée de norme `maxSpeed` dirigée vers une cible statique. Produit un dépassement/orbite si non freiné.
2. **Flee** : inverse de *Seek* ; dirige la vitesse désirée à l'opposé de la cible (éventuellement dans un rayon de perception).
3. **Arrival** : identique à *Seek* au loin, mais réduit linéairement la vitesse désirée à l'intérieur d'un rayon de freinage (`rayonZoneDeFreinage` / `slowingDistance`) jusqu'à s'arrêter sur la cible.
4. **Pursuit** : poursuite d'une cible mobile en prédisant sa position future $\vec{p}_{\text{future}} = \vec{p}_{\text{cible}} + \vec{v}_{\text{cible}} \cdot T$, puis application de *Seek* vers cette position prédite. ($T$ peut être fixe ou proportionnel à la distance $D$).
5. **Evasion** : inverse de *Pursuit* ; applique *Flee* par rapport à la position future prédite d'un poursuivant.
6. **Offset Pursuit** : maintient un passage à une distance latérale $R$ de la position prédite d'une cible (utile pour des survols, escortes ou attaques tangentielles sans collision).
7. **Wander** : errance fluide et cohérente. Un cercle de rayon `wanderRadius` est projeté à distance `distanceCercle` devant le véhicule ; un angle `wanderTheta` évolue par petites perturbations aléatoires bornées (`displaceRange`) ou par bruit de Perlin.

### Navigation et environnement
8. **Obstacle Avoidance** : projette un cylindre/boîte de détection le long de l'axe *forward* (proportionnel à la vitesse). Identifie l'obstacle sphérique/circulaire le plus menaçant intersectant ce volume et applique une force latérale pour l'éviter. (À la différence de *Flee*, n'agit pas si l'obstacle est parallèle ou derrière).
9. **Path Following** : prédit la position future, la projette sur l'épine dorsale du chemin (segments ou spline) ; si la distance à l'épine dépasse le rayon du chemin, applique *Seek* vers le point projeté (ou un point légèrement en avant sur le chemin).
10. **Wall Following & Containment** : maintient un décalage constant le long d'un mur ou force le véhicule à rester dans une zone bornée (`boundaries`), en corrigeant la trajectoire dès que la position future sort de la zone autorisée.
11. **Flow Field Following** : échantillonne un champ de vecteurs (grille d'angles/forces) à la position future prédite et utilise le vecteur du champ comme vitesse désirée.

### Comportements de groupe et multi-agents
12. **Unaligned Collision Avoidance** : prédit le point et l'instant de rapprochement minimal (*nearest approach*) entre agents aux trajectoires quelconques, puis freine/accélère et dévie latéralement pour éviter la collision.
13. **Separation** : force répulsive somme des vecteurs d'éloignement des voisins dans le rayon de perception, pondérée par $1/r$ (ou $1/r^2$).
14. **Cohesion** : *Seek* vers le centre de gravité (position moyenne) des voisins dans le champ de perception.
15. **Alignment** : force de steering vers la vélocité moyenne (ou direction *forward* moyenne) des voisins.
16. **Flocking (Boids)** : combinaison des 3 comportements *Separation* + *Cohesion* + *Alignment*, chacun paramétré par un poids, une distance et un angle de perception (champ de vision).
17. **Leader Following** : combine *Arrival* vers un point décalé derrière le leader, dégagement latéral si le suiveur se trouve devant le leader, et *Separation* entre suiveurs.

### Comportements complémentaires cités par Reynolds
- **Interpose** : se placer entre deux agents mobiles (point médian de leurs positions prédites).
- **Shadow** : approcher puis aligner vitesse et cap sur une cible.
- **Docking** : *Arrival* contraint également sur l'orientation finale.
- **Hide** : chercher une position abritée du côté opposé d'un obstacle par rapport à un adversaire.
- **Explore / Forage** : variantes de *Wander* orientées couverture de zone ou recherche de ressources.

---

## 4. Combinaison des comportements

Reynolds distingue deux mécanismes complémentaires :
1. **Commutation discrète (*Action Selection*)** : changement de mode comportemental selon le contexte (ex. : patrouille → fuite quand un prédateur entre dans le rayon de détection).
2. **Mélange continu (*Steering Blending*)** :
   - **Somme pondérée** : $\vec{F} = \sum_i w_i \cdot \vec{F}_i$, puis limitation à `maxForce`. Simple et efficace, mais attention aux forces opposées qui s'annulent.
   - **Par priorité** : évaluer d'abord les comportements critiques (ex. `avoid` ou `boundaries`) ; s'ils retournent une force non nulle, l'appliquer en priorité.
   - **Prioritized Dithering** : évaluation probabiliste selon la priorité pour réduire le coût CPU tout en profitant du filtrage naturel par l'inertie.

---

## 5. Conventions d'implémentation du projet

- **Méthodes de comportement pures** : `seek()`, `flee()`, `arrive()`, `pursue()`, `evade()`, `wander()`, `avoid()`, `separate()`, etc. **retournent un `p5.Vector`** (la force calculée et limitée à `maxForce`) sans appeler `applyForce()` directement, afin de permettre leur pondération dans `applyBehaviors()`.
- **Méthode d'orchestration** : `applyBehaviors(...)` calcule les forces, applique les poids, et appelle `this.applyForce(...)`.
- **Mode Debug** : `static debug = false` sur `Vehicle` pour tracer les vecteurs, zones de freinage et capteurs visuels.
- **Performance & qualité p5.js** : respecter systématiquement [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md).
