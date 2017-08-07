const { STATUS } = require('../constants')

function applyPaymentReceived(c, event) {
  const open = c.prices.open - event.amount
  const status = (open > 0) ? STATUS.PARTIALLY_PAID : STATUS.PAID
  const current = Object.assign({}, c, {
    prices: Object.assign({}, c.prices, {
      open
    }),
    status
  })
  return current
}

module.exports = applyPaymentReceived
