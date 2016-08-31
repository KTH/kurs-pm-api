'use strict'

const log = require('kth-node-log')

require('./paths')
require('./system-routes')
require('./swagger-routes')
require('./sample-routes')
require('./generic-setup')

log.info('Routing initialized')
