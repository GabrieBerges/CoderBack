const express = require("express");
const router = express.Router();
require("../database.js");

const ProductManager = require("../controllers/ProductManager.js");
const ProductModel = require("../models/product.model.js");
const cartModel = require("../models/cart.model.js");
const productManager = new ProductManager ("./src/models/products.json");

const checkSession = (req, res, next) => {
    console.log("en checksession");
    console.log(req.session.user);
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

router.get('/', async (req, res) => {
    try {
        console.log("/");
        if (req.session.user)
        {
            return res.redirect('/products');
        }
        const { success, error } = req.query;
        res.render('login', { success, error });
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
});

router.get('/register', (req, res) => {
    try {
        console.log("/register");
        // const { error } = req.query;
        // res.render('register', { error });
        const error = req.session.error;
        delete req.session.error;  // Eliminar mensaje de error de la sesión
        console.log("error", error);
        res.render('register', { error });  // Pasar mensaje de error a la vista
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
});


router.get("/realtimeproducts", async (req, res) => {
    try {
        res.render("realTimeProducts");
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
})


router.get("/chat", (req, res) => {
    res.render("chat");
})


router.get("/products", checkSession, async (req, res) => {
    console.log("en /products");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const { email, role } = req.session.user;
    console.log(req.session.user);

    try {
        const products = await ProductModel.paginate({}, {page, limit});
        
        const productsResultadoFinal = products.docs.map(product => {
            const {_id, ...rest} = product.toObject();
            return rest;
        })
        // console.log(products);

        res.render("products", {
            status: 200,
            payload: productsResultadoFinal,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.prevLink,
            nextLink: products.nextLink, 
            limit : limit,
            email: email || 'mailpordefecto@algo.com',
            role: role || 'usuario'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error interno del servidor"})
    }
})


router.get("/carts/:cid", async (req, res) => {
    const cId = req.params.cid;

    try {
        let cart = await cartModel.findById(cId).populate("products.product");
        // console.log(cart);

        const products = cart.products.map(item => ({
            product: item.product.toObject(),
            quantity: item.quantity
        }))
        console.log("products");
        console.log(products);

        res.render("cart", {products});
        // res.status(201).json(cart);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error interno del servidor"})
    }
})


module.exports = router;
