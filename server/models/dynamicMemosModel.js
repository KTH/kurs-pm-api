'use strict'

const mongoose = require('mongoose')

const schema = mongoose.Schema({
  courseCode: {
    type: String,
    trim: true,
    required: [true, 'Enter course code'],
  },
  courseTitle: {
    type: String,
    trim: true,
    // required: [true, 'Enter course name']
  },
  departmentName: {
    type: String,
    trim: true,
  },
  ladokRoundIds: {
    type: Array,
    items: String,
    trim: true,
    required: [true, 'Enter course rounds'],
  },
  memoEndPoint: {
    type: String,
    trim: true,
    required: [true, 'Enter course memo endpoint to use for bookmark'],
  },
  memoName: {
    type: String,
    trim: true,
    required: [
      false,
      'Enter well readable memo name to use to describe which course offering included in course memo.',
    ],
  },
  semester: {
    type: String,
    trim: true,
    minlength: 0,
    default: '',
  },
  status: {
    type: String,
    default: 'draft',
  },
  version: {
    type: Number,
    default: 1,
  },
})

const WebCourseMemoModel = mongoose.model('CourseMemo', schema)

module.exports = {
  WebCourseMemoModel,
  schema,
}
