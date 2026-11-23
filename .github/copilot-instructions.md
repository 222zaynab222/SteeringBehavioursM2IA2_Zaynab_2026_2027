# Instructions GitHub Copilot

Ce dépôt regroupe des applications **p5.js** utilisant les **Steering Behaviors** de Craig Reynolds (GDC 1999).

## Références obligatoires
- Architecture & règles strictes : [ARCHITECTURE.md](../ARCHITECTURE.md)
- Bonnes pratiques p5.js : [P5JS_BEST_PRACTICES.md](../P5JS_BEST_PRACTICES.md)
- Passation entre assistants IA : [HANDOFF.md](../HANDOFF.md)
- Vue d'ensemble : [README.md](../README.md)

## Règles de codage
1. **Une classe maximum par fichier** (sauf classe interne).
2. **Tout élément graphique animé ou potentiellement mobile** (y compris les obstacles) doit être une instance de `Vehicle` (`vehicle.js`) ou d'une **sous-classe de `Vehicle`** et utiliser les steering behaviors.
3. **Tout objet spécialisé** (joueur, ennemi, vaisseau spatial, score animé, missile, etc.) doit être une **sous-classe de `Vehicle`**.
4. Les méthodes de steering (`seek`, `flee`, `arrive`, `pursue`, `evade`, `wander`, `avoid`, `separate`, `cohesion`, `align`, `follow`, `boundaries`, etc.) retournent un `p5.Vector` sans muter `acc` directement ; `applyBehaviors()` orchestre les forces via `applyForce()`.
5. Respecter les bonnes pratiques p5.js : `push()`/`pop()` dans `show()`, `magSq()` dans les boucles critiques, cache DOM dans `setup()`, `p5.disableFriendlyErrors = true` si besoin de performance.

## Mise à jour automatique
- Mettre à jour `README.md` (table des sketches + journal) à chaque évolution du projet (ou exécuter `./scripts/update-readme.sh`).
- Mettre à jour `HANDOFF.md` en fin de session pour permettre un transfert fluide vers un autre assistant IA.
