const express = require("express");
const router = express.Router(); 
const passport = require("passport");

//Perfil: 
router.get("/current", (req, res) => {
    try {
        console.log(req.session.user);
        if (req.session.user)
        {
            const usuario = req.session.user;
            console.log(usuario);
            return res.send({usuario});
        }
        else {
            return res.send({usuario: "Debe acceder a una cuenta primero"});
        }
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"})
    }
})

module.exports = router; 