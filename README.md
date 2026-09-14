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

Sans SMTP configuré, PocketBase ne peut envoyer aucun email : ni la confirmation de
réservation au client, ni la notification à la prestataire, ni l'alerte à l'équipe
GlowNyo à l'inscription d'une prestataire, ni l'email d'activation. La migration
`apps/pocketbase/pb_migrations/1789403173_configure_smtp.js` configure PocketBase pour
envoyer via le relais SMTP de [Brevo](https://www.brevo.com) — il suffit de lui fournir
les identifiants ci-dessous.

**Sur Brevo :**

1. Créez un compte sur [app.brevo.com](https://app.brevo.com) (l'offre gratuite suffit
   pour démarrer — 300 emails/jour).
2. **Validez l'adresse d'expédition.** Menu **Expéditeurs, domaines et dédicace** →
   onglet **Expéditeurs** → ajoutez l'adresse que GlowNyo utilisera pour envoyer ses
   emails (ex. `no-reply@glownyo.app` ou, à défaut de domaine, une adresse Gmail que vous
   contrôlez) → confirmez via le lien reçu par email. **Sans cette étape, Brevo refuse
   tous les envois.** Si vous avez un nom de domaine, faites plutôt la vérification du
   domaine entier (même menu, onglet **Domaines**) pour une meilleure délivrabilité —
   quelques enregistrements DNS (SPF/DKIM) à ajouter chez votre registrar.
3. **Récupérez vos identifiants SMTP.** Cliquez sur votre nom (en haut à droite) →
   **SMTP & API** → onglet **SMTP**. Vous y trouvez :
   - le **login SMTP** (généralement votre adresse email de compte Brevo),
   - une clé SMTP existante, ou un bouton **Générer une nouvelle clé SMTP** — copiez-la
     immédiatement, elle ne sera plus jamais affichée en entier.

**Dans le projet :**

4. Copiez `apps/pocketbase/.env.example` en `apps/pocketbase/.env` et renseignez :
   ```
   BREVO_SMTP_LOGIN=<le login SMTP copié à l'étape 3>
   BREVO_SMTP_KEY=<la clé SMTP copiée à l'étape 3>
   EMAIL_SENDER_ADDRESS=<l'adresse validée à l'étape 2>
   EMAIL_SENDER_NAME=GlowNyo
   ```
5. Lancez (ou relancez) PocketBase — `npm run dev --prefix apps/pocketbase` en local.
   La migration s'applique automatiquement au démarrage et active le SMTP. Si l'une des
   trois variables manque, elle laisse le SMTP désactivé (pas d'envoi à moitié configuré)
   et l'affiche dans les logs de PocketBase.
6. **En production**, définissez ces mêmes variables (`BREVO_SMTP_LOGIN`,
   `BREVO_SMTP_KEY`, `EMAIL_SENDER_ADDRESS`, `EMAIL_SENDER_NAME`) dans les variables
   d'environnement de votre hébergeur pour le processus PocketBase — jamais dans un
   fichier committé.
7. **Testez.** Faites une réservation de bout en bout sur `/reservation` avec une
   adresse email que vous consultez : vous devez recevoir l'email de confirmation, et la
   prestataire choisie doit recevoir la notification. En cas d'échec, l'onglet **Logs**
   de l'admin PocketBase (`/_/`) affiche la raison exacte renvoyée par Brevo (expéditeur
   non vérifié, identifiants invalides, etc.).

## Scripts

- `npm run dev` — lance les trois apps en parallèle
- `npm run build` — build de production de `apps/web`
- `npm run lint` — lint de `apps/web` et `apps/api`
