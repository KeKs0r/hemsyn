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

module.exports = {
  eventStore: {
    plugin: eventStore,
    attributes: {
      pkg: { name: 'event-store' }
    }
  }
}