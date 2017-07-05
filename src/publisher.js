const Hemera = require('nats-hemera')
const nats = require('nats').connect()

const hemera = new Hemera(nats, { logLevel: 'info' })

hemera.ready(function () {
  console.log('Ready')
  hemera.act({ topic: 'test', value: 1, pubsub$: true })
  hemera.act({ topic: 'test', value: 2, pubsub$: true })
  setTimeout(() => {
    console.log('After Timeout #1')
    hemera.act({ topic: 'test', value: 3, pubsub$: true })
    hemera.act({ topic: 'test', value: 4, pubsub$: true })
    setTimeout(() => {
      console.log('After Timeout #2')
      hemera.act({ topic: 'test', value: 5, pubsub$: true })
      hemera.act({ topic: 'test', value: 6, pubsub$: true })
      console.log('Closing')
      hemera.close()
    }, 3000)
  }, 30)
})
