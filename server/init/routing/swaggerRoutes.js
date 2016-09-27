'use strict'

const server = require('../../server')
const express = require('express')
const path = require('path')
const systemPaths = require('./paths').system
const routing = require('../../lib/routing')

const swaggerUrl = routing.prefix('/swagger')
const redirectUrl = `${swaggerUrl}?url=${systemPaths.swagger.uri}`

// force URL query param to be set for index.html
server.use(swaggerUrl, (req, res, next) => {
  if ((req.url !== '/' && req.url !== '/index.html') || req.query[ 'url' ]) {
    next()
    return
  }

  res.redirect(redirectUrl)
})

server.use(swaggerUrl, express.static(path.join(__dirname, '../../../node_modules/swagger-ui/dist')))
