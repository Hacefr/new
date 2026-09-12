FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install bash, curl, and socat
RUN apk add --no-cache curl bash socat

RUN curl -fsSL -o Waterfall.jar https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar || \
    curl -fsSL -o Waterfall.jar https://download.geysermc.org/v2/projects/waterfall/versions/1.20/builds/latest/downloads/waterfall

COPY . /app

RUN chmod +x /app/start.sh

EXPOSE 10000

CMD ["/bin/bash", "/app/start.sh"]
