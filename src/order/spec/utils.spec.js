const Seneca = require('seneca')
const Promise = require('bluebird')
const { get_product } = require('./utils')

test('returns default product', () => {
  const s = Seneca({ log: 'test' })
    .use(get_product)
  const act = Promise.promisify(s.act, {context: s})

  expect.assertions(2)
  return act({
    role: 'product',
    cmd: 'get',
    id: 5
  })
    .then((product) => {
      expect(product.id).toBe(5)
      expect(product.name).toBe('Ebook')
    })
})

test('can provide product to plugin', () => {
  const s = Seneca({ log: 'test' })
    .use(get_product, {name: 'Special Product'})
  const act = Promise.promisify(s.act, {context: s})

  expect.assertions(2)
  return act({
    role: 'product',
    cmd: 'get',
    id: 5
  })
    .then((product) => {
      expect(product.id).toBe(5)
      expect(product.name).toBe('Special Product')
    })
})
