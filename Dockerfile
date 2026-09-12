FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl and bash for clean downloading and running
RUN apk add --no-cache curl bash

# Download stable Waterfall (BungeeCord fork with better performance and low latency)
RUN curl -o Waterfall.jar https://api.purpurmc.org/v2/purpur/1.20.4/latest/download || \
    curl -o Waterfall.jar https://download.geysermc.org/v2/projects/waterfall/versions/1.20/builds/latest/downloads/waterfall

# Create directories for plugins and configuration
RUN mkdir -p plugins

# Expose Render's default web service port
EXPOSE 10000

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/bin/bash", "/app/start.sh"]
