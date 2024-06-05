const UserRepository = require("../repositories/user.repository.js");
const CartRepository = require("../repositories/cart.repository.js");
const ProductRepository = require("../repositories/product.repository.js");

const UserService = new UserRepository();
const CartService = new CartRepository();
const ProductService = new ProductRepository();

module.exports = { UserService, CartService, ProductService };
