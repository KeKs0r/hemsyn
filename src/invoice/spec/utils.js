function eventStore(options, next) {
  // const events = require('./fixtures/events')
  // this.add(
  //   {
  //     topic: 'events',
  //     cmd: 'get'
  //   },
  //   (msg, reply) => reply(null, events)
  // )
  this.add(
    {
      topic: 'events',
      cmd: 'add'
    },
    (msg, reply) => reply(null, { success: true })
  )
  next()
}

function stubInvoice(actStub, invoice) {
  const defaultInvoice = {
    id: 1
  }
  const result = Object.assign({}, defaultInvoice, invoice)
  actStub.stub({ topic: 'invoice', cmd: 'get', id: result.id }, null, result)
}

module.exports = {
  eventStore: {
    plugin: eventStore,
    attributes: {
      pkg: { name: 'event-store' }
    }
  },
  stubInvoice
}