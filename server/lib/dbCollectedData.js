const log = require('kth-node-log')
const { CourseMemoDocument } = require('../models/courseMemoDocumentModel')

module.exports = {
  fetchAllByCourseCode: _fetchAllByCourseCode,
  fetchAllByCourseCodeAndSemester: _fetchAllByCourseCodeAndSemester
}

function _fetchAllByCourseCode (courseCode) {
  if (!courseCode) throw new Error('courseCode must be set')
  log.debug('Fetching all courseMemos for ' + courseCode)
  return CourseMemoDocument.find({ courseCode }).populate('courseMemoDocumentData').lean()
}

function _fetchAllByCourseCodeAndSemester (courseCode, semester) {
  log.debug('Fetching all courseMemos for ' + courseCode + ' filtered by semester: ' + semester)
  return CourseMemoDocument.find({ courseCode, semester }).populate('usedRoundsForCourseAndSemester').lean()
}
