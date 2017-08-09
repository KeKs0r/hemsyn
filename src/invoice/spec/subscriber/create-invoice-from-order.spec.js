const expect = require('unexpected')
const Hemera = require('nats-hemera')
const ActStub = require("hemera-testsuite/actStub")
const TestSuite = require('hemera-testsuite')
const eventStore = require('../../../eventstore/handlers')
const { STATUS, EVENTS } = require('../../constants')
const { EVENTS: ORDER_EVENTS } = require('../../../order/constants')
const createInvoiceFromOrder = require('../../subscriber/create-invoice-from-order')

const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('create-invoice-from-order')
let server;
let h;
let stub;

before(done => {
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      logLevel: 'silent'
    })
    h.use(createInvoiceFromOrder)
    h.use(eventStore)

    const actStub = new ActStub(h)
    stub = actStub.stub({ topic: 'events', cmd: 'add' }, null, { success: true })
    h.ready(done)
  })
})
after(() => {
  h && h.close()
  server.kill()
})

const command = {
  topic: 'order',
  type: ORDER_EVENTS.ORDER_CREATED,
  event: {
    type: ORDER_EVENTS.ORDER_CREATED,
    id: 123456789,
    product: {
      id: 1,
      name: 'Ebook',
      price: 8
    },
    customer: {
      id: 2,
      name: 'Customer A'
    },
    total: 9.99
  }
}

describe('4. Generate Events', () => {
  it(EVENTS.INVOICE_CREATED, () => {
    //expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.event, 'to satisfy', {
          type: EVENTS.INVOICE_CREATED,
          id: expect.it('to be ok'),
          order: expect.it('to be', 123456789),
          product: expect.it('to satisfy', {
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.it('to satisfy', {
            id: 2,
            name: 'Customer A'
          })
        })
      })
  })
})

describe('5. Apply Events', () => {
  it('apply', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.apply, 'to satisfy', {
          id: expect.it('to be ok'),
          product: expect.it('to satisfy', {
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.it('to satisfy', {
            id: 2,
            name: 'Customer A'
          }),
          prices: expect.it('to satisfy', {
            open: 9.99,
            total: 9.99
          }),
          status: STATUS.OPEN
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
            type: EVENTS.INVOICE_CREATED
          })
        })
      })
  })
})
