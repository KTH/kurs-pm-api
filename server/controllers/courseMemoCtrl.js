'use strict'

const log = require('kth-node-log')
const dbOneDocument = require('../lib/dbDataById')
const dbCollectedData = require('../lib/dbCollectedData')
const { WebCourseMemoModel } = require('../models/dynamicMemosModel')

async function getMemoDataById(req, res) {
  const { id } = req.params
  log.info('Received request for memo with id: ', id)
  try {
    const dbResponse = await dbOneDocument.fetchCourseMemoDataById(id)

    res.json(dbResponse)
    log.info('Responded to request for memo with id: ', id)
  } catch (err) {
    log.error('Failed request for memo, error:', { err })
    return err
  }
}

async function postMemoData(req, res) {
  try {
    const listLength = req.body.length
    const memoList = req.body
    const dbResponse = []

    for (let memoIndex = 0; memoIndex < listLength; memoIndex++) {
      log.info(' Posting new course memos ', { memoList })
      const nextMemo = memoList[memoIndex]
      const exists = await dbOneDocument.fetchCourseMemoDataById(nextMemo._id)
      nextMemo.lastChangeDate = new Date()
      if (!nextMemo.hasOwnProperty('previousFileList')) {
        nextMemo.previousFileList = []
      }
      if (exists) {
        const {
          courseMemoFileName: previousFileName,
          lastChangeDate: publishDate,
          previousFileList: oldPrevFileList,
        } = exists
        const nextPreviousFileList = [
          {
            previousFileName,
            publishDate,
            version: oldPrevFileList.length + 1,
          },
          ...oldPrevFileList,
        ]
        nextMemo.previousFileList = nextPreviousFileList
        log.info('roundCourseMemoData already exists, update' + nextMemo._id)
        dbResponse.push(await dbOneDocument.updateCourseMemoDataById(nextMemo))
      } else {
        log.info('saving new memo data' + nextMemo._id)
        dbResponse.push(await dbOneDocument.storeNewCourseMemoData(nextMemo))
      }
    }
    log.info('dbResponse', dbResponse)
    res.status(201).json(dbResponse)
  } catch (error) {
    log.error('Error in while trying to postMemoData', { error })
    return error
  }
}

async function putMemoDataById(req, res) {
  try {
    const id = req.body._id
    let dbResponse
    log.info('Posting new roundCourseMemoData', { id })
    const exists = await dbOneDocument.fetchCourseMemoDataById(id)
    req.body.changedDate = new Date()
    if (exists) {
      log.info('Updating Course Memo Data :', { id })
      dbResponse = await dbOneDocument.storeNewCourseMemoData(req.body)
    } else {
      log.info('Creating new Course Memo Data :', { id })
      dbResponse = await dbOneDocument.storeNewCourseMemoData(req.body)
    }

    res.status(201).json(dbResponse)
  } catch (error) {
    log.error('Error in while trying to putMemoDataById', { error })
    return error
  }
}

async function deleteMemoDataById(req, res) {
  try {
    const { id } = req.params
    log.info('Hard delete roundCourseMemoData by id:', { id })
    const exists = await dbOneDocument.fetchCourseMemoDataById(id)

    if (exists) {
      const dbResponseAfterDelete = await dbOneDocument.removeCourseMemoDataById(id, exists.courseCode)
      log.info('Successfully removed roundCourseMemoData by id: ', { id })
      log.info('Have not found for deletion roundCourseMemoData by id: ', { id })

      res.json(dbResponseAfterDelete)
    }
  } catch (error) {
    log.error('Error in _deleteDataById', { error })
    return error
  }
}

async function getUsedRounds(req, res) {
  const { courseCode } = req.params
  const { semester } = req.params
  log.info('Received request for used rounds for: ', { courseCode })
  try {
    const dbResponse = await dbCollectedData.fetchAllByCourseCodeAndSemester(courseCode.toUpperCase(), semester)
    const dbDynamicMemos = await WebCourseMemoModel.aggregate([
      { $match: { courseCode, semester, $or: [{ status: 'draft' }, { status: 'published' }] } },
    ])
    log.debug('Fethed dbDynamicMemos which are web-based memos', { dbDynamicMemos })

    const returnObject = {
      usedRoundsIdList: [],
      roundsIdWithWebVersion: [],
    }
    for (let index = 0; index < dbResponse.length; index++) {
      const { _id: pdfFileId } = dbResponse[index]
      returnObject[pdfFileId] = dbResponse[index]
      returnObject.usedRoundsIdList.push(dbResponse[index].koppsRoundId)
    }
    for (let index = 0; index < dbDynamicMemos.length; index++) {
      const { ladokRoundIds } = dbDynamicMemos[index]
      returnObject.usedRoundsIdList.push(...ladokRoundIds)
      returnObject.roundsIdWithWebVersion.push(...ladokRoundIds)
    }
    log.info('Successfully got used rounds for', { courseCode, semester, result: returnObject })
    res.json(returnObject)
    log.info('Responded to request for used rounds for: ', { courseCode })
  } catch (error) {
    return error
  }
}

module.exports = {
  getMemoDataById,
  postMemoData,
  putMemoDataById,
  deleteMemoDataById,
  getUsedRounds,
}
