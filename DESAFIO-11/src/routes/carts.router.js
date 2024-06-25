
const express = require("express");
const router = express.Router();
const CartManager = require("../dao/controllers/CartManager.js");
const TicketManager = require("../dao/controllers/TicketManager.js");

const cartManager = new CartManager();
const ticketManager = new TicketManager();

// Ruta para crear un nuevo carrito
router.post("/", (req, res) => cartManager.handleNewCarts(req, res));

// Ruta para obtener un carrito por ID
router.get("/:cid", (req, res) => cartManager.handleGetCartById(req, res));

// Ruta para agregar un producto a un carrito
router.post("/:cid/product/:pid", (req, res) => cartManager.handleAddProductToCart(req, res));

// Ruta para eliminar un producto de un carrito
router.delete("/:cid/products/:pid", (req, res) => cartManager.handleDeleteProductCart(req, res));

// Ruta para reemplazar los productos de un carrito
router.put("/:cid", (req, res) => cartManager.handleReplaceProductsCart(req, res));

// Ruta para actualizar un producto en un carrito
router.put("/:cid/products/:pid", (req, res) => cartManager.handleUpdateProductCart(req, res));

// Ruta para vaciar un carrito
router.delete("/:cid", (req, res) => cartManager.handleClearCart(req, res));

// Ruta para registrar la compra/ticket
router.get("/:cid/purchase", (req, res) => ticketManager.handlePurchase(req, res));


module.exports = router;
