const expect = require('unexpected');
const Hemera = require('nats-hemera')
const TestSuite = require('hemera-testsuite')

const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('e2e-process')

const done = (err) => process.exit((!!err) ? 1 : 0)

const server = TestSuite.start_server(NATS_PORT, (err, res) => {
  if (err) return done(err)
  const nats = require('nats').connect(NATS_PORT)
  h = new Hemera(nats, {
    logLevel: 'error',
    generators: true,
    errio: {
      include: ['_pattern']
    }
  })

  // Additive Instance
  const nats2 = require('nats').connect(NATS_PORT)
  const h2 = new Hemera(nats2, {
    logLevel: 'error',
    generators: true,
    errio: {
      include: ['_pattern']
    }
  })

  h.ready((err, res) => {
    console.log('h1 ready')
    if (err) {
      console.error(err)
      return done(err)
    }
    console.log('starting h2')
    h2.ready((err, res) => {
      console.log('h2 ready')
      done()
    })
  })
})

process.on('exit', () => {
  if (server) {
    server.kill()
  }
})