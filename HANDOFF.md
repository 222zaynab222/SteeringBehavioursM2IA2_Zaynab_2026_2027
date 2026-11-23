# HANDOFF — Passation entre assistants IA

Ce fichier permet de transférer proprement le contexte du projet d'un assistant IA à un autre (Claude, Codex, Gemini, Copilot, etc.) sans perte d'information.

---

## 1. Checklist de prise en main pour le nouvel assistant

Avant toute modification de code :
1. Lire [ARCHITECTURE.md](./ARCHITECTURE.md) (règles strictes : 1 classe max par fichier, tout élément animé ou potentiellement mobile hérite de `Vehicle`, catalogue Craig Reynolds GDC 99).
2. Lire [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md) (optimisation `draw()`, `p5.Vector`, `push()`/`pop()`, `p5.disableFriendlyErrors`, profilage).
3. Vérifier l'état courant dans [README.md](./README.md) et la section **État actuel** ci-dessous.
4. **En fin de session / après une tâche significative** : mettre à jour [README.md](./README.md) (inventaire des sketches + journal des évolutions) et ajouter une entrée dans le journal de passation ci-dessous.

---

## 2. État actuel du projet

- **Dépôt** : `SteeringBehavioursM2IA2_Mrrakech_2026_2027/`
- **Stack** : JavaScript ES6 + p5.js (fichiers chargés via `<script>` dans `index.html`, sans bundler).
- **Sketches existants** :
  - `1-Seek/`
  - `2-PursueEvade/` et `2-PursueEvade_correction/`
  - `3-Arrival/` et `3-Arrival_correction/` (`Snake`, `SnakeWander` héritant de `Vehicle`)
  - `4-Wander/`
- **Documentation & automatisation** :
  - `ARCHITECTURE.md`, `P5JS_BEST_PRACTICES.md`, `README.md`, `HANDOFF.md`
  - `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`
  - `scripts/update-readme.sh` (synchronise la table des sketches dans `README.md`)

---

## 3. Journal de passation (à compléter à chaque session)

### Passation #1 — 2026-11-23
- **Assistant sortant** : Copilot
- **Travail effectué** :
  - Lecture et synthèse de l'article GDC 1999 de Craig Reynolds (*Steering Behaviors For Autonomous Characters*).
  - Récupération et synthèse des bonnes pratiques officielles p5.js dans `P5JS_BEST_PRACTICES.md`.
  - Rédaction de `ARCHITECTURE.md` formalisant : 1 classe max par fichier, tout élément graphique animé ou potentiellement mobile est un `Vehicle` (ou sous-classe), et catalogue des comportements standards.
  - Mise à jour de `README.md` avec sections auto-générées + script `scripts/update-readme.sh`.
  - Création des fichiers d'instructions IA : `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`.
- **Décisions prises** :
  - Conservation de l'architecture sans bundler (`<script>` dans `index.html`) cohérente avec les sketches existants du cours.
  - Convention de nommage : classes en `PascalCase`, fichiers en `camelCase` (`vehicle.js`, `animatedScore.js`, etc.).
- **Prochaines étapes suggérées** :
  - Implémenter les prochains sketches/applications (ex. : Obstacle Avoidance, Path Following, Flow Field, Flocking / Boids, ou un mini-jeu complet respectant `Vehicle` pour joueur, ennemis, missiles, obstacles et score animé).
- **Points d'attention** :
  - Certains sketches existants antérieurs à ces règles (ex. `2-PursueEvade/bouncingBall.js`) n'héritent pas encore forcément de `Vehicle` : ne les refactorer que si demandé, mais appliquer strictement `extends Vehicle` pour tout nouveau développement.

### Passation #2 — 2026-11-23
- **Assistant sortant** : Copilot
- **Travail effectué** :
  - Implémentation de la tâche 1 dans `1-Seek` : plusieurs vaisseaux, curseurs de paramètres, panneau repliable et mode debug.
  - Ajout de l'affichage conditionnel des vecteurs vitesse rouges.
- **Fichiers créés / modifiés** :
  - `1-Seek/sketch.js`
  - `1-Seek/vehicle.js`
  - `1-Seek/style.css`
  - `README.md`
- **Décisions prises** :
  - Le panneau utilise les contrôles DOM p5.js existants et reste superposé en haut du canvas.
  - Le raccourci `D` est ignoré lorsque le focus est dans un élément de formulaire.
- **Prochaines étapes** :
  - Implémenter la tâche 2 : dégradé radial arc-en-ciel suivant la souris.

---

### Modèle d'entrée pour les prochaines passations

```markdown
### Passation #N — YYYY-MM-DD
- **Assistant sortant** : (Claude / Codex / Gemini / Copilot / autre)
- **Travail effectué** :
  - ...
- **Fichiers créés / modifiés** :
  - ...
- **Décisions prises** :
  - ...
- **Prochaines étapes** :
  - ...
- **Points d'attention / bugs connus** :
  - ...
```

### Passation #3 — 2026-11-23
- **Assistant sortant** : Copilot
- **Travail effectué** :
  - Correction du raccourci clavier du mode debug dans `1-Seek`.
  - La touche `D` ou `d` inverse maintenant systématiquement l'état du debug et synchronise la checkbox.
- **Fichiers créés / modifiés** :
  - `1-Seek/sketch.js`
  - `HANDOFF.md`
- **Décisions prises** :
  - Le raccourci clavier reste actif même lorsqu'un contrôle du panneau a précédemment reçu le focus.
- **Préférence de workflow** :
  - Mettre à jour `HANDOFF.md` après chaque opération de développement.
- **Prochaines étapes** :
  - Implémenter la tâche 2 : dégradé radial arc-en-ciel suivant la souris.

### Passation #4 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la tâche 2 dans `1-Seek` conformément à `1-Seek/1-Specification.md` :
    - Dégradé radial arc-en-ciel animé centré sur `(mouseX, mouseY)`, rendu derrière la cible et les vaisseaux via `drawingContext.createRadialGradient` avec anneaux concentriques et fondu quadratique en périphérie.
    - Phase d'animation rebouclée modulo `360` (`gradientPhase`) pour éviter toute croissance indéfinie et animer le dégradé même lorsque la souris est immobile.
    - Ajout dans le panneau de contrôle d'une section **Dégradé radial** avec les 5 curseurs spécifiés : `Rayon du dégradé` (`50..1000`, init `350`), `Vitesse d'animation` (`0..2`, pas `0.01`, init `0.2`), `Opacité` (`0..255`, init `180`), `Nombre d'anneaux` (`10..200`, init `80`), `Décalage des couleurs` (`0..360`, init `0`).
    - Mise en cache des paramètres dans `gradientSettings` (aucune lecture DOM dans `draw()`), et ajout d'un défilement vertical borné sur `.controls__content`.
  - Vérification syntaxique (`node --check`) et mise à jour de `README.md` (`./scripts/update-readme.sh` + journal des évolutions).
- **Fichiers créés / modifiés** :
  - `1-Seek/sketch.js`
  - `1-Seek/style.css`
  - `README.md`
  - `HANDOFF.md`
- **Décisions prises** :
  - Utilisation de `drawingContext.createRadialGradient` avec 2 color stops par anneau (un seul appel `ctx.fill()` par frame) pour concilier rendu net des anneaux, absence de cumul d'alpha et fluidité avec 200 vaisseaux.
  - Conservation intégrale du raccourci `D`/`d` et du pipeline `Vehicle` (`applyBehaviors` → `applyForce` → `update`).
- **Prochaines étapes** :
  - Implémenter les nouvelles tâches ajoutées dans `1-Seek/1-Specification.md` :
    1. **Tâche 3** : cibles mobiles (`Target` héritant de `Vehicle`, vitesse aléatoire dans `[-7, 7]`, couleur claire, rayon `10..100`, rebond sur les bords, curseur `0..20`).
    2. **Tâche 4** : cercle de détection des vaisseaux (`150` px, curseur `20..200`, visible en debug), `seek` vers la cible la plus proche, réapparition aléatoire si distance `< 5` px.
    3. **Tâche 5** : cercle de détection des cibles (`100` px, réglable, visible en debug), fuite avec boost temporaire de `maxSpeed` et `maxForce` jusqu'à `300` px (paramètres réglables).
    4. **Tâche 6** : endurance des cibles (2 s de fuite / 1 s de régénération + barre visuelle), points de vie (5..10 affichés au centre, `-1` par contact, mort à 0) et compteur de cibles en haut à droite.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #5 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout des tâches 3 à 6 dans `1-Seek/1-Specification.md` et ajout des marqueurs de statut `[DONE]`, `[CURRENT]` et `[TODO]` sur chaque tâche.
  - Implémentation de la **tâche 3** dans `1-Seek` :
    - Refonte de `Target` (`1-Seek/target.js`, `extends Vehicle`) : rayon aléatoire `10..100`, position initiale contrainte dans le canvas, couleur aléatoire claire (`RGB` dans `150..255`), direction aléatoire et vitesse dans `[-7, 7]` (`maxSpeed = 7`), rebond sur les bords dans `edges()`, rendu isolé par `push()`/`pop()` dans `show()`.
    - Ajout dans `1-Seek/sketch.js` du tableau `targets`, du curseur `Nombre de cibles` (`0..20`, pas `1`, valeur initiale `5`), de `setTargetCount()` et du cycle `applyBehaviors()` → `update()` → `edges()` → `show()` pour chaque cible.
  - Passage de la tâche 3 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Directive de workflow** :
  - Dans les spécifications (`1-Seek/1-Specification.md`), toujours maintenir les balises `[DONE]` (tâches terminées), `[CURRENT]` (tâche en cours) et `[TODO]` (tâches à faire) à la fin des titres de tâches.
- **Prochaines étapes** :
  - Implémenter la **tâche 4** (`[TODO]`) : cercle de détection autour des vaisseaux (`150` px par défaut, curseur `20..200`, visible en mode debug), `seek` vers la cible la plus proche dans le cercle, et réapparition aléatoire de la cible lorsque distance `< 5` px.
  - Puis **tâche 5** (`[TODO]`) et **tâche 6** (`[TODO]`).
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #6 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Passage du nombre de cibles par défaut à `1` (dans `1-Seek/sketch.js` et `1-Seek/1-Specification.md`).
  - Implémentation de la **tâche 4** dans `1-Seek` :
    - Ajout de `detectionRadius = 150`, `findClosestTarget(targets)` (comparaison optimisée par distance au carré), `drawDetectionCircle()` (visible quand `Vehicle.debug === true`) et mise à jour de `applyBehaviors(target, targets)` dans `1-Seek/vehicle.js` pour faire `seek` sur la cible la plus proche dans le cercle de détection (sinon sur la souris).
    - Ajout de `respawn()` dans `1-Seek/target.js` pour replacer la cible aléatoirement dans les limites du canvas.
    - Ajout du curseur `Rayon de détection (vaisseaux)` (`20..200`, pas `1`, initial `150`) et de `checkVehicleTargetContact(vehicle)` (distance au carré `< 25`, soit `< 5` px) dans `1-Seek/sketch.js`.
  - Mise à jour des statuts `[DONE]` / `[TODO]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/vehicle.js`
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Implémenter la **tâche 5** (`[TODO]`) : cercle de détection des cibles (`100` px, réglable et visible en debug), fuite temporaire (`flee`) avec boost de `maxSpeed` et `maxForce` jusqu'à `300` px de distance (valeurs réglables par curseurs).
  - Puis **tâche 6** (`[TODO]`) : endurance des cibles (2 s de fuite / 1 s de régénération + barre), points de vie (`5..10` affichés au centre, `-1` par contact, mort à `0`) et compteur de cibles en haut à droite.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #7 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Ajout d'un menu déroulant **Scénario** dans le panneau de contrôle (`1-Seek/sketch.js`, `1-Seek/style.css`) :
    - `Scénario 1 : Suivre la souris` (`seek` vers la souris).
    - `Scénario 2 : Chasse aux cibles` (patrouille aléatoire `randomPatrol()` changeant de direction toutes les 4 s via steering, puis `seek` sur la cible la plus proche dans le cercle de détection).
    - `Scénario 3 : Fuite des cibles` (idem scénario 2 + fuite temporaire des cibles).
  - Implémentation de la **tâche 5** dans `1-Seek/target.js` et `1-Seek/sketch.js` :
    - Cercle de détection des cibles (`detectionRadius = 100`, curseur `20..300`, visible en mode debug avec cercle de sécurité affiché pendant la fuite).
    - Fuite temporaire (`flee` hérité de `Vehicle`) avec boost de `maxSpeed` (`fleeMaxSpeed = 12`) et `maxForce` (`fleeMaxForce = 0.8`) jusqu'à atteindre `safeDistance = 300` px du vaisseau le plus proche, avec 4 curseurs réglables dans la section **Fuite des cibles**.
  - Ajout de la détection avec boost **x3** (`maxSpeed` et `maxForce`) sur `Vehicle` lorsqu'une cible est détectée dans le cercle de détection (conservation de `baseMaxSpeed` / `baseMaxForce` synchronisées avec les curseurs).
  - Passage de la tâche 5 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/vehicle.js`
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/style.css`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Implémenter la **tâche 6** (`[TODO]`) : endurance des cibles (2 s de fuite max, puis régénération en 1 s + barre d'endurance visible), points de vie initiaux (`5..10`, affichés au centre en couleur contrastée, `-1` par contact, mort à `0`) et compteur du nombre de cibles en haut à droite de l'écran.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #8 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 6** dans `1-Seek/target.js` et `1-Seek/sketch.js` :
    - **Endurance** sur `Target` : fuite limitée à 2 s (`staminaDrainDurationMs = 2000`), blocage en régénération complète pendant 1 s (`staminaRegenDurationMs = 1000`, `isRegeneratingStamina`), mise à jour basée sur `deltaTime`, et affichage de la barre d'endurance au-dessus de chaque cible (`drawStaminaBar()`, vert en état normal/fuite, orange en régénération forcée).
    - **Points de vie et mort** : PV initiaux aléatoires entre `5` et `10` (`Math.floor(random(5, 11))`), affichés au centre du cercle en couleur sombre contrastée (`drawHealth()`), perte de `1` PV par contact via `takeDamage(1)` (réapparition aléatoire si `hp > 0`, suppression du tableau `targets` à `hp === 0`).
    - **Compteur HUD** : `drawTargetCounter()` affiche le nombre de cibles restantes en haut à droite de l'écran.
  - Passage de la tâche 6 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/target.js`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches spécifiées dans `1-Seek/1-Specification.md` (Tâches 1 à 6) sont `[DONE]`. En attente de nouvelles tâches pour `1-Seek` ou passage au prochain sketch.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #9 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Création de la classe `TargetFragment` (`1-Seek/targetFragment.js`, `extends Vehicle`, 1 classe/fichier) pour animer l'éclatement d'une cible en **8 parts de camembert** (`arc(..., PIE)`) sur **0,3 s** (`300` ms) via steering (`seek` vers un point radial extérieur + rotation et fondu d'opacité).
  - Chargement de `targetFragment.js` dans `1-Seek/index.html` et intégration dans `1-Seek/sketch.js` (`shatterTarget`, `updateAndDrawTargetFragments`).
  - Dans le **Scénario 3**, lorsqu'un vaisseau touche une cible (`distance < target.r + vehicle.r`), elle éclate immédiatement en 8 morceaux et meurt définitivement sans réapparaître (et dans le scénario 2, elle éclate également lorsqu'elle atteint `0` PV).
  - Remplacement du seuil de contact fixe (`< 5` px) par la somme des rayons (`movingTarget.r + vehicle.r`, comparée au carré) dans `checkVehicleTargetContact()`.
  - Restauration exacte de la vitesse initiale (`initialSpeed`) et de l'accélération initiale (`baseMaxForce`, `acc.set(0, 0)`) d'une cible à la fin d'une fuite dans `Target.stopFleeing()`.
  - Ajout des vagues progressives (`targetWave`) : lorsque toutes les cibles sont éliminées (`targets.length === 0` et curseur `> 0`), recréation du nombre indiqué par le curseur avec `speedMultiplier = 1 + (wave - 1) * 0.15` et `forceMultiplier = 1 + (wave - 1) * 0.1`, avec affichage de la vague dans le compteur HUD en haut à droite.
  - Vérification syntaxique (`node --check`) et mise à jour de `1-Seek/1-Specification.md`, `README.md` (`./scripts/update-readme.sh` + changelog) et `HANDOFF.md`.
- **Fichiers créés / modifiés** :
  - `1-Seek/targetFragment.js` (nouveau)
  - `1-Seek/index.html`
  - `1-Seek/sketch.js`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches de `1-Seek/1-Specification.md` sont `[DONE]`. En attente de nouvelles évolutions ou du prochain sketch.
- **Points d'attention / bugs connus** :
  - Aucun bug connu ; vérification visuelle interactive à faire dans le navigateur (`1-Seek/index.html`).

### Passation #10 — 2026-11-23
- **Assistant sortant** : Gemini
- **Travail effectué** :
  - Implémentation de la **tâche 7** (`1-Seek/soundEngine.js`, `1-Seek/index.html`, `1-Seek/sketch.js`, `1-Seek/style.css`) :
    - Création de `SoundEngine` (API native Web Audio, 1 classe/fichier, sans fichier audio externe) avec déverrouillage automatique sur interaction utilisateur (`mousePressed` / `keyPressed` / bouton audio).
    - **Effet de mort / explosion spatialisé G/D** (`playTargetDeath`) via `StereoPannerNode` (`pan` calculé depuis `x / width`), combinant un bruit blanc filtré (explosion/éclatement) et un oscillateur `sawtooth` en chute rapide (agonie adaptée au rayon de la cible).
    - **Musique contextuelle adaptative** (`updateMusic` / `playMusicStep` / `playWaveStart`) : boucle synthwave / arcade en Ré mineur (kick, basse `sawtooth` filtrée bien audible sur haut-parleurs d'ordinateur, arpège stéréo et hi-hat en poursuite) passant par un `DynamicsCompressorNode`. Le tempo (96 → 168 BPM), la brillance du filtre et la densité rythmique évoluent dynamiquement selon le nombre de cibles restantes, les poursuites/fuites actives et le numéro de vague (+ arpège de nouvelle vague).
    - Ajout dans le panneau de la section **Audio (Web Audio)** avec le bouton **Musique / Sons ON/OFF** et le curseur **Volume** (`0..100`, défaut `60`).
    - Mise en cache de `desiredTargetCount` pour éviter toute lecture DOM dans `draw()`.
  - Passage de la tâche 7 à `[DONE]` dans `1-Seek/1-Specification.md`, vérification syntaxique (`node --check`) et mise à jour de `README.md` (`./scripts/update-readme.sh` + changelog).
- **Fichiers créés / modifiés** :
  - `1-Seek/soundEngine.js` (nouveau)
  - `1-Seek/index.html`
  - `1-Seek/sketch.js`
  - `1-Seek/style.css`
  - `1-Seek/1-Specification.md`
  - `README.md`
  - `HANDOFF.md`
- **Prochaines étapes** :
  - Toutes les tâches spécifiées dans `1-Seek/1-Specification.md` (Tâches 1 à 7) sont `[DONE]`. En attente de nouvelles tâches pour `1-Seek` ou passage au prochain sketch.
- **Points d'attention / bugs connus** :
  - L'audio Web Audio démarre dès la première interaction (clic ou touche) conformément à la politique autoplay des navigateurs.
