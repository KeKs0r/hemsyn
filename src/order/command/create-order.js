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

function applyOrderCommand(customer, product, total) {
  const id = uuid.v4();
  const orderCreated = {
    type: EVENTS.ORDER_CREATED,
    id,
    order: id,
    customer,
    product,
    total,
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
    taxes: ['product', (res, next) => {
      this.act({
        topic: 'tax',
        cmd: 'calculate',
        net: res.product.price
      }, next)
    }],
    event: ['customer', 'product', 'taxes', (res, next) => {
      const events = applyOrderCommand(res.customer, res.product, res.taxes.total)
      next(null, events)
    }],
    apply: ['event', (res, next) => {
      const applied = applyOrderCreated(null, res.event)
      next(null, applied)
    }],
    commit: ['apply', 'event', (res, next) => {
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
