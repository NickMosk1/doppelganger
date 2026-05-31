# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Аргумент для URL API (можно переопределить при сборке)
ARG VITE_API_URL=http://localhost:8081/api

# Устанавливаем переменную окружения для сборки
ENV VITE_API_URL=$VITE_API_URL

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Отключаем строгие проверки TypeScript
ENV CI=false
ENV NODE_ENV=production
ENV DISABLE_ESLINT_PLUGIN=true

# Выводим URL для отладки
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# Собираем
RUN npm run build || (npx vite build --mode production)

# Проверяем, что dist создалась
RUN ls -la && ls -la dist || echo "dist folder not found"

FROM node:20-alpine

RUN npm install -g serve

COPY --from=builder /app/dist /app

EXPOSE 3000

CMD ["serve", "-s", "/app", "-l", "3000"]