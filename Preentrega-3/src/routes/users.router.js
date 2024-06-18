const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const UserManager = require("../controllers/UserManager.js");

const userManager = new UserManager();


// Ruta para registro
router.post('/register', (req, res, next) => {
    userManager.register(req, res, next);
});

// Ruta para login
router.post("/login", passport.authenticate("login", {
    failureRedirect: "/?error=Usuario o contraseña invalido"
}), (req, res) => {
    userManager.login(req, res);
});

// Ruta para logout
router.post('/logout', (req, res) => {
    userManager.logout(req, res);
});

// Ruta para GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => {
    console.log("en la ruta de git");
});

// Ruta para el callback de GitHub
router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), (req, res) => {
    userManager.githubCallback(req, res);
});

// Ruta para fallo en el login
router.get("/faillogin", async (req, res) => {
    res.send("Rompimos algo");
});


module.exports = router;
