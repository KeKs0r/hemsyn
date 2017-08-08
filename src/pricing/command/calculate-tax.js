const Joi = require('joi')

const pattern = {
  topic: 'tax',
  cmd: 'calculate',
  net: Joi.number().required()
}

function handler(msg, reply) {
  const rate = 0.23
  const total = msg.net * (1 + rate)
  reply(null, { total: total })
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
    name: 'calculate-tax'
  }
}
