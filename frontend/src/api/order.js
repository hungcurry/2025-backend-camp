import request from '@/api/request.js'

export function postOrder(creditPackageId) {
  return request.post(`orders/${creditPackageId}`)
}
