# Stage 1: Build the Vite app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# No API key needed at build time anymore — it lives on the server
RUN npm run build

# Stage 2: Run Express server
FROM node:20-alpine

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
