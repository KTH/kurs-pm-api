'use strict'

const config = require('./configuration').server
const log = require('kth-node-log')
const nodeMongo = require('kth-node-mongo')

const mongoOptions = {
  user: config.db.username,
  pass: config.db.password,
  ssl: config.db.ssl,
  dbUri: config.db.authDatabase !== '' ? config.db.uri + `?authSource=${config.db.authDatabase}` : config.db.uri,
  logger: log,
  useUnifiedTopology: true
}

module.exports.connect = function () {
  nodeMongo
    .connect(mongoOptions)
    .then((data) => {
      log.info({ data: data }, 'MongoDB: connected')
    })
    .catch((err) => {
      log.error({ err: err }, 'MongoDB: ERROR connecting DB')
    })
}
