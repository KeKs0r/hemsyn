const { STATUS } = require('../constants')


function applyInvoiceCreated(current, event) {
  const { total } = event
  const invoice = {
    id: event.id,
    prices: {
      open: total,
      total: total
    },
    // prices: prices(action),
    customer: event.customer,
    product: event.product,
    status: STATUS.OPEN
  }
  return invoice
}

module.exports = applyInvoiceCreated
