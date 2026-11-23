# GEMINI.md — Instructions pour Gemini

Ce projet développe des applications **p5.js** fondées sur les **Steering Behaviors** de Craig Reynolds (GDC 1999).

## Fichiers de référence à consulter en priorité
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md)
- [HANDOFF.md](./HANDOFF.md)
- [README.md](./README.md)

## Directives d'implémentation
- **Une classe maximum par fichier** (sauf classe interne).
- **Modèle unique `Vehicle`** : chaque élément graphique animé, et même les éléments fixes pouvant bouger (obstacles, cibles, bonus), doit être un `Vehicle` ou hériter de `Vehicle` (`extends Vehicle`).
- **Spécialisation par héritage** : joueur, ennemi, vaisseau spatial, score animé, missile, etc. sont tous des sous-classes de `Vehicle` dans leur propre fichier.
- **Pipeline Steering** : calcul de force dans les méthodes de comportement (retour `p5.Vector`), combinaison dans `applyBehaviors()`, accumulation via `applyForce()`, intégration dans `update()`, rendu isolé par `push()`/`pop()` dans `show()`.
- **Bonnes pratiques p5.js** : suivre [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md).

## Règle de continuité
- Toujours mettre à jour [README.md](./README.md) (via `./scripts/update-readme.sh` + journal des évolutions) dès qu'un sketch ou une classe est ajouté/modifié.
- Toujours consigner l'état final dans [HANDOFF.md](./HANDOFF.md) pour le prochain assistant IA.
