FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install bash, curl, and nodejs
RUN apk add --no-cache curl bash nodejs

# Download official Waterfall 1.20 (Build 556 LTS) directly from PaperMC
RUN curl -fsSL -o Waterfall.jar "https://api.papermc.io/v2/projects/waterfall/versions/1.20/builds/556/downloads/waterfall-1.20-556.jar"

COPY . /app

RUN chmod +x /app/start.sh

EXPOSE 10000

CMD ["/bin/bash", "/app/start.sh"]
