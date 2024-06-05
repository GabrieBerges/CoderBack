const express = require("express");
const router = express.Router();
require("../database.js");

const ProductManager = require("../controllers/ProductManager.js");
const ProductModel = require("../models/product.model.js");
const cartModel = require("../models/cart.model.js");
const productManager = new ProductManager ("./src/models/products.json");

// Middleware para chequear la session
const checkSession = (req, res, next) => {
    console.log("en checksession");
    console.log(req.session.user);
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// Ruta inicial, redirige a la ruta /products de este mismo archivo
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

// Ruta para el registro
router.get('/register', (req, res) => {
    try {
        console.log("/register");
        const error = req.session.error;
        delete req.session.error;  // Eliminar mensaje de error de la sesión
        console.log("error", error);
        res.render('register', { error });  // Pasar mensaje de error a la vista
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
});

// Ruta para actividad de socket.io
router.get("/realtimeproducts", async (req, res) => {
    try {
        res.render("realTimeProducts");
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
})

// Ruta para el chat
router.get("/chat", (req, res) => {
    res.render("chat");
})


// Ruta para el paginado de productos (vista después del login)
router.get('/products', checkSession, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    try {
        const { products, pagination, user } = await productManager.getPaginatedProducts(page, limit, req.session.user);

        res.render("products", {
            status: 200,
            payload: products,
            totalPages: pagination.totalPages,
            prevPage: pagination.prevPage,
            nextPage: pagination.nextPage,
            page: pagination.page,
            hasPrevPage: pagination.hasPrevPage,
            hasNextPage: pagination.hasNextPage,
            prevLink: pagination.prevLink,
            nextLink: pagination.nextLink,
            limit: pagination.limit,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


module.exports = router;
