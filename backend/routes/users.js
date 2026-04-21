const express = require('express')

const router = express.Router()
const usersController = require('../controllers/users')

// auth Jwt
const config = require('../config/index')
const logger = require('../utils/logger')('Users')
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

router.post('/signup', usersController.postSignup)

router.post('/login', usersController.postLogin)

router.get('/profile', auth, usersController.getProfile)

router.get('/credit-package', auth, usersController.getCreditPackage)

router.put('/profile', auth, usersController.putProfile)

router.put('/password', auth, usersController.putPassword)

router.get('/courses', auth, usersController.getCourseBooking)

module.exports = router
