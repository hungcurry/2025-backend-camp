import request from '@/api/request.js'

export function createOrder(creditPackageId) {
  return request.post(`orders/${creditPackageId}`)
}
