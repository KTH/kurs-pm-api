'use strict'

const log = require('kth-node-log')
const server = require('../server')
const passport = require('passport')
const proxyPrefixPath = require('../init/configuration').full.proxyPrefixPath.uri
const url = require('url')

module.exports = {
  route: route,
  prefix: prefix
}

function route (path, handler) {
  if (!path || !handler) {
    log.error({ path: !!path, handler: !!handler }, 'Routing called without path or handler')
    return
  }

  if (!path.method || !path.uri) {
    log.error({ path: path }, 'Path in routing is missing method or uri')
    return
  }

  const verb = path.method.toLowerCase()

  addScopeToRequest(path, verb)
  initMiddlewareForPath(path, verb)
  initRoute(path, verb, handler)

  log.info(`Route configured: ${path.method} ${path.uri}`)
}

function addScopeToRequest (path, verb) {
  if (path.apikey && path.apikey.scopes) {
    server[ verb ](path.uri, function (req, res, next) {
      req.scope = path.apikey.scopes
      next()
    })
  }
}

function initMiddlewareForPath (path, verb) {
  if (path.apikey) {
    server[ verb ](path.uri, passport.authenticate('apikey', { session: false }))
  }
}

function initRoute (path, verb, handler) {
  server[ verb ](path.uri, handler)
}

function prefix (pathname, basePath) {
  basePath = basePath || proxyPrefixPath
  return url.resolve(basePath + '/', '.' + pathname)
}
