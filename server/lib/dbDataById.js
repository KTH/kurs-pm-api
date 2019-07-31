const log = require('kth-node-log')
const { CourseMemoDocument } = require('../models/courseMemoDocumentModel')

module.exports = {
  fetchCourseMemoDataById: _fetchCourseMemoDataById,
  storeCourseMemoDataById: _storeCourseMemoDataById,
  updateCourseMemoDataById: _updateCourseMemoDataById,
  removeCourseMemoDataById: _removeCourseMemoDataById
}

function _fetchCourseMemoDataById (id) {
  if (!id) throw new Error('id must be set')
  log.debug('Fetching roundCourseMemoData by ID', { _id: id })
  return CourseMemoDocument.findOne({ _id: id }).populate('courseMemoDocumentData').lean()
}

function _storeCourseMemoDataById (data) {
  if (!data) throw new Error('Trying to post empty/innacurate data in _storeCourseMemoDataById')
  else {
    log.debug('Create and store new roundCourseMemoData', { data })
    const doc = new CourseMemoDocument(data)
    return doc.save()
  }
}

function _updateCourseMemoDataById (data) {
  if (data) {
    log.debug('Update of existing roundCourseMemoData or create new one with data: ', { data })
    return CourseMemoDocument.findOneAndUpdate({ _id: data._id }, { $set: data }, { new: true })
  } else {
    log.debug('No roundCourseMemoData found for updating it with new data', { data })
  }
}

function _removeCourseMemoDataById (id) {
  log.debug('deleted roundCourseMemoData by ID: ', { id })
  return CourseMemoDocument.deleteOne({ _id: id })
}
