const express = require('express')

const router = express.Router()
const orderController = require('../controllers/order')

// auth Jwt
const config = require('../config/index')
const logger = require('../utils/logger')('Order')
const authFactory = require('../middlewares/auth')
const { dataSource } = require('../db/data-source')

// getRepository 是繼承自 TypeORM DataSource 類別的原生方法
// 先確認有沒有拿好『 secret 』跟『 資料表: userRepository 』，裝備齊全了，後面的驗證功能才准開工。」
const authOptions = {
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
}
const auth = authFactory(authOptions)

// 前端這邊打API
// 打商品 : http://127.0.0.1:8080/api/orders/:creditPackageId

// 外層
// app.use('/api/orders', orderRouter)

// 建立訂單（需要登入）
router.post('/:creditPackageId', auth, orderController.createOrder)

module.exports = router
