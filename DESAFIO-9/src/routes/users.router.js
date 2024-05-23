const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const UserManager = require("../controllers/UserManager.js");
// const cartModel = require("../models/cart.model.js");

const userManager = new UserManager();


// Ruta para registro

router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.session.error = info.message;  // Almacenar mensaje de error en la sesión
            return res.redirect('/register');  // Redirigir a la página de registro
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/?success=true');  // Redirigir a la página de éxito
        });
    })(req, res, next);
});


// Ruta para login
router.post("/login", passport.authenticate("login", {
    failureRedirect: "/?error=Usuario o contraseña invalido"
}), async (req, res) => {
    console.log("en user/login");
    console.log(req.user);
    if (!req.user) {
        return res.status(400).send("Credenciales invalidas");
    }
    console.log(req.user);
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        password: req.user.password,
        role: req.user.role, 
        cart: req.user.cart
    };
    
    req.session.login = true;
    
    console.log(req.session.user);
    console.log(req.session.login);
    res.redirect("/products");
    
})

// Ruta para logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
        } else {
            res.redirect('/'); // Redirect to the home page or login page after logout
        }
    });
});


router.get("/faillogin", async (req, res) => {
    res.send("Rompimos algo");
})


router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { 
    console.log("en la ruta de git");
})

router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), async (req, res) => {
    req.session.user = req.user; 
    req.session.login = true; 
    res.redirect("/products");
})


module.exports = router;
