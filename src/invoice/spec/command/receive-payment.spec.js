const expect = require('unexpected')
const Joi = require('joi')
const Hemera = require('nats-hemera')

const ActStub = require("hemera-testsuite/actStub")
const receivePayment = require('../../command/receive-payment')
const TestSuite = require('hemera-testsuite')
const { stubInvoice, eventStore } = require('../utils')
const { STATUS, EVENTS } = require('../../constants')


const invoiceFixture = {
  id: 3,
  status: STATUS.OPEN,
  prices: {
    open: 10,
    total: 10
  }
}
const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('receive-payment')
let server;
let h;
let stub;
before(done => {
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      logLevel: 'silent',
      errio: {
        include: ['_pattern']
      }
    })
    h.use(eventStore)
    h.use(receivePayment)

    const actStub = new ActStub(h)
    stubInvoice(actStub, invoiceFixture)
    stub = actStub.stub({ topic: 'events', cmd: 'add' }, null, { success: true })

    h.ready(done)
  })
})

after(() => {
  h && h.close()
  server.kill()
})

describe('1. Validation', () => {

  it('Requires invoice', (done) => {
    //expect.assertions(2)
    const payload = {
      topic: 'invoice',
      cmd: 'payment.receive',
      amount: 5
    }
    Joi.validate(payload, receivePayment.pattern, (err) => {
      expect(err, 'to satisfy', {
        message: expect.it('to contain', 'invoice')
      })
      done()
    })
  })

  it('Requires amount', (done) => {
    //expect.assertions(2)
    const payload = {
      topic: 'invoice',
      cmd: 'payment.receive',
      invoice: 5
    }
    Joi.validate(payload, receivePayment.pattern, (err) => {
      expect(err, 'to satisfy', {
        message: expect.it('to contain', 'amount')
      })
      done()
    })
  })

})



const command = {
  topic: 'invoice',
  cmd: 'payment.receive',
  invoice: invoiceFixture.id,
  amount: 5
}


describe('Pay Partially', () => {
  let result
  before(() => {
    return h.act(command)
      .then((res) => {
        result = res
      })
  })

  it('2. Load Aggregate: Fetches Invoices', () => {
    expect(result.invoice, 'to satisfy', invoiceFixture)
  })

  it(`4. Generate Events: ${EVENTS.PAYMENT_RECEIVED}`, () => {
    expect(result.event, 'to satisfy', {
      type: EVENTS.PAYMENT_RECEIVED,
      invoice: command.invoice,
      amount: command.amount
    })
  })

  it('5. Apply Receive Payment', () => {
    expect(result.apply, 'to satisfy', {
      id: command.invoice,
      status: STATUS.PARTIALLY_PAID,
      prices: expect.it('to satisfy', {
        open: expect.it('to be', 5)
      })
    })
  })

  it('6. Commit: Stored the event', () => {
    const call = stub.lastCall
    expect(call.args[0], 'to satisfy', {
      events: expect.it('to satisfy', {
        type: EVENTS.PAYMENT_RECEIVED
      })
    })
  })
})