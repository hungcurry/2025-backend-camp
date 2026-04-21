const express = require('express')

const router = express.Router()
const coursesController = require('../controllers/courses')

// auth Jwt
const config = require('../config/index')
const logger = require('../utils/logger')('Course')
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

router.get('/', coursesController.getAllCourses)

router.post('/:courseId', auth, coursesController.postCourseBooking)

router.delete('/:courseId', auth, coursesController.deleteCourseBooking)

module.exports = router
