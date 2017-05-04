'use strict'
const server = require('kth-node-server')
const { safeGet } = require('safe-utils')
const path = require('path')
// Load .env file in development mode
const nodeEnv = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase()
if (nodeEnv === 'development' || nodeEnv === 'dev' || !nodeEnv) {
  require('dotenv').config()
}
// Now read the server config etc.
const config = require('./configuration').server
const AppRouter = require('kth-node-express-routing').Router
const getPaths = require('kth-node-express-routing').getPaths

// Expose the server and paths
server.locals.secret = new Map()
module.exports = server
module.exports.getPaths = () => getPaths()

/* ***********************
 * ******* LOGGING *******
 * ***********************
 */
const log = require('kth-node-log')
const packageFile = require('../package.json')

let logConfiguration = {
  name: packageFile.name,
  app: packageFile.name,
  env: process.env.NODE_ENV,
  level: config.logging.log.level,
  console: config.logging.console,
  stdout: config.logging.stdout,
  src: config.logging.src
}
log.init(logConfiguration)

/* **************************
 * ******* TEMPLATING *******
 * **************************
 */
const exphbs = require('express-handlebars')
server.set('views', path.join(__dirname, '/views'))
server.set('layouts', path.join(__dirname, '/views/layouts'))
server.set('partials', path.join(__dirname, '/views/partials'))
server.engine('handlebars', exphbs({
  defaultLayout: 'publicLayout',
  layoutsDir: server.settings.layouts,
  partialsDir: server.settings.partials,
}))
server.set('view engine', 'handlebars')

/* ******************************
 * ******* ACCESS LOGGING *******
 * ******************************
 */
const accessLog = require('kth-node-access-log')
server.use(accessLog(config.logging.accessLog))

/* ****************************
 * ******* STATIC FILES *******
 * ****************************
 */
const express = require('express')

// helper
function setCustomCacheControl (res, path) {
  if (express.static.mime.lookup(path) === 'text/html') {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'no-cache')
  }
}

// Files/statics routes--
// Map components HTML files as static content, but set custom cache control header, currently no-cache to force If-modified-since/Etag check.
server.use(config.proxyPrefixPath.uri + '/static/js/components', express.static('./dist/js/components', { setHeaders: setCustomCacheControl }))
// Map static content like images, css and js.
server.use(config.proxyPrefixPath.uri + '/static', express.static('./dist'))
// Return 404 if static file isn't found so we don't go through the rest of the pipeline
server.use(config.proxyPrefixPath.uri + '/static', function (req, res, next) {
  var error = new Error('File not found: ' + req.originalUrl)
  error.statusCode = 404
  next(error)
})

// QUESTION: Should this really be set here?
// http://expressjs.com/en/api.html#app.set
server.set('case sensitive routing', true)

/* *******************************
 * ******* REQUEST PARSING *******
 * *******************************
 */
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieParser())

/* ******************************
 * ******* AUTHENTICATION *******
 * ******************************
 */
const passport = require('passport')
require('./authentication')
server.use(passport.initialize())
server.use(passport.session())

/* ************************
 * ******* DATABASE *******
 * ************************
 */
require('./database')

/* **********************************
 * ******* APPLICATION ROUTES *******
 * **********************************
 */
const addPaths = require('kth-node-express-routing').addPaths
const createApiPaths = require('./createApiPaths')
const swaggerData = require('../swagger.json')
const { System } = require('./controllers')

// Add api endpoint definitions from swagger
addPaths('api', createApiPaths(swaggerData))

// System routes
const systemRoute = AppRouter()
systemRoute.get('system.monitor', config.proxyPrefixPath.uri + '/_monitor', System.monitor)
systemRoute.get('system.about', config.proxyPrefixPath.uri + '/_about', System.about)
systemRoute.get('system.paths', config.proxyPrefixPath.uri + '/_paths', System.paths)
systemRoute.get('system.robots', '/robots.txt', System.robotsTxt)
systemRoute.get('system.swagger', config.proxyPrefixPath.uri + '/swagger.json', System.swagger)
systemRoute.get({
  namespace: 'system.checkAPIKey',
  apikey: {
    scope_required: true,
    scopes: [
      'read'
    ],
    type: 'api_key'
  }
}, config.proxyPrefixPath.uri + '/swagger.json', System.checkAPIKey)
server.use('/', systemRoute.getRouter())

// Force URL query param to be set for index.html
// TODO: This looks like crap...
const swaggerUrl = config.proxyPrefixPath.uri + '/swagger'
server.use(swaggerUrl, (req, res, next) => {
  if ((req.url !== '/' && req.url !== '/index.html') || req.query[ 'url' ]) {
    next()
    return
  }
  res.redirect(`${swaggerUrl}?url=${config.proxyPrefixPath.uri + '/swagger.json'}`)
})
server.use(swaggerUrl, express.static(path.join(__dirname, '../node_modules/swagger-ui/dist')))

// App routes
// TODO: This looks like crap...
const { Sample } = require('./controllers')
const paths = getPaths()

function setApiScope (apiKeyScopes) {
  return function (req, res, next) {
    req.scope = apiKeyScopes // path.apikey.scopes
    next()
  }
}
server[paths.api.getDataById.method.toLowerCase()](paths.api.getDataById.uri, passport.authenticate('apikey', { session: false }), setApiScope(paths.api.getDataById.apikey.scopes), Sample.getData)
server[paths.api.postDataById.method.toLowerCase()](paths.api.postDataById.uri, passport.authenticate('apikey', { session: false }), setApiScope(paths.api.postDataById.apikey.scopes), Sample.postData)

// Not found etc
// If the request ends up here none of the rules above have returned any response
// TODO: Figure out why we set error.status = 404 and then status = 500 below
// TODO: This looks like crap...
server.use(function (req, res, next) {
  const error = new Error(`Not Found: ${req.originalUrl}`)
  error.status = 404
  next(error)
})

// handle any errors thrown or forwarded through the next callback
server.use(function (err, req, res, next) {
  let status = err.status

  if (!status) {
    if (err.errors) {
      status = 400
    } else {
      status = 500
    }
  }

  res.status(status).json({ message: err.message, errors: err.errors, code: err.code })
})

/* ****************************
 * ******* SERVER START *******
 * ****************************
 */
server.start({
  useSsl: config.useSsl,
  pfx: config.ssl.pfx,
  passphrase: config.ssl.passphrase,
  key: config.ssl.key,
  ca: config.ssl.ca,
  cert: config.ssl.cert,
  port: config.port,
  logger: log
})

module.exports = server
