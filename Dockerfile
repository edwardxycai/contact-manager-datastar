# =========================
# 1️⃣ Build & Test stage
# =========================
FROM mcr.microsoft.com AS build

WORKDIR /usr/src/app

# 利用快取安裝依賴
COPY package*.json ./
RUN npm ci

# 複製所有檔案進行測試
COPY public ./public
COPY routes ./routes
COPY views ./views
COPY tests ./tests
COPY app.js .
COPY server.js .
COPY jest.config.js .
COPY playwright.config.mjs .

# 執行測試 (若失敗會停止構建)
RUN npm test
# 注意：確保 playwright.config 有設置 headless: true
RUN npx playwright test

# =========================
# 2️⃣ Runtime stage (更精簡)
# =========================
FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /usr/src/app

# 建立非 root 帳號並修正權限
RUN groupadd -r appgroup && useradd -r -g appgroup appuser && \
    chown -R appuser:appgroup /usr/src/app

# 只複製生產環境需要的檔案
COPY --from=build --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /usr/src/app/public ./public
COPY --from=build --chown=appuser:appgroup /usr/src/app/routes ./routes
COPY --from=build --chown=appuser:appgroup /usr/src/app/views ./views
COPY --from=build --chown=appuser:appgroup /usr/src/app/app.js .
COPY --from=build --chown=appuser:appgroup /usr/src/app/server.js .
COPY --from=build --chown=appuser:appgroup /usr/src/app/package.json .

USER appuser

EXPOSE 3000
# 使用 dumb-init 可優化訊號處理 (選配)
CMD ["node", "server.js"]
