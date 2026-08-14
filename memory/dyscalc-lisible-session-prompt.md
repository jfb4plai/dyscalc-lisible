# DyscalcLisible — session prompt

## Objectif pédagogique

Réduire la charge de lecture/repérage d'un énoncé mathématique pour un élève dyscalculique (ou en difficulté de lecture d'énoncé), **sans jamais changer les nombres ni la difficulté mathématique posée**. L'outil reformate visuellement l'énoncé (découpage, séparation données/question, repères de quantité) — il ne résout rien, ne simplifie aucune valeur.

**Public cible** : enseignants FWB fondamental/secondaire ayant des élèves dyscalculiques ou en difficulté de compréhension d'énoncé mathématique. Décalage identifié : les outils d'accessibilité maths existants ciblent le supérieur anglophone ; rien d'ancré FWB fondamental/secondaire, contrairement à la dyslexie déjà bien couverte (FALC, simplif-écrit).

**Garde-fou non négociable, à afficher explicitement dans l'UI** : l'outil ne modifie jamais une valeur numérique, une unité ou une opération. Si ce garde-fou est retiré, l'outil change de nature (deviendrait un solveur, ce qu'il ne doit jamais être).

## Ancrage RISS (déjà validé le 2026-08-14 — ne pas re-vérifier, juste citer)

- Le Cam & Toussaint (2017, `dumas-01549091`) — la première difficulté réside dans la *compréhension de l'énoncé*, distincte du raisonnement mathématique lui-même.
- Boiteault & Percheminier (2022, `dumas-03993984`) — une relecture/schématisation de l'énoncé réduit la surcharge cognitive.

Toute référence scientifique **supplémentaire** ajoutée en cours de développement doit être revérifiée via `mcp__RISS__search_articles` avant d'être écrite dans le code ou affichée dans l'app — ces deux-ci sont déjà validées, les autres non.

## 4 principes PLAI — non négociables

1. **Inclusion réelle** : bénéfice direct à l'élève dyscalculique, pas seulement un gain de temps enseignant.
2. **IA = amplificateur** : Claude Haiku reformate/découpe visuellement l'énoncé collé par l'enseignant — ne génère jamais un énoncé de zéro, ne modifie jamais le contenu mathématique. Résultat affiché dans une zone éditable avant tout usage (split 80/20).
3. **RISS = validation obligatoire** pour toute nouvelle référence scientifique ajoutée.
4. **Ancrage territorial FWB** : formulations, exemples et référentiels alignés sur le fondamental/secondaire FWB, pas de transposition brute d'un outil anglophone.

## Logigramme / parcours utilisateur

1. Enseignant colle un énoncé mathématique réel (texte brut, copié depuis son support de cours).
2. Renseigne : niveau (fondamental/secondaire + année), matière/type de problème (optionnel, aide au découpage).
3. Claude Haiku propose un reformatage visuel : découpage en unités de sens, séparation visuelle données/question, repères de quantité — **affiché dans une zone éditable**, jamais appliqué directement.
4. Enseignant relit, ajuste manuellement le découpage si besoin (79/20), valide.
5. Export/impression du support reformaté (PDF ou vue imprimable), à côté de l'énoncé original (jamais remplacé, toujours consultable).

## Champs — obligatoires vs optionnels

| Champ | Obligatoire | Rôle / impact |
|---|---|---|
| Énoncé original | Oui | Texte source à reformater. Placeholder avec exemple réel FWB. |
| Niveau (fondamental/secondaire + année) | Oui | Calibre la densité du découpage (plus fin en fondamental). |
| Type de problème (addition, partage, comparaison...) | Non | Aide Haiku à mieux repérer les unités de sens ; laissé vide = découpage générique. |
| Élève concerné | Non | Si renseigné, reste en mémoire locale du navigateur uniquement — **aucune donnée élève stockée en base au MVP**, cohérent avec le risque RGPD faible visé. |

Chaque champ doit avoir un texte d'aide sous le champ expliquant son impact sur le résultat, conformément à la règle PLAI de guidage contextuel obligatoire.

## Stack et pipeline

- Workspace local : `C:\Users\jfbeg\OneDrive\claude-workspace\dyscalc-lisible\` (déjà créé)
- Repo GitHub : `jfb4plai/dyscalc-lisible`, branche `main`, créé dès le début
- Déploiement : Vercel, sous-domaine `dyscalc-lisible.jfb4plai.com`
- **Pas de Supabase au MVP** — aucune donnée élève stockée nécessite une base ; si un compte enseignant est ajouté plus tard, réutiliser le projet partagé `dfoaumjleqtxjeaplnna` et la table `profiles` existante, tables nouvelles préfixées `dyscalc_`
- IA : Claude Haiku (`claude-haiku-4-5-20251001`) via Vercel Serverless Function (`/api/reformater.js`), clé `ANTHROPIC_API_KEY` côté serveur uniquement — tester avec `vercel dev`, jamais `vite dev` seul
- React 18 + Vite 5 + Tailwind v3, CSS partagé PLAI (`shared/css/plai-style.css` à copier), logo `/plai-logo.jpg`, police Inter, teal `#0a9370` / orange `#f97316`

## Checklist post-build

- [ ] Garde-fou "jamais de modification numérique" vérifiable dans le code du prompt Haiku ET visible dans l'UI
- [ ] Résultat IA toujours dans une zone éditable avant impression/export (split 80/20)
- [ ] Aucune clé API exposée frontend, aucun `console.log` avec contenu utilisateur
- [ ] `npx vite build` passe sans erreur avant tout push
- [ ] Accessibilité : police ≥16px, contraste suffisant, guidage contextuel sur chaque champ
- [ ] Fiche portail à rédiger en précisant explicitement ce que l'outil ne fait pas (ne résout pas l'exercice, ne remplace pas un accompagnement dyscalculie complet)
