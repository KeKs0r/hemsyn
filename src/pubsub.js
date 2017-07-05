const Hemera = require('nats-hemera')
const nats = require('nats').connect()

const hemera = new Hemera(nats, { logLevel: 'error' })

// Subscribe
hemera.add(
  {
    pubsub$: true,
    topic: 'math',
    cmd: 'add',
    a: {
      type$: 'number'
    }
  },
  function (req) {
    console.log(req.a)
  }
)

// Publish
hemera.act({
  topic: 'math',
  cmd: 'add',
  a: 1
})
