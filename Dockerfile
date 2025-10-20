# Dockerfile para Railway - Backend msgSYSTEC
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar e instalar shared primeiro
COPY shared/package*.json ./shared/
WORKDIR /app/shared
RUN npm install

# Copiar código do shared
COPY shared/ ./
RUN npm run build

# Voltar para diretório raiz
WORKDIR /app

# Copiar e instalar backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copiar código do backend
COPY backend/ ./
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]
