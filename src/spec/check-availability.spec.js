const expect = require('unexpected');
const Hemera = require('nats-hemera')
const TestSuite = require('hemera-testsuite')

const eventStore = require('../eventstore/attach')
const invoiceService = require('../invoice/attach')
const orderService = require('../order/attach')
const pricingService = require('../pricing/attach')
const availabilityService = require('../availability/attach')

const productStore = require('../product/store')
const customerStore = require('../customer/store')
const availabilityStore = require('../availability/store')

const getCustomer = require('../customer/command/get-customer')
const getProduct = require('../product/command/get-product')
const async = require('async')



const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('e2e-process')
let server;
let h;

before(function (done) {
  this.timeout(5000)
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      logLevel: 'silent',
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

    // Additive Instance
    const nats2 = require('nats').connect(NATS_PORT)
    const h2 = new Hemera(nats2, {
      logLevel: 'silent',
      errio: {
        include: ['_pattern']
      }
    })
    availabilityService(h2)
    availabilityStore.set(1, 5)

    // This is a weird synchronous issue with node-nats
    let finished = 0;
    const finish = (err) => {
      finished++;
      if (finished === 2) {
        done()
      }
    };

    h.ready((err) => {
      if (err) {
        return done(err)
      }
      setTimeout(finish, 10)
    })
    h2.ready((err) => {
      if (err) {
        return done(err)
      }
      setTimeout(finish, 10)
    })
  })
})

after(() => {
  h && h.close()
  server.kill()
})

let order

it.only('Can create order', (done) => {
  const command = {
    topic: 'order',
    cmd: 'create',
    product: 1,
    customer: 2
  }
  h.act(command)
    .then(res => {
      order = res.apply
      // Shortly wait for subscribers
      setTimeout(done, 100)
    })
})

/*
it('Get current order', () => {
  return h.act({
    topic: 'order',
    cmd: 'get',
    order: order.id
  }).then(o => {
    //console.log(o)
    order = o
  })
})

// it('Order was automatically confirmed', () => {
//   expect(order, 'to satisfy', {
//     status. 
//   })
// })


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
*/


