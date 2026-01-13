# =========================
# 1️⃣ Build & Test stage
# =========================
FROM node:22-bullseye AS build

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY public ./public
COPY routes ./routes
COPY views ./views
COPY app.js .
COPY server.js .
COPY jest.config.js .

# Run tests
RUN npm test


# =========================
# 2️⃣ Runtime stage
# =========================
FROM node:22-bullseye

WORKDIR /usr/src/app

# Copy only what is needed to run
COPY --from=build /usr/src/app /usr/src/app

EXPOSE 3000

# Start application
CMD ["node", "server.js"]

