const express = require('express')

const router = express.Router()
const orderController = require('../controllers/order')

// ~原理：藍新金流會在使用者完成付款後 打API到 你填的2個網址（notifyUrl 和 returnUrl），
// 文件: https://hackmd.io/HYBMkvilRlWKrnFD7cGfrA?view
// 你需要在這兩個網址對應的 API 路由裡，寫好處理邏輯來更新訂單狀態。

// 這兩個網址的差別在於：
// notifyUrl 是藍新伺服器對你的後端伺服器發出「付款完成通知」，通常用來更新資料庫訂單狀態，這是後端對後端的通訊，不會經過使用者瀏覽器。
// returnUrl 是藍新在付款完成後引導使用者回到前端頁面的網址，這是瀏覽器導向的流程，通常用來顯示付款結果給使用者。
// 1. notifyUrl (後端對後端)
// 藍新看到的：https://XXXXXXXXXXXXXXXX.ngrok-free.dev/api/newebpay/notify
// 實際流向：藍新伺服器 → ngrok 伺服器 → 你的電腦 localhost:8080/api/newebpay/notify。

// 2. returnUrl (瀏覽器導向)
// 藍新看到的：https://XXXXXXXXXXXXXXXX.ngrok-free.dev/api/newebpay/return
// 實際流向：使用者在藍新點擊「返回商店」→ 使用者的瀏覽器被引導至該 ngrok 網址 → 你的電腦 localhost:8080/api/newebpay/return。

// --------------------------------
// 外層
// app.use('/api/newebpay', newebpayRouter)

// 藍新金流付款通知（不需登入，由藍新伺服器呼叫）
router.post('/notify', orderController.handleNotify)

// 藍新金流付款導回（不需登入，使用者瀏覽器導向）
router.post('/return', orderController.handleReturn)

module.exports = router
