import request from '@/api/request.js'

export function getCreditPackages() {
  return request.get('credit-package')
}

export function postCreditPackage(id) {
  return request.post(`credit-package/${id}`)
}
