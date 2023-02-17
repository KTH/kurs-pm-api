function MockSample(doc) {
  this._id = doc.id
  this.courseCode = doc.courseCode
  this.semester = doc.semester
  this.koppsRoundId = doc.koppsRoundId
  this.applicatinCode = doc.applicatinCode
  this.courseMemoFileName = doc.courseMemoFileName
  this.lastChangedDate = doc.lastChangedDate
}
MockSample.findOne = function ({ _id }) {
  let doc

  if (_id === 'SF1624_20202_9') {
    doc = new MockSample({
      id: _id,
      courseCode: 'SF1624',
      koppsRoundId: '9',
      applicatinCode: '9',
      semester: '20202',
      courseMemoFileName: 'memo-SF162420202-74552a9c31e7.pdf',
      lastChangedDate: '2019-10-02',
    })
  }

  if (_id === 'EF1111_20201_2') {
    doc = new MockSample({})
  }

  if (_id === 'fail') {
    return Promise.reject(new Error('error'))
  }
  lean = jest.fn(() => Promise.resolve(doc))
  populate = jest.fn(() => ({ lean }))
  return { populate }
}

MockSample.findOneAndUpdate = function (params, data) {
  let doc

  if (id === 'SF1624_20202_9') {
    doc = new MockSample({
      id,
      courseCode: 'SF1624',
      koppsRoundId: '9',
      applicatinCode: '9',
      semester: '20202',
      courseMemoFileName: 'memo-SF162420202-74552a9c31e7.pdf',
      lastChangedDate: '2019-10-02',
    })
  }

  if (id === 'EF1111_20201_2') {
    doc = new MockSample({})
  }

  if (courseCode === 'fail') {
    return Promise.reject(new Error('error'))
  }

  return Promise.resolve(doc)
}
MockSample.deleteOne = function (params) {
  let doc

  if (id === 'SF1624_20202_9') {
    doc = new MockSample({})
  }

  if (courseCode === 'fail') {
    return Promise.reject(new Error('error'))
  }

  return Promise.resolve(doc)
}

MockSample.prototype.save = function () {
  if (this.courseCode === 'SF1624' || this.courseCode === 'EF1111') {
    return Promise.resolve()
  }

  return Promise.reject(new Error('error'))
}

jest.mock('../../server/models/storedMemoPdfsModel', () => {
  return {
    StoredMemoPdfsModel: MockSample,
  }
})
jest.mock('../../server/configuration', () => {
  return {
    server: {
      api_keys: '1234',
      apiKey: {},
      nodeApi: {},
      db: {},
      logging: {
        log: {
          level: 'debug',
        },
      },
      proxyPrefixPath: {
        uri: 'kursinfo',
      },
      collections: ['dev-tests'],
    },
  }
})

function buildReq(overrides) {
  const req = { headers: { accept: 'application/json' }, body: {}, params: {}, ...overrides }
  return req
}

function buildRes(overrides = {}) {
  const res = {
    json: jest
      .fn(() => {
        return res
      })
      .mockName('json'),
    status: jest.fn(() => res).mockName('status'),
    type: jest.fn(() => res).mockName('type'),
    send: jest.fn(() => res).mockName('send'),
    render: jest.fn(() => res).mockName('render'),

    ...overrides,
  }
  return res
}

function buildNext(impl) {
  return jest.fn(impl).mockName('next')
}

jest.mock('@kth/log', () => {
  return {
    init: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }
})
describe('Test functions of courseMemoCtrl.js', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })
  test('getMemoDataById', async () => {
    const { getMemoDataById } = require('../../server/controllers/courseMemoCtrl')
    const req = buildReq({ params: { id: 'SF1624_20202_9' } })
    const res = buildRes()
    const response = await getMemoDataById(req, res)
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  test('postMemoData, update existing', async () => {
    const { postMemoData } = require('../../server/controllers/courseMemoCtrl')
    const req = buildReq({
      params: { id: 'SF1624_20202_9' },
      body: {},
    })
    const res = buildRes()
    const response = await postMemoData(req, res)
    expect(res.status).toHaveBeenNthCalledWith(1, 201)
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  test('postMemoData, handle req if database give empty object (course is not yet in db)', async () => {
    const { postMemoData } = require('../../server/controllers/courseMemoCtrl')
    const req = buildReq({
      params: { id: 'EF1111_20201_2' },
      body: {},
    })
    const res = buildRes()
    const response = await postMemoData(req, res)
    expect(res.status).toHaveBeenNthCalledWith(1, 201)
    expect(res.json).toHaveBeenCalledTimes(1)
  })
})
