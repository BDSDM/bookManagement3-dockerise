📚 Book Management 3 – Application de Gestion de Livres Dockerisée

Book Management 3 est une application fullstack entièrement dockerisée (Angular + Spring Boot + MySQL) permettant de gérer un inventaire de livres, mais aussi les utilisateurs, leurs rôles et leurs accès.
Elle inclut une interface administrateur, une gestion avancée des cookies, ainsi qu’une expérience utilisateur optimisée.

Cette nouvelle version apporte plusieurs améliorations majeures :
➡️ Conserver le thème sélectionné (mode clair/sombre) et retourner automatiquement sur la dernière page consultée après authentification
➡️ Notifications en temps réel via WebSockets pour suivre les emprunts, retours et actions des utilisateurs

🚀 Fonctionnalités principales
🔐 Authentification sécurisée avec JWT

Connexion et gestion des sessions par jetons sécurisés

Accès différencié selon le rôle (ADMIN / USER)

🍪 Gestion avancée des cookies

Mémorisation automatique du thème sélectionné

Retour automatique sur la dernière page visitée après reconnexion

👥 Gestion des utilisateurs

CRUD complet des utilisateurs

Attribution et gestion des rôles : ADMIN / USER

📊 Tableau de bord administrateur

Vue globale sur les utilisateurs

Monitoring des livres et des informations associées

🛒 Gestion des livres

Ajouter, modifier ou supprimer un livre

Organisation par catégories

Détails complets sur chaque ouvrage

🔔 Notifications en temps réel (WebSockets)

Les administrateurs et utilisateurs reçoivent des alertes instantanées lors d’emprunts ou retours de livres

Interface réactive pour suivre les activités en direct

Notifications persistantes dans l’interface jusqu’à ce qu’elles soient marquées comme lues

🐳 Application fullstack conteneurisée avec Docker

Aucun prérequis complexe d’installation

Fonctionne sur n’importe quelle machine

🌍 Compatible multi-plateforme

Windows, Linux et macOS

⚙️ Installation & Lancement

Assurez-vous d'avoir Git et Docker Desktop installés.

🪟 Sous Windows (CMD / PowerShell)

Cette commande :
✔️ Stoppe et supprime les conteneurs utilisant les ports 3306 / 8080 / 4200
✔️ Clone le dépôt GitHub
✔️ Lance automatiquement l’application

```cmd
(for %P in (3306 8080 4200) do @for /f "tokens=1" %I in ('docker ps --format "{{.ID}} {{.Ports}}" ^| findstr ":%P"') do docker rm -f %I) & git clone https://github.com/BDSDM/bookManagement3-dockerise.git && cd bookManagement3-dockerise && docker compose --env-file app.env up -d
```

🐧 Sous Linux / macOS (bash / zsh)

```cmd
for P in 3306 8080 4200; do
  docker ps -q --filter "publish=$P" | xargs -r docker rm -f
done && \
git clone https://github.com/BDSDM/bookManagement3-dockerise.git && \
cd bookManagement3-dockerise && \
docker compose --env-file app.env up -d
```
