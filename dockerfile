# Wybór bazy obrazu (Eclipse Temurin JDK 21)
FROM eclipse-temurin:21-jdk as runtime

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie aplikacji
COPY target/*.jar app.jar

# Instalacja Pythona
RUN apt-get update && apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Uruchomienie aplikacji
CMD ["java", "-jar", "/app/app.jar"]