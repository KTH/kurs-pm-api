'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')

function MockSample (doc) {
  this._id = doc._id
  this.name = doc.name
}

MockSample.findById = function (id) {
  let doc

  if (id === '123') {
    doc = new MockSample({ _id: id, name: 'foo' })
  }

  if (id === 'fail') {
    return Promise.reject(new Error('error'))
  }

  return Promise.resolve(doc)
}

MockSample.prototype.save = function () {
  if (this._id === '123' || this._id === 'abc') {
    return Promise.resolve()
  }

  return Promise.reject(new Error('error'))
}

const sample = proxyquire('../../../server/controllers/sampleCtrl', {
  '../models': {
    sample: {
      Sample: MockSample
    }
  }
})

test('getData ok', (t) => {
  t.plan(1)

  const req = {
    params: {
      id: '123'
    }
  }

  const res = {
    json: (obj) => {
      t.equal(obj.id, '123', 'should have the expected id')
    }
  }

  const next = (err) => {
    t.error(err, 'should not pass an error')
  }

  sample.getData(req, res, next)
})

test('getData not found', (t) => {
  t.plan(2)

  const req = {
    params: {
      id: 'abc'
    }
  }

  const res = {
    json: () => {
      t.fail('should not call res.json')
    }
  }

  const next = (err) => {
    t.error(err, 'should not pass error')
    t.pass('should call next without param')
  }

  sample.getData(req, res, next)
})

test('getData fail', (t) => {
  t.plan(1)

  const req = {
    params: {
      id: 'fail'
    }
  }

  const res = {
    json: () => {
      t.fail('should not call res.json')
    }
  }

  const next = (err) => {
    t.ok(err, 'should pass error')
  }

  sample.getData(req, res, next)
})

test('postData update ok', (t) => {
  t.plan(1)

  const req = {
    params: {
      id: '123'
    },
    body: {
      name: 'foo'
    }
  }

  const res = {
    json: (obj) => {
      t.equal(obj.id, '123', 'should have the expected id')
    }
  }

  const next = (err) => {
    t.error(err, 'should not pass error')
  }

  sample.postData(req, res, next)
})

test('postData create ok', (t) => {
  t.plan(1)

  const req = {
    params: {
      id: 'abc'
    },
    body: {
      name: 'foo'
    }
  }

  const res = {
    json: (obj) => {
      t.equal(obj.id, 'abc', 'should have the expected id')
    }
  }

  const next = (err) => {
    t.error(err, 'should not pass error')
  }

  sample.postData(req, res, next)
})

test('postData fail', (t) => {
  t.plan(1)

  const req = {
    params: {
      id: 'fail'
    },
    body: {
      name: 'foo'
    }
  }

  const res = {
    json: () => {
      t.fail('should not call res.json')
    }
  }

  const next = (err) => {
    t.ok(err, 'should pass error')
  }

  sample.postData(req, res, next)
})
