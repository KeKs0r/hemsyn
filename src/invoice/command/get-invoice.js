const Joi = require('joi')
const _ = require('lodash')
const applyInvoiceEvent = require('../apply')

const pattern = {
  topic: 'invoice',
  cmd: 'get',
  invoice: Joi.number().required()
}

function handler(msg, reply) {
  this.act(
    {
      topic: 'events',
      cmd: 'get',
      filter: {
        invoice: msg.invoice
      }
    },
    (err, events) => {
      if (err) return reply(err)
      if (_.size(events) === 0) {
        return reply(new Error('Invoice not found'))
      }
      const invoice = _.reduce(events, applyInvoiceEvent, {})
      reply(null, invoice)
    }
  )
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
    name: 'get-invoice'
  }
}
