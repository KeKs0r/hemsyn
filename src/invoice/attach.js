module.exports = function attachInvoice(h) {
  h.use(require('./command/get-invoice'))
  h.use(require('./command/receive-payment'))
  h.use(require('./subscriber/create-invoice-from-order'))
}