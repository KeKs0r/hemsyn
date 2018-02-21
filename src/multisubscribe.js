const Hemera = require('nats-hemera')
const TestSuite = require('hemera-testsuite')
const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('multisubscribe')
const Joi = require('joi')

const server = TestSuite.start_server(NATS_PORT, (err, res) => {
  const nats = require('nats').connect(NATS_PORT)
  const h = new Hemera(nats, {
    logLevel: 'error',
    generators: true,
    errio: {
      include: ['_pattern']
    }
  })

  const second = new Hemera(nats, {
    logLevel: 'error',
    generators: true,
    errio: {
      include: ['_pattern']
    }
  })

  const pattern = {
    pubsub$: true,
    topic: 'order',
    type: 'EVENT_TYPE',
  }

  h.add({
    pubsub$: true,
    topic: 'order',
    type: 'EVENT_TYPE',
    stuff: Joi.object(),
  }, (msg) => {
    console.log('First Subscriber')
  })

  second.add({
    pubsub$: true,
    topic: 'order',
    type: 'EVENT_TYPE',
    other: Joi.object()
  }, (msg) => {
    console.log('Second Subscriber')
  })

  h.act(pattern)

})


process.on('exit', () => {
  if (server) {
    server.kill()
  }
})