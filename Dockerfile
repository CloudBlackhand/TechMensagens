# Dockerfile para Railway - Backend msgSYSTEC
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar package.json do workspace
COPY package.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build do shared primeiro
WORKDIR /app/shared
RUN npm run build

# Build do backend
WORKDIR /app/backend
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando de inicialização
WORKDIR /app/backend
CMD ["npm", "start"]
