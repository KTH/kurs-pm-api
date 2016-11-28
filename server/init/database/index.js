'use strict'

const config = require('../configuration')
const log = require('kth-node-log')
const nodeMongo = require('kth-node-mongo')

const mongoOptions = {
  dbUsername: config.secure.db.username,
  dbPassword: config.secure.db.password,
  server: {
    authenticationDatabase: config.secure.db.authDatabase,
    ssl: config.secure.db.ssl
  },
  maxPoolSize: 5,
  dbUri: config.secure.db.uri,
  logger: log
}

nodeMongo.connect(mongoOptions)
  .then(data => {
    log.info({ data: data }, 'MongoDB: connected')
  })
  .catch(err => {
    log.error({ err: err }, 'MongoDB: ERROR connecting DB')
  })
