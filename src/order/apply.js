const { EVENTS } = require('./constants')

const orderCreated = require('./events/order-created')
const orderConfirmed = require('./events/order-confirmed')

function apply(current, event) {
  switch (event.type) {
    case EVENTS.ORDER_CREATED:
      return orderCreated(current, event)
    case EVENTS.ORDER_CONFIRMED:
      return orderConfirmed(current, event)
    case EVENTS.INVOICE_CREATED: {
      return Object.assign({}, current, { invoice: event.id })
    }
    default:
      //eslint-disable-next-line 
      console.warn(`Event ${event.type} not found`)
      return current
  }
}

module.exports = apply
