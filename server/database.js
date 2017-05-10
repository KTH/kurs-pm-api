'use strict'

const config = require('./configuration').server
const log = require('kth-node-log')
const nodeMongo = require('kth-node-mongo')

const mongoOptions = {
  user: config.db.username,
  pass: config.db.password,
  server: {
    authenticationDatabase: config.db.authDatabase,
    ssl: config.db.ssl
  },
  maxPoolSize: 5,
  dbUri: config.db.uri,
  logger: log
}

module.exports.connect = function () {
  nodeMongo.connect(mongoOptions)
    .then(data => {
      log.info({ data: data }, 'MongoDB: connected')
    })
    .catch(err => {
      log.error({ err: err }, 'MongoDB: ERROR connecting DB')
    })
}
