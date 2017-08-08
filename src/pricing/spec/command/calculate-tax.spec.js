const expect = require('unexpected')
const { handler: calculate } = require('../../command/calculate-tax')

it('Calculates the total', (done) => {
  const net = 100;
  calculate({ net }, (err, res) => {
    expect(err, 'not to be ok')
    const { total } = res;
    expect(total, 'to be', 123)
    done()
  })
})