const expect = require('unexpected')
const Hemera = require('nats-hemera')

const receivePayment = require('../../command/receive-payment')
const TestSuite = require('hemera-testsuite')
const { STATUS, EVENTS } = require('../../constants')

const eventStore = require('../../../eventstore/handlers')
const getInvoice = require('../../command/get-invoice')

const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('receive-payment.integration')
let server;
let h;
before(done => {
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      //logLevel: 'silent',
      generators: true,
      errio: {
        include: ['_pattern']
      }
    })
    h.use(eventStore)
    h.use(getInvoice)
    h.use(receivePayment)

    h.ready(done)
  })
})

after(() => {
  h && h.close()
  server.kill()
})


const command = {
  topic: 'invoice',
  cmd: 'payment.receive',
  invoice: NATS_PORT,
  amount: 5
}


describe('Pay in two steps', () => {
  let invoice
  let invoice2

  before(() => {
    const eventFixture = {
      id: NATS_PORT,
      type: EVENTS.INVOICE_CREATED,
      customer: 1,
      product: {
        name: 'Stuff',
        price: 9
      },
      total: 10
    }
    const addFixture = {
      topic: 'events',
      cmd: 'add',
      events: eventFixture
    }
    return h.act(addFixture)
  })


  it('Can act', () => {
    return h.act(command)
      .then((res) => {
        invoice = res.apply
      })
  })


  it('Has partially paid', () => {
    expect(invoice, 'to satisfy', {
      status: STATUS.PARTIALLY_PAID,
      prices: expect.it('to satisfy', {
        open: expect.it('to be', 5)
      })
    })
  })

  it('Can pay the rest', () => {
    return h.act(command)
      .then((res) => {
        invoice2 = res.apply
      })
  })

  it('Has paid the rest', () => {
    expect(invoice2, 'to satisfy', {
      status: STATUS.PAID,
      prices: expect.it('to satisfy', {
        open: expect.it('to be', 0)
      })
    })
  })


})

