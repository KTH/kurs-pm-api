'use strict'

const mongoose = require('mongoose')

const schema = mongoose.Schema({
  _id: String,
  courseCode: {
    type: String,
    required: [true, 'Enter Course Code'],
  },
  pdfMemoUploadDate: {
    type: String, // TODO: DATE
    trim: true,
    minlength: 0,
    default: '',
  },
  changedBy: {
    type: String,
    trim: true,
    minlength: 0,
    default: '',
  },
  semester: {
    type: String,
    trim: true,
    minlength: 0,
    default: '',
  },
  applicationCode: {
    type: String,
    trim: true,
    minlength: 0,
    default: '',
  },
  courseMemoFileName: {
    type: String,
    trim: true,
    default: '',
  },
  ugKeys: {
    type: Array,
    default: [],
  },
  lastChangeDate: {
    type: String,
    default: '',
  },
  previousFileList: {
    type: Array,
    default: [],
  },
})

const StoredMemoPdfsModel = mongoose.model('MemoFile', schema)
module.exports = {
  StoredMemoPdfsModel,
  schema,
}
