require('dotenv').config()
const db = require('./db')
const web = require('./web')
const secret = require('./secret')
const newebpay = require('./newebpay')

const config = {
  db,
  web,
  secret,
  newebpay
}

class ConfigManager {
  /**
   * Retrieves a configuration value based on the provided dot-separated path.
   * Throws an error if the specified configuration path is not found.
   *
   * @param {string} path - Dot-separated string representing the configuration path.
   * @returns {*} - The configuration value corresponding to the given path.
   * @throws Will throw an error if the configuration path is not found.
   */

  static get (path) {
    if (!path || typeof path !== 'string') {
      throw new Error(`incorrect path: ${path}`)
    }

    // 範例：如果你傳 'secret.api.key'，它會變成 ['secret', 'api', 'key']。
    // secret: config.get('secret').jwtSecret,
    // 在你這次的例子 'secret'，陣列就是 ['secret']。
    const keys = path.split('.')

    let configValue = config
    keys.forEach((key) => {
      // 檢查這個層級有沒有我要的 key
      if (!Object.prototype.hasOwnProperty.call(configValue, key)) {
        throw new Error(`config ${path} not found`)
      }
      // 如果有，就往下一層鑽進去
      configValue = configValue[key]
    })
    // 它會把 { jwtSecret: "my_super_secret_key", ... } 丟出來。
    return configValue
  }
}

module.exports = ConfigManager
