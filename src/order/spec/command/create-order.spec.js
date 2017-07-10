const expect = require('unexpected')
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

before(done => h.ready(done))
after(() => h.close())

describe('1. Validation', () => {
  it('requires customer', (done) => {
    //expect.assertions(2)
    const pattern = {
      topic: 'order',
      cmd: 'create'
    }
    const payload = { product: 5 }
    const addStub = AddStub.run(h, pattern, payload)
    Joi.validate(payload, addStub.schema, (err) => {
      expect(err, 'to satisfy', {
        message: expect.it('to contain', 'customer')
      })
      done()
    })
  })

  it('requires product', (done) => {
    //expect.assertions(2)
    const pattern = {
      topic: 'order',
      cmd: 'create'
    }
    const payload = { customer: 5 }
    const addStub = AddStub.run(h, pattern, payload)
    Joi.validate(payload, addStub.schema, (err) => {
      expect(err, 'to satisfy', {
        message: expect.it('to contain', 'product')
      })
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
  it('Fetches Customer', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.customer, 'to satisfy', {
          id: 2,
          name: 'Customer A'
        })
      })
  })

  it('Fetches Product', () => {
    //expect.assertions(1)
    return h.act(command).then(result => {
      expect(result.product, 'to satisfy', {
        id: 1,
        name: 'Ebook'
      })
    })
  })
})

describe('4. Generate Events', () => {
  it('order.created', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.event, 'to satisfy', {
          type: EVENTS.ORDER_CREATED,
          id: expect.it('to be ok'),
          product: expect.it('to satisfy', {
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.it('to satisfy', {
            id: 2,
            name: 'Customer A'
          })
        })
      })
  })
})

describe('5. Apply Events', () => {
  it('apply', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(result => {
        expect(result.apply, 'to satisfy', {
          id: expect.it('to be ok'),
          product: expect.it('to satisfy', {
            id: 1,
            name: 'Ebook'
          }),
          customer: expect.it('to satisfy', {
            id: 2,
            name: 'Customer A'
          }),
          status: STATUS.OPEN
        })
      })
  })
})

describe('6. Commit', () => {
  it('Stored the event', () => {
    //expect.assertions(1)
    return h.act(command)
      .then(res => {
        const call = stub.lastCall
        expect(call.args[0], 'to satisfy', {
          events: expect.it('to satisfy', {
            type: EVENTS.ORDER_CREATED
          })
        })
      })
  })
})