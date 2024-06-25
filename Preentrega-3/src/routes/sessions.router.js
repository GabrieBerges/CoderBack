const express = require("express");
const router = express.Router(); 
const passport = require("passport");
const UserDTO = require("../dto/user.dto.js"); 


//Perfil: 
router.get("/current", (req, res) => {
    try {
        console.log("en api/sessions/current");
        if (req.session.user) {
            const usuario = req.session.user;
            console.log(usuario);
            const userDto = new UserDTO(usuario); 
            console.log("userDTO: ", userDto);
            return res.json(userDto);
        } else {
            return res.status(401).json({usuario: "Debe acceder a una cuenta primero"}); 
        }
    } catch (error) {
        return res.status(500).json({error: "Error interno del servidor"});
    }
})

module.exports = router; 

