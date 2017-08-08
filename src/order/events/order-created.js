const { STATUS } = require('../constants')

function applyOrderCreated(current, event) {
  const order = {
    id: event.id,
    // prices: prices(action),
    customer: event.customer,
    product: event.product,
    status: STATUS.OPEN
  }
  return order
}

module.exports = applyOrderCreated
