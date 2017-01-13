'use strict'

const server = require('kth-node-server')
const config = require('./init/configuration')
const log = require('kth-node-log')

server.start({
  pfx:config.full.ssl.pfx,
  passphrase:config.full.ssl.passphrase,
  key:config.full.ssl.key,
  ca:config.full.ssl.ca,
  cert: config.full.ssl.cert,
  port:3333,
  log
})

module.exports = server
