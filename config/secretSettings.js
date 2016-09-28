'use strict'

const getEnv = require('kth-node-configuration').getEnv

module.exports = {
  secure: {
    api_keys: [{name: 'devClient', apikey: getEnv('API_KEY'), scope: ['write', 'read']}],
    db: {
      username: getEnv('DB_USERNAME'),
      password: getEnv('DB_PASSWORD'),
      uri: getEnv('DB_URI'),
      authDatabase: '',
      // attributes below are used for mongodb 3 with SSL
      caCerts: [ '' ],
      ssl: getEnv('DB_SSL', false)
    }
  },
  ssl: {
    pfx: '',       // path to cert
    passphrase: '' // passphrase for pfx-cert
  },
  logging: {}
}
