const Hemera = require('nats-hemera')
const TestSuite = require('hemera-testsuite')

const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('e2e-process')

const done = (err) => process.exit((!!err) ? 1 : 0)

const server = TestSuite.start_server(NATS_PORT, (err, res) => {
  if (err) return done(err)
  const nats = require('nats').connect(NATS_PORT)
  const h = new Hemera(nats, {
    logLevel: 'error',
    errio: {
      include: ['_pattern']
    }
  })

  h.add({ topic: 'a', cmd: 'b' }, (msg, reply) => {
    console.log('I am called');
    reply()
  })

  // Additive Instance
  const nats2 = require('nats').connect(NATS_PORT)
  const h2 = new Hemera(nats2, {
    logLevel: 'error',
    errio: {
      include: ['_pattern']
    }
  })

  let finished = 0;
  const finish = (err) => {
    finished++;
    if (finished === 2) {
      h.act({ topic: 'a', cmd: 'b' }, (err, res) => {
        console.log('h can act on it');
        h2.act({ topic: 'a', cmd: 'b' }, (err, res) => {
          console.log('I am never reached :-(')
          done()
        })
      })
    }
  };

  h.ready(() => {
    setTimeout(finish, 10)
  })
  h2.ready((err, res) => {
    setTimeout(finish, 10)
  })
})

process.on('exit', () => {
  if (server) {
    server.kill()
  }
})