'use strict'

const log = require('kth-node-log')

/**
 * Run all initialization.
 * Because of how Express chains middleware and routing, the ordering here is important.
 */

/**
 * Initialization of configuration is handled by fetching the return value.
 * This is done because we need the configuration to be loaded to be able
 * to initialize everything else and to be able to start the server.
 * By fetching the return value we are making sure that the loading of
 * the configuration has been completed before moving on.
 */

require('./logging')
require('./database')
require('./authentication')
require('./templating')
require('./middleware')
require('./routing')

log.info('Server initialization done')
