const expect = require('unexpected')
const Joi = require('joi')
const Hemera = require('nats-hemera')
const ActStub = require("hemera-testsuite/actStub")
const confirmOrder = require('../../command/confirm-order')
const TestSuite = require('hemera-testsuite')
const { stubOrder, eventStore } = require('../utils')
const { STATUS, EVENTS } = require('../../constants')


const orderFixture = {
  id: 3,
  status: STATUS.OPEN
}
const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('confirm-order')
let server;
let h;
let stub;
before(done => {
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      logLevel: 'silent',
      generators: true,
      errio: {
        include: ['_pattern']
      }
    })
    h.use(eventStore)
    h.use(confirmOrder)

    const actStub = new ActStub(h)
    stubOrder(actStub, orderFixture)
    stub = actStub.stub({ topic: 'events', cmd: 'add' }, null, { success: true })

    h.ready(done)
  })
})
after(() => {
  h.close()
  server.kill()
})

describe('1. Validation', () => {

  it('Requires order', (done) => {
    //expect.assertions(2)
    const payload = {
      topic: 'order',
      cmd: 'confirm'
    }
    Joi.validate(payload, confirmOrder.pattern, (err) => {
      expect(err, 'to satisfy', {
        message: expect.it('to contain', 'order')
      })
      done()
    })
  })
})



const command = {
  topic: 'order',
  cmd: 'confirm',
  order: 3
}


describe('2. Load Aggregate', () => {
  it('Fetches Order', () => {
    //expect.assertions(1)
    return h.act(command)
      .then((result) => {
        expect(result.order, 'to satisfy', orderFixture)
      })
  })
})

describe('4. Generate Events', () => {
  it('Order Confirmed', () => {
    //expect.assertions(1)
    return h.act(command)
      .then((result) => {
        expect(result.event, 'to satisfy', {
          type: EVENTS.ORDER_CONFIRMED,
          id: command.order
        })
      })
  })
})

describe('5. Apply Events', () => {
  it('apply Order Created', () => {
    //expect.assertions(1)
    return h.act(command)
      .then((result) => {
        expect(result.apply, 'to satisfy', {
          id: command.order,
          status: STATUS.CONFIRMED
        })
      })
  })
})

describe('6. Commit', () => {
  it('Stored the event', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(res => {
        const call = stub.lastCall
        expect(call.args[0], 'to satisfy', {
          events: expect.it('to satisfy', {
            type: EVENTS.ORDER_CONFIRMED
          })
        })
      })
  })
})

