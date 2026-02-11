
## 步驟
https://hackmd.io/@hexschool/r1-WgwPLbl#%E6%B8%AC%E8%A9%A6%E8%B3%87%E6%96%99

### 初階任務 前置作業
請先完成以下步驟，再開始進行任務：
觀看任務攻略影片
1.初階任務攻略影片、進階任務攻略影片
```jsx
// 影片
https://courses.hexschool.com/courses/2895248/lectures/64549970
```

2.下載 Workflow 檔案：下載連結
```jsx
// CICD 和 圖片檔案
https://drive.google.com/drive/folders/1d0EBDjVdqsyh6O1v-SdmaZFuVerZwSx4
```
將 Workflow 檔案放入專案：把下載的 yml 放到你專案的 .github/workflows/ 資料夾
完成前置作業後，即可依序攻略以下任務步驟！


#### 進階任務 前置作業
截圖（LV2 需要，8 張放入 screenshots/ 資料夾）
第四點請自行確認 GitHub 即可，不需提供資訊
提交到 GitHub 後，到 GitHub Actions 頁面確認是否全部通過 ✅

檔名內容:
```jsx
01-register.png 兩個帳號註冊成功
02-add-credit-package.png DBeaver新增組合包方案成功
03-add-skill.png 後台新增技能成功
04-upgrade-coach.png 教練資格管理升級成功
05-create-course.png 教練開課成功
06-buy-credits.png 學員購買堂數成功
07-book-course.png 學員預約課程成功
08-booking-record.png 預約紀錄畫面
```

```jsx
// 前端
http://localhost:3000/

1.使用者
http://localhost:3000/user/dashboard

2.管理者
http://localhost:3000/admin/skills

// ------------------------------

// 後端
http://localhost:8080/healthcheck

http://localhost:8080/api/credit-package

```

### 開發流程
1. 你的開發模式 (Development Workflow)
當你在寫程式碼、修 Bug、趕進度時，你的配置應該是：
資料庫 (Postgres)：依然跑在 Docker 裡。
指令：docker compose up -d postgres (只啟動資料庫)。
後端 (Backend)：在本機終端機跑。
指令：npm run dev (背後是 nodemon ./bin/www.js)。
優點：存檔後 Nodemon 秒速重啟，你在終端機看到的 Console 日誌最即時。
前端 (Frontend)：在本機終端機跑。
指令：npm run dev (背後是 vite)。
優點：Vite 的熱更新 (HMR) 在本機環境下反應最靈敏，畫面秒變。

1. 你的生產模式 (Production Workflow)
當你功能寫完了，準備要交卷、Demo 或部署到雲端時，這才是 Docker 全力出擊的時候：
指令：docker compose up -d --build。
行為：這時 Docker 會執行你在 Dockerfile 裡寫的那套專業流程（安裝生產環境套件、前端 Build 成靜態檔、用 Nginx 或 Serve 跑起來）。
目的：確保這套東西拿到別人的電腦、或是雲端伺服器上，跑起來跟你電腦裡的一模一樣。
