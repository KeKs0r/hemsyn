const Hemera = require('nats-hemera')
const nats = require('nats').connect()
const HemeraStats = require('hemera-stats')

const eventStore = require('./eventstore/attach')
const invoiceService = require('./invoice/attach')
const orderService = require('./order/attach')


const h = new Hemera(nats, {
  generators: true,
  errio: {
    include: ['_pattern']
  }
})

eventStore(h)
invoiceService(h)
orderService(h)
h.use(HemeraStats)

h.ready((err, res) => {
  if (err) {
    console.error(err) //eslint-disable-line no-console
    process.exit(1)
  }
  console.log('Hemera Services Running') //eslint-disable-line no-console
})