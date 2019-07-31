'use strict'

const log = require('kth-node-log')
const dbOneDocument = require('../lib/dbDataById')
const dbCollectedData = require('../lib/dbCollectedData')
const co = require('co')

function * _getDataById (req, res, next) {
  try {
    let doc = {}
    if (process.env.NODE_MOCK) {
      doc = yield { _id: 0, courseCode: 'xx1122' }
    } else {
      doc = yield dbOneDocument.fetchCourseMemoDataById(req.params.id)
    }
    if (!doc) {
      return next()
    }
    res.json(doc)
  } catch (err) {
    log.error('Failed to _getDataById, error:', { err })
    next(err)
  }
}

function * _posttDataById (req, res, next) {
  try {
    const id = req.body._id

    log.info('Posting new roundCourseMemoData', { id })
    const exists = yield dbOneDocument.fetchCourseMemoDataById(id)

    if (exists) {
      log.info('roundCourseMemoData already exists, returning...', { id })
      return res.status(400).json({ message: 'An roundCourseMemoData with that id already exist.' })
    }
    req.body.changedDate = new Date()
    const dbResponse = yield dbOneDocument.storeCourseMemoDataById(req.body)

    res.status(201).json(dbResponse)
  } catch (error) {
    log.error('Error in while trying to _posttDataById (postdocanization)', { error })
    next(error)
  }
}

function * _putDataById (req, res, next) {
  try {
    const id = req.body._id
    log.info('Updating roundCourseMemoData', { id })

    const doc = yield dbOneDocument.fetchCourseMemoDataById(id)

    if (!doc) {
      log.info('No roundCourseMemoData found, returning...', { doc })
      return next()
    }

    req.body.changedDate = new Date()
    let dbResponse = yield dbOneDocument.updateCourseMemoDataById(req.body)
    // console.log('dbResponse', dbResponse)

    log.info('Successfully updated roundCourseMemoData', { id: dbResponse._id })
    res.json(dbResponse)
  } catch (error) {
    log.error('Error while trying to _putDataById', { error })
    next(error)
  }
}

function * _deleteDataById (req, res, next) {
  try {
    const id = req.params.id
    log.info('Hard delete roundCourseMemoData by id:', { id })

    const dbResponse = yield dbOneDocument.removeCourseMemoDataById(id)

    log.info('Successfully removed roundCourseMemoData by id: ', { id })
    res.json(dbResponse)
  } catch (error) {
    log.error('Error in _deleteDataById', { error })
    next(error)
  }
}

function * _getCourseMemoListByCourseCode (req, res, next) {
  const courseCode = req.params.courseCode.toUpperCase()
  const semester = req.params.semester || ''
  let dbResponse
  try {
    if (semester.length === 5) {
      dbResponse = yield dbCollectedData.fetchAllByCourseCodeAndSemester(courseCode, semester)
    } else {
      dbResponse = yield dbCollectedData.fetchAllByCourseCode(courseCode)
    }

    log.info('Successfully got all analysis for', { courseCode: courseCode })
    res.json(dbResponse)
  } catch (error) {
    log.error('Error in _getCourseMemoListByCourseCode', { error })
    next(error)
  }
}

function * _getUsedRounds (req, res, next) {
  const courseCode = req.params.courseCode
  const semester = req.params.semester
  try {
    const dbResponse = yield dbCollectedData.fetchAllByCourseCodeAndSemester(courseCode.toUpperCase(), semester)
    let returnObject = {
      usedRounds: [],
      publishedMemo: [],
      draftMemo: []
    }

    let roundIdList = []
    let tempObject = {}
    for (let index = 0; index < dbResponse.length; index++) {
      tempObject = {
        user: dbResponse[index].changedBy,
        isPublished: dbResponse[index].isPublished,
        memoId: dbResponse[index]._id,
        memoName: dbResponse[index].memoName,
        ugKeys: dbResponse[index].ugKeys
      }
      if (tempObject.isPublished) {
        returnObject.publishedMemo.push(tempObject)
      } else {
        returnObject.draftMemo.push(tempObject)
      }

      roundIdList = dbResponse[index].roundIdList && dbResponse[index].roundIdList.length > 0 ? dbResponse[index].roundIdList.split(',') : [dbResponse[index].roundIdList]
      for (let index2 = 0; index2 < roundIdList.length; index2++) {
        returnObject.usedRounds.push(roundIdList[index2])
      }
    }
    log.info('Successfully got used round ids for', { courseCode: courseCode, semester: semester, result: returnObject })
    res.json(returnObject)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getDataById: co.wrap(_getDataById),
  posttDataById: co.wrap(_posttDataById),
  putDataById: co.wrap(_putDataById),
  deleteDataById: co.wrap(_deleteDataById),
  getCourseMemoList: co.wrap(_getCourseMemoListByCourseCode),
  getUsedRounds: co.wrap(_getUsedRounds)
}
