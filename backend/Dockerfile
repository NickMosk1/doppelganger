# backend/Dockerfile (упрощенная версия)
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Копируем pom.xml и скачиваем зависимости
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Копируем исходный код и собираем
COPY src src
RUN mvn clean package -DskipTests

# Запуск
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Копируем jar файл
COPY --from=build /app/target/*.jar app.jar

# Открываем порт
EXPOSE 8080

# Запускаем
ENTRYPOINT ["java", "-jar", "app.jar"]