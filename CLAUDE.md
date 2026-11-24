# CLAUDE.md — Instructions pour Claude Code

Ce projet regroupe des applications **p5.js** utilisant les **Steering Behaviors** de Craig Reynolds (GDC 1999).

## Lectures obligatoires au démarrage
1. [ARCHITECTURE.md](./ARCHITECTURE.md)
2. [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md)
3. [HANDOFF.md](./HANDOFF.md)

## Règles impératives de code
- **Une classe maximum par fichier** (sauf classe interne strictement locale). Nom du fichier en `camelCase` correspondant à la classe (`player.js` → `class Player`).
- **Tout élément graphique animé est un `Vehicle`** (instance de `Vehicle` dans `vehicle.js` ou sous-classe `extends Vehicle`) et se déplace exclusivement via les **steering behaviors** (`applyForce()` + `update()`).
- **Même les éléments fixes susceptibles de se déplacer** (obstacles, cibles, bonus, murs mobiles) doivent être des `Vehicle` (ou sous-classes de `Vehicle`).
- **Tout objet spécialisé** (joueur, ennemi, vaisseau spatial, score animé, missile, particule, etc.) doit être une **sous-classe de `Vehicle`**.
- Les méthodes de comportements (`seek`, `flee`, `arrive`, `pursue`, `evade`, `wander`, `avoid`, `separate`, `cohesion`, `align`, etc.) retournent un `p5.Vector` (force limitée à `maxForce`) ; `applyBehaviors()` les combine et appelle `applyForce()`.
- Respecter les bonnes pratiques p5.js (`push()`/`pop()`, éviter les allocations inutiles de vecteurs dans les boucles critiques, `magSq()` au lieu de `dist()`, charger les scripts dans le bon ordre dans `index.html`).

## Maintenance automatique de la documentation
- **À chaque création ou modification** de sketch, classe ou fonctionnalité : mettre à jour [README.md](./README.md) (table des sketches + journal des évolutions) ou exécuter `./scripts/update-readme.sh`.
- **En fin de tâche / session** : ajouter une entrée datée dans [HANDOFF.md](./HANDOFF.md) pour faciliter le relais vers un autre assistant IA.
