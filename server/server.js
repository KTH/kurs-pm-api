'use strict'

const server = require('kth-node-server')
const config = require('./init/configuration')
const log = require('kth-node-log')

// initialize logger
require('./init/logging')

server.setConfig(config)
server.setLog(log)
server.setInitCallback(() => {
  require('./init')
  // additional startup code
})

module.exports = server
