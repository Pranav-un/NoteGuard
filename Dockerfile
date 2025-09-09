FROM node:18-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM openjdk:21-jdk-slim as backend
WORKDIR /app
COPY backend/ ./
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM openjdk:21-jre-slim
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
COPY --from=frontend /app/frontend/dist /app/static
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
