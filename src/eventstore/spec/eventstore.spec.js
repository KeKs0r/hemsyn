const expect = require('unexpected').clone();
expect.use(require('unexpected-sinon'));
const Sinon = require('sinon')

const Hemera = require('nats-hemera')
const Promise = require('bluebird')

const nats = require('nats').connect()
const h = new Hemera(nats, {
  logLevel: 'error',
  generators: true
})
h.use(require('hemera-joi'))
h.use(require('../handlers'))

before(done => h.ready(done))
after(() => h.close())

function noop() { }

describe.skip('Validaiton', () => {
  const AddStub = require('hemera-testsuite/addStub')
  it('Requires a valid Event', done => {
    expect.assertions(5)
    const pattern = {
      topic: 'events',
      cmd: 'add'
    }
    const payload = { events: 1 }
    const execution = AddStub.run(
      h,
      pattern,
      payload,
      noop
    )
    //console.log(execution.schema.joi$.validate(Object.assign({}, pattern, payload)))
  })
})

it('can add single event', () => {
  return h.act({
    topic: 'events',
    cmd: 'add',
    events: {
      type: 'test.subtest',
      id: 1,
      context: 3
    }
  })
})

it('can add multiple events', () => {
  return h.act({
    topic: 'events',
    cmd: 'add',
    events: [
      { type: 'example.test', id: 2, context: 3, c: 4 },
      { type: 'example.test', id: 3, c: 3 }
    ]
  })
})

it('can receive filtered events', () => {
  //expect.assertions(1)
  return h
    .act({
      topic: 'events',
      cmd: 'get',
      filter: { context: 3 }
    })
    .then(events => {
      expect(events, 'to have length', 2)
    })
})

it('events can be observed', () => {
  const spy1 = Sinon.spy()
  h.add(
    {
      topic: 'example',
      type: 'example.test'
    },
    spy1
  )

  //expect.assertions(2)
  return h
    .act({
      topic: 'events',
      cmd: 'add',
      events: {
        type: 'example.test'
      }
    })
    .then(() => Promise.delay(10))
    .then(() => {
      expect(spy1, 'was called')
    })
    .then(() =>
      h.act({
        topic: 'events',
        cmd: 'add',
        events: {
          type: 'example.other'
        }
      })
    )
    .then(() => Promise.delay(10))
    .then(() => {
      expect(spy1, 'was called times', 1)
    })
})
