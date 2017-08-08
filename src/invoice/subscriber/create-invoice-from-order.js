const Joi = require('joi')
const uuid = require('uuid')
const { EVENTS } = require('../constants')
const { EVENTS: ORDER_EVENTS } = require('../../order/constants')
const applyInvoiceCreated = require('../events/invoice-created')


function createInvoiceFromOrder({ id, customer, product, total }) {
  const invoiceId = uuid.v4()
  const invoiceCreated = {
    type: EVENTS.INVOICE_CREATED,
    id: invoiceId,
    invoice: invoiceId,
    order: id,
    customer,
    product,
    total,
  }
  return invoiceCreated
}

const pattern = {
  pubsub$: true,
  topic: 'order',
  type: ORDER_EVENTS.ORDER_CREATED,
  event: Joi.object().keys({
    customer: Joi.object().required(),
    product: Joi.object().required()
  }).required()
}

function handler(msg, reply) {
  const event = createInvoiceFromOrder(msg.event)
  const applied = applyInvoiceCreated({}, event)
  this.act({ topic: 'events', cmd: 'add', events: event }, (err, res) => {
    if (err) {
      this.log.error(err)
      return reply && reply(err)
    }
    reply && reply(null, {
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
