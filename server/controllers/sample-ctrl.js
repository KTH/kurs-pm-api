'use strict'

/**
 * Sample API controller. Can safely be removed.
 */

const Sample = require('../models').sample.Sample
const co = require('co')

module.exports = {
  getData: co.wrap(getData),
  postData: co.wrap(postData)
}

function * getData (req, res, next) {
  try {
    const doc = yield Sample.findById(req.params.id)

    if (!doc) {
      return next()
    }

    res.json({ id: doc._id, name: doc.name })
  } catch (err) {
    next(err)
  }
}

function * postData (req, res, next) {
  try {
    let doc = yield Sample.findById(req.params.id)

    if (!doc) {
      doc = new Sample({
        _id: req.params.id,
        name: req.body.name
      })
    } else {
      doc.name = req.body.name
    }

    yield doc.save()
    res.json({ id: doc._id, name: doc.name })
  } catch (err) {
    next(err)
  }
}
