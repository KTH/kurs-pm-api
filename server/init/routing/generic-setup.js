'use strict'

const server = require('../../server')

// "case sensitive routing" tells Express whether /my-path is the same as /My-PaTH/
// This is default false but I think better for SEO purposes, creating one canonical url.
server.set('case sensitive routing', true)

// No matching route found in app.
// If the request ends up here none of the rules above have returned any response
server.use(function (req, res, next) {
  const error = new Error(`Not Found: ${req.originalUrl}`)
  error.status = 404
  next(error)
})

// handle any errors thrown or forwarded through the next callback
server.use(function (err, req, res, next) {
  let status = err.status

  if (!status) {
    if (err.errors) {
      status = 400
    } else {
      status = 500
    }
  }

  res.status(status).json({ message: err.message, errors: err.errors, code: err.code })
})
