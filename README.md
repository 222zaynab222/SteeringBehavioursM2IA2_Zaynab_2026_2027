# Steering Behaviors — Applications p5.js (M2 IA2 Marrakech 2026–2027)

Ensemble d'applications et d'exercices interactifs en **p5.js** mettant en œuvre les **Steering Behaviors** de **Craig W. Reynolds** (*Steering Behaviors For Autonomous Characters*, GDC 1999).

---

## Documentation du projet

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Principes d'architecture (`Vehicle`, héritage, 1 classe/fichier, catalogue des comportements de Craig Reynolds)
- [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md) — Bonnes pratiques de codage et d'optimisation p5.js
- [HANDOFF.md](./HANDOFF.md) — Journal de passation entre assistants IA et checklist de reprise
- Instructions IA : [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) · [GEMINI.md](./GEMINI.md) · [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

## Règles clés de développement

1. **Une classe maximum par fichier** (sauf classe interne).
2. **Tout élément graphique animé (ou potentiellement mobile) est un `Vehicle`** (`vehicle.js`) ou une **sous-classe de `Vehicle`** (`class Foo extends Vehicle`) et se déplace via les steering behaviors (`applyForce` + `update`).
3. **Même les éléments fixes susceptibles de se déplacer** (obstacles, cibles, bonus, etc.) héritent de `Vehicle`.
4. **Mise à jour continue** : ce `README.md` doit être mis à jour automatiquement à chaque ajout, modification ou suppression de sketch ou de classe (par l'assistant IA ou via `./scripts/update-readme.sh`).

---

## Inventaire des sketches et modules

<!-- AUTO-GENERATED:SKETCHES:START -->
| Dossier | Description | Fichiers principaux |
| --- | --- | --- |
| `1-Seek/` | Comportement de base **Seek** & **Flee** vers une cible | `sketch.js`, `soundEngine.js`, `target.js`, `targetFragment.js`, `test.js`, `vehicle.js` |
| `2-PursueEvade/` | Comportements **Pursuit** & **Evasion** avec cible mobile | `bouncingBall.js`, `sketch.js`, `target.js`, `vehicle.js` |
| `2-PursueEvade_correction/` | Correction de **Pursuit** & **Evasion** | `bouncingBall.js`, `sketch.js`, `target.js`, `vehicle.js` |
| `3-Arrival/` | Comportement **Arrival** avec zone de freinage | `sketch.js`, `vehicle.js` |
| `3-Arrival_correction/` | Correction **Arrival** + démonstrations `Snake` / `SnakeWander` | `sketch.js`, `snake.js`, `snakeWander.js`, `vehicle.js` |
| `4-Wander/` | Comportement **Wander** avec traînée et sprite | `sketch.js`, `vehicle.js` |
<!-- AUTO-GENERATED:SKETCHES:END -->

---

## Lancer un sketch en local

Ouvrir le dossier du sketch souhaité avec l'extension **Live Server** de VS Code, ou démarrer un serveur HTTP local à la racine du dépôt :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/1-Seek/` (ou le dossier de votre choix) dans le navigateur.

---

## Journal des évolutions récentes

<!-- AUTO-GENERATED:CHANGELOG:START -->
- **2026-11-23** : Implémentation de la tâche 7 de `1-Seek` : moteur audio natif Web Audio (`SoundEngine`) avec spatialisation stéréo G/D (`StereoPannerNode`), explosion/agonie à la mort d'une cible, pulsation grave périodique s'accélérant quand le nombre de cibles diminue, curseur `Volume` et bouton `Musique / Sons ON/OFF`.
- **2026-11-23** : Ajout des vagues progressives dans `1-Seek` : lorsque toutes les cibles sont éliminées, recréation automatique du nombre défini par le curseur avec vitesse max (`+15 %`/vague) et accélération (`+10 %`/vague) renforcées, et affichage du numéro de vague dans le HUD.
- **2026-11-23** : Ajout de l'éclatement en 8 parts de camembert (`TargetFragment extends Vehicle`, animation 0,3 s) dans `1-Seek` : dans le scénario 3, une cible touchée éclate et meurt définitivement sans réapparaître.
- **2026-11-23** : Implémentation de la tâche 6 de `1-Seek` : endurance des cibles (2 s de fuite / 1 s de régénération + barre visuelle), points de vie initiaux (`5..10` affichés au centre, `-1` par contact, mort à `0`), boost ×3 des vaisseaux en poursuite et compteur de cibles en haut à droite.
- **2026-11-23** : Implémentation de la tâche 5 de `1-Seek` : menu déroulant de scénarios (1 : souris, 2 : patrouille aléatoire 4 s + chasse aux cibles, 3 : fuite temporaire des cibles), cercle de détection des cibles (`100` px, debug) et boost de `maxSpeed`/`maxForce` jusqu'à `300` px avec curseurs dédiés.
- **2026-11-23** : Implémentation de la tâche 4 de `1-Seek` : cercle de détection des vaisseaux (`150` px, curseur `20..200`, visible en debug), `seek` vers la cible la plus proche, réapparition aléatoire au contact (`< 5` px) et nombre de cibles par défaut passé à `1`.
- **2026-11-23** : Implémentation de la tâche 3 de `1-Seek` : cibles mobiles (`Target` héritant de `Vehicle`) avec vitesse aléatoire dans `[-7, 7]`, couleur claire, rayon `10..100`, rebond sur les bords et curseur `Nombre de cibles` (`0..20`).
- **2026-11-23** : Implémentation de la tâche 2 de `1-Seek` : dégradé radial arc-en-ciel animé suivant la souris et ses 5 curseurs de paramétrage (rayon, vitesse d'animation, opacité, nombre d'anneaux, décalage des couleurs).
- **2026-11-23** : Implémentation de la tâche 1 de `1-Seek` : panneau de contrôle repliable, paramètres multi-vaisseaux et mode debug synchronisé avec la touche `D`.
- **2026-11-23** : Mise en place de l'architecture complète (`ARCHITECTURE.md`, `P5JS_BEST_PRACTICES.md`, `HANDOFF.md`), des fichiers d'instructions IA (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`) et du script de mise à jour `scripts/update-readme.sh`.
<!-- AUTO-GENERATED:CHANGELOG:END -->
