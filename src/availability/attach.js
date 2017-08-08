
module.exports = function attachAvailabilityService(h) {
  h.use(require('./command/check-availability'))
  h.use(require('./subscriber/confirm-available-order'))
}