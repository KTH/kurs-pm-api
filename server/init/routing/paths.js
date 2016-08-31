'use strict'

/**
 * Lists all paths (routes) with corresponding parameter(s) and method.
 * TIP: If you are getting a 500 response and the page keeps loading, check
 * the ordering of the routes in the affected files (routes/* and this).
 */

const swagger = require('../../../swagger.json')
const routing = require('../../lib/routing')

module.exports = {
  system: {
    monitor: {
      uri: routing.prefix('/_monitor'),
      method: 'GET'
    },

    about: {
      uri: routing.prefix('/_about'),
      method: 'GET'
    },

    robots: {
      uri: '/robots.txt',
      method: 'GET'
    },

    paths: {
      uri: routing.prefix('/_paths'),
      method: 'GET'
    },

    swagger: {
      uri: routing.prefix('/swagger.json'),
      method: 'GET'
    }
  },

  api: _assemble()
}

function _assemble () {
  const basePath = swagger.basePath
  const paths = swagger.paths

  return Object.keys(paths).reduce((endpoints, pathname) => {
    const config = paths[ pathname ]
    const uri = routing.prefix(pathname.replace(/{(.+?)}/g, ':$1'), basePath)

    Object.keys(config).forEach((verb) => {
      const operation = config[ verb ]
      const endpoint = {
        uri: uri,
        method: verb.toUpperCase()
      }

      if (operation.security) {
        const security = {
          scope_required: false
        }

        const type = Object.keys(operation.security)[ 0 ]

        if (type && operation.security[ type ]) {
          security.scopes = operation.security[ type ]
          security.scope_required = true
          security.type = type

          if (type === 'api_key') {
            endpoint.apikey = security
          } else {
            endpoint.openid = security
          }
        }
      }

      endpoints[ operation.operationId ] = endpoint
    })

    return endpoints
  }, {})
}
