'use strict'

const log = require('kth-node-log')
const dbOneDocument = require('../lib/dbDataById')
const dbCollectedData = require('../lib/dbCollectedData')
const co = require('co')

function * _getMemoDataById (req, res, next) {
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

function * _postMemoData (req, res, next) {
  try {
    const listLength = req.body.length
    const memoList = req.body
    let dbResponse = []
    let oldObject = {
      previousFileName: '',
      publishDate: ''
    }

    for (let memo = 0; memo < listLength; memo++) {
      log.info('Posting new roundCourseMemoData', { memoList })
      const exists = yield dbOneDocument.fetchCourseMemoDataById(memoList[memo]._id)
      memoList[memo].lastChangeDate = new Date()
      if (!memoList[memo].hasOwnProperty('previousFileList')) {
        memoList[memo]['previousFileList'] = []
      }
      console.log('exists!!!!', exists, 'memo!!!', memoList[memo])
      if (exists) {
        oldObject = {
          previousFileName: exists.courseMemoFileName,
          publishDate: exists.lastChangeDate
        }
        exists.previousFileList.push(oldObject)
        memoList[memo].previousFileList = exists.previousFileList
        log.info('roundCourseMemoData already exists, update' + memoList[memo]._id)
        dbResponse.push(yield dbOneDocument.updateCourseMemoDataById(memoList[memo]))
      } else {
        log.info('saving new memo data' + memoList[memo]._id)
        dbResponse.push(yield dbOneDocument.storeNewCourseMemoData(memoList[memo]))
      }
    }
    log.info('dbResponse', dbResponse)
    res.status(201).json(dbResponse)
  } catch (error) {
    log.error('Error in while trying to _posttDataById (postdocanization)', { error })
    next(error)
  }
}

function * _putMemoDataById (req, res, next) {
  try {
    const id = req.body._id

    log.info('Posting new roundCourseMemoData', { id })
    const exists = yield dbOneDocument.fetchCourseMemoDataById(id)

    if (exists) {
      log.info('roundCourseMemoData already exists, returning...', { id })
      return res.status(400).json({ message: 'An roundCourseMemoData with that id already exist.' })
    }
    req.body.changedDate = new Date()
    const dbResponse = yield dbOneDocument.storeNewCourseMemoData(req.body)

    res.status(201).json(dbResponse)
  } catch (error) {
    log.error('Error in while trying to _posttDataById (postdocanization)', { error })
    next(error)
  }
}

function * _deleteMemoDataById (req, res, next) {
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
      usedRoundsIdList: []
    }
    for (let index = 0; index < dbResponse.length; index++) {
      returnObject[dbResponse[index]._id] = dbResponse[index]
      returnObject.usedRoundsIdList.push(dbResponse[index].koppsRoundId)
    }
    log.info('Successfully got used round ids for', { courseCode: courseCode, semester: semester, result: returnObject })
    res.json(returnObject)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMemoDataById: co.wrap(_getMemoDataById),
  postMemoData: co.wrap(_postMemoData),
  putMemoDataById: co.wrap(_putMemoDataById),
  deleteMemoDataById: co.wrap(_deleteMemoDataById),
  getCourseMemoList: co.wrap(_getCourseMemoListByCourseCode),
  getUsedRounds: co.wrap(_getUsedRounds)
}
