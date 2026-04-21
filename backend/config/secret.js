module.exports = {
  // 密碼
  jwtSecret: process.env.JWT_SECRET,
  // JWT 過期時間（單位：天）
  jwtExpiresDay: process.env.JWT_EXPIRES_DAY
}
