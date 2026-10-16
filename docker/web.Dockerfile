# ---------- Stage 1: build the static bundle ----------
FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /workspace/app

# Install dependencies first so they form their own cached layer.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build

# ---------- Stage 2: serve the bundle with nginx ----------
FROM nginxinc/nginx-unprivileged:stable-alpine

RUN printf '%s\n' \
    'server {' \
    '    listen 8080;' \
    '    root /usr/share/nginx/html;' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '    # Generated per container, so browsers must not cache it across config changes.' \
    '    location = /config.js {' \
    '        add_header Cache-Control "no-store";' \
    '    }' \
    '}' > /etc/nginx/conf.d/default.conf

# Owned by nginx so the startup script below can overwrite config.js.
COPY --from=build --chown=nginx:nginx /workspace/app/dist /usr/share/nginx/html

# The nginx entrypoint runs this at container start, writing /config.js from the container's
# environment so one image can point at any backend. API_URL must be reachable from the browser.
COPY --chmod=755 <<'SCRIPT' /docker-entrypoint.d/40-web-config.sh
#!/bin/sh
set -eu
api_url=$(printf '%s' "${API_URL:-}" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf 'window.__APP_CONFIG__ = { apiUrl: "%s" }\n' "$api_url" > /usr/share/nginx/html/config.js
SCRIPT

EXPOSE 8080