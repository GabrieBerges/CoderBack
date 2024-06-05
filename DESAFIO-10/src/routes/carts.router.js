
const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/CartManager.js");

const cartManager = new CartManager();

// Ruta para crear un nuevo carrito
router.post("/carts", (req, res) => cartManager.handleNewCarts(req, res));

// Ruta para obtener un carrito por ID
router.get("/carts/:cid", (req, res) => cartManager.handleGetCartById(req, res));

// Ruta para agregar un producto a un carrito
router.post("/carts/:cid/product/:pid", (req, res) => cartManager.handleAddProductToCart(req, res));

// Ruta para eliminar un producto de un carrito
router.delete("/carts/:cid/products/:pid", (req, res) => cartManager.handleDeleteProductCart(req, res));

// Ruta para reemplazar los productos de un carrito
router.put("/carts/:cid", (req, res) => cartManager.handleReplaceProductsCart(req, res));

// Ruta para actualizar un producto en un carrito
router.put("/carts/:cid/products/:pid", (req, res) => cartManager.handleUpdateProductCart(req, res));

// Ruta para vaciar un carrito
router.delete("/carts/:cid", (req, res) => cartManager.handleClearCart(req, res));

module.exports = router;
