
module.exports = function attachPricingService(h) {
  h.use(require('./command/calculate-tax'))
}