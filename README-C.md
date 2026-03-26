## 專案快速啟動

### (一).使用 Docker
```bash
* 啟動 Rancher Desktop

// 特性	start 指令 / restart 指令
// 對象	啟動尚未執行的容器 / 強制重新建立所有容器
* npm run start
* npm run restart

~前端：打開 
http://localhost:3000

~後端：打開 
http://localhost:8080/healthcheck
```

### (二).本機開發（不使用 Docker）
```bash
# 1. 啟動資料庫容器
docker compose up postgres -d

# 2. 修改 .env 中的 DB_HOST
# DB_HOST=localhost
# 然後個複製一份 到frontend/backend 資料夾裡面

# 3. 安裝後端依賴
cd ..
cd backend
npm install

# 4. 啟動後端開發伺服器
npm run dev

# 5. 另開終端機，啟動前端開發伺服器
cd ..
cd frontend
npm install
npm run dev

~前端：打開 
http://localhost:5173

~後端：打開 
http://localhost:8080/healthcheck
```


### (三).測試資料
```jsx
// 測試文件
https://hackmd.io/@hexschool/r1-WgwPLbl#Part-2

~ 測試資料
// 王小明 學員
USER
wXlTq@hexschooltest.io
Aa12345678

// 李燕容 教練
COACH
lee2000@hexschooltest.io	
Aa12345678
```

## 藍新金流

### (一).藍新金流 + ngrok
```jsx
// # === 藍新金流設定 ===
// NEWEBPAY_MERCHANT_ID=你的商店代號
// NEWEBPAY_HASH_KEY=你的HashKey
// NEWEBPAY_HASH_IV=你的HashIV
// NEWEBPAY_VERSION=2.0
// NEWEBPAY_PAY_GATEWAY=https://ccore.newebpay.com/MPG/mpg_gateway
// NEWEBPAY_NOTIFY_URL=https://你的ngrok-domain/api/newebpay/notify
// NEWEBPAY_RETURN_URL=https://你的ngrok-domain/api/newebpay/return
// FRONTEND_URL=http://localhost:3000

// ~金流文件
https://hackmd.io/HYBMkvilRlWKrnFD7cGfrA

~啟動 ngrok 指令
// 確保 Docker 已啟動（backend 跑在 port 8080），然後開另一個終端機執行：
// ngrok http --url=你的domain名稱 8080
// ngrok 執行後不要關閉這個終端機視窗，它需要一直開著。
ngrok http --url=unparceled-lashay-unmotile.ngrok-free.dev 8080
```

### (二).測試卡號
| 項目 | 填入內容 |
|------|---------|
| 卡號 | `4000-2211-1111-1111` |
| 有效期限 | 任意未來日期，例如 `12/30` |
| 背面末三碼 | `222` |
| 持卡人姓名 | 隨意填，例如 `TEST` |
| 持卡人電話 | 隨意填，例如 `0912345678` |
| 付款人信箱 | 隨意填 |


### (三).金流功能-前端檔案

| 檔案 | 用途 |
|------|------|
| `frontend/src/api/order.js` | 呼叫後端的「建立訂單」API |
| `frontend/src/pages/public/FitnessPlans.vue` | 健身方案頁面，點擊「選擇方案」後會建立訂單並跳轉到藍新付款 |
| `frontend/src/pages/public/PaymentResult.vue` | 付款結果頁面，顯示「付款成功」或「付款失敗」 |
| `frontend/src/router/index.js` | 註冊 `/payment-result` 這個頁面路徑 |


### (四).金流功能-後端檔案

| 檔案 | 用途 |
|------|------|
| `backend/config/newebpay.js` | 讀取 `.env` 裡的藍新金流設定（商店代號、金鑰等），讓其他檔案可以方便取用 |
| `backend/entities/Order.js` | 定義「訂單」的資料結構（有哪些欄位、跟哪些資料表有關聯），讓資料庫自動建立對應的表 |
| `backend/utils/newebpayEncrypt.js` | 負責加密和解密：送給藍新的資料需要加密，藍新回傳的資料需要解密 |
| `backend/controllers/order.js` | 處理三件事：①建立訂單 ②收到藍新的付款通知 ③把使用者導回前端 |
| `backend/routes/order.js` | 定義「建立訂單」的 API 路徑，並要求使用者先登入 |
| `backend/routes/newebpay.js` | 定義藍新「通知」和「導回」的 API 路徑（這兩個不需要登入，因為是藍新伺服器呼叫的） |


## DB指令

### (一).驗證資料庫
```jsx
// 開啟DBeaver 連線資料庫test

// 訂單課程
SELECT * FROM "CREDIT_PACKAGE";

// 我的訂單
SELECT * FROM "CREDIT_PURCHASE";

// 註冊使用者
SELECT * FROM "USER";

// 藍新訂單狀態（應該看到 payment_status = paid）
SELECT merchant_order_no, amount, payment_status, payment_type FROM "ORDER";
```

## 部署環境

### (一).部署到正式環境時
```jsx
部署時**程式碼不需要改**，只要調整 `.env`：

| 要改的項目 | 怎麼改 |
|-----------|--------|
| `NEWEBPAY_PAY_GATEWAY` | `ccore.newebpay.com` 改成 `core.newebpay.com` |
| `NEWEBPAY_MERCHANT_ID` | 換成正式環境的商店代號 |
| `NEWEBPAY_HASH_KEY` | 換成正式環境的 HashKey |
| `NEWEBPAY_HASH_IV` | 換成正式環境的 HashIV |
| `NEWEBPAY_NOTIFY_URL` | ngrok 網址改成你的正式伺服器網址 |
| `NEWEBPAY_RETURN_URL` | ngrok 網址改成你的正式伺服器網址 |
| `FRONTEND_URL` | `localhost:3000` 改成正式前端網址 |

> 正式環境有自己的網域，藍新可以直接連到你的伺服器，不再需要 ngrok。
> 正式環境的金鑰要到 https://www.newebpay.com/ （注意是 `www` 不是 `cwww`）重新申請。
```


## 補充資料

### (一).後端檔案,先看這2個簡單的了解API運作流程
```jsx
遊戲連結: https://hexschool.github.io/backend-camp-game/
第9天 後端CRUD

skill
---
backend/routes/skill.js
backend/controllers/skill.js

admin
---
backend/routes/admin.js
backend/controllers/admin.js
```

### (二).修改Entity檔案
```jsx
# 初始化資料庫結構（同步 TypeORM Entity 到資料庫）
npm run init:schema
---

你改 Entity（程式碼）
        ↓
npm run init:schema
        ↓
TypeORM 連到資料庫
        ↓
直接 CREATE / ALTER TABLE
        ↓
資料庫本身「被改了」
```
