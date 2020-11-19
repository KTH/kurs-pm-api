const log = require('kth-node-log')
const { StoredMemoPdfsModel } = require('../models/storedMemoPdfsModel')

module.exports = {
  fetchCourseMemoDataById: _fetchCourseMemoDataById,
  storeNewCourseMemoData: _storeNewCourseMemoData,
  updateCourseMemoDataById: _updateCourseMemoDataById,
  removeCourseMemoDataById: _removeCourseMemoDataById,
}

function _fetchCourseMemoDataById(id) {
  if (!id) throw new Error('id must be set')
  log.debug('Fetching roundCourseMemoData by ID', { _id: id })
  return StoredMemoPdfsModel.findOne({ _id: id }).populate('MemoData').lean()
}

function _storeNewCourseMemoData(data) {
  if (!data) throw new Error('Trying to post empty/innacurate data in _storeNewCourseMemoData')
  else {
    log.debug('Create and store new roundCourseMemoData', { data })
    const doc = new StoredMemoPdfsModel(data)
    return doc.save()
  }
}

async function _updateCourseMemoDataById(data) {
  if (data) {
    log.debug('Update of existing roundCourseMemoData: ', { data })
    return StoredMemoPdfsModel.findOneAndUpdate({ _id: data._id, courseCode: data.courseCode }, { $set: data })
  } else {
    log.debug('No roundCourseMemoData found for updating it with new data', { data })
  }
}

function _removeCourseMemoDataById(id, courseCode) {
  log.debug('deleted roundCourseMemoData by ID: ', { id })
  return StoredMemoPdfsModel.deleteOne({ _id: id, courseCode })
}
