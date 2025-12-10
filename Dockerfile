FROM node:20-alpine as runner
WORKDIR /app

# Healthcheck and non-root
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
USER node