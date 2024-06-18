
const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/ProductManager.js");

const productManager = new ProductManager("./src/models/products.json");

// Ruta para obtener productos
router.get("/", (req, res) => productManager.handleGetProducts(req, res));

// Ruta para obtener un producto por ID
router.get("/:pid", (req, res) => productManager.handleGetProductById(req, res));

// Ruta para agregar un producto
router.post("/", (req, res) => productManager.handleAddProduct(req, res));

// Ruta para actualizar un producto
router.put("/:pid", (req, res) => productManager.handleUpdateProduct(req, res));

// Ruta para eliminar un producto
router.delete("/:pid", (req, res) => productManager.handleDeleteProduct(req, res));

module.exports = router;