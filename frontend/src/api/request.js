import axios from 'axios'
import { getDataFromCookieByKey } from '@/utils/cookie.js'
import { ROUTE_TABLE } from '@/config/routeTable.js'

// 透過一份 ROUTE_TABLE 名單，利用路徑字串或正規表達式，
// 精準鎖定免驗證的例外路徑（如：登入、註冊）
function verifyRoute(prefix, route, method) {
  const key = `${method}-${prefix}`
  const config = ROUTE_TABLE[key]

  // 沒有設定 → 需要 auth
  if (!config) {
    return false
  }

  // 整個 prefix 公開
  if (config === true) {
    return true
  }

  const subRoute = route.replace(prefix, '')

  // 例如 GET /courses
  if (subRoute === '') {
    return true
  }

  if (Array.isArray(config)) {
    return config.some((pattern) => {
      if (typeof pattern === 'string') {
        return subRoute === pattern
      }

      if (pattern instanceof RegExp) {
        return pattern.test(subRoute)
      }

      return false
    })
  }

  return false
}
function notNeedAuth(url, method) {
  if (!url || !method) return false

  const cleanUrl = url.replace(/^\/+/, '')
  const prefix = cleanUrl.split('/')[0]

  return verifyRoute(prefix, cleanUrl, method.toLowerCase())
}
//----------------------------------------------
// 建立 axios 實例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 請求超時時間
  // 設定 headers 預設值
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
// 送出API以前
// 請求攔截器 - 自動添加 token
request.interceptors.request.use(
  (config) => {
    // console.log('送出API以前' , config);
    // 如果這個 API 不需要登入驗證，就直接放行，不要加 token
    if (notNeedAuth(config.url, config.method)) {
      return config
    }

    // ~假設config.url 為 "/mseeage"，
    // 因為 notNeedAuth 回傳 false，則進入這裡
    const token = getDataFromCookieByKey('token')
    // 如果有 token 就自動加到 header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
// 拿回資料以前
// 回應攔截器 - 統一處理錯誤
request.interceptors.response.use(
  // ~TS版本,請使用response,保留整個 Axios 回傳，
  // ~不要拆成 response.data，這樣等於把axios的AxiosResponse<T>拆掉
  (response) => {
    // console.log('拿回資料以前', response);
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          console.error('請求錯誤')
          break
        case 401:
          console.error('未授權，請重新登入')
          break
        case 403:
          console.error('沒有權限')
          break
        case 404:
          console.error('請求的資源不存在')
          break
        case 500:
          console.error('伺服器錯誤')
          break
      }
    }
    return Promise.reject(error)
  },
)

export default request
