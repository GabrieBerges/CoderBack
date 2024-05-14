const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const UserManager = require("../controllers/UserManager.js");
// const cartModel = require("../models/cart.model.js");

const userManager = new UserManager();

// router.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//         res.redirect('/register?error=El usuario y la contraseña no deben estar vacios');
//     }
//     const existingUser = await userManager.getUserByUsername(username);
//     if (existingUser) {
//         res.redirect('/register?error=El nombre de usuario ya existe');
//     }
//     try {
//         const newUser = await userManager.registerUser({ username, password });
//         res.redirect('/?success=true');
//     } catch (error) {
//         res.redirect('/register?error=Error creando el usuario');
//     }
// });
// Ruta para registro
router.post('/register', passport.authenticate('register', {
    successRedirect: '/?success=true',
    failureRedirect: '/register?error=El usuario ya existe',
    failureFlash: true
}));


// router.post('/login', async (req, res) => {
//     console.log("dentro del login");
//     const { username, password } = req.body;
//     const isValidUser = await userManager.authenticateUser(username, password);

//     if (isValidUser) {
//         req.session.username = isValidUser.username;
//         req.session.role = isValidUser.role
//         res.redirect('/products');
//     } else {
//         res.redirect('/?error=Usuario o contraseña invalido');
//     }
// });

// Ruta para login
// router.post('/login', passport.authenticate('login', {
//     // successRedirect: '/products',
//     failureRedirect: '/?error=Usuario o contraseña invalido'
// }), async (req, res) => {
//     if (!req.user) {
//         return res.status(400).send("Credenciales invalidas");
//     }
    
//     req.session.user = {
//         first_name: req.user.username,
//         last_name: req.user.role,
//         // age: req.user.age,
//         // email: req.user.email
//     };
    
//     req.session.login = true;
    
//     res.redirect("/products");
// })


router.post("/login", passport.authenticate("login", {
    failureRedirect: "/?error=Usuario o contraseña invalido"
}), async (req, res) => {
    console.log("en user/login");
    if (!req.user) {
        return res.status(400).send("Credenciales invalidas");
    }
    console.log(req.user);
    req.session.user = {
        username: req.user.username,
        password: req.user.password,
        role: req.user.role
    };
    
    req.session.login = true;
    
    console.log(req.session.user);
    console.log(req.session.login);
    res.redirect("/products");
    
})

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

//VERSION PARA PASSPORT: 

router.get("/faillogin", async (req, res) => {
    res.send("Rompimos algo");
})

//VERSION PARA GITHUB: 

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