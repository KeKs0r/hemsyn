const { STATUS } = require('../constants')

function applyPaymentReceived(c, event) {
  const current = Object.assign({}, c)
  current.prices.open = current.prices.open - event.amount
  if (current.prices.open === 0) {
    current.status = STATUS.PAID
  } else {
    current.status = STATUS.PARTIALLY_PAID
  }
  return current
}

module.exports = applyPaymentReceived
