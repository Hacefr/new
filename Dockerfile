FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install bash and curl for Waterfall
RUN apk add --no-cache curl bash

# Download Waterfall proxy core
RUN curl -o Waterfall.jar https://api.purpurmc.org/v2/purpur/1.20.4/latest/download || \
    curl -o Waterfall.jar https://download.geysermc.org/v2/projects/waterfall/versions/1.20/builds/latest/downloads/waterfall

# Copy all configurations and the plugins folder from your repository
COPY . /app

RUN chmod +x /app/start.sh

EXPOSE 10000

CMD ["/bin/bash", "/app/start.sh"]
