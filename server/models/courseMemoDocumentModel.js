'use strict'

const mongoose = require('mongoose')

const schema = mongoose.Schema({
  _id: String,
  courseCode: {
    type: String,
    required: [true, 'Enter Course Code']
  },
  memoName: {
    type: String,
    required: [true, 'memoName is required.'],
    trim: true,
    minlength: 0,
    maxlength: [500, 'Comment must have at most 500 characters.'],
    default: ''
  },
  commentChange: {
    type: String,
    trim: true,
    minlength: 0,
    maxlength: [500, 'Comment must have at most 500 characters.'],
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedDate: {
    type: String, // TODO: DATE
    trim: true,
    minlength: 0,
    default: ''
  },
  pdfPMDate: {
    type: String, // TODO: DATE
    trim: true,
    minlength: 0,
    default: ''
  },
  changedDate: {
    type: String, // TODO: DATE
    trim: true,
    minlength: 0,
    default: ''
  },
  changedBy: {
    type: String,
    trim: true,
    minlength: 0,
    default: ''
  },
  semester: {
    type: String,
    trim: true,
    minlength: 0,
    default: ''
  },
  roundIdList: {
    type: String,
    trim: true,
    minlength: 0,
    default: ''
  },
  courseMemoFileName: {
    type: String,
    trim: true,
    minlength: 0,
    maxlength: [50, 'Comment must have at most 500 characters.'],
    default: ''
  },
  ugKeys: {
    type: Array,
    default: []
  },
  changedAfterPublishedDate: {
    type: String,
    default: ''
  }
})

const CourseMemoDocument = mongoose.model('CourseMemoDocument', schema)

module.exports = {
  CourseMemoDocument,
  schema: schema
}
