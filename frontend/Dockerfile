# =========================
# Étape 1 : Build Angular
# =========================
FROM node:20 AS build
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Désactiver la vérification SSL pour npm (résout UNABLE_TO_GET_ISSUER_CERT_LOCALLY)
RUN npm config set strict-ssl false

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Construire l'application Angular en production
RUN npx ng build --configuration production

# =========================
# Étape 2 : Serveur NGINX
# =========================
FROM --platform=linux/amd64 nginx:alpine

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier votre configuration Nginx personnalisée (WebSocket compatible)
COPY nginx.conf /etc/nginx/conf.d/

# Copier le build Angular depuis l'étape précédente
COPY --from=build /app/dist/book-management-frontend /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Lancer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]