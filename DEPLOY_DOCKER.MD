# 🚀 Déploiement de l’application Next.js sur un VPS avec Docker

Ce guide explique **pas à pas** comment installer et déployer ton projet **MécaniPro** (ou tout autre template similaire) sur un **serveur VPS Linux** avec **Docker**.

> ✅ Compatible avec Ubuntu, Debian et toutes les distributions Linux récentes.

---

## 🧩 1️⃣ Prérequis

Avant de commencer, assure-toi d’avoir :

- Un **VPS** (ex : Hostinger, OVH, Scaleway, etc.)
- Un accès SSH root ou utilisateur avec `sudo`
- Git installé (pour cloner ton projet)
- Docker installé sur le serveur

---

## ⚙️ 2️⃣ Installation de Docker

Sur ton VPS, exécute :

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable docker --now
```
Vérifie que Docker fonctionne :
```
sudo docker --version
```

## 3️⃣ Cloner le projet depuis GitHub

Connecte-toi à ton serveur et clone ton dépôt :
```
cd /opt
git clone https://github.com/toncompte/cam.git
cd cam
```
(Remplace l’URL par celle de ton dépôt GitHub)

## 4️⃣ Configuration des variables d’environnement
🧾 Étape 1 — Crée un fichier .env
Sur ton VPS, crée un fichier .env à la racine du projet :
```
nano .env
```

Copie le contenu de ton fichier .env.production sans guillemets autour des valeurs :
```
NEXT_PUBLIC_SITE_NAME=MécaniPro
NEXT_PUBLIC_SITE_DESCRIPTION=Service de réservation en ligne pour garages et mécaniciens à domicile.
NEXT_PUBLIC_SITE_URL=[site web]
NEXT_PUBLIC_SITE_PHONE=+33 6 ** ** ** **
NEXT_PUBLIC_SITE_ADDRESS[adresse]

NEXT_PUBLIC_RAYON_INTERVENTION=[rayon en km]
NEXT_PUBLIC_CITY=[Ville]

NEXT_PUBLIC_CAL_COM_URL=https://cal.com/****?theme=dark&layout=month_view&hideEventTypeDetails=false&embed=true&ui.color-scheme=dark
NEXT_PUBLIC_CAL_COM_USERNAME=****

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=[mail]
SMTP_PASS=tonMotDePasseSMTP
SMTP_FROM=Garage <mail>
CONTACT_RECEIVER=[mail]

NEXT_PUBLIC_TARIFS_IMAGE=https://res.cloudinary.com/dllpsk1gy/image/upload/v1759472084/tarifs_rhyk6q.png
NEXT_PUBLIC_TARIFS_LAST_UPDATE=octobre 2025
```
💡 Conseil : garde ton mot de passe SMTP seulement sur le VPS, ne le pousse jamais sur GitHub.

## ️ 5️⃣ Build de l’image Docker

Une fois ton .env prêt, build ton image :
```
docker build -t cam .
```
Cela crée une image Docker à partir du fichier Dockerfile situé à la racine du projet.
La première fois, le build peut prendre plusieurs minutes (installation + build Next.js).

## 🚀 6️⃣ Lancer le conteneur

Exécute ensuite ton application :
```
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name cam \
  cam
```

| Option             | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `-d`               | Lance le conteneur en arrière-plan                           |
| `-p 3000:3000`     | Expose le port 3000 du conteneur sur le port 3000 du serveur |
| `--env-file .env`  | Charge les variables d’environnement                         |
| `--name cam` | Nom du conteneur                                             |
| `cam`        | Nom de l’image (celle que tu viens de build)                 |

## 7️⃣ Vérifier que tout fonctionne

Liste les conteneurs actifs :
```
docker ps
```
Tu devrais voir :
```
CONTAINER ID   IMAGE       COMMAND                  STATUS         PORTS                    NAMES
b3e7a12f1c2a   cam   "docker-entrypoint.s…"   Up 2 minutes   0.0.0.0:3000->3000/tcp   cam
```
👉 Ton site est maintenant accessible via :
http://IP_DE_TON_VPS:3000

## 🧾 8️⃣ Voir les logs de ton conteneur

Pour suivre les logs (erreurs, mails envoyés, etc.) :
```
docker logs -f cam
```
Ctrl + C pour quitter.

##🔁 9️⃣ Mettre à jour le site
Quand tu veux déployer une nouvelle version (ex : après un git pull) :
```
docker stop cam
docker rm cam
docker build -t cam .
docker run -d -p 3000:3000 --env-file .env --name cam cam
```
✅ Le site est rebuild et relancé avec la nouvelle version.

##🔁 1️0️⃣ (Optionnel) Démarrage automatique après reboot
Pour que le site se relance automatiquement après redémarrage du VPS :
```
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --restart always \
  --name cam \
  cam
```

## #🧠 11️⃣ Commandes Docker utiles

```
# ---------------------------------------------------------------------------
# ⚙️ INSTALLATION DE DOCKER SUR LE VPS
# ---------------------------------------------------------------------------
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable docker --now
docker --version

# ---------------------------------------------------------------------------
# 📦 CLONER LE PROJET DEPUIS GITHUB
# ---------------------------------------------------------------------------
cd /opt
git clone https://github.com/toncompte/cam.git
cd cam

# ---------------------------------------------------------------------------
# 🔐 CONFIGURER LES VARIABLES D’ENVIRONNEMENT
# ---------------------------------------------------------------------------
cp .env.production .env
nano .env   # (vérifie / modifie si besoin les infos SMTP, Cal.com, etc.)

# ---------------------------------------------------------------------------
# 🏗️ BUILD DE L’IMAGE DOCKER
# ---------------------------------------------------------------------------
docker build -t cam .

# ---------------------------------------------------------------------------
# 🚀 LANCER LE CONTENEUR
# ---------------------------------------------------------------------------
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name cam \
  cam

# ---------------------------------------------------------------------------
# 🧠 COMMANDES DOCKER IMPORTANTES
# ---------------------------------------------------------------------------

# 📋 Lister les conteneurs actifs
docker ps

# 🔍 Voir tous les conteneurs (même arrêtés)
docker ps -a

# 📜 Voir les logs en temps réel
docker logs -f cam

# 🔎 Entrer dans le conteneur (mode shell)
docker exec -it cam sh

# ⛔ Stopper le conteneur
docker stop cam

# 🧹 Supprimer le conteneur
docker rm cam

# 🧱 Supprimer l’image Docker
docker rmi cam

# 🔄 Rebuild complet (code + image + relance)
docker stop cam && docker rm cam && docker build -t cam . && docker run -d -p 3000:3000 --env-file .env --name cam cam

# 🔁 Redémarrer un conteneur existant
docker restart cam

# 🚀 Démarrage automatique après reboot du VPS
docker run -d -p 3000:3000 --env-file .env --restart always --name cam cam

# 🧩 Nettoyer les images inutilisées (gain de place)
docker image prune -a

# 🔧 Vérifier les variables d’environnement dans le conteneur
docker exec -it cam printenv | grep SMTP

# 🧱 Vérifier les ports utilisés
sudo lsof -i -P -n | grep LISTEN

# 🔥 Supprimer tout Docker (⚠️ remet à zéro)
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker system prune -a --volumes -f

```











