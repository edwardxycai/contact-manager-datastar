# =========================
# 1️⃣ Build & Test stage
# =========================
FROM node:22-bullseye AS build

WORKDIR /usr/src/app

# ---- Install deps (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# ---- Install Playwright browsers
RUN npx playwright install --with-deps

# ---- Copy app source
COPY public ./public
COPY routes ./routes
COPY views ./views
COPY tests ./tests
COPY app.js .
COPY server.js .
COPY jest.config.js .
COPY playwright.config.mjs .

# ---- Run tests
RUN npm test
RUN npx playwright test


# =========================
# 2️⃣ Runtime stage (LEAN)
# =========================
FROM node:22-bullseye

WORKDIR /usr/src/app

# ---- Create non-root user
RUN useradd -m appuser

# ---- Copy only what is needed to run
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/routes ./routes
COPY --from=build /usr/src/app/views ./views
COPY --from=build /usr/src/app/app.js .
COPY --from=build /usr/src/app/server.js .

USER appuser

EXPOSE 3000
CMD ["node", "server.js"]

