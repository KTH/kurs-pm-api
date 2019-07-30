'use strict'

const log = require('kth-node-log')
const db = require('../lib/dbDataById')

module.exports = {
  getDataById: _getDataById,
  posttDataById: _posttDataById,
  putDataById: _putDataById,
  deleteDataById: _deleteDataById
}

function * _getDataById (req, res, next) {
  try {
    let doc = {}
    if (process.env.NODE_MOCK) {
      doc = yield { _id: 0, courseCode: 'xx1122' }
    } else {
      doc = yield db.fetchRoundAnalysisById(req.params.id)
    }
    if (!doc) {
      return next()
    }
    res.json(doc)
  } catch (err) {
    next(err)
  }
}

function * _posttDataById (req, res, next) {
  try {
    const id = req.body._id

    log.info('Posting new roundCourseMemoData', { id })
    const exists = yield db.fetchRoundAnalysisById(id)

    if (exists) {
      log.info('roundCourseMemoData already exists, returning...', { id })
      return res.status(400).json({ message: 'An roundCourseMemoData with that id already exist.' })
    }
    req.body.changedDate = new Date()
    const dbResponse = yield db.storeRoundAnalysis(req.body)

    res.status(201).json(dbResponse)
  } catch (error) {
    log.error('Error in while trying to POST roundCourseMemoData (postdocanization)', { error })
    next(error)
  }
}

function * _putDataById (req, res, next) {
  try {
    const id = req.body._id
    log.info('Updating roundCourseMemoData', { id })

    const doc = yield db.fetchRoundAnalysisById(id)

    if (!doc) {
      log.info('No roundCourseMemoData found, returning...', { doc })
      return next()
    }

    req.body.changedDate = new Date()
    let dbResponse = yield db.updateRoundAnalysis(req.body)
    // console.log('dbResponse', dbResponse)

    log.info('Successfully updated roundCourseMemoData', { id: dbResponse._id })
    res.json(dbResponse)
  } catch (error) {
    log.error('Error while trying to putCourseMemoDocumentDataById', { error })
    next(error)
  }
}

function * _deleteDataById (req, res, next) {
  try {
    const id = req.params.id
    log.info('Hard delete roundCourseMemoData by id:', { id })

    const dbResponse = yield db.removeRoundAnalysisById(id)

    log.info('Successfully removed roundCourseMemoData by id: ', { id })
    res.json(dbResponse)
  } catch (error) {
    log.error('Error in deleteRoundAnalysis', { error })
    next(error)
  }
}
