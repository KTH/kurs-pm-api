'use strict'

const config = require('../configuration')
const log = require('kth-node-log')
const nodeMongo = require('kth-node-mongo')

const mongoOptions = {
  user: config.secure.db.username,
  pass: config.secure.db.password,
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
