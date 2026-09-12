FROM node:20-alpine

WORKDIR /app

# Install dependencies first for fast caching
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

EXPOSE 10000

CMD ["npm", "start"]
