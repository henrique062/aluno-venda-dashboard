
# Imagem base Node.js
FROM node:20-slim AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de configuração
COPY package.json package-lock.json ./

# Instala dependências
RUN npm ci

# Copia o código-fonte
COPY . .

# Compila o projeto para produção
RUN npm run build

# Imagem para produção
FROM node:20-slim AS production

WORKDIR /app

# Instala somente o servidor serve para servir a aplicação estática
RUN npm install -g serve

# Copia arquivos da build
COPY --from=build /app/dist ./dist

# Expõe a porta 8080
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["serve", "-s", "dist", "-l", "8080"]

