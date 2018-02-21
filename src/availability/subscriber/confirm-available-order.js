const Joi = require('joi')
const { EVENTS: ORDER_EVENTS } = require('../../order/constants')

const pattern = {
  pubsub$: true,
  topic: 'order',
  type: ORDER_EVENTS.ORDER_CREATED,
  event: Joi.object().keys({
    order: Joi.object().required(),
    product: Joi.object().required()
  }).required()
}

function handler(msg, reply) {
  console.log('subscription handler')
  const { event } = msg;
  const { product, order } = event
  this.act({
    topic: 'availability',
    cmd: 'check',
    product,
    amount: 1
  }, (err, res) => {
    if (err) {
      this.log.error(err)
      return reply && reply(err)
    }
    this.act({
      topic: 'order',
      cmd: 'confirm',
      order
    }, (err) => {
      if (err) {
        this.log.error(err)
        return reply && reply(err)
      }
      reply && reply(null, { success: true })
    })
  })
}

function init(options, next) {
  this.add(pattern, handler)
  console.log('confirm-available-order')
  next && next()
}

module.exports = {
  pattern,
  handler,
  plugin: init,
  attributes: {
    name: 'confirm-available-order'
  }
}
