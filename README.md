# Glownyo.app

Application de réservation beauté GlowNyo — la plateforme afro-moderne qui connecte les
clients aux meilleures prestataires beauté & bien-être au Bénin et en Afrique.

> Rayonne de l'intérieur, brille de l'extérieur.

## Structure du monorepo

```
apps/
  web/         React + Vite + Tailwind — le site public (accueil, prestataires,
               réservation, à propos, contact, espace client/prestataire, admin)
  api/         Express — paiement Mobile Money (FedaPay), disponibilité des
               créneaux, gestion des demandes prestataires
  pocketbase/  Base de données, authentification et emails transactionnels
               (pb_hooks / pb_migrations)
```

## Design

- Fond noir `#0A0A0A`, or `#C9922A`, texte crème `#F5F0E6`
- Titres en **Playfair Display**, texte courant en **Montserrat**
- Mobile-first, bouton WhatsApp flottant sur toutes les pages

## Démarrage

```bash
npm install
npm run dev   # lance web (http://localhost:3000), api (:3001) et pocketbase (:8090)
```

Chaque app lit ses variables d'environnement depuis un fichier `.env` — copiez le
`.env.example` correspondant :

- `apps/web/.env.example` → `apps/web/.env` (optionnel — utile seulement pour pointer
  vers une PocketBase/API sur un domaine séparé)
- `apps/api/.env.example` → `apps/api/.env`

Le binaire PocketBase n'est pas versionné : `npm install` le télécharge automatiquement
pour votre plateforme (`apps/pocketbase/scripts/download-pocketbase.js`).

## Scripts

- `npm run dev` — lance les trois apps en parallèle
- `npm run build` — build de production de `apps/web`
- `npm run lint` — lint de `apps/web` et `apps/api`
