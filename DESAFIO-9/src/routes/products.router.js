const express = require("express");
const router = express.Router();

const ProductManager = require("../controllers/ProductManager.js");

const productManager = new ProductManager("./src/models/products.json");

router.get("/products", async (req, res) => {
    const limit = parseInt(req.query.limit);
    
    try { 
        let products = await productManager.getProducts();
        if (Number.isInteger(limit) && limit > 0) {
            products = products.slice(0, limit);
        }
        const payload = products;
        res.render("home", {payload})

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
});


router.get("/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    console.log("product_id: " + pid);
    try { 
        const product = await productManager.getProductById(pid)
        console.log("product:");
        console.log(product);
        if (product) {
            res.send({product});
        } else {
            res.send("Producto no encontrado");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
});


router.post("/products", async (req, res) => {
    const newProduct = req.body;
    try {
        const product = await productManager.addProduct(newProduct)
        if (product) {
            res.status(201).json({message: "El producto fue agregado correctamente!"})
        } else {
            res.send("Producto no creado");
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
});


router.put("/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    const prodActualized = req.body;

    try {
        const product = await productManager.updateProduct(pid, prodActualized);
        
        if (product) {
            res.json({message: "El producto fue modificado correctamente!"});
        } else {
            res.send("Producto no encontrado");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"});
    }
});


router.delete("/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    try {
        const product = await productManager.deleteProduct(pid);
        if (product) {
            res.json({message: "El producto fue eliminado correctamente!"});
        } else {
            res.send("Producto no encontrado");
        } 
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
});

module.exports = router;