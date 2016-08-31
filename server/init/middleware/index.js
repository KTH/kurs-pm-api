'use strict'

const log = require('kth-node-log')

/**
 * Initialize all our middleware. Because of how Express chains its
 * middleware and routing the ordering here is important.
 */
require('./parsers')
require('./access-log')

log.info('Middleware initialized')
