const { EVENTS } = require('./constants')

const invoiceCreated = require('./events/invoice-created')
const paymentReceived = require('./events/payment-received')

function apply(current, event) {
  switch (event.type) {
    case EVENTS.INVOICE_CREATED:
      return invoiceCreated(current, event)
    case EVENTS.PAYMENT_RECEIVED:
      return paymentReceived(current, event)
    default:
      console.warn(`Event ${event.type} not found`)
      return current
  }
}

module.exports = apply
