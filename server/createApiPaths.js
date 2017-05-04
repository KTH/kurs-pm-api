const serverConfig = require('./configuration').server

module.exports = function _assemble (swagger) {
  const basePath = swagger.basePath
  const paths = swagger.paths

  return Object.keys(paths).reduce((endpoints, pathname) => {
    const config = paths[ pathname ]
    const uri = serverConfig.proxyPrefixPath.uri + pathname.replace(/{(.+?)}/g, ':$1') + basePath

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
