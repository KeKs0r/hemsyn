module.exports = function attachEventStore(h) {
  h.use(require('./handlers'))
}