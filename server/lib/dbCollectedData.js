const log = require('kth-node-log')
const { CourseMemo } = require('../models/courseMemoModel')

module.exports = {
  fetchAllByCourseCode: _fetchAllByCourseCode,
  fetchAllByCourseCodeAndSemester: _fetchAllByCourseCodeAndSemester
}

function _fetchAllByCourseCode (courseCode) {
  if (!courseCode) throw new Error('courseCode must be set')
  log.debug('Fetching all courseMemos for ' + courseCode)
  return CourseMemo.find({ courseCode }).populate('MemoData').lean()
}

function _fetchAllByCourseCodeAndSemester (courseCode, semester) {
  log.debug('Fetching all courseMemos for ' + courseCode + ' filtered by semester: ' + semester)
  return CourseMemo.find({ courseCode, semester }).populate('MemoData').lean()
}
