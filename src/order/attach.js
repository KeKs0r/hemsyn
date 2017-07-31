
module.exports = function attachOrderService(h) {
  h.use(require('./command/confirm-order'))
  h.use(require('./command/create-order'))
  h.use(require('./command/get-order'))
}