# 專案快速啟動

## 開發流程

### (一).使用 Docker
```jsx
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
```jsx
1. 啟動/刪除 各專案
// 全體專案 停止與刪除容器
docker compose down
// 全體專案 停止與刪除容器 / 資料Volume
docker compose down -v
// 全體專案 停止與刪除容器 / 資料Volume/ Image
docker compose down -v --rmi all

// 全體專案 啟動
docker compose up -d

// 查看目前運行狀態
docker-compose ps

// 單一服務 : 啟動與刪除
// --------------------------------------------
// 單一服務：刪除 (Delete)
// --------------------------------------------
// 刪除 [資料庫] (包含容器與 DB 資料 Volume)
docker compose stop postgres && docker compose rm -f postgres && docker volume rm 2025-backend-camp_pgData
// 刪除 [前端] 容器
docker compose stop frontend && docker compose rm -f frontend
// 刪除 [後端] 容器
docker compose stop backend && docker compose rm -f backend
//  --------------------------------------------
// 單一服務：啟動 (Start / Build)
// --------------------------------------------
// 啟動 [資料庫]
docker compose up postgres -d
// 啟動/更新 [前端] (加上 --build 確保程式碼更動有生效)
docker compose up frontend -d --build
// 啟動/更新 [後端] (加上 --build 確保程式碼更動有生效)
docker compose up backend -d --build

2. 修改 .env 中的 DB_HOST
// DB_HOST=localhost
// 然後個複製一份 到frontend/backend 資料夾裡面

3. 啟動後端開發伺服器
cd ..
cd backend
npm install
npm run dev

4. 另開終端機，啟動前端開發伺服器
cd ..
cd frontend
npm install
npm run dev

~前端：打開 
http://localhost:5173

~後端：打開 
http://localhost:8080/healthcheck

~API：skill
http://localhost:8080/api/coaches/skill

~藍新 終端打指令啟動
ngrok http --url=unparceled-lashay-unmotile.ngrok-free.dev 8080

~徹底砍掉舊資料庫與所有數據(包含前後端所有服務)
// 重置all +資料庫（刪volume）
docker compose down -v
// 啟動all +資料庫（背景執行）
docker compose up -d

~然後 資料庫用這2條就好
// 刪除 [資料庫]
docker compose stop postgres && docker compose rm -f postgres && docker volume rm 2025-backend-camp_pgData
// 啟動 [資料庫]
docker compose up postgres -d

5. 清空資料庫,就代表沒有註冊資訊,token會無效
   要去Cookie 刪掉 舊的token 頁面才會正常
setKeyFromCookie('token', data.token, exp)
```

### (三).測試資料
> 測試文件
```jsx
// 測試文件
https://hackmd.io/@hexschool/r1-WgwPLbl#Part-2

~ 測試資料
// 王小明 學員
// USER
信箱: wXlTq@hexschooltest.io
密碼: Aa12345678

// 李燕容 教練
// COACH
信箱: lee2000@hexschooltest.io	
密碼: Aa12345678
```

> 原本資料
```jsx
~ 測試資料 時間格式會有問題
// 每個表單時間
CREDIT_PACKAGE(課程方案)
// 這邊是用指令新增,所以吃本機台灣時間 UTC+8
created_at : 2026-08-14 13:21:34.647 : UTC+8

USER(使用者)
created_at : 2026-08-14 05:25:06.210 : UTC+0
updated_at : 2026-08-14 05:33:07.515 : UTC+0

SKILL(技能)
created_at : 2026-08-14 05:30:56.492 : UTC+0

COACH(教練)
created_at : 2026-08-14 05:33:07.562 : UTC+0
updated_at : 2026-08-14 05:33:07.562 : UTC+0

COACH_LINK_SKILL(未知)
// 不知道怎有資料...

COURSE(課程)
created_at : 2026-08-14 05:35:55.430 : UTC+0
updated_at : 2026-08-14 05:35:55.430 : UTC+0

COURSE_BOOKING(預約課程)
created_at : 2026-08-14 05:43:53.239 : UTC+0
bookingAt :  2026-08-14 05:43:53.239 : UTC+0

~ paid_at 和 purchaseAt 時間會變 UTC+8
ORDER(訂單)
created_at : 2026-08-14 05:37:29.419 : UTC+0
paid_at :    2026-08-14 13:38:18.522 : UTC+8

CREDIT_PURCHASE(購買紀錄)
created_at : 2026-08-14 05:38:18.570 : UTC+0
purchaseAt : 2026-08-14 13:38:18.569 : UTC+8

原因: timestamp 沒時區
// createdAt 資料庫自動生成 所以抓 UTC+0
// paid_at 和 purchaseAt 時間會變 UTC+8
主要原因是
type : `timestamp` 不能搭配 new Date().toISOString()
new Date().toISOString() 的行為：輸出標準 UTC 字串
（ 帶 Z 標記，例如 2026-08-14T01:20:36.503Z ）

PostgreSQL 會雞婆 看到 timestamp (無時區)
自動把 2026-08-14T01:20:36.503Z => 有時區Z
轉成UTC + 8
2026-08-14T01:20:36.503Z
              ↓
       + 8 小時
              ↓
2026-08-14 09:20:36.503
所以建議一律給 `timestamptz`
```

> 修正 timestamptz
```jsx
// 後來改正 `timestamptz`
// 時間都是 正確了

// 每個表單時間
CREDIT_PACKAGE(課程方案)
// 這邊是用指令新增,所以吃本機台灣時間 UTC+8
created_at : 2026-08-17 14:18:40.339 +0800 : UTC+8

USER(使用者)
created_at : 2026-08-17 14:20:17.089 +0800 : UTC+8
updated_at : 2026-08-17 14:22:40.294 +0800 : UTC+8

SKILL(技能)
created_at : 2026-08-17 14:22:06.915 +0800 : UTC+8

COACH(教練)
created_at : 2026-08-17 14:22:40.300 +0800 : UTC+8
updated_at : 2026-08-17 14:22:40.300 +0800 : UTC+8

COACH_LINK_SKILL(未知)
// 不知道怎有資料...

COURSE(課程)
created_at : 2026-08-17 14:24:26.027 +0800 : UTC+8
updated_at : 2026-08-17 14:24:26.027 +0800 : UTC+8

COURSE_BOOKING(預約課程)
created_at : 2026-08-17 14:26:09.208 +0800 : UTC+8
bookingAt :  2026-08-17 14:26:09.208 +0800 : UTC+8

ORDER(訂單)
created_at : 2026-08-17 14:25:00.076 +0800 : UTC+8
paid_at :    2026-08-17 14:25:39.667 +0800 : UTC+8

CREDIT_PURCHASE(購買紀錄)
created_at : 2026-08-17 14:25:39.671 +0800 : UTC+8
purchaseAt : 2026-08-17 14:25:39.671 +0800 : UTC+8
```

## 藍新金流

### (一).藍新金流 + ngrok
```jsx
// 安裝文件
// https://hackmd.io/swlhkvAWTc-0XD6Cn8IXpw?view#2ngrok

// 串接文件
// https://hackmd.io/HYBMkvilRlWKrnFD7cGfrA

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

~啟動指令: ngrok 指令 (啟動後 才可以連-藍新金流)
// 確保 Docker 已啟動（backend 跑在 port 8080），然後開另一個終端機執行：
// ngrok http --url=你的domain名稱 8080
// ngrok 執行後不要關閉這個終端機視窗，它需要一直開著。
ngrok http --url=unparceled-lashay-unmotile.ngrok-free.dev 8080
```

### (二).測試卡號
```jsx
| 項目 | 填入內容 |
|------|---------|
| 卡號 | `4000-2211-1111-1111` |
| 有效期限 | 任意未來日期，例如 `12/30` |
| 背面末三碼 | `222` |
| 持卡人姓名 | 隨意填，例如 `TEST` |
| 持卡人電話 | 隨意填，例如 `0912345678` |
| 付款人信箱 | 隨意填 `ooopp42@gmail.com` |
```

### (三).金流功能-前端檔案
```jsx
| 檔案 | 用途 |
|------|------|
| `frontend/src/api/order.js` | 呼叫後端的「建立訂單」API |
| `frontend/src/pages/public/FitnessPlans.vue` | 健身方案頁面，點擊「選擇方案」後會建立訂單並跳轉到藍新付款 |
| `frontend/src/pages/public/PaymentResult.vue` | 付款結果頁面，顯示「付款成功」或「付款失敗」 |
| `frontend/src/router/index.js` | 註冊 `/payment-result` 這個頁面路徑 |
```

### (四).金流功能-後端檔案
```jsx
| 檔案 | 用途 |
|------|------|
| `backend/config/newebpay.js` | 讀取 `.env` 裡的藍新金流設定（商店代號、金鑰等），讓其他檔案可以方便取用 |
| `backend/entities/Order.js` | 定義「訂單」的資料結構（有哪些欄位、跟哪些資料表有關聯），讓資料庫自動建立對應的表 |
| `backend/utils/newebpayEncrypt.js` | 負責加密和解密：送給藍新的資料需要加密，藍新回傳的資料需要解密 |
| `backend/controllers/order.js` | 處理三件事：①建立訂單 ②收到藍新的付款通知 ③把使用者導回前端 |
| `backend/routes/order.js` | 定義「建立訂單」的 API 路徑，並要求使用者先登入 |
| `backend/routes/newebpay.js` | 定義藍新「通知」和「導回」的 API 路徑（這兩個不需要登入，因為是藍新伺服器呼叫的） |
```

```jsx
第一階段：基礎設施（建立基本認知）
// ~backend/config/newebpay.js
// 原因：先看這個。你得知道這台機器連到哪裡（測試/正式環境）、商店代碼是什麼。這是所有邏輯的「燃料」。
// ~backend/entities/Order.js
// 原因：了解「訂單」長什麼樣子。有哪些狀態（待付款、已付款、失敗）？
// 這會決定你在後面 Controller 看到資料操作時的邏輯。


第二階段：核心黑盒子（理解加解密規則）
// ~backend/utils/newebpayEncrypt.js
// 原因：藍新的串接最難的就是 AES 加密與 SHA256 雜湊。先搞清楚資料是怎麼被封裝成 TradeInfo 的，
// 後面的流程你就只會把它當成一個「黑盒子工具」來呼叫。


第三階段：業務邏輯（看戲劇的主賽道）
// ~backend/controllers/order.js
// 原因：這是最重要的檔案。所有的「戲」都在這裡演。
// 建立訂單時如何呼叫 utils 加密。
// 收到藍新通知後如何更新資料庫（entities）。
// 成功後如何執行 redirect。


第四階段：對外門牌（確認進入點）
// ~backend/routes/newebpay.js
// 原因：看藍新伺服器會從哪個門進來（Notify / Return）。注意這裡通常會跳過 auth 中間件（Middleware），因為藍新伺服器沒有你的登入 Token。
// ~backend/routes/order.js
// 原因：最後看使用者怎麼發起結帳。因為這涉及權限控管（JWT 驗證等），放在最後確認安全機制。
```

## DB指令

### (一).驗證資料庫
```jsx
// 查詢當前連線 Session 所使用的時區
SHOW TIME ZONE

// 查詢 SKILL 表的時間，並同時對照「零時區」與「本地時區」
SELECT 
    created_at AT TIME ZONE 'UTC' AS real_utc_0_time,
    created_at AS local_utc_8_time
FROM "SKILL"

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

### (三).時間格式
> 時間格式
```jsx
2026 年 8 月 18 日 上午 9:20
// ==============================
// Timestamp  ( UTC+0 )
// ==============================
Date.now()
// 型別
number
// 範例
1787016000000（13 位數）毫秒

// 說明
// 自 1970-01-01T00:00:00.000Z (Unix Epoch)
// 起算經過的毫秒數

// ==============================
// Date Object
// ==============================
new Date()
// 型別
Date (object)
// 範例
Tue Aug 18 2026 09:20:00 GMT+0800 (台北標準時間)

// 說明
// JavaScript 原生日期物件
// 可進行日期計算、格式轉換等操作

// ==============================
// ISO 8601 ( UTC+0 )
// ==============================
new Date().toISOString()
// 型別
string
// 範例
"2026-08-18T01:20:00.000Z"

// 說明
// 國際標準日期時間格式
// Z = UTC 時區
// 常用於 API、JSON、資料庫儲存與傳輸
```

> 標準流程
```jsx
核心規範清單
1. DB Schema（資料庫設計）
* PostgreSQL：全專案時間欄位一律定義為 timestamptz（強制 UTC+0 儲存）。
* MongoDB：欄位型態一律使用原生 Date，Schema 開啟 { timestamps: true }。

2. Backend（後端寫入/邏輯）
* 建立與更新時間：一律傳入 JavaScript 原生 new Date() 物件。
* ⚠️ 禁止事項：寫入 ORM 時禁止手動傳入 new Date().toISOString() 字串，
  防止無時區欄位發生二次時區偏移。

3. API 傳輸層
* 統一格式：回傳給前端的時間欄位，一律序列化為標準 ISO 8601 UTC 字串
 （帶結尾 Z，例如 2026-08-14T08:12:47.000Z）。 => // UTC+0

4. Frontend（前端畫面渲染）
* 責任歸屬：前端拿到 UTC 字串後，僅在「渲染到 UI」時使用日期工具庫
 （如 Day.js）轉為使用者當前時區（如 UTC+8）顯示。
* 範例：dayjs(item.paidAt).format('YYYY-MM-DD HH:mm:ss')。

結論
---
API:網址
http://localhost:8080/api/coaches/skill

* 資料庫底層存儲（UTC+0）：2026-08-17 06:22:06.915
// 這邊 只是為了方便觀看UI 轉UTC+8 ( 資料庫還是 +0 )
* DBeaver（本地 UTC+8）：2026-08-17 14:22:06.915
* API 回傳（標準 ISO 8601 UTC+0）："2026-08-17T06:22:06.915Z"
```

> 資料庫差異
```jsx
假設台灣時間 9:20
09:20:36.503 +08:00


1. PostgreSQL (TypeORM / Prisma)
推薦全專案欄位統一改為 `timestamptz`

自動產生的 : createdAt: ( UTC+0 )

手動傳入的 : paid_at: new Date() ( Date 物件，代表 09:20:00 台灣這個時間點 )
            // Fri Aug 14 2026 09:20:49 GMT+0800 (台北標準時間) {}
            // ⚠️ Date 本身不保存台灣時區
            paid_at: new Date().toISOString() ( UTC+0 ISO 8601 )
            // 2026-08-14T01:20:00.000Z  => 有時區 UTC+0
          
// !地雷地方 : timestamp
// ❌ 09:20:00 (被誤補 +8 小時)
type : `timestamp` 不能搭配 new Date().toISOString()
new Date().toISOString() 會產生 2026-08-14T01:20:36.503Z 這邊都是對的
然後交給 PostgreSQL 遇到 timestamp (無時區)
PostgreSQL 需要把這個「帶有 UTC 時區的時間」塞進一個
沒有時區的 timestamp
所以會依 PostgreSQL session timezone 做轉換
Asia/Taipei 是 UTC + 8
所以 轉成UTC + 8
2026-08-14T01:20:36.503Z
              ↓
       + 8 小時
              ↓
2026-08-14 09:20:36.503
最後 timestamp 裡面只剩：
2026-08-14 09:20:36.503
// --------
寫入 : 轉成 UTC+0 時間 儲存
// 讀取時可根據 Session 時區自動轉換 (timezone)
// 如果連線時區是 Asia/Taipei（+08:00），
// PostgreSQL 就會把底層存的 UTC 時間加上 8 小時展示給你看
看UI : UTC+8 (方便給人看得)
讀出 : 維持 UTC+0


2. MongoDB (Mongoose)
欄位型態直接使用原生 Date
`timestamps: true`
{
  // 對應資料表名稱 ( 複數 + snake_case + 小寫 )
  collection: 'users',
  // 自動處理 createdAt, updatedAt
  timestamps: true,
},

自動產生的 : createdAt ( UTC+0 )
手動傳入的 : new Date() 或 ISO 字串皆可 ( UTC+0 )
// --------
轉成 UTC+0  儲存 (64-bit 毫秒整數)
寫入 : 轉成 UTC+0 時間 儲存
看UI : UTC+0 (方便給人看得)
讀出 : 維持 UTC+0 時間 給你


結論: 資料庫存同一個 保存時間點（Instant）
PostgreSQL：型態有分 
timestamp（無時區，易踩雷）
timestamptz（帶時區，推薦）。

MongoDB：沒有型態選擇問題，原生 Date / ISODate 
就是強制鎖定 UTC+0，設定 timestamps: true 即可直接符合標準規範。
// UTC+0
// 2026-08-14 01:20:00+00
// UTC+8
// 2026-08-14 09:20:00+08
// 這兩個：是同一個時間點（Instant）別糾結
```

> 各資料庫寫法
```jsx
2026/8/18 9:20分
---
* Date.now()：
// 1787016000000
* new Date()（以字串表示）：
// Tue Aug 18 2026 09:20:00 GMT+0800 (台北標準時間)
* new Date().toISOString()：
// 2026-08-18T01:20:00.000Z


// ==============================
// Mongose
// ==============================
Timestamp  =>  1787016000000 (毫秒-number)
----
export const orderSchema = new Schema<TOrder>(
  {
    // Timestamp  =>  1787016000000 (毫秒-number)
    // ----------
    // 💡 手動定義時間戳記欄位為 Number
    // 不交給 Mongoose 自動管理
    createdAt: {
      type: Number,
      required: true,
    },
    updatedAt: {
      type: Number,
      required: true,
    },
  },
  {
    // 自動處理 createdAt, updatedAt
    // 預設: true 會產生 格式: 2026-01-01T00:00:00.000Z
    // 💡 關鍵：關閉自動 timestamps，
    // 改由我們在假資料或業務邏輯中手動帶入
    timestamps: false,
  },
)
// type
export type TOrder = {
  // Timestamp  =>  1787016000000 (毫秒-number)
  // ----------
  createdAt: number
  updatedAt: number
}
// seed
export const mockOrders: TOrder[] = [
  {
    // Timestamp
    // Date.now() => 1787016000000 (毫秒-number)
    // --------
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]


// * 現在主流用這方式
ISO 8601 => "2026-06-12T06:08:46.000Z"
---
export const productSchema = new Schema<TProduct>(
  {
    // ISO 8601 => "2026-06-12T06:08:46.000Z"
    // ----------
    // 💡 註：在 Mongoose 中，底下的 timestamps: true
    // 會自動產生與維護 createdAt 和 updatedAt
    不需要寫
    // createdAt:
    // updatedAt:
  },
  {
    // 自動處理 createdAt, updatedAt
    // 預設: true 會產生 格式: 2026-01-01T00:00:00.000Z
    // 💡 關鍵：關閉自動 timestamps，
    // 改由我們在假資料或業務邏輯中手動帶入
    timestamps: true,
  },
)
// type
export type TProduct = {
  // ISO 8601
  // Date (object) => Fri Jun 12 2026 14:33:53 GMT+0800
  // 然後Mongoose 自己會再轉 2026-06-12T06:08:46.000Z
  // ----------
  createdAt: Date
  updatedAt: Date
}
// seed
export const mockProducts: TProduct[] = [
  {
    // ISO 8601
    // new Date() => Date (object)
    // 然後Mongoose 自己會再轉.toISOString()
    // => '2026-06-12T06:08:46.000Z' (string)
    // --------
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]


// ==============================
// Typeorm  Schema
// ==============================
Timestamp  =>  1787016000000 (毫秒-number)
----
// 自訂義函式
const bigintTransformer = {
  // bigint 透過 pg 驅動讀取時會回傳字串
  // 例如："1781248003298"
  // 使用 transformer 將字串轉成 number
  to: (value?: number) => value,
  from: (value: string) => Number(value),
}
columns: {
  createdAt: {
    type: 'bigint',
    transformer: bigintTransformer,
  },
  updatedAt: {
    type: 'bigint',
    transformer: bigintTransformer,
  },
},
// type
export type TProduct = {
  // Timestamp  =>  1787016000000 (毫秒-number)
  // ----------
  createdAt: number
  updatedAt: number
}
// seed
export const mockOrders: TOrder[] = [
  {
    // Timestamp
    // Date.now() => 1787016000000 (毫秒-number)
    // --------
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]


// * 現在主流用這方式
ISO 8601 => "2026-06-12T06:08:46.000Z"
---
columns: {
  createdAt: {
    // DB 自動產生建立時間
    type: 'timestamptz',
    createDate: true,
    nullable: false,
  },
  updatedAt: {
    // DB 更新時自動刷新
    type: 'timestamptz',
    updateDate: true,
    nullable: false,
  },
},
// type
export type TProduct = {
  // ISO 8601
  // Date (object) => 
  // Tue Aug 18 2026 09:20:00 GMT+0800 (台北標準時間)
  // 然後TypeOrm 自己會再轉 
  // 2026-08-18T01:20:00.000Z
  // ----------
  createdAt: Date
  updatedAt: Date
}
// seed
export const mockOrders: TOrder[] = [
  {
    // ISO 8601
    // new Date() => Date (object)
    // 然後TypeOrm 自己會再轉.toISOString()
    // => '2026-06-12T06:08:46.000Z' (string)
    // --------
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]


// ==============================
// Prisma
// ==============================
Timestamp  =>  1787016000000 (毫秒-number)
----
// createdAt BigInt @map("created_at")
// updatedAt BigInt @map("updated_at")
// 但這樣 不會自動 now() / 自動更新。
// 所以還是要用 標準作法
// *方法和ISO 8601 一樣

// 然後：
const newOrders = await prisma.order.findMany({
  include: {
    profile: true, // 對應 : profile: 虛擬要連結用的欄位
  },
})
// 
// Prisma出來永遠是
// createdAt: Date : "2026-06-16T03:39:33.493Z"
// 要手動轉格式.getTime() 才能變時間格式 => 1781581173493
const plainOrders = newOrders.map((order) => ({
  ...order,
  createdAt: order.createdAt.getTime(),
  updatedAt: order.updatedAt.getTime(),
}))
// DB       → timestamptz
// Prisma   → Date
// API      → timestamp (number)


ISO 8601 => "2026-06-12T06:08:46.000Z"
---
model Order {
  // @default(now())：對應 TypeORM 的 createDate: true，在建立資料時自動填入當前時間。
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  // @updatedAt：對應 TypeORM 的 updateDate: true，在資料有任何更新時自動刷新時間。
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz
}
// seed
export const mockOrders: Order[] = [
  {
    // Prisma 只能寫 Date物件 new Date()
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
```
