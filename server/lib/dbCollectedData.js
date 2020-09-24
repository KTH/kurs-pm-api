const log = require('kth-node-log')
const { StoredMemoPdfsModel } = require('../models/storedMemoPdfsModel')

module.exports = {
  fetchAllByCourseCode: _fetchAllByCourseCode,
  fetchAllByCourseCodeAndSemester: _fetchAllByCourseCodeAndSemester
}

function _fetchAllByCourseCode(courseCode) {
  if (!courseCode) throw new Error('courseCode must be set')
  log.debug('Fetching all courseMemos for ' + courseCode)
  return StoredMemoPdfsModel.find({ courseCode }).populate('MemoDataListForCourseCode').lean()
}

function _fetchAllByCourseCodeAndSemester(courseCode, semester) {
  log.debug('Fetching all courseMemos for ' + courseCode + ' filtered by semester: ' + semester)
  return StoredMemoPdfsModel.find({ courseCode, semester }).populate('MemoDataListForCourseCode').lean()
}
