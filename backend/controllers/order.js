const { dataSource } = require('../db/data-source')
const config = require('../config/index')
const logger = require('../utils/logger')('OrderController')
const {
  createTradeInfo,
  encryptTradeInfo,
  createTradeSha,
  decryptTradeInfo
} = require('../utils/newebpayEncrypt')

/**
 * 藍新金流 (NewebPay) 資料處理工具集：
 * 1. createTradeInfo: 將交易物件 (Object) 轉換為 URL Query String 格式。
 * 2. encryptTradeInfo: 使用 AES-256-CBC 演算法加密交易資料，確保傳輸過程安全。
 * 3. createTradeSha: 結合 HashKey 與 HashIV，透過 SHA256 產生成交驗證雜湊 (TradeSha)。
 * 4. decryptTradeInfo: 用於處理金流平台回傳的加密資料，將 AES 加密字串解密回原始 JSON。
 */

class OrderController {
  // *建立訂單並產生藍新金流加密資料
  static async createOrder (req, res, next) {
    try {
      console.log('藍新-user', req.user)
      console.log('藍新-params', req.params)

      /**
      * 藍新-user {
          id: '4867cf80-9556-4071-bbb5-691248a34f2e',
          name: '王小明',
          email: 'wXlTq@hexschooltest.io',
          role: 'USER',
          created_at: 2026-02-09T22:00:03.882Z,
          updated_at: 2026-02-09T22:00:03.882Z
        }
      * 藍新-params { creditPackageId: 'faf720c0-ad58-4d14-b6e1-c76862ba3a5d' }
      */

      const { id: userId } = req.user
      const { creditPackageId } = req.params

      // 查詢方案是否存在
      const creditPackageRepo = dataSource.getRepository('CreditPackage')
      const creditPackage = await creditPackageRepo.findOne({
        where: { id: creditPackageId }
      })
      if (!creditPackage) {
        res.status(400).json({
          status: 'failed',
          message: 'ID錯誤'
        })
        return
      }

      /**
       * 產生唯一訂單編號邏輯說明：
       * 1. Date.now(): 取得當前毫秒時間戳，確保編號具備時間順序。
       * 2. Math.random().toString(36): 產生隨機 36 進位字串（0-9, a-z）。
       * 3. .slice(2, 6): 截取隨機字串中的 4 位字元。
       * 4. 結合結果: 形成如 "1712712345678a3f9" 的唯一編號。
       */
      // 產生唯一的商店訂單編號（時間戳記 + 隨機碼，避免高併發重複）
      const merchantOrderNo = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
      // 進行四捨五入 + 轉整數，確保金額為純整數（藍新要求）
      const amount = Math.round(Number(creditPackage.price))

      // *建立訂單(產生一筆狀態為 unpaid (未付款) 的訂單。)
      /**
       * 1. orderRepo.create: 僅在記憶體中建立實體物件，並對映資料表欄位（此時尚未寫入 DB）。
       * 2. user_id: 關聯當前登入的使用者。
       * 3. credit_package_id: 紀錄使用者選擇的儲值方案 ID。
       * 4. merchant_order_no: 儲存先前產生的唯一交易編號（用於金流對帳）。
       * 5. amount: 儲存四捨五入後的付款金額。
       * 6. purchased_credits: 固化方案點數，避免未來方案調整時造成訂單爭議。
       * 7. payment_status: 初始狀態設定為 'unpaid' (待付款)。
       * 8. orderRepo.save: 執行 SQL INSERT，將資料正式寫入資料庫。
       */
      const orderRepo = dataSource.getRepository('Order')
      const newOrder = orderRepo.create({
        user_id: userId,
        credit_package_id: creditPackageId,
        merchant_order_no: merchantOrderNo,
        amount,
        purchased_credits: creditPackage.credit_amount,
        payment_status: 'unpaid'
      })
      await orderRepo.save(newOrder)

      // 取得藍新金流設定
      const newebpayConfig = config.get('newebpay')

      // ~組成交易資料並加密
      /**
      * STEP 1: 組成字串 (這還是明文，誰都看得到內容)
      * Result: "MerchantID=...&Amt=100..."
      * const tradeInfo = createTradeInfo(data);

      * STEP 2: AES 加密 (變成亂碼，保護內容不被看穿或修改)
      * 就像把信件放入保險箱鎖起來
      * Result: "3bdfefc03489d1031a... (一長串 16 進制字串)"
      * const encryptedTradeInfo = encryptTradeInfo(tradeInfo, key, iv);

      * STEP 3: SHA256 簽章 (產生數位指紋)
      * 藍新收到後，會用同樣公式算一次，如果結果不同，代表資料被動過
      * Result: "E3B0C442... (固定長度的雜湊值)"
      * const tradeSha = createTradeSha(encryptedTradeInfo, key, iv);
      */

      // 將交易資料組成 URL Query String
      const tradeInfo = createTradeInfo(
        { merchantOrderNo, amount, itemDesc: creditPackage.name },
        newebpayConfig.merchantId,
        newebpayConfig.version,
        newebpayConfig.notifyUrl,
        newebpayConfig.returnUrl
      )
      // AES-256-CBC 加密
      const encryptedTradeInfo = encryptTradeInfo(tradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      // SHA256 雜湊產生 TradeSha
      const tradeSha = createTradeSha(encryptedTradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)

      console.log(`tradeInfo: ${tradeInfo}`)
      // 格式範例：
      // Result: MerchantID=MS123456&Amt=100&MerchantOrderNo=20260410001&ItemDesc=點數卡...
      console.log(`encryptedTradeInfo: ${encryptedTradeInfo}`)
      // 格式範例：
      // Result: "3bdfefc03489d1031aa8eb79c9e99f77cb5f45c87ec5f90748"....
      console.log(`tradeSha: ${tradeSha}`)
      // 格式範例：
      // Result: "52E6E56A67FCD81FE1DCA46ACCAA24D1"... (固定長度的雜湊值)"

      res.status(200).json({
        status: 'success',
        data: {
          paymentGateway: newebpayConfig.payGateway, // 藍新金流付款網址
          MerchantID: newebpayConfig.merchantId, // 商店代號
          TradeInfo: encryptedTradeInfo, // 加密資料
          TradeSha: tradeSha, // 防偽封條
          Version: newebpayConfig.version // 版本號
        }
      })
    }
    catch (error) {
      logger.error(error)
      next(error)
    }
  }

  // 藍新金流付款完成通知（Server to Server）
  static async handleNotify (req, res, next) {
    try {
      // 1. 從設定檔取得商店的 HashKey 與 HashIV，用於後續驗證與解密
      const newebpayConfig = config.get('newebpay')

      // 2. 取得藍新傳過來的加密資料 (TradeInfo) 與 檢查碼 (TradeSha)
      const { TradeInfo, TradeSha } = req.body

      // 驗證 TradeSha
      // 3. 自行將 TradeInfo 搭配 Key/IV 再次產生一次 Sha，比對藍新傳過來的是否一致
      // 這是為了確保這筆資料真的是藍新發出的，而不是駭客隨便偽造一個請求過來。
      const verifyTradeSha = createTradeSha(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      if (TradeSha !== verifyTradeSha) {
        logger.error('TradeSha 驗證失敗')
        res.status(400).send('驗證失敗')
        return
      }

      // 解密 TradeInfo
      // 4. 使用 AES-256-CBC 進行解密，將加密字串轉回 JSON 格式的物件
      const decryptedData = decryptTradeInfo(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      logger.info('藍新回傳解密資料：', decryptedData)

      // 5. 解出具體的交易資訊
      // Status: 交易狀態 (SUCCESS 代表藍新那邊扣款成功)
      // Result: 包含訂單編號、藍新序號、金額等詳細內容
      const { Status, Result } = decryptedData
      const { MerchantOrderNo, TradeNo, PaymentType, Amt } = Result

      // 查詢訂單
      // 6. 拿解密後的「商店訂單編號」去資料庫找這筆訂單原始紀錄
      const orderRepo = dataSource.getRepository('Order')
      const order = await orderRepo.findOne({
        where: { merchant_order_no: MerchantOrderNo }
      })

      // 7. 防禦性檢查：若資料庫沒這筆訂單，可能是編號錯誤或被惡意竄改
      if (!order) {
        logger.error(`找不到訂單：${MerchantOrderNo}`)
        res.status(400).send('訂單不存在')
        return
      }

      // 避免重複處理已付款的訂單
      // 8. 冪等性處理：若訂單已經是 paid，代表可能之前已經收到過通知了
      // 藍新可能會因為網路問題發送多次通知，這裏直接回傳 OK 避免重複發放點數。
      if (order.payment_status === 'paid') {
        res.status(200).send('OK')
        return
      }

      // 驗證金額是否一致，防止金額被竄改
      // 9. 關鍵安全檢查：比對藍新回傳的「付款金額」跟我們資料庫存的「應付金額」是否一致
      // 防止有人修改前端參數，用 1 元買到 1000 元的產品。
      if (Number(Amt) !== order.amount) {
        logger.error(`金額不一致：訂單 ${order.amount}，藍新回傳 ${Amt}`)
        res.status(400).send('金額不一致')
        return
      }

      // 10. 根據交易狀態執行對應邏輯
      if (Status === 'SUCCESS') {
        // 更新訂單狀態為已付款
        // 紀錄藍新給的交易流水號 (TradeNo) 與 支付工具 (如: CREDIT)
        await orderRepo.update(order.id, {
          payment_status: 'paid',
          newebpay_trade_no: TradeNo,
          payment_type: PaymentType,
          paid_at: new Date().toISOString()
        })

        // 建立購買記錄（CreditPurchase）
        // 11. 這步很重要：在此正式將點數入帳到使用者的歷史紀錄中
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const newPurchase = creditPurchaseRepo.create({
          user_id: order.user_id,
          credit_package_id: order.credit_package_id,
          purchased_credits: order.purchased_credits,
          price_paid: Amt,
          purchaseAt: new Date().toISOString()
        })
        await creditPurchaseRepo.save(newPurchase)

        logger.info(`訂單 ${MerchantOrderNo} 付款成功`)
      } else {
        // 更新訂單狀態為付款失敗
        // 如果 Status 不是 SUCCESS，將訂單標記為失敗
        await orderRepo.update(order.id, {
          payment_status: 'failed'
        })
        logger.info(`訂單 ${MerchantOrderNo} 付款失敗：${Status}`)
      }

      // 12. 最後必須回傳字串 "OK" 給藍新伺服器，否則藍新會認為發送失敗而持續重發。
      res.status(200).send('OK')
    }
    catch (error) {
      // 13. 異常錯誤捕捉，避免 Server 崩潰
      logger.error(error)
      next(error)
    }
  }

  // 藍新金流付款完成導回（使用者瀏覽器導向）
  static async handleReturn (req, res, next) {
    try {
      // 1. 取得金流配置資訊
      const newebpayConfig = config.get('newebpay')

      // 2. 藍新透過 POST 傳回加密後的交易資訊 (TradeInfo) 與 驗證碼 (TradeSha)
      const { TradeInfo, TradeSha } = req.body

      // 驗證 TradeSha
      // 3. 確保這份資料沒有被第三方篡改
      const verifyTradeSha = createTradeSha(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      if (TradeSha !== verifyTradeSha) {
        logger.error('ReturnURL TradeSha 驗證失敗')
        // 若驗證失敗，直接導向前端失敗頁面
        res.redirect(`${newebpayConfig.frontendUrl}/payment-result?status=failed`)
        return
      }

      // 解密 TradeInfo 取得訂單編號與付款狀態
      // 4. 解析藍新回傳的原始 JSON 資料
      const decryptedData = decryptTradeInfo(TradeInfo, newebpayConfig.hashKey, newebpayConfig.hashIV)
      const { Status, Result } = decryptedData
      const { MerchantOrderNo } = Result

      // 優先從 DB 查詢實際狀態；若 NotifyURL 尚未處理完，則參考已驗證的藍新回傳 Status
      // 5. 重要：NotifyURL (後端對後端通知) 可能因為網路延遲比 ReturnURL 晚到。
      // 所以我們先檢查資料庫是否已更新為 paid，若還沒，則暫時相信藍新這次回傳的 Status。
      const orderRepo = dataSource.getRepository('Order')
      const order = await orderRepo.findOne({
        where: { merchant_order_no: MerchantOrderNo }
      })

      // 6. 判斷付款是否成功的準則：
      // (1) 資料庫已經標記為 'paid' (表示 Notify 已先跑完) OR
      // (2) 藍新這次回傳的 Status 為 'SUCCESS'
      const isPaid = order?.payment_status === 'paid' || Status === 'SUCCESS'
      const status = isPaid ? 'success' : 'failed'
      // 7. 將使用者重新導向 (Redirect) 到 Vue 前端專案的結果頁面
      // 帶上 status 與 訂單編號讓前端顯示給使用者看
      // http://localhost:5173/payment-result?status=success&orderNo=1775027609294w9hh
      res.redirect(`${newebpayConfig.frontendUrl}/payment-result?status=${status}&orderNo=${MerchantOrderNo}`)
    }
    catch (error) {
      // 8. 發生任何非預期錯誤時，導向失敗頁面
      logger.error(error)
      res.redirect(`${config.get('newebpay').frontendUrl}/payment-result?status=failed`)
    }
  }
}

module.exports = OrderController
