'use strict'

/**
 * Selects the template mechanism to use. In this case its Handlebars.
 *
 * Adds withVersion helper which ca be used to add a version on a url
 * to help with caching.
 */

const handlebars = require('express-handlebars')
const server = require('../../server')
const packageFile = require('../../../package.json')
const log = require('../logging')
const path = require('path')

let version = packageFile.version

try {
  const buildVersion = require('../../../config/version')
  version = version + '-' + buildVersion.jenkinsBuild
} catch (err) {
  log.error(err.message)
}

server.set('views', path.join(__dirname, '/../../views'))
server.engine('handlebars', handlebars())
server.set('view engine', 'handlebars')
