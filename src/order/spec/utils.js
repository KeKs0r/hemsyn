
function eventStore(options, next) {
  const events = require('./fixtures/events')
  this.add(
    {
      topic: 'events',
      cmd: 'get'
    },
    (msg, reply) => reply(null, events)
  )
  this.add(
    {
      topic: 'events',
      cmd: 'add'
    },
    (msg, reply) => reply(null, { success: true })
  )
  next()
}

function stubCustomer(actStub) {
  const defaultCustomer = {
    id: 2,
    name: 'Customer A',
    classification: 1
  }
  actStub.stub({ topic: 'customer', cmd: 'get', id: 2 }, null, defaultCustomer)
}

function stubProduct(actStub, product) {
  const defaultProduct = {
    name: 'Ebook',
    price: 9.99,
    id: 1
  }
  const result = Object.assign({}, defaultProduct, product)
  actStub.stub({ topic: 'product', cmd: 'get', id: 1 }, null, result)
}

function stubOrder(actStub, order) {
  const defaultOrder = {
    id: 1
  }
  const result = Object.assign({}, defaultOrder, order)
  actStub.stub({ topic: 'order', cmd: 'get', id: result.id }, null, result)
}

module.exports = {
  stubCustomer,
  stubProduct,
  stubOrder,
  eventStore: {
    plugin: eventStore,
    attributes: {
      pkg: { name: 'event-store' }
    }
  }
}
