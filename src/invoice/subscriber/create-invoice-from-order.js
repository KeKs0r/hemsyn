const Joi = require('joi')
const uuid = require('uuid')
const { EVENTS } = require('../constants')
const { EVENTS: ORDER_EVENTS } = require('../../order/constants')
const applyInvoiceCreated = require('../events/invoice-created')


function createInvoiceFromOrder({ id, customer, product }) {
  const invoiceCreated = {
    type: EVENTS.INVOICE_CREATED,
    id: uuid.v4(),
    order: id,
    customer,
    product,
  }
  return invoiceCreated
}

const pattern = {
  pubsub$: true,
  topic: 'order',
  type: ORDER_EVENTS.ORDER_CREATED,
  event: Joi.object().keys({
    customer: Joi.object(),
    product: Joi.object()
  })
}

function handler(msg, reply) {
  const event = createInvoiceFromOrder(msg.event)
  const applied = applyInvoiceCreated({}, event)
  this.act({ topic: 'events', cmd: 'add', events: event }, (err, res) => {
    if (err) return reply(err)
    reply(null, {
      event,
      apply: applied,
      commit: res
    })
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
    name: 'create-invoice-from-order'
  }
}