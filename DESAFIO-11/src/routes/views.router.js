const express = require("express");
const router = express.Router();
require("../database.js");

const ProductManager = require("../dao/controllers/ProductManager.js");
const ProductModel = require("../dao/models/product.model.js");
const cartModel = require("../dao/models/cart.model.js");
const productManager = new ProductManager("./src/dao/models/products.json");
const { mockingProducts } = require("../utils/util.js");

// Middleware para controlar acceso a rutas 
const { checkSessionAdmin, checkSessionUser } = require("../middleware/current-session.js");


// Ruta inicial, redirige a la ruta /products de este mismo archivo
router.get('/', async (req, res) => {
    try {
        console.log("/");
        if (req.session.user) {
            return res.redirect('/products');
        }
        const { success, error } = req.query;
        res.render('login', { success, error });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" })
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
        res.status(500).json({ error: "Error interno del servidor" })
    }
});

// Ruta para actividad de socket.io
router.get("/realtimeproducts", checkSessionAdmin, async (req, res) => {
    try {
        res.render("realTimeProducts", {
            name: req.session.user.first_name + " " + req.session.user.last_name,
            email: req.session.user.email,
            role: req.session.user.role,
            cart: req.session.user.cart
        });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" })
    }
})

// Ruta para el chat
router.get("/chat", checkSessionUser, (req, res) => {
    res.render("chat");
})


// Ruta para el paginado de productos (vista después del login)
router.get('/products', checkSessionUser, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    try {
        const { products, pagination, user } = await productManager.getPaginatedProducts(page, limit, req.session.user);
        console.log("user: ", req.session.user);
        console.log("padnkjfbfha");
        console.log(products);
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
            name: user.name,
            email: user.email,
            role: user.role,
            cart: req.session.user.cart
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Ruta para ver los productos mockeados
router.get("/mockingproducts", (req, res) => {
    try {
        console.log("en mockingProducts");
        const products = [];
        for (let i = 0; i < 100; i++) {
            products.push(mockingProducts());
        }
        res.send(products);
    } catch (error) {
        console.log("error: ", error);
    }

})


module.exports = router;