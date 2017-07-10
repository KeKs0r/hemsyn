const Async = require('async')
const Joi = require('joi')
const { EVENTS } = require('../constants')
const applyOrderConfirmed = require('../events/order-confirmed')

function applyConfirmOrder(order) {
  const orderConfirmed = {
    type: EVENTS.ORDER_CONFIRMED,
    id: order.id
  }
  return orderConfirmed
}

const pattern = {
  topic: 'order',
  cmd: 'confirm',
  order: Joi.number().required()
}

function confirmOrderHandler(msg, reply) {
  Async.auto({
    order: (next) => {
      this.act({
        topic: 'order',
        cmd: 'get',
        id: msg.order
      }, next)
    },
    event: ['order', (res, next) => {
      const events = applyConfirmOrder(res.order)
      next(null, events)
    }],
    apply: ['event', (res, next) => {
      const applied = applyOrderConfirmed(res.order, res.event)
      next(null, applied)
    }]
    /*
    commit: ['apply', 'event', (res, next) => {
      // Now we should persist the event
      next(null, {success: true})
    }]
    */
  }, (err, res) => {
    if (err) return reply(err)
    // we return everything, but an API endpoint should probably clean this up
    reply(null, res)
  })
}

function init(options, next) {
  this.add(pattern, confirmOrderHandler)
  next && next()
}

module.exports = {
  pattern,
  handler: confirmOrderHandler,
  plugin: init,
  attributes: {
    name: 'confirm-order'
  }
}
