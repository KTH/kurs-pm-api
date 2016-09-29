'use strict'

const getEnv = require('kth-node-configuration').getEnv

module.exports = {
  useSsl: getEnv('SERVER_USE_SSL', false),
  ssl: {
    pfx: getEnv('SERVER_CERT_FILE', '/certs/localhost.p12'),
    passphrase: getEnv('SERVER_CERT_PASSPHRASE', '/certs/localhost.pass')
  },
  hostUrl: getEnv('SERVER_HOST_URL', 'http://localhost:3000'),
  port: getEnv('SERVER_PORT', 3001),
  secure: {
    api_keys: [{name: 'devClient', apikey: getEnv('API_KEY'), scope: ['write', 'read']}],
    db: {
      username: getEnv('DB_USERNAME'),
      password: getEnv('DB_PASSWORD'),
      uri: getEnv('DB_URI'),
      authDatabase: getEnv('DB_AUTH_DATABASE'),
      // attributes below are used for mongodb 3 with SSL
      ssl: getEnv('DB_SSL', false)
    }
  },
  logging: {
    log: {
      level: getEnv('LOGGING_LEVEL', 'info')
    }
  }
}
