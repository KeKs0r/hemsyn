const expect = require('unexpected')
const Hemera = require('nats-hemera')
const TestSuite = require('hemera-testsuite')
const { eventStore } = require('../utils')

const uniqPort = require('uniq-port')
const NATS_PORT = uniqPort('get-order')
let server;
let h;
before(done => {
  server = TestSuite.start_server(NATS_PORT, (err, res) => {
    if (err) return done(err)
    const nats = require('nats').connect(NATS_PORT)
    h = new Hemera(nats, {
      logLevel: 'silent',
      generators: true
    })
    h.use(eventStore)
    h.use(require('../../command/get-order'))
    h.ready(done)
  })
})
after(() => {
  h && h.close()
  server.kill()
})

it('Get Order', () => {
  //expect.assertions(2)
  return h
    .act({
      topic: 'order',
      cmd: 'get',
      order: 1
    })
    .then(order => {
      expect(order, 'to satisfy', {
        id: 1
      })
    })
})
