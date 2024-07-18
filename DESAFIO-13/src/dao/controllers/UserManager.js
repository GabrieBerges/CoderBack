
const bcrypt = require('bcrypt');
const passport = require("passport");
const configObject = require("../../config/config.js");
const { logger } = require('../../utils/config_logger.js');
const { generarResetToken } = require('../../utils/tokenreset.js');
const { createHash, isValidPassword } = require("../../utils/hashbcrypt.js");

const { UserService } = require("../../services/index.js");

const EmailManager = require("../../services/email.js");
const UserModel = require('../models/user.model.js');
const emailManager = new EmailManager();

class UserManager {
    async registerUser(userData) {
        try {
            const { email, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);

            return await UserService.createUser({ email, password: hashedPassword });
        } catch (error) {
            throw new Error('Error registering user');
        }
    }

    async getUserByUsername(email) {
        try {
            return await UserService.getUserByEmail({ email });
        } catch (error) {
            logger.info('Error obteniendo el usuario');
        }
    }

    async authenticateUser(email, password) {
        try {
            if (email === configObject.admin_user && password === configObject.admin_password) {
                return { email: configObject.admin_user, role: 'admin' };
            }
            const user = await this.getUserByUsername(email);

            if (!user) {
                return null;
            }

            const isPasswordMatch = await user.comparePassword(password);

            if (!isPasswordMatch) {
                return null;
            }

            return { email: user.email, role: user.role };
        } catch (error) {
            logger.error(`Error autenticando al usuario: ${error.message}\n${error.stack}`);
            return null;
        }
    }

    register(req, res, next) {
        passport.authenticate('register', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.session.error = info.message;  // Almacena el mensaje de error en la sesión
                return res.redirect('/register');  // Redirige a la página de registro
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                // return res.redirect('/?success=true&process=registrado');// Redirige a la página de éxito
                return res.redirect('/?success=true');
            });
        })(req, res, next);
    }

    async login(req, res) {
        logger.info("en user/login");
        logger.info(`req.user: ${JSON.stringify(req.user, null, 2)}`)
        if (!req.user) {
            return res.status(400).send("Credenciales invalidas");
        }
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
            cart: req.user.cart
        };

        req.session.login = true;

        logger.info(`req.session.user: ${JSON.stringify(req.session.user, null, 2)}`)
        logger.info(`req.session.login: ${JSON.stringify(req.session.login, null, 2)}`)

        res.redirect("/products");
        // res.redirect("/api/sessions/current");
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                logger.error(`Error destroying session: ${err.message}\n${err.stack}`);
                res.status(500).send('Error destroying session');
            } else {
                res.redirect('/');
            }
        });
    }

    githubCallback(req, res) {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/products");
    }

    async requestPasswordReset(req, res) {
        const { email } = req.body;
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }
            const token = generarResetToken();
            user.resetToken = {
                token: token,
                expire: new Date(Date.now() + 3600000) //3600000 = En una hora expira
            }
            await user.save();
            await emailManager.enviarCorreoRestablecimiento(email, user.first_name, token);
            res.redirect("/password");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }
    async resetPassword(req, res) {
        const { email, password, token } = req.body;
        try {
            const user = await UserModel.findOne({email});
            if (!user) {
                return res.render("newpassword", {error: "Usuario no encontrado"});
                }
            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token !== token) {
                return res.render("resetpass", {error: "El token es invalido"});
                } 
            const ahora = new Date();
            if (ahora > resetToken.expire) {
                return res.render("resetpass", {error: "El token expiro"});
            }
            if (isValidPassword(password, user)) {
                return res.render("newpassword", {error: "La nueva contraseña no puede ser igual a la anterior"});
            }
            user.password = createHash(password);
            user.resetToken = undefined;

            await user.save();
            return res.redirect('/?success=true');
            // return res.redirect('/?success=true&process=restablecido');
        } catch (error) {
            res.status(500).render("resetpass", {error: "Error interno del servidor"});
        }
    }
    async changeRole(req, res) {
        const uid = req.params.uid;
        logger.info(`uid: ${uid}`)

        if (!uid) {
            return res.status(400).send("Id de usuario inválido");
        }

        try {
            const user = await UserService.getUserById(uid)
            console.log(user)
            if (!user) {
                return res.status(400).send("Usuario no encontrado");
            }
            const newRole = user.role === "premium" ? "usuario" : "premium";
            const actualized = await UserService.updateUser(uid, {role: newRole});
            console.log(actualized)
            logger.info(`El usuario ahora tiene el rol de ${newRole}`);
            res.json(actualized)
        } catch (error) {
            logger.error(`Error autenticando alcambiando el rol del usuario: ${error.message}\n${error.stack}`);
            return null;
        }
    }
}

module.exports = UserManager;