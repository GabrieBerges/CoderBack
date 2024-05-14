//Instalamos: npm i passport passport-local

//1)Importamos los módulos: 
const passport = require("passport");
const local = require("passport-local"); //etsrategia elegida

// //Estrategia con GitHub:
const GitHubStrategy = require("passport-github2");

//1)Traemos el UsuarioModel y las funciones de bcryp: 
const UsuarioModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashbcrypt.js");

//1)
const LocalStrategy = local.Strategy;

const initializePassport = () => {
//     //Vamos a armar nuestras estrategias: Registro y Login. 

     passport.use("register", new LocalStrategy({
        //Le digo que quiero acceder al objeto request
        passReqToCallback: true,
        usernameField: "username"
    }, async (req, username, password, done) => {
        // const { username, password, role } = req.body;

        try {
            //Verificamos si ya existe un registro con ese username: 
            let user = await UsuarioModel.findOne({ username });

            if (user) {
                return done(null, false, { message: "El usuario ya existe" });
            }

            //Si no existe voy a crear un registro de usuario nuevo: 

            let newUser = {
                username,
                password: createHash(password)
            }

            let result = await UsuarioModel.create(newUser);
            return done(null, result);
            //Si todo resulta bien, podemos mandar done con el usuario generado. 
        } catch (error) {
            return done(error);
        }
    }))

    //Agregamos otra estrategia para el "Login".
    passport.use("login", new LocalStrategy({
        usernameField: "username"
    }, async (username, password, done) => {
        console.log("username: " + username);
        console.log("password: " + password);
        try {
            //Primero verifico si existe un usuario con ese email: 
            let user = await UsuarioModel.findOne({ username });
            console.log(user);
            if (!user) {
                console.log("Este usuario no existe");
                return done(null, false, { message: "Usuario no encontrado" });
            }

            //Si existe verifico la contraseña: 
            if (!isValidPassword(password, user)) {
                return done(null, false, { message: "Contraseña incorrecta" });
            }
            console.log("antes del done");
            return done(null, user);


        } catch (error) {
            console.log(error);
            return done(error);
        }
    }))

    //Serializar y deserializar: 

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await UsuarioModel.findById({ _id: id });
        done(null, user);
    })

    //2) primero se configura la aplicación en git y se instala npm i passport-github2
    // Acá generamos la nueva estrategia con GitHub: 

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23lipq04I5sWMzbP2m",
        clientSecret: "8022e2ac10921d68752566b9b71f8c295d8f79af",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        //Veo los datos del perfil
        console.log("Profile:", profile);

        try {
            let user = await UsuarioModel.findOne({ username: profile._json.username });

            if (!user) {
                let newUser = {
                    username: profile._json.username,
                    password: "",
                    role: "usuario"
                }

                let result = await UsuarioModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))
}

module.exports = initializePassport;