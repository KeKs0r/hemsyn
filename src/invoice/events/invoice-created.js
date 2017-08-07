const { STATUS } = require('../constants')


function applyInvoiceCreated(current, event) {
  const { price } = event.product
  const invoice = {
    id: event.id,
    prices: {
      open: price,
      total: price
    },
    // prices: prices(action),
    customer: event.customer,
    product: event.product,
    status: STATUS.OPEN
  }
  return invoice
}

module.exports = applyInvoiceCreated
