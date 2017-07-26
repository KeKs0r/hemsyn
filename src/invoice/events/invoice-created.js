const { STATUS } = require('../constants')

function applyInvoiceCreated(current, event) {
  const invoice = {
    id: event.id,
    // prices: prices(action),
    customer: event.customer,
    product: event.product,
    status: STATUS.OPEN
  }
  return invoice
}

module.exports = applyInvoiceCreated
