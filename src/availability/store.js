const store = {};

function set(product, amount) {
  store[product] = amount;
}

function get(productId) {
  return store[productId]
}

module.exports = {
  get,
  set
}