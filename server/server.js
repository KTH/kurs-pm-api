'use strict'

const server = require('kth-node-server')
const config = require('./init/configuration').server
const log = require('kth-node-log')

server.start({
  useSsl: config.useSsl,
  pfx: config.ssl.pfx,
  passphrase: config.ssl.passphrase,
  key: config.ssl.key,
  ca: config.ssl.ca,
  cert: config.ssl.cert,
  port: config.port,
  log
})

module.exports = server
