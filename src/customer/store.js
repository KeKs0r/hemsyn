const store = {};

function add(customer) {
  store[customer.id] = customer;
}

function get(customerId) {
  return store[customerId]
}

module.exports = {
  add,
  get
}