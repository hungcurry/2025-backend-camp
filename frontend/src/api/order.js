import request from '@/api/request.js'

// http://127.0.0.1:8080/api/orders/:creditPackageId
// POST 建立訂單並產生藍新金流加密資料
// 參數說明：
export function postOrder(creditPackageId) {
  return request.post(`orders/${creditPackageId}`)
}

