'use strict'

const controllers = require('../../controllers')
const paths = require('./paths')
const routing = require('../../lib/routing')

// set up sample routes
// can safely be removed
routing.route(paths.api.getDataById, controllers.Sample.getData)
routing.route(paths.api.postDataById, controllers.Sample.postData)
