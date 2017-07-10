const expect = require('unexpected')
const Hemera = require('nats-hemera')
const { eventStore } = require('../utils')

const nats = require('nats').connect()
const h = new Hemera(nats, {
  logLevel: 'silent',
  generators: true
})
h.use(eventStore)
h.use(require('../../command/get-order'))

before(done => h.ready(done))
after(() => h.close())

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
