const Hemera = require('nats-hemera')

const Nats = require('hemera-testsuite/natsStub')
const AddStub = require('hemera-testsuite/addStub')
const nats = new Nats()
const h = new Hemera(nats, { logLevel: 'fatal' })
h.use(require('../handlers'))

// const ready = Promise.promisify(h.ready, { context: h })
// const run = Promise.promisify(AddStub.run)

test.skip('Requires a valid Event', done => {
  expect.assertions(5)
  h.ready(() => {
    AddStub.run(
      h,
      {
        topic: 'events',
        cmd: 'add'
      },
      { events: 1 },
      (err, res) => {
        expect(err).toBeTruthy()
        done()
      }
    )
  })
})

test.skip('Requires a valid Event', () => {
  expect.assertions(5)
  return ready()
    .then(() => {
      return run(
        h,
        {
          topic: 'events',
          cmd: 'add'
        },
        { events: 1 }
      )
    })
    .catch(err => {
      expect(err).toBeTruthy()
      const array = err.details[0].message
      expect(array).toContain('events')
      expect(array).toContain('array')
      const obj = err.details[1].message
      expect(obj).toContain('events')
      expect(obj).toContain('object')
    })
    .finally(() => {
      h.close()
    })
})
