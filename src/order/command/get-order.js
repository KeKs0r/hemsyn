const Joi = require('joi')
const _ = require('lodash')
const applyOrderEvent = require('../apply')

const pattern = {
  topic: 'order',
  cmd: 'get',
  order: Joi.number().required()
}

function handler (msg, reply) {
  this.act(
    {
      topic: 'events',
      cmd: 'get',
      filter: {
        order: msg.order
      }
    },
    (err, events) => {
      if (err) return reply(err)
      const order = _.reduce(events, applyOrderEvent, {})
      reply(null, order)
    }
  )
}

function init (options, next) {
  this.add(pattern, handler)
  next && next()
}

module.exports = {
  pattern,
  handler,
  plugin: init,
  attributes: {
    name: 'get-order'
  }
}
