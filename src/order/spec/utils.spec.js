const Hemera = require('nats-hemera')
const Promise = require('bluebird')

const Nats = require('hemera-testsuite/natsStub')
const AddStub = require('hemera-testsuite/addStub')
const ActStub = require('hemera-testsuite/actStub')
const { stubProduct } = require('./utils')

/*
test.skip('returns default product', () => {
  expect.assertions(2)
  const nats = new Nats()
  const h = new Hemera(nats, {
    logLevel: 'error',
    generators: true
  })
  const actStub = new ActStub(h)
  stubProduct(actStub)
  const ready = Promise.promisify(h.ready, { context: h })
  const run = Promise.promisify(AddStub.run)
  return ready()
    .then(() => {
      return run(
        h,
        {
          topic: 'product',
          cmd: 'get'
        },
        { id: 1 }
      )
    })
    .then(product => {
      expect(product.id).toBe(1)
      expect(product.name).toBe('Ebook')
    })
})

test.skip('can provide product to plugin', () => {
  expect.assertions(2)
  const nats = new Nats()
  const h = new Hemera(nats, {
    logLevel: 'error',
    generators: true
  })
  h.use(getProduct, { name: 'Special Product' })
  const ready = Promise.promisify(h.ready, { context: h })
  return ready()
    .then(() => {
      return run(
        h,
        {
          topic: 'product',
          cmd: 'get'
        },
        { id: 5 }
      )
    })
    .then(product => {
      expect(product.id).toBe(5)
      expect(product.name).toBe('Special Product')
    })
})
*/
