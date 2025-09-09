# Multi-stage build for Railway deployment
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-openjdk-21-slim as backend-build
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/mvnw ./
COPY backend/.mvn ./.mvn
RUN chmod +x mvnw
COPY backend/src ./src
RUN ./mvnw clean package -DskipTests

FROM openjdk:21-jre-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=frontend-build /app/dist ./static
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
