const jwt = require('jsonwebtoken')

const PERMISSION_DENIED_STATUS_CODE = 401
const FailedMessageMap = {
  expired: 'Token 已過期',
  invalid: '無效的 token',
  missing: '請先登入'
}

function generateError (status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function formatVerifyError (jwtError) {
  let result
  switch (jwtError.name) {
    case 'TokenExpiredError':
      result = generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.expired)
      break
    default:
      result = generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.invalid)
      break
  }
  return result
}

function verifyJWT (token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      // 是 jwt.verify() 驗證完成後呼叫的 回呼函式
      // -------
      // (error, decoded) => {
      //   // jwt.verify 驗證完之後，這裡會被執行
      // }
      // error : 驗證有沒有錯誤
      // decoded : 驗證成功後，JWT 裡面的資料

      if (!error) {
        resolve(decoded)
      }
      else {
        reject(formatVerifyError(error))
      }
    })
  })
}

/**
 * Auth Middleware Factory (V2)
 * * 採用 Higher-Order Function 設計，用於依賴注入相關工具與配置。
 * * @param {Object} config
 * @param {string} config.secret - JWT 簽署用的密鑰
 * @param {Object} config.userRepository - 資料庫存取層，需實作 findOneBy 方法
 * @param {Object} [config.logger] - 選填，預設為 console，用於紀錄錯誤與警告
 */
module.exports = ({ secret, userRepository, logger = console }) => {
  // 驗證開發者在初始化這個 Middleware 時，有沒有傳入一個有效的 JWT 密鑰
  if (!secret || typeof secret !== 'string') {
    logger.error('[AuthV2] secret is required and must be a string.')
    throw new Error('[AuthV2] secret is required and must be a string.')
  }
  // 驗證開發者傳進來的 userRepository 是不是一個擁有 findOneBy 方法的 物件
  if (!userRepository || typeof userRepository !== 'object' || typeof userRepository.findOneBy !== 'function') {
    logger.error('[AuthV2] userRepository is required and must be a function.')
    throw new Error('[AuthV2] userRepository is required and must be a function.')
  }

  // 實際的 Express Middleware
  return async (req, res, next) => {
    // 1. Header 檢查: Authorization Header 格式 (需為 Bearer Token)
    if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      logger.warn('[AuthV2] Missing authorization header.')
      // status: 401 與 message: '請先登入' 的 Error 物件
      // 直接將錯誤傳給「全域錯誤處理中介軟體（Error-Handling Middleware）」
      next(generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.missing))
      return
    }
    // 2. Token 檢查: 解析 Token 內容
    const [, token] = req.headers.authorization.split(' ')
    if (!token) {
      logger.warn('[AuthV2] Missing token.')
      // status: 401 與 message: '請先登入' 的 Error 物件
      // 直接將錯誤傳給「全域錯誤處理中介軟體（Error-Handling Middleware）」
      next(generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.missing))
      return
    }

    try {
      // 3. 驗證 JWT 合法性並解碼
      const verifyResult = await verifyJWT(token, secret)
      // 4. 從資料庫確認使用者是否存在 (確保 Token 有效但帳號可能已被刪除/停用)
      const user = await userRepository.findOneBy({ id: verifyResult.id })
      if (!user) {
        next(generateError(PERMISSION_DENIED_STATUS_CODE, FailedMessageMap.invalid))
        return
      }
      // 5. 注入使用者資訊至 Request 物件，供後續 Controller 使用
      req.user = user
      next()
    }
    catch (error) {
      // 6. 捕捉 JWT 過期或簽章錯誤等例外
      logger.error(`[AuthV2] ${error.message}`)
      next(error)
    }
  }
}
