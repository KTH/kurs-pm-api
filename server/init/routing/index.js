'use strict'

const log = require('kth-node-log')

require('./paths')
require('./systemRoutes')
require('./swaggerRoutes')
require('./sampleRoutes')
require('./genericSetup')

log.info('Routing initialized')
