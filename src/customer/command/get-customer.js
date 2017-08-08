const Joi = require('joi')
const store = require('../store')


const pattern = {
  topic: 'customer',
  cmd: 'get',
  customer: Joi.number().required()
}

function handler(msg, reply) {
  const { id } = msg
  reply(null, store.get(id))
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
    name: 'get-customer'
  }
}
