# ==============================================================
# Legistra Frontend — Production Dockerfile
# ==============================================================
# Multi-stage: build the React app, then serve with nginx.
# ==============================================================

# ---- Stage 1: Build React app ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .

# The API proxy target inside the container network
ENV REACT_APP_API_URL=http://backend:5000

RUN npm run build

# ---- Stage 2: Serve with nginx ----
FROM nginx:stable-alpine

# Copy the React build output
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config to handle SPA routing + API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
