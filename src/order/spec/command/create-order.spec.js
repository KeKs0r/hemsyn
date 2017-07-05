const { stubCustomer, stubProduct, eventStore } = require('../utils')
const { STATUS, EVENTS } = require('../../constants')
const Promise = require('bluebird')
const Hemera = require('nats-hemera')
const ActStub = require("hemera-testsuite/actStub")

const nats = require('nats').connect()
const h = new Hemera(nats, {
  logLevel: 'error',
  generators: true
})
//h.use(getCustomer)
//h.use(getProduct)
h.use(require('../../command/create-order'))
h.use(eventStore)

const actStub = new ActStub(h)
stubCustomer(actStub)
stubProduct(actStub)
const stub = actStub.stub({ topic: 'events', cmd: 'add' }, null, { success: true })

beforeAll(done => h.ready(done))
afterAll(() => h.close())

describe.skip('1. Validation', () => {
  const act = validationSeneca()

  test('requires customer', () => {
    expect.assertions(2)
    return act({
      topic: 'order',
      cmd: 'create',
      product: 5
    }).catch(err => {
      expect(err).toBeTruthy()
      expect(err.details.message).toMatch(/customer/)
    })
  })

  test('requires product', () => {
    expect.assertions(2)
    return act({
      topic: 'order',
      cmd: 'create',
      customer: 3
    }).catch(err => {
      expect(err).toBeTruthy()
      expect(err.details.message).toMatch(/product/)
    })
  })
})

const command = {
  topic: 'order',
  cmd: 'create',
  product: 1,
  customer: 2
}

describe('3. Load Context', () => {

  test('Fetches Customer', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.customer).toMatchObject({
          id: 2,
          name: 'Customer A'
        })
      })
  })

  test('Fetches Product', () => {
    expect.assertions(1)
    return h.act(command).then(result => {
      expect(result.product).toMatchObject({
        id: 1,
        name: 'Ebook'
      })
    })
  })
})

describe('4. Generate Events', () => {

  test('order.created', () => {
    expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.event).toMatchObject({
          type: EVENTS.ORDER_CREATED,
          id: expect.anything(),
          product: expect.objectContaining({
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.objectContaining({
            id: 2,
            name: 'Customer A'
          })
        })
      })
  })
})

describe('5. Apply Events', () => {

  test('apply', () => {
    expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.apply).toMatchObject({
          id: expect.anything(),
          product: expect.objectContaining({
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.objectContaining({
            id: 2,
            name: 'Customer A'
          }),
          status: STATUS.OPEN
        })
      })
  })
})

describe('6. Commit', () => {
  test('Stored the event', () => {
    expect.assertions(1)
    return h.act(command)
      .then(res => {
        const call = stub.lastCall
        expect(call.args[0]).toMatchObject({
          events: expect.objectContaining({
            type: EVENTS.ORDER_CREATED
          })
        })
      })
  })
})