# 2025 Backend Camp - 健身房管理系統

全端健身房管理系統，包含會員管理、教練管理、課程預約、訂單管理等功能。採用前後端分離架構，使用 Docker Compose 進行容器化部署。

## 專案架構

```
2025-backend-camp/
├── backend/              # 後端 API 服務 (Node.js + Express + TypeORM)
├── frontend/             # 前端應用 (Vue 3 + Vite + Tailwind CSS)
├── docker-compose.yml    # Docker Compose 配置
├── .env                  # 環境變數配置（需自行建立）
├── .env.example          # 環境變數範例
└── package.json          # 根目錄專案腳本
```

## 技術

### 後端
- **框架**: Express.js
- **資料庫**: PostgreSQL 16.4
- **ORM**: TypeORM
- **認證**: JWT (JSON Web Token)
- **檔案儲存**: Firebase Storage
- **日誌**: Pino
- **測試**: Jest

### 前端
- **框架**: Vue 3
- **建構工具**: Vite
- **路由**: Vue Router
- **狀態管理**: Pinia
- **UI 樣式**: Tailwind CSS 4
- **圖表**: ECharts
- **HTTP 客戶端**: Axios

### 基礎設施
- **容器化**: Docker & Docker Compose
- **資料庫**: PostgreSQL (Alpine Linux)
- **Node 版本**: 24 (Alpine)

## 環境需求

- Node.js 18+ (本地開發)
- Docker & Docker Compose (容器化部署)
- Git

## 快速開始

### 1. 複製專案

```bash
git clone https://github.com/toManyCat/2025-backend-camp.git
cd 2025-backend-camp
```

### 2. 設定環境變數

複製 `.env.example` 並建立 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，設定必要的環境變數（詳見下方「環境變數說明」）。

### 3. 啟動專案

使用根目錄的 npm 腳本啟動所有服務（包含資料庫、後端、前端）：

```bash
npm start
```

### 4. 存取應用

- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:8080
- **API 健康檢查**: http://localhost:8080/healthcheck
- **PostgreSQL**: localhost:5432

## 環境變數說明

`.env` 檔案包含以下配置項目：

### PostgreSQL 容器設定

```bash
POSTGRES_USER=testHexschool          # PostgreSQL 使用者名稱
POSTGRES_PASSWORD=pgStartkit4test    # PostgreSQL 密碼
POSTGRES_DB=test                     # 資料庫名稱
```

### 前端 API 連結設定

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080/api/  # 前端 API 基礎 URL
```

### API 伺服器設定

```bash
# 資料庫連線設定
DB_HOST=postgres                     # 容器內使用 'postgres'，本機開發使用 'localhost'
DB_PORT=5432                         # 資料庫連接埠
DB_USERNAME=testHexschool            # 資料庫使用者（需與 POSTGRES_USER 一致）
DB_PASSWORD=pgStartkit4test          # 資料庫密碼（需與 POSTGRES_PASSWORD 一致）
DB_DATABASE=test                     # 資料庫名稱（需與 POSTGRES_DB 一致）
DB_SYNCHRONIZE=true                  # TypeORM 自動同步資料表結構（生產環境請設為 false）
DB_ENABLE_SSL=false                  # 是否啟用 SSL 連線

# 伺服器設定
PORT=8080                            # API 服務連接埠
LOG_LEVEL=debug                      # 日誌等級 (debug/info/warn/error)

# JWT 認證設定
JWT_EXPIRES_DAY=30d                  # Token 有效期限
JWT_SECRET=hexschool666              # JWT 簽章密鑰（生產環境請使用強密碼）

# Firebase 設定（選用，目前未使用）
FIREBASE_STORAGE_BUCKET=''           # Firebase Storage Bucket 名稱
FIREBASE_SERVICE_ACCOUNT=''          # Firebase Service Account JSON 內容
```

### 重要提醒

```
如果你不是用 Docker 跑後端，而是直接在電腦上啟動（例如 npm run dev）：
Docker 環境中
DB_HOST 通常會是 container 名稱（例如 db、postgres）
但在本機直接跑時
👉 後端程式只能透過 localhost 才能連到你電腦上的資料庫
```

- **本機開發**: 若要在本機直接執行後端服務（非 Docker），需將 `DB_HOST` 改為 `localhost`
- **安全性**: 生產環境務必修改 `JWT_SECRET` 和所有預設密碼
- **資料庫同步**: 生產環境請將 `DB_SYNCHRONIZE` 設為 `false`，使用 migration 管理資料表結構
- **Firebase**: 目前專案已移除 Firebase 功能，相關變數可保留空值

## NPM 腳本指令

### 根目錄腳本 (Docker Compose)

在專案根目錄執行以下指令來管理整個應用容器：

```bash
# 啟動所有服務（資料庫、後端、前端）
npm start
# 等同於: docker compose --env-file .env up -d --build

# 重新建置並強制重啟所有容器
npm run restart
# 等同於: docker compose --env-file .env up --force-recreate --build -d

# 停止所有服務（保留資料）
npm run stop
# 等同於: docker compose --env-file .env stop

# 清除所有容器和資料（包含 Volume）
npm run clean
# 等同於: docker compose --env-file .env down -v
```

### 後端腳本 (backend/)

進入 `backend/` 目錄執行：

```bash
cd backend

# 本機開發模式（需先設定環境變數）
npm run dev

# 執行所有測試
npm test

# 執行單元測試（含覆蓋率報告）
npm run test:unit

# 執行整合測試（含覆蓋率報告）
npm run test:integration

# 初始化資料庫結構（同步 TypeORM Entity 到資料庫）
npm run init:schema
```

### 前端腳本 (frontend/)

進入 `frontend/` 目錄執行：

```bash
cd frontend

# 啟動開發伺服器（支援熱重載）
npm run dev

# 建置生產版本
npm run build

# 預覽生產建置結果
npm run preview
```

## 常見使用情境

### 情境 1: 第一次啟動專案

```bash
# 1. 複製環境變數範例
cp .env.example .env

# 2. 編輯 .env（根據需求調整設定）
vim .env

# 3. 啟動所有服務
npm start

# 4. 等待容器啟動完成（約 20-30 秒）
# 前端: http://localhost:3000
# 後端: http://localhost:8080
```

### 情境 2: 開發時修改了程式碼

```bash
# Docker 容器會自動偵測變更並重新建置
# 若需要完整重新建置：
npm run restart
```

### 情境 3: 資料庫結構有變更

```bash
# 方法 1: 清除資料庫並重新建立（資料會遺失）
npm run clean
npm start

# 方法 2: 使用 TypeORM 同步（需進入後端容器）
docker compose exec backend npm run init:schema
```

### 情境 4: 只想重啟特定服務

```bash
# 重啟後端服務
docker compose restart backend

# 重啟前端服務
docker compose restart frontend

# 重啟資料庫（會中斷連線）
docker compose restart postgres
```

### 情境 5: 查看服務日誌

```bash
# 查看所有服務日誌
docker compose logs -f

# 查看特定服務日誌
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 情境 6: 進入容器內部

```bash
# 進入後端容器
docker compose exec backend sh

# 進入資料庫容器
docker compose exec postgres sh

# 在資料庫容器內連線 PostgreSQL
docker compose exec postgres psql -U testHexschool -d test
```

### 情境 7: 本機開發（不使用 Docker）

```bash
# 1. 啟動資料庫容器
docker compose up postgres -d

# 2. 修改 .env 中的 DB_HOST
# DB_HOST=localhost

# 3. 安裝後端依賴
cd backend
npm install

# 4. 啟動後端開發伺服器
npm run dev

# 5. 另開終端機，啟動前端開發伺服器
cd ../frontend
npm install
npm run dev
```

## 資料庫管理

### 初始化資料庫結構

```bash
# 使用 TypeORM 同步 Entity 到資料庫
docker compose exec backend npm run init:schema
```

### 直接連線資料庫

```bash
# 使用 psql 連線
# 進入 postgres 容器，打開 test 資料庫，使用 testHexschool 帳號操作
# cli介面...=.= 
# docker compose exec	在已經啟動的容器裡 執行命令
# postgres	目標容器名稱（docker-compose.yml 裡的服務名）
# psql	PostgreSQL 提供的 CLI 工具，用來操作資料庫
# -U testHexschool	指定使用者名稱，這裡是 testHexschool
# -d test	指定要連的資料庫名稱，這裡是 test
docker compose exec postgres psql -U testHexschool -d test

# 或使用圖形化工具GUI（如 DBeaver、pgAdmin）
# Host: localhost
# Port: 5432
# Database: test
# Username: testHexschool
# Password: pgStartkit4test
```

### 備份與還原

```bash
# 備份資料庫
docker compose exec postgres pg_dump -U testHexschool test > backup.sql

# 還原資料庫
docker compose exec -T postgres psql -U testHexschool test < backup.sql
```

## 測試

### 執行後端測試

```bash
cd backend

# 執行所有測試
npm test

# 執行單元測試
npm run test:unit

# 執行整合測試（需要資料庫連線）
npm run test:integration
```

## 故障排除

### 問題 1: 容器啟動失敗

```bash
# 查看詳細錯誤訊息
docker compose logs

# 清除所有容器和資料重新啟動
npm run clean
npm start
```

### 問題 2: 連接埠被佔用

```bash
# 檢查連接埠使用情況
lsof -i :3000  # 前端
lsof -i :8080  # 後端
lsof -i :5432  # 資料庫

# 修改 .env 中的 PORT 設定
```

### 問題 3: 資料庫連線失敗

```bash
# 檢查資料庫容器狀態
docker compose ps postgres

# 查看資料庫日誌
docker compose logs postgres

# 確認環境變數設定正確
# DB_USERNAME, DB_PASSWORD, DB_DATABASE 需與 POSTGRES_* 一致
```

### 問題 4: npm ci 安裝失敗

```bash
# 確保 .dockerignore 已排除 node_modules
# 清除並重新建置
npm run clean
npm start
```

## 專案結構細節

### 後端結構

```
backend/
├── bin/                 # 啟動腳本
├── controllers/         # 控制器層
├── db/                  # 資料庫配置
│   └── data-source.js   # TypeORM 資料源配置
├── routes/              # 路由定義
├── test/                # 測試檔案
│   ├── unit/            # 單元測試
│   └── integration/     # 整合測試
├── Dockerfile           # Docker 建置檔
├── .dockerignore        # Docker 忽略檔案
└── package.json         # 依賴與腳本
```

### 前端結構

```
frontend/
├── src/
│   ├── components/      # Vue 元件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 狀態管理
│   ├── views/           # 頁面元件
│   └── App.vue          # 根元件
├── public/              # 靜態資源
├── Dockerfile           # Docker 建置檔
├── .dockerignore        # Docker 忽略檔
└── package.json         # 依賴與腳本
```

## 部署建議

### Docker Compose 生產部署

1. 修改 `.env` 中的安全設定
2. 設定 `DB_SYNCHRONIZE=false`
3. 使用強密碼和安全的 `JWT_SECRET`
4. 考慮使用反向代理（Nginx）
5. 設定 HTTPS 憑證
6. 定期備份資料庫

### 環境變數安全

- 不要將 `.env` 檔案提交到版控
- 使用環境變數管理工具（如 Vault）
- 定期更換密鑰和密碼
- 限制資料庫連線來源

## 授權

ISC
