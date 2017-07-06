const uuid = require('uuid')
const Async = require('async')
const Joi = require('joi')
const applyOrderCreated = require('../events/order-created')
const { EVENTS } = require('../constants')

const pattern = {
  topic: 'order',
  cmd: 'create',
  customer: Joi.number().required(),
  product: Joi.number().required()
}

function applyOrderCommand(customer, product) {
  const orderCreated = {
    type: EVENTS.ORDER_CREATED,
    id: uuid.v4(),
    customer,
    product
  }
  return orderCreated
}

function handler(msg, reply) {
  Async.auto({
    customer: (next) => {
      this.act({
        topic: 'customer',
        cmd: 'get',
        id: msg.customer
      }, next)
    },
    product: (next) => {
      this.act({
        topic: 'product',
        cmd: 'get',
        id: msg.product
      }, next)
    },
    event: ['customer', 'product', (res, next) => {
      const events = applyOrderCommand(res.customer, res.product)
      next(null, events)
    }],
    apply: ['event', (res, next) => {
      const applied = applyOrderCreated(null, res.event)
      next(null, applied)
    }],
    commit: ['apply', 'event', (res, next) => {
      // Now we should persist the event
      this.act({ topic: 'events', cmd: 'add', events: res.event }, next)
    }]
  }, (err, res) => {
    if (err) return reply(err)
    // we return everything, but an API endpoint should probably clean this up
    reply(null, res)
  })
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
    name: 'create-order'
  }
}
