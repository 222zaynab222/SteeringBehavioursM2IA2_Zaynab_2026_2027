# AGENTS.md — Instructions pour agents IA (Codex & agents autonomes)

Ce dépôt contient des applications **p5.js** basées sur les **Steering Behaviors** de Craig Reynolds (GDC 1999).

## Contexte obligatoire
Avant d'écrire ou de modifier du code, lire :
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Règles d'architecture et catalogue des steering behaviors
- [P5JS_BEST_PRACTICES.md](./P5JS_BEST_PRACTICES.md) — Optimisation et conventions p5.js
- [HANDOFF.md](./HANDOFF.md) — État courant et historique de passation

## Règles non négociables
1. **1 classe maximum par fichier** (sauf classe interne).
2. **Tout élément graphique animé ou potentiellement mobile** (y compris les obstacles, cibles, bonus) doit être un `Vehicle` ou une **sous-classe de `Vehicle`** (`extends Vehicle`) et utiliser les steering behaviors.
3. **Tout objet spécialisé** (joueur, ennemi, vaisseau spatial, score animé, missile, etc.) doit hériter de `Vehicle`.
4. **Comportements purs** : chaque comportement retourne une force `p5.Vector` bornée par `maxForce` ; l'application effective passe par `applyBehaviors()` → `applyForce()` → `update()`.
5. **Performance p5.js** : encapsuler `show()` avec `push()`/`pop()`, éviter `dist()` et `p5.Vector.copy()` dans les boucles $O(n^2)$ (utiliser `magSq()` / distances au carré), mettre en cache les appels DOM dans `setup()`.

## Mise à jour automatique obligatoire
- Mettre à jour [README.md](./README.md) après chaque ajout ou modification significative de sketch ou de classe (et/ou lancer `./scripts/update-readme.sh`).
- Mettre à jour [HANDOFF.md](./HANDOFF.md) avant de terminer la session.
