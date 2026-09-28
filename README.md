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
- `apps/pocketbase/.env.example` → `apps/pocketbase/.env`

Le binaire PocketBase n'est pas versionné : `npm install` le télécharge automatiquement
pour votre plateforme (`apps/pocketbase/scripts/download-pocketbase.js`).

## Configurer les emails (Brevo)

Sans Brevo configuré, PocketBase ne peut envoyer aucun email : ni la confirmation de
réservation au client, ni la notification à la prestataire, ni l'alerte à l'équipe
GlowNyo à l'inscription d'une prestataire, ni l'email d'activation. Le hook
`apps/pocketbase/pb_hooks/brevo-mailer.pb.js` envoie tous les emails sortants via
l'[API transactionnelle de Brevo](https://www.brevo.com) — il suffit de lui fournir une
clé API. (Une clé SMTP fonctionne aussi comme alternative, voir l'encart à l'étape 3.)

**Sur Brevo :**

1. Créez un compte sur [app.brevo.com](https://app.brevo.com) (l'offre gratuite suffit
   pour démarrer — 300 emails/jour).
2. **Authentifiez le domaine `glownyo.app`** (recommandé — GlowNyo le possède déjà chez
   Hostinger). Menu **Expéditeurs, domaine, IP** → onglet **Domaines** → **Ajouter un
   domaine** → `glownyo.app`. Brevo affiche 3-4 enregistrements DNS (un TXT
   d'authentification/SPF, un ou deux CNAME pour DKIM). Sur Hostinger : **hPanel** →
   **Domaines** → `glownyo.app` → **DNS / Registre DNS** → **Ajouter un enregistrement**,
   et recopiez chaque ligne (type, nom, valeur) exactement telle qu'affichée par Brevo.
   La propagation est généralement rapide chez Hostinger (quelques minutes à quelques
   heures) ; revenez sur Brevo et cliquez **Vérifier** une fois les enregistrements
   ajoutés. Ajoutez aussi l'enregistrement DMARC que Brevo recommande à cette étape (TXT
   sur `_dmarc.glownyo.app`) pour lever complètement l'avertissement de conformité
   Google/Yahoo/Microsoft.
   Une fois le domaine authentifié, ajoutez l'expéditeur (onglet **Expéditeurs**) —
   par exemple `no-reply@glownyo.app` ou `reservations@glownyo.app`.

   > ⚠️ Vous pouvez aussi démarrer avec une adresse Gmail/Outlook déjà vérifiée : ça
   > fonctionne pour envoyer, mais Brevo ne peut pas y poser de DKIM/DMARC (domaine
   > "freemail" que vous ne contrôlez pas), d'où l'avertissement de conformité et un
   > risque de spam plus élevé. Utile pour tester vite, mais basculez sur `glownyo.app`
   > dès que possible.
3. **Récupérez votre clé API.** Cliquez sur votre nom (en haut à droite) → **SMTP & API**
   → onglet **Clés API** → **Générer une nouvelle clé API** (ou copiez une clé
   existante, préfixée `xkeysib-...`) — copiez-la immédiatement, elle ne sera plus jamais
   affichée en entier.

   > Une **clé API** (`xkeysib-...`, onglet **Clés API**) et une **clé SMTP** (onglet
   > **SMTP**) sont deux identifiants différents chez Brevo. Le hook
   > `brevo-mailer.pb.js` n'utilise que la clé API. Si `BREVO_API_KEY` n'est pas
   > définie, PocketBase se rabat automatiquement sur le relais SMTP configuré par
   > `pb_migrations/1789403173_configure_smtp.js` (qui, lui, a besoin de la clé SMTP) —
   > les deux chemins ne sont donc pas exclusifs, la clé API est juste le plus simple des
   > deux à mettre en place.

**Dans le projet :**

4. Copiez `apps/pocketbase/.env.example` en `apps/pocketbase/.env` et renseignez :
   ```
   BREVO_API_KEY=<la clé API copiée à l'étape 3>
   EMAIL_SENDER_ADDRESS=<l'adresse validée à l'étape 2>
   EMAIL_SENDER_NAME=GlowNyo
   ```
5. Lancez (ou relancez) PocketBase — `npm run dev --prefix apps/pocketbase` en local.
   Dès que `BREVO_API_KEY` et `EMAIL_SENDER_ADDRESS` sont présents, tous les emails
   sortants passent par l'API Brevo.
6. **En production**, définissez ces mêmes variables (`BREVO_API_KEY`,
   `EMAIL_SENDER_ADDRESS`, `EMAIL_SENDER_NAME`) dans les variables d'environnement de
   votre hébergeur pour le processus PocketBase — jamais dans un fichier committé. Une
   clé API qui a circulé ailleurs (chat, email, capture d'écran...) doit être régénérée
   sur Brevo avant la mise en production.
7. **Testez.** Faites une réservation de bout en bout sur `/reservation` avec une
   adresse email que vous consultez : vous devez recevoir l'email de confirmation, et la
   prestataire choisie doit recevoir la notification. En cas d'échec, l'onglet **Logs**
   de l'admin PocketBase (`/_/`) affiche la raison exacte renvoyée par Brevo (expéditeur
   non vérifié, clé invalide, etc.).

## Scripts

- `npm run dev` — lance les trois apps en parallèle
- `npm run build` — build de production de `apps/web`
- `npm run lint` — lint de `apps/web` et `apps/api`
