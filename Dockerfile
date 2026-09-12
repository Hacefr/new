FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install bash and curl for downloads
RUN apk add --no-cache curl bash

# Download stable high-performance BungeeCord / Waterfall core
RUN curl -fsSL -o Waterfall.jar https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar || \
    curl -fsSL -o Waterfall.jar https://download.geysermc.org/v2/projects/waterfall/versions/1.20/builds/latest/downloads/waterfall

# Copy all project files and plugins from your repository into the container
COPY . /app

# Ensure startup script is executable
RUN chmod +x /app/start.sh

# Expose Render's default web service port
EXPOSE 10000

# Start the gateway proxy
CMD ["/bin/bash", "/app/start.sh"]
