const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
const adminController = require('../controllers/admin')

// auth = 驗證 JWT，確認有登入
// isCoach = 確認是教練身份
// 💡 通過這兩關檢查後，才會執行 postCourse
router.post('/coaches/courses', auth, isCoach, adminController.postCourse)

router.get('/coaches/revenue', auth, isCoach, adminController.getCoachRevenue)

router.get('/coaches/courses', auth, isCoach, adminController.getCoachCourses)

router.get('/coaches/courses/:courseId', auth, adminController.getCoachCourseDetail)

router.put('/coaches/courses/:courseId', auth, adminController.putCoachCourseDetail)

router.post('/coaches/:userId', adminController.postCoach)

router.put('/coaches', auth, isCoach, adminController.putCoachProfile)

router.get('/coaches', auth, isCoach, adminController.getCoachProfile)

module.exports = router
