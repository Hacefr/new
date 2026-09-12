FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install bash, curl, and nodejs
RUN apk add --no-cache curl bash nodejs

# Download official Waterfall 1.20 from GeyserMC mirror
RUN curl -fsSL -o Waterfall.jar "https://download.geysermc.org/v2/projects/waterfall/versions/1.20/builds/latest/downloads/waterfall"

COPY . /app

RUN chmod +x /app/start.sh

EXPOSE 10000

CMD ["/bin/bash", "/app/start.sh"]
