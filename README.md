# DyscalcLisible

Reformate visuellement un énoncé mathématique pour un élève dyscalculique (ou en difficulté de lecture d'énoncé), sans jamais changer les nombres ni la difficulté mathématique posée.

Voir [memory/dyscalc-lisible-session-prompt.md](memory/dyscalc-lisible-session-prompt.md) pour le contexte pédagogique complet et l'ancrage RISS.

## Développement local

```bash
npm install
vercel dev
```

`vercel dev` est obligatoire pour tester `/api/reformater` (une simple `vite dev` ne fait pas tourner les fonctions serverless).

Variable d'environnement requise (Vercel > Settings > Environment Variables, jamais commitée) : `ANTHROPIC_API_KEY`.

## Build

```bash
npx vite build
```
