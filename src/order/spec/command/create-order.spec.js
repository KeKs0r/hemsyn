const Joi = require('joi')
const { stubCustomer, stubProduct, eventStore } = require('../utils')
const { STATUS, EVENTS } = require('../../constants')
const Hemera = require('nats-hemera')
const ActStub = require("hemera-testsuite/actStub")
const AddStub = require("hemera-testsuite/addStub")
const createOrder = require('../../command/create-order')


const nats = require('nats').connect()
const h = new Hemera(nats, {
  logLevel: 'error',
  generators: true
})
h.use(createOrder)
h.use(eventStore)

const actStub = new ActStub(h)
stubCustomer(actStub)
stubProduct(actStub)
const stub = actStub.stub({ topic: 'events', cmd: 'add' }, null, { success: true })

beforeAll(done => h.ready(done))
afterAll(() => h.close())

describe('1. Validation', () => {


  test('requires customer', (done) => {
    expect.assertions(2)
    const pattern = {
      topic: 'order',
      cmd: 'create'
    }
    const payload = { product: 5 }
    const addStub = AddStub.run(h, pattern, payload)
    Joi.validate(payload, addStub.schema, (err) => {
      expect(err).toBeTruthy()
      expect(err.message).toMatch(/customer/)
      done()
    })
  })

  test('requires product', (done) => {
    expect.assertions(2)
    const pattern = {
      topic: 'order',
      cmd: 'create'
    }
    const payload = { customer: 5 }
    const addStub = AddStub.run(h, pattern, payload)
    Joi.validate(payload, addStub.schema, (err) => {
      expect(err).toBeTruthy()
      expect(err.message).toMatch(/product/)
      done()
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