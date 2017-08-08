const store = {};

function add(product) {
  store[product.id] = product;
}

function get(productId) {
  return store[productId]
}

module.exports = {
  add,
  get
}