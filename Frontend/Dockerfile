# Use official Node.js image for building
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb ./
COPY . .

RUN npm install --frozen-lockfile || bun install --frozen-lockfile
RUN npm run build || bun run build

# Use nginx to serve the built static files
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .
COPY public /usr/share/nginx/html

# Add custom nginx config for SPA fallback
COPY public/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
