const expect = require('unexpected');
const Hemera = require('nats-hemera')
const TestSuite = require('hemera-testsuite')

const eventStore = require('../eventstore/attach')
const invoiceService = require('../invoice/attach')
const orderService = require('../order/attach')
const pricingService = require('../pricing/attach')

const productStore = require('../product/store')
const customerStore = require('../customer/store')

const getCustomer = require('../customer/command/get-customer')
const getProduct = require('../product/command/get-product')


const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('e2e-process')
let server;
let h;

before(done => {
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      logLevel: 'error',
      errio: {
        include: ['_pattern']
      }
    })
    eventStore(h)
    invoiceService(h)
    orderService(h)
    pricingService(h)

    h.use(getProduct)
    h.use(getCustomer)

    //  Fixtures
    customerStore.add({
      id: 2,
      name: 'Customer A',
      classification: 1
    })
    productStore.add({
      name: 'Ebook',
      price: 10,
      id: 1
    })

    h.ready(done)
  })
})

after(() => {
  h && h.close()
  server.kill()
})

let order

it('Can create order', () => {
  const command = {
    topic: 'order',
    cmd: 'create',
    product: 1,
    customer: 2
  }
  return h.act(command)
    .then(res => {
      order = res.apply
    })
})

it('Can confirm order', () => {
  const confirmOrder = {
    topic: 'order',
    cmd: 'confirm',
    order: order.id
  }
  return h.act(confirmOrder)
})

it('Get current order', () => {
  return h.act({
    topic: 'order',
    cmd: 'get',
    order: order.id
  }).then(o => {
    order = o
  })
})



it('Pay the invoice', () => {
  return h.act({
    topic: 'invoice',
    cmd: 'payment.receive',
    amount: 12.3,
    invoice: order.invoice
  })
})




it('Get the invoice', () => {
  return h.act({
    topic: 'invoice',
    cmd: 'get',
    invoice: order.invoice
  }).then(invoice => {
    expect(invoice, 'to satisfy', {
      status: 'INVOICE.PAID'
    })
  })
})


