'use strict'
const server = require('@kth/server')
const path = require('path')
// Load .env file in development mode
const nodeEnv = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase()
if (nodeEnv === 'development' || nodeEnv === 'dev' || !nodeEnv) {
  require('dotenv').config()
} else if (!process.env.SERVICE_PUBLISH) {
  // This is an ANSIBLE machine which doesn't set env-vars atm
  // so read localSettings.js which we now use to fake env-vars
  // because it already exists in our Ansible setup.
  require('../config/localSettings')
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
const log = require('@kth/log')
const packageFile = require('../package.json')

let logConfiguration = {
  name: packageFile.name,
  app: packageFile.name,
  env: process.env.NODE_ENV,
  level: config.logging.log.level,
  console: config.logging.console,
  stdout: config.logging.stdout,
  src: config.logging.src,
}
log.init(logConfiguration)

/* **************************
 * ******* TEMPLATING *******
 * **************************
 */
const exphbs = require('express-handlebars')
server.set('views', path.join(__dirname, '/views'))
server.engine('handlebars', exphbs.engine())
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
const { createApiPaths, notFoundHandler, errorHandler } = require('@kth/kth-node-api-common')
const swaggerData = require('../swagger.json')
const { System } = require('./controllers')

const _addProxy = uri => `${config.proxyPrefixPath.uri}${uri}`

// System pages routes
const systemRoute = AppRouter()
systemRoute.get('system.monitor', _addProxy('/_monitor'), System.monitor)
systemRoute.get('system.about', _addProxy('/_about'), System.about)
systemRoute.get('system.paths', _addProxy('/_paths'), System.paths)
systemRoute.get('system.swaggerUI', _addProxy('/swagger'), System.swaggerUI)
systemRoute.get('system.swaggerUI', _addProxy('/swagger/'), System.swaggerUI)
systemRoute.get('system.swaggerUI', _addProxy('/swagger/index.html'), System.swaggerUI)
systemRoute.get('system.robots', '/robots.txt', System.robotsTxt)
systemRoute.get('system.swagger', _addProxy('/swagger.json'), System.swagger)
server.use('/', systemRoute.getRouter())

// Swagger UI
const express = require('express')
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()

const swaggerUrl = _addProxy('/swagger')

const { swaggerHandler } = require('./swagger')

server.use(swaggerUrl, swaggerHandler)
server.use(swaggerUrl, express.static(pathToSwaggerUi))

// Add API endpoints defined in swagger to path definitions so we can use them to register API endpoint handlers
addPaths(
  'api',
  createApiPaths({
    swagger: swaggerData,
    proxyPrefixPathUri: config.proxyPrefixPath.uri,
  })
)

// Middleware to protect enpoints with apiKey
const authByApiKey = passport.authenticate('apikey', { session: false })

// Application specific API enpoints
const { CourseMemoCtrl } = require('./controllers')
const ApiRouter = require('kth-node-express-routing').ApiRouter
const apiRoute = ApiRouter(authByApiKey)
const paths = getPaths()

// Api enpoints
apiRoute.register(paths.api.checkAPIkey, System.checkAPIKey)
apiRoute.register(paths.api.getCourseMemoDataById, CourseMemoCtrl.getMemoDataById)
apiRoute.register(paths.api.postCourseMemoData, CourseMemoCtrl.postMemoData)
apiRoute.register(paths.api.putCourseMemoDataById, CourseMemoCtrl.putMemoDataById)
apiRoute.register(paths.api.deleteCourseMemoDataById, CourseMemoCtrl.deleteMemoDataById)

apiRoute.register(paths.api.postCourseMemoData, CourseMemoCtrl.postMemoData)
apiRoute.register(paths.api.getUsedRounds, CourseMemoCtrl.getUsedRounds)

server.use('/', apiRoute.getRouter())

// Catch not found and errors
server.use(notFoundHandler)
server.use(errorHandler)

// /* **********************************
//  * ******* INIT AZURE CLIENT  *******
//  * **********************************
//  */

// const { getClient } = require('@kth/kth-node-cosmos-db')

// getClient({
//   username: config.db.username,
//   password: config.db.password,
//   host: config.db.host,
//   db: 'kursinfo',
//   defaultThroughput: 200,
//   maxThroughput: 400,
//   collections: [{ name: 'memofiles' }],
// })

module.exports = server
