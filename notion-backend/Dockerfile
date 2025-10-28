FROM node:18-alpine
WORKDIR /app
COPY package.json ./
# COPY package-lock.json* ./
# RUN npm install
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]



# FROM node:18-alpine
# WORKDIR /app

# # 安裝依賴
# COPY package.json package-lock.json* ./
# RUN npm install --legacy-peer-deps

# # 複製所有檔案並 build
# COPY . .
# # RUN npm run build

# # 使用 serve 提供 build 靜態檔
# RUN npm install -g serve

# EXPOSE 4000
# CMD ["serve", "-s", "build", "-l", "4000"]




