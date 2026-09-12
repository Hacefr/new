FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install bash, curl, and nodejs
RUN apk add --no-cache curl bash nodejs npm

# Download official core
RUN curl -fsSL -o Waterfall.jar "https://ci.md-5.net/job/BungeeCord/lastSuccessfulBuild/artifact/bootstrap/target/BungeeCord.jar"

COPY package*.json ./
RUN npm install --production

COPY . /app

RUN chmod +x /app/start.sh

EXPOSE 10000

CMD ["/bin/bash", "/app/start.sh"]
