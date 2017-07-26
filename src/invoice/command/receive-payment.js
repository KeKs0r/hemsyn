const Async = require('async')
const Joi = require('joi')
const { EVENTS } = require('../constants')
const applyPaymentReceived = require('../events/payment-received')


const pattern = {
  topic: 'invoice',
  cmd: 'payment.receive',
  invoice: Joi.number().required(),
  amount: Joi.number().required().min(0)
}


function applyReceivePayment(invoice, amount) {
  const receivePayment = {
    type: EVENTS.PAYMENT_RECEIVED,
    invoice,
    amount
  }
  return receivePayment
}


function confirmOrderHandler(msg, reply) {
  Async.auto({
    invoice: (next) => {
      this.act({
        topic: 'invoice',
        cmd: 'get',
        id: msg.invoice
      }, next)
    },
    event: (next) => {
      const events = applyReceivePayment(msg.invoice, msg.amount)
      next(null, events)
    },
    apply: ['event', (res, next) => {
      const applied = applyPaymentReceived(res.invoice, res.event)
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
  this.add(pattern, confirmOrderHandler)
  next && next()
}

module.exports = {
  pattern,
  handler: confirmOrderHandler,
  plugin: init,
  attributes: {
    name: 'receive-payment'
  }
}

