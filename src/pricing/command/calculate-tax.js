const Joi = require('joi')
const patrun = require('patrun')
const _ = require('lodash')

const pattern = {
  topic: 'tax',
  cmd: 'calculate',
  net: Joi.number().required(),
  country: Joi.string(),
  state: Joi.string(),
  city: Joi.string(),
  type: Joi.string(),
}

function I(val) { var rate = function () { return val }; rate.val = val; return rate }

var salestax = patrun()
salestax
  // For Backwards Compatibility, if called without additional data
  // return Swedish Tax rate
  .add({}, I(0.23))

  .add({ country: 'IE' }, I(0.25))
  .add({ country: 'UK' }, I(0.20))
  .add({ country: 'SE' }, I(0.23))
  .add({ country: 'DE' }, I(0.19))

  .add({ country: 'IE', type: 'reduced' }, I(0.135))
  .add({ country: 'IE', type: 'food' }, I(0.048))

  .add({ country: 'UK', type: 'food' }, I(0.0))

  .add({ country: 'DE', type: 'reduced' }, I(0.07))

  .add({ country: 'US' }, I(0.0)) // no federeal rate (yet!)

  .add({ country: 'US', state: 'AL' }, I(0.04))
  .add({ country: 'US', state: 'AL', city: 'Montgomery' }, I(0.10))

  .add({ country: 'US', state: 'NY' }, I(0.07))
  .add({ country: 'US', state: 'NY', type: 'reduced' }, function under110(net) {
    return net < 110 ? 0.0 : salestax.find({ country: 'US', state: 'NY' })
  })

function handler(msg, reply) {
  const taxPattern = _.omit(msg, 'topic', 'cmd', 'net')
  const calculate = salestax.find(taxPattern)

  const rate = calculate(msg.net)
  const total = Math.round(msg.net * (1 + rate) * 100) / 100
  reply(null, { total: total })
}

function init(options, next) {
  this.add(pattern, handler)
  next && next()
}

module.exports = {
  pattern,
  handler,
  plugin: init,
  attributes: {
    name: 'calculate-tax'
  }
}
