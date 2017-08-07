const expect = require('unexpected')
const apply = require('../../events/payment-received')
const { STATUS, EVENTS } = require('../../constants')


const orderFixture = {
  id: 1,
  product: 3,
  customer: 2,
  prices: {
    open: 10,
    total: 10
  },
  status: STATUS.OPEN
}

it('Marks invoice as partially paid, if not fully paid', () => {
  const paymentReceivedEvent = {
    type: EVENTS.PAYMENT_RECEIVED,
    amount: 8
  }
  const result = apply(orderFixture, paymentReceivedEvent)
  expect(result, 'to satisfy', {
    status: STATUS.PARTIALLY_PAID,
    prices: expect.it('to satisfy', {
      open: 2
    })
  })
})

it('Marks invoice as fully paid, if the full amount is paid', () => {
  const paymentReceivedEvent = {
    type: EVENTS.PAYMENT_RECEIVED,
    amount: 10
  }
  const result = apply(orderFixture, paymentReceivedEvent)
  expect(result, 'to satisfy', {
    status: STATUS.PAID,
    prices: expect.it('to satisfy', {
      open: 0
    })
  })
})

