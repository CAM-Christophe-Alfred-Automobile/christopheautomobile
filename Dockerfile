# -----------------------------------------------------------------------------
# 🏗️ ÉTAPE 1 — BUILD DE L'APPLICATION NEXT.JS
# -----------------------------------------------------------------------------
# On part d'une image officielle Node.js version 24 (Debian slim)
# → "slim" = plus légère et plus stable que l'image standard.
FROM node:24-slim AS builder

# On définit le dossier de travail à l'intérieur du conteneur.
# Toutes les commandes suivantes s'exécuteront depuis /app.
WORKDIR /app

# Active PNPM via Corepack (inclus dans Node 22+)
# Cela permet d’utiliser pnpm sans l’installer manuellement.
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie uniquement les fichiers nécessaires pour installer les dépendances.
# ⚡ Astuce : en copiant d'abord package.json et pnpm-lock.yaml,
# Docker met en cache les modules, donc les builds suivants seront plus rapides.
COPY package.json pnpm-lock.yaml* ./

# Installation des dépendances du projet
# --frozen-lockfile garantit que pnpm-lock.yaml est utilisé sans le modifier.
RUN pnpm install --frozen-lockfile

# ✅ On copie le fichier .env dans le conteneur
# (utile si Next.js doit lire les variables au moment du build)
COPY .env .env

# Copie du reste du code du projet (src, public, etc.)
COPY . .

# Lancement du build Next.js
# Cela compile le code TypeScript/React en version prête pour la production.
RUN pnpm run build


# -----------------------------------------------------------------------------
# 🚀 ÉTAPE 2 — CRÉATION DE L'IMAGE FINALE (RUNNER)
# -----------------------------------------------------------------------------
# Nouvelle image : toujours Node 24-slim
# → On repart d’une image propre, sans tous les fichiers du build précédent.
# Cela allège fortement l'image finale.
FROM node:24-slim AS runner

# On définit à nouveau le dossier de travail dans le conteneur.
WORKDIR /app

# On passe explicitement en mode production.
ENV NODE_ENV=production

# Copie uniquement les fichiers nécessaires depuis la première étape :
# - public : les images et fichiers statiques
# - .next : le build final de Next.js
# - package.json et pnpm-lock.yaml : pour relancer pnpm install
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Réactive PNPM dans cette nouvelle image
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installe uniquement les dépendances nécessaires à la production
# (pas de dépendances de dev, ni types, ni eslint, etc.)
RUN pnpm install --prod --frozen-lockfile

# Ouvre le port 3000 à l’extérieur du conteneur
# → C’est le port sur lequel Next.js écoute par défaut.
EXPOSE 3000

# Commande de démarrage du conteneur :
# Lance le serveur Next.js avec "pnpm start" (équivalent à "next start").
CMD ["pnpm", "start"]
