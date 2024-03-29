'use strict'

const log = require('@kth/log')
const dbOneDocument = require('../lib/dbDataById')
const { WebCourseMemoModel } = require('../models/dynamicMemosModel')
const { StoredMemoPdfsModel } = require('../models/storedMemoPdfsModel')

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
    const { body: memoList } = req
    const { length: listLength } = memoList

    try {
      for (let memoIndex = 0; memoIndex < listLength; memoIndex++) {
        const memo = memoList[memoIndex]
        if (!memo.courseCode || !memo.applicationCode || !memo.semester) {
          const errorMessage = `Trying to post data without courseCode, applicationCode or semester in postMemoData.`
          log.error(errorMessage + ` Memo_id: ${memo._id}, changedBy: ${memo.changedBy}`)
          throw new Error(errorMessage)
        }
      }
    } catch (error) {
      res.statusMessage = error.message
      res.status(400).end()
      return error
    }

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
        const { courseMemoFileName: previousFileName, lastChangeDate, previousFileList: oldPrevFileList = [] } = exists

        const prevVersion = {
          courseMemoFileName: previousFileName,
          lastChangeDate,
          version: oldPrevFileList.length + 1,
        }
        nextMemo.previousFileList = [prevVersion, ...oldPrevFileList]
        log.info(` memo already exists, update ${nextMemo._id}`)
        dbResponse.push(await dbOneDocument.updateCourseMemoDataById(nextMemo))
      } else {
        log.info(` saving new memo data ${nextMemo._id}`)
        dbResponse.push(await dbOneDocument.storeNewCourseMemoData(nextMemo))
      }
    }
    log.info(` dbResponse IN postMemoData ${dbResponse}`)
    res.status(201).json(dbResponse)
    return dbResponse
  } catch (error) {
    log.error('Error in while trying to postMemoData', { error })
    return error
  }
}

async function putMemoDataById(req, res) {
  try {
    try {
      if (!req.body.courseCode || !req.body.applicationCode || !req.body.semester) {
        const errorMessage = `Trying to put data without courseCode, applicationCode or semester in putMemoDataById.`
        log.error(errorMessage + ` Memo_id: ${req.body._id}, changedBy: ${req.body.changedBy}`)
        throw new Error(errorMessage)
      }
    } catch (error) {
      res.statusMessage = error.message
      res.status(400).end()
      return error
    }

    const id = req.body._id
    let dbResponse
    log.info('Try to update or create a new memo ', { id })
    const exists = await dbOneDocument.fetchCourseMemoDataById(id)
    req.body.changedDate = new Date()
    if (exists) {
      log.info(' Found the existing memo. Updating: ', { id })
      dbResponse = await dbOneDocument.storeNewCourseMemoData(req.body)
    } else {
      log.info(' Creating a  new memo : ', { id })
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
    log.info(' Hard delete of roundCourseMemoData by id: ', { id })
    const exists = await dbOneDocument.fetchCourseMemoDataById(id)

    if (exists) {
      const dbResponseAfterDelete = await dbOneDocument.removeCourseMemoDataById(id, exists.courseCode)
      if (dbResponseAfterDelete) log.info(' Successfully removed roundCourseMemoData by id: ', { id })
      if (!dbResponseAfterDelete) log.info(' Have not found for deletion roundCourseMemoData by id: ', { id })

      res.json(dbResponseAfterDelete)
    }
  } catch (error) {
    log.error(' Error in _deleteDataById ', { error })
    return error
  }
}

async function getUsedRounds(req, res) {
  const { courseCode } = req.params
  const { semester } = req.params
  log.info(' Received request for used rounds for: ', { courseCode })
  try {
    const dbWebBasedMemos = await WebCourseMemoModel.aggregate([
      { $match: { courseCode, semester, $or: [{ status: 'draft' }, { status: 'published' }] } },
    ])
    const dbPdfMemoFiles = await StoredMemoPdfsModel.aggregate([{ $match: { courseCode, semester } }])

    log.debug(' Fethed dbWebBasedMemos which are web-based memos', { dbWebBasedMemos })

    const returnObject = {
      usedRoundsApplicationCodeList: [],
      roundsApplicationCodeWithWebVersion: {},
      roundsApplicationCodeWithPdfVersion: {},
    }
    for (let index = 0; index < dbPdfMemoFiles.length; index++) {
      const { _id: pdfFileId, applicationCode, previousFileList = [] } = dbPdfMemoFiles[index]
      const version = previousFileList.length + 1
      returnObject[pdfFileId] = dbPdfMemoFiles[index]
      returnObject.usedRoundsApplicationCodeList.push(applicationCode)
      returnObject.roundsApplicationCodeWithPdfVersion[applicationCode] = { version }
    }
    for (let index = 0; index < dbWebBasedMemos.length; index++) {
      const { memoEndPoint, status, applicationCodes, version } = dbWebBasedMemos[index]
      returnObject.usedRoundsApplicationCodeList.push(...applicationCodes)

      returnObject.roundsApplicationCodeWithWebVersion[applicationCodes] = { memoEndPoint, status, version }
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
