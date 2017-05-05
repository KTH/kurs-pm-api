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
const AppRouter = require('kth-node-express-routing').PageRouter
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
// Just connect the database
require('./database').connect()

/* **********************************
 * ******* APPLICATION ROUTES *******
 * **********************************
 */
const addPaths = require('kth-node-express-routing').addPaths
const { createApiPaths, createSwaggerRedirectHandler, notFoundHandler, errorHandler } = require('kth-node-api-common')
const swaggerData = require('../swagger.json')
const { System } = require('./controllers')

// System pages routes
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

// Swagger UI
const express = require('express')
const swaggerUrl = config.proxyPrefixPath.uri + '/swagger'
server.use(swaggerUrl, createSwaggerRedirectHandler(swaggerUrl, config.proxyPrefixPath.uri))
server.use(swaggerUrl, express.static(path.join(__dirname, '../node_modules/swagger-ui/dist')))

// Add API endpoints defined in swagger to path definitions so we can use them to register API enpoint handlers
addPaths('api', createApiPaths({
  swagger: swaggerData,
  proxyPrefixPathUri: config.proxyPrefixPath.uri
}))

// Application specific API enpoints
const { Sample } = require('./controllers')
const ApiRouter = require('kth-node-express-routing').ApiRouter
const apiRoute = ApiRouter()
const paths = getPaths()

// Middleware to protect enpoints with apiKey
const authByApiKey = passport.authenticate('apikey', { session: false })

// Api enpoints
apiRoute.register(paths.api.getDataById, authByApiKey, Sample.getData)
apiRoute.register(paths.api.postDataById, authByApiKey, Sample.postData)
server.use('/', apiRoute.getRouter())

// Catch not found and errors
server.use(notFoundHandler)
server.use(errorHandler)

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
