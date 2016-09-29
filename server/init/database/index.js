'use strict'

const config = require('../configuration')
const log = require('kth-node-log')
const nodeMongo = require('kth-node-mongo')
const fs = require('fs')
const path = require('path')

let certs
let sslOptions
let dbUri = config.secure.db.uri

if (!dbUri && config.full.db) {
  dbUri = config.full.db.uri
}

let useSsl = config.secure.db.ssl

if (useSsl) {
  if (Array.isArray(config.secure.db.caCerts)) {
    certs = config.secure.db.caCerts.map(cert => {
      if (cert.indexOf('/') === 0) {
        return fs.readFileSync(cert)
      }

      return fs.readFileSync(path.join(__dirname, '/../../../config/', cert))
    })
  }

  sslOptions = {
    ssl: useSsl,
    authenticationDatabase: config.secure.db.authDatabase,
    sslCA: certs
  }
}

const mongoOptions = {
  dbUsername: config.secure.db.username,
  dbPassword: config.secure.db.password,
  dbUri: dbUri,
  logger: log
}

nodeMongo.connect(mongoOptions, sslOptions)
  .then(data => {
    log.info({ data: data }, 'MongoDB: connected')
  })
  .catch(err => {
    log.error({ err: err }, 'MongoDB: ERROR connecting DB')
  })
