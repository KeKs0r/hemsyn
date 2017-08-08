const Joi = require('joi')
const store = require('../store')


const pattern = {
  topic: 'availability',
  cmd: 'check',
  product: Joi.number().required(),
  amount: Joi.number().required()
}

function handler(msg, reply) {
  const { product, amount } = msg
  const availableAmount = store.get(product)
  if (availableAmount > amount) {
    return reply(null, { available: true })
  }
  return reply(null, { available: false })
}

function init(options, next) {
  this.add(pattern, handler)
  next && next()
}

module.exports = {
  pattern,
  handler,
  plugin: init,
  attributes: {
    name: 'check-availability'
  }
}
