const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const CartManager = require("../controllers/CartManager.js");
const cartModel = require("../models/cart.model.js");

const cartManager = new CartManager("./src/models/carts.json");


router.post("/carts", async (req, res) => {
    try {
        const newCart = await cartManager.newCarts();
        res.status(201).json(newCart);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
});

router.get("/carts/:cid", async (req, res) => {
    const cId = req.params.cid;

    try {
        let cart = await cartModel.findById(cId).populate("products.product");
        console.log(cart);
        // res.render("cart", {cart});
        res.status(201).json(cart);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
});

router.post("/carts/:cid/product/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = parseInt(req.body.quantity) || 1;  
    try {
        
       const cartActualized = await cartManager.addProductToCart(cid, pid, quantity);
       res.status(201).json(cartActualized.products);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
})

router.delete("/carts/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;

    try {
       const cartActualized = await cartManager.deleteProductCart(cid, pid);
       res.status(201).json(cartActualized.products);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
})

router.put("/carts/:cid", async (req, res) => {
    const cid = req.params.cid;
    const body = req.body;
    console.log(body);
    try {
       const cartActualized = await cartManager.replaceProductsCart(cid, body);
       res.status(201).json(cartActualized.products);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
})

router.put("/carts/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    console.log(quantity);
    try {
       const cartActualized = await cartManager.updateProductCart(cid, pid, quantity);
       res.status(201).json(cartActualized.products);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
})

router.delete("/carts/:cid", async (req, res) => {
    const cid = req.params.cid;

    try {
       const cartActualized = await cartManager.clearCart(cid);
       res.status(201).json(cartActualized.products);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
})

module.exports = router;