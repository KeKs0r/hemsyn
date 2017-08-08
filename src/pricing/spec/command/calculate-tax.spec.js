const expect = require('unexpected')
const { handler: calculate } = require('../../command/calculate-tax')

it('Calculates the total (default: Sweden)', (done) => {
  const net = 100;
  calculate({ net }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 123)
    done()
  })
})

it('Standard Rate in Sweden', (done) => {
  const net = 100;
  calculate({ country: 'SE', net }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 123)
    done()
  })
})


it('Standard rate in Ireland on E99:', (done) => {
  calculate({ country: 'IE', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 125)
    done()
  })
})


it('Food rate in Ireland on E99:', (done) => {
  calculate({ country: 'IE', type: 'food', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 104.8)
    done()
  })
})


it('Reduced rate in Ireland', (done) => {
  calculate({ country: 'IE', type: 'reduced', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 113.5)
    done()
  })
})

it('Default Rate in Germany', (done) => {
  calculate({ country: 'DE', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 119)
    done()
  })
})

it('Standard rate in Alabama', (done) => {
  calculate({ country: 'US', state: 'AL', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 104)
    done()
  })
})

it('Standard rate in Montgomery, Alabama', (done) => {
  calculate({ country: 'US', state: 'AL', city: 'Montgomery', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 110)
    done()
  })
})

it('Reduced rate in New York for clothes', (done) => {
  calculate({ country: 'US', state: 'NY', type: 'reduced', net: 100 }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 100)
    done()
  })
})
