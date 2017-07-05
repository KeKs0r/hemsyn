const Hemera = require('nats-hemera')
const nats = require('nats').connect()

const hemera = new Hemera(nats, { logLevel: 'debug' })

hemera.ready(function () {
  console.log('Ready')
  hemera.add({ topic: 'test', pubsub$: true }, function (resp) {
    console.log('Subscriber', process.pid, resp.value)
  })
})
