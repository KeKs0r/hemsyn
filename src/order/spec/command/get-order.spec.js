const Hemera = require('nats-hemera')
const { eventStore } = require('../utils')

const nats = require('nats').connect()
const h = new Hemera(nats, {
  logLevel: 'error',
  generators: true
})
h.use(eventStore)
h.use(require('../../command/get-order'))

beforeAll(done => h.ready(done))
afterAll(h.close)

test('Get Order', () => {
  expect.assertions(2)
  return h
    .act({
      topic: 'order',
      cmd: 'get',
      order: 1
    })
    .then(order => {
      expect(order).toBeTruthy()
      expect(order).toMatchObject({
        id: 1
      })
    })
})
