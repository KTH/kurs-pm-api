'use strict'

const log = require('kth-node-log')
const dbOneDocument = require('../lib/dbDataById')
const dbCollectedData = require('../lib/dbCollectedData')
const co = require('co')

function * _getMemoDataById (req, res, next) {
  const id = req.params.id
  try {
    const dbResponse = yield dbOneDocument.fetchCourseMemoDataById(req.params.id)

    res.json(dbResponse)
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
    let dbResponse
    log.info('Posting new roundCourseMemoData', { id })
    const exists = yield dbOneDocument.fetchCourseMemoDataById(id)
    req.body.changedDate = new Date()
    if (exists) {
      log.info('Updating Course Memo Data :', { id })
      dbResponse = yield dbOneDocument.storeNewCourseMemoData(req.body)
    } else {
      log.info('Creating new Course Memo Data :', { id })
      dbResponse = yield dbOneDocument.storeNewCourseMemoData(req.body)
    }

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
  let semester = req.params.semester
  let dbResponse
  let returnList = []
  let tempObj = {}

  semester = isNaN(semester) ? '19001' : semester

  try {
    dbResponse = yield dbCollectedData.fetchAllByCourseCode(courseCode)
    console.log('semester', semester)

    log.info('Successfully got all memos for', { courseCode: courseCode })

    for (let index = 0; index < dbResponse.length; index++) {
      if (dbResponse[index].semester >= semester) {
        tempObj[dbResponse[index]._id] = {
          courseCode: dbResponse[index].courseCode,
          pdfMemoUploadDate: dbResponse[index].pdfMemoUploadDate,
          koppsRoundId: dbResponse[index].koppsRoundId,
          courseMemoFileName: dbResponse[index].courseMemoFileName,
          semseter: dbResponse[index].semester
        }
      }
      returnList.push(tempObj)
    }
    res.json(tempObj)
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
