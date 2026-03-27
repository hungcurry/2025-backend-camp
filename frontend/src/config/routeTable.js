// ~列出 哪些 router 不需要 token 就能訪問
export const ROUTE_TABLE = {
  // ~字串，精確匹配路徑
  'post-users': ['/signup', '/login'], // POST /users/login
  // POST /users/signup
  // POST /users/login
  'post-coaches': ['/skill'],
  // POST /coaches/skill

  // ~true 代表整個 prefix 不需要 auth
  'get-courses': true,
  // GET /courses
  // GET /courses/123
  // GET /courses/anything
  'get-credit-package': true,
  'post-credit-package': true,
  // GET  /credit-package
  // POST /credit-package


  // ~正規表達式，精確匹配路徑
  'delete-credit-package': [/^\/\d+$/], // credit-package/:id 
  // DELETE /credit-package/123
  // DELETE /credit-package/999

  'get-coaches': [
    '/skill',
    /^\/\d+$/, // /:coachId
    /^\/\?.*$/, // /?per=&page=
    /^\/\d+\/courses$/, // /:coachId/courses
  ],
  // GET /coaches/skill
  // GET /coaches/123
  // GET /coaches/?per=10&page=1
  // GET /coaches/123/courses


  'delete-coaches': [
    /^\/skill\/\d+$/, // /skill/:skillId
    // DELETE /coaches/skill/5
  ],
  'post-admin': [
    /^\/coaches\/\d+$/, //  coaches/:userId
    // POST /admin/coaches/123
  ],
}
