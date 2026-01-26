# =========================
# 1️⃣ Build & Test stage
# =========================
FROM node:22-bullseye AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npx playwright install

COPY public ./public
COPY routes ./routes
COPY views ./views
COPY tests ./tests
COPY app.js .
COPY server.js .
COPY jest.config.js .

RUN npm test
RUN npx playwright test
 

# =========================
# 2️⃣ Runtime stage
# =========================
FROM node:22-bullseye

WORKDIR /usr/src/app

COPY --from=build /usr/src/app /usr/src/app

EXPOSE 3000

CMD ["node", "server.js"]
