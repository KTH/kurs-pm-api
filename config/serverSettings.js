/**
 *
 *            Server specific settings
 *
 * *************************************************
 * * WARNING! Secrets should be read from env-vars *
 * *************************************************
 *
 */
const { getEnv, unpackMongodbConfig } = require('kth-node-configuration')
const { safeGet } = require('safe-utils')

// DEFAULT SETTINGS used for dev, if you want to override these for you local environment, use env-vars in .env
const devPrefixPath = '/api/node'
const devSsl = false
const devPort = 3001
const devMongodb = 'mongodb://localhost:27017/node'
// END DEFAULT SETTINGS

module.exports = {
  // The proxy prefix path if the application is proxied. E.g /places
  proxyPrefixPath: {
    uri: getEnv('SERVICE_PUBLISH', devPrefixPath)
  },
  useSsl: safeGet(() => getEnv('SERVER_SSL', devSsl + '').toLowerCase() == 'true'),
  port: getEnv('SERVER_PORT', devPort),

  ssl: {
    // In development we don't have SSL feature enabled
    pfx: getEnv('SERVER_CERT_FILE', ''),
    passphrase: getEnv('SERVER_CERT_PASSPHRASE', '')
  },

  // API keys
  api_keys: [{
    name: 'devClient',
    apikey: getEnv('NODE_API_KEY', '1234'),
    scope: ['write', 'read']
  }],

  // Services
  db: unpackMongodbConfig('MONGODB_URI', devMongodb),

  // Logging
  logging: {
    log: {
      level: getEnv('LOGGING_LEVEL', 'debug')
    }
  }

  // Custom app settings
}
